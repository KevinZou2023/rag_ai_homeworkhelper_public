const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
const multer = require('multer');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// --- API Keys & Model Configuration ---
let config = {};
try {
    config = require('./config.json');
} catch (error) {
    console.error("Error loading config.json. Please ensure it exists and is valid JSON.");
    console.error("You can copy config.example.json to config.json and fill in your keys.");
    process.exit(1);
}

const {
    ZHIPU_AI_API_KEY_VISION,
    ZHIPU_AI_API_KEY,
    DEEPSEEK_API_KEY,
    GEMINI_API_KEY,
    SILICONFLOW_API_KEY
} = config;

const DEFAULT_MODEL = 'glm-4.5-flash';

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const KNOWLEDGE_FILE = 'scut.json';
const SIMILARITY_THRESHOLD = 0.5; // 语义相似度阈值

// --- Gemini Client Initialization (For Chat Only) ---
// let embeddingModel; // Removed: Using SiliconFlow for embeddings
// if (GEMINI_API_KEY && !GEMINI_API_KEY.includes('YOUR_KEY')) {
//     const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
//     embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
// }

// --- 在内存中缓存向量知识库 ---
let vectorKnowledgeBase = []; // format: { original: object, vector: number[] }

// --- RAG v2: Semantic Search ---

/**
 * 计算两个向量之间的余弦相似度
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number} Similarity score between -1 and 1
 */
function calculateCosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
        return 0;
    }
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    if (magA === 0 || magB === 0) {
        return 0;
    }
    return dotProduct / (magA * magB);
}

/**
 * 使用 SiliconFlow (baai/bge-m3) 将文本转换为向量
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function embedText(text) {
    if (!SILICONFLOW_API_KEY) {
        console.error("SiliconFlow API Key is not configured.");
        return null;
    }
    try {
        const response = await fetch('https://api.siliconflow.cn/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "baai/bge-m3",
                input: text
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`SiliconFlow Embedding Error: ${response.status} ${response.statusText} - ${errorText}`);
            return null;
        }

        const data = await response.json();
        if (data.data && data.data.length > 0 && data.data[0].embedding) {
            return data.data[0].embedding;
        }
        console.error("Unexpected response format from SiliconFlow embedding:", data);
        return null;
    } catch (error) {
        console.error("Error embedding text:", error);
        return null;
    }
}

/**
 * 构建向量知识库缓存 (支持 JSON 和 TXT)
 */
