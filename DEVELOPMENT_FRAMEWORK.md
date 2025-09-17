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

### 5. 微信公众号排版工作流程
```
用户编辑内容 → 实时预览渲染 → 主题样式应用 → 图片上传处理 → 模板保存 → 一键复制到微信后台
```

### 6. 编辑器双模式架构
```
markdown-editor.html?mode=wechat  → WeChatFormatModule → 微信排版功能
markdown-editor.html?mode=markdown → MarkdownEditorModule → 通用Markdown编辑
```

## 📁 项目结构

### 主项目结构
```
d:/wechat_login/
├── index.html                 # 主页面
├── article-generator.html     # 文章生成页面
├── image-generator.html       # 图片生成页面
├── wechat-login.html         # 登录页面
├── components/               # 公共组件
│   └── header.html          # 统一Header组件模板
├── sections/                 # 功能模块
│   ├── wechat-login.js      # 登录模块
│   ├── article-generator.js  # 文章生成模块
│   ├── image-generator.js   # 图片生成模块
│   ├── markdown-editor.js   # Markdown编辑器模块
│   ├── markdown-editor.css  # Markdown编辑器样式
│   ├── wechat-format.js     # 微信公众号排版模块
│   └── wechat-format.css    # 微信公众号排版样式
├── js/                      # JavaScript组件
│   ├── main.js             # 主控制脚本
│   └── header.js           # Header组件控制器
├── styles/                  # 样式文件
│   ├── main.css            # 主样式文件
│   └── header.css          # Header组件样式
├── markdown-editor.html     # 编辑器页面（支持双模式）
├── src/                     # 后端代码
│   ├── index.js            # 主入口
│   └── session.js          # 会话管理
├── wrangler.toml           # Cloudflare配置
└── package.json            # 依赖配置
```

## 🎨 统一Header组件系统

### Header组件架构
```
HeaderComponent (js/header.js)
├── 组件模板 (components/header.html)
│   ├── Logo区域
│   ├── 导航菜单
│   │   ├── 首页链接
│   │   ├── 功能下拉菜单
│   │   │   ├── 公众号爆文生成
│   │   │   ├── 微信公众号排版
│   │   │   └── AI 图片生成
│   │   └── 定价链接
│   └── 用户信息区域
├── 样式系统 (styles/header.css)
│   ├── 基础布局样式
│   ├── 下拉菜单样式
│   ├── 响应式设计
│   └── 毛玻璃效果
└── 交互逻辑
    ├── 下拉菜单控制
    ├── 用户状态显示
    └── 动态加载机制
```

### Header组件使用方法

#### 1. 页面集成
```html
<!-- 在页面head中引入样式 -->
<link rel="stylesheet" href="styles/header.css">

<!-- 在body开始处，Header组件会自动插入 -->
<body>
    <!-- Header组件将通过JavaScript动态加载 -->
    
    <!-- 页面内容 -->
    <main>...</main>
    
    <!-- 在页面底部引入组件脚本 -->
    <script src="js/header.js"></script>
</body>
```

#### 2. 组件初始化
```javascript
// Header组件会自动初始化
document.addEventListener('DOMContentLoaded', function() {
    // HeaderComponent会自动创建实例并加载
    new HeaderComponent();
});
```

#### 3. 下拉菜单扩展接口
```javascript
// 在header.js中预留的扩展接口
class HeaderComponent {
    constructor() {
        this.menuItems = [
            { name: '公众号爆文生成', url: 'article-generator.html' },
            { name: '微信公众号排版', url: 'markdown-editor.html?mode=wechat' },
            { name: 'AI 图片生成', url: 'image-generator.html' }
            // 新功能模块可以在这里添加
        ];
    }
    
    // 动态添加菜单项的方法
    addMenuItem(name, url) {
        this.menuItems.push({ name, url });
        this.updateDropdownMenu();
    }
}
```

#### 4. 定价方案配置
```javascript
// 定价方案数据结构
const pricingPlans = [
    {
        name: '免费计划',
        price: '¥0',
        period: '/月',
        features: [
            '公众号爆文生成：3次/天',
            'AI 图片生成：3次/天',
            '微信公众号排版：无限制'
        ],
        buttonText: '登录即享',
        buttonClass: 'btn-free'
    },
    {
        name: 'VIP',
        price: '¥19.9',
        period: '/月',
        features: [
            '公众号爆文生成：10次/天',
            'AI 图片生成：10次/天',
            '微信公众号排版：无限制',
            '优先客服支持'
        ],
        buttonText: '敬请期待',
        buttonClass: 'btn-vip'
    },
    {
        name: 'SVIP',
        price: '¥49.9',
        period: '/月',
        features: [
            '公众号爆文生成：20次/天',
            'AI 图片生成：20次/天',
            '微信公众号排版：无限制',
            '专属客服支持',
            '高级功能优先体验'
        ],
        buttonText: '敬请期待',
        buttonClass: 'btn-svip'
    }
];
```

