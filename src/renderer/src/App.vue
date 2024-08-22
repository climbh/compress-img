<script setup lang="ts">
import { NewPicture, SettingTwo, DownPicture, GoStart, GoEnd } from '@icon-park/vue-next'
import { nextTick, onMounted, ref } from 'vue'
import { cacheData, updateCacheData, MAX_HISTORY_IMG_URL_LENGTH } from './utils/cache'
import Drag from '@renderer/utils/drag'

onMounted(() => {
  window.api.getSaveDir()
  window.api.updateSavePath()
  if (!cacheData.value.curImgUrl) {
    toggleImg()
  }
  nextTick(() => {
    Drag.init()
  })
})

const loading = ref(false)

//  切换壁纸
const toggleImg = async () => {
  loading.value = true
  const url = await window.api.changeImg()
  updateCacheData('curImgUrl', url)
  updateCacheData('curImgIndex', cacheData.value.historyImgUrls.length - 1)
  loading.value = false
}

// 切换上一张
const toBefore = () => {
  const curIndex = cacheData.value.historyImgUrls.findIndex(
    (url) => url === cacheData.value.curImgUrl
  )
  if (curIndex === 0) return
  updateCacheData('curImgUrl', cacheData.value.historyImgUrls[curIndex - 1])
  updateCacheData('curImgIndex', curIndex - 1)
}

// 切换下一张
const toAfter = () => {
  const curIndex = cacheData.value.historyImgUrls.findIndex(
    (url) => url === cacheData.value.curImgUrl
  )
  if (curIndex > cacheData.value.historyImgUrls.length) return
  updateCacheData('curImgUrl', cacheData.value.historyImgUrls[curIndex + 1])
  updateCacheData('curImgIndex', curIndex + 1)
}

// 设置壁纸
const settingWallpaper = () => {
  window.api.settingWallpaper(cacheData.value.curImgUrl)
}

//  下载壁纸
const downloadWallpaper = () => {
  window.api.downloadWallpaper(cacheData.value.curImgUrl)
}

const menuClick = (data: string) => {
  switch (data) {
    case '0':
      window.api.quit()
      break

    default:
      break
  }
}
</script>

<template>
  <div
    class="overflow-hidden flex flex-col w-screen h-screen rounded-md bg-gray-200"
    v-loading="loading"
  >
    <div class="drag flex items-center justify-between px-3 py-2 text-[#555] hover:cursor-move">
      <p>心情壁纸</p>
      <div class="flex">
        <new-picture
          class="cursor-pointer"
          title="切换壁纸"
          theme="outline"
          size="24"
          fill="#555"
          :strokeWidth="4"
          @click="toggleImg"
        />
        <down-picture
          title="下载壁纸"
          class="ml-2 cursor-pointer"
          theme="outline"
          size="24"
          fill="#555"
          :strokeWidth="2"
          @click="downloadWallpaper"
        />
        <el-dropdown trigger="click" @command="menuClick">
          <setting-two
            class="ml-2 cursor-pointer"
            theme="outline"
            size="24"
            fill="#555"
            :strokeWidth="4"
          />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="0">关闭</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="group relative h-0 flex-1">
      <div class="hidden group-hover:block duration-75">
        <div
          class="absolute top-1/2 left-1.5 z-[1] -translate-y-1/2 flex items-center justify-center px-6 cursor-pointer"
          v-if="cacheData.curImgIndex !== 0 && cacheData.historyImgUrls.length > 1"
          @click="toBefore"
        >
          <go-start theme="outline" size="24" fill="#fff" :strokeWidth="3" />
        </div>
        <div
          class="absolute top-1/2 right-1.5 z-[1] -translate-y-1/2 flex items-center justify-center px-6 cursor-pointer"
          v-if="
            cacheData.curImgIndex < cacheData.historyImgUrls.length - 1 &&
            cacheData.historyImgUrls.length < MAX_HISTORY_IMG_URL_LENGTH
          "
          @click="toAfter"
        >
          <go-end theme="outline" size="24" fill="#fff" :strokeWidth="3" />
        </div>
      </div>
      <img
        class="w-full h-full object-cover shadow-gray-500"
        :src="cacheData.historyImgUrls[cacheData.curImgIndex]"
        alt=""
      />
    </div>
    <div class="w-full px-3 py-4">
      <div
        class="flex items-center justify-center w-full h-10 bg-white rounded-md cursor-pointer hover:bg-gray-500 hover:font-bold hover:text-white"
        @click="settingWallpaper"
      >
        设为壁纸
      </div>
    </div>
  </div>
</template>
