// 通用Header组件
class HeaderComponent {
    constructor() {
        this.wechatLogin = null;
    }

    // 加载Header HTML
    async loadHeader() {
        try {
            // 检查是否已经存在Header，避免重复加载
            if (document.querySelector('.header')) {
                console.log('Header已存在，跳过加载');
                return;
            }
            
            const response = await fetch('components/header.html');
            const headerHTML = await response.text();
            
            // 插入到页面顶部
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
            
            // 初始化微信登录
            this.initWeChatLogin();
            
        } catch (error) {
            console.error('加载Header失败:', error);
            // 如果加载失败，创建基本的Header
            this.createBasicHeader();
        }
    }

    // 创建基本Header（备用方案）
    createBasicHeader() {
        // 检查是否已经存在Header，避免重复创建
        if (document.querySelector('.header')) {
            console.log('Header已存在，跳过创建');
            return;
        }
        
        const headerHTML = `
            <header class="header">
                <div class="nav-container">
                    <a href="index.html" class="logo">
                        <span class="logo-icon">🤖</span>
                        <span>AIMORELOGY</span>
                    </a>
                    
                    <nav>
                        <ul class="nav-menu">
                            <li><a href="index.html">首页</a></li>
                            <li class="dropdown">
                                <a href="#features">功能</a>
                                <div class="dropdown-content">
                                    <a href="article-generator.html">公众号爆文生成</a>
                                    <a href="markdown-editor.html?mode=wechat">微信公众号排版</a>
                                    <a href="image-generator.html">AI 图片生成</a>
                                </div>
                            </li>
                            <li><a href="index.html#pricing">定价</a></li>
                            <li><a href="#about">关于</a></li>
                        </ul>
                    </nav>
                    
                    <div class="user-section">
                        <div id="wechat-login-container"></div>
                    </div>
                </div>
            </header>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
        this.initWeChatLogin();
    }

    // 初始化微信登录
    initWeChatLogin() {
        // 确保微信登录模块已加载
        if (typeof WeChatLoginModule !== 'undefined') {
            this.wechatLogin = new WeChatLoginModule({
                apiBaseUrl: 'https://aimorelogybackend.site'
            });
            
            const container = document.getElementById('wechat-login-container');
            if (container) {
                this.wechatLogin.render(container);
            }
        } else {
            // 如果微信登录模块还没加载，等待一下再试
            setTimeout(() => this.initWeChatLogin(), 100);
        }
    }

    // 获取微信登录实例
    getWeChatLogin() {
        return this.wechatLogin;
    }

    // 设置当前页面高亮
    setActiveNavItem(path) {
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === path) {
                link.classList.add('active');
            }
        });
    }
}

// 创建全局Header实例
window.headerComponent = new HeaderComponent();

// 页面加载完成后初始化Header
document.addEventListener('DOMContentLoaded', function() {
    // 如果页面已经有Header，就不重复加载
    if (!document.querySelector('.header')) {
        window.headerComponent.loadHeader();
    } else {
        // 如果已有Header，只初始化微信登录
        window.headerComponent.initWeChatLogin();
    }
});

// 导出给其他模块使用
window.getHeaderComponent = function() {
    return window.headerComponent;
};

window.getWeChatLogin = function() {
    return window.headerComponent ? window.headerComponent.getWeChatLogin() : null;
};