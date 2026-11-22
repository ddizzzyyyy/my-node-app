require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://student:Student123!@localhost:27017/bbmo_01_23';
const dbName = process.env.MONGO_DB || 'bbmo_01_23';
const GROUP = 'ББМО-01-23';

async function main() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const students = db.collection('students');

    await students.deleteMany({});
    await students.createIndex({ group_name: 1 });

    console.log('=== Коллекция students (группа ББМО-01-23) ===');

    console.log('\n--- INSERT ---');
    const oneRes = await students.insertOne({
      name: 'Иван Иванов',
      group_name: GROUP,
      course: 2,
      grade: 4.5,
      tags: ['староста'],
      created_at: new Date()
    });
    console.log(`✓ Вставлен: insertedId=${oneRes.insertedId}`);

    const manyRes = await students.insertMany([
      { name: 'Мария Смирнова', group_name: GROUP, course: 2, grade: 3.8, created_at: new Date() },
      { name: 'Петр Петров', group_name: GROUP, course: 2, grade: 4.2, created_at: new Date() },
      { name: 'Алексей Орлов', group_name: GROUP, course: 1, grade: 2.6, created_at: new Date() },
      { name: 'Анна Соколова', group_name: 'ББМО-02-23', course: 2, grade: 4.7, created_at: new Date() }
    ]);
    console.log(`✓ Вставлено ${manyRes.insertedCount} документа: insertedIds=${JSON.stringify(manyRes.insertedIds)}`);

    console.log('\n--- SELECT (find) ---');
    const allDocs = await students.find({}).toArray();
    console.log(`Все документы (${allDocs.length}):`);
    allDocs.forEach((d) => console.log({ _id: d._id, name: d.name, group_name: d.group_name, grade: d.grade }));

    const filteredDocs = await students.find({ group_name: GROUP }).toArray();
    console.log(`\nС фильтром по группе ${GROUP} (${filteredDocs.length}):`);
    filteredDocs.forEach((d) => console.log({ name: d.name, group_name: d.group_name, grade: d.grade }));

    const sortedPagedDocs = await students
      .find({})
      .sort({ grade: -1 })
      .skip(0)
      .limit(3)
      .toArray();
    console.log('\nС сортировкой (grade desc) и пагинацией (skip 0, limit 3):');
    sortedPagedDocs.forEach((d) => console.log({ name: d.name, grade: d.grade }));

    console.log('\n--- Проекция ---');
    const projectedDocs = await students
      .find({}, { projection: { name: 1, grade: 1, _id: 0 } })
      .toArray();
    console.log('С проекцией (только name, grade):');
    projectedDocs.forEach((d) => console.log(d));

    console.log('\n--- UPDATE ---');
    const updOne = await students.updateOne(
      { _id: oneRes.insertedId },
      {
        $set: { grade: 4.8 },
        $inc: { course: 1 },
        $push: { tags: 'отличник' }
      }
    );
    console.log(`✓ updateOne: matchedCount=${updOne.matchedCount}, modifiedCount=${updOne.modifiedCount}`);

    const updMany = await students.updateMany(
      { group_name: GROUP },
      { $inc: { course: 1 } }
    );
    console.log(`✓ updateMany (group=${GROUP}, $inc course+1): matchedCount=${updMany.matchedCount}, modifiedCount=${updMany.modifiedCount}`);

    await students.updateOne({ _id: oneRes.insertedId }, { $unset: { tags: '' } });

    console.log('\n--- DELETE ---');
    const delOne = await students.deleteOne({ _id: oneRes.insertedId });
    console.log(`✓ deleteOne: deletedCount=${delOne.deletedCount}`);

    const delMany = await students.deleteMany({ grade: { $lt: 3.0 } });
    console.log(`✓ deleteMany (grade < 3): deletedCount=${delMany.deletedCount}`);
  } finally {
    await client.close();
  }
}

main();