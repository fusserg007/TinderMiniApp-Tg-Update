# Автоматизированный запуск проекта с ngrok
# Этот скрипт запускает backend, frontend и создает ngrok туннели

Write-Host "🚀 Запуск Tinder Mini App с ngrok..." -ForegroundColor Green
Write-Host ""

# Проверка что мы в правильной директории
$projectRoot = "c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg"
if (-not (Test-Path $projectRoot)) {
    Write-Host "❌ Ошибка: Проект не найден в $projectRoot" -ForegroundColor Red
    exit 1
}

Set-Location $projectRoot

# Проверка установки ngrok
try {
    $ngrokVersion = ngrok version 2>$null
    Write-Host "✅ ngrok установлен" -ForegroundColor Green
} catch {
    Write-Host "❌ ngrok не установлен. Установите через: choco install ngrok" -ForegroundColor Red
    exit 1
}

# Проверка наличия node_modules в backend
if (-not (Test-Path "$projectRoot\backend\node_modules")) {
    Write-Host "📦 Установка зависимостей backend..." -ForegroundColor Yellow
    Set-Location "$projectRoot\backend"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка установки зависимостей backend" -ForegroundColor Red
        exit 1
    }
}

# Проверка наличия node_modules в frontend
if (-not (Test-Path "$projectRoot\tg-web-app\node_modules")) {
    Write-Host "📦 Установка зависимостей frontend..." -ForegroundColor Yellow
    Set-Location "$projectRoot\tg-web-app"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка установки зависимостей frontend" -ForegroundColor Red
        exit 1
    }
}

Set-Location $projectRoot

# Функция для ожидания запуска сервера
function Wait-ForServer {
    param(
        [string]$Url,
        [string]$Name,
        [int]$TimeoutSeconds = 30
    )
    
    Write-Host "⏳ Ожидание запуска $Name..." -ForegroundColor Yellow
    $timeout = (Get-Date).AddSeconds($TimeoutSeconds)
    
    do {
        try {
            $response = Invoke-WebRequest -Uri $Url -TimeoutSec 2 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $Name запущен" -ForegroundColor Green
                return $true
            }
        } catch {
            Start-Sleep -Seconds 1
        }
    } while ((Get-Date) -lt $timeout)
    
    Write-Host "❌ Таймаут ожидания $Name" -ForegroundColor Red
    return $false
}

Write-Host "🔧 Запуск серверов..." -ForegroundColor Cyan
Write-Host ""

# Запуск backend
Write-Host "1️⃣ Запуск backend сервера..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\backend'; Write-Host 'Backend Server' -ForegroundColor Green; npm run dev"

# Ожидание запуска backend
if (-not (Wait-ForServer "http://localhost:4000/health" "Backend")) {
    Write-Host "❌ Не удалось запустить backend" -ForegroundColor Red
    exit 1
}

# Запуск frontend
Write-Host "2️⃣ Запуск frontend сервера..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\tg-web-app'; Write-Host 'Frontend Server' -ForegroundColor Blue; npm run dev"

# Ожидание запуска frontend
if (-not (Wait-ForServer "http://localhost:5173" "Frontend")) {
    Write-Host "❌ Не удалось запустить frontend" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🌐 Создание ngrok туннелей..." -ForegroundColor Cyan
Write-Host ""

# Запуск ngrok для backend
Write-Host "3️⃣ Создание ngrok туннеля для backend (порт 4000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Backend Ngrok Tunnel' -ForegroundColor Magenta; ngrok http 4000"

# Запуск ngrok для frontend
Write-Host "4️⃣ Создание ngrok туннеля для frontend (порт 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Frontend Ngrok Tunnel' -ForegroundColor Magenta; ngrok http 5173"

# Ожидание запуска ngrok
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🎉 Все сервисы запущены!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Следующие шаги:" -ForegroundColor Yellow
Write-Host "1. Откройте ngrok терминалы и скопируйте HTTPS URLs" -ForegroundColor White
Write-Host "2. Обновите .env файл с новыми URLs" -ForegroundColor White
Write-Host "3. Создайте бота через @BotFather в основном Telegram" -ForegroundColor White
Write-Host "4. Установите webhook с backend ngrok URL" -ForegroundColor White
Write-Host "5. Создайте Mini App с frontend ngrok URL" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Локальные адреса:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:4000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Ngrok UI: http://localhost:4040" -ForegroundColor White
Write-Host ""
Write-Host "📖 Подробные инструкции в файлах:" -ForegroundColor Cyan
Write-Host "   - TEST/ngrok-alternative-setup.md" -ForegroundColor White
Write-Host "   - TEST/telegram-login-troubleshooting.md" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Для остановки всех процессов закройте все открытые терминалы" -ForegroundColor Yellow

# Открытие ngrok web interface
Start-Sleep -Seconds 2
Write-Host "🌐 Открытие ngrok web interface..." -ForegroundColor Cyan
Start-Process "http://localhost:4040"

Write-Host ""
Write-Host "✨ Готово! Проект запущен с ngrok туннелями." -ForegroundColor Green
Write-Host "Нажмите любую клавишу для выхода..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")