async function buildVectorKnowledgeBase() {
    if (!SILICONFLOW_API_KEY) {
        console.log("Skipping vector knowledge base build: SiliconFlow API Key not configured.");
        return;
    }
    console.log('Building vector knowledge base...');
    const newKnowledgeBase = [];
    
    try {
        const files = await fs.readdir(DATA_DIR);
        // 注意：这里不再过滤 .json，而是读取所有文件
        
        for (const file of files) {
            if (file === '.gitkeep') continue;
            
            const filePath = path.join(DATA_DIR, file);
            const ext = path.extname(file).toLowerCase(); // 获取文件后缀
            let itemsAdded = 0;

            try {
                const fileContent = await fs.readFile(filePath, 'utf-8');

                // === 分支 1：处理 JSON 结构化题库 ===
                if (ext === '.json') {
                    const jsonData = JSON.parse(fileContent);
                    if (Array.isArray(jsonData)) {
                        for (const item of jsonData) {
                            if (item.question) {
                                // 构建 JSON 的 Embedding 文本
                                let textToEmbed = `科目: ${item.subject || '未知'}\n题型: ${item.type || '未知'}\n问题: ${item.question}`;
                                if (item.options && Array.isArray(item.options)) textToEmbed += `\n选项: ${item.options.join(', ')}`;
                                if (item.correct_answer) textToEmbed += `\n标准答案: ${item.correct_answer}`;
                                if (item.analysis) textToEmbed += `\n解析: ${item.analysis}`;
                                if (item.golden_answer) textToEmbed += `\n答案: ${item.golden_answer}`;

                                const vector = await embedText(textToEmbed);
                                if (vector) {
                                    newKnowledgeBase.push({ original: item, vector: vector });
                                    itemsAdded++;
                                }
                            }
                        }
                    }
                } 
                // === 分支 2：处理 TXT / MD 纯文本文件 (智能长度判断版) ===
                else if (ext === '.txt' || ext === '.md') {
                    console.log(`Processing text document: ${file}`);
                    
                    let chunks = [];
                    const SMALL_FILE_LIMIT = 2000; // 【核心设置】定义什么是“小文件” (比如2000字符以内)

                    // 策略 S (Smart): 如果文件很小，直接作为整体，不切分
                    // 这样可以保留全文上下文，效果等同于旧版代码
                    if (fileContent.length < SMALL_FILE_LIMIT) {
                        console.log(`File is small (${fileContent.length} chars), keeping as whole document.`);
                        chunks = [fileContent]; 
                    } 
                    // 策略 A: 显式 Markdown 分割线
                    else if (fileContent.includes('---')) {
                        console.log('Detected Markdown separators (---), splitting by separator...');
                        chunks = fileContent.split(/[\r\n]+---[\r\n]+/);
                    } 
                    // 策略 B: 标题切分
                    else if (/^#{1,3}\s/m.test(fileContent)) {
                        console.log('Detected Markdown headers, splitting by headers...');
                        chunks = fileContent.split(/(?=^#{1,3}\s)/m);
                    }
                    // 策略 C: 段落切分 (保底)
                    else {
                        console.log('No structure detected, splitting by paragraphs...');
                        chunks = fileContent.split(/\n\s*\n/);
                    }

                    // 进一步清洗和过滤
                    const validChunks = chunks
                        .map(p => p.trim())
                        .filter(p => p.length > 20); // 过滤掉太短的碎片

                    for (const p of validChunks) {
                        // 提取标题逻辑：如果是全量小文件，直接用文件名当标题
                        let questionTitle = '相关参考资料';
                        if (fileContent.length < SMALL_FILE_LIMIT) {
                            questionTitle = `全文参考: ${file.replace(ext, '')}`;
                        } else {
                            // 大文件切片，尝试提取第一行作为小标题
                            questionTitle = p.split('\n')[0].replace(/[#*]/g, '').trim().substring(0, 50);
                        }
                        
                        const vector = await embedText(p);
                        if (vector) {
                            newKnowledgeBase.push({
                                original: {
                                    subject: file,            
                                    type: fileContent.length < SMALL_FILE_LIMIT ? '完整文档' : '文档片段',        
                                    question: questionTitle, 
                                    analysis: p               // 这里是重点：如果是小文件，p 就是全文！
                                },
                                vector: vector
                            });
                            itemsAdded++;
                        }
                    }
                }

                console.log(`Loaded ${itemsAdded} items from ${file}`);
            } catch (err) {
                console.error(`Error processing file ${file}:`, err);
            }
        }

        vectorKnowledgeBase = newKnowledgeBase;
        console.log(`Vector knowledge base built successfully. Total ${vectorKnowledgeBase.length} items loaded and embedded.`);
    } catch (error) {
        console.error('Failed to build vector knowledge base:', error);
    }
}

/**
 * 通过语义搜索找到最相关的知识
 * @param {string} question
 * @returns {Promise<object|null>}
 */
async function findMostRelevantKnowledge(question) {
    if (vectorKnowledgeBase.length === 0) return null;

    const queryVector = await embedText(question);
    if (!queryVector) return null;

    let highestScore = -1;
    let mostRelevantItem = null;

    for (const item of vectorKnowledgeBase) {
        const similarity = calculateCosineSimilarity(queryVector, item.vector);
        if (similarity > highestScore) {
            highestScore = similarity;
            mostRelevantItem = item.original;
        }
    }

    if (highestScore >= SIMILARITY_THRESHOLD) {
        console.log(`Most relevant item found with score: ${highestScore}`);
        return mostRelevantItem;
    }

    console.log(`No relevant item found above threshold. Highest score was: ${highestScore}`);
    return null;
}


// --- 初始化 ---
const app = express();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});
app.use(bodyParser.json());

async function initializeDataDirectory() {
    try {
        await fs.access(DATA_DIR);
    } catch (error) {
        await fs.mkdir(DATA_DIR);
    }
}

// --- 辅助函数：智谱 GLM-4V 图片识别 ---
async function recognizeImageWithZhipu(filePath, mimeType) {
    if (!ZHIPU_AI_API_KEY) return ""; // 没有 Key 就不识别，返回空字符串

    try {
        console.log('正在调用 GLM-4V 识别图片内容...');
        const fileData = await fs.readFile(filePath);
        const dataUrl = `data:${mimeType};base64,${fileData.toString('base64')}`;

        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ZHIPU_AI_API_KEY_VISION}`
            },
            body: JSON.stringify({
                model: "glm-4v-flash", 
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "image_url", image_url: { url: dataUrl } },
                            { type: "text", text: "请将这张图片里的内容转化为文本。如果是数学公式，请直接转换为 LaTeX 格式；如果是文字，请直接OCR识别出来。" }
                        ]
                    }
                ],
                temperature: 0.1
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
            let content = data.choices[0].message.content;
            // 去除可能存在的 markdown 代码块标记
            return content.replace(/```latex/g, '').replace(/```/g, '').trim();
        }
        return "";
    } catch (error) {
        console.error("图片识别出错:", error);
        return ""; // 出错返回空，不影响后续流程
    }
}

// --- AI Answer Generation ---
const createPrompt = (question, context) => `
你是一个专业的学术助教和知识库问答助手。你的任务是准确、清晰地回答用户的问题。

下面是检索到的参考信息（可能包含题目、答案和解析）：
"""
${context || '无'}
"""

用户问题：
"""
${question}
"""

回答要求：
1. **优先使用参考信息**：如果参考信息与问题相关，请以此为核心进行回答。
2. **智能补充**：如果参考信息较简略（例如只给了一个选项代码"A"或"B"，或者解析写着"略"），请利用你的通用知识补充详细的解释和推导过程，确保回答完整易懂。
3. **数学公式格式**：请务必使用 LaTeX 格式书写数学公式，以便前端正确渲染。
   - **行内公式**：必须使用单个美元符号包裹，例如 $E=mc^2$。
   - **独立公式块**：必须使用两个美元符号包裹，例如 $$ \\sum_{i=1}^n a_i $$。
   - **严禁**使用 \\[ ... \\] 或 \\( ... \\) 这种非标准 Markdown 格式。
4. **来源标注（调试用）**：
   - 如果回答是基于上述参考信息生成的，请在回答最后一行注明：【来源：知识库】
   - 如果参考信息为“无”或明显不相关，导致你使用通用知识回答，请在回答最后一行注明：【来源：AI通用知识（未匹配到有效库内信息）】

请开始回答：
`;

// --- 修改后的 generateZhipuAnswer 函数 (带 Debug 日志) ---
async function generateZhipuAnswer(question, context, model) {
    if (!ZHIPU_AI_API_KEY || ZHIPU_AI_API_KEY.includes('YOUR_KEY')) return '错误：智谱AI API密钥未配置。';
    
    console.log('Calling Zhipu AI API...');

    // 1. 生成最终的提示词
    const finalPrompt = createPrompt(question, context);

    // 🔥🔥🔥【核心调试代码】打印最终发给 AI 的内容 🔥🔥🔥
    console.log('\n======================================================');
    console.log('🐞 [DEBUG] 发送给 AI 的完整 Prompt:');
    console.log('======================================================');
    console.log(finalPrompt);
    console.log('======================================================\n');

    // 2. 发送请求
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ZHIPU_AI_API_KEY}` },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'system', content: '你是一个智能作业辅助机器人。' },
                // 3. 这里使用刚才生成的 finalPrompt
                { role: 'user', content: finalPrompt } 
            ],
            temperature: 0.7,
        }),
    });
    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
    }
    console.error('Zhipu AI Error:', data.error || data);
    return `抱歉，智谱AI服务出错：${(data.error && data.error.message) || '未知错误'}`;
}

