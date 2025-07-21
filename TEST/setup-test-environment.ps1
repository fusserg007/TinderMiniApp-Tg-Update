# Скрипт настройки тестового окружения Telegram Mini App
# Запуск: powershell -ExecutionPolicy Bypass -File setup-test-environment.ps1

Write-Host "🚀 Настройка тестового окружения Telegram Mini App" -ForegroundColor Green
Write-Host ""

# Проверка наличия Node.js
Write-Host "📋 Проверка системных требований..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js не установлен. Установите Node.js с https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Проверка наличия npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: v$npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ npm не найден" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Переход в корневую директорию проекта
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "📁 Рабочая директория: $projectRoot" -ForegroundColor Cyan
Write-Host ""

# Установка зависимостей backend
Write-Host "📦 Установка зависимостей backend..." -ForegroundColor Yellow
Set-Location "backend"
if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Зависимости backend установлены" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Ошибка установки зависимостей backend" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "❌ package.json не найден в папке backend" -ForegroundColor Red
    exit 1
}

# Возврат в корень и установка зависимостей frontend
Set-Location $projectRoot
Write-Host "📦 Установка зависимостей frontend..." -ForegroundColor Yellow
Set-Location "tg-web-app"
if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Зависимости frontend установлены" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Ошибка установки зависимостей frontend" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "❌ package.json не найден в папке tg-web-app" -ForegroundColor Red
    exit 1
}

# Возврат в корень
Set-Location $projectRoot

# Проверка .env файла
Write-Host ""
Write-Host "🔧 Проверка конфигурации..." -ForegroundColor Yellow
$envPath = "backend\.env"
if (Test-Path $envPath) {
    Write-Host "✅ Файл .env найден" -ForegroundColor Green
    
    # Проверка наличия токена
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match 'BOT_TOKEN=your_test_bot_token_here') {
        Write-Host "⚠️ Необходимо обновить BOT_TOKEN в файле .env" -ForegroundColor Yellow
        Write-Host "   Получите токен от @BotFather в тестовой среде Telegram" -ForegroundColor Cyan
    }
    else {
        Write-Host "✅ BOT_TOKEN настроен" -ForegroundColor Green
    }
}
else {
    Write-Host "❌ Файл .env не найден в папке backend" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Настройка завершена!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. Настройте тестовый аккаунт Telegram (см. telegram-test-server-setup.md)" -ForegroundColor White
Write-Host "2. Создайте бота через @BotFather в тестовой среде" -ForegroundColor White
Write-Host "3. Обновите BOT_TOKEN в backend\.env" -ForegroundColor White
Write-Host "4. Запустите проект командой: .\TEST\start-development.ps1" -ForegroundColor White
Write-Host ""
Write-Host "📖 Подробная инструкция: .\TEST\telegram-test-server-setup.md" -ForegroundColor Yellow