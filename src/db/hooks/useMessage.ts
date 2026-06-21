import { ref } from 'vue'
import { db } from '../indexdb'
import type { Chat, Message } from '@/types/db'
import { v4 as uuid } from 'uuid'

export const useMessage = () => {
  const messages = ref<Message[]>([])

  //   获取消息列表
  const getMessages = async () => {
    const list = await db.messages.orderBy('createdAt').toArray()
    console.log('获取消息列表：', list)
    messages.value = list
  }
  const getMessagesByChatId = async (chatId: string): Promise<Message[]> => {
    const list = await db.messages.where('chatId').equals(chatId).sortBy('createdAt')
    console.log('获取消息列表：', list)
    return list
  }
  //   添加用户消息
  const addUserMessage = async (chatId: string, content: string) => {
    try {
      console.log('添加消息：', chatId, content)
      const newMsg: Message = {
        id: uuid(),
        chatId,
        role: 'user',
        content,
        createdAt: new Date(),
      }
      const res = await db.messages.add(newMsg)
      console.log('添加成功：', res)
      return newMsg
    } catch (error) {
      console.error('添加消息失败：', error)
      throw error
    }
  }
  //   添加助理消息
  const addAssistantMessage = async (chatId: string, content: string) => {
    try {
      console.log('添加助理消息：', chatId, content)
      const newMsg: Message = {
        id: uuid(),
        chatId,
        role: 'assistant',
        content,
        createdAt: new Date(),
        reasoning_content: '',
        showReasoning: true,
      }
      const res = await db.messages.add(newMsg)
      console.log('添加成功：', res)
      return newMsg
    } catch (error) {
      console.error('添加消息失败：', error)
      throw error
    }
  }
  //   修改消息
  const updateMessage = async (message: Partial<Message> & { id: string }) => {
    try {
      const res = await db.messages.update(message.id, message)
      console.log('修改成功：', res)
      // 修改当前消息内容
      const curIndex = messages.value.findIndex((item) => item.id === message.id)
      if (curIndex !== -1) {
        messages.value[curIndex].content = message.content || messages.value[curIndex].content
      }
    } catch (error) {
      console.error('修改消息失败：', error)
    }
  }

  //   删除消息
  const deleteMessage = async (id: string) => {
    try {
      console.log('删除消息：', id)
      const res = await db.messages.delete(id)
      console.log('删除成功：', res)
      messages.value = messages.value.filter((item) => item.id !== id)
    } catch (error) {
      console.error('删除消息失败：', error)
    }
  }

  return {
    messages,
    getMessages,
    getMessagesByChatId,
    addUserMessage,
    addAssistantMessage,
    updateMessage,
    deleteMessage,
  }
}
