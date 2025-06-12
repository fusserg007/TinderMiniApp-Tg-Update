# Запуск Cloudflare туннелей с видимыми URLs

Write-Host "🚀 Запуск Cloudflare туннелей..." -ForegroundColor Green
Write-Host "📋 Откроются 2 окна с URLs - СКОПИРУЙТЕ ИХ!" -ForegroundColor Yellow
Write-Host ""

# Запуск backend туннеля в отдельном окне
Write-Host "🔧 Запуск Backend туннеля..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
    Write-Host '🔧 BACKEND TUNNEL - СКОПИРУЙТЕ URL НИЖЕ!' -ForegroundColor Red
    Write-Host '================================================' -ForegroundColor Red
    cd 'c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg'
    .\cloudflared.exe tunnel --url http://localhost:4000
"

# Небольшая пауза
Start-Sleep -Seconds 2

# Запуск frontend туннеля в отдельном окне
Write-Host "🎨 Запуск Frontend туннеля..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
    Write-Host '🎨 FRONTEND TUNNEL - СКОПИРУЙТЕ URL НИЖЕ!' -ForegroundColor Blue
    Write-Host '=================================================' -ForegroundColor Blue
    cd 'c:\Users\пользователь\Downloads\TinderMiniAppTg\TinderMiniAppTg'
    .\cloudflared.exe tunnel --url http://localhost:5173
"

Write-Host ""
Write-Host "✅ Туннели запущены!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 ИНСТРУКЦИИ:" -ForegroundColor Yellow
Write-Host "1. В окне 'BACKEND TUNNEL' найдите строку с https://xxx.trycloudflare.com" -ForegroundColor White
Write-Host "2. В окне 'FRONTEND TUNNEL' найдите строку с https://yyy.trycloudflare.com" -ForegroundColor White
Write-Host "3. Скопируйте оба URL" -ForegroundColor White
Write-Host "4. Сообщите мне URLs, и я обновлю .env файл и создам webhook" -ForegroundColor White
Write-Host ""
Write-Host "Пример URLs:" -ForegroundColor Cyan
Write-Host "Backend: https://abc-def-123.trycloudflare.com" -ForegroundColor Gray
Write-Host "Frontend: https://xyz-uvw-456.trycloudflare.com" -ForegroundColor Gray
Write-Host ""
Write-Host "Нажмите любую клавишу для продолжения..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")