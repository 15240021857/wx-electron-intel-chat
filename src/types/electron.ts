import { ChatCompletionMessageParam } from 'openai/resources/index'

export interface AskModelParam {
  messages: ChatCompletionMessageParam[]
  model: string
}
// electron 的ipcRenderer 函数类型
export interface ElectronIpcApi {
  askModel: (param: AskModelParam) => Promise<any>
  onModelStream: (callback: (chunk: string) => void) => void
}
declare global {
  interface Window {
    electronIpcApi: ElectronIpcApi
  }
}
