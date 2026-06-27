import { useSetting } from '@/db/hooks/useSetting'
import { Setting } from '@/types/db'
import { defineStore } from 'pinia'
const { globalSetting, getSettings, updateSetting } = useSetting()

interface SettingStore {
  globalSetting: Setting
}
export const useSettingStore = defineStore('settingStore', {
  state: (): SettingStore => ({
    globalSetting: {
      id: 'global',
      defaultModelId: '',
      defaultProviderId: '',
      themeColor: '',
      themeMode: 'system',
      language: 'zh-CN',
      updatedAt: new Date(),
    },
  }),
  actions: {
    setGlobalSetting(setting: any) {
      this.globalSetting = setting
    },
    // 获取全局设置
    async getGlobalSetting() {
      await getSettings()
      this.setGlobalSetting({ ...globalSetting.value })
    },
    // 更新设置
    async updateSettingFun(setting: Partial<Setting>) {
      await updateSetting(setting)
    },
    async applyTheme(theme?: Setting['themeMode']) {
      // 先获取全局设置
      await this.getGlobalSetting()
      const curTheme = theme || this.globalSetting.themeMode
      const root = document.documentElement
      const systemPrefenceDark = window.matchMedia('(prefers-color-scheme:dark)').matches
      if (curTheme === 'light') {
        document.documentElement.classList.remove('dark')
      } else if (curTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        // 'system' | ''都跟随系统
        // document.documentElement.classList.remove('dark')
        root.classList.toggle('dark', systemPrefenceDark)
      }
    },
    // 监听系统主题切换
    listenThemeChange() {
      window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change', (e) => {
        this.applyTheme()
      })
    },
  },
})
