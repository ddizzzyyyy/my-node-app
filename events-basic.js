const EventEmitter = require('events');

const emitter = new EventEmitter();

emitter.on('greet', (name) => {
  console.log(`[greet] Привет, ${name}!`);
});

emitter.on('info', () => {
  console.log('[info] Группа: 477');
});

emitter.on('bye', () => {
  console.log('[bye] До свидания!');
});

console.log('=== Демонстрация EventEmitter ===');
emitter.emit('greet', 'Иван');
emitter.emit('info');
emitter.emit('bye');

const hasUnknown = emitter.emit('unknown');
const hasGreet = emitter.emit('greet', 'Иван');

console.log(`Событие "unknown" без слушателей: ${hasUnknown}`);
console.log(`Событие "greet" со слушателями: ${hasGreet}`);