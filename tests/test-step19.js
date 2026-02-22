// Test Runner Logic for Step 19: Items and Enemies
QUnit.module('Step 19: Items, Enemies and Textures', function (hooks) {

    let mockPlayer;

    hooks.beforeEach(function () {
        mockPlayer = {
            x: 5, y: 5, angle: 0, hp: 100, armor: 0, ammo: {}, weapons: [1], currentWeaponIndex: 0
        };
    });

    QUnit.test('Item creation and applyEffect logic', function (assert) {
        // Test Medkit
        let medkit = new Item(5, 5, 'medkit');
        assert.ok(medkit instanceof Sprite, "Item should extend Sprite");
        assert.equal(medkit.type, 'medkit', "Type should be medkit");

        mockPlayer.hp = 50;
        let applied = medkit.applyEffect(mockPlayer);
        assert.ok(applied, "Medkit should be applied");
        assert.equal(mockPlayer.hp, 75, "Player HP should increase by 25");
        assert.notOk(medkit.active, "Medkit should become inactive");

        // Test Armor
        let armor = new Item(6, 6, 'armor');
        mockPlayer.armor = 50;
        applied = armor.applyEffect(mockPlayer);
        assert.ok(applied, "Armor should be applied");
        assert.equal(mockPlayer.armor, 100, "Player Armor should increase by 50");
        assert.notOk(armor.active, "Armor should become inactive");

        // Test Weapon Pickup
        let shotgun = new Item(7, 7, 'weaponShotgun');
        applied = shotgun.applyEffect(mockPlayer);
        assert.ok(applied, "Weapon should be picked up");
        assert.ok(mockPlayer.weapons.includes(1), "Player should have shotgun (index 1)");
    });

    QUnit.test('Enemy stats based on type', function (assert) {
        let zombie = new Enemy(1, 1, 'zombie');
        assert.equal(zombie.hp, 50, "Zombie should have 50 HP");
        assert.equal(zombie.speed, 1.5, "Zombie should have 1.5 speed");

        let soldier = new Enemy(2, 2, 'soldier');
        assert.equal(soldier.hp, 100, "Soldier should have 100 HP");
        assert.equal(soldier.speed, 2.0, "Soldier should have 2.0 speed");

        let alien = new Enemy(3, 3, 'alien');
        assert.equal(alien.hp, 150, "Alien should have 150 HP");
        assert.equal(alien.speed, 2.5, "Alien should have 2.5 speed");

        let boss = new Enemy(4, 4, 'boss');
        assert.equal(boss.hp, 1000, "Boss should have 1000 HP");
        assert.equal(boss.speed, 3.2, "Boss should have 3.2 speed");
    });

    QUnit.test('TextureManager chapter palettes', function (assert) {
        let tm = new TextureManager();
        assert.equal(tm.currentChapter, 0, "Default chapter should be 0");

        // Keep original metal texture for reference
        const originalMetal = tm.textures[1];

        // Chapter 0 explicitly shouldn't reload if already 0, but forced load should work
        tm.loadChapterPalette(1);
        assert.equal(tm.currentChapter, 1, "Chapter should change to 1");
        assert.notEqual(tm.textures[1], originalMetal, "Texture 1 should be regenerated for chapter 1");

        tm.loadChapterPalette(2);
        assert.equal(tm.currentChapter, 2, "Chapter should change to 2");
    });

    QUnit.test('LevelManager loading unique levels', function (assert) {
        let lm = new LevelManager();
        assert.equal(lm.levels.length, 9, "Should have 9 levels defined");

        lm.currentLevelIndex = 0;
        let data1 = lm.getCurrentLevelData();
        assert.ok(data1.map.length > 0, "Level 1 map should exist");

        lm.currentLevelIndex = 8;
        let data9 = lm.getCurrentLevelData();
        assert.ok(data9.map.length > 0, "Level 9 map should exist");
        assert.ok(data9.enemies.some(e => e.type === 'boss'), "Level 9 should have a boss");
    });
});
