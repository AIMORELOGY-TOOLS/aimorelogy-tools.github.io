// 测试 JSON 响应格式
const testData = {
  "success": true,
  "sessionId": "test-session-id",
  "qrUrl": "https://example.com/qr",
  "ticket": "test-ticket",
  "expireSeconds": 600
};

console.log('JSON.stringify result:');
console.log(JSON.stringify(testData));

console.log('\nJSON.stringify with spacing:');
console.log(JSON.stringify(testData, null, 2));