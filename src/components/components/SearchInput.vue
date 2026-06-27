<template>
  <div
    class="flex flex-col w-full h-[auto] m-auto border-[1px] border-solid rounded-xl px-[10px] py-[8px]"
    :class="isFocus ? 'border-primary dark:border-primary' : 'border-gray-300 dark:border-gray-500'"
  >
    <!-- 图片或视频预览列表 -->
    <div class="flex flex-row items-center gap-1 pb-[10px]">
      <template v-if="capacityParams && capacityParams.image_url?.length">
        <div
          v-for="item in capacityParams.image_url"
          :key="item"
          class="group w-[60px] h-[60px] bg-gray-200 rounded-[5px] relative hover"
        >
          <img :src="item" class="w-full h-full object-cover rounded-[5px]" />
          <div
            class="opacity-0 group-hover:opacity-100 absolute z-2 top-[-10px] right-[-10px] w-[16px] h-[16px] rounded-full bg-stone-700 text-base text-white flex items-center justify-center"
          >
            <Icon
              icon="ant-design:close-outlined"
              width="12"
              height="12"
              class="text-white cursor-pointer"
              @click="removeFileByUrl(item)"
            />
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
        class="outline-none w-full h-full resize-none overflow-hidden max-h-[120px] dark:text-gray-100"
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
        <!-- <label for="uploadFile" class="cursor-pointer"> -->
        <!-- <Icon icon="mdi:image-plus" width="24" height="24" /> -->
        <input ref="imgFile" type="file" multiple hidden accept="image/*" @change="onImgFileChange" />
        <input ref="docFile" type="file" multiple hidden :accept="DOC_ACCEPT" @change="onDocFileChange" />
        <!-- </label> -->
        <WxPopper v-model="filePopVisible" :close-btn="false">
          <template #trigger>
            <Icon
              ref="popTriggerBtn"
              class="cursor-pointer dark:text-gray-100"
              icon="ant-design:plus-outlined"
              width="24"
              height="24"
              @click="filePopVisible = !filePopVisible"
            />
          </template>
          <template #default>
            <ul
              ref="popRef"
              class="[&>li]:flex [&>li]:flex-row [&>li]:items-center [&>li]:gap-x-1 [&>li]:cursor-pointer [&>li]:p-[2px_5px] [&>li]:rounded-sm [&>li]:hover:bg-stone-200"
            >
              <li @click="onFileClick('image')">
                <Icon icon="ant-design:file-image-outlined" width="20" height="20"></Icon>
                <span class="text-base">图片</span>
              </li>
              <!-- <li @click="onFileClick('doc')">
                <Icon icon="ant-design:file-add-outlined" width="20" height="20"></Icon>
                <span class="text-base">文件</span>
              </li> -->
            </ul>
          </template>
        </WxPopper>
      </div>
      <!-- 发送消息 -->
      <div class="self-end">
        <button
          v-show="!outLoading"
          class="bg-primary hover:bg-primary active:bg-green-800 px-[5px] py-[5px] rounded-full text-white cursor-pointer"
          @click="sendMsg"
        >
          <span>
            <Icon icon="ic:baseline-arrow-upward" width="24" height="24" />
          </span>
        </button>
        <!-- 停止本次问答 -->
        <button
          v-show="outLoading"
          class="flex bg-primary hover:bg-primary active:bg-green-800 rounded-full text-white cursor-pointer relative px-[5px] py-[5px]"
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
import WxPopper from '@/components/wx-reka/WxPopper.vue'
import { onClickOutside } from '@vueuse/core'

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
  resetMsgInput()
}
const resetMsgInput = () => {
  // 发送完，清空
  searchInput.value && (searchInput.value.value = '')
  capacityParams.value = {
    image_url: [],
    video_url: [],
  }
  imgFile.value && (imgFile.value.value = '')
  docFile.value && (docFile.value.value = '')
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
const docFile = ref<HTMLInputElement | null>(null)
const filePopVisible = ref(false)
type FileMode = 'image' | 'doc'
const onFileClick = (mode: FileMode) => {
  if (mode === 'image') {
    imgFile.value?.click()
  } else if (mode === 'doc') {
    docFile.value?.click()
  }
}
const onImgFileChange = async () => {
  // console.log('imgFile.value', imgFile.value?.files)
  filePopVisible.value = false
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
const DOC_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.json,.xml,.log'

const onDocFileChange = async () => {
  filePopVisible.value = false
  console.log('onDocFileChange', docFile.value?.files)
}
// 删除某个图片或文件
const removeFileByUrl = (imgUrl: string) => {
  const { image_url } = capacityParams.value
  capacityParams.value.image_url = image_url?.filter((item) => item !== imgUrl)
}
// 处理popper外点击
const popRef = ref<HTMLElement | null>(null)
const popTriggerBtn = useTemplateRef<InstanceType<typeof Icon>>('popTriggerBtn')
onClickOutside(
  popRef,
  () => {
    filePopVisible.value = false
  },
  { ignore: [popTriggerBtn] }
)
// const clickOutside = (event: MouseEvent) => {
//   if (
//     filePopVisible.value &&
//     popRef.value &&
//     !popRef.value.contains(event.target as Node) &&
//     !popTriggerBtn.value?.$el.contains(event.target as Node)
//   ) {
//     filePopVisible.value = false
//   }
// }
// onMounted(() => {
//   window.addEventListener('click', clickOutside)
// })
// onUnmounted(() => {
//   window.removeEventListener('click', clickOutside)
// })
</script>

<style lang="scss" scoped></style>
