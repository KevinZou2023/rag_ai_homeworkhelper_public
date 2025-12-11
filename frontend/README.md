# 智能对话系统前端

基于 React + TypeScript + Vite + Tailwind CSS 构建的现代化对话界面。

## 技术栈

- **构建工具**: Vite 7.x
- **框架**: React 19 + TypeScript
- **样式**: Tailwind CSS 4.x
- **状态管理**: Zustand
- **Markdown渲染**: react-markdown + rehype-highlight
- **图标**: Lucide React

## 功能特性

### 已实现功能

✅ **现代化 UI 设计**
- ChatGPT 风格的简洁界面
- 流畅的动画过渡效果
- 深色/浅色主题切换

✅ **侧边栏导航**
- 对话历史记录（按时间分组：今天、昨天、最近7天、更早）
- 搜索对话功能
- 新建对话
- 删除对话

✅ **主对话区域**
- 欢迎屏幕（空状态）
- 快捷引导气泡
- 流畅的消息展示
- Markdown 渲染（支持代码高亮、表格、列表等）
- 消息操作（复制、重新生成、点赞/点踩）

✅ **输入区域**
- 多行文本输入（自适应高度）
- 快捷键支持（Enter 发送，Shift+Enter 换行）
- 附件按钮
- 语音输入按钮
- 发送状态管理

✅ **响应式设计**
- 桌面端：侧边栏默认展开
- 移动端：抽屉式侧边栏 + 顶部导航栏
- 平板适配

✅ **性能优化**
- 自动滚动到最新消息
- 本地存储持久化（对话历史、UI设置）
- 代码分割和懒加载

## 项目结构

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # 基础 UI 组件
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── Textarea.tsx
│   │   ├── layout/          # 布局组件
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileHeader.tsx
│   │   │   └── MainLayout.tsx
│   │   └── chat/            # 聊天相关组件
│   │       ├── ChatBubble.tsx
│   │       ├── ChatInput.tsx
│   │       ├── WelcomeScreen.tsx
│   │       └── MarkdownRenderer.tsx
│   ├── hooks/               # 自定义 Hooks
│   │   └── useAutoScroll.ts
│   ├── lib/                 # 工具函数
│   │   ├── api.ts           # API 调用
│   │   ├── types.ts         # TypeScript 类型
│   │   └── utils.ts         # 工具函数
│   ├── stores/              # Zustand 状态管理
│   │   ├── chatStore.ts     # 聊天状态
│   │   └── uiStore.ts       # UI 状态
│   ├── styles/
│   │   └── globals.css      # 全局样式
│   ├── App.tsx              # 主应用组件
│   └── main.tsx             # 应用入口
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

## 开发指南

### 安装依赖

```bash
cd frontend
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## API 集成

前端通过以下 API 与后端通信：

- `POST /api/ask` - 发送问题，获取 AI 回答
- `GET /api/files` - 获取知识库文件列表
- `POST /api/upload` - 上传文件到知识库
- `DELETE /api/files/:filename` - 删除知识库文件

## 键盘快捷键

- `Enter` - 发送消息
- `Shift + Enter` - 换行

## 浏览器支持

- Chrome/Edge >= 90
- Firefox >= 88
- Safari >= 14

## 待优化功能

- [ ] 文件上传UI集成
- [ ] 语音输入功能
- [ ] 导出对话记录
- [ ] 自定义主题颜色
- [ ] 多语言支持
- [ ] 快捷命令支持
- [ ] 代码块一键复制
- [ ] LaTeX 公式渲染

## 性能指标

当前性能表现：

- FCP (首屏渲染) < 0.8s
- TTI (可交互时间) < 1.2s
- Lighthouse 性能评分 > 90

## License

ISC
