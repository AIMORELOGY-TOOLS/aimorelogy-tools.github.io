# AIMORELOGY 微信登录系统 API 文档

## 概述

本文档描述了 AIMORELOGY 微信登录系统的 API 接口，包括用户认证、权限管理、使用次数跟踪等功能。

## 基础信息

- **后端地址**: `https://aimorelogybackend.site`
- **前端地址**: `https://jeff010726.github.io/AIMORELOGY-TOOLS/`
- **认证方式**: Token 认证

## 用户等级系统

系统支持四个用户等级：

| 等级 | 名称 | 每日使用限制 | 可用功能 |
|------|------|-------------|----------|
| normal | 普通用户 | 10次 | 基础功能 |
| vip | VIP用户 | 50次 | 基础 + 高级功能 |
| svip | 超级VIP | 200次 | 基础 + 高级 + 高端功能 |
| admin | 管理员 | 无限制 | 所有功能 |

## API 接口

### 1. 创建登录二维码

**接口**: `POST /create_qr`

**描述**: 生成微信扫码登录的二维码

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "sessionId": "uuid-string",
  "qrUrl": "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=...",
  "ticket": "ticket-string",
  "expireSeconds": 600
}
```

### 2. 轮询登录状态

**接口**: `GET /poll?id={sessionId}`

**描述**: 轮询二维码扫描状态

**请求参数**:
- `id`: 会话ID (从创建二维码接口获取)

**响应示例**:
```json
{
  "status": "scanned", // pending | scanned | success
  "openid": "user-openid"
}
```

### 3. 完成登录

**接口**: `POST /finalize_login`

**描述**: 完成登录流程，获取用户信息和认证令牌

**请求参数**:
```json
{
  "sessionId": "uuid-string"
}
```

**响应示例**:
```json
{
  "success": true,
  "token": "base64-encoded-token",
  "openid": "user-openid",
  "loginTime": "2025-01-12T03:00:00.000Z",
  "userInfo": {
    "openid": "user-openid",
    "level": "normal",
    "nickname": "用户123456",
    "avatar": "",
    "createdAt": "2025-01-12T03:00:00.000Z",
    "lastLoginAt": "2025-01-12T03:00:00.000Z",
    "usage": {
      "total": 0,
      "daily": 0,
      "lastResetDate": "2025-01-12"
    },
    "limits": {
      "daily": 10,
      "features": ["basic"]
    }
  }
}
```

### 4. 获取用户信息

**接口**: `POST /get_user_info`

**描述**: 获取当前用户的详细信息

**请求参数**:
```json
{
  "token": "user-auth-token"
}
```

**响应示例**:
```json
{
  "success": true,
  "userInfo": {
    "openid": "user-openid",
    "level": "normal",
    "nickname": "用户123456",
    "avatar": "",
    "createdAt": "2025-01-12T03:00:00.000Z",
    "lastLoginAt": "2025-01-12T03:00:00.000Z",
    "usage": {
      "total": 5,
      "daily": 2,
      "lastResetDate": "2025-01-12"
    },
    "limits": {
      "daily": 10,
      "features": ["basic"]
    }
  }
}
```

### 5. 更新使用次数

**接口**: `POST /update_usage`

**描述**: 更新用户的使用次数（用于功能调用计费）

**请求参数**:
```json
{
  "token": "user-auth-token",
  "action": "article_generation", // 功能标识
  "amount": 1 // 消耗次数，默认为1
}
```

**响应示例**:
```json
{
  "success": true,
  "usage": {
    "total": 6,
    "daily": 3,
    "lastResetDate": "2025-01-12"
  }
}
```

### 6. 检查权限

**接口**: `POST /check_permission`

**描述**: 检查用户是否有权限执行某个操作

**请求参数**:
```json
{
  "token": "user-auth-token",
  "action": "article_generation", // 功能标识
  "requiredLevel": "normal" // 所需最低等级，可选
}
```

**响应示例**:
```json
{
  "success": true,
  "permission": {
    "allowed": true,
    "user": { /* 用户信息 */ },
    "remainingUsage": 7
  }
}
```

**权限被拒绝时**:
```json
{
  "success": true,
  "permission": {
    "allowed": false,
    "reason": "今日使用次数已达上限 (10次)"
  }
}
```

## 前端集成指南

### 1. 引入微信登录模块

```html
<!-- 在HTML中引入模块 -->
<script src="sections/wechat-login.js"></script>

