# Альтернативная настройка через ngrok (обход проблем с тестовой средой)

Если не удается войти в тестовую среду Telegram, используем ngrok для создания HTTPS туннеля.

## Шаг 1: Установка ngrok

### Вариант 1: Через Chocolatey (рекомендуется)
```powershell
# Установите Chocolatey если его нет
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Установите ngrok
choco install ngrok
```

### Вариант 2: Ручная установка
1. Скачайте ngrok с https://ngrok.com/download
2. Распакуйте в папку `C:\ngrok`
3. Добавьте `C:\ngrok` в PATH

## Шаг 2: Регистрация и настройка ngrok

1. Зарегистрируйтесь на https://ngrok.com
2. Получите authtoken в личном кабинете
3. Настройте токен:
```powershell
ngrok config add-authtoken ВАШ_ТОКЕН
```

## Шаг 3: Создание туннелей

### Для backend (webhook)
```powershell
# В отдельном терминале
ngrok http 4000
```

### Для frontend (Mini App)
```powershell
# В другом терминале
ngrok http 5173
```

## Шаг 4: Настройка бота в основной среде Telegram

1. Найдите @BotFather в обычном Telegram
2. Создайте бота: `/newbot`
3. Сохраните токен
4. Создайте Mini App: `/newapp`
5. Укажите HTTPS URL от ngrok для frontend (например: `https://abc123.ngrok.io`)

## Шаг 5: Обновление конфигурации

### Обновите .env файл
```env
TELEGRAM_BOT_TOKEN=токен_из_основного_botfather
WEBHOOK_URL=https://ваш_backend_ngrok_url.ngrok.io/webhook
PORT=4000
FRONTEND_URL=https://ваш_frontend_ngrok_url.ngrok.io
```

### Установите webhook
```powershell
curl -X POST "https://api.telegram.org/bot<ВАШ_ТОКЕН>/setWebhook?url=https://ваш_backend_ngrok_url.ngrok.io/webhook"
```

## Шаг 6: Проверка работы

1. Убедитесь что оба сервера запущены:
   - Backend: `http://localhost:4000`
   - Frontend: `http://localhost:5173`

2. Убедитесь что ngrok туннели активны:
   - Backend tunnel: `https://xxx.ngrok.io` → `localhost:4000`
   - Frontend tunnel: `https://yyy.ngrok.io` → `localhost:5173`

3. Откройте бота в Telegram и запустите Mini App

## Отладка через ngrok

### Просмотр логов запросов
1. Откройте http://localhost:4040 (ngrok web interface)
2. Смотрите все входящие запросы в реальном времени
3. Анализируйте webhook запросы от Telegram

### Проверка webhook
```powershell
# Проверить текущий webhook
curl "https://api.telegram.org/bot<ВАШ_ТОКЕН>/getWebhookInfo"

# Удалить webhook (если нужно)
curl -X POST "https://api.telegram.org/bot<ВАШ_ТОКЕН>/deleteWebhook"
```

## Важные замечания

⚠️ **Бесплатный ngrok**:
- Ограничение: 1 процесс, 40 подключений/мин
- URL меняется при перезапуске
- Нужно обновлять webhook при каждом перезапуске

⚠️ **Безопасность**:
- Не используйте ngrok в продакшене
- Не передавайте чувствительные данные
- Закрывайте туннели после тестирования

## Автоматизация (опционально)

Создайте скрипт `start-with-ngrok.ps1`:
```powershell
# Запуск backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg\backend'; npm run dev"

# Запуск frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg\tg-web-app'; npm run dev"

# Ждем запуска серверов
Start-Sleep -Seconds 5

# Запуск ngrok туннелей
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 4000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 5173"

Write-Host "Все сервисы запущены!"
Write-Host "1. Скопируйте HTTPS URLs из ngrok терминалов"
Write-Host "2. Обновите .env файл"
Write-Host "3. Установите webhook"
Write-Host "4. Обновите Mini App URL в @BotFather"
```

---

**Следующий шаг**: После настройки ngrok можно полноценно тестировать Mini App в основной среде Telegram.