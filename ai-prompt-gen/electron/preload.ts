import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
  // 发送状态更新到主进程
  sendStoreUpdate: (state: unknown) => {
    console.log('🔄 Sending store update');
    ipcRenderer.send('store-update', state);
  },
  // 监听来自主进程的状态更新
  onStoreUpdate: (callback: (state: unknown) => void) => {
    console.log('👂 Setting up store update listener');
    ipcRenderer.on('store-update', (_event, state) => callback(state));
  }
})