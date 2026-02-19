function testStep9(T) {
    T.assert(typeof WEAPONS !== 'undefined', 'WEAPONS defined');
    T.assert(WEAPONS.length === 7, '7 Weapons defined');

    // Create mock map for player
    const map = new GameMap(testLevel);
    const p = new Player(1.5, 1.5, 0, map);

    // Initial state: Pistol (Indices: 0=Pistol, 1=Shotgun, etc.)
    T.assertEqual(p.currentWeaponIndex, 0, 'Start with Pistol (Index 0)');
    T.assertEqual(p.weapon, 'Pistol', 'Current weapon name is Pistol');
    // Pistol uses 'bullets'. Starter ammo was set to 200 in player.js
    T.assertEqual(p.ammo.bullets, 200, 'Start with 200 pistol ammo');

    // Switch to Shotgun (Index 1) - All weapons are unlocked for testing
    const switched = p.switchWeapon(1);
    T.assert(switched, 'Switched to Shotgun');
    T.assertEqual(p.weapon, 'Shotgun', 'Current weapon name is Shotgun');

    // Switch to non-existent weapon
    const badSwitch = p.switchWeapon(99);
    T.assert(!badSwitch, 'Cannot switch to invalid index');

    // Shooting Test with Shotgun (Index 1)
    // Shotgun uses 'shells'. Initial 50. FireRate 1.0s.
    T.assertEqual(p.ammo.shells, 50, 'Initial shells count');

    const time = 100.0;
    const fired = p.shoot(time);
    T.assert(fired, 'Shot fired');
    // Shotgun consumes 1 shell?
    // Check weapon definition: ammoPerShot: 1
    T.assertEqual(p.ammo.shells, 49, 'Ammo consumed (1 shell)');

    // Cooldown check (FireRate 1.0s)
    const firedTooSoon = p.shoot(time + 0.5);
    T.assert(!firedTooSoon, 'Cooldown active (0.5s < 1.0s)');
    T.assertEqual(p.ammo.shells, 49, 'Ammo NOT consumed');

    const firedAfterCooldown = p.shoot(time + 1.1);
    T.assert(firedAfterCooldown, 'Can shoot after cooldown');
    T.assertEqual(p.ammo.shells, 48, 'Ammo consumed again');

    // Test Ammo Depletion (Pistol)
    p.switchWeapon(0); // Pistol
    p.ammo.bullets = 1;
    p.shoot(time + 2.0); // 0 bullets
    T.assertEqual(p.ammo.bullets, 0, 'Last bullet used');

    const dryFire = p.shoot(time + 3.0);
    T.assert(!dryFire, 'Cannot shoot without ammo');
}
