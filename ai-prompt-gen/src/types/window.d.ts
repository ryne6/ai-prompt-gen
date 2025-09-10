interface Window {
  ipcRenderer: {
    send(channel: string, ...args: any[]): void;
    on(channel: string, func: (...args: any[]) => void): void;
    off(channel: string, ...args: any[]): void;
    invoke(channel: string, ...args: any[]): Promise<any>;
    sendStoreUpdate(state: unknown): void;
    onStoreUpdate(callback: (state: unknown) => void): void;
  };
}