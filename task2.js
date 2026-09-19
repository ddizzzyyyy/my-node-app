const fs = require('fs/promises');
const path = require('path');

const VARIANT = 5;
const ROOT_DIR = path.join('.', `project_${VARIANT}`);

// вспомогательная функция для вывода дерева директорий
async function printTree(dirPath, indent = '') {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    for (const item of items) {
      console.log(`${indent}├── ${item.name}`);
      if (item.isDirectory()) {
        await printTree(path.join(dirPath, item.name), indent + '│   ');
      }
    }
  } catch (err) {
    console.error(`Ошибка при построении дерева для ${dirPath}:`, err.message);
  }
}

async function task2() {
  try {
    // определение структуры папок
    const folders = [
      ROOT_DIR,
      path.join(ROOT_DIR, 'src'),
      path.join(ROOT_DIR, 'src', 'modules'),
      path.join(ROOT_DIR, 'src', 'components'),
      path.join(ROOT_DIR, 'src', 'utils'),
      path.join(ROOT_DIR, 'data'),
      path.join(ROOT_DIR, 'data', 'input'),
      path.join(ROOT_DIR, 'data', 'output'),
      path.join(ROOT_DIR, 'temp')
    ];

    // Дополнительное условие для нечетного варианта (5): 3 вложенные папки в src/components
    if (VARIANT % 2 !== 0) {
      folders.push(
        path.join(ROOT_DIR, 'src', 'components', '1'),
        path.join(ROOT_DIR, 'src', 'components', '2'),
        path.join(ROOT_DIR, 'src', 'components', '3')
      );
    }

    // Создание всех директорий
    for (const folder of folders) {
      await fs.mkdir(folder, { recursive: true });
    }

    // создание файла info.txt в каждой папке
    for (const folder of folders) {
      const infoPath = path.join(folder, 'info.txt');
      const folderName = path.basename(folder);
      await fs.writeFile(infoPath, `Назначение папки: ${folderName}\n`, 'utf-8');
    }

    // вывод начального дерева
    console.log(`\n--- Дерево структуры (${ROOT_DIR}) ---`);
    console.log(ROOT_DIR);
    await printTree(ROOT_DIR);

    // перемещение temp -> data/temp
    const tempOld = path.join(ROOT_DIR, 'temp');
    const tempNew = path.join(ROOT_DIR, 'data', 'temp');
    await fs.rename(tempOld, tempNew);

    // переименование data/output -> data/results
    const outputOld = path.join(ROOT_DIR, 'data', 'output');
    const resultsNew = path.join(ROOT_DIR, 'data', 'results');
    await fs.rename(outputOld, resultsNew);

    // удаление папки temp со всем содержимым (data/temp)
    await fs.rm(tempNew, { recursive: true, force: true });

    // вывод обновленного дерева
    console.log(`\n--- Обновленное дерево структуры ---`);
    console.log(ROOT_DIR);
    await printTree(ROOT_DIR);

  } catch (error) {
    console.error('Ошибка при выполнении Задания 2:', error.message);
  }
}

task2();