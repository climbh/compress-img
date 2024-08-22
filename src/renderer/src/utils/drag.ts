class Drag {
  constructor() {
    this.init()
  }
  init() {
    const drag: HTMLDivElement | null = document.querySelector('.drag')
    drag &&
      drag.addEventListener('mousedown', (e: MouseEvent) => {
        const disX = e.clientX - drag.offsetLeft
        const disY = e.clientY - drag.offsetTop
        const move = (e: any) => {
          const x = e.clientX - disX
          const y = e.clientY - disY
          window.api.moveWindow(x, y)
        }
        document.addEventListener('mousemove', move)
        document.addEventListener('mouseup', () => {
          document.removeEventListener('mousemove', move)
          drag.removeEventListener('mousemove', move)
        })
      })
  }
}

export default new Drag()
