# Скрипт запуска проекта в режиме разработки
# Запуск: powershell -ExecutionPolicy Bypass -File start-development.ps1

Write-Host "🚀 Запуск Tinder Mini App в режиме разработки" -ForegroundColor Green
Write-Host ""

# Переход в корневую директорию проекта
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "📁 Рабочая директория: $projectRoot" -ForegroundColor Cyan
Write-Host ""

# Проверка .env файла
Write-Host "🔧 Проверка конфигурации..." -ForegroundColor Yellow
$envPath = "backend\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ Файл .env не найден в папке backend" -ForegroundColor Red
    Write-Host "   Запустите сначала setup-test-environment.ps1" -ForegroundColor Yellow
    exit 1
}

# Проверка токена
$envContent = Get-Content $envPath -Raw
if ($envContent -match 'BOT_TOKEN=your_test_bot_token_here') {
    Write-Host "⚠️ BOT_TOKEN не настроен в .env файле" -ForegroundColor Yellow
    Write-Host "   Получите токен от @BotFather в тестовой среде и обновите .env" -ForegroundColor Cyan
    Write-Host "   Продолжить без токена? (y/N): " -ForegroundColor Yellow -NoNewline
    $continue = Read-Host
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Настройте токен и запустите скрипт снова" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "✅ Конфигурация проверена" -ForegroundColor Green
Write-Host ""

# Функция для запуска процесса в новом окне
function Start-ProcessInNewWindow {
    param(
        [string]$WorkingDirectory,
        [string]$Command,
        [string]$Arguments,
        [string]$Title
    )
    
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "powershell.exe"
    $startInfo.Arguments = "-NoExit -Command `"cd '$WorkingDirectory'; $Command $Arguments`""
    $startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Normal
    $startInfo.CreateNoWindow = $false
    
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $startInfo
    $process.Start()
    
    return $process
}

# Запуск backend сервера
Write-Host "🔧 Запуск backend сервера..." -ForegroundColor Yellow
$backendPath = Join-Path $projectRoot "backend"
$backendProcess = Start-ProcessInNewWindow -WorkingDirectory $backendPath -Command "npm" -Arguments "run dev" -Title "Backend Server"

if ($backendProcess) {
    Write-Host "✅ Backend сервер запущен в новом окне (PID: $($backendProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ Ошибка запуска backend сервера" -ForegroundColor Red
    exit 1
}

# Небольшая пауза перед запуском frontend
Start-Sleep -Seconds 2

# Запуск frontend сервера
Write-Host "🎨 Запуск frontend сервера..." -ForegroundColor Yellow
$frontendPath = Join-Path $projectRoot "tg-web-app"
$frontendProcess = Start-ProcessInNewWindow -WorkingDirectory $frontendPath -Command "npm" -Arguments "run dev" -Title "Frontend Server"

if ($frontendProcess) {
    Write-Host "✅ Frontend сервер запущен в новом окне (PID: $($frontendProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ Ошибка запуска frontend сервера" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Проект успешно запущен!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Информация о сервисах:" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:4000" -ForegroundColor White
Write-Host "🎨 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Проверка работы:" -ForegroundColor Cyan
Write-Host "• Backend health: http://localhost:4000/health" -ForegroundColor White
Write-Host "• Frontend app:   http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "📱 Для тестирования в Telegram:" -ForegroundColor Cyan
Write-Host "1. Откройте тестовую среду Telegram" -ForegroundColor White
Write-Host "2. Найдите своего тестового бота" -ForegroundColor White
Write-Host "3. Откройте Mini App" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Для остановки серверов закройте окна PowerShell" -ForegroundColor Yellow
Write-Host ""
Write-Host "Нажмите любую клавишу для выхода..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")