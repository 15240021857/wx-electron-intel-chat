import { useSetting } from '@/db/hooks/useSetting'
import { Setting } from '@/types/db'
import { defineStore } from 'pinia'
const { globalSetting, getSettings, updateSetting } = useSetting()

export const useSettingStore = defineStore('settingStore', {
  state: () => ({
    globalSetting: {
      defaultModelId: '',
      defaultProviderId: '',
      themeColor: '',
      themeMode: 'auto',
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
  },
})
