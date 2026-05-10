# Analysis Engine — 六大分析模式 + 外部大模型接入

## 分析引擎架构

```
数据 + 关系图谱 + 用户问题
    ↓
分析模式选择器（用户选择1-N个模式）
    ↓
LLM路由决策（内置通用模型 OR 用户外部模型？）
    ↓
POST /api/analyze → Cloud Functions (Node.js)
    ↓
AI推理引擎（调用选定的LLM API）
    ↓
结构化结论 + 证据链 + 置信度
    ↓
优劣势评估 + 解决方案
```

---

## 🔌 外部大模型接入（External LLM Provider）

DataLens 支持用户接入自己的大模型 API，实现行业专业化深度分析。

### 为什么需要外部模型？

| 场景 | 内置通用模型 | 接入用户自己的模型 |
|------|------------|------------------|
| 通用数据分析 | ✅ 够用 | ✅ 更灵活 |
| 行业术语理解 | ⚠️ 可能不准确 | ✅ 行业精调模型更精准 |
| 法规合规分析 | ❌ 缺乏法规知识 | ✅ 接入法规训练模型 |
| 领域风险评估 | ⚠️ 泛化判断 | ✅ 行业经验模型 |
| 专业报告生成 | ⚠️ 格式通用 | ✅ 按行业标准输出 |

### 支持的模型提供商

| 提供商 | Endpoint 格式 | 需配置 |
|--------|-------------|--------|
| OpenAI | `https://api.openai.com/v1/chat/completions` | API Key + Model |
| Azure OpenAI | `https://{resource}.openai.azure.com/...` | API Key + Model + API Version |
| DeepSeek | `https://api.deepseek.com/v1/chat/completions` | API Key + Model |
| 通义千问 (Qwen) | `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions` | API Key + Model |
| 文心一言 (ERNIE) | `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/...` | API Key + Secret Key + Model |
| 自定义兼容接口 | 任意兼容 OpenAI Chat Completions 格式的地址 | API Key + Endpoint + Model |
| 行业垂直模型 | 用户自建/第三方行业API | API Key + Endpoint + Model |

### 配置流程

```
1. 用户点击「设置」→「外部大模型」进入配置面板
2. 选择「模型提供商」→ 自动填充默认 Endpoint
3. 输入 API Key → 点击「测试连接」
4. 测试通过 → 配置保存 → 后续所有分析使用该模型
5. 如需切换 → 重新配置，旧配置自动覆盖
```

### API Key 安全存储

```
API Key 不存储在前端 localStorage（防XSS泄漏）
    ↓
首次配置 → POST /api/llm-config → Cloud Functions
    ↓
Cloud Functions 使用 Web Crypto API 加密 Key
    ↓
加密后的 Key 存储到 KV Storage（key 前缀: llm:config:{sessionId}）
    ↓
每次分析请求时，Cloud Functions 从 KV 读取并解密
    ↓
用户登出/清除配置 → 删除对应 KV 记录
```

### 模型路由逻辑

```typescript
// Cloud Functions 中的路由逻辑（伪代码）
async function resolveLLMConfig(context: EventContext, userId: string) {
  // 1. 检查用户是否配置了外部模型
  const encryptedConfig = await my_kv.get(`llm:config:${userId}`);

  if (encryptedConfig) {
    // 2. 解密并验证
    const config = await decryptConfig(encryptedConfig);
    const isValid = await testConnection(config);

    if (isValid) {
      return config; // 使用用户的外部模型
    } else {
      // 外部模型连接失败，降级提示
      console.warn('外部模型连接失败，使用内置分析');
    }
  }

  // 3. 降级到内置模型或返回提示
  return getBuiltinConfig(context); // 使用部署者配置的内置模型
}
```

### 典型使用场景举例

**场景A：医药行业合规分析**
```
用户: "这是我的药品生产质量检查数据，我用自己在医药法规数据上训练过的模型"
  ↓
接入用户模型的 API → 分析时自动匹配法规条款
  ↓
输出: "第3项'洁净区温湿度超标'违反《药品生产质量管理规范》第48条
       → 建议安装在线监控系统，设定自动报警阈值"
```

**场景B：金融风控分析**
```
用户: "用我的金融风控模型分析这批贷款申请数据"
  ↓
接入金融精调模型 → 识别高风险模式
  ↓
输出: "申请人群体中23%存在共债风险，建议提高该群体的审批门槛"
```

