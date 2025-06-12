const https = require('https');
const http = require('http');

// Тестовые данные как в frontend
const testInitData = 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22testuser%22%2C%22language_code%22%3A%22ru%22%7D&auth_date=1234567890&hash=test_hash';

const postData = JSON.stringify({
  initData: testInitData
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/get-user',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🚀 Отправка запроса к API...');
console.log('📄 Данные:', postData);

const req = http.request(options, (res) => {
  console.log(`📊 Статус: ${res.statusCode}`);
  console.log(`📋 Заголовки:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
    console.log('📦 Получен chunk:', chunk.toString());
  });
  
  res.on('end', () => {
    console.log('✅ Полный ответ:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('✅ JSON успешно распарсен:', parsed);
    } catch (e) {
      console.error('❌ Ошибка парсинга JSON:', e.message);
      console.error('📄 Сырые данные:', JSON.stringify(data));
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Ошибка запроса:', e.message);
});

req.write(postData);
req.end();