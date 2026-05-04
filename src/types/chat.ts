export interface ChatParam {
  messages: any[],
  model?: string,
  stream?: boolean
}
export interface MsgItem {
  id?: string | number,
  name?: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  reasoning_content?: string,
  showReasoning?: boolean,
  chatId: string | number,
}
// 会话列表项
export interface ChatItem {
  id: string | number,
  title: string,
  // 供应商
  provide?: string,
  providerIcon?: string,
  // 模型
  model?: string,
  msgList?: MsgItem[],
  time?: string,
}