import { MsgItem } from '@/types/chat'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMsgStore = defineStore('msgStore', () => {
  const msgList = ref<MsgItem[]>([])
  const addMsg = (msg: MsgItem) => {
    msgList.value.push(msg)
    console.log('msgList.value==1', msgList.value)
  }
  const getMsgList = (chatId: string | number) => {
    return msgList.value.filter((item) => item.chatId === chatId)
  }
  return {
    msgList,
    addMsg,
    getMsgList,
  }
})
