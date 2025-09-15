// Markdown编辑器模块
class MarkdownEditorModule {
    constructor(options = {}) {
        this.config = {
            apiBaseUrl: 'https://aimorelogybackend.site',
            ...options
        };
        this.currentUser = options.user || null;
        this.editor = null;
        this.previewElement = null;
        this.isPreviewMode = false;
        this.autoSaveTimer = null;
        this.themes = {
            default: 'github',
            dark: 'material',
            wechat: 'wechat-style'
        };
        this.currentTheme = 'default';
        
        // 微信公众号样式模板
        this.wechatStyles = {
            h1: 'font-size: 1.5em; font-weight: bold; margin: 1.5em 0 1em 0; padding-bottom: 0.3em; border-bottom: 2px solid #eee;',
            h2: 'font-size: 1.3em; font-weight: bold; margin: 1.3em 0 0.8em 0; color: #333;',
            h3: 'font-size: 1.1em; font-weight: bold; margin: 1.1em 0 0.6em 0; color: #666;',
            p: 'line-height: 1.8; margin: 1em 0; color: #333; text-align: justify;',
            blockquote: 'border-left: 4px solid #42b883; padding-left: 1em; margin: 1em 0; background: #f8f8f8; font-style: italic;',
            code: 'background: #f1f1f1; padding: 2px 4px; border-radius: 3px; font-family: Consolas, Monaco, monospace;',
            pre: 'background: #f8f8f8; padding: 1em; border-radius: 5px; overflow-x: auto; border-left: 4px solid #42b883;'
        };
    }

    // 初始化模块
    async init(container) {
        this.container = container;
        await this.render();
        this.initEditor();
        this.bindEvents();
        this.loadDraft();
        this.startAutoSave();
    }

