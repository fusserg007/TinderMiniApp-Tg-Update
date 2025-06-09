/**
 * Тест подключения к MongoDB
 * Запуск: node TEST/mongo.test.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

/**
 * Тестирование подключения к MongoDB
 */
async function testMongoConnection() {
  console.log('🧪 Тестирование подключения к MongoDB...');
  
  try {
    // Проверка переменных окружения
    const username = process.env.MONGO_INITDB_ROOT_USERNAME;
    const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
    const database = process.env.MONGODB_DATABASE;
    
    if (!username || !password || !database) {
      throw new Error('❌ Отсутствуют переменные окружения для MongoDB');
    }
    
    console.log('✅ Переменные окружения найдены');
    console.log(`📊 База данных: ${database}`);
    console.log(`👤 Пользователь: ${username}`);
    
    // Создание URI подключения
    const uri = `mongodb://${username}:${password}@localhost:27017/${database}?authSource=admin`;
    console.log('🔗 URI:', uri.replace(password, '***'));
    
    // Подключение к MongoDB
    const client = new MongoClient(uri);
    console.log('🔄 Попытка подключения...');
    
    await client.connect();
    console.log('✅ Подключение установлено');
    
    // Проверка ping
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Ping успешен');
    
    // Проверка доступа к базе данных
    const db = client.db(database);
    const collections = await db.listCollections().toArray();
    console.log('📋 Коллекции в базе данных:', collections.map(c => c.name));
    
    // Тест создания коллекции
    const testCollection = db.collection('test');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Тестовая запись создана');
    
    const testDoc = await testCollection.findOne({ test: true });
    console.log('✅ Тестовая запись найдена:', testDoc);
    
    // Очистка тестовых данных
    await testCollection.deleteMany({ test: true });
    console.log('🧹 Тестовые данные удалены');
    
    // Закрытие подключения
    await client.close();
    console.log('✅ Подключение закрыто');
    
    console.log('\n🎉 Все тесты MongoDB прошли успешно!');
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка тестирования MongoDB:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Возможные причины:');
      console.error('   - MongoDB не запущен');
      console.error('   - Неправильный порт (проверьте 27017)');
      console.error('   - Проблемы с сетью');
    } else if (error.code === 18) {
      console.error('💡 Ошибка аутентификации:');
      console.error('   - Проверьте логин и пароль в .env');
      console.error('   - Убедитесь что пользователь создан в MongoDB');
    }
    
    return false;
  }
}

/**
 * Тест переменных окружения
 */
function testEnvironmentVariables() {
  console.log('🧪 Тестирование переменных окружения...');
  
  const requiredVars = [
    'MONGO_INITDB_ROOT_USERNAME',
    'MONGO_INITDB_ROOT_PASSWORD',
    'MONGODB_DATABASE',
    'BOT_TOKEN',
    'PORT'
  ];
  
  const missingVars = [];
  const presentVars = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      presentVars.push(varName);
    } else {
      missingVars.push(varName);
    }
  });
  
  console.log('✅ Найденные переменные:', presentVars);
  
  if (missingVars.length > 0) {
    console.error('❌ Отсутствующие переменные:', missingVars);
    return false;
  }
  
  console.log('🎉 Все переменные окружения настроены!');
  return true;
}

/**
 * Запуск всех тестов
 */
async function runAllTests() {
  console.log('🚀 Запуск тестов MongoDB и окружения\n');
  
  const envTest = testEnvironmentVariables();
  console.log('');
  
  if (!envTest) {
    console.error('❌ Тесты остановлены из-за проблем с переменными окружения');
    process.exit(1);
  }
  
  const mongoTest = await testMongoConnection();
  
  if (envTest && mongoTest) {
    console.log('\n🎉 Все тесты прошли успешно! Система готова к работе.');
    process.exit(0);
  } else {
    console.error('\n❌ Некоторые тесты не прошли. Проверьте настройки.');
    process.exit(1);
  }
}

// Запуск тестов
runAllTests();