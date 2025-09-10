import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererWithStore, StoreUpdate } from '../src/types/window';

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
  }
};

// 暴露类型安全的 IPC 通信对象
contextBridge.exposeInMainWorld('ipcRenderer', ipc);