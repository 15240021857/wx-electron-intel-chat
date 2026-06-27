<template>
  <div class="w-full relative">
    <h2
      class="w-full bg-gray-100 dark:bg-gray-700 h-[52px] flex items-center px-3 border-b border-b-gray-300 dark:border-b-gray-500"
    >
      <span class="font-semibold dark:text-white">{{ selectedModel?.value ? `${selectedModel?.label}` : '' }}</span>
      <span class="mx-1 dark:text-gray-200">——</span>
      <span class="font-semibold dark:text-white">{{ chatStore.curChat?.title.slice(0, 20) }}</span>
    </h2>
    <div class="flex flex-col h-[calc(100%-52px)] py-[16px]">
      <!-- 聊天内容区 -->
      <div class="flex-1 overflow-auto">
        <ChartMessage
          v-if="msgList?.length > 0"
          ref="ChartMessageRef"
          class="h-full max-w-3xl mx-auto overflow-visible"
          :msg-list="msgList"
          :request-loading="sendLoading"
          :out-loading="outLoading"
        />
      </div>

      <!-- 大模型下拉选择框 -->
      <div
        v-show="!(msgList?.length > 0)"
        class="w-full h-full flex flex-row items-center justify-center max-w-3xl mx-auto"
      >
        <GroupSelect ref="GroupSelectRef" @on-select="onModelSelect" />
      </div>
      <!-- 聊天输入框 -->
      <div class="w-full px-5 box-size max-w-3xl mx-auto relative">
        <SearchInput :out-loading="outLoading" @send-msg="onSendmsg" @stop-cur-msg="stopCurMsg" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import SearchInput from './components/SearchInput.vue'
import GroupSelect from './components/GroupSelect.vue'
import ChartMessage from './components/ChartMessage.vue'
import { callModelHttpAPI } from '@/api/chat'
import { MsgItem, ProviderParam, SendMsgParams } from '@/types/chat'
import { Model } from '@/types/db'
import { useChatStore } from '@/store/useChatStore'
import { useMsgStore } from '@/store/useMsgStore'
import { useMessage } from '@/db/hooks/useMessage'
import { useChat } from '@/db/hooks/useChat'
import { useModel } from '@/db/hooks/useModel'

const { getMessagesByChatId, addUserMessage, addAssistantMessage, updateMessage } = useMessage()
const { updateChat } = useChat()

const chatStore = useChatStore()
const msgStore = useMsgStore()

const { getModelById } = useModel()

const { electronIpcApi } = window

const msgList = ref<MsgItem[]>([])
// 厂商模型选中
const selectedModel = ref<Model>()
const selectedProvider = ref<ProviderParam>()
const onModelSelect = (model: { selectedModel: Model; selectedProvider: ProviderParam }) => {
  selectedModel.value = model?.selectedModel
  selectedProvider.value = model?.selectedProvider
}
const clearSelectedModel = () => {
  selectedModel.value = undefined
  selectedProvider.value = undefined
}
const GroupSelectRef = useTemplateRef('GroupSelectRef')
watch(
  () => chatStore.curChat?.id,
  async (newChatId) => {
    console.log('切换聊天了', newChatId, chatStore.curChat)
    if (newChatId) {
      // 拿到该chat的msgList
      const curChatMsgList = await getMessagesByChatId(newChatId)
      msgList.value = curChatMsgList.map((item) => {
        return {
          ...item,
          reasoning_content: '',
          showReasoning: true,
        }
      })
      console.log(`%c ====${chatStore.curChat?.modelId}`, 'color: skyblue')
      // 再拿到模型信息和供应商信息
      if (chatStore.curChat?.modelId) {
        const curModel = await getModelById(chatStore.curChat?.modelId as string)
        // 直接调下拉组件的方法获取当前模型和厂商
        GroupSelectRef.value?.setModelAndProviderByModel(curModel?.id || '')
      } else {
        clearSelectedModel()
      }
    } else {
      msgList.value = []
      clearSelectedModel()
    }
  },
  {
    immediate: true,
  }
)
// 当前助理流式输出消息
let curAssistantMsg: MsgItem | null = null
// 流式输出完成后,更新数据到DB
const updateAssistantMsgItemWhenDone = async (message: Partial<MsgItem>) => {
  updateMessage({
    id: message.id || '',
    content: message?.content ?? '',
    showReasoning: message?.showReasoning,
    reasoning_content: message?.reasoning_content ?? '',
  })
}
let cleanIpcListener: any = null
// 聊天请求中断控制器
let abortController: AbortController | null = null
const stopCurMsg = () => {
  try {
    abortController?.abort()
    abortController = null
    electronIpcApi.abortStream()
    sendLoading.value = false
    outLoading.value = false
  } catch (error) {
    console.log('✔ 主动取消请求成功')
  }
}
// 请求加载中
const sendLoading = ref(false)
// 流式输出中
const outLoading = ref(false)

