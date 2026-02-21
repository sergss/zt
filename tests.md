# tests.md — Автоматические и ручные тесты

## Формат тестирования
Файл `tests/test-runner.html` — отдельная страница с автотестами.
Подключает модули игры и проверяет логику.

---

## Инфраструктура тестов (реализовать на шаге 1)

```javascript
// tests/test-framework.js — минимальный тест-раннер
const TestRunner = {
  results: [],
  
  assert(condition, testName) {
    this.results.push({
      name: testName,
      passed: !!condition,
      error: condition ? null : 'Assertion failed'
    });
  },

  assertEqual(actual, expected, testName) {
    const passed = actual === expected;
    this.results.push({
      name: testName,
      passed,
      error: passed ? null : `Expected ${expected}, got ${actual}`
    });
  },

  assertInRange(value, min, max, testName) {
    const passed = value >= min && value <= max;
    this.results.push({
      name: testName,
      passed,
      error: passed ? null : `${value} not in range [${min}, ${max}]`
    });
  },

  run() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    console.log(`\n=== TESTS: ${passed}/${total} passed ===\n`);
    this.results.forEach(r => {
      const icon = r.passed ? '✅' : '❌';
      console.log(`${icon} ${r.name}`);
      if (r.error) console.log(`   → ${r.error}`);
    });
    // Визуализация в DOM
    document.getElementById('test-output').innerHTML =
      `<h2>${passed}/${total} passed</h2>` +
      this.results.map(r =>
        `<div style="color:${r.passed ? 'lime' : 'red'}">
          ${r.passed ? '✅' : '❌'} ${r.name}
          ${r.error ? `<br><small>${r.error}</small>` : ''}
        </div>`
      ).join('');
  }
};
```

---

## Тесты для ШАГа 3: Карта
```javascript
// test-map.js
function testMap(T) {
  const map = new GameMap(testLevel);

  T.assert(map.width === 20, 'Map width = 20');
  T.assert(map.height === 20, 'Map height = 20');
  T.assert(map.isWall(0, 0) === true, 'Corner (0,0) is wall');
  T.assert(map.isWall(1, 1) === false, 'Inner (1,1) is passable');
  T.assertEqual(map.getCell(0, 0), 1, 'Cell (0,0) = wall type 1');
  T.assert(map.isInBounds(19, 19), 'Cell (19,19) is in bounds');
  T.assert(!map.isInBounds(20, 20), 'Cell (20,20) is out of bounds');
}
```

## Тесты для ШАГа 4: Движение игрока
```javascript
// test-player.js
function testPlayer(T) {
  const map = new GameMap(testLevel);
  const p = new Player(1.5, 1.5, 0, map);

  // Начальная позиция
  T.assertEqual(p.x, 1.5, 'Player starts at x=1.5');
  T.assertEqual(p.y, 1.5, 'Player starts at y=1.5');

  // Движение вперёд (angle=0 → движение по X+)
  const oldX = p.x;
  p.moveForward(0.1);
  T.assert(p.x > oldX, 'moveForward increases X when angle=0');

  // Коллизия: попытка войти в стену
  p.x = 1.5; p.y = 1.5; p.angle = Math.PI; // лицом к стене (0,1)
  const beforeX = p.x;
  const beforeY = p.y;
  // Двигаться в стену 100 раз
  for (let i = 0; i < 100; i++) p.moveForward(0.1);
  T.assert(
    map.isWall(Math.floor(p.x), Math.floor(p.y)) === false,
    'Player cannot enter wall cell'
  );

  // Поворот
  p.angle = 0;
  p.rotate(Math.PI / 2);
  T.assertInRange(p.angle, Math.PI/2 - 0.01, Math.PI/2 + 0.01,
    'Rotation by PI/2');
}
```

## Тесты для ШАГа 5: Рейкастинг
```javascript
// test-raycaster.js
function testRaycaster(T) {
  // Простая карта: стена на расстоянии 3 клетки
  const simpleMap = [
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1],
  ];
  const map = new GameMap(simpleMap);
  const rc = new Raycaster(map);

  // Луч из (2.5, 2.5) направо (angle=0) должен попасть в стену на x=4
  const hit = rc.castRay(2.5, 2.5, 0);
  T.assert(hit !== null, 'Ray hits a wall');
  T.assertInRange(hit.distance, 1.4, 1.6,
    'Distance to wall ~1.5');

  // Луч из (1.5, 2.5) налево (angle=PI) → стена на x=0
  const hit2 = rc.castRay(1.5, 2.5, Math.PI);
  T.assert(hit2 !== null, 'Ray left hits wall');
  T.assertInRange(hit2.distance, 0.4, 0.6,
    'Distance ~0.5 to left wall');
}
```

## Тесты для ШАГа 9: Оружие
```javascript
// test-weapons.js
function testWeapons(T) {
  const w = new WeaponSystem();

  // Пистолет — бесконечные патроны
  T.assertEqual(w.getAmmo('pistol'), Infinity,
    'Pistol has infinite ammo');

  // Стрельба расходует патроны
  w.setAmmo('shells', 10);
  w.selectWeapon('shotgun');
  w.fire();
  T.assertEqual(w.getAmmo('shells'), 9,
    'Shotgun fire consumes 1 shell');

  // Нельзя стрелять без патронов
  w.setAmmo('shells', 0);
  const result = w.fire();
  T.assertEqual(result, false, 'Cannot fire with 0 ammo');
  T.assertEqual(w.getAmmo('shells'), 0,
    'Ammo stays 0 after failed fire');

  // Cooldown
  w.setAmmo('shells', 10);
  w.fire(); // выстрел
  const result2 = w.fire(); // сразу повтор
  T.assertEqual(result2, false,
    'Cannot fire during cooldown');
}
```

