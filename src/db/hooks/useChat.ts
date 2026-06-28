import { ref } from 'vue'
import { db } from '../indexdb'
import type { Chat } from '@/types/db'
import { v4 as uuid } from 'uuid'
import chatIcon from '@/assets/images/tdesign--logo-android.png'
import { useProvider } from './useProvider'
const { providers, getProviders } = useProvider()
export const useChat = () => {
  const chats = ref<Chat[]>([])

  //   获取对话列表
  const getChats = async () => {
    const list = await db.chats.orderBy('createdAt').reverse().toArray()
    await getProviders()
    chats.value = await Promise.all(
      list.map(async (item) => {
        const curProvider = providers.value.find((provider) => item.providerId === provider.id)
        return {
          ...item,
          providerIcon: curProvider?.providerIcon || chatIcon,
        } as Chat
      })
    )
    console.log('获取对话列表===：', list)
  }
  //   添加对话
  const addChat = async (chat: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>): Promise<Chat> => {
    try {
      console.log('添加对话：', chat)
      const curChat = {
        id: uuid(),
        ...chat,
        title: chat.title || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const res = await db.chats.add(curChat)
      console.log('添加成功：', res)
      getChats()
      return curChat
    } catch (error) {
      console.error('添加对话失败：', error)
      throw error
    }
  }
  //   修改对话
  const updateChat = async (chat: Partial<Chat> & { id: string }) => {
    try {
      const newChatProps = {
        ...chat,
        updatedAt: new Date(),
      }
      const res = await db.chats.update(chat.id, newChatProps)
      console.log('修改成功：', res)
      await getChats()
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
  // 根据id获取chat
  const getChatById = async (id: string) => {
    try {
      console.log('根据id获取chat：', id)
      const res = await db.chats.get(id)
      console.log('获取成功：', res)
      return res
    } catch (error) {
      console.error('获取chat失败：', error)
      throw error
    }
  }

  return {
    chats,
    getChats,
    addChat,
    updateChat,
    deleteChat,
    getChatById,
  }
}
