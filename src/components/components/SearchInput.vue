<template>
  <div
    class="flex flex-col w-full h-[auto] m-auto border-[1px] border-solid rounded-xl px-[10px] py-[8px]"
    :class="isFocus ? 'border-blue-500' : 'border-gray-300'"
  >
    <!-- 图片或视频预览列表 -->
    <div class="flex flex-row items-center gap-1">
      <template v-if="capacityParams && capacityParams.image_url?.length">
        <div
          v-for="item in capacityParams.image_url"
          :key="item"
          class="w-[60px] h-[60px] bg-gray-200 rounded-[5px] relative"
        >
          <img :src="item" class="w-full h-full object-cover rounded-[5px]" />
          <div
            class="absolute top-[-10px] right-[-10px] w-[24px] h-[24px] bg-black-900 text-base flex items-center justify-center"
          >
            <Icon icon="mdi:delete-outline" width="20" height="20" class="text-black cursor-pointer" />
          </div>
        </div>
      </template>
    </div>
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
    <div class="w-full flex flex-row items-center justify-between gap-1">
      <!-- 上传图片按钮 -->
      <div class="">
        <input id="file" ref="imgFile" type="file" multiple @change="onImgFileChange" />
      </div>
      <!-- 发送消息 -->
      <div class="self-end">
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
  </div>
</template>

<script lang="ts" setup>
import { ref, toRaw, useTemplateRef } from 'vue'
import { Icon } from '@iconify/vue'
import { SendMsgParams } from '@/types/chat'
import { CapacityParams } from '@/types/db'
import { fileToBase64 } from '@/utils'

defineProps<{
  outLoading: boolean // 流式输出中
}>()

const emits = defineEmits<{
  (e: 'sendMsg', sendParam: SendMsgParams): void
  (e: 'stopCurMsg'): void
}>()

const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
// 发送消息
const capacityParams = ref<CapacityParams>({
  image_url: [],
  video_url: [],
})
const sendMsg = () => {
  console.log('发送消息', searchInput.value?.value)
  const msg = searchInput.value?.value || ''
  const { image_url, video_url } = capacityParams.value
  if (!msg && image_url?.length === 0 && video_url?.length === 0) {
    return
  }

  console.log('capacityParams.value====', capacityParams.value)
  emits('sendMsg', {
    msg,
    image_url: toRaw(image_url),
    video_url: toRaw(video_url),
  })
  // 发送完，清空
  searchInput.value && (searchInput.value.value = '')
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

const imgFile = ref<HTMLInputElement | null>(null)
const onImgFileChange = async (e: Event) => {
  // console.log('imgFile.value', imgFile.value?.files)
  const files = imgFile.value?.files
  let base64List: string[] = []
  if (files && files?.length > 0) {
    const fileList = Array.from(files) ?? []
    base64List = await Promise.all(
      fileList?.map(async (file) => {
        return fileToBase64(file)
      })
    )
    // console.log('base64List===========', base64List)
    capacityParams.value.image_url = base64List || []
  }
}
</script>

<style lang="scss" scoped></style>
