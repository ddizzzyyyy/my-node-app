require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { connectDB } = require('./db');
const {
  groupHeaderMiddleware,
  dbMiddleware,
  loggerMiddleware,
  errorMiddleware
} = require('./middleware');
const usersRouter = require('./routes/users');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bbmo_01_23';
const MONGO_DB = process.env.MONGO_DB || 'bbmo_01_23';
const GROUP = 'ББМО-01-23';

async function start() {
  const app = new Koa();
  const db = await connectDB(MONGO_URI, MONGO_DB);

  app.use(groupHeaderMiddleware(GROUP));
  app.use(errorMiddleware());
  app.use(loggerMiddleware());
  app.use(bodyParser());
  app.use(dbMiddleware(db));

  app.use(usersRouter.routes());
  app.use(usersRouter.allowedMethods());

  app.listen(PORT, () => {
    console.log(`[INFO] Koa-сервер на порту ${PORT}`);
    console.log(`[INFO] Группа: ${GROUP}`);
  });
}

start().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});