## 🎨 微信公众号排版模块详解

### 模块架构
```
WeChatFormatModule (sections/wechat-format.js)
├── 主题系统 (wechatThemes)
│   ├── default: 默认主题
│   ├── green: 微信绿主题
│   ├── blue: 科技蓝主题
│   ├── orange: 活力橙主题
│   └── purple: 优雅紫主题
├── 编辑器组件
│   ├── CodeMirror编辑器
│   ├── 实时预览面板
│   └── 工具栏组件
├── 样式系统
│   ├── 主题切换
│   ├── 自定义颜色
│   └── CSS样式编辑
├── 图片处理
│   ├── 本地上传
│   ├── 图床集成
│   └── 图片优化
└── 导出功能
    ├── HTML导出
    ├── 微信复制
    └── 模板保存
```

### 核心功能特性

#### 1. 多主题支持
- **默认主题**: 经典微信公众号样式
- **微信绿**: 使用微信品牌色 #07c160
- **科技蓝**: 现代科技感 #1890ff
- **活力橙**: 活跃温暖色调 #ff6b35
- **优雅紫**: 高端优雅风格 #722ed1

#### 2. 实时预览系统
- **双栏布局**: 左侧编辑，右侧预览
- **同步滚动**: 编辑和预览区域联动
- **手机预览**: 模拟微信公众号阅读效果
- **响应式设计**: 适配不同屏幕尺寸

#### 3. 样式定制功能
- **颜色选择器**: 自定义主题色彩
- **字体设置**: 字号、行距、字体族
- **间距调整**: 段落、标题、列表间距
- **边框样式**: 引用块、代码块边框

#### 4. 图片处理能力
- **拖拽上传**: 支持图片拖拽到编辑器
- **粘贴上传**: 剪贴板图片直接粘贴
- **图床集成**: 自动上传到图床服务
- **图片优化**: 自动压缩和格式转换

#### 5. 导出和分享
- **HTML导出**: 生成完整HTML代码
- **微信复制**: 一键复制到微信公众号后台
- **模板保存**: 保存常用排版模板
- **链接分享**: 生成预览链接分享

### 技术实现细节

#### 1. 模块初始化流程
```javascript
// 1. 创建WeChatFormatModule实例
const wechatFormat = new WeChatFormatModule({
    apiBaseUrl: 'https://aimorelogybackend.site',
    user: currentUser,
    wechatLogin: wechatLogin
});

// 2. 初始化编辑器
await wechatFormat.init(container);

// 3. 渲染界面组件
wechatFormat.render();

// 4. 绑定事件监听
wechatFormat.bindEvents();

// 5. 加载用户设置
wechatFormat.loadUserSettings();
```

#### 2. 主题切换机制
```javascript
// 主题配置对象
this.wechatThemes = {
    default: {
        name: '默认主题',
        primaryColor: '#576b95',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        linkColor: '#576b95',
        codeBackground: '#f1f1f1',
        blockquoteColor: '#42b883'
    }
    // ... 其他主题
};

// 应用主题样式
applyTheme(themeName) {
    const theme = this.wechatThemes[themeName];
    const styleSheet = this.generateThemeCSS(theme);
    this.updatePreviewStyles(styleSheet);
}
```

#### 3. 实时预览渲染
```javascript
// Markdown渲染管道
renderPreview(markdown) {
    // 1. Markdown转HTML
    let html = marked.parse(markdown);
    
    // 2. 应用微信样式
    html = this.applyWeChatStyles(html);
    
    // 3. 代码高亮
    html = this.highlightCode(html);
    
    // 4. 安全过滤
    html = DOMPurify.sanitize(html);
    
    // 5. 更新预览区域
    this.previewElement.innerHTML = html;
}
```

#### 4. 图片上传处理
```javascript
// 图片上传流程
async uploadImage(file) {
    // 1. 文件验证
    if (!this.validateImageFile(file)) return;
    
    // 2. 图片压缩
    const compressedFile = await this.compressImage(file);
    
    // 3. 上传到图床
    const formData = new FormData();
    formData.append('image', compressedFile);
    
    const response = await fetch('/wechat/upload_image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.userToken}` },
        body: formData
    });
    
    // 4. 返回图片URL
    const result = await response.json();
    return result.imageUrl;
}
```

### 样式系统架构

#### 1. CSS模块化设计
```css
/* sections/wechat-format.css */

/* 主容器样式 */
.wechat-format-editor { /* 编辑器主容器 */ }
.wechat-format-toolbar { /* 工具栏样式 */ }
.wechat-format-editor-panel { /* 编辑面板 */ }
.wechat-format-preview-panel { /* 预览面板 */ }

/* 主题样式变量 */
:root {
    --wechat-primary-color: #576b95;
    --wechat-bg-color: #ffffff;
    --wechat-text-color: #333333;
    --wechat-link-color: #576b95;
}

