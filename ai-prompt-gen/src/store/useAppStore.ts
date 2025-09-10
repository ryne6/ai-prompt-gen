import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IpcRendererWithStore } from '../types/window';

export interface GeneratedPrompt {
  id: string;
  userInput: string;
  generatedPrompt: string;
  timestamp: Date;
  category?: string;
  rating?: number;
}

export interface AppSettings {
  apiKey: string;
  generationStyle: 'concise' | 'detailed' | 'professional';
  language: 'zh' | 'en';
  theme: 'light' | 'dark' | 'auto';
}

interface AppState {
  // 生成历史
  history: GeneratedPrompt[];
  
  // 当前状态
  isGenerating: boolean;
  currentInput: string;
  currentResult: string;
  
  // 设置
  settings: AppSettings;
  
  // Actions
  addToHistory: (prompt: Omit<GeneratedPrompt, 'id' | 'timestamp'>) => void;
  setCurrentInput: (input: string) => void;
  setCurrentResult: (result: string) => void;
  setIsGenerating: (generating: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  ratePrompt: (id: string, rating: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set): AppState => ({
      history: [],
      isGenerating: false,
      currentInput: '',
      currentResult: '',
      settings: {
        apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
        generationStyle: 'detailed' as const,
        language: 'zh',
        theme: 'light',
      },

      addToHistory: (prompt) => {
        const newPrompt: GeneratedPrompt = {
          ...prompt,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };
        set((state) => {
          const newHistory = [newPrompt, ...state.history].slice(0, 100);
          // 同步到其他窗口
            const ipc = typeof window !== 'undefined' ? (window.ipcRenderer as unknown as IpcRendererWithStore) : null;
            ipc?.sendStoreUpdate({ history: newHistory });
          return { history: newHistory };
        });
      },

      setCurrentInput: (input) => set({ currentInput: input }),
      
      setCurrentResult: (result) => set({ currentResult: result }),
      
      setIsGenerating: (generating) => set({ isGenerating: generating }),

      updateSettings: (newSettings) => {
        set((state) => {
          const updatedSettings = { ...state.settings, ...newSettings };
          // 同步到其他窗口
            if (typeof window !== 'undefined') {
              const ipc = window.ipcRenderer as unknown as IpcRendererWithStore;
              ipc?.sendStoreUpdate({ settings: updatedSettings });
            }
          return { settings: updatedSettings };
        });
      },

      clearHistory: () => {
        // 同步到其他窗口
        const ipc = typeof window !== 'undefined' ? (window.ipcRenderer as unknown as IpcRendererWithStore) : null;
        ipc?.sendStoreUpdate({ history: [] });
        set({ history: [] });
      },

      removeFromHistory: (id) =>
        set((state) => {
          const newHistory = state.history.filter((item) => item.id !== id);
          // 同步到其他窗口
            const ipc = typeof window !== 'undefined' ? (window.ipcRenderer as unknown as IpcRendererWithStore) : null;
            ipc?.sendStoreUpdate({ history: newHistory });
          return { history: newHistory };
        }),

      ratePrompt: (id, rating) =>
        set((state) => {
          const newHistory = state.history.map((item) =>
            item.id === id ? { ...item, rating } : item
          );
          // 同步到其他窗口
            const ipc = typeof window !== 'undefined' ? (window.ipcRenderer as unknown as IpcRendererWithStore) : null;
            ipc?.sendStoreUpdate({ history: newHistory });
          return { history: newHistory };
        }),
    }),
    {
      name: 'ai-prompt-gen-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        history: state.history,
        settings: state.settings,
      }),
    }
  )
);