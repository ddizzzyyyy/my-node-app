const { ObjectId } = require('mongodb');

class User {
  static collection(db) {
    return db.collection('users');
  }

  static buildFilter(options = {}) {
    const filter = {};
    if (options.group_name) filter.group_name = options.group_name;
    if (options.course !== undefined) filter.course = Number(options.course);

    if (options.age_min !== undefined || options.age_max !== undefined) {
      filter.age = {};
      if (options.age_min !== undefined) filter.age.$gte = Number(options.age_min);
      if (options.age_max !== undefined) filter.age.$lte = Number(options.age_max);
    }

    if (options.search) {
      const q = String(options.search).trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }
    return filter;
  }

  static buildSort(sortParam = '-created_at') {
    const desc = sortParam.startsWith('-');
    const field = desc ? sortParam.slice(1) : sortParam;
    return { [field]: desc ? -1 : 1 };
  }

  static async findAll(db, options = {}) {
    const page = Number(options.page) || 1;
    const limit = Math.min(Number(options.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const filter = this.buildFilter(options);
    const sort = this.buildSort(options.sort);

    const col = this.collection(db);
    const [data, total] = await Promise.all([
      col.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      col.countDocuments(filter)
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.max(1, Math.ceil(total / limit))
      }
    };
  }

  static async findById(db, id) {
    if (!ObjectId.isValid(id)) {
      const err = new Error('Invalid user ID');
      err.status = 400;
      throw err;
    }
    return this.collection(db).findOne({ _id: new ObjectId(id) });
  }

  static async findByEmail(db, email) {
    return this.collection(db).findOne({ email: email.toLowerCase() });
  }

  static async create(db, data) {
    console.log('[MODEL] insertOne');
    const doc = {
      name: data.name,
      email: data.email.toLowerCase(),
      group_name: data.group_name,
      age: Number(data.age),
      course: Number(data.course ?? 1),
      created_at: new Date()
    };
    const res = await this.collection(db).insertOne(doc);
    return { _id: res.insertedId, ...doc };
  }

  static async update(db, id, data) {
    if (!ObjectId.isValid(id)) {
      const err = new Error('Invalid user ID');
      err.status = 400;
      throw err;
    }
    const updateDoc = { ...data };
    if (updateDoc.email) updateDoc.email = updateDoc.email.toLowerCase();

    const res = await this.collection(db).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );
    return res;
  }

  static async delete(db, id) {
    if (!ObjectId.isValid(id)) {
      const err = new Error('Invalid user ID');
      err.status = 400;
      throw err;
    }
    const res = await this.collection(db).deleteOne({ _id: new ObjectId(id) });
    return res.deletedCount > 0;
  }

  static async searchByText(db, queryText) {
    const col = this.collection(db);
    try {
      return await col
        .find(
          { $text: { $search: queryText } },
          { projection: { name: 1, email: 1, group_name: 1, age: 1, score: { $meta: 'textScore' } } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .toArray();
    } catch {
      const regex = new RegExp(queryText, 'i');
      return col
        .find({ $or: [{ name: regex }, { email: regex }] })
        .project({ name: 1, email: 1, group_name: 1, age: 1 })
        .toArray();
    }
  }

  static async getStats(db) {
    const col = this.collection(db);
    const [summary] = await col
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            averageAge: { $avg: '$age' }
          }
        }
      ])
      .toArray();

    const byGroupArr = await col
      .aggregate([{ $group: { _id: '$group_name', count: { $sum: 1 } } }])
      .toArray();

    const byCourseArr = await col
      .aggregate([{ $group: { _id: '$course', count: { $sum: 1 } } }])
      .toArray();

    const byGroup = {};
    for (const item of byGroupArr) byGroup[item._id || 'unknown'] = item.count;

    const byCourse = {};
    for (const item of byCourseArr) byCourse[String(item._id ?? 'unknown')] = item.count;

    return {
      total: summary ? summary.total : 0,
      averageAge: summary && summary.averageAge ? Number(summary.averageAge.toFixed(2)) : 0,
      byGroup,
      byCourse
    };
  }
}

module.exports = User;