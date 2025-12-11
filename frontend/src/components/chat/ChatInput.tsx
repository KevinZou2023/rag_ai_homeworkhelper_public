import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';

interface AttachedFile {
  file: File;
  type: 'image' | 'file';
  preview?: string;
}

interface ChatInputProps {
  onSend: (message: string, files?: AttachedFile[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = '输入消息... (支持 Ctrl+V 粘贴图片)',
}) => {
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachedFiles.length > 0) && !disabled) {
      onSend(message.trim(), attachedFiles.length > 0 ? attachedFiles : undefined);
      setMessage('');
      setAttachedFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // --- 核心逻辑提取：统一处理文件列表 ---
  const processFiles = (files: File[]) => {
    if (files.length === 0) return;

    files.forEach((file) => {
      const isImage = file.type.startsWith('image/');
      
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachedFiles((prev) => [
            ...prev,
            { file, type: 'image', preview: e.target?.result as string },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachedFiles((prev) => [...prev, { file, type: 'file' }]);
      }
    });
  };

  // 1. 处理点击按钮选择文件
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
    
    // 清空 input，防止选择相同文件不触发 onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 2. 新增：处理粘贴事件 (Ctrl+V)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // 获取剪贴板中的条目
    const items = e.clipboardData.items;
    const filesToProcess: File[] = [];

    for (let i = 0; i < items.length; i++) {
      // 如果剪贴板条目是文件（比如截图、复制的文件）
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) {
          filesToProcess.push(file);
        }
      }
    }

    // 如果剪贴板里有文件
    if (filesToProcess.length > 0) {
      // 阻止默认粘贴行为（防止把图片文件名粘贴进输入框，如果是截图通常不需要阻止，视体验而定，这里推荐阻止文件名的粘贴）
      // e.preventDefault(); 
      // 这里的 preventDefault 要小心，如果你想允许同时粘贴文字和图片，就不要阻止
      // 但为了体验更好，通常我们希望截图直接变预览，而不是在输入框里留一堆乱码
      
      // 简单策略：如果有图片，就不粘贴文字了（或者你可以根据需求调整）
      processFiles(filesToProcess);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px';
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-background">
      <div className="max-w-4xl mx-auto p-4">
        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((attached, index) => (
              <div
                key={index}
                className="relative group rounded-lg border border-border p-2 bg-muted/30"
              >
                {attached.type === 'image' && attached.preview ? (
                  <div className="relative">
                    <img
                      src={attached.preview}
                      alt={attached.file.name}
                      className="h-20 w-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pr-6">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs max-w-[100px] truncate">
                      {attached.file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.md"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            title="上传文件或图片"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste} // <--- 关键修改：绑定粘贴事件
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'min-h-[52px] max-h-[200px] resize-none pr-12',
                'focus-visible:ring-1'
              )}
              rows={1}
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            title="语音输入"
          >
            <Mic className="h-5 w-5" />
          </Button>

          <Button
            type="submit"
            size="icon"
            disabled={(!message.trim() && attachedFiles.length === 0) || disabled}
            className="h-10 w-10 flex-shrink-0"
            title="发送"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </form>
  );
};

export type { AttachedFile };