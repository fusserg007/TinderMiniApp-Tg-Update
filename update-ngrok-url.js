/**
 * Скрипт для автоматического обновления WEBAPP_URL в .env файле
 * при получении нового URL от ngrok
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

// Получаем __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к .env файлу
const envPath = path.join(__dirname, '.env');

/**
 * Получает текущий URL от ngrok через API или использует переданный URL
 */
function getNgrokUrl(providedUrl = null) {
    if (providedUrl) {
        return Promise.resolve(providedUrl);
    }
    
    return new Promise((resolve, reject) => {
        // Пробуем PowerShell команду для Windows
        const command = process.platform === 'win32' 
            ? 'powershell -Command "Invoke-WebRequest -Uri http://localhost:4040/api/tunnels -UseBasicParsing | Select-Object -ExpandProperty Content"'
            : 'curl -s http://localhost:4040/api/tunnels';
            
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            
            try {
                const data = JSON.parse(stdout);
                const httpTunnel = data.tunnels.find(tunnel => 
                    tunnel.proto === 'https' && tunnel.config.addr === 'localhost:4000'
                );
                
                if (httpTunnel) {
                    resolve(httpTunnel.public_url);
                } else {
                    reject(new Error('HTTP туннель не найден'));
                }
            } catch (parseError) {
                reject(parseError);
            }
        });
    });
}

/**
 * Обновляет WEBAPP_URL в .env файле
 */
function updateEnvFile(newUrl) {
    try {
        // Читаем текущий .env файл
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Ищем и заменяем WEBAPP_URL и BACKEND_URL
        const webappUrlRegex = /^WEBAPP_URL=.*$/m;
        const backendUrlRegex = /^BACKEND_URL=.*$/m;
        const webappLine = `WEBAPP_URL=${newUrl}`;
        const backendLine = `BACKEND_URL=${newUrl}`;
        
        // Обновляем WEBAPP_URL
        if (webappUrlRegex.test(envContent)) {
            envContent = envContent.replace(webappUrlRegex, webappLine);
        } else {
            envContent += `\n${webappLine}\n`;
        }
        
        // Обновляем BACKEND_URL
        if (backendUrlRegex.test(envContent)) {
            envContent = envContent.replace(backendUrlRegex, backendLine);
        } else {
            envContent += `\n${backendLine}\n`;
        }
        
        // Записываем обновленный файл
        fs.writeFileSync(envPath, envContent);
        console.log(`✅ WEBAPP_URL и BACKEND_URL обновлены: ${newUrl}`);
        
        return true;
    } catch (error) {
        console.error('❌ Ошибка при обновлении .env файла:', error.message);
        return false;
    }
}

/**
 * Основная функция
 */
async function main() {
    try {
        // Проверяем, передан ли URL как аргумент командной строки
        const providedUrl = process.argv[2];
        
        if (providedUrl) {
            console.log(`📡 Используется переданный URL: ${providedUrl}`);
            const success = updateEnvFile(providedUrl);
            if (success) {
                console.log('\n📋 Теперь используйте этот URL в @BotFather:');
                console.log(`   1. Откройте @BotFather в Telegram`);
                console.log(`   2. Отправьте /mybots`);
                console.log(`   3. Выберите вашего бота`);
                console.log(`   4. Bot Settings -> Menu Button -> Configure menu button`);
                console.log(`   5. Вставьте URL: ${providedUrl}`);
            }
            return;
        }
        
        console.log('🔍 Получение URL от ngrok...');
        const ngrokUrl = await getNgrokUrl();
        
        console.log(`📡 Найден ngrok URL: ${ngrokUrl}`);
        
        const success = updateEnvFile(ngrokUrl);
        if (success) {
            console.log('\n📋 Теперь используйте этот URL в @BotFather:');
            console.log(`   1. Откройте @BotFather в Telegram`);
            console.log(`   2. Отправьте /mybots`);
            console.log(`   3. Выберите вашего бота`);
            console.log(`   4. Bot Settings -> Menu Button -> Configure menu button`);
            console.log(`   5. Вставьте URL: ${ngrokUrl}`);
        }
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.log('\n💡 Убедитесь, что:');
        console.log('   - ngrok запущен на порту 4000');
        console.log('   - ngrok web interface доступен на http://localhost:4040');
        console.log('\n💡 Или используйте скрипт с URL:');
        console.log('   node update-ngrok-url.js https://your-ngrok-url.ngrok-free.app');
        process.exit(1);
    }
}

// Запускаем скрипт
console.log('🚀 Запуск скрипта обновления ngrok URL...');
main().catch(error => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
});

export { getNgrokUrl, updateEnvFile };