// Упрощенный тест MongoDB для проверки подключения
// Работает с MongoDB Atlas или локальной установкой

const { MongoClient } = require('mongodb');
require('dotenv').config();

/**
 * Тест подключения к MongoDB
 */
async function testMongoConnection() {
  console.log('🧪 Упрощенный тест подключения к MongoDB...');
  
  // Проверка переменных окружения
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME || 'dating_app';
  
  if (!mongoUri) {
    console.log('❌ MONGO_URI не найден в переменных окружения');
    console.log('💡 Создайте .env файл с настройками MongoDB');
    console.log('💡 Пример: MONGO_URI=mongodb://localhost:27017/dating_app');
    return false;
  }
  
  console.log('✅ Переменные окружения найдены');
  console.log(`📊 База данных: ${dbName}`);
  
  // Скрываем пароль в URI для логирования
  const safeUri = mongoUri.replace(/:([^:@]+)@/, ':***@');
  console.log(`🔗 URI: ${safeUri}`);
  
  let client;
  
  try {
    console.log('🔄 Попытка подключения...');
    
    // Создание клиента с таймаутом
    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 секунд таймаут
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    
    // Подключение
    await client.connect();
    console.log('✅ Подключение установлено');
    
    // Проверка доступности базы данных
    const db = client.db(dbName);
    await db.admin().ping();
    console.log('✅ База данных отвечает');
    
    // Проверка коллекций
    const collections = await db.listCollections().toArray();
    console.log(`📋 Найдено коллекций: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('📋 Существующие коллекции:');
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    // Тест записи/чтения
    const testCollection = db.collection('test_connection');
    const testDoc = {
      _id: 'test_' + Date.now(),
      message: 'Тест подключения',
      timestamp: new Date()
    };
    
    await testCollection.insertOne(testDoc);
    console.log('✅ Тестовая запись создана');
    
    const foundDoc = await testCollection.findOne({ _id: testDoc._id });
    if (foundDoc) {
      console.log('✅ Тестовая запись найдена');
    }
    
    await testCollection.deleteOne({ _id: testDoc._id });
    console.log('✅ Тестовая запись удалена');
    
    console.log('🎉 Все тесты прошли успешно!');
    return true;
    
  } catch (error) {
    console.log('❌ Ошибка тестирования MongoDB:', error.message);
    
    // Дополнительная диагностика
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 MongoDB сервер не запущен или недоступен');
      console.log('💡 Проверьте:');
      console.log('   - Запущен ли MongoDB сервер');
      console.log('   - Правильность порта (обычно 27017)');
      console.log('   - Настройки брандмауэра');
    } else if (error.message.includes('Authentication failed')) {
      console.log('💡 Ошибка аутентификации');
      console.log('💡 Проверьте имя пользователя и пароль в MONGO_URI');
    } else if (error.message.includes('Server selection timed out')) {
      console.log('💡 Таймаут подключения');
      console.log('💡 Проверьте доступность сервера MongoDB');
    }
    
    return false;
    
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Соединение закрыто');
    }
  }
}

/**
 * Тест различных URI подключения
 */
async function testDifferentConnections() {
  console.log('\n🔄 Тестирование различных вариантов подключения...');
  
  const testUris = [
    'mongodb://localhost:27017/dating_app',
    'mongodb://127.0.0.1:27017/dating_app',
    'mongodb://admin:password123@localhost:27017/dating_app?authSource=admin'
  ];
  
  for (const uri of testUris) {
    console.log(`\n🧪 Тестирование: ${uri.replace(/:([^:@]+)@/, ':***@')}`);
    
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    
    try {
      await client.connect();
      await client.db('dating_app').admin().ping();
      console.log('✅ Подключение успешно');
      await client.close();
      return uri; // Возвращаем рабочий URI
    } catch (error) {
      console.log('❌ Подключение не удалось:', error.message);
      await client.close();
    }
  }
  
  return null;
}

// Запуск тестов
async function runTests() {
  try {
    const success = await testMongoConnection();
    
    if (!success) {
      console.log('\n🔍 Попытка найти рабочее подключение...');
      const workingUri = await testDifferentConnections();
      
      if (workingUri) {
        console.log(`\n✅ Найдено рабочее подключение: ${workingUri.replace(/:([^:@]+)@/, ':***@')}`);
        console.log('💡 Обновите MONGO_URI в .env файле');
      } else {
        console.log('\n❌ Не удалось найти рабочее подключение');
        console.log('💡 Смотрите инструкции в TEST/setup-mongodb.md');
      }
    }
    
  } catch (error) {
    console.log('❌ Критическая ошибка:', error.message);
  }
  
  console.log('\n🏁 Тестирование завершено');
}

// Запуск
runTests();