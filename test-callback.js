// 简化的微信回调测试
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 只处理微信回调验证
    if (url.pathname === '/wechat-callback' && request.method === 'GET') {
      const signature = url.searchParams.get('signature');
      const timestamp = url.searchParams.get('timestamp');
      const nonce = url.searchParams.get('nonce');
      const echostr = url.searchParams.get('echostr');
      
      console.log('收到微信验证请求:', {
        signature,
        timestamp,
        nonce,
        echostr,
        token: env.WECHAT_TOKEN || 'NOT_SET'
      });
      
      // 如果没有配置 token，返回错误信息
      if (!env.WECHAT_TOKEN) {
        return new Response('WECHAT_TOKEN not configured', { status: 500 });
      }
      
      // 验证签名
      try {
        const isValid = await verifySignature(signature, timestamp, nonce, env.WECHAT_TOKEN);
        
        if (isValid) {
          console.log('验证成功，返回 echostr');
          return new Response(echostr);
        } else {
          console.log('签名验证失败');
          return new Response('Invalid signature', { status: 403 });
        }
      } catch (error) {
        console.error('验证过程出错:', error);
        return new Response(`Verification error: ${error.message}`, { status: 500 });
      }
    }
    
    return new Response('Test callback endpoint', { status: 200 });
  }
};

async function verifySignature(signature, timestamp, nonce, token) {
  if (!signature || !timestamp || !nonce || !token) {
    console.log('缺少必要参数');
    return false;
  }

  // 微信签名算法：将 token、timestamp、nonce 三个参数进行字典序排序
  const array = [token, timestamp, nonce].sort();
  const str = array.join('');
  
  console.log('签名计算:', {
    token,
    timestamp,
    nonce,
    sorted: array,
    joined: str
  });
  
  // 计算 SHA1
  const hash = await sha1(str);
  
  console.log('签名对比:', {
    received: signature,
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