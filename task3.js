const express = require('express');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = 3000;


app.use(express.json());


app.use(compression());



const limiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 100, 
    standardHeaders: true, 
    legacyHeaders: false,
    message: { error: "Превышен лимит запросов, пожалуйста, подождите.", status: 429 }
});
app.use(limiter);


app.use((req, res, next) => {
    const start = Date.now(); 


    res.on('finish', () => {
        const duration = Date.now() - start;
        

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;


        console.log(`[${timestamp}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });

    next();
});


app.get('/', (req, res) => {
    res.send('Главная страница сервера Express (Задание 3)');
});

app.get('/about', (req, res) => {
    res.send('О нас: Лабораторная работа №16 по Node.js / Express (Продвинутый уровень)');
});



app.get('/error', (req, res, next) => {
    throw new Error('Искусственная синхронная ошибка на сервере');
});


app.get('/async-error', async (req, res, next) => {
    try {

        throw new Error('Искусственная асинхронная ошибка');
    } catch (err) {
        next(err); 
    }
});


app.use((req, res, next) => {
    const error = new Error('Страница не найдена');
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    

    res.status(statusCode).json({
        error: err.message || 'Внутренняя ошибка сервера',
        status: statusCode
    });
});

app.listen(PORT, () => {
    console.log(`Сервер Задания 3 запущен на http://localhost:${PORT}`);
});