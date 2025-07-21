# Скрипт для обновления webhook Telegram бота
$token = "7366223026:AAGvtUl6a1SX6GPlNIWopluow1nZ_iYsKfU"
$webhook_url = "https://94e0-91-121-218-132.ngrok-free.app/webhook"
$api_url = "https://api.telegram.org/bot$token/setWebhook?url=$webhook_url"

Write-Host "Обновление webhook на: $webhook_url"

try {
    $response = Invoke-WebRequest -Uri $api_url -Method POST -UseBasicParsing
    Write-Host "Ответ от Telegram API:"
    Write-Host $response.Content
} catch {
    Write-Host "Ошибка при обновлении webhook: $($_.Exception.Message)"
}