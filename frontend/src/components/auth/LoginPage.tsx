import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      alert('请输入用户名');
      return;
    }

    if (!password) {
      alert('请输入密码');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      alert('两次密码输入不一致');
      return;
    }

    // 简单验证（实际应该调用后端API）
    if (isLogin) {
      // 登录逻辑
      onLogin(username);
    } else {
      // 注册逻辑
      alert(`注册成功！欢迎 ${username}`);
      onLogin(username);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 dark:from-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">AI</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            智能对话系统
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            {isLogin ? '欢迎回来' : '创建新账户'}
          </p>
        </div>

        {/* Login/Register Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 border-2 border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">用户名</label>
              <Input
                type="text"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">密码</label>
              <Input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">确认密码</label>
                <Input
                  type="password"
                  placeholder="请再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              {isLogin ? (
                <>
                  <LogIn className="h-4 w-4" />
                  登录
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  注册
                </>
              )}
            </Button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {isLogin ? '没有账号？立即注册' : '已有账号？立即登录'}
            </button>
          </div>

          {/* Demo Account */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200 text-center font-medium">
              💡 演示账号：任意用户名和密码即可登录
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-8">
          © 2025 智能对话系统. All rights reserved.
        </p>
      </div>
    </div>
  );
};
