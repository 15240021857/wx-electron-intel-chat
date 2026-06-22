import { ref } from 'vue'
import { db } from '../indexdb'
import type { Model } from '@/types/db'
import { v4 as uuid } from 'uuid'

export const useModel = () => {
  const models = ref<Model[]>([])
  const getModels = async (params?: Partial<Model>) => {
    let list = await db.models.toArray()
    console.log('获取模型列表：', list)
    if (params?.providerId) {
      list = list.filter((item) => item.providerId === params.providerId)
    }
    if (params?.enabled !== undefined) {
      list = list.filter((item) => item.enabled === params.enabled)
    }
    models.value = list
  }
  //   获取模型列表
  const getModelsByProviderId = async (providerId: string, enabled?: 0 | 1 | undefined): Promise<Model[]> => {
    let list: Model[] = []

    if (enabled !== undefined) {
      // 查找providerId和enabled都匹配的模型
      list = await db.models.where('[providerId+enabled]').equals([providerId, enabled]).toArray()
    } else {
      // 查找providerId匹配的模型
      list = await db.models.where('providerId').equals(providerId).toArray()
    }

    console.log('获取模型列表：', list)
    return list
  }
  // 根据id获取模型
  const getModelById = async (id: string): Promise<Model | undefined> => {
    return await db.models.get(id)
  }
  //   添加模型
  const addModel = async (model: Omit<Model, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('添加模型：', model)
      const newItem = {
        id: uuid(),
        ...model,
      }
      const res = await db.models.add(newItem)
      console.log('添加成功：', res)
      models.value = [...models.value, newItem]
    } catch (error) {
      console.error('添加模型失败：', error)
    }
  }
  //   修改模型
  const updateModel = async (model: Partial<Model> & { id: string }) => {
    try {
      console.log('修改模型：', model)
      const res = await db.models.update(model.id, {
        ...model,
      })
      console.log('修改成功：', res)
      const curIndex = models.value.findIndex((item) => item.id === model.id)
      if (curIndex !== -1) {
        models.value[curIndex] = {
          ...models.value[curIndex],
          ...model,
        }
      }
    } catch (error) {
      console.error('修改模型失败：', error)
    }
  }

  //   删除模型
  const deleteModel = async (id: string) => {
    try {
      console.log('删除模型：', id)
      const res = await db.models.delete(id)
      console.log('删除成功：', res)
      // 更新models
      models.value = models.value.filter((item) => item.id !== id)
    } catch (error) {
      console.error('删除模型失败：', error)
    }
  }
  // 模型开关 - enabled：希望改成的状态 0-禁用，1-启用
  const toggleModel = (id: string, enabled: 0 | 1) => {
    updateModel({ id, enabled })
    // 是否更新models列表中的该model的enabled状态
    // const curIndex = models.value.findIndex((item) => item.id === id)
    // if (curIndex !== -1) {
    //   models.value[curIndex].enabled = enabled
    // }
  }

  return {
    models,
    getModels,
    getModelsByProviderId,
    addModel,
    updateModel,
    deleteModel,
    toggleModel,
    getModelById,
  }
}
