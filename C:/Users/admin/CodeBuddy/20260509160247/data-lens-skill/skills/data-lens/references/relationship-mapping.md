# Relationship Mapping — 内容关系图谱构建

## 核心目标

将用户数据的实体和关系转化为有向/无向图结构，使关系可视化并支持图分析算法。

## 实体识别

### 实体类型自动判定

| 数据特征 | 实体类型 | 图节点样式 |
|---------|---------|-----------|
| 唯一标识(主键)+分类属性 | 维度实体 | 蓝色圆形 |
| 数值型+可聚合 | 指标实体 | 绿色菱形 |
| 时间戳+状态变化 | 事件实体 | 橙色六边形 |
| 外键+参照其他表 | 关系实体 | 紫色圆角矩形 |

### 实体提取优先级

1. **主键列** → 核心实体（每条记录 = 一个实体节点）
2. **外键列** → 连接两个实体的边
3. **分类列** → 实体的属性标签
4. **数值列** → 实体的度量指标

## 关系检测算法

### 自动检测规则

```
检测顺序（优先级从高到低）：

1. 【主外键】检测跨Sheet的列名匹配
   - 完全匹配: "客户ID" ↔ "客户ID" → 高分
   - 模糊匹配: "客户编号" ↔ "客户ID" → 中分（需确认）
   - 语义匹配: "buyer_id" ↔ "客户ID" → 低分（需确认）

2. 【层级关系】检测数值列的包含关系
   - 总额 = 子项求和 → 聚合关系
   - 路径编码: "A-01", "A-01-01" → 父子层级

3. 【时序关系】检测时间列的顺序依赖
   - 创建时间 < 修改时间 → 状态流转
   - 同一实体多条时间记录 → 事件链

4. 【关联关系】检测文本列的共现/相似度
   - 同义词: "血糖仪" "血糖检测仪" → 语义关联
   - 编码前缀: 相同前缀 → 分类关联
```

### 关系强度计算

```
关系强度 = α × 结构匹配度 + β × 语义相似度 + γ × 数据覆盖度
```

- 结构匹配度：外键约束/列名匹配
- 语义相似度：字段内容相似度（Jaccard/tf-idf）
- 数据覆盖度：关联记录占总记录的比例

## 图数据结构

### 前端渲染数据格式（vis-network）

```typescript
interface GraphData {
  nodes: Array<{
    id: string;
    label: string;
    group: 'dimension' | 'metric' | 'event' | 'relation';
    value: number;        // 影响权重 → 节点大小
    mass: number;         // 物理模拟质量
    properties: Record<string, any>;
  }>;
  edges: Array<{
    from: string;
    to: string;
    label: string;        // 关系类型
    value: number;        // 关系强度 → 连线粗细
    arrows?: 'to' | 'from' | 'both';
    dashes?: boolean;     // 虚线=弱关系
    properties: Record<string, any>;
  }>;
}
```

### 图数据存入 KV Storage

```typescript
// 存储图数据（Edge Functions + KV）
await my_kv.put(`graph:${projectId}:nodes`, JSON.stringify(graphData.nodes));
await my_kv.put(`graph:${projectId}:edges`, JSON.stringify(graphData.edges));
await my_kv.put(`graph:${projectId}:meta`, JSON.stringify({
  createdAt: Date.now(),
  entityCount: graphData.nodes.length,
  relationCount: graphData.edges.length,
  dataHash: hashData,
}));
```

## 关系图交互功能

| 功能 | 实现方式 | 用户体验 |
|------|---------|---------|
| 缩放平移 | vis-network 内置 | 鼠标滚轮+拖拽 |
| 节点筛选 | 按实体类型/属性值过滤 | 下拉多选+搜索 |
| 高亮路径 | 选中节点 → 高亮入度+出度2跳 | 点击节点 |
| 聚焦子图 | 双击节点 → 放大只显示该节点及相关节点 | 双击节点 |
| 数据探查 | 悬停节点 → 弹出属性摘要卡片 | 悬停0.5秒 |
| 导出图片 | HTML Canvas → PNG/SVG | 导出按钮 |
| 图例 | 左下角固定图例面板 | 颜色+形状=实体类型 |
