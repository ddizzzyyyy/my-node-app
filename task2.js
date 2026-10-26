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