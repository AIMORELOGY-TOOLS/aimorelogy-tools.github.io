/**
 * AI图片生成模块
 * 基于豆包Seedream 4.0 API
 * 严格按照开发文档框架开发
 */
class ImageGenerator {
    constructor() {
        // 使用开发文档中统一的API地址
        this.apiUrl = 'https://aimorelogy-tools-backstage.jeff010726.workers.dev';
        this.currentUser = null;
        this.isGenerating = false;
        this.currentImageUrl = null;
        this.init();
    }

    async init() {
        console.log('初始化AI图片生成模块...');
        await this.checkLoginStatus();
    }

    async checkLoginStatus() {
        const token = localStorage.getItem('wechat_token');
        
        if (!token) {
            this.showLoginPrompt();
            return;
        }

        try {
            // 使用统一的用户验证接口
            const response = await fetch(`${this.apiUrl}/verify_token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();
            
            if (data.success && data.user) {
                this.currentUser = data.user;
                this.showUserSection();
                await this.updateUsageInfo();
            } else {
                localStorage.removeItem('wechat_token');
                this.showLoginPrompt();
            }
        } catch (error) {
            console.error('验证登录状态失败:', error);
            this.showLoginPrompt();
        }
    }

    showLoginPrompt() {
        document.getElementById('loginPrompt').style.display = 'block';
        document.getElementById('userSection').style.display = 'none';
    }

    showUserSection() {
        document.getElementById('loginPrompt').style.display = 'none';
        document.getElementById('userSection').style.display = 'block';
        
        // 更新用户信息显示
        document.getElementById('userName').textContent = this.currentUser.nickname || '微信用户';
        document.getElementById('userLevel').textContent = this.getLevelText(this.currentUser.level);
    }

    getLevelText(level) {
        const levelMap = {
            'normal': '普通用户',
            'vip': 'VIP用户',
            'svip': 'SVIP用户',
            'admin': '管理员'
        };
        return levelMap[level] || '普通用户';
    }

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

            const data = await response.json();
            
            if (data.success) {
                const imageUsage = data.user.imageUsage || { daily: 0, total: 0 };
                const tokenUsage = data.user.tokenUsage?.image || { daily: 0, total: 0 };
                const dailyLimit = this.getImageLimit(data.user.level);
                const remaining = dailyLimit === -1 ? '无限制' : Math.max(0, dailyLimit - imageUsage.daily);

                // 更新显示
                document.getElementById('dailyUsage').textContent = imageUsage.daily;
                document.getElementById('dailyLimit').textContent = dailyLimit === -1 ? '∞' : dailyLimit;
                document.getElementById('totalImages').textContent = imageUsage.total;
                document.getElementById('remainingToday').textContent = remaining;
                document.getElementById('tokenUsed').textContent = tokenUsage.total;

                // 检查是否还能使用
                if (dailyLimit !== -1 && imageUsage.daily >= dailyLimit) {
                    this.disableGenerator('今日使用次数已达上限');
                }
            }
        } catch (error) {
            console.error('获取使用统计失败:', error);
        }
    }

    getImageLimit(level) {
        const limits = {
            'normal': 3,
            'vip': 10,
            'svip': 20,
            'admin': -1
        };
        return limits[level] || 3;
    }

    disableGenerator(reason) {
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.disabled = true;
        generateBtn.textContent = reason;
        generateBtn.style.background = '#ccc';
    }

    enableGenerator() {
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.disabled = false;
        generateBtn.textContent = '🎨 开始生成图片';
        generateBtn.style.background = '';
    }

    async generateImage() {
        if (this.isGenerating) return;

        const prompt = document.getElementById('promptInput').value.trim();
        const size = document.getElementById('sizeSelect').value;
        const watermark = document.getElementById('watermarkCheck').checked;

        // 验证输入
        if (!prompt) {
            this.showMessage('请输入图片描述', 'warning');
            return;
        }

        if (prompt.length > 600) {
            this.showMessage('图片描述不能超过600个字符', 'warning');
            return;
        }

        // 检查使用限制
        const dailyLimit = this.getImageLimit(this.currentUser.level);
        const currentUsage = parseInt(document.getElementById('dailyUsage').textContent);
        
        if (dailyLimit !== -1 && currentUsage >= dailyLimit) {
            this.showMessage('今日使用次数已达上限', 'warning');
            return;
        }

        this.isGenerating = true;
        this.showProgress();
        this.hideResult();

        try {
            // 调用图片生成API
            const response = await fetch(`${this.apiUrl}/generate_image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: localStorage.getItem('wechat_token'),
                    prompt: prompt,
                    size: size,
                    watermark: watermark
                })
            });

            const data = await response.json();

            if (data.success) {
                this.displayGeneratedImage(data.data);
                await this.updateUsageInfo();
                this.showMessage('图片生成成功！', 'success');
            } else {
                throw new Error(data.message || '图片生成失败');
            }
        } catch (error) {
            console.error('图片生成失败:', error);
            this.showMessage(error.message || '图片生成失败，请稍后重试', 'danger');
        } finally {
            this.isGenerating = false;
            this.hideProgress();
        }
    }

    showProgress() {
        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressContainer.style.display = 'block';
        
        // 模拟进度
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            
            progressFill.style.width = progress + '%';
            
            if (progress < 30) {
                progressText.textContent = '正在处理您的描述...';
            } else if (progress < 60) {
                progressText.textContent = 'AI正在创作中...';
            } else {
                progressText.textContent = '即将完成...';
            }
        }, 500);

        // 保存interval ID以便清理
        this.progressInterval = progressInterval;
    }

    hideProgress() {
        const progressContainer = document.getElementById('progressContainer');
        progressContainer.style.display = 'none';
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        
        // 重置进度
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('progressText').textContent = '准备中...';
    }

    displayGeneratedImage(imageData) {
        const resultContainer = document.getElementById('resultContainer');
        const generatedImage = document.getElementById('generatedImage');
        
        this.currentImageUrl = imageData.imageUrl;
        generatedImage.src = this.currentImageUrl;
        resultContainer.style.display = 'block';
        
        // 滚动到结果区域
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }

    hideResult() {
        document.getElementById('resultContainer').style.display = 'none';
        this.currentImageUrl = null;
    }

    async downloadImage() {
        if (!this.currentImageUrl) {
            this.showMessage('没有可下载的图片', 'warning');
            return;
        }

        try {
            // 创建下载链接
            const link = document.createElement('a');
            link.href = this.currentImageUrl;
            link.download = `ai-generated-image-${Date.now()}.jpg`;
            link.target = '_blank';
            
            // 触发下载
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showMessage('图片下载已开始', 'success');
        } catch (error) {
            console.error('下载失败:', error);
            this.showMessage('下载失败，请右键保存图片', 'warning');
        }
    }

    resetGenerator() {
        // 清空输入
        document.getElementById('promptInput').value = '';
        document.getElementById('charCount').textContent = '0';
        
        // 重置选项
        document.getElementById('sizeSelect').value = '2K';
        document.getElementById('watermarkCheck').checked = true;
        
        // 隐藏结果
        this.hideResult();
        this.hideProgress();
        
        // 重新启用生成按钮
        this.enableGenerator();
        
        this.showMessage('已重置，可以开始新的创作', 'info');
    }

    showMessage(message, type = 'info') {
        // 移除现有的消息
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => {
            if (alert.textContent.includes('💡 使用说明') || alert.textContent.includes('⚠️ 重要提醒')) {
                return; // 保留固定的提示信息
            }
            alert.remove();
        });

        // 创建新消息
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        
        // 添加图标
        const icons = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'danger': '❌'
        };
        
        alertDiv.innerHTML = `${icons[type] || 'ℹ️'} ${message}`;
        
        // 插入到用户区域顶部
        const userSection = document.getElementById('userSection');
        const firstChild = userSection.firstElementChild;
        userSection.insertBefore(alertDiv, firstChild);
        
        // 滚动到消息位置
        alertDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // 3秒后自动移除（除了错误消息）
        if (type !== 'danger') {
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 3000);
        }
    }
}

// 确保类在全局作用域中可用
window.ImageGenerator = ImageGenerator;