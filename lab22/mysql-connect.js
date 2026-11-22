require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mysql = require('mysql2/promise');

const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'student',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bbmo_01_23'
};

function printError(err) {
  if (err.code === 'ECONNREFUSED') {
    console.error(`[ECONNREFUSED] Сервер MySQL недоступен: ${baseConfig.host}:${baseConfig.port}`);
  } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error(`[ER_ACCESS_DENIED_ERROR] Ошибка доступа для пользователя ${baseConfig.user}`);
  } else {
    console.error(`[${err.code || 'ERROR'}] ${err.message}`);
  }
}

async function runSingleConnection() {
  console.log('=== Одиночное соединение ===');
  let conn;
  try {
    conn = await mysql.createConnection(baseConfig);
    console.log('✓ Подключение установлено');

    const [[row]] = await conn.query(
      'SELECT VERSION() AS version, DATABASE() AS dbName, CURRENT_USER() AS currentUser'
    );
    console.log(`Версия MySQL: ${row.version}`);
    console.log(`Текущая БД: ${row.dbName}`);
    console.log(`Пользователь: ${row.currentUser}`);
  } catch (err) {
    printError(err);
  } finally {
    if (conn) {
      await conn.end();
      console.log('✓ Соединение закрыто');
    }
  }
}

async function runPoolConnection() {
  console.log('\n=== Пул соединений ===');
  const pool = mysql.createPool({
    ...baseConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log(`✓ Пул создан (лимит: ${pool.pool.config.connectionLimit})`);
    const [[row]] = await pool.query('SELECT VERSION() AS version, DATABASE() AS dbName');
    console.log(`Версия MySQL: ${row.version}`);
    console.log(`Текущая БД: ${row.dbName}`);
    console.log(`Соединений в пуле: ${pool.pool.config.connectionLimit}`);
    console.log('✓ Пул готов к работе');
  } catch (err) {
    printError(err);
  } finally {
    await pool.end();
  }
}

async function main() {
  await runSingleConnection();
  await runPoolConnection();
}

main();