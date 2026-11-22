const { Readable } = require('stream');

const STUDENT_NAME = 'Поздняков Савелий Олегович';

const chunksData = [
  'Группа: ББМО-01-23',
  `Студент: ${STUDENT_NAME}`,
  'Лабораторная работа: №21',
  'Тема: Потоки в Node.js'
];

class GroupReadable extends Readable {
  constructor(items, options) {
    super(options);
    this.items = items;
    this.index = 0;
  }

  _read() {
    if (this.index < this.items.length) {
      this.push(this.items[this.index]);
      this.index += 1;
    } else {
      this.push(null);
    }
  }
}

console.log('=== Демонстрация Readable-потока ===');

const readable = new GroupReadable(chunksData, { encoding: 'utf8' });
let chunkCount = 0;
let totalBytes = 0;

readable.on('data', (chunk) => {
  chunkCount += 1;
  const bytes = Buffer.byteLength(chunk, 'utf8');
  totalBytes += bytes;
  console.log(`[CHUNK ${chunkCount}] ${chunk}`);
});

readable.on('end', () => {
  console.log('[END] Поток завершён');
  console.log(`Всего получено чанков: ${chunkCount}`);
  console.log(`Общий размер данных: ${totalBytes} байт`);
});

readable.on('error', (err) => {
  console.error('[ERROR]', err.message);
});