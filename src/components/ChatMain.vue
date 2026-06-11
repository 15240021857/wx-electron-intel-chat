<template>
  <div class="w-full p-[16px]">
    <h2>聊天功能区{{ selectedModel?.value ? `-${selectedModel?.label}` : '' }}</h2>
    <div class="h-[85%] max-w-3xl mx-auto">
      <!-- 聊天内容区 -->
      <ChartMessage v-if="msgList?.length > 0" ref="ChartMessageRef" :msg-list="msgList" :requestLoading="sendLoading"
        :outLoading="outLoading" />
      <!-- 大模型下拉选择框 -->
      <div v-show="!selectedModel?.value" class="w-full h-full flex flex-row items-center justify-center">
        <GroupSelect ref="GroupSelectRef" @on-select="onModelSelect" />
      </div>

    </div>

    <!-- 聊天输入框 -->
    <div class="w-full px-5 box-size max-w-3xl mx-auto">
      <SearchInput @send-msg="onSendmsg" :outLoading="outLoading" @stopCurMsg="stopCurMsg" />
    </div>

  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';
import SearchInput from './components/SearchInput.vue'
import GroupSelect from './components/GroupSelect.vue'
import ChartMessage from './components/ChartMessage.vue'
import { callModelHttpAPI } from '@/api/chat';
import { ModelItem, MsgItem, ProviderParam } from '@/types/chat';
import { useChatStore } from '@/store/useChatStore';
import { useMsgStore } from '@/store/useMsgStore';

const chatStore = useChatStore()
const msgStore = useMsgStore()

const { electronIpcApi } = window

const msgList = ref<MsgItem[]>([])
// 厂商模型选中
const selectedModel = ref<ModelItem>()
const selectedProvider = ref<ProviderParam>()
const onModelSelect = (model: { selectedModel: ModelItem, selectedProvider: ProviderParam }) => {
  console.log('model==', model);

  selectedModel.value = model?.selectedModel
  selectedProvider.value = model?.selectedProvider
}
const clearSelectedModel = () => {
  selectedModel.value = undefined
  selectedProvider.value = undefined
}
const GroupSelectRef = useTemplateRef('GroupSelectRef')
watch(() => chatStore.curChat?.id, async (newChatId) => {
  console.log('切换聊天了', newChatId, chatStore.curChat);
  if (newChatId) {
    msgList.value = await chatStore.getMsgListByChatId(newChatId)
    GroupSelectRef.value?.setModelAndProviderByModel(chatStore.curChat?.model || '')
  } else {
    msgList.value = []
    clearSelectedModel()
  }
}, {
  immediate: true
})
let curResMsg: MsgItem | null = null
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
    console.log('✔ 主动取消请求成功');
  }
}
// 请求加载中
const sendLoading = ref(false)
// 流式输出中
const outLoading = ref(false)

