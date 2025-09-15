# AIMORELOGY 全链路开发框架文档

## 🏗️ 架构概览

这是一个基于微信登录的AI工具平台，采用三层架构：
- **前端主项目**：用户界面和功能模块
- **后台管理项目**：管理员控制面板
- **Cloudflare Workers后端**：API服务和数据存储

## 📍 仓库地址

### 主项目仓库
- **GitHub**: https://github.com/AIMORELOGY-TOOLS/aimorelogy-tools.github.io.git
- **GitHub Pages**: https://tools.aimorelogy.com
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
│   ├── article-generator.js  # 文章生成模块
│   ├── markdown-editor.js   # Markdown编辑器模块
│   ├── markdown-editor.css  # Markdown编辑器样式
│   ├── wechat-format.js     # 微信公众号排版模块
│   └── wechat-format.css    # 微信公众号排版样式
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

### Markdown编辑器接口

#### 1. Markdown处理
```javascript
POST /markdown_process
Headers: { Authorization: "Bearer token" }
Body: {
  action: "ai_generate|save_markdown|load_markdown",
  prompt: "AI生成提示词（action为ai_generate时）",
  context: "上下文内容（可选）",
  content: "Markdown内容（保存时）",
  title: "文档标题（保存时）",
  documentId: "文档ID（加载时）"
}
Response: {
  // AI生成响应
  success: true,
  content: "生成的Markdown内容",
  tokenConsumed: 150
  
  // 保存响应
  success: true,
  documentId: "md_openid_timestamp",
  message: "文档保存成功"
  
  // 加载响应
  success: true,
  document: {
    id: "文档ID",
    title: "文档标题",
    content: "Markdown内容",
    createdAt: "创建时间",
    updatedAt: "更新时间"
  }
}
```

#### 2. 更新Markdown使用次数
```javascript
POST /update_markdown_usage
Body: {
  token: "用户token",
  action: "markdown_generation",
  amount: 1,
  tokenConsumed: 150
}
Response: {
  success: true,
  usage: { daily: 1, total: 1, lastResetDate: "..." },
  tokenUsage: { markdown: { daily: 150, total: 150, ... } },
  message: "Markdown使用次数更新成功"
}
```

### 微信公众号排版接口

#### 1. 图片上传
```javascript
POST /wechat/upload_image
Headers: { Authorization: "Bearer token" }
Body: FormData with image file
Response: {
  success: true,
  imageUrl: "https://图床地址/image.jpg",
  message: "图片上传成功"
}
```

#### 2. 保存排版模板
```javascript
POST /wechat/save_template
Headers: { Authorization: "Bearer token" }
Body: {
  name: "模板名称",
  content: "排版内容HTML",
  theme: "主题配置",
  customCSS: "自定义CSS"
}
Response: {
  success: true,
  templateId: "template_openid_timestamp",
  message: "模板保存成功"
}
```

#### 3. 获取模板列表
```javascript
GET /wechat/templates
Headers: { Authorization: "Bearer token" }
Response: {
  success: true,
  templates: [
    {
      id: "模板ID",
      name: "模板名称",
      createdAt: "创建时间",
      updatedAt: "更新时间"
    }
  ]
}
```

#### 4. 导出排版内容
```javascript
POST /wechat/export
Headers: { Authorization: "Bearer token" }
Body: {
  content: "排版内容HTML",
  format: "html|markdown"
}
Response: {
  success: true,
  exportedContent: "导出的内容",
  message: "导出成功"
}
```

### 管理员接口

#### 1. 获取所有用户
```javascript
GET /admin/list_all_keys?adminToken=admin_secret_token
Response: { success: true, keys: [...] }

GET /admin/get_user?key=user:openid&adminToken=admin_secret_token
Response: { success: true, user: {...} }

GET /admin/get_all_users
Response: { 
  success: true, 
  users: [
    {
      openid: "用户openid",
      userid: "用户ID", 
      level: "normal|vip|svip|admin",
      nickname: "用户昵称",
      usage: { total: 使用次数, daily: 今日使用次数 },
      createdAt: "注册时间",
      lastLoginAt: "最后登录时间"
    }
  ], 
  total: 用户总数 
}
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
GET /admin/get_token_stats
Response: {
  success: true,
  stats: {
    totalTokens: 50000,
    dailyTokens: 1500,
    articleTokens: 45000,
    topUsers: [
      {
        openid: "用户openid",
        nickname: "用户昵称", 
        totalTokens: 消耗总量,
        dailyTokens: 今日消耗
      }
    ]
  }
}
```

