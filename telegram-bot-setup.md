# Настройка Telegram бота с Cloudflare Tunnel

## Шаг 1: Запуск сервисов

```powershell
# Запустите автоматизированный скрипт
.\start-cloudflare-solution.ps1
```

## Шаг 2: Получение URLs

После запуска скрипта откроются 4 окна PowerShell:
- **Backend Server** - локальный сервер на порту 4000
- **Frontend Server** - локальный сервер на порту 5173  
- **Backend Cloudflare Tunnel** - ⚠️ **СКОПИРУЙТЕ URL ОТСЮДА**
- **Frontend Cloudflare Tunnel** - ⚠️ **СКОПИРУЙТЕ URL ОТСЮДА**

### Пример URLs:
```
Backend: https://abc-def-123.trycloudflare.com
Frontend: https://xyz-uvw-456.trycloudflare.com
```

## Шаг 3: Обновление .env файла

Обновите файл `backend/.env`:
```env
TELEGRAM_BOT_TOKEN=ваш_токен_от_botfather
WEBHOOK_URL=https://abc-def-123.trycloudflare.com/webhook
PORT=4000
FRONTEND_URL=https://xyz-uvw-456.trycloudflare.com
```

## Шаг 4: Создание бота в Telegram

### 4.1 Создание бота
1. Откройте **основной Telegram** (не Telegram Web)
2. Найдите `@BotFather`
3. Отправьте `/newbot`
4. Введите имя бота: `Tinder Mini App`
5. Введите username: `your_tinder_bot` (должен заканчиваться на `bot`)
6. **Скопируйте токен** и вставьте в `.env` файл

### 4.2 Установка webhook
```powershell
# Замените <ВАШ_ТОКЕН> и <BACKEND_URL>
curl -X POST "https://api.telegram.org/bot<ВАШ_ТОКЕН>/setWebhook?url=<BACKEND_URL>/webhook"

# Пример:
# curl -X POST "https://api.telegram.org/bot123456:ABC-DEF/setWebhook?url=https://abc-def-123.trycloudflare.com/webhook"
```

### 4.3 Создание Mini App
1. В @BotFather отправьте `/newapp`
2. Выберите вашего бота
3. Введите название: `Tinder Mini App`
4. Введите описание: `Dating app for Telegram`
5. Загрузите фото (512x512 px)
6. **Введите URL Mini App**: `https://xyz-uvw-456.trycloudflare.com`

## Шаг 5: Тестирование

### 5.1 Проверка webhook
```powershell
# Проверка статуса webhook
curl "https://api.telegram.org/bot<ВАШ_ТОКЕН>/getWebhookInfo"
```

### 5.2 Проверка серверов
```powershell
# Проверка backend
curl https://abc-def-123.trycloudflare.com/health

# Проверка frontend
curl https://xyz-uvw-456.trycloudflare.com
```

### 5.3 Запуск Mini App
1. Найдите вашего бота в Telegram
2. Отправьте `/start`
3. Нажмите кнопку "Открыть приложение" или используйте меню
4. Mini App должно открыться в Telegram

## Возможные проблемы

### ❌ Webhook не устанавливается
- Проверьте, что backend сервер запущен
- Убедитесь, что Cloudflare туннель активен
- Проверьте правильность токена

### ❌ Mini App не открывается
- Проверьте, что frontend сервер запущен
- Убедитесь, что frontend Cloudflare туннель активен
- Проверьте URL в настройках Mini App

### ❌ Ошибки CORS
- Убедитесь, что в backend настроен правильный FRONTEND_URL
- Перезапустите backend после изменения .env

## Полезные команды

```powershell
# Остановка всех процессов
Get-Process | Where-Object {$_.ProcessName -eq "node" -or $_.ProcessName -eq "cloudflared"} | Stop-Process -Force

# Перезапуск только туннелей
.\cloudflared.exe tunnel --url http://localhost:4000
.\cloudflared.exe tunnel --url http://localhost:5173
```

---

**✅ После выполнения всех шагов ваш Telegram Mini App будет доступен через основной Telegram!**