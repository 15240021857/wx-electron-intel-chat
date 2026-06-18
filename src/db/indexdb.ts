import type { Chat, Message, Provider, Model, Setting } from '@/types/db'
import { Dexie } from 'dexie'

// 初始化IndexDB数据库
export class ChatDB extends Dexie {
  chats!: Dexie.Table<Chat, string>
  messages!: Dexie.Table<Message, string>
  providers!: Dexie.Table<Provider, string>
  models!: Dexie.Table<Model, string>
  settings!: Dexie.Table<Setting, string>

  constructor() {
    // 数据库名称
    super('ai-chat-db')
    // 数据库版本与表 及其索引
    this.version(1).stores({
      chats: 'id, title, providerId, modelId, updatedAt',
      messages: 'id, chatId, content, role, createdAt',
      providers: 'id, enabled, createdAt',
      models: 'id, providerId, [providerId+enabled], enabled',
      settings: 'id',
    })
  }
}

export const db = new ChatDB()
