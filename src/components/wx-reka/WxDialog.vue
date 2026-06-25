<script setup lang="ts">
import { Icon } from '@iconify/vue'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui'
import { ref, watch } from 'vue'

withDefaults(
  defineProps<{
    dialogTitle?: string
    btnText?: string
    confirmText?: string
    cancelText?: string
    desc?: string
    showBtn?: boolean
  }>(),
  {
    dialogTitle: '提示',
    btnText: '打开弹窗',
    confirmText: '确定',
    cancelText: '取消',
    desc: '',
    showBtn: true,
    // desc: '编辑您的表单信息，完成后点击保存按钮。',
  }
)
// 事件
const emits = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'open'): void
  (e: 'close'): void
}>()
// 弹窗开关
const open = ref(false)
watch(
  () => open.value,
  (val) => {
    console.log('open', val)
    if (val) {
      emits('open')
    } else {
      emits('close')
    }
  },
  {
    immediate: true,
  }
)
const openDialog = () => {
  open.value = true
}
const closeDialog = () => {
  open.value = false
}
defineExpose({
  openDialog,
  closeDialog,
})
</script>

<template>
  <DialogRoot v-model:open="open" v-bind="$attrs">
    <DialogTrigger v-if="showBtn" class="btn-blank-primary-small">
      {{ btnText }}
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
      <DialogContent
        class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100] overflow-y-auto"
      >
        <DialogTitle class="text-mauve12 m-0 text-[17px] font-semibold"> {{ dialogTitle }} </DialogTitle>
        <DialogDescription class="text-mauve11 mt-[10px] mb-5 text-sm leading-normal">
          {{ desc }}
        </DialogDescription>
        <slot></slot>
        <!-- <fieldset class="mb-[15px] flex items-center gap-5">
          <label class="text-grass11 w-[90px] text-right text-sm" for="name"> Name </label>
          <input
            id="name"
            class="text-grass11 bg-stone-50 shadow-green7 focus:shadow-green8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-lg px-[10px] text-sm leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            defaultValue="Pedro Duarte"
          />
        </fieldset>
        <fieldset class="mb-[15px] flex items-center gap-5">
          <label class="text-grass11 w-[90px] text-right text-sm" for="username"> Username </label>
          <input
            id="username"
            class="text-grass11 bg-stone-50 shadow-green7 focus:shadow-green8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-lg px-[10px] text-sm leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
            defaultValue="@peduarte"
          />
        </fieldset> -->
        <div class="mt-[25px] flex justify-end gap-[10px]">
          <DialogClose as-child>
            <button
              class="bg-stone-300 text-stone-500 text-sm cursor-pointer hover:bg-stone-200 focus:shadow-stone-200 inline-flex h-[35px] items-center justify-center rounded-lg px-[15px] font-semibold leading-none focus:shadow-[0_0_0_2px] focus:outline-none"
              @click="emits('cancel')"
            >
              {{ cancelText }}
            </button>
            <button
              class="bg-green4 text-green11 text-sm cursor-pointer hover:bg-green5 focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-lg px-[15px] font-semibold leading-none focus:shadow-[0_0_0_2px] focus:outline-none"
              @click="emits('confirm')"
            >
              {{ confirmText }}
            </button>
          </DialogClose>
        </div>
        <DialogClose
          class="text-grass11 hover:bg-green4 focus:shadow-green7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
          aria-label="Close"
        >
          <Icon icon="lucide:x" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
