import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Conversation, Message } from '@/lib/types';
import { askQuestion } from '@/lib/api'; // 记得导入我们刚才修改好的 API 函数

interface ChatStore {
  conversations: Conversation[];
  currentConversationId: string | null;
  selectedModel: string;
  isLoading: boolean; // 🆕 新增状态：是否正在生成中

  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string | null) => void;
  setSelectedModel: (model: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  setLoading: (loading: boolean) => void; // 🆕 新增
  
  // 🆕 核心修改：sendMessage 现在接收 file 参数，并处理整个发送流程
  sendMessage: (content: string, file?: File) => Promise<void>; 
  
  getCurrentConversation: () => Conversation | null;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      selectedModel: 'glm-4.5-flash',
      isLoading: false, // 🆕 初始化为 false

      addConversation: (conversation) =>
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: conversation.id,
        })),

      updateConversation: (id, updates) =>
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, ...updates, updatedAt: Date.now() } : conv
          ),
        })),

      deleteConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((conv) => conv.id !== id),
          currentConversationId:
            state.currentConversationId === id ? null : state.currentConversationId,
        })),

      setCurrentConversation: (id) =>
        set({ currentConversationId: id }),
      
      setSelectedModel: (model) => 
        set({ selectedModel: model }),

      setLoading: (loading) => set({ isLoading: loading }),

      addMessage: (conversationId, message) =>
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, message],
                  updatedAt: Date.now(),
                  // 如果是第一条消息，自动更新标题
                  title: conv.messages.length === 0 ? message.content.slice(0, 50) : conv.title,
                }
              : conv
          ),
        })),

      // 🔥 核心逻辑：发送消息
      sendMessage: async (content: string, file?: File) => {
        const { selectedModel, currentConversationId, addMessage, addConversation, setLoading } = get();
        
        // 1. 防止重复发送
        if (get().isLoading) return;
        setLoading(true);

        try {
          // 2. 确定会话 ID（如果没有当前会话，就新建一个）
          let conversationId = currentConversationId;
          if (!conversationId) {
            conversationId = crypto.randomUUID();
            const newConv: Conversation = {
              id: conversationId,
              title: content.slice(0, 30) || '新对话',
              messages: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            addConversation(newConv);
          }

          // 3. 构建用户消息对象
          const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: content, // 这里只存文本，图片目前由后端处理追加到 prompt 中
            timestamp: Date.now(),
          };
          
          // 4. 用户消息立即上屏
          addMessage(conversationId, userMessage);

          // 5. 调用后端 API (传入 file!)
          const answer = await askQuestion(content, selectedModel, file);

          // 6. AI 回复上屏
          const aiMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: answer,
            timestamp: Date.now(),
          };
          addMessage(conversationId, aiMessage);

        } catch (error) {
          console.error('发送消息失败:', error);
          // 可选：添加一条系统错误消息
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: '❌ 发送失败，请检查网络或服务器连接。',
            timestamp: Date.now(),
          };
          if (currentConversationId) {
             addMessage(currentConversationId, errorMessage);
          }
        } finally {
          setLoading(false);
        }
      },

      getCurrentConversation: () => {
        const state = get();
        return (
          state.conversations.find((conv) => conv.id === state.currentConversationId) || null
        );
      },
    }),
    {
      name: 'chat-storage',
      // 持久化时忽略 isLoading 状态，避免刷新页面卡在 loading
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        selectedModel: state.selectedModel,
      }),
    }
  )
);