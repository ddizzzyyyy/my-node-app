const EventEmitter = require('events');

class DatabaseConnection extends EventEmitter {
  constructor(group = 'ББМО-01-23') {
    super();
    this.group = group;
  }

  connect() {
    this.emit('connect', { status: 'connecting', group: this.group });
    this.emit('connect', { status: 'connected', group: this.group });
  }

  query(sql) {
    let result = '';
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      result = '50 записей';
    } else {
      result = '1 запись добавлена';
    }
    this.emit('query', { sql, result, group: this.group });
  }

  close() {
    this.emit('close', { status: 'closing', group: this.group });
    this.emit('close', { status: 'closed', group: this.group });
  }

  error(message) {
    this.emit('error', new Error(message));
  }
}

const group = 'ББМО-01-23';
const db = new DatabaseConnection(group);

db.on('connect', (data) => {
  if (data.status === 'connecting') {
    console.log(`[EVENT] Подключение к БД... (${data.group})`);
  } else {
    console.log(`[EVENT] Соединение установлено (${data.group})`);
  }
});

db.on('query', (data) => {
  console.log(`[EVENT] Выполнение запроса: ${data.sql}`);
  console.log(`[EVENT] Результат: ${data.result}`);
});

db.on('close', (data) => {
  if (data.status === 'closing') {
    console.log(`[EVENT] Закрытие соединения (${data.group})`);
  } else {
    console.log(`[EVENT] Соединение закрыто (${data.group})`);
  }
});

console.log(`=== DatabaseConnection (группа ${group}) ===`);
db.connect();
db.query('SELECT * FROM students');
db.query('INSERT INTO students VALUES ("Тест")');
db.close();

console.log('\n=== Демонстрация ошибки ===');


const withoutErrorListener = process.argv.includes('--crash');

if (!withoutErrorListener) {
  db.on('error', (err) => {
    console.log(`[EVENT] [${group}] Ошибка: ${err.message}`);
  });
}

db.error('Connection timeout');