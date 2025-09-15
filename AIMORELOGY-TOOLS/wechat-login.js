// 微信登录模块 - 模块化版本
// 支持用户等级管理和使用次数统计

class WeChatLoginModule {
    constructor(options = {}) {
        this.config = {
            apiBaseUrl: 'https://aimorelogybackend.site',
            pollInterval: 2000,
            qrExpireTime: 600000,
            storageKey: 'wechat_user_info',
            ...options
        };
        
        this.sessionId = null;
        this.pollTimer = null;
        this.expireTimer = null;
        this.currentUser = null;
        
        console.log('WeChatLoginModule构造函数被调用');
        
        // 立即检查登录状态
        setTimeout(() => {
            this.checkLoginStatus().catch(error => {
                console.error('检查登录状态失败:', error);
            });
        }, 100);
    }

    // 检查本地存储的登录状态
    async checkLoginStatus() {
        console.log('开始检查登录状态...');
        const stored = localStorage.getItem(this.config.storageKey);
        console.log('本地存储数据:', stored);
        
        if (stored) {
            try {
                const userData = JSON.parse(stored);
                console.log('解析的用户数据:', userData);
                
                // 检查 token 是否过期
                if (userData.token && userData.expireTime > Date.now()) {
                    console.log('Token未过期，验证服务器端有效性...');
                    // 验证服务器端token有效性
                    const isValid = await this.validateToken(userData.token);
                    console.log('服务器端验证结果:', isValid);
                    
                    if (isValid) {
                        this.currentUser = userData;
                        console.log('登录状态恢复成功:', userData);
                        this.onLoginStatusChange(true, userData);
                        return true;
                    } else {
                        console.log('服务器端验证失败，清除本地数据');
                    }
                } else {
                    console.log('Token已过期，清除本地数据');
                }
            } catch (error) {
                console.error('解析用户数据失败:', error);
            }
        } else {
            console.log('本地无存储数据');
        }
        
        // 清除过期或无效数据
        if (stored) {
            localStorage.removeItem(this.config.storageKey);
            console.log('已清除本地存储数据');
        }
        
        this.currentUser = null;
        this.onLoginStatusChange(false, null);
        return false;
    }

