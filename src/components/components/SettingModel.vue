<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import WxSelect from '../wx-reka/WxSelect.vue'
import { Option, Result } from '@/types/settings'
import ManageModel from './ManageModel.vue'
import { useProviderStore } from '@/store/useProviderStore'
// import
const providerStore = useProviderStore()
// 默认模型
const defaultModelId = ref('')
const options = computed<Option[]>(() => {
  return providerStore.enabledProviderList.map((item) => {
    return {
      label: item.label,
      value: item.id,
      children: item.modelList.map((model) => {
        return {
          label: model.label,
          value: model.id,
        }
      }),
    }
  })
})

const onDefaultModelChange = (res: Result) => {
  console.log('defaultModelId==', defaultModelId.value)
  // 这里修改全局设置
  console.log('onDefaultModelChange', res)
}
const getProviderListFun = async () => {
  await providerStore.getEnabledProviderList()
  // options.value =
}
onMounted(() => {
  getProviderListFun()
})
</script>

<template>
  <div class="setting-container">
    <p class="mb-5 !mt-0 text-mauve11 text-sm !leading-normal">您可以设置应用默认模型, 也可以管理您的厂商和模型.</p>
    <fieldset class="mb-[15px] w-full flex flex-row items-center justify-between">
      <label class="text-md leading-none text-green12 block" for="defaultModel"> 默认模型 </label>
      <WxSelect
        id="defaultModel"
        v-model="defaultModelId"
        :options="options"
        placeholder="请选择默认模型"
        @on-change="onDefaultModelChange"
      />
    </fieldset>
    <!-- 管理模型和厂商 -->
    <ManageModel class="w-full" />
    <!-- <div class="flex justify-end mt-5">
      <button
        class="inline-flex items-center justify-center rounded-md px-[15px] text-sm leading-none font-medium h-[35px] bg-green4 text-green11 hover:bg-green5 focus:shadow-[0_0_0_2px] focus:shadow-green7 outline-none cursor-default"
      >
        Change password
      </button>
    </div> -->
  </div>
</template>

<style scoped></style>
