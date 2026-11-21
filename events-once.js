const EventEmitter = require('events');

const emitter = new EventEmitter();


console.log('=== Сравнение on и once ===');

let onCount = 0;
let onceCount = 0;

function onTick() {
  onCount++;
  console.log(`[tick #${onCount}] on-слушатель`);
}

function onceTick() {
  onceCount++;
  console.log(`[tick #${onceCount}] once-слушатель`);
}

emitter.on('tick', onTick);
emitter.once('tick', onceTick);

emitter.emit('tick');
emitter.emit('tick');
emitter.emit('tick');

console.log(`on-слушатель вызван: ${onCount} раз`);
console.log(`once-слушатель вызван: ${onceCount} раз`);


console.log('\n=== Управление подписками ===');

const s1 = () => {};
const s2 = () => {};
const s3 = () => {};

emitter.on('work', s1);
emitter.addListener('work', s2);
emitter.on('work', s3);

console.log(`Слушателей до удаления: ${emitter.listenerCount('work')}`);
console.log('Массив слушателей:', emitter.listeners('work').length);

emitter.removeListener('work', s2);
console.log(`Слушателей после удаления одного: ${emitter.listenerCount('work')}`);

emitter.removeAllListeners('work');
console.log(`Слушателей после removeAllListeners: ${emitter.listenerCount('work')}`);


console.log('\n=== Порядок вызова ===');

emitter.on('order', () => {
  console.log('1. Первый слушатель (группа 477)');
});
emitter.on('order', () => {
  console.log('2. Второй слушатель');
});
emitter.on('order', () => {
  console.log('3. Третий слушатель');
});

emitter.emit('order');