const fs = require('fs');
const path = require('path');

/**
 * Создание простого тестового PNG изображения
 */
function createSimpleTestImage() {
    console.log('🎨 Создаем простое тестовое изображение...');
    
    try {
        // Создаем минимальный PNG файл (1x1 пиксель, красный)
        // PNG signature + IHDR + IDAT + IEND chunks
        const pngData = Buffer.from([
            // PNG signature
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            // IHDR chunk
            0x00, 0x00, 0x00, 0x0D, // Length: 13
            0x49, 0x48, 0x44, 0x52, // Type: IHDR
            0x00, 0x00, 0x00, 0x64, // Width: 100
            0x00, 0x00, 0x00, 0x64, // Height: 100
            0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth: 8, Color type: 2 (RGB), Compression: 0, Filter: 0, Interlace: 0
            0x4C, 0x5C, 0x6D, 0x7A, // CRC
            // IDAT chunk (compressed image data)
            0x00, 0x00, 0x00, 0x16, // Length: 22
            0x49, 0x44, 0x41, 0x54, // Type: IDAT
            0x78, 0x9C, 0x62, 0xF8, 0x0F, 0x00, 0x01, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x1C, 0x00, 0x02, 0x00, 0x05, 0x00, 0x01,
            0x0D, 0x0A, 0x2D, 0xB4, // CRC
            // IEND chunk
            0x00, 0x00, 0x00, 0x00, // Length: 0
            0x49, 0x45, 0x4E, 0x44, // Type: IEND
            0xAE, 0x42, 0x60, 0x82  // CRC
        ]);
        
        const testImagePath = path.join(__dirname, 'backend', 'uploads', 'test-image-simple.png');
        
        // Сохраняем тестовое изображение
        fs.writeFileSync(testImagePath, pngData);
        
        const stats = fs.statSync(testImagePath);
        console.log(`✅ Простое тестовое изображение создано: ${testImagePath}`);
        console.log(`📏 Размер: ${(stats.size / 1024).toFixed(2)} KB`);
        
        return testImagePath;
        
    } catch (error) {
        console.error('❌ Ошибка создания тестового изображения:', error.message);
        return null;
    }
}

// Запускаем создание
const imagePath = createSimpleTestImage();
if (imagePath) {
    console.log('🎯 Готово! Можно использовать для тестирования сжатия.');
}