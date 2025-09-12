# 🔑 Cloudflare API Token 获取指南

## 📋 获取 Cloudflare API Token

### 步骤 1: 登录 Cloudflare Dashboard
访问 https://dash.cloudflare.com 并登录你的账户

### 步骤 2: 进入 API Tokens 页面
1. 点击右上角的用户头像
2. 选择 **My Profile**
3. 点击 **API Tokens** 选项卡
4. 点击 **Create Token** 按钮

### 步骤 3: 创建自定义 Token
1. 选择 **Custom token** 下的 **Get started**
2. 填写以下信息：

**Token name**: `Wrangler Deploy Token`

**Permissions**:
- `Zone:Zone:Read`
- `Zone:Zone Settings:Edit` 
- `User:User Details:Read`
- `Account:Cloudflare Workers:Edit`
- `Account:Account Settings:Read`
- `Zone:Zone:Edit` (如果需要自定义域名)

**Account Resources**:
- `Include: All accounts`

**Zone Resources**:
- `Include: All zones` (如果你有域名)

### 步骤 4: 生成并复制 Token
1. 点击 **Continue to summary**
2. 点击 **Create Token**
3. **重要**: 复制生成的 Token（只会显示一次！）

Token 格式类似：`1234567890abcdef1234567890abcdef12345678`

## 🚀 使用 Token 部署

获取到 Token 后，告诉我这个 Token，我就可以帮你：

1. ✅ 配置 Wrangler 认证
2. ✅ 创建 KV 命名空间
3. ✅ 设置环境变量
4. ✅ 部署 Worker 到生产环境
5. ✅ 配置 Durable Objects

## 🔒 安全提醒

- Token 具有管理你 Cloudflare 账户的权限
- 请妥善保管，不要泄露给他人
- 部署完成后可以删除或禁用 Token

---

**下一步**: 获取 Token 后，直接告诉我，我立即开始部署！