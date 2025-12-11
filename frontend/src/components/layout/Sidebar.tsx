import React from 'react';
import { Plus, Search, MessageSquare, Trash2, Database } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserMenu } from './UserMenu';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/stores/chatStore';
import type { Conversation } from '@/lib/types';

interface SidebarProps {
  onNewChat: () => void;
  onOpenKnowledgeBase?: () => void;
  username?: string;
  onLogout?: () => void;
  onChangeAccount?: (newUsername: string) => void;
}

const groupConversationsByDate = (conversations: Conversation[]) => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const sevenDays = 7 * oneDay;

  const groups = {
    today: [] as Conversation[],
    yesterday: [] as Conversation[],
    lastWeek: [] as Conversation[],
    older: [] as Conversation[],
  };

  conversations.forEach((conv) => {
    const diff = now - conv.updatedAt;
    if (diff < oneDay) {
      groups.today.push(conv);
    } else if (diff < 2 * oneDay) {
      groups.yesterday.push(conv);
    } else if (diff < sevenDays) {
      groups.lastWeek.push(conv);
    } else {
      groups.older.push(conv);
    }
  });

  return groups;
};

// 定义可选的模型
const availableModels = [
  { id: 'glm-4.5-flash', name: 'Zhipu GLM-4.5-Flash' },
  { id: 'glm-4', name: 'Zhipu GLM-4' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat' },
  { id: 'gemini-2.5-flash', name: 'Google Gemini 2.5 Flash' },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  onNewChat, 
  onOpenKnowledgeBase,
  username = 'User',
  onLogout = () => {},
  onChangeAccount = () => {}
}) => {
  const { 
    conversations, 
    currentConversationId, 
    setCurrentConversation, 
    deleteConversation,
    selectedModel,
    setSelectedModel
  } = useChatStore();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedConversations = groupConversationsByDate(filteredConversations);

  const renderConversationGroup = (title: string, convs: Conversation[]) => {
    if (convs.length === 0) return null;

    return (
      <div key={title} className="mb-4">
        <h3 className="text-xs font-semibold text-gray-600 mb-2 px-3">{title}</h3>
        <div className="space-y-1">
          {convs.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                currentConversationId === conv.id
                  ? 'bg-gray-200 text-gray-900'
                  : 'hover:bg-gray-100 text-gray-700'
              )}
              onClick={() => setCurrentConversation(conv.id)}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 truncate text-sm">{conv.title || '新对话'}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 space-y-2">
        <Button onClick={onNewChat} className="w-full justify-start gap-2">
          <Plus className="h-5 w-5" />
          新建对话
        </Button>
        {onOpenKnowledgeBase && (
          <Button 
            onClick={onOpenKnowledgeBase} 
            variant="outline" 
            className="w-full justify-start gap-2"
          >
            <Database className="h-5 w-5" />
            知识库管理
          </Button>
        )}
        
        {/* 模型选择器 */}
        <div className="space-y-1 pt-2">
          <label htmlFor="model-select" className="text-sm font-medium text-gray-700 px-1">
            选择模型
          </label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="搜索对话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto p-2 bg-white">
        {renderConversationGroup('今天', groupedConversations.today)}
        {renderConversationGroup('昨天', groupedConversations.yesterday)}
        {renderConversationGroup('最近7天', groupedConversations.lastWeek)}
        {renderConversationGroup('更早', groupedConversations.older)}
        
        {filteredConversations.length === 0 && (
          <div className="text-center text-gray-600 text-sm py-8">
            暂无对话记录
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t-2 border-gray-200 bg-white">
        <UserMenu 
          username={username}
          onLogout={onLogout}
          onChangeAccount={onChangeAccount}
        />
      </div>
    </aside>
  );
};
