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