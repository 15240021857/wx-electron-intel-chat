<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ChatMain from './ChatMain.vue'
import { Icon } from '@iconify/vue'
import { useChat } from '@/db/hooks/useChat'
import { useChatStore } from '@/store/useChatStore'
import { Chat } from '@/types/db'
const { getChildChatById } = useChat()
const chatStore = useChatStore()
const childChats = ref<Chat[]>([])
watch(
  () => chatStore.curChat,
  async (curChat) => {
    if (curChat) {
      childChats.value = await getChildChatById(curChat.id)
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
  childChats.value = await getChildChatById(parentId)
}
</script>

<template>
  <div class="w-full h-full flex flex-row relative">
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
    <ChatMain />
    <!-- 子对话 - 比较项 -->
    <template v-for="(childChat, index) in childChats" :key="childChat.id">
      <ChatMain v-model="childChats[index]" />
    </template>
  </div>
</template>
