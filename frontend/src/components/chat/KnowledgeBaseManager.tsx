import React, { useState, useEffect } from 'react';
import { Upload, File, Trash2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getFiles, uploadFile, deleteFile } from '@/lib/api';

interface KnowledgeBaseManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({
  isOpen,
  onClose,
}) => {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const fileList = await getFiles();
      setFiles(fileList);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadFile(file);
      await loadFiles();
      alert(`文件 "${file.name}" 上传成功！`);
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteFile = async (filename: string) => {
    if (!confirm(`确定要删除文件 "${filename}" 吗？`)) return;

    try {
      await deleteFile(filename);
      await loadFiles();
      alert(`文件 "${filename}" 已删除`);
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('删除失败，请重试');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border-2 border-gray-300 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">知识库管理</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-200 dark:hover:bg-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800">
          {/* Upload Section */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-bold text-gray-800 dark:text-gray-200">上传文件</label>
            <div className="flex gap-2">
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="flex-1 text-sm text-gray-700 dark:text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  cursor-pointer
                  border-2 border-gray-300 dark:border-gray-600 rounded-md
                  bg-gray-50 dark:bg-gray-700"
                accept=".txt,.md,.pdf,.doc,.docx"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={loadFiles}
                disabled={loading}
                title="刷新列表"
                className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
              支持格式：.txt, .md, .pdf, .doc, .docx
            </p>
          </div>

          {/* Files List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                知识库文件 ({files.length})
              </label>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="font-medium">加载中...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                <Upload className="h-8 w-8 mx-auto mb-2 opacity-70" />
                <p className="font-semibold">暂无文件</p>
                <p className="text-xs mt-1">上传文件到知识库开始使用</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((filename) => (
                  <div
                    key={filename}
                    className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <File className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{filename}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                      onClick={() => handleDeleteFile(filename)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
          <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
};
