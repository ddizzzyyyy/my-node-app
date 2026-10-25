const express = require('express');
const app = express();
const PORT = 3000;


app.get('/', (req, res) => {
    const currentTime = new Date().toLocaleString();
    res.send(`
        <html>
            <head><title>Лабораторная работа №16</title></head>
            <body style="font-family: Arial; padding: 20px;">
                <h1>Лабораторная работа №16</h1>
                <p><b>Группа:</b> 477</p>
                <p><b>Текущая дата и время:</b> ${currentTime}</p>
                <p>Добро пожаловать на сервер Express.js!</p>
            </body>
        </html>
    `);
});


app.get('/about', (req, res) => {
    res.send('<h1>О разработчике</h1><p>Студент группы 477. Разработчик веб-приложений на Node.js.</p>');
});


app.get('/contacts', (req, res) => {
    res.send('<h1>Контакты</h1><p>Email: net@gmail.com</p>');
});

app.listen(PORT, () => {
    console.log(`Сервер Задания 1 запущен на http://localhost:${PORT}`);
});