# RAG-based AI Assistance System (Full Stack)

This project is a full-stack, RAG (Retrieval-Augmented Generation) based AI assistance system. It features a modern web interface for interacting with an AI, which leverages a local knowledge base to provide informed answers.

---

# AI 作业辅助系统 (RAG 全栈版)

本项目是一个全栈的、基于“检索增强生成” (RAG) 模型的 AI 辅助系统。它拥有一个现代化的 Web 界面，用户可以与 AI 进行交互，而 AI 则利用本地知识库提供更精准的回答。

---

## 🌟 Features / 主要功能

-   **Full-Stack Application:** A complete solution with a React (TypeScript + Vite) frontend and a Node.js (Express) backend.
    -   **全栈应用:** 包含 React (TypeScript + Vite) 前端和 Node.js (Express) 后端的完整解决方案。
-   **Interactive Chat Interface:** A user-friendly chat UI supporting real-time conversations, multiple chat histories, and Markdown rendering for formatted AI responses.
    -   **交互式聊天界面:** 友好的聊天 UI，支持实时对话、多会话历史记录，并使用 Markdown 渲染格式化的 AI 回答。
-   **Image Recognition & OCR:** Supports uploading images for text and formula recognition (using GLM-4V).
    -   **图片识别与 OCR:** 支持上传图片进行文字和公式识别 (使用 GLM-4V)。
-   **Knowledge Base Management:** A built-in web interface to easily upload and delete local knowledge files (`.json`, `.txt`, `.md`). The AI will automatically use these files as its reference material.
    -   **知识库管理:** 内置的 Web 界面，可以轻松上传和删除本地知识文件 (`.json`, `.txt`, `.md`)。AI 会自动将这些文件作为参考资料。
-   **Smart RAG Backend:** The backend uses SiliconFlow embeddings and smart text splitting (handling small files as whole documents and splitting large ones by headers/paragraphs) to provide accurate context.
    -   **智能 RAG 后端:** 后端使用 SiliconFlow 向量嵌入和智能文本切分（将小文件视为完整文档，大文件按标题/段落切分）来提供准确的上下文。
-   **Math Formula Support:** Built-in support for rendering mathematical formulas using KaTeX.
    -   **数学公式支持:** 内置 KaTeX 支持，可完美渲染行内和块级数学公式。
-   **User Authentication:** A simple username-based login system to personalize the experience.
    -   **用户认证:** 基于用户名的简单登录系统，提供个性化体验。

## 📂 Project Structure / 项目结构

```
/
├── frontend/         # React Frontend Application (UI)
│   ├── src/
│   └── package.json
├── data/             # Knowledge base files (.json, .txt)
├── node_modules/     # Backend dependencies
├── server.js         # Backend Express server
├── package.json      # Backend package configuration
├── KNOWLEDGE_BASE_GUIDE.md # Knowledge Base Guide / 知识库指南
└── readme.md         # This file
```

## 🚀 Getting Started / 快速上手

Follow these steps to set up and run the project on your local machine. You will need to run two separate processes: one for the backend server and one for the frontend application.

请按照以下步骤在本地设置并运行项目。你需要分别运行后端服务器和前端应用这两个进程。

### Simplified Startup (Windows) / 简化启动 (Windows)

If you are on Windows, you can use the provided `start.bat` script to automate the entire startup process for both the backend and frontend.

如果你使用的是 Windows 系统，可以使用提供的 `start.bat` 脚本来自动化后端和前端的启动过程。

```bash
# 1. Navigate to the project root directory
# 1. 进入项目根目录
cd /path/to/rag_base_on_ai

# 2. Install dependencies (if not already done)
# 2. 安装依赖 (如果尚未安装)
npm install
cd frontend
npm install
cd ..

# 3. Configure API Key in server.js (if not already done)
# 3. 在 server.js 中配置 API 密钥 (如果尚未配置)

# 4. Run the startup script
# 4. 运行启动脚本
start.bat
```

This script will open two separate terminal windows: one for the backend server and one for the frontend development server.

该脚本将打开两个独立的终端窗口：一个用于后端服务器，另一个用于前端开发服务器。

---

### 1. Backend Setup / 后端设置

First, set up and start the backend server.

首先，设置并启动后端服务器。

```bash
# 1. Navigate to the project root directory
# 1. 进入项目根目录
cd /path/to/rag_base_on_ai

# 2. Install dependencies
# 2. 安装依赖
npm install
```

**3. Configure API Keys / 配置 API 密钥**

1.  Copy `config.example.json` to create a new file named `config.json`.
    *   复制 `config.example.json` 并重命名为 `config.json`。
2.  Open `config.json` and fill in your API keys.
    *   打开 `config.json` 并填入你的 API 密钥。

