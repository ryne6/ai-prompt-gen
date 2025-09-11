import React, { useState, useEffect } from 'react';
import { Download, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { IpcRendererWithStore } from '../types/window';

interface UpdateInfo {
  version: string;
  releaseNotes?: string;
  releaseDate?: string;
}

interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  total: number;
  transferred: number;
}

export const UpdateNotification: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!window.ipcRenderer) return;

    const ipc = window.ipcRenderer as unknown as IpcRendererWithStore;

    // 监听更新事件
    ipc.onUpdateChecking(() => {
      setIsChecking(true);
      setError(null);
    });

    ipc.onUpdateAvailable((info: UpdateInfo) => {
      setUpdateInfo(info);
      setIsChecking(false);
      setShow(true);
    });

    ipc.onUpdateNotAvailable(() => {
      setIsChecking(false);
      setShow(false);
    });

    ipc.onUpdateError((error: string) => {
      setError(error);
      setIsChecking(false);
      setIsDownloading(false);
    });

    ipc.onUpdateProgress((progress: UpdateProgress) => {
      setProgress(progress);
      setIsDownloading(true);
    });

    ipc.onUpdateDownloaded(() => {
      setIsDownloaded(true);
      setIsDownloading(false);
      setProgress(null);
    });

    // 手动检查更新
    const handleCheckUpdate = () => {
      ipc.checkForUpdate();
    };

    // 添加检查更新按钮到页面
    const checkButton = document.createElement('button');
    checkButton.textContent = '检查更新';
    checkButton.className = 'fixed bottom-4 right-4 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600';
    checkButton.onclick = handleCheckUpdate;
    document.body.appendChild(checkButton);

    return () => {
      document.body.removeChild(checkButton);
    };
  }, []);

  const handleDownload = () => {
    if (window.ipcRenderer) {
      // 触发下载更新
      (window.ipcRenderer as unknown as IpcRendererWithStore).send('update:download');
    }
  };

  const handleInstall = () => {
    if (window.ipcRenderer) {
      (window.ipcRenderer as unknown as IpcRendererWithStore).installUpdate();
    }
  };

  const handleClose = () => {
    setShow(false);
    setUpdateInfo(null);
    setIsDownloaded(false);
    setProgress(null);
    setError(null);
  };

  if (!show && !isChecking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">应用更新</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isChecking && (
          <div className="text-center py-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p>正在检查更新...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center text-red-600 mb-4">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>更新失败: {error}</p>
          </div>
        )}

        {updateInfo && !isDownloaded && (
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              发现新版本 <span className="font-semibold">{updateInfo.version}</span>
            </p>
            {updateInfo.releaseNotes && (
              <div className="text-sm text-gray-600 mb-4">
                <p className="font-medium">更新内容:</p>
                <div dangerouslySetInnerHTML={{ __html: updateInfo.releaseNotes }} />
              </div>
            )}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  下载中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  立即下载
                </>
              )}
            </button>
          </div>
        )}

        {isDownloading && progress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>下载进度</span>
              <span>{Math.round(progress.percent)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(progress.transferred / 1024 / 1024)}MB / {Math.round(progress.total / 1024 / 1024)}MB
            </p>
          </div>
        )}

        {isDownloaded && (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">更新已下载完成，是否立即安装？</p>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300"
              >
                稍后安装
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                立即安装
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
