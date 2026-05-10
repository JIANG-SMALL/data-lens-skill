# Visualization — 可视化图表规范

## 两套可视化体系

| 体系 | 技术 | 用途 | 组件 |
|------|------|------|------|
| 关系可视化 | vis-network (Canvas) | 实体-关系图谱，交互式探索 | `<RelationshipGraph>` |
| 统计可视化 | ECharts 5 (SVG/Canvas) | 趋势/分布/对比/组成分析 | `<AnalysisReport>` 内嵌 |

---

## 关系图配置（vis-network）

### 节点设计

```typescript
const nodeGroups = {
  dimension: {  // 维度实体（机构/产品/人员/地区/类别）
    shape: 'dot',
    color: { background: '#60a5fa', border: '#3b82f6' },
    scaling: { min: 10, max: 50 },  // 按权重缩放
  },
  metric: {     // 指标实体（金额/数量/比率）
    shape: 'diamond',
    color: { background: '#34d399', border: '#059669' },
    scaling: { min: 8, max: 40 },
  },
  event: {      // 事件实体（时间节点/状态变更）
    shape: 'hexagon',
    color: { background: '#fb923c', border: '#ea580c' },
    scaling: { min: 12, max: 45 },
  },
  relation: {   // 关系实体（外键/引用表）
    shape: 'box',
    color: { background: '#c084fc', border: '#7c3aed' },
    scaling: { min: 8, max: 35 },
  },
};
```

### 边线设计

| 关系类型 | 线型 | 箭头 | 示例 |
|---------|------|------|------|
| 主外键(强) | 实线, `#475569`, width=3 | → | Sheet1.客户ID → Sheet2.客户ID |
| 层级(父子) | 实线, `#64748b`, width=2 | → | 部门 → 子部门 |
| 聚合(明细→汇总) | 虚线, `#94a3b8`, width=1.5 | → | 订单明细 → 月汇总 |
| 时序(前后) | 实线, `#f59e0b`, width=2 | →→ | 创建 → 审核 → 完成 |
| 关联(弱) | 虚线, `#64748b`, width=1 | — (无箭头) | 同义词关联 |

### 布局算法

- **默认**: hierarchical（层次布局，适合有明确方向的层级关系）
- **自动切换**: 当图中循环/网状结构占主导 → 自动切换为 forceAtlas2Based（力导向）
- **用户手动切换**: 工具栏提供布局切换按钮

### 图例面板（左下角固定）

```
┌─ 图例 ────────────────┐
│ ● 维度实体 (蓝)  █████ │
│ ◆ 指标实体 (绿)  █████ │
│ ⬡ 事件实体 (橙)  █████ │
│ ■ 关系实体 (紫)  █████ │
│ ─── 强关系 ──────     │
│ ╌╌╌ 弱关系 ╌╌╌╌     │
│ 节点大小 = 影响权重     │
└────────────────────────┘
```

---

## 统计图配置（ECharts）

分析报告中按需嵌入的统计图表类型：

### 1. 趋势图（时序数据）

```typescript
// 触发条件: 数据含时间序列
const lineChart = {
  type: 'line',
  option: {
    xAxis: { type: 'time' },
    yAxis: { type: 'value' },
    series: [{ data: timeSeriesData, smooth: true, areaStyle: {} }],
    color: ['#38bdf8'],
    backgroundColor: 'transparent',
    textStyle: { color: '#94a3b8' },
  },
};
```

### 2. 分布图（数值分布）

```typescript
// 触发条件: 单列数值型数据，用于理解数据集中度
const histogram = {
  type: 'bar',
  option: {
    xAxis: { type: 'category' },  // 区间标签
    yAxis: { type: 'value' },
    series: [{ data: distributionData, itemStyle: { color: '#60a5fa' } }],
  },
};
```

### 3. 对比图（多组对比）

```typescript
// 触发条件: 分类维度 × 数值指标
const barChart = {
  type: 'bar',
  option: {
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series: groupData.map((g, i) => ({
      name: g.name,
      data: g.values,
      color: palette[i % palette.length],
    })),
  },
};
```

### 4. 占比图（部分与整体）

```typescript
// 触发条件: 分类维度 × 数值指标，适合展示占比
const pieChart = {
  type: 'pie',
  option: {
    series: [{
      type: 'pie',
      data: pieData,
      radius: ['40%', '70%'],  // 环形图
      label: { color: '#94a3b8' },
    }],
    color: palette,
  },
};
```

### 5. 相关热力图（多变量相关）

```typescript
// 触发条件: 多列数值型数据，分析变量间关联
const heatmap = {
  type: 'heatmap',
  option: {
    xAxis: { data: columnNames },
    yAxis: { data: columnNames },
    visualMap: { min: -1, max: 1, inRange: { color: ['#ef4444', '#1e293b', '#22c55e'] } },
    series: [{ data: correlationMatrix }],
  },
};
```

### 6. SWOT 雷达图（优劣势多维度）

```typescript
// 触发条件: 优劣势诊断模式
const radarChart = {
  type: 'radar',
  option: {
    radar: {
      indicator: dimensions,
      shape: 'polygon',
      splitArea: { areaStyle: { color: ['#0f172a', '#1e293b'] } },
    },
    series: [{
      type: 'radar',
      data: [{ value: scores, name: '当前状态', areaStyle: { color: '#38bdf833' } }],
    }],
  },
};
```

---

## 统一主题（暗色）

所有 ECharts 图表统一使用暗色主题配置：

```typescript
const darkTheme = {
  backgroundColor: 'transparent',
  textStyle: { color: '#94a3b8' },
  title: { textStyle: { color: '#f1f5f9', fontSize: 14 } },
  legend: { textStyle: { color: '#64748b' } },
  tooltip: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    textStyle: { color: '#f1f5f9' },
  },
  grid: { borderColor: '#334155' },
  splitLine: { lineStyle: { color: '#1e293b' } },
};
```

---

## 交互设计

| 交互 | 触发 | 行为 |
|------|------|------|
| 节点悬停 | `hover` 0.5秒 | 弹出卡片：实体名称、类型、关键属性 |
| 节点点击 | `click` | 高亮关联节点+边，聚焦子图 |
| 路径高亮 | 选中两个节点 | 显示最短路径+所有路径+路径权重 |
| 筛选 | 图例点击 / 侧边栏搜索 | 按实体类型/属性值过滤节点 |
| 导出 | 导出按钮 | PNG/SVG/JSON 三种格式 |
| 图表联动 | 点击可视化图节点 | 统计图表同步筛选该节点的相关数据 |
