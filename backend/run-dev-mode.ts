import { config } from 'dotenv';
import express from 'express';
import path from 'path';
import { config } from 'dotenv';

/**
 * Простой сервер для локального тестирования Telegram Mini App
 * Без MongoDB - только для тестирования интеграции с Telegram
 */
async function startServer() {
  try {
    // Загрузка переменных окружения
    const result = config({ path: '.env' });
    console.log("📄 Загружен .env файл:", result.parsed ? "✅ Успешно" : "❌ Ошибка");
    
    // Проверка основных переменных
    console.log("🔧 Переменные окружения:", {
      BOT_TOKEN: process.env.BOT_TOKEN ? '✅ Установлен' : '❌ Отсутствует',
      WEBHOOK_URL: process.env.WEBHOOK_URL || 'не установлен',
      PORT: process.env.PORT || '4000',
      TEST_MODE: process.env.TEST_MODE || 'false'
    });

    // Создание Express приложения
    const app = express();
    const port = Number(process.env.PORT) || 4000;

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // CORS для локальной разработки
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Базовые маршруты для тестирования
    
    // Health check
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        mode: 'local-testing',
        telegram_configured: !!process.env.BOT_TOKEN
      });
    });

    // Webhook для Telegram
    app.post('/webhook', (req, res) => {
      console.log('📨 Получен webhook от Telegram:', {
        timestamp: new Date().toISOString(),
        body: req.body,
        headers: req.headers
      });
      
      // Простой ответ для тестирования
      res.json({ ok: true, message: 'Webhook получен' });
    });

    // API для тестирования Mini App
    app.get('/api/user/profile', (req, res) => {
      console.log('👤 Запрос профиля пользователя');
      res.json({
        id: 'test_user_123',
        name: 'Тестовый пользователь',
        age: 25,
        bio: 'Тестовый профиль для разработки',
        photos: ['/api/placeholder-photo.jpg'],
        created_at: new Date().toISOString()
      });
    });

    // Получение потенциальных совпадений
    app.get('/api/matches/potential', (req, res) => {
      console.log('💕 Запрос потенциальных совпадений');
      res.json({
        profiles: [
          {
            id: 'test_match_1',
            name: 'Анна',
            age: 23,
            bio: 'Люблю путешествовать и читать книги',
            photos: ['/api/placeholder-photo.jpg'],
            distance: 2.5
          },
          {
            id: 'test_match_2', 
            name: 'Мария',
            age: 27,
            bio: 'Фотограф и любитель кофе',
            photos: ['/api/placeholder-photo.jpg'],
            distance: 1.2
          }
        ]
      });
    });

    // Лайк/дизлайк
    app.post('/api/matches/action', (req, res) => {
      const { profileId, action } = req.body;
      console.log(`${action === 'like' ? '💚' : '💔'} Действие:`, { profileId, action });
      
      // Симуляция совпадения
      const isMatch = action === 'like' && Math.random() > 0.7;
      
      res.json({
        success: true,
        match: isMatch,
        message: isMatch ? 'Взаимная симпатия! 🎉' : 'Действие выполнено'
      });
    });

    // Заглушка для фото
    app.get('/api/placeholder-photo.jpg', (req, res) => {
      res.redirect('https://via.placeholder.com/400x600/FF6B6B/FFFFFF?text=Test+Photo');
    });

    // Информация о боте
    app.get('/api/bot/info', (req, res) => {
      res.json({
        configured: !!process.env.BOT_TOKEN,
        webhook_url: process.env.WEBHOOK_URL,
        test_mode: process.env.TEST_MODE === 'true',
        frontend_url: process.env.FRONTEND_URL || 'http://localhost:5173'
      });
    });

    // Статическая информация
    app.get('/', (req, res) => {
      res.json({
        name: 'Tinder Mini App Backend',
        version: '1.0.0',
        mode: 'local-testing',
        endpoints: {
          health: '/health',
          webhook: '/webhook',
          user_profile: '/api/user/profile',
          potential_matches: '/api/matches/potential',
          match_action: '/api/matches/action',
          bot_info: '/api/bot/info'
        },
        documentation: 'Простой backend для тестирования Telegram Mini App'
      });
    });

    // Запуск сервера
    app.listen(port, () => {
      console.log('');
      console.log('🎉 Backend сервер запущен!');
      console.log('═══════════════════════════════════');
      console.log(`🌐 URL: http://localhost:${port}`);
      console.log(`📱 Режим: Локальное тестирование`);
      console.log(`🤖 Telegram Bot: ${process.env.BOT_TOKEN ? 'Настроен' : 'Не настроен'}`);
      console.log(`🔗 Webhook: ${process.env.WEBHOOK_URL || 'Не установлен'}`);
      console.log('');
      console.log('📋 Доступные endpoints:');
      console.log(`   GET  /health - Проверка состояния`);
      console.log(`   POST /webhook - Webhook Telegram`);
      console.log(`   GET  /api/user/profile - Профиль пользователя`);
      console.log(`   GET  /api/matches/potential - Потенциальные совпадения`);
      console.log(`   POST /api/matches/action - Лайк/дизлайк`);
      console.log(`   GET  /api/bot/info - Информация о боте`);
      console.log('═══════════════════════════════════');
      console.log('');
    });
    
    // Обработка сигналов завершения
    process.on('SIGINT', () => {
      console.log('\n🛑 Завершение работы сервера...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('💥 Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

// Запуск сервера
startServer();
