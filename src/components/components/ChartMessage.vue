<template>
  <div ref="contentRef" class="w-full pr-50px h-full overflow-y-auto px-5" @scroll="onScroll">
    <div v-for="item in msgList" :key="item.id" class="">
      <!-- 用户消息 -->
      <div v-if="item.role === 'user'" class="flex justify-end items-center mt-[16px] pl-[45px]">
        <div class="bg-[#F0F0F0] rounded-[8px] p-[8px]" v-text="item.content"></div>
        <Icon
          icon="ant-design:user-outlined"
          class="bg-[#F0F0F0] rounded-full p-[8px] ml-[8px] text-sky-600"
          width="36"
          height="36"
        />
      </div>
      <!-- 助理消息 -->
      <div
        v-if="item.role === 'assistant'"
        class="w-full flex flex-row justify-start items-start mt-[16px] rounded-[8px] p-[8px]"
      >
        <img class="w-[32px] h-[32px] rounded-full" src="@/assets/images/logo-icon-white-bg.png" alt="" />
        <!-- <div v-show="!(item.reasoning_content || item.content)"> -->
        <!-- 请求加载中 -->
        <div v-show="requestLoading" class="h-[32px] flex items-center ml-[5px]">
          <Icon icon="svg-spinners:3-dots-scale" width="24" height="24" />
        </div>
        <!-- 输出内容 -->
        <div
          class="w-full break-words leading-relaxed rounded-[8px] px-[8px] [&_h1]:text-2xl [&_h1]:font-bold [&_p]:my-2 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-gray-800 [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-lg [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:bg-blue-50 [&_blockquote]:p-3 [&_ul]:pl-6 [&_ul]:my-3 [&_ul]:list-disc [&_ul_ul]:list-circle [&_li]:my-1.5 [&_li]:pl-1 [&_ol]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol_ol]:list-lower-alpha [&_table]:w-full [&_table]:border-collapse [&_table]:whitespace-normal [&_th,&_td]:border [&_th,&_td]:border-gray-300 [&_th,&_td]:px-3 [&_th,&_td]:py-2 [&_th]:bg-gray-100"
        >
          <div v-show="item.reasoning_content" class="w-full bg-[#f5f5f5] px-4 py-1">
            <!-- 思考过程 -->
            <div @click="toggleThinkProcess(item)">
              <p class="flex flex-row items-center">
                思考过程：
                <Icon
                  icon="ant-design:up-outlined"
                  width="18"
                  height="18"
                  :style="{ transform: item.showReasoning ? '' : 'rotate(180deg)' }"
                />
              </p>
              <div v-show="item.showReasoning" v-html="fmtContentFun(item.reasoning_content)"></div>
            </div>
          </div>
          <!-- 助理回答主内容 -->
          <div v-html="fmtContentFun(item.content)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, useTemplateRef, watch } from 'vue'
import { marked } from 'marked'
import { Icon } from '@iconify/vue'
import { useChatStore } from '@/store/useChatStore'
import { MsgItem } from '@/types/chat'

const props = withDefaults(
  defineProps<{
    msgList: any[]
    requestLoading?: boolean // 请求加载中
    outLoading?: boolean // 流式输出中
  }>(),
  {
    msgList: () => [],
    requestLoading: false,
    outLoading: false,
  }
)
const fmtContentFun = (content: string) => {
  return marked.parse(content, {
    gfm: true,
  })
}
// 滚动贴底
const contentRef = useTemplateRef<HTMLDivElement>('contentRef')
const scrollToBottom = () => {
  if (contentRef.value && isScrollTopBottomFlag.value) {
    contentRef.value.scrollTop = contentRef.value.scrollHeight
  }
}
// 滚轮控制贴底
const isScrollTopBottomFlag = ref(true)
const onScroll = () => {
  const curScroll = contentRef.value?.scrollTop || 0
  const scrollHeight = contentRef.value?.scrollHeight || 0
  const clientHeight = contentRef.value?.clientHeight || 0
  if (curScroll + clientHeight + 55 >= scrollHeight) {
    isScrollTopBottomFlag.value = true
  } else {
    isScrollTopBottomFlag.value = false
  }
}
// 展示思考过程
const showProcess = ref(true)
const toggleThinkProcess = (item: MsgItem) => {
  item.showReasoning = !item.showReasoning
}
const chatStore = useChatStore()
watch(
  () => chatStore.curChat?.id,
  () => {
    nextTick(() => {
      contentRef.value?.scrollTo(0, contentRef.value.scrollHeight)
    })
  }
)

defineExpose({
  scrollToBottom,
})
</script>

<style lang="scss" scoped></style>
