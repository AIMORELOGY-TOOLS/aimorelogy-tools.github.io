# AIMORELOGY TOOLS - 微信登录模块

## 🎯 项目简介

这是一个基于 Cloudflare Worker 和 Durable Objects 构建的微信公众号扫码登录系统。提供完整的前后端解决方案，支持模块化集成。

## ✨ 功能特性

- ✅ **微信公众号扫码登录** - 支持新用户关注和已关注用户扫码
- ✅ **实时状态推送** - WebSocket + 轮询双重保障，确保用户体验流畅
- ✅ **模块化设计** - 独立的登录组件，可轻松集成到任何网站
- ✅ **响应式界面** - 现代化 UI 设计，完美支持移动端
- ✅ **安全会话管理** - 临时会话 ID，自动过期机制
- ✅ **零服务器部署** - 基于 Cloudflare 边缘计算，全球加速

## 🌐 在线演示

- **主页演示**: https://jeff010726.github.io/AIMORELOGY-TOOLS/
- **独立登录页**: https://jeff010726.github.io/AIMORELOGY-TOOLS/wechat-login.html

## 🏗️ 技术架构

```
Frontend (GitHub Pages)
    ↕ (WebSocket/轮询)
=======
# AIMORELOGY TOOLS - AI文章生成平台 & 微信登录模块

## 🎯 项目简介

这是一个模块化的AI文章生成平台，采用前后端分离架构。核心功能包括微信登录模块，基于 Cloudflare Workers 和 GitHub Pages 构建，提供完整的前后端解决方案。

## ✨ 功能特性

- ✅ **微信公众号扫码登录** - 支持新用户关注和已关注用户扫码
- ✅ **AI文章生成** - 集成 DeepSeek API，智能生成高质量文章
- ✅ **模块化设计** - 类似 Shopify，各模块可独立使用和集成
- ✅ **响应式界面** - 现代化 UI 设计，完美支持移动端
- ✅ **安全会话管理** - JWT Token 认证，自动过期机制
- ✅ **零服务器部署** - 基于 Cloudflare 边缘计算 + GitHub Pages

## 🌐 在线演示

- **主页演示**: https://jeff010726.github.io/AIMORELOGY-TOOLS/
- **微信登录**: https://jeff010726.github.io/AIMORELOGY-TOOLS/wechat-login.html

## 🏗️ 技术架构

```
┌─────────────────┐    HTTPS API    ┌──────────────────────┐
│   GitHub Pages  │ ──────────────► │  Cloudflare Workers  │
│   (前端静态页面)  │                 │   (后端API服务)       │
└─────────────────┘                 └──────────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────────┐
                                    │    微信公众号API      │
                                    │   (二维码生成/回调)    │
                                    └──────────────────────┘
=======
# AIMORELOGY TOOLS - 微信登录模块

## 🎯 项目简介

这是一个基于 Cloudflare Worker 和 Durable Objects 构建的微信公众号扫码登录系统。提供完整的前后端解决方案，支持模块化集成。

## ✨ 功能特性

- ✅ **微信公众号扫码登录** - 支持新用户关注和已关注用户扫码
- ✅ **实时状态推送** - WebSocket + 轮询双重保障，确保用户体验流畅
- ✅ **模块化设计** - 独立的登录组件，可轻松集成到任何网站
- ✅ **响应式界面** - 现代化 UI 设计，完美支持移动端
- ✅ **安全会话管理** - 临时会话 ID，自动过期机制
- ✅ **零服务器部署** - 基于 Cloudflare 边缘计算，全球加速

## 🌐 在线演示

- **主页演示**: https://jeff010726.github.io/AIMORELOGY-TOOLS/
- **独立登录页**: https://jeff010726.github.io/AIMORELOGY-TOOLS/wechat-login.html

## 🏗️ 技术架构

```
Frontend (GitHub Pages)
    ↕ (WebSocket/轮询)
Cloudflare Worker (API 端点)
    ├─ Durable Object (会话管理 + WebSocket)
    ├─ KV Storage (access_token 缓存)
    └─ 微信 API 调用
        
微信服务器 → POST XML → Worker /wechat-callback → 通知 Durable Object → 推送给前端
>>>>>>> 4fd900879dbba1992320806d4ca8dabe1e3e6e0a
```

## 🚀 快速开始

<<<<<<< HEAD
### 1. 部署到 GitHub Pages