/* 微信公众号专用样式 */
.wechat-content h1 { /* 一级标题 */ }
.wechat-content h2 { /* 二级标题 */ }
.wechat-content p { /* 段落样式 */ }
.wechat-content blockquote { /* 引用块 */ }
.wechat-content code { /* 行内代码 */ }
.wechat-content pre { /* 代码块 */ }
```

#### 2. 响应式布局
```css
/* 桌面端布局 */
@media (min-width: 768px) {
    .wechat-format-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
}

/* 移动端布局 */
@media (max-width: 767px) {
    .wechat-format-container {
        display: block;
    }
    
    .wechat-format-preview-panel {
        margin-top: 20px;
    }
}
```

### API接口扩展

#### 1. 微信排版专用接口
```javascript
// 现有接口清单
POST /wechat/upload_image      // 图片上传
POST /wechat/save_template     // 保存模板
GET  /wechat/templates         // 获取模板列表
POST /wechat/export           // 导出内容

// 预留扩展接口
POST /wechat/compress_image    // 图片压缩
POST /wechat/generate_qr      // 生成二维码
GET  /wechat/theme_presets    // 获取主题预设
POST /wechat/custom_theme     // 保存自定义主题
POST /wechat/batch_upload     // 批量上传图片
GET  /wechat/usage_stats      // 使用统计
```

#### 2. 使用次数统计
```javascript
// 微信排版功能使用统计
POST /update_wechat_usage
Body: {
  token: "用户token",
  action: "wechat_format|image_upload|template_save|content_export",
  amount: 1,
  details: {
    imageCount: 3,        // 上传图片数量
    templateSize: 1024,   // 模板大小
    exportFormat: "html"  // 导出格式
  }
}
Response: {
  success: true,
  usage: { daily: 5, total: 25, lastResetDate: "..." },
  wechatUsage: {
    format: { daily: 2, total: 10 },
    upload: { daily: 8, total: 45 },
    export: { daily: 3, total: 15 }
  },
  message: "微信排版使用次数更新成功"
}
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

// 微信公众号排版功能（新增）
POST /wechat/upload_image       // 图片上传到图床
POST /wechat/save_template      // 保存排版模板
GET  /wechat/templates          // 获取模板列表
POST /wechat/export            // 导出排版内容
POST /update_wechat_usage      // 更新微信排版使用统计

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

## 📊 最新API接口文档

### Token历史记录接口
```
GET  /admin/get_token_history   // 获取7天Token消耗趋势数据
响应格式: {
  success: true,
  dates: ["2025-09-10", "2025-09-11", ..., "2025-09-16"],
  consumption: [0, 0, 0, 0, 0, 11679, 0]
}
```

### 用户管理接口
```
GET  /admin/get_all_users       // 获取所有用户列表
GET  /admin/list_all_keys       // 获取KV存储键列表
POST /admin/update_user_level   // 更新用户等级
请求格式: { openid: "用户ID", level: "normal|vip|svip|admin" }

POST /admin/delete_user         // 删除用户
请求格式: { openid: "用户ID" }
```

### 用户等级限制配置
```javascript
// getUserLimits函数返回的限制配置
normal: { articleDaily: 10 }     // 普通用户：10次/天
vip:    { articleDaily: 30 }     // VIP用户：30次/天  
svip:   { articleDaily: 100 }    // SVIP用户：100次/天
admin:  { articleDaily: -1 }     // 管理员：无限制
```

## 🐛 最新修复记录

### 2025-09-16 修复记录

#### 1. Token消耗趋势数据时间更新问题 ✅
**问题描述**: Token消耗数据不随时间前移，历史数据显示错误日期
**根本原因**: 历史记录中日期格式不统一（`"Mon Sep 15 2025"` vs `"2025-09-15"`）
**修复方案**:
- 添加日期格式转换逻辑，自动将旧格式转换为标准格式
- 修复 `handleGetTokenHistory` 函数的日期匹配逻辑
- 更新 `ensureUserTokenHistory` 函数处理格式不一致问题

#### 2. 后台管理系统自动刷新导致KV限制问题 ✅
**问题描述**: 自动刷新频繁调用KV接口，达到Cloudflare每日限制
**修复方案**:
- 禁用自动刷新功能（`autoRefreshEnabled: false`）
- 移除刷新间隔设置选项
- 保留手动刷新按钮功能
- 更新设置页面显示"手动刷新模式：已启用"

#### 3. 用户等级变更后使用次数限制显示问题 ✅
**问题描述**: 后台管理系统中"12/10 文章 最多使用次数"没有随用户等级变更更新
**修复方案**:
- 修复用户列表中的限制显示逻辑：`${user.limits?.articleDaily || getUserLimits(user.level).articleDaily}`
- 修复用户详情模态框中的限制显示
- 确保等级变更后立即反映正确的使用限制

