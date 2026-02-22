function testStep15(T) {
    const levelMgr = new LevelManager();

    T.assertEqual(levelMgr.currentLevel, 0, 'Start at level 0');

    // Симуляция зачистки
    levelMgr.setEnemiesLeft(0);
    T.assert(levelMgr.isElevatorActive(), 'Elevator active when 0 enemies');

    levelMgr.setEnemiesLeft(3);
    T.assert(!levelMgr.isElevatorActive(), 'Elevator locked with enemies alive');

    // Переход
    levelMgr.setEnemiesLeft(0);
    const advanced = levelMgr.nextLevel();
    T.assert(advanced, 'Can advance from level 0');
    T.assertEqual(levelMgr.currentLevel, 1, 'Advanced to level 1');

    // Переход до конца
    const endLevel = levelMgr.levels.length - 1;
    while (levelMgr.currentLevel < endLevel) {
        levelMgr.nextLevel();
    }
    T.assertEqual(levelMgr.currentLevel, endLevel, `Advanced to level ${endLevel}`);

    // Попытка перехода за пределы
    const canAdvanceMore = levelMgr.nextLevel();
    T.assert(!canAdvanceMore, 'Cannot advance past the last level');
    T.assertEqual(levelMgr.currentLevel, endLevel, `Stays at level ${endLevel}`);

    // Проверка коллизий на всех уровнях (спавн внутри стен)
    levelMgr.levels.forEach((level, i) => {
        const checkCollision = (obj, name) => {
            const cx = Math.floor(obj.x);
            const cy = Math.floor(obj.y);
            // Protect against out of bounds access
            if (cy >= 0 && cy < level.map.length && cx >= 0 && cx < level.map[0].length) {
                const cell = level.map[cy][cx];
                T.assertEqual(cell, 0, `Level ${i} ${name} at (${obj.x}, ${obj.y}) is on floor (cell=${cell})`);
            } else {
                T.assert(false, `Level ${i} ${name} at (${obj.x}, ${obj.y}) is OUT OF BOUNDS`);
            }
        };

        checkCollision(level.playerStart, 'Player Start');
        level.enemies.forEach((e, idx) => checkCollision(e, `Enemy ${idx} (${e.type})`));
        level.items.forEach((item, idx) => checkCollision(item, `Item ${idx} (${item.type})`));

        // Проверка проходимости уровня (Flood Fill / BFS)
        const isPassable = (cell) => cell === 0 || cell === 8 || cell === 9;
        const startX = Math.floor(level.playerStart.x);
        const startY = Math.floor(level.playerStart.y);

        const visited = new Set();
        const queue = [{ x: startX, y: startY }];
        visited.add(`${startX},${startY}`);

        while (queue.length > 0) {
            const curr = queue.shift();

            // Проверяем соседей (вверх, вниз, влево, вправо)
            const neighbors = [
                { x: curr.x + 1, y: curr.y },
                { x: curr.x - 1, y: curr.y },
                { x: curr.x, y: curr.y + 1 },
                { x: curr.x, y: curr.y - 1 }
            ];

            for (const n of neighbors) {
                if (n.y >= 0 && n.y < level.map.length && n.x >= 0 && n.x < level.map[0].length) {
                    const cell = level.map[n.y][n.x];
                    if (isPassable(cell) && !visited.has(`${n.x},${n.y}`)) {
                        visited.add(`${n.x},${n.y}`);
                        queue.push({ x: n.x, y: n.y });
                    }
                }
            }
        }

        // 1. Проверяем, что достижим лифт (блок 8)
        let elevatorFound = false;
        let elevatorReachable = false;
        for (let y = 0; y < level.map.length; y++) {
            for (let x = 0; x < level.map[0].length; x++) {
                if (level.map[y][x] === 8) {
                    elevatorFound = true;
                    if (visited.has(`${x},${y}`)) {
                        elevatorReachable = true;
                    }
                }
            }
        }
        T.assert(elevatorFound, `Level ${i} MUST have an elevator (block 8)`);
        T.assert(elevatorReachable, `Level ${i} Elevator must be reachable from player start`);

        // 2. Проверяем, что достижимы все враги
        level.enemies.forEach((e, idx) => {
            const ex = Math.floor(e.x);
            const ey = Math.floor(e.y);
            T.assert(visited.has(`${ex},${ey}`), `Level ${i} Enemy ${idx} at (${ex}, ${ey}) must be reachable`);
        });

        // 3. Проверяем, что достижимы все предметы
        level.items.forEach((item, idx) => {
            const ix = Math.floor(item.x);
            const iy = Math.floor(item.y);
            T.assert(visited.has(`${ix},${iy}`), `Level ${i} Item ${idx} at (${ix}, ${iy}) must be reachable`);
        });
    });
}
