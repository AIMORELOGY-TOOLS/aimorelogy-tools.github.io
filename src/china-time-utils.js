// 中国时间处理工具函数

// 获取中国时间的日期字符串 (YYYY-MM-DD格式)
export function getChinaDateString() {
  const now = new Date();
  // 转换为中国时间 (UTC+8)
  const chinaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  return chinaTime.toISOString().split('T')[0];
}

// 获取中国时间的完整时间字符串
export function getChinaTimeString() {
  const now = new Date();
  // 转换为中国时间 (UTC+8)
  const chinaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  return chinaTime.toISOString();
}

// 检查是否需要重置每日计数 (基于中国时间)
export function shouldResetDaily(lastResetDate) {
  const today = getChinaDateString();
  return !lastResetDate || lastResetDate !== today;
}

// 初始化用户每日使用统计 (基于中国时间)
export function initializeDailyUsage() {
  return {
    daily: 0,
    total: 0,
    lastResetDate: getChinaDateString()
  };
}

// 重置每日计数 (基于中国时间)
export function resetDailyCount(usage) {
  if (shouldResetDaily(usage.lastResetDate)) {
    usage.daily = 0;
    usage.lastResetDate = getChinaDateString();
    return true; // 表示已重置
  }
  return false; // 表示未重置
}

// 检查并重置用户的所有每日统计
export function checkAndResetAllDailyStats(user) {
  let hasReset = false;
  
  // 重置文章使用统计
  if (user.articleUsage) {
    if (resetDailyCount(user.articleUsage)) {
      hasReset = true;
      console.log(`重置用户 ${user.openid} 的每日文章使用计数`);
    }
  }
  
  // 重置token使用统计
  if (user.tokenUsage) {
    Object.keys(user.tokenUsage).forEach(module => {
      if (user.tokenUsage[module] && resetDailyCount(user.tokenUsage[module])) {
        hasReset = true;
        console.log(`重置用户 ${user.openid} 的每日${module}模块token计数`);
      }
    });
  }
  
  // 重置其他使用统计
  if (user.usage && resetDailyCount(user.usage)) {
    hasReset = true;
    console.log(`重置用户 ${user.openid} 的每日使用计数`);
  }
  
  if (user.markdownUsage && resetDailyCount(user.markdownUsage)) {
    hasReset = true;
    console.log(`重置用户 ${user.openid} 的每日Markdown使用计数`);
  }
  
  return hasReset;
}