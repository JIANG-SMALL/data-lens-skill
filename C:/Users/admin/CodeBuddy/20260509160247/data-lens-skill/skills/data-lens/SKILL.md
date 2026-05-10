---
name: data-lens
description: >-
  「智析」通用 AI 数据分析引擎 — 任何人导入任意行业数据，AI 自动理清内容关系、建立关系可视化图、深度分析并给出严谨结论（含优劣势评估 + 劣势解决方案）。
  触发条件：用户只要说"帮我分析这份数据/这个文件/这个表格"+提供文件路径即可触发。无需复杂指令，AI 会自动主导后续流程。其他高频触发短语："分析数据"、"数据关系"、"数据洞察"、"analyze data"、"这个表有什么问题"、"帮我看看数据"。
  不触发条件：纯数据清洗/ETL任务、仅需绘制简单统计图表（柱状图/饼图等）、已有明确分析框架只需执行的任务。
  本 Skill 覆盖完整流程（每阶段必须展示成果并等待用户确认）：📂数据导入 → 🔍语义理解(展示分类结果+确认不明词汇) → 🕸️关系图谱(展示关系摘要) → ⚠️外部大模型配置询问(不可跳过) → 🧠深度分析(6模式) → ✅优劣势结论 → 🚀部署上线。
metadata:
  author: data-lens
  version: "1.0.0"
  category: ai-data-analysis
  requires:
    - edgeone-pages-deploy  # 部署阶段委托
    - edgeone-pages-dev     # KV Storage & Edge Functions 开发
---

## ⚠️ 前置依赖 — 必须先安装官方 Skills

在开始任何数据分析工作前，必须先确保以下官方 Skills 已安装：

```
安装方式（自然语言）：
"帮我安装这些 Skills：
 1. https://github.com/TencentEdgeOne/edgeone-pages-skills（包含 deploy 和 dev 能力）
 2. data-lens（本 Skill）"

安装方式（命令行）：
npx skills add TencentEdgeOne/edgeone-pages-skills
```

本 Skill 依赖 `edgeone-pages-deploy`（部署）和 `edgeone-pages-dev`（KV / Edge Functions 开发），部署阶段会委托给它们。

---

# 智析 (DataLens) — 通用 AI 数据分析引擎

**核心体验：用户只需说「帮我分析这个文件」→ AI 自动读数据、理关系、提问确认、深度分析、给出结论。**

用户不需要懂数据分析，不需要写复杂提示词。AI 主导对话，用户只需回答选择题。

---

## ⛔ Critical Rules（永远不可跳过）

1. **先理解，后分析。** 绝不在不理解数据含义的情况下直接输出结论。遇到行业术语、缩写、编码、单位、分类标签等不明词汇，必须暂停并询问用户确认。
2. **关系优先于统计。** 先构建实体间的语义关系图，再进行统计分析。关系图是分析的基础，不是附加品。
3. **结论必须可追溯。** 每一个结论都标注其依据的数据行/字段/关系，不可凭空推断。
4. **优劣势必须给出依据和方案。** 优势说明为什么是优势（基准对比/行业参照），劣势给出具体可操作的解决方案。
5. **可视化必须传达语义。** 关系图不是装饰，节点颜色/大小/连线粗细/布局都必须携带信息量。
6. **数据安全。** 所有用户上传数据仅在前端解析和云端函数临时处理，不持久化存储原始数据（除非用户明确要求保存到 KV Storage）。
7. **必须在关系图谱构建完成后、进入分析引擎之前，主动询问用户是否需要接入外部大模型。** 这个询问步骤永远不可跳过。即使你觉得用户的数据很简单不需要，也必须问。用户有权选择不接，但 AI 无权跳过询问。
8. **每个阶段结束时必须向用户展示阶段性成果并等待确认，才能进入下一阶段。** 不允许静默跳过任何阶段。用户必须能感知到当前处于哪个阶段、该阶段产出了什么。特别是「语义理解」阶段，必须列出每列的语义分类结果，标注不确定的词汇，主动要求用户确认或修正。

---

## 👤 用户只需做两件事

