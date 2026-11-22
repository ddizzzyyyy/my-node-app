require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://student:Student123!@localhost:27017/bbmo_01_23';
const dbName = process.env.MONGO_DB || 'bbmo_01_23';

async function main() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const students = db.collection('students');
    const groups = db.collection('groups');

    await students.drop().catch(() => {});
    await groups.drop().catch(() => {});

    await groups.insertMany([
      { group_name: 'ББМО-01-23', curator: 'Иванов И.И.' },
      { group_name: 'ББМО-02-23', curator: 'Смирнова А.В.' },
      { group_name: 'ББМО-03-23', curator: 'Петров П.П.' }
    ]);

    console.log('=== Подготовка 50 000 документов для тестов ===');
    const totalDocs = 50000;
    const batchSize = 5000;
    const names = ['Иван Иванов', 'Мария Смирнова', 'Петр Петров', 'Анна Иванова', 'Олег Сидоров'];
    const groupNames = ['ББМО-01-23', 'ББМО-02-23', 'ББМО-03-23'];

    for (let i = 0; i < totalDocs; i += batchSize) {
      const batch = [];
      for (let j = 0; j < batchSize; j++) {
        const idx = i + j;
        batch.push({
          name: `${names[idx % names.length]} #${idx}`,
          email: `student${idx}@example.edu`,
          group_name: groupNames[idx % groupNames.length],
          course: (idx % 4) + 1,
          grade: Number((2.5 + ((idx * 7) % 26) / 10).toFixed(2))
        });
      }
      await students.insertMany(batch);
    }

    console.log('\n=== Курсоры ===');
    const t0 = Date.now();
    let count = 0;
    const cursor = students.find({}).batchSize(1000);
    try {
      for await (const _doc of cursor) {
        count += 1;
      }
    } finally {
      await cursor.close();
    }
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
    const rssMb = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    console.log(`Итерация через for await: получено ${count} документов за ${elapsed} сек (RSS: ${rssMb} МБ)`);

    console.log('\nДемонстрация опасности toArray() на большом объёме:');
    try {
      const bigArr = await students.find({}).toArray();
      console.log(`toArray() загрузил ${bigArr.length} документов в память (RSS: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} МБ)`);
    } catch (err) {
      console.error(`Ошибка при toArray(): ${err.message}`);
    }

    console.log('\n=== Агрегации ===');
    const avgByGroup = await students.aggregate([
      { $group: { _id: '$group_name', avgGrade: { $avg: '$grade' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    console.log('Средний балл по группам:');
    avgByGroup.forEach((g) => console.log(`  ${g._id}: ${g.avgGrade.toFixed(2)} (всего: ${g.count})`));

    const countByCourse = await students.aggregate([
      { $group: { _id: '$course', total: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    console.log('\nКоличество студентов по курсам:');
    countByCourse.forEach((c) => console.log(`  ${c._id} курс: ${c.total}`));

    const top10 = await students.aggregate([
      { $sort: { grade: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: 1, group_name: 1, grade: 1 } }
    ]).toArray();
    console.log('\nТоп-5 по оценке:');
    top10.forEach((s) => console.log(`  ${s.name} (${s.group_name}): ${s.grade}`));

    console.log('\n--- $lookup (JOIN с groups) ---');
    const joined = await students.aggregate([
      { $match: { group_name: 'ББМО-01-23' } },
      { $group: { _id: '$group_name', studentsCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'groups',
          localField: '_id',
          foreignField: 'group_name',
          as: 'groupInfo'
        }
      },
      { $unwind: '$groupInfo' },
      {
        $project: {
          _id: 0,
          group_name: '$_id',
          students: '$studentsCount',
          curator: '$groupInfo.curator'
        }
      }
    ]).toArray();
    console.log(joined[0]);

    console.log('\n=== Индексы и explain() ===');
    const explainBefore = await students.find({ group_name: 'ББМО-01-23', grade: { $gte: 4.5 } }).explain('executionStats');
    console.log('explain() БЕЗ индекса:', {
      executionTimeMillis: explainBefore.executionStats.executionTimeMillis,
      totalDocsExamined: explainBefore.executionStats.totalDocsExamined
    });

    const idx1 = await students.createIndex({ group_name: 1 });
    const idx2 = await students.createIndex({ group_name: 1, grade: -1 });
    const idx3 = await students.createIndex({ email: 1 }, { unique: true });
    console.log('Созданы индексы:', idx1, idx2, idx3);

    const explainAfter = await students.find({ group_name: 'ББМО-01-23', grade: { $gte: 4.5 } }).explain('executionStats');
    console.log('explain() С индексом:', {
      executionTimeMillis: explainAfter.executionStats.executionTimeMillis,
      totalDocsExamined: explainAfter.executionStats.totalDocsExamined
    });

    console.log('\n=== Текстовый поиск ===');
    const textIdx = await students.createIndex({ name: 'text' });
    console.log('Создан текстовый индекс:', textIdx);

    const searchResults = await students
      .find({ $text: { $search: 'Иван' } }, { projection: { _id: 0, name: 1, score: { $meta: 'textScore' } } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(5)
      .toArray();
    console.log(`Найдено по запросу "Иван" (топ-5):`);
    searchResults.forEach((r) => console.log(`  score=${r.score.toFixed(2)}, name="${r.name}"`));
  } finally {
    await client.close();
  }
}

main();