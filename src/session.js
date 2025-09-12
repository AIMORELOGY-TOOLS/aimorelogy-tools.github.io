// Durable Object: 会话管理
export class Session {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.websockets = new Set();
    this.sessionData = null;
  }

  async fetch(request) {
    const url = new URL(request.url);
    
    // 处理 WebSocket 升级
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocketUpgrade(request);
    }
    
    // 处理扫码通知
    if (url.pathname === '/scan' && request.method === 'POST') {
      return this.handleScanNotification(request);
    }
    
    // 获取会话状态
    if ((url.pathname === '/state' || url.pathname === '/status') && request.method === 'GET') {
      return this.getSessionState();
    }
    
    return new Response('Not Found', { status: 404 });
  }

  // 处理 WebSocket 升级
  async handleWebSocketUpgrade(request) {
    const [client, server] = Object.values(new WebSocketPair());
    
    await this.handleWebSocketConnection(server);
    
    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  // 处理 WebSocket 连接
  async handleWebSocketConnection(websocket) {
    websocket.accept();
    this.websockets.add(websocket);
    
    // 发送当前状态
    const currentState = await this.getCurrentState();
    this.sendToWebSocket(websocket, {
      type: 'state',
      data: currentState
    });
    
    websocket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleWebSocketMessage(websocket, message);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    });
    
    websocket.addEventListener('close', () => {
      this.websockets.delete(websocket);
    });
    
    websocket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      this.websockets.delete(websocket);
    });
  }

  // 处理 WebSocket 消息
  handleWebSocketMessage(websocket, message) {
    console.log('Received WebSocket message:', message);
    
    // 可以在这里处理客户端发送的消息
    switch (message.type) {
      case 'ping':
        this.sendToWebSocket(websocket, { type: 'pong' });
        break;
      case 'getState':
        this.getCurrentState().then(state => {
          this.sendToWebSocket(websocket, {
            type: 'state',
            data: state
          });
        });
        break;
    }
  }

  // 发送消息到 WebSocket
  sendToWebSocket(websocket, message) {
    try {
      websocket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Send WebSocket message error:', error);
      this.websockets.delete(websocket);
    }
  }

  // 广播消息到所有 WebSocket 连接
  broadcastToWebSockets(message) {
    const messageStr = JSON.stringify(message);
    const toRemove = [];
    
    for (const ws of this.websockets) {
      try {
        ws.send(messageStr);
      } catch (error) {
        console.error('Broadcast error:', error);
        toRemove.push(ws);
      }
    }
    
    // 清理失效的连接
    toRemove.forEach(ws => this.websockets.delete(ws));
  }

  // 处理扫码通知
  async handleScanNotification(request) {
    try {
      const data = await request.json();
      console.log('Received scan notification:', data);
      
      if (data.type === 'scan' && data.openid && data.sessionId) {
        // 更新会话数据
        this.sessionData = {
          status: 'scanned',
          openid: data.openid,
          sessionId: data.sessionId,
          timestamp: data.timestamp || Date.now()
        };
        
        // 持久化到存储
        await this.state.storage.put('sessionData', this.sessionData);
        
        // 广播给所有连接的客户端
        this.broadcastToWebSockets({
          type: 'scanned',
          data: this.sessionData
        });
        
        console.log('Session updated:', this.sessionData);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid scan data' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('Handle scan notification error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 获取会话状态
  async getSessionState() {
    const state = await this.getCurrentState();
    return new Response(JSON.stringify(state), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 获取当前状态
  async getCurrentState() {
    if (this.sessionData) {
      return this.sessionData;
    }
    
    // 从持久化存储中获取
    const stored = await this.state.storage.get('sessionData');
    if (stored) {
      this.sessionData = stored;
      return stored;
    }
    
    // 默认状态
    return {
      status: 'waiting',
      timestamp: Date.now()
    };
  }

  // 清理过期会话
  async cleanup() {
    const state = await this.getCurrentState();
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10分钟
    
    if (state.timestamp && (now - state.timestamp) > maxAge) {
      // 清理过期数据
      await this.state.storage.delete('sessionData');
      this.sessionData = null;
      
      // 通知客户端会话过期
      this.broadcastToWebSockets({
        type: 'expired',
        message: '会话已过期，请刷新页面重新生成二维码'
      });
      
      console.log('Session expired and cleaned up');
    }
  }
}