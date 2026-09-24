const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  const time = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${time}] ${ctx.method} ${ctx.url} ${ms}ms`);
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message || 'Внутренняя ошибка сервера',
      status: ctx.status
    };
  }
});

const checkAuth = async (ctx, next) => {
  const authHeader = ctx.headers['authorization'];
  if (!authHeader) {
    ctx.throw(401, 'Заголовок Authorization отсутствует');
  }
  await next();
};

router.get('/protected', checkAuth, (ctx) => {
  ctx.body = { message: 'Доступ разрешен!' };
});

router.get('/error', (ctx) => {
  throw new Error('Тестовая ошибка сервера');
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log('Задание 3: Сервер запущен на http://localhost:3000');
});