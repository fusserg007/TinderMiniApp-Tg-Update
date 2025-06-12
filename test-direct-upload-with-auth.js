/**
 * Тест прямой загрузки фотографий с аутентификацией
 * Создает тестового пользователя и тестирует загрузку файлов
 */

import FormData from 'form-data';
import fetch from 'node-fetch';

// Функция для создания тестового пользователя и получения сессии
async function createTestUser() {
  try {
    console.log('👤 Создаем тестового пользователя...');
    
    // Создаем тестовое изображение для регистрации
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
      0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00, // IEND chunk
      0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    // Создаем FormData для регистрации
    const formData = new FormData();
    formData.append('photo', testImageBuffer, {
      filename: 'test-photo.png',
      contentType: 'image/png'
    });
    formData.append('gender', 'man');
    formData.append('interests', 'woman');
    formData.append('age-range', '19-23');
    
    // Создаем тестовые данные Telegram в правильном формате
    const testUser = {
      id: Math.floor(Math.random() * 1000000),
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      language_code: 'en'
    };
    
    const testInitData = `user=${encodeURIComponent(JSON.stringify(testUser))}&hash=test_hash`;
    formData.append('initData', testInitData);
    
    console.log('📤 Отправляем запрос на регистрацию...');
    
    const response = await fetch('http://localhost:4000/api/registration', {
      method: 'POST',
      body: formData
    });
    
    console.log('📥 Ответ регистрации:', response.status, response.statusText);
    
    // Извлекаем cookie из ответа
    const setCookieHeader = response.headers.get('set-cookie');
    console.log('🍪 Set-Cookie header:', setCookieHeader);
    
    const result = await response.text();
    console.log('📄 Результат регистрации:', result);
    
    return setCookieHeader;
    
  } catch (error) {
    console.error('💥 Ошибка при создании пользователя:', error.message);
    return null;
  }
}

// Функция для тестирования прямой загрузки с валидной сессией
async function testDirectPhotoUploadWithAuth(sessionCookie) {
  try {
    console.log('\n🧪 Тестируем прямую загрузку с аутентификацией...');
    
    // Создаем новое тестовое изображение
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, // 2x2 pixel
      0x08, 0x02, 0x00, 0x00, 0x00, 0xFD, 0xD5, 0x9A,
      0x67, 0x00, 0x00, 0x00, 0x12, 0x49, 0x44, 0x41,
      0x54, 0x08, 0x99, 0x01, 0x07, 0x00, 0xF8, 0xFF,
      0xFF, 0x00, 0x00, 0xFF, 0x00, 0x00, 0xFF, 0x00,
      0x00, 0x02, 0x07, 0x01, 0x02, 0x9A, 0x1C, 0x7A,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
      0xAE, 0x42, 0x60, 0x82
    ]);
    
    const formData = new FormData();
    formData.append('photo', testImageBuffer, {
      filename: 'updated-photo.png',
      contentType: 'image/png'
    });
    formData.append('interests', 'man');
    formData.append('age-range', '24-30');
    
    console.log('📤 Отправляем запрос на обновление профиля...');
    
    const response = await fetch('http://localhost:4000/api/edit-profile', {
      method: 'POST',
      body: formData,
      headers: {
        'Cookie': sessionCookie || ''
      }
    });
    
    console.log('📥 Ответ обновления:', response.status, response.statusText);
    const result = await response.text();
    console.log('📄 Результат обновления:', result);
    
    if (response.ok) {
      console.log('✅ Прямая загрузка фотографий работает!');
      return true;
    } else {
      console.log('❌ Ошибка при прямой загрузке');
      return false;
    }
    
  } catch (error) {
    console.error('💥 Ошибка при тестировании загрузки:', error.message);
    return false;
  }
}

// Функция для тестирования обновления без файла
async function testUpdateWithoutFile(sessionCookie) {
  try {
    console.log('\n🧪 Тестируем обновление профиля без файла...');
    
    const formData = new FormData();
    formData.append('interests', 'woman');
    formData.append('age-range', '31-36');
    
    const response = await fetch('http://localhost:4000/api/edit-profile', {
      method: 'POST',
      body: formData,
      headers: {
        'Cookie': sessionCookie || ''
      }
    });
    
    console.log('📥 Ответ обновления без файла:', response.status, response.statusText);
    const result = await response.text();
    console.log('📄 Результат:', result);
    
    return response.ok;
    
  } catch (error) {
    console.error('💥 Ошибка при тестировании без файла:', error.message);
    return false;
  }
}

// Основная функция тестирования
async function runFullTest() {
  console.log('🚀 Запуск полного теста прямой загрузки фотографий\n');
  
  // Создаем тестового пользователя
  const sessionCookie = await createTestUser();
  
  if (!sessionCookie) {
    console.log('❌ Не удалось создать тестового пользователя');
    return;
  }
  
  // Тестируем загрузку с файлом
  const uploadSuccess = await testDirectPhotoUploadWithAuth(sessionCookie);
  
  // Тестируем обновление без файла
  const updateSuccess = await testUpdateWithoutFile(sessionCookie);
  
  console.log('\n📊 Результаты тестирования:');
  console.log(`📸 Загрузка фотографий: ${uploadSuccess ? '✅ Работает' : '❌ Не работает'}`);
  console.log(`📝 Обновление без файла: ${updateSuccess ? '✅ Работает' : '❌ Не работает'}`);
  
  if (uploadSuccess && updateSuccess) {
    console.log('\n🎉 Все тесты прошли успешно! Прямая загрузка фотографий реализована корректно.');
  } else {
    console.log('\n⚠️ Некоторые тесты завершились с ошибками. Требуется дополнительная отладка.');
  }
  
  console.log('\n🏁 Тестирование завершено');
}

runFullTest().catch(console.error);