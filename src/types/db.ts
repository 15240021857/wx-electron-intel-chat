// 对话
export interface Chat {
  id: string
  title: string
  providerId: string
  modelId: string
  //   apiType: 'http' | 'openAI'
  createdAt: Date
  updatedAt: Date
}
// 消息
export interface Message {
  id: string
  // title: string
  chatId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: Date
}
// 提供商
export interface Provider {
  id: string
  label: string
  apiKey: string
  baseURL: string
  enabled: 0 | 1 // 0-禁用，1-启用
  createdAt: Date
  updatedAt: Date
}
// 模型
export interface Model {
  id: string
  providerId: string
  label: string
  value: string
  enabled: 0 | 1 // 0-禁用，1-启用
  apiType: 'http' | 'openAI'
  maxTokens?: number
}
// 偏好设置
export interface Setting {
  id: 'global'
  defaultModelId: string
  defaultProviderId: string
  themeColor: string
  themeMode: 'light' | 'dark' | 'auto'
  language: 'zh-CN' | 'en-US'
  updatedAt: Date
}
