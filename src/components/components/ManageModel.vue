<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  SwitchRoot,
  SwitchThumb,
} from 'reka-ui'

import { useProvider } from '@/db/hooks/useProvider'

import { useModel } from '@/db/hooks/useModel'
import { ProviderItem } from '@/types/chat'
import { ApiResult } from '../../types/global'
const { providers, getProviders, addProvider, updateProvider, deleteProvider } = useProvider()
const { models, getModels } = useModel()
const providerList = ref<ProviderItem[]>([])
const activeId = ref<string>('')
const getProvidersFun = async () => {
  await getProviders()
  await getModels()
  console.log('providers==', providers.value)
  console.log('models==', models.value)
  providerList.value = providers.value.map((item) => {
    return {
      ...item,
      modelList: models.value.filter((model) => model.providerId === item.id),
    }
  })
  activeId.value = providerList.value[0].id
}
// 是否新增
const isAdding = ref(false)
const idEdit = ref(false)
// 新增临时供应商
const openAddProvider = () => {
  const curTempId = 'newId' + Date.now()
  const newProvider: ProviderItem = {
    id: curTempId,
    label: '',
    apiKey: '',
    baseURL: '',
    enabled: 1, // 0-禁用，1-启用
    createdAt: new Date(),
    updatedAt: new Date(),
    providerIcon: '',
    modelList: [],
  }
  providerList.value.unshift(newProvider)
  isAdding.value = true
  idEdit.value = true
  activeId.value = curTempId
}
// 关闭新增模式
const cancelAdd = () => {
  isAdding.value = false
  idEdit.value = false
  providerList.value.shift()
}
// 处理供应商手风琴展开
const handleExpand = (e: Event) => {
  if (isAdding.value) {
    e.preventDefault()
    // 这里要用electron弹窗提示
    activeId.value = providerList.value[0].id
    return
  }
}
// 保存供应商修改
const saveProvider = async () => {
  console.log('保存厂商')
  if (isAdding.value) {
    // 保存新增
    const { id, createdAt, updatedAt, modelList, ...newProvider } = providerList.value[0]
    const res: ApiResult = await addProvider(newProvider)
    if (res.code === 200) {
      console.log('新增成功')
      cancelAdd()
      getProvidersFun()
    } else {
      console.log('新增失败')
    }
  } else {
    // 保存修改
    const curProvider = providerList.value.find((item) => item.id === activeId.value)
    if (curProvider) {
      const { createdAt, updatedAt, modelList, ...ProviderParam } = curProvider
      console.log('修改参数', ProviderParam)
      const res = await updateProvider(ProviderParam)
      if (res.code === 200) {
        console.log('修改成功')
        getProvidersFun()
      } else {
        console.log('修改失败')
      }
    }
  }
}
// const { ElectronIpcApi } = window as any
// 打开删除弹窗
const openDeleteProvider = (id: string) => {
  window.electronIpcApi.openDeleteConfrim().then((res: boolean) => {
    if (res) {
      console.log('删除厂商', id)
      deleteProviderFun(id)
    }
  })
}
const deleteProviderFun = async (id: string) => {
  console.log('删除厂商', id)
  const res = await deleteProvider(id)
  if (res.code === 200) {
    console.log('删除成功')
    getProvidersFun()
  } else {
    console.log('删除失败')
  }
}
onMounted(() => {
  getProvidersFun()
})
</script>