```
用户说一句「帮我分析这份数据」+ 提供文件路径
    ↓
AI 接管一切：读取数据 → 理解内容 → 提问确认 → 构建关系 → 深度分析 → 输出结论
    ↓
用户只需：回答 AI 的问题（选择题或简单确认）
```

**用户不需要**懂数据分析、不需要知道什么是「语义理解」「关系图谱」、不需要写复杂提示词。AI 主导整个过程。

## When to Use This Skill

### ✅ 触发场景（用户的原始话可能就是一句简单的话）
- "帮我分析这份数据" + 文件路径
- "看看这个表里有什么关系" + 文件路径
- "这数据有什么问题" + 文件路径
- "帮我分析 C:\Users\admin\Desktop\数据.xlsx"
- 只要涉及"读取表格数据+理解关系+分析结论"，就触发此 Skill

### ❌ 不触发场景
- 仅需画柱状图/饼图/折线图 → 这是图表绘制，非关系分析
- 纯数据清洗/ETL → 不涉及分析
- 非结构化文本摘要/情感分析 → 不在本 Skill 范围内

---

## 🤖 AI 的职责（核心交互原则）

⚠️ **AI 是对话的主导者，不是用户指令的执行者。**

```
用户只需说: "帮我分析这个文件"
AI 必须做的:
  1. 自己读取文件，自己理解内容
  2. 自己发现数据中的关系和疑点
  3. 用选择题的方式向用户确认（不给用户增加认知负担）
  4. 每完成一个阶段，主动汇报进展，然后问下一个问题
  5. 永远不要让用户来指挥你做什么——你来指挥对话节奏
```

### ❌ 禁止的行为
- 让用户写多步骤的分析指令
- 用专业术语问用户（如"需要进行语义理解吗"）
- 一次抛出太多信息让用户不知怎么回答
- 静默完成阶段不汇报

### ✅ 正确的互动方式
```
AI: "我读了你的文件，这是一个'员工上班打卡记录表'，包含 33 列数据。
     我注意到第 5 列'部门'、第 8 列'打卡时间'、第 15 列'工时'可能是分析重点。
     
     先确认一下：第 3 列的'ZLX'是什么意思？
     [A] 诊疗类型 [B] 质量类型 [C] 治疗路线 [D] 直接告诉我___"

用户只需选: A

AI: "明白了，是诊疗类型。接下来我帮你分析数据之间的关系..."
```

---

## Technology Decision Tree — 数据输入形式检测

```
用户以什么形式提供了数据？

📁 文件型 ──────────────────────────────────────
├── Excel (.xlsx/.xls/.xlsm) → xlsx库解析 → 多sheet=多实体表
├── CSV/TSV (.csv/.tsv)      → papaparse解析 → 自动检测分隔符+编码
├── JSON (.json)             → JSON.parse拍平嵌套结构
├── PDF (.pdf)               → pdf-parse提取 → 检测表格区域 → 扫描版需OCR
├── Word (.docx/.doc)        → mammoth提取 → 识别嵌入表格
├── SQL Dump/SQLite          → 正则/SQLite提取表结构+数据
├── Markdown (.md)           → 正则匹配表格语法
├── HTML (.html)             → cheerio提取所有<table>
├── XML (.xml)               → fast-xml-parser拍平
└── 文本 (.txt)              → 启发式检测空格对齐/制表符/定宽

📸 非文件型 ────────────────────────────────────
├── 截屏/拍照图片 → OCR识别 → 表格检测 → 重建行列结构
├── 直接粘贴文本 → 启发式检测分隔符 → 解析为表格
├── 网页链接(URL) → 抓取HTML → 提取<table> → 用户选择目标表格
├── 在线表格链接 → Google Sheets/腾讯文档/Airtable → API获取或引导导出
├── 手写笔记照片 → OCR手写识别 → 表格结构化（标注置信度）
├── 数据库连接串 → 引导导出CSV/SQL 或 Cloud Functions直连
└── API端点 → Cloud Functions调用 → JSON解析

🔀 混合输入 ────────────────────────────────────
└── 多个不同来源 → 分别解析 → 统一进入「语义理解」→ 自动检测跨来源关系

所有输入形式解析完成后 → 统一输出数据画像 → 进入「语义理解」阶段
    → read references/data-intake.md（完整解析流程）
```
├── 自动识别实体类型（人物/机构/产品/事件/指标/地区/时间...）
├── 自动检测字段间潜在关系（主外键/层级/聚合/时序/因果...）
└── 标记不明确词汇 → 向用户提问确认

