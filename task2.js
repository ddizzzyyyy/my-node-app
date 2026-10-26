const os = require('os');

console.log("=== Информация о процессоре ===");
const cpus = os.cpus();
console.log(`Количество логических ядер: ${cpus.length}`);
console.log(`Модель процессора: ${cpus[0].model}`);


const totalFreq = cpus.reduce((acc, cpu) => acc + cpu.speed, 0);
const avgFreq = Math.round(totalFreq / cpus.length);
console.log(`Средняя частота: ${avgFreq} МГц`);

console.log("\n=== Информация о памяти ===");
const totalMemoryBytes = os.totalmem();
const freeMemoryBytes = os.freemem();

const totalGB = (totalMemoryBytes / (1024 ** 3)).toFixed(2);
const freeGB = (freeMemoryBytes / (1024 ** 3)).toFixed(2);
const usedGB = ((totalMemoryBytes - freeMemoryBytes) / (1024 ** 3)).toFixed(2);
const usedPercent = ((totalMemoryBytes - freeMemoryBytes) / totalMemoryBytes * 100).toFixed(1);

console.log(`Общий объём: ${totalGB} ГБ`);
console.log(`Свободно: ${freeGB} ГБ`);
console.log(`Использовано: ${usedGB} ГБ (${usedPercent}%)`);


const freePercent = (freeMemoryBytes / totalMemoryBytes) * 100;
if (freePercent < 20) {
    console.log("Предупреждение: Мало свободного места в памяти!");
}

console.log("Группа: 477");
console.log(freePercent < 20 ? "Память перегружена" : "Память в норме");

console.log("\n=== Средняя загрузка системы ===");
const loadAvg = os.loadavg(); // [1 min, 5 min, 15 min]
if (os.platform() === 'win32') {
    console.log("Средняя загрузка системы (loadavg): Недоступно для Windows");
} else {
    console.log(`За 1 мин: ${loadAvg[0]}, За 5 мин: ${loadAvg[1]}, За 15 мин: ${loadAvg[2]}`);
}