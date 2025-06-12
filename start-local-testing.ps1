# Автоматизированный скрипт для локального тестирования Telegram Mini App
# Без использования внешних туннелей

Write-Host "🧪 Запуск локального тестирования Telegram Mini App..." -ForegroundColor Green
Write-Host "📍 Режим: Только тестовая среда Telegram (без туннелей)" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg"
$backendPath = "$projectRoot\backend"
$frontendPath = "$projectRoot\tg-web-app"

# Функция проверки порта
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Проверка структуры проекта
Write-Host "🔍 Проверка структуры проекта..." -ForegroundColor Yellow

if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Папка backend не найдена: $backendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Папка frontend не найдена: $frontendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "$backendPath\package.json")) {
    Write-Host "❌ package.json не найден в backend" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "$frontendPath\package.json")) {
    Write-Host "❌ package.json не найден в frontend" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Структура проекта корректна" -ForegroundColor Green

# Проверка .env файла
Write-Host "🔧 Проверка конфигурации..." -ForegroundColor Yellow

if (-not (Test-Path "$backendPath\.env")) {
    Write-Host "⚠️ Файл .env не найден в backend" -ForegroundColor Yellow
    Write-Host "📝 Создание примера .env файла..." -ForegroundColor Cyan
    
    $envContent = @"
# Конфигурация для тестовой среды Telegram
TELEGRAM_BOT_TOKEN=your_test_bot_token_here
WEBHOOK_URL=http://localhost:4000/webhook
PORT=4000
FRONTEND_URL=http://localhost:5173
TEST_MODE=true

# База данных (для разработки)
DATABASE_URL=sqlite:./dev.db

# Секретный ключ для JWT
JWT_SECRET=your_jwt_secret_here
"@
    
    Set-Content -Path "$backendPath\.env" -Value $envContent -Encoding UTF8
    Write-Host "✅ Создан файл .env с примером конфигурации" -ForegroundColor Green
    Write-Host "⚠️ ВАЖНО: Обновите TELEGRAM_BOT_TOKEN в .env файле!" -ForegroundColor Red
    Write-Host ""
}

# Проверка занятости портов
Write-Host "🔌 Проверка портов..." -ForegroundColor Yellow

if (Test-Port 4000) {
    Write-Host "⚠️ Порт 4000 уже занят" -ForegroundColor Yellow
    $choice = Read-Host "Продолжить? (y/n)"
    if ($choice -ne 'y') {
        exit 1
    }
}

if (Test-Port 5173) {
    Write-Host "⚠️ Порт 5173 уже занят" -ForegroundColor Yellow
    $choice = Read-Host "Продолжить? (y/n)"
    if ($choice -ne 'y') {
        exit 1
    }
}

# Проверка зависимостей
Write-Host "📦 Проверка зависимостей..." -ForegroundColor Yellow

if (-not (Test-Path "$backendPath\node_modules")) {
    Write-Host "📥 Установка зависимостей backend..." -ForegroundColor Cyan
    Set-Location $backendPath
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка установки зависимостей backend" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path "$frontendPath\node_modules")) {
    Write-Host "📥 Установка зависимостей frontend..." -ForegroundColor Cyan
    Set-Location $frontendPath
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка установки зависимостей frontend" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Зависимости готовы" -ForegroundColor Green

# Запуск backend сервера
Write-Host ""
Write-Host "🔧 Запуск backend сервера (порт 4000)..." -ForegroundColor Cyan

$backendJob = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$backendPath'; Write-Host '🔧 Backend Server (Test Mode)' -ForegroundColor Green; Write-Host 'Порт: 4000' -ForegroundColor White; Write-Host 'Режим: Тестовая среда Telegram' -ForegroundColor Yellow; Write-Host ''; npm run dev"
) -PassThru

# Ожидание запуска backend
Write-Host "⏳ Ожидание запуска backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Проверка backend
$backendReady = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✅ Backend запущен успешно (попытка $i)" -ForegroundColor Green
        $backendReady = $true
        break
    } catch {
        Write-Host "⏳ Backend запускается... (попытка $i/10)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $backendReady) {
    Write-Host "⚠️ Backend запускается медленно, но продолжаем..." -ForegroundColor Yellow
}

# Запуск frontend сервера
Write-Host ""
Write-Host "🎨 Запуск frontend сервера (порт 5173)..." -ForegroundColor Cyan

$frontendJob = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$frontendPath'; Write-Host '🎨 Frontend Server (Test Mode)' -ForegroundColor Blue; Write-Host 'Порт: 5173' -ForegroundColor White; Write-Host 'URL: http://localhost:5173' -ForegroundColor Yellow; Write-Host ''; npm run dev"
) -PassThru

# Ожидание запуска frontend
Write-Host "⏳ Ожидание запуска frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Проверка frontend
$frontendReady = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✅ Frontend запущен успешно (попытка $i)" -ForegroundColor Green
        $frontendReady = $true
        break
    } catch {
        Write-Host "⏳ Frontend запускается... (попытка $i/10)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $frontendReady) {
    Write-Host "⚠️ Frontend запускается медленно, но продолжаем..." -ForegroundColor Yellow
}

# Финальная информация
Write-Host ""
Write-Host "🎉 Локальное тестирование готово!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 Статус серверов:" -ForegroundColor Yellow
Write-Host "   Backend:  http://localhost:4000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "🤖 Следующие шаги в тестовом Telegram:" -ForegroundColor Cyan
Write-Host "   1. Войдите в тестовую среду Telegram" -ForegroundColor White
Write-Host "   2. Найдите @BotFather (тестовый)" -ForegroundColor White
Write-Host "   3. Создайте бота и Mini App" -ForegroundColor White
Write-Host "   4. URL для Mini App: http://localhost:5173" -ForegroundColor Yellow
Write-Host "   5. Webhook URL: http://localhost:4000/webhook" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 Полезные команды:" -ForegroundColor Magenta
Write-Host "   Проверка backend:  curl http://localhost:4000/health" -ForegroundColor White
Write-Host "   Проверка frontend: curl http://localhost:5173" -ForegroundColor White
Write-Host "   Логи: смотрите в открытых терминалах" -ForegroundColor White
Write-Host ""
Write-Host "📖 Подробная инструкция:" -ForegroundColor Green
Write-Host "   Файл: TEST/local-testing-solution.md" -ForegroundColor White
Write-Host ""
Write-Host "✨ Готово к разработке без внешних туннелей!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Gray

# Ожидание нажатия клавиши
Write-Host ""
Write-Host "Нажмите любую клавишу для завершения..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")