**场景C：教育质量分析**
```
用户: "接入我的教育大模型，分析学生成绩数据"
  ↓
模型理解教育行业指标 → 学情深度诊断
  ↓
输出: "物理学科成绩与数学基础相关系数0.78，建议对数学薄弱学生提前补课"
```

---

## 模式1: 关系链追踪

### 触发问题示例
- "A变化如何影响B？"
- "这个因素通过什么路径传递到最终结果？"

### 分析逻辑
1. 在图谱中找到从A到B的所有路径（BFS/DFS）
2. 标注直接路径和间接路径
3. 计算每条路径的影响权重
4. 识别关键中转节点（without it, 路径断开）

### 输出格式
```
🔗 关系链: [A] → [C] → [B]
├── 路径长度: 2跳
├── 影响权重: 0.74
├── 关键中转: [C]（移除后A-B路径断开）
├── 证据: Sheet1 行 1,240-1,350 的数据显示...
└── 置信度: 高 (基于 87% 的数据覆盖率)
```

---

## 模式2: 关键节点识别

### 触发问题示例
- "哪些实体是核心枢纽？"
- "最重要的影响因素是什么？"

### 分析逻辑
1. 计算每个节点的中心性指标：
   - 度中心性（出入度总数）
   - 介数中心性（最短路径经过次数）
   - PageRank（重要性传播）
2. 按重要性排序输出 TOP-N

### 输出格式
```
⭐ 关键节点 TOP-5
1. [客户ID] 度中心性: 142 | 介数中心性: 0.83 | 影响覆盖 67% 节点
2. [产品编码] 度中心性: 98 | 介数中心性: 0.61 | 连接2个实体簇
3. ...
```

---

## 模式3: 聚类与分层

### 触发问题示例
- "数据可以分成哪几类？"
- "有没有自然形成的群体结构？"

### 分析逻辑
1. 对图谱运行社区检测算法（Louvain/Label Propagation）
2. 对数值数据运行 K-Means/DBSCAN 聚类
3. 为每个簇生成语义标签（基于簇内高频属性值）
4. 分析簇间关系（竞争/互补/上下游）

### 输出格式
```
📦 数据聚类结果 (3个自然簇)
簇A "高价值客户群" (2,340条记录)
├── 平均客单价: ¥8,420
├── 复购率: 67%
├── 主要产品: 高端仪器类
└── 与其他簇关系: 与簇C共享30%产品偏好

簇B "价格敏感型" (4,120条记录)
├── ...
```

---

## 模式4: 优劣势诊断

### 触发问题示例
- "当前数据反映了什么优势和短板？"
- "给出完整的SWOT分析"

### 分析逻辑
1. **优势识别**：
   - 高于均值/中位数的指标 × 正面含义
   - 集中度高的优质区域（客户/产品/渠道）
   - 增长趋势显著的维度

2. **劣势识别**：
   - 低于均值的指标 × 负面含义
   - 数据稀疏区域（覆盖不足）
   - 异常值/离群点（潜在问题信号）
   - 集中度风险（过度依赖单一来源）

### 输出格式（严格遵守）
```
✅ 优势分析
1. [优势标题]（依据: 指标X高于行业基准Y%）
   - 量化支撑: 具体数值
   - 竞争意义: 为什么这是优势

2. ...

⚠️ 劣势分析
1. [劣势标题]（依据: 指标X低于行业基准Y% / 数据异常点N个）
   - 量化支撑: 具体数值
   - 风险敞口: 可能导致的影响
   - 紧迫度: 🔴高 / 🟡中 / 🟢低

2. ...

💡 解决方案（每个劣势 ≥ 1个方案）
针对劣势1 "[劣势标题]":
├── [短期方案] (1-3个月)
│   ├── 具体行动: ...
│   ├── 预期效果: [量化]
│   └── 实施成本: 估算
└── [中期方案] (3-12个月)
    ├── 具体行动: ...
    ├── 预期效果: [量化]
    └── 实施成本: 估算
```

---

## 模式5: 趋势推演

### 触发问题示例
- "如果X增长20%，Y会怎么变化？"
- "按当前趋势，半年后会怎样？"

### 分析逻辑
1. 从历史数据中学习 X→Y 的映射关系
2. 应用 what-if 参数变化
3. 输出推演结果（带置信区间）

---

## 模式6: 合规/风险评估