const onSendmsg = async (sendParam: SendMsgParams) => {
  const { msg, image_url, video_url } = sendParam
  console.log('image_url==========', image_url)
  if (!selectedModel.value?.value) {
    alert('请选择模型')
    return
  }

  curAssistantMsg = null
  if (!msg && image_url?.length === 0 && video_url?.length === 0) return
  // 处理请求取消
  stopCurMsg()
  abortController = new AbortController()
  // 添加msg
  await addUserMsgItem(sendParam)
  // 添加标题
  handleChatTitle(msg)
  outLoading.value = true
  const { value: modelVal, apiType } = selectedModel.value
  const { apiKey, baseURL } = selectedProvider.value as ProviderParam
  if (!selectedProvider.value) {
    return
  }
  console.log('msgList.value==', msgList.value)
  if (apiType === 'http') {
    // http请求方式
    handleHttpStream(msgList.value, modelVal, selectedProvider.value)
  } else if (apiType === 'openAI') {
    // openAI请求方式
    handleOpenAIStream(msgList.value, modelVal, { apiKey, baseURL })
  } else {
    // 这里可以调用electron原生的toast
    alert('暂不支持的请求方式：' + apiType)
  }
}
// 智谱清言提供商
const handleHttpStream = async (messages: MsgItem[], model = 'glm-4.7-flash', provider: ProviderParam) => {
  // 请求加载中
  sendLoading.value = true
  // 先添加助理消息
  curAssistantMsg = await addAssistantMsgItem()
  // 发起请求智能体
  let res = null
  try {
    if (model.startsWith('glm-')) {
      res = await callModelHttpAPI({
        messages: messages.map((item) => {
          return {
            role: item.role,
            content: item.content,
          }
        }),
        stream: true,
        signal: abortController?.signal,
        provider,
        model,
      })
      sendLoading.value = false
      // 处理流式数据
      readHttpStream(res)
    } else {
      alert('暂不支持' + model)
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.log('✅ 请求已主动取消')
    } else {
      console.error('❌ 请求失败', err)
      throw err
    }
  }
}
const handleMessagesParams = (messages: MsgItem[]) => {
  return messages.map((item) => {
    let curItem: any
    let curContent: any
    if (item.image_url?.length) {
      const image_url_list = item.image_url.map((item) => {
        return {
          type: 'image_url',
          image_url: item,
        }
      })
      curContent = image_url_list
      item.content &&
        curContent.push({
          type: 'text',
          text: item.content,
        })
      curItem = {
        role: item.role,
        content: curContent,
      }
    } else if (item.video_url?.length) {
      const video_url_list = item.video_url.map((item) => {
        return {
          type: 'video_url',
          video_url: item,
        }
      })
      curContent = video_url_list
      item.content &&
        curContent.push({
          type: 'text',
          text: item.content,
        })
      curItem = {
        role: item.role,
        content: curContent,
      }
    } else {
      curItem = {
        role: item.role,
        content: item.content,
      }
    }
    return curItem
  })
}
// 处理阿里千问请求
const handleOpenAIStream = async (
  messages: MsgItem[],
  model = 'qwen-plus',
  provider: Pick<ProviderParam, 'apiKey' | 'baseURL'>
) => {
  // const sendJson = messages.map((item) => {
  //   return {
  //     role: item.role,
  //     content: item.content,
  //   }
  // })
  const sendJson = handleMessagesParams(messages)
  console.log('sendJson=======================', sendJson)
  try {
    // 添加监听
    curAssistantMsg = await addAssistantMsgItem()
    // 有监听先移除监听
    if (cleanIpcListener) {
      cleanIpcListener()
    }
    sendLoading.value = true
    console.log('==', { messages: sendJson, model, provider })

    // 发送请求
    await electronIpcApi.askModel({ messages: sendJson, model, provider })
  } catch (error) {
    console.error(error)
  } finally {
    // 有监听先移除监听
    if (cleanIpcListener) {
      cleanIpcListener()
    }
  }
}
// 添加对话标题
const handleChatTitle = async (msg: string) => {
  if (!chatStore?.curChat?.title || chatStore?.curChat?.title === '新对话') {
    await updateChat({
      id: chatStore.curChat?.id || '',
      title: msg,
    })
    chatStore.refreshChatList()
    chatStore.curChat && (chatStore.curChat.title = msg)
  }
}
// 添加用户消息
const addUserMsgItem = async (msgParams: SendMsgParams) => {
  const curMsg: MsgItem = await addUserMessage(chatStore.curChat?.id || '', msgParams)
  msgList.value = [...msgList.value, curMsg]
  msgStore.addMsg(curMsg)
  return curMsg
}
// 添加智能助手初始消息
const addAssistantMsgItem = async (content?: string) => {
  const curMsg: MsgItem = await addAssistantMessage(chatStore.curChat?.id || '', content ?? '')
  msgList.value.push(curMsg)
  // 维护所有msg
  msgStore.addMsg(curMsg)
  return curMsg
}
// // 文字一次性输出版
// const readJsonFun = (res: any) => {
//   const message = res?.choices?.[0]?.message || null

