# AIMORELOGY 全链路开发框架文档

## 🏗️ 架构概览

这是一个基于微信登录的AI工具平台，采用三层架构：
- **前端主项目**：用户界面和功能模块
- **后台管理项目**：管理员控制面板
- **Cloudflare Workers后端**：API服务和数据存储

## 📍 仓库地址

### 主项目仓库
- **GitHub**: https://github.com/Jeff010726/AIMORELOGY-TOOLS.git
- **GitHub Pages**: https://jeff010726.github.io/AIMORELOGY-TOOLS/
- **本地路径**: `d:/wechat_login/`

### 后台管理仓库
- **GitHub**: https://github.com/Jeff010726/AIMORELOGY-TOOLS-BACKSTAGE.git
- **GitHub Pages**: https://jeff010726.github.io/AIMORELOGY-TOOLS-BACKSTAGE/
- **本地路径**: `d:/wechat_login/AIMORELOGY-TOOLS-BACKSTAGE/`

### 后端服务
- **Cloudflare Workers**: https://wechat-login-worker.internal-articleno.workers.dev
- **绑定域名**: https://aimorelogybackend.site
- **本地代码**: `d:/wechat_login/src/`

## 🔑 API密钥和配置

### DeepSeek API
```javascript
apiKey: 'sk-bfb1a4a3455940aa97488e61bf6ee924'
baseUrl: 'https://api.deepseek.com/v1'
model: 'deepseek-chat'
```

### 微信公众号配置
```javascript
appId: 'wx6853dcc42bde01e0'
appSecret: '需要从微信公众平台获取'
```

### Cloudflare配置
```toml
# wrangler.toml
name = "wechat-login-worker"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "WECHAT_KV"
id = "bcbeb4be48d742fb96e463898531a7fe"

[[durable_objects.bindings]]
name = "SESSIONS"
class_name = "Session"
```

### 管理员Token
```javascript
adminToken: 'admin_secret_token'
```

## 🔄 工作原理和闭环

### 1. 用户访问流程
```
用户访问 → GitHub Pages前端 → 微信登录 → Cloudflare Workers验证 → 返回用户信息 → 前端渲染
```

### 2. 功能使用流程
```
用户操作 → 前端验证权限 → 调用Cloudflare API → 处理业务逻辑 → 更新数据库 → 返回结果
```

### 3. 管理员监控流程
```
管理员访问后台 → 调用管理API → 获取统计数据 → 渲染图表和列表 → 实时监控
```

### 4. 数据流转
```
前端 ←→ Cloudflare Workers ←→ KV存储
              ↕
        后台管理系统
```

## 📁 项目结构

### 主项目结构
```
d:/wechat_login/
├── index.html                 # 主页面
├── article-generator.html     # 文章生成页面
├── wechat-login.html         # 登录页面
├── sections/                 # 功能模块
│   ├── wechat-login.js      # 登录模块
│   └── article-generator.js  # 文章生成模块
├── src/                     # 后端代码
│   ├── index.js            # 主入口
│   └── session.js          # 会话管理
├── wrangler.toml           # Cloudflare配置
└── package.json            # 依赖配置
```

### 后台项目结构
```
AIMORELOGY-TOOLS-BACKSTAGE/
├── index.html              # 后台主页
├── js/                    # JavaScript文件
│   ├── main.js           # 主控制器
│   ├── api.js            # API调用
│   └── users.js          # 用户管理
└── styles/               # 样式文件
    ├── main.css         # 主样式
    └── users.css        # 用户管理样式
```

## 🔌 API接口文档

### 用户认证接口

#### 1. 获取微信登录URL
```javascript
GET /wechat/login
Response: { loginUrl: "https://open.weixin.qq.com/..." }
```

#### 2. 微信回调处理
```javascript
GET /wechat/callback?code=xxx&state=xxx
Response: { success: true, user: {...}, token: "xxx" }
```

#### 3. 验证Token
```javascript
POST /verify_token
Body: { token: "xxx" }
Response: { success: true, user: {...} }
```

### 功能模块接口

#### 1. 文章生成
```javascript
POST /generate_article
Headers: { Authorization: "Bearer token" }
Body: {
  prompt: "文章主题",
  style: "写作风格",
  length: "文章长度"
}
Response: Stream (Server-Sent Events)
```

#### 2. 更新使用次数
```javascript
POST /update_article_usage
Body: {
  token: "用户token",
  action: "article_generation",
  amount: 1,
  tokenConsumed: 441
}
Response: {
  success: true,
  usage: { daily: 3, total: 3, lastResetDate: "..." },
  tokenUsage: { article: { daily: 441, total: 441, ... } }
}
```

### 管理员接口

#### 1. 获取所有用户
```javascript
GET /admin/list_all_keys?adminToken=admin_secret_token
Response: { success: true, keys: [...] }

GET /admin/get_user?key=user:openid&adminToken=admin_secret_token
Response: { success: true, user: {...} }
```

#### 2. 用户统计
```javascript
GET /admin/get_user_stats?adminToken=admin_secret_token
Response: {
  success: true,
  stats: {
    total: 100,
    vip: 10,
    svip: 5,
    dailyActive: 20
  }
}
```

#### 3. Token统计
```javascript
GET /admin/get_token_stats?adminToken=admin_secret_token
Response: {
  success: true,
  stats: {
    totalTokens: 50000,
    dailyTokens: 1500,
    articleTokens: 45000,
    topUsers: [...]
  }
}
```

#### 4. 更新用户等级
```javascript
POST /admin/update_user_level
Body: {
  openid: "用户openid",
  newLevel: "vip",
  adminToken: "admin_secret_token"
}
Response: { success: true, message: "等级更新成功" }
```

