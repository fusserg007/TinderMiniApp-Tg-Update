FROM node:18-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install --production

# Копируем скомпилированный код
COPY dist/ ./dist/

EXPOSE 4000

CMD ["node", "dist/run-dev-mode.js"]