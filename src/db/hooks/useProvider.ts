import { ref } from 'vue'
import { db } from '../indexdb'
import type { Provider } from '@/types/db'
import { v4 as uuid } from 'uuid'

export const useProvider = () => {
  const providers = ref<Provider[]>([])

  //   获取厂商列表
  const getProviders = async () => {
    const list = await db.providers.where('enabled').equals(1).sortBy('createdAt')
    console.log('获取厂商列表：', list)
    providers.value = list
  }
  //   添加厂商
  const addProvider = async (provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('添加厂商：', provider)
      const res = await db.providers.add({
        id: uuid(),
        ...provider,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log('添加成功：', res)
      getProviders()
    } catch (error) {
      console.error('添加厂商失败：', error)
    }
  }
  //   修改厂商
  const updateProvider = async (provider: Partial<Provider> & { id: string }) => {
    try {
      console.log('修改厂商：', provider)
      const res = await db.providers.update(provider.id, {
        ...provider,
        updatedAt: new Date(),
      })
      console.log('修改成功：', res)
      getProviders()
    } catch (error) {
      console.error('修改厂商失败：', error)
    }
  }

  //   删除厂商
  const deleteProvider = async (id: string) => {
    try {
      console.log('删除厂商：', id)
      const res = await db.providers.delete(id)
      console.log('删除成功：', res)
      getProviders()
    } catch (error) {
      console.error('删除厂商失败：', error)
    }
  }
  // 厂商开关 - enabled：希望改成的状态 0-禁用，1-启用
  const toggleProvider = (id: string, enabled: 0 | 1) => {
    updateProvider({ id, enabled })
    // 是否更新providers列表中的该provider的enabled状态
    // const curIndex = providers.value.findIndex((item) => item.id === id)
    // if (curIndex !== -1) {
    //   providers.value[curIndex].enabled = enabled
    // }
  }

  return {
    providers,
    getProviders,
    addProvider,
    updateProvider,
    deleteProvider,
    toggleProvider,
  }
}