## 🚀 部署流程

### 1. 主项目部署
```bash
cd d:/wechat_login
git add .
git commit -m "更新功能"
git push origin main
# GitHub Pages自动部署
```

### 2. 后台项目部署
```bash
cd d:/wechat_login/AIMORELOGY-TOOLS-BACKSTAGE
git add .
git commit -m "更新后台"
git push origin main
# GitHub Pages自动部署
```

### 3. 后端部署
```bash
cd d:/wechat_login
wrangler deploy
# 自动部署到Cloudflare Workers
```

## 🔧 新功能模块接入指南

### 1. 前端模块开发

#### 文件位置
- 页面文件：`/新功能.html`
- 模块文件：`/sections/新功能.js`
- 样式文件：`/sections/新功能.css`

#### 模块结构模板
```javascript
// sections/新功能.js
class 新功能Module {
    constructor(options = {}) {
        this.config = {
            apiBaseUrl: 'https://aimorelogybackend.site',
            ...options
        };
        this.currentUser = null;
    }

    // 初始化模块
    async init(container) {
        this.container = container;
        await this.render();
        this.bindEvents();
    }

    // 渲染界面
    async render() {
        this.container.innerHTML = `
            <!-- 模块HTML -->
        `;
    }

    // 绑定事件
    bindEvents() {
        // 事件处理
    }

    // API调用
    async callAPI(data) {
        const response = await fetch(`${this.config.apiBaseUrl}/新功能_api`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.currentUser.token}`
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    }
}

// 导出模块
window.新功能Module = 新功能Module;
```

### 2. 后端API开发

#### 在src/index.js中添加路由
```javascript
// 在handleRequest函数中添加
} else if (url.pathname === '/新功能_api') {
    return await handle新功能(request, env);
```

#### API处理函数模板
```javascript
async function handle新功能(request, env) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const body = await request.json();
        const { token } = body;

        // 验证用户token
        const user = await validateUserToken(token, env);
        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                error: '用户未登录或token无效'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        // 检查用户权限和使用限制
        const canUse = await checkUsageLimit(user, '新功能');
        if (!canUse.allowed) {
            return new Response(JSON.stringify({
                success: false,
                error: canUse.reason
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        // 业务逻辑处理
        const result = await process新功能(body, user, env);

        // 更新使用次数
        await updateUsageCount(user.openid, '新功能', 1, env);

        return new Response(JSON.stringify({
            success: true,
            data: result
        }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });

    } catch (error) {
        console.error('新功能处理失败:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
}
```

### 3. 后台管理集成

#### 在后台添加新功能统计
```javascript
// AIMORELOGY-TOOLS-BACKSTAGE/js/api.js
async get新功能Stats() {
    return await this.request('/admin/get_新功能_stats', {
        method: 'GET'
    });
}

// AIMORELOGY-TOOLS-BACKSTAGE/js/main.js
// 在updateDashboard中添加
const 新功能Data = await window.adminAPI.get新功能Stats();
if (新功能Data.success) {
    this.updateStatCard('新功能-count', 新功能Data.stats.total);
}
```

## 📊 数据结构

### 用户数据结构
```javascript
{
    "openid": "用户唯一标识",
    "userid": "用户ID",
    "level": "normal|vip|svip|admin",
    "nickname": "用户昵称",
    "avatar": "头像URL",
    "createdAt": "2025-09-12T07:20:58.095Z",
    "lastLoginAt": "2025-09-15T03:57:18.243Z",
    "usage": {
        "total": 0,
        "daily": 0,
        "lastResetDate": "2025-09-12"
    },
    "articleUsage": {
        "total": 3,
        "daily": 3,
        "lastResetDate": "Mon Sep 15 2025"
    },
    "tokenUsage": {
        "article": {
            "daily": 441,
            "total": 441,
            "lastResetDate": "Mon Sep 15 2025"
        }
    },
    "limits": {
        "daily": 10,
        "features": ["basic"],
        "articleDaily": 10
    },
    "wechatInfo": { /* 微信用户信息 */ },
    "token": "用户token",
    "expireTime": 1758513438243,
    "loginTime": 1757908638247
}
```

## ⚠️ 重要注意事项

### Git仓库管理
1. **主项目和子项目是独立的Git仓库**
2. **绝对不要在主项目中提交AIMORELOGY-TOOLS-BACKSTAGE文件夹**
3. **分别在各自目录下进行Git操作**

### 部署顺序
1. 先部署后端（Cloudflare Workers）
2. 再部署前端（GitHub Pages）
3. 最后部署后台（GitHub Pages）

### API调用规范
1. **所有API都要包含CORS头**
2. **用户API需要token验证**
3. **管理员API需要adminToken验证**
4. **错误处理要统一格式**

### 新功能开发检查清单
- [ ] 前端模块文件创建
- [ ] 后端API路由添加
- [ ] 权限验证实现
- [ ] 使用次数统计
- [ ] 错误处理完善
- [ ] 后台管理集成
- [ ] 测试所有接口
- [ ] 部署验证

## 🔄 开发工作流

### 日常开发
1. 在本地开发新功能
2. 测试前后端联调
3. 提交到对应Git仓库
4. 部署到生产环境
5. 验证功能正常

### 问题排查
1. 检查浏览器控制台日志
2. 检查Cloudflare Workers日志
3. 验证API接口返回
4. 检查用户权限和限制
5. 确认数据结构正确

这个框架已经成型，所有新功能都应该按照这个规范进行开发，确保系统的一致性和可维护性。