//   const askMsg: MsgItem = {
//     id: new Date().getTime(),
//     role: message?.role || '',
//     reasoning_content: '',
//     content: message?.content || '',
//     chatId: chatStore.curChat?.id || '',
//     showReasoning: true,
//   }
//   msgList.value.push(askMsg)
//   // 维护所有msg
//   msgStore.addMsg(askMsg)
// }
const ChartMessageRef = useTemplateRef<InstanceType<typeof ChartMessage>>('ChartMessageRef')

// 移除steam流式输出事件监听
let removeStreamDataListener: any = null
let removeStreamAbortListener: any = null
let removeStreamEndListener: any = null
let removeStreamErrorListener: any = null
const removeAllStreamListener = () => {
  removeStreamDataListener?.()
  removeStreamAbortListener?.()
  removeStreamEndListener?.()
  removeStreamErrorListener?.()
}
// 监听openAI方式的流式输出
const onStreamDataLisitener = () => {
  removeAllStreamListener()
  removeStreamDataListener = electronIpcApi.onStreamData((e: any, data: any) => {
    const curMsg = msgList.value.find((item) => item?.id === curAssistantMsg?.id)
    sendLoading.value = false
    console.log('data=', data)

    const curContent = data
    curMsg && (curMsg.content += curContent)
    ChartMessageRef.value?.scrollToBottom()
    // console.log('curAssistantMsg==', curMsg);
  })
  removeStreamAbortListener = electronIpcApi.onStreamAbort(() => {
    sendLoading.value = false
    outLoading.value = false
    updateDBSteamMsg()
  })
  removeStreamEndListener = electronIpcApi.onStreamEnd(() => {
    outLoading.value = false
    updateDBSteamMsg()
  })
  removeStreamErrorListener = electronIpcApi.onStreamError((msg) => {
    console.error('流式输出出错了：', msg)
    sendLoading.value = false
    outLoading.value = false
    updateDBSteamMsg()
  })
}
const updateDBSteamMsg = () => {
  const curMsg = msgList.value.find((item) => item?.id === curAssistantMsg?.id)
  updateAssistantMsgItemWhenDone({
    id: curMsg?.id || '',
    content: curMsg?.content || '',
    reasoning_content: curMsg?.reasoning_content || '',
  })
}
// 正在输出中...
const IS_STREAMING = true
// 读取HTTP方式的流式输出版
const readHttpStream = async (res: any) => {
  if (!res?.ok) {
    throw new Error(`API 调用失败: ${res?.status}`)
  }
  const reader: ReadableStreamDefaultReader<Uint8Array> | undefined = res?.body?.getReader()
  if (!reader) {
    return
  }
  let cacheStr = '' // 读取流式字符串
  const decoder = new TextDecoder('utf-8')
  while (IS_STREAMING) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    const chunk = decoder.decode(value, { stream: true })
    let data = ''
    let curJson = {} as any
    cacheStr += chunk
    const textLines = cacheStr.split('\n')
    // 防止最后一行不完整
    cacheStr = textLines.pop() || ''

    for (let item of textLines) {
      if (!item) continue
      if (item.startsWith('data: [DONE]')) {
        console.log('输出结束了')
        outLoading.value = false
        updateDBSteamMsg()
        return
      }
      if (item.startsWith('data:')) {
        data = item.slice(5).trim()
      }
      if (!data) {
        continue
      }
      try {
        curJson = JSON.parse(data)
      } catch (error) {
        console.error('catch到了：', error)
        continue
      }
      // const str = curJson.choices?.[0]?.delta?.reasoning_content || ''
      const reasoning_str = curJson.choices?.[0]?.delta?.reasoning_content || ''
      const str = curJson.choices?.[0]?.delta?.content || ''

      // chunkStr += str
      const curMsg = msgList.value.find((item) => item.id === curAssistantMsg?.id)
      if (curMsg) {
        curMsg.content += str
        curMsg.reasoning_content += reasoning_str
      }
      ChartMessageRef.value?.scrollToBottom()
    }
  }
}

// 卸载组件时清理
const onDestory = () => {
  // 有监听先移除监听
  if (cleanIpcListener) {
    cleanIpcListener()
  }
  removeAllStreamListener()
  stopCurMsg()
}

// 创建新对话
const createNewSession = () => {
  msgList.value = []
  chatStore.createChat()
}
onMounted(() => {
  // 开启监听读取千问数据
  onStreamDataLisitener()
})
onUnmounted(() => {
  onDestory()
})
defineExpose({
  createNewSession,
})
</script>

<style lang="scss" scoped></style>