词汇确认完成 → 构建关系图谱 → read references/relationship-mapping.md

关系图谱构建完成 → 询问用户 → 「外部大模型配置」
├── 用户需行业深度分析？ → 询问是否接入自己的大模型API
│   ├── 是 → 引导配置 API Key + Endpoint + Model（支持 OpenAI / Azure / 国产模型 / 行业垂直模型）
│   │       → 外部模型接入后，所有分析模式自动使用该模型
│   └── 否 → 使用内置通用分析能力
└── 进入分析引擎 → read references/analysis-engine.md
    ├── 模式1: 关系链追踪（"A如何影响B？"）
    ├── 模式2: 关键节点识别（"哪些实体是核心枢纽？"）
    ├── 模式3: 聚类与分层（"数据可以分成哪几类？"）
    ├── 模式4: 优劣势诊断（"当前数据反映了什么优势和短板？"）
    ├── 模式5: 趋势推演（"如果X变化，Y会怎样？"）
    └── 模式6: 合规/风险评估（"有哪些潜在风险点？"）

分析完成 → 生成可视化 → read references/visualization.md
→ 撰写分析报告（含优劣势+方案）→ 输出

用户满意 → 部署上线 → 委托 edgeone-pages-deploy → read references/deployment.md
```

---

## Tech Stack（项目技术栈）

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| **前端框架** | React 18 + Vite + TypeScript | 现代化SPA，TypeScript全量 |
| **样式系统** | Tailwind CSS 3 + shadcn/ui | 组件化+暗色主题支持 |
| **可视化引擎** | ECharts 5 + vis-network/vis-data | 关系图谱 + 统计图表 |
| **文件解析** | xlsx (SheetJS) + papaparse + jschardet | Excel/CSV/TSV/JSON 全格式解析 |
| **图像识别** | Tesseract.js (OCR) + OpenCV.js (表格检测) | 截屏/拍照/手写→提取表格数据 |
| **文档解析** | pdf-parse + mammoth + cheerio | PDF/Word/HTML/Markdown 提取表格 |
| **网页抓取** | cheerio + node-fetch | URL→自动提取页面中所有表格 |
| **后端函数** | EdgeOne Pages Cloud Functions (Node.js) | 重型分析逻辑 |
| **轻量API** | EdgeOne Pages Edge Functions | 数据验证/缓存/会话 |
| **持久存储** | EdgeOne Pages KV Storage | 用户会话 + 分析结果缓存 |
| **认证守卫** | EdgeOne Pages Middleware | API请求验证 |
| **AI推理引擎** | 内置通用分析 + 可选外部大模型 | 支持 OpenAI / Azure / DeepSeek / 通义千问 / 文心一言 / 行业垂直模型等，用户提供API Key即可接入 |
| **外部模型管理** | 前端配置面板 + KV Storage加密存储 | API Key加密保存，支持多模型切换 |
| **部署平台** | EdgeOne Pages | 全栈一键部署 |

---

## Project Structure（项目结构）

```
data-lens/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui 基础组件
│   │   ├── DataImporter.tsx       # 统一数据入口（拖拽/文件/粘贴/URL/图片）
│   │   ├── ImageUploader.tsx      # 图片上传+裁剪+预览
│   │   ├── OCRReviewer.tsx        # OCR识别结果人工校对面板
│   │   ├── URLInput.tsx           # 网页链接输入+表格选择器
│   │   ├── DataPreview.tsx        # 数据预览表格
│   │   ├── AmbiguityResolver.tsx  # 词汇澄清交互面板
│   │   ├── RelationshipGraph.tsx  # 交互式关系可视化图
│   │   ├── AnalysisControls.tsx   # 分析模式选择器
│   │   ├── AnalysisReport.tsx     # 分析结论展示
│   │   ├── ProsConsPanel.tsx      # 优劣势+方案面板
│   │   └── ExternalLLMConfig.tsx  # 外部大模型接入配置面板
│   ├── hooks/
│   │   ├── useDataParser.ts       # 数据解析Hook（统一入口）
│   │   ├── useOCR.ts              # OCR识别+表格重建Hook
│   │   ├── useWebScraper.ts       # 网页抓取+表格提取Hook
│   │   ├── useRelationshipGraph.ts # 关系图数据管理
│   │   └── useAnalysis.ts         # 分析引擎Hook
│   ├── lib/
│   │   ├── parser.ts              # 多格式解析核心
│   │   ├── ocr-processor.ts       # OCR+表格重建核心算法
│   │   ├── image-table-detector.ts # 图片中表格区域检测
│   │   ├── web-scraper.ts         # 网页表格提取
│   │   ├── entity-extractor.ts    # 实体识别
│   │   ├── relation-detector.ts   # 关系检测算法
│   │   ├── analysis-engine.ts     # 6大分析模式
│   │   └── report-generator.ts    # 报告生成器
│   ├── types/
│   │   └── index.ts               # TypeScript类型定义
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                  # Tailwind + 自定义主题变量
├── cloud-functions/
│   └── api/
│       ├── analyze.ts             # POST /api/analyze — 核心分析
│       ├── parse.ts               # POST /api/parse    — 文件解析
│       ├── ocr.ts                 # POST /api/ocr      — 图片OCR识别
│       ├── scrape.ts              # POST /api/scrape   — 网页表格提取
│       ├── relationships.ts       # GET  /api/relationships — 关系图谱
│       └── [[default]].ts         # Express路由聚合
├── edge-functions/
│   └── api/
│       ├── health.ts              # GET /api/health — 健康检查
│       └── cache.ts               # 分析结果缓存（KV Storage）
├── middleware.js                   # API限流 + 请求验证
├── edgeone.json                   # EdgeOne Pages 项目配置
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local                     # AI API Key（用户自行配置）
```

---

## Interaction Flow（AI Agent 执行流程）

### 阶段1: 📂 数据导入
```
1. 询问用户数据文件路径（支持本地路径或拖拽）
2. 调用 parser.ts 解析文件，展示前100行预览
3. 自动检测：列名/数据类型/缺失值/重复值
4. 必须输出以下数据画像让用户确认：

