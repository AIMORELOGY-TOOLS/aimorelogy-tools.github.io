// AI图片生成模块
// 基于豆包Seedream 4.0 API的智能图片生成器

class ImageGeneratorModule {
    constructor(options = {}) {
        this.config = {
            apiBaseUrl: 'https://aimorelogy-tools-backstage.jeff010726.workers.dev',
            ...options
        };
        
        this.currentUser = null;
        this.isGenerating = false;
        this.currentImageUrl = null;
        
        // 使用限制配置
        this.usageLimits = {
            'normal': { daily: 3, name: '普通用户' },
            'vip': { daily: 10, name: 'VIP用户' },
            'svip': { daily: 20, name: 'SVIP用户' },
            'admin': { daily: -1, name: '管理员' }
        };
    }

    // 设置当前用户
    setCurrentUser(user) {
        this.currentUser = user;
    }

    // 渲染模块界面
    render(container) {
        if (!container) {
            console.error('容器元素不存在');
            return;
        }

        this.container = container;
        this.renderInterface();
        
        // 使用 setTimeout 确保 DOM 更新完成后再绑定事件
        setTimeout(() => {
            this.bindEvents();
        }, 0);
    }

    // 渲染界面
    renderInterface() {
        this.container.innerHTML = `
            <div class="image-generator-module">
                <style>
                    .image-generator-module {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    
                    .module-header {
                        text-align: center;
                        margin-bottom: 40px;
                        padding: 40px 20px;
                        background: rgba(255, 255, 255, 0.95);
                        backdrop-filter: blur(10px);
                        border-radius: 20px;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    }
                    
                    .module-title {
                        font-size: 2.5rem;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        margin-bottom: 10px;
                        font-weight: 700;
                    }
                    
                    .module-subtitle {
                        font-size: 1.2rem;
                        color: #666;
                        margin-bottom: 20px;
                    }
                    
                    .feature-tags {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        flex-wrap: wrap;
                    }
                    
                    .feature-tag {
                        background: rgba(102, 126, 234, 0.1);
                        color: #667eea;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-size: 0.9rem;
                        font-weight: 500;
                    }
                    
                    .login-prompt {
                        text-align: center;
                        padding: 60px 20px;
                        background: rgba(255, 255, 255, 0.95);
                        backdrop-filter: blur(10px);
                        border-radius: 20px;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    }
                    
                    .login-prompt h2 {
                        color: #667eea;
                        margin-bottom: 20px;
                        font-size: 1.8rem;
                    }
                    
                    .login-prompt p {
                        color: #666;
                        margin-bottom: 30px;
                        font-size: 1.1rem;
                    }
                    
                    .generator-interface {
                        background: rgba(255, 255, 255, 0.95);
                        backdrop-filter: blur(10px);
                        border-radius: 20px;
                        padding: 40px;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    }
                    
                    .user-info {
                        background: rgba(102, 126, 234, 0.1);
                        border-radius: 15px;
                        padding: 20px;
                        margin-bottom: 30px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 15px;
                    }
                    
                    .user-details h3 {
                        color: #667eea;
                        margin-bottom: 5px;
                    }
                    
                    .user-details p {
                        color: #666;
                        font-size: 0.9rem;
                    }
                    
                    .usage-stats {
                        display: flex;
                        gap: 20px;
                        flex-wrap: wrap;
                    }
                    
                    .stat-item {
                        text-align: center;
                        background: white;
                        padding: 15px;
                        border-radius: 10px;
                        min-width: 100px;
                    }
                    
                    .stat-number {
                        font-size: 1.5rem;
                        font-weight: bold;
                        color: #667eea;
                    }
                    
                    .stat-label {
                        font-size: 0.8rem;
                        color: #666;
                        margin-top: 5px;
                    }
                    
                    .form-group {
                        margin-bottom: 25px;
                    }
                    
                    .form-group label {
                        display: block;
                        margin-bottom: 8px;
                        font-weight: 600;
                        color: #333;
                    }
                    
                    .form-group textarea {
                        width: 100%;
                        padding: 15px;
                        border: 2px solid #e1e5e9;
                        border-radius: 10px;
                        font-size: 1rem;
                        resize: vertical;
                        min-height: 120px;
                        transition: border-color 0.3s ease;
                        font-family: inherit;
                    }
                    
                    .form-group textarea:focus {
                        outline: none;
                        border-color: #667eea;
                    }
                    
                    .form-row {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 20px;
                    }
                    
                    .form-group select {
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e1e5e9;
                        border-radius: 10px;
                        font-size: 1rem;
                        background: white;
                        transition: border-color 0.3s ease;
                    }
                    
                    .form-group select:focus {
                        outline: none;
                        border-color: #667eea;
                    }
                    
                    .checkbox-group {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    .checkbox-group input[type="checkbox"] {
                        width: 18px;
                        height: 18px;
                        accent-color: #667eea;
                    }
                    
                    .btn {
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 25px;
                        font-size: 1.1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        width: 100%;
                        margin-top: 10px;
                    }
                    
                    .btn:hover:not(:disabled) {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                    }
                    
                    .btn:disabled {
                        background: #ccc;
                        cursor: not-allowed;
                        transform: none;
                    }
                    
                    .progress-container {
                        display: none;
                        background: rgba(102, 126, 234, 0.1);
                        border-radius: 15px;
                        padding: 20px;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    
                    .progress-bar {
                        width: 100%;
                        height: 8px;
                        background: #e1e5e9;
                        border-radius: 4px;
                        overflow: hidden;
                        margin: 15px 0;
                    }
                    
                    .progress-fill {
                        height: 100%;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        width: 0%;
                        transition: width 0.3s ease;
                        border-radius: 4px;
                    }
                    
                    .result-container {
                        display: none;
                        background: rgba(102, 126, 234, 0.05);
                        border-radius: 15px;
                        padding: 30px;
                        text-align: center;
                        margin-top: 20px;
                    }
                    
                    .generated-image {
                        max-width: 100%;
                        height: auto;
                        border-radius: 15px;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                        margin-bottom: 20px;
                    }
                    
                    .download-btn {
                        background: linear-gradient(135deg, #28a745, #20c997);
                        margin-right: 10px;
                    }
                    
                    .download-btn:hover {
                        box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
                    }
                    
                    .alert {
                        padding: 15px;
                        border-radius: 10px;
                        margin-bottom: 20px;
                        font-weight: 500;
                    }
                    
                    .alert-info {
                        background: rgba(23, 162, 184, 0.1);
                        color: #17a2b8;
                        border: 1px solid rgba(23, 162, 184, 0.2);
                    }
                    
                    .alert-warning {
                        background: rgba(255, 193, 7, 0.1);
                        color: #856404;
                        border: 1px solid rgba(255, 193, 7, 0.2);
                    }
                    
                    .alert-danger {
                        background: rgba(220, 53, 69, 0.1);
                        color: #721c24;
                        border: 1px solid rgba(220, 53, 69, 0.2);
                    }
                    
                    .alert-success {
                        background: rgba(40, 167, 69, 0.1);
                        color: #155724;
                        border: 1px solid rgba(40, 167, 69, 0.2);
                    }
                    
                    @media (max-width: 768px) {
                        .image-generator-module {
                            padding: 15px;
                        }
                        
                        .module-title {
                            font-size: 2rem;
                        }
                        
                        .generator-interface {
                            padding: 25px;
                        }
                        
                        .user-info {
                            flex-direction: column;
                            text-align: center;
                        }
                        
                        .usage-stats {
                            justify-content: center;
                        }
                        
                        .form-row {
                            grid-template-columns: 1fr;
                        }
                    }
                </style>
                
                <!-- 模块头部 -->
                <div class="module-header">
                    <h1 class="module-title">🎨 AI图片生成</h1>
                    <p class="module-subtitle">基于豆包Seedream 4.0模型，将文字描述转化为精美图片</p>
                    <div class="feature-tags">
                        <span class="feature-tag">🚀 豆包Seedream 4.0</span>
                        <span class="feature-tag">📐 多种尺寸</span>
                        <span class="feature-tag">⚡ 快速生成</span>
                        <span class="feature-tag">🎯 精准描述</span>
                    </div>
                </div>
                
                ${this.currentUser ? this.renderGeneratorInterface() : this.renderLoginPrompt()}
            </div>
        `;
    }

