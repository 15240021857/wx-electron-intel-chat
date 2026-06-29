import { ProviderItem } from '@/types/chat'
import { defineStore } from 'pinia'
import { useProvider } from '@/db/hooks/useProvider'
import { useModel } from '@/db/hooks/useModel'
import { Model } from '@/types/db'
const { providers, getProviders } = useProvider()
const { models, getModels } = useModel()

interface getProviderAndModelByModelIdOptions {
  providerProps?: string[]
  modelProps?: string[]
}
interface ProviderStore {
  providerList: ProviderItem[]
  enabledProviderList: ProviderItem[]
}
export const useProviderStore = defineStore('providerStore', {
  state: (): ProviderStore => ({
    providerList: [],
    enabledProviderList: [],
  }),
  actions: {
    setProviderList(providerList: ProviderItem[]) {
      this.providerList = providerList
    },
    setEnabledProviderList(providerList: ProviderItem[]) {
      this.enabledProviderList = providerList
    },
    // 获取或更新厂商模型列表
    async getEnabledProviderList() {
      await getProviders({ enabled: 1 })
      await getModels({ enabled: 1 })
      const list = providers.value.map((item) => {
        return {
          ...item,
          modelList: models.value.filter((model: Model) => model.providerId === item.id),
        }
      })
      this.setEnabledProviderList(list)
    },
    async getProviderList() {
      await getProviders()
      await getModels()
      const list = providers.value.map((item) => {
        return {
          ...item,
          modelList: models.value.filter((model: Model) => model.providerId === item.id),
        }
      })
      this.setProviderList(list)
    },
    /**
     * 通过模型ID获取厂商和模型
     * @param {string} modelId 模型ID
     * @param {} options 额外参数
     * @param {array} options.providerProps 要获取的厂商属性
     * @param {array} options.modelProps 要获取的模型属性
     * @returns 厂商和模型
     */

    async getProviderAndModelByModelId(
      modelId: string,
      options: getProviderAndModelByModelIdOptions = { providerProps: [], modelProps: [] }
    ): Promise<{ provider: ProviderItem | null; model: Model | null }> {
      const { providerProps = [], modelProps = [] } = options
      if (!this.enabledProviderList || this.enabledProviderList.length === 0) {
        await this.getEnabledProviderList()
      }
      let curProvider: ProviderItem | null = {} as ProviderItem
      let curModel: Model | null = {} as Model
      let done = false
      for (const provider of this.enabledProviderList) {
        for (const model of provider.modelList) {
          if (model.id === modelId) {
            // 处理要哪些厂商属性
            if (providerProps?.length > 0) {
              providerProps.forEach((prop) => {
                curProvider[prop] = provider?.[prop] || ''
              })
            } else {
              curProvider = provider
            }

            // 处理要哪些模型属性
            if (modelProps?.length > 0) {
              modelProps.forEach((prop) => {
                curModel[prop] = model?.[prop] || ''
              })
            } else {
              curModel = model
            }
            done = true
            break
          }
        }
        // 找到后退出
        if (done) break
      }
      return { provider: curProvider, model: curModel }
    },
  },
})
