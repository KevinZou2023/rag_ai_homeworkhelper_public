import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  onNewChat: () => void;
  onOpenKnowledgeBase?: () => void;
  username?: string;
  onLogout?: () => void;
  onChangeAccount?: (newUsername: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  onNewChat,
  onOpenKnowledgeBase,
  username,
  onLogout,
  onChangeAccount
}) => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'lg:block'
        )}
      >
        <Sidebar 
          onNewChat={onNewChat}
          onOpenKnowledgeBase={onOpenKnowledgeBase}
          username={username}
          onLogout={onLogout}
          onChangeAccount={onChangeAccount}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader onNewChat={onNewChat} />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};
