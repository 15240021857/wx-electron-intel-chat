import { ref } from 'vue'
import { db } from '../indexdb'
import type { Chat } from '@/types/db'
import { v4 as uuid } from 'uuid'

export const useChat = () => {
  const chats = ref<Chat[]>([])

  //   获取对话列表
  const getChats = async () => {
    const list = await db.chats.toArray()
    console.log('获取对话列表：', list)
    chats.value = list
  }
  //   添加对话
  const addChat = async (chat: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('添加对话：', chat)
      const res = await db.chats.add({
        id: uuid(),
        ...chat,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log('添加成功：', res)
      getChats()
    } catch (error) {
      console.error('添加对话失败：', error)
    }
  }
  //   修改对话
  const updateChat = async (chat: Partial<Chat> & { id: string }) => {
    try {
      console.log('修改对话：', chat)
      const res = await db.chats.update(chat.id, {
        ...chat,
        updatedAt: new Date(),
      })
      console.log('修改成功：', res)
      getChats()
    } catch (error) {
      console.error('修改对话失败：', error)
    }
  }

  //   删除对话
  const deleteChat = async (id: string) => {
    try {
      console.log('删除对话：', id)
      const res = await db.chats.delete(id)
      console.log('删除成功：', res)
      getChats()
    } catch (error) {
      console.error('删除对话失败：', error)
    }
  }

  return {
    chats,
    getChats,
    addChat,
    updateChat,
    deleteChat,
  }
}