## Тесты для ШАГа 12: Стрельба по врагам
```javascript
function testCombat(T) {
  const map = new GameMap(testLevel);
  const enemy = new Enemy(3.5, 1.5, 'zombie', {hp: 30});

  // Попадание
  enemy.takeDamage(10);
  T.assertEqual(enemy.hp, 20, 'Enemy takes 10 damage → 20 HP');

  // Смерть
  enemy.takeDamage(20);
  T.assertEqual(enemy.hp, 0, 'Enemy HP = 0');
  T.assertEqual(enemy.state, 'DEAD', 'Enemy state = DEAD');

  // Нельзя повторно убить
  enemy.takeDamage(10);
  T.assertEqual(enemy.hp, 0, 'Dead enemy stays at 0 HP');
}
```

## Тесты для ШАГа 13: AI
```javascript
function testEnemyAI(T) {
  const map = new GameMap(openTestLevel); // открытая карта без стен между
  const enemy = new Enemy(5.5, 1.5, 'zombie', {hp: 30});
  const player = {x: 3.5, y: 1.5};

  // line of sight
  const hasLOS = enemy.checkLineOfSight(player, map);
  T.assert(hasLOS, 'Enemy has LOS to player in open space');

  // После обнаружения → CHASE
  enemy.update(0.016, player, map); // один тик
  T.assertEqual(enemy.state, 'CHASE',
    'Enemy enters CHASE on seeing player');

  // Враг приближается
  const oldDist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
  for (let i = 0; i < 60; i++) enemy.update(0.016, player, map);
  const newDist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
  T.assert(newDist < oldDist, 'Enemy moves closer to player');
}
```

## Тесты для ШАГа 14: Система персонажей
```javascript
function testCharacters(T) {
  const roster = new CharacterRoster();

  T.assertEqual(roster.aliveCount(), 5, 'Start with 5 alive');

  roster.kill('Tony Ramos');
  T.assertEqual(roster.aliveCount(), 4, '4 alive after 1 death');
  T.assert(!roster.isAlive('Tony Ramos'), 'Tony is dead');

  // Убить всех
  roster.characters.forEach(c => roster.kill(c.name));
  T.assertEqual(roster.aliveCount(), 0, '0 alive = game over');
  T.assert(roster.isGameOver(), 'Game over when all dead');
}
```

## Тесты для ШАГа 15: Уровни
```javascript
function testLevels(T) {
  const levelMgr = new LevelManager();

  T.assertEqual(levelMgr.currentLevel, 0, 'Start at level 0');

  // Симуляция зачистки
  levelMgr.setEnemiesLeft(0);
  T.assert(levelMgr.isElevatorActive(),
    'Elevator active when 0 enemies');

  levelMgr.setEnemiesLeft(3);
  T.assert(!levelMgr.isElevatorActive(),
    'Elevator locked with enemies alive');

  // Переход
  levelMgr.setEnemiesLeft(0);
  levelMgr.nextLevel();
  T.assertEqual(levelMgr.currentLevel, 1, 'Advanced to level 1');
}
```
## Тесты для ШАГа 16: Автокарта (Automap)
```javascript
function testAutomap(T) {
  // Имитируем небольшую карту 3x3
  const mapData = [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1]
  ];
  const map = new GameMap(mapData);
  
  // Проверяем изначальный туман войны
  T.assertEqual(map.visited[1][1], false, 'Cells start unvisited');
  
  // Открываем ячейку
  map.revealCell(1, 1);
  T.assertEqual(map.visited[1][1], true, 'Cell becomes visited');
  
  // Открываем за границами карты (не должно упасть)
  map.revealCell(-1, -1);
  map.revealCell(10, 10);
  T.assert(true, 'No crash on revealing out-of-bounds cells');
}
```

## Тесты для ШАГа 17: Пароли
```javascript
function testPasswords(T) {
  // Кодирование
  const pwd = PasswordSystem.encode({level: 5, alive: [true, true, false, true, false]});
  T.assert(typeof pwd === 'string', 'Password is a string');
  T.assert(pwd.length === 8, 'Password length = 8');

  // Декодирование
  const state = PasswordSystem.decode(pwd);
  T.assertEqual(state.level, 5, 'Decoded level = 5');
  T.assertEqual(state.alive[2], false, 'Character 3 is dead');

  // Невалидный пароль
  const bad = PasswordSystem.decode('ZZZZZZZZ');
  T.assertEqual(bad, null, 'Invalid password returns null');
}
```

## Чек-лист ручного тестирования (для каждого шага)

```markdown
### Ручная проверка (открыть index.html в браузере)
- [ ] Страница загружается без ошибок в консоли
- [ ] Canvas отображается корректно
- [ ] FPS ≥ 30
- [ ] Управление отзывчивое
- [ ] Визуально соответствует ожиданиям шага
- [ ] Нет визуальных артефактов
- [ ] Нет утечек памяти (играть 2 минуты, проверить Memory в DevTools)
```
```

---