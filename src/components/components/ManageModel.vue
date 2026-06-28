<script setup lang="ts">
import { ref, onMounted, useTemplateRef, toRaw } from 'vue'
import { Icon } from '@iconify/vue'
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  SwitchRoot,
  SwitchThumb,
  Label,
} from 'reka-ui'
import { useProvider } from '@/db/hooks/useProvider'
import { useModel } from '@/db/hooks/useModel'
import { ProviderItem } from '@/types/chat'
import { ApiResult } from '../../types/global'
import ModelDialog from './components/ModelDialog.vue'
import { Model } from '@/types/db'
import { useProviderStore } from '@/store/useProviderStore'
import WxUploadAvatar from '@/components/wx-reka/WxUploadAvatar.vue'

const { providers, getProviders, addProvider, updateProvider, deleteProvider, toggleProvider } = useProvider()
const { models, getModels, deleteModel, bulkPutModel, toggleModel } = useModel()
const providerList = ref<ProviderItem[]>([])
const activeId = ref<string>('')
const getProvidersFun = async () => {
  await getProviders()
  await getModelsOfProvider()
  activeId.value = providerList.value[0]?.id
}
// 获取供应商的模型列表
const getModelsOfProvider = async () => {
  await getModels()
  console.log('providers==', providers.value)
  console.log('models==', models.value)
  providerList.value = providers.value.map((item) => {
    const curModelList = models.value
      .filter((model) => model.providerId === item.id)
      .map((model) => {
        return toRaw(model)
      })
    return {
      ...item,
      modelList: [...curModelList],
    }
  })
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
    // 保存修改activeId的厂商
    const curProvider = providerList.value.find((item) => item.id === activeId.value)
    if (curProvider) {
      const { createdAt, updatedAt, modelList, ...ProviderParam } = curProvider
      console.log('修改参数', ProviderParam)
      const res = await updateProvider(ProviderParam)
      if (res.code === 200) {
        console.log('修改成功')
      } else {
        console.log('修改失败')
      }
      //   修改其模型
      console.log('修改其模型', modelList)
      const modelListParams = modelList.map((item) => toRaw(item))
      const bulkPutRes = await bulkPutModel(modelListParams)
      if (bulkPutRes.code === 200) {
        console.log('修改模型成功')
      } else {
        console.log('修改模型失败')
      }
      getProvidersFun()
    }
  }
}
const providerStore = useProviderStore()
// 启用禁用供应商
const toggleProviderFun = async (providerId: string, enabled: 0 | 1) => {
  const curEnabled = enabled === 1 ? 0 : 1
  const res = await toggleProvider(providerId, curEnabled)
  if (res.code === 200) {
    providerStore.getEnabledProviderList()
    console.log('修改成功')
  } else {
    console.log('修改失败')
  }
}
// 处理厂商icon
const handleProviderIconChange = (url: string, provider: any) => {
  const curIndex = providerList.value.findIndex((item) => item.id === provider.id)
  console.log('handleProviderIconChange', url, provider)
  providerList.value[curIndex] = {
    ...provider,
    providerIcon: url,
  }
}
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
// 模型管理
const onModelSuccess = (providerId: string) => {
  console.log('onModelSuccess', providerId)
  //   更新该厂商的模型列表
  getModelsOfProvider()
}
// 打开模型新增/编辑弹窗
const modelDialogRef = useTemplateRef<InstanceType<typeof ModelDialog>>('modelDialogRef')
const modelDialogType = ref<'add' | 'edit'>('add')
interface ModelDialogParam {
  model?: Model
  provider?: ProviderItem
}
const openModelDialog = (type: 'add' | 'edit', param: ModelDialogParam) => {
  modelDialogType.value = type
  if (type === 'edit') {
    modelDialogRef.value?.openDialog(type, param)
  }
  if (type === 'add') {
    modelDialogRef.value?.openDialog(type, param)
  }
}
// 打开删除模型
const openDeleteModel = (id: string) => {
  window.electronIpcApi.openDeleteConfrim().then(async (res: boolean) => {
    if (res) {
      console.log('删除模型', id)
      const res = await deleteModel(id)
      if (res.code === 200) {
        console.log('删除成功')
        getProvidersFun()
      } else {
        console.log('删除失败')
      }
    }
  })
}

// 启用禁用供应商
const toggleModelFun = async (modelId: string, enabled: 0 | 1) => {
  const curEnabled = enabled === 1 ? 0 : 1
  const res = await toggleModel(modelId, curEnabled)
  if (res.code === 200) {
    providerStore.getEnabledProviderList()
    console.log('修改成功')
  } else {
    console.log('修改失败')
  }
}
onMounted(() => {
  getProvidersFun()
})
</script>

