import { ref, watchEffect } from 'vue'
import { db } from '../indexdb'
import type { Chat, Provider } from '@/types/db'
import { v4 as uuid } from 'uuid'
import { liveQuery } from 'dexie'
import { useChatStore } from '@/store/useChatStore'
import { ChatItem } from '@/types/chat'
export const useChat = () => {
  const chats = ref<ChatItem[]>([])

  //   获取对话列表
  const getChats = async () => {
    // const chatStore = useChatStore()
    let list: ChatItem[] = []
    list = await db.chats.orderBy('createdAt').reverse().toArray()
    return list
    // watchEffect((onInvalidate) => {
    //   const subscription = liveQuery(async () => {
    //     list = await db.chats.orderBy('createdAt').reverse().toArray()
    //     // 拿到providerId[]
    //     const providerIds = list.map((item) => item.providerId)
    //     const ids = [...new Set(providerIds)]
    //     const providerList = await db.providers.where('id').anyOf(ids).toArray()
    //     // const providerMap = new Map(providerList.map((item) => [item.id, item]))
    //     const providerMap = providerList.reduce(
    //       (acc, cur) => {
    //         acc[cur.id] = cur
    //         return acc
    //       },
    //       {} as Record<string, Provider>
    //     )
    //     const childMap = list.reduce((acc, cur) => {
    //       const curParentChildren = acc[cur.pid] || []
    //       acc[cur.pid] = [...curParentChildren, cur]
    //       return acc
    //     }, {})
    //     list = list.map((item) => {
    //       return {
    //         ...item,
    //         provider: providerMap[item.providerId],
    //         children: childMap[item.id] || null,
    //       } as ChatItem
    //     })
    //     console.log('获取对话列表===：', list)
    //     return list
    //   }).subscribe((list) => {
    //     chats.value = list
    //     console.log('subscribe===：', list)
    //     chatStore.setChatList(list)
    //   })
    //   onInvalidate(() => {
    //     subscription.unsubscribe()
    //   })
    // })
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
      // getChats()
      return curChat
    } catch (error) {
      console.error('添加对话失败：', error)
      throw error
    }
  }
  //   修改对话
  const updateChat = async (chat: Omit<Partial<Chat>, 'children'> & { id: string }) => {
    try {
      const newChatProps: any = {
        ...chat,
        updatedAt: new Date(),
      }
      const res = await db.chats.update(chat.id, newChatProps)
      console.log('修改成功：', res)
      return newChatProps
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
  // 获取子对话列表
  const getChildChatById = async (id: string) => {
    try {
      const res = await db.chats.where('pid').equals(id).toArray()
      // const res = chats.value.find((item) => item.id === id)
      console.log('获取子对话成功：', res)
      return res || null
    } catch (errow) {
      console.error('获取子对话失败：', errow)
      throw errow
    }
  }

  return {
    chats,
    getChats,
    addChat,
    updateChat,
    deleteChat,
    getChatById,
    getChildChatById,
  }
}