    // 渲染界面
    async render() {
        this.container.innerHTML = `
            <div class="markdown-editor">
                <!-- 顶部工具栏 -->
                <div class="editor-toolbar">
                    <div class="toolbar-left">
                        <button class="btn btn-primary" id="newBtn">新建</button>
                        <button class="btn btn-secondary" id="saveBtn">保存</button>
                        <button class="btn btn-secondary" id="exportBtn">导出</button>
                        <input type="file" id="importFile" accept=".md,.txt" style="display: none;">
                        <button class="btn btn-secondary" id="importBtn">导入</button>
                    </div>
                    
                    <div class="toolbar-center">
                        <select id="themeSelect" class="theme-select">
                            <option value="default">默认主题</option>
                            <option value="wechat">微信公众号</option>
                            <option value="dark">深色主题</option>
                        </select>
                    </div>
                    
                    <div class="toolbar-right">
                        <button class="btn btn-secondary" id="previewToggle">
                            <span class="preview-text">预览</span>
                        </button>
                        <button class="btn btn-success" id="copyHtmlBtn">复制HTML</button>
                        <button class="btn btn-primary" id="aiAssistBtn">AI助手</button>
                    </div>
                </div>

                <!-- 编辑器主体 -->
                <div class="editor-main">
                    <!-- 左侧编辑区 -->
                    <div class="editor-panel" id="editorPanel">
                        <div class="editor-header">
                            <h3>Markdown编辑</h3>
                            <div class="editor-stats">
                                <span id="wordCount">0 字</span>
                                <span id="charCount">0 字符</span>
                            </div>
                        </div>
                        <textarea id="markdownEditor" placeholder="请输入Markdown内容...

# 标题示例

这是一个段落示例，支持**粗体**、*斜体*、\`行内代码\`等格式。

## 二级标题

> 这是引用块示例

\`\`\`javascript
// 代码块示例
console.log('Hello, Markdown!');
\`\`\`

- 列表项1
- 列表项2
- 列表项3

[链接示例](https://example.com)

![图片示例](https://via.placeholder.com/300x200)
"></textarea>
                    </div>

                    <!-- 分割线 -->
                    <div class="editor-divider" id="editorDivider"></div>

                    <!-- 右侧预览区 -->
                    <div class="preview-panel" id="previewPanel">
                        <div class="preview-header">
                            <h3>实时预览</h3>
                            <div class="preview-actions">
                                <button class="btn btn-sm" id="syncScrollBtn" title="同步滚动">🔄</button>
                                <button class="btn btn-sm" id="fullscreenBtn" title="全屏预览">⛶</button>
                            </div>
                        </div>
                        <div class="preview-content" id="previewContent">
                            <div class="preview-placeholder">
                                <p>在左侧编辑器中输入Markdown内容，这里将实时显示预览效果</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI助手面板 -->
                <div class="ai-assistant-panel" id="aiPanel" style="display: none;">
                    <div class="ai-header">
                        <h3>AI写作助手</h3>
                        <button class="btn btn-sm" id="closeAiBtn">✕</button>
                    </div>
                    <div class="ai-content">
                        <div class="ai-actions">
                            <button class="btn btn-primary ai-action-btn" data-action="polish">润色文本</button>
                            <button class="btn btn-primary ai-action-btn" data-action="expand">扩展内容</button>
                            <button class="btn btn-primary ai-action-btn" data-action="summarize">总结概括</button>
                            <button class="btn btn-primary ai-action-btn" data-action="translate">翻译</button>
                        </div>
                        <div class="ai-input-area">
                            <textarea id="aiPrompt" placeholder="描述您的需求，AI将帮助您生成或优化内容..."></textarea>
                            <button class="btn btn-success" id="aiGenerateBtn">生成内容</button>
                        </div>
                        <div class="ai-result" id="aiResult" style="display: none;">
                            <h4>AI生成结果：</h4>
                            <div class="ai-result-content" id="aiResultContent"></div>
                            <div class="ai-result-actions">
                                <button class="btn btn-primary" id="insertAiResultBtn">插入到编辑器</button>
                                <button class="btn btn-secondary" id="copyAiResultBtn">复制结果</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 状态栏 -->
                <div class="editor-status">
                    <div class="status-left">
                        <span id="saveStatus">已保存</span>
                        <span id="cursorPosition">行 1, 列 1</span>
                    </div>
                    <div class="status-right">
                        <span>用户: ${this.currentUser?.nickname || '未知用户'}</span>
                        <span>今日使用: <span id="dailyUsage">${this.currentUser?.markdownUsage?.daily || 0}</span>/${this.currentUser?.limits?.markdownDaily || 10}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // 初始化CodeMirror编辑器
    initEditor() {
        const textarea = document.getElementById('markdownEditor');
        this.editor = CodeMirror.fromTextArea(textarea, {
            mode: 'markdown',
            theme: 'default',
            lineNumbers: true,
            lineWrapping: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            foldGutter: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            extraKeys: {
                'Ctrl-S': () => this.saveDocument(),
                'Ctrl-B': () => this.insertFormat('**', '**'),
                'Ctrl-I': () => this.insertFormat('*', '*'),
                'Ctrl-K': () => this.insertLink(),
                'Ctrl-/': () => this.toggleComment(),
                'F11': () => this.toggleFullscreen(),
                'Esc': () => this.exitFullscreen()
            },
            placeholder: '请输入Markdown内容...'
        });

        this.previewElement = document.getElementById('previewContent');
        
        // 监听编辑器变化
        this.editor.on('change', () => {
            this.updatePreview();
            this.updateStats();
            this.updateSaveStatus('未保存');
        });

        // 监听光标位置变化
        this.editor.on('cursorActivity', () => {
            this.updateCursorPosition();
        });

        // 初始预览
        this.updatePreview();
    }

    // 绑定事件
    bindEvents() {
        // 工具栏按钮事件
        document.getElementById('newBtn').addEventListener('click', () => this.newDocument());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveDocument());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportDocument());
        document.getElementById('importBtn').addEventListener('click', () => this.importDocument());
        document.getElementById('importFile').addEventListener('change', (e) => this.handleFileImport(e));
        
        // 主题切换
        document.getElementById('themeSelect').addEventListener('change', (e) => this.changeTheme(e.target.value));
        
        // 预览切换
        document.getElementById('previewToggle').addEventListener('click', () => this.togglePreview());
        
        // 复制HTML
        document.getElementById('copyHtmlBtn').addEventListener('click', () => this.copyHtml());
        
        // AI助手
        document.getElementById('aiAssistBtn').addEventListener('click', () => this.toggleAiAssistant());
        document.getElementById('closeAiBtn').addEventListener('click', () => this.toggleAiAssistant());
        document.getElementById('aiGenerateBtn').addEventListener('click', () => this.generateWithAI());
        document.getElementById('insertAiResultBtn').addEventListener('click', () => this.insertAiResult());
        document.getElementById('copyAiResultBtn').addEventListener('click', () => this.copyAiResult());
        
        // AI快捷操作
        document.querySelectorAll('.ai-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.quickAiAction(e.target.dataset.action));
        });
        
        // 预览操作
        document.getElementById('syncScrollBtn').addEventListener('click', () => this.toggleSyncScroll());
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        
        // 分割线拖拽
        this.initResizer();
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // 更新预览
    updatePreview() {
        const markdown = this.editor.getValue();
        if (!markdown.trim()) {
            this.previewElement.innerHTML = '<div class="preview-placeholder"><p>在左侧编辑器中输入Markdown内容，这里将实时显示预览效果</p></div>';
            return;
        }

        try {
            // 配置marked选项
            marked.setOptions({
                highlight: function(code, lang) {
                    if (lang && hljs.getLanguage(lang)) {
                        return hljs.highlight(code, { language: lang }).value;
                    }
                    return hljs.highlightAuto(code).value;
                },
                breaks: true,
                gfm: true
            });

            let html = marked.parse(markdown);
            
            // 应用主题样式
            if (this.currentTheme === 'wechat') {
                html = this.applyWechatStyles(html);
            }
            
            // 清理HTML
            html = DOMPurify.sanitize(html);
            
            this.previewElement.innerHTML = html;
            
            // 重新高亮代码
            this.previewElement.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
            
        } catch (error) {
            console.error('预览更新失败:', error);
            this.previewElement.innerHTML = '<div class="preview-error">预览生成失败</div>';
        }
    }

    // 应用微信公众号样式
    applyWechatStyles(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 应用样式到各种元素
        Object.keys(this.wechatStyles).forEach(tag => {
            const elements = doc.querySelectorAll(tag);
            elements.forEach(el => {
                el.style.cssText = this.wechatStyles[tag];
            });
        });
        
        return doc.body.innerHTML;
    }

    // 更新统计信息
    updateStats() {
        const content = this.editor.getValue();
        const wordCount = content.replace(/\s+/g, '').length;
        const charCount = content.length;
        
        document.getElementById('wordCount').textContent = `${wordCount} 字`;
        document.getElementById('charCount').textContent = `${charCount} 字符`;
    }

    // 更新光标位置
    updateCursorPosition() {
        const cursor = this.editor.getCursor();
        document.getElementById('cursorPosition').textContent = `行 ${cursor.line + 1}, 列 ${cursor.ch + 1}`;
    }

    // 更新保存状态
    updateSaveStatus(status) {
        document.getElementById('saveStatus').textContent = status;
    }

    // 新建文档
    newDocument() {
        if (this.editor.getValue().trim() && !confirm('确定要新建文档吗？未保存的内容将丢失。')) {
            return;
        }
        this.editor.setValue('');
        this.updateSaveStatus('新文档');
    }

    // 保存文档
    async saveDocument() {
        try {
            const content = this.editor.getValue();
            const timestamp = new Date().toISOString();
            
            // 保存到本地存储
            const drafts = JSON.parse(localStorage.getItem('markdown_drafts') || '[]');
            const draftId = 'draft_' + Date.now();
            
            drafts.unshift({
                id: draftId,
                title: this.extractTitle(content) || '无标题文档',
                content: content,
                createdAt: timestamp,
                updatedAt: timestamp
            });
            
            // 只保留最近20个草稿
            if (drafts.length > 20) {
                drafts.splice(20);
            }
            
            localStorage.setItem('markdown_drafts', JSON.stringify(drafts));
            
            // 调用后端API保存（如果需要）
            await this.callAPI({
                action: 'save_markdown',
                content: content,
                title: this.extractTitle(content)
            });
            
            this.updateSaveStatus('已保存');
            this.showMessage('文档保存成功', 'success');
            
        } catch (error) {
            console.error('保存失败:', error);
            this.showMessage('保存失败: ' + error.message, 'error');
        }
    }

    // 导出文档
    exportDocument() {
        const content = this.editor.getValue();
        const title = this.extractTitle(content) || 'markdown-document';
        
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('文档导出成功', 'success');
    }

    // 导入文档
    importDocument() {
        document.getElementById('importFile').click();
    }

    // 处理文件导入
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.editor.setValue(e.target.result);
            this.showMessage('文档导入成功', 'success');
        };
        reader.readAsText(file);
        
        // 清空文件输入
        event.target.value = '';
    }

    // 切换主题
    changeTheme(theme) {
        this.currentTheme = theme;
        
        switch (theme) {
            case 'dark':
                this.editor.setOption('theme', 'material');
                document.body.classList.add('dark-theme');
                break;
            case 'wechat':
                this.editor.setOption('theme', 'default');
                document.body.classList.remove('dark-theme');
                break;
            default:
                this.editor.setOption('theme', 'default');
                document.body.classList.remove('dark-theme');
        }
        
        this.updatePreview();
    }

    // 切换预览模式
    togglePreview() {
        this.isPreviewMode = !this.isPreviewMode;
        const editorPanel = document.getElementById('editorPanel');
        const previewPanel = document.getElementById('previewPanel');
        const toggleBtn = document.getElementById('previewToggle');
        
        if (this.isPreviewMode) {
            editorPanel.style.display = 'none';
            previewPanel.style.flex = '1';
            toggleBtn.innerHTML = '<span class="preview-text">编辑</span>';
        } else {
            editorPanel.style.display = 'flex';
            previewPanel.style.flex = '1';
            toggleBtn.innerHTML = '<span class="preview-text">预览</span>';
        }
    }

    // 复制HTML
    async copyHtml() {
        try {
            const html = this.previewElement.innerHTML;
            await navigator.clipboard.writeText(html);
            this.showMessage('HTML已复制到剪贴板', 'success');
        } catch (error) {
            console.error('复制失败:', error);
            this.showMessage('复制失败', 'error');
        }
    }

    // 切换AI助手
    toggleAiAssistant() {
        const aiPanel = document.getElementById('aiPanel');
        const isVisible = aiPanel.style.display !== 'none';
        aiPanel.style.display = isVisible ? 'none' : 'block';
    }

    // AI生成内容
    async generateWithAI() {
        const prompt = document.getElementById('aiPrompt').value.trim();
        if (!prompt) {
            this.showMessage('请输入AI提示词', 'warning');
            return;
        }

        const generateBtn = document.getElementById('aiGenerateBtn');
        const originalText = generateBtn.textContent;
        
        try {
            generateBtn.textContent = '生成中...';
            generateBtn.disabled = true;
            
            const result = await this.callAPI({
                action: 'ai_generate',
                prompt: prompt,
                context: this.editor.getValue()
            });
            
            if (result.success) {
                document.getElementById('aiResultContent').textContent = result.content;
                document.getElementById('aiResult').style.display = 'block';
                this.showMessage('AI内容生成成功', 'success');
            } else {
                throw new Error(result.error || 'AI生成失败');
            }
            
        } catch (error) {
            console.error('AI生成失败:', error);
            this.showMessage('AI生成失败: ' + error.message, 'error');
        } finally {
            generateBtn.textContent = originalText;
            generateBtn.disabled = false;
        }
    }

    // 快捷AI操作
    async quickAiAction(action) {
        const selectedText = this.editor.getSelection();
        if (!selectedText && ['polish', 'expand', 'summarize', 'translate'].includes(action)) {
            this.showMessage('请先选择要处理的文本', 'warning');
            return;
        }

        const prompts = {
            polish: `请润色以下文本，使其更加流畅和专业：\n\n${selectedText}`,
            expand: `请扩展以下内容，添加更多细节和说明：\n\n${selectedText}`,
            summarize: `请总结以下内容的要点：\n\n${selectedText}`,
            translate: `请将以下文本翻译成英文：\n\n${selectedText}`
        };

        document.getElementById('aiPrompt').value = prompts[action];
        await this.generateWithAI();
    }

    // 插入AI结果
    insertAiResult() {
        const result = document.getElementById('aiResultContent').textContent;
        if (result) {
            const cursor = this.editor.getCursor();
            this.editor.replaceRange(result, cursor);
            this.showMessage('AI结果已插入', 'success');
        }
    }

    // 复制AI结果
    async copyAiResult() {
        const result = document.getElementById('aiResultContent').textContent;
        if (result) {
            try {
                await navigator.clipboard.writeText(result);
                this.showMessage('AI结果已复制', 'success');
            } catch (error) {
                this.showMessage('复制失败', 'error');
            }
        }
    }

    // 插入格式
    insertFormat(before, after) {
        const selection = this.editor.getSelection();
        const cursor = this.editor.getCursor();
        
        if (selection) {
            this.editor.replaceSelection(before + selection + after);
        } else {
            this.editor.replaceRange(before + after, cursor);
            this.editor.setCursor(cursor.line, cursor.ch + before.length);
        }
        
        this.editor.focus();
    }

    // 插入链接
    insertLink() {
        const selection = this.editor.getSelection();
        const linkText = selection || '链接文本';
        const linkUrl = prompt('请输入链接地址:', 'https://');
        
        if (linkUrl) {
            const linkMarkdown = `[${linkText}](${linkUrl})`;
            this.editor.replaceSelection(linkMarkdown);
        }
        
        this.editor.focus();
    }

    // 切换注释
    toggleComment() {
        const cursor = this.editor.getCursor();
        const line = this.editor.getLine(cursor.line);
        
        if (line.startsWith('<!-- ') && line.endsWith(' -->')) {
            // 取消注释
            const newLine = line.slice(5, -4);
            this.editor.replaceRange(newLine, {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
        } else {
            // 添加注释
            const newLine = `<!-- ${line} -->`;
            this.editor.replaceRange(newLine, {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
        }
    }

    // 提取标题
    extractTitle(content) {
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('# ')) {
                return trimmed.substring(2).trim();
            }
        }
        return null;
    }

    // 加载草稿
    loadDraft() {
        const drafts = JSON.parse(localStorage.getItem('markdown_drafts') || '[]');
        if (drafts.length > 0) {
            const lastDraft = drafts[0];
            if (lastDraft.content.trim()) {
                this.editor.setValue(lastDraft.content);
                this.updateSaveStatus('已加载草稿');
            }
        }
    }

    // 自动保存
    startAutoSave() {
        this.autoSaveTimer = setInterval(() => {
            const content = this.editor.getValue();
            if (content.trim()) {
                localStorage.setItem('markdown_autosave', content);
            }
        }, 30000); // 每30秒自动保存
    }

    // 初始化分割线拖拽
    initResizer() {
        const divider = document.getElementById('editorDivider');
        const editorPanel = document.getElementById('editorPanel');
        const previewPanel = document.getElementById('previewPanel');
        
        let isResizing = false;
        
        divider.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', stopResize);
        });
        
        function handleResize(e) {
            if (!isResizing) return;
            
            const container = document.querySelector('.editor-main');
            const containerRect = container.getBoundingClientRect();
            const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            
            if (percentage > 20 && percentage < 80) {
                editorPanel.style.flex = `0 0 ${percentage}%`;
                previewPanel.style.flex = `0 0 ${100 - percentage}%`;
            }
        }
        
        function stopResize() {
            isResizing = false;
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);
        }
    }

    // 处理键盘快捷键
    handleKeyboard(e) {
        // 这里可以添加更多自定义快捷键
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            this.togglePreview();
        }
    }

    // API调用
    async callAPI(data) {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/markdown_process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API调用失败:', error);
            throw error;
        }
    }

    // 显示消息
    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        // 添加到页面
        document.body.appendChild(messageEl);
        
        // 自动移除
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }

    // 销毁模块
    destroy() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        if (this.editor) {
            this.editor.toTextArea();
        }
    }
}

// 导出模块
window.MarkdownEditorModule = MarkdownEditorModule;