<script setup lang="ts">
import { ref, reactive, useTemplateRef } from 'vue'
import {
  SwitchRoot,
  SwitchThumb,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRoot,
} from 'reka-ui'
import { Icon } from '@iconify/vue'
import WxDialog from '@/components/wx-reka/WxDialog.vue'
import { ProviderItem, ModelItem } from '@/types/chat'
import { Model, Provider } from '@/types/db'
import WxSelect from '@/components/wx-reka/WxSelect.vue'
import WxCheckBox from '@/components/wx-reka/WxCheckbox.vue'
import { useModel } from '@/db/hooks/useModel'
import { ApiResult } from '@/types/global'
const { addModel, updateModel } = useModel()
defineProps<{
  provider?: ProviderItem
  model?: ModelItem
}>()
const emits = defineEmits<{
  (e: 'success', providerId: string): void
}>()
let dialogType: 'add' | 'edit' = 'add'
// 模型表单参数
const modelForm = reactive<Omit<Model, 'createdAt'>>({
  id: '',
  label: '',
  value: '',
  enabled: 1,
  apiType: 'openAI',
  maxTokens: undefined,
  providerId: '',
  capacity: ['text'],
})
// 模型相关
const submitModel = async () => {
  // 模型名，模型值，enabled,apiType
  if (!modelForm.label || !modelForm.value) {
    console.log('请填写模型名称和模型值')
    return
  }
  console.log('modelForm', modelForm)
  const params = {
    ...modelForm,
    capacity: modelForm.capacity.map((item) => item),
  }
  let res: ApiResult = {} as ApiResult
  if (dialogType === 'add') {
    res = await addModel(params)
  } else if (dialogType === 'edit') {
    res = await updateModel(params)
  }
  if (res.code === 200) {
    console.log('添加成功res', res)
    emits('success', modelForm.providerId)
    closeDialog()
  } else {
    console.log('添加失败res', res)
  }
}
const openModelDialog = () => {
  //   console.log('provider', props.provider)
  //   if (props.provider) {
  //     modelForm.providerId = props.provider?.id || ''
  //   }
}
const onClose = () => {
  // 重置表单
  Object.assign(modelForm, {
    label: '',
    value: '',
    enabled: 1,
    apiType: 'openAI',
    maxTokens: undefined,
    providerId: '',
    capacity: ['text'],
  })
}
interface ModelDialogParam {
  model?: Model
  provider?: Provider
}
const WxDialogRef = useTemplateRef<InstanceType<typeof WxDialog>>('WxDialogRef')
const providerName = ref('')
const openDialog = (type: 'add' | 'edit', param: ModelDialogParam) => {
  // 重置表单
  WxDialogRef.value?.openDialog()
  dialogType = type
  if (type === 'edit') {
    Object.assign(modelForm, param?.model)
  } else if (type === 'add') {
    modelForm.providerId = param.provider?.id || ''
  }
  providerName.value = param.provider?.label || ''
}
const closeDialog = () => {
  // 重置表单
  WxDialogRef.value?.closeDialog()
}
// 请求方式
const apiTypeOptions = [
  { label: 'http', value: 'http' },
  { label: 'openAI', value: 'openAI' },
]
const myValue = ref('')
// 能力分层
const capacityOptions = [
  { label: '文本生成', value: 'text', i18nKey: 'capacityText' },
  { label: '图片理解', value: 'image', i18nKey: 'capacityImage' },
  { label: '视频理解', value: 'video', i18nKey: 'capacityVideo' },
]
defineExpose({
  openDialog,
})
</script>

<template>
  <WxDialog ref="WxDialogRef" v-bind="$attrs" @confirm="submitModel" @open="openModelDialog" @close="onClose">
    <div class="flex flex-col gap-y-2">
      <legend class="text-gray-400 size-base">{{ $t('curProvider') }}：{{ providerName || '' }}</legend>
      <fieldset>
        <div class="flex flex-col gap-2">
          <label for="model-name">{{ $t('modelName') }}</label>
          <input
            id="model-name"
            v-model="modelForm.label"
            class="input-primary-util max-w-[100%]!"
            type="text"
            :placeholder="$t('common.placeholder', { label: $t('modelName') })"
          />
        </div>
        <div class="flex flex-col gap-2"></div>
      </fieldset>
      <fieldset>
        <div class="flex flex-col gap-2">
          <label for="model-value">{{ $t('modelValue') }}</label>
          <input
            id="model-value"
            v-model="modelForm.value"
            class="input-primary-util max-w-[100%]!"
            type="text"
            :placeholder="$t('common.placeholder', { label: $t('modelValue') })"
          />
        </div>
        <div class="flex flex-col gap-2"></div>
      </fieldset>

      <fieldset>
        <div class="flex flex-col gap-2">
          <label for="model-apiType">{{ $t('requestMethod') }}</label>
          <WxSelect id="model-apiType" v-model="modelForm.apiType" class="max-w-[100%]!" :options="apiTypeOptions" />
        </div>
        <div class="flex flex-col gap-2"></div>
      </fieldset>
      <fieldset>
        <div class="flex flex-col gap-2">
          <label for="model-maxTokens">{{ $t('modelMaxTokens') }}</label>
          <NumberFieldRoot id="model-maxTokens" v-model="modelForm.maxTokens" :min="0" :default-value="9999">
            <div
              class="w-38 mt-1 flex items-center border bg-white hover:bg-primary-50 rounded-lg shadow-sm h-9 focus-within:shadow-[0_0_0_2px] focus-within:shadow-stone-800"
            >
              <NumberFieldDecrement class="p-2 disabled:opacity-20">
                <Icon icon="radix-icons:minus" />
              </NumberFieldDecrement>
              <NumberFieldInput class="bg-transparent w-20 tabular-nums text-center focus:outline-0 p-1" />
              <NumberFieldIncrement class="p-2 disabled:opacity-20">
                <Icon icon="radix-icons:plus" />
              </NumberFieldIncrement>
            </div>
          </NumberFieldRoot>
        </div>
        <div class="flex flex-col gap-2"></div>
      </fieldset>

      <fieldset>
        <div class="flex flex-col gap-2">
          <label for="model-enabled">{{ $t('modelEnabled') }}</label>
          <SwitchRoot v-model="modelForm.enabled" :true-value="1" :false-value="0" class="switch-primary">
            <SwitchThumb
              class="w-3.5 h-3.5 my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-full"
            />
          </SwitchRoot>
        </div>
        <div class="flex flex-col gap-2"></div>
      </fieldset>
      <fieldset>
        <div class="flex flex-col gap-2">
          <label for="model-enabled">{{ $t('modelCapacity') }}</label>
          <WxCheckBox v-model="modelForm.capacity" :check-list="capacityOptions"> </WxCheckBox>
        </div>
        <div class="flex flex-col gap-2"></div>
      </fieldset>
    </div>
  </WxDialog>
</template>
