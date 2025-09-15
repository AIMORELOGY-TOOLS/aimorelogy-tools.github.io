// 公众号爆文生成模块
// 基于 DeepSeek API 的智能文章生成器

class ArticleGeneratorModule {
    constructor(options = {}) {
        this.config = {
            apiBaseUrl: 'https://aimorelogybackend.site',
            deepseekApiKey: 'sk-bfb1a4a3455940aa97488e61bf6ee924',
            deepseekBaseUrl: 'https://api.deepseek.com/v1',
            model: 'deepseek-chat',
            ...options
        };
        
        this.currentUser = null;
        this.isGenerating = false;
        this.abortController = null;
        
        // 使用限制配置
        this.usageLimits = {
            'normal': { daily: 10, name: '普通用户' },
            'vip': { daily: 30, name: 'VIP用户' },
            'svip': { daily: 100, name: 'SVIP用户' },
            'admin': { daily: -1, name: '管理员' }
        };
        
        // 内置提示词模板
        this.systemPrompt = `你是一个专业的公众号爆文写手，擅长创作引人入胜的文章。

写作要求：
• 标题要敢拍桌子，但正文一定要有货。
• 行文像闲聊，不要一板一眼。
• 保持一点点中年人的"丧"感和幽默感，亲近但不油腻。语气自然。
• 内容层次分明，每一节展开要自然，有事实
• 行文以连贯自然的叙事为主，关键的信息用数字列表（如1.2.3），多用顺滑的长段落推进思路。
• 节奏控制得当，既有硬核干货，又有情绪渲染，但情绪不过界，点到为止。
• 适当穿插冷知识、行业内幕、历史故事，让读者在阅读过程中不断产生"原来如此"的满足感。
• 最后总结要克制收束，避免高举高打，用真实而冷静的话收尾。

格式要求：
• 不要使用Markdown格式，不要出现##、**、*等标记符号
• 逻辑严谨，事实准确，专业而通俗，兼具行业内行和普通读者的双重可读性
• 关键信息用数字列表，不用特殊符号或Emoji
• 字数控制在##MIN_WORDS##-##MAX_WORDS##字之间
• 直接输出纯文本内容，可以有换行和段落，但不要有格式标记`;
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
            <div class="article-generator-module">
                <style>
                    .article-generator-module {
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
                    
                    .form-input, .form-textarea {
                        width: 100%;
                        padding: 15px;
                        border: 2px solid #e1e5e9;
                        border-radius: 12px;
                        font-size: 16px;
                        transition: all 0.3s ease;
                        font-family: inherit;
                        resize: none;
                    }
                    
                    .form-input:focus, .form-textarea:focus {
                        outline: none;
                        border-color: #667eea;
                        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    }
                    
                    .form-textarea {
                        min-height: 120px;
                        max-height: 200px;
                        overflow-y: auto;
                    }
                    
                    .word-count-group {
                        display: grid;
                        grid-template-columns: 1fr auto 1fr;
                        gap: 15px;
                        align-items: center;
                    }
                    
                    .word-count-separator {
                        font-weight: 600;
                        color: #666;
                        text-align: center;
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
                    
                    .copy-btn {
                        padding: 8px 16px;
                        background: #f8f9fa;
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.2s ease;
                    }
                    
                    .copy-btn:hover {
                        background: #e9ecef;
                    }
                    
                    .result-content {
                        line-height: 1.8;
                        font-size: 16px;
                        color: #333;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                    
                    .error-message {
                        background: #fee;
                        color: #c33;
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 15px;
                        display: none;
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
                        .article-generator-module {
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
                        
                        .word-count-group {
                            grid-template-columns: 1fr;
                            gap: 10px;
                        }
                        
                        .word-count-separator {
                            order: 2;
                        }
                    }
                </style>
                
                <div class="generator-header">
                    <h1 class="generator-title">AI 公众号爆文生成器</h1>
                    <p class="generator-subtitle">
                        基于 DeepSeek 大模型，智能生成高质量文章内容<br>
                        支持多种文体风格，满足不同创作需求
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
                        <button class="copy-btn" id="copy-btn">复制文章</button>
                    </div>
                    <div class="result-content" id="result-content"></div>
                </div>
                
                <div class="error-message" id="error-message"></div>
            </div>
        `;
        
        this.updateUsageInfo();
    }

    // 渲染生成器表单
    renderGeneratorForm() {
        return `
            <div class="form-container">
                <div class="form-group">
                    <label class="form-label" for="article-topic">文章主题/内容</label>
                    <textarea 
                        class="form-textarea" 
                        id="article-topic" 
                        placeholder="请输入您想要创作的文章主题或核心内容，例如：人工智能对传统行业的影响、如何提高工作效率、创业路上的那些坑..."
                        rows="4"
                    ></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="reference-article">参考文章（可选）</label>
                    <textarea 
                        class="form-textarea" 
                        id="reference-article" 
                        placeholder="可以粘贴相关的参考文章、资料或链接，帮助AI更好地理解您的需求和风格偏好..."
                        rows="4"
                    ></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">字数限制</label>
                    <div class="word-count-group">
                        <input 
                            type="number" 
                            class="form-input" 
                            id="min-words" 
                            placeholder="最少字数" 
                            min="100" 
                            max="10000" 
                            value="800"
                        >
                        <span class="word-count-separator">到</span>
                        <input 
                            type="number" 
                            class="form-input" 
                            id="max-words" 
                            placeholder="最多字数" 
                            min="200" 
                            max="20000" 
                            value="1500"
                        >
                    </div>
                </div>
                
                <button class="generate-btn" id="generate-btn">
                    <span class="btn-text">开始生成爆文</span>
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
                <p>使用AI爆文生成功能需要先登录您的微信账号</p>
            </div>
        `;
    }

    // 绑定事件
    bindEvents() {
        console.log('开始绑定事件...');
        console.log('容器元素:', this.container);
        
        if (!this.container) {
            console.error('容器元素不存在，无法绑定事件');
            return;
        }
        
        // 使用事件委托方式绑定按钮事件，避免DOM更新后事件丢失
        this.container.removeEventListener('click', this.handleContainerClick);
        this.container.addEventListener('click', this.handleContainerClick.bind(this));
        
        // 直接查找并绑定按钮（作为备用方案）
        const generateBtn = this.container.querySelector('#generate-btn');
        const copyBtn = this.container.querySelector('#copy-btn');
        
        console.log('查找按钮结果:', {
            generateBtn: !!generateBtn,
            copyBtn: !!copyBtn,
            allButtons: this.container.querySelectorAll('button').length
        });
        
        if (generateBtn) {
            console.log('绑定生成按钮点击事件');
            // 移除旧的事件监听器
            generateBtn.replaceWith(generateBtn.cloneNode(true));
            const newGenerateBtn = this.container.querySelector('#generate-btn');
            
            newGenerateBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('生成按钮被点击！- onclick方式');
                this.handleGenerate();
                return false;
            };
        } else {
            console.error('未找到生成按钮 (#generate-btn)');
        }
        
        if (copyBtn) {
            console.log('绑定复制按钮点击事件');
            // 移除旧的事件监听器
            copyBtn.replaceWith(copyBtn.cloneNode(true));
            const newCopyBtn = this.container.querySelector('#copy-btn');
            
            newCopyBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('复制按钮被点击！- onclick方式');
                this.handleCopy();
                return false;
            };
        }
        
        // 监听登录状态变化
        document.removeEventListener('wechatLoginStatusChange', this.handleLoginStatusChange);
        document.addEventListener('wechatLoginStatusChange', this.handleLoginStatusChange.bind(this));
    }

    // 容器点击事件处理（事件委托）
    handleContainerClick(event) {
        const target = event.target;
        
        // 检查是否点击了生成按钮或其子元素
        if (target.id === 'generate-btn' || target.closest('#generate-btn')) {
            event.preventDefault();
            event.stopPropagation();
            console.log('生成按钮被点击！- 事件委托方式');
            this.handleGenerate();
            return false;
        }
        
        // 检查是否点击了复制按钮或其子元素
        if (target.id === 'copy-btn' || target.closest('#copy-btn')) {
            event.preventDefault();
            event.stopPropagation();
            console.log('复制按钮被点击！- 事件委托方式');
            this.handleCopy();
            return false;
        }
    }

    // 登录状态变化处理
    handleLoginStatusChange(event) {
        const { isLoggedIn, userData } = event.detail;
        console.log('登录状态变化:', isLoggedIn, userData);
        
        if (isLoggedIn) {
            this.setCurrentUser(userData);
        } else {
            this.setCurrentUser(null);
        }
        
        this.renderInterface();
        
        // 重新绑定事件
        setTimeout(() => {
            this.bindEvents();
        }, 100);
    }

    // 更新使用情况显示
    updateUsageInfo() {
        const usageInfo = this.container.querySelector('#usage-info');
        if (!usageInfo || !this.currentUser) return;
        
        const userLevel = this.currentUser.level || 'normal';
        const limits = this.usageLimits[userLevel];
        const dailyUsage = this.currentUser.articleUsage?.daily || 0;
        
        const limitText = limits.daily === -1 ? '无限制' : limits.daily;
        
        usageInfo.innerHTML = `
            <p class="usage-text">
                ${limits.name} | 今日已使用: ${dailyUsage}/${limitText} 次
            </p>
        `;
    }

    // 处理生成文章
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
        console.log('开始检查使用权限...');
        const permission = this.checkUsagePermission();
        console.log('权限检查结果:', permission);
        
        if (!permission.allowed) {
            console.log('权限不足，显示错误:', permission.reason);
            this.showError(permission.reason);
            return;
        }
        
        // 获取表单数据
        const topic = this.container.querySelector('#article-topic')?.value?.trim();
        const reference = this.container.querySelector('#reference-article')?.value?.trim();
        const minWords = parseInt(this.container.querySelector('#min-words')?.value) || 800;
        const maxWords = parseInt(this.container.querySelector('#max-words')?.value) || 1500;
        
        if (!topic) {
            this.showError('请输入文章主题或内容');
            return;
        }
        
        if (minWords >= maxWords) {
            this.showError('最少字数不能大于或等于最多字数');
            return;
        }
        
        try {
            this.setGeneratingState(true);
            this.hideError();
            this.hideResult();
            
            await this.generateArticle(topic, reference, minWords, maxWords);
            
        } catch (error) {
            console.error('生成文章失败:', error);
            this.showError(error.message || '生成失败，请重试');
        } finally {
            this.setGeneratingState(false);
        }
    }

    // 检查使用权限
    checkUsagePermission() {
        console.log('检查使用权限，当前用户:', this.currentUser);
        
        if (!this.currentUser) {
            console.log('权限检查失败：用户未登录');
            return { allowed: false, reason: '请先登录' };
        }
        
        const userLevel = this.currentUser.level || 'normal';
        const limits = this.usageLimits[userLevel];
        const dailyUsage = this.currentUser.articleUsage?.daily || 0;
        
        console.log('权限检查详情:', {
            userLevel,
            limits,
            dailyUsage,
            articleUsage: this.currentUser.articleUsage
        });
        
        if (limits.daily !== -1 && dailyUsage >= limits.daily) {
            console.log('权限检查失败：使用次数已达上限');
            return { allowed: false, reason: `今日使用次数已达上限（${limits.daily}次）` };
        }
        
        console.log('权限检查通过');
        return { allowed: true };
    }

    // 生成文章
    async generateArticle(topic, reference, minWords, maxWords) {
        // 构建提示词
        const systemPrompt = this.systemPrompt
            .replace('##MIN_WORDS##', minWords)
            .replace('##MAX_WORDS##', maxWords);
        
        let userPrompt = `请根据以下主题创作一篇公众号爆文：\n\n主题：${topic}`;
        
        if (reference) {
            userPrompt += `\n\n参考内容：${reference}`;
        }
        
        userPrompt += `\n\n要求：\n- 字数控制在${minWords}-${maxWords}字之间\n- 风格要符合公众号爆文特点\n- 内容要有深度和可读性`;
        
        // 调用DeepSeek API
        const response = await fetch(`${this.config.deepseekBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.deepseekApiKey}`
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                stream: true,
                temperature: 0.7,
                max_tokens: Math.max(maxWords * 2, 4000)
            })
        });
        
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }
        
        // 处理流式响应
        await this.handleStreamResponse(response);
        
        // 更新使用次数
        await this.updateUsageCount();
    }

    // 处理流式响应
    async handleStreamResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let content = '';
        
        this.showResult();
        const resultContent = this.container.querySelector('#result-content');
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        
                        if (data === '[DONE]') {
                            return;
                        }
                        
                        if (data.trim() === '' || data.startsWith(': keep-alive')) {
                            continue;
                        }
                        
                        try {
                            const parsed = JSON.parse(data);
                            const delta = parsed.choices?.[0]?.delta?.content;
                            
                            if (delta) {
                                content += delta;
                                resultContent.textContent = content;
                                resultContent.scrollTop = resultContent.scrollHeight;
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    // 更新使用次数
    async updateUsageCount() {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/update_article_usage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify({
                    token: this.currentUser.token,
                    action: 'article_generation',
                    amount: 1
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // 更新本地用户信息
                this.currentUser.articleUsage = data.usage;
                this.updateUsageInfo();
                
                // 触发用户信息更新事件
                const event = new CustomEvent('userUsageUpdated', {
                    detail: { usage: data.usage }
                });
                document.dispatchEvent(event);
            }
        } catch (error) {
            console.error('更新使用次数失败:', error);
        }
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
            resultContainer.scrollIntoView({ behavior: 'smooth' });
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

    // 处理复制
    async handleCopy() {
        const resultContent = this.container.querySelector('#result-content');
        const copyBtn = this.container.querySelector('#copy-btn');
        
        if (!resultContent || !copyBtn) return;
        
        try {
            await navigator.clipboard.writeText(resultContent.textContent);
            
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '已复制！';
            copyBtn.style.background = '#d4edda';
            copyBtn.style.color = '#155724';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
                copyBtn.style.color = '';
            }, 2000);
            
        } catch (error) {
            console.error('复制失败:', error);
            this.showError('复制失败，请手动选择文本复制');
        }
    }
}

// 导出模块
window.ArticleGeneratorModule = ArticleGeneratorModule;