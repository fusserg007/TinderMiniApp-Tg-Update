# ⚡ Шпаргалка: Команды для Timeweb Cloud

## 🚀 Быстрые действия

### 1. Создание приложения
```
1. timeweb.cloud → Облачные приложения → Создать приложение
2. Источник: GitHub
3. Тип: Docker → Docker Compose
4. Файл: docker-compose.timeweb.yml
5. Порт: 80
```

### 2. Основные настройки
```
Название: my-dating-app
Поддомен: my-dating-app (будет my-dating-app.twc1.net)
Ветка: main
Автодеплой: Включить
```

### 3. Переменные окружения (копировать из .env.timeweb)
```bash
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dating_app
MONGODB_DB_NAME=dating_app

# Telegram Bot
BOT_TOKEN=1234567890:ABCdefGHI...
BOT_USERNAME=your_bot_username
TELEGRAM_WEBHOOK_URL=https://my-dating-app.twc1.net/api/telegram/webhook

# Backend
NODE_ENV=production
PORT=4000
JWT_SECRET=your-secret-key
API_URL=https://my-dating-app.twc1.net/api
FRONTEND_URL=https://my-dating-app.twc1.net

# Frontend
VITE_API_URL=https://my-dating-app.twc1.net/api
VITE_BOT_USERNAME=your_bot_username

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
MINIO_ENDPOINT=http://minio:9000
MINIO_BUCKET_NAME=dating-app-files

# ImgProxy
IMGPROXY_KEY=943b421c9eb07c830af81030552c86009268de4e532ba2ee2eab8247c6da0881
IMGPROXY_SALT=520f986b998545b4785e0defbc4f3c1203f22de2374a3d53cb7a7fe9fea309c5
IMGPROXY_URL=https://my-dating-app.twc1.net/imgproxy
```

## 🤖 Настройка Telegram Bot

### В @BotFather:
```
/myapps → выберите приложение → Edit Web App URL
URL: https://my-dating-app.twc1.net

/setmenubutton → выберите бота
Текст: 🔥 Открыть приложение
URL: https://my-dating-app.twc1.net
```

## 🔍 Проверка работы

### URLs для проверки:
```
https://my-dating-app.twc1.net - главная страница
https://my-dating-app.twc1.net/api/health - статус API
```

### Логи в панели Timeweb:
```
nginx - веб-сервер
backend - API сервер
frontend - React приложение
minio - файловое хранилище
imgproxy - обработка изображений
```

## 🛠️ Управление

### Основные действия:
```
Перезапуск: Кнопка "Перезапустить"
Обновление: Push в GitHub → автодеплой
Логи: Раздел "Логи" → выбрать сервис
Мониторинг: Раздел "Мониторинг"
```

### Команды Git для обновления:
```bash
git add .
git commit -m "Update app"
git push origin main
# Автоматически задеплоится на Timeweb
```

## 🆘 Быстрое решение проблем

### 502 Bad Gateway:
```
1. Подождать 2-3 минуты
2. Проверить логи backend
3. Перезапустить приложение
```

### Bot не отвечает:
```
1. Проверить BOT_TOKEN
2. Проверить TELEGRAM_WEBHOOK_URL
3. Проверить логи backend
```

### Не загружаются картинки:
```
1. Проверить логи minio
2. Проверить логи imgproxy
3. Проверить MINIO_* переменные
```

## 💡 Полезные ссылки

- **Панель управления:** [timeweb.cloud](https://timeweb.cloud)
- **Документация:** [help.timeweb.cloud](https://help.timeweb.cloud)
- **Поддержка:** Чат в панели управления

---

**Время деплоя:** 5-10 минут  
**Время настройки:** 15-20 минут  
**Общее время:** ~30 минут до полной работы