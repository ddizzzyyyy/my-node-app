const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

router.get('/', (ctx) => {
  ctx.type = 'text/html; charset=utf-8';
  ctx.body = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>Лабораторная работа №15</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        .card { border: 1px solid #ccc; padding: 15px; border-radius: 8px; max-width: 400px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Лабораторная работа №15</h1>
        <p><b>Группа:</b> 477</p>
        <p><b>Текущая дата и время:</b> ${new Date().toLocaleString('ru-RU')}</p>
        <p>Добро пожаловать на сервер Koa.js!</p>
      </div>
    </body>
    </html>
  `;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log('Задание 1: Сервер запущен на http://localhost:3000');
});