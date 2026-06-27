<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useSettingStore } from '@/store/useSettingStore'
import WxSelect from '@/components/wx-reka/WxSelect.vue'
import { Setting } from '@/types/db'
const settingStore = useSettingStore()
// 获取全局设置
const getGlobalSettingFun = async () => {
  await settingStore.getGlobalSetting()
}
// 主题设置 ====================
const ThemeOptions = ref([
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '跟随系统', value: 'auto' },
])
const onThemeChange = ({ value }: { value: Setting['themeMode'] }) => {
  settingStore.updateSettingFun({
    ...settingStore.globalSetting,
    themeMode: value ?? '',
  })
  handleTheme(value)
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
  { label: 'EN', value: 'en-US' },
  { label: '跟随系统', value: 'auto' },
])
const onLangChange = ({ value }) => {
  // settingStore.updateSetting({
  //   themeMode: val,
  // })
}

const ThemeColorOptions = ref([
  { label: 'green', value: 'rgba(31, 127, 62, 1)' },
  { label: 'gray', value: '#78716B' },
  { label: 'skyblue', value: '#1BBCFD' },
  { label: 'Orange', value: '#FF6800' },
  { label: 'pink', value: '#F964B4' },
  { label: 'purple', value: '#C27BFF' },
  { label: 'rose', value: '#FC1E57' },
])
const onThemeColorChange = (val: string) => {
  // settingStore.updateSetting({
  //   themeMode: val,
  // })
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
      <label class="text-md leading-none text-green12 block" for="defaultModel"> 主题 </label>
      <WxSelect
        id="defaultModel"
        v-model="settingStore.globalSetting.themeMode"
        :options="ThemeOptions"
        placeholder="请选择主题"
        @on-change="onThemeChange"
      />
    </fieldset>
    <fieldset class="mb-[15px] w-full flex flex-row items-center justify-between">
      <label class="text-md leading-none text-green12 block" for="defaultModel"> 语言 </label>
      <WxSelect
        id="defaultModel"
        v-model="settingStore.globalSetting.language"
        :options="LangOptions"
        placeholder="请选择默认模型"
        @on-change="onLangChange"
      />
    </fieldset>
    <fieldset class="mb-[15px] w-full flex flex-row items-center justify-between">
      <label class="text-md leading-none text-green12 block" for="defaultModel"> 主题色 </label>
      <ul class="flex flex-row gap-[5px]">
        <li
          v-for="item in ThemeColorOptions"
          :key="item.label"
          class="w-[30px] h-[30px] rounded-full border border-white cursor-pointer hover:border-green8"
          :style="{ 'background-color': item.value }"
          :title="item.label"
          @click="onThemeColorChange(item.value)"
        ></li>
      </ul>
    </fieldset>
    <div class="flex justify-center mt-15">
      <button class="btn-blank-primary max-w-[450px]">保存设置</button>
    </div>
  </div>
</template>
