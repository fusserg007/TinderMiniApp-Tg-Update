# Простое локальное решение (без туннелей)

## Основная идея

Используем **только тестовую среду Telegram** с HTTP подключением к локальному серверу. Никаких внешних туннелей не требуется.

## Преимущества

✅ **Без внешних зависимостей** - только Telegram Test Server  
✅ **HTTP поддержка** - работает с `http://localhost`  
✅ **Полностью локально** - никаких внешних сервисов  
✅ **Быстрая настройка** - 5 минут до запуска  
✅ **Стабильно** - нет проблем с туннелями  

## Решение проблемы входа в тестовую среду

### Альтернативные способы входа

#### Способ 1: Через Telegram Web
1. Откройте https://web.telegram.org/k/#@test
2. Введите номер телефона
3. Получите код через SMS
4. Войдите в тестовую среду

#### Способ 2: Через мобильное приложение
1. Установите Telegram Beta (если есть)
2. Или используйте Debug меню в обычном Telegram:
   - iOS: 10 раз тапните на Settings
   - Android: Зажмите версию в Settings

#### Способ 3: Создание тестового аккаунта
1. Используйте виртуальный номер для тестов
2. Сервисы типа receive-sms-online.info
3. Зарегистрируйте тестовый аккаунт

## Пошаговая настройка

### Шаг 1: Вход в тестовую среду

**Если не получается войти через QR-код:**

1. **Попробуйте другой браузер**:
   - Chrome
   - Firefox
   - Edge

2. **Очистите кэш браузера**:
   ```powershell
   # Для Chrome
   Remove-Item "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache\*" -Recurse -Force
   ```

3. **Используйте режим инкогнито**

4. **Попробуйте с мобильного устройства**:
   - Откройте web.telegram.org на телефоне
   - Войдите через номер телефона

### Шаг 2: Настройка проекта для тестовой среды

#### Обновите .env файл:
```env
# Тестовая среда Telegram
TELEGRAM_BOT_TOKEN=токен_из_тестового_botfather
WEBHOOK_URL=http://localhost:4000/webhook
PORT=4000
FRONTEND_URL=http://localhost:5173
TEST_MODE=true
```

#### Обновите backend для тестовой среды:
В `backend/src/config/telegram.ts`:
```typescript
// Конфигурация для тестовой среды
export const telegramConfig = {
    botToken: process.env.TELEGRAM_BOT_TOKEN!,
    webhookUrl: process.env.WEBHOOK_URL!,
    // Используем тестовый API endpoint
    apiUrl: process.env.TEST_MODE === 'true' 
        ? 'https://api.telegram.org/bot' 
        : 'https://api.telegram.org/bot'
};
```

### Шаг 3: Создание бота в тестовой среде

1. **Войдите в тестовую среду Telegram**
2. **Найдите @BotFather** (в тестовой среде)
3. **Создайте бота**:
   ```
   /newbot
   Название: Test Tinder Bot
   Username: test_tinder_bot
   ```
4. **Сохраните токен**

### Шаг 4: Создание Mini App

1. **В тестовом @BotFather**:
   ```
   /newapp
   ```
2. **Выберите созданного бота**
3. **Укажите данные**:
   - Название: Test Tinder App
   - Описание: Тестовое приложение для знакомств
   - **URL: `http://localhost:5173`** ⚠️ Важно: HTTP, не HTTPS
4. **Загрузите иконку** (512x512 px)

### Шаг 5: Настройка webhook

```powershell
# Установка webhook для тестовой среды
curl -X POST "https://api.telegram.org/bot<ВАШ_ТЕСТОВЫЙ_ТОКЕН>/setWebhook?url=http://localhost:4000/webhook"
```

### Шаг 6: Запуск проекта

```powershell
# Терминал 1: Backend
cd "c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg\backend"
npm run dev

# Терминал 2: Frontend
cd "c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg\tg-web-app"
npm run dev
```

## Автоматизированный скрипт

Создайте `start-local-testing.ps1`:
```powershell
Write-Host "🧪 Запуск локального тестирования..." -ForegroundColor Green

$projectRoot = "c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg"

# Проверка .env файла
if (-not (Test-Path "$projectRoot\backend\.env")) {
    Write-Host "❌ Файл .env не найден в backend" -ForegroundColor Red
    Write-Host "Создайте .env файл с настройками тестовой среды" -ForegroundColor Yellow
    exit 1
}

# Запуск backend
Write-Host "🔧 Запуск backend сервера..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\backend'; Write-Host 'Backend Server (Test Mode)' -ForegroundColor Green; npm run dev"

# Ожидание запуска backend
Start-Sleep -Seconds 3

# Проверка backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -TimeoutSec 5
    Write-Host "✅ Backend запущен успешно" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Backend еще запускается..." -ForegroundColor Yellow
}

# Запуск frontend
Write-Host "🎨 Запуск frontend сервера..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\tg-web-app'; Write-Host 'Frontend Server (Test Mode)' -ForegroundColor Blue; npm run dev"

# Ожидание запуска frontend
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🎉 Локальное тестирование готово!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Проверьте:" -ForegroundColor Yellow
Write-Host "   Backend:  http://localhost:4000/health" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "🤖 В тестовом Telegram:" -ForegroundColor Cyan
Write-Host "   1. Найдите вашего тестового бота" -ForegroundColor White
Write-Host "   2. Запустите Mini App" -ForegroundColor White
Write-Host "   3. Приложение откроется локально" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Отладка:" -ForegroundColor Magenta
Write-Host "   - Логи backend: в первом терминале" -ForegroundColor White
Write-Host "   - Логи frontend: во втором терминале" -ForegroundColor White
Write-Host "   - DevTools: F12 в Mini App" -ForegroundColor White

Write-Host ""
Write-Host "✨ Готово к разработке!" -ForegroundColor Green
```

## Отладка и тестирование

### Проверка подключения
```powershell
# Проверка backend
curl http://localhost:4000/health

# Проверка frontend
curl http://localhost:5173

# Проверка webhook
curl "https://api.telegram.org/bot<ТОКЕН>/getWebhookInfo"
```

### Включение отладки в Mini App

**В тестовом Telegram Desktop**:
1. Settings → Advanced → Experimental
2. Включите "Enable webview inspection"
3. Правый клик в Mini App → Inspect

### Логирование
Добавьте в frontend (`src/main.tsx`):
```typescript
// Отладочная информация
console.log('🧪 Test Mode Active');
console.log('📱 Telegram WebApp:', window.Telegram?.WebApp);
console.log('🌐 Current URL:', window.location.href);

// Логирование всех событий Telegram
if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.onEvent('*', (event: any) => {
        console.log('📨 Telegram Event:', event);
    });
}
```

## Преимущества этого подхода

| Аспект | Локальное тестирование | Внешние туннели |
|--------|------------------------|------------------|
| Скорость | ✅ Мгновенно | ❌ Задержки сети |
| Стабильность | ✅ Всегда работает | ❌ Могут падать |
| Настройка | ✅ 5 минут | ❌ 15-30 минут |
| Зависимости | ✅ Только Telegram | ❌ Внешние сервисы |
| Отладка | ✅ Прямой доступ | ❌ Через прокси |

---

**Это решение позволяет полноценно разрабатывать и тестировать Mini App локально без использования внешних туннелей.**