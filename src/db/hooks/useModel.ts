import { ref, isProxy, toRaw } from 'vue'
import { db } from '../indexdb'
import type { Model } from '@/types/db'
import { v4 as uuid } from 'uuid'

export const useModel = () => {
  const getModels = async (params?: Partial<Model>) => {
    let list = await db.models.orderBy('createdAt').reverse().toArray()
    console.log('获取模型列表：', list)
    if (params?.providerId) {
      list = list.filter((item) => item.providerId === params.providerId)
    }
    if (params?.enabled !== undefined) {
      list = list.filter((item) => item.enabled === params.enabled)
    }
    return list
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
  const addModel = async (model: Omit<Model, 'id' | 'createdAt'>) => {
    try {
      console.log('添加模型：', model)
      const newItem = {
        id: uuid(),
        ...model,
        capacity: model.capacity || ['text'],
        createdAt: new Date(),
      }
      const res = await db.models.add(newItem)
      console.log('添加成功：', res)
      return {
        code: 200,
        message: 'success',
        data: newItem,
      }
    } catch (error) {
      console.error('添加失败：', error)
      throw error
    }
  }
  //   修改模型
  const updateModel = async (model: Partial<Model> & { id: string }) => {
    try {
      console.log('修改模型：', model)
      const newItem = {
        ...model,
        capacity: model.capacity || ['text'],
      }
      const res = await db.models.update(model.id, newItem)
      console.log('修改成功：', res)

      return {
        code: 200,
        message: 'success',
        data: newItem,
      }
    } catch (error) {
      console.error('修改模型失败：', error)
      throw error
    }
  }
  // 批量修改模型
  const bulkPutModel = async (modelList: Model[]) => {
    try {
      console.log('modelList==', modelList)
      const paramList = modelList.map((item) => {
        const newItem = {
          ...item,
          id: item?.id || uuid(),
          capacity: item.capacity || ['text'],
          createdAt: item?.createdAt || new Date(),
        }
        return isProxy(newItem) ? toRaw(newItem) : newItem
      })
      const res = await db.models.bulkPut(paramList)
      console.log('批量修改成功：', res)
      // models.value = [...modelList]
      return {
        code: 200,
        message: 'success',
        data: res,
      }
    } catch (error) {
      console.error('批量修改模型失败：', error)
      throw error
    }
  }

  //   删除模型
  const deleteModel = async (id: string) => {
    try {
      console.log('删除模型：', id)
      const res = await db.models.delete(id)
      console.log('删除成功：', res)
      return {
        code: 200,
        message: 'success',
        data: res,
      }
    } catch (error) {
      console.error('删除模型失败：', error)
      throw error
    }
  }
  // 模型开关 - enabled：希望改成的状态 0-禁用，1-启用
  const toggleModel = async (id: string, enabled: 0 | 1) => {
    const res = await updateModel({ id, enabled })
    return res
  }

  return {
    getModels,
    getModelsByProviderId,
    addModel,
    updateModel,
    bulkPutModel,
    deleteModel,
    toggleModel,
    getModelById,
  }
}
