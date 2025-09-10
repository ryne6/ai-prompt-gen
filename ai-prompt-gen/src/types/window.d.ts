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
}

declare global {
  interface Window {
    ipcRenderer: IpcRendererWithStore;
  }
}