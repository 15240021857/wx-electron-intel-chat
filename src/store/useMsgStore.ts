import { useMessage } from '@/db/hooks/useMessage'
import { MsgItem, SendMsgParams } from '@/types/chat'
import { Message } from '@/types/db'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const { getMessages, getMessagesByChatId, addUserMessage, addAssistantMessage, updateMessage, deleteMessage } =
  useMessage()
export const useMsgStore = defineStore('msgStore', () => {
  const msgList = ref<MsgItem[]>([])

  // 查
  const getMsgList = async () => {
    const list = await getMessages()
    msgList.value = list || []
  }

  // 增用户消息
  const addUserMessageFun = async (chatId: string, msgParams: SendMsgParams) => {
    const newMsg = await addUserMessage(chatId, msgParams)
    msgList.value.push(newMsg)
    return newMsg
  }
  // 增助理消息
  const addAssistantMessageFun = async (chatId: string, content: string) => {
    const newMsg = await addAssistantMessage(chatId, content)
    msgList.value.push(newMsg)
    return newMsg
  }
  // 改
  const updateMessageFun = async (message: Partial<Message> & { id: string }) => {
    const res = await updateMessage(message)
    if (res.code === 200) {
      const index = msgList.value.findIndex((item) => item.id === message.id)
      if (index > -1) {
        msgList.value.splice(index, 1, {
          ...msgList.value[index],
          ...message,
        })
      }
    }
  }
  // 删
  const deleteMessageFun = async (id: string) => {
    await deleteMessage(id)
    msgList.value = msgList.value.filter((item) => item.id !== id)
  }
  // 根据chatId获取消息列表
  const getMsgListByChatIdFun = async (chatId: string) => {
    return getMessagesByChatId(chatId)
  }
  return {
    msgList,
    getMsgList,
    addUserMessageFun,
    addAssistantMessageFun,
    updateMessageFun,
    deleteMessageFun,
    getMsgListByChatIdFun,
  }
})
