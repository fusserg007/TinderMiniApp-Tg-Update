// Простой тест сжатия изображений
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

/**
 * Функция для тестирования сжатия изображений через API регистрации
 */
async function testImageCompression() {
    // Динамический импорт node-fetch для CommonJS
    const { default: fetch } = await import('node-fetch');
    console.log('🧪 Начинаем тест сжатия изображений...');
    
    // Проверяем наличие тестового изображения
    const testImagePath = path.join(__dirname, 'backend', 'uploads');
    
    if (!fs.existsSync(testImagePath)) {
        console.log('❌ Папка uploads не найдена');
        return;
    }
    
    const files = fs.readdirSync(testImagePath).filter(file => 
        file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
    );
    
    if (files.length === 0) {
        console.log('❌ Тестовые изображения не найдены в папке uploads');
        return;
    }
    
    // Используем созданное тестовое изображение
        const testFile = path.join(testImagePath, 'test-image-real.png');
        console.log(`📁 Используем файл: test-image-real.png`);
    
    // Получаем размер исходного файла
    const originalStats = fs.statSync(testFile);
    console.log(`📏 Исходный размер: ${(originalStats.size / 1024).toFixed(2)} KB`);
    
    try {
        // Формируем данные для отправки
        const formData = new FormData();
        formData.append('photo', fs.createReadStream(testFile));
        
        // Формируем initData как URL параметры
        const initDataParams = new URLSearchParams();
        initDataParams.append('user', JSON.stringify({
            id: 12345,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            language_code: 'ru'
        }));
        initDataParams.append('hash', 'test_hash'); // Используем тестовый hash для режима разработки
        initDataParams.append('auth_date', Math.floor(Date.now() / 1000).toString());
        
        formData.append('initData', initDataParams.toString());
        formData.append('gender', 'male');
        formData.append('interests', 'female');
        formData.append('age-range', '18-25');
        
        // Создаем фейковые данные Telegram
        const tgInitData = `user=%7B%22id%22%3A${Date.now()}%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22testuser%22%2C%22language_code%22%3A%22ru%22%7D&hash=test`;
        
        console.log('🔄 Отправляем запрос на регистрацию...');
        
        const response = await fetch('http://localhost:4000/api/registration', {
            method: 'POST',
            headers: {
                'X-Telegram-Init-Data': tgInitData,
                ...formData.getHeaders()
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Регистрация успешна!');
        console.log('📋 Полный ответ:', JSON.stringify(result, null, 2));
        
        if (result.ok && result.data) {
            console.log(`👤 ID пользователя: ${result.data.id}`);
            console.log(`🖼️ Путь к сжатому изображению: ${result.data.photo}`);
            
            // Проверяем сжатое изображение
            const compressedPath = path.join(__dirname, 'backend', result.data.photo.replace('/image/', 'uploads/'));
        
            if (fs.existsSync(compressedPath)) {
                const compressedStats = fs.statSync(compressedPath);
                const compressedSize = compressedStats.size;
                const savings = ((originalStats.size - compressedSize) / originalStats.size * 100).toFixed(1);
                
                console.log(`📏 Размер после сжатия: ${(compressedSize / 1024).toFixed(2)} KB`);
                console.log(`💾 Экономия места: ${savings}%`);
                
                if (compressedSize < originalStats.size) {
                    console.log('✅ Сжатие работает корректно!');
                } else {
                    console.log('⚠️ Размер файла не уменьшился');
                }
            } else {
                console.log('❌ Сжатое изображение не найдено по пути:', compressedPath);
            }
        } else {
            console.log('❌ Ошибка в ответе сервера:', result);
        }
        
    } catch (error) {
        console.error('❌ Ошибка тестирования:', error.message);
    }
}

// Запускаем тест
(async () => {
    await testImageCompression();
})().catch(console.error);