## 🎨 微信公众号排版模块完整文档

### 功能概述
微信公众号排版模块是一个专业的内容排版工具，专门为微信公众号文章排版而设计。它提供了丰富的主题、自定义样式、图片处理和导出功能，让用户能够轻松创建美观的微信公众号文章。

### 核心特性
1. **多主题支持**: 5种内置主题，支持自定义主题
2. **实时预览**: 双栏布局，实时预览排版效果
3. **图片处理**: 支持图片上传、压缩和图床集成
4. **样式定制**: 颜色、字体、间距等全方位定制
5. **一键导出**: 支持HTML、微信复制等多种导出方式
6. **模板系统**: 保存和复用常用排版模板
7. **手机预览**: 模拟微信公众号阅读体验

### 技术架构

#### 前端架构
```
WeChatFormatModule
├── UI组件层
│   ├── 工具栏组件 (Toolbar)
│   ├── 编辑器组件 (Editor)
│   ├── 预览组件 (Preview)
│   ├── 主题选择器 (ThemeSelector)
│   ├── 颜色选择器 (ColorPicker)
│   └── 设置面板 (SettingsPanel)
├── 业务逻辑层
│   ├── 主题管理 (ThemeManager)
│   ├── 样式处理 (StyleProcessor)
│   ├── 图片处理 (ImageHandler)
│   ├── 导出管理 (ExportManager)
│   └── 模板管理 (TemplateManager)
├── 数据层
│   ├── 本地存储 (LocalStorage)
│   ├── API调用 (APIClient)
│   └── 缓存管理 (CacheManager)
└── 工具层
    ├── Markdown解析 (MarkdownParser)
    ├── HTML处理 (HTMLProcessor)
    ├── CSS生成器 (CSSGenerator)
    └── 事件管理 (EventManager)
```

#### 后端API架构
```
微信排版API
├── 图片服务
│   ├── /wechat/upload_image    // 单图上传
│   ├── /wechat/batch_upload    // 批量上传
│   └── /wechat/compress_image  // 图片压缩
├── 模板服务
│   ├── /wechat/save_template   // 保存模板
│   ├── /wechat/templates       // 获取模板列表
│   ├── /wechat/template/:id    // 获取单个模板
│   └── /wechat/delete_template // 删除模板
├── 导出服务
│   ├── /wechat/export          // 导出内容
│   ├── /wechat/generate_pdf    // 生成PDF
│   └── /wechat/generate_image  // 生成图片
├── 主题服务
│   ├── /wechat/theme_presets   // 获取主题预设
│   ├── /wechat/custom_theme    // 保存自定义主题
│   └── /wechat/theme_share     // 分享主题
└── 统计服务
    ├── /update_wechat_usage    // 更新使用统计
    ├── /wechat/usage_stats     // 获取使用统计
    └── /wechat/popular_themes  // 热门主题统计
```

### 数据结构设计

#### 用户数据扩展
```javascript
// 用户对象新增字段
{
  // ... 原有字段
  wechatFormatUsage: {
    daily: 0,           // 今日使用次数
    total: 0,           // 总使用次数
    lastUsedAt: null,   // 最后使用时间
    templates: [],      // 保存的模板ID列表
    customThemes: [],   // 自定义主题列表
    preferences: {      // 用户偏好设置
      defaultTheme: 'default',
      autoSave: true,
      previewMode: 'desktop',
      imageQuality: 'medium'
    }
  },
  wechatImageUsage: {
    daily: 0,           // 今日上传图片数量
    total: 0,           // 总上传图片数量
    storageUsed: 0,     // 已使用存储空间(MB)
    lastUploadAt: null  // 最后上传时间
  }
}
```

#### 模板数据结构
```javascript
// 排版模板对象
{
  id: "template_openid_timestamp",
  userId: "用户openid",
  name: "模板名称",
  description: "模板描述",
  content: "Markdown内容",
  theme: "使用的主题名称",
  customCSS: "自定义CSS样式",
  settings: {
    primaryColor: "#576b95",
    fontSize: "16px",
    lineHeight: "1.8",
    // ... 其他设置
  },
  tags: ["商务", "科技", "简约"],
  isPublic: false,      // 是否公开分享
  usageCount: 0,        // 使用次数
  createdAt: "2025-09-15T10:00:00.000Z",
  updatedAt: "2025-09-15T10:00:00.000Z"
}
```

#### 主题数据结构
```javascript
// 自定义主题对象
{
  id: "theme_openid_timestamp",
  userId: "用户openid",
  name: "主题名称",
  description: "主题描述",
  config: {
    primaryColor: "#576b95",
    backgroundColor: "#ffffff",
    textColor: "#333333",
    linkColor: "#576b95",
    codeBackground: "#f1f1f1",
    blockquoteColor: "#42b883",
    h1Style: "font-size: 1.5em; font-weight: bold;",
    h2Style: "font-size: 1.3em; font-weight: bold;",
    // ... 其他样式配置
  },
  preview: "主题预览图URL",
  isPublic: false,
  downloadCount: 0,
  createdAt: "2025-09-15T10:00:00.000Z"
}
```

