<template>
  <div
    class="flex flex-row items-center w-full h-[45px] justify-center m-auto border-[1px] border-solid border-[#ccc] rounded-sm px-[8px] py-[5px]">
    <div class="flex-1 h-full pr-[5px]">
      <input ref="searchInput" class="outline-none w-full h-full" type="text" name="keywords" placeholder="请输入聊天内容"
        @keyup.enter="sendMsg">
      <!-- <textarea name="keywords" id=""></textarea> -->
    </div>
    <div class="">
      <!-- 发送消息 -->
      <button v-show="!outLoading"
        class="bg-green-600 hover:bg-green-700 active:bg-green-800 px-[5px] py-[5px] rounded-full text-white cursor-pointer"
        @click="sendMsg">
        <span>
          <Icon icon="ic:baseline-arrow-upward" width="24" height="24" />
        </span>
      </button>
      <!-- 停止本次问答 -->
      <button v-show="outLoading"
        class="flex bg-green-600 hover:bg-green-700 active:bg-green-800  rounded-full text-white cursor-pointer relative px-[5px] py-[5px]"
        @click="stopCurMsg">
        <!-- <Icon icon="svg-spinners:pulse-2" width="24" height="24" /> -->
        <Icon icon="tabler:player-stop-filled" width="24" height="24" />
        <!-- <Icon icon="svg-spinners:bars-scale-middle" width="24" height="24" /> -->
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue';
import { Icon } from "@iconify/vue";

defineProps<{
  outLoading: boolean // 流式输出中
}>()

const emits = defineEmits<{
  (e: 'sendMsg', msg: string | undefined): void,
  (e: 'stopCurMsg'): void
}>()

const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
// 发送消息
const sendMsg = () => {
  console.log('发送消息', searchInput.value?.value);
  const msg = searchInput.value?.value

  emits('sendMsg', msg)
}
// 停止消息
const stopCurMsg = () => {
  emits('stopCurMsg')
}
</script>

<style lang='scss' scoped></style>