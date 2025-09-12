// 微信回调测试工具
// 模拟微信服务器的真实请求

const WORKER_URL = 'https://wechat-login-worker.internal-articleno.workers.dev/wechat-callback';

// 测试用的 XML 数据
const testXmlData = `<xml>
<ToUserName><![CDATA[wx2e1f9ccab9e27176]]></ToUserName>
<FromUserName><![CDATA[oEbjz1xSWO69Xfu0aK55vmnHWwdY]]></FromUserName>
<CreateTime>${Math.floor(Date.now() / 1000)}</CreateTime>
<MsgType><![CDATA[event]]></MsgType>
<Event><![CDATA[SCAN]]></Event>
<EventKey><![CDATA[test-session-${Date.now()}]]></EventKey>
</xml>`;

// 模拟微信服务器的请求头
const wechatHeaders = {
    'Content-Type': 'text/xml; charset=utf-8',
    'User-Agent': 'Mozilla/4.0',
    'Accept': '*/*',
    'Connection': 'close'
};

async function testWechatCallback() {
    console.log('开始测试微信回调...');
    
    const startTime = Date.now();
    
    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: wechatHeaders,
            body: testXmlData,
            signal: AbortSignal.timeout(5000) // 5秒超时
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        const responseText = await response.text();
        
        console.log(`✅ 响应成功!`);
        console.log(`⏱️  响应时间: ${responseTime}ms`);
        console.log(`📊 状态码: ${response.status}`);
        console.log(`📝 响应内容: "${responseText}"`);
        console.log(`🔧 Content-Type: ${response.headers.get('Content-Type')}`);
        
        if (responseTime > 5000) {
            console.log('❌ 响应时间超过5秒，微信会报超时错误');
        } else if (responseTime > 1000) {
            console.log('⚠️  响应时间超过1秒，可能有风险');
        } else {
            console.log('✅ 响应时间正常');
        }
        
    } catch (error) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`❌ 请求失败!`);
        console.log(`⏱️  失败时间: ${responseTime}ms`);
        console.log(`🚨 错误信息: ${error.message}`);
        
        if (error.name === 'TimeoutError') {
            console.log('❌ 请求超时，这就是微信报告的问题！');
        }
    }
}

// 运行多次测试
async function runMultipleTests() {
    console.log('🚀 开始多次测试...\n');
    
    for (let i = 1; i <= 5; i++) {
        console.log(`--- 测试 ${i} ---`);
        await testWechatCallback();
        console.log('');
        
        // 等待1秒再进行下一次测试
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// 如果是 Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    runMultipleTests().catch(console.error);
}

// 如果是浏览器环境
if (typeof window !== 'undefined') {
    window.testWechatCallback = testWechatCallback;
    window.runMultipleTests = runMultipleTests;
}