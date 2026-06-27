<script setup lang="ts">
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import SettingModel from './components/SettingModel.vue'
import SettingBase from './components/SettingBase.vue'
const tabList = [
  { label: '基础设置', value: 'base' },
  { label: '模型设置', value: 'model' },
]
</script>

<template>
  <div class="w-full py-10 h-full overflow-y-auto">
    <TabsRoot
      class="flex flex-col md:w-[70%] sm:w-[300px] max-w-3xl mx-auto shadow-sm rounded-lg border"
      default-value="base"
    >
      <TabsList class="relative shrink-0 flex border-b border-mauve6" aria-label="Manage your account">
        <TabsIndicator
          class="absolute px-8 left-0 h-[2px] bottom-0 w-[var(--reka-tabs-indicator-size)] translate-x-[var(--reka-tabs-indicator-position)] translate-y-[1px] rounded-full transition-[width,transform] duration-300"
        >
          <div class="bg-primary w-full h-full" />
        </TabsIndicator>
        <TabsTrigger
          v-for="tab in tabList"
          :key="tab.value"
          class="bg-white cursor-pointer px-5 h-[45px] flex-1 flex items-center justify-center text-sm leading-none text-mauve11 select-none rounded-tl-md hover:text-primary data-[state=active]:text-primary outline-none cursor-default focus-visible:relative focus-visible:shadow-[0_0_0_2px] focus-visible:shadow-black"
          :value="tab.value"
        >
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>
      <TabsContent
        class="grow p-5 bg-white rounded-b-md outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
        value="base"
      >
        <SettingBase />
      </TabsContent>
      <TabsContent
        class="grow p-5 bg-white rounded-b-md outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
        value="model"
      >
        <SettingModel />
      </TabsContent>
    </TabsRoot>
  </div>
</template>

<style scoped></style>
