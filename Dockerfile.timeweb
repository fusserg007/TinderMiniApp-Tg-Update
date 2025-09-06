# =========================
# Stage 1: Build frontend
# =========================
FROM node:18 AS frontend-builder

WORKDIR /app

# Копируем только необходимые файлы
COPY package*.json yarn.lock tsconfig.json tsconfig.node.json vite.config.ts ./
COPY src ./src
COPY index.html landing.html ./


RUN npm install
RUN tsc && vite build

# =========================
# Stage 2: Build backend
# =========================
FROM node:18 AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json backend/tsconfig.json ./ 
RUN npm install

COPY backend ./ 

# Компиляция TypeScript → dist/
RUN cd backend && npm run build

# =========================
# Stage 3: Production image
# =========================
FROM node:18-slim AS final

WORKDIR /app

# Устанавливаем nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Копируем фронтенд статику
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Копируем backend (dist + зависимости)
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY backend/package*.json ./backend/

# Копируем конфиг nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Экспонируем только 80 (всё идёт через nginx)
EXPOSE 80

# Запускаем backend и nginx
CMD node backend/dist/run-dev-mode.js & nginx -g "daemon off;"