<template>
  <div class="manage-model">
    <div class="h-[30px] mb-2 flex flex-row justify-between items-center">
      <span class="text-base/8">模型管理</span>
      <div>
        <button class="btn-primary" @click="openAddProvider">新增厂商</button>
      </div>
    </div>
    <AccordionRoot
      v-model="activeId"
      class="bg-mauve6 w-full rounded-lg shadow-[0_2px_10px] shadow-black/5 border"
      :default-value="providerList?.length > 0 ? providerList[0].id : undefined"
      type="single"
      :collapsible="true"
    >
      <template v-for="item in providerList" :key="item.id">
        <AccordionItem
          class="focus-within:shadow-mauve12 mt-px overflow-hidden first:mt-0 first:rounded-t-[7px] last:rounded-b-[7px] focus-within:relative focus-within:z-10 focus-within:shadow-[0_0_0_2px]"
          :value="item.id"
        >
          <AccordionHeader class="flex bg-white hover:bg-mauve2">
            <div
              class="w-full flex flex-row justify-between items-center px-3 shadow-mauve6 shadow-[0_1px_0] outline-none"
            >
              <div>
                <!-- 若是新增模型，请先填写厂商信息 -->
                <span v-if="!isAdding && !idEdit">{{ item.label }}</span>
                <input
                  v-else
                  v-model="item.label"
                  class="outline-none w-full h-full"
                  type="text"
                  placeholder="请输入厂商名称"
                />
              </div>
              <div class="flex flex-row items-center justify-end gap-x-2">
                <!-- 开关 -->
                <SwitchRoot
                  id="airplane-mode"
                  v-model="item.enabled"
                  :true-value="1"
                  :false-value="0"
                  class="switch-primary"
                >
                  <SwitchThumb
                    class="w-3.5 h-3.5 my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-full"
                  />
                </SwitchRoot>
                <!-- 删除 -->
                <Icon
                  v-if="!isAdding"
                  icon="ant-design:delete-outlined"
                  class="text-gray-600 hover:text-gray-800 active:text-gray-400 select-none cursor-pointer"
                  width="26"
                  height="26"
                  @click="openDeleteProvider(item.id)"
                />
              </div>
            </div>
            <AccordionTrigger
              class="cursor-pointer text-grass11 shadow-mauve6 hover:bg-mauve2 flex h-[45px] flex-1 cursor-default items-center justify-between bg-white px-5 text-sm leading-none shadow-[0_1px_0] outline-none group"
              @click="handleExpand"
            >
              <Icon
                icon="radix-icons:chevron-down"
                class="text-green10 ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180"
                aria-label="Expand/Collapse"
              />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent
            class="text-mauve11 bg-mauve2 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden text-sm"
          >
            <div class="px-5 py-4 flex flex-col gap-y-2">
              <fieldset class="flex flex-row items-center justify-between">
                <Label class="text-sm font-semibold leading-[35px] text-stone-700 dark:text-white" for="apiKey">
                  apiKey
                </Label>
                <input
                  id="apiKey"
                  v-model="item.apiKey"
                  class="bg-white border inline-flex h-[35px] w-full max-w-[300px] appearance-none items-center justify-center rounded-lg px-[10px] text-sm leading-none shadow-sm outline-none focus:shadow-[0_0_0_2px_black] selection:color-white selection:bg-blackA9"
                  type="text"
                />
              </fieldset>

              <fieldset class="flex flex-row items-center justify-between">
                <Label class="text-sm font-semibold leading-[35px] text-stone-700 dark:text-white" for="baseURL">
                  baseURL
                </Label>
                <input
                  id="baseURL"
                  v-model="item.baseURL"
                  class="bg-white border inline-flex h-[35px] w-full max-w-[300px] appearance-none items-center justify-center rounded-lg px-[10px] text-sm leading-none shadow-sm outline-none focus:shadow-[0_0_0_2px_black] selection:color-white selection:bg-blackA9"
                  type="text"
                />
              </fieldset>
              <fieldset class="flex flex-row items-center justify-between">
                <Label class="text-sm font-semibold leading-[35px] text-stone-700 dark:text-white" for="testConnect">
                  连接性测试
                </Label>
                <button id="testConnect" class="btn-primary">测试</button>
              </fieldset>
              <section class="flex flex-col gap-y-2">
                <div class="flex flex-row items-center justify-between">
                  <Label class="text-sm font-semibold leading-[35px] text-stone-700 dark:text-white" for="apiKey">
                    模型列表
                  </Label>
                </div>
                <div class="flex flex-col gap-y-2">
                  <template v-for="model in item.modelList" :key="model.id">
                    <div
                      class="flex flex-row justify-between items-center border-b border-dashed border-color-gray-200 py-1"
                    >
                      <span>{{ model.label }}</span>
                      <SwitchRoot
                        id="airplane-mode"
                        v-model="model.enabled"
                        :true-value="1"
                        :false-value="0"
                        class="switch-primary"
                      >
                        <SwitchThumb
                          class="w-3.5 h-3.5 my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-full"
                        />
                      </SwitchRoot>
                    </div>
                  </template>
                </div>
              </section>
              <div class="flex flex-row justify-between items-center gap-x-2">
                <button class="btn-blank-primary text-sm!" @click="saveProvider">保存设置</button>
                <button
                  v-if="isAdding"
                  class="btn-blank-primary text-sm! text-stone-500! border-stone-500!"
                  @click="cancelAdd"
                >
                  取消
                </button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </template>
    </AccordionRoot>
  </div>
</template>

<style scoped></style>
