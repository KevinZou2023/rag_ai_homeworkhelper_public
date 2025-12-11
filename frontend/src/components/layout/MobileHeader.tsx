import React from 'react';
import { Menu, Plus, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';

interface MobileHeaderProps {
  onNewChat: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onNewChat }) => {
  const { toggleSidebar, darkMode, toggleDarkMode } = useUIStore();

  return (
    <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-10">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="text-lg font-semibold">AI 助手</h1>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={onNewChat}>
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
