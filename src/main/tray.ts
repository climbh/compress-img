import { Menu, Tray, app } from 'electron'
import path from 'path'
const createTray = (win) => {
  const tray = new Tray(
    path.resolve(
      __dirname,
      process.platform == 'darwin'
        ? '../../resources/macTrayTemplate@2x.png' //32x32 像素的图片
        : '../../resources/windowTray.png' //可以使用彩色图片，图标的最大大小为 256x256 像素，设置为32x32像素即可
    )
  )
  const menu = [
    {
      label: app.name,
      submenu: [
        {
          label: '预览',
          click() {
            win.show()
          }
        },
        { label: '退出', role: 'quit' }
      ]
    }
  ]
  const contextMenu = Menu.buildFromTemplate(menu as any)
  tray.setToolTip('心情壁纸')
  tray.setContextMenu(contextMenu)
}

export { createTray }
