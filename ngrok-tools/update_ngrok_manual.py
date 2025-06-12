#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Простой скрипт для ручного обновления URL Ngrok в .env файле
Использование: python update_ngrok_manual.py <ngrok_url>
"""

import os
import re
import sys

def update_env_file(ngrok_url):
    """Обновляет файл .env с новым URL Ngrok"""
    # Путь к .env файлу в родительской директории
    env_file_path = os.path.join("..", ".env")
    
    if not os.path.exists(env_file_path):
        print(f"❌ Файл {env_file_path} не найден")
        return False
    
    try:
        # Читаем содержимое файла
        with open(env_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Обновляем WEBAPP_URL (это основной URL для Telegram бота)
        if 'WEBAPP_URL=' in content:
            # Заменяем существующую строку
            old_content = content
            content = re.sub(r'WEBAPP_URL=.*', f'WEBAPP_URL={ngrok_url}', content)
            
            if content != old_content:
                print(f"✓ Обновлен WEBAPP_URL: {ngrok_url}")
            else:
                print(f"⚠️ WEBAPP_URL уже содержит этот URL")
        else:
            # Добавляем новую строку
            content += f'\nWEBAPP_URL={ngrok_url}\n'
            print(f"✓ Добавлен WEBAPP_URL: {ngrok_url}")
        
        # Также обновляем NGROK_URL если есть
        if 'NGROK_URL=' in content:
            content = re.sub(r'NGROK_URL=.*', f'NGROK_URL={ngrok_url}', content)
            print(f"✓ Обновлен NGROK_URL: {ngrok_url}")
        
        # Записываем обновленное содержимое
        with open(env_file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"\n✅ Файл {env_file_path} успешно обновлен!")
        return True
        
    except Exception as e:
        print(f"❌ Ошибка при обновлении файла .env: {e}")
        return False

def validate_ngrok_url(url):
    """Проверяет, что URL похож на Ngrok URL"""
    ngrok_patterns = [
        r'https://[a-zA-Z0-9-]+\.ngrok-free\.app',
        r'https://[a-zA-Z0-9-]+\.ngrok\.io',
        r'https://[a-zA-Z0-9-]+\.ngrok\.app',
        r'http://[a-zA-Z0-9-]+\.ngrok-free\.app',
        r'http://[a-zA-Z0-9-]+\.ngrok\.io',
        r'http://[a-zA-Z0-9-]+\.ngrok\.app'
    ]
    
    for pattern in ngrok_patterns:
        if re.match(pattern, url, re.IGNORECASE):
            return True
    
    return False

def main():
    """Основная функция"""
    print("=== Обновление URL Ngrok в .env файле ===")
    
    # Проверяем аргументы командной строки
    if len(sys.argv) != 2:
        print("\nИспользование:")
        print(f"  python {sys.argv[0]} <ngrok_url>")
        print("\nПример:")
        print(f"  python {sys.argv[0]} https://abc123.ngrok-free.app")
        print("\nИли просто введите URL сейчас:")
        
        # Запрашиваем URL у пользователя
        ngrok_url = input("Введите URL Ngrok: ").strip()
    else:
        ngrok_url = sys.argv[1].strip()
    
    # Проверяем URL
    if not ngrok_url:
        print("❌ URL не может быть пустым")
        return
    
    # Добавляем https:// если не указан протокол
    if not ngrok_url.startswith(('http://', 'https://')):
        ngrok_url = 'https://' + ngrok_url
        print(f"ℹ️ Добавлен протокол: {ngrok_url}")
    
    # Проверяем, что это похоже на Ngrok URL
    if not validate_ngrok_url(ngrok_url):
        print(f"⚠️ Предупреждение: '{ngrok_url}' не похож на стандартный Ngrok URL")
        confirm = input("Продолжить? (y/n): ").strip().lower()
        if confirm not in ['y', 'yes', 'да', 'д']:
            print("Отменено")
            return
    
    # Обновляем .env файл
    if update_env_file(ngrok_url):
        print("\n🎉 Готово! Теперь можно перезапустить backend для применения изменений.")
        print("\nДля перезапуска backend выполните:")
        print("  cd backend")
        print("  npm run dev")
    else:
        print("\n❌ Не удалось обновить .env файл")

if __name__ == "__main__":
    main()