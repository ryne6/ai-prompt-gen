import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

const defaultSettings: AppSettings = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  generationStyle: 'detailed',
  language: 'zh',
  theme: 'light',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      history: [],
      isGenerating: false,
      currentInput: '',
      currentResult: '',
      settings: defaultSettings,

      addToHistory: (prompt) => {
        const newPrompt: GeneratedPrompt = {
          ...prompt,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };
        set((state) => ({
          history: [newPrompt, ...state.history].slice(0, 100), // 最多保存 100 条记录
        }));
      },

      setCurrentInput: (input) => set({ currentInput: input }),
      
      setCurrentResult: (result) => set({ currentResult: result }),
      
      setIsGenerating: (generating) => set({ isGenerating: generating }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      clearHistory: () => set({ history: [] }),

      removeFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),

      ratePrompt: (id, rating) =>
        set((state) => ({
          history: state.history.map((item) =>
            item.id === id ? { ...item, rating } : item
          ),
        })),
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
