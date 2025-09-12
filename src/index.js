// 微信登录 Cloudflare Worker 主入口
import { Session } from './session.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 添加 CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理 OPTIONS 请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 路由处理
      if (url.pathname === '/wechat-callback') {
        return await handleWechatCallback(request, env, ctx);
      } else if (url.pathname === '/create_qr') {
        return await handleCreateQR(request, env);
      } else if (url.pathname === '/poll') {
        return await handlePoll(request, env);
      } else if (url.pathname === '/finalize_login') {
        return await handleFinalizeLogin(request, env);
      } else if (url.pathname === '/get_user_info') {
        return await handleGetUserInfo(request, env);
      } else if (url.pathname === '/update_usage') {
        return await handleUpdateUsage(request, env);
      } else if (url.pathname === '/check_permission') {
        return await handleCheckPermission(request, env);
      } else if (url.pathname === '/test_create_user') {
        return await handleTestCreateUser(request, env);
      } else if (url.pathname === '/ws') {
        return await handleWsUpgrade(request, env);
      } else if (url.pathname === '/health') {
        return await handleHealthCheck(request);
      } else if (url.pathname === '/admin/list_all_keys') {
        return await handleAdminListKeys(request, env);
      } else if (url.pathname === '/admin/get_user') {
        return await handleAdminGetUser(request, env);
      } else if (url.pathname === '/admin/update_user') {
        return await handleAdminUpdateUser(request, env);
      } else if (url.pathname === '/admin/delete_user') {
        return await handleAdminDeleteUser(request, env);
      } else if (url.pathname === '/admin/clear_all_users') {
        return await handleAdminClearAllUsers(request, env);
      } else if (url.pathname === '/') {
        return await handleHomePage(request);
      } else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('Worker 错误:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message || '服务器内部错误'
      }), { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
  }
};

// 微信回调处理
async function handleWechatCallback(request, env, ctx) {
  const url = new URL(request.url);
  
  // GET 请求：微信服务器验证
  if (request.method === 'GET') {
    const signature = url.searchParams.get('signature');
    const timestamp = url.searchParams.get('timestamp');
    const nonce = url.searchParams.get('nonce');
    const echostr = url.searchParams.get('echostr');
    
    console.log('微信验证请求参数:', {
      signature,
      timestamp,
      nonce,
      echostr,
      token: env.WECHAT_TOKEN ? '已配置' : '未配置'
    });
    
    const isValid = await verifySignature(signature, timestamp, nonce, env.WECHAT_TOKEN);
    console.log('签名验证结果:', isValid);
    
    if (isValid) {
      console.log('验证成功，返回 echostr:', echostr);
      return new Response(echostr);
    } else {
      console.log('验证失败，返回 403');
      return new Response('Forbidden', { status: 403 });
    }
  }
  
  // POST 请求：处理微信事件推送
  if (request.method === 'POST') {
    return await handleWechatEvent(request, env, ctx);
  }
  
  return new Response('Method Not Allowed', { status: 405 });
}

