# 📱 GitHub Pages 前端部署指南

## 🎯 目标
将微信登录前端部署到你的 GitHub Pages: https://jeff010726.github.io/AIMORELOGY-TOOLS/

## 📋 准备工作
1. 确保你已经完成了 Cloudflare Worker 后端部署
2. 记录你的 Worker 域名地址（类似：`https://wechat-login-worker.你的用户名.workers.dev`）

## 🚀 部署步骤

### 步骤 1: 克隆你的 GitHub 仓库
```bash
# 克隆仓库到本地
git clone https://github.com/Jeff010726/AIMORELOGY-TOOLS.git
cd AIMORELOGY-TOOLS
```

### 步骤 2: 复制前端文件
将以下文件复制到你的仓库根目录：

1. **index.html** - 主页面（演示页面）
2. **wechat-login-component.js** - 微信登录组件
3. **wechat-login.html** - 独立登录页面（可选）

### 步骤 3: 配置 API 地址
编辑 `index.html` 文件，找到这一行：
```javascript
const API_BASE_URL = 'https://wechat-login-worker.你的用户名.workers.dev';
```

将 `你的用户名` 替换为你的实际 Cloudflare Workers 域名。

### 步骤 4: 推送到 GitHub
```bash
git add .
git commit -m "添加微信登录功能"
git push origin main
```

### 步骤 5: 启用 GitHub Pages
1. 打开 https://github.com/Jeff010726/AIMORELOGY-TOOLS
2. 点击 **Settings** 选项卡
3. 在左侧菜单找到 **Pages**
4. 在 **Source** 下选择 **Deploy from a branch**
5. 选择 **main** 分支
6. 选择 **/ (root)** 目录
7. 点击 **Save**

### 步骤 6: 等待部署完成
- GitHub 会自动构建和部署你的网站
- 通常需要 5-10 分钟
- 部署完成后，你的网站将在以下地址可用：
  `https://jeff010726.github.io/AIMORELOGY-TOOLS/`

## 🔧 更新 Worker CORS 配置

为了让前端能够正常调用后端 API，需要更新 Worker 的 CORS 配置。

编辑你的 Worker 代码 `src/index.js`，找到 `corsHeaders` 配置：

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://jeff010726.github.io',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

然后重新部署 Worker：
```bash
npm run deploy
```

## 📁 文件结构

部署完成后，你的仓库结构应该是这样的：

```
AIMORELOGY-TOOLS/
├── index.html                    # 主页面（演示）
├── wechat-login-component.js     # 微信登录组件
├── wechat-login.html            # 独立登录页面（可选）
└── README.md                    # 项目说明
```

## 🌐 访问地址

- **主页面**: https://jeff010726.github.io/AIMORELOGY-TOOLS/
- **独立登录页**: https://jeff010726.github.io/AIMORELOGY-TOOLS/wechat-login.html

## ✅ 测试流程

1. 访问你的 GitHub Pages 地址
2. 点击 **微信登录** 按钮
3. 应该弹出二维码弹窗
4. 用微信扫码测试登录流程

## 🐛 常见问题

### 问题 1: 页面显示但无法生成二维码
**原因**: API 地址配置错误或 CORS 问题
**解决方案**:
1. 检查 `index.html` 中的 `API_BASE_URL` 是否正确
2. 确认 Worker 的 CORS 配置包含你的 GitHub Pages 域名
3. 打开浏览器开发者工具查看网络请求错误

### 问题 2: GitHub Pages 没有更新
**解决方案**:
1. 等待 5-10 分钟让 GitHub 完成部署
2. 清除浏览器缓存
3. 检查 GitHub Actions 是否有构建错误

### 问题 3: 404 错误
**解决方案**:
1. 确认文件已正确推送到 main 分支
2. 检查 GitHub Pages 设置是否正确
3. 确认文件名大小写正确

## 🔄 更新部署

当你需要更新前端代码时：

```bash
# 修改文件后
git add .
git commit -m "更新前端代码"
git push origin main
```

GitHub 会自动重新部署你的网站。

## 📞 获取帮助

如果遇到问题：
1. 检查浏览器开发者工具的控制台错误
2. 查看网络请求是否成功
3. 确认 Worker 后端是否正常运行
4. 检查微信公众号配置是否正确

---

**下一步**: 完成部署后，测试完整的登录流程！