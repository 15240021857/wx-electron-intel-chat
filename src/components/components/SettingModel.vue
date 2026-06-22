<script setup lang="ts">
import { ref } from 'vue'
import WxSelect from '../wx-reka/WxSelect.vue'
import { Result } from '@/types/settings.js'
import ManageModel from './ManageModel.vue'
const defaultModelId = ref('')

const onDefaultModelChange = (res: Result) => {
  console.log('onDefaultModelChange', res)
}
</script>

<template>
  <div class="setting-container">
    <p class="mb-5 !mt-0 text-mauve11 text-sm !leading-normal">您可以设置应用默认模型, 也可以管理您的厂商和模型.</p>
    <fieldset class="mb-[15px] w-full flex flex-row items-center justify-between">
      <label class="text-md leading-none text-green12 block" for="defaultModel"> 默认模型 </label>
      <WxSelect
        id="defaultModel"
        :my-value="defaultModelId"
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
