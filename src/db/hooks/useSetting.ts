import { ref } from 'vue'
import { db } from '../indexdb'
import type { Setting } from '@/types/db'

const SettingId = 'global' // 设置表只有一条记录，id固定为'global'
export const useSetting = () => {
  const globalSetting = ref<Setting>({
    id: SettingId,
    defaultModelId: '',
    defaultProviderId: '',
    themeColor: '',
    themeMode: 'auto',
    language: 'zh-CN',
    updatedAt: new Date(),
  })
  //   获取设置
  const getSettings = async () => {
    const data = await db.settings.get(SettingId)
    console.log('获取设置：', data)
    if (data) {
      globalSetting.value = data
    } else {
      // 没有就初始化添加默认
      db.settings.add({ ...globalSetting.value })
      await getSettings()
    }
  }
  //   添加设置
  // const addSetting = async (setting: Omit<Setting, 'id' | 'createdAt' | 'updatedAt'>) => {
  //   try {
  //     console.log('添加设置：', setting)
  //     const res = await db.settings.add({
  //       id: SettingId,
  //       ...setting,
  //       updatedAt: new Date(),
  //     })
  //     console.log('添加成功：', res)
  //     getSettings()
  //   } catch (error) {
  //     console.error('添加设置失败：', error)
  //   }
  // }
  //   修改设置
  const updateSetting = async (setting: Partial<Setting>) => {
    try {
      console.log('修改设置：', setting)
      const res = await db.settings.update(SettingId, {
        ...setting,
      })
      console.log('修改成功：', res)
      getSettings()
    } catch (error) {
      console.error('修改设置失败：', error)
    }
  }

  //   删除设置
  const deleteSetting = async (id: string) => {
    try {
      console.log('删除设置：', id)
      const res = await db.settings.delete(id)
      console.log('删除成功：', res)
      getSettings()
    } catch (error) {
      console.error('删除设置失败：', error)
    }
  }

  return {
    globalSetting,
    getSettings,
    // addSetting,
    updateSetting,
    deleteSetting,
  }
}
