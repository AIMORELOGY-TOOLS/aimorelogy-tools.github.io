// 微信公众号内容排版模块
// 基于MarkdownEditorModule扩展，专注于微信公众号排版功能

class WeChatFormatModule {
    constructor(options = {}) {
        this.config = {
            apiBaseUrl: 'https://aimorelogybackend.site',
            ...options
        };
        this.currentUser = options.user || null;
        this.wechatLogin = options.wechatLogin || null;
        
        // 微信公众号专用样式主题
        this.wechatThemes = {
            default: {
                name: '默认主题',
                primaryColor: '#576b95',
                backgroundColor: '#ffffff',
                textColor: '#333333',
                linkColor: '#576b95',
                codeBackground: '#f1f1f1',
                blockquoteColor: '#42b883'
            },
            green: {
                name: '微信绿',
                primaryColor: '#07c160',
                backgroundColor: '#ffffff',
                textColor: '#333333',
                linkColor: '#07c160',
                codeBackground: '#f0f9ff',
                blockquoteColor: '#07c160'
            },
            blue: {
                name: '科技蓝',
                primaryColor: '#1890ff',
                backgroundColor: '#ffffff',
                textColor: '#333333',
                linkColor: '#1890ff',
                codeBackground: '#f6f8fa',
                blockquoteColor: '#1890ff'
            },
            orange: {
                name: '活力橙',
                primaryColor: '#ff6b35',
                backgroundColor: '#ffffff',
                textColor: '#333333',
                linkColor: '#ff6b35',
                codeBackground: '#fff8f6',
                blockquoteColor: '#ff6b35'
            },
            purple: {
                name: '优雅紫',
                primaryColor: '#722ed1',
                backgroundColor: '#ffffff',
                textColor: '#333333',
                linkColor: '#722ed1',
                codeBackground: '#f9f0ff',
                blockquoteColor: '#722ed1'
            }
        };
        
        this.currentTheme = 'default';
        this.customStyles = {};
        
        // 图床配置
        this.imageHosting = {
            enabled: true,
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        };
    }

    // 初始化模块
    async init(container) {
        this.container = container;
        
        // 检查登录状态
        if (this.wechatLogin) {
            const user = this.wechatLogin.getCurrentUser();
            if (!user) {
                this.showLoginRequired();
                return;
            }
            this.currentUser = user;
        }
        
        await this.render();
        this.bindEvents();
        this.loadDraft();
    }

    // 显示需要登录的提示
    showLoginRequired() {
        this.container.innerHTML = `
            <div class="login-required">
                <style>
                    .login-required {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        text-align: center;
                        color: #666;
                    }
                    
                    .login-icon {
                        font-size: 64px;
                        margin-bottom: 20px;
                        opacity: 0.5;
                    }
                    
                    .login-title {
                        font-size: 24px;
                        margin-bottom: 10px;
                        color: #333;
                    }
                    
                    .login-subtitle {
                        font-size: 16px;
                        margin-bottom: 30px;
                    }
                    
                    .login-action {
                        padding: 12px 24px;
                        background: #07c160;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: background 0.3s;
                    }
                    
                    .login-action:hover {
                        background: #06ad56;
                    }
                </style>
                
                <div class="login-icon">🔐</div>
                <div class="login-title">需要登录</div>
                <div class="login-subtitle">请先登录微信账号以使用微信公众号排版功能</div>
                <button class="login-action" onclick="window.location.href='/'">返回首页登录</button>
            </div>
        `;
    }

