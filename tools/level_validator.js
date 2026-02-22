const fs = require('fs');
const path = require('path');

const levelsPath = path.join(__dirname, '../js/levels.js');
let code = fs.readFileSync(levelsPath, 'utf8');

const wrapper = `
${code}
const lm = new LevelManager();
const levels = [];
for (let i = 0; i < 9; i++) {
    lm.currentLevelIndex = i;
    levels.push(lm.getCurrentLevelData());
}
module.exports = levels;
`;

const tempPath = path.join(__dirname, 'temp_eval.js');
fs.writeFileSync(tempPath, wrapper);
const levels = require('./temp_eval.js');
fs.unlinkSync(tempPath);

let hasErrors = false;
let log = [];
let fixesMade = 0;

levels.forEach((lvl, idx) => {
    const levelNum = idx + 1;
    const map = lvl.map;
    const h = map.length;
    const w = map[0].length;

    // Поиск ближайшей пустой клетки (BFS)
    function findNearestEmpty(startX, startY) {
        let q = [];
        let visited = new Set();

        let ix = Math.floor(startX);
        let iy = Math.floor(startY);
        q.push([ix, iy]);
        visited.add(`${ix},${iy}`);

        // В приоритете проверка сторон, потом диагоналей
        let dirs = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];

        while (q.length > 0) {
            let [cx, cy] = q.shift();

            if (cy >= 0 && cy < h && cx >= 0 && cx < w && map[cy][cx] === 0) {
                return { x: cx + 0.5, y: cy + 0.5 };
            }

            for (let d of dirs) {
                let nx = cx + d[0];
                let ny = cy + d[1];
                let key = `${nx},${ny}`;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited.has(key)) {
                    visited.add(key);
                    q.push([nx, ny]);
                }
            }
        }
        return { x: startX, y: startY }; // Если не найдено (маловероятно)
    }

    function fixReplacement(typeDesc, typeVal, ent) {
        let ix = Math.floor(ent.x);
        let iy = Math.floor(ent.y);

        if (iy < 0 || iy >= h || ix < 0 || ix >= w || map[iy][ix] !== 0) {
            log.push(`[ОШИБКА] Level ${levelNum}: ${typeDesc} '${typeVal}' по координатам (${ent.x}, ${ent.y}) находится внутри стены!`);
            hasErrors = true;

            let newPos = findNearestEmpty(ent.x, ent.y);
            log.push(` -> АВТОФИКС: Перемещение на свободную плитку (${newPos.x}, ${newPos.y})`);

            // Осторожная замена координат конкретной сущности
            let safeX = ent.x.toString().replace('.', '\\.');
            let safeY = ent.y.toString().replace('.', '\\.');
            let regex = new RegExp(`(\\{\\s*type:\\s*['"]${typeVal}['"]\\s*,\\s*x:\\s*)${safeX}(\\s*,\\s*y:\\s*)${safeY}(\\s*\\})`);

            if (regex.test(code)) {
                code = code.replace(regex, `$1${newPos.x}$2${newPos.y}$3`);
                fixesMade++;
            } else {
                log.push(` -> ВНИМАНИЕ: Не удалось автоматически обновить levels.js для этой сущности.`);
            }
        }
    }

    // 1. Проверяем игрока
    let px = Math.floor(lvl.playerStart.x);
    let py = Math.floor(lvl.playerStart.y);
    if (py < 0 || py >= h || px < 0 || px >= w || map[py][px] !== 0) {
        log.push(`[ОШИБКА] Level ${levelNum}: Игрок на старте (${lvl.playerStart.x}, ${lvl.playerStart.y}) находится внутри стены!`);
        hasErrors = true;
        let newPos = findNearestEmpty(lvl.playerStart.x, lvl.playerStart.y);
        log.push(` -> АВТОФИКС: Перемещение игрока на свободную плитку (${newPos.x}, ${newPos.y})`);

        let safeX = lvl.playerStart.x.toString().replace('.', '\\.');
        let safeY = lvl.playerStart.y.toString().replace('.', '\\.');
        let regex = new RegExp(`(playerStart:\\s*\\{\\s*x:\\s*)${safeX}(\\s*,\\s*y:\\s*)${safeY}`);

        if (regex.test(code)) {
            code = code.replace(regex, `$1${newPos.x}$2${newPos.y}`);
            fixesMade++;
        }
    }

    // 2. Проверяем противников
    lvl.enemies.forEach(e => {
        fixReplacement('Противник', e.type, e);
    });

    // 3. Проверяем предметы
    lvl.items.forEach(item => {
        fixReplacement('Предмет', item.type, item);
    });

    // 4. Проверяем достижимость всех зон (Flood fill)
    let visited = Array(h).fill(0).map(() => Array(w).fill(false));
    let q = [];

    // Начинаем с гарантированно пустой (или уже исправленной) позиции игрока
    let fixedPx = Math.floor(lvl.playerStart.x);
    let fixedPy = Math.floor(lvl.playerStart.y);
    if (map[fixedPy] && map[fixedPy][fixedPx] === 0) {
        q.push([fixedPx, fixedPy]);
        visited[fixedPy][fixedPx] = true;
    } else {
        // Если игрок в стене и фикс по какой-то причине не применился - ищем первую пустую
        for (let r = 0; r < h; r++) {
            for (let c = 0; c < w; c++) {
                if (map[r][c] === 0) {
                    q.push([c, r]);
                    visited[r][c] = true;
                    break;
                }
            }
            if (q.length > 0) break;
        }
    }

    while (q.length > 0) {
        let [cx, cy] = q.shift();
        let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (let d of dirs) {
            let nx = cx + d[0];
            let ny = cy + d[1];
            if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[ny][nx]) {
                let cell = map[ny][nx];
                // 0=Пол, 5=Стена-дверь, 9=Интерактивная дверь, 8=Лифт
                if (cell === 0 || cell === 5 || cell === 8 || cell === 9) {
                    visited[ny][nx] = true;
                    q.push([nx, ny]);
                }
            }
        }
    }

    // Логируем недостижимые пустые пространства
    let isolatedCount = 0;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (map[y][x] === 0 && !visited[y][x]) {
                isolatedCount++;
            }
        }
    }
    if (isolatedCount > 0) {
        log.push(`[ПРЕДУПРЕЖДЕНИЕ] Level ${levelNum}: Зафиксировано ${isolatedCount} недостижимых клеток пола (изолированных комнат).`);
        log.push(` -> ВНИМАНИЕ: Автоматически исправить геометрию стен невозможно. Измените карту уровня вручную.`);
    }
});

let reportLabel = '';
if (fixesMade > 0) {
    fs.writeFileSync(levelsPath, code);
    log.push(`\n[УСПЕХ] В файл levels.js было внесено ${fixesMade} автоматических исправлений!`);
    reportLabel = 'Исправлены ошибки спавна.';
} else if (!hasErrors) {
    log.push(`\n[ОК] Уровни полностью валидны. Ошибок со спавном предметов или противников не найдено.`);
    reportLabel = 'Уровни валидны.';
} else {
    log.push(`\n[ОШИБКА] Ошибки найдены, но автофикс не сработал корректно.`);
    reportLabel = 'Ошибки спавна не исправлены.';
}

const reportPath = path.join(__dirname, 'validation_report.txt');
fs.writeFileSync(reportPath, log.join('\n'));

console.log(`Валидация окончена. ${reportLabel}\nПодробный лог сохранен в:\n${reportPath}`);
