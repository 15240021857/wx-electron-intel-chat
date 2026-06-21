<template>
  <div class="flex flex-dir-row w-full h-screen">
    <!-- 侧边栏历史记录 -->
    <SideBar />
    <!-- 右侧聊天区 -->
    <ChatMain />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import SideBar from './components/SideBar.vue'
import ChatMain from './components/ChatMain.vue'
import { bootstrapDBProviders } from './db/bootstrapDB'

onMounted(() => {
  bootstrapDBProviders()
})
</script>

<style lang="scss" scoped></style>
