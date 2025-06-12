# Автоматизированный запуск Telegram Mini App с Cloudflare Tunnel
# Этот скрипт запускает все необходимые сервисы для тестирования

Write-Host "🚀 Запуск Telegram Mini App с Cloudflare Tunnel..." -ForegroundColor Green
Write-Host "" 

# Проверка наличия cloudflared
if (-not (Test-Path ".\cloudflared.exe")) {
    Write-Host "📥 Скачивание cloudflared..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"
        Write-Host "✅ cloudflared успешно скачан" -ForegroundColor Green
    } catch {
        Write-Host "❌ Ошибка скачивания cloudflared: $_" -ForegroundColor Red
        exit 1
    }
}

# Запуск Backend сервера
Write-Host "🔧 Запуск Backend сервера..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg\backend'; Write-Host 'Backend Server' -ForegroundColor Green; npm run dev"

# Запуск Frontend сервера
Write-Host "🎨 Запуск Frontend сервера..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg\tg-web-app'; Write-Host 'Frontend Server' -ForegroundColor Blue; npm run dev"

# Ожидание запуска серверов
Write-Host "⏳ Ожидание запуска серверов (10 секунд)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Запуск Cloudflare туннеля для Backend
Write-Host "🌐 Запуск Cloudflare туннеля для Backend..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg'; Write-Host 'Backend Cloudflare Tunnel - СКОПИРУЙТЕ URL ИЗ ЭТОГО ОКНА!' -ForegroundColor Red; Write-Host 'Ищите строку с https://xxx.trycloudflare.com' -ForegroundColor Yellow; .\cloudflared.exe tunnel --url http://localhost:4000"

# Запуск Cloudflare туннеля для Frontend
Write-Host "🌐 Запуск Cloudflare туннеля для Frontend..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg'; Write-Host 'Frontend Cloudflare Tunnel - СКОПИРУЙТЕ URL ИЗ ЭТОГО ОКНА!' -ForegroundColor Red; Write-Host 'Ищите строку с https://xxx.trycloudflare.com' -ForegroundColor Yellow; .\cloudflared.exe tunnel --url http://localhost:5173"

Write-Host "" 
Write-Host "✅ Все сервисы запущены!" -ForegroundColor Green
Write-Host "" 
Write-Host "📋 СЛЕДУЮЩИЕ ШАГИ:" -ForegroundColor Yellow
Write-Host "1. Скопируйте URLs из окон Cloudflare туннелей" -ForegroundColor White
Write-Host "2. Backend URL будет вида: https://xxx-backend.trycloudflare.com" -ForegroundColor White
Write-Host "3. Frontend URL будет вида: https://xxx-frontend.trycloudflare.com" -ForegroundColor White
Write-Host "4. Обновите .env файл с новыми URLs" -ForegroundColor White
Write-Host "5. Создайте бота в @BotFather (основной Telegram)" -ForegroundColor White
Write-Host "6. Установите webhook и создайте Mini App" -ForegroundColor White
Write-Host "" 
Write-Host "📖 Подробная инструкция в файле: cloudflare-tunnel-setup.md" -ForegroundColor Cyan
Write-Host "" 
Write-Host "Нажмите любую клавишу для продолжения..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")