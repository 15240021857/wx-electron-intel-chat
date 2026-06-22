<script setup lang="ts">
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import SettingModel from './components/SettingModel.vue'
import SettingBase from './components/SettingBase.vue'
</script>

<template>
  <div class="w-full pt-15">
    <TabsRoot
      class="flex flex-col md:w-[70%] sm:w-[300px] max-w-3xl mx-auto shadow-sm rounded-lg border"
      default-value="tab1"
    >
      <TabsList class="relative shrink-0 flex border-b border-mauve6" aria-label="Manage your account">
        <TabsIndicator
          class="absolute px-8 left-0 h-[2px] bottom-0 w-[var(--reka-tabs-indicator-size)] translate-x-[var(--reka-tabs-indicator-position)] translate-y-[1px] rounded-full transition-[width,transform] duration-300"
        >
          <div class="bg-grass8 w-full h-full" />
        </TabsIndicator>
        <TabsTrigger
          class="bg-white cursor-pointer px-5 h-[45px] flex-1 flex items-center justify-center text-sm leading-none text-mauve11 select-none rounded-tl-md hover:text-grass11 data-[state=active]:text-grass11 outline-none cursor-default focus-visible:relative focus-visible:shadow-[0_0_0_2px] focus-visible:shadow-black"
          value="tab1"
        >
          设置
        </TabsTrigger>
        <TabsTrigger
          class="bg-white cursor-pointer px-5 h-[45px] flex-1 flex items-center justify-center text-sm leading-none text-mauve11 select-none rounded-tr-md hover:text-grass11 data-[state=active]:text-grass11 outline-none cursor-default focus-visible:relative focus-visible:shadow-[0_0_0_2px] focus-visible:shadow-black"
          value="tab2"
        >
          模型设置
        </TabsTrigger>
      </TabsList>
      <TabsContent
        class="grow p-5 bg-white rounded-b-md outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
        value="tab1"
      >
        <SettingBase />
      </TabsContent>
      <TabsContent
        class="grow p-5 bg-white rounded-b-md outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
        value="tab2"
      >
        <SettingModel />
      </TabsContent>
    </TabsRoot>
  </div>
</template>

<style scoped></style>