#### 4. Token历史数据（新增）
```javascript
GET /admin/get_token_history
Response: {
  success: true,
  dates: ["2025-09-09", "2025-09-10", "2025-09-11", "2025-09-12", "2025-09-13", "2025-09-14", "2025-09-15"],
  consumption: [0, 0, 0, 0, 0, 0, 1153]
}
```
**功能说明**:
- 获取最近7天的token消耗历史数据
- 用于后台管理系统的token消耗趋势图表
- 历史日期如无消耗记录则显示0
- 当天数据从用户的daily字段实时计算
- 系统自动维护7天历史记录，超过7天的数据会被清理

**前端调用方法**:
```javascript
// 在 AIMORELOGY-TOOLS-BACKSTAGE/js/api.js 中
const tokenHistory = await window.adminAPI.getTokenHistory();
if (tokenHistory.success) {
    console.log('Token历史数据:', tokenHistory.dates, tokenHistory.consumption);
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

### 预留接口规范

#### 新功能接口命名规范
```javascript
// 功能接口：/功能名_action
POST /新功能_generate    // 生成类接口
POST /新功能_process     // 处理类接口
POST /新功能_analyze     // 分析类接口
GET  /新功能_list        // 列表类接口
POST /新功能_update      // 更新类接口

// 管理接口：/admin/功能名_action
GET  /admin/新功能_stats     // 统计接口
POST /admin/新功能_manage    // 管理接口
GET  /admin/新功能_list      // 管理列表接口
```

#### 标准响应格式
```javascript
// 成功响应
{
  "success": true,
  "data": { /* 具体数据 */ },
  "message": "操作成功"
}

// 错误响应
{
  "success": false,
  "error": "错误信息",
  "code": "ERROR_CODE"
}

// 流式响应（SSE）
data: {"type": "progress", "content": "处理中..."}
data: {"type": "result", "content": "最终结果"}
data: {"type": "end"}
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

#### 后台仪表盘完整集成步骤

##### 1. 添加统计卡片（index.html）
```html
<!-- 在仪表盘统计区域添加 -->
<div class="stat-card">
    <div class="stat-icon">📊</div>
    <div class="stat-content">
        <div class="stat-number" id="新功能-count">0</div>
        <div class="stat-label">新功能使用次数</div>
    </div>
</div>
```

##### 2. 添加API接口（js/api.js）
```javascript
class AdminAPI {
    // 现有方法...
    
    async get新功能Stats() {
        return await this.request('/admin/get_新功能_stats', {
            method: 'GET'
        });
    }
    
    async get新功能List(page = 1, limit = 10) {
        return await this.request(`/admin/get_新功能_list?page=${page}&limit=${limit}`, {
            method: 'GET'
        });
    }
}
```

##### 3. 更新仪表盘数据（js/main.js）
```javascript
async updateDashboard() {
    try {
        // 现有统计...
        
        // 新功能统计
        const 新功能Data = await window.adminAPI.get新功能Stats();
        if (新功能Data.success) {
            this.updateStatCard('新功能-count', 新功能Data.stats.total);
        }
        
        // 更新图表数据
        this.updateCharts();
        
    } catch (error) {
        console.error('更新仪表盘失败:', error);
    }
}
```

