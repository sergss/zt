const WEAPONS = [
    {
        name: 'Pistol',
        damage: 15,
        fireRate: 0.4,
        range: 20,
        ammoType: 'bullets',
        ammoPerShot: 1,
        isAutomatic: false,
        spread: 0.05,
        count: 1
    },
    {
        name: 'Shotgun',
        damage: 10, // Per pellet
        fireRate: 1.0,
        range: 12,
        ammoType: 'shells',
        ammoPerShot: 1,
        isAutomatic: false,
        spread: 0.25,
        count: 6 // Pellets
    },
    {
        name: 'Assault Rifle',
        damage: 12,
        fireRate: 0.1,
        range: 25,
        ammoType: 'bullets', // Shares with pistol? usually rifle ammo
        ammoPerShot: 1,
        isAutomatic: true,
        spread: 0.1,
        count: 1
    },
    {
        name: 'Machine Gun',
        damage: 12,
        fireRate: 0.05,
        range: 25,
        ammoType: 'belt',
        ammoPerShot: 1,
        isAutomatic: true,
        spread: 0.15,
        count: 1
    },
    {
        name: 'Rocket Launcher',
        damage: 100,
        fireRate: 1.5,
        range: 40,
        ammoType: 'rockets',
        ammoPerShot: 1,
        isAutomatic: false,
        spread: 0,
        count: 1
    },
    {
        name: 'Flamethrower',
        damage: 5,
        fireRate: 0.05,
        range: 8,
        ammoType: 'fuel',
        ammoPerShot: 1,
        isAutomatic: true,
        spread: 0.1,
        count: 1
    },
    {
        name: 'Laser',
        damage: 25,
        fireRate: 0.3,
        range: 30,
        ammoType: 'cells',
        ammoPerShot: 1,
        isAutomatic: false,
        spread: 0,
        count: 1
    }
];