📊 数据画像
├── 文件名: xxx.xlsx
├── 总行数: 12,847
├── Sheet数: 3
│   ├── Sheet1 "订单明细" → 8,420行 × 14列
│   ├── Sheet2 "客户信息" → 3,200行 × 9列
│   └── Sheet3 "产品目录" → 1,227行 × 7列
├── 数据质量:
│   ├── 缺失率 > 10% 的列: 备注(23.4%), 电话(11.2%)
│   └── 疑似重复行: 47行
└── 潜在表间关系: Sheet1.客户ID ↔ Sheet2.客户ID

5. 数据是否正确加载？是否继续进入语义理解阶段？[确认继续]
```

### 阶段2: 🔍 语义理解（必须展示给用户并等待确认）

```
⚠️ 此阶段不可跳过。在数据导入完成后，你必须向用户展示语义分析结果。

1. 对每列数据进行语义分类，并以表格形式展示给用户：

   📋 语义分析结果 — 共 {N} 列
   | # | 列名     | 推断类型  | 含义解读          | 示例值        | 不确定? |
   |---|---------|----------|------------------|--------------|---------|
   | 1 | 客户ID   | 标识符    | 客户唯一标识       | KH-2024-0001 | ✅ 确定  |
   | 2 | 产品编码  | 标识符    | 产品编号(SKU)     | PROD-A01     | ✅ 确定  |
   | 3 | ZLX     | ⚠️ 不明确 | 疑似"诊疗类型"缩写  | ZLX-A01      | ❓ 需确认 |
   | 4 | 销售额   | 数值指标  | 销售金额(元)      | 12,580.00    | ✅ 确定  |
   | 5 | 日期     | 时间维度  | 交易日期          | 2025-12-01   | ✅ 确定  |

2. 对于标记为「❓ 需确认」的列，必须逐个向用户提问：
   "检测到列名'ZLX'，样本值为'ZLX-A01', 'ZLX-B12', 'ZLX-C03'，
    请问它代表什么含义？[A] 诊疗类型 [B] 质量类型 [C] 治疗路线 [D] 自定义输入___"

