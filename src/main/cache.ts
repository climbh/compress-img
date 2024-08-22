import { ipcMain } from 'electron'

interface ICache {
  /**
   * 保存图片的目录
   */
  saveDir: string
}

const cacheData: ICache = {
  saveDir: ''
}

type CacheKey = keyof ICache

const updateCacheData = (key: CacheKey, value: any) => {
  cacheData[key] = value
  ipcMain.emit
}

export { cacheData, updateCacheData }
