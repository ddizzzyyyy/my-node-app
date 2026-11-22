const http = require('http');

const PORT = 3000;
const GROUP = '477';

const server = http.createServer((req, res) => {
  res.setHeader('X-Powered-By', 'Node.js');
  res.setHeader('X-Group', GROUP);
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'GET' && req.url === '/headers') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 200;
    res.end(JSON.stringify({
      headers: req.headers,
      method: req.method,
      url: req.url,
      httpVersion: req.httpVersion
    }, null, 2));
    return;
  }

  if (req.method === 'GET' && req.url === '/headers/set') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Temp-Header', 'to-be-removed');
    res.removeHeader('X-Temp-Header');

    res.statusCode = 200;
    res.end(`
      <h1>Заголовки установлены</h1>
      <p>X-Group: ${res.getHeader('X-Group')}</p>
      <p>Cache-Control: ${res.getHeader('Cache-Control')}</p>
    `);
    return;
  }

  if (req.method === 'GET' && req.url === '/headers/check') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 200;
    res.end(JSON.stringify({
      hasContentType: res.hasHeader('Content-Type'),
      hasXGroup: res.hasHeader('X-Group'),
      hasUnknown: res.hasHeader('X-Unknown-Header')
    }, null, 2));
    return;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.statusCode = 404;
  res.end('<h1>404 Not Found</h1>');
});

server.listen(PORT, () => {
  console.log(`Headers server запущен на порту ${PORT}`);
});