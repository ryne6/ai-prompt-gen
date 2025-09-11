import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererWithStore, StoreUpdate } from '../src/types/window';
import { ProgressInfo, UpdateInfo } from 'electron-updater';

// 创建一个类型安全的 IPC 通信对象
const ipc: IpcRendererWithStore = {
  on: (channel, listener) => {
    ipcRenderer.on(channel, listener);
    return ipc;
  },
  off: (channel, listener) => {
    ipcRenderer.off(channel, listener);
    return ipc;
  },
  send: ipcRenderer.send.bind(ipcRenderer),
  invoke: ipcRenderer.invoke.bind(ipcRenderer),
  // 发送状态更新到主进程
  sendStoreUpdate: (state: StoreUpdate) => {
    console.log('🔄 Sending store update');
    ipcRenderer.send('store-update', state);
  },
  // 监听来自主进程的状态更新
  onStoreUpdate: (callback: (state: StoreUpdate) => void) => {
    console.log('👂 Setting up store update listener');
    ipcRenderer.on('store-update', (_event, state) => callback(state));
  },
  // 自动更新相关方法
  checkForUpdate: () => {
    console.log('🔄 Checking for update');
    ipcRenderer.send('update:check');
  },
  downloadUpdate: () => {
    console.log('📥 Downloading update');
    ipcRenderer.send('update:download');
  },
  installUpdate: () => {
    console.log('📦 Installing update');
    ipcRenderer.send('update:install');
  },
  // 监听更新事件
  onUpdateChecking: (callback: () => void) => {
    ipcRenderer.on('update:checking', callback);
  },
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => {
    ipcRenderer.on('update:available', (_event, info) => callback(info));
  },
  onUpdateNotAvailable: (callback: (info: UpdateInfo) => void) => {
    ipcRenderer.on('update:not-available', (_event, info) => callback(info));
  },
  onUpdateError: (callback: (error: string) => void) => {
    ipcRenderer.on('update:error', (_event, error) => callback(error));
  },
  onUpdateProgress: (callback: (progress: ProgressInfo) => void) => {
    ipcRenderer.on('update:progress', (_event, progress) => callback(progress));
  },
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => {
    ipcRenderer.on('update:downloaded', (_event, info) => callback(info));
  }
};

// 暴露类型安全的 IPC 通信对象
contextBridge.exposeInMainWorld('ipcRenderer', ipc);