import { ProviderItem } from '@/types/chat'
import { defineStore } from 'pinia'
import { useProvider } from '@/db/hooks/useProvider'
import { useModel } from '@/db/hooks/useModel'
import { Model } from '@/types/db'
const { providers, getProviders } = useProvider()
const { models, getModels } = useModel()

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
  },
})
