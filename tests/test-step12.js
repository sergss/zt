function testStep12(T) {
    T.assert(typeof Enemy === 'function', 'Enemy class defined');

    const map = new GameMap(testLevel); // Needs map, assumed from testLevel
    const enemy = new Enemy(3.5, 1.5, 'zombie');
    enemy.hp = 30; // Override for testing

    // Hit
    enemy.takeDamage(10);
    T.assertEqual(enemy.hp, 20, 'Enemy takes 10 damage -> 20 HP');

    // Death
    enemy.takeDamage(20);
    T.assertEqual(enemy.hp, 0, 'Enemy HP = 0');
    T.assertEqual(enemy.state, 'DEAD', 'Enemy state = DEAD');

    // Cannot kill again
    enemy.takeDamage(10);
    T.assertEqual(enemy.hp, 0, 'Dead enemy stays at 0 HP');
}
