import { BrowserWindow, dialog, ipcMain, screen } from 'electron'
import axios from 'axios'
import { cacheData, updateCacheData } from './cache'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { exec } = require('child_process')

ipcMain.handle('changeImg', async () => {
  try {
    const res = await axios.get('https://bing.img.run/rand.php', { responseType: 'json' })
    return 'https://cn.bing.com' + res.request.path
  } catch (error) {
    console.log(error, 'error')
  }
  return ''
})

ipcMain.on('downloadWallpaper', async (event, url) => {
  const imgData = await downloadImg(url)
  await saveFile(imgData, url, true)
  BrowserWindow.fromWebContents(event.sender)?.webContents.send('updateSavePath', cacheData.saveDir)
})

ipcMain.on('settingWallpaper', async (_event, url) => {
  const imgData = await downloadImg(url)
  const { savePath } = await saveFile(imgData, url, false)
  if (savePath as any as string) {
    if (process.platform === 'darwin') {
      exec(
        `osascript -e 'tell application "Finder" to set desktop picture to POSIX file "${savePath}"'`,
        (error) => {
          if (error) {
            console.error('壁纸设置失败：', error)
          } else {
            console.log('壁纸设置成功！')
          }
        }
      )
    } else if (process.platform === 'win32') {
      // 使用命令行设置壁纸
      exec(
        `reg add "HKEY_CURRENT_USER\\Control Panel\\Desktop" /v Wallpaper /t REG_SZ /d "${savePath}" /f && RUNDLL32.EXE user32.dll, UpdatePerUserSystemParameters`,
        (error) => {
          if (error) {
            console.error('壁纸设置失败：', error)
          } else {
            console.log('壁纸设置成功！')
          }
        }
      )
    }
  }
})

ipcMain.on('getSaveDir', (_event, value) => {
  updateCacheData('saveDir', value)
})

ipcMain.on('moveWindow', (event, value) => {
  // 获取设备分辨率
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  // eslint-disable-next-line no-unsafe-optional-chaining
  const [x, y] = BrowserWindow.fromWebContents(event.sender)?.getPosition() as number[]
  // eslint-disable-next-line no-unsafe-optional-chaining
  const [winW, winH] = BrowserWindow.fromWebContents(event.sender)?.getSize() as number[]

  let moveX
  let moveY
  if (x + value.x <= 0) {
    moveX = 0
  } else {
    moveX = winW + (x + value.x) >= width ? width - winW : x + value.x
  }
  if (y + value.y <= 0) {
    moveY = 0
  } else {
    moveY = winH + (y + value.y) >= height ? height - winH : y + value.y
  }
  BrowserWindow.fromWebContents(event.sender)?.setPosition(moveX, moveY)
})

ipcMain.on('quit', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.hide()
})

const downloadImg = (url: string): any => {
  return new Promise((resolve) => {
    axios.get(url, { responseType: 'stream' }).then((res) => {
      resolve(res.data)
    })
  })
}

const saveFile = async (stream: any, url: string, isSave: boolean) => {
  return new Promise<any>((resolve, reject) => {
    ;(async function () {
      const dirIsExist = cacheData.saveDir ? fs.existsSync(cacheData.saveDir) : false
      // 如果没有默认存储地址或者默认存储地址不存在，就让用户选择一个
      if (!cacheData.saveDir && !dirIsExist) {
        const { response } = await dialog.showMessageBox({
          title: '提示',
          message: '请选择壁纸保存地址'
        })
        if (response === 0) {
          const { filePaths } = await dialog.showOpenDialog({
            properties: ['createDirectory', 'openDirectory']
          })
          if (!filePaths[0]) {
            return
          }
          updateCacheData('saveDir', filePaths[0])
        }
      }
      let savePath
      let fileName = ''
      const regex = /OHR\.(\w+)_/
      const match = url.match(regex)
      const filePath = cacheData.saveDir
      if (isSave) {
        if (match) {
          fileName = match[1]
        }
        savePath = filePath + '/' + fileName + '.jpeg'
      } else {
        if (match) {
          fileName = match[1]
        }
        savePath = filePath + '/' + fileName + '.jpeg'
      }

      // 判断文件是否已经保存
      const isExist = await hasSave(filePath, fileName)
      if (isExist && isSave) {
        dialog.showMessageBox({
          title: '提示',
          message: '该壁纸已经保存过了'
        })
        return
      }
      if (isExist) {
        resolve({
          savePath,
          fileName,
          filePath
        })
        return
      }
      // 创建可写流
      const writer = fs.createWriteStream(savePath)
      // 将接口返回的数据流写入可写流
      stream.pipe(writer)

      // 监听写入完成事件
      writer.on('finish', function () {
        resolve({
          savePath,
          fileName,
          filePath
        })
        isSave &&
          dialog.showMessageBox({
            title: '提示',
            message: '保存成功'
          })
      })

      // 监听写入错误事件
      writer.on('error', function () {
        reject('')
        isSave && dialog.showErrorBox('提示', '保存失败')
      })
    })()
  })
}

function hasSave(path: string, fileName: string) {
  return new Promise((resolve) => {
    fs.readdir(path, (_err: any, files: string[]) => {
      resolve(files.some((fileStr) => fileStr.includes(fileName)))
    })
  })
}
