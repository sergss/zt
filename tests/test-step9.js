function testStep9(T) {
    T.assert(typeof WEAPONS !== 'undefined', 'WEAPONS defined');
    T.assert(WEAPONS.length === 7, '7 Weapons defined');

    const map = new GameMap(testLevel);
    const p = new Player(1.5, 1.5, 0, map);

    // Initial state
    T.assertEqual(p.weapon, 'Pistol', 'Start with Pistol');
    T.assertEqual(p.ammo.pistol, 50, 'Start with 50 pistol ammo');

    // Switch to Knife (index 0)
    p.switchWeapon(0);
    T.assertEqual(p.weapon, 'Knife', 'Switch to Knife');

    // Switch to Shotgun (index 2) - should work (unlocked)
    p.switchWeapon(2);
    T.assertEqual(p.weapon, 'Shotgun', 'Switch to Shotgun');

    // Switch to Locked Weapon (RocketLauncher index 5)
    p.switchWeapon(5);
    T.assertEqual(p.weapon, 'Shotgun', 'Cannot switch to locked weapon');

    // Shooting
    // Shotgun uses 'shells'. Initial 20.
    const time = 100.0;
    const fired = p.shoot(time);
    T.assert(fired, 'Shot fired');
    T.assertEqual(p.ammo.shells, 19, 'Ammo consumed');

    // Cooldown check (FireRate 1.0s)
    const firedTooSoon = p.shoot(time + 0.5);
    T.assert(!firedTooSoon, 'Cooldown active');

    const firedAfterCooldown = p.shoot(time + 1.1);
    T.assert(firedAfterCooldown, 'Can shoot after cooldown');
    T.assertEqual(p.ammo.shells, 18, 'Ammo consumed again');
}
