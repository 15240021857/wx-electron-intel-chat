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
      :options="providerModelList"
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
import { ProviderParam } from '@/types/chat'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useProviderStore } from '@/store/useProviderStore'
import { Model, Chat } from '@/types/db'
import { Icon } from '@iconify/vue'
import WxSelect from '@/components/wx-reka/WxSelect.vue'
import { useSettingStore } from '@/store/useSettingStore'
import { useModelStore } from '@/store/useModelStore'

const props = withDefaults(
  defineProps<{
    // 当前对话窗口的chat：可能是主对话 或子对话
    curChatWindowChat?: Chat | null
  }>(),
  {
    curChatWindowChat: null,
  }
)
const emits = defineEmits<{
  (
    e: 'onSelect',
    model: { selectedModel: Model | null; selectedProvider: ProviderParam | null },
    isUpdateChat: boolean
  ): void
}>()
// 获取启用的供应商
const providerStore = useProviderStore()
const modelStore = useModelStore()
// 计算出厂商模型列表 - 有变化自适应厂商和模型变动
const providerModelList = computed(() => {
  return providerStore.enabledProviderList?.map((item) => {
    const curModelList = modelStore.providerModelMap?.[item.id]?.map((model) => {
      return {
        label: model.label,
        value: model.id,
        capacity: model.capacity,
      }
    })
    return {
      label: item.label,
      value: item.id,
      children: curModelList || [],
    }
  })
})
// 获取厂商模型
const getProviderList = async () => {
  await providerStore.getProviderList()
  await modelStore.getModelList()
}
const curModelId = ref('')

// 根据选中模型拿到当前模型和供应商
const setModelAndProviderByModel = async (selectedModelId: string, isUpdateChat = true) => {
  // 通知父组件
  const { provider, model } = await providerStore.getProviderAndModelByModelId(selectedModelId || curModelId.value, {
    providerProps: ['id', 'apiKey', 'baseURL'],
  })
  emits(
    'onSelect',
    {
      selectedModel: (model || {}) as Model,
      selectedProvider: (provider || {}) as ProviderParam,
    },
    isUpdateChat
  )
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
  curModelId.value = props.curChatWindowChat?.modelId || settingStore.globalSetting?.defaultModelId || ''
  setModelAndProviderByModel(curModelId.value)
}
onMounted(async () => {
  await getProviderList()
  getDefaultModelId()
})
defineExpose({
  // 当切换历史chat时，根据chat的model来设置当前模型和供应商
  setModelAndProviderByModel,
})
</script>

<style lang="scss" scoped></style>
