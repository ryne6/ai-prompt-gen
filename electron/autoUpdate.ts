import { autoUpdater } from 'electron-updater';
import { app, BrowserWindow } from 'electron';
import AdmZip from 'adm-zip';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const execAsync = promisify(exec);
const isMac = process.platform === 'darwin';

interface UpdateInfo {
  version: string;
  files: Array<{
    url: string;
    sha512: string;
    size: number;
  }>;
  path: string;
  sha512: string;
  releaseNotes?: string;
  releaseDate: string;
  downloadedFile: string;
}

// 解压 ZIP 文件
function unZip(zipPath: string, extractionPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      console.log('📦 开始解压:', zipPath, '到', extractionPath);
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractionPath, true);
      console.log('✅ 解压完成');
      resolve();
    } catch (err) {
      console.error('❌ 解压失败:', err);
      reject(err);
    }
  });
}

// 执行命令
async function execCommand(command: string): Promise<void> {
  try {
    console.log('🔧 执行命令:', command);
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log('stdout:', stdout);
    if (stderr) console.log('stderr:', stderr);
  } catch (error) {
    console.error('❌ 命令执行失败:', error);
    throw error;
  }
}

// 自定义 macOS 安装
async function customInstallMacApp(updateInfo: UpdateInfo): Promise<void> {
  try {
    console.log('🍎 开始自定义 macOS 安装...');
    
    const appPath = app.getAppPath(); // 如: /Applications/AI Prompt Generator.app/Contents/Resources/app.asar
    console.log('📍 当前应用路径:', appPath);
    
    // 提取应用名称
    const appMatch = appPath.match(/([^/]+\.app)/);
    if (!appMatch) {
      throw new Error('无法提取应用名称');
    }
    const appFile = appMatch[1]; // 如: AI Prompt Generator.app
    console.log('📱 应用名称:', appFile);
    
    // 获取安装目录 (去掉 .app 后面的部分)
    const installDir = appPath.replace(new RegExp(`${appFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*`), '');
    console.log('📁 安装目录:', installDir);
    
    // 下载文件解压路径
    const downloadDir = path.dirname(updateInfo.downloadedFile);
    console.log('💾 下载目录:', downloadDir);
    
    // 完整安装路径
    const installPath = path.join(installDir, appFile);
    console.log('🎯 完整安装路径:', installPath);
    
    // 第一步：解压 ZIP 压缩包
    await unZip(updateInfo.downloadedFile, downloadDir);
    
    // 第二步：替换 Resources 目录
    const resourcesPath = path.join(installPath, 'Contents', 'Resources');
    const newResourcesPath = path.join(downloadDir, appFile, 'Contents', 'Resources');
    
    console.log('🔄 替换 Resources 目录...');
    console.log('旧路径:', resourcesPath);
    console.log('新路径:', newResourcesPath);
    
    // 删除旧的 Resources 目录
    await execCommand(`rm -rf "${resourcesPath}"`);
    
    // 移动新的 Resources 目录
    await execCommand(`mv "${newResourcesPath}" "${resourcesPath}"`);
    
    console.log('✅ 安装完成，准备重启应用...');
    
    // 重启应用
    app.quit();
    app.relaunch();
    
  } catch (error) {
    console.error('❌ macOS 自定义安装失败:', error);
    throw error;
  }
}

// 开始安装
async function startInstall(updateInfo: UpdateInfo, mainWindow?: BrowserWindow): Promise<void> {
  try {
    console.log('🚀 开始安装更新...');
    
    if (!isMac) {
      // Windows/Linux 使用默认安装
      console.log('🪟 Windows/Linux 使用默认安装');
      autoUpdater.quitAndInstall();
      return;
    }
    
    // macOS 使用自定义安装
    await customInstallMacApp(updateInfo);
    
  } catch (error) {
    console.error('❌ 安装失败:', error);
    if (mainWindow) {
      mainWindow.webContents.send('update:error', `安装失败: ${error}`);
    }
  }
}

// 初始化自动更新
export function initUpdater(mainWindow?: BrowserWindow): void {
  console.log('🔄 初始化自动更新器...');
  
  // 禁用 web 安装器
  autoUpdater.disableWebInstaller = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.autoDownload = false;
  
  // 检查更新事件
  autoUpdater.on('checking-for-update', () => {
    console.log('🔍 正在检查更新...');
    if (mainWindow) {
      mainWindow.webContents.send('update:checking');
    }
  });
  
  // 发现更新事件
  autoUpdater.on('update-available', (info) => {
    console.log('📦 发现更新:', info.version);
    if (mainWindow) {
      mainWindow.webContents.send('update:available', info);
    }
  });
  
  // 没有更新事件
  autoUpdater.on('update-not-available', (info) => {
    console.log('✅ 没有可用更新:', info.version);
    if (mainWindow) {
      mainWindow.webContents.send('update:not-available', info);
    }
  });
  
  // 下载进度事件
  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`📥 下载进度: ${Math.round(progressObj.percent)}%`);
    if (mainWindow) {
      mainWindow.webContents.send('update:progress', progressObj);
    }
  });
  
  // 下载完成事件
  autoUpdater.on('update-downloaded', async (updateInfo) => {
    console.log('✅ 下载完成:', updateInfo.version);
    console.log('📁 下载文件路径:', updateInfo.downloadedFile);
    
    if (mainWindow) {
      mainWindow.webContents.send('update:downloaded', updateInfo);
    }
    
    // 自动开始安装
    await startInstall(updateInfo as UpdateInfo, mainWindow);
  });
  
  // 错误事件
  autoUpdater.on('error', (error) => {
    console.error('❌ 自动更新错误:', error);
    if (mainWindow) {
      mainWindow.webContents.send('update:error', error.message);
    }
  });
  
  // 延迟 5 秒后检查更新
  setTimeout(() => {
    console.log('⏰ 开始检查更新...');
    autoUpdater.checkForUpdates();
  }, 5000);
}

// 手动检查更新
export function checkForUpdates(): void {
  console.log('🔄 手动检查更新...');
  autoUpdater.checkForUpdates();
}

// 下载更新
export function downloadUpdate(): void {
  console.log('📥 开始下载更新...');
  autoUpdater.downloadUpdate();
}

// 安装更新
export function installUpdate(): void {
  console.log('📦 安装更新...');
  autoUpdater.quitAndInstall();
}

