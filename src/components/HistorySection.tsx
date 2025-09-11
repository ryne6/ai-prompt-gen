import React, { useState } from 'react';
import { History, Search, Trash2, Copy, Star, ChevronDown, ChevronRight, Calendar, Tag } from 'lucide-react';
import { GeneratedPrompt, useAppStore } from '../store/useAppStore';
import clsx from 'clsx';

export const HistorySection: React.FC = () => {
  const { history, removeFromHistory, ratePrompt, setCurrentInput, setCurrentResult } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);

  const categories = ['全部', ...Array.from(new Set(history.map(item => item.category).filter(Boolean)))];

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.userInput.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.generatedPrompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleReusePrompt = (item: GeneratedPrompt) => {
    setCurrentInput(item.userInput);
    setCurrentResult(item.generatedPrompt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return new Date(date).toLocaleDateString();
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">历史记录</h2>
              <p className="text-gray-600">共 {history.length} 条生成记录</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronDown className={clsx("w-5 h-5 transition-transform", isCollapsed && "rotate-180")} />
          </button>
        </div>

        {!isCollapsed && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索历史记录..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field min-w-[120px]"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || selectedCategory !== '全部' ? '没有找到匹配的记录' : '暂无历史记录'}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredHistory.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{formatDate(item.timestamp)}</span>
                            {item.category && (
                              <>
                                <Tag className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{item.category}</span>
                              </>
                            )}
                          </div>
                          <p className="text-gray-800 font-medium">{item.userInput}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleReusePrompt(item)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            复用
                          </button>
                          <button
                            onClick={() => toggleExpanded(item.id)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <ChevronRight className={clsx(
                              "w-4 h-4 transition-transform",
                              expandedItems.has(item.id) && "rotate-90"
                            )} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedItems.has(item.id) && (
                      <div className="p-4 bg-white border-t border-gray-200">
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">生成的提示词：</h4>
                          <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                            {item.generatedPrompt}
                          </pre>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyPrompt(item.generatedPrompt)}
                              className="btn-secondary flex items-center gap-2 text-sm"
                            >
                              <Copy className="w-3 h-3" />
                              复制
                            </button>
                            
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => ratePrompt(item.id, star)}
                                  className={clsx(
                                    "w-4 h-4 transition-colors",
                                    star <= (item.rating || 0)
                                      ? "text-yellow-400"
                                      : "text-gray-300 hover:text-yellow-300"
                                  )}
                                >
                                  <Star className="w-4 h-4 fill-current" />
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => removeFromHistory(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="删除记录"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