##### 4. 添加用户详情显示（js/users.js）
```javascript
// 在用户详情模态框中添加新功能使用情况
function showUserDetails(user) {
    const 新功能Usage = user.新功能Usage || { daily: 0, total: 0 };
    const 新功能TokenUsage = user.tokenUsage?.新功能 || { daily: 0, total: 0 };
    
    const detailsHTML = `
        <!-- 现有内容... -->
        
        <div class="usage-section">
            <h4>新功能使用情况</h4>
            <div class="usage-stats">
                <div class="usage-item">
                    <span>今日使用:</span>
                    <span>${新功能Usage.daily}次</span>
                </div>
                <div class="usage-item">
                    <span>总计使用:</span>
                    <span>${新功能Usage.total}次</span>
                </div>
                <div class="usage-item">
                    <span>今日Token:</span>
                    <span>${新功能TokenUsage.daily}</span>
                </div>
                <div class="usage-item">
                    <span>总计Token:</span>
                    <span>${新功能TokenUsage.total}</span>
                </div>
            </div>
        </div>
    `;
    
    // 显示模态框...
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
        // 新功能token使用量会自动添加到这里
        // "新功能": { "daily": 0, "total": 0, "lastResetDate": "..." }
    },
    "limits": {
        "daily": 10,
        "features": ["basic"],
        "articleDaily": 10
        // 新功能限制会自动添加到这里
        // "新功能Daily": 限制次数
    },
    "wechatInfo": {
        "openid": "微信openid",
        "nickname": "微信昵称",
        "sex": 0,
        "province": "省份",
        "city": "城市",
        "country": "国家",
        "headimgurl": "头像URL",
        "subscribe_time": 1757649572,
        "unionid": "unionid",
        "remark": "备注",
        "groupid": 0,
        "tagid_list": [],
        "subscribe_scene": "ADD_SCENE_QR_CODE",
        "qr_scene": 0,
        "qr_scene_str": "场景值",
        "subscribe": 1
    },
    "token": "用户token",
    "expireTime": 1758513438243,
    "loginTime": 1757908638247
}
```

### 用户等级权限体系

#### Normal用户（普通用户）
```javascript
{
    "level": "normal",
    "limits": {
        "daily": 10,                    // 每日总使用次数
        "articleDaily": 10,             // 文章生成每日次数
        "features": ["basic"],          // 可用功能列表
        "tokenDaily": -1,               // 暂不限制token使用量（保留接口）
        "maxRequestSize": -1            // 暂不限制单次请求大小（保留接口）
    }
}
```

#### VIP用户
```javascript
{
    "level": "vip",
    "limits": {
        "daily": 50,                    // 每日总使用次数
        "articleDaily": 30,             // 文章生成每日次数
        "features": ["basic", "advanced"], // 可用功能列表
        "tokenDaily": -1,               // 暂不限制token使用量（保留接口）
        "maxRequestSize": -1            // 暂不限制单次请求大小（保留接口）
    }
}
```

#### SVIP用户
```javascript
{
    "level": "svip",
    "limits": {
        "daily": 200,                   // 每日总使用次数
        "articleDaily": 100,            // 文章生成每日次数
        "features": ["basic", "advanced", "premium"], // 可用功能列表
        "tokenDaily": -1,               // 暂不限制token使用量（保留接口）
        "maxRequestSize": -1            // 暂不限制单次请求大小（保留接口）
    }
}
```

#### Admin用户
```javascript
{
    "level": "admin",
    "limits": {
        "daily": -1,                    // 无限制
        "articleDaily": -1,             // 无限制
        "features": ["all"],            // 所有功能
        "tokenDaily": -1,               // 无限制
        "maxRequestSize": -1            // 无限制
    }
}
```

### Cloudflare KV存储结构

#### 存储键值规范
```javascript
// 用户数据
"user:oEbjz1xSWO69Xfu0aK55vmnHWwdY" -> 用户完整数据对象

// 会话数据
"session:sessionId" -> 会话信息

// 统计数据
"stats:daily:2025-09-15" -> 当日统计数据
"stats:total" -> 总体统计数据

// 功能使用记录
"usage:article:2025-09-15" -> 文章生成当日使用记录
"usage:新功能:2025-09-15" -> 新功能当日使用记录

// 系统配置
"config:system" -> 系统配置信息
"config:limits" -> 等级限制配置
```

#### KV存储操作函数
```javascript
// 获取用户数据
async function getUser(openid, env) {
    const userData = await env.WECHAT_KV.get(`user:${openid}`);
    return userData ? JSON.parse(userData) : null;
}

// 保存用户数据
async function saveUser(user, env) {
    await env.WECHAT_KV.put(`user:${user.openid}`, JSON.stringify(user));
}

// 获取统计数据
async function getStats(date, env) {
    const stats = await env.WECHAT_KV.get(`stats:daily:${date}`);
    return stats ? JSON.parse(stats) : {};
}

// 保存统计数据
async function saveStats(date, stats, env) {
    await env.WECHAT_KV.put(`stats:daily:${date}`, JSON.stringify(stats));
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

## 🔍 完整接口清单

### 现有功能接口
```javascript
// 用户认证
GET  /wechat/login              // 获取登录URL
GET  /wechat/callback           // 微信回调处理
POST /verify_token              // 验证用户token

