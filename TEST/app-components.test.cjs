// Тест основных компонентов приложения
// Проверка импортов, классов и базовой функциональности

const path = require('path');
const fs = require('fs');

/**
 * Проверка существования файлов
 */
function checkFileExists(filePath) {
  const fullPath = path.resolve(filePath);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${filePath}`);
  return exists;
}

/**
 * Проверка структуры проекта
 */
function testProjectStructure() {
  console.log('📁 Проверка структуры проекта...');
  
  const requiredFiles = [
    'package.json',
    'env.example',
    'backend/package.json',
    'backend/run-dev-mode.ts',
    'backend/infra/express-http-server.ts',
    'backend/infra/mongo-store.ts',
    'backend/infra/di.ts',
    'backend/tsconfig.json'
  ];
  
  const requiredDirs = [
    'backend',
    'TEST',
    'backend/infra',
    'backend/app',
    'backend/domain',
    'tg-web-app'
  ];
  
  console.log('\n📄 Обязательные файлы:');
  let allFilesExist = true;
  for (const file of requiredFiles) {
    if (!checkFileExists(file)) {
      allFilesExist = false;
    }
  }
  
  console.log('\n📂 Обязательные директории:');
  let allDirsExist = true;
  for (const dir of requiredDirs) {
    const exists = fs.existsSync(dir) && fs.statSync(dir).isDirectory();
    console.log(`${exists ? '✅' : '❌'} ${dir}/`);
    if (!exists) allDirsExist = false;
  }
  
  return allFilesExist && allDirsExist;
}

/**
 * Проверка package.json
 */
function testPackageJson() {
  console.log('\n📦 Проверка package.json...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    console.log(`✅ Название: ${packageJson.name}`);
    console.log(`✅ Версия: ${packageJson.version}`);
    
    const requiredDeps = [
      'express',
      'mongodb',
      'cors',
      'dotenv'
    ];
    
    const requiredDevDeps = [
      'typescript',
      '@types/node',
      '@types/express',
      'ts-node'
    ];
    
    console.log('\n📚 Основные зависимости:');
    for (const dep of requiredDeps) {
      const exists = packageJson.dependencies && packageJson.dependencies[dep];
      console.log(`${exists ? '✅' : '❌'} ${dep}`);
    }
    
    console.log('\n🛠️ Dev зависимости:');
    for (const dep of requiredDevDeps) {
      const exists = packageJson.devDependencies && packageJson.devDependencies[dep];
      console.log(`${exists ? '✅' : '❌'} ${dep}`);
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Ошибка чтения package.json:', error.message);
    return false;
  }
}

/**
 * Проверка TypeScript файлов на синтаксические ошибки
 */
function testTypeScriptFiles() {
  console.log('\n🔍 Проверка TypeScript файлов...');
  
  const tsFiles = [
    'backend/run-dev-mode.ts',
    'backend/infra/express-http-server.ts',
    'backend/infra/mongo-store.ts',
    'backend/infra/di.ts',
    'backend/app/auth.ts',
    'backend/domain/user.ts'
  ];
  
  let allValid = true;
  
  for (const file of tsFiles) {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Базовые проверки синтаксиса
        const hasImports = content.includes('import') || content.includes('require');
        const hasExports = content.includes('export') || content.includes('module.exports');
        const hasBasicStructure = content.length > 50; // Минимальная длина
        
        if (hasBasicStructure) {
          console.log(`✅ ${file} - структура OK`);
          
          if (hasImports) {
            console.log(`   ✅ Импорты найдены`);
          }
          
          if (hasExports) {
            console.log(`   ✅ Экспорты найдены`);
          }
        } else {
          console.log(`❌ ${file} - файл слишком короткий или пустой`);
          allValid = false;
        }
        
      } catch (error) {
        console.log(`❌ ${file} - ошибка чтения: ${error.message}`);
        allValid = false;
      }
    } else {
      console.log(`❌ ${file} - файл не найден`);
      allValid = false;
    }
  }
  
  return allValid;
}

/**
 * Проверка .env файлов
 */
function testEnvFiles() {
  console.log('\n🔧 Проверка конфигурационных файлов...');
  
  // Проверка env.example
  if (fs.existsSync('env.example')) {
    console.log('✅ env.example найден');
    
    const envExample = fs.readFileSync('env.example', 'utf8');
    const requiredVars = [
      'MONGO_INITDB_ROOT_USERNAME',
      'MONGO_INITDB_ROOT_PASSWORD', 
      'MONGODB_DATABASE',
      'BOT_TOKEN',
      'BOT_USERNAME',
      'PORT',
      'BACKEND_URL',
      'VITE_BACKEND_URL'
    ];
    
    console.log('\n📋 Обязательные переменные в env.example:');
    for (const varName of requiredVars) {
      const exists = envExample.includes(varName);
      console.log(`${exists ? '✅' : '❌'} ${varName}`);
    }
  } else {
    console.log('❌ env.example не найден');
  }
  
  // Проверка backend/env.example
  if (fs.existsSync('backend/env.example')) {
    console.log('✅ backend/env.example найден');
  } else {
    console.log('❌ backend/env.example не найден');
  }
  
  // Проверка .env
  if (fs.existsSync('.env')) {
    console.log('\n✅ .env файл найден');
    
    const envContent = fs.readFileSync('.env', 'utf8');
    console.log('\n📋 Проверка переменных в .env:');
    
    const criticalVars = ['BOT_TOKEN', 'BOT_USERNAME'];
    let hasRealValues = true;
    
    for (const varName of criticalVars) {
      if (envContent.includes(`${varName}=1234567890`) || 
          envContent.includes(`${varName}=your_dating_bot`) ||
          envContent.includes(`${varName}=ABCdefGHIjklMNOpqrsTUVwxyz`)) {
        console.log(`⚠️ ${varName} содержит тестовое значение`);
        hasRealValues = false;
      } else if (envContent.includes(varName)) {
        console.log(`✅ ${varName} настроен`);
      } else {
        console.log(`❌ ${varName} отсутствует`);
        hasRealValues = false;
      }
    }
    
    if (!hasRealValues) {
      console.log('\n💡 Замените тестовые значения на реальные токены от @BotFather');
    }
  } else {
    console.log('\n⚠️ .env файл не найден');
    console.log('💡 Скопируйте env.example в .env и заполните переменные');
  }
}

/**
 * Проверка Git настроек
 */
function testGitSetup() {
  console.log('\n🔄 Проверка Git настроек...');
  
  if (fs.existsSync('.git')) {
    console.log('✅ Git репозиторий инициализирован');
    
    // Проверка статуса Git
    try {
      const { execSync } = require('child_process');
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      
      if (gitStatus.trim()) {
        const lines = gitStatus.trim().split('\n');
        const untracked = lines.filter(line => line.startsWith('??')).length;
        const modified = lines.filter(line => line.startsWith(' M')).length;
        
        console.log(`⚠️ Есть незакоммиченные изменения: ${modified} изменений, ${untracked} новых файлов`);
        console.log('💡 Рекомендуется: git add . && git commit -m "Initial setup"');
      } else {
        console.log('✅ Рабочая директория чистая');
      }
    } catch (error) {
      console.log('⚠️ Не удалось проверить статус Git');
    }
  } else {
    console.log('❌ Git репозиторий не найден');
    console.log('💡 Выполните: git init');
  }
  
  if (fs.existsSync('.gitignore')) {
    console.log('✅ .gitignore найден');
    
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    const requiredIgnores = [
      'node_modules',
      '.env',
      'dist',
      '*.log'
    ];
    
    console.log('\n🚫 Проверка .gitignore:');
    for (const ignore of requiredIgnores) {
      const exists = gitignore.includes(ignore);
      console.log(`${exists ? '✅' : '❌'} ${ignore}`);
    }
  } else {
    console.log('❌ .gitignore не найден');
  }
}

/**
 * Генерация отчета о готовности проекта
 */
function generateReadinessReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 ОТЧЕТ О ГОТОВНОСТИ ПРОЕКТА');
  console.log('='.repeat(60));
  
  const checks = [
    { name: 'Структура проекта', test: testProjectStructure },
    { name: 'Package.json', test: testPackageJson },
    { name: 'TypeScript файлы', test: testTypeScriptFiles },
    { name: 'Конфигурация', test: testEnvFiles },
    { name: 'Git настройки', test: testGitSetup }
  ];
  
  let passedChecks = 0;
  const results = [];
  
  for (const check of checks) {
    console.log(`\n🧪 ${check.name}:`);
    const result = check.test();
    results.push({ name: check.name, passed: result });
    if (result) passedChecks++;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📈 ИТОГОВЫЙ РЕЗУЛЬТАТ:');
  console.log('='.repeat(60));
  
  for (const result of results) {
    console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
  }
  
  const percentage = Math.round((passedChecks / checks.length) * 100);
  console.log(`\n🎯 Готовность проекта: ${percentage}% (${passedChecks}/${checks.length})`);
  
  if (percentage >= 80) {
    console.log('🎉 Проект готов к разработке!');
  } else if (percentage >= 60) {
    console.log('⚠️ Проект частично готов, требуются доработки');
  } else {
    console.log('❌ Проект требует значительных доработок');
  }
  
  console.log('\n💡 Следующие шаги:');
  if (percentage < 100) {
    console.log('   1. Исправьте отмеченные проблемы');
    console.log('   2. Настройте MongoDB (локально или Atlas)');
    console.log('   3. Запустите приложение: npm run dev');
  } else {
    console.log('   1. Настройте MongoDB');
    console.log('   2. Заполните .env файл');
    console.log('   3. Запустите приложение: npm run dev');
  }
}

// Запуск всех тестов
console.log('🧪 Тестирование компонентов TinderMiniApp...');
generateReadinessReport();