import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static(__dirname));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing.html'));
});

// Маршрут для проверки здоровья сервера
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'At First Sight Landing Page'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Landing page server running on port ${PORT}`);
    console.log(`📱 Visit: http://localhost:${PORT}`);
});

export default app;