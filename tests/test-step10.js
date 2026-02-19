function testStep10(T) {
    T.assert(typeof Sprite === 'function', 'Sprite class defined');

    // Test Pickup Logic
    const map = new GameMap(testLevel); // Need map for player
    const p = new Player(1.5, 1.5, 0, map);

    // Reset Stats
    p.hp = 50;
    p.armor = 0;
    p.weapons = [true, false, false, false, false, false, false]; // Only pistol
    p.ammo = {
        bullets: 0, shells: 0, belt: 0, rockets: 0, fuel: 0, cells: 0, infinite: 999
    };

    // 1. Health Pickup
    // Distance must be < 0.25 sq (0.5 units)
    // Player at 1.5, 1.5. Sprite at 1.6, 1.6. DistSq = 0.1^2 + 0.1^2 = 0.02. OK.
    const s1 = new Sprite(1.6, 1.6, 'healthBig');
    s1.updateDistance(p);
    T.assert(s1.active, 'Sprite active initially');
    const picked = s1.checkPickup(p);
    T.assert(picked, 'Medkit picked up');
    T.assert(!s1.active, 'Sprite inactive after pickup');
    T.assertEqual(p.hp, 75, 'HP increased by 25');

    // 2. Armor Pickup
    const sArmor = new Sprite(1.6, 1.6, 'armor');
    sArmor.updateDistance(p);
    sArmor.checkPickup(p);
    T.assertEqual(p.armor, 25, 'Armor increased by 25');

    // 3. Weapon Pickup (Shotgun)
    const sShotgun = new Sprite(1.6, 1.6, 'weaponShotgun');
    sShotgun.updateDistance(p);
    sShotgun.checkPickup(p);
    T.assert(p.weapons[1], 'Shotgun unlocked');
    T.assertEqual(p.ammo.shells, 8, 'Shotgun ammo +8');

    // 4. New Weapons
    const sRifle = new Sprite(1.6, 1.6, 'weaponAssaultRifle');
    sRifle.updateDistance(p);
    sRifle.checkPickup(p);
    T.assert(p.weapons[2], 'Assault Rifle unlocked');
    T.assertEqual(p.ammo.bullets, 20, 'Bullets +20'); // 0 + 20

    const sRocket = new Sprite(1.6, 1.6, 'weaponRocketLauncher');
    sRocket.updateDistance(p);
    sRocket.checkPickup(p);
    T.assert(p.weapons[4], 'Rocket Launcher unlocked');
    T.assertEqual(p.ammo.rockets, 5, 'Rockets +5');

    // 5. Texture Gen
    const tm = new TextureManager();
    const tex = tm.getTexture('weaponLaser');
    T.assert(tex instanceof HTMLCanvasElement, 'Laser texture generated');
}
