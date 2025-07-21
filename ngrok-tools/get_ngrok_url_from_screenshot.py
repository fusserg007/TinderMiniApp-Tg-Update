#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для получения URL Ngrok через скриншот терминала и OCR
Использует библиотеки: pillow, pytesseract, pyautogui
"""

import os
import re
import sys
import time
import subprocess
from PIL import Image
import pyautogui
import pytesseract

def install_requirements():
    """Устанавливает необходимые зависимости"""
    required_packages = [
        'pillow',
        'pytesseract', 
        'pyautogui'
    ]
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✓ {package} уже установлен")
        except ImportError:
            print(f"Устанавливаю {package}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])

def take_screenshot():
    """Делает скриншот экрана"""
    print("Делаю скриншот экрана...")
    screenshot = pyautogui.screenshot()
    screenshot_path = "ngrok_terminal_screenshot.png"
    screenshot.save(screenshot_path)
    print(f"Скриншот сохранен: {screenshot_path}")
    return screenshot_path

def extract_ngrok_url_from_image(image_path):
    """Извлекает URL Ngrok из изображения с помощью OCR"""
    try:
        # Открываем изображение
        image = Image.open(image_path)
        
        # Извлекаем текст с помощью OCR
        print("Анализирую изображение с помощью OCR...")
        text = pytesseract.image_to_string(image)
        
        # Ищем URL Ngrok в тексте
        # Паттерны для поиска URL Ngrok
        patterns = [
            r'https://[a-zA-Z0-9-]+\.ngrok-free\.app',
            r'https://[a-zA-Z0-9-]+\.ngrok\.io',
            r'https://[a-zA-Z0-9-]+\.ngrok\.app',
            r'http://[a-zA-Z0-9-]+\.ngrok-free\.app',
            r'http://[a-zA-Z0-9-]+\.ngrok\.io',
            r'http://[a-zA-Z0-9-]+\.ngrok\.app'
        ]
        
        found_urls = []
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            found_urls.extend(matches)
        
        if found_urls:
            # Возвращаем первый найденный URL
            url = found_urls[0]
            print(f"Найден URL Ngrok: {url}")
            return url
        else:
            print("URL Ngrok не найден в тексте OCR")
            print("Извлеченный текст:")
            print(text)
            return None
            
    except Exception as e:
        print(f"Ошибка при анализе изображения: {e}")
        return None

def update_env_file(ngrok_url):
    """Обновляет файл .env с новым URL Ngrok"""
    env_file_path = ".env"
    
    if not os.path.exists(env_file_path):
        print(f"Файл {env_file_path} не найден")
        return False
    
    try:
        # Читаем содержимое файла
        with open(env_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Обновляем NGROK_URL
        if 'NGROK_URL=' in content:
            # Заменяем существующую строку
            content = re.sub(r'NGROK_URL=.*', f'NGROK_URL={ngrok_url}', content)
        else:
            # Добавляем новую строку
            content += f'\nNGROK_URL={ngrok_url}\n'
        
        # Записываем обновленное содержимое
        with open(env_file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Файл {env_file_path} обновлен с URL: {ngrok_url}")
        return True
        
    except Exception as e:
        print(f"Ошибка при обновлении файла .env: {e}")
        return False

def main():
    """Основная функция"""
    print("=== Получение URL Ngrok через скриншот ===")
    
    # Проверяем и устанавливаем зависимости
    try:
        install_requirements()
    except Exception as e:
        print(f"Ошибка при установке зависимостей: {e}")
        return
    
    # Даем пользователю время подготовиться
    print("\nУбедитесь, что терминал с Ngrok виден на экране.")
    print("Скриншот будет сделан через 3 секунды...")
    time.sleep(3)
    
    # Делаем скриншот
    screenshot_path = take_screenshot()
    
    # Извлекаем URL из скриншота
    ngrok_url = extract_ngrok_url_from_image(screenshot_path)
    
    if ngrok_url:
        # Обновляем .env файл
        if update_env_file(ngrok_url):
            print("\n✓ Успешно обновлен URL Ngrok в .env файле")
            print(f"Новый URL: {ngrok_url}")
        else:
            print("\n✗ Ошибка при обновлении .env файла")
    else:
        print("\n✗ Не удалось извлечь URL Ngrok из скриншота")
        print("Попробуйте:")
        print("1. Убедиться, что терминал с Ngrok полностью виден")
        print("2. Увеличить размер шрифта в терминале")
        print("3. Запустить скрипт еще раз")
    
    # Удаляем временный файл скриншота
    try:
        os.remove(screenshot_path)
        print(f"Временный файл {screenshot_path} удален")
    except:
        pass

if __name__ == "__main__":
    main()