# Deployment — EdgeOne Pages 部署集成

## 概述

本 Skill 的开发成果最终部署到 **EdgeOne Pages**，利用其全栈能力：Cloud Functions（分析引擎） + Edge Functions（缓存） + KV Storage（会话） + Middleware（安全）。

---

## 部署前 Checklist

| # | 检查项 | 命令/操作 |
|---|--------|----------|
| 1 | Node.js ≥ 18 | `node -v` |
| 2 | EdgeOne CLI ≥ 1.2.30 | `edgeone -v` |
| 3 | 项目已初始化 | `edgeone pages init` |
| 4 | `.env.local` 已配置 | 含 AI_API_KEY, AI_API_ENDPOINT, AI_MODEL |
| 5 | KV Storage 已启用 | 控制台 → KV Storage → 创建命名空间 → 绑定项目 |
| 6 | Middleware 未与框架冲突 | 确认不是 Next.js/Nuxt 项目（否则用框架自带 middleware） |

---

## KV Storage 配置

### 1. 在控制台启用并创建
```
EdgeOne Pages 控制台 → KV Storage → 立即申请 → 创建命名空间
命名空间名称: data-lens-cache
```

### 2. 绑定到项目并设置变量名
```
变量名: my_kv
```

### 3. 在 Edge Functions 中使用
```javascript
// edge-functions/api/cache.ts
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const cacheKey = url.searchParams.get('key');

  if (context.request.method === 'GET') {
    const cached = await my_kv.get(`cache:${cacheKey}`);
    if (cached) {
      return new Response(cached, {
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
      });
    }
    return new Response(JSON.stringify({ hit: false }), {
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
    });
  }

  if (context.request.method === 'POST') {
    const { key, value, ttl } = await context.request.json();
    await my_kv.put(`cache:${key}`, JSON.stringify(value));
    return new Response(JSON.stringify({ success: true }));
  }
}
```

---

## Middleware 配置

```javascript
// middleware.js — API限流 + CORS + 请求日志
export const config = {
  matcher: ['/api/:path*'],
};

export function middleware(context) {
  const { request, next, clientIp } = context;
  const url = new URL(request.url);

  // CORS 头
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // 文件上传大小限制
  if (url.pathname === '/api/parse' && request.method === 'POST') {
    const contentLength = request.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: '文件大小超过50MB限制' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json', ...Object.fromEntries(headers) },
      });
    }
  }

  return next({ headers: Object.fromEntries(headers) });
}
```

---

## 环境变量

在 EdgeOne Pages 控制台配置，或通过 `.env.local` 本地开发：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `AI_API_KEY` | 内置AI服务 API Key（可选，用户有外部模型时可跳过） | `sk-...` |
| `AI_API_ENDPOINT` | 内置AI API 地址（可选） | `https://api.openai.com/v1/chat/completions` |
| `AI_MODEL` | 内置默认模型（可选） | `gpt-4o` |
| `MAX_FILE_SIZE` | 最大文件大小(MB) | `50` |
| `ANALYSIS_TIMEOUT` | 分析超时(秒) | `120` |
| `ENCRYPTION_KEY` | API Key加密密钥（32字节Base64） | 自动生成或手动设置 |

> 💡 **外部模型说明**：内置的 `AI_API_KEY` 等变量为可选配置。即使不配置内置AI服务，用户仍可在应用内自行接入外部大模型API（OpenAI/Azure/DeepSeek/通义千问/文心一言/行业垂直模型等）。两种方式并行支持，互不冲突。

拉取环境变量到本地：
```bash
export PAGES_SOURCE=skills
edgeone pages env pull
```

---

## 部署流程（委托 edgeone-pages-deploy）

当用户说"部署"、"上线"、"发布"时，委托 `edgeone-pages-deploy` Skill：

```
1. 检查 CLI 版本 ≥ 1.2.30
2. 登录认证（引导用户选择中国站/全球站）
3. 自动检测框架（Vite）→ 构建 dist/
4. 部署到 EdgeOne Pages
5. 返回访问URL + 控制台链接
```

### 部署命令
```bash
# 首次部署（创建新项目）
export PAGES_SOURCE=skills
edgeone pages deploy -n "data-lens"

# 后续更新
edgeone pages deploy
```

---

## 本地开发

```bash
# 初始化
edgeone pages init

# 安装依赖
npm install

# 启动本地服务器（端口 8088）
# 前端 + Cloud Functions + Edge Functions + Middleware 一体化
edgeone pages dev

# 访问: http://localhost:8088/
```

---

## 上线后验证

| 验证项 | 方法 |
|--------|------|
| 前端页面加载 | 浏览器访问 URL |
| 文件上传解析 | 上传测试文件（Excel/CSV/JSON），检查数据画像 |
| 关系图谱渲染 | 检查图谱节点和连线是否正常显示 |
| AI分析功能 | 选择分析模式，检查结论是否返回 |
| KV Storage | 检查缓存命中和过期策略 |
| Middleware | 检查大文件上传拒绝、CORS 头 |
| 响应式 | 手机/平板/桌面不同宽度测试 |

---

## 自定义域名（可选）

建议用户在 EdgeOne Pages 控制台绑定已备案的自定义域名以确保长期稳定访问：

> ℹ️ 预览链接用于快速验证。在国内网络环境下，因域名备案状态等原因，链接可能在一段时间后出现访问限制。如需长期稳定对外访问，建议绑定已备案的自定义域名。
