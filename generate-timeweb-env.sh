#!/bin/bash

# Скрипт для генерации переменных окружения для Timeweb Cloud
# Использование: ./generate-timeweb-env.sh

echo "🚀 Генератор переменных окружения для Timeweb Cloud"
echo "=================================================="
echo ""

# Функция для генерации случайного ключа
generate_key() {
    openssl rand -hex 32 2>/dev/null || python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null || echo "$(date +%s)$(shuf -i 1000-9999 -n 1)abcdef1234567890"
}

# Создаем файл .env.timeweb
ENV_FILE=".env.timeweb"

echo "📝 Создаю файл $ENV_FILE..."
echo ""

cat > $ENV_FILE << EOF
# MongoDB Atlas
# Получите строку подключения в MongoDB Atlas:
# 1. Зайдите в свой кластер
# 2. Нажмите "Connect" -> "Connect your application"  
# 3. Скопируйте строку и замените <db_password> на ваш пароль
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dating_app?retryWrites=true&w=majority
MONGODB_DATABASE=dating_app

# MinIO (хранилище файлов)
MINIO_ROOT_USER=minio_admin
MINIO_ROOT_PASSWORD=$(generate_key | cut -c1-24)
AWS_ACCESS_KEY_ID=minio_admin
AWS_SECRET_ACCESS_KEY=$(generate_key | cut -c1-24)
AWS_BUCKET=dating-app-files
AWS_REGION=us-east-1

# ImgProxy (обработка изображений)
IMGPROXY_KEY=$(generate_key)
IMGPROXY_SALT=$(generate_key)

# Telegram Bot
# Получите у @BotFather в Telegram:
# 1. /newbot - создать бота
# 2. /newapp - создать Web App
BOT_TOKEN=YOUR_BOT_TOKEN_HERE
BOT_USERNAME=your_bot_username

# Production URLs
# Замените 'your-app-name' на название вашего приложения в Timeweb
VITE_BACKEND_URL=https://your-app-name.twc1.net/api
DOMAIN=your-app-name.twc1.net

# Environment
NODE_ENV=production
PORT=4000
EOF

echo "✅ Файл $ENV_FILE создан!"
echo ""
echo "📋 Что нужно сделать дальше:"
echo ""
echo "1. Откройте файл $ENV_FILE"
echo "2. Замените следующие значения:"
echo "   - MONGODB_URI: строка подключения из MongoDB Atlas"
echo "   - BOT_TOKEN: токен вашего бота от @BotFather"
echo "   - BOT_USERNAME: username вашего бота"
echo "   - your-app-name: название приложения в Timeweb"
echo ""
echo "3. Скопируйте все переменные в панель Timeweb Cloud"
echo ""
echo "🔐 Сгенерированные секретные ключи:"
echo "   - MINIO_ROOT_PASSWORD: $(grep MINIO_ROOT_PASSWORD $ENV_FILE | cut -d'=' -f2)"
echo "   - IMGPROXY_KEY: $(grep IMGPROXY_KEY $ENV_FILE | cut -d'=' -f2)"
echo "   - IMGPROXY_SALT: $(grep IMGPROXY_SALT $ENV_FILE | cut -d'=' -f2)"
echo ""
echo "⚠️  ВАЖНО: Не коммитьте файл $ENV_FILE в Git!"
echo "   Добавьте его в .gitignore"
echo ""