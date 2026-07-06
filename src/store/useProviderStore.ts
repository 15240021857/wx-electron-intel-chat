import { defineStore } from 'pinia'
import { useProvider } from '@/db/hooks/useProvider'
import { useModelStore } from './useModelStore'
import { Model, Provider } from '@/types/db'
import { computed, ref } from 'vue'
const { getProviders, addProvider, updateProvider, deleteProvider } = useProvider()

interface getProviderAndModelByModelIdOptions {
  providerProps?: string[]
  modelProps?: string[]
}
// interface ProviderStore {
//   providerList: Provider[]
//   enabledProviderList: Provider[]
// }
export const useProviderStore = defineStore('providerStore', () => {
  const providerList = ref<Provider[]>([])
  const modelStore = useModelStore()
  // const enabledProviderList = ref<Provider[]>([])
  // const modelList = ref<Model[]>([])
  // 获取厂商列表
  const loading = ref(false)
  const getProviderList = async (force = false) => {
    if (providerList.value.length > 0 && !force) {
      // 已获取则无需请求,若想再请求请调用refreshProviderList
      return providerList.value
    }
    try {
      if (loading.value) return
      loading.value = true
      const list = await getProviders()
      // // 获取所有模型
      // await getModelList()
      // const list = providers.value.map((item) => {
      //   return {
      //     ...item,
      //     modelList: models.value.filter((model: Model) => model.providerId === item.id),
      //   }
      // })
      providerList.value = list
    } catch (error) {
      console.log('获取厂商列表失败：', error)
    } finally {
      loading.value = false
    }
  }
  // 强刷厂商列表
  const refreshProviderList = () => getProviderList(true)

  const enabledProviderList = computed(() => {
    return providerList.value.filter((item) => item.enabled === 1)
  })
  // 厂商id映射 厂商信息
  const providerMap = computed(() => {
    return Object.fromEntries(providerList.value?.map((item) => [item.id, item]) || [])
  })
  // 新增厂商
  const addProviderFun = async (provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await addProvider(provider)
      if (res.code === 200) {
        providerList.value = [res.data, ...providerList.value]
      }
      // await getProviderList()
    } catch (error) {
      console.log('添加厂商失败：', error)
    }
  }

  // 修改厂商
  const updateProviderFun = async (provider: Partial<Provider> & { id: string }) => {
    try {
      const res = await updateProvider(provider)
      if (res.code === 200) {
        const index = providerList.value.findIndex((item) => item.id === res.data.id)
        if (index !== -1) {
          providerList.value[index] = {
            ...providerList.value[index],
            ...res.data,
          }
        }
      }
    } catch (error) {
      console.log('修改厂商失败：', error)
    }
  }

  // 删除厂商
  const deleteProviderFun = async (id: string) => {
    try {
      const res = await deleteProvider(id)
      if (res.code === 200) {
        providerList.value = providerList.value.filter((item) => item.id !== id)
      }
    } catch (error) {
      console.log('删除厂商失败：', error)
    }
  }
  // 厂商开关
  const toggleProviderFun = async (id: string) => {
    try {
      const index = providerList.value.findIndex((item) => item.id === id)
      const provider = providerList.value[index]
      if (provider) {
        // 目标enabled
        const toEnabled = provider.enabled === 1 ? 0 : 1
        const res = await updateProvider({
          id,
          enabled: toEnabled,
        })
        if (res.code === 200) {
          providerList.value.splice(index, 1, {
            ...provider,
            enabled: toEnabled,
          })
        }
      }
    } catch (error) {
      console.log('切换厂商失败：', error)
    }
  }
  // 根据modelId获取厂商和模型
  const getProviderAndModelByModelId = async (
    modelId: string,
    options: getProviderAndModelByModelIdOptions = { providerProps: [], modelProps: [] }
  ): Promise<{ provider: Partial<Provider> | null; model: Partial<Model> | null }> => {
    const { providerProps = [], modelProps = [] } = options
    // 确保modelStore.modelMap有值，需等modelList加载完成
    let curModel = modelStore.modelMap?.[modelId] || null
    if (!curModel) {
      // 兜底一下
      await modelStore.getModelList()
      curModel = modelStore.modelMap?.[modelId] || null
    }
    const curProvider = providerMap.value?.[curModel?.providerId] || null
    let propsProvider = {}
    if (providerProps?.length > 0) {
      providerProps.forEach((prop) => {
        propsProvider[prop] = curProvider?.[prop] || ''
      })
    } else {
      propsProvider = curProvider
    }
    let propsModel = {}
    if (modelProps?.length > 0) {
      modelProps.forEach((prop) => {
        propsModel[prop] = curModel?.[prop] || ''
      })
    } else {
      propsModel = curModel
    }
    return {
      provider: propsProvider,
      model: propsModel,
    }
  }

  return {
    providerList,
    enabledProviderList,
    providerMap,
    getProviderList,
    refreshProviderList,
    addProviderFun,
    updateProviderFun,
    deleteProviderFun,
    toggleProviderFun,
    getProviderAndModelByModelId,
  }
})

