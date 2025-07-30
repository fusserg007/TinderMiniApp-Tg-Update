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
    // Загрузка переменных окружения из .env файла в корневой директории
    const result = config({ path: '../.env' });
    console.log("📄 Загружен .env файл:", result.parsed ? "✅ Успешно" : "❌ Ошибка");
    console.log("📍 Путь к .env:", result.parsed ? "../env найден" : "../env не найден");

    // Проверка критически важных переменных окружения
    const requiredEnvVars = [
      'MONGODB_URI',
      'MONGODB_DATABASE',
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
    const mongoStore = new MongoStore();
    await mongoStore.connect();

    // Настройка DI контейнера
    DI.setMany({
      store: mongoStore,
    });

    // Запуск HTTP сервера
    const port = Number(process.env.PORT) || 4000;
    const server = new ExpressHttpServer();

    // Enable CORS
    server.app.use(cors({
      origin: ['http://localhost:5173', 'http://0.0.0.0:5173', 'https://*.replit.dev', 'https://*.repl.co'],
      credentials: true
    }));

    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Backend запущен на порту ${port}!`);
      console.log(`📱 Telegram Bot: ${process.env.BOT_USERNAME || 'не настроен'}`);
      console.log(`🌐 Backend URL: ${process.env.BACKEND_URL || `http://localhost:${port}`}`);
    });

    // Обработка сигналов завершения
    process.on('SIGINT', async () => {
      console.log('\n🛑 Получен сигнал SIGINT, завершение работы...');
      await mongoStore.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Получен сигнал SIGTERM, завершение работы...');
      await mongoStore.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('💥 Критическая ошибка при запуске сервера:', error);
    process.exit(1);
  }
}

// Запуск сервера
startServer();