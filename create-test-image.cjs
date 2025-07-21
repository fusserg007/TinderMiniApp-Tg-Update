const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Создание тестового изображения для проверки сжатия
 */
async function createTestImage() {
    console.log('🎨 Создаем тестовое изображение...');
    
    try {
        // Создаем простое тестовое изображение 1000x1000 пикселей
        const testImageBuffer = await sharp({
            create: {
                width: 1000,
                height: 1000,
                channels: 3,
                background: { r: 255, g: 100, b: 50 } // Оранжевый фон
            }
        })
        .png()
        .toBuffer();
        
        const testImagePath = path.join(__dirname, 'backend', 'uploads', 'test-image.png');
        
        // Сохраняем тестовое изображение
        fs.writeFileSync(testImagePath, testImageBuffer);
        
        const stats = fs.statSync(testImagePath);
        console.log(`✅ Тестовое изображение создано: ${testImagePath}`);
        console.log(`📏 Размер: ${(stats.size / 1024).toFixed(2)} KB`);
        
    } catch (error) {
        console.error('❌ Ошибка создания тестового изображения:', error.message);
    }
}

// Запускаем создание
createTestImage().catch(console.error);