#!/usr/bin/env node

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
    console.log(`Использование: my-cli <команда> [аргументы]
Доступные команды:
  greet <имя> - поприветствовать пользователя
  info        - вывести информацию о группе`);
    process.exit(0);
}


if (command === 'greet') {
    const name = args[1];
    if (!name) {
        console.error('Ошибка: не указано имя для приветствия.');
        process.exit(1);
    }
    console.log(`Привет, ${name}! Добро пожаловать в CLI-приложение группы 477.`);
    process.exit(0);
} 

else if (command === 'info') {
    console.log(`Группа: 477
Студент: Поздняков Савелий
Лабораторная работа: №17
Дата: 2026-10-26`);
    process.exit(0);
} 

else {
    console.error(`Ошибка: неизвестная команда "${command}"`);
    console.error('Для справки используйте: my-cli --help');
    process.exit(1);
}
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
