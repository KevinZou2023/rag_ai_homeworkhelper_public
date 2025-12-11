import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput, type AttachedFile } from '@/components/chat/ChatInput';
import { WelcomeScreen } from '@/components/chat/WelcomeScreen';
import { KnowledgeBaseManager } from '@/components/chat/KnowledgeBaseManager';
import { LoginPage } from '@/components/auth/LoginPage';
import { useChatStore } from '@/stores/chatStore';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { askQuestion } from '@/lib/api';
import type { Conversation, Message } from '@/lib/types';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const {
    conversations,
    currentConversationId,
    addConversation,
    addMessage,
    setCurrentConversation,
    getCurrentConversation,
    selectedModel, // 获取当前选择的模型
  } = useChatStore();

  const [isLoading, setIsLoading] = useState(false);
  const { ref: chatContainerRef, scrollToBottom } = useAutoScroll<HTMLDivElement>();

  const currentConversation = getCurrentConversation();

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, scrollToBottom]);

  const createNewConversation = (): string => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      title: '新对话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addConversation(newConv);
    return newConv.id;
  };

  const handleNewChat = () => {
    createNewConversation();
  };

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
    localStorage.setItem('username', user);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    localStorage.removeItem('username');
    // 可选：清除对话历史
    // localStorage.removeItem('chat-storage');
  };

  const handleChangeAccount = (newUsername: string) => {
    setUsername(newUsername);
    localStorage.setItem('username', newUsername);
  };

  // 修改后的 handleSendMessage
  const handleSendMessage = async (content: string, files?: AttachedFile[]) => {
    let convId = currentConversationId;

    // 如果没有当前会话，创建一个新的
    if (!convId) {
      convId = createNewConversation();
    }

    // 构建展示给用户看的消息内容（加上附件文件名）
    let messageContent = content;
    if (files && files.length > 0) {
      const fileInfo = files.map(f => `[附件: ${f.file.name}]`).join(' ');
      messageContent = `${content}\n\n${fileInfo}`;
    }

    // 添加用户消息到界面
    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
    };
    addMessage(convId, userMessage);

    // 获取 AI 回复
    setIsLoading(true);
    try {
      // 🟢 关键修改在这里：
      // 1. 从 files 数组中取出第一个文件对象 (File)
      const fileToUpload = files && files.length > 0 ? files[0].file : undefined;

      // 2. 将 fileToUpload 作为第 3 个参数传给 askQuestion
      // (前提是你已经按之前的步骤修改了 api.ts)
      const answer = await askQuestion(content, selectedModel, fileToUpload);

      const aiMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: answer,
        timestamp: Date.now(),
      };
      addMessage(convId, aiMessage);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试。',
        timestamp: Date.now(),
      };
      addMessage(convId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleRegenerate = async () => {
    if (!currentConversation || currentConversation.messages.length < 2) return;

    const lastUserMessage = [...currentConversation.messages]
      .reverse()
      .find((msg) => msg.role === 'user');

    if (lastUserMessage) {
      // Remove last AI message
      const messagesWithoutLast = currentConversation.messages.slice(0, -1);
      // This is a simplified approach - in production, you'd want a proper update method
      
      // Re-ask the question
      setIsLoading(true);
      try {
        // 将选择的模型传给API
        const answer = await askQuestion(lastUserMessage.content, selectedModel);
        const aiMessage: Message = {
          id: `msg_${Date.now()}_ai`,
          role: 'assistant',
          content: answer,
          timestamp: Date.now(),
        };
        addMessage(currentConversation.id, aiMessage);
      } catch (error) {
        console.error('Failed to regenerate response:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Check if already logged in
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
      setIsLoggedIn(true);
    }
  }, []);

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <MainLayout 
        onNewChat={handleNewChat}
        onOpenKnowledgeBase={() => setShowKnowledgeBase(true)}
        username={username}
        onLogout={handleLogout}
        onChangeAccount={handleChangeAccount}
      >
        <div className="flex flex-col h-full">
        {/* Chat Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <WelcomeScreen onPromptClick={handlePromptClick} />
          ) : (
            <div className="max-w-4xl mx-auto">
              {currentConversation.messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                  onRegenerate={
                    message.role === 'assistant' &&
                    message.id === currentConversation.messages[currentConversation.messages.length - 1]?.id
                      ? handleRegenerate
                      : undefined
                  }
                />
              ))}
              {isLoading && (
                <div className="flex gap-4 py-6 px-4 bg-muted/30">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                    AI
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-2">AI 助手</div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

          {/* Input Area */}
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder="输入消息... (按 Enter 发送，Shift+Enter 换行)"
          />
        </div>
      </MainLayout>

      {/* Knowledge Base Manager Modal */}
      <KnowledgeBaseManager
        isOpen={showKnowledgeBase}
        onClose={() => setShowKnowledgeBase(false)}
      />
    </>
  );
}

export default App;
