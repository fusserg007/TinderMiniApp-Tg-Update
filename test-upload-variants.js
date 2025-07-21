// Тестирование различных вариантов загрузки фотографий
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Конфигурация
const BOT_TOKEN = '7366223026:AAGvtUl6a1SX6GPlNIWopluow1nZ_iYsKfU';
const BACKEND_URL = 'http://localhost:4000';

// Вариант 1: Telegram Bot API для хранения фото
async function testTelegramUpload() {
    console.log('\n🧪 Тест 1: Загрузка через Telegram Bot API');
    
    try {
        // Создаем тестовое изображение (base64)
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        const imageBuffer = Buffer.from(testImageBase64, 'base64');
        
        const formData = new FormData();
        formData.append('photo', imageBuffer, {
            filename: 'test.png',
            contentType: 'image/png'
        });
        formData.append('chat_id', '123456789'); // Тестовый chat_id
        
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.ok) {
            console.log('✅ Telegram API работает');
            console.log('📷 File ID:', result.result.photo[result.result.photo.length - 1].file_id);
            return { success: true, fileId: result.result.photo[result.result.photo.length - 1].file_id };
        } else {
            console.log('❌ Ошибка Telegram API:', result.description);
            return { success: false, error: result.description };
        }
    } catch (error) {
        console.log('❌ Ошибка подключения к Telegram API:', error.message);
        return { success: false, error: error.message };
    }
}

// Вариант 2: Локальное хранение файлов
async function testLocalStorage() {
    console.log('\n🧪 Тест 2: Локальное хранение файлов');
    
    try {
        const uploadsDir = path.join(__dirname, 'uploads');
        
        // Создаем папку uploads если её нет
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Тестируем запись файла
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        const imageBuffer = Buffer.from(testImageBase64, 'base64');
        const filename = `test-${Date.now()}.png`;
        const filepath = path.join(uploadsDir, filename);
        
        fs.writeFileSync(filepath, imageBuffer);
        
        // Проверяем что файл создался
        if (fs.existsSync(filepath)) {
            console.log('✅ Локальное хранение работает');
            console.log('📁 Файл сохранен:', filepath);
            
            // Удаляем тестовый файл
            fs.unlinkSync(filepath);
            
            return { success: true, path: `/uploads/${filename}` };
        } else {
            console.log('❌ Файл не создался');
            return { success: false, error: 'Файл не создался' };
        }
    } catch (error) {
        console.log('❌ Ошибка локального хранения:', error.message);
        return { success: false, error: error.message };
    }
}

