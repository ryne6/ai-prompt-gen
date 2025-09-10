import React, { useState } from 'react';
import { Sparkles, Send, Lightbulb } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { aiService } from '../services/aiService';
import clsx from 'clsx';

const examples = [
  "帮我写一篇关于人工智能的科普文章",
  "制作一个项目计划书的模板", 
  "分析电商数据的用户行为",
  "写一份产品需求文档",
  "设计一个用户调研问卷"
];

export const InputSection: React.FC = () => {
  const {
    currentInput,
    setCurrentInput,
    setCurrentResult,
    setIsGenerating,
    isGenerating,
    settings,
    addToHistory
  } = useAppStore();

  const [showExamples, setShowExamples] = useState(false);

  const handleGenerate = async () => {
    if (!currentInput.trim() || isGenerating) return;

    setIsGenerating(true);
    setCurrentResult('');

    try {
      const response = await aiService.generatePrompt(
        {
          userInput: currentInput,
          style: settings.generationStyle,
          language: settings.language
        },
        settings.apiKey
      );

      if (response.success && response.prompt) {
        setCurrentResult(response.prompt);
        addToHistory({
          userInput: currentInput,
          generatedPrompt: response.prompt,
          category: detectCategory(currentInput)
        });
      } else {
        setCurrentResult(`生成失败: ${response.error || '未知错误'}`);
      }
    } catch (error) {
      setCurrentResult(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const detectCategory = (input: string): string => {
    const categories = {
      '写作': ['文章', '写作', '内容', '博客', '新闻'],
      '分析': ['分析', '数据', '统计', '研究', '报告'],
      '工作': ['计划', '方案', '文档', '会议', '项目'],
      '学习': ['学习', '教学', '课程', '知识', '解释'],
      '创意': ['设计', '创意', '策划', '营销', '广告']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        return category;
      }
    }
    return '其他';
  };

  const handleExampleClick = (example: string) => {
    setCurrentInput(example);
    setShowExamples(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    const isCmdOrCtrl = e.ctrlKey || e.metaKey;
    if (e.key === 'Enter' && isCmdOrCtrl) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI 提示词生成器</h1>
            <p className="text-gray-600">描述你的需求，AI 帮你生成专业的提示词</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`请描述你想要 AI 帮你做什么...

例如："帮我写一篇关于远程办公的文章"`}
              className={clsx(
                "input-field min-h-[120px] resize-none pr-12",
                isGenerating && "opacity-50 cursor-not-allowed"
              )}
              disabled={isGenerating}
              style={{
                imeMode: 'auto',
              }}
            />
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="absolute top-3 right-3 p-2 text-gray-400 hover:text-primary-600 transition-colors"
              title="查看示例"
            >
              <Lightbulb className="w-5 h-5" />
            </button>
          </div>

          {showExamples && (
            <div className="bg-gray-50 rounded-lg p-4 animate-slide-up">
              <h4 className="text-sm font-medium text-gray-700 mb-3">💡 试试这些示例：</h4>
              <div className="space-y-2">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="block w-full text-left text-sm text-gray-600 hover:text-primary-600 hover:bg-white p-2 rounded transition-colors"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {currentInput.length}/500 字符 · 按 {typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'}+Enter 快速生成
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={!currentInput.trim() || isGenerating}
              className={clsx(
                "btn-primary flex items-center gap-2",
                (!currentInput.trim() || isGenerating) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  生成提示词
                </>
              )}
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">
              ✅ 已配置 OpenAI API，可以开始生成专业提示词了！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
