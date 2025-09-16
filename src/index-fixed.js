// 处理流式响应
async function handleStreamResponse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let imageUrl = null;
  let tokenConsumed = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            console.log('流式响应完成');
            break;
          }
          
          if (data.trim() === '' || data.startsWith(': keep-alive')) {
            continue;
          }
          
          try {
            const parsed = JSON.parse(data);
            console.log('解析流式数据:', parsed);
            
            // 检查是否有图片数据
            if (parsed.data && parsed.data[0] && parsed.data[0].url) {
              imageUrl = parsed.data[0].url;
              console.log('获取到图片URL:', imageUrl);
            }
            
            // 获取token使用信息
            if (parsed.usage && parsed.usage.total_tokens) {
              tokenConsumed = parsed.usage.total_tokens;
              console.log('获取到token消耗:', tokenConsumed);
            }
          } catch (e) {
            console.log('跳过无法解析的数据:', data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!imageUrl) {
    throw new Error('未能从流式响应中获取图片URL');
  }

  return {
    success: true,
    imageUrl: imageUrl,
    tokenConsumed: tokenConsumed
  };
}

export { Session };