1. **Fork 或克隆此仓库**
   ```bash
   git clone https://github.com/你的用户名/wechat_login.git
   cd wechat_login
   ```

2. **推送到 GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/wechat_login.git
   git push -u origin main
   ```

3. **启用 GitHub Pages**
   - 进入仓库设置 → Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main" / "(root)"
   - 保存设置

4. **访问你的网站**
   ```
   https://你的用户名.github.io/wechat_login/
   ```

### 2. 后端配置（已完成）

后端已部署到 Cloudflare Workers：
- **API 地址**: `https://aimorelogybackend.site`
- **微信回调**: `https://aimorelogybackend.site/wechat-callback`

## 📁 文件结构

```
wechat_login/
├── index.html                    # 主页面 (GitHub Pages 入口)
├── wechat-login-component.js     # 微信登录组件 (核心模块)
├── README.md                     # 项目文档
├── src/                          # 后端源码 (Cloudflare Workers)
│   ├── index.js                  # 主 Worker 文件
│   └── session.js                # 会话管理 (Durable Objects)
├── frontend/                     # 其他前端文件
│   ├── demo.html                 # 完整演示页面
│   ├── test.html                 # 功能测试页面
│   └── README.md                 # 前端集成文档
├── wrangler.toml                 # Cloudflare 配置
└── package.json                  # 依赖配置
```

## 🔧 集成到其他项目

### 方法一：直接引用 (推荐)

```html
<!DOCTYPE html>
<html>
<head>
    <title>我的网站</title>
</head>
<body>
    <div id="wechat-login"></div>
    
    <!-- 引入微信登录组件 -->
    <script src="https://你的用户名.github.io/wechat_login/wechat-login-component.js"></script>
    
    <script>
        // 配置登录组件
        const config = {
            apiBaseUrl: 'https://aimorelogybackend.site',
            onLoginSuccess: function(userInfo, token) {
                console.log('登录成功:', userInfo);
                // 处理登录成功逻辑
                localStorage.setItem('userToken', token);
                window.location.href = '/dashboard.html';
            },
            onLoginError: function(error) {
                alert('登录失败，请重试');
            }
        };
        
        // 初始化登录组件
        new WeChatLogin(document.getElementById('wechat-login'), config);
    </script>
</body>
</html>
```

### 方法二：下载文件

1. 下载 `wechat-login-component.js`
2. 放到你的项目中
3. 按照上面的方式引用

## 🎯 核心功能

### ✅ 已实现功能

- [x] 微信扫码登录
- [x] 实时状态更新
- [x] 二维码自动刷新
- [x] 响应式设计
- [x] 错误处理
- [x] 会话管理
- [x] 模块化设计
- [x] GitHub Pages 部署
- [x] Cloudflare Workers 后端

### 🔄 登录流程

1. **生成二维码** → 调用后端 API 生成微信登录二维码
2. **用户扫码** → 微信用户扫描二维码
3. **状态轮询** → 前端轮询检查登录状态
4. **确认登录** → 用户在微信中确认登录
5. **获取信息** → 后端获取用户信息并生成 token
6. **登录成功** → 前端收到用户信息和 token

## 🛠️ 自定义配置

### 配置选项

```javascript
const config = {
    apiBaseUrl: 'https://aimorelogybackend.site',  // 后端 API 地址
    pollInterval: 2000,                             // 轮询间隔 (毫秒)
    qrExpireTime: 600000,                          // 二维码过期时间 (毫秒)
    onLoginSuccess: function(userInfo, token) {     // 登录成功回调
        // userInfo: { nickname, openid, headimgurl }
        // token: JWT token
    },
    onLoginError: function(error) {                 // 登录失败回调
        // error: 错误信息
    },
    onQRExpired: function() {                       // 二维码过期回调
        // 二维码过期处理
    }
};
```

### 样式自定义

组件使用内联样式，你可以通过 CSS 覆盖：

```css
.wechat-login-wrapper {
    /* 自定义样式 */
}

.qr-code {
    border: 3px solid #07c160 !important;
}
```

## 🔐 安全特性

- ✅ HTTPS 加密传输
- ✅ JWT Token 认证
- ✅ 会话过期管理
- ✅ CORS 跨域保护
- ✅ 签名验证

## 📱 兼容性

