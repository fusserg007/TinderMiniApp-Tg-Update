/**
 * Тест прямой загрузки фотографий
 * Проверяет работу API endpoint /api/edit-profile с файлами
 */

import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Функция для тестирования прямой загрузки фотографий
async function testDirectPhotoUpload() {
  try {
    console.log('🧪 Начинаем тест прямой загрузки фотографий...');
    
    // Создаем тестовое изображение (простой PNG)
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
    
    // Создаем FormData
    const formData = new FormData();
    formData.append('photo', testImageBuffer, {
      filename: 'test-photo.png',
      contentType: 'image/png'
    });
    formData.append('interests', 'woman');
    formData.append('age-range', '19-23');
    
    console.log('📤 Отправляем запрос на сервер...');
    
    // Отправляем запрос
    const response = await fetch('http://localhost:4000/api/edit-profile', {
      method: 'POST',
      body: formData,
      headers: {
        // Добавляем тестовый cookie для аутентификации
        'Cookie': 'session_id=test-session-id'
      }
    });
    
    console.log('📥 Получен ответ:', response.status, response.statusText);
    
    const result = await response.text();
    console.log('📄 Содержимое ответа:', result);
    
    if (response.ok) {
      console.log('✅ Тест прямой загрузки прошел успешно!');
    } else {
      console.log('❌ Тест прямой загрузки завершился с ошибкой');
    }
    
  } catch (error) {
    console.error('💥 Ошибка при тестировании:', error.message);
  }
}

// Функция для тестирования без файла
async function testWithoutFile() {
  try {
    console.log('\n🧪 Тестируем обновление профиля без файла...');
    
    const formData = new FormData();
    formData.append('interests', 'man');
    formData.append('age-range', '24-30');
    
    const response = await fetch('http://localhost:4000/api/edit-profile', {
      method: 'POST',
      body: formData,
      headers: {
        'Cookie': 'session_id=test-session-id'
      }
    });
    
    console.log('📥 Получен ответ:', response.status, response.statusText);
    const result = await response.text();
    console.log('📄 Содержимое ответа:', result);
    
  } catch (error) {
    console.error('💥 Ошибка при тестировании без файла:', error.message);
  }
}

// Запускаем тесты
async function runTests() {
  console.log('🚀 Запуск тестов прямой загрузки фотографий\n');
  
  await testDirectPhotoUpload();
  await testWithoutFile();
  
  console.log('\n🏁 Тестирование завершено');
}

runTests().catch(console.error);