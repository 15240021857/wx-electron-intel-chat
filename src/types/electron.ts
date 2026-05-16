import { ChatCompletionMessageParam } from 'openai/resources/index'

export interface AskModelParam {
  provider?: { apiKey: string; baseURL: string }
  messages: ChatCompletionMessageParam[]
  model: string
  onData?: (chunk: string) => void
  onError?: (error: string) => void
  onEnd?: () => void
  onAbort?: () => void
}
// electron 的ipcRenderer 函数类型
export interface ElectronIpcApi {
  askModel: (param: AskModelParam) => Promise<any>
  onStreamData: (callback: (chunk: any, data: any) => void) => void
  onStreamAbort: (callback: () => void) => void
  onStreamEnd: (callback: () => void) => void
  onStreamError: (callback: (msg: string) => void) => void
  abortStream: () => void
}
declare global {
  interface Window {
    electronIpcApi: ElectronIpcApi
  }
}