// Вариант 3: Проверка текущего MinIO
async function testMinIOConnection() {
    console.log('\n🧪 Тест 3: Подключение к MinIO');
    
    try {
        // Проверяем доступность MinIO
        const response = await fetch('http://localhost:9000/minio/health/live', {
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            console.log('✅ MinIO доступен');
            return { success: true };
        } else {
            console.log('❌ MinIO недоступен, статус:', response.status);
            return { success: false, error: `HTTP ${response.status}` };
        }
    } catch (error) {
        console.log('❌ MinIO недоступен:', error.message);
        return { success: false, error: error.message };
    }
}

// Тест текущего backend API
async function testCurrentBackend() {
    console.log('\n🧪 Тест 4: Текущий backend API');
    
    try {
        const response = await fetch(`${BACKEND_URL}/health`, {
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            console.log('✅ Backend доступен');
            return { success: true };
        } else {
            console.log('❌ Backend недоступен, статус:', response.status);
            return { success: false, error: `HTTP ${response.status}` };
        }
    } catch (error) {
        console.log('❌ Backend недоступен:', error.message);
        return { success: false, error: error.message };
    }
}

// Анализ и рекомендации
function analyzeResults(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 АНАЛИЗ РЕЗУЛЬТАТОВ И РЕКОМЕНДАЦИИ');
    console.log('='.repeat(60));
    
    const [telegram, localStorage, minIO, backend] = results;
    
    console.log('\n📋 Результаты тестов:');
    console.log(`🤖 Telegram API: ${telegram.success ? '✅ Работает' : '❌ Не работает'}`);
    console.log(`💾 Локальное хранение: ${localStorage.success ? '✅ Работает' : '❌ Не работает'}`);
    console.log(`☁️ MinIO: ${minIO.success ? '✅ Работает' : '❌ Не работает'}`);
    console.log(`🔧 Backend: ${backend.success ? '✅ Работает' : '❌ Не работает'}`);
    
    console.log('\n🎯 РЕКОМЕНДАЦИИ:');
    
    if (!minIO.success && backend.success) {
        console.log('\n🥇 РЕКОМЕНДАЦИЯ #1: Локальное хранение файлов');
        console.log('   ✅ Преимущества:');
        console.log('   - Простота реализации');
        console.log('   - Не требует дополнительных сервисов');
        console.log('   - Быстрая загрузка и отдача файлов');
        console.log('   - Полный контроль над файлами');
        console.log('   ⚠️ Недостатки:');
        console.log('   - Файлы хранятся на сервере (занимают место)');
        console.log('   - При масштабировании нужно синхронизировать файлы');
        console.log('   💡 Идеально для: MVP, небольших проектов, разработки');
    }
    
    if (telegram.success) {
        console.log('\n🥈 РЕКОМЕНДАЦИЯ #2: Telegram Bot API');
        console.log('   ✅ Преимущества:');
        console.log('   - Бесплатное хранение в Telegram');
        console.log('   - Автоматическое сжатие изображений');
        console.log('   - Высокая надежность и доступность');
        console.log('   - CDN Telegram для быстрой загрузки');
        console.log('   ⚠️ Недостатки:');
        console.log('   - Ограничения API Telegram (20 запросов/минуту)');
        console.log('   - Зависимость от внешнего сервиса');
        console.log('   - Сжатие может ухудшить качество');
        console.log('   💡 Идеально для: продакшн с небольшой нагрузкой');
    }
    
    if (minIO.success) {
        console.log('\n🥉 РЕКОМЕНДАЦИЯ #3: MinIO/S3 (текущая реализация)');
        console.log('   ✅ Преимущества:');
        console.log('   - Масштабируемость');
        console.log('   - Совместимость с S3');
        console.log('   - Профессиональное решение');
        console.log('   ⚠️ Недостатки:');
        console.log('   - Сложность настройки');
        console.log('   - Требует дополнительные ресурсы');
        console.log('   - Может быть избыточно для небольших проектов');
        console.log('   💡 Идеально для: крупные проекты, продакшн');
    } else {
        console.log('\n❌ MinIO недоступен - основная причина зависания!');
        console.log('   🔧 Для исправления:');
        console.log('   1. Запустите Docker Desktop');
        console.log('   2. Выполните: docker-compose -f docker-compose.dev.yml up -d object-storage');
        console.log('   3. Или переключитесь на альтернативный вариант');
    }
    
    console.log('\n🚀 ПЛАН ДЕЙСТВИЙ:');
    if (!minIO.success) {
        console.log('1. 🔄 Быстрое решение: Переключиться на локальное хранение');
        console.log('2. 🤖 Средний срок: Реализовать Telegram Bot API');
        console.log('3. ☁️ Долгосрочно: Настроить MinIO или облачное S3');
    } else {
        console.log('1. ✅ MinIO работает - проблема может быть в другом месте');
        console.log('2. 🔍 Проверьте логи backend при загрузке файла');
        console.log('3. 🧪 Протестируйте загрузку через API напрямую');
    }
}

// Запуск всех тестов
async function runAllTests() {
    console.log('🧪 ТЕСТИРОВАНИЕ ВАРИАНТОВ ЗАГРУЗКИ ФОТОГРАФИЙ');
    console.log('='.repeat(60));
    
    const results = await Promise.all([
        testTelegramUpload(),
        testLocalStorage(),
        testMinIOConnection(),
        testCurrentBackend()
    ]);
    
    analyzeResults(results);
}

// Запуск
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().catch(console.error);
}

export {
    testTelegramUpload,
    testLocalStorage,
    testMinIOConnection,
    testCurrentBackend
};