<template>
  <div class="w-full flex flex-col justify-center items-center">
    <!-- <select
      class="w-[min(398px,80%)] border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      :value="chatStore.curChat?.modelId"
      @change="onchange"
    >
      <option value="" disabled selected>请选择智能体</option>
      <optgroup v-for="item in providerStore.enabledProviderList" :key="item.id" :label="item.label">
        <option v-for="model in item.modelList" :key="model.value" :value="model.id">
          <div class="flex flex-row items-center w-[100px]">
            <span>{{ model.label }}</span>

            <Icon icon="radix-icons:mixer-horizontal" />
          </div>
        </option>
      </optgroup>
    </select> -->
    <p class="text-[24px] dark:text-white bold w-full text-center leading-[24px] mb-[20px]">{{ $t('hello') }}</p>
    <WxSelect
      id="defaultModel"
      v-model="curModelId"
      :options="options"
      :placeholder="$t('common.placeholder', { label: $t('smartModel') })"
      @on-change="onchange"
    >
      <template #appendIcon="{ row }">
        <Icon
          v-if="row?.capacity?.includes('image')"
          icon="ant-design:file-image-outlined"
          width="20"
          height="20"
        ></Icon>
      </template>
    </WxSelect>
  </div>
</template>

<script lang="ts" setup>
import { useChatStore } from '@/store/useChatStore'
import { ModelItem, ProviderParam } from '@/types/chat'
import { computed, onMounted, ref, watch } from 'vue'
import { useChat } from '@/db/hooks/useChat'
import { useProviderStore } from '@/store/useProviderStore'
import { Model } from '@/types/db'
import { Icon } from '@iconify/vue'
import WxSelect from '@/components/wx-reka/WxSelect.vue'
import { Option } from '@/types/settings'
import { useSettingStore } from '@/store/useSettingStore'
const { updateChat } = useChat()

const chatStore = useChatStore()
const emits = defineEmits<{
  (e: 'onSelect', model: { selectedModel: ModelItem | null; selectedProvider: ProviderParam | null }): void
}>()
// defineSlots<{
//   appendIcon: { row: { label: string; value: string; capacity?: string[] } }
// }>()
// 获取启用的供应商
const providerStore = useProviderStore()
const getProviderList = async () => {
  await providerStore.getEnabledProviderList()
}
const curModelId = ref('')
const options = computed<Option[]>(() => {
  return providerStore.enabledProviderList.map((item) => {
    return {
      label: item.label,
      value: item.id,
      children: item.modelList.map((model) => {
        return {
          label: model.label,
          value: model.id,
          capacity: model.capacity,
        }
      }),
    }
  })
})

// 根据选中模型拿到当前模型和供应商
const setModelAndProviderByModel = async (selectedModelId: string, isUpdateChat = true) => {
  // 通知父组件
  const { provider, model } = await providerStore.getProviderAndModelByModelId(selectedModelId || curModelId.value, {
    providerProps: ['id', 'apiKey', 'baseURL'],
  })

  // 更新当前chat的model
  if (isUpdateChat && chatStore.curChat) {
    updateChat({
      id: chatStore.curChat.id,
      modelId: model?.id || '',
      providerId: provider?.id || '',
    })
    chatStore.curChat.modelId = model?.id || ''
    chatStore.curChat.providerId = provider?.id || ''
  }
  emits('onSelect', {
    selectedModel: model || ({} as Model),
    selectedProvider: provider || ({} as ProviderParam),
  })
}
// 拿到当前的模型名+请求方式
const onchange = () => {
  // 在这里进行数据处理
  setModelAndProviderByModel(curModelId.value)
}
// 获取默认的模型id
const settingStore = useSettingStore()
const getDefaultModelId = async () => {
  await settingStore.getGlobalSetting()
  curModelId.value = chatStore.curChat?.modelId || settingStore.globalSetting?.defaultModelId || ''
  setModelAndProviderByModel(curModelId.value)
}
onMounted(() => {
  getProviderList()
  getDefaultModelId()
})
defineExpose({
  // 当切换历史chat时，根据chat的model来设置当前模型和供应商
  setModelAndProviderByModel,
})
</script>

<style lang="scss" scoped></style>