    // 渲染登录提示
    renderLoginPrompt() {
        return `
            <div class="login-prompt">
                <h2>🔐 请先登录</h2>
                <p>使用AI图片生成功能需要先进行微信登录验证</p>
                <p style="color: #999; font-size: 0.9rem;">登录后即可享受智能图片生成服务</p>
            </div>
        `;
    }

    // 渲染生成器界面
    renderGeneratorInterface() {
        const userLevel = this.currentUser.level || 'normal';
        const levelInfo = this.usageLimits[userLevel];
        const dailyUsage = this.currentUser.imageUsage?.daily || 0;
        const totalUsage = this.currentUser.imageUsage?.total || 0;
        const tokenUsage = this.currentUser.tokenUsage?.image?.total || 0;
        const dailyLimit = levelInfo.daily;
        const remaining = dailyLimit === -1 ? '无限制' : Math.max(0, dailyLimit - dailyUsage);

        return `
            <div class="generator-interface">
                <!-- 用户信息 -->
                <div class="user-info">
                    <div class="user-details">
                        <h3>${this.currentUser.nickname || '微信用户'}</h3>
                        <p>等级：${levelInfo.name} | 今日图片生成：${dailyUsage}/${dailyLimit === -1 ? '∞' : dailyLimit}</p>
                    </div>
                    <div class="usage-stats">
                        <div class="stat-item">
                            <div class="stat-number">${totalUsage}</div>
                            <div class="stat-label">总生成数</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${remaining}</div>
                            <div class="stat-label">今日剩余</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${tokenUsage}</div>
                            <div class="stat-label">Token消耗</div>
                        </div>
                    </div>
                </div>

                <!-- 功能说明 -->
                <div class="alert alert-info">
                    <strong>💡 使用说明：</strong>
                    <br>• 支持中英文描述，建议不超过300个汉字
                    <br>• 支持1K、2K、4K三种分辨率
                    <br>• 生成的图片24小时内有效，请及时下载
                    <br>• 不同等级用户每日使用次数不同
                </div>

                <!-- 生成表单 -->
                <div class="form-group">
                    <label for="promptInput">🖼️ 图片描述</label>
                    <textarea 
                        id="promptInput" 
                        placeholder="请详细描述您想要生成的图片，例如：一只可爱的橘猫坐在窗台上，阳光透过窗户洒在它身上，温馨的家居环境"
                        maxlength="600"
                    ></textarea>
                    <small style="color: #666;">字符数：<span id="charCount">0</span>/600</small>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="sizeSelect">📐 图片尺寸</label>
                        <select id="sizeSelect">
                            <option value="1K">1K (1024x1024)</option>
                            <option value="2K" selected>2K (2048x2048)</option>
                            <option value="4K">4K (4096x4096)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>⚙️ 其他设置</label>
                        <div class="checkbox-group">
                            <input type="checkbox" id="watermarkCheck" checked>
                            <label for="watermarkCheck">添加AI生成水印</label>
                        </div>
                    </div>
                </div>

                <button id="generateBtn" class="btn">
                    🎨 开始生成图片
                </button>

                <!-- 生成进度 -->
                <div id="progressContainer" class="progress-container">
                    <h3>🔄 正在生成图片...</h3>
                    <div class="progress-bar">
                        <div id="progressFill" class="progress-fill"></div>
                    </div>
                    <p id="progressText">准备中...</p>
                </div>

                <!-- 生成结果 -->
                <div id="resultContainer" class="result-container">
                    <h3>✅ 图片生成成功！</h3>
                    <img id="generatedImage" class="generated-image" alt="生成的图片">
                    <div>
                        <button id="downloadBtn" class="btn download-btn">
                            💾 下载图片
                        </button>
                        <button id="resetBtn" class="btn">
                            🔄 重新生成
                        </button>
                    </div>
                    <div class="alert alert-warning" style="margin-top: 20px;">
                        <strong>⚠️ 重要提醒：</strong>图片链接24小时后将失效，请及时下载保存！
                    </div>
                </div>
            </div>
        `;
    }

