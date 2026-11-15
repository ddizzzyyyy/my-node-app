#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const program = new Command();

program
    .name('my-cli')
    .description('CLI-приложение с интерактивным режимом для ЛР №17');

program
    .command('init')
    .description('инициализация проекта')
    .option('-n, --name <name>', 'название проекта')
    .option('-t, --type <type>', 'тип проекта')
    .option('--typescript', 'использовать TypeScript')
    .option('--prettier', 'использовать Prettier')
    .option('--git', 'использовать Git')
    .option('--no-interactive', 'отключить интерактивный режим')
    .action(async (options) => {
        const isNonInteractive = options.interactive === false || !process.stdin.isTTY;

        if (isNonInteractive && (!options.name || !options.type)) {
            console.error('Ошибка: в неинтерактивном режиме необходимо указать --name и --type');
            process.exit(1);
        }

        let answers = {
            name: options.name,
            type: options.type,
            options: [],
            git: options.git
        };

        if (!answers.name || !answers.type) {
            const promptQuestions = [];

            if (!answers.name) {
                promptQuestions.push({
                    type: 'input',
                    name: 'name',
                    message: 'Введите название проекта:'
                });
            }

            if (!answers.type) {
                promptQuestions.push({
                    type: 'list',
                    name: 'type',
                    message: 'Выберите тип проекта:',
                    choices: ['Web-приложение', 'CLI-утилита', 'Библиотека', 'Микросервис']
                });
            }

            promptQuestions.push(
                {
                    type: 'checkbox',
                    name: 'options',
                    message: 'Выберите дополнительные опции:',
                    choices: ['TypeScript', 'ESLint', 'Prettier', 'Jest']
                },
                {
                    type: 'confirm',
                    name: 'git',
                    message: 'Использовать Git?',
                    default: true
                }
            );

            const result = await inquirer.prompt(promptQuestions);
            answers = { ...answers, ...result };
        } else {
            if (options.typescript) answers.options.push('TypeScript');
            if (options.prettier) answers.options.push('Prettier');
        }

        console.log(`Проект "${answers.name}" успешно инициализирован!`);
        console.log(`Тип: ${answers.type}`);
        console.log(`Опции: ${answers.options.join(', ') || 'нет'}`);
        console.log(`Git: ${answers.git ? 'да' : 'нет'}`);
    });

program.parse(process.argv);
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
