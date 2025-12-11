import React from 'react';
import { Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { MarkdownRenderer } from './MarkdownRenderer';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';

interface ChatBubbleProps {
  message: Message;
  onRegenerate?: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onRegenerate }) => {
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div
      className={cn(
        'group flex gap-4 py-6 px-4 transition-colors',
        !isUser && 'bg-muted/30'
      )}
    >
      <Avatar
        fallback={isUser ? 'U' : 'AI'}
        className={cn(
          'mt-1',
          isUser ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
        )}
      />
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="font-semibold">{isUser ? '你' : 'AI 助手'}</div>
        <div className="text-sm">
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>
        {!isUser && (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCopy}
              title="复制"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onRegenerate}
              title="重新生成"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="点赞">
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="点踩">
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
