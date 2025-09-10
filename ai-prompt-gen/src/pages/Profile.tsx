import { SettingsSection } from '../components/SettingsSection';
import { X } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">个人信息设置</h1>
        <button
          onClick={() => window.close()}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          title="关闭窗口"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <SettingsSection />
    </div>
  );
}


