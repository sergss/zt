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

    // Переход дальше
    levelMgr.nextLevel();
    T.assertEqual(levelMgr.currentLevel, 2, 'Advanced to level 2');

    // Попытка перехода за пределы
    const canAdvanceMore = levelMgr.nextLevel();
    T.assert(!canAdvanceMore, 'Cannot advance past the last level');
    T.assertEqual(levelMgr.currentLevel, 2, 'Stays at level 2');

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
    });
}
