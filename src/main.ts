import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import started from 'electron-squirrel-startup'
import BigModel from './electron/main/bigModel'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  ipcMain.on('add-count', (event, arg) => {
    console.log('ipcMain: cur-count==', arg) // prints "pong"
  })
  createWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// 通信
// 请求Id和取消map映射
const requestIdMap = new Map<string, AbortController>()
// 问大模型
ipcMain.handle('ask-model', async (event, { requestId, messages, model, provider }) => {
  console.log('ipcMain: askModel==')
  // 创建大模型实例
  const bigModel = new BigModel()
  const abortController = new AbortController()
  requestIdMap.set(requestId, abortController)
  await bigModel.askModelStream({
    requestId: requestId,
    signal: abortController.signal,
    messages,
    model,
    provider,
    onData(requestId, chunk) {
      console.log('chunk===', chunk)
      event.sender.send('stream-data', { content: chunk, requestId })
    },
    onEnd(requestId) {
      event.sender.send('stream-end', { requestId })
      requestIdMap.delete(requestId)
    },
    onAbort(requestId) {
      event.sender.send('stream-abort', { requestId })
      requestIdMap.delete(requestId)
    },
    onError(requestId, errorMsg) {
      event.sender.send('stream-error', { msg: errorMsg, requestId })
      requestIdMap.delete(requestId)
    },
  })
})
// 停止流式输出，节省tokens
ipcMain.on('stop-stream', (event, arg) => {
  const { requestId } = arg
  const curAbortController = requestIdMap.get(requestId)
  curAbortController?.abort()
  requestIdMap.delete(requestId)
})
// 打开删除确认框
ipcMain.handle('open-delete-confirm', async (event, arg) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win || win.isDestroyed()) {
    return
  }
  const res = await dialog.showMessageBox(win, {
    type: 'info', // 图标：none/info/warning/error/question
    title: '小吴智能助手',
    message: '是否确实要删除当前条目？',
    detail: '删除后数据将永久丢失，无法找回！',
    buttons: ['确认删除', '取消'], // 按钮顺序
    defaultId: 0, // 默认选中取消按钮
    cancelId: 1,
    noLink: true,
    // checkboxChecked: false,
    // checkboxLabel: '不再询问',
  })
  // response 是点击按钮的索引：0=取消，1=确认删除
  return res.response === 0
})
// 前端消息弹窗
ipcMain.handle('show-message', (event, arg) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win || win.isDestroyed()) {
    return
  }
  const { type = 'info', message, title = '提示' } = arg
  dialog.showMessageBox(win, {
    type, // 图标：none/info/warning/error/question
    title,
    message,
    buttons: ['确定'], // 按钮顺序
    defaultId: 0, // 默认选中取消按钮
    cancelId: 0,
  })
})
