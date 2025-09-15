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

- **主页演示**: https://tools.aimorelogy.com
- **独立登录页**: https://tools.aimorelogy.com/wechat-login.html

## 🏗️ 技术架构

```
Frontend (GitHub Pages)
    ↕ (WebSocket/轮询)
Cloudflare Worker (API 端点)
    ├─ Durable Object (会话管理 + WebSocket)
    ├─ KV Storage (access_token 缓存)
    └─ 微信 API 调用
        
微信服务器 → POST XML → Worker /wechat-callback → 通知 Durable Object → 推送给前端
```

## 🚀 快速开始

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
git clone https://github.com/AIMORELOGY-TOOLS/aimorelogy-tools.github.io.git
cd aimorelogy-tools.github.io
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

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

- GitHub: [@Jeff010726](https://github.com/Jeff010726)
- 项目地址: https://github.com/AIMORELOGY-TOOLS/aimorelogy-tools.github.io

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**