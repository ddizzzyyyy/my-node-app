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