### 业务流程详解

#### 1. 用户编辑流程
```
1. 用户访问 markdown-editor.html?mode=wechat
2. 系统检查登录状态
3. 初始化WeChatFormatModule
4. 加载用户偏好设置和历史模板
5. 渲染编辑器界面
6. 用户开始编辑内容
7. 实时渲染预览效果
8. 自动保存草稿
9. 用户选择主题和样式
10. 导出或复制到微信后台
```

#### 2. 图片上传流程
```
1. 用户拖拽或选择图片
2. 前端验证图片格式和大小
3. 图片压缩和优化处理
4. 上传到图床服务
5. 返回图片URL
6. 插入到编辑器中
7. 更新用户图片使用统计
8. 实时预览更新
```

#### 3. 模板保存流程
```
1. 用户编辑完成内容
2. 点击保存模板按钮
3. 弹出模板信息填写框
4. 用户填写模板名称和描述
5. 系统生成模板ID
6. 保存到KV存储
7. 更新用户模板列表
8. 显示保存成功提示
```

#### 4. 导出分享流程
```
1. 用户完成内容编辑
2. 选择导出格式（HTML/微信复制）
3. 系统生成最终HTML代码
4. 应用选定的主题样式
5. 优化代码结构
6. 复制到剪贴板或下载文件
7. 更新使用统计
8. 显示导出成功提示
```

### 性能优化策略

#### 1. 前端优化
- **懒加载**: 主题和模板按需加载
- **防抖处理**: 编辑器输入防抖，减少渲染频率
- **虚拟滚动**: 大量模板列表使用虚拟滚动
- **缓存策略**: 主题配置和用户设置本地缓存
- **代码分割**: 按功能模块分割JavaScript代码

#### 2. 后端优化
- **CDN加速**: 图片和静态资源使用CDN
- **图片压缩**: 自动压缩上传的图片
- **缓存机制**: 热门模板和主题缓存
- **批量操作**: 支持批量上传和处理
- **异步处理**: 大文件处理使用异步队列

#### 3. 存储优化
- **数据压缩**: 模板内容使用gzip压缩
- **索引优化**: 为常用查询字段建立索引
- **分片存储**: 大型模板分片存储
- **清理机制**: 定期清理过期数据

### 安全措施

#### 1. 内容安全
- **XSS防护**: 使用DOMPurify过滤HTML内容
- **CSRF防护**: API请求包含CSRF令牌
- **内容审核**: 公开模板内容审核机制
- **文件验证**: 严格验证上传文件类型和大小

#### 2. 访问控制
- **权限验证**: 所有API请求验证用户权限
- **频率限制**: 上传和导出操作频率限制
- **资源隔离**: 用户数据严格隔离
- **审计日志**: 记录重要操作日志

### 监控和统计

#### 1. 使用统计
- **功能使用量**: 各功能模块使用次数统计
- **主题流行度**: 主题使用频率统计
- **模板热度**: 模板使用和下载统计
- **用户活跃度**: 用户使用时长和频率

#### 2. 性能监控
- **响应时间**: API响应时间监控
- **错误率**: 功能错误率统计
- **资源使用**: 存储空间和带宽使用
- **用户体验**: 页面加载速度和交互响应

### 扩展规划

#### 1. 功能扩展
- **AI辅助**: 集成AI自动排版建议
- **协作编辑**: 多人协作编辑功能
- **版本控制**: 内容版本历史管理
- **批量处理**: 批量导入和处理文档

#### 2. 平台扩展
- **小程序版**: 开发微信小程序版本
- **移动端**: 优化移动端编辑体验
- **API开放**: 提供第三方集成API
- **插件系统**: 支持第三方插件扩展

### 后台管理前端API调用
```javascript
// 在 AIMORELOGY-TOOLS-BACKSTAGE/js/api.js 中的调用方法
window.adminAPI.getAllUsersNew()     // 调用 /admin/get_all_users
window.adminAPI.getUserStats()       // 调用 /admin/get_user_stats  
window.adminAPI.getTokenStats()      // 调用 /admin/get_token_stats
window.adminAPI.getTokenHistory()    // 调用 /admin/get_token_history（新增）
window.adminAPI.getDailyResetStatus() // 调用 /admin/daily_reset_status（新增）
window.adminAPI.triggerDailyReset()  // 调用 /admin/daily_reset（新增）

// 图表数据获取（charts.js中使用）
await window.adminAPI.getAllUsersNew()  // 用户统计和活跃度图表
await window.adminAPI.getUserStats()    // 用户等级分布和注册趋势图表
await window.adminAPI.getTokenHistory() // token消耗趋势图表（新增）
```

### 每日重置功能 (新增)

