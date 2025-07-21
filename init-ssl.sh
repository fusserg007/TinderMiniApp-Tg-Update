#!/bin/bash

# Скрипт для инициализации SSL сертификатов

echo "Инициализация SSL сертификатов для tindertgminiapp.shop..."

# Создаем временные самоподписанные сертификаты для nginx
mkdir -p certbot/conf/live/tindertgminiapp.shop

# Создаем временный сертификат
openssl req -x509 -nodes -newkey rsa:2048 \
  -days 1 \
  -keyout certbot/conf/live/tindertgminiapp.shop/privkey.pem \
  -out certbot/conf/live/tindertgminiapp.shop/fullchain.pem \
  -subj '/CN=localhost'

echo "Временные сертификаты созданы."

# Переименовываем конфигурации nginx
if [ -f "nginx/conf.d/default.conf" ]; then
    mv nginx/conf.d/default.conf nginx/conf.d/default.conf.ssl
fi

if [ -f "nginx/conf.d/initial.conf" ]; then
    mv nginx/conf.d/initial.conf nginx/conf.d/default.conf
fi

echo "Конфигурация nginx настроена для получения сертификата."

# Запускаем контейнеры без certbot
docker-compose -f docker-compose.prod.yml up -d mongo object-storage imgproxy backend frontend nginx

echo "Ожидание запуска сервисов..."
sleep 30

# Получаем настоящий сертификат
docker-compose -f docker-compose.prod.yml run --rm certbot \
  certonly --webroot --webroot-path=/var/www/certbot \
  --email your-email@example.com --agree-tos --no-eff-email \
  -d tindertgminiapp.shop

echo "Сертификат получен. Переключаемся на SSL конфигурацию..."

# Возвращаем SSL конфигурацию
if [ -f "nginx/conf.d/default.conf.ssl" ]; then
    mv nginx/conf.d/default.conf nginx/conf.d/initial.conf.bak
    mv nginx/conf.d/default.conf.ssl nginx/conf.d/default.conf
fi

# Перезапускаем nginx с SSL
docker-compose -f docker-compose.prod.yml restart nginx

# Запускаем certbot для автообновления
docker-compose -f docker-compose.prod.yml up -d certbot

echo "SSL настроен! Сайт доступен по адресу https://tindertgminiapp.shop"