// AI图片生成模块
// 基于豆包Seedream 4.0 API的智能图片生成器

class ImageGeneratorModule {
    constructor(options = {}) {
        this.config = {
            apiBaseUrl: 'https://aimorelogybackend.site',
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
                    
                    .generator-header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding: 30px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 20px;
                        color: white;
                    }
                    
                    .generator-title {
                        font-size: 28px;
                        font-weight: 700;
                        margin-bottom: 10px;
                    }
                    
                    .generator-subtitle {
                        font-size: 16px;
                        opacity: 0.9;
                        line-height: 1.6;
                    }
                    
                    .usage-info {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 15px;
                        border-radius: 10px;
                        margin-top: 20px;
                        text-align: center;
                    }
                    
                    .usage-text {
                        font-size: 14px;
                        margin: 0;
                    }
                    
                    .form-container {
                        background: white;
                        border-radius: 20px;
                        padding: 30px;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                        margin-bottom: 30px;
                    }
                    
                    .form-group {
                        margin-bottom: 25px;
                    }
                    
                    .form-label {
                        display: block;
                        font-weight: 600;
                        margin-bottom: 8px;
                        color: #333;
                        font-size: 16px;
                    }
                    
                    .form-input, .form-textarea, .form-select {
                        width: 100%;
                        padding: 15px;
                        border: 2px solid #e1e5e9;
                        border-radius: 12px;
                        font-size: 16px;
                        transition: all 0.3s ease;
                        font-family: inherit;
                        resize: none;
                    }
                    
                    .form-input:focus, .form-textarea:focus, .form-select:focus {
                        outline: none;
                        border-color: #667eea;
                        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    }
                    
                    .form-textarea {
                        min-height: 120px;
                        max-height: 200px;
                        overflow-y: auto;
                    }
                    
                    .form-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                    }
                    
                    .checkbox-group {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-top: 10px;
                    }
                    
                    .checkbox-group input[type="checkbox"] {
                        width: 18px;
                        height: 18px;
                        accent-color: #667eea;
                    }
                    
