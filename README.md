# 🧠 智析 DataLens — 通用 AI 数据分析引擎

> 导入任意行业数据 → AI 自动理清关系 → 构建可视化图谱 → 深度分析 → 优劣势 + 解决方案

<p align="center">
  <img src="https://img.shields.io/badge/WorkBuddy_×_EdgeOne_Pages-挑战赛参赛作品-38bdf8?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Skills_赛道-数据分析-7c3aed?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

---

## 🎯 一句话说清楚

**任何人**都可以用一句话让 AI 分析自己的行业数据——不需要懂数据分析、不需要写代码、不需要配模型。你只需要说「帮我分析这个文件」，AI 会主导整个分析对话。

---

## 🚀 三秒体验

```
用户: "帮我分析 C:\Users\admin\Desktop\数据.xlsx"
  ↓
AI:   📊 检测到3个Sheet、50行×33列，第5列"ZLX"我不确定含义...
  ↓
用户: "ZLX是诊疗类型"
  ↓
AI:   🔗 构建关系图谱 → 🧠 6种分析模式可选 → ✅ 优劣势结论 + 解决方案
  ↓
用户: "部署上线"
  ↓
AI:   🌐 已部署到 EdgeOne Pages → https://xxx.edgeone.cool
```

---

## ✨ 核心亮点

| 能力 | 说明 |
|------|------|
| 📂 **18种输入形式** | Excel / CSV / JSON / PDF / Word / HTML / 截图 / 拍照 / 网页链接 / 粘贴文本 / 手写笔记... |
| 🔍 **AI 语义理解** | 自动识别列的类型和含义，遇到行业术语主动向用户确认，不瞎猜 |
| 🕸️ **关系图谱自动发现** | 主外键 / 层级 / 聚合 / 时序 / 因果 / 同义词 —— 全自动检测 + 交互式可视化 |
| 🔌 **外部大模型接入** | 支持 OpenAI / Azure / DeepSeek / 通义千问 / 文心一言 / 行业垂直模型，用户自带 API Key |
| 🧠 **6 大分析模式** | 关系链追踪 · 关键节点识别 · 聚类分层 · 优劣势诊断 · 趋势推演 · 合规风险评估 |
| ✅ **严谨结论** | 每条结论有数据证据链支撑，劣势必附可执行解决方案（含量化预期效果） |
| 🌐 **EdgeOne 全栈** | Cloud Functions + Edge Functions + KV Storage + Middleware + 一键部署 |

---

## 📊 6 大分析模式

| # | 模式 | 典型问题 |
|---|------|---------|
| 1 | 关系链追踪 | "A 通过哪些路径影响 B？" |
| 2 | 关键节点识别 | "哪些实体是核心枢纽？" |
| 3 | 聚类与分层 | "数据可以分成哪几类？" |
| 4 | 优劣势诊断 | "当前数据有什么优势和短板？给出方案" |
| 5 | 趋势推演 | "如果 X 增长 20%，Y 会怎么变？" |
| 6 | 合规/风险评估 | "有哪些潜在风险点？" |

---

## 🏗️ 技术架构

```
前端: React 18 + Vite + TypeScript + Tailwind + shadcn/ui
可视化: vis-network + ECharts 5（暗色主题）
文件解析: xlsx / papaparse / pdf-parse / mammoth / cheerio
图像识别: Tesseract.js (OCR) + OpenCV.js (表格检测)
后端: EdgeOne Pages Cloud Functions (Node.js)
轻量 API: EdgeOne Pages Edge Functions (V8)
存储: EdgeOne Pages KV Storage
安全: EdgeOne Pages Middleware (限流/CORS/文件验证)
部署: EdgeOne Pages CLI (一键构建+上传)
```

---

## 📁 Skill 结构

```
data-lens-skill/
└── skills/
    └── data-lens/
        ├── SKILL.md                      # 入口：YAML frontmatter + 决策树 + 7阶段流程
        ├── references/                   # 按需加载的详细参考文档
        │   ├── data-intake.md            # 18种数据输入形式解析
        │   ├── relationship-mapping.md   # 关系图谱构建算法
        │   ├── analysis-engine.md        # 6大分析模式 + 外部LLM接入
        │   ├── visualization.md          # vis-network + ECharts 规范
        │   └── deployment.md             # EdgeOne Pages 部署指南
        └── templates/                    # 可运行的项目脚手架
            ├── package.json              # React + Vite + 全部依赖
            ├── vite.config.ts
            ├── tailwind.config.ts        # 暗色主题配置
            ├── tsconfig.json
            └── edgeone.json              # EdgeOne Pages 部署配置
```

遵循 **Anthropic skill-creator** 规范。

---

## 📦 安装

**自然语言安装（推荐）：**
```
"帮我安装 data-lens Skill"
```

**命令行安装：**
```bash
npx skills add JIANG-SMALL/data-lens-skill
```

**手动安装：**
复制 `skills/data-lens/` 到 `~/.claude/skills/` 或 `~/.codebuddy/skills/`

---

## 🔗 依赖的官方 Skill

| Skill | 用途 |
|-------|------|
| [edgeone-pages-deploy](https://github.com/TencentEdgeOne/edgeone-pages-skills) | 部署上线 |
| [edgeone-pages-dev](https://github.com/TencentEdgeOne/edgeone-pages-skills) | KV / Edge Functions 开发 |

安装 data-lens 时会自动提示安装这两个依赖。

---

## 🖥️ EdgeOne Pages 能力利用

| 能力 | 在本项目中的用途 |
|------|----------------|
| **Cloud Functions (Node.js)** | `/api/analyze` 核心AI分析、`/api/parse` 文件解析、`/api/ocr` 图片识别、`/api/scrape` 网页抓取、`/api/llm-config` 模型管理 |
| **Edge Functions (V8)** | `/api/health` 健康检查 + KV缓存命中 |
| **KV Storage** | 会话缓存、关系图谱数据、LLM配置加密存储 |
| **Middleware** | API限流、CORS、文件大小验证 (50MB) |
| **一键部署** | CLI自动框架检测 → 构建 → 上传 → 返回URL |

---

## 🎥 演示

在线预览：https://data-lens-demo-hgrll7fu.edgeone.cool

---

## 📜 License

MIT © [JIANG-SMALL](https://github.com/JIANG-SMALL)

---

> 🏆 本作品参加 **WorkBuddy × Tencent EdgeOne AI Prompts × Skills 挑战赛**（Skills 赛道）
