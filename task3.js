const fs = require('fs/promises');
const path = require('path');

const VARIANT = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // Ограничение 10 МБ 

async function scanDirectory(dirPath) {
  let fileCount = 0;
  let folderCount = 0;
  let totalSize = 0;
  const filesList = [];
  const extensionsMap = {};

  async function recursiveScan(currentPath) {
    const items = await fs.readdir(currentPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);

      if (item.isDirectory()) {
        folderCount++;
        await recursiveScan(fullPath);
      } else if (item.isFile()) {
        const stats = await fs.stat(fullPath);

        // игнорировать файлы размером более 10 МБ 
        if (stats.size > MAX_FILE_SIZE) {
          continue;
        }

        fileCount++;
        totalSize += stats.size;

        const ext = path.extname(item.name).toLowerCase() || 'без расширения';
        
        if (!extensionsMap[ext]) {
          extensionsMap[ext] = { count: 0, size: 0 };
        }
        extensionsMap[ext].count++;
        extensionsMap[ext].size += stats.size;

        filesList.push({
          name: item.name,
          path: fullPath,
          size: stats.size
        });
      }
    }
  }

  await recursiveScan(dirPath);
  return { fileCount, folderCount, totalSize, extensionsMap, filesList };
}

// форматирование размера файлов в читаемый вид
function formatBytes(bytes) {
  if (bytes === 0) return '0 Б';
  const k = 1024;
  const sizes = ['Байт', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function task3() {
  try {
    // получение пути из аргументов командной строки или использование текущей директории
    const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve('.');

    console.log(`Анализ директории: ${targetDir}`);

    const data = await scanDirectory(targetDir);

    // Сортировка файлов для поиска Топ-5 больших и маленьких
    const sortedFiles = [...data.filesList].sort((a, b) => b.size - a.size);
    const topLargest = sortedFiles.slice(0, 5);
    const topSmallest = [...sortedFiles].reverse().slice(0, 5);

    // вывод результатов в консоль
    console.log(`Общее количество папок: ${data.folderCount}`);
    console.log(`Общее количество файлов: ${data.fileCount}`);
    console.log(`Общий размер: ${formatBytes(data.totalSize)} (${data.totalSize} байт)\n`);

    console.log('Расширения файлов:');
    for (const [ext, info] of Object.entries(data.extensionsMap)) {
      console.log(`  ${ext}: ${info.count} файлов (${formatBytes(info.size)})`);
    }

    console.log('\nТоп-5 самых больших файлов:');
    topLargest.forEach((f, idx) => {
      console.log(`${idx + 1}. ${f.name} (${formatBytes(f.size)})\n   ${f.path}`);
    });

    // сохранение отчета в report_5.json
    const reportData = {
      targetDirectory: targetDir,
      stats: {
        folderCount: data.folderCount,
        fileCount: data.fileCount,
        totalSize: data.totalSize,
        totalFormattedSize: formatBytes(data.totalSize)
      },
      extensions: data.extensionsMap,
      topLargest,
      topSmallest
    };

    const reportName = `report_${VARIANT}.json`;
    await fs.writeFile(reportName, JSON.stringify(reportData, null, 2), 'utf-8');
    console.log(`\nОтчет сохранен: ${reportName}`);

  } catch (error) {
    console.error('Ошибка при выполнении Задания 3:', error.message);
  }
}

task3();