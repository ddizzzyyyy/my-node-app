const User = require('../models/user');

class UserService {
  static log(msg) {
    const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
    console.log(`[${time}] [SERVICE] ${msg}`);
  }

  static async listUsers(db, queryOptions) {
    return User.findAll(db, queryOptions);
  }

  static async getUserById(db, id) {
    const user = await User.findById(db, id);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return user;
  }

  static async createUser(db, payload) {
    this.log(`Создание пользователя: ${payload.email}`);
    this.log('Проверка уникальности email');

    const existing = await User.findByEmail(db, payload.email);
    if (existing) {
      this.log('Email уже существует');
      const err = new Error('Email already exists');
      err.status = 409;
      throw err;
    }

    const created = await User.create(db, payload);
    this.log(`Email отправлен: ${created.email}`);
    return created;
  }

  static async updateUser(db, id, payload) {
    this.log(`Обновление пользователя ID=${id}`);
    if (payload.email) {
      const existing = await User.findByEmail(db, payload.email);
      if (existing && String(existing._id) !== String(id)) {
        const err = new Error('Email already exists');
        err.status = 409;
        throw err;
      }
    }

    const updated = await User.update(db, id, payload);
    if (!updated) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return updated;
  }

  static async deleteUser(db, id) {
    this.log(`Удаление пользователя ID=${id}`);
    const deleted = await User.delete(db, id);
    if (!deleted) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return { deleted: true, id };
  }

  static async searchUsers(db, q) {
    this.log(`Поиск пользователей по запросу: "${q}"`);
    return User.searchByText(db, q);
  }

  static async getStats(db) {
    return User.getStats(db);
  }

  static async exportCsv(db) {
    const users = await User.collection(db).find({}).toArray();
    const header = ['_id', 'name', 'email', 'group_name', 'age', 'course', 'created_at'];
    const escape = (val) => {
      const s = val === undefined || val === null ? '' : String(val);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const rows = users.map((u) =>
      [u._id, u.name, u.email, u.group_name, u.age, u.course, u.created_at ? new Date(u.created_at).toISOString() : '']
        .map(escape)
        .join(',')
    );
    return [header.join(','), ...rows].join('\n');
  }
}

module.exports = UserService;