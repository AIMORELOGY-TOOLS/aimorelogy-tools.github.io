# 🤖 AI文章生成平台 - 微信登录模块

## 📋 项目概述

这是一个模块化的微信登录解决方案，采用前后端分离架构：

- **前端**: GitHub Pages 静态托管
- **后端**: Cloudflare Workers 无服务器架构
- **设计理念**: 模块化，类似 Shopify，易于集成到其他项目

## 🏗️ 架构设计

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
```

## 🚀 快速开始

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

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [微信公众平台](https://mp.weixin.qq.com/)

---

**🎉 现在就开始使用这个模块化的微信登录解决方案吧！**