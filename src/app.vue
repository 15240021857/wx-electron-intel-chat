<template>
  <div class="flex flex-dir-row w-full h-screen">
    <!-- 侧边栏历史记录 -->
    <SideBar />
    <!-- 右侧聊天区 -->
    <ChatMain />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { PopoverArrow,PopoverClose,PopoverContent,PopoverPortal,PopoverRoot,PopoverTrigger } from 'reka-ui'
import SideBar from './components/SideBar.vue'
import ChatMain from './components/ChatMain.vue'

const count = ref(0);
</script>

<style lang='scss' scoped>
</style>