// const oldCode = {
//   state: (): ProviderStore => ({
//     providerList: [],
//     enabledProviderList: [],
//   }),
//   actions: {
//     setProviderList(providerList: ProviderItem[]) {
//       this.providerList = providerList
//     },
//     setEnabledProviderList(providerList: ProviderItem[]) {
//       this.enabledProviderList = providerList
//     },
//     // 获取或更新厂商模型列表
//     async getEnabledProviderList() {
//       await getProviders({ enabled: 1 })
//       await getModels({ enabled: 1 })
//       const list = providers.value.map((item) => {
//         return {
//           ...item,
//           modelList: models.value.filter((model: Model) => model.providerId === item.id),
//         }
//       })
//       this.setEnabledProviderList(list)
//     },
//     async getProviderList() {
//       await getProviders()
//       await getModels()
//       const list = providers.value.map((item) => {
//         return {
//           ...item,
//           modelList: models.value.filter((model: Model) => model.providerId === item.id),
//         }
//       })
//       this.setProviderList(list)
//     },
//     /**
//      * 通过模型ID获取厂商和模型
//      * @param {string} modelId 模型ID
//      * @param {} options 额外参数
//      * @param {array} options.providerProps 要获取的厂商属性
//      * @param {array} options.modelProps 要获取的模型属性
//      * @returns 厂商和模型
//      */

//     async getProviderAndModelByModelId(
//       modelId: string,
//       options: getProviderAndModelByModelIdOptions = { providerProps: [], modelProps: [] }
//     ): Promise<{ provider: ProviderItem | null; model: Model | null }> {
//       const { providerProps = [], modelProps = [] } = options
//       if (!this.enabledProviderList || this.enabledProviderList.length === 0) {
//         await this.getEnabledProviderList()
//       }
//       let curProvider: ProviderItem | null = {} as ProviderItem
//       let curModel: Model | null = {} as Model
//       let done = false
//       for (const provider of this.enabledProviderList) {
//         for (const model of provider.modelList) {
//           if (model.id === modelId) {
//             // 处理要哪些厂商属性
//             if (providerProps?.length > 0) {
//               providerProps.forEach((prop) => {
//                 curProvider[prop] = provider?.[prop] || ''
//               })
//             } else {
//               curProvider = provider
//             }

//             // 处理要哪些模型属性
//             if (modelProps?.length > 0) {
//               modelProps.forEach((prop) => {
//                 curModel[prop] = model?.[prop] || ''
//               })
//             } else {
//               curModel = model
//             }
//             done = true
//             break
//           }
//         }
//         // 找到后退出
//         if (done) break
//       }
//       return { provider: curProvider, model: curModel }
//     },
//   },
// }
