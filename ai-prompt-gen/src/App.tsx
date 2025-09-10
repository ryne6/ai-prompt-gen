import { useEffect } from 'react';
import GeneratePage from './pages/Generate';
import ProfilePage from './pages/Profile';
import { useAppStore } from './store/useAppStore';
import type { IpcRendererWithStore, StoreUpdate } from './types/window';

function App() {
  const hash = window.location.hash.replace('#', '') || '/';
  const isSettingsPage = hash === '/settings';

  const showSettings = () => {
    const ipc = window.ipcRenderer as unknown as IpcRendererWithStore;
    ipc?.send('open-settings');
  }

  useEffect(() => {
    const ipc = window.ipcRenderer as unknown as IpcRendererWithStore;
    if (!ipc) return;

    // 监听来自主进程的消息
    ipc.on('main-process-message', (_event: Electron.IpcRendererEvent, message: unknown) => {
      console.log('Received message:', message);
    });

    // 监听状态更新
    ipc.onStoreUpdate((state: StoreUpdate) => {
      console.log('Received store update:', state);
      if (state.settings) {
        useAppStore.setState((prev) => ({
          settings: { ...prev.settings, ...state.settings }
        }));
      }
      if (state.history) {
        useAppStore.setState({ history: state.history });
      }
    });
  }, []);

  const Nav = () => (
    <div className="w-full border-b border-gray-200 bg-white/70 backdrop-blur sticky top-0 z-10">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="font-semibold text-gray-900">AI Prompt Generator</div>
        <nav className="flex items-center gap-4 text-sm">
          <button
            onClick={showSettings}
            className="px-3 py-2 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            个人信息
          </button>
        </nav>
      </div>
    </div>
  );

  const Footer = () => (
    <footer className="text-center py-8">
      <div className="text-gray-500 text-sm">
        <p className="mb-2">AI Prompt Generator - 让 AI 提示词创作变得简单</p>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {!isSettingsPage && <Nav />}
      {isSettingsPage ? <ProfilePage /> : <GeneratePage />}
      {!isSettingsPage && <Footer />}
    </div>
  );
}

export default App;
