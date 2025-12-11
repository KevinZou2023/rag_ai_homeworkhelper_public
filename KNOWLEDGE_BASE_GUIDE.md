# 知识库管理指南

## 目录

- [概述](#概述)
- [知识库架构](#知识库架构)
- [支持的文件格式](#支持的文件格式)
- [JSON 知识库格式规范](#json-知识库格式规范)
- [添加知识库步骤](#添加知识库步骤)
- [数学公式支持](#数学公式支持)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 概述

本系统采用 **RAG (Retrieval-Augmented Generation)** 架构，通过语义向量搜索从知识库中检索相关内容，增强 AI 模型的回答准确性。

### 系统特点

- **语义检索**：基于 SiliconFlow Embedding API 的向量相似度搜索
- **多模型支持**：支持智谱 AI、DeepSeek、Gemini 等多种模型
- **实时更新**：修改知识库文件后重启服务器即可生效
- **数学公式渲染**：前端支持 KaTeX 渲染行内和块级数学公式

---

## 知识库架构

```
rag_base_on_ai/
├── data/                          # 知识库目录
│   ├── scut.json                  # 结构化知识库（推荐）
│   ├── test.json                  # 测试数据
│   ├── mathematics_basics.txt     # 纯文本知识（不参与向量检索）
│   └── ... 其他 JSON 文件
├── server.js                      # 后端服务器
└── frontend/                      # 前端界面
```

### 工作流程

1. **启动阶段**：服务器读取 `data/` 目录下所有 `.json` 文件
2. **向量化**：每条知识条目生成语义向量并存储在内存
3. **用户提问**：将问题向量化并计算与知识库的余弦相似度
4. **检索增强**：相似度 ≥ 0.5 的条目作为上下文提供给 AI 模型
5. **生成回答**：AI 模型基于检索到的知识生成精准答案

---

## 支持的文件格式

### 1. JSON 格式

- **用途**：结构化题库、FAQ、文档问答
- **特点**：支持语义搜索、字段丰富
- **命名规范**：`*.json`（如 `physics.json`、`math_exam.json`）

### 2. TXT 格式

- **用途**：长篇文档进行分段向量化、短篇文档全篇向量化、说明文档
- **特点**：支持向量检索，可用于手动参考
- **命名规范**：`*.txt`

---

## JSON 知识库格式规范

### 基本结构

JSON 文件应包含一个**对象数组**，每个对象代表一个知识条目。

```json
[
  {
    "id": "unique_identifier",
    "subject": "学科名称",
    "type": "题型",
    "question": "问题内容",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "correct_answer": "标准答案",
    "analysis": "详细解析"
  }
]
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | String | 推荐 | 唯一标识符，用于追踪和调试 |
| `subject` | String | 推荐 | 学科/领域（如"线性代数"、"物理学"） |
| `type` | String | 推荐 | 题型（如"选择题"、"简答题"、"计算题"） |
| `question` | String | **必填** | 问题内容（系统根据此字段进行向量检索） |
| `options` | Array | 可选 | 选项列表（适用于选择题） |
| `correct_answer` | String | 推荐 | 标准答案 |
| `analysis` | String | 推荐 | 详细解析过程 |

### 兼容字段

- `golden_answer`：与 `correct_answer` 功能相同（旧版兼容）

---

## 添加知识库步骤

### 步骤 1：创建 JSON 文件

在 `data/` 目录下创建新的 JSON 文件，例如 `data/calculus.json`：

```json
[
  {
    "id": "calc_001",
    "subject": "微积分",
    "type": "计算题",
    "question": "求函数 f(x) = x^3 - 3x + 2 在 x = 2 处的导数。",
    "options": [],
    "correct_answer": "f'(2) = 9",
    "analysis": "f'(x) = 3x^2 - 3，代入 x = 2 得：f'(2) = 3*(2)^2 - 3 = 12 - 3 = 9"
  },
  {
    "id": "calc_002",
    "subject": "微积分",
    "type": "简答题",
    "question": "什么是导数的几何意义？",
    "options": [],
    "correct_answer": "导数表示函数曲线在某点处的切线斜率",
    "analysis": "导数 f'(x₀) 的几何意义是函数 y = f(x) 在点 (x₀, f(x₀)) 处的切线斜率。它反映了函数在该点附近的瞬时变化率。"
  }
]
```

### 步骤 2：验证 JSON 格式

使用在线工具（如 [JSONLint](https://jsonlint.com/)）验证 JSON 语法正确性。

### 步骤 3：重启服务器

```bash
# Windows
.\start.bat

# 或手动启动
node server.js
```

服务器启动时会自动：
- 扫描 `data/` 目录
- 加载所有 `.json` 文件
- 为每个知识条目生成向量
- 输出加载日志

### 步骤 4：验证加载

查看控制台输出，确认知识库已加载：

```
Building vector knowledge base...
Loaded 2 items from calculus.json
Loaded 5 items from scut.json
Vector knowledge base built successfully. Total 7 items loaded and embedded.
Server is running on http://localhost:3000
```

---

## 数学公式支持

前端支持 **KaTeX** 渲染数学公式，可在 `question`、`correct_answer`、`analysis` 字段中使用。

### 行内公式

使用单个 `$` 包裹：

```json
{
  "question": "计算 $\\int_{0}^{1} x^2 dx$ 的值",
  "correct_answer": "$\\frac{1}{3}$"
}
```

**渲染效果**：计算 $\int_{0}^{1} x^2 dx$ 的值

### 块级公式

使用双 `$$` 包裹：

```json
{
  "analysis": "$$\\begin{aligned} \\int_{0}^{1} x^2 dx &= \\left[\\frac{x^3}{3}\\right]_{0}^{1} \\\\ &= \\frac{1}{3} - 0 = \\frac{1}{3} \\end{aligned}$$"
}
```

**渲染效果**：

$$\begin{aligned} \int_{0}^{1} x^2 dx &= \left[\frac{x^3}{3}\right]_{0}^{1} \\ &= \frac{1}{3} - 0 = \frac{1}{3} \end{aligned}$$

### LaTeX 特殊符号转义

在 JSON 中需要对反斜杠进行转义：

| LaTeX 原始 | JSON 中写法 |
|-----------|------------|
| `\frac{1}{2}` | `"\\frac{1}{2}"` |
| `\int` | `"\\int"` |
| `\sum_{i=1}^{n}` | `"\\sum_{i=1}^{n}"` |
| `\begin{cases}` | `"\\begin{cases}"` |

### 常用数学符号

```json
{
  "analysis": "$$\\begin{cases} x_1 + x_2 - 3x_3 = 0 \\\\ 2x_1 + x_2 - 2x_3 = 0 \\end{cases}$$"
}
```

更多 LaTeX 语法参考：[KaTeX Supported Functions](https://katex.org/docs/supported.html)

---

## 最佳实践

### 1. 知识条目设计

✅ **推荐做法**：

```json
{
  "id": "phys_newton_001",
  "subject": "物理学",
  "type": "概念题",
  "question": "牛顿第二定律的数学表达式是什么？",
  "correct_answer": "$F = ma$",
  "analysis": "牛顿第二定律指出，物体的加速度与作用力成正比，与物体质量成反比。其中 $F$ 表示合外力（单位：牛顿），$m$ 表示质量（单位：千克），$a$ 表示加速度（单位：米/秒²）。"
}
```

❌ **避免做法**：

```json
{
  "question": "第二定律是啥？",  // 表述不清晰
  "correct_answer": "F=ma"      // 缺少详细解析
}
```

### 2. 文件组织

- **按学科分类**：`linear_algebra.json`、`calculus.json`
- **按难度分类**：`math_basic.json`、`math_advanced.json`
- **按类型分类**：`exam_2023.json`、`faq_physics.json`

### 3. ID 命名规范

建议使用 `学科缩写_主题_编号` 格式：

- `la_matrix_001`（线性代数-矩阵-001）
- `calc_integral_042`（微积分-积分-042）
- `phys_mechanics_015`（物理-力学-015）

### 4. 语义丰富度

为提高检索准确性，建议在 `question` 和 `analysis` 中包含：
- 关键概念
- 相关术语
- 公式符号
- 学科背景

### 5. 数据质量检查清单

- [ ] JSON 格式正确无误
- [ ] 每个对象都有 `question` 字段
- [ ] 数学公式反斜杠已转义
- [ ] `id` 字段唯一
- [ ] 答案详细且准确

---

## 常见问题

### Q1: 添加新知识库后未生效怎么办？

**A1**：需要重启服务器。向量知识库在启动时构建，运行时修改不会自动生效。

```bash
# 停止服务器（Ctrl + C）
# 重新启动
node server.js
```

### Q2: 如何调整语义相似度阈值？

**A2**：修改 `server.js` 中的 `SIMILARITY_THRESHOLD` 常量（默认 0.5）：

```javascript
const SIMILARITY_THRESHOLD = 0.5; // 提高阈值（如 0.7）会更严格
```

### Q3: 数学公式显示为纯文本怎么办？

**A3**：检查以下几点：
1. 公式使用 `$...$` 或 `$$...$$` 包裹
2. JSON 中反斜杠已转义（`\\frac` 而非 `\frac`）
3. 前端已加载 `katex.min.css`（已自动配置）

### Q4: 知识库容量限制是多少？

**A4**：向量存储在内存中，建议单个 JSON 文件不超过 1000 条。大型知识库应拆分为多个文件。

### Q5: 是否支持图片、PDF 等格式？

**A5**：当前版本支持 JSON 和 TXT 文本格式以及图片输入。未来版本将支持多模态内容。

### Q6: 如何查看知识库加载日志？

**A6**：启动服务器时观察控制台输出：

```
Building vector knowledge base...
Loaded 5 items from scut.json
Loaded 3 items from calculus.json
Vector knowledge base built successfully. Total 8 items loaded and embedded.
```

### Q7: 向量化失败怎么办？

**A7**：检查 `SILICONFLOW_API_KEY` 配置：

```javascript
// server.js 第13行
const SILICONFLOW_API_KEY = 'YOUR_KEY';
```

如未配置，系统会警告但仍可运行（不支持语义检索）。

---

## 技术支持

如有问题，请联系团队或查看：
- 项目文档：`README.md`
- 服务器日志：控制台输出
- 前端日志：浏览器开发者工具 Console

---

**版本**：v1.1  
**最后更新**：2025-12-01
**维护者**：开发团队
