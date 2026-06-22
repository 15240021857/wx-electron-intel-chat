<template>
  <div class="flex flex-dir-row w-full h-screen">
    <!-- 侧边栏历史记录 -->
    <SideBar />
    <!-- 右侧聊天区 -->
    <router-view />
  </div>
</template>

<script setup>
import SideBar from '@/components/SideBar.vue'
</script>

<style lang="scss" scoped></style>