async function generateDeepSeekAnswer(question, context, model) {
    if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.includes('YOUR_KEY')) return '错误：DeepSeek API密钥未配置。';
    console.log('Calling DeepSeek API...');
    const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: createPrompt(question, context) }
            ],
            temperature: 0.7,
        }),
    });
    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
    }
    console.error('DeepSeek API Error:', data.error || data);
    return `抱歉，DeepSeek服务出错：${(data.error && data.error.message) || '未知错误'}`;
}

async function generateGeminiAnswer(question, context, model) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('YOUR_KEY')) return '错误：Gemini API密钥未配置。';
    console.log('Calling Gemini API...');
    const geminiModelId = 'gemini-1.5-flash'; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModelId}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: createPrompt(question, context) }] }],
        }),
    });
    const data = await response.json();
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        return data.candidates[0].content.parts[0].text;
    }
    console.error('Gemini API Error:', data.error || data);
    const errorMessage = (data.error && data.error.message) || (data.candidates && data.candidates[0].finishReason) || '未知错误';
    return `抱歉，Gemini服务出错：${errorMessage}`;
}

async function generateAnswer(question, context, model) {
    const selectedModel = model || DEFAULT_MODEL;
    console.log(`Routing to AI model: ${selectedModel}`);
    try {
        if (selectedModel.startsWith('glm-')) {
            return await generateZhipuAnswer(question, context, selectedModel);
        } else if (selectedModel.startsWith('deepseek-')) {
            return await generateDeepSeekAnswer(question, context, selectedModel);
        } else if (selectedModel.startsWith('gemini-')) {
            return await generateGeminiAnswer(question, context, selectedModel);
        } else {
            console.warn(`Unknown model '${selectedModel}', falling back to default.`);
            return await generateZhipuAnswer(question, context, DEFAULT_MODEL);
        }
    } catch (error) {
        console.error(`Error with model ${selectedModel}:`, error);
        return '抱歉，调用AI服务时发生严重错误。';
    }
}

