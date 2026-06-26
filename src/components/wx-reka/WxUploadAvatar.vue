<script setup lang="ts">
import { fileToBase64 } from '@/utils'
import { ref, onMounted } from 'vue'
import { AvatarFallback, AvatarImage, AvatarRoot } from 'reka-ui'

import logo from '@/assets/images/tdesign--logo-android.png'
defineProps<{
  defaultUrl?: string
}>()
const emits = defineEmits<{
  (e: 'change', value: string): void
}>()
const fileInput = ref<HTMLInputElement | null>(null)
const previewBase64 = ref(logo)
const handleFileChange = async (e: Event) => {
  console.log('handleFileChange', fileInput.value?.files?.[0])
  previewBase64.value = await fileToBase64(fileInput.value?.files?.[0] as File)
  emits('change', previewBase64.value)
}
const triggerFun = () => {
  fileInput.value?.click()
}
</script>

<template>
  <div>
    <AvatarRoot
      class="bg-blackA3 inline-flex h-[45px] w-[45px] select-none items-center justify-center overflow-hidden rounded-full align-middle cursor-pointer"
      @click="triggerFun"
    >
      <AvatarImage
        class="h-full w-full rounded-[inherit] object-cover"
        :src="defaultUrl || previewBase64"
        alt="Colm Tuite"
      />
      <AvatarFallback
        class="text-grass11 dark:text-stone-300 leading-1 flex h-full w-full items-center justify-center bg-white dark:bg-stone-800 text-sm font-medium"
        :delay-ms="600"
      >
        CT
      </AvatarFallback>
    </AvatarRoot>
    <input ref="fileInput" type="file" hidden accept="image/*" @change="handleFileChange" />
  </div>
</template>
