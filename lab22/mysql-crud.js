require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mysql = require('mysql2/promise');

const GROUP = 'ББМО-01-23';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'student',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bbmo_01_23',
  waitForConnections: true,
  connectionLimit: 10
});

async function main() {
  try {
    console.log('=== Создание таблицы ===');
    await pool.query('DROP TABLE IF EXISTS students');
    await pool.query(`
      CREATE TABLE students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        group_name VARCHAR(20) NOT NULL,
        course INT NOT NULL,
        grade DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Таблица students создана');

    console.log('\n=== INSERT ===');
    const [singleRes] = await pool.query(
      'INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)',
      ['Иван', GROUP, 2, 4.50]
    );
    console.log(`✓ Вставлен студент: id=${singleRes.insertId}, affectedRows=${singleRes.affectedRows}`);

    const [multiRes] = await pool.query(
      'INSERT INTO students (name, group_name, course, grade) VALUES ?',
      [[
        ['Мария', GROUP, 2, 3.80],
        ['Петр', GROUP, 2, 4.20],
        ['Анна', 'ББМО-02-23', 2, 4.70]
      ]]
    );
    console.log(`✓ Вставлено ${multiRes.affectedRows} студента/ов: affectedRows=${multiRes.affectedRows}`);

    console.log('\n=== SELECT ===');
    const [allRows] = await pool.query('SELECT * FROM students');
    console.log('Все студенты:');
    allRows.forEach((s) => {
      console.log(`id=${s.id}, name=${s.name}, group=${s.group_name}, grade=${s.grade}`);
    });

    const [filteredRows] = await pool.query(
      'SELECT * FROM students WHERE group_name = ? ORDER BY grade DESC',
      [GROUP]
    );
    console.log(`\nСтуденты группы ${GROUP} (сортировка по grade):`);
    filteredRows.forEach((s) => {
      console.log(`id=${s.id}, name=${s.name}, grade=${s.grade}`);
    });

    const [pagedRows] = await pool.query(
      'SELECT * FROM students LIMIT ? OFFSET ?',
      [2, 0]
    );
    console.log(`\nПагинация (LIMIT 2 OFFSET 0): получено ${pagedRows.length} записи/ей`);

    console.log('\n=== UPDATE ===');
    const [upd1] = await pool.query(
      'UPDATE students SET grade = ? WHERE id = ?',
      [4.80, singleRes.insertId]
    );
    console.log(`✓ Обновлён студент id=${singleRes.insertId}: affectedRows=${upd1.affectedRows}, changedRows=${upd1.changedRows}`);

    const [upd2] = await pool.query(
      'UPDATE students SET grade = ? WHERE id = ?',
      [4.80, singleRes.insertId]
    );
    console.log(`✓ Повторное обновление: affectedRows=${upd2.affectedRows}, changedRows=${upd2.changedRows}`);

    console.log('\n=== DELETE ===');
    const [delOne] = await pool.query(
      'DELETE FROM students WHERE id = ?',
      [singleRes.insertId]
    );
    console.log(`✓ Удалён студент id=${singleRes.insertId}: affectedRows=${delOne.affectedRows}`);

    console.log('\n=== Защита от SQL инъекции ===');
    const payload = "'; DROP TABLE students; --";
    console.log(`Попытка инъекции: ${payload}`);
    await pool.query('SELECT * FROM students WHERE name = ?', [payload]);
    const [[checkTable]] = await pool.query('SELECT COUNT(*) AS cnt FROM students');
    console.log(`✓ Параметризованный запрос безопасен (записей в таблице: ${checkTable.cnt})`);
    console.log('✓ Конкатенация привела бы к удалению таблицы');
  } catch (err) {
    console.error('Ошибка:', err.code, err.message);
  } finally {
    await pool.end();
  }
}

main();