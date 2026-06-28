<template>
  <div class="flex flex-dir-row w-full h-screen bg-grap-200 dark:bg-gray-800">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useProvider } from '@/db/hooks/useProvider'
import { bootstrapDBProviders } from '@/db/bootstrapDB'
import { onMounted } from 'vue'
import { useSettingStore } from './store/useSettingStore'
import { useI18n } from 'vue-i18n'

const { providers } = useProvider()
const { locale } = useI18n()
const settingStore = useSettingStore()
const bootstrapDB = async () => {
  if (providers.value?.length === 0) {
    await bootstrapDBProviders()
  }
}
const bootstrapSetting = async () => {
  await settingStore.applySettings()
  await settingStore.listenThemeChange()
  settingStore.applyLanguage(settingStore.globalSetting.language, locale)
}
onMounted(() => {
  bootstrapDB()
  bootstrapSetting()
})
</script>

<style lang="scss" scoped></style>
