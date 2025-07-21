@echo off
echo 🚀 Подготовка к развертыванию на TimeWeb Cloud...

REM Проверяем наличие необходимых файлов
if not exist "docker-compose.timeweb.yml" (
    echo ❌ Файл docker-compose.timeweb.yml не найден!
    pause
    exit /b 1
)

if not exist ".env.timeweb" (
    echo ❌ Файл .env.timeweb не найден!
    pause
    exit /b 1
)

echo ✅ Все необходимые файлы найдены

REM Копируем переменные окружения
copy .env.timeweb .env

echo ✅ Переменные окружения настроены

REM Запускаем развертывание
echo 🔄 Запуск развертывания...
docker-compose -f docker-compose.timeweb.yml up -d

echo ✅ Развертывание завершено!
echo.
echo 📋 Следующие шаги:
echo 1. Проверьте логи: docker-compose -f docker-compose.timeweb.yml logs -f
echo 2. Откройте ваш домен в браузере
echo 3. Настройте webhook бота
echo.
echo 📖 Подробная инструкция в файле DEPLOY_GUIDE.md

pause