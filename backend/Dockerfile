# =========================
# Stage 2: Build backend
# =========================
FROM node:18 AS backend-builder

WORKDIR /app

# Копируем ВСЕ файлы backend для сборки
COPY backend/ ./backend/

# Устанавливаем зависимости и собираем
RUN cd backend && npm install && npm run build

# Проверяем что файлы собрались (это просто для диагностики)
RUN ls -la /app/backend/dist/ && \
    find /app/backend/dist/ -name "*express*" || echo "Building completed"