const fs = require('fs');
const path = require('path');

class HybridFileManager {
  constructor(baseDir = './hybrid-data') {
    this.baseDir = baseDir;
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
  }

  createFile(filename, content, callback) {
    const filePath = path.join(this.baseDir, filename);

    if (typeof callback === 'function') {
      fs.writeFile(filePath, content, 'utf8', (err) => {
        if (err) return callback(err);
        callback(null, filePath);
      });
      return;
    }

    return fs.promises.writeFile(filePath, content, 'utf8')
      .then(() => filePath);
  }

  readFile(filename, callback) {
    const filePath = path.join(this.baseDir, filename);

    if (typeof callback === 'function') {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return callback(err);
        callback(null, data);
      });
      return;
    }

    return fs.promises.readFile(filePath, 'utf8');
  }

  deleteFile(filename, callback) {
    const filePath = path.join(this.baseDir, filename);

    if (typeof callback === 'function') {
      fs.unlink(filePath, (err) => {
        if (err) return callback(err);
        callback(null);
      });
      return;
    }

    return fs.promises.unlink(filePath);
  }
}

module.exports = HybridFileManager;