### 触发问题示例
- "有哪些潜在风险点？"
- "是否符合某种标准/规范？"

### 分析逻辑
1. 检测数据异常模式（超出阈值/不合预期）
2. 匹配已知风险模式库
3. 给出风险等级和建议的控制措施

---

## AI Prompt 模板（/api/analyze 使用）

```
你是一个数据关系分析专家。请根据以下信息对数据进行深度分析。

## 数据上下文
{dataProfile}

## 关系图谱
{graphSummary}

## 用户问题
{userQuery}

## 分析要求
1. 每个结论必须有数据行引用作为证据
2. 不确定的推论标注置信度
3. 优劣势必须量化（具体数值+对比基准）
4. 劣势必须给出可操作的解决方案（含预期效果量化）
5. 使用 markdown 格式输出

## 分析模式
{selectedModes}
```

---

## Cloud Functions 实现要点

```typescript
// cloud-functions/api/analyze.ts
export async function onRequestPost(context: EventContext) {
  const { data, graph, query, modes, userId } = await context.request.json();

  // 1. 解析LLM配置（优先外部模型，降级内置模型）
  const llmConfig = await resolveLLMConfig(userId, context);
  if (llmConfig.source === 'external') {
    console.log(`[LLM] 使用外部模型: ${llmConfig.model} via ${llmConfig.provider}`);
  } else {
    console.log('[LLM] 使用内置通用分析模型');
  }

  // 2. 构建分析prompt（附加上下文信息）
  const prompt = buildAnalysisPrompt(data, graph, query, modes, llmConfig);

  // 3. 调用AI API（路由到对应的endpoint）
  const aiResponse = await fetch(llmConfig.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${llmConfig.apiKey}`,
      ...(llmConfig.extraHeaders || {}),  // 部分模型需要额外header（如Azure的api-key）
    },
    body: JSON.stringify({
      model: llmConfig.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,  // 低温度确保严谨性
    }),
  });

  // 4. 解析结构化结论
  const result = await aiResponse.json();
  const conclusions = parseConclusions(result);

  return new Response(JSON.stringify({
    success: true,
    llmSource: llmConfig.source,     // 'external' | 'builtin'
    modelName: llmConfig.model,
    conclusions,
    evidenceChains: extractEvidence(conclusions),
    confidence: calculateConfidence(conclusions),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// 解析LLM配置：外部 > 内置
async function resolveLLMConfig(userId: string, context: EventContext): Promise<LLMConfig> {
  // 检查用户配置的外部模型
  const encrypted = await my_kv.get(`llm:config:${userId}`);
  if (encrypted) {
    const userConfig = await decryptConfig(encrypted);
    if (await testConnection(userConfig)) {
      return { source: 'external', ...userConfig };
    }
  }
  // 降级使用内置模型
  return {
    source: 'builtin',
    endpoint: context.env.AI_API_ENDPOINT,
    apiKey: context.env.AI_API_KEY,
    model: context.env.AI_MODEL || 'gpt-4o',
    provider: 'default',
    extraHeaders: {},
  };
}

// cloud-functions/api/llm-config.ts — 保存/测试/删除外部模型配置
export async function onRequestPost(context: EventContext) {
  const { action, userId, config } = await context.request.json();

  if (action === 'test') {
    // 测试连接
    const ok = await testConnection(config);
    return Response.json({ success: ok, message: ok ? '连接成功' : '连接失败，请检查配置' });
  }

  if (action === 'save') {
    // 加密并保存
    const encrypted = await encryptConfig(config);
    await my_kv.put(`llm:config:${userId}`, encrypted);
    return Response.json({ success: true, message: '配置已加密保存' });
  }

  if (action === 'delete') {
    await my_kv.delete(`llm:config:${userId}`);
    return Response.json({ success: true, message: '配置已删除，恢复使用内置分析' });
  }
}

export async function onRequestGet(context: EventContext) {
  const { userId } = context.params;
  const encrypted = await my_kv.get(`llm:config:${userId}`);
  if (!encrypted) {
    return Response.json({ configured: false });
  }
  const config = await decryptConfig(encrypted);
  // 返回配置信息（隐藏API Key）
  return Response.json({
    configured: true,
    provider: config.provider,
    model: config.model,
    apiKeyMasked: config.apiKey.slice(0, 6) + '...' + config.apiKey.slice(-4),
  });
}
```
