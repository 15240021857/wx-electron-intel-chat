<template>
  <div class="w-full flex flex-row justify-center">
    <select
      class="w-[min(398px,80%)] border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      :value="chatStore.curChat?.modelId"
      @change="onchange"
    >
      <option value="" disabled selected>请选择智能体</option>
      <optgroup v-for="item in providerList" :key="item.id" :label="item.label">
        <option v-for="model in item.modelList" :key="model.value" :value="model.value" :label="model.label"></option>
      </optgroup>
    </select>
  </div>
</template>

<script lang="ts" setup>
import { useChatStore } from '@/store/useChatStore'
import { ModelItem, ProviderItem, ProviderParam } from '@/types/chat'
import { onMounted, ref } from 'vue'
import { useProvider } from '@/db/hooks/useProvider'
import { useModel } from '@/db/hooks/useModel'
import { useChat } from '@/db/hooks/useChat'
const { updateChat } = useChat()

const emits = defineEmits<{
  (e: 'onSelect', model: { selectedModel: ModelItem | null; selectedProvider: ProviderParam | null }): void
}>()
const { getProviders, providers } = useProvider()
const { getModels, models } = useModel()
const providerList = ref<ProviderItem[]>([
  // {
  //   id: '1',
  //   label: '智谱清言',
  //   apiKey: '5e9ff230a8364875bbeaacb5685b110a.zyNRE10Cd1g83043',
  //   baseURL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  //   modelList: [
  //     { id: '1', label: 'GLM-4.7', value: 'glm-4.7', apiType: 'http' },
  //     { id: '2', label: 'GLM-5.0', value: 'glm-5', apiType: 'http' },
  //   ],
  // },
  // {
  //   id: '2',
  //   label: '阿里通义千问',
  //   apiKey: 'sk-fd132a6fda16432996eb9f1fd2e920af',
  //   baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  //   modelList: [{ id: '1', label: 'qwen-plus', value: 'qwen-plus', apiType: 'openAI' }]
  // },
  // {
  //   id: '3',
  //   label: '字节豆包',
  //   apiKey: 'ark-345fb6b3-5208-4ecf-967d-4e067da74ce8-4a280',
  //   baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  //   modelList: [{ id: '1', label: 'doubao-seed-1-6-lite', value: 'ep-20260517113543-5jvw8', apiType: 'openAI' }]
  // },
  // {
  //   id: '4',
  //   label: '百度文心一言',
  //   apiKey: '',
  //   baseURL: '',
  //   modelList: [{ id: '1', label: 'ERNIE-3.5-8K', value: 'ERNIE-3.5-8K', apiType: 'openAI' }]
  // },
])
// 获取启用的供应商
const getProviderList = async () => {
  await getProviders({ enabled: 1 })
  await getModels({ enabled: 1 })
  providerList.value = providers.value.map((item) => {
    return {
      ...item,
      modelList: models.value.filter((model) => {
        return model.providerId === item.id
      }),
    }
  })
}

const chatStore = useChatStore()
// 根据选中模型拿到当前模型和供应商
const setModelAndProviderByModel = (selectedModel: string) => {
  // 通知父组件
  let curModel = null
  let curProvider = null
  for (let provider of providerList.value) {
    for (let model of provider.modelList) {
      if (model.value === selectedModel) {
        curModel = model
        curProvider = {
          id: provider.id,
          apiKey: provider.apiKey,
          baseURL: provider.baseURL,
        } as ProviderParam
        // 直接跳出
        break
      }
    }
  }
  // console.log('curModel==', curModel)
  // console.log('curProvider==', curProvider)

  // 更新当前chat的model
  if (chatStore.curChat) {
    updateChat({
      id: chatStore.curChat.id,
      modelId: curModel?.id || '',
      providerId: curProvider?.id || '',
    })
    chatStore.curChat.modelId = curModel?.id || ''
    chatStore.curChat.providerId = curProvider?.id || ''
  }
  emits('onSelect', {
    selectedModel: curModel,
    selectedProvider: curProvider,
  })
}
// 拿到当前的模型名+请求方式
const onchange = (e: any) => {
  console.log('onchange==', e.target.value)
  // 在这里进行数据处理
  setModelAndProviderByModel(e.target.value)
}
onMounted(() => {
  getProviderList()
})
defineExpose({
  // 当切换历史chat时，根据chat的model来设置当前模型和供应商
  setModelAndProviderByModel,
})
</script>

<style lang="scss" scoped></style>
