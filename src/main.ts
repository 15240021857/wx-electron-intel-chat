import { app, BrowserWindow, ipcMain } from 'electron'
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

// 创建大模型实例
const bigModel = new BigModel()
// 通信
// 问大模型
ipcMain.handle('ask-model', async (event, { messages, model, provider }) => {
  console.log('ipcMain: askModel==')
  await bigModel.askModelStream({
    messages,
    model,
    provider,
    onData(chunk) {
      console.log('chunk===', chunk)

      event.sender.send('stream-data', chunk)
    },
    onEnd() {
      event.sender.send('stream-end')
    },
    onAbort() {
      event.sender.send('stream-abort')
    },
    onError(message) {
      event.sender.send('stream-error', message)
    },
  })
})
// 停止流式输出，节省tokens
ipcMain.on('stop-stream', (event, arg) => {
  bigModel.stopStream()
})
