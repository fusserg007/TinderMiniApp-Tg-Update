# Ручная настройка ngrok (Решение проблемы с тестовой средой)

## Текущее состояние
✅ Backend запущен на порту 4000  
✅ Frontend запущен на порту 5173  
✅ ngrok установлен  

## Пошаговая инструкция

### Шаг 1: Регистрация в ngrok
1. Откройте https://ngrok.com
2. Зарегистрируйтесь (бесплатно)
3. Скопируйте ваш authtoken из личного кабинета
4. Выполните в терминале:
```powershell
ngrok config add-authtoken ВАШ_ТОКЕН
```

### Шаг 2: Запуск ngrok туннелей

#### Для backend (webhook):
1. Откройте **новый терминал PowerShell**
2. Выполните:
```powershell
ngrok http 4000
```
3. **НЕ ЗАКРЫВАЙТЕ** этот терминал
4. Скопируйте HTTPS URL (например: `https://abc123.ngrok.io`)

#### Для frontend (Mini App):
1. Откройте **еще один новый терминал PowerShell**
2. Выполните:
```powershell
ngrok http 5173
```
3. **НЕ ЗАКРЫВАЙТЕ** этот терминал
4. Скопируйте HTTPS URL (например: `https://def456.ngrok.io`)

### Шаг 3: Создание бота в основном Telegram

1. Откройте обычный Telegram (не тестовую среду)
2. Найдите @BotFather
3. Отправьте `/newbot`
4. Введите имя бота (например: "My Tinder Bot")
5. Введите username бота (например: "my_tinder_test_bot")
6. **СОХРАНИТЕ ТОКЕН БОТА**

### Шаг 4: Обновление .env файла

Откройте файл `.env` и обновите:
```env
TELEGRAM_BOT_TOKEN=ТОКЕН_ИЗ_BOTFATHER
WEBHOOK_URL=https://ВАШ_BACKEND_NGROK_URL.ngrok.io/webhook
PORT=4000
FRONTEND_URL=https://ВАШ_FRONTEND_NGROK_URL.ngrok.io
```

### Шаг 5: Установка webhook

Выполните в терминале (замените на ваши данные):
```powershell
curl -X POST "https://api.telegram.org/botВАШ_ТОКЕН/setWebhook?url=https://ВАШ_BACKEND_NGROK_URL.ngrok.io/webhook"
```

### Шаг 6: Создание Mini App

1. В @BotFather отправьте `/newapp`
2. Выберите вашего бота
3. Введите название приложения
4. Введите описание
5. Загрузите иконку (512x512 px)
6. **ВАЖНО**: Введите URL Mini App: `https://ВАШ_FRONTEND_NGROK_URL.ngrok.io`

### Шаг 7: Проверка работы

1. Откройте http://localhost:4040 (ngrok web interface)
2. Убедитесь, что оба туннеля активны
3. Откройте вашего бота в Telegram
4. Нажмите на кнопку Mini App

## Отладка

### Проверка webhook:
```powershell
curl "https://api.telegram.org/botВАШ_ТОКЕН/getWebhookInfo"
```

### Проверка backend:
```powershell
curl https://ВАШ_BACKEND_NGROK_URL.ngrok.io/health
```

### Просмотр логов:
- Backend логи: в терминале где запущен `npm run dev`
- Webhook запросы: http://localhost:4040 (ngrok interface)

## Важные замечания

⚠️ **Бесплатный ngrok**:
- URL меняется при каждом перезапуске
- Нужно обновлять webhook и Mini App URL
- Ограничение: 40 подключений в минуту

⚠️ **Не закрывайте терминалы**:
- Backend: `npm run dev`
- Frontend: `npm run dev` 
- Ngrok backend: `ngrok http 4000`
- Ngrok frontend: `ngrok http 5173`

## Быстрый перезапуск

Если ngrok URLs изменились:
1. Скопируйте новые URLs из ngrok терминалов
2. Обновите `.env` файл
3. Установите новый webhook
4. Обновите Mini App URL в @BotFather

---

**Это решение обходит проблемы с тестовой средой Telegram и позволяет полноценно тестировать Mini App в основной среде.**