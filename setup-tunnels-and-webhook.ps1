# Автоматическая настройка туннелей и webhook для Telegram Mini App

Write-Host "🚀 Настройка туннелей и webhook..." -ForegroundColor Green

# Функция для извлечения URL из вывода cloudflared
function Get-TunnelUrl {
    param(
        [string]$LogFile,
        [int]$TimeoutSeconds = 30
    )
    
    $startTime = Get-Date
    while ((Get-Date) -lt $startTime.AddSeconds($TimeoutSeconds)) {
        if (Test-Path $LogFile) {
            $content = Get-Content $LogFile -Raw
            if ($content -match 'https://[a-zA-Z0-9-]+\.trycloudflare\.com') {
                return $matches[0]
            }
        }
        Start-Sleep -Seconds 1
    }
    return $null
}

# Запуск backend туннеля
Write-Host "🌐 Запуск backend туннеля..." -ForegroundColor Cyan
$backendProcess = Start-Process -FilePath ".\cloudflared.exe" -ArgumentList "tunnel", "--url", "http://localhost:4000", "--logfile", "backend-tunnel.log" -PassThru -WindowStyle Hidden

# Ожидание и получение backend URL
Write-Host "⏳ Ожидание backend URL..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
$backendUrl = Get-TunnelUrl -LogFile "backend-tunnel.log"

if ($backendUrl) {
    Write-Host "✅ Backend URL: $backendUrl" -ForegroundColor Green
} else {
    Write-Host "❌ Не удалось получить backend URL" -ForegroundColor Red
    exit 1
}

# Запуск frontend туннеля
Write-Host "🌐 Запуск frontend туннеля..." -ForegroundColor Cyan
$frontendProcess = Start-Process -FilePath ".\cloudflared.exe" -ArgumentList "tunnel", "--url", "http://localhost:5173", "--logfile", "frontend-tunnel.log" -PassThru -WindowStyle Hidden

# Ожидание и получение frontend URL
Write-Host "⏳ Ожидание frontend URL..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
$frontendUrl = Get-TunnelUrl -LogFile "frontend-tunnel.log"

if ($frontendUrl) {
    Write-Host "✅ Frontend URL: $frontendUrl" -ForegroundColor Green
} else {
    Write-Host "❌ Не удалось получить frontend URL" -ForegroundColor Red
    exit 1
}

# Чтение текущего .env файла
$envPath = "backend\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    Write-Host "📄 Обновление .env файла..." -ForegroundColor Cyan
    
    # Обновление URLs в .env
    $newEnvContent = @()
    $webhookUpdated = $false
    $frontendUpdated = $false
    
    foreach ($line in $envContent) {
        if ($line -match '^WEBHOOK_URL=') {
            $newEnvContent += "WEBHOOK_URL=$backendUrl/webhook"
            $webhookUpdated = $true
        }
        elseif ($line -match '^FRONTEND_URL=') {
            $newEnvContent += "FRONTEND_URL=$frontendUrl"
            $frontendUpdated = $true
        }
        else {
            $newEnvContent += $line
        }
    }
    
    # Добавление недостающих переменных
    if (-not $webhookUpdated) {
        $newEnvContent += "WEBHOOK_URL=$backendUrl/webhook"
    }
    if (-not $frontendUpdated) {
        $newEnvContent += "FRONTEND_URL=$frontendUrl"
    }
    
    # Сохранение обновленного .env
    $newEnvContent | Out-File -FilePath $envPath -Encoding UTF8
    Write-Host "✅ .env файл обновлен" -ForegroundColor Green
    
    # Получение токена бота из .env
    $botToken = ($envContent | Where-Object { $_ -match '^TELEGRAM_BOT_TOKEN=' }) -replace 'TELEGRAM_BOT_TOKEN=', ''
    
    if ($botToken) {
        Write-Host "🤖 Установка webhook..." -ForegroundColor Cyan
        $webhookUrl = "$backendUrl/webhook"
        
        try {
            $response = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/setWebhook" -Method Post -Body @{
                url = $webhookUrl
            }
            
            if ($response.ok) {
                Write-Host "✅ Webhook установлен: $webhookUrl" -ForegroundColor Green
            } else {
                Write-Host "❌ Ошибка установки webhook: $($response.description)" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Ошибка при установке webhook: $_" -ForegroundColor Red
        }
        
        # Проверка webhook
        try {
            $webhookInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo" -Method Get
            Write-Host "📋 Информация о webhook:" -ForegroundColor Cyan
            Write-Host "   URL: $($webhookInfo.result.url)" -ForegroundColor White
            Write-Host "   Статус: $($webhookInfo.result.has_custom_certificate ? 'Сертификат' : 'Стандартный')" -ForegroundColor White
        } catch {
            Write-Host "⚠️ Не удалось получить информацию о webhook" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Токен бота не найден в .env файле" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env файл не найден" -ForegroundColor Red
}

Write-Host "" 
Write-Host "🎉 Настройка завершена!" -ForegroundColor Green
Write-Host "📱 Backend URL: $backendUrl" -ForegroundColor White
Write-Host "🌐 Frontend URL: $frontendUrl" -ForegroundColor White
Write-Host "" 
Write-Host "📋 Следующие шаги:" -ForegroundColor Yellow
Write-Host "1. Перезапустите backend сервер для применения новых настроек" -ForegroundColor White
Write-Host "2. Откройте вашего бота в Telegram" -ForegroundColor White
Write-Host "3. Отправьте /start для тестирования" -ForegroundColor White
Write-Host "" 
Write-Host "Нажмите любую клавишу для завершения..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Сохранение PID процессов для последующего управления
@{
    BackendTunnel = $backendProcess.Id
    FrontendTunnel = $frontendProcess.Id
    BackendUrl = $backendUrl
    FrontendUrl = $frontendUrl
} | ConvertTo-Json | Out-File -FilePath "tunnel-info.json" -Encoding UTF8