    // 验证token有效性
    async validateToken(token) {
        try {
            console.log('验证token:', token);
            const response = await fetch(`${this.config.apiBaseUrl}/validate_token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ token })
            });
            
            console.log('验证响应状态:', response.status);
            const data = await response.json();
            console.log('验证响应数据:', JSON.stringify(data, null, 2));
            
            // 如果验证成功且返回了完整用户数据，更新本地存储
            if (data.success && data.valid && data.user) {
                console.log('Token验证成功，更新本地用户数据');
                const currentData = JSON.parse(localStorage.getItem(this.config.storageKey) || '{}');
                
                // 合并服务器返回的最新数据
                const updatedData = {
                    ...currentData,
                    ...data.user,
                    token: token,  // 保持当前token
                    expireTime: currentData.expireTime,  // 保持过期时间
                    loginTime: currentData.loginTime     // 保持登录时间
                };
                
                localStorage.setItem(this.config.storageKey, JSON.stringify(updatedData));
                console.log('本地用户数据已更新:', updatedData);
                
                // 更新当前用户对象
                this.currentUser = updatedData;
            }
            
            return data.success && data.valid;
        } catch (error) {
            console.error('验证token失败:', error);
            return false;
        }
    }

    // 渲染登录按钮或用户信息
    render(container, skipStatusCheck = false) {
        console.log('render函数被调用，currentUser:', !!this.currentUser);
        
        if (!container) {
            console.error('容器元素不存在');
            return;
        }

        this.container = container;
        // 将实例保存到容器元素上，供全局函数使用
        container._wechatLoginInstance = this;
        
        if (this.currentUser) {
            console.log('渲染用户信息');
            this.renderUserInfo();
        } else {
            console.log('渲染登录按钮');
            this.renderLoginButton();
        }
    }

    // 渲染登录按钮
    renderLoginButton() {
        this.container.innerHTML = `
            <div class="wechat-login-module">
                <style>
                    .wechat-login-module {
                        display: inline-block;
                    }
                    
                    .login-btn {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 8px 16px;
                        background: #07c160;
                        color: white;
                        border: none;
                        border-radius: 20px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                        box-shadow: 0 2px 8px rgba(7, 193, 96, 0.3);
                    }
                    
                    .login-btn:hover {
                        background: #06ad56;
                        transform: translateY(-2px);
                        box-shadow: 0 6px 16px rgba(7, 193, 96, 0.4);
                    }
                    
                    .login-btn:active {
                        transform: translateY(0);
                    }
                    
                    .wechat-icon {
                        font-size: 20px;
                    }
                </style>
                
                <button class="login-btn" id="wechat-login-btn">
                    <span class="wechat-icon">💬</span>
                    <span>微信登录</span>
                </button>
            </div>
        `;
        
        // 绑定登录按钮点击事件
        const loginBtn = this.container.querySelector('#wechat-login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('登录按钮被点击');
                this.showLoginModal();
            });
        }
    }

    // 渲染用户信息
    renderUserInfo() {
        console.log('开始渲染用户信息...');
        const user = this.currentUser;
        const levelInfo = this.getUserLevelInfo(user.level);
        
        this.container.innerHTML = `
            <div class="wechat-user-info">
                <style>
                    .wechat-user-info {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 8px 16px;
                        background: white;
                        border-radius: 20px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        font-size: 14px;
                    }
                    
                    .user-avatar {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        object-fit: cover;
                    }
                    
                    .user-details {
                        display: flex;
                        flex-direction: column;
                        gap: 2px;
                    }
                    
                    .user-name {
                        font-weight: 500;
                        color: #333;
                    }
                    
                    .user-id {
                        font-size: 12px;
                        color: #666;
                        margin-bottom: 4px;
                        font-family: monospace;
                    }
                    
                    .user-level {
                        display: inline-block;
                        padding: 2px 8px;
                        border-radius: 10px;
                        font-size: 12px;
                        font-weight: 500;
                        color: white;
                        background: ${levelInfo.color};
                    }
                    
                    .user-usage {
                        color: #666;
                        font-size: 12px;
                    }
                    
                    .user-actions {
                        display: flex;
                        gap: 4px;
                    }
                    
                    .logout-btn, .refresh-btn {
                        background: #f5f5f5;
                        border: none;
                        padding: 4px 8px;
                        border-radius: 12px;
                        cursor: pointer;
                        font-size: 12px;
                        color: #666;
                        transition: background 0.2s;
                    }
                    
                    .logout-btn:hover, .refresh-btn:hover {
                        background: #e0e0e0;
                    }
                    
                    .refresh-btn {
                        padding: 4px 6px;
                        font-size: 10px;
                    }
                    
                    @media (max-width: 768px) {
                        .wechat-user-info {
                            font-size: 12px;
                        }
                        
                        .user-avatar {
                            width: 28px;
                            height: 28px;
                        }
                    }
                </style>
                
                <img class="user-avatar" src="${user.avatar || '/default-avatar.png'}" alt="用户头像" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNmMGYwZjAiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNSIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNNiAyNmMwLTUuNTIzIDQuNDc3LTEwIDEwLTEwczEwIDQuNDc3IDEwIDEwIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo='">
                
                <div class="user-details">
                    <div class="user-name">${user.nickname}</div>
                    <div class="user-id">用户ID: ${user.userid || user.openid}</div>
                    <div>
                        <span class="user-level">${levelInfo.name}</span>
                    </div>
                </div>
                
                <div class="user-actions">
                    <button class="refresh-btn" id="wechat-refresh-btn" title="刷新用户数据">
                        🔄
                    </button>
                    <button class="logout-btn" id="wechat-logout-btn">
                        退出
                    </button>
                </div>
            </div>
        `;
        
        // 立即绑定事件
        this.bindUserInfoEvents();
    }

    // 绑定用户信息按钮事件
    bindUserInfoEvents() {
        console.log('开始绑定用户信息按钮事件...');
        
        // 使用setTimeout确保DOM已经渲染完成
        setTimeout(() => {
            // 绑定退出按钮 - 使用多种方式确保事件绑定成功
            const logoutBtn = this.container.querySelector('#wechat-logout-btn');
            console.log('找到退出按钮:', !!logoutBtn);
            if (logoutBtn) {
                // 方式1: onclick属性
                logoutBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('退出按钮被点击 - onclick方式');
                    this.logout();
                    return false;
                };
                
                // 方式2: addEventListener
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('退出按钮被点击 - addEventListener方式');
                    this.logout();
                    return false;
                });
                
                console.log('退出按钮事件已绑定 - 双重方式');
            }
            
            // 绑定刷新按钮
            const refreshBtn = this.container.querySelector('#wechat-refresh-btn');
            console.log('找到刷新按钮:', !!refreshBtn);
            if (refreshBtn) {
                // 方式1: onclick属性
                refreshBtn.onclick = async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('刷新按钮被点击 - onclick方式');
                    
                    refreshBtn.disabled = true;
                    refreshBtn.textContent = '⏳';
                    
                    try {
                        const success = await this.refreshUserData();
                        if (success) {
                            console.log('用户数据已刷新');
                            this.renderUserInfo();
                        }
                    } catch (error) {
                        console.error('刷新失败:', error);
                    } finally {
                        refreshBtn.disabled = false;
                        refreshBtn.textContent = '🔄';
                    }
                    return false;
                };
                
                // 方式2: addEventListener
                refreshBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('刷新按钮被点击 - addEventListener方式');
                    
                    refreshBtn.disabled = true;
                    refreshBtn.textContent = '⏳';
                    
                    try {
                        const success = await this.refreshUserData();
                        if (success) {
                            console.log('用户数据已刷新');
                            this.renderUserInfo();
                        }
                    } catch (error) {
                        console.error('刷新失败:', error);
                    } finally {
                        refreshBtn.disabled = false;
                        refreshBtn.textContent = '🔄';
                    }
                    return false;
                });
                
                console.log('刷新按钮事件已绑定 - 双重方式');
            }
        }, 200);
    }

    // 显示登录弹窗
    showLoginModal() {
        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'wechat-login-modal';
        modal.innerHTML = `
            <style>
                .wechat-login-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                
                .modal-content {
                    background: white;
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    position: relative;
                }
                
                .close-btn {
                    position: absolute;
                    top: 15px;
                    right: 20px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #999;
                }
                
                .close-btn:hover {
                    color: #333;
                }
                
                .modal-title {
                    font-size: 24px;
                    font-weight: 600;
                    margin-bottom: 10px;
                    color: #333;
                }
                
                .modal-subtitle {
                    color: #666;
                    margin-bottom: 30px;
                    font-size: 14px;
                }
                
                .qr-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }
                
                .qr-code {
                    width: 200px;
                    height: 200px;
                    border: 1px solid #eee;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f9f9f9;
                }
                
                .loading {
                    color: #666;
                    font-size: 14px;
                }
                
                .status {
                    padding: 10px 20px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                }
                
                .status.waiting {
                    background: #e3f2fd;
                    color: #1976d2;
                }
                
                .status.scanned {
                    background: #fff3e0;
                    color: #f57c00;
                }
                
                .status.success {
                    background: #e8f5e8;
                    color: #2e7d32;
                }
                
                .status.error {
                    background: #ffebee;
                    color: #c62828;
                }
                
                .status.expired {
                    background: #fafafa;
                    color: #757575;
                }
            </style>
            
            <div class="modal-content">
                <button class="close-btn" onclick="this.closest('.wechat-login-modal').remove()">&times;</button>
                
                <div class="modal-title">微信登录</div>
                <div class="modal-subtitle">请使用微信扫描二维码登录</div>
                
                <div class="qr-container">
                    <div class="qr-code">
                        <div class="loading">正在生成二维码...</div>
                    </div>
                    <div class="status waiting" id="status">等待扫描</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 点击背景关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // 生成二维码
        this.generateQRCode(modal);
    }

    // 生成二维码
    async generateQRCode(modal) {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/generate_qr`);
            const data = await response.json();
            
            if (data.success) {
                this.sessionId = data.sessionId;
                
                // 显示二维码
                const qrContainer = modal.querySelector('.qr-code');
                qrContainer.innerHTML = `<img src="${data.qrCodeUrl}" alt="微信登录二维码" style="width: 100%; height: 100%; object-fit: contain;">`;
                
                // 开始轮询状态
                this.startPolling(modal);
                
                // 设置过期定时器
                this.expireTimer = setTimeout(() => {
                    this.stopPolling();
                    const statusEl = modal.querySelector('#status');
                    if (statusEl) {
                        statusEl.textContent = '二维码已过期，请重新获取';
                        statusEl.className = 'status expired';
                    }
                }, this.config.qrExpireTime);
            } else {
                throw new Error(data.error || '生成二维码失败');
            }
        } catch (error) {
            console.error('生成二维码失败:', error);
            const qrContainer = modal.querySelector('.qr-code');
            qrContainer.innerHTML = '<div class="loading">生成二维码失败，请重试</div>';
        }
    }

    // 开始轮询登录状态
    startPolling(modal) {
        if (!this.sessionId) return;
        
        this.pollTimer = setInterval(async () => {
            try {
                const response = await fetch(`${this.config.apiBaseUrl}/check_login?sessionId=${this.sessionId}`);
                const data = await response.json();
                
                const statusEl = modal.querySelector('#status');
                
                if (data.status === 'scanned') {
                    statusEl.textContent = '已扫描，请在手机上确认登录';
                    statusEl.className = 'status scanned';
                } else if (data.status === 'success') {
                    statusEl.textContent = '登录成功！';
                    statusEl.className = 'status success';
                    
                    // 保存用户信息
                    const userData = {
                        ...data.userInfo,
                        token: data.token,
                        expireTime: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7天过期
                        loginTime: Date.now()
                    };
                    
                    localStorage.setItem(this.config.storageKey, JSON.stringify(userData));
                    this.currentUser = userData;
                    
                    // 停止轮询
                    this.stopPolling();
                    
                    // 关闭弹窗
                    setTimeout(() => {
                        modal.remove();
                        this.render(this.container);
                        this.onLoginStatusChange(true, userData);
                    }, 1500);
                } else if (data.status === 'expired') {
                    statusEl.textContent = '二维码已过期，请重新获取';
                    statusEl.className = 'status expired';
                    this.stopPolling();
                } else if (data.status === 'error') {
                    statusEl.textContent = data.message || '登录失败，请重试';
                    statusEl.className = 'status error';
                    this.stopPolling();
                }
            } catch (error) {
                console.error('轮询登录状态失败:', error);
            }
        }, this.config.pollInterval);
    }

    // 停止轮询
    stopPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
        if (this.expireTimer) {
            clearTimeout(this.expireTimer);
            this.expireTimer = null;
        }
    }

    // 关闭弹窗
    closeModal() {
        const modal = document.querySelector('.wechat-login-modal');
        if (modal) {
            modal.remove();
        }
        this.stopPolling();
    }

    // 退出登录
    logout() {
        console.log('开始退出登录...');
        
        // 清除本地存储
        localStorage.removeItem(this.config.storageKey);
        console.log('已清除本地存储数据');
        
        // 重置当前用户
        this.currentUser = null;
        
        // 重新渲染界面
        if (this.container) {
            this.renderLoginButton();
        }
        
        // 通知登录状态变化
        this.onLoginStatusChange(false, null);
        
        console.log('退出登录完成');
    }

    // 手动刷新用户数据
    async refreshUserData() {
        console.log('开始刷新用户数据...');
        
        const stored = localStorage.getItem(this.config.storageKey);
        if (!stored) {
            console.log('没有本地存储数据');
            return false;
        }

        try {
            const userData = JSON.parse(stored);
            if (userData.token && userData.expireTime > Date.now()) {
                console.log('强制验证并更新用户数据...');
                const isValid = await this.validateToken(userData.token);
                if (isValid) {
                    console.log('用户数据刷新成功');
                    return true;
                } else {
                    console.log('Token验证失败，清除数据');
                    this.logout();
                    return false;
                }
            }
        } catch (error) {
            console.error('刷新用户数据失败:', error);
        }
        
        return false;
    }

    // 获取用户等级信息
    getUserLevelInfo(level) {
        const levels = {
            'normal': {
                name: '普通用户',
                color: '#909399',
                dailyLimit: 10,
                monthlyLimit: 100
            },
            'vip': {
                name: 'VIP',
                color: '#E6A23C',
                dailyLimit: 50,
                monthlyLimit: 500
            },
            'svip': {
                name: 'SVIP',
                color: '#F56C6C',
                dailyLimit: 200,
                monthlyLimit: 2000
            },
            'admin': {
                name: '管理员',
                color: '#67C23A',
                dailyLimit: -1, // 无限制
                monthlyLimit: -1
            }
        };
        
        return levels[level] || levels['normal'];
    }

    // 获取当前用户信息
    getCurrentUser() {
        return this.currentUser;
    }

    // 检查用户是否有权限使用功能
    checkPermission(requiredLevel = 'normal') {
        if (!this.currentUser) {
            return { allowed: false, reason: '请先登录' };
        }
        
        const levelOrder = ['normal', 'vip', 'svip', 'admin'];
        const userLevelIndex = levelOrder.indexOf(this.currentUser.level);
        const requiredLevelIndex = levelOrder.indexOf(requiredLevel);
        
        if (userLevelIndex < requiredLevelIndex) {
            return { allowed: false, reason: '权限不足' };
        }
        
        // 检查使用次数限制
        const levelInfo = this.getUserLevelInfo(this.currentUser.level);
        const dailyUsage = this.currentUser.usage ? this.currentUser.usage.daily : 0;
        if (levelInfo.dailyLimit > 0 && dailyUsage >= levelInfo.dailyLimit) {
            return { allowed: false, reason: '今日使用次数已达上限' };
        }
        
        return { allowed: true };
    }

    // 使用次数接口 - 增加使用次数
    async incrementUsage(featureType = 'default') {
        if (!this.currentUser) {
            throw new Error('用户未登录');
        }
        
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/update_usage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify({
                    token: this.currentUser.token,
                    action: featureType,
                    amount: 1
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // 更新本地用户信息
                this.currentUser.usage = data.usage;
                localStorage.setItem(this.config.storageKey, JSON.stringify(this.currentUser));
                
                // 更新UI显示
                if (this.container) {
                    this.render(this.container);
                }
                
                return data;
            } else {
                throw new Error(data.error || '更新使用次数失败');
            }
        } catch (error) {
            console.error('增加使用次数失败:', error);
            throw error;
        }
    }

    // 获取使用统计
    async getUsageStats() {
        if (!this.currentUser) {
            throw new Error('用户未登录');
        }
        
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/usage_stats?openid=${this.currentUser.openid}`, {
                headers: {
                    'Authorization': `Bearer ${this.currentUser.token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.stats;
            } else {
                throw new Error(data.error || '获取使用统计失败');
            }
        } catch (error) {
            console.error('获取使用统计失败:', error);
            throw error;
        }
    }

    // 登录状态变化回调 - 可被外部重写
    onLoginStatusChange(isLoggedIn, userData) {
        console.log('登录状态变化:', isLoggedIn ? '已登录' : '未登录', userData);
        
        // 触发自定义事件
        const event = new CustomEvent('wechatLoginStatusChange', {
            detail: { isLoggedIn, userData }
        });
        document.dispatchEvent(event);
    }
}

// 导出模块
window.WeChatLoginModule = WeChatLoginModule;

// 全局退出函数（作为备用方案）
window.wechatLogout = function() {
    console.log('全局退出函数被调用');
    // 查找当前的微信登录实例
    const containers = document.querySelectorAll('[id*="wechat-login"]');
    for (let container of containers) {
        if (container._wechatLoginInstance) {
            console.log('找到微信登录实例，执行退出');
            container._wechatLoginInstance.logout();
            return;
        }
    }
    
    // 如果没找到实例，直接清除本地存储
    console.log('未找到实例，直接清除本地存储');
    localStorage.removeItem('wechat_user_info');
    location.reload();
};