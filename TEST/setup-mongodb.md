# Установка MongoDB для тестирования

## Вариант 1: Установка MongoDB Community Edition (рекомендуется)

### Шаги установки:

1. **Скачайте MongoDB Community Server:**
   - Перейдите на https://www.mongodb.com/try/download/community
   - Выберите версию для Windows
   - Скачайте MSI установщик

2. **Установите MongoDB:**
   - Запустите скачанный MSI файл
   - Выберите "Complete" установку
   - Установите MongoDB как службу Windows
   - Установите MongoDB Compass (GUI инструмент)

3. **Настройте MongoDB:**
   ```bash
   # Создайте директории для данных
   mkdir C:\data\db
   
   # Запустите MongoDB (если не установлен как служба)
   "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath C:\data\db
   ```

4. **Создайте пользователя администратора:**
   ```bash
   # Подключитесь к MongoDB
   "C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe"
   
   # В MongoDB shell выполните:
   use admin
   db.createUser({
     user: "admin",
     pwd: "password123",
     roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
   })
   ```

5. **Перезапустите MongoDB с аутентификацией:**
   ```bash
   # Остановите MongoDB
   net stop MongoDB
   
   # Запустите с аутентификацией
   "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --auth --dbpath C:\data\db
   ```

## Вариант 2: MongoDB Atlas (облачная база данных)

1. Зарегистрируйтесь на https://www.mongodb.com/atlas
2. Создайте бесплатный кластер
3. Получите строку подключения
4. Обновите `.env` файл с новой строкой подключения

## Вариант 3: Использование Docker Desktop

1. **Установите Docker Desktop:**
   - Скачайте с https://www.docker.com/products/docker-desktop
   - Установите и запустите Docker Desktop
   - Убедитесь, что Docker запущен

2. **Запустите контейнеры:**
   ```bash
   docker-compose -f docker-compose.test.yml up -d
   ```

## Проверка подключения

После установки любого варианта, запустите тест:
```bash
node TEST/mongo.test.cjs
```

## Настройки .env файла

Убедитесь, что ваш `.env` файл содержит правильные настройки:
```env
MONGO_URI=mongodb://admin:password123@localhost:27017/dating_app?authSource=admin
MONGO_DB_NAME=dating_app
```

## Устранение проблем

### Ошибка подключения ECONNREFUSED
- Убедитесь, что MongoDB запущен
- Проверьте порт 27017
- Проверьте настройки брандмауэра

### Ошибка аутентификации
- Проверьте имя пользователя и пароль
- Убедитесь, что указан правильный authSource

### MongoDB не запускается как служба
- Запустите командную строку как администратор
- Выполните: `net start MongoDB`