// --- Multer 配置 (用于文件上传) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, DATA_DIR);
    },
    filename: function (req, file, cb) {
        // 防止中文乱码
        cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8'));
    }
});
const upload = multer({ storage: storage });


// --- API Endpoints ---

// 获取文件列表
app.get('/api/files', async (req, res) => {
    try {
        const files = await fs.readdir(DATA_DIR);
        res.json(files.filter(file => file !== '.gitkeep'));
    } catch (error) {
        console.error('Error reading files:', error);
        res.status(500).json({ error: '无法读取文件列表' });
    }
});

// 上传文件
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: '没有提供文件' });
    }
    // 重建向量知识库
    await buildVectorKnowledgeBase();
    res.json({ message: `文件 '${req.file.originalname}' 上传成功！` });
});

// 删除文件
app.delete('/api/files/:filename', async (req, res) => {
    const filename = req.params.filename;
    if (filename.includes('..') || filename.includes('/')) {
        return res.status(400).json({ error: '无效的文件名' });
    }
    try {
        await fs.unlink(path.join(DATA_DIR, filename));
        // 重建向量知识库
        await buildVectorKnowledgeBase();
        res.json({ message: `文件 '${filename}' 删除成功！` });
    } catch (error) {
        console.error(`Error deleting file ${filename}:`, error);
        res.status(500).json({ error: '无法删除文件' });
    }
});

