<template>
  <div class="w-full flex flex-row justify-center">
    <select
      class="w-[min(398px,80%)] border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      :value="chatStore.curChat?.model" @change="onchange">
      <option value="" disabled selected>请选择智能体</option>
      <optgroup v-for="item in providerList" :key="item.id" :label="item.label">
        <option v-for="model in item.modelList" :value="model.value" :label="model.label"></option>
      </optgroup>
    </select>
  </div>
</template>

<script lang="ts" setup>
import { useChatStore } from '@/store/useChatStore';
import { ModelItem, Provider, ProviderParam } from '@/types/chat';
import { nextTick, ref } from 'vue';
// const curModel = defineModel('curModel', {
//   type: String,
//   default: 'GLM-4.7'
// })
const emits = defineEmits<{
  (e: 'onSelect', model: { selectedModel: ModelItem, selectedProvider: ProviderParam }): void
}>()
const providerList = ref<Provider[]>([
  {
    id: '1', label: '智谱清言',
    apiKey: '5e9ff230a8364875bbeaacb5685b110a.zyNRE10Cd1g83043',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    modelList: [
      { id: '1', label: 'GLM-4.7', value: 'glm-4.7', apiType: 'http' },
      { id: '2', label: 'GLM-5.0', value: 'glm-5', apiType: 'http' },
    ]
  },
  {
    id: '2',
    label: '阿里通义千问',
    apiKey: 'sk-fd132a6fda16432996eb9f1fd2e920af',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    modelList: [{ id: '1', label: 'qwen-plus', value: 'qwen-plus', apiType: 'openAI' }]
  },
  {
    id: '3',
    label: '字节豆包',
    apiKey: 'ark-345fb6b3-5208-4ecf-967d-4e067da74ce8-4a280',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    modelList: [{ id: '1', label: 'doubao-seed-1-6-lite', value: 'ep-20260517113543-5jvw8', apiType: 'openAI' }]
  },
  {
    id: '4',
    label: '百度文心一言',
    apiKey: '',
    baseURL: '',
    modelList: [{ id: '1', label: 'ERNIE-3.5-8K', value: 'ERNIE-3.5-8K', apiType: 'openAI' }]
  },
]);
const chatStore = useChatStore();
// 拿到当前的模型名+请求方式
const onchange = (e: any) => {
  console.log('onchange==', e.target.value);
  // 在这里进行数据处理
  for (let provider of providerList.value) {
    for (let model of provider.modelList) {
      if (model.value === e.target.value) {
        emits('onSelect', {
          selectedModel: model,
          selectedProvider: {
            apiKey: provider.apiKey,
            baseURL: provider.baseURL
          }
        })
        // 直接跳出
        return
      }
    }
  }
  // if (chatStore.curChat) {
  //   chatStore.curChat.model = e.target.value
  //   const curModel = providerList.value
  //     .flatMap(item => item.modelList)
  //     .find(item => item.value === e.target.value)
  //   chatStore.curChat.apiType = curModel?.apiType
  // }
}
</script>

<style lang='scss' scoped></style>