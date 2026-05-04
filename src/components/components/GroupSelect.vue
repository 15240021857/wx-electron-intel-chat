<template>
  <div class="w-full flex flex-row justify-center">
    <select class="w-[min(398px,80%)] border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
       :value="chatStore.curChat?.model"
        @change="onchange">
      <option value="" disabled selected>请选择智能体</option>
      <optgroup v-for="item in provideList" :key="item.id" :label="item.label">
        <option v-for="model in item.modelList" :value="model.value" :label="model.label"></option>
      </optgroup>
    </select>
  </div>
</template>

<script lang="ts" setup>
import { useChatStore } from '@/store/useChatStore';
import { ref } from 'vue';
// const curModel = defineModel('curModel', {
//   type: String,
//   default: 'GLM-4.7'
// })
const provideList = ref([
  {
    id: '1',label: '智谱清言',
    modelList: [{ id: '1',label: 'GLM-4.7',value: 'GLM-4.7' }]
  },
  { id: '2', label: '阿里通义千问', 
  modelList: [{id: '1', label: 'qwen-plus',value: 'qwen-plus' }] },
  { id: '3', label: '字节豆包',
    modelList: [{ id: '1',label: 'Doubao-pro',value: 'Doubao-pro' }]
},
  { id: '4', label: '百度文心一言',
    modelList: [{ id: '1',label: 'ERNIE-3.5-8K',value: 'ERNIE-3.5-8K' }]
},
]);
const chatStore = useChatStore();
const onchange = (e:any) => {
  console.log('onchange==', e);
  console.log('onchange==',e.target.value);
  chatStore.curChat && (chatStore.curChat.model = e.target.value);
}
</script>

<style lang='scss' scoped>
</style>