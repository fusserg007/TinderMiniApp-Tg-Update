/**
 * Тестовый скрипт для проверки сжатия изображений
 * Этот файл демонстрирует, как работает сжатие изображений с помощью sharp
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Функция для тестирования сжатия изображения
 * @param {string} inputPath - путь к исходному изображению
 * @param {string} outputPath - путь для сохранения сжатого изображения
 */
async function testImageCompression(inputPath, outputPath) {
  try {
    console.log('🖼️ Начинаем тестирование сжатия изображения...');
    
    // Проверяем, существует ли исходный файл
    if (!fs.existsSync(inputPath)) {
      console.log('❌ Исходный файл не найден:', inputPath);
      return;
    }

    // Получаем информацию об исходном файле
    const originalStats = fs.statSync(inputPath);
    console.log('📊 Размер исходного файла:', (originalStats.size / 1024).toFixed(2), 'KB');

    // Читаем исходное изображение
    const originalBuffer = fs.readFileSync(inputPath);
    
    // Получаем метаданные изображения
    const metadata = await sharp(originalBuffer).metadata();
    console.log('📐 Исходные размеры:', `${metadata.width}x${metadata.height}`);
    console.log('🎨 Формат:', metadata.format);

    // Сжимаем изображение (такие же настройки, как в auth.ts)
    const compressedBuffer = await sharp(originalBuffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer();

    // Сохраняем сжатое изображение
    fs.writeFileSync(outputPath, compressedBuffer);
    
    // Получаем информацию о сжатом файле
    const compressedStats = fs.statSync(outputPath);
    const compressedMetadata = await sharp(compressedBuffer).metadata();
    
    console.log('✅ Сжатие завершено!');
    console.log('📊 Размер сжатого файла:', (compressedStats.size / 1024).toFixed(2), 'KB');
    console.log('📐 Новые размеры:', `${compressedMetadata.width}x${compressedMetadata.height}`);
    console.log('💾 Экономия места:', ((originalStats.size - compressedStats.size) / originalStats.size * 100).toFixed(1), '%');
    console.log('📁 Сжатый файл сохранен:', outputPath);
    
  } catch (error) {
    console.error('❌ Ошибка при сжатии:', error.message);
  }
}

// Пример использования
const inputFile = './test-image.jpg'; // Поместите тестовое изображение в папку backend
const outputFile = './test-image-compressed.jpg';

console.log('🧪 Запуск теста сжатия изображений...');
console.log('📝 Для тестирования поместите файл test-image.jpg в папку backend');
console.log('🚀 Затем запустите: node test-compression.js');

// Запускаем тест только если файл существует
if (fs.existsSync(inputFile)) {
  testImageCompression(inputFile, outputFile);
} else {
  console.log('ℹ️ Для тестирования создайте файл test-image.jpg в папке backend');
  console.log('📋 Этот скрипт покажет эффективность сжатия изображений');
}