    // 渲染界面
    async render() {
        this.container.innerHTML = `
            <div class="wechat-format-editor">
                <!-- 顶部工具栏 -->
                <div class="format-toolbar">
                    <div class="toolbar-left">
                        <button class="btn btn-primary" id="newFormatBtn">新建</button>
                        <button class="btn btn-secondary" id="saveFormatBtn">保存</button>
                        <button class="btn btn-secondary" id="exportFormatBtn">导出</button>
                        <input type="file" id="importFormatFile" accept=".md,.txt" style="display: none;">
                        <button class="btn btn-secondary" id="importFormatBtn">导入</button>
                    </div>
                    
                    <div class="toolbar-center">
                        <select id="wechatThemeSelect" class="theme-select">
                            ${Object.entries(this.wechatThemes).map(([key, theme]) => 
                                `<option value="${key}">${theme.name}</option>`
                            ).join('')}
                        </select>
                        <button class="btn btn-secondary" id="customThemeBtn">自定义主题</button>
                    </div>
                    
                    <div class="toolbar-right">
                        <button class="btn btn-secondary" id="imageUploadBtn">
                            📷 上传图片
                        </button>
                        <button class="btn btn-success" id="copyWechatHtmlBtn">复制微信HTML</button>
                        <button class="btn btn-primary" id="previewMobileBtn">手机预览</button>
                    </div>
                </div>

                <!-- 编辑器主体 -->
                <div class="format-main">
                    <!-- 左侧编辑区 -->
                    <div class="format-editor-panel">
                        <div class="editor-header">
                            <h3>Markdown编辑</h3>
                            <div class="editor-stats">
                                <span id="formatWordCount">0 字</span>
                                <span id="formatCharCount">0 字符</span>
                            </div>
                        </div>
                        <div class="editor-toolbar-mini">
                            <button class="mini-btn" id="boldBtn" title="粗体 (Ctrl+B)">B</button>
                            <button class="mini-btn" id="italicBtn" title="斜体 (Ctrl+I)">I</button>
                            <button class="mini-btn" id="linkBtn" title="链接 (Ctrl+K)">🔗</button>
                            <button class="mini-btn" id="codeBtn" title="代码">{ }</button>
                            <button class="mini-btn" id="quoteBtn" title="引用">❝</button>
                            <button class="mini-btn" id="listBtn" title="列表">•</button>
                            <button class="mini-btn" id="h1Btn" title="一级标题">H1</button>
                            <button class="mini-btn" id="h2Btn" title="二级标题">H2</button>
                            <button class="mini-btn" id="h3Btn" title="三级标题">H3</button>
                        </div>
                        <textarea id="wechatFormatEditor" placeholder="请输入Markdown内容...

# 微信公众号文章标题

## 引言

这里是文章的引言部分，可以简要介绍文章的主要内容。

## 正文内容

### 小标题

这是正文内容，支持**粗体**、*斜体*、\`行内代码\`等格式。

> 这是一个引用块，可以用来突出重要信息或引用他人观点。

### 代码示例

\`\`\`javascript
// 这是代码块示例
function hello() {
    console.log('Hello, WeChat!');
}
\`\`\`

### 列表示例

1. 有序列表项1
2. 有序列表项2
3. 有序列表项3

- 无序列表项1
- 无序列表项2
- 无序列表项3

### 链接和图片

[这是一个链接示例](https://example.com)

![图片描述](https://via.placeholder.com/600x300/07c160/ffffff?text=微信公众号配图)

## 结语

这里是文章的结语部分，可以总结全文或呼吁读者行动。

---

*本文由 AIMORELOGY TOOLS 微信公众号排版工具生成*
"></textarea>
                    </div>

                    <!-- 分割线 -->
                    <div class="format-divider"></div>

                    <!-- 右侧预览区 -->
                    <div class="format-preview-panel">
                        <div class="preview-header">
                            <h3>微信预览</h3>
                            <div class="preview-actions">
                                <button class="btn btn-sm" id="syncFormatScrollBtn" title="同步滚动">🔄</button>
                                <button class="btn btn-sm" id="fullscreenFormatBtn" title="全屏预览">⛶</button>
                                <button class="btn btn-sm" id="mobilePreviewBtn" title="手机预览">📱</button>
                            </div>
                        </div>
                        <div class="wechat-preview-container">
                            <div class="wechat-article-preview" id="wechatPreviewContent">
                                <div class="preview-placeholder">
                                    <p>在左侧编辑器中输入内容，这里将显示微信公众号样式预览</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 自定义主题面板 -->
                <div class="custom-theme-panel" id="customThemePanel" style="display: none;">
                    <div class="theme-panel-header">
                        <h3>自定义主题</h3>
                        <button class="btn btn-sm" id="closeThemePanelBtn">✕</button>
                    </div>
                    <div class="theme-panel-content">
                        <div class="theme-option">
                            <label>主色调:</label>
                            <input type="color" id="primaryColorPicker" value="#576b95">
                        </div>
                        <div class="theme-option">
                            <label>背景色:</label>
                            <input type="color" id="backgroundColorPicker" value="#ffffff">
                        </div>
                        <div class="theme-option">
                            <label>文字颜色:</label>
                            <input type="color" id="textColorPicker" value="#333333">
                        </div>
                        <div class="theme-option">
                            <label>链接颜色:</label>
                            <input type="color" id="linkColorPicker" value="#576b95">
                        </div>
                        <div class="theme-option">
                            <label>代码背景:</label>
                            <input type="color" id="codeBackgroundPicker" value="#f1f1f1">
                        </div>
                        <div class="theme-option">
                            <label>引用边框:</label>
                            <input type="color" id="blockquoteColorPicker" value="#42b883">
                        </div>
                        <div class="theme-actions">
                            <button class="btn btn-primary" id="applyCustomThemeBtn">应用主题</button>
                            <button class="btn btn-secondary" id="resetThemeBtn">重置</button>
                            <button class="btn btn-success" id="saveThemeBtn">保存主题</button>
                        </div>
                    </div>
                </div>

                <!-- 图片上传面板 -->
                <div class="image-upload-panel" id="imageUploadPanel" style="display: none;">
                    <div class="upload-panel-header">
                        <h3>图片上传</h3>
                        <button class="btn btn-sm" id="closeUploadPanelBtn">✕</button>
                    </div>
                    <div class="upload-panel-content">
                        <div class="upload-area" id="uploadArea">
                            <div class="upload-icon">📷</div>
                            <div class="upload-text">点击或拖拽上传图片</div>
                            <div class="upload-hint">支持 JPG、PNG、GIF、WebP 格式，最大 5MB</div>
                            <input type="file" id="imageFileInput" accept="image/*" multiple style="display: none;">
                        </div>
                        <div class="upload-progress" id="uploadProgress" style="display: none;">
                            <div class="progress-bar">
                                <div class="progress-fill" id="progressFill"></div>
                            </div>
                            <div class="progress-text" id="progressText">上传中...</div>
                        </div>
                        <div class="uploaded-images" id="uploadedImages"></div>
                    </div>
                </div>

                <!-- 手机预览面板 -->
                <div class="mobile-preview-panel" id="mobilePreviewPanel" style="display: none;">
                    <div class="mobile-panel-header">
                        <h3>手机预览</h3>
                        <button class="btn btn-sm" id="closeMobilePanelBtn">✕</button>
                    </div>
                    <div class="mobile-panel-content">
                        <div class="mobile-frame">
                            <div class="mobile-screen">
                                <div class="wechat-header">
                                    <div class="wechat-title">微信公众号</div>
                                    <div class="wechat-actions">
                                        <span>•••</span>
                                    </div>
                                </div>
                                <div class="mobile-article-content" id="mobileArticleContent">
                                    <!-- 手机预览内容 -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 状态栏 -->
                <div class="format-status">
                    <div class="status-left">
                        <span id="formatSaveStatus">已保存</span>
                        <span id="formatCursorPosition">行 1, 列 1</span>
                    </div>
                    <div class="status-right">
                        <span>用户: ${this.currentUser?.nickname || '未知用户'}</span>
                        <span>主题: <span id="currentThemeName">${this.wechatThemes[this.currentTheme].name}</span></span>
                    </div>
                </div>
            </div>
        `;
    }

