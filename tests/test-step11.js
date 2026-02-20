function testStep11(T) {
    T.assert(typeof Enemy === 'function', 'Enemy class defined');

    // Create an enemy instance
    const enemyType = 'alien';
    const enemyX = 14.5;
    const enemyY = 17.5;

    const e = new Enemy(enemyX, enemyY, enemyType);

    // Check required properties for Step 11
    T.assertEqual(e.x, enemyX, 'Enemy X coordinate matches');
    T.assertEqual(e.y, enemyY, 'Enemy Y coordinate matches');
    T.assertEqual(e.hp, 100, 'Enemy starts with 100 HP');
    T.assertEqual(e.type, enemyType, 'Enemy type matches');
    T.assertEqual(e.state, 'IDLE', 'Enemy initial state is IDLE');
    T.assertEqual(e.sprite, enemyType, 'Enemy sprite maps to texture ID');

    // Ensure Enemy extends Sprite
    T.assert(e instanceof Sprite, 'Enemy extends Sprite class');
    T.assert(e.active, 'Enemy is active upon creation');
    T.assert(e.visible, 'Enemy is visible upon creation');

    // Check texture generation
    const tm = new TextureManager();
    const texZombie = tm.getTexture('zombie');
    const texSoldier = tm.getTexture('soldier');
    const texAlien = tm.getTexture('alien');

    T.assert(texZombie instanceof HTMLCanvasElement, 'Zombie texture generated');
    T.assert(texSoldier instanceof HTMLCanvasElement, 'Soldier texture generated');
    T.assert(texAlien instanceof HTMLCanvasElement, 'Alien texture generated');
}
