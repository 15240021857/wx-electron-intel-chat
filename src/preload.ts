// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron'
import { AskModelParam, ElectronIpcApi } from './types/electron'
console.log('I am preload.ts')

// 桥接api
const bridgeApi: ElectronIpcApi = {
  // addCount: (count:number) => ipcRenderer.send('add-count', count)
  askModel: async ({ messages, model }: AskModelParam) => {
    const res = await ipcRenderer.invoke('ask-model', { messages, model })
    return res
  },
  // 大模型流式返回
  onModelStream: (callback: any) => {
    const onStreamFun = (event: any, chunk: any) => {
      return callback(chunk)
    }
    ipcRenderer.on('on-stream', onStreamFun)
    return () => {
      ipcRenderer.off('on-stream', onStreamFun)
    }
  },
}
// 注册桥接api
contextBridge.exposeInMainWorld('electronIpcApi', bridgeApi)