                    .generate-btn {
                        width: 100%;
                        padding: 18px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        font-size: 18px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .generate-btn:hover:not(:disabled) {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
                    }
                    
                    .generate-btn:disabled {
                        opacity: 0.7;
                        cursor: not-allowed;
                        transform: none;
                    }
                    
                    .btn-loading {
                        display: none;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                    }
                    
                    .loading-spinner {
                        width: 20px;
                        height: 20px;
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        border-top: 2px solid white;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    .result-container {
                        background: white;
                        border-radius: 20px;
                        padding: 30px;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                        margin-top: 30px;
                        display: none;
                        text-align: center;
                    }
                    
                    .result-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        padding-bottom: 15px;
                        border-bottom: 2px solid #f0f0f0;
                    }
                    
                    .result-title {
                        font-size: 20px;
                        font-weight: 600;
                        color: #333;
                    }
                    
                    .generated-image {
                        max-width: 100%;
                        height: auto;
                        border-radius: 15px;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                        margin-bottom: 20px;
                    }
                    
                    .download-btn {
                        padding: 12px 24px;
                        background: linear-gradient(135deg, #28a745, #20c997);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        margin-right: 10px;
                        transition: all 0.2s ease;
                    }
                    
                    .download-btn:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
                    }
                    
                    .reset-btn {
                        padding: 12px 24px;
                        background: #f8f9fa;
                        color: #495057;
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        transition: all 0.2s ease;
                    }
                    
                    .reset-btn:hover {
                        background: #e9ecef;
                        transform: translateY(-1px);
                    }
                    
                    .error-message {
                        background: #fee;
                        color: #c33;
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 15px;
                        display: none;
                    }
                    
                    .success-message {
                        background: #d4edda;
                        color: #155724;
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 15px;
                        display: none;
                    }
                    
                    .warning-message {
                        background: #fff3cd;
                        color: #856404;
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 15px;
                    }
                    
                    .login-prompt {
                        text-align: center;
                        padding: 40px;
                        background: #f8f9fa;
                        border-radius: 15px;
                        color: #666;
                    }
                    
                    .login-prompt-title {
                        font-size: 20px;
                        font-weight: 600;
                        margin-bottom: 10px;
                        color: #333;
                    }
                    
                    @media (max-width: 768px) {
                        .image-generator-module {
                            padding: 15px;
                        }
                        
                        .generator-header {
                            padding: 20px;
                        }
                        
                        .generator-title {
                            font-size: 24px;
                        }
                        
                        .form-container {
                            padding: 20px;
                        }
                        
                        .form-row {
                            grid-template-columns: 1fr;
                        }
                    }
                </style>
                
                <div class="generator-header">
                    <h1 class="generator-title">🎨 AI图片生成器</h1>
                    <p class="generator-subtitle">
                        基于豆包Seedream 4.0模型，将文字描述转化为精美图片<br>
                        支持多种尺寸选择，满足不同创作需求
                    </p>
                    <div style="margin-top: 15px; font-size: 14px; opacity: 0.8;">
                        技术支持：深圳市爱谋科技有限公司
                    </div>
                    <div class="usage-info" id="usage-info">
                        <p class="usage-text">请先登录以查看使用情况</p>
                    </div>
                </div>
                
                <div id="main-content">
                    ${this.currentUser ? this.renderGeneratorForm() : this.renderLoginPrompt()}
                </div>
                
                <div class="result-container" id="result-container">
                    <div class="result-header">
                        <h3 class="result-title">生成结果</h3>
                    </div>
                    <img id="generated-image" class="generated-image" alt="生成的图片">
                    <div>
                        <button class="download-btn" id="download-btn">💾 下载图片</button>
                        <button class="reset-btn" id="reset-btn">🔄 重新生成</button>
                    </div>
                    <div class="warning-message">
                        <strong>⚠️ 重要提醒：</strong>图片链接24小时后将失效，请及时下载保存！
                    </div>
                </div>
                
                <div class="error-message" id="error-message"></div>
                <div class="success-message" id="success-message"></div>
            </div>
        `;
        
        this.updateUsageInfo();
    }

    // 渲染生成器表单
    renderGeneratorForm() {
        return `
            <div class="form-container">
                <div class="form-group">
                    <label class="form-label" for="image-prompt">图片描述</label>
                    <textarea 
                        class="form-textarea" 
                        id="image-prompt" 
                        placeholder="请详细描述您想要生成的图片，例如：一只可爱的橘猫坐在窗台上，阳光透过窗户洒在它身上，温馨的家居环境..."
                        rows="4"
                        maxlength="600"
                    ></textarea>
                    <small style="color: #666; font-size: 12px;">建议不超过300个汉字或600个英文单词</small>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="image-size">图片尺寸</label>
                        <select class="form-select" id="image-size">
                            <option value="1K">1K (1024x1024)</option>
                            <option value="2K" selected>2K (2048x2048)</option>
                            <option value="4K">4K (4096x4096)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">其他设置</label>
                        <div class="checkbox-group">
                            <input type="checkbox" id="watermark" checked>
                            <label for="watermark">添加AI生成水印</label>
                        </div>
                    </div>
                </div>
                
                <button class="generate-btn" id="generate-btn">
                    <span class="btn-text">🎨 开始生成图片</span>
                    <div class="btn-loading" id="btn-loading">
                        <div class="loading-spinner"></div>
                        <span>AI正在创作中...</span>
                    </div>
                </button>
            </div>
        `;
    }

    // 渲染登录提示
    renderLoginPrompt() {
        return `
            <div class="login-prompt">
                <h3 class="login-prompt-title">请先登录</h3>
                <p>使用AI图片生成功能需要先登录您的微信账号</p>
            </div>
        `;
    }

    // 绑定事件
    bindEvents() {
        // 防止重复绑定
        if (this.eventsbound) {
            console.log('事件已绑定，跳过重复绑定');
            return;
        }
        
        console.log('开始绑定图片生成器事件...');
        
        if (!this.container) {
            console.error('容器元素不存在，无法绑定事件');
            return;
        }
        
        // 使用事件委托方式绑定按钮事件
        this.container.removeEventListener('click', this.handleContainerClick);
        this.container.addEventListener('click', this.handleContainerClick.bind(this));
        
        // 直接查找并绑定按钮
        const generateBtn = this.container.querySelector('#generate-btn');
        const downloadBtn = this.container.querySelector('#download-btn');
        const resetBtn = this.container.querySelector('#reset-btn');
        
        console.log('查找按钮结果:', {
            generateBtn: !!generateBtn,
            downloadBtn: !!downloadBtn,
            resetBtn: !!resetBtn
        });
        
        if (generateBtn) {
            generateBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('生成按钮被点击！');
                this.handleGenerate();
                return false;
            };
        }
        
        if (downloadBtn) {
            downloadBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('下载按钮被点击！');
                this.handleDownload();
                return false;
            };
        }
        
        if (resetBtn) {
            resetBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('重置按钮被点击！');
                this.handleReset();
                return false;
            };
        }
        
        // 监听登录状态变化
        document.removeEventListener('wechatLoginStatusChange', this.handleLoginStatusChange);
        document.addEventListener('wechatLoginStatusChange', this.handleLoginStatusChange.bind(this));
        
        // 标记事件已绑定
        this.eventsbound = true;
        console.log('图片生成器事件绑定完成');
    }

    // 容器点击事件处理（事件委托）
    handleContainerClick(event) {
        const target = event.target;
        
        if (target.id === 'generate-btn' || target.closest('#generate-btn')) {
            event.preventDefault();
            event.stopPropagation();
            console.log('生成按钮被点击！- 事件委托方式');
            this.handleGenerate();
            return false;
        }
        
        if (target.id === 'download-btn' || target.closest('#download-btn')) {
            event.preventDefault();
            event.stopPropagation();
            console.log('下载按钮被点击！- 事件委托方式');
            this.handleDownload();
            return false;
        }
        
        if (target.id === 'reset-btn' || target.closest('#reset-btn')) {
            event.preventDefault();
            event.stopPropagation();
            console.log('重置按钮被点击！- 事件委托方式');
            this.handleReset();
            return false;
        }
    }

    // 登录状态变化处理
    handleLoginStatusChange(event) {
        const { isLoggedIn, userData } = event.detail;
        console.log('图片生成器：登录状态变化:', isLoggedIn, userData);
        
        if (isLoggedIn) {
            this.setCurrentUser(userData);
        } else {
            this.setCurrentUser(null);
        }
        
        this.renderInterface();
        
        if (!this.eventsbound) {
            setTimeout(() => {
                this.bindEvents();
            }, 100);
        }
    }

    // 更新使用情况显示
    updateUsageInfo() {
        const usageInfo = this.container.querySelector('#usage-info');
        if (!usageInfo || !this.currentUser) return;
        
        const userLevel = this.currentUser.level || 'normal';
        const limits = this.usageLimits[userLevel];
        const dailyUsage = this.currentUser.imageUsage?.daily || 0;
        
        const limitText = limits.daily === -1 ? '无限制' : limits.daily;
        
        usageInfo.innerHTML = `
            <p class="usage-text">
                ${limits.name} | 今日已使用: ${dailyUsage}/${limitText} 次
            </p>
        `;
    }

    // 处理生成图片
    async handleGenerate() {
        console.log('handleGenerate 被调用');
        console.log('当前用户:', this.currentUser);
        console.log('是否正在生成:', this.isGenerating);
        
        if (!this.currentUser) {
            console.log('用户未登录，显示错误');
            this.showError('请先登录');
            return;
        }
        
        if (this.isGenerating) {
            console.log('正在生成中，忽略请求');
            return;
        }
        
        // 检查使用权限
        const permission = this.checkUsagePermission();
        if (!permission.allowed) {
            this.showError(permission.reason);
            return;
        }
        
        // 获取表单数据
        const prompt = this.container.querySelector('#image-prompt')?.value?.trim();
        const size = this.container.querySelector('#image-size')?.value || '2K';
        const watermarkElement = this.container.querySelector('#watermark');
        const watermark = watermarkElement ? watermarkElement.checked : true;
        
        if (!prompt) {
            this.showError('请输入图片描述');
            return;
        }
        
        if (prompt.length > 600) {
            this.showError('图片描述不能超过600个字符');
            return;
        }
        
        try {
            this.setGeneratingState(true);
            this.hideError();
            this.hideSuccess();
            this.hideResult();
            
            await this.generateImage(prompt, size, watermark);
            
        } catch (error) {
            console.error('生成图片失败:', error);
            this.showError(error.message || '生成失败，请重试');
        } finally {
            this.setGeneratingState(false);
        }
    }

    // 检查使用权限
    checkUsagePermission() {
        if (!this.currentUser) {
            return { allowed: false, reason: '请先登录' };
        }
        
        const userLevel = this.currentUser.level || 'normal';
        const limits = this.usageLimits[userLevel];
        const dailyUsage = this.currentUser.imageUsage?.daily || 0;
        
        if (limits.daily !== -1 && dailyUsage >= limits.daily) {
            return { allowed: false, reason: `今日使用次数已达上限（${limits.daily}次）` };
        }
        
        return { allowed: true };
    }

    // 生成图片
    async generateImage(prompt, size, watermark) {
        console.log('开始生成图片:', { prompt, size, watermark });
        
        const requestBody = {
            token: this.currentUser.token,
            prompt: prompt,
            size: size,
            watermark: watermark
        };
        
        console.log('请求体:', requestBody);
        console.log('API地址:', `${this.config.apiBaseUrl}/generate_image`);
        
        const response = await fetch(`${this.config.apiBaseUrl}/generate_image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.currentUser.token}`
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('响应状态:', response.status);
        
        const data = await response.json();
        console.log('响应数据:', data);
        
        if (data.success) {
            // 根据后端返回的数据结构调整
            const imageUrl = data.data?.url || data.imageUrl;
            const tokenConsumed = data.data?.tokenConsumed || data.tokenConsumed || 0;
            
            this.displayResult(imageUrl, tokenConsumed);
            // 注意：后端已经更新了使用次数，前端不需要重复更新
            // 重新获取用户统计信息以更新显示
            await this.refreshUserStats();
            this.showSuccess('图片生成成功！');
        } else {
            throw new Error(data.error || data.message || '图片生成失败');
        }
    }

    // 显示生成结果
    displayResult(imageUrl, tokenConsumed) {
        console.log('displayResult被调用，参数:', { imageUrl, tokenConsumed });
        
        this.currentImageUrl = imageUrl;
        
        const resultContainer = this.container.querySelector('#result-container');
        const generatedImage = this.container.querySelector('#generated-image');
        
        console.log('找到的DOM元素:', { 
            resultContainer: !!resultContainer, 
            generatedImage: !!generatedImage 
        });
        
        if (generatedImage && imageUrl) {
            console.log('设置图片src:', imageUrl);
            generatedImage.src = imageUrl;
            generatedImage.onload = () => {
                console.log('图片加载成功');
            };
            generatedImage.onerror = (error) => {
                console.error('图片加载失败:', error);
            };
        } else {
            console.error('无法设置图片:', { generatedImage: !!generatedImage, imageUrl });
        }
        
        if (resultContainer) {
            resultContainer.style.display = 'block';
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        }
        
        console.log('图片生成完成，Token消耗:', tokenConsumed);
    }

    // 注意：updateUsageCount 方法已删除，因为后端在 handleGenerateImage 中已经处理了使用次数更新
    // 避免重复计数问题

    // 刷新用户统计信息
    async refreshUserStats() {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/get_user_stats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: this.currentUser.token })
            });

            const data = await response.json();
            if (data.success) {
                // 更新本地用户信息
                this.currentUser.imageUsage = data.data.imageUsage;
                this.updateUsageInfo();
            }
        } catch (error) {
            console.error('刷新用户统计失败:', error);
        }
    }

    // 处理下载
    async handleDownload() {
        if (!this.currentImageUrl) {
            this.showError('没有可下载的图片');
            return;
        }

        try {
            const link = document.createElement('a');
            link.href = this.currentImageUrl;
            link.download = `ai-generated-image-${Date.now()}.jpg`;
            link.target = '_blank';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('图片下载已开始');
        } catch (error) {
            console.error('下载失败:', error);
            this.showError('下载失败，请右键保存图片');
        }
    }

    // 处理重置
    handleReset() {
        // 清空表单
        const promptInput = this.container.querySelector('#image-prompt');
        const sizeSelect = this.container.querySelector('#image-size');
        const watermarkCheck = this.container.querySelector('#watermark');
        
        if (promptInput) promptInput.value = '';
        if (sizeSelect) sizeSelect.value = '2K';
        if (watermarkCheck) watermarkCheck.checked = true;
        
        // 隐藏结果
        this.hideResult();
        this.hideError();
        this.hideSuccess();
        
        this.currentImageUrl = null;
    }

    // 设置生成状态
    setGeneratingState(isGenerating) {
        this.isGenerating = isGenerating;
        
        const generateBtn = this.container.querySelector('#generate-btn');
        const btnText = this.container.querySelector('.btn-text');
        const btnLoading = this.container.querySelector('#btn-loading');
        
        if (generateBtn && btnText && btnLoading) {
            generateBtn.disabled = isGenerating;
            
            if (isGenerating) {
                btnText.style.display = 'none';
                btnLoading.style.display = 'flex';
            } else {
                btnText.style.display = 'block';
                btnLoading.style.display = 'none';
            }
        }
    }

    // 显示结果
    showResult() {
        const resultContainer = this.container.querySelector('#result-container');
        if (resultContainer) {
            resultContainer.style.display = 'block';
        }
    }

    // 隐藏结果
    hideResult() {
        const resultContainer = this.container.querySelector('#result-container');
        if (resultContainer) {
            resultContainer.style.display = 'none';
        }
    }

    // 显示错误
    showError(message) {
        const errorElement = this.container.querySelector('#error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    // 隐藏错误
    hideError() {
        const errorElement = this.container.querySelector('#error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    // 显示成功消息
    showSuccess(message) {
        const successElement = this.container.querySelector('#success-message');
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
            
            // 3秒后自动隐藏
            setTimeout(() => {
                this.hideSuccess();
            }, 3000);
        }
    }

    // 隐藏成功消息
    hideSuccess() {
        const successElement = this.container.querySelector('#success-message');
        if (successElement) {
            successElement.style.display = 'none';
        }
    }
}

// 导出模块
window.ImageGeneratorModule = ImageGeneratorModule;