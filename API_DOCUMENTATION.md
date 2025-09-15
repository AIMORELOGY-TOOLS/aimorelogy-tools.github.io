# 微信登录系统 API 文档

## 概述
本文档描述了微信登录系统的所有API接口，包括二维码生成、登录验证、用户管理等功能。

## 基础信息
- **API Base URL**: `https://wechat-login.jeff010726.workers.dev`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token

## API 接口列表

### 1. 生成登录二维码
**接口**: `POST /create_qr`
**描述**: 生成微信登录二维码

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "sessionId": "uuid-string",
  "qrUrl": "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=xxx"
}
```

### 2. 轮询登录状态
**接口**: `GET /poll?id={sessionId}`
**描述**: 轮询检查二维码扫描和登录状态

**请求参数**:
- `id`: 会话ID (从create_qr接口获取)

**响应示例**:
```json
{
  "status": "success",
  "userInfo": {
    "openid": "xxx",
    "nickname": "用户昵称",
    "userid": "用户ID",
    "level": "normal",
    "avatar": "头像URL",
    "wechatInfo": { ... }
  },
  "token": "base64-encoded-token"
}
```

**状态值说明**:
- `waiting`: 等待扫描
- `scanned`: 已扫描，等待确认
- `success`: 登录成功
- `expired`: 二维码已过期
- `error`: 登录失败

### 3. 完成登录
**接口**: `POST /finalize_login`
**描述**: 完成微信登录流程

**请求参数**:
```json
{
  "sessionId": "uuid-string",
  "code": "微信授权码"
}
```

### 4. 验证Token
**接口**: `POST /validate_token`
**描述**: 验证用户token有效性

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "token": "user-token"
}
```

**响应示例**:
```json
{
  "success": true,
  "valid": true,
  "user": {
    "openid": "xxx",
    "nickname": "用户昵称",
    "level": "normal",
    "usage": { ... }
  }
}
```

### 5. 获取用户信息
**接口**: `POST /get_user_info`
**描述**: 获取用户详细信息

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "openid": "用户openid"
}
```

### 6. 更新使用量
**接口**: `POST /update_usage`
**描述**: 更新用户功能使用量

**请求参数**:
```json
{
  "openid": "用户openid",
  "feature": "功能名称",
  "amount": 1
}
```

### 7. 更新文章使用量
**接口**: `POST /update_article_usage`
**描述**: 更新用户文章生成使用量

**请求参数**:
```json
{
  "openid": "用户openid",
  "amount": 1
}
```

### 8. 获取文章使用量
**接口**: `GET /get_article_usage?openid={openid}`
**描述**: 获取用户文章生成使用量统计

### 9. 权限检查
**接口**: `POST /check_permission`
**描述**: 检查用户是否有特定功能权限

**请求参数**:
```json
{
  "openid": "用户openid",
  "feature": "功能名称"
}
```

## 管理员接口

### 1. 列出所有用户
**接口**: `GET /admin/list_all_keys`

### 2. 获取用户信息
**接口**: `POST /admin/get_user`

### 3. 更新用户信息
**接口**: `POST /admin/update_user`

### 4. 删除用户
**接口**: `POST /admin/delete_user`

### 5. 清空所有用户
**接口**: `POST /admin/clear_all_users`

### 6. 更新用户等级
**接口**: `POST /admin/update_user_level`

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权或token无效 |
| 403 | 权限不足 |
| 404 | 接口不存在 |
| 500 | 服务器内部错误 |

## 用户等级说明

| 等级 | 名称 | 权限 |
|------|------|------|
| normal | 普通用户 | 基础功能 |
| premium | 高级用户 | 扩展功能 |
| vip | VIP用户 | 全部功能 |

## 注意事项

1. **Token有效期**: 7天，过期后需要重新登录
2. **二维码有效期**: 10分钟
3. **轮询频率**: 建议2秒一次
4. **使用量限制**: 根据用户等级不同有不同限制
5. **错误重试**: 建议实现指数退避重试机制

## 更新日志

### v1.2.0 (2025-09-15)
- 修复token验证逻辑
- 优化登录状态保持
- 修复用户信息显示问题
- 统一前后端接口命名

### v1.1.0 (2025-09-12)
- 添加文章生成功能
- 优化用户权限管理
- 改进错误处理机制

### v1.0.0 (2025-09-10)
- 初始版本发布
- 基础微信登录功能
- 用户管理系统