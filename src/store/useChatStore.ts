import {defineStore} from 'pinia'
import { ChatItem, MsgItem } from "@/types/chat";
import chatIcon from '@/assets/images/logo-icon-white-bg.png'
import { fmtDate } from '@/utils';
import { useMsgStore } from './useMsgStore';

interface ChatStore {
  curChat: ChatItem | null;
  chatList: ChatItem[];
}

export const useChatStore = defineStore('chatStore', {
  state: (): ChatStore => ({
    curChat: null,
    chatList: []
  }),
  actions: {
    setcurChat(chat: ChatItem) {
      this.curChat = chat;
    },
    setChatList(chatListData: ChatItem[]) {
      this.chatList = chatListData;
    },
    createChat() {
      const newChat:ChatItem = {
        id: Date.now(),
        title: 'New Chat',
        model: '',
        providerIcon: chatIcon,
        time: fmtDate(new Date(), 'yyyy-MM-dd'),
      }
      this.setChatList([newChat, ...this.chatList])
      this.setcurChat(newChat);
      console.log('chatList==', this.chatList);
    },
    // 根据聊天id获取消息列表
    getMsgListByChatId(chatId: string| number): MsgItem[]{
      // TODO: 根据chatId获取消息列表
      const msgStore = useMsgStore()
      const msgList = msgStore.getMsgList(chatId)
      return msgList || []
    }
  }
})
