<template>
  <div
    ref="sidebarRef"
    class="bg-[rgba(241,243,244,1)] dark:bg-gray-700 w-[290px] h-full flex flex-col justify-between p-2 border-r border-r-gray-300 dark:border-r-gray-500 transition-all duration-300 ease-initial -translate-x-full md:translate-x-0 absolute z-[10] md:static"
  >
    <!-- 新建对话 -->
    <div class="w-full flex flex-row items-center gap-2">
      <button class="btn-blank-primary" @click="createChatFun">
        <Icon icon="ant-design:aliwangwang-outlined" width="26" height="26" />
        {{ $t('addChat') }}
      </button>
    </div>
    <!-- 历史记录 -->
    <ScrollAreaRoot class="flex-1 w-full h-[calc(100vh-100px)] relative">
      <ScrollAreaViewport class="w-full h-full rounded">
        <div class="w-[273px] h-full flex flex-col">
          <template v-if="parentChats?.length > 0">
            <div
              v-for="item in parentChats"
              :key="item.id"
              class="w-full flex flex-row items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer px-1 py-2 rounded-lg"
              :class="{ 'bg-gray-200 dark:bg-gray-500': item.id === chatStore.curChat?.id }"
              @click="changeChatFun(item)"
            >
              <img
                :src="item.provider?.providerIcon || chatDefaultIcon"
                alt=""
                class="w-[32px] h-[32px] aspect-square rounded-full object-contain dark:bg-gray-200"
              />
              <span
                :key="item.title || $t('newChat')"
                class="flex-1 font-medium truncate dark:text-white"
                :title="item.title"
                >{{ item.title || $t('newChat') }}
              </span>
              <span class="text-sm text-gray-400">{{ item.createdAt?.toLocaleString()?.slice(5, 10) }}</span>
            </div>
          </template>
          <template v-else>
            <div class="w-full h-full flex flex-row items-center justify-center py-5">
              <span class="text-sm text-gray-400">{{ $t('common.Empty', { label: $t('conversation') }) }}</span>
            </div>
          </template>
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

    <Icon
      class="absolute z-[99] top-[50%] -translate-y-[-50%] right-[-30px] cursor-pointer dark:text-white md:hidden"
      :icon="isCollapsed ? 'lucide:sidebar-open' : 'lucide:sidebar-close'"
      width="30"
      height="30"
      title="展开"
      @click="isCollapsed ? openSidebar() : collapseSidebar()"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport, ScrollAreaCorner } from 'reka-ui'
import { Icon } from '@iconify/vue'
import { useChatStore } from '@/store/useChatStore'
import { ChatItem } from '@/types/chat'
import { useRouter, useRoute } from 'vue-router'
import { useChat } from '@/db/hooks/useChat'
import chatDefaultIcon from '@/assets/images/tdesign--logo-android.png'

// 对话数据类型
const chatStore = useChatStore()
const { chats, getChats } = useChat()
// 拿到父对话列表
const parentChats = computed(() => {
  return chats.value.filter((item) => !item.pid)
})
// 获取历史记录
const getHistoryList = async () => {
  // await chatStore.getChatList()
  await getChats()
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
// 侧边栏的响应式 展开收起
const sidebarRef = useTemplateRef<HTMLDivElement>('sidebarRef')
const isCollapsed = ref(true)
// 侧边栏小屏幕浮动展开
const openSidebar = () => {
  sidebarRef.value?.classList.remove('-translate-x-full')
  sidebarRef.value?.classList.add('translate-x-0')
  isCollapsed.value = false
}
// 侧边栏小屏幕收起
const collapseSidebar = () => {
  sidebarRef.value?.classList.remove('translate-x-0')
  sidebarRef.value?.classList.add('-translate-x-full')
  isCollapsed.value = true
}
// 监听window resize自动确定展开收起
window.addEventListener('resize', () => {
  console.log('window.innerWidth', window.innerWidth)
  if (window.innerWidth > 768) {
    openSidebar()
  } else {
    collapseSidebar()
  }
})
</script>

<style lang="scss" scoped></style>