#### 自动重置机制
系统会在每次用户操作时自动检查是否需要重置每日使用次数：
- **重置时间**: 基于中国时间 (UTC+8) 的日期变更
- **重置范围**: 所有用户的每日使用次数和token消耗量
- **重置触发**: 用户进行任何API调用时自动检查并重置

#### 手动重置API
```javascript
// 管理员可以手动触发每日重置
POST /admin/daily_reset
Headers: { Authorization: 'Bearer admin_secret_token' }

// 检查每日重置状态
GET /admin/daily_reset_status
Headers: { Authorization: 'Bearer admin_secret_token' }
```

#### 中国时间工具函数
```javascript
// src/china-time-utils.js 提供的工具函数
getChinaDateString()           // 获取中国时间日期 (YYYY-MM-DD)
getChinaTimeString()           // 获取中国时间完整时间戳
shouldResetDaily(lastResetDate) // 检查是否需要重置
initializeDailyUsage()         // 初始化每日使用统计
resetDailyCount(usage)         // 重置单个使用统计
checkAndResetAllDailyStats(user) // 重置用户所有每日统计
```

#### 重置逻辑说明
1. **自动检查**: 每次API调用时检查 `lastResetDate` 是否为今天（中国时间）
2. **重置操作**: 如果日期不匹配，将 `daily` 计数重置为0，更新 `lastResetDate`
3. **影响范围**: 
   - `user.usage.daily` - 总体每日使用次数
   - `user.articleUsage.daily` - 文章生成每日次数
   - `user.tokenUsage.*.daily` - 各模块每日token消耗
   - `user.markdownUsage.daily` - Markdown编辑每日次数
4. **数据保留**: `total` 总计数据不受影响，历史数据完整保留

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

### 使用次数显示位置汇总 (重要：新功能必须同步更新)

#### 主项目前端显示位置
1. **sections/wechat-login.js** - 登录状态显示
   ```javascript
   // 位置：updateLoginStatus函数中
   // 显示格式："{level} | 今日已使用: {daily}/{limit} 次"
   // 相关代码：
   const limitText = user.level === 'admin' ? '无限制' : 
       (user.limits?.articleDaily || defaultLimits[user.level] || 10);
   ```

2. **article-generator.html** - 文章生成页面
   ```javascript
   // 位置：页面加载时的用户状态显示
   // 显示格式：用户等级和使用次数
   // 需要同步：新功能的使用次数显示
   ```

#### 后台管理系统显示位置
1. **AIMORELOGY-TOOLS-BACKSTAGE/js/users.js** - 用户列表表格
   ```javascript
   // 位置：renderUsers函数，第180行左右
   // 显示格式："{daily}/{limit} 文章"
   // 关键代码：
   <small style="color: #666;">/${this.getLevelLimitNumber(user)}</small>
   
   // 重要函数：
   getLevelLimitNumber(user) {
       // 返回用户等级对应的限制数字
       // 管理员返回 '∞'，其他返回具体数字
   }
   ```

2. **AIMORELOGY-TOOLS-BACKSTAGE/js/users.js** - 用户详情模态框
   ```javascript
   // 位置：showUserModal函数，第380行左右
   // 显示格式：详细的使用统计卡片
   // 关键代码：
   <small style="font-size: 0.8rem; color: #666;"> / ${this.getLevelLimitNumber(user)}</small>
   <div style="font-size: 11px; color: #888;">等级: ${this.getLevelText(user.level)} (${this.getLevelLimitText(user)})</div>
   
   // 重要函数：
   getLevelLimitText(user) {
       // 返回用户等级对应的限制文本
       // 管理员返回 '无限制'，其他返回 '{数字}次/天'
   }
   ```

3. **AIMORELOGY-TOOLS-BACKSTAGE/index.html** - 仪表盘统计卡片
   ```html
   <!-- 位置：统计卡片区域 -->
   <!-- 显示格式：功能使用次数统计 -->
   <!-- 需要同步：新功能的统计卡片 -->
   <div class="stat-card">
       <div class="stat-icon">📊</div>
       <div class="stat-content">
           <div class="stat-number" id="新功能-count">0</div>
           <div class="stat-label">新功能使用次数</div>
       </div>
   </div>
   ```

#### 核心函数说明
```javascript
// 1. 获取等级限制数字 (用于 x/y 格式显示)
getLevelLimitNumber(user) {
    const level = user.level || 'normal';
    if (level === 'admin') return '∞';
    
    const defaultLimits = { 'normal': 10, 'vip': 30, 'svip': 100, 'admin': -1 };
    const limit = user.limits?.articleDaily !== undefined ? 
        user.limits.articleDaily : defaultLimits[level];
    return limit === -1 ? '∞' : limit;
}

// 2. 获取等级限制文本 (用于描述性显示)
getLevelLimitText(user) {
    const level = user.level || 'normal';
    if (level === 'admin') return '无限制';
    
    const defaultLimits = { 'normal': 10, 'vip': 30, 'svip': 100, 'admin': -1 };
    const limit = user.limits?.articleDaily !== undefined ? 
        user.limits.articleDaily : defaultLimits[level];
    return limit === -1 ? '无限制' : `${limit}次/天`;
}

// 3. 获取等级显示文本
getLevelText(level) {
    const levelNames = {
        'normal': '普通用户',
        'vip': 'VIP',
        'svip': 'SVIP', 
        'admin': '管理员'
    };
    return levelNames[level] || '普通用户';
}
```

