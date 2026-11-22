const { Writable } = require('stream');

const STUDENT_NAME = 'Поздняков Савелий Олегович'; 

class ConsoleWritable extends Writable {
  constructor(options) {
    super(options);
    this.writtenCount = 0;
  }

  _write(chunk, encoding, callback) {
    const text = chunk.toString('utf8');
    console.log(`[WRITE] ${text}`);
    setTimeout(() => {
      this.writtenCount += 1;
      callback();
    }, 50);
  }
}

console.log('=== Демонстрация Writable-потока ===');

const writable = new ConsoleWritable({ highWaterMark: 16 });

const messages = [
  'Группа: ББМО-01-23',
  `Студент: ${STUDENT_NAME}`,
  'Лабораторная работа: №21',
  'Тема: Потоки в Node.js'
];

let idx = 0;

function writeNext() {
  while (idx < messages.length) {
    const msg = messages[idx];
    idx += 1;
    const ok = writable.write(msg);
    if (ok) {
      console.log('write() вернул: true');
    } else {
      console.log('write() вернул: false — буфер переполнен!');
      writable.once('drain', () => {
        console.log('[DRAIN] Буфер освобождён, продолжаем запись');
        writeNext();
      });
      return;
    }
  }
  writable.end();
}

writable.on('finish', () => {
  console.log('[FINISH] Все данные записаны');
  console.log(`Всего записано: ${writable.writtenCount} чанка`);
});

writable.on('error', (err) => {
  console.error('[ERROR]', err.message);
});

writeNext();