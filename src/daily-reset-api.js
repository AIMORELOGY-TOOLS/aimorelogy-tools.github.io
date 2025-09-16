// 每日重置API - 用于手动触发所有用户的每日计数重置

import { 
  getChinaDateString, 
  checkAndResetAllDailyStats 
} from './china-time-utils.js';

// 处理每日重置请求
export async function handleDailyReset(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: '仅支持POST请求'
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  try {
    console.log('开始执行每日重置任务...');
    
    // 获取所有用户
    const { keys } = await env.WECHAT_KV.list({ prefix: 'user:' });
    let resetCount = 0;
    let totalUsers = keys.length;
    
    console.log(`找到 ${totalUsers} 个用户，开始检查重置...`);
    
    // 批量处理用户
    const batchSize = 10;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (key) => {
        try {
          const userData = await env.WECHAT_KV.get(key.name);
          if (!userData) return;
          
          const user = JSON.parse(userData);
          
          // 检查并重置用户的所有每日统计
          const hasReset = checkAndResetAllDailyStats(user);
          
          if (hasReset) {
            // 保存更新后的用户数据
            await env.WECHAT_KV.put(key.name, JSON.stringify(user));
            resetCount++;
            console.log(`用户 ${user.openid} 的每日计数已重置`);
          }
        } catch (error) {
          console.error(`重置用户 ${key.name} 失败:`, error);
        }
      }));
    }
    
    const today = getChinaDateString();
    console.log(`每日重置任务完成: ${resetCount}/${totalUsers} 个用户已重置 (${today})`);
    
    return new Response(JSON.stringify({
      success: true,
      message: '每日重置任务完成',
      resetCount: resetCount,
      totalUsers: totalUsers,
      resetDate: today
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('每日重置任务失败:', error);
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

// 获取每日重置状态
export async function handleDailyResetStatus(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const today = getChinaDateString();
    
    // 检查今天是否已经执行过重置
    const resetLogKey = `daily_reset_log:${today}`;
    const resetLog = await env.WECHAT_KV.get(resetLogKey);
    
    let status = {
      today: today,
      hasReset: !!resetLog,
      resetTime: resetLog ? JSON.parse(resetLog).resetTime : null,
      resetCount: resetLog ? JSON.parse(resetLog).resetCount : 0
    };
    
    return new Response(JSON.stringify({
      success: true,
      status: status
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('获取每日重置状态失败:', error);
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