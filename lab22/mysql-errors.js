require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mysql = require('mysql2/promise');
const mysqlCb = require('mysql2');

const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'student',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bbmo_01_23'
};

function createAppPool(cfg = baseConfig) {
  const pool = mysqlCb.createPool({
    ...cfg,
    waitForConnections: true,
    connectionLimit: 10
  });

  pool.on('error', (err) => {
    console.error(`[POOL ERROR] ${err.code || err.message}`);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('[POOL] Пересоздание пула...');
    }
  });

  return pool;
}

async function demoErrors() {
  console.log('=== Демонстрация ошибок ===');

  try {
    const c = await mysql.createConnection({ ...baseConfig, port: 9999, connectTimeout: 1000 });
    await c.end();
  } catch (e) {
    console.log(`[${e.code}] Сервер недоступен: ${baseConfig.host}:9999`);
  }

  try {
    const c = await mysql.createConnection({ ...baseConfig, password: 'wrong_password_123' });
    await c.end();
  } catch (e) {
    console.log(`[${e.code}] Неверный пароль для пользователя ${baseConfig.user}`);
  }

  const pool = mysql.createPool({ ...baseConfig, connectionLimit: 5 });

  try {
    await pool.query('SELECT * FRM students');
  } catch (e) {
    console.log(`[${e.code}] Синтаксическая ошибка: SELECT * FRM students`);
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS err_demo (
      id INT PRIMARY KEY,
      name VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await pool.query('TRUNCATE TABLE err_demo');
  await pool.query('INSERT INTO err_demo (id, name) VALUES (1, "Тест")');

  try {
    await pool.query('INSERT INTO err_demo (id, name) VALUES (1, "Дубль")');
  } catch (e) {
    console.log(`[${e.code}] Дублирование ключа: id=1`);
  }

  try {
    await pool.query('INSERT INTO err_demo (id, name) VALUES (2, NULL)');
  } catch (e) {
    console.log(`[${e.code}] NULL в NOT NULL столбце: name`);
  }

  await pool.end();
}

async function demoPoolErrorHandling() {
  console.log('\n=== Обработка ошибок пула ===');
  let pool = createAppPool();
  pool.emit('error', Object.assign(new Error('Connection lost'), { code: 'PROTOCOL_CONNECTION_LOST' }));
  pool.end();
  pool = createAppPool();
  console.log('✓ Пул пересоздан и готов к работе');
  pool.end();
}

async function demoStreaming() {
  console.log('\n=== Потоковый запрос ===');
  const pool = mysql.createPool({ ...baseConfig, connectionLimit: 5 });
  const totalRows = 100000;

  await pool.query('DROP TABLE IF EXISTS big_data');
  await pool.query(`
    CREATE TABLE big_data (
      id INT PRIMARY KEY AUTO_INCREMENT,
      payload VARCHAR(120) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  console.log(`Генерация ${totalRows} записей в big_data...`);
  const batchSize = 5000;
  for (let i = 0; i < totalRows; i += batchSize) {
    const values = [];
    for (let j = 0; j < batchSize; j++) {
      values.push([`ББМО-01-23-запись-${i + j + 1}`]);
    }
    await pool.query('INSERT INTO big_data (payload) VALUES ?', [values]);
  }

  const start = Date.now();
  let count = 0;
  let lastLoggedPct = 0;

  await new Promise((resolve, reject) => {
    const rawConn = mysqlCb.createConnection(baseConfig);
    const stream = rawConn.query('SELECT * FROM big_data').stream({ highWaterMark: 100 });

    stream.on('data', () => {
      count += 1;
      const pct = Math.floor((count / totalRows) * 100);
      if (pct >= lastLoggedPct + 10 && pct <= 100) {
        lastLoggedPct = pct;
        if (pct === 10 || pct === 50 || pct === 100) {
          console.log(`[STREAM] Получено: ${count} (${pct}%)`);
        }
      }
    });

    stream.on('end', () => {
      rawConn.end();
      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      const rssMb = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
      console.log(`✓ Обработано за ${elapsed} сек`);
      console.log(`Пик памяти (RSS): ${rssMb} МБ`);
      resolve();
    });

    stream.on('error', (err) => {
      rawConn.end();
      reject(err);
    });
  });

  console.log('Сравнение: SELECT целиком загружает весь набор строк в память сразу, а .stream() читает порциями по мере обработки.');

  await pool.end();
}

async function demoTransactions() {
  console.log('\n=== Транзакция (успех) ===');
  const pool = mysql.createPool({ ...baseConfig, connectionLimit: 5 });
  await pool.query('CREATE TABLE IF NOT EXISTS tx_demo (id INT PRIMARY KEY, title VARCHAR(50))');
  await pool.query('TRUNCATE TABLE tx_demo');

  let conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    console.log('Начало транзакции');
    await conn.query('INSERT INTO tx_demo (id, title) VALUES (?, ?)', [1, 'Запись 1']);
    console.log('✓ INSERT 1 выполнен');
    await conn.query('INSERT INTO tx_demo (id, title) VALUES (?, ?)', [2, 'Запись 2']);
    console.log('✓ INSERT 2 выполнен');
    await conn.commit();
    console.log('✓ Commit выполнен');
  } catch (err) {
    await conn.rollback();
    console.log('Rollback выполнен:', err.code);
  } finally {
    conn.release();
    console.log('Соединение возвращено в пул');
  }

  console.log('\n=== Транзакция (откат при ошибке) ===');
  conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    console.log('Начало транзакции');
    await conn.query('INSERT INTO tx_demo (id, title) VALUES (?, ?)', [3, 'Запись 3']);
    console.log('✓ INSERT 3 выполнен');
    await conn.query('INSERT INTO tx_demo (id, title) VALUES (?, ?)', [1, 'Дубликат ID 1']);
    await conn.commit();
  } catch (err) {
    console.log(`✗ INSERT не выполнен (${err.code})`);
    await conn.rollback();
    console.log('Rollback выполнен');
  } finally {
    conn.release();
    console.log('Соединение возвращено в пул');
  }

  await pool.end();
}

async function main() {
  await demoErrors();
  await demoPoolErrorHandling();
  await demoStreaming();
  await demoTransactions();
}

main();