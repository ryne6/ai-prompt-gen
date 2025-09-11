import type { IpcRendererEvent } from 'electron';
import type { AppSettings, GeneratedPrompt } from '../store/useAppStore';

export interface StoreUpdate {
  settings?: Partial<AppSettings>;
  history?: GeneratedPrompt[];
}

export interface IpcRendererWithStore {
  on(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void): IpcRendererWithStore;
  off(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void): IpcRendererWithStore;
  send(channel: string, ...args: unknown[]): void;
  invoke<T>(channel: string, ...args: unknown[]): Promise<T>;
  sendStoreUpdate(state: StoreUpdate): void;
  onStoreUpdate(callback: (state: StoreUpdate) => void): void;
  // 自动更新相关方法
  checkForUpdate(): void;
  installUpdate(): void;
  onUpdateChecking(callback: () => void): void;
  onUpdateAvailable(callback: (info: UpdateInfo) => void): void;
  onUpdateNotAvailable(callback: (info: UpdateInfo) => void): void;
  onUpdateError(callback: (error: string) => void): void;
  onUpdateProgress(callback: (progress: ProgressInfo) => void): void;
  onUpdateDownloaded(callback: (info: UpdateInfo) => void): void;
}

declare global {
  interface Window {
    ipcRenderer: IpcRendererWithStore;
  }
}