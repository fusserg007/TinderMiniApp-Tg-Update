# Этап сборки
FROM node:18-alpine AS build

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы
COPY . .

# Собираем приложение
RUN npm run build

# Этап запуска
FROM nginx:alpine

# Копируем собранные файлы из этапа сборки
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY default.conf /etc/nginx/conf.d/default.conf

# Создаем файл с дополнительными MIME типами
RUN echo 'application/javascript js mjs;' > /etc/nginx/conf.d/mime.types.custom && \
    echo 'text/javascript js;' >> /etc/nginx/conf.d/mime.types.custom && \
    echo 'application/javascript ts tsx;' >> /etc/nginx/conf.d/mime.types.custom && \
    echo 'text/css css;' >> /etc/nginx/conf.d/mime.types.custom && \
    echo 'application/json json;' >> /etc/nginx/conf.d/mime.types.custom && \
    echo 'image/svg+xml svg svgz;' >> /etc/nginx/conf.d/mime.types.custom && \
    echo 'application/wasm wasm;' >> /etc/nginx/conf.d/mime.types.custom

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
