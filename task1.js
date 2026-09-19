const fs = require('fs/promises');
const path = require('path');

const VARIANT = 5;
const FILE_NAME = `student_${VARIANT}.txt`;

async function task1() {
  try {
    const filePath = path.join('.', FILE_NAME);

    // начальные данные для записи
    const initialLines = [
      'Студент: Поздняков Савелий Олегович',
      'Группа: 477',
      `Вариант: ${VARIANT}`,
      `Дата: ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`,
      'Любимые книги:',
      '1. "Война и мир" Л. Толстой',
      '2. "Преступление и наказание" Ф. Достоевский',
      '3. "Мастер и Маргарита" М. Булгаков',
      '4. "1984" Дж. Оруэлл',
      '5. "Гарри Поттер" Дж. Роулинг'
    ];

    // запись начального текста в файл
    await fs.writeFile(filePath, initialLines.join('\n') + '\n', 'utf-8');

    // подсчет количества строк и добавление итоговой строки
    const fileData = await fs.readFile(filePath, 'utf-8');
    const lines = fileData.trim().split('\n');
    const totalLines = lines.length;

    await fs.appendFile(filePath, `Количество записей: ${totalLines}\n`, 'utf-8');

    // чтение и вывод финального содержимого в консоль
    const finalContent = await fs.readFile(filePath, 'utf-8');
    console.log(`Создан файл: ${FILE_NAME}`);
    console.log('Содержимое файла:\n');
    console.log(finalContent);

  } catch (error) {
    console.error('Ошибка при выполнении Задания 1:', error.message);
  }
}

task1();