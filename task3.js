const express = require('express');
const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send('Главная страница сервера Express');
});

app.get('/about', (req, res) => {
    res.send('О нас: Лабораторная работа №16 по Node.js / Express');
});

app.use((req, res) => {
    res.status(404).send('<h1>404: Страница не найдена</h1>');
});

app.listen(PORT, () => {
    console.log(`Сервер Задания 3 запущен на http://localhost:${PORT}`);
});