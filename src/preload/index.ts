import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  changeImg() {
    return ipcRenderer.invoke('changeImg')
  },
  downloadWallpaper(value) {
    ipcRenderer.send('downloadWallpaper', value)
  },
  settingWallpaper(value) {
    ipcRenderer.send('settingWallpaper', value)
  },
  // 获取保存路径, 传递给主线程
  getSaveDir() {
    ipcRenderer.send('getSaveDir', localStorage.getItem('saveDir'))
  },
  // 主线程将保存路径传递给渲染线程
  updateSavePath() {
    ipcRenderer.on('updateSavePath', (_event, value) => {
      localStorage.setItem('saveDir', value)
    })
  },
  moveWindow(x, y) {
    ipcRenderer.send('moveWindow', {
      x,
      y
    })
  },
  quit() {
    ipcRenderer.send('quit')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
