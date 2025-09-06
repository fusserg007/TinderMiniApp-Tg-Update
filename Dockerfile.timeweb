# =========================
# Stage 1: Build frontend
# =========================
FROM node:18 AS frontend-builder

WORKDIR /app/frontend

# Копируем только фронтовые файлы
COPY package*.json yarn.lock tsconfig.json tsconfig.node.json vite.config.ts ./
COPY src ./src
COPY index.html landing.html ./

RUN npm install
RUN npm run build --if-present

# =========================
# Stage 2: Build backend
# =========================
FROM node:18 AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json backend/tsconfig.json ./
RUN npm install

COPY backend ./ 

# Компиляция TS → dist/
RUN npm run build

# =========================
# Stage 3: Final image
# =========================
FROM node:18-slim AS final

WORKDIR /app

# Установка nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Копируем фронт в nginx
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Копируем backend (только dist и node_modules)
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY backend/package*.json ./backend/

# Конфиг nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Только порт 80 (Nginx проксирует /api → backend:3000)
EXPOSE 80

# Запуск: сначала backend, потом nginx
CMD node backend/dist/run-dev-mode.js & nginx -g "daemon off;"