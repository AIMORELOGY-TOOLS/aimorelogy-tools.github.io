/**
 * AI图片生成模块
 * 基于豆包Seedream 4.0 API
 */
class ImageGenerator {
    constructor() {
        this.apiUrl = 'https://aimorelogy-tools-backstage.jeff010726.workers.dev';
        this.currentUser = null;
        this.isGenerating = false;
        this.init();
    }

    /**
     * 初始化模块
     */
    async init() {
        this.bindEvents();
        await this.checkLoginStatus();
        this.updateCharCount();
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 生成按钮点击事件
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateImage();
        });

        // 下载按钮点击事件
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadImage();
        });

        // 重新生成按钮点击事件
        document.getElementById('regenerateBtn').addEventListener('click', () => {
            this.regenerateImage();
        });

        // 输入框字符计数
        document.getElementById('promptInput').addEventListener('input', () => {
            this.updateCharCount();
        });

        // 回车键快捷生成
        document.getElementById('promptInput').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.generateImage();
            }
        });
    }

    /**
     * 检查登录状态
     */
    async checkLoginStatus() {
        const token = localStorage.getItem('wechat_token');
        const loginStatusEl = document.getElementById('loginStatus');
        const usageInfoEl = document.getElementById('usageInfo');

        if (!token) {
            loginStatusEl.innerHTML = `
                <div style="color: #dc3545;">
                    <strong>未登录</strong> - 请先登录后使用图片生成功能
                    <div style="margin-top: 10px;">
                        <a href="wechat-login.html" style="color: #007bff; text-decoration: none;">
                            → 点击这里登录
                        </a>
                    </div>
                </div>
            `;
            this.disableGenerator();
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/verify_token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token })
            });

            const result = await response.json();

            if (result.success && result.user) {
                this.currentUser = result.user;
                this.displayUserInfo(result.user);
                await this.updateUsageInfo();
                usageInfoEl.style.display = 'block';
                this.enableGenerator();
            } else {
                loginStatusEl.innerHTML = `
                    <div style="color: #dc3545;">
                        <strong>登录已过期</strong> - 请重新登录
                        <div style="margin-top: 10px;">
                            <a href="wechat-login.html" style="color: #007bff; text-decoration: none;">
                                → 点击这里重新登录
                            </a>
                        </div>
                    </div>
                `;
                localStorage.removeItem('wechat_token');
                this.disableGenerator();
            }
        } catch (error) {
            console.error('验证登录状态失败:', error);
            this.showMessage('网络连接失败，请检查网络后重试', 'error');
            this.disableGenerator();
        }
    }

    /**
     * 显示用户信息
     */
    displayUserInfo(user) {
        const loginStatusEl = document.getElementById('loginStatus');
        loginStatusEl.innerHTML = `
            <div class="user-info">
                <div><strong>登录状态:</strong> 已登录</div>
                <div><strong>用户昵称:</strong> ${user.nickname}</div>
                <div><strong>用户等级:</strong> ${this.getLevelName(user.level)}</div>
                <div><strong>登录时间:</strong> ${new Date(user.loginTime).toLocaleString()}</div>
            </div>
        `;
    }

    /**
     * 获取等级名称
     */
    getLevelName(level) {
        const levelNames = {
            'normal': '普通用户',
            'vip': 'VIP用户',
            'svip': 'SVIP用户',
            'admin': '管理员'
        };
        return levelNames[level] || '未知等级';
    }

    /**
     * 更新使用情况信息
     */
    async updateUsageInfo() {
        if (!this.currentUser) return;

        try {
            const response = await fetch(`${this.apiUrl}/get_user_stats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: localStorage.getItem('wechat_token')
                })
            });

            const result = await response.json();

            if (result.success) {
                const imageUsage = result.user.imageUsage || { daily: 0, total: 0 };
                const tokenUsage = result.user.tokenUsage?.image || { daily: 0, total: 0 };
                const dailyLimit = this.getImageLimit(result.user.level);

                document.getElementById('dailyUsage').textContent = imageUsage.daily;
                document.getElementById('dailyLimit').textContent = dailyLimit === -1 ? '无限制' : dailyLimit;
                document.getElementById('totalUsage').textContent = imageUsage.total;
                document.getElementById('tokenUsage').textContent = tokenUsage.total;

                // 更新当前用户数据
                this.currentUser = result.user;
            }
        } catch (error) {
            console.error('获取使用统计失败:', error);
        }
    }

    /**
     * 获取图片生成限制
     */
    getImageLimit(level) {
        const limits = {
            'normal': 3,
            'vip': 10,
            'svip': 20,
            'admin': -1
        };
        return limits[level] || 3;
    }

    /**
     * 启用生成器
     */
    enableGenerator() {
        document.getElementById('generateBtn').disabled = false;
        document.getElementById('promptInput').disabled = false;
        document.getElementById('sizeSelect').disabled = false;
        document.getElementById('styleSelect').disabled = false;
        document.getElementById('watermarkCheck').disabled = false;
    }

    /**
     * 禁用生成器
     */
    disableGenerator() {
        document.getElementById('generateBtn').disabled = true;
        document.getElementById('promptInput').disabled = true;
        document.getElementById('sizeSelect').disabled = true;
        document.getElementById('styleSelect').disabled = true;
        document.getElementById('watermarkCheck').disabled = true;
    }

    /**
     * 更新字符计数
     */
    updateCharCount() {
        const input = document.getElementById('promptInput');
        const count = document.getElementById('charCount');
        count.textContent = input.value.length;
        
        if (input.value.length > 600) {
            count.style.color = '#dc3545';
        } else if (input.value.length > 500) {
            count.style.color = '#ffc107';
        } else {
            count.style.color = '#999';
        }
    }

    /**
     * 生成图片
     */
    async generateImage() {
        if (this.isGenerating) return;

        const prompt = document.getElementById('promptInput').value.trim();
        const size = document.getElementById('sizeSelect').value;
        const style = document.getElementById('styleSelect').value;
        const watermark = document.getElementById('watermarkCheck').checked;

        // 验证输入
        if (!prompt) {
            this.showMessage('请输入图片描述', 'warning');
            document.getElementById('promptInput').focus();
            return;
        }

        if (prompt.length < 10) {
            this.showMessage('图片描述至少需要10个字符，请提供更详细的描述', 'warning');
            document.getElementById('promptInput').focus();
            return;
        }

        if (prompt.length > 600) {
            this.showMessage('图片描述不能超过600个字符', 'warning');
            return;
        }

        // 检查使用限制
        if (!this.checkUsageLimit()) {
            return;
        }

        this.isGenerating = true;
        this.updateGenerateButton(true);
        this.showProgress();
        this.hideResult();
        this.clearMessages();

        try {
            const response = await fetch(`${this.apiUrl}/generate_image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: localStorage.getItem('wechat_token'),
                    prompt: prompt,
                    size: size,
                    style: style,
                    watermark: watermark
                })
            });

            const result = await response.json();

            if (result.success) {
                this.displayGeneratedImage(result.data);
                this.showMessage('图片生成成功！', 'success');
                await this.updateUsageInfo();
            } else {
                this.showMessage(result.message || '图片生成失败，请重试', 'error');
            }
        } catch (error) {
            console.error('图片生成失败:', error);
            this.showMessage('网络连接失败，请检查网络后重试', 'error');
        } finally {
            this.isGenerating = false;
            this.updateGenerateButton(false);
            this.hideProgress();
        }
    }

    /**
     * 检查使用限制
     */
    checkUsageLimit() {
        if (!this.currentUser) {
            this.showMessage('请先登录', 'warning');
            return false;
        }

        const imageUsage = this.currentUser.imageUsage || { daily: 0 };
        const dailyLimit = this.getImageLimit(this.currentUser.level);

        if (dailyLimit !== -1 && imageUsage.daily >= dailyLimit) {
            this.showMessage(`今日图片生成次数已达上限 (${imageUsage.daily}/${dailyLimit})，请明天再试或升级账户`, 'warning');
            return false;
        }

        return true;
    }

    /**
     * 显示生成的图片
     */
    displayGeneratedImage(data) {
        const resultSection = document.getElementById('resultSection');
        const resultImage = document.getElementById('resultImage');

        resultImage.src = data.imageUrl;
        resultImage.onload = () => {
            resultSection.style.display = 'block';
            resultSection.scrollIntoView({ behavior: 'smooth' });
        };

        // 存储图片信息用于下载
        this.currentImageData = data;
    }

    /**
     * 下载图片
     */
    async downloadImage() {
        if (!this.currentImageData || !this.currentImageData.imageUrl) {
            this.showMessage('没有可下载的图片', 'warning');
            return;
        }

        try {
            const response = await fetch(this.currentImageData.imageUrl);
            const blob = await response.blob();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-generated-image-${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.showMessage('图片下载成功！', 'success');
        } catch (error) {
            console.error('下载图片失败:', error);
            this.showMessage('下载失败，请右键图片另存为', 'error');
        }
    }

    /**
     * 重新生成图片
     */
    regenerateImage() {
        this.generateImage();
    }

    /**
     * 更新生成按钮状态
     */
    updateGenerateButton(loading) {
        const btn = document.getElementById('generateBtn');
        if (loading) {
            btn.disabled = true;
            btn.innerHTML = '🔄 生成中...';
        } else {
            btn.disabled = false;
            btn.innerHTML = '🎨 开始生成图片';
        }
    }

    /**
     * 显示进度
     */
    showProgress() {
        const progressSection = document.getElementById('progressSection');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        progressSection.style.display = 'block';
        progressText.textContent = '正在生成图片...';
        
        // 模拟进度
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressFill.style.width = progress + '%';
            
            if (progress > 30) progressText.textContent = '正在处理图片描述...';
            if (progress > 60) progressText.textContent = '正在生成图片内容...';
            if (progress > 80) progressText.textContent = '正在优化图片质量...';
        }, 500);

        // 存储interval用于清理
        this.progressInterval = interval;
    }

    /**
     * 隐藏进度
     */
    hideProgress() {
        const progressSection = document.getElementById('progressSection');
        const progressFill = document.getElementById('progressFill');
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        
        progressFill.style.width = '100%';
        setTimeout(() => {
            progressSection.style.display = 'none';
            progressFill.style.width = '0%';
        }, 500);
    }

    /**
     * 隐藏结果
     */
    hideResult() {
        document.getElementById('resultSection').style.display = 'none';
    }

    /**
     * 显示消息
     */
    showMessage(message, type = 'info') {
        const messageArea = document.getElementById('messageArea');
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        messageArea.appendChild(messageEl);
        
        // 自动隐藏成功消息
        if (type === 'success') {
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 3000);
        }

        // 滚动到消息位置
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * 清除所有消息
     */
    clearMessages() {
        document.getElementById('messageArea').innerHTML = '';
    }
}

// 导出类供全局使用
window.ImageGenerator = ImageGenerator;