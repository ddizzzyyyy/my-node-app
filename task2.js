#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

program
    .name('my-cli')
    .description('CLI-приложение для лабораторной работы №17')
    .version('1.0.0', '-V, --version', 'output the version number')
    .option('-v, --verbose', 'подробный вывод');

program
    .command('generate')
    .description('сгенерировать отчёт')
    .option('-t, --type <type>', 'тип отчёта (по умолчанию: "html")', 'html')
    .option('-o, --output <path>', 'путь для сохранения')
    .option('-f, --force', 'перезаписать существующий файл')
    .option('--dry-run', 'показать что будет сделано без выполнения')
    .action((options) => {
        const verbose = program.opts().verbose;
        const validTypes = ['html', 'pdf', 'json', 'csv'];

        if (!validTypes.includes(options.type)) {
            console.error(`Ошибка: недопустимый тип отчёта "${options.type}".`);
            console.error(`Допустимые значения: ${validTypes.join(', ')}`);
            process.exit(1);
        }

        if (options.dryRun) {
            console.log(`[DRY-RUN] Будет сгенерирован отчёт типа: ${options.type}`);
            console.log(`[DRY-RUN] Файл будет сохранён в: ${options.output || '/output.html'}`);
            console.log('[DRY-RUN] Действия не выполнены (режим проверки)');
            return;
        }

        if (verbose) {
            console.log('[VERBOSE] Запуск генерации отчёта...');
            console.log(`[VERBOSE] Тип отчёта: ${options.type}`);
            if (options.output) console.log(`[VERBOSE] Путь сохранения: ${options.output}`);
        }

        const outFile = options.output || `report.${options.type}`;
        console.log(`Отчёт успешно сгенерирован: ${outFile}`);
    });

program.parse(process.argv);
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
