import { ChatCompletionMessageParam } from 'openai/resources/index'

export interface AskModelParam {
  requestId: string
  signal?: AbortSignal
  provider?: { apiKey: string; baseURL: string }
  messages: ChatCompletionMessageParam[]
  model: string
  onData?: (requestId: string, chunk: string) => void
  onError?: (requestId: string, error: string) => void
  onEnd?: (requestId: string) => void
  onAbort?: (requestId: string) => void
}
// electron 的ipcRenderer 函数类型
export interface ElectronIpcApi {
  askModel: (param: AskModelParam) => Promise<any>
  onStreamData: (callback: (event: Event, data: { content: string; requestId: string }) => void) => void
  onStreamAbort: (callback: (event: Event, data: { requestId: string }) => void) => void
  onStreamEnd: (callback: (event: Event, data: { requestId: string }) => void) => void
  onStreamError: (callback: (event: Event, error: { msg: string; requestId: string }) => void) => void
  abortStream: (requestId: string) => void
  openDeleteConfrim: () => Promise<boolean>
  showMessage: (args: any) => void
}
declare global {
  interface Window {
    electronIpcApi: ElectronIpcApi
  }
}
