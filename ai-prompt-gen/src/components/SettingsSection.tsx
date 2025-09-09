import React, { useState } from 'react';
import { Settings, Save, Eye, EyeOff, ExternalLink, Info } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import clsx from 'clsx';

export const SettingsSection: React.FC = () => {
  const { settings, updateSettings, clearHistory } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(tempSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
      clearHistory();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">设置</h2>
              <p className="text-gray-600">配置你的偏好设置</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="btn-secondary"
          >
            {isCollapsed ? '展开设置' : '收起设置'}
          </button>
        </div>

        {!isCollapsed && (
          <div className="space-y-6">
            {/* API 配置 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">API 配置</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={tempSettings.apiKey}
                    onChange={(e) => setTempSettings({...tempSettings, apiKey: e.target.value})}
                    placeholder="sk-..."
                    className="input-field pr-10"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">如何获取 OpenAI API Key：</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>访问 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">OpenAI API Keys 页面 <ExternalLink className="w-3 h-3" /></a></li>
                        <li>登录你的 OpenAI 账户</li>
                        <li>点击 "Create new secret key"</li>
                        <li>复制生成的 API Key 并粘贴到此处</li>
                      </ol>
                      <p className="mt-2 text-blue-600">你的 API Key 仅存储在本地，不会上传到任何服务器。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 生成偏好 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">生成偏好</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  生成风格
                </label>
                <select
                  value={tempSettings.generationStyle}
                  onChange={(e) => setTempSettings({...tempSettings, generationStyle: e.target.value as any})}
                  className="input-field"
                >
                  <option value="concise">简洁型 - 生成简洁明了的提示词</option>
                  <option value="detailed">详细型 - 生成结构化的详细提示词</option>
                  <option value="professional">专业型 - 生成企业级标准提示词</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  输出语言
                </label>
                <select
                  value={tempSettings.language}
                  onChange={(e) => setTempSettings({...tempSettings, language: e.target.value as any})}
                  className="input-field"
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            {/* 界面设置 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">界面设置</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  主题
                </label>
                <select
                  value={tempSettings.theme}
                  onChange={(e) => setTempSettings({...tempSettings, theme: e.target.value as any})}
                  className="input-field"
                >
                  <option value="light">浅色主题</option>
                  <option value="dark">深色主题</option>
                  <option value="auto">跟随系统</option>
                </select>
              </div>
            </div>

            {/* 数据管理 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">数据管理</h3>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-800 mb-2">危险操作</h4>
                <p className="text-sm text-red-700 mb-3">
                  清空历史记录将删除所有保存的生成记录，此操作不可恢复。
                </p>
                <button
                  onClick={handleClearHistory}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  清空历史记录
                </button>
              </div>
            </div>

            {/* 保存按钮 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                设置会自动保存到本地
              </div>
              
              <button
                onClick={handleSave}
                className={clsx(
                  "btn-primary flex items-center gap-2",
                  saved && "bg-green-600 hover:bg-green-700"
                )}
              >
                <Save className="w-4 h-4" />
                {saved ? '已保存' : '保存设置'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
