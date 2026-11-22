const fs = require('fs');
const path = require('path');
const { Transform, pipeline } = require('stream');

const dir = __dirname;
const inputFile = path.join(dir, 'input.txt');
const missingFile = path.join(dir, 'missing.txt');
const pipeOutFile = path.join(dir, 'output-pipe.txt');
const pipelineOutFile = path.join(dir, 'output-pipeline.txt');
const chainOutFile = path.join(dir, 'output-chain.txt');

fs.writeFileSync(inputFile, 'Группа: ББМО-01-23\nПотоки Node.js pipe и pipeline\n', 'utf8');

function demoPipeSuccess() {
  return new Promise((resolve) => {
    console.log('\n=== Демонстрация pipe() ===');
    console.log('Чтение: input.txt');
    console.log('Запись: output-pipe.txt');

    const readStream = fs.createReadStream(inputFile);
    const writeStream = fs.createWriteStream(pipeOutFile);

    readStream.pipe(writeStream);

    writeStream.on('finish', () => {
      const size = fs.statSync(pipeOutFile).size;
      console.log('✓ Копирование завершено');
      console.log(`Размер: ${size} байт`);
      resolve();
    });
  });
}

function demoPipeError() {
  return new Promise((resolve) => {
    console.log('\n=== Демонстрация pipe() с ошибкой ===');
    console.log('Чтение: missing.txt');

    const readStream = fs.createReadStream(missingFile);
    const writeStream = fs.createWriteStream(path.join(dir, 'output-pipe-err.txt'));

    readStream.pipe(writeStream);

    readStream.on('error', (err) => {
      console.log(`✗ Ошибка: ${err.message}`);
      console.log('⚠ Внимание: pipe() не закрыл целевой поток!');
      console.log(`Состояние writeStream.closed: ${writeStream.closed}`);
      writeStream.destroy();
      resolve();
    });
  });
}

function demoPipelineSuccess() {
  return new Promise((resolve) => {
    console.log('\n=== Демонстрация pipeline() ===');
    console.log('Чтение: input.txt');
    console.log('Запись: output-pipeline.txt');

    pipeline(
      fs.createReadStream(inputFile),
      fs.createWriteStream(pipelineOutFile),
      (err) => {
        if (err) {
          console.error('Ошибка pipeline:', err.message);
        } else {
          console.log('✓ Копирование завершено');
        }
        resolve();
      }
    );
  });
}

function demoPipelineError() {
  return new Promise((resolve) => {
    console.log('\n=== Демонстрация pipeline() с ошибкой ===');
    console.log('Чтение: missing.txt');

    const writeStream = fs.createWriteStream(path.join(dir, 'output-pipeline-err.txt'));

    pipeline(
      fs.createReadStream(missingFile),
      writeStream,
      (err) => {
        console.log(`✗ Ошибка: ${err.message}`);
        console.log('✓ Все потоки автоматически закрыты');
        console.log(`Состояние writeStream.closed: ${writeStream.closed}`);
        resolve();
      }
    );
  });
}

function demoChain() {
  return new Promise((resolve) => {
    console.log('\n=== Цепочка потоков ===');
    console.log('input.txt -> uppercase -> reverse -> output-chain.txt');

    const upperCase = new Transform({
      transform(chunk, encoding, cb) {
        cb(null, chunk.toString('utf8').toUpperCase());
      }
    });

    const reverse = new Transform({
      transform(chunk, encoding, cb) {
        const text = chunk.toString('utf8').trimEnd();
        cb(null, text.split('').reverse().join('') + '\n');
      }
    });

    pipeline(
      fs.createReadStream(inputFile),
      upperCase,
      reverse,
      fs.createWriteStream(chainOutFile),
      (err) => {
        if (err) {
          console.error('Ошибка цепочки:', err.message);
        } else {
          console.log('✓ Обработка завершена');
        }
        resolve();
      }
    );
  });
}

(async () => {
  await demoPipeSuccess();
  await demoPipeError();
  await demoPipelineSuccess();
  await demoPipelineError();
  await demoChain();
})();