function testStep21(T) {
    // 1. Test Projectile Movement
    let mapMock = {
        isWall: (x, y) => false
    };

    let proj = new Projectile(0, 0, 0, 'rocket', 100, 'player');
    T.assert(proj.active === true, 'Projectile starts active');

    // Move rocket right for 1 second (speed 10)
    proj.update(1.0, mapMock, [], []);
    T.assert(proj.x >= 9.9 && proj.x <= 10.1, 'Rocket travels correctly based on speed');
    T.assert(proj.active === true, 'Rocket is still active in open space');

    // 2. Test Projectile Wall Collision
    mapMock.isWall = (x, y) => x >= 15; // Wall at x=15
    let particlesMock = [];

    proj.update(1.0, mapMock, [], particlesMock); // Moves to x=20, hits wall at 15
    T.assert(proj.active === false, 'Rocket destroyed on hitting wall');
    T.assert(particlesMock.length === 1, 'Rocket spawned explosion particle on destruction');
    T.assert(particlesMock[0].type === 'explosion', 'Particle is an explosion');

    // 3. Test Fire Particle Damage Over Time
    let fire = new Particle(10, 10, 0, 'firePatch', 3.0, 5); // 5 dmg per tick
    let mockEnemy = { x: 10, y: 10, hp: 50, takeDamage: function (d) { this.hp -= d; } };
    let mockPlayer = { x: 0, y: 0, hp: 100, takeDamage: function (d) { this.hp -= d; } };

    // Update 0.4s (no damage tick yet, happens every 0.5s)
    fire.update(0.4, mockPlayer, [mockEnemy]);
    T.assert(mockEnemy.hp === 50, 'No fire damage before 0.5s tick');

    // Update another 0.2s (crosses 0.5s threshhold)
    fire.update(0.2, mockPlayer, [mockEnemy]);
    T.assert(mockEnemy.hp === 45, 'Enemy takes 5 damage from fire tick');

    // Move enemy away
    mockEnemy.x = 20;
    fire.update(0.5, mockPlayer, [mockEnemy]);
    T.assert(mockEnemy.hp === 45, 'Enemy out of range takes no damage');

    // 4. Test Bullet Hitscan against enemy directly (no wall)
    mapMock.isWall = () => false;
    let bullet = new Projectile(0, 0, 0, 'bullet', 15, 'player'); // Speed 40
    let target = { x: 2, y: 0, hp: 30, takeDamage: function (d) { this.hp -= d; } };
    let dmap = [];
    bullet.update(0.1, mapMock, [target], dmap); // Moves 4 units

    T.assert(target.hp === 15, 'Bullet hit enemy and dealt 15 damage');
    T.assert(bullet.active === false, 'Bullet destroyed on impact');
}
