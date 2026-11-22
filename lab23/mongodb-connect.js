require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://student:Student123!@localhost:27017/bbmo_01_23';
const dbName = process.env.MONGO_DB || 'bbmo_01_23';

function extractUser(mongoUri) {
  const match = mongoUri.match(/mongodb:\/\/([^:]+):[^@]*@/);
  return match ? match[1] : 'anonymous';
}

async function main() {
  console.log('=== Подключение к MongoDB ===');
  const client = new MongoClient(uri, {
    monitorCommands: false,
    serverSelectionTimeoutMS: 3000
  });

  let heartbeatTimer;

  client.on('serverHeartbeatSucceeded', (event) => {
    console.log(`[HEARTBEAT] Успешно: ${new Date().toISOString()} (${event.duration} мс)`);
  });

  client.on('serverHeartbeatFailed', (event) => {
    console.error(`[HEARTBEAT] Ошибка: ${new Date().toISOString()} — ${event.failure?.message || event.failure}`);
  });

  try {
    await client.connect();
    console.log('✓ Подключение установлено');

    const db = client.db(dbName);
    await db.command({ ping: 1 });

    const buildInfo = await db.admin().command({ buildInfo: 1 });
    console.log(`Версия MongoDB: ${buildInfo.version}`);
    console.log(`База данных: ${dbName}`);
    console.log(`Пользователь: ${extractUser(uri)}`);

    console.log('\n=== Информация о сервере ===');
    const dbs = await db.admin().listDatabases();
    console.log('Список БД:');
    dbs.databases.forEach((d) => console.log(`  - ${d.name}`));

    const cols = await db.listCollections().toArray();
    console.log(`Коллекции в ${dbName}:`);
    if (cols.length === 0) {
      console.log('  (пусто — БД создаётся лениво при первой записи)');
    } else {
      cols.forEach((c) => console.log(`  - ${c.name}`));
    }

    console.log('\n=== Heartbeat ===');
    await new Promise((resolve) => {
      let ticks = 0;
      heartbeatTimer = setInterval(async () => {
        ticks += 1;
        try {
          await db.command({ ping: 1 });
          if (ticks >= 2) {
            clearInterval(heartbeatTimer);
            resolve();
          }
        } catch (err) {
          console.error('[HEARTBEAT] Сбой проверки:', err.message);
        }
      }, 2000);
    });

    console.log('✓ Соединение стабильно');
  } catch (err) {
    console.error('✗ Ошибка подключения:', err.message);
  } finally {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    await client.close();
    console.log('✓ Соединение закрыто');
  }
}

main();