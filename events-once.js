const EventEmitter = require('events');

const emitter = new EventEmitter();

console.log('=== Сравнение on и once ===');
let onCount = 0;
let onceCount = 0;

function onTickHandler() {
  onCount += 1;
  console.log(`[tick #${onCount}] on-слушатель`);
}

function onceTickHandler() {
  onceCount += 1;
  console.log(`[tick #${onceCount}] once-слушатель`);
}

emitter.on('tick', onTickHandler);
emitter.once('tick', onceTickHandler);

emitter.emit('tick');
emitter.emit('tick');
emitter.emit('tick');

console.log(`on-слушатель вызван: ${onCount} раза`);
console.log(`once-слушатель вызван: ${onceCount} раз`);

console.log('=== Управление подписками ===');
const subEmitter = new EventEmitter();
const l1 = () => {};
const l2 = () => {};
const l3 = () => {};

subEmitter.addListener('action', l1);
subEmitter.on('action', l2);
subEmitter.on('action', l3);

console.log('Слушателей до удаления:', subEmitter.listenerCount('action'));
console.log('Массив слушателей:', subEmitter.listeners('action').length);

subEmitter.removeListener('action', l2);
console.log('Слушателей после удаления одного:', subEmitter.listenerCount('action'));

subEmitter.removeAllListeners('action');
console.log('Слушателей после removeAllListeners:', subEmitter.listenerCount('action'));

console.log('=== Порядок вызова ===');
const orderEmitter = new EventEmitter();

orderEmitter.on('step', () => {
  console.log('1. Первый слушатель (группа ББМО-01-23)');
});
orderEmitter.on('step', () => {
  console.log('2. Второй слушатель');
});
orderEmitter.on('step', () => {
  console.log('3. Третий слушатель');
});

orderEmitter.emit('step');