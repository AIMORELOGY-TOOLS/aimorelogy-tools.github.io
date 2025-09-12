# 🔑 重新创建 Cloudflare API Token

## ❌ 当前问题
现有 Token 权限不足，无法部署 Worker。需要重新创建。

## 🚀 最简单的解决方案

### 方法1: 使用预设模板（推荐）
1. 访问: https://dash.cloudflare.com/profile/api-tokens
2. 点击 **"Create Token"**
3. 选择 **"Edit Cloudflare Workers"** 模板
4. 点击 **"Use template"**
5. 在 **Account Resources** 选择 **"Include All accounts"**
6. 点击 **"Continue to summary"**
7. 点击 **"Create Token"**
8. **复制新 Token**

### 方法2: 自定义 Token（如果方法1不行）
**权限配置**:
```
Account:Cloudflare Workers:Edit
Account:Account Settings:Read  
User:User Details:Read
Zone:Zone:Read
Zone:Zone Settings:Edit
Account:Workers KV Storage:Edit
```

**资源范围**:
- Account Resources: Include All accounts
- Zone Resources: Include All zones

## 🔄 替换 Token 步骤

获取新 Token 后，告诉我：
```
新Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

我将立即：
1. ✅ 使用新 Token 重新配置
2. ✅ 部署 Worker 到 Cloudflare
3. ✅ 设置环境变量
4. ✅ 获取 Worker 域名
5. ✅ 更新前端配置

## 📞 如果还是有问题

可以尝试：
1. **直接使用 Global API Key**（不推荐，但权限最全）
   - 在 API Tokens 页面找到 "Global API Key"
   - 点击 "View" 获取 Key
   
2. **使用 wrangler login**（如果可以）
   - 运行 `wrangler logout`
   - 运行 `wrangler login`
   - 在浏览器中授权

---

**请重新创建 Token 并告诉我！我们马上就能完成部署了！**