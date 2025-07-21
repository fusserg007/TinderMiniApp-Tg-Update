# Альтернативное решение: Cloudflare Tunnel (без ngrok)

## Преимущества Cloudflare Tunnel

✅ **Бесплатно** - без ограничений на количество туннелей  
✅ **Стабильные URL** - не меняются при перезапуске  
✅ **HTTPS из коробки** - автоматические SSL сертификаты  
✅ **Высокая производительность** - глобальная сеть Cloudflare  
✅ **Без регистрации** - можно использовать временные туннели  

## Вариант 1: Быстрый старт (без регистрации)

### Установка cloudflared

```powershell
# Скачивание cloudflared для Windows
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"

# Или через winget
winget install cloudflare.cloudflared
```

### Запуск временного туннеля

#### Для backend (webhook):
```powershell
# В отдельном терминале
cloudflared tunnel --url http://localhost:4000
```

#### Для frontend (Mini App):
```powershell
# В другом терминале
cloudflared tunnel --url http://localhost:5173
```

### Получение URLs
После запуска команд вы увидите что-то вроде:
```
2024-01-15T10:30:45Z INF +--------------------------------------------------------------------------------------------+
2024-01-15T10:30:45Z INF |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
2024-01-15T10:30:45Z INF |  https://abc-def-123.trycloudflare.com                                                    |
2024-01-15T10:30:45Z INF +--------------------------------------------------------------------------------------------+
```

## Вариант 2: Постоянные туннели (с регистрацией)

### Регистрация и настройка

1. Зарегистрируйтесь на https://dash.cloudflare.com
2. Войдите в аккаунт через cloudflared:
```powershell
cloudflared tunnel login
```

3. Создайте туннель:
```powershell
cloudflared tunnel create tinder-app
```

4. Создайте конфигурационный файл `config.yml`:
```yaml
tunnel: tinder-app
credentials-file: C:\Users\пользователь\.cloudflared\<tunnel-id>.json

ingress:
  - hostname: backend-tinder.your-domain.com
    service: http://localhost:4000
  - hostname: frontend-tinder.your-domain.com
    service: http://localhost:5173
  - service: http_status:404
```

5. Настройте DNS записи:
```powershell
cloudflared tunnel route dns tinder-app backend-tinder.your-domain.com
cloudflared tunnel route dns tinder-app frontend-tinder.your-domain.com
```

6. Запустите туннель:
```powershell
cloudflared tunnel run tinder-app
```

## Вариант 3: Локальное тестирование (рекомендуется)

### Использование локального IP в сети

1. **Узнайте ваш локальный IP**:
```powershell
ipconfig | findstr "IPv4"
```

2. **Настройте frontend для доступа по сети**:
```powershell
# В папке tg-web-app
npm run dev -- --host 0.0.0.0
```

3. **Настройте backend для доступа по сети**:
Обновите `backend/src/index.ts`:
```typescript
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущен на http://0.0.0.0:${PORT}`);
});
```

4. **Используйте локальный IP в настройках**:
- Backend: `http://192.168.1.100:4000` (замените на ваш IP)
- Frontend: `http://192.168.1.100:5173`

## Пошаговая настройка с Cloudflare Tunnel

### Шаг 1: Установка и запуск серверов

```powershell
# Терминал 1: Backend
cd "c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg\backend"
npm run dev

# Терминал 2: Frontend
cd "c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg\tg-web-app"
npm run dev
```

### Шаг 2: Запуск Cloudflare туннелей

```powershell
# Терминал 3: Backend туннель
cloudflared tunnel --url http://localhost:4000

# Терминал 4: Frontend туннель
cloudflared tunnel --url http://localhost:5173
```

### Шаг 3: Создание бота в основном Telegram

1. Откройте обычный Telegram
2. Найдите @BotFather
3. Создайте бота: `/newbot`
4. Сохраните токен

### Шаг 4: Обновление конфигурации

Обновите `.env` файл:
```env
TELEGRAM_BOT_TOKEN=токен_из_основного_botfather
WEBHOOK_URL=https://ваш-backend-cloudflare-url.trycloudflare.com/webhook
PORT=4000
FRONTEND_URL=https://ваш-frontend-cloudflare-url.trycloudflare.com
```

### Шаг 5: Установка webhook

```powershell
curl -X POST "https://api.telegram.org/bot<ВАШ_ТОКЕН>/setWebhook?url=https://ваш-backend-cloudflare-url.trycloudflare.com/webhook"
```

### Шаг 6: Создание Mini App

1. В @BotFather: `/newapp`
2. Выберите бота
3. Укажите URL: `https://ваш-frontend-cloudflare-url.trycloudflare.com`

## Автоматизированный скрипт

Создайте `start-with-cloudflare.ps1`:
```powershell
# Проверка установки cloudflared
if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    Write-Host "❌ cloudflared не установлен" -ForegroundColor Red
    Write-Host "Установите: winget install cloudflare.cloudflared" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Запуск с Cloudflare Tunnel..." -ForegroundColor Green

# Запуск backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg\backend'; npm run dev"

# Запуск frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg\tg-web-app'; npm run dev"

# Ожидание запуска серверов
Start-Sleep -Seconds 5

# Запуск Cloudflare туннелей
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Backend Cloudflare Tunnel' -ForegroundColor Magenta; cloudflared tunnel --url http://localhost:4000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Frontend Cloudflare Tunnel' -ForegroundColor Blue; cloudflared tunnel --url http://localhost:5173"

Write-Host "✅ Все сервисы запущены!" -ForegroundColor Green
Write-Host "📋 Скопируйте URLs из Cloudflare терминалов" -ForegroundColor Yellow
```

## Преимущества перед ngrok

| Функция | Cloudflare Tunnel | ngrok |
|---------|-------------------|-------|
| Бесплатные туннели | ✅ Безлимитно | ❌ Ограничено |
| Стабильные URL | ✅ Да | ❌ Меняются |
| Скорость | ✅ Высокая | ⚠️ Средняя |
| Настройка | ✅ Простая | ⚠️ Требует токен |
| HTTPS | ✅ Автоматически | ✅ Да |

## Отладка

### Проверка туннелей:
```powershell
# Проверка backend
curl https://ваш-backend-url.trycloudflare.com/health

# Проверка frontend
curl https://ваш-frontend-url.trycloudflare.com
```

### Логи Cloudflare:
- Логи отображаются в терминале где запущен cloudflared
- Подробная информация о запросах

---

**Это решение полностью заменяет ngrok и предоставляет стабильную альтернативу для разработки Telegram Mini Apps.**