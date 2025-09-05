import { config } from "dotenv";
import { ExpressHttpServer } from "./infra/express-http-server";
import { DI } from "./infra/di";
import { MongoStore } from "./infra/mongo-store";
import cors from 'cors'; // Import CORS

/**
 * Запуск сервера в режиме разработки
 */
async function startServer() {
  try {
    // Загрузка переменных окружения из .env файла в текущей директории
    const result = config({ path: './.env' });
    console.log("📄 Загружен .env файл:", result.parsed ? "✅ Успешно" : "❌ Ошибка");
    console.log("📍 Путь к .env:", result.parsed ? "./env найден" : "./env не найден");

    // Установка переменных окружения для разработки
    if (!process.env.MONGODB_URI) {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/tinder';
    }
    if (!process.env.MONGODB_DATABASE) {
      process.env.MONGODB_DATABASE = 'tinder';
    }
    if (!process.env.BOT_TOKEN) {
      process.env.BOT_TOKEN = '7707911390:AAGX3E6XADNiLGfkxflBnoNgH0E1yINaHPc';
    }
    if (!process.env.PORT) {
      process.env.PORT = '4000';
    }

    // Проверка критически важных переменных окружения
    const requiredEnvVars = [
      'BOT_TOKEN'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.error('❌ Отсутствуют обязательные переменные окружения:', missingVars);
      process.exit(1);
    }

    console.log("🔧 Переменные окружения:", {
      BOT_TOKEN: process.env.BOT_TOKEN ? '✅ Установлен' : '❌ Отсутствует',
      BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:4000',
      MONGODB_URI: process.env.MONGODB_URI ? '✅ Установлен' : '❌ Отсутствует',
      MONGODB_DATABASE: process.env.MONGODB_DATABASE,
      PORT: process.env.PORT || '4000'
    });

    // Создание и инициализация MongoDB хранилища
    console.log('🔄 Инициализация MongoDB...');
    let mongoStore: MongoStore | null = null;
    
    try {
      mongoStore = new MongoStore();
      await mongoStore.connect();
      console.log('✅ MongoDB подключен успешно');
    } catch (error) {
      console.warn('⚠️ MongoDB недоступен, запускаем в режиме без базы данных:', (error as Error).message);
      console.log('📝 Примечание: Некоторые функции могут быть недоступны');
    }

    // Настройка DI контейнера
    if (mongoStore) {
      DI.setMany({
        store: mongoStore,
      });
    }

    // Запуск HTTP сервера
    const port = Number(process.env.PORT) || 4000;
    const server = new ExpressHttpServer();

    // Запуск сервера
    server.listen(port, () => {
      console.log(`🚀 Backend запущен на порту ${port}!`);
      console.log(`📱 Telegram Bot: ${process.env.BOT_USERNAME || 'не настроен'}`);
      console.log(`🌐 Backend URL: ${process.env.BACKEND_URL || `http://localhost:${port}`}`);
      if (!mongoStore) {
        console.log('⚠️ Режим работы: БЕЗ БАЗЫ ДАННЫХ');
      }
    });

    // Обработка сигналов завершения
    process.on('SIGINT', async () => {
      console.log('\n🛑 Получен сигнал SIGINT, завершение работы...');
      if (mongoStore) {
        await mongoStore.disconnect();
      }
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Получен сигнал SIGTERM, завершение работы...');
      if (mongoStore) {
        await mongoStore.disconnect();
      }
      process.exit(0);
    });

  } catch (error) {
    console.error('💥 Критическая ошибка при запуске сервера:', error);
    process.exit(1);
  }
}

// Запуск сервера
startServer();