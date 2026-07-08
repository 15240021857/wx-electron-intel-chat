import { defineStore } from 'pinia'
import { useChat } from '@/db/hooks/useChat'
import { computed, ref } from 'vue'
import { Chat } from '@/types/db'

const { addChat, getChats, updateChat, deleteChat, getChildChatById } = useChat()
export const useChatStore = defineStore('chatStore', () => {
  const chatList = ref<Chat[]>([])
  // 找到父对话,不要子对话
  const parentChats = computed(() => {
    return chatList.value.filter((item) => !item.pid)
  })
  // 获取对话列表
  const getChatList = async () => {
    const list = await getChats()
    chatList.value = list
  }
  // 当前对话
  const curChat = ref<Chat | null>(null)
  const setCurChat = (chat: Chat | null) => {
    curChat.value = chat
  }
  // 创建对话
  const createChat = async (params?: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { title, modelId, providerId, pid } = params || {}
    const chatData = {
      title: title || '',
      modelId: modelId || '',
      providerId: providerId || '',
      pid: pid || '',
    }
    const newChat = await addChat(chatData)

    if (!pid) {
      // 创建子对话时，不用切换当前对话
      chatList.value = [newChat, ...chatList.value]
      curChat.value = newChat
    } else {
      chatList.value = [newChat, ...chatList.value]
    }
  }
  // 修改对话
  const updateChatFun = async (chat: Omit<Partial<Chat>, 'children'> & { id: string }) => {
    const newChat = await updateChat(chat)
    const index = chatList.value.findIndex((item) => item.id === newChat.id)
    if (index !== -1) {
      // chatList.value[index] = {
      //   ...chatList.value[index],
      //   ...newChat,
      // }
      chatList.value.splice(index, 1, {
        ...chatList.value[index],
        ...newChat,
      })
    }
  }

  // 删除对话
  const deleteChatFun = async (chatId: string) => {
    await deleteChat(chatId)
    // 删除所有子对话
    // const childChats = await getChildChatById(chatId)
    // if (childChats) {
    //   childChats.forEach((item) => {
    //     deleteChat(item.id)
    //   })
    // }
    // 删除对话的所有消息
    // 删除所有子对话的所有消息
    chatList.value = chatList.value.filter((item) => item.id !== chatId)
    if (curChat.value?.id === chatId) {
      setCurChat(parentChats.value[0] || null)
    }
  }

  // 根据pid获取子对话
  const getChildChatByIdFun = async (pid: string) => {
    const list = await getChildChatById(pid)
    return list || null
  }

  return {
    curChat,
    chatList,
    parentChats,
    setCurChat,
    getChatList,
    createChat,
    updateChatFun,
    deleteChatFun,
    getChildChatByIdFun,
  }
})

// const oldCode = {
//   state: (): ChatStore => ({
//     curChat: null,
//     chatList: [],
//   }),
//   actions: {
//     setcurChat(chat: ChatItem) {
//       this.curChat = chat
//     },
//     setChatList(list: ChatItem[]) {
//       this.chatList = list
//     },
//     async createChat(params?: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>) {
//       const { title, modelId, providerId, pid } = params || {}
//       const chatData = {
//         title: title || '',
//         modelId: modelId || '',
//         providerId: providerId || '',
//         pid: pid || '',
//       }
//       const curChat: ChatItem = await addChat(chatData)
//       // this.setChatList([curChat, ...this.chatList])

//       if (!pid) {
//         // 创建子对话时，不用切换当前对话
//         this.setcurChat(curChat)
//       }
//     },
//   },
// }
