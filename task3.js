const express = require('express');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = 3000;

app.use(compression());


const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

app.use(express.json());


app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        console.log(`[${now}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    
    next();
});

app.get('/error', (req, res, next) => {
    const err = new Error("Искусственная синхронная ошибка");
    err.status = 500;
    next(err);
});

app.get('/async-error', async (req, res, next) => {
    try {
        throw new Error("Искусственная асинхронная ошибка");
    } catch (err) {
        err.status = 400;
        next(err);
    }
});

app.get('/', (req, res) => {
    res.send('Сервер Задания 3 работает. Попробуйте перейти на /error или /async-error');
});


app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        error: err.message || "Внутренняя ошибка сервера",
        status: statusCode
    });
});

app.listen(PORT, () => {
    console.log(`Сервер Задания 3 запущен на http://localhost:${PORT}`);
});