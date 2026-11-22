const EventEmitter = require('events');

const GROUP = 'ББМО-01-23';

class DatabaseConnection extends EventEmitter {
  constructor(dbName) {
    super();
    this.dbName = dbName;
  }

  connect() {
    console.log('[EVENT] Подключение к БД...');
    this.emit('connect', { dbName: this.dbName, group: GROUP });
  }

  query(sql) {
    console.log(`[EVENT] Выполнение запроса: ${sql}`);
    const result = sql.trim().toUpperCase().startsWith('SELECT')
      ? '50 записей'
      : '1 запись добавлена';
    this.emit('query', { sql, result, group: GROUP });
  }

  close() {
    console.log('[EVENT] Закрытие соединения');
    this.emit('close', { group: GROUP });
  }

  error(err) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    this.emit('error', errorObj);
  }
}

console.log(`=== DatabaseConnection (группа ${GROUP}) ===`);
const db = new DatabaseConnection('students_db');

db.on('connect', (info) => {
  console.log(`[EVENT] Соединение установлено (${info.dbName}, группа ${info.group})`);
});

db.on('query', (info) => {
  console.log(`[EVENT] Результат: ${info.result}`);
});

db.on('close', (info) => {
  console.log(`[EVENT] Соединение закрыто (группа ${info.group})`);
});

db.on('error', (err) => {
  console.log(`[EVENT] [${GROUP}] Ошибка: ${err.message}`);
});

db.connect();
db.query('SELECT * FROM students');
db.query('INSERT INTO students VALUES ("Иван")');
db.close();

console.log('=== Демонстрация ошибки ===');
db.error(new Error('Connection timeout'));
console.log('(без слушателя error - процесс упал бы с исключением)');

