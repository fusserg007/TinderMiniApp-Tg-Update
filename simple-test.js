// Простой тест доступности сервисов
import fs from 'fs';

// Функция для проверки доступности URL
async function checkService(name, url) {
    try {
        const response = await fetch(url);
        console.log(`✅ ${name}: доступен (статус: ${response.status})`);
        return true;
    } catch (error) {
        console.log(`❌ ${name}: недоступен (${error.message})`);
        return false;
    }
}

// Функция для проверки файла .env
function checkEnvFile() {
    try {
        const envContent = fs.readFileSync('.env', 'utf8');
        console.log('\n📋 Конфигурация из .env:');
        
        const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        lines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                // Скрываем пароли и токены
                const maskedValue = key.includes('PASSWORD') || key.includes('TOKEN') || key.includes('SECRET') 
                    ? '*'.repeat(value.length) 
                    : value;
                console.log(`   ${key}: ${maskedValue}`);
            }
        });
        return true;
    } catch (error) {
        console.log('❌ Файл .env не найден или недоступен');
        return false;
    }
}

// Основная функция тестирования
async function runTests() {
    console.log('🔍 Тестирование доступности сервисов\n');
    
    // Проверка .env файла
    checkEnvFile();
    
    console.log('\n🌐 Проверка доступности сервисов:');
    
    // Проверка основных сервисов
    const services = [
        { name: 'Backend API', url: 'http://localhost:3001/api/health' },
        { name: 'Frontend', url: 'http://localhost:3000' },
        { name: 'MinIO', url: 'http://localhost:9000' },
        { name: 'MongoDB', url: 'http://localhost:27017' }
    ];
    
    const results = [];
    for (const service of services) {
        const isAvailable = await checkService(service.name, service.url);
        results.push({ ...service, available: isAvailable });
    }
    
    console.log('\n📊 Результаты тестирования:');
    const available = results.filter(r => r.available).length;
    const total = results.length;
    console.log(`Доступно: ${available}/${total} сервисов`);
    
    console.log('\n💡 Рекомендации по вариантам загрузки фотографий:');
    
    // Анализ результатов и рекомендации
    const backendAvailable = results.find(r => r.name === 'Backend API')?.available;
    const minioAvailable = results.find(r => r.name === 'MinIO')?.available;
    const mongoAvailable = results.find(r => r.name === 'MongoDB')?.available;
    
    if (backendAvailable && minioAvailable && mongoAvailable) {
        console.log('🟢 ВАРИАНТ 1 (Текущая реализация): РЕКОМЕНДУЕТСЯ');
        console.log('   - Все сервисы доступны');
        console.log('   - Можно улучшить обработку ошибок и добавить прогресс-бар');
    } else {
        console.log('🔴 ВАРИАНТ 1 (Текущая реализация): НЕ РЕКОМЕНДУЕТСЯ');
        console.log('   - Проблемы с инфраструктурой');
    }
    
    console.log('\n🟡 ВАРИАНТ 2 (Telegram Bot API): АЛЬТЕРНАТИВА');
    console.log('   - Не зависит от локальной инфраструктуры');
    console.log('   - Требует настройки бота и webhook\'ов');
    console.log('   - Ограничения по размеру файлов (20MB)');
    
    console.log('\n🟠 ВАРИАНТ 3 (Прямая загрузка): ПРОСТОЕ РЕШЕНИЕ');
    console.log('   - Быстрая реализация');
    console.log('   - Ограниченная функциональность');
    console.log('   - Подходит для MVP');
    
    console.log('\n🎯 ИТОГОВАЯ РЕКОМЕНДАЦИЯ:');
    if (available >= 3) {
        console.log('   Используйте ВАРИАНТ 1 с улучшениями');
    } else if (available >= 1) {
        console.log('   Рассмотрите ВАРИАНТ 2 (Telegram Bot API)');
    } else {
        console.log('   Начните с ВАРИАНТА 3 (Прямая загрузка)');
    }
}

// Запуск тестов
runTests().catch(console.error);