- ✅ 现代浏览器 (Chrome, Firefox, Safari, Edge)
- ✅ 移动端浏览器
- ✅ 微信内置浏览器
- ✅ 响应式设计
=======
### 1. 引入登录组件

```html
<!-- 设置 API 地址 -->
<script>
const API_BASE_URL = 'https://wechat-login-worker.internal-articleno.workers.dev';
</script>

<!-- 引入组件 -->
<script src="wechat-login-component.js"></script>

<!-- 添加登录按钮 -->
<button onclick="WechatLogin.open()">微信登录</button>
```

### 2. 监听登录事件

```javascript
// 监听登录成功
window.addEventListener('wechatLoginSuccess', function(event) {
    console.log('登录成功:', event.detail);
    const { token, openid, loginTime } = event.detail;
    // 处理登录成功逻辑
});

// 监听退出登录
window.addEventListener('wechatLogout', function() {
    console.log('用户已退出登录');
    // 处理退出登录逻辑
});
```

### 3. 检查登录状态

```javascript
const loginStatus = WechatLogin.checkStatus();
if (loginStatus.isLoggedIn) {
    console.log('用户已登录:', loginStatus);
} else {
    console.log('用户未登录');
}
```

## 📱 登录流程

1. **用户点击登录** → 调用 `WechatLogin.open()`
2. **生成二维码** → 后端创建带参数的临时二维码
3. **用户扫码** → 微信客户端扫描二维码
4. **关注公众号** → 新用户需要关注，老用户直接确认
5. **事件推送** → 微信服务器推送扫码事件到后端
6. **实时通知** → 后端通过 WebSocket 实时通知前端
7. **登录完成** → 前端获取登录令牌，用户登录成功

## 🔧 API 接口

### POST /create_qr
生成登录二维码

**响应:**
```json
{
  "success": true,
  "sessionId": "uuid",
  "qrcodeUrl": "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=...",
  "expiresIn": 600
}
```

### WebSocket /ws?id=sessionId
实时状态推送

**消息格式:**
```json
{
  "type": "scanned",
  "data": {
    "status": "scanned",
    "openid": "user_openid",
    "sessionId": "uuid",
    "timestamp": 1234567890
  }
}
```

### POST /finalize_login
完成登录流程

**请求:**
```json
{
  "sessionId": "uuid"
}
```

**响应:**
```json
{
  "success": true,
  "token": "login_token",
  "openid": "user_openid",
  "loginTime": "2024-01-01T00:00:00.000Z"
}
```

## 🛠️ 本地开发

### 克隆项目
```bash
git clone https://github.com/Jeff010726/AIMORELOGY-TOOLS.git
cd AIMORELOGY-TOOLS
```

### 本地预览
直接用浏览器打开 `index.html` 或使用本地服务器：

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx serve .

# 访问 http://localhost:8000
```

## 🔒 安全特性

- ✅ **API 密钥安全** - 所有敏感信息存储在 Cloudflare Secrets
- ✅ **会话安全** - 使用临时 UUID，避免用户信息泄露
- ✅ **自动过期** - 登录会话 24 小时自动过期
- ✅ **签名验证** - 微信回调签名严格验证
- ✅ **CORS 保护** - 限制跨域访问来源

## 📦 文件结构

```
AIMORELOGY-TOOLS/
├── index.html                    # 主页面（演示）
├── wechat-login-component.js     # 微信登录组件
├── wechat-login.html            # 独立登录页面
└── README.md                    # 项目说明
```

## 🌟 特色功能

### 模块化设计
- 完全独立的登录组件
- 零依赖，即插即用
- 支持自定义样式和事件

### 实时体验
- WebSocket 实时推送
- 轮询备用方案
- 无需刷新页面

### 移动端优化
- 响应式设计
- 触摸友好
- 微信内置浏览器兼容
>>>>>>> 4fd900879dbba1992320806d4ca8dabe1e3e6e0a

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

<<<<<<< HEAD
## 🔗 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [微信公众平台](https://mp.weixin.qq.com/)

---

**🎉 现在就开始使用这个模块化的微信登录解决方案吧！**
=======
## 📞 联系方式

- GitHub: [@Jeff010726](https://github.com/Jeff010726)
- 项目地址: https://github.com/Jeff010726/AIMORELOGY-TOOLS

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**
>>>>>>> 4fd900879dbba1992320806d4ca8dabe1e3e6e0a
