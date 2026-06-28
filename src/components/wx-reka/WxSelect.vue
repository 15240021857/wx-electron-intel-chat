<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectRoot,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui'
import { Option, Result } from '@/types/settings'

const myValue = defineModel<string>()
const props = withDefaults(
  defineProps<{
    options?: Option[]
    placeholder?: string
  }>(),
  {
    placeholder: '请选择...',
    options: () => {
      return [
        // {
        //   label: '水果',
        //   value: 'fruit',
        //   children: [
        //     { label: '苹果', value: 'apple' },
        //     { label: '香蕉', value: 'banana' },
        //     { label: '橘子', value: 'orange' },
        //   ],
        // },
        // {
        //   label: '蔬菜',
        //   value: 'vegetable',
        //   children: [
        //     { label: '西红柿', value: 'tomato' },
        //     { label: '茄子', value: 'eggplant' },
        //     { label: '胡萝卜', value: 'carrot' },
        //   ],
        // },
      ]
    },
  }
)
// 定义事件
const emits = defineEmits<{ (e: 'onChange', { value, res }: { value: string; res?: Result }): void }>()
watch(myValue, (newValue) => {
  const res = findOption(newValue || '')
  emits('onChange', { value: newValue || '', res })
})

const findOption = (value: string): Result => {
  const { options } = props
  for (let item of options) {
    if (item.value === value) {
      return { item }
    } else if (item.children) {
      const findChild = item.children.find((child) => child.value === value) || null
      if (findChild) {
        return { item: findChild, parItem: item }
      }
    }
  }
  return { item: null }
}
onMounted(() => {
  console.log('props.options', props.options)
})
</script>

<template>
  <SelectRoot v-model="myValue">
    <SelectTrigger
      class="inline-flex min-w-[160px] max-w-[300px] w-full items-center justify-between rounded-lg px-[15px] text-xs leading-none h-[35px] gap-[5px] bg-white text-gray-700 hover:bg-stone-50 border shadow-sm focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-green9 outline-none"
      aria-label="Customise options"
      v-bind="$attrs"
    >
      <SelectValue :placeholder="placeholder" />
      <Icon icon="radix-icons:chevron-down" class="h-3.5 w-3.5" />
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        class="min-w-[160px] bg-white rounded-lg border shadow-sm will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade z-[100]"
        :side-offset="5"
      >
        <SelectScrollUpButton class="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
          <Icon icon="radix-icons:chevron-up" />
        </SelectScrollUpButton>
        <SelectViewport v-for="item in options" :key="item.value" class="p-[5px]">
          <template v-if="item?.children">
            <SelectLabel class="px-[25px] text-xs leading-[25px] text-mauve11"> {{ item?.label }} </SelectLabel>
            <SelectGroup v-if="item?.children">
              <SelectItem
                v-for="(option, index) in item?.children"
                :key="index"
                class="text-xs leading-none text-gray-700 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-primary data-[highlighted]:text-white"
                :value="option?.value"
              >
                <SelectItemIndicator class="absolute left-0 w-[25px] inline-flex items-center justify-center">
                  <Icon icon="radix-icons:check" />
                </SelectItemIndicator>
                <SelectItemText class="w-full flex flex-row justify-between items-center">
                  {{ option.i18nKey ? $t(option.i18nKey) : option.label }}
                  <slot name="appendIcon" :row="option"></slot>
                </SelectItemText>
              </SelectItem>
            </SelectGroup>
          </template>
          <SelectItem
            v-else
            class="text-xs leading-none text-gray-700 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-primary data-[highlighted]:text-white"
            :value="item.value"
          >
            <SelectItemText class="w-full flex flex-row justify-between items-center">
              {{ item.i18nKey ? $t(item.i18nKey) : item.label }}
              <slot name="appendIcon" :row="item"></slot>
            </SelectItemText>
          </SelectItem>
          <SelectSeparator class="h-[1px] bg-green6 m-[5px]" />
        </SelectViewport>
        <SelectScrollDownButton class="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
          <Icon icon="radix-icons:chevron-down" />
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<style scoped></style>