    // 绑定事件
    bindEvents() {
        // 字符计数
        const promptInput = this.container.querySelector('#promptInput');
        const charCount = this.container.querySelector('#charCount');
        
        if (promptInput && charCount) {
            promptInput.addEventListener('input', () => {
                const count = promptInput.value.length;
                charCount.textContent = count;
                
                if (count > 500) {
                    promptInput.style.borderColor = '#ffc107';
                } else {
                    promptInput.style.borderColor = '#e1e5e9';
                }
            });
        }

        // 生成按钮
        const generateBtn = this.container.querySelector('#generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateImage());
        }

        // 下载按钮
        const downloadBtn = this.container.querySelector('#downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadImage());
        }

        // 重置按钮
        const resetBtn = this.container.querySelector('#resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGenerator());
        }
    }

    // 生成图片
    async generateImage() {
        if (this.isGenerating || !this.currentUser) return;

        const promptInput = this.container.querySelector('#promptInput');
        const sizeSelect = this.container.querySelector('#sizeSelect');
        const watermarkCheck = this.container.querySelector('#watermarkCheck');

        const prompt = promptInput.value.trim();
        const size = sizeSelect.value;
        const watermark = watermarkCheck.checked;

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
        const userLevel = this.currentUser.level || 'normal';
        const dailyLimit = this.usageLimits[userLevel].daily;
        const currentUsage = this.currentUser.imageUsage?.daily || 0;
        
        if (dailyLimit !== -1 && currentUsage >= dailyLimit) {
            this.showMessage('今日使用次数已达上限', 'warning');
            return;
        }

        this.isGenerating = true;
        this.showProgress();
        this.hideResult();

        try {
            // 调用图片生成API
            const response = await fetch(`${this.config.apiBaseUrl}/generate_image`, {
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
                this.updateUserUsage(data.usage);
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

    // 显示进度
    showProgress() {
        const progressContainer = this.container.querySelector('#progressContainer');
        const progressFill = this.container.querySelector('#progressFill');
        const progressText = this.container.querySelector('#progressText');
        
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
        
        // 模拟进度
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            
            if (progressFill) {
                progressFill.style.width = progress + '%';
            }
            
            if (progressText) {
                if (progress < 30) {
                    progressText.textContent = '正在处理您的描述...';
                } else if (progress < 60) {
                    progressText.textContent = 'AI正在创作中...';
                } else {
                    progressText.textContent = '即将完成...';
                }
            }
        }, 500);

        // 保存interval ID以便清理
        this.progressInterval = progressInterval;
    }

    // 隐藏进度
    hideProgress() {
        const progressContainer = this.container.querySelector('#progressContainer');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        
        // 重置进度
        const progressFill = this.container.querySelector('#progressFill');
        const progressText = this.container.querySelector('#progressText');
        
        if (progressFill) {
            progressFill.style.width = '0%';
        }
        
        if (progressText) {
            progressText.textContent = '准备中...';
        }
    }

    // 显示生成结果
    displayGeneratedImage(imageData) {
        const resultContainer = this.container.querySelector('#resultContainer');
        const generatedImage = this.container.querySelector('#generatedImage');
        
        this.currentImageUrl = imageData.imageUrl;
        
        if (generatedImage) {
            generatedImage.src = this.currentImageUrl;
        }
        
        if (resultContainer) {
            resultContainer.style.display = 'block';
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // 隐藏结果
    hideResult() {
        const resultContainer = this.container.querySelector('#resultContainer');
        if (resultContainer) {
            resultContainer.style.display = 'none';
        }
        this.currentImageUrl = null;
    }

    // 下载图片
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

    // 重置生成器
    resetGenerator() {
        // 清空输入
        const promptInput = this.container.querySelector('#promptInput');
        const charCount = this.container.querySelector('#charCount');
        const sizeSelect = this.container.querySelector('#sizeSelect');
        const watermarkCheck = this.container.querySelector('#watermarkCheck');
        
        if (promptInput) {
            promptInput.value = '';
            promptInput.style.borderColor = '#e1e5e9';
        }
        
        if (charCount) {
            charCount.textContent = '0';
        }
        
        if (sizeSelect) {
            sizeSelect.value = '2K';
        }
        
        if (watermarkCheck) {
            watermarkCheck.checked = true;
        }
        
        // 隐藏结果
        this.hideResult();
        this.hideProgress();
        
        this.showMessage('已重置，可以开始新的创作', 'info');
    }

    // 更新用户使用情况
    updateUserUsage(usage) {
        if (this.currentUser && usage) {
            // 更新本地用户数据
            if (!this.currentUser.imageUsage) {
                this.currentUser.imageUsage = {};
            }
            
            this.currentUser.imageUsage.daily = usage.daily;
            this.currentUser.imageUsage.total = usage.total;
            
            // 重新渲染界面以更新统计信息
            this.renderInterface();
            
            // 延迟绑定事件
            setTimeout(() => {
                this.bindEvents();
            }, 0);
        }
    }

    // 显示消息
    showMessage(message, type = 'info') {
        // 移除现有的消息
        const existingAlerts = this.container.querySelectorAll('.alert:not(.alert-info)');
        existingAlerts.forEach(alert => {
            if (!alert.textContent.includes('💡 使用说明') && !alert.textContent.includes('⚠️ 重要提醒')) {
                alert.remove();
            }
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
        
        // 插入到生成器界面顶部
        const generatorInterface = this.container.querySelector('.generator-interface');
        if (generatorInterface) {
            const firstChild = generatorInterface.firstElementChild;
            generatorInterface.insertBefore(alertDiv, firstChild);
            
            // 滚动到消息位置
            alertDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
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
window.ImageGeneratorModule = ImageGeneratorModule;