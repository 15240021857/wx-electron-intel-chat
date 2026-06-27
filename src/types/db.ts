// 对话
export interface Chat {
  id: string
  title: string
  providerId: string
  modelId: string
  //   apiType: 'http' | 'openAI'
  // providerIcon?: string
  createdAt: Date
  updatedAt: Date
  pid?: string // 子对话，用于多模型比较
}
// 消息
export interface Message {
  id: string
  // title: string
  chatId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  image_url?: string[] // 视觉理解 - 图片
  video_url?: string[] // 视频理解 - 视频
  createdAt: Date
  reasoning_content?: string
  showReasoning?: boolean
}

export interface CapacityParams {
  image_url?: string[]
  video_url?: string[]
}
// 提供商
export interface Provider {
  id: string
  label: string
  apiKey: string
  baseURL: string
  enabled: 0 | 1 // 0-禁用，1-启用
  providerIcon?: string
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
  createdAt: Date
  capacity: ('text' | 'image' | 'video')[] // 能力
}
// 偏好设置
export interface Setting {
  id: 'global'
  defaultModelId: string
  defaultProviderId: string
  themeColor: string
  themeMode: 'light' | 'dark' | 'system' | ''
  language: 'zh_CN' | 'en' | ''
  updatedAt: Date
}