You can use ZhipuAI, DeepSeek, or Gemini. **Crucially, you need a SiliconFlow API Key for RAG (vector search) to work.**
你可以使用智谱 AI、DeepSeek 或 Gemini。**关键提示：你需要配置 SiliconFlow API Key 才能启用 RAG（向量检索）功能。**

```json
// config.json
{
  "ZHIPU_AI_API_KEY_VISION": "your_key_here", // Required for Image Recognition
  "ZHIPU_AI_API_KEY": "your_key_here",        // Required for GLM models
  "DEEPSEEK_API_KEY": "your_key_here",        // Optional
  "GEMINI_API_KEY": "your_key_here",          // Optional
  "SILICONFLOW_API_KEY": "your_key_here"      // REQUIRED for RAG/Embeddings
}
```

**4. Run the Backend Server / 运行后端服务器**

```bash
node server.js
```

The backend server will start on `http://localhost:3000`. The knowledge base files are stored in the `data` directory.

后端服务器将在 `http://localhost:3000` 上运行。知识库文件存储在 `data` 目录中。

---

### 2. Frontend Setup / 前端设置

In a **new terminal window**, set up and start the frontend application.

在 **一个新的终端窗口** 中，设置并启动前端应用。

```bash
# 1. Navigate to the frontend directory
# 1. 进入 frontend 目录
cd /path/to/rag_base_on_ai/frontend

# 2. Install dependencies
# 2. 安装依赖
npm install

# 3. Run the frontend development server
# 3. 运行前端开发服务器
npm run dev
```

The frontend development server will start, typically on `http://localhost:5173`.

前端开发服务器将会启动，通常地址为 `http://localhost:5173`。

## 📚 Adding Knowledge (Database) / 增加知识库 (数据库)

This project uses **JSON, TXT, and Markdown files** in the `data/` directory as its database. To add new knowledge, you simply create or edit these files.

本项目使用 `data/` 目录下的 **JSON, TXT 和 Markdown 文件** 作为数据库。要添加新知识，只需创建或编辑这些文件。

### 1. JSON Format / JSON 格式

Create a new file (e.g., `data/physics.json`) with the following structure:

创建一个新文件（例如 `data/physics.json`），结构如下：

```json
[
  {
    "id": "unique_id_001",
    "subject": "Physics",
    "type": "Concept",
    "question": "What is Newton's Second Law?",
    "correct_answer": "$F = ma$",
    "analysis": "Force equals mass times acceleration."
  },
  {
    "id": "unique_id_002",
    "subject": "Math",
    "type": "Calculation",
    "question": "Calculate $\\int x dx$",
    "correct_answer": "$\\frac{1}{2}x^2 + C$",
    "analysis": "Power rule for integration."
  }
]
```

### 2. Key Fields / 关键字段

*   **question (Required):** The content used for vector search. The AI retrieves answers based on this.
    *   **question (必填):** 用于向量检索的内容。AI 根据此字段检索答案。
*   **correct_answer:** The standard answer provided to the AI as context.
    *   **correct_answer:** 提供给 AI 作为上下文的标准答案。
*   **analysis:** Detailed explanation or derivation steps.
    *   **analysis:** 详细的解析或推导过程。

### 3. Apply Changes / 应用更改

After adding or modifying JSON files, **you must restart the backend server** for the changes to take effect (the vector database is built in-memory on startup).

添加或修改 JSON 文件后，**必须重启后端服务器**才能生效（向量数据库是在启动时在内存中构建的）。

> **For a comprehensive guide, please read `KNOWLEDGE_BASE_GUIDE.md`.**
>
> **有关详细指南，请阅读 `KNOWLEDGE_BASE_GUIDE.md`。**

## 💻 How to Use / 如何使用

1.  **Access the Application:** Open your web browser and go to the frontend URL (e.g., `http://localhost:5173`).
    -   **访问应用:** 打开浏览器并访问前端 URL (例如 `http://localhost:5173`)。
2.  **Log In:** Enter any username to log in.
    -   **登录:** 输入任意用户名即可登录。
3.  **Manage Knowledge Base:** Click the "知识库" (Knowledge Base) button in the sidebar. An interface will appear allowing you to see existing files, upload new ones, or delete them.
    -   **管理知识库:** 点击侧边栏的“知识库”按钮。在这里你可以查看、上传或删除知识库中的文件。
    -   **Guide:** For detailed instructions on creating knowledge base files, please refer to `KNOWLEDGE_BASE_GUIDE.md`.
    -   **指南:** 关于如何创建知识库文件的详细说明，请参考 `KNOWLEDGE_BASE_GUIDE.md`。
4.  **Start Chatting:** Close the knowledge base manager and start a conversation with the AI in the main chat window. The AI will use the documents in your knowledge base to answer questions.
    -   **开始聊天:** 关闭知识库管理器，在主聊天窗口与 AI 开始对话。AI 将会使用你知识库中的文档来回答问题。