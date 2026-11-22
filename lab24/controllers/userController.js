const UserService = require('../services/userService');

class UserController {
  static async index(ctx) {
    const result = await UserService.listUsers(ctx.db, ctx.validatedQuery || ctx.query);
    ctx.status = 200;
    ctx.body = {
      data: result.data,
      pagination: result.pagination
    };
  }

  static async show(ctx) {
    const user = await UserService.getUserById(ctx.db, ctx.params.id);
    ctx.status = 200;
    ctx.body = { data: user };
  }

  static async create(ctx) {
    const user = await UserService.createUser(ctx.db, ctx.validatedBody || ctx.request.body);
    ctx.status = 201;
    ctx.body = { data: user };
  }

  static async update(ctx) {
    const user = await UserService.updateUser(ctx.db, ctx.params.id, ctx.validatedBody || ctx.request.body);
    ctx.status = 200;
    ctx.body = { data: user };
  }

  static async destroy(ctx) {
    const res = await UserService.deleteUser(ctx.db, ctx.params.id);
    ctx.status = 200;
    ctx.body = { data: res };
  }

  static async search(ctx) {
    const q = (ctx.query.q || ctx.query.search || '').trim();
    if (!q) {
      ctx.status = 400;
      ctx.body = { error: 'Query parameter "q" is required', status: 400 };
      return;
    }
    const data = await UserService.searchUsers(ctx.db, q);
    ctx.status = 200;
    ctx.body = { found: data.length, data };
  }

  static async stats(ctx) {
    const data = await UserService.getStats(ctx.db);
    ctx.status = 200;
    ctx.body = data;
  }

  static async exportCsv(ctx) {
    const csv = await UserService.exportCsv(ctx.db);
    ctx.set('Content-Type', 'text/csv; charset=utf-8');
    ctx.set('Content-Disposition', 'attachment; filename="users.csv"');
    ctx.status = 200;
    ctx.body = csv;
  }
}

module.exports = UserController;