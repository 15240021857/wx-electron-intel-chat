// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron'
import { AskModelParam, ElectronIpcApi } from './types/electron'
console.log('I am preload.ts')
// 创建ipc事件监听
const createIpcListener = (channel: string) => {
  return (callback: any) => {
    ipcRenderer.on(channel, callback)
    return () => {
      ipcRenderer.off(channel, callback)
    }
  }
}
// 桥接api
const bridgeApi: ElectronIpcApi = {
  // addCount: (count:number) => ipcRenderer.send('add-count', count)
  // 发起大模型请求：openAI方式
  askModel: async ({ requestId, messages, model, provider }: AskModelParam) => {
    console.log('preload.ts: askModel=============', requestId, messages, model, provider)
    const res = await ipcRenderer.invoke('ask-model', { requestId, messages, model, provider })
    return res
  },
  abortStream: (requestId: string) => ipcRenderer.send('stop-stream', { requestId }),
  // 流式输出data
  onStreamData: createIpcListener('stream-data'),
  // 流式输出主动停止
  onStreamAbort: createIpcListener('stream-abort'),
  // 流式输出
  onStreamEnd: createIpcListener('stream-end'),
  // 流式输出主动停止
  onStreamError: createIpcListener('stream-error'),
  // // 大模型流式返回
  // onModelStream: (callback: any) => {
  //   const onStreamFun = (event: any, chunk: any) => {
  //     return callback(chunk)
  //   }
  //   ipcRenderer.on('on-stream', onStreamFun)
  //   return () => {
  //     ipcRenderer.off('on-stream', onStreamFun)
  //   }
  // },
  openDeleteConfrim: () => ipcRenderer.invoke('open-delete-confirm'),
  // 消息弹窗
  showMessage: (args: any) => ipcRenderer.invoke('show-message', args),
}
// 注册桥接api
contextBridge.exposeInMainWorld('electronIpcApi', bridgeApi)
