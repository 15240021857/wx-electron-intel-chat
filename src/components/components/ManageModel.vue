<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  SwitchRoot,
  SwitchThumb,
} from 'reka-ui'

import { useProvider } from '@/db/hooks/useProvider'

import { useModel } from '@/db/hooks/useModel'
import { ProviderItem } from '@/types/chat'
const { providers, getProviders } = useProvider()
const { models, getModels } = useModel()
const providerList = ref<ProviderItem[]>([])
const getProvidersFun = async () => {
  await getProviders()
  await getModels()
  console.log('providers==', providers.value)
  console.log('models==', models.value)
  providerList.value = providers.value.map((item) => {
    return {
      ...item,
      modelList: models.value.filter((model) => model.providerId === item.id),
    }
  })
}
onMounted(() => {
  getProvidersFun()
})
</script>

<template>
  <div class="manage-model">
    <div>
      <span>模型管理</span>
    </div>
    <AccordionRoot
      class="bg-mauve6 w-full rounded-lg shadow-[0_2px_10px] shadow-black/5 border"
      default-value="item-1"
      type="single"
      :collapsible="true"
    >
      <template v-for="item in providerList" :key="item.id">
        <AccordionItem
          class="focus-within:shadow-mauve12 mt-px overflow-hidden first:mt-0 first:rounded-t-[7px] last:rounded-b-[7px] focus-within:relative focus-within:z-10 focus-within:shadow-[0_0_0_2px]"
          :value="item.id"
        >
          <AccordionHeader class="flex bg-white hover:bg-mauve2">
            <div
              class="w-full flex flex-row justify-between items-center px-3 shadow-mauve6 shadow-[0_1px_0] outline-none"
            >
              <span>{{ item.label }}</span>
              <SwitchRoot
                id="airplane-mode"
                v-model="item.enabled"
                :true-value="1"
                :false-value="0"
                class="w-[32px] h-[20px] shadow-sm flex data-[state=unchecked]:bg-stone-300 data-[state=checked]:bg-stone-800 dark:data-[state=unchecked]:bg-stone-800 dark:data-[state=checked]:bg-stone-700 border border-stone-300 data-[state=checked]:border-stone-700 dark:border-stone-700 rounded-full relative transition-[background] focus-within:outline-none focus-within:shadow-[0_0_0_1px] focus-within:border-stone-800 focus-within:shadow-stone-800"
              >
                <SwitchThumb
                  class="w-3.5 h-3.5 my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-full"
                />
              </SwitchRoot>
            </div>
            <AccordionTrigger
              class="cursor-pointer text-grass11 shadow-mauve6 hover:bg-mauve2 flex h-[45px] flex-1 cursor-default items-center justify-between bg-white px-5 text-sm leading-none shadow-[0_1px_0] outline-none group"
            >
              <Icon
                icon="radix-icons:chevron-down"
                class="text-green10 ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180"
                aria-label="Expand/Collapse"
              />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent
            class="text-mauve11 bg-mauve2 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden text-sm"
          >
            <div class="px-5 py-4 flex flex-col gap-y-2">
              <fieldset class="flex flex-row items-center justify-between">
                <Label class="text-sm font-semibold leading-[35px] text-stone-700 dark:text-white" for="apiKey">
                  apiKey
                </Label>
                <input
                  id="apiKey"
                  class="bg-white border inline-flex h-[35px] w-full max-w-[300px] appearance-none items-center justify-center rounded-lg px-[10px] text-sm leading-none shadow-sm outline-none focus:shadow-[0_0_0_2px_black] selection:color-white selection:bg-blackA9"
                  type="text"
                  :value="item.apiKey"
                />
              </fieldset>

              <fieldset class="flex flex-row items-center justify-between">
                <Label class="text-sm font-semibold leading-[35px] text-stone-700 dark:text-white" for="baseURL">
                  baseURL
                </Label>
                <input
                  id="baseURL"
                  class="bg-white border inline-flex h-[35px] w-full max-w-[300px] appearance-none items-center justify-center rounded-lg px-[10px] text-sm leading-none shadow-sm outline-none focus:shadow-[0_0_0_2px_black] selection:color-white selection:bg-blackA9"
                  type="text"
                  :value="item.baseURL"
                />
              </fieldset>
              <section class="flex flex-col gap-y-2">
                <div class="flex flex-row items-center justify-between">
                  <Label class="text-sm font-semibold leading-[35px] text-stone-700 dark:text-white" for="apiKey">
                    模型列表
                  </Label>
                </div>
                <div class="flex flex-col gap-y-2">
                  <template v-for="model in item.modelList" :key="model.id">
                    <div
                      class="flex flex-row justify-between items-center border-b border-dashed border-color-gray-200 py-1"
                    >
                      <span>{{ model.label }}</span>
                      <SwitchRoot
                        id="airplane-mode"
                        v-model="model.enabled"
                        :true-value="1"
                        :false-value="0"
                        class="w-[32px] h-[20px] shadow-sm flex data-[state=unchecked]:bg-stone-300 data-[state=checked]:bg-stone-800 dark:data-[state=unchecked]:bg-stone-800 dark:data-[state=checked]:bg-stone-700 border border-stone-300 data-[state=checked]:border-stone-700 dark:border-stone-700 rounded-full relative transition-[background] focus-within:outline-none focus-within:shadow-[0_0_0_1px] focus-within:border-stone-800 focus-within:shadow-stone-800"
                      >
                        <SwitchThumb
                          class="w-3.5 h-3.5 my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-full"
                        />
                      </SwitchRoot>
                    </div>
                  </template>
                </div>
              </section>
            </div>
          </AccordionContent>
        </AccordionItem>
      </template>
    </AccordionRoot>
  </div>
</template>

<style scoped></style>
