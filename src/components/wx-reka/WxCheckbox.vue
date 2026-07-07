<script setup lang="ts">
import { watch } from 'vue'
import { CheckboxGroupRoot, CheckboxIndicator, CheckboxRoot } from 'reka-ui'
import { Icon } from '@iconify/vue'

const checkValue = defineModel<(string | number)[]>()
interface CheckListItem {
  label: string
  value: string | number
  i18nKey?: string
}
withDefaults(
  defineProps<{
    checkList?: CheckListItem[]
  }>(),
  {
    checkList: () => {
      return [
        { label: 'Checkbox 1', value: '1' },
        { label: 'Checkbox 2', value: '2' },
      ]
    },
  }
)
watch(
  () => checkValue.value,
  (value) => {
    console.log('checkValue', value)
  },
  {
    immediate: true,
  }
)
</script>

<template>
  <CheckboxGroupRoot v-model="checkValue" class="flex flex-row gap-x-2 items-center">
    <label
      v-for="item in checkList"
      :key="item.value"
      class="flex flex-row gap-x-2 items-center [&>.checkbox]:hover:bg-neutral-100"
    >
      <CheckboxRoot
        :value="item.value"
        class="hover:bg-stone-50 flex h-5 w-5 appearance-none items-center justify-center rounded-md bg-white shadow-sm border outline-none focus-within:shadow-[0_0_0_2px_black]"
      >
        <CheckboxIndicator class="bg-white h-full w-full rounded flex items-center justify-center">
          <Icon icon="radix-icons:check" class="h-5 w-5 text-grass9" />
        </CheckboxIndicator>
      </CheckboxRoot>

      <span class="select-none text-stone-700 text-sm dark:text-dark-500">{{
        item.i18nKey ? $t(item.i18nKey) : item.label
      }}</span>
    </label>
  </CheckboxGroupRoot>
</template>