<!-- 创建容器 -->
<div id="wechat-login-container"></div>
```

### 2. 初始化登录模块

```javascript
// 创建微信登录实例
const wechatLogin = new WeChatLoginModule({
    apiBaseUrl: 'https://aimorelogybackend.site'
});

// 渲染到指定容器
const container = document.getElementById('wechat-login-container');
wechatLogin.render(container);
```

### 3. 监听登录状态变化

```javascript
document.addEventListener('wechatLoginStatusChange', function(event) {
    const { isLoggedIn, userData } = event.detail;
    
    if (isLoggedIn) {
        console.log('用户已登录:', userData);
        // 处理登录成功逻辑
    } else {
        console.log('用户已退出登录');
        // 处理退出登录逻辑
    }
});
```

### 4. 使用API接口

```javascript
// 获取当前用户
const currentUser = wechatLogin.getCurrentUser();

// 检查权限
const permission = await wechatLogin.checkPermission('normal');
if (!permission.allowed) {
    alert(permission.reason);
    return;
}

// 增加使用次数
try {
    const result = await wechatLogin.incrementUsage('article_generation');
    console.log('使用次数已更新:', result);
} catch (error) {
    console.error('更新使用次数失败:', error);
}
```

## 开发新功能模块

### 1. 功能模块模板

```javascript
class NewFeatureModule {
    constructor(wechatLogin) {
        this.wechatLogin = wechatLogin;
    }
    
    async executeFeature(params) {
        // 1. 检查用户登录状态
        const user = this.wechatLogin.getCurrentUser();
        if (!user) {
            throw new Error('请先登录');
        }
        
        // 2. 检查权限和使用次数
        const permission = await this.wechatLogin.checkPermission('normal');
        if (!permission.allowed) {
            throw new Error(permission.reason);
        }
        
        // 3. 执行功能逻辑
        const result = await this.performFeatureLogic(params);
        
        // 4. 更新使用次数
        await this.wechatLogin.incrementUsage('new_feature');
        
        return result;
    }
    
    async performFeatureLogic(params) {
        // 实现具体功能逻辑
        return { success: true, data: 'feature result' };
    }
}
```

### 2. 集成到主页面

```javascript
// 在主页面中使用新功能
function handleNewFeatureClick() {
    const wechatLogin = window.getWeChatLogin();
    const newFeature = new NewFeatureModule(wechatLogin);
    
    newFeature.executeFeature({ param1: 'value1' })
        .then(result => {
            console.log('功能执行成功:', result);
        })
        .catch(error => {
            console.error('功能执行失败:', error);
            alert(error.message);
        });
}
```

## 错误处理

### 常见错误码

| 状态码 | 错误类型 | 描述 |
|--------|----------|------|
| 401 | 认证失败 | Token无效或已过期 |
| 403 | 权限不足 | 用户等级不够或使用次数超限 |
| 404 | 资源不存在 | 请求的接口不存在 |
| 500 | 服务器错误 | 内部服务器错误 |

### 错误响应格式

```json
{
  "error": "错误类型",
  "message": "详细错误信息"
}
```

## 部署和配置

### 环境变量

在 Cloudflare Workers 中需要配置以下环境变量：

- `WECHAT_APPID`: 微信公众号 AppID
- `WECHAT_SECRET`: 微信公众号 AppSecret  
- `WECHAT_TOKEN`: 微信公众号 Token

### KV 存储

系统使用 Cloudflare KV 存储用户数据：

- `WECHAT_KV`: 用户信息存储
- 键格式: `user:{openid}`

### Durable Objects

系统使用 Durable Objects 管理登录会话：

- `SESSIONS`: 会话管理对象
- 对象ID格式: `session:{sessionId}`

## 安全注意事项

1. **Token 安全**: Token 包含用户 openid，请妥善保管
2. **HTTPS**: 所有 API 调用必须使用 HTTPS
3. **CORS**: 已配置跨域访问，仅允许指定域名
4. **签名验证**: 微信回调使用签名验证确保安全性
5. **使用限制**: 通过等级和次数限制防止滥用

## 更新日志

### v1.0.0 (2025-01-12)
- 初始版本发布
- 支持微信扫码登录
- 实现四级用户系统
- 添加使用次数跟踪
- 提供完整的 API 接口

## 联系方式

如有问题或建议，请联系开发团队。