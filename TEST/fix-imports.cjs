/**
 * Скрипт для исправления импортов .js в TypeScript файлах
 * Запуск: node TEST/fix-imports.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Директория бэкенда
const backendDir = path.join(__dirname, '..', 'backend');

// Регулярное выражение для поиска импортов с .js
const importRegex = /(import\s+(?:(?:\{[^}]*\})|(?:[^{}]*))\s+from\s+['"]([^'"]*)\.js['"];)/g;

// Функция для рекурсивного обхода директорий
async function processDirectory(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.name.endsWith('.ts')) {
      await processFile(fullPath);
    }
  }
}

// Функция для обработки файла
async function processFile(filePath) {
  try {
    const content = await readFileAsync(filePath, 'utf8');
    
    // Проверяем, есть ли импорты с .js
    if (importRegex.test(content)) {
      // Сбрасываем lastIndex регулярного выражения
      importRegex.lastIndex = 0;
      
      // Заменяем импорты с .js на импорты без .js
      const newContent = content.replace(importRegex, (match, importStatement, importPath) => {
        return importStatement.replace(`${importPath}.js`, importPath);
      });
      
      // Записываем изменения в файл
      await writeFileAsync(filePath, newContent, 'utf8');
      
      console.log(`Исправлены импорты в файле: ${filePath}`);
    }
  } catch (error) {
    console.error(`Ошибка при обработке файла ${filePath}:`, error);
  }
}

// Запускаем обработку директории
processDirectory(backendDir)
  .then(() => {
    console.log('Исправление импортов завершено!');
  })
  .catch((error) => {
    console.error('Произошла ошибка:', error);
  });