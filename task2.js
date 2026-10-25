const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let users = [
    { id: 1, name: 'Иван Иванов', email: 'ivan@example.com' },
    { id: 2, name: 'Пётр Петров', email: 'petr@example.com' }
];


app.get('/api/users', (req, res) => {
    res.json(users);
});


app.post('/api/users', (req, res) => {
    const newUser = {
        id: users.length + 1,
        name: req.body.name || 'Новый пользователь',
        email: req.body.email || 'user@example.com'
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

app.listen(PORT, () => {
    console.log(`Сервер Задания 2 запущен на http://localhost:${PORT}`);
});