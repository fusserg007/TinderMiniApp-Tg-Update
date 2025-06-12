# Скрипт для обновления .env файла и создания webhook
# Использование: .\update-env-and-webhook.ps1 "backend_url" "frontend_url"

param(
    [Parameter(Mandatory=$true)]
    [string]$BackendUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$FrontendUrl
)

Write-Host "🔧 Обновление конфигурации..." -ForegroundColor Green
Write-Host "Backend URL: $BackendUrl" -ForegroundColor Cyan
Write-Host "Frontend URL: $FrontendUrl" -ForegroundColor Blue
Write-Host ""

# Проверка формата URLs
if ($BackendUrl -notmatch '^https://.*\.trycloudflare\.com$') {
    Write-Host "❌ Неверный формат Backend URL. Должен быть: https://xxx.trycloudflare.com" -ForegroundColor Red
    exit 1
}

if ($FrontendUrl -notmatch '^https://.*\.trycloudflare\.com$') {
    Write-Host "❌ Неверный формат Frontend URL. Должен быть: https://xxx.trycloudflare.com" -ForegroundColor Red
    exit 1
}

# Путь к .env файлу
$envPath = "backend\.env"

if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env файл не найден: $envPath" -ForegroundColor Red
    exit 1
}

# Чтение текущего .env файла
$envContent = Get-Content $envPath
Write-Host "📄 Обновление .env файла..." -ForegroundColor Cyan

# Обновление переменных
$newEnvContent = @()
$webhookUpdated = $false
$frontendUpdated = $false
$telegramTokenFound = $false
$botToken = ""

foreach ($line in $envContent) {
    if ($line -match '^WEBHOOK_URL=') {
        $newEnvContent += "WEBHOOK_URL=$BackendUrl/webhook"
        $webhookUpdated = $true
        Write-Host "  ✅ WEBHOOK_URL обновлен" -ForegroundColor Green
    }
    elseif ($line -match '^FRONTEND_URL=') {
        $newEnvContent += "FRONTEND_URL=$FrontendUrl"
        $frontendUpdated = $true
        Write-Host "  ✅ FRONTEND_URL обновлен" -ForegroundColor Green
    }
    elseif ($line -match '^BOT_TOKEN=(.+)') {
        $botToken = $matches[1]
        if ($botToken -ne "your_test_bot_token_here" -and $botToken.Length -gt 10) {
            $telegramTokenFound = $true
            Write-Host "  ✅ Найден токен бота" -ForegroundColor Green
        }
        $newEnvContent += $line
    }
    elseif ($line -match '^TELEGRAM_BOT_TOKEN=(.+)') {
        $botToken = $matches[1]
        if ($botToken -ne "your_test_bot_token_here" -and $botToken.Length -gt 10) {
            $telegramTokenFound = $true
            Write-Host "  ✅ Найден токен бота" -ForegroundColor Green
        }
        $newEnvContent += $line
    }
    else {
        $newEnvContent += $line
    }
}

# Добавление недостающих переменных
if (-not $webhookUpdated) {
    $newEnvContent += "WEBHOOK_URL=$BackendUrl/webhook"
    Write-Host "  ➕ WEBHOOK_URL добавлен" -ForegroundColor Yellow
}
if (-not $frontendUpdated) {
    $newEnvContent += "FRONTEND_URL=$FrontendUrl"
    Write-Host "  ➕ FRONTEND_URL добавлен" -ForegroundColor Yellow
}

# Сохранение обновленного .env файла
$newEnvContent | Out-File -FilePath $envPath -Encoding UTF8
Write-Host "✅ .env файл сохранен" -ForegroundColor Green
Write-Host ""

# Создание webhook, если найден токен
if ($telegramTokenFound -and $botToken) {
    Write-Host "🤖 Создание webhook..." -ForegroundColor Cyan
    $webhookUrl = "$BackendUrl/webhook"
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/setWebhook" -Method Post -Body @{
            url = $webhookUrl
        } -ContentType "application/x-www-form-urlencoded"
        
        if ($response.ok) {
            Write-Host "✅ Webhook успешно установлен!" -ForegroundColor Green
            Write-Host "   URL: $webhookUrl" -ForegroundColor White
        } else {
            Write-Host "❌ Ошибка установки webhook: $($response.description)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Ошибка при установке webhook: $_" -ForegroundColor Red
        Write-Host "   Проверьте токен бота и доступность интернета" -ForegroundColor Yellow
    }
    
    # Проверка статуса webhook
    Write-Host "📋 Проверка webhook..." -ForegroundColor Cyan
    try {
        $webhookInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo" -Method Get
        Write-Host "   URL: $($webhookInfo.result.url)" -ForegroundColor White
        Write-Host "   Последняя ошибка: $($webhookInfo.result.last_error_message)" -ForegroundColor $(if ($webhookInfo.result.last_error_message) { 'Yellow' } else { 'Green' })
        Write-Host "   Количество ошибок: $($webhookInfo.result.last_error_date)" -ForegroundColor White
    } catch {
        Write-Host "⚠️ Не удалось получить информацию о webhook" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ Токен бота не найден или некорректен" -ForegroundColor Yellow
    Write-Host "   Обновите BOT_TOKEN или TELEGRAM_BOT_TOKEN в .env файле" -ForegroundColor White
    Write-Host "   Затем запустите webhook вручную:" -ForegroundColor White
    Write-Host "   curl -X POST \"https://api.telegram.org/bot<TOKEN>/setWebhook?url=$BackendUrl/webhook\"" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎉 Настройка завершена!" -ForegroundColor Green
Write-Host "📱 Backend: $BackendUrl" -ForegroundColor White
Write-Host "🌐 Frontend: $FrontendUrl" -ForegroundColor White
Write-Host ""
Write-Host "📋 Следующие шаги:" -ForegroundColor Yellow
Write-Host "1. Перезапустите backend сервер для применения новых настроек" -ForegroundColor White
Write-Host "2. Откройте вашего бота в Telegram" -ForegroundColor White
Write-Host "3. Отправьте /start для тестирования" -ForegroundColor White
Write-Host ""
Write-Host "Нажмите любую клавишу для завершения..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")