// 处理微信事件推送
async function handleWechatEvent(request, env, ctx) {
  console.log('收到微信事件推送');
  
  try {
    // 读取请求数据
    const xmlData = await request.text();
    console.log('微信推送数据:', xmlData);
    
    // 解析 XML 数据
    const toUser = extractXmlValue(xmlData, 'ToUserName');
    const fromUser = extractXmlValue(xmlData, 'FromUserName');
    const msgType = extractXmlValue(xmlData, 'MsgType');
    const event = extractXmlValue(xmlData, 'Event');
    const eventKey = extractXmlValue(xmlData, 'EventKey');
    
    // 异步处理扫码登录逻辑
    if (msgType === 'event' && (event === 'SCAN' || event === 'subscribe')) {
      ctx.waitUntil(processLoginEvent(env, fromUser, event, eventKey));
    }
    
    // 立即返回标准的微信 XML 响应格式
    const responseXml = `<xml>
<ToUserName><![CDATA[${fromUser}]]></ToUserName>
<FromUserName><![CDATA[${toUser}]]></FromUserName>
<CreateTime>${Math.floor(Date.now() / 1000)}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[登录成功！]]></Content>
</xml>`;

    return new Response(responseXml, {
      headers: { 
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('处理微信事件错误:', error);
    
    // 即使出错也返回成功的 XML 响应
    const errorResponseXml = `<xml>
<ToUserName><![CDATA[user]]></ToUserName>
<FromUserName><![CDATA[system]]></FromUserName>
<CreateTime>${Math.floor(Date.now() / 1000)}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[]]></Content>
</xml>`;

    return new Response(errorResponseXml, {
      headers: { 
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

// 获取微信用户基本信息
async function getWechatUserInfo(env, openid) {
  try {
    // 获取访问令牌
    const accessToken = await getWechatAccessToken(env);
    if (!accessToken) {
      console.error('无法获取微信访问令牌');
      return null;
    }

    // 调用微信API获取用户基本信息
    const apiUrl = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${accessToken}&openid=${openid}&lang=zh_CN`;
    
    console.log('调用微信用户信息API:', apiUrl);
    const response = await fetch(apiUrl);
    const userInfo = await response.json();
    
    console.log('微信用户信息响应:', userInfo);
    
    if (userInfo.errcode) {
      console.error('获取微信用户信息失败:', userInfo.errmsg);
      return null;
    }
    
    return {
      openid: userInfo.openid,
      nickname: userInfo.nickname || '',
      sex: userInfo.sex || 0,
      province: userInfo.province || '',
      city: userInfo.city || '',
      country: userInfo.country || '',
      headimgurl: userInfo.headimgurl || '',
      subscribe_time: userInfo.subscribe_time || 0,
      unionid: userInfo.unionid || '',
      remark: userInfo.remark || '',
      groupid: userInfo.groupid || 0,
      tagid_list: userInfo.tagid_list || [],
      subscribe_scene: userInfo.subscribe_scene || '',
      qr_scene: userInfo.qr_scene || 0,
      qr_scene_str: userInfo.qr_scene_str || ''
    };
  } catch (error) {
    console.error('获取微信用户信息异常:', error);
    return null;
  }
}

// 生成唯一的用户ID
async function generateUniqueUserId(env, nickname, openid) {
  try {
    // 如果没有昵称，使用openid后6位
    if (!nickname || nickname.trim() === '') {
      return `用户${openid.slice(-6)}`;
    }
    
    // 清理昵称，移除特殊字符
    const cleanNickname = nickname.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
    if (cleanNickname === '') {
      return `用户${openid.slice(-6)}`;
    }
    
    // 检查昵称是否已存在
    const allUsers = await env.WECHAT_KV.list({ prefix: 'user:' });
    const existingUserIds = new Set();
    
    for (const key of allUsers.keys) {
      try {
        const userData = await env.WECHAT_KV.get(key.name);
        if (userData) {
          const user = JSON.parse(userData);
          if (user.userid) {
            existingUserIds.add(user.userid);
          }
        }
      } catch (error) {
        console.error('读取用户数据失败:', error);
      }
    }
    
    // 如果昵称不重复，直接使用
    if (!existingUserIds.has(cleanNickname)) {
      return cleanNickname;
    }
    
    // 如果昵称重复，添加编号
    let counter = 1;
    let uniqueUserId = `${cleanNickname}${counter}`;
    
    while (existingUserIds.has(uniqueUserId)) {
      counter++;
      uniqueUserId = `${cleanNickname}${counter}`;
    }
    
    return uniqueUserId;
  } catch (error) {
    console.error('生成唯一用户ID失败:', error);
    return `用户${openid.slice(-6)}`;
  }
}

// 异步处理登录事件
async function processLoginEvent(env, fromUser, event, eventKey) {
  try {
    let sessionId = '';
    
    if (event === 'subscribe' && eventKey && eventKey.startsWith('qrscene_')) {
      sessionId = eventKey.replace('qrscene_', '');
    } else if (event === 'SCAN') {
      sessionId = eventKey;
    }

    if (sessionId && fromUser) {
      console.log(`处理登录事件: 用户=${fromUser}, 会话=${sessionId}`);
      
      // 获取微信用户基本信息
      const wechatUserInfo = await getWechatUserInfo(env, fromUser);
      console.log('获取到的微信用户信息:', wechatUserInfo);
      
      const objId = env.SESSIONS.idFromName(`session:${sessionId}`);
      const sessionObj = env.SESSIONS.get(objId);
      
      await sessionObj.fetch('https://internal/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'scan',
          openid: fromUser,
          sessionId: sessionId,
          timestamp: Date.now(),
          wechatUserInfo: wechatUserInfo // 传递微信用户信息
        })
      });
      
      console.log(`扫码登录处理完成: ${fromUser} -> ${sessionId}`);
    }
  } catch (error) {
    console.error('异步处理登录事件错误:', error);
  }
}

// 创建二维码
async function handleCreateQR(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const sessionId = generateSessionId();
    
    // 获取微信 access_token
    const accessToken = await getWechatAccessToken(env);
    
    // 创建带参二维码
    const qrResponse = await fetch(`https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expire_seconds: 600,
        action_name: "QR_STR_SCENE",
        action_info: {
          scene: {
            scene_str: sessionId
          }
        }
      })
    });

    if (!qrResponse.ok) {
      console.error('微信 API 请求失败:', qrResponse.status, qrResponse.statusText);
      throw new Error(`微信 API 请求失败: ${qrResponse.status} ${qrResponse.statusText}`);
    }

    const qrData = await qrResponse.json();
    console.log('微信二维码 API 响应:', qrData);
    
    if (qrData.errcode && qrData.errcode !== 0) {
      console.error('微信 API 返回错误:', qrData);
      throw new Error(`微信 API 错误 ${qrData.errcode}: ${qrData.errmsg || '未知错误'}`);
    }

    const qrUrl = `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(qrData.ticket)}`;

    const responseData = {
      success: true,
      sessionId: sessionId,
      qrUrl: qrUrl,
      ticket: qrData.ticket,
      expireSeconds: 600
    };
    
    return new Response(JSON.stringify(responseData), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });

  } catch (error) {
    console.error('创建二维码错误:', error);
    return new Response(JSON.stringify({ 
      error: '创建二维码失败',
      message: error.message || '未知错误'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
}

// 完成登录
async function handleFinalizeLogin(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '仅支持 POST 请求' }), {
      status: 405,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });
  }

  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return new Response(JSON.stringify({ error: '缺少会话ID' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }

    const objId = env.SESSIONS.idFromName(`session:${sessionId}`);
    const sessionObj = env.SESSIONS.get(objId);
    
    const response = await sessionObj.fetch('https://internal/status');
    const data = await response.json();
    
    if ((data.status === 'scanned' || data.status === 'success') && data.openid) {
      console.log('开始处理登录完成，openid:', data.openid);
      console.log('会话数据:', data);
      
      // 获取或创建用户信息，传递微信用户信息
      const userInfo = await getOrCreateUser(env, data.openid, data.wechatUserInfo);
      console.log('用户信息创建/获取完成:', userInfo);
      
      // 生成登录 token
      const token = generateLoginToken(data.openid);
      const loginTime = new Date().toISOString();
      
      // 更新最后登录时间
      await updateUserLastLogin(env, data.openid, loginTime);
      console.log('登录完成处理结束');
      
      return new Response(JSON.stringify({
        success: true,
        token: token,
        openid: data.openid,
        userid: userInfo.userid, // 返回用户ID
        loginTime: loginTime,
        userInfo: userInfo
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false,
        error: '登录未完成或会话无效' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }
  } catch (error) {
    console.error('完成登录错误:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: '登录处理失败',
      message: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });
  }
}

// 轮询会话状态
async function handlePoll(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const url = new URL(request.url);
  const sessionId = url.searchParams.get('id');
  
  if (!sessionId) {
    return new Response(JSON.stringify({ error: '缺少会话ID' }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });
  }

  try {
    const objId = env.SESSIONS.idFromName(`session:${sessionId}`);
    const sessionObj = env.SESSIONS.get(objId);
    
    const response = await sessionObj.fetch('https://internal/status');
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });
  } catch (error) {
    console.error('轮询状态错误:', error);
    return new Response(JSON.stringify({ 
      status: 'pending',
      error: error.message 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });
  }
}

// WebSocket 升级处理
async function handleWsUpgrade(request, env) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('id');
  
  if (!sessionId) {
    return new Response('Missing session ID', { status: 400 });
  }

  const upgradeHeader = request.headers.get('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  try {
    const objId = env.SESSIONS.idFromName(`session:${sessionId}`);
    const sessionObj = env.SESSIONS.get(objId);
    
    return await sessionObj.fetch(request);
  } catch (error) {
    console.error('WebSocket 升级错误:', error);
    return new Response('WebSocket upgrade failed', { status: 500 });
  }
}

// 主页处理
async function handleHomePage(request) {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>微信扫码登录</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
        }
        .container { 
            background: white; padding: 2rem; border-radius: 16px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 90%;
        }
        h1 { color: #333; margin-bottom: 1.5rem; font-size: 1.8rem; }
        .qr-container { 
            margin: 2rem 0; padding: 1rem; background: #f8f9fa; 
            border-radius: 12px; border: 2px dashed #dee2e6;
        }
        #qrcode { margin: 1rem 0; }
        .status { 
            padding: 0.75rem; border-radius: 8px; margin: 1rem 0; 
            font-weight: 500; transition: all 0.3s ease;
        }
        .status.pending { background: #fff3cd; color: #856404; }
        .status.scanned { background: #d1ecf1; color: #0c5460; }
        .status.success { background: #d4edda; color: #155724; }
        .status.error { background: #f8d7da; color: #721c24; }
        button { 
            background: #007bff; color: white; border: none; padding: 0.75rem 1.5rem;
            border-radius: 8px; cursor: pointer; font-size: 1rem; transition: all 0.3s ease;
        }
        button:hover { background: #0056b3; transform: translateY(-1px); }
        button:disabled { background: #6c757d; cursor: not-allowed; transform: none; }
        .loading { display: inline-block; width: 20px; height: 20px; border: 2px solid #f3f3f3; 
                   border-top: 2px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 微信扫码登录</h1>
        <div class="qr-container">
            <div id="qrcode">点击下方按钮生成二维码</div>
        </div>
        <div id="status" class="status pending">等待生成二维码...</div>
        <button id="generateBtn" onclick="generateQR()">生成登录二维码</button>
        
        <script>
            let sessionId = null;
            let pollInterval = null;
            
            async function generateQR() {
                const btn = document.getElementById('generateBtn');
                const qrDiv = document.getElementById('qrcode');
                const statusDiv = document.getElementById('status');
                
                btn.disabled = true;
                btn.innerHTML = '<span class="loading"></span> 生成中...';
                statusDiv.textContent = '正在生成二维码...';
                statusDiv.className = 'status pending';
                
                try {
                    const response = await fetch('/create_qr', { method: 'POST' });
                    const data = await response.json();
                    
                    if (data.error) {
                        throw new Error(data.message || data.error);
                    }
                    
                    sessionId = data.sessionId;
                    qrDiv.innerHTML = \`<img src="\${data.qrUrl}" alt="微信二维码" style="max-width: 200px; border-radius: 8px;">\`;
                    statusDiv.textContent = '请使用微信扫描二维码登录';
                    statusDiv.className = 'status pending';
                    
                    btn.innerHTML = '重新生成';
                    btn.disabled = false;
                    
                    startPolling();
                } catch (error) {
                    console.error('生成二维码失败:', error);
                    statusDiv.textContent = \`生成失败: \${error.message}\`;
                    statusDiv.className = 'status error';
                    btn.innerHTML = '重试';
                    btn.disabled = false;
                }
            }
            
            function startPolling() {
                if (pollInterval) clearInterval(pollInterval);
                
                pollInterval = setInterval(async () => {
                    try {
                        const response = await fetch(\`/poll?id=\${sessionId}\`);
                        const data = await response.json();
                        
                        const statusDiv = document.getElementById('status');
                        
                        if (data.status === 'scanned') {
                            statusDiv.textContent = \`扫码成功！用户: \${data.openid}\`;
                            statusDiv.className = 'status scanned';
                        } else if (data.status === 'success') {
                            statusDiv.textContent = \`登录成功！欢迎 \${data.openid}\`;
                            statusDiv.className = 'status success';
                            clearInterval(pollInterval);
                        }
                    } catch (error) {
                        console.error('轮询错误:', error);
                    }
                }, 2000);
                
                // 10分钟后停止轮询
                setTimeout(() => {
                    if (pollInterval) {
                        clearInterval(pollInterval);
                        document.getElementById('status').textContent = '二维码已过期，请重新生成';
                        document.getElementById('status').className = 'status error';
                    }
                }, 600000);
            }
        </script>
    </div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// 工具函数
function generateSessionId() {
  return crypto.randomUUID();
}

function generateLoginToken(openid) {
  const timestamp = Date.now();
  const randomStr = crypto.randomUUID();
  const tokenData = `${openid}:${timestamp}:${randomStr}`;
  
  // 简单的 base64 编码作为 token
  return btoa(tokenData);
}

async function getWechatAccessToken(env) {
  const cacheKey = 'wechat_access_token';
  
  try {
    const cached = await env.WECHAT_KV.get(cacheKey);
    if (cached) {
      const tokenData = JSON.parse(cached);
      if (Date.now() < tokenData.expires) {
        return tokenData.token;
      }
    }
  } catch (error) {
    console.log('获取缓存 token 失败:', error);
  }

  const response = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${env.WECHAT_APPID}&secret=${env.WECHAT_SECRET}`);
  
  if (!response.ok) {
    console.error('获取 access_token 请求失败:', response.status, response.statusText);
    throw new Error(`获取 access_token 请求失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('微信 access_token API 响应:', data);
  
  if (data.errcode && data.errcode !== 0) {
    console.error('获取 access_token 失败:', data);
    throw new Error(`获取 access_token 失败 ${data.errcode}: ${data.errmsg || '未知错误'}`);
  }

  const tokenData = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 300) * 1000
  };

  try {
    await env.WECHAT_KV.put(cacheKey, JSON.stringify(tokenData));
  } catch (error) {
    console.log('缓存 token 失败:', error);
  }

  return data.access_token;
}

async function verifySignature(signature, timestamp, nonce, token) {
  if (!signature || !timestamp || !nonce || !token) {
    console.log('签名验证失败：缺少必要参数', {
      hasSignature: !!signature,
      hasTimestamp: !!timestamp,
      hasNonce: !!nonce,
      hasToken: !!token
    });
    return false;
  }

  const array = [token, timestamp, nonce].sort();
  const str = array.join('');
  
  console.log('签名验证计算:', {
    originalArray: [token, timestamp, nonce],
    sortedArray: array,
    joinedString: str
  });
  
  const hash = await sha1(str);
  console.log('签名对比:', {
    expected: signature,
    calculated: hash,
    match: signature === hash
  });
  
  return signature === hash;
}

async function sha1(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const buffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function extractXmlValue(xml, tagName) {
  const regex = new RegExp(`<${tagName}><!\\[CDATA\\[([^\\]]+)\\]\\]></${tagName}>|<${tagName}>([^<]+)</${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? (match[1] || match[2] || '').trim() : '';
}

// 用户管理相关函数

// 获取用户信息
async function handleGetUserInfo(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '仅支持 POST 请求' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const { token } = await request.json();
    
    if (!token) {
      return new Response(JSON.stringify({ error: '缺少认证令牌' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const openid = extractOpenidFromToken(token);
    if (!openid) {
      return new Response(JSON.stringify({ error: '无效的认证令牌' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const userInfo = await getUserInfo(env, openid);
    
    return new Response(JSON.stringify({
      success: true,
      userInfo: userInfo
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    return new Response(JSON.stringify({
      error: '获取用户信息失败',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// 更新使用次数
async function handleUpdateUsage(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '仅支持 POST 请求' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const { token, action, amount = 1 } = await request.json();
    
    if (!token) {
      return new Response(JSON.stringify({ error: '缺少认证令牌' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const openid = extractOpenidFromToken(token);
    if (!openid) {
      return new Response(JSON.stringify({ error: '无效的认证令牌' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const result = await updateUserUsage(env, openid, action, amount);
    
    return new Response(JSON.stringify({
      success: true,
      usage: result
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('更新使用次数错误:', error);
    return new Response(JSON.stringify({
      error: '更新使用次数失败',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// 测试用户创建
async function handleTestCreateUser(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const testOpenid = 'test_user_' + Date.now();
    console.log('测试创建用户，openid:', testOpenid);
    
    // 检查KV绑定是否存在
    console.log('检查KV绑定:', typeof env.WECHAT_KV);
    
    // 直接测试KV写入
    const testKey = `test:${Date.now()}`;
    const testValue = JSON.stringify({ test: true, timestamp: Date.now() });
    
    console.log('尝试直接写入KV，key:', testKey);
    await env.WECHAT_KV.put(testKey, testValue);
    console.log('KV写入完成');
    
    // 立即读取验证
    const readBack = await env.WECHAT_KV.get(testKey);
    console.log('KV读取结果:', readBack);
    
    // 现在测试用户创建
    const userInfo = await getOrCreateUser(env, testOpenid);
    console.log('测试用户创建完成:', userInfo);
    
    // 验证用户是否真的保存了
    const savedUser = await env.WECHAT_KV.get(`user:${testOpenid}`);
    console.log('验证保存的用户数据:', savedUser);
    
    // 列出所有键
    const allKeys = await env.WECHAT_KV.list();
    console.log('KV中所有键:', allKeys);
    
    return new Response(JSON.stringify({
      success: true,
      testOpenid: testOpenid,
      userInfo: userInfo,
      savedData: savedUser ? JSON.parse(savedUser) : null,
      kvTest: {
        testKey: testKey,
        testValue: testValue,
        readBack: readBack
      },
      allKeys: allKeys
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    console.error('测试用户创建失败:', error);
    return new Response(JSON.stringify({
      error: '测试用户创建失败',
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// 检查权限
async function handleCheckPermission(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '仅支持 POST 请求' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const { token, action, requiredLevel = 'normal' } = await request.json();
    
    if (!token) {
      return new Response(JSON.stringify({ error: '缺少认证令牌' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const openid = extractOpenidFromToken(token);
    if (!openid) {
      return new Response(JSON.stringify({ error: '无效的认证令牌' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const permission = await checkUserPermission(env, openid, action, requiredLevel);
    
    return new Response(JSON.stringify({
      success: true,
      permission: permission
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('检查权限错误:', error);
    return new Response(JSON.stringify({
      error: '检查权限失败',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// 获取或创建用户
async function getOrCreateUser(env, openid, wechatUserInfo = null) {
  try {
    const userKey = `user:${openid}`;
    const existingUser = await env.WECHAT_KV.get(userKey);
    
    if (existingUser) {
      const user = JSON.parse(existingUser);
      
      // 如果是现有用户但没有userid，为其生成userid
      if (!user.userid && wechatUserInfo) {
        const userid = await generateUniqueUserId(env, wechatUserInfo.nickname, openid);
        user.userid = userid;
        
        // 更新用户信息
        if (wechatUserInfo.nickname) user.nickname = wechatUserInfo.nickname;
        if (wechatUserInfo.headimgurl) user.avatar = wechatUserInfo.headimgurl;
        
        await env.WECHAT_KV.put(userKey, JSON.stringify(user));
        console.log(`为现有用户 ${openid} 生成userid: ${userid}`);
      }
      
      return user;
    }
    
    // 创建新用户
    let nickname = `用户${openid.slice(-6)}`;
    let avatar = '';
    let userid = nickname;
    
    // 如果有微信用户信息，使用真实信息
    if (wechatUserInfo) {
      if (wechatUserInfo.nickname) {
        nickname = wechatUserInfo.nickname;
      }
      if (wechatUserInfo.headimgurl) {
        avatar = wechatUserInfo.headimgurl;
      }
      
      // 生成唯一的userid
      userid = await generateUniqueUserId(env, wechatUserInfo.nickname, openid);
    }
    
    const newUser = {
      openid: openid,
      userid: userid, // 新增：唯一用户ID
      level: 'normal', // 默认等级：普通用户
      nickname: nickname, // 真实昵称或默认昵称
      avatar: avatar, // 头像URL
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      usage: {
        total: 0,
        daily: 0,
        lastResetDate: new Date().toISOString().split('T')[0]
      },
      limits: getUserLimits('normal'),
      // 保存完整的微信用户信息（可选）
      wechatInfo: wechatUserInfo || null
    };
    
    await env.WECHAT_KV.put(userKey, JSON.stringify(newUser));
    console.log(`创建新用户: openid=${openid}, userid=${userid}, nickname=${nickname}`);
    
    return newUser;
  } catch (error) {
    console.error('获取或创建用户失败:', error);
    throw error;
  }
}

// 获取用户信息
async function getUserInfo(env, openid) {
  try {
    const userKey = `user:${openid}`;
    const userData = await env.WECHAT_KV.get(userKey);
    
    if (!userData) {
      throw new Error('用户不存在');
    }
    
    const user = JSON.parse(userData);
    
    // 检查是否需要重置每日使用次数
    const today = new Date().toISOString().split('T')[0];
    if (user.usage.lastResetDate !== today) {
      user.usage.daily = 0;
      user.usage.lastResetDate = today;
      await env.WECHAT_KV.put(userKey, JSON.stringify(user));
    }
    
    return user;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
}

// 更新用户最后登录时间
async function updateUserLastLogin(env, openid, loginTime) {
  try {
    const userKey = `user:${openid}`;
    const userData = await env.WECHAT_KV.get(userKey);
    
    if (userData) {
      const user = JSON.parse(userData);
      user.lastLoginAt = loginTime;
      await env.WECHAT_KV.put(userKey, JSON.stringify(user));
    }
  } catch (error) {
    console.error('更新最后登录时间失败:', error);
  }
}

// 更新用户使用次数
async function updateUserUsage(env, openid, action, amount = 1) {
  try {
    const user = await getUserInfo(env, openid);
    
    user.usage.total += amount;
    user.usage.daily += amount;
    
    const userKey = `user:${openid}`;
    await env.WECHAT_KV.put(userKey, JSON.stringify(user));
    
    console.log(`用户 ${openid} 使用次数更新: ${action} +${amount}`);
    
    return user.usage;
  } catch (error) {
    console.error('更新使用次数失败:', error);
    throw error;
  }
}

// 检查用户权限
async function checkUserPermission(env, openid, action, requiredLevel = 'normal') {
  try {
    const user = await getUserInfo(env, openid);
    
    // 检查用户等级权限
    const levelPermission = checkLevelPermission(user.level, requiredLevel);
    if (!levelPermission.allowed) {
      return levelPermission;
    }
    
    // 检查使用次数限制
    const usagePermission = checkUsageLimit(user);
    if (!usagePermission.allowed) {
      return usagePermission;
    }
    
    return {
      allowed: true,
      user: user,
      remainingUsage: user.limits.daily - user.usage.daily
    };
    
  } catch (error) {
    console.error('检查权限失败:', error);
    return {
      allowed: false,
      reason: '权限检查失败'
    };
  }
}

// 检查等级权限
function checkLevelPermission(userLevel, requiredLevel) {
  const levels = {
    'normal': 1,
    'vip': 2,
    'svip': 3,
    'admin': 4
  };
  
  const userLevelNum = levels[userLevel] || 0;
  const requiredLevelNum = levels[requiredLevel] || 1;
  
  if (userLevelNum >= requiredLevelNum) {
    return { allowed: true };
  } else {
    return {
      allowed: false,
      reason: `需要 ${requiredLevel} 及以上等级，当前等级：${userLevel}`
    };
  }
}

// 检查使用次数限制
function checkUsageLimit(user) {
  if (user.level === 'admin') {
    return { allowed: true }; // 管理员无限制
  }
  
  if (user.usage.daily >= user.limits.daily) {
    return {
      allowed: false,
      reason: `今日使用次数已达上限 (${user.limits.daily}次)`
    };
  }
  
  return { allowed: true };
}

// 获取用户等级限制
function getUserLimits(level) {
  const limits = {
    'normal': {
      daily: 10,
      features: ['basic']
    },
    'vip': {
      daily: 50,
      features: ['basic', 'advanced']
    },
    'svip': {
      daily: 200,
      features: ['basic', 'advanced', 'premium']
    },
    'admin': {
      daily: -1, // 无限制
      features: ['basic', 'advanced', 'premium', 'admin']
    }
  };
  
  return limits[level] || limits['normal'];
}

// 从token中提取openid
function extractOpenidFromToken(token) {
  try {
    const decoded = atob(token);
    const parts = decoded.split(':');
    return parts[0] || null;
  } catch (error) {
    console.error('解析token失败:', error);
    return null;
  }
}

// 健康检查端点
async function handleHealthCheck(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'wechat-login-worker'
  }), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

// 管理员API：获取所有KV键
async function handleAdminListKeys(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    console.log('管理员请求：获取所有KV键');
    
    // 获取所有键
    const keys = await env.WECHAT_KV.list();
    
    console.log('KV键列表:', keys);
    
    return new Response(JSON.stringify({
      success: true,
      keys: keys.keys,
      total: keys.keys.length,
      list_complete: keys.list_complete
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('获取KV键失败:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// 管理员API：获取用户数据
async function handleAdminGetUser(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    
    if (!key) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少key参数'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    console.log('管理员请求：获取用户数据', key);
    
    const userData = await env.WECHAT_KV.get(key);
    
    if (!userData) {
      return new Response(JSON.stringify({
        success: false,
        error: '用户不存在'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const user = JSON.parse(userData);
    
    return new Response(JSON.stringify({
      success: true,
      user: user
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('获取用户数据失败:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// 管理员API：更新用户数据
async function handleAdminUpdateUser(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { 
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    const { openid, updates } = await request.json();
    
    if (!openid || !updates) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少必要参数'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    console.log('管理员请求：更新用户数据', openid, updates);
    
    // 获取现有用户数据
    const key = `user:${openid}`;
    const existingData = await env.WECHAT_KV.get(key);
    
    if (!existingData) {
      return new Response(JSON.stringify({
        success: false,
        error: '用户不存在'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const user = JSON.parse(existingData);
    
    // 更新用户数据
    if (updates.nickname !== undefined) {
      user.nickname = updates.nickname;
    }
    
    if (updates.level !== undefined) {
      user.level = updates.level;
      // 更新等级限制
      user.limits = getUserLimits(updates.level);
    }
    
    // 保存更新后的数据
    await env.WECHAT_KV.put(key, JSON.stringify(user));
    
    return new Response(JSON.stringify({
      success: true,
      user: user
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('更新用户数据失败:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// 管理员API：删除用户
async function handleAdminDeleteUser(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method !== 'DELETE') {
    return new Response('Method Not Allowed', { 
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    const { openid } = await request.json();
    
    if (!openid) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少openid参数'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    console.log('管理员请求：删除用户', openid);
    
    const key = `user:${openid}`;
    
    // 检查用户是否存在
    const existingData = await env.WECHAT_KV.get(key);
    if (!existingData) {
      return new Response(JSON.stringify({
        success: false,
        error: '用户不存在'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 删除用户数据
    await env.WECHAT_KV.delete(key);
    
    return new Response(JSON.stringify({
      success: true,
      message: '用户删除成功'
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// 清除所有用户数据
async function handleAdminClearAllUsers(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: '只支持POST请求'
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  try {
    console.log('开始清除所有用户数据...');
    
    // 获取所有用户键
    const listResult = await env.WECHAT_KV.list({ prefix: 'user:' });
    const userKeys = listResult.keys.map(key => key.name);
    
    console.log(`找到 ${userKeys.length} 个用户记录`);
    
    // 批量删除用户数据
    let deletedCount = 0;
    for (const key of userKeys) {
      try {
        await env.WECHAT_KV.delete(key);
        deletedCount++;
        console.log(`删除用户: ${key}`);
      } catch (error) {
        console.error(`删除用户 ${key} 失败:`, error);
      }
    }
    
    // 也清除测试数据
    const testKeys = await env.WECHAT_KV.list({ prefix: 'test:' });
    for (const key of testKeys.keys) {
      try {
        await env.WECHAT_KV.delete(key.name);
        console.log(`删除测试数据: ${key.name}`);
      } catch (error) {
        console.error(`删除测试数据 ${key.name} 失败:`, error);
      }
    }
    
    console.log(`清除完成，共删除 ${deletedCount} 个用户记录`);
    
    return new Response(JSON.stringify({
      success: true,
      message: `成功清除 ${deletedCount} 个用户记录`,
      deletedCount: deletedCount,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('清除用户数据失败:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

export { Session };