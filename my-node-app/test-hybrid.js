const HybridFileManager = require('./hybrid-fileManager');
const manager = new HybridFileManager();

async function runTest() {
  console.log('=== ТЕСТ ГИБРИДНОГО МОДУЛЯ ===');

  manager.createFile('cb-file.txt', 'Данные через колбэк', (err, path) => {
    if (err) return console.error(err);
    console.log('Сработал Callback:', path);

    manager.readFile('cb-file.txt', (err, data) => {
      console.log('Прочитано через Callback:', data);
      manager.deleteFile('cb-file.txt', () => console.log('Callback файл удален'));
    });
  });
  try {
    const path = await manager.createFile('promise-file.txt', 'Данные через промис');
    console.log('Сработал Promise:', path);

    const data = await manager.readFile('promise-file.txt');
    console.log('Прочитано через Promise:', data);

    await manager.deleteFile('promise-file.txt');
    console.log('Promise файл удален');
  } catch (err) {
    console.error('Ошибка в промисе:', err.message);
  }
}

runTest();