3. 即使用户认为所有列都正确，也必须征得用户一句确认：
   "以上语义分类是否正确？有没有需要调整的列？[确认无误] [我要调整]"

4. 用户确认后，才能进入「阶段3: 关系图谱构建」。
```

### 阶段3: 🕸️ 关系图谱构建

```
1. 自动检测关系类型并生成关系摘要：

🔗 关系检测结果 — 共检测到 {N} 条关系
├── 主外键关系 (2条):
│   ├── Sheet1.客户ID → Sheet2.客户ID (强度: 98%)
│   └── Sheet1.产品编码 → Sheet3.产品编码 (强度: 95%)
├── 层级关系 (1条): Sheet2.省份 → Sheet2.城市 (地理层级)
├── 聚合关系 (1条): Sheet1.明细金额 → Sheet3.产品总销售额
├── 时序关系 (1条): 创建时间 → 修改时间 (流程链)
└── 关联关系 (1条): "血糖仪" ↔ "血糖检测仪" (同义词, Jaccard 0.87)

2. 生成交互式关系可视化图：
   - 节点大小 = 数据影响权重
   - 连线粗细 = 关系紧密程度
   - 颜色分区 = 实体类别
   - 支持拖拽/缩放/高亮/筛选

3. 向用户展示关系摘要并询问：
   "以上关系检测结果是否合理？有没有遗漏或错误的关系？[确认继续] [我要调整]"

4. 用户确认后，进入「阶段4: 外部大模型配置」。
```

### 阶段4: 🚨 外部大模型配置（强制询问步骤，绝不可跳过）

```
⚠️ 这是强制执行步骤。在关系图谱构建完成后、任何分析开始之前，
   你必须暂停并主动询问用户。不允许跳过。

1. 关系图谱构建完成后，必须使用以下话术主动询问用户：

   「📊 关系图谱已构建完成。在进入深度分析之前，我有一个关键问题：

   🔌 **是否需要接入你自己的大模型API来进行深度分析？**

   如果你有某个行业/领域的专用模型（如医药法规模型、金融风控模型、
   教育分析模型等），接入后分析结论会更加精准和专业。

   如果你暂时没有或不需要，我会使用内置的通用分析能力继续。

   👉 请选择：[接入外部模型] [使用内置分析]」

2. 如果用户选择「是」，引导配置：
   ┌─ 外部LLM配置 ─────────────────┐
   │ 模型提供商: [OpenAI / Azure /  │
   │    DeepSeek / 通义千问 /      │
   │    文心一言 / 自定义兼容接口]  │
   │ API Endpoint: [____________]  │
   │ API Key:     [____________]   │
   │ 模型名称:    [____________]   │
   │                               │
   │ [测试连接]  [保存配置]        │
   └───────────────────────────────┘

3. 连接测试通过后：
   - 后续所有分析模式下，AI推理将使用用户提供的外部大模型
   - API Key 加密存储至 KV Storage，下次访问自动加载
   - 支持随时切换模型（分析不同领域数据时可换不同专业模型）

4. 典型场景举例：
   - 医药行业数据 → 接入医药法规训练过的垂直模型 → 合规分析更精准
   - 金融数据     → 接入金融领域精调模型   → 风险评估更专业
   - 电商数据     → 接入通用模型即可       → 关系分析+趋势推演
   - 教育数据     → 接入教育行业大模型     → 学情分析更深入

5. 如果用户选择「否」：
   - 使用内置通用分析能力（无需额外配置）
   - 分析结论仍然完整，但缺乏特定行业的深度知识
```

### 阶段5: 深度分析
```
1. 用户选择分析模式（6选1或多选）
2. 调用 /api/analyze 执行分析：
   - 将数据+关系图谱+用户问题发送给AI
   - AI对每个分析维度给出结论
3. 每个结论附带：
   - 证据链（基于数据行X-Y）
   - 置信度（高/中/低）
   - 关联实体（受影响的其他节点）
```

### 阶段6: 优劣势评估
```
1. 优势分析（必须包含）：
   - 与行业基准/历史数据的对比
   - 量化支撑（数据中体现的具体数值优势）
   - 核心竞争力识别
2. 劣势分析（必须包含）：
   - 数据反映的短板/瓶颈/异常
   - 风险敞口评估
