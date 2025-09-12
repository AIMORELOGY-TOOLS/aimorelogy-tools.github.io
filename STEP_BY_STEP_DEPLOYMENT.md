# 🚀 微信登录模块 - 零基础部署指南

## 📋 部署流程概览
1. **Cloudflare Worker 后端部署** (15分钟)
2. **GitHub Pages 前端部署** (10分钟)  
3. **微信公众号配置** (5分钟)
4. **测试完整流程** (5分钟)

---

## 🔧 第一阶段：Cloudflare Worker 后端部署

### 步骤 1: 安装 Wrangler CLI
打开命令行工具，执行：
```bash
npm install -g wrangler
```

### 步骤 2: 登录 Cloudflare
```bash
wrangler login
```
- 这会打开浏览器
- 用你的 Cloudflare 账户登录
- 授权 Wrangler 访问你的账户

### 步骤 3: 验证登录状态
```bash
wrangler whoami
```
应该显示你的邮箱地址

### 步骤 4: 创建 KV 存储空间
```bash
# 创建生产环境 KV
wrangler kv:namespace create "WECHAT_KV"

# 创建预览环境 KV  
wrangler kv:namespace create "WECHAT_KV" --preview
```

**重要**: 记录返回的 ID，类似这样：
```
🌀 Creating namespace with title "wechat-login-worker-WECHAT_KV"
✨ Success! Created KV namespace with id "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

### 步骤 5: 更新配置文件
编辑 `wrangler.toml` 文件，将 KV ID 替换：

```toml
name = "wechat-login-worker"
main = "src/index.js"
compatibility_date = "2024-01-01"

[env.production]
vars = { }
durable_objects.bindings = [
  { name = "SESSIONS", class_name = "Session" }
]
kv_namespaces = [
  { binding = "WECHAT_KV", id = "你的生产环境ID", preview_id = "你的预览环境ID" }
]

[[migrations]]
tag = "v1"
new_classes = ["Session"]
```

### 步骤 6: 设置微信配置密钥
```bash
# 设置 APPID
wrangler secret put WECHAT_APPID
# 输入: wx2e1f9ccab9e27176

# 设置 SECRET
wrangler secret put WECHAT_SECRET  
# 输入: 2b0086643a47fe0de574efbfc27c0718

# 设置 TOKEN
wrangler secret put WECHAT_TOKEN
# 输入: aimorelogy2025berich
```

### 步骤 7: 安装项目依赖
```bash
npm install
```

### 步骤 8: 本地测试
```bash
npm run dev
```
- 访问 http://localhost:8787
- 应该能看到登录页面
- 按 Ctrl+C 停止本地服务

### 步骤 9: 部署到生产环境
```bash
npm run deploy
```

**成功后会显示类似信息**:
```
✨ Success! Deployed to https://wechat-login-worker.你的用户名.workers.dev
```

**记录这个 URL，后面需要用到！**

---

## 🌐 第二阶段：GitHub Pages 前端部署

### 步骤 1: 克隆你的 GitHub 仓库
```bash
# 克隆仓库到本地
git clone https://github.com/Jeff010726/AIMORELOGY-TOOLS.git
cd AIMORELOGY-TOOLS
```

### 步骤 2: 创建微信登录页面
我会为你创建一个适配的前端文件。

### 步骤 3: 推送到 GitHub
```bash
git add .
git commit -m "添加微信登录功能"
git push origin main
```

### 步骤 4: 启用 GitHub Pages
1. 打开 https://github.com/Jeff010726/AIMORELOGY-TOOLS
2. 点击 **Settings** 选项卡
3. 在左侧菜单找到 **Pages**
4. 在 **Source** 下选择 **Deploy from a branch**
5. 选择 **main** 分支
6. 选择 **/ (root)** 目录
7. 点击 **Save**

等待几分钟后，你的网站将在以下地址可用：
`https://jeff010726.github.io/AIMORELOGY-TOOLS/`

---

## 📱 第三阶段：微信公众号配置

### 步骤 1: 登录微信公众平台
访问 https://mp.weixin.qq.com 并登录

### 步骤 2: 配置服务器
1. 进入 **开发 → 基本配置**
2. 点击 **服务器配置** 的 **修改配置**
3. 填写以下信息：
   - **URL**: `https://wechat-login-worker.你的用户名.workers.dev/wechat-callback`
   - **Token**: `aimorelogy2025berich`
   - **EncodingAESKey**: 点击随机生成
   - **消息加解密方式**: 选择 **明文模式**
4. 点击 **提交**

### 步骤 3: 验证配置
- 微信会自动验证你的服务器
- 如果验证成功，会显示 **配置成功**
- 点击 **启用** 按钮

---

## ✅ 第四阶段：测试完整流程

### 步骤 1: 测试后端 API
```bash
# 测试二维码生成
curl -X POST https://wechat-login-worker.你的用户名.workers.dev/create_qr
```

应该返回类似：
```json
{
  "success": true,
  "sessionId": "uuid-string",
  "qrcodeUrl": "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=...",
  "expiresIn": 600
}
```

### 步骤 2: 测试前端页面
访问：`https://jeff010726.github.io/AIMORELOGY-TOOLS/wechat-login.html`

### 步骤 3: 测试完整登录
1. 点击 **微信登录** 按钮
2. 应该弹出二维码
3. 用微信扫码
4. 关注公众号（如果还没关注）
5. 应该自动登录成功

---

## 🐛 常见问题解决

### 问题 1: `wrangler login` 失败
**解决方案**:
```bash
# 清除缓存重新登录
wrangler logout
wrangler login
```

### 问题 2: KV 创建失败
**解决方案**:
- 确保你的 Cloudflare 账户已验证邮箱
- 检查是否有足够的权限

### 问题 3: 部署失败 "Durable Object binding"
**解决方案**:
- 确保 `wrangler.toml` 中的配置正确
- 重新运行 `npm run deploy`

### 问题 4: 微信验证失败
**解决方案**:
- 检查 Worker URL 是否可以访问
- 确认 Token 设置正确
- 查看实时日志：`wrangler tail`

### 问题 5: 前端无法调用后端
**解决方案**:
- 检查前端文件中的 API_BASE_URL 是否正确
- 确认 CORS 配置

---

## 📞 获取帮助

### 查看实时日志
```bash
wrangler tail
```

### 查看 KV 存储
```bash
wrangler kv:key list --binding=WECHAT_KV
```

### 重新部署
```bash
npm run deploy
```

---

## 🎯 下一步

部署完成后，你将拥有：
- ✅ 一个完整的微信登录系统
- ✅ 模块化的代码结构
- ✅ 可以集成到任何网站的登录组件
- ✅ 实时的扫码状态推送

**现在开始第一步：安装 Wrangler CLI！**