    // 绑定事件
    bindEvents() {
        // 初始化CodeMirror编辑器
        this.initFormatEditor();
        
        // 工具栏按钮事件
        document.getElementById('newFormatBtn').addEventListener('click', () => this.newDocument());
        document.getElementById('saveFormatBtn').addEventListener('click', () => this.saveDocument());
        document.getElementById('exportFormatBtn').addEventListener('click', () => this.exportDocument());
        document.getElementById('importFormatBtn').addEventListener('click', () => this.importDocument());
        document.getElementById('importFormatFile').addEventListener('change', (e) => this.handleFileImport(e));
        
        // 主题相关事件
        document.getElementById('wechatThemeSelect').addEventListener('change', (e) => this.changeWechatTheme(e.target.value));
        document.getElementById('customThemeBtn').addEventListener('click', () => this.showCustomThemePanel());
        document.getElementById('closeThemePanelBtn').addEventListener('click', () => this.hideCustomThemePanel());
        document.getElementById('applyCustomThemeBtn').addEventListener('click', () => this.applyCustomTheme());
        document.getElementById('resetThemeBtn').addEventListener('click', () => this.resetCustomTheme());
        document.getElementById('saveThemeBtn').addEventListener('click', () => this.saveCustomTheme());
        
        // 图片上传事件
        document.getElementById('imageUploadBtn').addEventListener('click', () => this.showImageUploadPanel());
        document.getElementById('closeUploadPanelBtn').addEventListener('click', () => this.hideImageUploadPanel());
        document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('imageFileInput').click());
        document.getElementById('imageFileInput').addEventListener('change', (e) => this.handleImageUpload(e));
        