<template>
  <div class="manage-model">
    <div class="h-[30px] mb-2 flex flex-row justify-between items-center">
      <span class="text-base/8">{{ $t('modelManage') }}</span>
      <div>
        <button class="btn-primary" @click="openAddProvider">{{ $t('providerAdd') }}</button>
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
                <!-- 删除 -->
                <Icon
                  v-if="!isAdding"
                  icon="ant-design:delete-twotone"
                  class="text-gray-600 hover:text-gray-800 active:text-gray-400 select-none cursor-pointer"
                  width="26"
                  height="26"
                  @click="openDeleteProvider(item.id)"
                />
                <!-- 开关 -->
                <SwitchRoot
                  id="airplane-mode"
                  v-model="item.enabled"
                  :true-value="1"
                  :false-value="0"
                  class="switch-primary ml-1"
                  @click="toggleProviderFun(item.id, item.enabled)"
                >
                  <SwitchThumb
                    class="w-3.5 h-3.5 my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-full"
                  />
                </SwitchRoot>
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
                <input id="apiKey" v-model="item.apiKey" class="input-black-util" type="text" />
              </fieldset>

              <fieldset class="flex flex-row items-center justify-between">
                <Label class="text-sm font-semibold leading-[35px] text-stone-700 dark:text-white" for="baseURL">
                  baseURL
                </Label>
                <input id="baseURL" v-model="item.baseURL" class="input-black-util" type="text" />
              </fieldset>
              <!-- 头像上传 -->
              <fieldset class="flex flex-row items-center justify-between">
                <Label class="text-sm font-semibold leading-[35px] text-stone-700 dark:text-white" for="providerIcon">
                  {{ $t('providerIcon') }}
                </Label>
                <WxUploadAvatar
                  :default-url="item?.providerIcon"
                  @change="(url) => handleProviderIconChange(url, item)"
                />
              </fieldset>
              <!-- <fieldset class="flex flex-row items-center justify-between">
                <Label class="text-sm font-semibold leading-[35px] text-stone-700 dark:text-white" for="testConnect">
                  连接性测试
                </Label>
                <button id="testConnect" class="btn-blank-primary-small">测试</button>
              </fieldset> -->
              <!-- 厂商下的模型 -->
              <section v-if="!isAdding" class="flex flex-col gap-y-2">
                <div class="flex flex-row items-center justify-between">
                  <Label class="text-sm font-semibold leading-[35px] text-stone-700 dark:text-white" for="apiKey">
                    {{ $t('modelList') }}
                  </Label>
                  <div>
                    <!-- 新增模型 -->
                    <Icon
                      icon="ant-design:plus-circle-twotone"
                      class="text-gray-600 hover:text-gray-800 active:text-gray-400 select-none cursor-pointer"
                      width="26"
                      height="26"
                      @click="openModelDialog('add', { provider: item })"
                    />
                  </div>
                </div>
                <div class="flex flex-col gap-y-2">
                  <template v-if="item.modelList?.length > 0">
                    <div
                      v-for="model in item.modelList"
                      :key="model.id"
                      class="flex flex-row justify-between items-center border-b border-dashed border-color-gray-200 py-1"
                    >
                      <span>{{ model.label }}</span>
                      <div class="flex flex-row items-center justify-end gap-x-[10px]">
                        <Icon
                          icon="ant-design:edit-twotone"
                          class="text-gray-600 hover:text-gray-800 active:text-gray-400 select-none cursor-pointer"
                          width="26"
                          height="26"
                          @click="openModelDialog('edit', { model: model, provider: item })"
                        />
                        <Icon
                          icon="ant-design:delete-twotone"
                          class="text-gray-600 hover:text-gray-800 active:text-gray-400 select-none cursor-pointer"
                          width="26"
                          height="26"
                          @click="openDeleteModel(model?.id)"
                        />
                        <SwitchRoot
                          id="airplane-mode"
                          v-model="model.enabled"
                          :true-value="1"
                          :false-value="0"
                          class="switch-primary ml-1"
                          @click="toggleModelFun(model.id, model.enabled)"
                        >
                          <SwitchThumb
                            class="w-3.5 h-3.5 my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-full"
                          />
                        </SwitchRoot>
                      </div>
                    </div>
                  </template>
                  <span v-else class="flex flex-row items-center justify-center py-2">{{ $t('modelEmpty') }}</span>
                </div>
              </section>
              <div class="flex flex-row justify-between items-center gap-x-2">
                <button class="btn-blank-primary text-sm!" @click="saveProvider">{{ $t('saveSetting') }}</button>
                <button
                  v-if="isAdding"
                  class="btn-blank-primary text-sm! text-stone-500! border-stone-500!"
                  @click="cancelAdd"
                >
                  {{ $t('cancel') }}
                </button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </template>
    </AccordionRoot>
    <ModelDialog
      ref="modelDialogRef"
      :show-btn="false"
      :dialog-title="modelDialogType === 'add' ? $t('modelAdd') : $t('modelEdit')"
      @success="onModelSuccess"
    ></ModelDialog>
  </div>
</template>

<style scoped></style>
