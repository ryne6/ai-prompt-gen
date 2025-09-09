import { app, BrowserWindow, nativeImage } from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function getAppIcon(): string | undefined {
  // Prefer PNG/ICNS for better macOS/Windows support
  const candidates = [
    path.join(process.env.VITE_PUBLIC as string, 'icon.png'),
    path.join(process.env.VITE_PUBLIC as string, 'icon.icns'),
    path.join(process.env.VITE_PUBLIC as string, 'icon.ico'),
  ]
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p
    } catch {
      console.error(`Icon file not found: ${p}`)
    }
  }
  return undefined
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'AI Prompt Generator',
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    // Ensure title stays consistent even if renderer changes document.title
    win?.setTitle('AI Prompt Generator')
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  // Set dock icon on macOS if a raster icon exists
  if (process.platform === 'darwin') {
    const iconPath = getAppIcon()
    if (iconPath && (iconPath.endsWith('.png') || iconPath.endsWith('.icns'))) {
      const img = nativeImage.createFromPath(iconPath)
      if (!img.isEmpty()) app.dock?.setIcon(img)
    }
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
}).catch(console.error)