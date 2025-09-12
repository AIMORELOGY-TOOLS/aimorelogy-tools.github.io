// 微信登录组件 - 独立 JavaScript 模块
// 使用方法：引入此文件后，通过 WechatLogin 对象调用相关方法

(function() {
    'use strict';
    
    // 配置 - 请在引入此文件前设置 API_BASE_URL
    const API_BASE_URL = window.API_BASE_URL || 'https://wechat-login-worker.internal-articleno.workers.dev';
    
    let currentSessionId = null;
    let pollInterval = null;
    let wsConnection = null;
    let modal = null;

    // 创建样式
    function createStyles() {
        if (document.getElementById('wechat-login-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'wechat-login-styles';
        style.textContent = `
            .wechat-login-modal {
                display: none;
                position: fixed;
                z-index: 10000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                backdrop-filter: blur(5px);
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .wechat-login-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                text-align: center;
                max-width: 400px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from { 
                    opacity: 0;
                    transform: translate(-50%, -60%);
                }
                to { 
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }
            
            .wechat-close-btn {
                position: absolute;
                top: 15px;
                right: 20px;
                font-size: 24px;
                cursor: pointer;
                color: #999;
                background: none;
                border: none;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s;
            }
            
            .wechat-close-btn:hover {
                color: #333;
                background: #f0f0f0;
            }
            
            .wechat-logo {
                width: 60px;
                height: 60px;
                background: #07c160;
                border-radius: 12px;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                font-weight: bold;
            }
            
            .wechat-title {
                color: #333;
                margin-bottom: 10px;
                font-size: 24px;
                font-weight: 600;
            }
            
            .wechat-subtitle {
                color: #666;
                margin-bottom: 30px;
                font-size: 14px;
            }
            
            .wechat-qr-container {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                min-height: 280px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            
            .wechat-qr-code {
                width: 200px;
                height: 200px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                margin-bottom: 15px;
            }
            
            .wechat-loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #07c160;
                border-radius: 50%;
                animation: wechatSpin 1s linear infinite;
                margin-bottom: 15px;
            }
            
            @keyframes wechatSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .wechat-status-text {
                color: #666;
                font-size: 14px;
                margin-bottom: 10px;
            }
            
            .wechat-status-success {
                color: #07c160;
            }
            
            .wechat-status-error {
                color: #ff4757;
            }
            
            .wechat-refresh-btn {
                background: #07c160;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                margin-top: 10px;
                transition: background 0.3s;
            }
            
            .wechat-refresh-btn:hover {
                background: #06ad56;
            }
            
            .wechat-login-steps {
                text-align: left;
                margin-top: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                font-size: 13px;
                color: #666;
            }
            
            .wechat-login-steps ol {
                margin-left: 20px;
            }
            
            .wechat-login-steps li {
                margin-bottom: 5px;
            }

            .wechat-login-btn {
                background: #07c160;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s;
                font-family: inherit;
            }
            
            .wechat-login-btn:hover {
                background: #06ad56;
                transform: translateY(-1px);
            }
            
            .wechat-login-btn:active {
                transform: translateY(0);
            }
            
            .wechat-login-btn span {
                background: rgba(255,255,255,0.2);
                width: 20px;
                height: 20px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }

    // 创建弹窗 HTML
    function createModal() {
        if (modal) return modal;
        
        modal = document.createElement('div');
        modal.id = 'wechatLoginModal';
        modal.className = 'wechat-login-modal';
        modal.innerHTML = `
            <div class="wechat-login-content">
                <button class="wechat-close-btn" onclick="WechatLogin.close()">&times;</button>
                
                <div class="wechat-logo">微</div>
                <h2 class="wechat-title">微信登录</h2>
                <p class="wechat-subtitle">使用微信扫码快速登录</p>
                
                <div class="wechat-qr-container">
                    <div class="wechat-loading-spinner" id="wechatLoadingSpinner"></div>
                    <img class="wechat-qr-code" id="wechatQrcodeImage" style="display: none;" />
                    <div class="wechat-status-text" id="wechatStatusText">正在生成二维码...</div>
                    <button class="wechat-refresh-btn" id="wechatRefreshButton" style="display: none;" onclick="WechatLogin.generateQR()">
                        刷新二维码
                    </button>
                </div>
                
                <div class="wechat-login-steps">
                    <strong>登录步骤：</strong>
                    <ol>
                        <li>使用微信扫描上方二维码</li>
                        <li>关注微信服务号（如未关注）</li>
                        <li>等待自动登录完成</li>
                    </ol>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 点击弹窗外部关闭
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                WechatLogin.close();
            }
        });
        
        return modal;
    }

    // 清理资源
    function cleanup() {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
        if (wsConnection) {
            wsConnection.close();
            wsConnection = null;
        }
        currentSessionId = null;
    }

    // 生成二维码
    async function generateQRCode() {
        const loadingSpinner = document.getElementById('wechatLoadingSpinner');
        const qrcodeImage = document.getElementById('wechatQrcodeImage');
        const statusText = document.getElementById('wechatStatusText');
        const refreshButton = document.getElementById('wechatRefreshButton');
        
        if (!loadingSpinner || !qrcodeImage || !statusText || !refreshButton) {
            console.error('微信登录组件元素未找到');
            return;
        }
        
        // 重置状态
        loadingSpinner.style.display = 'block';
        qrcodeImage.style.display = 'none';
        refreshButton.style.display = 'none';
        statusText.textContent = '正在生成二维码...';
        statusText.className = 'wechat-status-text';
        
        cleanup();
        
        try {
            const response = await fetch(`${API_BASE_URL}/create_qr`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.sessionId && data.qrUrl) {
                currentSessionId = data.sessionId;
                qrcodeImage.src = data.qrUrl;
                qrcodeImage.style.display = 'block';
                loadingSpinner.style.display = 'none';
                statusText.textContent = '请使用微信扫描二维码';
                
                // 开始监听扫码状态
                startPolling();
            } else {
                throw new Error(data.error || '生成二维码失败');
            }
        } catch (error) {
            console.error('生成二维码失败:', error);
            loadingSpinner.style.display = 'none';
            statusText.textContent = '生成二维码失败: ' + error.message;
            statusText.className = 'wechat-status-text wechat-status-error';
            refreshButton.style.display = 'inline-block';
        }
    }

    // 开始轮询状态
    function startPolling() {
        if (pollInterval) {
            clearInterval(pollInterval);
        }
        
        pollInterval = setInterval(async () => {
            if (!currentSessionId) return;
            
            try {
                const response = await fetch(`${API_BASE_URL}/poll?id=${currentSessionId}`);
                const data = await response.json();
                
                if (data.status === 'scanned' && data.openid) {
                    handleLoginSuccess(data);
                } else if (data.status === 'success') {
                    handleLoginSuccess(data);
                }
            } catch (error) {
                console.error('轮询状态失败:', error);
            }
        }, 2000); // 每2秒轮询一次
    }

    // 处理登录成功
    async function handleLoginSuccess(data) {
        const statusText = document.getElementById('wechatStatusText');
        
        if (!statusText) return;
        
        cleanup();
        
        statusText.textContent = '扫码成功，正在登录...';
        statusText.className = 'wechat-status-text wechat-status-success';
        
        try {
            const response = await fetch(`${API_BASE_URL}/finalize_login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: currentSessionId
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                statusText.textContent = '登录成功！';
                
                // 存储登录信息
                localStorage.setItem('wechat_login_token', result.token);
                localStorage.setItem('wechat_openid', result.openid);
                localStorage.setItem('wechat_login_time', result.loginTime);
                
                // 触发登录成功事件
                const loginEvent = new CustomEvent('wechatLoginSuccess', {
                    detail: {
                        token: result.token,
                        openid: result.openid,
                        loginTime: result.loginTime
                    }
                });
                window.dispatchEvent(loginEvent);
                
                // 2秒后关闭弹窗
                setTimeout(() => {
                    WechatLogin.close();
                }, 2000);
                
            } else {
                throw new Error(result.error || '登录失败');
            }
        } catch (error) {
            console.error('完成登录失败:', error);
            statusText.textContent = '登录失败: ' + error.message;
            statusText.className = 'wechat-status-text wechat-status-error';
            document.getElementById('wechatRefreshButton').style.display = 'inline-block';
        }
    }

    // 检查登录状态
    function checkLoginStatus() {
        const token = localStorage.getItem('wechat_login_token');
        const openid = localStorage.getItem('wechat_openid');
        const loginTime = localStorage.getItem('wechat_login_time');
        
        if (token && openid && loginTime) {
            // 检查登录是否过期（24小时）
            const loginDate = new Date(loginTime);
            const now = new Date();
            const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
                return {
                    isLoggedIn: true,
                    token: token,
                    openid: openid,
                    loginTime: loginTime
                };
            } else {
                // 登录过期，清除数据
                logout();
            }
        }
        
        return {
            isLoggedIn: false
        };
    }

    // 退出登录
    function logout() {
        localStorage.removeItem('wechat_login_token');
        localStorage.removeItem('wechat_openid');
        localStorage.removeItem('wechat_login_time');
        
        // 触发退出登录事件
        const logoutEvent = new CustomEvent('wechatLogout');
        window.dispatchEvent(logoutEvent);
    }

    // 打开登录弹窗
    function openLogin() {
        createStyles();
        createModal();
        modal.style.display = 'block';
        generateQRCode();
    }

    // 关闭登录弹窗
    function closeLogin() {
        if (modal) {
            modal.style.display = 'none';
        }
        cleanup();
    }

    // 页面卸载时清理资源
    window.addEventListener('beforeunload', cleanup);

    // 暴露全局 API
    window.WechatLogin = {
        open: openLogin,
        close: closeLogin,
        generateQR: generateQRCode,
        checkStatus: checkLoginStatus,
        logout: logout,
        version: '1.0.0'
    };

})();