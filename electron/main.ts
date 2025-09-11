import { app, BrowserWindow, nativeImage, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
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

let mainWindow: BrowserWindow | null
let settingsWindow: BrowserWindow | null

// IPC 通信处理
// 打开设置窗口
ipcMain.on('open-settings', () => {
  createSettingsWindow()
})

// 自动更新相关 IPC
ipcMain.on('update:check', () => {
  autoUpdater.checkForUpdates()
})

ipcMain.on('update:download', () => {
  autoUpdater.downloadUpdate()
})

ipcMain.on('update:install', () => {
  autoUpdater.quitAndInstall()
})

// store 更新同步
ipcMain.on('store-update', (event, settings) => {
  console.log('🔄 Store update received:', settings);
  // 从设置窗口收到更新，广播给所有窗口
  BrowserWindow.getAllWindows().forEach(win => {
    if (win.webContents !== event.sender) {
      console.log('📢 Broadcasting to window:', win.id);
      win.webContents.send('store-update', settings);
    }
  });
});

// 设置自动更新
function setupAutoUpdater(mainWindow: BrowserWindow) {
  // 开发环境不检查更新
  if (VITE_DEV_SERVER_URL) {
    console.log('🔧 Development mode - skipping auto update check');
    return;
  }

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('checking-for-update', () => {
    console.log('🔍 Checking for update...');
    mainWindow.webContents.send('update:checking');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('📦 Update available:', info.version);
    mainWindow.webContents.send('update:available', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('✅ Update not available:', info.version);
    mainWindow.webContents.send('update:not-available', info);
  });

  autoUpdater.on('error', (err) => {
    console.error('❌ Update error:', err);
    mainWindow.webContents.send('update:error', err.message);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log('📥 Download progress:', progressObj.percent);
    mainWindow.webContents.send('update:progress', progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('✅ Update downloaded:', info.version);
    mainWindow.webContents.send('update:downloaded', info);
  });

  // 5秒后检查更新
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 5000);
}

function getAppIcon(): string | undefined {
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

function createMainWindow() {
  mainWindow = new BrowserWindow({
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
        devTools: true,
      },
  })

  // Test active push message to Renderer-process.
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('🚀 Main window loaded');
    // Ensure title stays consistent even if renderer changes document.title
    mainWindow?.setTitle('AI Prompt Generator')
    mainWindow?.webContents.send('main-process-message', (new Date).toLocaleString())
    
    // 设置自动更新
    setupAutoUpdater(mainWindow!)
  })

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('❌ Main window failed to load:', errorCode, errorDescription);
  })

  mainWindow.webContents.on('preload-error', (_event, preloadPath, error) => {
    console.error('❌ Preload script error:', preloadPath, error);
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(`${VITE_DEV_SERVER_URL}#/`)
    // 开发环境下打开 DevTools
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: '/' })
  }

  // Set dock icon on macOS if a raster icon exists
  if (process.platform === 'darwin') {
    const iconPath = getAppIcon()
    if (iconPath && (iconPath.endsWith('.png') || iconPath.endsWith('.icns'))) {
      const img = nativeImage.createFromPath(iconPath)
      if (!img.isEmpty()) app.dock?.setIcon(img)
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null
    if (settingsWindow) {
      settingsWindow.close()
      settingsWindow = null
    }
  })
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus()
    return
  }

  settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 500,
    parent: mainWindow!, // 设置父窗口
    modal: true, // 模态窗口
    title: '个人信息设置',
    frame: true, 
    icon: getAppIcon(),
      webPreferences: {
        preload: path.join(__dirname, 'preload.mjs'),
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        spellcheck: true,
      },
  })

  if (VITE_DEV_SERVER_URL) {
    settingsWindow.loadURL(`${VITE_DEV_SERVER_URL}#/settings`)
  } else {
    settingsWindow.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: '/settings' })
  }

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
}

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
    createMainWindow()
  }
})

app.whenReady().then(() => {
  createMainWindow()
}).catch(console.error)