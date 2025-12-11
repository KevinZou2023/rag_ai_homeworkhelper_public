import React, { useState } from 'react';
import { LogOut, UserPlus, RefreshCw, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';

interface UserMenuProps {
  username: string;
  onLogout: () => void;
  onChangeAccount: (newUsername: string) => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ username, onLogout, onChangeAccount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showChangeAccount, setShowChangeAccount] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      onLogout();
      setIsOpen(false);
    }
  };

  const handleChangeAccount = () => {
    if (!newUsername.trim()) {
      alert('请输入新的用户名');
      return;
    }
    if (!newPassword.trim()) {
      alert('请输入密码');
      return;
    }
    
    onChangeAccount(newUsername);
    setShowChangeAccount(false);
    setNewUsername('');
    setNewPassword('');
    setIsOpen(false);
    alert(`已切换到账号: ${newUsername}`);
  };

  const handleRegister = () => {
    alert('注册功能将跳转到注册页面');
    onLogout();
  };

  return (
    <>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 w-full p-3 rounded-lg bg-white hover:bg-gray-100 transition-colors border border-gray-200"
      >
        <Avatar fallback={username.charAt(0).toUpperCase()} className="bg-blue-600 text-white" />
        <div className="flex-1 min-w-0 text-left">
          <div className="font-medium text-sm truncate text-gray-900">{username}</div>
          <div className="text-xs text-gray-600">点击管理账户</div>
        </div>
      </button>

      {/* User Menu Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full border-2 border-gray-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">账户管理</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {!showChangeAccount ? (
                <>
                  {/* Current User Info */}
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <Avatar 
                      fallback={username.charAt(0).toUpperCase()} 
                      className="bg-blue-600 text-white w-12 h-12 text-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900">{username}</div>
                      <div className="text-sm text-gray-600">当前登录账户</div>
                    </div>
                  </div>

                  {/* Menu Actions */}
                  <div className="space-y-2">
                    {/* Change Account */}
                    <button
                      onClick={() => setShowChangeAccount(true)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-100 transition-colors text-left"
                    >
                      <RefreshCw className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">切换账号</div>
                        <div className="text-xs text-gray-600">登录到其他账户</div>
                      </div>
                    </button>

                    {/* Register New Account */}
                    <button
                      onClick={handleRegister}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-100 transition-colors text-left"
                    >
                      <UserPlus className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">注册新账号</div>
                        <div className="text-xs text-gray-600">创建新的账户</div>
                      </div>
                    </button>

                    {/* Settings (Coming Soon) */}
                    <button
                      disabled
                      className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed text-left"
                    >
                      <Settings className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-600">账户设置</div>
                        <div className="text-xs text-gray-500">即将推出</div>
                      </div>
                    </button>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-red-300 bg-red-50 hover:bg-red-100 transition-colors text-left"
                    >
                      <LogOut className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <div className="font-semibold text-red-700">退出登录</div>
                        <div className="text-xs text-red-600">退出当前账户</div>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Change Account Form */}
                  <div className="space-y-4">
                    <div>
                      <button
                        onClick={() => setShowChangeAccount(false)}
                        className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1"
                      >
                        ← 返回
                      </button>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">切换账号</h3>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-800">
                        用户名
                      </label>
                      <Input
                        type="text"
                        placeholder="请输入用户名"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full bg-gray-50 border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-800">
                        密码
                      </label>
                      <Input
                        type="password"
                        placeholder="请输入密码"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-gray-50 border-gray-300"
                      />
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-800">
                        💡 演示模式：输入任意用户名和密码即可切换账号
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowChangeAccount(false)}
                        variant="outline"
                        className="flex-1 border-2 border-gray-300"
                      >
                        取消
                      </Button>
                      <Button
                        onClick={handleChangeAccount}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        切换账号
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
