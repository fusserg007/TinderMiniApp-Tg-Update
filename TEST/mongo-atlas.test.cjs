// Тест MongoDB с использованием MongoDB Atlas (облачная база данных)
// Для быстрого тестирования без локальной установки

const { MongoClient } = require('mongodb');
require('dotenv').config();

/**
 * Тест подключения к MongoDB Atlas
 */
async function testMongoAtlas() {
  console.log('☁️ Тест подключения к MongoDB Atlas...');
  
  // Тестовая строка подключения к MongoDB Atlas (только для чтения)
  // Это публичная тестовая база данных
  const atlasUri = 'mongodb+srv://readonly:readonly@cluster0.example.mongodb.net/sample_mflix?retryWrites=true&w=majority';
  
  // Альтернативный вариант - создать бесплатный кластер на https://cloud.mongodb.com
  const customAtlasUri = process.env.MONGO_ATLAS_URI;
  
  const uriToTest = customAtlasUri || atlasUri;
  
  console.log('🔗 Тестирование подключения к облачной базе данных...');
  
  let client;
  
  try {
    client = new MongoClient(uriToTest, {
      serverSelectionTimeoutMS: 10000, // 10 секунд для облачного подключения
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    
    console.log('🔄 Подключение к MongoDB Atlas...');
    await client.connect();
    console.log('✅ Подключение к Atlas установлено');
    
    // Получение информации о базе данных
    const admin = client.db().admin();
    const serverStatus = await admin.serverStatus();
    console.log(`✅ Версия MongoDB: ${serverStatus.version}`);
    console.log(`✅ Хост: ${serverStatus.host}`);
    
    // Список баз данных
    const databases = await admin.listDatabases();
    console.log(`📊 Доступно баз данных: ${databases.databases.length}`);
    
    if (customAtlasUri) {
      // Если используется пользовательский Atlas URI, тестируем запись
      const testDb = client.db('dating_app_test');
      const testCollection = testDb.collection('connection_test');
      
      const testDoc = {
        _id: 'atlas_test_' + Date.now(),
        message: 'Тест Atlas подключения',
        timestamp: new Date(),
        source: 'TinderMiniApp'
      };
      
      await testCollection.insertOne(testDoc);
      console.log('✅ Тестовая запись в Atlas создана');
      
      const foundDoc = await testCollection.findOne({ _id: testDoc._id });
      if (foundDoc) {
        console.log('✅ Тестовая запись найдена в Atlas');
      }
      
      await testCollection.deleteOne({ _id: testDoc._id });
      console.log('✅ Тестовая запись удалена из Atlas');
    }
    
    console.log('🎉 MongoDB Atlas тест прошел успешно!');
    return true;
    
  } catch (error) {
    console.log('❌ Ошибка подключения к Atlas:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.log('💡 Проверьте учетные данные Atlas');
    } else if (error.message.includes('Server selection timed out')) {
      console.log('💡 Проверьте интернет-соединение');
    }
    
    return false;
    
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Соединение с Atlas закрыто');
    }
  }
}

/**
 * Создание инструкций для настройки MongoDB Atlas
 */
function showAtlasInstructions() {
  console.log('\n📋 Инструкции по настройке MongoDB Atlas:');
  console.log('\n1. Перейдите на https://cloud.mongodb.com');
  console.log('2. Создайте бесплатный аккаунт');
  console.log('3. Создайте новый кластер (выберите FREE tier)');
  console.log('4. Создайте пользователя базы данных:');
  console.log('   - Username: app_user');
  console.log('   - Password: (сгенерируйте надежный пароль)');
  console.log('5. Добавьте IP адрес в whitelist (0.0.0.0/0 для разработки)');
  console.log('6. Получите строку подключения (Connect -> Drivers)');
  console.log('7. Добавьте в .env файл:');
  console.log('   MONGO_ATLAS_URI=mongodb+srv://app_user:password@cluster0.xxxxx.mongodb.net/dating_app?retryWrites=true&w=majority');
  console.log('\n💡 Atlas предоставляет 512MB бесплатного хранилища');
  console.log('💡 Идеально подходит для разработки и тестирования');
}

/**
 * Тест локального подключения с рекомендациями
 */
async function testLocalWithRecommendations() {
  console.log('\n🏠 Проверка локального MongoDB...');
  
  const localUris = [
    'mongodb://localhost:27017/dating_app',
    'mongodb://127.0.0.1:27017/dating_app'
  ];
  
  for (const uri of localUris) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    
    try {
      await client.connect();
      await client.db('dating_app').admin().ping();
      console.log(`✅ Локальный MongoDB найден: ${uri}`);
      await client.close();
      return true;
    } catch (error) {
      console.log(`❌ ${uri}: ${error.message}`);
      await client.close();
    }
  }
  
  console.log('\n💡 Локальный MongoDB не найден');
  console.log('💡 Рекомендации:');
  console.log('   1. Используйте MongoDB Atlas (облачная база)');
  console.log('   2. Установите MongoDB локально');
  console.log('   3. Используйте Docker с MongoDB');
  
  return false;
}

// Основная функция тестирования
async function runAllTests() {
  console.log('🧪 Комплексное тестирование MongoDB...');
  console.log('=' .repeat(50));
  
  try {
    // Проверка локального MongoDB
    const localWorks = await testLocalWithRecommendations();
    
    if (!localWorks) {
      // Если локальный не работает, тестируем Atlas
      console.log('\n☁️ Переход к тестированию облачной базы данных...');
      const atlasWorks = await testMongoAtlas();
      
      if (!atlasWorks) {
        showAtlasInstructions();
      }
    }
    
  } catch (error) {
    console.log('❌ Критическая ошибка тестирования:', error.message);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Тестирование завершено');
  console.log('\n💡 Для продолжения разработки рекомендуется:');
  console.log('   - MongoDB Atlas для быстрого старта');
  console.log('   - Локальный MongoDB для production-like разработки');
}

// Запуск тестов
runAllTests();