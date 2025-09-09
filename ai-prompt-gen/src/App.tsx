import { InputSection } from './components/InputSection';
import { ResultSection } from './components/ResultSection';
import { HistorySection } from './components/HistorySection';
import { SettingsSection } from './components/SettingsSection';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 主输入区域 */}
        <InputSection />
        
        {/* 结果展示区域 */}
        <ResultSection />
        
        {/* 历史记录区域 */}
        <HistorySection />
        
        {/* 设置区域 */}
        <SettingsSection />
        
        {/* 页脚 */}
        <footer className="text-center py-8">
          <div className="text-gray-500 text-sm">
            <p className="mb-2">AI Prompt Generator - 让 AI 提示词创作变得简单</p>
            <p>基于 Electron + React + TypeScript 构建</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
