<template>
  <div
    class="bg-[rgba(241,243,244,1)] dark:bg-gray-700 w-[290px] h-full flex flex-col justify-between p-2 border-r border-r-gray-300 dark:border-r-gray-500"
  >
    <!-- 新建对话 -->
    <div class="w-full">
      <button class="btn-blank-primary" @click="createChatFun">
        <Icon icon="ant-design:aliwangwang-outlined" width="26" height="26" />
        新建对话
      </button>
    </div>
    <!-- 历史记录 -->
    <ScrollAreaRoot class="flex-1 w-full h-[calc(100vh-100px)] relative">
      <ScrollAreaViewport class="w-full h-full rounded">
        <div class="w-full flex flex-col">
          <div
            v-for="item in chatStore.chatList"
            :key="item.id"
            class="w-full flex flex-row items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer px-1 py-2 rounded-lg"
            :class="{ 'bg-gray-200 dark:bg-gray-500': item.id === chatStore.curChat?.id }"
            @click="changeChatFun(item)"
          >
            <img
              :src="item.providerIcon"
              alt=""
              class="w-[32px] h-[32px] aspect-square rounded-full object-contain dark:bg-gray-200"
            />
            <span :key="item.title" class="flex-1 font-medium truncate dark:text-white" :title="item.title">{{
              item.title
            }}</span>
            <span class="text-sm text-gray-400">{{ item.createdAt?.toLocaleString()?.slice(5, 10) }}</span>
          </div>
        </div>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="horizontal">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaScrollbar orientation="vertical" class="w-[10px] h-full bg-gray-300 flex rounded p-[2px]">
        <ScrollAreaThumb class="bg-gray-500 flex-1 relative rounded" />
      </ScrollAreaScrollbar>
      <ScrollAreaCorner />
    </ScrollAreaRoot>
    <!-- 设置按钮 -->
    <div class="w-full h-[40px] flex flex-dir-row items-center cursor-pointer">
      <Icon
        icon="ant-design:setting-outlined"
        class="text-gray-900 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400 active:text-gray-400 dark:active:text-gray-500 select-none"
        width="30"
        height="30"
        @click="changePage('/settings')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport, ScrollAreaCorner } from 'reka-ui'
import { Icon } from '@iconify/vue'
import { useChatStore } from '@/store/useChatStore'
import { ChatItem } from '@/types/chat'
import { useRouter, useRoute } from 'vue-router'

// 对话数据类型
const chatStore = useChatStore()
// 获取历史记录
const getHistoryList = async () => {
  await chatStore.getChatList()
}
// 创建对话
const createChatFun = async () => {
  chatStore.createChat()
}
const route = useRoute()
const router = useRouter()
// 切换对话
const changeChatFun = (item: ChatItem) => {
  const isHomePage = route.path === '/'
  if (!isHomePage) {
    router.push('/')
  }
  chatStore.setcurChat(item)
}
const changePage = (path: string) => {
  router.push(path)
}
onMounted(() => {
  getHistoryList()
})
</script>

<style lang="scss" scoped></style>