// 文章生成功能
POST /generate_article          // 生成文章（SSE流式）
POST /update_article_usage      // 更新文章使用统计

// Markdown编辑器功能
POST /markdown_process          // Markdown处理（AI生成、保存、加载）
POST /update_markdown_usage     // 更新Markdown使用统计

// 管理员接口
GET  /admin/list_all_keys       // 获取所有用户键
GET  /admin/get_user            // 获取单个用户信息
GET  /admin/get_all_users       // 获取所有用户数据（新接口）
GET  /admin/get_user_stats      // 获取用户统计
GET  /admin/get_token_stats     // 获取token统计
GET  /admin/get_token_history   // 获取7天token历史数据（新增）
POST /admin/update_user_level   // 更新用户等级

// 系统接口
GET  /health                    // 健康检查
OPTIONS /*                      // CORS预检
```

### 预留接口模板
```javascript
// 新功能接口模板（复制此模板开发新功能）
POST /新功能_generate           // 生成类功能
POST /新功能_process            // 处理类功能
POST /新功能_analyze            // 分析类功能
GET  /新功能_list               // 列表类功能
POST /update_新功能_usage       // 更新使用统计

// 对应管理接口
GET  /admin/get_新功能_stats    // 获取功能统计
GET  /admin/get_新功能_list     // 获取功能列表
POST /admin/manage_新功能       // 管理功能设置
```

### 后台管理前端API调用
```javascript
// 在 AIMORELOGY-TOOLS-BACKSTAGE/js/api.js 中的调用方法
window.adminAPI.getAllUsersNew()     // 调用 /admin/get_all_users
window.adminAPI.getUserStats()       // 调用 /admin/get_user_stats  
window.adminAPI.getTokenStats()      // 调用 /admin/get_token_stats
window.adminAPI.getTokenHistory()    // 调用 /admin/get_token_history（新增）

// 图表数据获取（charts.js中使用）
await window.adminAPI.getAllUsersNew()  // 用户统计和活跃度图表
await window.adminAPI.getUserStats()    // 用户等级分布和注册趋势图表
await window.adminAPI.getTokenHistory() // token消耗趋势图表（新增）
```

### Token计算标准
```javascript
// DeepSeek官方token计算标准
const TOKEN_RATES = {
    chinese: 0.6,      // 中文字符
    english: 0.3,      // 英文字符
    other: 0.5         // 其他字符
};

// 计算函数
function calculateTokens(text) {
    let tokens = 0;
    for (let char of text) {
        if (/[\u4e00-\u9fff]/.test(char)) {
            tokens += TOKEN_RATES.chinese;
        } else if (/[a-zA-Z]/.test(char)) {
            tokens += TOKEN_RATES.english;
        } else {
            tokens += TOKEN_RATES.other;
        }
    }
    return Math.ceil(tokens);
}
```

### 使用限制检查函数
```javascript
// 检查用户是否可以使用功能
async function checkUsageLimit(user, featureName) {
    const today = new Date().toDateString();
    
    // 检查功能权限
    if (!user.limits.features.includes(featureName) && 
        !user.limits.features.includes('all')) {
        return { allowed: false, reason: '您的等级不支持此功能' };
    }
    
    // 检查每日使用次数
    const dailyUsage = user[`${featureName}Usage`]?.daily || 0;
    const dailyLimit = user.limits[`${featureName}Daily`] || user.limits.daily;
    
    if (dailyLimit !== -1 && dailyUsage >= dailyLimit) {
        return { allowed: false, reason: '今日使用次数已达上限' };
    }
    
    // Token和文本长度限制暂时不启用，保留接口供将来使用
    // const tokenUsage = user.tokenUsage?.[featureName]?.daily || 0;
    // const tokenLimit = user.limits.tokenDaily;
    // if (tokenLimit !== -1 && tokenUsage >= tokenLimit) {
    //     return { allowed: false, reason: '今日token使用量已达上限' };
    // }
    
    return { allowed: true };
}
```

### 新功能开发检查清单
- [ ] 前端模块文件创建（/sections/新功能.js）
- [ ] 页面文件创建（/新功能.html）
- [ ] 后端API路由添加（src/index.js）
- [ ] 权限验证实现（checkUsageLimit）
- [ ] 使用次数统计（update新功能Usage）
- [ ] Token消耗统计（tokenUsage更新）
- [ ] 错误处理完善（try-catch + 标准响应）
- [ ] 后台管理集成（统计卡片 + API接口）
- [ ] 用户详情显示（使用情况展示）
- [ ] 等级限制配置（limits对象更新）
- [ ] 数据结构扩展（用户对象字段）
- [ ] 测试所有接口（前端调用 + 后台显示）
- [ ] 部署验证（三个地址同步更新）

## 🔄 开发工作流

### 日常开发
1. 在本地开发新功能
2. **注意：涉及微信登录的功能无法本地测试，必须部署后测试**
3. 提交到对应Git仓库
4. 部署到生产环境
5. 在线验证功能正常

### 测试环境说明
- **本地测试限制**：微信登录回调需要HTTPS和已配置的域名，本地无法测试
- **在线测试必需**：所有涉及用户登录的功能都必须部署到GitHub Pages后测试
- **测试流程**：开发 → 提交 → 部署 → 在线测试 → 修复 → 重新部署

### 问题排查
1. 检查浏览器控制台日志
2. 检查Cloudflare Workers日志
3. 验证API接口返回
4. 检查用户权限和限制
5. 确认数据结构正确
6. **重要：微信登录问题只能在线环境排查，本地无法复现**

## 🚨 关键注意事项

### 当前限制策略
- ✅ **使用次数限制**：按等级限制每日使用次数
- ❌ **Token限制**：暂不启用，接口已保留（tokenDaily: -1）
- ❌ **文本长度限制**：暂不启用，接口已保留（maxRequestSize: -1）
- 📝 **说明**：Token和文本长度限制功能完整保留，如需启用只需修改对应数值

### 三地址协调机制
1. **主项目地址**: https://tools.aimorelogy.com
2. **后台地址**: https://jeff010726.github.io/AIMORELOGY-TOOLS-BACKSTAGE/
3. **API地址**: https://aimorelogybackend.site

### 数据同步要求
- 所有用户操作必须实时更新到KV存储
- 后台仪表盘必须能实时显示最新数据
- 三个地址的API调用必须保持一致

### 部署同步检查
```bash
# 检查主项目部署
curl -I https://tools.aimorelogy.com

# 检查后台部署
curl -I https://jeff010726.github.io/AIMORELOGY-TOOLS-BACKSTAGE/

# 检查API服务
curl -I https://aimorelogybackend.site/health
```

### 新功能完整开发流程
1. **设计阶段**: 确定功能需求和接口设计
2. **前端开发**: 创建页面和模块文件
3. **后端开发**: 添加API路由和业务逻辑
4. **权限集成**: 配置等级限制和使用统计
5. **后台集成**: 添加管理界面和统计显示
6. **测试验证**: 全链路功能测试
7. **部署上线**: 三地址同步部署
8. **监控验证**: 确认功能正常运行

### 故障排查步骤
1. **检查前端控制台**: 查看JavaScript错误
2. **检查网络请求**: 验证API调用状态
3. **检查Cloudflare日志**: 查看后端处理情况
4. **检查KV存储**: 验证数据存储状态
5. **检查用户权限**: 确认等级和限制设置
6. **检查后台显示**: 验证管理界面数据

### 数据备份和恢复
```javascript
// 导出用户数据
async function exportAllUsers(env) {
    const keys = await env.WECHAT_KV.list({ prefix: 'user:' });
    const users = [];
    for (const key of keys.keys) {
        const userData = await env.WECHAT_KV.get(key.name);
        users.push(JSON.parse(userData));
    }
    return users;
}

// 导入用户数据
async function importUsers(users, env) {
    for (const user of users) {
        await env.WECHAT_KV.put(`user:${user.openid}`, JSON.stringify(user));
    }
}
```

这个框架已经成型，所有新功能都应该按照这个规范进行开发，确保系统的一致性和可维护性。每个新功能的开发都必须考虑到三地址的协调配合，不能出现任何遗漏。