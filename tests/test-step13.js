function testStep13(T) {
    T.assert(typeof Enemy === 'function', 'Enemy class defined');

    // We can use testLevel because row 1 is open from x=1 to x=18
    const map = new GameMap(testLevel);
    const enemy = new Enemy(5.5, 1.5, 'zombie');
    const player = { x: 3.5, y: 1.5 }; // Mock player object

    // Test Line of Sight
    T.assertEqual(enemy.state, 'IDLE', 'Enemy starts in IDLE state');
    const hasLOS = enemy.checkLineOfSight(player, map);
    T.assert(hasLOS, 'Enemy has LOS to player in open space');

    // Update enemy to trigger state transition
    enemy.update(0.016, player, map);
    T.assertEqual(enemy.state, 'CHASE', 'Enemy enters CHASE on seeing player');

    // Ensure Distance Closes
    const oldDist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    for (let i = 0; i < 60; i++) {
        enemy.update(0.016, player, map);
    }
    const newDist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    T.assert(newDist < oldDist, 'Enemy moves closer to player');

    // Test Attack State (Zombie melee range is 1.0)
    enemy.x = 2.5;
    enemy.y = 1.5; // Dist = 1.0

    let damageTaken = false;
    player.takeDamage = function (dmg) { damageTaken = true; }; // Mock damage

    enemy.update(0.016, player, map);
    T.assertEqual(enemy.state, 'ATTACK', 'Enemy enters ATTACK state in range');
    T.assert(damageTaken, 'Enemy deals damage on attack');

    // Test Pain State
    enemy.takeDamage(10);
    T.assertEqual(enemy.state, 'PAIN', 'Enemy enters PAIN state on hit');
    T.assert(enemy.painTimer > 0, 'Pain timer > 0');
}
