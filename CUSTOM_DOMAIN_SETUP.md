# 🌐 自定义域名绑定指南

## 🎯 目标
将 `aimorelogybackend.site` 绑定到你的 Cloudflare Worker

## 📋 当前状态
- ✅ Worker 已部署：`wechat-login-worker.internal-articleno.workers.dev`
- ❌ 域名 `aimorelogybackend.site` 未添加到 Cloudflare

## 🚀 步骤一：添加域名到 Cloudflare

### 方法一：通过 Cloudflare Dashboard（推荐）

1. **登录 Cloudflare Dashboard**
   - 访问：https://dash.cloudflare.com
   - 使用你的账户登录

2. **添加站点**
   - 点击 "Add a Site"
   - 输入：`aimorelogybackend.site`
   - 选择免费计划
   - 点击 "Continue"

3. **配置 DNS 记录**
   Cloudflare 会扫描现有 DNS 记录，然后：
   - 添加一个 A 记录指向任意 IP（如 192.0.2.1）
   - 或者添加 CNAME 记录指向 `wechat-login-worker.internal-articleno.workers.dev`

4. **更改 Nameservers**
   - Cloudflare 会提供两个 nameserver
   - 在你的域名注册商处更改 nameserver
   - 等待 DNS 传播（通常 24 小时内）

## 🚀 步骤二：配置 Worker 路由

域名激活后，通过以下方式绑定 Worker：

### 方法一：通过 Dashboard
1. 进入 Cloudflare Dashboard
2. 选择 `aimorelogybackend.site` 域名
3. 进入 "Workers Routes"
4. 添加路由：
   - Route: `aimorelogybackend.site/*`
   - Worker: `wechat-login-worker`

### 方法二：通过 API（我可以帮你执行）
```bash
# 创建 Worker 路由
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/workers/routes" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"pattern":"aimorelogybackend.site/*","script":"wechat-login-worker"}'
```

## 🚀 步骤三：更新 wrangler.toml（可选）

```toml
name = "wechat-login-worker"
main = "src/index.js"
compatibility_date = "2024-09-11"

# 添加自定义域名配置
routes = [
  { pattern = "aimorelogybackend.site/*", custom_domain = true }
]
```

## 🔄 快速设置方案

如果你想快速测试，我建议：

1. **暂时使用 workers.dev 域名**
   - 当前地址：`https://wechat-login-worker.internal-articleno.workers.dev`
   - 立即可用，无需等待 DNS

2. **稍后配置自定义域名**
   - 按上述步骤添加域名到 Cloudflare
   - 我可以帮你配置路由

## 🤔 需要我帮你做什么？

请告诉我你希望：
1. **现在就配置自定义域名**（需要你先在 Cloudflare Dashboard 添加域名）
2. **暂时使用 workers.dev 域名**（立即可用）
3. **我帮你通过 API 配置**（需要域名已在 Cloudflare 中）

## 📱 当前可用地址

在配置自定义域名期间，你的 API 仍然可以通过以下地址访问：

- **创建二维码**: `POST https://wechat-login-worker.internal-articleno.workers.dev/create_qr`
- **检查登录**: `GET https://wechat-login-worker.internal-articleno.workers.dev/check_login/{sessionId}`
- **微信回调**: `POST https://wechat-login-worker.internal-articleno.workers.dev/wechat-callback`

前端页面也已经配置为使用这个地址，所以功能完全正常！