3. 解决方案（每个劣势至少1个）：
   - 短期方案（1-3个月，可操作）
   - 中期方案（3-12个月，系统性改进）
   - 每个方案的预期效果量化
```

### 阶段7: 部署上线
```
委托 edgeone-pages-deploy Skill 完成：
1. CLI安装 → 登录认证 → 自动框架检测 → 构建 → 部署
2. 返回可访问URL
```

---

## Visual Theme（视觉设计规范）

分析工具的视觉氛围应为：**专业、冷静、信息密度高但不压抑**。

### Color Palette
| 角色 | 色值 | 用途 |
|------|------|------|
| 背景主色 | `#0f172a` (slate-900) | 分析工具背景 |
| 面板色 | `#1e293b` (slate-800) | 卡片/面板 |
| 边框色 | `#334155` (slate-700) | 分割线/边框 |
| 主强调色 | `#38bdf8` (sky-400) | 按钮/链接/选中态 |
| 数据节点-蓝 | `#60a5fa` | 维度实体 |
| 数据节点-绿 | `#34d399` | 指标实体 |
| 数据节点-橙 | `#fb923c` | 事件实体 |
| 数据节点-紫 | `#c084fc` | 关系实体 |
| 优势色 | `#22c55e` (green-500) | 正向指标 |
| 劣势色 | `#f97316` (orange-500) | 需关注指标 |
| 风险色 | `#ef4444` (red-500) | 警告/异常 |
| 文字主色 | `#f1f5f9` (slate-100) | 正文 |
| 文字次色 | `#94a3b8` (slate-400) | 辅助说明 |

### Typography
- 标题: Inter (sans-serif, weight 600-700)
- 正文: Inter (sans-serif, weight 400)
- 数据: JetBrains Mono (monospace, for data tables)
- 中文回退: Noto Sans SC

### Non-Negotiable Layout Rules
1. **三栏工作流布局**：左栏(数据导航) → 中栏(可视化区域/主工作区) → 右栏(分析结果面板)，宽度比例 1:3:2
2. **关系图居中**：关系可视化图始终占据中央面板的主要区域，不可被其他面板遮挡
3. **分析结论固定底部右栏**：优劣势分析结果面板固定在右侧下方，始终可见
4. **响应式降级**：移动端三栏变为单栏纵向排列，关系图缩放至全宽
5. **暗色为默认主题**：数据分析工具使用暗色主题作为默认，减少长时间使用的视觉疲劳

---

## Routing

| 任务 | 阅读 |
|------|------|
| 数据导入与解析 — 多格式支持、编码检测、大文件分片 | [references/data-intake.md](references/data-intake.md) |
| 关系图谱构建 — 实体识别、关系检测算法、图数据结构 | [references/relationship-mapping.md](references/relationship-mapping.md) |
| 分析引擎 — 6大分析模式详解、AI Prompt模板、结论生成 | [references/analysis-engine.md](references/analysis-engine.md) |
| 外部大模型接入 — API配置、多模型管理、加密存储、行业场景 | [references/analysis-engine.md](references/analysis-engine.md) |
| 可视化 — 关系图配置、统计图表规范、交互设计 | [references/visualization.md](references/visualization.md) |
| 部署 — 环境配置、KV Storage绑定、CLI部署、环境变量 | [references/deployment.md](references/deployment.md) |
| 项目模板 — 可运行的 Vite+React+Tailwind 脚手架 | [templates/](templates/) |

---

## Environment Setup

```bash
# 初始化 EdgeOne Pages 项目上下文
export PAGES_SOURCE=skills
edgeone pages init

# 安装依赖
npm install

# 本地开发（函数 + 前端一体化，端口 8088）
edgeone pages dev

# 链接项目（KV Storage & 环境变量需要）
edgeone pages link

# 拉取环境变量
edgeone pages env pull
```

---

## 与其他 Skill 的协作

| Skill | 角色 | 触发时机 |
|-------|------|---------|
| **edgeone-pages-dev** | KV Storage 配置、Edge Functions 开发 | 需要配置 KV Storage 缓存或新增 API 时 |
| **edgeone-pages-deploy** | 一键部署上线 | 本地分析功能验证完毕后 |
