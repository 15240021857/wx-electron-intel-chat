<template>
  <div
    class="flex flex-col w-full h-[auto] m-auto border-[1px] border-solid rounded-xl px-[10px] py-[8px]"
    :class="isFocus ? 'border-blue-500' : 'border-gray-300'"
  >
    <div class="flex-1 h-full pr-[5px]">
      <!-- <input
        ref="searchInput"
        class="outline-none w-full h-full"
        type="text"
        name="keywords"
        placeholder="请输入聊天内容"
        @keyup.enter="sendMsg"
      /> -->
      <textarea
        ref="searchInput"
        class="outline-none w-full h-full resize-none overflow-hidden max-h-[120px]"
        type="text"
        name="keywords"
        rows="1"
        cols="20"
        placeholder="发消息, 或按shift+enter换行"
        @keydown="onInputKeyDown"
        @input="ajustHeight"
        @focus="onInputFocus"
        @blur="onInputBlur"
      ></textarea>
      <!-- <textarea name="keywords" id=""></textarea> -->
    </div>
    <div class="self-end">
      <!-- 发送消息 -->
      <button
        v-show="!outLoading"
        class="bg-green-600 hover:bg-green-700 active:bg-green-800 px-[5px] py-[5px] rounded-full text-white cursor-pointer"
        @click="sendMsg"
      >
        <span>
          <Icon icon="ic:baseline-arrow-upward" width="24" height="24" />
        </span>
      </button>
      <!-- 停止本次问答 -->
      <button
        v-show="outLoading"
        class="flex bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-full text-white cursor-pointer relative px-[5px] py-[5px]"
        @click="stopCurMsg"
      >
        <!-- <Icon icon="svg-spinners:pulse-2" width="24" height="24" /> -->
        <Icon icon="tabler:player-stop-filled" width="24" height="24" />
        <!-- <Icon icon="svg-spinners:bars-scale-middle" width="24" height="24" /> -->
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue'
import { Icon } from '@iconify/vue'

defineProps<{
  outLoading: boolean // 流式输出中
}>()

const emits = defineEmits<{
  (e: 'sendMsg', msg: string | undefined): void
  (e: 'stopCurMsg'): void
}>()

const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
// 发送消息
const sendMsg = () => {
  console.log('发送消息', searchInput.value?.value)
  const msg = searchInput.value?.value
  if (!msg) {
    return
  }

  emits('sendMsg', msg)
}
const onInputKeyDown = (e: KeyboardEvent) => {
  if (e.shiftKey && e.key === 'Enter') {
    return
  }
  if (e.key === 'Enter') {
    console.log('发送消息', searchInput.value?.value)
    e.preventDefault()
    sendMsg()
  }
}
const ajustHeight = () => {
  if (searchInput.value) {
    searchInput.value.style.height = 'auto'
    searchInput.value.style.height = `${searchInput.value.scrollHeight}px`
  }
}
const isFocus = ref(false)
const onInputFocus = () => {
  isFocus.value = true
}
const onInputBlur = () => {
  isFocus.value = false
}
// 停止消息
const stopCurMsg = () => {
  emits('stopCurMsg')
}
</script>

<style lang="scss" scoped></style>
