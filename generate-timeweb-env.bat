@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 Генератор переменных окружения для Timeweb Cloud
echo ==================================================
echo.

REM Функция для генерации случайного ключа
set "chars=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
set "key1="
set "key2="
set "password="

REM Генерируем случайные ключи
for /l %%i in (1,1,64) do (
    set /a "rand=!random! %% 62"
    for %%j in (!rand!) do set "key1=!key1!!chars:~%%j,1!"
)

for /l %%i in (1,1,64) do (
    set /a "rand=!random! %% 62"
    for %%j in (!rand!) do set "key2=!key2!!chars:~%%j,1!"
)

for /l %%i in (1,1,24) do (
    set /a "rand=!random! %% 62"
    for %%j in (!rand!) do set "password=!password!!chars:~%%j,1!"
)

REM Создаем файл .env.timeweb
set "ENV_FILE=.env.timeweb"

echo 📝 Создаю файл %ENV_FILE%...
echo.

(
echo # MongoDB Atlas
echo # Получите строку подключения в MongoDB Atlas:
echo # 1. Зайдите в свой кластер
echo # 2. Нажмите "Connect" -^> "Connect your application"  
echo # 3. Скопируйте строку и замените ^<db_password^> на ваш пароль
echo MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dating_app?retryWrites=true^&w=majority
echo MONGODB_DATABASE=dating_app
echo.
echo # MinIO ^(хранилище файлов^)
echo MINIO_ROOT_USER=minio_admin
echo MINIO_ROOT_PASSWORD=!password!
echo AWS_ACCESS_KEY_ID=minio_admin
echo AWS_SECRET_ACCESS_KEY=!password!
echo AWS_BUCKET=dating-app-files
echo AWS_REGION=us-east-1
echo.
echo # ImgProxy ^(обработка изображений^)
echo IMGPROXY_KEY=!key1!
echo IMGPROXY_SALT=!key2!
echo.
echo # Telegram Bot
echo # Получите у @BotFather в Telegram:
echo # 1. /newbot - создать бота
echo # 2. /newapp - создать Web App
echo BOT_TOKEN=YOUR_BOT_TOKEN_HERE
echo BOT_USERNAME=your_bot_username
echo.
echo # Production URLs
echo # Замените 'your-app-name' на название вашего приложения в Timeweb
echo VITE_BACKEND_URL=https://your-app-name.twc1.net/api
echo DOMAIN=your-app-name.twc1.net
echo.
echo # Environment
echo NODE_ENV=production
echo PORT=4000
) > %ENV_FILE%

echo ✅ Файл %ENV_FILE% создан!
echo.
echo 📋 Что нужно сделать дальше:
echo.
echo 1. Откройте файл %ENV_FILE%
echo 2. Замените следующие значения:
echo    - MONGODB_URI: строка подключения из MongoDB Atlas
echo    - BOT_TOKEN: токен вашего бота от @BotFather
echo    - BOT_USERNAME: username вашего бота
echo    - your-app-name: название приложения в Timeweb
echo.
echo 3. Скопируйте все переменные в панель Timeweb Cloud
echo.
echo 🔐 Сгенерированные секретные ключи:
echo    - MINIO_ROOT_PASSWORD: !password!
echo    - IMGPROXY_KEY: !key1!
echo    - IMGPROXY_SALT: !key2!
echo.
echo ⚠️  ВАЖНО: Не коммитьте файл %ENV_FILE% в Git!
echo    Добавьте его в .gitignore
echo.
pause