#### 新功能添加时必须同步的位置
1. **主项目前端**：
   - 登录状态显示逻辑
   - 功能页面的使用次数显示
   - 权限检查和提示信息

2. **后台管理系统**：
   - 用户列表表格的新功能列
   - 用户详情模态框的新功能统计
   - 仪表盘的新功能统计卡片
   - 图表数据的新功能统计

#### 后台数据分析图表更新说明
**文件位置：** `AIMORELOGY-TOOLS-BACKSTAGE/js/charts.js`

**已更新的图表方法：**
1. `createUsageChart()` - 使用统计柱状图
   - 同时显示文章生成和图片生成用户数分布
   - 按使用次数分组：0次、1-5次、6-10次、11-20次、20次以上

2. `createActivityChart()` - 用户活跃度雷达图
   - 分别显示各等级用户的文章生成和图片生成平均次数
   - 支持普通用户、VIP、SVIP、管理员四个等级

3. `createTokenDistributionChart()` - Token消耗分布饼图
   - 统计文章生成+图片生成的总Token消耗分布
   - 按消耗量分组：0 Token、1-100 Token、101-500 Token、501-1000 Token、1000+ Token

4. `createTokenTrendChart()` - Token消耗趋势图
   - 分别显示文章生成和图片生成的Token消耗趋势
   - 最近7天的每日消耗数据对比

**数据来源：**
- 使用 `window.adminAPI.getAllUsersNew()` 获取用户详细数据
- 数据结构包含 `articleUsage`、`imageUsage`、`tokenUsage` 字段
- 自动计算每日和总计统计数据

3. **后端API**：
   - 用户数据结构扩展
   - 使用次数统计更新
   - 权限验证逻辑
   - 管理员统计接口

#### 数据结构对应关系
```javascript
// 用户数据结构中的使用统计
user.articleUsage = { daily: 0, total: 0, lastResetDate: "2025-09-16" }
user.新功能Usage = { daily: 0, total: 0, lastResetDate: "2025-09-16" }

// 用户限制配置
user.limits.articleDaily = 10  // 文章生成每日限制
user.limits.新功能Daily = 10   // 新功能每日限制

// Token使用统计
user.tokenUsage.article = { daily: 0, total: 0, lastResetDate: "2025-09-16" }
user.tokenUsage.新功能 = { daily: 0, total: 0, lastResetDate: "2025-09-16" }
```

### 新功能开发检查清单
- [ ] 前端模块文件创建（/sections/新功能.js）
- [ ] 页面文件创建（/新功能.html）
- [ ] 后端API路由添加（src/index.js）
- [ ] 权限验证实现（checkUsageLimit）
- [ ] 使用次数统计（update新功能Usage）
- [ ] Token消耗统计（tokenUsage更新）
- [ ] 错误处理完善（try-catch + 标准响应）
- [ ] **主项目使用次数显示同步**（sections/wechat-login.js）
- [ ] **后台用户列表显示同步**（js/users.js renderUsers函数）
- [ ] **后台用户详情显示同步**（js/users.js showUserModal函数）
- [ ] **后台仪表盘统计同步**（index.html + js/main.js）
- [ ] **后台数据分析图表同步**（js/charts.js 所有相关图表方法）
- [ ] 等级限制配置（limits对象更新）
- [ ] 数据结构扩展（用户对象字段）
- [ ] 测试所有显示位置（前端 + 后台所有相关页面）
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

## 🎨 AI图片生成功能模块 (2025-09-16 新增)

### 功能概述
AI图片生成功能基于豆包Seedream 4.0模型，提供文字描述转图片的智能生成服务。用户可以通过自然语言描述生成高质量的图片，支持多种尺寸选择。

### 核心特性
1. **豆包Seedream 4.0**: 基于字节跳动最新的图片生成模型
2. **多种尺寸**: 支持1K、2K、4K三种分辨率
3. **水印控制**: 可选择是否添加AI生成水印
4. **即时下载**: 24小时有效下载链接，提醒用户及时保存
5. **独立统计**: 与文章生成完全分离的使用次数和Token统计
6. **等级限制**: 普通用户3次/天，VIP 10次/天，SVIP 20次/天，管理员无限制

