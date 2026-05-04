<template>
  <div
    class="flex flex-row items-center w-full h-[45px] justify-center m-auto border-[1px] border-solid border-[#ccc] rounded-sm px-[8px] py-[5px]">
    <div class="flex-1 h-full pr-[5px]">
      <input ref="searchInput" class="outline-none w-full h-full" type="text" name="keywords" placeholder="请输入聊天内容" @keyup.enter="sendMsg">
      <!-- <textarea name="keywords" id=""></textarea> -->
    </div>
    <div class="">
      <button
        class="bg-green-600 hover:bg-green-700 active:bg-green-800 px-[15px] py-[4px] rounded-sm text-white cursor-pointer"
        @click="sendMsg">发送</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue';

const emits = defineEmits<{
  (e: 'sendMsg', msg: string|undefined): void
}>()

const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
const sendMsg = () => {
  console.log('发送消息', searchInput.value?.value);
  const msg = searchInput.value?.value
  
  emits('sendMsg', msg)
}
</script>

<style lang='scss' scoped>
</style>