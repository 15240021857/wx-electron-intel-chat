<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import {
  DropdownMenuArrow,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from 'reka-ui'

withDefaults(
  defineProps<{
    downList: Array<{
      label: string
      value: string
      i18nKey?: string
      keyboard?: string
      icon?: string
      children?: Array<{
        label: string
        value: string
        i18nKey?: string
        keyboard?: string
        icon?: string
      }>
    }>
  }>(),
  {
    downList: () => {
      return [
        { label: 'New Tab', value: '1' },
        {
          label: 'New Window',
          value: '2',
          children: [
            { label: 'child-1', value: '2-1' },
            { label: 'child-2', value: '2-2' },
          ],
        },
      ]
    },
  }
)
const emits = defineEmits<{
  (e: 'select', value: string): void
}>()

const toggleState = ref(false)
const handleSelect = (value: string) => {
  console.log('select')
  emits('select', value)
}
</script>

<template>
  <DropdownMenuRoot v-model:open="toggleState" class="relative" :modal="false">
    <DropdownMenuTrigger class="" aria-label="Customise options" as-child>
      <!-- 要阻止冒泡，给slot传入时加@click.stop @pointerDown.stop -->
      <slot v-if="$slots.trigger" name="trigger"></slot>
      <Icon v-else icon="radix-icons:hamburger-menu" @click.stop @pointer-down.stop />
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        class="min-w-[160px] outline-none bg-white rounded-md p-[5px] py-[10px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
        :side-offset="5"
      >
        <template v-for="item in downList" :key="item.value">
          <template v-if="item?.children?.length > 0">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                value="more toolsz"
                class="group w-full text-sm leading-none text-grass11 rounded-md flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[state=open]:bg-green4 data-[state=open]:text-grass11 data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-green9 data-[highlighted]:text-green1 data-[highlighted]:data-[state=open]:bg-green9 data-[highlighted]:data-[state=open]:text-green1"
              >
                <Icon v-if="item.icon" class="mr-[5px] text-primary" :icon="item.icon" />
                {{ item?.i18nKey ? $t(item?.i18nKey) : item?.label }}
                <div
                  class="ml-auto pl-[20px] text-mauve11 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8"
                >
                  <Icon icon="radix-icons:chevron-right" />
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent
                  class="min-w-[220px] outline-none bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
                  :side-offset="2"
                  :align-offset="-5"
                >
                  <DropdownMenuItem
                    v-for="child in item.children"
                    :key="child.value"
                    :value="child.value"
                    class="group text-xs leading-none text-grass11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-green9 data-[highlighted]:text-green1"
                    @select.stop="handleSelect(child.value)"
                  >
                    {{ child?.i18nKey ? $t(child?.i18nKey) : child?.label }}
                    <div
                      v-if="child?.keyboard"
                      class="ml-auto pl-[20px] text-mauve11 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8"
                    >
                      {{ child?.keyboard }}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </template>
          <DropdownMenuItem
            v-else
            value="New Tab"
            class="group text-sm leading-none text-gray-600 rounded-md flex items-center h-[32px] px-[10px] relative select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none hover:bg-gray-300 hover:text-gray-800 cursor-pointer"
            @select.stop="handleSelect(item.value)"
          >
            <Icon v-if="item.icon" class="mr-[5px] text-primary" :icon="item.icon" width="20" height="20" />
            {{ item?.i18nKey ? $t(item?.i18nKey) : item?.label }}
            <div
              v-if="item?.keyboard"
              class="ml-auto pl-[20px] text-mauve11 group-data-[highlighted]:text-white group-data-[disabled]:text-mauve8"
            >
              {{ item?.keyboard }}
            </div>
          </DropdownMenuItem>
        </template>
        <DropdownMenuArrow class="fill-white" />
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<style>
[data-reka-popper-content-wrapper] {
  z-index: 2 !important;
}
</style>
