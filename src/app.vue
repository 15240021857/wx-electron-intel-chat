<template>
  <div class="flex flex-dir-row w-full h-screen bg-grap-200 dark:bg-gray-800">
    <router-view />
  </div>
</template>

<script setup>
import { useProvider } from '@/db/hooks/useProvider'
import { bootstrapDBProviders } from '@/db/bootstrapDB'
import { onMounted } from 'vue'
import { useSettingStore } from './store/useSettingStore'

const { providers } = useProvider()
const settingStore = useSettingStore()
const bootstrapDB = async () => {
  if (providers.value?.length === 0) {
    await bootstrapDBProviders()
  }
}
const bootstrapSetting = async () => {
  await settingStore.applySettings()
  await settingStore.listenThemeChange()
}
onMounted(() => {
  bootstrapDB()
  bootstrapSetting()
})
</script>

<style lang="scss" scoped></style>
