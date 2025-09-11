import React, { useState } from 'react';
import { Copy, Edit, Save, Check, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import clsx from 'clsx';

export const ResultSection: React.FC = () => {
  const { currentResult, isGenerating } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedResult, setEditedResult] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editedResult : currentResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedResult(currentResult);
  };

  const handleSaveEdit = () => {
    // 这里可以添加保存编辑的逻辑
    setIsEditing(false);
    // 可以选择更新 currentResult 或者保存到历史记录
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedResult('');
  };

  if (!currentResult && !isGenerating) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">生成的专业提示词</h2>
              <p className="text-gray-600">复制后即可直接使用</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            {isGenerating ? (
              <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  <span>AI 正在为你生成专业提示词，请稍候...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  {isEditing ? (
                    <textarea
                      value={editedResult}
                      onChange={(e) => setEditedResult(e.target.value)}
                      className="input-field min-h-[300px] font-mono text-sm leading-relaxed"
                      placeholder="编辑你的提示词..."
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-primary-500">
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
                        {currentResult}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="btn-primary flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          保存编辑
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="btn-secondary"
                        >
                          取消
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleCopy}
                          className={clsx(
                            "btn-primary flex items-center gap-2",
                            copied && "bg-green-600 hover:bg-green-700"
                          )}
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              复制提示词
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={handleEdit}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          编辑
                        </button>
                      </>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    {currentResult.length} 字符
                  </div>
                </div>

                {!isEditing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">💡 使用建议：</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 复制提示词到你常用的 AI 工具（ChatGPT、Claude 等）</li>
                      <li>• 根据具体需求微调提示词的细节</li>
                      <li>• 可以在提示词后添加你的具体问题或数据</li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
