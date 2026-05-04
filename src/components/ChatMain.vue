<template>
  <div class="w-full p-[16px]">
    <h2>聊天功能区{{ chatStore.curChat?.model ? `-${chatStore.curChat?.model}` : '' }}</h2>
    <div class="h-[85%] max-w-3xl mx-auto">
      <!-- 聊天内容区 -->
      <ChartMessage v-if="msgList?.length > 0" ref="ChartMessageRef" :msg-list="msgList" />
      <!-- 大模型下拉选择框 -->
      <div v-show="!chatStore.curChat?.model" class="w-full h-full flex flex-row items-center justify-center">
        <GroupSelect />
      </div>

    </div>

    <!-- 聊天输入框 -->
    <div class="w-full px-5 box-size max-w-3xl mx-auto">
      <SearchInput @send-msg="onSendmsg" />
    </div>

  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';
import SearchInput from './components/SearchInput.vue'
import GroupSelect from './components/GroupSelect.vue'
import ChartMessage from './components/ChartMessage.vue'
import { callZhipuAPI } from '@/api/chat';
import { MsgItem } from '@/types/chat';
import { useChatStore } from '@/store/useChatStore';
import { useMsgStore } from '@/store/useMsgStore';

const chatStore = useChatStore()
const msgStore = useMsgStore()

const { electronIpcApi } = window

const msgList = ref<MsgItem[]>([])

watch(() => chatStore.curChat?.id, async (newChatId) => {
  if (newChatId) {
    msgList.value = await chatStore.getMsgListByChatId(newChatId)
    console.log('msgList.value==2', msgList.value);

  } else {
    msgList.value = []
  }
}, {
  immediate: true
})
let curAskMsg: MsgItem | null = null
let removeStreamListener: any = null
const onSendmsg = async (msg: string | undefined) => {
  if (!chatStore.curChat?.model) {
    alert('请选择模型')
    return
  }
  curAskMsg = null
  console.log('收到msg===', msg);
  if (!msg) return
  chatStore.curChat && (chatStore.curChat.title = msg)
  // 添加msg
  const curMsg: MsgItem = {
    id: new Date().getTime(),
    role: 'user',
    name: '',
    content: msg,
    chatId: chatStore.curChat?.id || ''
  }
  msgList.value = [...msgList.value, curMsg]
  msgStore.addMsg(curMsg)
  let res = null

  switch (chatStore.curChat?.model) {
    case 'GLM-4.7':
      res = await callZhipuAPI({ messages: msgList.value, stream: true })
      readStream(res)
      break;
    case 'qwen-plus':
      const sendJson = msgList.value.map(item => {
        return {
          role: item.role,
          content: item.content
        }
      })
      try {
        // 添加监听
        curAskMsg = addInitMsgItem()
        // 有监听先移除监听
        if (removeStreamListener) {
          removeStreamListener()
        }
        readOpenAIStream()

        // 发送请求
        res = await electronIpcApi.askModel({ messages: sendJson, model: 'qwen-plus' })
        console.log('res==', res);
      } catch (error) {
        console.log(error);
      } finally {
        // 有监听先移除监听
        if (removeStreamListener) {
          removeStreamListener()
        }
      }

      break
    default:
      alert('暂不支持' + chatStore.curChat?.model)
      res = null
      break;
  }
  // readJsonFun(res)
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
// 读取openAI方式的流式输出
const readOpenAIStream = () => {
  const curMsg = msgList.value.find(item => item?.id === curAskMsg?.id)
  removeStreamListener = electronIpcApi.onModelStream((res: any) => {
    // console.log('onModelStream====', res);
    // finish_reason: "stop"
    const curContent = res?.choices?.[0]?.delta?.content || ''
    curMsg && (curMsg.content += curContent)
    ChartMessageRef.value?.scrollToBottom()
    console.log('curAskMsg==', curMsg);
  })
}
// 读取HTTP方式的流式输出版
let cacheStr = '' // 读取流式字符串
const readStream = async (res: any) => {
  if (!res?.ok) {
    throw new Error(`API 调用失败: ${res?.status}`);
  }
  const reader: ReadableStreamDefaultReader<Uint8Array> | undefined = res?.body?.getReader()
  if (!reader) {
    return
  }
  cacheStr = ''
  const decoder = new TextDecoder('utf-8')
  const askMsg: MsgItem = { id: new Date().getTime(), role: 'assistant', reasoning_content: '', content: '', chatId: chatStore.curChat?.id || '', showReasoning: true }
  msgList.value.push(askMsg)
  // 维护所有msg
  msgStore.addMsg(askMsg)
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
      const curAskMsg = msgList.value.find(item => item.id === askMsg.id)
      if (curAskMsg) {
        curAskMsg.content += str
        curAskMsg.reasoning_content += reasoning_str
      }
      ChartMessageRef.value?.scrollToBottom()
    }
  }
}
// 添加一个msg，先存起来，再流式改变content
const addInitMsgItem = () => {
  const curAskMsg: MsgItem = {
    id: new Date().getTime() + 1,
    role: 'assistant',
    reasoning_content: '',
    content: '',
    chatId: chatStore.curChat?.id || '',
    showReasoning: true
  }
  msgList.value.push(curAskMsg)
  // 维护所有msg
  msgStore.addMsg(curAskMsg)
  return curAskMsg
}
// 创建新对话
const createNewSession = () => {
  msgList.value = []
  chatStore.createChat()
}
onMounted(() => {
  createNewSession()
})
onUnmounted(() => {
  // 有监听先移除监听
  if (removeStreamListener) {
    removeStreamListener()
  }
})
defineExpose({
  createNewSession
})
</script>

<style lang='scss' scoped></style>