# 🔐 微信登录模块 - 前端集成指南

## 📋 概述

这是一个基于 Cloudflare Workers 的完整微信扫码登录解决方案，提供了简单易用的前端组件，可以快速集成到任何网站中。

## ✨ 特性

- 🚀 **即插即用** - 只需引入一个 JS 文件即可使用
- 📱 **响应式设计** - 完美支持移动端和桌面端
- 🔒 **安全可靠** - 基于微信官方 API，安全的会话管理
- ⚡ **实时更新** - WebSocket + 轮询双重保障
- 🎨 **美观界面** - 现代化的 UI 设计
- 🔧 **高度可定制** - 支持自定义样式和配置

## 🚀 快速开始

### 1. 引入组件

```html
<!-- 配置 API 地址 -->
<script>
    const API_BASE_URL = 'https://aimorelogybackend.site';
</script>

<!-- 引入微信登录组件 -->
<script src="wechat-login-component.js"></script>
```

### 2. 添加登录按钮

```html
<!-- 基础按钮 -->
<button onclick="WechatLogin.open()">微信登录</button>

<!-- 使用内置样式的按钮 -->
<button class="wechat-login-btn" onclick="WechatLogin.open()">
    <span>微</span>
    微信登录
</button>
```

### 3. 监听登录事件

```javascript
// 监听登录成功事件
window.addEventListener('wechatLoginSuccess', function(event) {
    const { token, openid, loginTime } = event.detail;
    console.log('登录成功:', { token, openid, loginTime });
    
    // 处理登录成功逻辑
    // 例如：跳转到用户中心、更新界面状态等
});

// 监听退出登录事件
window.addEventListener('wechatLogout', function() {
    console.log('用户已退出登录');
    
    // 处理退出登录逻辑
    // 例如：清除用户信息、跳转到登录页等
});
```

## 📚 API 参考

### WechatLogin 对象方法

| 方法 | 描述 | 示例 |
|------|------|------|
| `open()` | 打开登录弹窗 | `WechatLogin.open()` |
| `close()` | 关闭登录弹窗 | `WechatLogin.close()` |
| `checkStatus()` | 检查登录状态 | `const status = WechatLogin.checkStatus()` |
| `logout()` | 退出登录 | `WechatLogin.logout()` |
| `generateQR()` | 重新生成二维码 | `WechatLogin.generateQR()` |

### 登录状态对象

```javascript
const status = WechatLogin.checkStatus();

// 已登录时的返回值
{
    isLoggedIn: true,
    token: "登录令牌",
    openid: "微信用户ID", 
    loginTime: "登录时间"
}

// 未登录时的返回值
{
    isLoggedIn: false
}
```

### 事件详情

#### wechatLoginSuccess 事件

```javascript
event.detail = {
    token: "登录令牌",
    openid: "微信用户ID",
    loginTime: "2024-01-01T00:00:00.000Z"
}
```

## 🎨 自定义样式

组件提供了完整的 CSS 类名，你可以通过覆盖这些样式来自定义外观：

```css
/* 自定义登录按钮样式 */
.wechat-login-btn {
    background: #your-color !important;
    border-radius: 20px !important;
}

/* 自定义弹窗样式 */
.wechat-login-modal {
    backdrop-filter: blur(10px) !important;
}

.wechat-login-content {
    border-radius: 30px !important;
    box-shadow: 0 30px 60px rgba(0,0,0,0.3) !important;
}
```

## 🔧 高级配置

### 自定义 API 地址

```javascript
// 在引入组件前设置
window.API_BASE_URL = 'https://your-custom-domain.com';
```

### 自定义事件处理

```javascript
// 页面加载时检查登录状态
window.addEventListener('load', function() {
    const status = WechatLogin.checkStatus();
    if (status.isLoggedIn) {
        // 用户已登录，更新界面
        showUserInfo(status);
    }
});

// 自动登录检查
function autoLogin() {
    const status = WechatLogin.checkStatus();
    if (!status.isLoggedIn) {
        // 未登录，显示登录按钮或自动打开登录弹窗
        WechatLogin.open();
    }
}
```

## 📱 移动端适配

组件已经完全适配移动端，在移动设备上会自动调整布局和交互方式：

- 响应式弹窗大小
- 触摸友好的按钮尺寸
- 移动端优化的二维码显示
- 自适应的文字大小

## 🔒 安全说明

- 登录令牌存储在 `localStorage` 中
- 令牌有效期为 24 小时，过期自动清除
- 所有 API 通信使用 HTTPS 加密
- 支持 CORS 跨域访问控制

## 🐛 常见问题

### Q: 二维码生成失败怎么办？
A: 检查网络连接和 API 地址配置，确保后端服务正常运行。

### Q: 扫码后没有反应？
A: 确保微信公众号配置正确，回调地址设置为正确的域名。

### Q: 如何自定义登录成功后的跳转？
A: 在 `wechatLoginSuccess` 事件监听器中添加跳转逻辑：

```javascript
window.addEventListener('wechatLoginSuccess', function(event) {
    // 登录成功后跳转
    window.location.href = '/dashboard';
});
```

### Q: 如何在多个页面间保持登录状态？
A: 组件使用 `localStorage` 存储登录信息，在同域名下的所有页面都会自动保持登录状态。

## 📦 文件结构

```
frontend/
├── wechat-login-component.js  # 核心组件文件
├── index.html                 # 基础演示页面
├── demo.html                  # 完整演示页面
├── wechat-login.html         # 独立登录页面
└── README.md                 # 本文档
```

## 🔗 相关链接

- [完整演示页面](demo.html)
- [基础演示页面](index.html)
- [GitHub 源码](https://github.com/Jeff010726/AIMORELOGY-TOOLS)
- [后端 API 文档](https://aimorelogybackend.site/)

## 📄 许可证

MIT License - 可自由使用、修改和分发。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

---

**Made with ❤️ by AIMORELOGY TOOLS**