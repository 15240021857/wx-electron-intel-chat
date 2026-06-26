<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { PopoverArrow, PopoverClose, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { onMounted, onUnmounted, ref } from 'vue'
withDefaults(
  defineProps<{
    closeBtn?: boolean
  }>(),
  {
    closeBtn: true,
  }
)
const visible = defineModel<boolean>({
  default: false,
})
</script>

<template>
  <PopoverRoot ref="popRef" :open="visible">
    <PopoverTrigger ref="triggerRef" aria-label="Update dimensions">
      <slot v-if="$slots.trigger" name="trigger"></slot>
      <Icon v-else icon="radix-icons:mixer-horizontal" />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        side="bottom"
        :side-offset="5"
        class="rounded-lg px-2 py-3 min-w-[160px] bg-white shadow-sm will-change-[transform,opacity] data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade"
      >
        <slot></slot>
        <PopoverClose
          v-if="closeBtn"
          class="rounded-full h-[25px] w-[25px] inline-flex items-center justify-center text-grass11 absolute top-[8px] right-[8px] hover:bg-green4 focus:shadow-[0_0_0_2px] focus:shadow-green7 outline-none cursor-default"
          aria-label="Close"
        >
          <Icon icon="radix-icons:cross-2" />
        </PopoverClose>
        <PopoverArrow class="fill-white stroke-gray-200" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
