import { useModel } from '@/db/hooks/useModel'
import { Model } from '@/types/db'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
const { getModelById, addModel, updateModel, deleteModel, bulkPutModel } = useModel()
export const useModelStore = defineStore('modelStore', () => {
  const { getModels } = useModel()
  //   模型列表
  const modelList = ref<Model[]>([])
  //   启用的模型列表
  const enabledModelList = computed(() => {
    return modelList.value.filter((item) => item.enabled === 1)
  })
  //   厂商id映射 他的所有模型
  const providerModelMap = computed(() => {
    return enabledModelList.value.reduce(
      (acc, cur) => {
        acc[cur.providerId] = acc[cur.providerId] || []
        acc[cur.providerId].push(cur)
        return acc
      },
      {} as Record<string, Model[]>
    )
    // return Object.fromEntries(enabledModelList.value.map((item) => [item.providerId, item]))
  })
  // 厂商所有模型列表
  const allProviderModelMap = computed(() => {
    return modelList.value.reduce(
      (acc, cur) => {
        acc[cur.providerId] = acc[cur.providerId] || []
        acc[cur.providerId].push(cur)
        return acc
      },
      {} as Record<string, Model[]>
    )
  })
  //   模型id映射
  const modelMap = computed(() => {
    return Object.fromEntries(modelList.value.map((item) => [item.id, item]))
  })
  // 查
  const loading = ref(false)
  const getModelList = async (force = false) => {
    if (modelList.value.length > 0 && !force) {
      // 已获取则无需请求,若想再请求请调用refreshModelList
      return modelList.value
    }
    try {
      if (loading.value) return
      loading.value = true
      const list = await getModels()
      modelList.value = list || []
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }
  // 强刷厂商列表
  const refreshModelList = async () => {
    await getModelList(true)
  }
  // 增
  const addModelFun = async (model: Model) => {
    const res = await addModel(model)
    modelList.value = [res.data, ...modelList.value]
  }
  // 改
  const updateModelFun = async (model: Partial<Model> & { id: string }) => {
    const res = await updateModel(model)
    if (res.code === 200) {
      const index = modelList.value.findIndex((item) => item.id === model.id)
      if (index !== -1) {
        modelList.value[index] = {
          ...modelList.value[index],
          ...res.data,
        }
      }
    }
  }
  //   批量改
  const bulkPutModelFun = async (paramList: Model[]) => {
    const res = await bulkPutModel(paramList)
    if (res.code === 200) {
      await refreshModelList()
    }
  }
  // 删
  const deleteModelFun = async (id: string) => {
    const res = await deleteModel(id)
    if (res.code === 200) {
      modelList.value = modelList.value.filter((item) => item.id !== id)
    }
  }

  // 查详情
  const getModelByIdFun = async (id: string): Promise<Model | undefined> => {
    return await getModelById(id)
  }
  //   模型开关
  const toggleModelFun = async (id: string) => {
    const index = modelList.value.findIndex((item) => item.id === id)
    const model = modelList.value[index]
    if (!model) return
    const toEnabled = model.enabled === 1 ? 0 : 1
    const res = await updateModel({ id, enabled: toEnabled })
    if (res.code === 200) {
      modelList.value.splice(index, 1, {
        ...model,
        enabled: toEnabled,
      })
    }
  }
  return {
    modelList,
    enabledModelList,
    providerModelMap,
    allProviderModelMap,
    modelMap,
    getModelList,
    refreshModelList,
    addModelFun,
    updateModelFun,
    bulkPutModelFun,
    deleteModelFun,
    getModelByIdFun,
    toggleModelFun,
  }
})
