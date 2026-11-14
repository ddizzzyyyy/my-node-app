const fs = require('fs');
function setupLogger(app) {
  app.on('server:started', (port) => {
    let time = new Date().toISOString();
    fs.appendFileSync('logs.txt', '[' + time + '] SERVER_STARTED: ' + port + '\n');
  });
  app.on('request:received', (url, method) => {
    let time = new Date().toISOString();
    fs.appendFileSync('logs.txt', '[' + time + '] REQUEST_RECEIVED: ' + method + ' ' + url + '\n');
  });
  app.on('server:stopped', () => {
    let time = new Date().toISOString();
    fs.appendFileSync('logs.txt', '[' + time + '] SERVER_STOPPED: stop\n');
  });
}
module.exports = { setupLogger };