# 🚀 完整部署指南

## 📋 部署概览

- **后端**: Cloudflare Worker + Durable Objects + KV Storage
- **前端**: GitHub Pages (你的仓库: https://github.com/Jeff010726/AIMORELOGY-TOOLS.git)
- **微信配置**: 公众号带参二维码登录

## 🔧 第一步：Cloudflare 账户设置

### 1.1 安装 Wrangler CLI
```bash
npm install -g wrangler
```

### 1.2 登录 Cloudflare
```bash
wrangler login
```
这会打开浏览器，用你的 Cloudflare 账户登录。

### 1.3 验证登录
```bash
wrangler whoami
```

## 🗄️ 第二步：创建 KV 存储

### 2.1 创建 KV 命名空间
```bash
# 生产环境
wrangler kv:namespace create "WECHAT_KV"

# 预览环境  
wrangler kv:namespace create "WECHAT_KV" --preview
```

### 2.2 更新 wrangler.toml
将返回的 ID 替换到 `wrangler.toml` 中：
```toml
kv_namespaces = [
  { binding = "WECHAT_KV", id = "你的生产环境ID", preview_id = "你的预览环境ID" }
]
```

## 🔐 第三步：设置环境变量

```bash
# 设置微信 APPID
wrangler secret put WECHAT_APPID
# 输入: wx2e1f9ccab9e27176

# 设置微信 SECRET
wrangler secret put WECHAT_SECRET
# 输入: 2b0086643a47fe0de574efbfc27c0718

# 设置微信 TOKEN
wrangler secret put WECHAT_TOKEN
# 输入: aimorelogy2025berich
```

## 🚀 第四步：部署 Worker

### 4.1 安装依赖
```bash
npm install
```

### 4.2 本地测试
```bash
npm run dev
```
访问 http://localhost:8787 测试登录页面

### 4.3 部署到生产环境
```bash
npm run deploy
```

部署成功后会得到一个 URL，类似：
`https://wechat-login-worker.你的用户名.workers.dev`

## 📱 第五步：配置微信公众号

### 5.1 登录微信公众平台
访问 https://mp.weixin.qq.com

### 5.2 设置服务器配置
1. 进入 **开发 → 基本配置 → 服务器配置**
2. 填写以下信息：
   - **服务器地址(URL)**: `https://你的worker域名.workers.dev/wechat-callback`
   - **令牌(Token)**: `aimorelogy2025berich`
   - **消息加解密方式**: 选择 **明文模式**
3. 点击 **提交** 进行验证

### 5.3 启用服务器配置
验证成功后，点击 **启用** 按钮。

## 🌐 第六步：前端部署到 GitHub Pages

### 6.1 准备前端文件
我会为你创建适配的前端文件，需要修改 API 地址指向你的 Worker。

### 6.2 推送到你的 GitHub 仓库
```bash
# 克隆你的仓库
git clone https://github.com/Jeff010726/AIMORELOGY-TOOLS.git
cd AIMORELOGY-TOOLS

# 复制前端文件到仓库
# (我会帮你创建适配的文件)

# 提交并推送
git add .
git commit -m "添加微信登录功能"
git push origin main
```

### 6.3 启用 GitHub Pages
1. 进入你的 GitHub 仓库设置
2. 找到 **Pages** 选项
3. 选择 **Deploy from a branch**
4. 选择 **main** 分支
5. 选择 **/ (root)** 目录
6. 点击 **Save**

## 🔗 第七步：配置跨域和域名

### 7.1 更新 Worker CORS 设置
确保 Worker 允许你的 GitHub Pages 域名访问：
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://jeff010726.github.io',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

### 7.2 (可选) 自定义域名
如果你有自己的域名，可以在 Cloudflare Workers 中绑定自定义域名。

## ✅ 第八步：测试完整流程

### 8.1 测试后端 API
```bash
# 测试生成二维码
curl -X POST https://你的worker域名.workers.dev/create_qr

# 测试微信回调验证
curl "https://你的worker域名.workers.dev/wechat-callback?signature=test&timestamp=123&nonce=456&echostr=hello"
```

### 8.2 测试前端页面
访问你的 GitHub Pages 地址：
`https://jeff010726.github.io/AIMORELOGY-TOOLS/wechat-login.html`

### 8.3 测试完整登录流程
1. 打开前端页面
2. 点击生成二维码
3. 用微信扫码
4. 关注公众号
5. 查看是否自动登录成功

## 🐛 常见问题排查

### 问题1：微信回调验证失败
**解决方案**:
- 检查 TOKEN 是否正确设置
- 确认 Worker URL 可以正常访问
- 查看 Worker 日志：`wrangler tail`

### 问题2：二维码生成失败
**解决方案**:
- 检查 APPID 和 SECRET 是否正确
- 确认公众号类型支持带参二维码接口
- 查看 access_token 是否正常获取

### 问题3：前端无法调用后端 API
**解决方案**:
- 检查 CORS 配置
- 确认 API 地址是否正确
- 查看浏览器控制台错误信息

### 问题4：扫码后没有反应
**解决方案**:
- 检查微信公众号是否正确配置服务器地址
- 确认 Durable Objects 是否正常工作
- 查看 Worker 日志确认是否收到微信推送

## 📊 监控和日志

### 查看实时日志
```bash
wrangler tail
```

### 查看 KV 存储内容
```bash
wrangler kv:key list --binding=WECHAT_KV
```

### 查看 Durable Objects 状态
在 Cloudflare Dashboard 中查看 Durable Objects 使用情况。

## 🔄 更新和维护

### 更新 Worker 代码
```bash
# 修改代码后重新部署
npm run deploy
```

### 更新前端代码
```bash
# 推送到 GitHub 仓库
git add .
git commit -m "更新前端代码"
git push origin main
```

## 📞 获取帮助

如果遇到问题，可以：
1. 查看 Cloudflare Workers 文档
2. 查看微信公众平台开发文档
3. 检查项目的 README.md 文件
4. 查看 Worker 实时日志进行调试

---

**下一步**: 我会为你创建适配 GitHub Pages 的前端文件，请告诉我你的 Worker 部署完成后的域名地址。