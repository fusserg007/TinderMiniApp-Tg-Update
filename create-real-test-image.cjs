// Создание реального тестового изображения в формате PNG
const fs = require('fs');
const path = require('path');

/**
 * Создает простое тестовое изображение в формате PNG
 */
function createTestImage() {
    console.log('🖼️ Создаем тестовое изображение...');
    
    // Создаем простой PNG файл вручную
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    
    // IHDR chunk для изображения 100x100 пикселей, RGB, 8 бит
    const width = 100;
    const height = 100;
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);     // ширина
    ihdrData.writeUInt32BE(height, 4);    // высота
    ihdrData.writeUInt8(8, 8);            // глубина цвета
    ihdrData.writeUInt8(2, 9);            // тип цвета (RGB)
    ihdrData.writeUInt8(0, 10);           // метод сжатия
    ihdrData.writeUInt8(0, 11);           // метод фильтрации
    ihdrData.writeUInt8(0, 12);           // чересстрочность
    
    // Создаем IHDR chunk
    const ihdrChunk = createChunk('IHDR', ihdrData);
    
    // Создаем простые данные изображения (красный квадрат)
    const bytesPerPixel = 3; // RGB
    const rowSize = width * bytesPerPixel + 1; // +1 для filter byte
    const imageDataSize = height * rowSize;
    const imageData = Buffer.alloc(imageDataSize);
    
    for (let y = 0; y < height; y++) {
        const rowStart = y * rowSize;
        imageData[rowStart] = 0; // filter type (None)
        
        for (let x = 0; x < width; x++) {
            const pixelStart = rowStart + 1 + x * bytesPerPixel;
            imageData[pixelStart] = 255;     // R - красный
            imageData[pixelStart + 1] = 100; // G - зеленый
            imageData[pixelStart + 2] = 100; // B - синий
        }
    }
    
    // Сжимаем данные с помощью zlib (простое сжатие)
    const zlib = require('zlib');
    const compressedData = zlib.deflateSync(imageData);
    
    // Создаем IDAT chunk
    const idatChunk = createChunk('IDAT', compressedData);
    
    // Создаем IEND chunk
    const iendChunk = createChunk('IEND', Buffer.alloc(0));
    
    // Объединяем все части
    const pngBuffer = Buffer.concat([
        pngSignature,
        ihdrChunk,
        idatChunk,
        iendChunk
    ]);
    
    return pngBuffer;
}

/**
 * Создает PNG chunk с указанным типом и данными
 */
function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    
    const typeBuffer = Buffer.from(type, 'ascii');
    const chunkData = Buffer.concat([typeBuffer, data]);
    
    // Вычисляем CRC32
    const crc = require('zlib').crc32(chunkData);
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc, 0);
    
    return Buffer.concat([length, chunkData, crcBuffer]);
}

// Создаем тестовое изображение
try {
    const imageBuffer = createTestImage();
    const outputPath = path.join(__dirname, 'backend', 'uploads', 'test-image-real.png');
    
    // Убеждаемся, что папка существует
    const uploadsDir = path.dirname(outputPath);
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, imageBuffer);
    
    console.log('✅ Тестовое изображение создано:', outputPath);
    console.log(`📏 Размер файла: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
    
} catch (error) {
    console.error('❌ Ошибка создания изображения:', error);
}