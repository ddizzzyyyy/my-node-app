const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json()); // Middleware для разбора JSON в теле запроса


let books = [
    { id: 1, title: "Война и мир", author: "Толстой", year: 1869 },
    { id: 2, title: "Преступление и наказание", author: "Достоевский", year: 1866 }
];


app.get('/api/books', (req, res) => {
    const authorQuery = req.query.author;
    if (authorQuery) {
        const filteredBooks = books.filter(b => b.author.toLowerCase() === authorQuery.toLowerCase());
        return res.json(filteredBooks);
    }
    res.json(books);
});


app.get('/api/books/:id', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) return res.status(404).json({ error: "Книга не найдена" });
    res.json(book);
});


app.post('/api/books', (req, res) => {
    const { title, author, year } = req.body;
    if (!title || !author || !year) {
        return res.status(400).json({ error: "Невалидные данные: заполните title, author и year" });
    }
    const newBook = {
        id: books.length > 0 ? books[books.length - 1].id + 1 : 1,
        title,
        author,
        year
    };
    books.push(newBook);
    res.status(201).json(newBook);
});


app.put('/api/books/:id', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) return res.status(404).json({ error: "Книга не найдена" });

    const { title, author, year } = req.body;
    if (title) book.title = title;
    if (author) book.author = author;
    if (year) book.year = year;

    res.json(book);
});


app.delete('/api/books/:id', (req, res) => {
    const index = books.findIndex(b => b.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: "Книга не найдена" });
    
    const deletedBook = books.splice(index, 1);
    res.json({ message: "Книга успешно удалена", deletedBook });
});

app.listen(PORT, () => {
    console.log(`Сервер Задания 2 запущен на http://localhost:${PORT}`);
});