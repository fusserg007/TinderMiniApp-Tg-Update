@echo off
chcp 65001 >nul
echo ===============================================
echo    Обновление URL Ngrok для Telegram бота
echo ===============================================
echo.

if "%1"=="" (
    echo Использование: update_ngrok.bat [ngrok_url]
    echo.
    echo Пример: update_ngrok.bat https://abc123.ngrok-free.app
    echo.
    set /p ngrok_url="Введите URL Ngrok: "
) else (
    set ngrok_url=%1
)

if "%ngrok_url%"=="" (
    echo Ошибка: URL не может быть пустым
    pause
    exit /b 1
)

echo.
echo Обновляю .env файл с URL: %ngrok_url%
echo.

python "%~dp0update_ngrok_manual.py" "%ngrok_url%"

if %errorlevel% equ 0 (
    echo.
    echo ✅ URL успешно обновлен!
    echo.
    echo Хотите перезапустить backend? (y/n)
    set /p restart="Ваш выбор: "
    
    if /i "%restart%"=="y" (
        echo.
        echo Перезапускаю backend...
        cd ..
        cd backend
        start "Backend Server" cmd /k "npm run dev"
        cd ..
        echo Backend запущен в новом окне терминала
    )
) else (
    echo.
    echo ❌ Ошибка при обновлении URL
)

echo.
echo Нажмите любую клавишу для выхода...
pause >nul