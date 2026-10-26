const os = require('os');

console.log("=== Сетевые интерфейсы ===");
const interfaces = os.networkInterfaces();
let interfaceCount = 0;
let mainInterfaceInfo = null;

for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
        interfaceCount++;
        if (net.family === 'IPv4' && !net.internal) {
            if (!mainInterfaceInfo) {
                mainInterfaceInfo = { name, address: net.address };
            }
        }
        
        let maskedMac = net.mac;
        if (net.mac && net.mac !== '00:00:00:00:00:00') {
            const parts = net.mac.split(':');
            if (parts.length >= 3) {
                maskedMac = `${parts[0]}:${parts[1]}:${parts[2]}:**-**-**`;
            }
        }

        console.log(`Интерфейс: ${name}`);
        console.log(`  IPv4/IPv6: ${net.address} (${net.family})`);
        console.log(`  MAC: ${maskedMac}`);
        console.log(`  Внутренний: ${net.internal ? 'да' : 'нет'}`);
    }
}

console.log(`Всего интерфейсов (записей): ${interfaceCount}`);
if (mainInterfaceInfo) {
    console.log(`Основной интерфейс: ${mainInterfaceInfo.name} (${mainInterfaceInfo.address})`);
} else {
    console.log("Основной интерфейс: не найден (возможно, только localhost)");
}

console.log("\n=== Информация о пользователе ===");
const userInfo = os.userInfo();
console.log(`Имя пользователя: ${userInfo.username}`);
console.log(`UID: ${userInfo.uid}`);
console.log(`GID: ${userInfo.gid}`);
console.log(`Домашняя директория: ${userInfo.homedir}`);
console.log(`Оболочка по умолчанию: ${userInfo.shell}`);
console.log("Группа: 477");

const isRoot = userInfo.uid === 0;
console.log(`Проверка root: ${isRoot ? 'да (Внимание!)' : 'нет'}`);