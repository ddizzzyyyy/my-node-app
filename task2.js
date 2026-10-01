const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
let users = require('./users');

const app = new Koa();
const router = new Router();
let nextId = users.length + 1;

app.use(bodyParser());

router.get('/api/users', (ctx) => {
  ctx.body = users;
});

router.post('/api/users', (ctx) => {
  const { name, group } = ctx.request.body;
  if (!name || !group) {
    ctx.status = 400;
    ctx.body = { error: 'Необходимо передать name и group' };
    return;
  }
  const newUser = { id: nextId++, name, group };
  users.push(newUser);
  ctx.status = 201;
  ctx.body = newUser;
});

router.put('/api/users/:id', (ctx) => {
  const id = Number(ctx.params.id);
  const user = users.find(u => u.id === id);
  if (!user) {
    ctx.status = 404;
    ctx.body = { error: 'Пользователь не найден' };
    return;
  }
  const { name, group } = ctx.request.body;
  if (!name && !group) {
    ctx.status = 400;
    ctx.body = { error: 'Заполните поля для обновления' };
    return;
  }
  if (name) user.name = name;
  if (group) user.group = group;
  ctx.body = user;
});

router.delete('/api/users/:id', (ctx) => {
  const id = Number(ctx.params.id);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { error: 'Пользователь не найден' };
    return;
  }
  users.splice(index, 1);
  ctx.body = { message: 'Пользователь успешно удален' };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log('Задание 2: Сервер запущен на http://localhost:3000');
});