### 文件结构
```
主项目 (aimorelogy-tools.github.io)
├── image-generator.html          // 图片生成主页面
├── sections/
│   └── image-generator.js        // 图片生成JavaScript模块
└── index.html                    // 主页（已添加图片生成入口）

后端项目 (wechat-login-worker)
└── src/
    └── index.js                  // 后端API（已包含图片生成接口）
```

### API接口
#### 1. 图片生成接口
```javascript
POST /generate_image
Headers: { Authorization: "Bearer token" }
Body: {
  token: "用户token",
  prompt: "图片描述",
  size: "2K",                    // 1K|2K|4K
  watermark: true               // 是否添加水印
}

Response: {
  success: true,
  data: {
    url: "图片下载链接",
    size: "2K",
    prompt: "用户输入的描述",
    watermark: true
  },
  message: "图片生成成功"
}
```

#### 2. 使用统计更新接口
```javascript
POST /update_image_usage
Body: {
  token: "用户token",
  amount: 1,
  tokenConsumed: 150
}

Response: {
  success: true,
  usage: { daily: 1, total: 1 },
  tokenUsage: { image: { daily: 150, total: 150 } },
  message: "图片生成使用次数更新成功"
}
```

#### 3. 用户统计获取接口
```javascript
POST /get_user_stats
Body: { token: "用户token" }

Response: {
  success: true,
  imageUsage: { daily: 1, total: 1 },
  image_daily_count: 1,
  image_daily_limit: 3,
  tokenUsage: { image: { daily: 150, total: 150 } }
}
```

#### 4. 管理员统计接口
```javascript
GET /admin/get_image_stats?adminToken=admin_secret_token
Response: {
  success: true,
  stats: {
    totalImages: 156,
    dailyImages: 23,
    imageTokens: 23400,
    topUsers: [...]
  }
}
```

### 豆包API配置
```javascript
// 豆包API密钥和配置
apiKey: '1f2c09b5-72ed-4f9b-9e77-c53b39a5a91b'
baseUrl: 'https://ark.cn-beijing.volces.com/api/v3/images/generations'
model: 'doubao-seedream-4-0-250828'
```

### 数据结构扩展
用户数据新增字段：
```javascript
{
  // ... 原有字段
  imageUsage: {
    daily: 0,           // 今日生成次数
    total: 0,           // 总生成次数
    lastResetDate: "2025-09-16"  // 最后重置日期
  },
  tokenUsage: {
    // ... 原有字段
    image: {
      daily: 0,         // 今日Token消耗
      total: 0,         // 总Token消耗
      lastResetDate: "2025-09-16"
    }
  }
}
```

### 等级权限配置
```javascript
const IMAGE_LIMITS = {
  normal: { imageDaily: 3 },    // 普通用户：3次/天
  vip:    { imageDaily: 10 },   // VIP用户：10次/天
  svip:   { imageDaily: 20 },   // SVIP用户：20次/天
  admin:  { imageDaily: -1 }    // 管理员：无限制
};
```

### 业务流程
1. 用户访问 image-generator.html
2. 系统检查登录状态和权限
3. 显示用户使用情况和限制
4. 用户输入图片描述和参数
5. 前端验证输入内容
6. 调用后端图片生成API
7. 后端验证用户权限和限制
8. 调用豆包Seedream 4.0 API
9. 返回生成结果和下载链接
10. 更新用户使用统计
11. 显示生成成功提示

### 豆包API集成
```javascript
// 豆包API调用示例
const requestBody = {
  model: 'doubao-seedream-4-0-250828',
  prompt: prompt,
  size: size,
  response_format: 'url',
  watermark: watermark,
  sequential_image_generation: 'disabled'  // 禁用流式响应
};

const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 1f2c09b5-72ed-4f9b-9e77-c53b39a5a91b'
  },
  body: JSON.stringify(requestBody)
});
```

### 前端功能特性
- 响应式设计，支持移动端
- 实时字符计数（最多600字符）
- 进度条显示生成状态
- 图片预览和下载功能
- 完整的错误处理和用户提示
- 使用情况实时显示
- 参数设置面板（尺寸、水印）

### 后台管理集成
#### 仪表盘统计
- 图片生成总数统计
- 每日图片生成统计
- 图片生成Token消耗统计

#### 用户管理
- 用户列表显示图片生成使用情况
- 用户详情显示图片生成统计
- 支持不同等级的图片生成限制显示

### 注意事项
1. 图片链接24小时有效，用户需及时下载
2. 使用次数与文章生成完全独立统计
3. Token消耗单独记录和统计
4. 支持多种图片尺寸，但消耗Token相同
5. 管理员可通过后台查看详细统计数据
6. 图片不在服务器存储，只提供下载链接

### 部署状态
- ✅ 前端页面已部署到 GitHub Pages
- ✅ 后端API已部署到 Cloudflare Workers
- ✅ 豆包API已集成并测试
- ✅ 用户权限和限制已配置
- ✅ 统计功能已完善
- ✅ 后台管理系统已更新