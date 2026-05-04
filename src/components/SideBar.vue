<template>
  <div class="
    bg-[rgba(241,243,244,1)]
    w-[290px]
    h-full 
    flex 
    flex-col 
    justify-between
    p-2
  ">
    <!-- 新建对话 -->
  <div class="w-full">
    <button class="
      w-full 
      bg-primary-blank 
      border-1 
      border-primary
      rounded-[4px]
      text-primary
      text-md
      py-1
      mb-2
      mt-1
      hover:bg-primary-blank-hover
      active:bg-primary-blank-active
      cursor-pointer
      flex
      flex-row
      items-center
      justify-center
      gap-[2px]
      "
      @click="createChatFun"
    >
      <Icon icon="ant-design:aliwangwang-outlined" width="26" height="26" />
      新建对话
    </button>
    </div>
    <!-- 历史记录 -->
     <ScrollAreaRoot class="flex-1 w-full h-[calc(100vh-100px)] relative pr-[10px]">
      <ScrollAreaViewport class="w-full h-full rounded">
        <div class="w-full flex flex-col">
          <div v-for="item in chatStore.chatList" :key="item.id"
            class="
              w-full
              flex
              flex-row
              items-center
               gap-1
               hover:bg-gray-200
               cursor-pointer
               px-1
               py-2
            "
            @click="changeChatFun(item)"
          >
            <img :src="item.providerIcon" alt=""
            class="
              w-[30px]
              h-[30px]
              aspect-square
            ">
            <span class="flex-1 font-medium truncate" :title="item.title">{{ item.title }}</span>
            <span class="text-sm text-gray-400">{{ item.time }}</span>
          </div>
        </div>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="horizontal">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaScrollbar orientation="vertical" class="w-[10px] h-full bg-gray-300 flex rounded p-[2px] ">
        <ScrollAreaThumb class="bg-gray-500 flex-1 relative rounded" />
      </ScrollAreaScrollbar>
      <ScrollAreaCorner />
    </ScrollAreaRoot>
    <!-- 设置按钮 -->
     <div class="w-full h-[40px] flex flex-dir-row items-center cursor-pointer ">
      <Icon icon="ant-design:setting-outlined" class="text-gray-900 hover:text-gray-600 active:text-gray-400 select-none" width="30" height="30" />
     </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ScrollAreaRoot,ScrollAreaScrollbar,ScrollAreaThumb,ScrollAreaViewport,ScrollAreaCorner } from 'reka-ui'
import chatIcon from '@/assets/images/logo-icon-white-bg.png'
import { Icon } from '@iconify/vue';
import { useChatStore } from '@/store/useChatStore';
import { ChatItem } from '@/types/chat';

const getProvideLogo = (provider: string) => {
  let chatIcon = ''
  switch (provider) {
    case '智谱清言':
      chatIcon = '@/assets/images/logo-icon-white-bg.png'
      break;
    case '阿里通义千问':
      chatIcon = ''
      break;
    case '字节豆包':
      chatIcon = ''
      break;
    case '百度文心一言':
      chatIcon = ''
      break;
    default:
      chatIcon = '@/assets/images/logo-icon-white-bg.png'
      break;
  }
  return chatIcon
}
// 对话数据类型
const chatStore = useChatStore()
// const historyList = ref<ChatItem[]>([]);
// 获取历史记录
const getHistoryList = () => {
  const res = {
    code: 200,
    data: [
      {
        id: 1,
        title: '历史记录1超出的话省略',
        model: 'GLM-4.7',
        time: '2023-01-02',
        providerIcon: chatIcon
      }
    ]
  }
  chatStore.setChatList(res.data || [])
}
// 创建对话
const createChatFun = () => {
  chatStore.createChat()
}
// 切换对话
const changeChatFun = (item: ChatItem) => {
  chatStore.setcurChat(item)
}
onMounted(() => {
  getHistoryList()
})

</script>

<style lang='scss' scoped>
</style>