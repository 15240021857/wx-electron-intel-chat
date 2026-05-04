<template>
  <div class="">
    <!-- 侧边栏历史记录 -->
    <!-- 右侧聊天区 -->
    <PopoverRoot>
      <PopoverTrigger class="bg-sky-700 
      rounded-md 
      p-2 
      text-white 
      cursor-pointer
      hover:bg-sky-600
      active:bg-sky-900
      ">More info</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent class="bg-sky-400 rounded-md p-2">
          Some more info...
          <PopoverClose />
          <PopoverArrow class="fill-sky-400" />
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { PopoverArrow,PopoverClose,PopoverContent,PopoverPortal,PopoverRoot,PopoverTrigger } from 'reka-ui'

const count = ref(0);
const add = () => {
  count.value++;
  electronIpcApi.addCount(count.value)
}
</script>

<style lang='scss' scoped></style>