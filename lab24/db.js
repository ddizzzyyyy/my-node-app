const { MongoClient } = require('mongodb');

let client;
let db;

async function connectDB(uri, dbName) {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  const users = db.collection('users');
  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ name: 'text', email: 'text' }, { default_language: 'none' }).catch(() => {});

  console.log('[INFO] MongoDB подключена');
  return db;
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = { connectDB, closeDB };