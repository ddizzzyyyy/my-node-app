const os = require('os');

console.log("=== Информация о процессоре ===");
const cpus = os.cpus();
console.log(`Количество логических ядер: ${cpus.length}`);
console.log(`Модель процессора: ${cpus[0].model}`);


const totalFreq = cpus.reduce((acc, cpu) => acc + cpu.speed, 0);
const avgFreq = Math.round(totalFreq / cpus.length);
console.log(`Средняя частота: ${avgFreq} МГц`);

console.log("\n=== Информация о памяти ===");
const totalMemoryBytes = os.totalmem();
const freeMemoryBytes = os.freemem();

const totalGB = (totalMemoryBytes / (1024 ** 3)).toFixed(2);
const freeGB = (freeMemoryBytes / (1024 ** 3)).toFixed(2);
const usedGB = ((totalMemoryBytes - freeMemoryBytes) / (1024 ** 3)).toFixed(2);
const usedPercent = ((totalMemoryBytes - freeMemoryBytes) / totalMemoryBytes * 100).toFixed(1);

console.log(`Общий объём: ${totalGB} ГБ`);
console.log(`Свободно: ${freeGB} ГБ`);
console.log(`Использовано: ${usedGB} ГБ (${usedPercent}%)`);


const freePercent = (freeMemoryBytes / totalMemoryBytes) * 100;
if (freePercent < 20) {
    console.log("Предупреждение: Мало свободного места в памяти!");
}

console.log("Группа: 477");
console.log(freePercent < 20 ? "Память перегружена" : "Память в норме");

console.log("\n=== Средняя загрузка системы ===");
const loadAvg = os.loadavg(); // [1 min, 5 min, 15 min]
if (os.platform() === 'win32') {
    console.log("Средняя загрузка системы (loadavg): Недоступно для Windows");
} else {
    console.log(`За 1 мин: ${loadAvg[0]}, За 5 мин: ${loadAvg[1]}, За 15 мин: ${loadAvg[2]}`);
}
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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

app.get('/api/books/search', (req, res) => {
    const authorQuery = req.query.author;
    if (!authorQuery) {
        return res.status(400).json({ error: "Не указан параметр author для поиска" });
    }
    const filteredBooks = books.filter(b => b.author.toLowerCase() === authorQuery.toLowerCase());
    res.json(filteredBooks);
});


app.get('/api/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
    const book = books.find(b => b.id === bookId);
    
    if (!book) {
        return res.status(404).json({ error: "Книга не найдена" });
    }
    res.json(book);
});


app.post('/api/books', (req, res) => {
    const { title, author, year } = req.body;
    

    if (!title || !author || !year) {
        return res.status(400).json({ error: "Невалидные данные: обязательны title, author и year" });
    }

    const newBook = {
        id: books.length > 0 ? books[books.length - 1].id + 1 : 1,
        title,
        author,
        year: parseInt(year)
    };

    books.push(newBook);
    res.status(201).json(newBook);
});


app.put('/api/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
    const book = books.find(b => b.id === bookId);

    if (!book) {
        return res.status(404).json({ error: "Книга для обновления не найдена" });
    }

    const { title, author, year } = req.body;


    if (title) book.title = title;
    if (author) book.author = author;
    if (year) book.year = parseInt(year);

    res.json(book);
});


app.delete('/api/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
    const bookIndex = books.findIndex(b => b.id === bookId);

    if (bookIndex === -1) {
        return res.status(404).json({ error: "Книга для удаления не найдена" });
    }

    books.splice(bookIndex, 1);
    res.json({ message: "Книга успешно удалена", id: bookId });
});

app.listen(PORT, () => {
    console.log(`Сервер Задания 2 запущен на http://localhost:${PORT}`);
});
