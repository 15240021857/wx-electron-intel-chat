<script setup lang="ts">
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import SettingModel from './components/SettingModel.vue'
import SettingBase from './components/SettingBase.vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
const tabList = [
  { label: '基础设置', value: 'base', i18nKey: 'baseSetting' },
  { label: '模型设置', value: 'model', i18nKey: 'modelSetting' },
]
const router = useRouter()
const goback = () => {
  router.push('/')
}
</script>

<template>
  <div class="w-full pt-20 pb-10 h-full overflow-y-auto relative">
    <div
      class="h-[55px] flex flex-row items-center absolute left-0 top-0 text-gray-700 dark:text-white hover:text-gray-500 dark:hover:text-gray-200 cursor-pointer"
      @click="goback"
    >
      <Icon icon="ant-design:left-outlined" class="w-5 h-5 ml-5" />
      <span>返回</span>
    </div>
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
          {{ $t(tab.i18nKey) || tab.label }}
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
