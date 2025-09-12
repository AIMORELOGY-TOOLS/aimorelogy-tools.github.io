# 🔧 Cloudflare API Token 权限修复指南

## ❌ 当前问题
你的 Token 权限不足，无法创建 KV 存储空间。需要重新创建一个具有完整权限的 Token。

## 🔑 重新创建 Token 步骤

### 1. 访问 API Tokens 页面
https://dash.cloudflare.com/profile/api-tokens

### 2. 删除旧 Token（可选）
找到之前创建的 Token，点击删除

### 3. 创建新的自定义 Token
点击 **"Create Token"** → 选择 **"Custom token"**

### 4. 配置完整权限
**Token name**: `Wrangler Full Deploy Token`

**Permissions** (重要！必须包含以下所有权限):
```
Account:Cloudflare Workers:Edit
Account:Account Settings:Read
Account:User Details:Read
Zone:Zone Settings:Edit
Zone:Zone:Read
Zone:Zone:Edit
Account:Workers KV Storage:Edit
Account:Workers Scripts:Edit
Account:Account Analytics:Read
```

**Account Resources**:
- `Include: All accounts`

**Zone Resources**:
- `Include: All zones`

### 5. 生成新 Token
1. 点击 **"Continue to summary"**
2. 点击 **"Create Token"**
3. **复制新的 Token**

## 🚀 使用新 Token

获取新 Token 后，告诉我新的 Token，格式如下：
```
新 Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

我将立即使用新 Token 完成部署！

## 📋 部署清单

使用新 Token 后，我将完成：
- ✅ 创建 KV 存储空间
- ✅ 设置微信配置密钥
- ✅ 部署 Worker 到生产环境
- ✅ 配置 Durable Objects
- ✅ 获取 Worker 域名地址
- ✅ 更新前端配置文件

---

**请重新创建 Token 并告诉我新的 Token！**