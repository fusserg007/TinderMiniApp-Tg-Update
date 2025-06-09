// Скрипт инициализации MongoDB
// Создает базу данных и пользователя для приложения

print('🚀 Инициализация MongoDB для TinderMiniApp...');

// Переключение на базу данных приложения
db = db.getSiblingDB('dating_app');

// Создание пользователя для приложения
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'dating_app'
    }
  ]
});

print('✅ Пользователь app_user создан');

// Создание коллекций с индексами
print('📋 Создание коллекций...');

// Коллекция пользователей
db.createCollection('users');
db.users.createIndex({ 'telegramId': 1 }, { unique: true });
db.users.createIndex({ 'username': 1 });
db.users.createIndex({ 'isActive': 1 });
db.users.createIndex({ 'location': '2dsphere' }); // для геолокации
print('✅ Коллекция users создана с индексами');

// Коллекция сессий
db.createCollection('sessions');
db.sessions.createIndex({ 'sessionId': 1 }, { unique: true });
db.sessions.createIndex({ 'userId': 1 });
db.sessions.createIndex({ 'expiresAt': 1 }, { expireAfterSeconds: 0 }); // TTL индекс
print('✅ Коллекция sessions создана с индексами');

// Коллекция лайков/дизлайков
db.createCollection('matches');
db.matches.createIndex({ 'fromUserId': 1, 'toUserId': 1 }, { unique: true });
db.matches.createIndex({ 'fromUserId': 1 });
db.matches.createIndex({ 'toUserId': 1 });
db.matches.createIndex({ 'isMatch': 1 });
db.matches.createIndex({ 'createdAt': 1 });
print('✅ Коллекция matches создана с индексами');

// Коллекция сообщений
db.createCollection('messages');
db.messages.createIndex({ 'matchId': 1 });
db.messages.createIndex({ 'senderId': 1 });
db.messages.createIndex({ 'createdAt': 1 });
print('✅ Коллекция messages создана с индексами');

// Коллекция платежей
db.createCollection('payments');
db.payments.createIndex({ 'userId': 1 });
db.payments.createIndex({ 'status': 1 });
db.payments.createIndex({ 'createdAt': 1 });
print('✅ Коллекция payments создана с индексами');

// Вставка тестовых данных для разработки
print('📝 Добавление тестовых данных...');

// Тестовый пользователь
db.users.insertOne({
  _id: ObjectId(),
  telegramId: 123456789,
  username: 'test_user',
  firstName: 'Тест',
  lastName: 'Пользователь',
  age: 25,
  bio: 'Тестовый пользователь для разработки',
  photos: [],
  isActive: true,
  isPremium: false,
  location: {
    type: 'Point',
    coordinates: [37.6176, 55.7558] // Москва
  },
  preferences: {
    minAge: 18,
    maxAge: 35,
    maxDistance: 50
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print('✅ Тестовые данные добавлены');
print('🎉 Инициализация MongoDB завершена успешно!');