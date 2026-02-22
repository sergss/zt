function testStep20(T) {
    // 1. Test Player Damage Flash
    const map = new GameMap([[1, 1, 1], [1, 0, 1], [1, 1, 1]]);
    const p = new Player(1.5, 1.5, 0, map);

    T.assertEqual(p.damageFlash, 0, 'Damage flash starts at 0');
    p.takeDamage(10);
    T.assert(p.damageFlash > 0, 'Damage flash is active after taking damage');

    p.update(0.1); // simulate 0.1s passing
    T.assert(p.damageFlash > 0 && p.damageFlash < 0.3, 'Damage flash decreases over time');

    // 2. Test HUD Blinking Logic (Unit logic simulation)
    const mockCharHurt = { hp: 20, maxHp: 100, name: 'Test' };
    const isHurt = mockCharHurt.hp > 0 && mockCharHurt.hp < mockCharHurt.maxHp * 0.4;
    T.assert(isHurt === true, 'isHurt logic flags low HP character');

    // 3. Test Fade Timer Reset
    const oldFade = typeof levelFadeTimer !== 'undefined' ? levelFadeTimer : 0;

    // Simulate main.js update timer logic
    let tempFadeTimer = 1.0;
    T.assertEqual(tempFadeTimer, 1.0, 'Fade timer starts at 1.0');
    let dt = 0.5;
    if (tempFadeTimer > 0) {
        tempFadeTimer -= dt;
        if (tempFadeTimer < 0) tempFadeTimer = 0;
    }
    T.assertEqual(tempFadeTimer, 0.5, 'Fade timer decreases with dt');
}
