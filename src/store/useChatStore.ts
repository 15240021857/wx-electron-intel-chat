import { defineStore } from 'pinia'
import { ChatItem, MsgItem } from '@/types/chat'
import { useMsgStore } from './useMsgStore'
import { useChat } from '@/db/hooks/useChat'

interface ChatStore {
  curChat: ChatItem | null
  chatList: ChatItem[]
}

const { chats, addChat, getChats } = useChat()
export const useChatStore = defineStore('chatStore', {
  state: (): ChatStore => ({
    curChat: null,
    chatList: [],
  }),
  actions: {
    setcurChat(chat: ChatItem) {
      this.curChat = chat
    },
    setChatList(list: ChatItem[]) {
      this.chatList = list
    },
    async refreshChatList() {
      await getChats()
      this.setChatList(chats.value)
      const curChatIndex = this.chatList.findIndex((item) => item.id === this.curChat?.id)
      if (curChatIndex === -1) {
        this.setcurChat(this.chatList[0])
      } else {
        this.setcurChat(this.chatList[curChatIndex])
      }
    },
    async createChat() {
      const chatData = {
        title: '',
        modelId: '',
        providerId: '',
      }
      const curChat: ChatItem = await addChat(chatData)
      this.setChatList([curChat, ...this.chatList])
      this.setcurChat(curChat)
    },
    // 根据聊天id获取消息列表
    getMsgListByChatId(chatId: string | number): MsgItem[] {
      // TODO: 根据chatId获取消息列表
      const msgStore = useMsgStore()
      const msgList = msgStore.getMsgList(chatId)
      return msgList || []
    },
  },
})
