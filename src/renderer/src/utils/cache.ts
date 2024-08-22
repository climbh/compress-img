import { ref } from 'vue'

interface ICache {
  /**
   * 当前图片的url
   */
  curImgUrl: string

  /**
   * 当前图片的index
   */
  curImgIndex: number

  /**
   * 历史图片的url
   */
  historyImgUrls: string[]
}

const MAX_HISTORY_IMG_URL_LENGTH = 10

const cacheData = ref<ICache>({
  curImgUrl: '',
  curImgIndex: 0,
  historyImgUrls: []
})

type CacheKey = keyof ICache

if (localStorage.getItem('cacheData')) {
  Object.assign(cacheData.value, JSON.parse(localStorage.getItem('cacheData') as string))
}

const updateCacheData = (key: CacheKey, value: any) => {
  cacheData.value[key] = value as never
  // 如果是当前图片的url，就把它加入到历史图片的url中
  if (key === 'curImgUrl') {
    cacheData.value.historyImgUrls = [...new Set([...cacheData.value.historyImgUrls, value])]
  }
  // 如果历史图片的url数量超过10个，就把第一个删掉
  if (cacheData.value.historyImgUrls.length > MAX_HISTORY_IMG_URL_LENGTH) {
    cacheData.value.historyImgUrls.shift()
  }

  localStorage.setItem('cacheData', JSON.stringify(cacheData.value))
}

export { cacheData, updateCacheData, MAX_HISTORY_IMG_URL_LENGTH }