const onSendmsg = async (msg: string | undefined) => {
  if (!selectedModel.value?.value) {
    alert('请选择模型')
    return
  }

  curResMsg = null
  if (!msg) return
  // 处理请求取消
  stopCurMsg()
  abortController = new AbortController()
  // 添加msg
  addUserMsgItem(msg)
  // 添加标题
  handleChatTitle(msg)
  outLoading.value = true
  const { value: modelVal, apiType } = selectedModel.value
  const { apiKey, baseURL } = selectedProvider.value as ProviderParam
  if (!selectedProvider.value) {
    return
  }
  console.log('apiType==', apiType);

  if (apiType === 'http') {
    // http请求方式
    handleHttpStream(msgList.value, modelVal, { apiKey, baseURL })
  } else if (apiType === 'openAI') {
    // openAI请求方式
    handleOpenAIStream(msgList.value, modelVal, { apiKey, baseURL })
  } else {
    // 这里可以调用electron原生的toast
    alert('暂不支持的请求方式：' + chatStore.curChat?.apiType)
  }
}
// 智谱清言提供商
const handleHttpStream = async (messages: MsgItem[], model: string = 'glm-4.7', provider: ProviderParam) => {
  // 请求加载中
  sendLoading.value = true
  // 先添加助理消息
  curResMsg = addAssistantMsgItem()
  // 发起请求智能体
  let res = null
  try {
    if (model.startsWith('glm-')) {
      res = await callModelHttpAPI({
        messages,
        stream: true,
        signal: abortController?.signal,
        provider,
        model
      })
      sendLoading.value = false
      // 处理流式数据
      readHttpStream(res)
    } else {
      alert('暂不支持' + model)
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.log('✅ 请求已主动取消');
    } else {
      console.error('❌ 请求失败', err);
      throw err;
    }
  }
}
// 处理阿里千问请求
const handleOpenAIStream = async (messages: MsgItem[], model: string = 'qwen-plus', provider: ProviderParam) => {
  const sendJson = messages.map(item => {
    return {
      role: item.role,
      content: item.content
    }
  })
  try {
    // 添加监听
    curResMsg = addAssistantMsgItem()
    // 有监听先移除监听
    if (cleanIpcListener) {
      cleanIpcListener()
    }
    sendLoading.value = true
    console.log('==', { messages: sendJson, model, provider });

    // 发送请求
    await electronIpcApi.askModel({ messages: sendJson, model, provider })
  } catch (error) {
    console.log(error);
  } finally {
    // 有监听先移除监听
    if (cleanIpcListener) {
      cleanIpcListener()
    }
  }
}
// 添加对话标题
const handleChatTitle = (msg: string) => {
  if (!chatStore?.curChat?.title || chatStore?.curChat?.title === 'New Chat') {
    chatStore.curChat && (chatStore.curChat.title = msg)
  }
}
// 添加用户消息
const addUserMsgItem = (content?: string) => {
  const curMsg: MsgItem = {
    id: new Date().getTime(),
    role: 'user',
    name: '',
    content: content ?? '',
    chatId: chatStore.curChat?.id || ''
  }
  msgList.value = [...msgList.value, curMsg]
  msgStore.addMsg(curMsg)
  return curMsg
}
// 添加智能助手初始消息
const addAssistantMsgItem = (content?: string) => {
  const resMsg: MsgItem = {
    id: new Date().getTime() + 1,
    role: 'assistant',
    reasoning_content: '',
    content: content ?? '',
    chatId: chatStore.curChat?.id || '',
    showReasoning: true
  }
  msgList.value.push(resMsg)
  // 维护所有msg
  msgStore.addMsg(resMsg)
  return resMsg
}
// 文字一次性输出版
const readJsonFun = (res: any) => {
  const message = res?.choices?.[0]?.message || null

  const askMsg: MsgItem = { id: new Date().getTime(), role: message?.role || '', reasoning_content: '', content: message?.content || '', chatId: chatStore.curChat?.id || '', showReasoning: true }
  msgList.value.push(askMsg)
  // 维护所有msg
  msgStore.addMsg(askMsg)
}
const ChartMessageRef = useTemplateRef('ChartMessageRef')

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
    const curMsg = msgList.value.find(item => item?.id === curResMsg?.id)
    sendLoading.value = false
    console.log('data=', data);

    const curContent = data
    curMsg && (curMsg.content += curContent)
    ChartMessageRef.value?.scrollToBottom()
    // console.log('curResMsg==', curMsg);
  })
  removeStreamAbortListener = electronIpcApi.onStreamAbort(() => {
    sendLoading.value = false
    outLoading.value = false
  })
  removeStreamEndListener = electronIpcApi.onStreamEnd(() => {
    outLoading.value = false
  })
  removeStreamErrorListener = electronIpcApi.onStreamError((msg) => {
    console.error('流式输出出错了：', msg);
    sendLoading.value = false
    outLoading.value = false
  })
}
// 读取HTTP方式的流式输出版
const readHttpStream = async (res: any) => {
  if (!res?.ok) {
    throw new Error(`API 调用失败: ${res?.status}`);
  }
  const reader: ReadableStreamDefaultReader<Uint8Array> | undefined = res?.body?.getReader()
  if (!reader) {
    return
  }
  let cacheStr = '' // 读取流式字符串
  const decoder = new TextDecoder('utf-8')
  while (true) {
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
        console.log('输出结束了');
        outLoading.value = false
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
        console.error('catch到了：', error);
        continue
      }
      // const str = curJson.choices?.[0]?.delta?.reasoning_content || ''
      const reasoning_str = curJson.choices?.[0]?.delta?.reasoning_content || ''
      const str = curJson.choices?.[0]?.delta?.content || ''

      // chunkStr += str
      const curMsg = msgList.value.find(item => item.id === curResMsg?.id)
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
  createNewSession()
  // 开启监听读取千问数据
  onStreamDataLisitener()
})
onUnmounted(() => {
  onDestory()
})
defineExpose({
  createNewSession
})
</script>

<style lang='scss' scoped></style>