const express = require('express');
const app = express();
const PORT = 3000;


app.get('/', (req, res) => {
    const currentTime = new Date().toLocaleString();
    res.send(`
        <html>
            <head><title>Лабораторная работа №16</title></head>
            <body style="font-family: Arial; padding: 20px; line-height: 1.6;">
                <h1>Лабораторная работа №16</h1>
                <p><b>Группа:</b> 477</p>
                <p><b>Текущая дата и время:</b> ${currentTime}</p>
                <p>Добро пожаловать на наш сервер Express.js!</p>
                <h3>Доступные маршруты:</h3>
                <ul>
                    <li><a href="/">Главная страница (/)</a></li>
                    <li><a href="/about">О разработчике (/about)</a></li>
                    <li><a href="/contacts">Контакты (/contacts)</a></li>
                </ul>
            </body>
        </html>
    `);
});

app.get('/about', (req, res) => {
    res.send(`
        <html>
            <head><title>О разработчике</title></head>
            <body style="font-family: Arial; padding: 20px; line-height: 1.6;">
                <h1>О разработчике</h1>
                <p><b>Группа:</b> 477</p>
                <p>Поздняков Савелий выполняет лабораторную работу по разработке веб-приложений на Node.js и Express.js.</p>
                <p><a href="/">На главную</a></p>
            </body>
        </html>
    `);
});

app.get('/contacts', (req, res) => {
    res.send(`
        <html>
            <head><title>Контакты</title></head>
            <body style="font-family: Arial; padding: 20px; line-height: 1.6;">
                <h1>Контакты</h1>
                <p><b>Email:</b> student@example.com</p>
                <p><b>GitHub:</b> <a href="https://github.com/ddizzzyyyy" target="_blank">ddizzzyyyy</a></p>
                <p><a href="/">На главную</a></p>
            </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Сервер Задания 1 запущен на http://localhost:${PORT}`);
});