function testStep19(T) {
    let mockPlayer = {
        x: 5, y: 5, angle: 0, hp: 100, armor: 0, ammo: { shells: 0, bullets: 0, rockets: 0, fuel: 0, cells: 0, belt: 0 }, weapons: [true, false, false, false, false, false, false], currentWeaponIndex: 0,
        switchWeapon: function () { }
    };

    // Item creation and applyEffect logic
    let medkit = new Item(5, 5, 'medkit');
    T.assert(medkit instanceof Sprite, "Item should extend Sprite");
    T.assertEqual(medkit.type, 'medkit', "Type should be medkit");

    mockPlayer.hp = 50;
    let applied = medkit.applyEffect(mockPlayer);
    T.assert(applied, "Medkit should be applied");
    T.assertEqual(mockPlayer.hp, 75, "Player HP should increase by 25");
    T.assert(!medkit.active, "Medkit should become inactive");

    // Test Armor
    let armor = new Item(6, 6, 'armor');
    mockPlayer.armor = 50;
    applied = armor.applyEffect(mockPlayer);
    T.assert(applied, "Armor should be applied");
    T.assertEqual(mockPlayer.armor, 75, "Player Armor should increase by 25");
    T.assert(!armor.active, "Armor should become inactive");

    // Test Weapon Pickup
    let shotgun = new Item(7, 7, 'weaponShotgun');
    applied = shotgun.applyEffect(mockPlayer);
    T.assert(applied, "Weapon should be picked up");
    T.assert(mockPlayer.weapons[1] === true, "Player should have shotgun (index 1)");

    // Enemy stats based on type
    let zombie = new Enemy(1, 1, 'zombie');
    T.assertEqual(zombie.hp, 50, "Zombie should have 50 HP");
    T.assertEqual(zombie.speed, 1.5, "Zombie should have 1.5 speed");

    let soldier = new Enemy(2, 2, 'soldier');
    T.assertEqual(soldier.hp, 100, "Soldier should have 100 HP");
    T.assertEqual(soldier.speed, 2.0, "Soldier should have 2.0 speed");

    let alien = new Enemy(3, 3, 'alien');
    T.assertEqual(alien.hp, 150, "Alien should have 150 HP");
    T.assertEqual(alien.speed, 2.5, "Alien should have 2.5 speed");

    let boss = new Enemy(4, 4, 'boss');
    T.assertEqual(boss.hp, 1000, "Boss should have 1000 HP");
    T.assertEqual(boss.speed, 3.2, "Boss should have 3.2 speed");

    // TextureManager chapter palettes
    let tm = new TextureManager();
    T.assertEqual(tm.currentChapter, 0, "Default chapter should be 0");

    tm.loadChapterPalette(1);
    T.assertEqual(tm.currentChapter, 1, "Chapter should change to 1");

    tm.loadChapterPalette(2);
    T.assertEqual(tm.currentChapter, 2, "Chapter should change to 2");

    // LevelManager loading
    let lm = new LevelManager();
    T.assertEqual(lm.levels.length, 9, "Should have 9 levels defined");

    lm.currentLevelIndex = 0;
    let data1 = lm.getCurrentLevelData();
    T.assert(data1.map.length > 0, "Level 1 map should exist");

    lm.currentLevelIndex = 8;
    let data9 = lm.getCurrentLevelData();
    T.assert(data9.map.length > 0, "Level 9 map should exist");

    let hasBoss = false;
    for (let i = 0; i < data9.enemies.length; i++) {
        if (data9.enemies[i].type === 'boss') hasBoss = true;
    }
    T.assert(hasBoss, "Level 9 should have a boss");
}
