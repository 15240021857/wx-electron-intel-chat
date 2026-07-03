<script setup lang="ts">
import { ref, onMounted, watch, useTemplateRef, shallowRef, computed, nextTick } from 'vue'
import ChatMain from './ChatMain.vue'
import { Icon } from '@iconify/vue'
import { useChat } from '@/db/hooks/useChat'
import { useChatStore } from '@/store/useChatStore'
import { Chat } from '@/types/db'
import SearchInput from './components/SearchInput.vue'
import { SendMsgParams } from '@/types/chat.js'
const { getChildChatById } = useChat()
const chatStore = useChatStore()
const childChats = ref<Chat[]>([])
watch(
  () => chatStore.curChat,
  async (curChat) => {
    if (curChat) {
      childChats.value = curChat.children || (await getChildChatById(curChat.id))
    }
  }
)
// 添加子对话
const addChildChat = async (parentId: string) => {
  if (childChats.value.length >= 2) {
    // 最多只能创建2个子对话')
    console.log('最多只能创建2个子对话')
    window.electronIpcApi.showMessage({ type: 'warning', message: '至多创建两个子对话' })
    return
  }
  chatStore.createChat({ pid: parentId })
  childChats.value = chatStore.curChat?.children || (await getChildChatById(parentId))
}
// 向所有对话，包括子对话发送消息
const mainChatRef = useTemplateRef<InstanceType<typeof ChatMain>>('mainChatRef')
const childChatRefList = shallowRef<InstanceType<typeof ChatMain>[]>([])
const onSendAllmsg = ({ msg, image_url, video_url }: SendMsgParams) => {
  console.log('onSendmsg', msg)
  mainChatRef.value?.onSendmsg({ msg, image_url, video_url })
  // 子对话 - 比较项
  childChatRefList.value.forEach((childChatRef) => {
    childChatRef?.onSendmsg({ msg, image_url, video_url })
  })
  // 将所有对话置为输出中true状态
  initoutLoadingMap(true)
}
// 停止所有对话，包括子对话
const stopAllMsg = () => {
  console.log('stopCurMsg')
  mainChatRef.value?.stopCurMsg()

  // 子对话 - 比较项
  childChatRefList.value.forEach((childChatRef) => {
    childChatRef?.stopCurMsg()
  })
}
// 输出中状态 chatId:string , outLoading:boolean
const outLoadingMap = ref<Record<string, boolean>>({})
// 总的输出中状态 有一个true，则输出中
const allOutloading = computed(() => {
  return Object.values(outLoadingMap.value).some((item) => item)
})
// 单个对话outLoading change
const handleOutLoadingChange = (val: boolean, chatId: string) => {
  outLoadingMap.value[chatId] = val
}
// 所有对话初始化统一设置outLoading状态
const initoutLoadingMap = (val) => {
  outLoadingMap.value = {
    [chatStore.curChat?.id || 0]: val,
  }
  if (childChats.value.length > 0) {
    childChats.value.forEach((childChat) => {
      outLoadingMap.value[childChat.id] = val
    })
  }
}
</script>

<template>
  <div class="w-full h-screen flex flex-col">
    <div class="w-full flex-1 overflow-y-auto flex flex-row relative">
      <div class="absolute z-10 h-[55px] right-0 top-0 flex flex-row items-center justify-center px-4">
        <button title="添加子对话" @click="addChildChat(chatStore.curChat?.id || '')">
          <Icon
            icon="ant-design:plus-circle-twotone"
            class="w-7 h-7 text-primary dark:text-primary-hover cursor-pointer"
          />
        </button>
        <span></span>
      </div>
      <!-- 主对话 -->
      <ChatMain ref="mainChatRef" @on-outloading-change="handleOutLoadingChange($event, chatStore.curChat?.id || '')" />
      <!-- 子对话 - 比较项 -->
      <template v-for="(childChat, index) in childChats" :key="childChat.id">
        <ChatMain
          :ref="(el) => (childChatRefList[index] = el as any)"
          v-model="childChats[index]"
          @on-outloading-change="handleOutLoadingChange($event, childChat.id)"
        />
      </template>
    </div>
    <!-- 聊天输入框 -->
    <div
      v-if="childChats?.length > 0"
      class="w-full h-[auto] flex-basis-[120px] px-5 pb-4 pt-2 box-size max-w-5xl mx-auto"
    >
      <SearchInput :out-loading="allOutloading" @send-msg="onSendAllmsg" @stop-cur-msg="stopAllMsg" />
    </div>
  </div>
</template>
