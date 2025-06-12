# Быстрая настройка тестового окружения
Write-Host "🚀 Быстрая настройка тестового окружения" -ForegroundColor Green
Write-Host ""

# Переход в корневую директорию
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot
Write-Host "📁 Директория: $projectRoot" -ForegroundColor Cyan

# Установка зависимостей backend
Write-Host "📦 Установка зависимостей backend..." -ForegroundColor Yellow
Set-Location "backend"
npm install
Write-Host "✅ Backend готов" -ForegroundColor Green

# Установка зависимостей frontend
Set-Location $projectRoot
Write-Host "📦 Установка зависимостей frontend..." -ForegroundColor Yellow
Set-Location "tg-web-app"
npm install
Write-Host "✅ Frontend готов" -ForegroundColor Green

# Возврат в корень
Set-Location $projectRoot

Write-Host ""
Write-Host "🎉 Настройка завершена!" -ForegroundColor Green
Write-Host "📋 Следующие шаги:" -ForegroundColor Cyan
Write-Host '1. Обновите BOT_TOKEN в backend\.env' -ForegroundColor White
Write-Host '2. Запустите: .\TEST\start-dev.ps1' -ForegroundColor White