# Tinder Mini App for Telegram

Веб-приложение для знакомств, интегрированное с Telegram Bot API.

## 🚀 Быстрый старт

### Предварительные требования
- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB (локально или Atlas)
- Docker (опционально)

### Установка зависимостей
```bash
# Установка всех зависимостей (фронтенд + бэкенд)
npm run install:all
```

### Настройка переменных окружения
Скопируйте файл `.env.example` в `.env` и настройте переменные:
```bash
cp backend/.env.example backend/.env
```

Обязательные переменные:
- `BOT_TOKEN` - токен Telegram бота
- `MONGODB_URI` - URI подключения к MongoDB
- `MONGODB_DATABASE` - название базы данных

### Разработка
```bash
# Запуск фронтенда и бэкенда одновременно
npm run dev

# Только фронтенд
npm run dev:frontend

# Только бэкенд
npm run dev:backend
```

### Сборка для продакшена
```bash
# Сборка фронтенда и бэкенда
npm run build

# Только фронтенд
npm run build:frontend

# Только бэкенд
npm run build:backend
```

### Запуск продакшн версии
```bash
# Запуск полного приложения
npm start

# Запуск только бэкенда
npm run start:backend
```

## 🐳 Docker

```bash
# Разработка
npm run docker:dev

# Продакшн
npm run docker:prod

# Просмотр логов
npm run docker:logs
```

## 📁 Структура проекта

```
├── src/                 # Фронтенд (React + TypeScript)
│   ├── screens/         # Экраны приложения
│   ├── queries/         # React Query хуки
│   ├── ui/             # UI компоненты
│   └── domain/         # Типы данных
├── backend/             # Бэкенд (Node.js + Express)
│   ├── app/            # Бизнес-логика
│   ├── adapter/        # Адаптеры для API
│   ├── domain/         # Доменные модели
│   ├── infra/          # Инфраструктура
│   └── dist/           # Скомпилированный код
├── nginx/              # Конфигурация Nginx
├── mongo/              # Конфигурация MongoDB
├── docker-compose.yml  # Docker конфигурация
└── server.js           # Основной сервер
```

## 🔧 Технологии

### Фронтенд
- React 18.3.1
- TypeScript 5.8.3
- Vite 5.4.10
- React Query 5.28.4
- React Router 6.28.0

### Бэкенд
- Node.js 22.15.0
- Express 4.19.2
- TypeScript 5.8.3
- MongoDB 6.17.0
- AWS S3 SDK

## 📦 Публикация

### 1. Подготовка к публикации
```bash
# Очистка и пересборка
npm run clean
npm run build
```

### 2. Настройка сервера
- Установите Node.js >= 18.0.0
- Установите MongoDB
- Настройте Nginx (конфигурация в папке `nginx/`)

### 3. Развертывание
```bash
# Клонирование репозитория
git clone <repository-url>
cd TinderMiniApp-Tg-2023

# Установка зависимостей
npm run install:all

# Настройка переменных окружения
cp backend/.env.example backend/.env
# Отредактируйте .env файл

# Сборка проекта
npm run build

# Запуск
npm start
```

### 4. Docker развертывание
```bash
# Продакшн развертывание
npm run docker:prod

# Просмотр логов
npm run docker:logs
```

## 🐛 Устранение неполадок

### Проблемы с MongoDB
- Убедитесь, что MongoDB запущен
- Проверьте URI подключения в `.env`
- Проверьте права доступа к базе данных

### Проблемы с Telegram Bot
- Проверьте токен бота в `.env`
- Убедитесь, что бот создан через @BotFather
- Проверьте webhook URL

### Проблемы со сборкой
```bash
# Очистка кэша
npm run clean
rm -rf node_modules backend/node_modules
npm run install:all
npm run build
```

## 📝 Лицензия

MIT

## 🤝 Поддержка

При возникновении проблем создайте issue в репозитории или обратитесь к документации.
