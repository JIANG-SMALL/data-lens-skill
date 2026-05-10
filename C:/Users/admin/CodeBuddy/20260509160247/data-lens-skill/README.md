# 智析 DataLens — 通用 AI 数据分析引擎

> **「导入任意行业数据 → AI 自动理清关系 → 构建可视化图谱 → 深度分析 → 优劣势+解决方案」**
>
> 一个不限行业、数据驱动的通用 AI 数据分析 Skill，专为 WorkBuddy × Tencent EdgeOne AI Prompts × Skills 挑战赛设计。

---

## 🎯 解决什么问题？

不同行业有各自的行业数据格式和术语，传统数据分析工具需要人工配置数据模型、编写SQL、手工绘图。

**DataLens 改变了这个范式：**
- 📂 **零配置导入** — 支持 Excel/CSV/JSON/SQL Dump 等格式，自动推断数据类型
- 🤖 **AI 语义理解** — 遇到行业术语/缩写/编码自动暂停询问用户，建立准确的语义模型
- 🔌 **外部大模型接入** — 支持用户自行接入 OpenAI/Azure/DeepSeek/通义千问/文心一言/行业垂直模型等，实现行业专业化深度分析
- 🕸️ **关系图谱自动发现** — 跨表主外键、层级关系、时序依赖、语义关联全自动检测
- 📊 **六大分析模式** — 关系链追踪 / 关键节点 / 聚类分层 / 优劣势诊断 / 趋势推演 / 风险评估
- ✅ **严谨结论** — 每一条结论都有数据证据链支撑，优劣势量化对比，劣势附带可执行解决方案
- 🌐 **一键部署** — 依托 EdgeOne Pages 全栈能力，构建完成即上线

---

## 🏗️ Skill 结构

```json
data-lens-skill/
├── README.md                           # 使用文档
└── skills/
    └── data-lens/
        ├── SKILL.md                    # Skill 入口（YAML frontmatter + 决策树 + 交互流程）
        ├── references/                 # 按需加载的详细参考文档
        │   ├── data-intake.md          # 数据导入（18种输入形式：文件/截图/网页/PDF等）
        │   ├── relationship-mapping.md # 关系图谱构建（实体识别 + 关系检测 + 图算法）
        │   ├── analysis-engine.md      # 6大分析模式 + 外部LLM接入
        │   ├── visualization.md        # 可视化规范（vis-network + ECharts 暗色主题）
        │   └── deployment.md           # EdgeOne Pages 部署（KV/Middleware/CLI）
        └── templates/                  # 可运行的项目脚手架
            ├── package.json            # React + Vite + 全部依赖
            ├── vite.config.ts          # Vite 代理配置
            ├── tailwind.config.ts      # 暗色主题 + 节点颜色系统
            ├── tsconfig.json           # TypeScript 严格模式
            └── edgeone.json            # EdgeOne Pages 部署配置
```

遵循 **Anthropic skill-creator** 规范：入口 `SKILL.md` 保持轻量，详细参考文档放在 `references/` 中按需加载。

---

## 🚀 安装

### 方式一：自然语言安装（推荐）

在支持 Skills 的 AI 编程工具中直接说：
> "帮我安装 data-lens Skill 用于数据分析"

### 方式二：手动安装

将 `skills/data-lens/` 目录复制到工具的 skills 目录：
- **Claude Code**：`~/.claude/skills/`
- **CodeBuddy**：`~/.codebuddy/skills/`
- **Cursor**：`.cursor/rules/`

---

## 🎮 触发方式

### 自然语言即可触发

```
"帮我分析这份数据的内部关系"
"导入这个Excel，理清里面各种实体之间的关系，然后做个优劣势分析"
"我有一个行业的CSV数据，帮我做深度数据诊断"
"这些表格数据之间有什么关系？画个关系图再分析"
"用AI帮我做数据洞察，找出优势和短板，给出改进方案"
```

### 完整流程示例

```
用户: "这是我的药品流通数据，帮我分析"
  ↓
AI: 解析Excel → 检测到3个Sheet、5个不明确词汇
  ↓
用户: 确认词汇含义
  ↓
AI: 构建"药品→经销商→医院→患者"关系图谱（交互式可视化）
  ↓
用户: "分析一下渠道效率，哪些经销商是核心节点？有什么短板？"
  ↓
AI: 执行模式2(关键节点) + 模式4(优劣势诊断)
     输出：TOP5经销商、覆盖率不足地区、库存积压风险、优化方案
  ↓
用户: "部署上线"
  ↓
AI: 委托 edgeone-pages-deploy → 构建 → 部署 → 返回URL
```

---

## 🔗 与其他 EdgeOne Pages Skill 的关系

| Skill | 角色 | 何时用 |
|-------|------|--------|
| **data-lens**（本Skill） | 数据分析全流程 | 导入、分析、可视化 |
| `edgeone-pages-dev` | KV Storage + Edge Functions 开发 | 需要配置缓存或新增API |
| `edgeone-pages-deploy` | 部署上线 | 分析完成后的部署阶段 |

**推荐组合**：`data-lens + edgeone-pages-deploy`（覆盖分析+部署全流程）

---

## 🛠️ 技术架构

| 层级 | 技术 | EdgeOne Pages 能力 |
|------|------|-------------------|
| 前端渲染 | React 18 + Vite + TypeScript + Tailwind + shadcn/ui | 静态 + SPA |
| 关系可视化 | vis-network (Canvas交互图) | — |
| 统计图表 | ECharts 5 | — |
| 文件解析 | xlsx + papaparse + jschardet | — |
| API后端 | Node.js Cloud Functions | `/api/analyze` `/api/parse` `/api/llm-config` |
| 轻量API | Edge Functions (V8) | `/api/health` KV缓存 |
| 外部LLM | 用户自行提供的API Key | OpenAI / Azure / DeepSeek / 通义千问 / 文心一言 / 行业垂直模型 |
| 持久存储 | KV Storage | 会话缓存 + 图数据 + LLM配置加密存储 |
| 安全守卫 | Middleware | 限流 + CORS + 文件大小 |
| 部署 | EdgeOne CLI | 一键构建+上传 |

---

## 📊 支持的6大分析模式

| # | 模式 | 示例问题 |
|---|------|---------|
| 1 | **关系链追踪** | "A如何通过哪些路径影响B？" |
| 2 | **关键节点识别** | "哪些实体是核心枢纽？最重要的因素是什么？" |
| 3 | **聚类与分层** | "数据可以分成哪几类？有没有自然形成的群体？" |
| 4 | **优劣势诊断** | "数据反映了什么优势和短板？给出优化方案" |
| 5 | **趋势推演** | "如果X增长20%，Y会怎么变化？" |
| 6 | **合规/风险评估** | "有哪些潜在风险点？是否符合标准？" |

---

## ⚙️ 前置依赖

- Node.js ≥ 18
- EdgeOne Pages 账号（[中国站](https://console.cloud.tencent.com/edgeone/pages) | [全球站](https://pages.edgeone.ai)）
- AI API Key（OpenAI / 兼容接口）
- EdgeOne CLI（部署阶段自动安装）

---

## 📜 许可

MIT License

---

## 👤 作者

为 WorkBuddy × Tencent EdgeOne AI Prompts × Skills 挑战赛设计制作。
