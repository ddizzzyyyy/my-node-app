const http = require('http');

const PORT = 3000;
const GROUP = '477';
const STUDENT_NAME = 'Поздняков Савелий Олегович'; 

function formatDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function logRequest(method, url, statusCode) {
  console.log(`[${formatDate()}] ${method} ${url} ${statusCode}`);
}

const server = http.createServer((req, res) => {
  const method = req.method;
  const url = req.url;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (method === 'GET' && url === '/') {
    res.statusCode = 200;
    logRequest(method, url, res.statusCode);
    res.end(`
      <h1>=== Лабораторная работа №20 ===</h1>
      <p>Группа: ${GROUP}</p>
      <p>Метод: ${method}</p>
      <p>URL: ${url}</p>
    `);
    return;
  }

  if (method === 'GET' && url === '/about') {
    res.statusCode = 200;
    logRequest(method, url, res.statusCode);
    res.end(`
      <h1>=== О студенте ===</h1>
      <p>Группа: ${GROUP}</p>
      <p>Студент: ${STUDENT_NAME}</p>
    `);
    return;
  }

  res.statusCode = 404;
  logRequest(method, url, res.statusCode);
  res.end(`
    <h1>=== 404 Not Found ===</h1>
    <p>Путь ${url} не найден</p>
  `);
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});