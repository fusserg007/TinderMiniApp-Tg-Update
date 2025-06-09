# Настройка Telegram бота

## Получение токена бота

1. Откройте Telegram и найдите бота @BotFather
2. Отправьте команду `/newbot`
3. Следуйте инструкциям:
   - Введите имя вашего бота (например: "Dating Mini App")
   - Введите username бота (должен заканчиваться на "bot", например: "your_dating_bot")

4. BotFather выдаст вам токен в формате: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

## Настройка Mini App

1. Отправьте команду `/mybots` в @BotFather
2. Выберите вашего бота
3. Выберите "Bot Settings" → "Menu Button" → "Configure Menu Button"
4. Введите URL вашего Mini App (например: `https://your-domain.com`)
5. Введите текст кнопки (например: "Открыть приложение")

## Обновление .env файла

Замените следующие значения в файле `.env`:

```env
# Замените на реальный токен от BotFather
BOT_TOKEN=ВАШ_РЕАЛЬНЫЙ_ТОКЕН
TELEGRAM_BOT_API=ВАШ_РЕАЛЬНЫЙ_ТОКЕН

# Замените на реальный username бота
BOT_USERNAME=ваш_бот_username
VITE_BOT_USERNAME=ваш_бот_username
```

## Проверка настройки

После обновления токенов запустите тест:
```bash
node TEST/app-components.test.cjs
```

Готовность проекта должна увеличиться до 80%.

## Дополнительные настройки

### Webhook (для продакшена)
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/api/webhook"}'
```

### Команды бота
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setMyCommands" \
     -H "Content-Type: application/json" \
     -d '{"commands": [{"command": "start", "description": "Запустить приложение знакомств"}]}'
```