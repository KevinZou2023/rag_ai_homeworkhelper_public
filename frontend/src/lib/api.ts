export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// 修改后的 askQuestion 函数：支持传入可选的 file 参数
// src/lib/api.ts

export async function askQuestion(question: string, model: string, file?: File): Promise<string> {
  const formData = new FormData();
  
  // 1. 填入数据
  formData.append('question', question);
  formData.append('model', model);
  if (file) {
    formData.append('file', file); // 这里的 key 必须是 'file'
  }

  // 2. 发送请求
  const response = await fetch('/api/ask', {
    method: 'POST',
    // ❌ 千万不要加 headers: { 'Content-Type': '...' }
    // ✅ 什么都不加，浏览器会自动处理 FormData 的 Header
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: '服务器响应异常' }));
    throw new Error(errorData.error || 'Failed to get response');
  }

  const data = await response.json();
  return data.answer;
}

export async function getFiles(): Promise<string[]> {
  const response = await fetch('/api/files');
  if (!response.ok) {
    throw new Error('Failed to fetch files');
  }
  return response.json();
}

export async function uploadFile(file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }
}

export async function deleteFile(filename: string): Promise<void> {
  const response = await fetch(`/api/files/${filename}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete file');
  }
}
