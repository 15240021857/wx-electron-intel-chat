export interface ChatHttpParam {
  messages: any[]
  model?: string
  stream?: boolean
  signal?: AbortSignal | null
  // apiKey: string
  // baseURL: string
  provider: ProviderParam
}
export interface MsgItem {
  id?: string | number
  name?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoning_content?: string
  showReasoning?: boolean
  chatId: string | number
}
// 会话列表项
export interface ChatItem {
  id: string | number
  title: string
  // 供应商
  provide?: string
  providerIcon?: string
  // 模型
  model?: string
  // 模型请求方式
  apiType?: 'http' | 'openAI'
  msgList?: MsgItem[]
  time?: string
}

export interface ModelItem {
  id: number | string
  label: string
  value: string
  apiType: 'http' | 'openAI'
}
export interface Provider {
  id: string | number
  label: string
  apiKey: string
  baseURL: string
  modelList: ModelItem[]
}
// 供应商核心字段
export type ProviderParam = Pick<Provider, 'apiKey' | 'baseURL'>