// RAG提问接口
// --- 统一问答接口 (支持 纯文本 或 文本+图片) ---
// 注意：这里使用了 upload.single('file')，这允许接收一个名为 'file' 的文件
// 如果前端没有传文件，req.file 就是 undefined，不会报错
app.post('/api/ask', upload.single('file'), async (req, res) => {
    try {
        // 1. 获取文本参数
        // 因为用了 multer，req.body 会包含非文件字段
        let question = req.body.question || ''; 
        const model = req.body.model || DEFAULT_MODEL;

        console.log(`收到请求。原始问题: ${question.substring(0, 50)}...`);

        // 2. 检查是否有图片上传
        if (req.file) {
            console.log(`检测到图片上传: ${req.file.filename}`);
            
            const filePath = path.join(DATA_DIR, req.file.filename);
            const mimeType = req.file.mimetype;

            // 调用视觉模型识别图片
            const imageContent = await recognizeImageWithZhipu(filePath, mimeType);
            
            if (imageContent) {
                console.log(`\n=== 🖼️ 图片识别结果 (GLM-4V) ===`);
                console.log(imageContent);
                console.log(`==================================\n`);
                
                // 将识别内容追加到问题中
                question += `\n\n【用户上传的图片内容】:\n${imageContent}`;
            }

            // (可选) 识别完后删除临时图片，节省空间
            // await fs.unlink(filePath).catch(err => console.error('删除临时图片失败', err));
        } else {
            console.log('未检测到图片，按纯文本处理。');
        }

        // --- 以下是原有的 RAG 流程 (逻辑不变) ---

        if (!question.trim()) {
            return res.status(400).json({ error: '问题不能为空（如果没有上传图片，必须输入文字）' });
        }

        // 3. 语义检索 (Semantic Retrieval)
        // 现在 question 包含了 "用户输入的字" + "图片里的公式/字"
        // 这样 RAG 就能根据图片里的公式去知识库里找类似的题了！
        const knowledgeItem = await findMostRelevantKnowledge(question);
        
        let context = null;
        if (knowledgeItem) {
            console.log('Retrieved relevant knowledge item.');
            context = `--- 参考题目信息 ---\n科目: ${knowledgeItem.subject || '未知'}\n题型: ${knowledgeItem.type || '未知'}\n问题: ${knowledgeItem.question}`;
            if (knowledgeItem.options && knowledgeItem.options.length > 0) {
                context += `\n选项: ${knowledgeItem.options.join(', ')}`;
            }
            if (knowledgeItem.correct_answer) {
                context += `\n标准答案: ${knowledgeItem.correct_answer}`;
            }
            if (knowledgeItem.analysis) {
                context += `\n解析: ${knowledgeItem.analysis}`;
            }
            // 兼容旧/TXT字段
            if (knowledgeItem.golden_answer) context += `\n参考答案: ${knowledgeItem.golden_answer}`;
        } else {
            console.log('No relevant knowledge found in vector base.');
        }

        // 4. 生成回答 (Generation)
        const answer = await generateAnswer(question, context, model);
        console.log(`Generated answer length: ${answer.length}`);

        res.json({ answer });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 静态文件服务
app.use(express.static(path.join(__dirname)));


// --- 启动服务器 ---
app.listen(PORT, async () => {
    await initializeDataDirectory();
    // 建立初始向量知识库
    await buildVectorKnowledgeBase(); 
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('API endpoint available at POST /api/ask');
    console.log(`Knowledge base directory: ${DATA_DIR}`);
    if (!SILICONFLOW_API_KEY) {
        console.warn('\n--- WARNING ---');
        console.warn('SILICONFLOW_API_KEY is not configured.');
        console.warn('Semantic search functionality (RAG) will be disabled.');
        console.warn('Please provide a valid key in `server.js` to enable RAG.');
        console.warn('---\n');
    }
});
