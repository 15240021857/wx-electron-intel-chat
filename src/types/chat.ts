import { Provider, Model, Message, Chat } from './db'
export interface ChatHttpParam {
  messages: any[]
  model?: string
  stream?: boolean
  signal?: AbortSignal | null
  // apiKey: string
  // baseURL: string
  provider: ProviderParam
}
// 前台的消息
export type MsgItem = Message
// 会话列表项
export type ChatItem = Chat

export interface ModelItem {
  id: number | string
  label: string
  value: string
  apiType: 'http' | 'openAI'
}
// 厂商 带模型列表
export type ProviderItem = Provider & {
  modelList: Model[]
}
// 供应商核心字段
export type ProviderParam = Pick<ProviderItem, 'id' | 'apiKey' | 'baseURL'>
