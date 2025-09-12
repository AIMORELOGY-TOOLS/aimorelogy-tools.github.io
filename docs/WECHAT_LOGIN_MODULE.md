# 微信登录模块开发文档

## 概述

微信登录模块是一个完整的基于微信公众号二维码扫码登录的解决方案，支持用户等级管理、使用次数统计和登录状态持久化。

## 技术架构

### 前端架构
- **框架**: 原生JavaScript ES6+ 模块化
- **部署**: GitHub Pages 静态托管
- **样式**: CSS3 + Flexbox/Grid 响应式布局
- **存储**: localStorage 本地存储用户信息

### 后端架构
- **平台**: Cloudflare Workers 无服务器计算
- **存储**: Cloudflare KV 键值存储
- **会话管理**: Durable Objects 状态管理
- **API**: RESTful API + 微信公众号回调

## 核心功能

### 1. 二维码登录流程
1. 前端调用 `/create_qr` 生成带参数二维码
2. 用户使用微信扫描二维码
3. 微信服务器推送扫码事件到 `/wechat-callback`
4. 后端处理扫码事件，获取用户信息
5. 前端轮询 `/poll` 获取登录状态
6. 登录成功后调用 `/finalize_login` 完成登录

### 2. 用户等级系统
- **普通用户 (normal)**: 每日10次，每月100次
- **VIP用户 (vip)**: 每日50次，每月500次
- **SVIP用户 (svip)**: 每日200次，每月2000次
- **管理员 (admin)**: 无限制使用

### 3. 唯一用户ID生成
- 基于微信昵称生成用户ID
- 重复昵称自动添加编号（如：张三、张三2、张三3）
- 确保每次登录都是同一用户，不重复创建

## 文件结构

```
wechat_login/
├── sections/
│   └── wechat-login.js          # 前端登录模块
├── src/
│   ├── index.js                 # 后端主入口
│   └── session.js               # 会话管理 Durable Object
├── docs/
│   └── WECHAT_LOGIN_MODULE.md   # 本文档
└── wrangler.toml                # Cloudflare Workers 配置
```

## API 接口文档

### 前端接口

#### POST /create_qr
创建登录二维码
- **响应**: `{ success: true, sessionId: string, qrUrl: string, expireSeconds: number }`

#### GET /poll?id={sessionId}
轮询登录状态
- **响应**: `{ status: 'waiting'|'scanned'|'success', userInfo?: object }`

#### POST /finalize_login
完成登录流程
- **请求**: `{ sessionId: string }`
- **响应**: `{ success: true, userInfo: object, token: string }`

#### POST /validate_token
验证token有效性
- **请求**: `{ token: string }`
- **响应**: `{ success: true, valid: boolean, user?: object }`

### 管理接口

#### POST /update_usage
更新使用次数
- **请求**: `{ token: string, action: string, amount: number }`
- **响应**: `{ success: true, usage: object }`

#### GET /usage_stats?openid={openid}
获取使用统计
- **响应**: `{ success: true, stats: object }`

## 前端使用方法

### 基本使用

```javascript
// 创建登录模块实例
const wechatLogin = new WeChatLoginModule({
    apiBaseUrl: 'https://aimorelogybackend.site',
    pollInterval: 2000,
    storageKey: 'wechat_user_info'
});

// 渲染到指定容器
const container = document.getElementById('login-container');
wechatLogin.render(container);

// 监听登录状态变化
document.addEventListener('wechatLoginStatusChange', (event) => {
    const { isLoggedIn, userData } = event.detail;
    console.log('登录状态:', isLoggedIn, userData);
});
```

### 权限检查

```javascript
// 检查用户权限
const permission = wechatLogin.checkPermission('vip');
if (!permission.allowed) {
    alert(permission.reason);
    return;
}

// 增加使用次数
try {
    await wechatLogin.incrementUsage('article_generation');
    console.log('使用次数已更新');
} catch (error) {
    console.error('更新失败:', error);
}
```

## 环境变量配置

### Cloudflare Workers 环境变量
```toml
[env.production.vars]
WECHAT_APPID = "your_wechat_appid"
WECHAT_SECRET = "your_wechat_secret"
WECHAT_TOKEN = "your_wechat_token"
```

### KV 命名空间
- `WECHAT_KV`: 用户数据存储

### Durable Objects
- `SESSIONS`: 会话状态管理

## 数据结构

### 用户数据结构
```javascript
{
    openid: "用户微信openid",
    userid: "唯一用户ID",
    nickname: "用户昵称",
    avatar: "头像URL",
    level: "normal|vip|svip|admin",
    createdAt: "创建时间",
    lastLoginAt: "最后登录时间",
    usage: {
        total: 0,
        daily: 0,
        lastResetDate: "2025-09-12"
    },
    limits: {
        daily: 10,
        features: ["basic"]
    },
    token: "登录token",
    expireTime: 1234567890123
}
```

## 安全特性

1. **Token验证**: 每次API调用验证token有效性
2. **CORS保护**: 配置跨域访问控制
3. **签名验证**: 微信回调签名验证
4. **会话过期**: 自动清理过期会话
5. **权限控制**: 基于用户等级的功能访问控制

## 错误处理

### 常见错误码
- `40001`: 微信access_token过期
- `40003`: 无效的openid
- `40013`: 无效的appid
- `41001`: 缺少access_token参数

### 前端错误处理
```javascript
try {
    await wechatLogin.incrementUsage();
} catch (error) {
    if (error.message.includes('权限不足')) {
        // 处理权限不足
    } else if (error.message.includes('次数已达上限')) {
        // 处理使用次数限制
    }
}
```

## 部署说明

### 前端部署
1. 推送代码到GitHub仓库
2. 启用GitHub Pages
3. 配置自定义域名（可选）

### 后端部署
```bash
# 安装Wrangler CLI
npm install -g wrangler

# 登录Cloudflare
wrangler auth login

# 部署到Cloudflare Workers
wrangler deploy
```

## 监控和日志

### 日志查看
```bash
# 实时查看日志
wrangler tail --format pretty

# 查看特定时间段日志
wrangler tail --since 2025-09-12T00:00:00Z
```

### 性能监控
- Cloudflare Workers Analytics
- KV存储使用量监控
- API调用频率统计

## 维护和更新

### 定期维护任务
1. 清理过期会话数据
2. 更新微信access_token
3. 监控API调用量
4. 备份用户数据

### 版本更新流程
1. 本地测试新功能
2. 部署到测试环境
3. 验证功能正常
4. 部署到生产环境
5. 监控系统状态

## 故障排除

### 常见问题
1. **二维码无法生成**: 检查微信access_token是否有效
2. **扫码无响应**: 检查微信回调URL配置
3. **登录状态丢失**: 检查localStorage和token有效期
4. **权限验证失败**: 检查用户等级和使用次数

### 调试工具
- 浏览器开发者工具
- Wrangler CLI日志
- 微信公众平台接口调试工具

## 最佳实践

1. **错误处理**: 始终包含完整的错误处理逻辑
2. **用户体验**: 提供清晰的加载状态和错误提示
3. **性能优化**: 合理设置轮询间隔和缓存策略
4. **安全防护**: 定期更新token和验证用户权限
5. **代码维护**: 保持代码模块化和文档更新

---

**开发者**: CodeBuddy  
**最后更新**: 2025-09-12  
**版本**: v1.0.0