        // 拖拽上传
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleImageDrop(e);
        });
        
        // 预览相关事件
        document.getElementById('copyWechatHtmlBtn').addEventListener('click', () => this.copyWechatHtml());
        document.getElementById('previewMobileBtn').addEventListener('click', () => this.showMobilePreview());
        document.getElementById('closeMobilePanelBtn').addEventListener('click', () => this.hideMobilePreview());
        document.getElementById('mobilePreviewBtn').addEventListener('click', () => this.showMobilePreview());
        
        // 编辑器工具栏事件
        this.bindEditorToolbar();
        
        // 颜色选择器事件
        this.bindColorPickers();
    }

    // 初始化格式编辑器
    initFormatEditor() {
        const textarea = document.getElementById('wechatFormatEditor');
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
                'Ctrl-U': () => this.insertFormat('<u>', '</u>'),
                'Ctrl-1': () => this.insertHeading(1),
                'Ctrl-2': () => this.insertHeading(2),
                'Ctrl-3': () => this.insertHeading(3)
            },
            placeholder: '请输入Markdown内容...'
        });

        this.previewElement = document.getElementById('wechatPreviewContent');
        
        // 监听编辑器变化
        this.editor.on('change', () => {
            this.updateWechatPreview();
            this.updateStats();
            this.updateSaveStatus('未保存');
        });

        // 监听光标位置变化
        this.editor.on('cursorActivity', () => {
            this.updateCursorPosition();
        });

        // 初始预览
        this.updateWechatPreview();
    }

    // 绑定编辑器工具栏
    bindEditorToolbar() {
        document.getElementById('boldBtn').addEventListener('click', () => this.insertFormat('**', '**'));
        document.getElementById('italicBtn').addEventListener('click', () => this.insertFormat('*', '*'));
        document.getElementById('linkBtn').addEventListener('click', () => this.insertLink());
        document.getElementById('codeBtn').addEventListener('click', () => this.insertFormat('`', '`'));
        document.getElementById('quoteBtn').addEventListener('click', () => this.insertQuote());
        document.getElementById('listBtn').addEventListener('click', () => this.insertList());
        document.getElementById('h1Btn').addEventListener('click', () => this.insertHeading(1));
        document.getElementById('h2Btn').addEventListener('click', () => this.insertHeading(2));
        document.getElementById('h3Btn').addEventListener('click', () => this.insertHeading(3));
    }

    // 绑定颜色选择器
    bindColorPickers() {
        const colorPickers = [
            'primaryColorPicker', 'backgroundColorPicker', 'textColorPicker',
            'linkColorPicker', 'codeBackgroundPicker', 'blockquoteColorPicker'
        ];
        
        colorPickers.forEach(pickerId => {
            document.getElementById(pickerId).addEventListener('change', () => {
                this.previewCustomTheme();
            });
        });
    }

    // 更新微信预览
    updateWechatPreview() {
        const markdown = this.editor.getValue();
        if (!markdown.trim()) {
            this.previewElement.innerHTML = '<div class="preview-placeholder"><p>在左侧编辑器中输入内容，这里将显示微信公众号样式预览</p></div>';
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
            
            // 应用微信公众号样式
            html = this.applyWechatStyles(html);
            
            // 清理HTML
            html = DOMPurify.sanitize(html);
            
            this.previewElement.innerHTML = html;
            
            // 重新高亮代码
            this.previewElement.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
            
            // 更新手机预览
            this.updateMobilePreview();
            
        } catch (error) {
            console.error('预览更新失败:', error);
            this.previewElement.innerHTML = '<div class="preview-error">预览生成失败</div>';
        }
    }

    // 应用微信公众号样式
    applyWechatStyles(html) {
        const theme = this.wechatThemes[this.currentTheme];
        const customStyles = this.customStyles;
        
        // 合并主题和自定义样式
        const finalTheme = { ...theme, ...customStyles };
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 应用样式到各种元素
        const styleMap = {
            'h1': `font-size: 1.5em; font-weight: bold; margin: 1.5em 0 1em 0; padding-bottom: 0.3em; border-bottom: 2px solid ${finalTheme.primaryColor}; color: ${finalTheme.textColor};`,
            'h2': `font-size: 1.3em; font-weight: bold; margin: 1.3em 0 0.8em 0; color: ${finalTheme.primaryColor};`,
            'h3': `font-size: 1.1em; font-weight: bold; margin: 1.1em 0 0.6em 0; color: ${finalTheme.primaryColor};`,
            'p': `line-height: 1.8; margin: 1em 0; color: ${finalTheme.textColor}; text-align: justify;`,
            'blockquote': `border-left: 4px solid ${finalTheme.blockquoteColor}; padding-left: 1em; margin: 1em 0; background: ${this.lightenColor(finalTheme.blockquoteColor, 0.95)}; font-style: italic; color: ${finalTheme.textColor};`,
            'code': `background: ${finalTheme.codeBackground}; padding: 2px 4px; border-radius: 3px; font-family: Consolas, Monaco, monospace; color: ${finalTheme.primaryColor};`,
            'pre': `background: ${finalTheme.codeBackground}; padding: 1em; border-radius: 5px; overflow-x: auto; border-left: 4px solid ${finalTheme.primaryColor}; margin: 1em 0;`,
            'a': `color: ${finalTheme.linkColor}; text-decoration: none;`,
            'ul, ol': `padding-left: 2em; margin: 1em 0;`,
            'li': `margin: 0.5em 0; line-height: 1.6;`,
            'img': `max-width: 100%; height: auto; display: block; margin: 1em auto; border-radius: 4px;`,
            'table': `width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 0.9em;`,
            'th, td': `border: 1px solid #ddd; padding: 8px 12px; text-align: left;`,
            'th': `background: ${this.lightenColor(finalTheme.primaryColor, 0.9)}; font-weight: bold;`
        };
        
        Object.keys(styleMap).forEach(selector => {
            const elements = doc.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.cssText = styleMap[selector];
            });
        });
        
        // 特殊处理pre code
        doc.querySelectorAll('pre code').forEach(el => {
            el.style.cssText = 'background: none; color: inherit;';
        });
        
        return doc.body.innerHTML;
    }

    // 颜色变亮函数
    lightenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const newR = Math.round(r + (255 - r) * factor);
        const newG = Math.round(g + (255 - g) * factor);
        const newB = Math.round(b + (255 - b) * factor);
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }

    // 切换微信主题
    changeWechatTheme(themeKey) {
        this.currentTheme = themeKey;
        this.customStyles = {}; // 清除自定义样式
        this.updateWechatPreview();
        document.getElementById('currentThemeName').textContent = this.wechatThemes[themeKey].name;
    }

    // 显示自定义主题面板
    showCustomThemePanel() {
        const panel = document.getElementById('customThemePanel');
        panel.style.display = 'block';
        
        // 加载当前主题颜色到颜色选择器
        const theme = this.wechatThemes[this.currentTheme];
        document.getElementById('primaryColorPicker').value = theme.primaryColor;
        document.getElementById('backgroundColorPicker').value = theme.backgroundColor;
        document.getElementById('textColorPicker').value = theme.textColor;
        document.getElementById('linkColorPicker').value = theme.linkColor;
        document.getElementById('codeBackgroundPicker').value = theme.codeBackground;
        document.getElementById('blockquoteColorPicker').value = theme.blockquoteColor;
    }

    // 隐藏自定义主题面板
    hideCustomThemePanel() {
        document.getElementById('customThemePanel').style.display = 'none';
    }

    // 预览自定义主题
    previewCustomTheme() {
        this.customStyles = {
            primaryColor: document.getElementById('primaryColorPicker').value,
            backgroundColor: document.getElementById('backgroundColorPicker').value,
            textColor: document.getElementById('textColorPicker').value,
            linkColor: document.getElementById('linkColorPicker').value,
            codeBackground: document.getElementById('codeBackgroundPicker').value,
            blockquoteColor: document.getElementById('blockquoteColorPicker').value
        };
        
        this.updateWechatPreview();
    }

    // 应用自定义主题
    applyCustomTheme() {
        this.previewCustomTheme();
        this.hideCustomThemePanel();
        document.getElementById('currentThemeName').textContent = '自定义主题';
        this.showMessage('自定义主题已应用', 'success');
    }

    // 重置自定义主题
    resetCustomTheme() {
        const theme = this.wechatThemes[this.currentTheme];
        document.getElementById('primaryColorPicker').value = theme.primaryColor;
        document.getElementById('backgroundColorPicker').value = theme.backgroundColor;
        document.getElementById('textColorPicker').value = theme.textColor;
        document.getElementById('linkColorPicker').value = theme.linkColor;
        document.getElementById('codeBackgroundPicker').value = theme.codeBackground;
        document.getElementById('blockquoteColorPicker').value = theme.blockquoteColor;
        
        this.customStyles = {};
        this.updateWechatPreview();
    }

    // 保存自定义主题
    saveCustomTheme() {
        const themeName = prompt('请输入主题名称:', '我的自定义主题');
        if (themeName) {
            const customTheme = {
                name: themeName,
                primaryColor: document.getElementById('primaryColorPicker').value,
                backgroundColor: document.getElementById('backgroundColorPicker').value,
                textColor: document.getElementById('textColorPicker').value,
                linkColor: document.getElementById('linkColorPicker').value,
                codeBackground: document.getElementById('codeBackgroundPicker').value,
                blockquoteColor: document.getElementById('blockquoteColorPicker').value
            };
            
            // 保存到本地存储
            const savedThemes = JSON.parse(localStorage.getItem('wechat_custom_themes') || '{}');
            savedThemes[themeName] = customTheme;
            localStorage.setItem('wechat_custom_themes', JSON.stringify(savedThemes));
            
            this.showMessage('主题保存成功', 'success');
        }
    }

    // 显示图片上传面板
    showImageUploadPanel() {
        document.getElementById('imageUploadPanel').style.display = 'block';
    }

    // 隐藏图片上传面板
    hideImageUploadPanel() {
        document.getElementById('imageUploadPanel').style.display = 'none';
    }

    // 处理图片上传
    async handleImageUpload(event) {
        const files = Array.from(event.target.files);
        await this.uploadImages(files);
        event.target.value = ''; // 清空文件输入
    }

    // 处理图片拖拽
    async handleImageDrop(event) {
        const files = Array.from(event.dataTransfer.files).filter(file => 
            file.type.startsWith('image/')
        );
        await this.uploadImages(files);
    }

    // 上传图片
    async uploadImages(files) {
        if (!files.length) return;
        
        const progressEl = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressEl.style.display = 'block';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // 检查文件大小
            if (file.size > this.imageHosting.maxSize) {
                this.showMessage(`文件 ${file.name} 超过 5MB 限制`, 'error');
                continue;
            }
            
            // 检查文件类型
            if (!this.imageHosting.allowedTypes.includes(file.type)) {
                this.showMessage(`文件 ${file.name} 格式不支持`, 'error');
                continue;
            }
            
            try {
                progressText.textContent = `上传中... (${i + 1}/${files.length})`;
                progressFill.style.width = `${((i + 1) / files.length) * 100}%`;
                
                const imageUrl = await this.uploadSingleImage(file);
                this.addUploadedImage(file.name, imageUrl);
                
            } catch (error) {
                console.error('上传失败:', error);
                this.showMessage(`上传 ${file.name} 失败: ${error.message}`, 'error');
            }
        }
        
        progressEl.style.display = 'none';
        this.showMessage('图片上传完成', 'success');
    }

    // 上传单个图片
    async uploadSingleImage(file) {
        // 这里实现图片上传逻辑
        // 可以上传到图床服务或转换为base64
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // 暂时返回base64，实际项目中应该上传到图床
                resolve(e.target.result);
            };
            reader.onerror = () => reject(new Error('读取文件失败'));
            reader.readAsDataURL(file);
        });
    }

    // 添加已上传的图片
    addUploadedImage(fileName, imageUrl) {
        const container = document.getElementById('uploadedImages');
        const imageItem = document.createElement('div');
        imageItem.className = 'uploaded-image-item';
        imageItem.innerHTML = `
            <img src="${imageUrl}" alt="${fileName}" class="uploaded-thumbnail">
            <div class="image-info">
                <div class="image-name">${fileName}</div>
                <div class="image-actions">
                    <button class="btn btn-sm" onclick="navigator.clipboard.writeText('![${fileName}](${imageUrl})')">复制Markdown</button>
                    <button class="btn btn-sm" onclick="this.closest('.wechat-format-editor').querySelector('.CodeMirror').CodeMirror.replaceSelection('![${fileName}](${imageUrl})')">插入</button>
                </div>
            </div>
        `;
        
        container.appendChild(imageItem);
    }

    // 显示手机预览
    showMobilePreview() {
        document.getElementById('mobilePreviewPanel').style.display = 'block';
        this.updateMobilePreview();
    }

    // 隐藏手机预览
    hideMobilePreview() {
        document.getElementById('mobilePreviewPanel').style.display = 'none';
    }

    // 更新手机预览
    updateMobilePreview() {
        const mobileContent = document.getElementById('mobileArticleContent');
        if (mobileContent) {
            mobileContent.innerHTML = this.previewElement.innerHTML;
        }
    }

    // 复制微信HTML
    async copyWechatHtml() {
        try {
            const html = this.previewElement.innerHTML;
            await navigator.clipboard.writeText(html);
            this.showMessage('微信HTML已复制到剪贴板，可直接粘贴到微信公众号编辑器', 'success');
        } catch (error) {
            console.error('复制失败:', error);
            this.showMessage('复制失败', 'error');
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

    // 插入标题
    insertHeading(level) {
        const cursor = this.editor.getCursor();
        const line = this.editor.getLine(cursor.line);
        const prefix = '#'.repeat(level) + ' ';
        
        if (line.startsWith('#')) {
            // 如果已经是标题，替换级别
            const newLine = line.replace(/^#+\s*/, prefix);
            this.editor.replaceRange(newLine, {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
        } else {
            // 在行首添加标题标记
            this.editor.replaceRange(prefix, {line: cursor.line, ch: 0});
        }
        
        this.editor.focus();
    }

    // 插入引用
    insertQuote() {
        const cursor = this.editor.getCursor();
        const line = this.editor.getLine(cursor.line);
        
        if (line.startsWith('> ')) {
            // 取消引用
            const newLine = line.substring(2);
            this.editor.replaceRange(newLine, {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
        } else {
            // 添加引用
            this.editor.replaceRange('> ', {line: cursor.line, ch: 0});
        }
        
        this.editor.focus();
    }

    // 插入列表
    insertList() {
        const cursor = this.editor.getCursor();
        const line = this.editor.getLine(cursor.line);
        
        if (line.startsWith('- ') || line.startsWith('* ')) {
            // 取消列表
            const newLine = line.substring(2);
            this.editor.replaceRange(newLine, {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
        } else {
            // 添加列表
            this.editor.replaceRange('- ', {line: cursor.line, ch: 0});
        }
        
        this.editor.focus();
    }

    // 更新统计信息
    updateStats() {
        const content = this.editor.getValue();
        const wordCount = content.replace(/\s+/g, '').length;
        const charCount = content.length;
        
        document.getElementById('formatWordCount').textContent = `${wordCount} 字`;
        document.getElementById('formatCharCount').textContent = `${charCount} 字符`;
    }

    // 更新光标位置
    updateCursorPosition() {
        const cursor = this.editor.getCursor();
        document.getElementById('formatCursorPosition').textContent = `行 ${cursor.line + 1}, 列 ${cursor.ch + 1}`;
    }

    // 更新保存状态
    updateSaveStatus(status) {
        document.getElementById('formatSaveStatus').textContent = status;
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
            const drafts = JSON.parse(localStorage.getItem('wechat_format_drafts') || '[]');
            const draftId = 'wechat_draft_' + Date.now();
            
            drafts.unshift({
                id: draftId,
                title: this.extractTitle(content) || '无标题文档',
                content: content,
                theme: this.currentTheme,
                customStyles: this.customStyles,
                createdAt: timestamp,
                updatedAt: timestamp
            });
            
            // 只保留最近20个草稿
            if (drafts.length > 20) {
                drafts.splice(20);
            }
            
            localStorage.setItem('wechat_format_drafts', JSON.stringify(drafts));
            
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
        const title = this.extractTitle(content) || 'wechat-format-document';
        
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
        document.getElementById('importFormatFile').click();
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
        const drafts = JSON.parse(localStorage.getItem('wechat_format_drafts') || '[]');
        if (drafts.length > 0) {
            const lastDraft = drafts[0];
            if (lastDraft.content.trim()) {
                this.editor.setValue(lastDraft.content);
                if (lastDraft.theme) {
                    this.currentTheme = lastDraft.theme;
                    document.getElementById('wechatThemeSelect').value = lastDraft.theme;
                }
                if (lastDraft.customStyles) {
                    this.customStyles = lastDraft.customStyles;
                }
                this.updateSaveStatus('已加载草稿');
            }
        }
    }

    // 显示消息
    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        // 添加样式
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 4px;
            color: #fff;
            font-size: 14px;
            z-index: 2000;
            animation: slideIn 0.3s ease-out;
            ${type === 'success' ? 'background: #28a745;' : ''}
            ${type === 'error' ? 'background: #dc3545;' : ''}
            ${type === 'warning' ? 'background: #ffc107; color: #333;' : ''}
            ${type === 'info' ? 'background: #17a2b8;' : ''}
        `;
        
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
        if (this.editor) {
            this.editor.toTextArea();
        }
    }
}

// 导出模块
window.WeChatFormatModule = WeChatFormatModule;