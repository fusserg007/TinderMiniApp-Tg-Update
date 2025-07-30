# ⚡ ШПАРГАЛКА КОМАНД ДЛЯ РАЗВЕРТЫВАНИЯ

## 🤖 TELEGRAM BOT КОМАНДЫ

### Создание бота:
```
@BotFather
/start
/newbot
Введите имя: My Dating App
Введите username: my_dating_app_bot
Сохраните токен: 1234567890:ABCdefGHI...
```

### Создание Web App:
```
@BotFather
/newapp
Выберите бота
Название: Dating App
Описание: Find your soulmate!
Фото: загрузите 512x512
URL: https://example.com (временно)
```

### Обновление после деплоя:
```
@BotFather
/myapps
Выберите приложение
Edit Web App URL: https://ваш-домен.twc1.net

/setmenubutton
Выберите бота
Текст: 🔥 Открыть приложение
URL: https://ваш-домен.twc1.net
```

---

## 🗄️ MONGODB ATLAS КОМАНДЫ

### Создание кластера:
```
1. mongodb.com/atlas → Try Free
2. Build a Database → FREE (M0)
3. AWS → Frankfurt (eu-central-1)
4. Cluster Name: dating-app-cluster
5. Create Cluster
```

### Настройка доступа:
```
Database Access:
- Add New Database User
- Username: dating_user
- Password: DatingApp2024!
- Role: Atlas admin

Network Access:
- Add IP Address
- Allow access from anywhere (0.0.0.0/0)
```

### Получение строки подключения:
```
Database → Connect → Connect your application
Копировать строку:
mongodb+srv://dating_user:<password>@cluster...
Заменить <password> на реальный пароль
```

---

## 🌐 TIMEWEB CLOUD КОМАНДЫ

### Создание приложения:
```
1. timeweb.cloud → Регистрация
2. Облачные приложения → Создать приложение
3. Подключить GitHub репозиторий
4. Тип: Docker → Docker Compose
5. Файл: docker-compose.timeweb.yml
6. Название: my-dating-app
```

### Добавление переменных (копировать по одной):
```
MONGODB_URI=mongodb+srv://dating_user:ПАРОЛЬ@cluster...
MONGODB_DATABASE=dating_app
MINIO_ROOT_USER=minio_admin
MINIO_ROOT_PASSWORD=minio_super_secret_password_2024
AWS_ACCESS_KEY_ID=minio_admin
AWS_SECRET_ACCESS_KEY=minio_super_secret_password_2024
AWS_BUCKET=dating-app-files
AWS_REGION=us-east-1
IMGPROXY_KEY=943b421c9eb07c830af81030552c86009268de4e532ba2ee2eab8247c6da0881
IMGPROXY_SALT=520f986b998545b4785e0defbc4f3c1203f22de2374a3d53cb7a7fe9fea309c5
BOT_TOKEN=ВАШ_ТОКЕН_ОТ_BOTFATHER
BOT_USERNAME=ваш_бот_username
VITE_BACKEND_URL=https://my-dating-app.twc1.net/api
DOMAIN=my-dating-app.twc1.net
NODE_ENV=production
PORT=4000
```

---

## 🔧 ПРОВЕРОЧНЫЕ КОМАНДЫ

### Проверка доступности:
```bash
# Лендинг
curl -I https://ваш-домен.twc1.net/

# API
curl https://ваш-домен.twc1.net/api/health

# Frontend
curl -I https://ваш-домен.twc1.net/app

# ImgProxy
curl -I https://ваш-домен.twc1.net/imgproxy/
```

### Проверка Telegram Bot:
```bash
# Информация о боте
curl "https://api.telegram.org/bot<BOT_TOKEN>/getMe"

# Статус webhook
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"

# Установка webhook (если нужно)
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://ваш-домен.twc1.net/api/webhook"
```

---

## 🐛 КОМАНДЫ ДИАГНОСТИКИ

### Проверка логов в Timeweb:
```
1. Панель Timeweb → Ваше приложение
2. Вкладка "Логи"
3. Выберите сервис:
   - nginx (веб-сервер)
   - backend (API)
   - frontend (React)
   - mongo (база данных)
   - object-storage (MinIO)
   - imgproxy (обработка изображений)
```

### Перезапуск приложения:
```
Панель Timeweb → Ваше приложение → Перезапустить
```

### Обновление переменных:
```
1. Панель Timeweb → Переменные окружения
2. Изменить нужную переменную
3. Сохранить
4. Перезапустить приложение
```

---

## 🔄 GIT КОМАНДЫ

### Первоначальная загрузка:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/repo.git
git branch -M main
git push -u origin main
```

### Обновление кода:
```bash
git add .
git commit -m "Update configuration"
git push origin main
# Timeweb автоматически перезапустит приложение
```

### Откат изменений:
```bash
git revert HEAD
git push origin main
```

---

## 🌐 НАСТРОЙКА СОБСТВЕННОГО ДОМЕНА

### DNS настройки:
```
Тип: A
Имя: @ (или пусто)
Значение: IP-адрес Timeweb приложения
TTL: 3600

Тип: CNAME (опционально)
Имя: www
Значение: ваш-домен.com
TTL: 3600
```

### В панели Timeweb:
```
Ваше приложение → Домены → Добавить домен
Домен: mydatingapp.com
Дождаться выпуска SSL сертификата
```

### Обновление переменных:
```
VITE_BACKEND_URL=https://mydatingapp.com/api
DOMAIN=mydatingapp.com
```

---

## 🚨 КОМАНДЫ ЭКСТРЕННОГО ВОССТАНОВЛЕНИЯ

### При критических ошибках:
```bash
# 1. Сохранить логи
# Панель Timeweb → Логи → Скачать

# 2. Откатить код
git log --oneline  # найти последний рабочий коммит
git revert <commit-hash>
git push origin main

# 3. Перезапустить приложение
# Панель Timeweb → Перезапустить

# 4. Проверить переменные
# Панель Timeweb → Переменные окружения
```

### Сброс webhook:
```bash
# Удалить webhook
curl "https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook"

# Установить заново
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://ваш-домен.twc1.net/api/webhook"
```

---

## 📞 КОНТАКТЫ ПОДДЕРЖКИ

### Timeweb Cloud:
```
Email: support@timeweb.ru
Телефон: 8 (800) 700-06-08
Чат: в панели управления
```

### MongoDB Atlas:
```
Поддержка: support.mongodb.com
Документация: docs.atlas.mongodb.com
```

### Telegram Bot API:
```
Поддержка: @BotSupport
Документация: core.telegram.org/bots/api
```

---

## ⏱️ ВРЕМЕННЫЕ РАМКИ

| Этап | Время |
|------|-------|
| Создание Telegram Bot | 5 мин |
| Настройка MongoDB Atlas | 10 мин |
| Редактирование переменных | 5 мин |
| Развертывание на Timeweb | 15 мин |
| Настройка бота | 5 мин |
| Тестирование | 10 мин |
| **ИТОГО** | **50 мин** |

---

**💡 Совет**: Сохраните эту шпаргалку - она пригодится при обновлениях и устранении проблем!