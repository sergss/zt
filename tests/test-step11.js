function testStep11(T) {
    T.assert(typeof Enemy === 'function', 'Enemy class defined');

    // Test Inheritance
    const e = new Enemy(10, 10, 'enemyGuard');
    T.assert(e instanceof Sprite, 'Enemy extends Sprite');
    T.assert(e.active, 'Enemy is active by default');
    T.assertEqual(e.hp, 100, 'Enemy HP is 100');

    // Test Damage
    e.takeDamage(20);
    T.assertEqual(e.hp, 80, 'Enemy took damage');
    e.takeDamage(100);
    T.assertEqual(e.hp, 0, 'Enemy HP min capped at 0');
    T.assertEqual(e.state, 'dead', 'Enemy state is dead');

    // Test Texture Generation
    const tm = new TextureManager();
    const tex = tm.getTexture('enemyGuard');
    T.assert(tex instanceof HTMLCanvasElement, 'Enemy texture generated');

    // Test Main Loop Integration (Simulated)
    // We can't easily test main.js variables without exporting them, 
    // but we can check if the class works as expected.
}
