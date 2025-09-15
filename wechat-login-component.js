// 微信登录组件 - GitHub Pages 版本
// 独立 JavaScript 组件，可在任何网站中使用

(function(global) {
    'use strict';

    // 微信登录组件类
    function WeChatLogin(container, config) {
        this.container = container;
        this.config = Object.assign({
            apiBaseUrl: 'https://aimorelogybackend.site',
            pollInterval: 2000,
            qrExpireTime: 600000, // 10分钟
            onLoginSuccess: function(userInfo, token) {
                console.log('登录成功:', userInfo, token);
            },
            onLoginError: function(error) {
                console.error('登录失败:', error);
            },
            onQRExpired: function() {
                console.log('二维码已过期');
            }
        }, config || {});
        
        this.sessionId = null;
        this.pollTimer = null;
        this.expireTimer = null;
        
        this.init();
    }

    WeChatLogin.prototype = {
        init: function() {
            this.render();
            this.createQR();
        },

        render: function() {
            this.container.innerHTML = `
                <div class="wechat-login-wrapper">
                    <style>
                        .wechat-login-wrapper {
                            max-width: 300px;
                            margin: 0 auto;
                            text-align: center;
                        }
                        
                        .qr-container {
                            position: relative;
                            display: inline-block;
                            margin: 20px 0;
                        }
                        
                        .qr-code {
                            width: 200px;
                            height: 200px;
                            border: 2px solid #e0e0e0;
                            border-radius: 12px;
                            display: block;
                            margin: 0 auto;
                        }
                        
                        .qr-loading {
                            width: 200px;
                            height: 200px;
                            border: 2px solid #e0e0e0;
                            border-radius: 12px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: #f8f9fa;
                            color: #666;
                            font-size: 14px;
                        }
                        
                        .qr-overlay {
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(255, 255, 255, 0.9);
                            border-radius: 12px;
                            display: none;
                            align-items: center;
                            justify-content: center;
                            flex-direction: column;
                            font-size: 14px;
                            color: #666;
                        }
                        
                        .login-status {
                            margin: 15px 0;
                            font-size: 14px;
                            color: #666;
                            min-height: 20px;
                        }
                        
                        .login-tips {
                            font-size: 12px;
                            color: #999;
                            line-height: 1.4;
                        }
                        
                        .refresh-btn {
                            background: #07c160;
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 12px;
                            margin-top: 10px;
                        }
                        
                        .refresh-btn:hover {
                            background: #06ad56;
                        }
                        
                        .loading-spinner {
                            display: inline-block;
                            width: 20px;
                            height: 20px;
                            border: 2px solid #f3f3f3;
                            border-top: 2px solid #07c160;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                        }
                        
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        
                        .success-icon {
                            color: #07c160;
                            font-size: 24px;
                            margin-bottom: 10px;
                        }
                        
                        .error-icon {
                            color: #fa5151;
                            font-size: 24px;
                            margin-bottom: 10px;
                        }
                    </style>
                    
                    <div class="qr-container">
                        <div class="qr-loading" id="qr-loading">
                            <div class="loading-spinner"></div>
                        </div>
                        <img class="qr-code" id="qr-code" style="display: none;" alt="微信登录二维码">
                        <div class="qr-overlay" id="qr-overlay">
                            <div id="overlay-content"></div>
                        </div>
                    </div>
                    
                    <div class="login-status" id="login-status">正在生成二维码...</div>
                    
                    <div class="login-tips">
                        请使用微信扫描二维码登录<br>
                        扫码后请在手机上确认登录
                    </div>
                </div>
            `;
        },

        async createQR() {
            try {
                this.showStatus('正在生成二维码...');
                
                const response = await fetch(`${this.config.apiBaseUrl}/create_qr`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (data.success) {
                    this.sessionId = data.sessionId;
                    this.showQR(data.qrUrl);
                    this.startPolling();
                    this.startExpireTimer(data.expireSeconds || 600);
                    this.showStatus('请使用微信扫描二维码');
                } else {
                    throw new Error(data.error || '生成二维码失败');
                }
            } catch (error) {
                console.error('创建二维码失败:', error);
                this.showError('生成二维码失败，请重试');
                this.config.onLoginError(error);
            }
        },

        showQR(qrUrl) {
            const qrLoading = document.getElementById('qr-loading');
            const qrCode = document.getElementById('qr-code');
            
            qrCode.src = qrUrl;
            qrCode.onload = () => {
                qrLoading.style.display = 'none';
                qrCode.style.display = 'block';
            };
            qrCode.onerror = () => {
                this.showError('二维码加载失败');
            };
        },

        startPolling() {
            if (this.pollTimer) {
                clearInterval(this.pollTimer);
            }

            this.pollTimer = setInterval(async () => {
                try {
                    const response = await fetch(`${this.config.apiBaseUrl}/poll?id=${this.sessionId}`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }

                    const data = await response.json();
                    
                    if (data.success) {
                        if (data.status === 'scanned') {
                            this.showScanned();
                        } else if (data.status === 'confirmed') {
                            this.handleLoginSuccess(data.userInfo);
                        }
                    }
                } catch (error) {
                    console.error('轮询状态失败:', error);
                    // 继续轮询，不中断
                }
            }, this.config.pollInterval);
        },

        startExpireTimer(expireSeconds) {
            if (this.expireTimer) {
                clearTimeout(this.expireTimer);
            }

            this.expireTimer = setTimeout(() => {
                this.handleQRExpired();
            }, expireSeconds * 1000);
        },

        showScanned() {
            this.showOverlay(`
                <div class="success-icon">📱</div>
                <div>扫描成功</div>
                <div style="font-size: 12px; margin-top: 5px;">请在手机上确认登录</div>
            `);
            this.showStatus('已扫描，请在手机上确认');
        },

        async handleLoginSuccess(userInfo) {
            this.stopPolling();
            this.stopExpireTimer();
            
            try {
                // 调用完成登录接口获取 token
                const response = await fetch(`${this.config.apiBaseUrl}/finalize_login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionId: this.sessionId,
                        userInfo: userInfo
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    this.showOverlay(`
                        <div class="success-icon">✅</div>
                        <div>登录成功</div>
                        <div style="font-size: 12px; margin-top: 5px;">欢迎 ${userInfo.nickname}</div>
                    `);
                    this.showStatus('登录成功！');
                    
                    // 调用成功回调
                    this.config.onLoginSuccess(userInfo, data.token);
                } else {
                    throw new Error(data.error || '完成登录失败');
                }
            } catch (error) {
                console.error('完成登录失败:', error);
                this.showError('登录失败，请重试');
                this.config.onLoginError(error);
            }
        },

        handleQRExpired() {
            this.stopPolling();
            this.showOverlay(`
                <div class="error-icon">⏰</div>
                <div>二维码已过期</div>
                <button class="refresh-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.__wechatLogin.refresh()">
                    刷新二维码
                </button>
            `);
            this.showStatus('二维码已过期，请刷新');
            this.config.onQRExpired();
        },

        showOverlay(content) {
            const overlay = document.getElementById('qr-overlay');
            const overlayContent = document.getElementById('overlay-content');
            overlayContent.innerHTML = content;
            overlay.style.display = 'flex';
        },

        hideOverlay() {
            const overlay = document.getElementById('qr-overlay');
            overlay.style.display = 'none';
        },

        showStatus(message) {
            const statusEl = document.getElementById('login-status');
            if (statusEl) {
                statusEl.textContent = message;
            }
        },

        showError(message) {
            this.stopPolling();
            this.stopExpireTimer();
            this.showOverlay(`
                <div class="error-icon">❌</div>
                <div>${message}</div>
                <button class="refresh-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.__wechatLogin.refresh()">
                    重新生成
                </button>
            `);
            this.showStatus(message);
        },

        refresh() {
            this.stopPolling();
            this.stopExpireTimer();
            this.hideOverlay();
            
            // 重置显示
            const qrLoading = document.getElementById('qr-loading');
            const qrCode = document.getElementById('qr-code');
            qrLoading.style.display = 'flex';
            qrCode.style.display = 'none';
            
            // 重新创建二维码
            this.createQR();
        },

        stopPolling() {
            if (this.pollTimer) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
            }
        },

        stopExpireTimer() {
            if (this.expireTimer) {
                clearTimeout(this.expireTimer);
                this.expireTimer = null;
            }
        },

        destroy() {
            this.stopPolling();
            this.stopExpireTimer();
            if (this.container) {
                this.container.innerHTML = '';
            }
        }
    };

    // 将组件绑定到容器，方便刷新按钮调用
    WeChatLogin.prototype.init = function() {
        this.container.__wechatLogin = this;
        this.render();
        this.createQR();
    };

    // 导出到全局
    global.WeChatLogin = WeChatLogin;

    // 如果是 CommonJS 环境
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = WeChatLogin;
    }

})(typeof window !== 'undefined' ? window : this);