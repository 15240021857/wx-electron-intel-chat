<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSettingStore } from '@/store/useSettingStore'
import WxSelect from '@/components/wx-reka/WxSelect.vue'
import { Setting } from '@/types/db'
import { useI18n } from 'vue-i18n'
const settingStore = useSettingStore()
const { locale } = useI18n()
// 获取全局设置
const getGlobalSettingFun = async () => {
  await settingStore.getGlobalSetting()
}
// 主题设置 ====================
const ThemeOptions = ref([
  { label: '浅色', value: 'light', i18nKey: 'light' },
  { label: '深色', value: 'dark', i18nKey: 'dark' },
  { label: '跟随系统', value: 'auto', i18nKey: 'system' },
])
const onThemeChange = ({ value }: { value: string }) => {
  const curVal = (value ?? '') as Setting['themeMode']
  settingStore.updateSettingFun({
    ...settingStore.globalSetting,
    themeMode: curVal,
  })
  handleTheme(curVal)
}
const handleTheme = (theme: Setting['themeMode']) => {
  const { globalSetting } = settingStore
  settingStore.setGlobalSetting({
    ...globalSetting,
    themeMode: theme,
  })
  settingStore.applyTheme(theme)
}
// 语言
const LangOptions = ref([
  { label: '中文', value: 'zh-CN' },
  { label: 'EN', value: 'en' },
])
const onLangChange = ({ value }: { value: string }) => {
  const curVal = (value ?? '') as Setting['language']
  settingStore.updateSettingFun({
    language: curVal,
  })
  settingStore.applyLanguage(curVal, locale)
}

const ThemeColorOptions = ref([
  { label: 'green', value: 'rgba(31, 127, 62, 1)' },
  { label: 'skyblue', value: '#00A6F0' },
  // { label: 'skyblue', value: '#0084CE' },
  { label: 'orange', value: '#FF6800' },
  { label: 'pink', value: '#F964B4' },
  { label: 'purple', value: '#C27BFF' },
  { label: 'rose', value: '#FC1E57' },
  { label: 'gray', value: '#78716B' },
])
const onThemeColorChange = (val: string) => {
  settingStore.updateSettingFun({
    ...settingStore.globalSetting,
    themeColor: val,
  })
  settingStore.applyThemeColor(val)
}
const saveSetting = async () => {
  settingStore.updateSettingFun({
    ...settingStore.globalSetting,
  })
}
onMounted(() => {
  getGlobalSettingFun()
})
</script>

<template>
  <div class="setting-container">
    <p class="mb-5 !mt-0 text-mauve11 text-sm !leading-normal">
      Make changes to your account here. Click save when you're done.
    </p>
    <fieldset class="mb-[15px] w-full flex flex-row items-center justify-between">
      <label class="text-md leading-none text-green12 block" for="defaultModel"> {{ $t('theme') || '主题' }} </label>
      <WxSelect
        id="defaultModel"
        v-model="settingStore.globalSetting.themeMode"
        :options="ThemeOptions"
        :placeholder="$t('placeholderTheme')"
        @on-change="onThemeChange"
      />
    </fieldset>
    <fieldset class="mb-[15px] w-full flex flex-row items-center justify-between">
      <label class="text-md leading-none text-green12 block" for="defaultModel"> {{ $t('language') || '语言' }} </label>
      <WxSelect
        id="defaultModel"
        v-model="settingStore.globalSetting.language"
        :options="LangOptions"
        :placeholder="$t('placeholderLanguage')"
        @on-change="onLangChange"
      />
    </fieldset>
    <fieldset class="mb-[15px] w-full flex flex-row items-center justify-between">
      <label class="text-md leading-none text-green12 block" for="defaultModel">
        {{ $t('themeColor') || '主题色' }}
      </label>
      <ul class="flex flex-row gap-[5px]">
        <li
          v-for="item in ThemeColorOptions"
          :key="item.label"
          class="w-[30px] h-[30px] rounded-full border border-[3px] border-white cursor-pointer hover:border-green8"
          :style="{
            'background-color': item.value,
            'border-color': item.value === settingStore.globalSetting.themeColor ? '#333' : 'white',
          }"
          :title="item.label"
          @click="onThemeColorChange(item.value)"
        ></li>
      </ul>
    </fieldset>
    <div class="flex justify-center mt-15">
      <button class="btn-blank-primary max-w-[450px]" @click="saveSetting">
        {{ $t('saveSetting') || '保存设置' }}
      </button>
    </div>
  </div>
</template>
