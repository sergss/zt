// tests/test-step17.js
function testStep17(T) {
    if (typeof PasswordSystem === 'undefined') {
        T.assert(false, "PasswordSystem class is missing");
        return;
    }

    function testPasswords(T) {
        // Кодирование
        const stateToEncode = {
            level: 5,
            activeCharIdx: 1,
            hp: 85,
            armor: 50,
            weapons: [true, false, true, false, false, false, false],
            ammo: {
                bullets: 100,
                shells: 20,
                belt: 0,
                rockets: 5,
                fuel: 0,
                cells: 0
            },
            alive: [true, true, false, true, false]
        };
        const pwd = PasswordSystem.encode(stateToEncode);

        T.assert(typeof pwd === 'string', 'Password is a string');
        T.assert(pwd.length === 16, 'Password length = 16 (Base32 encoded 80 bits)');

        // Декодирование
        const state = PasswordSystem.decode(pwd);
        T.assert(state !== null, 'Password could be decoded');
        if (state) {
            T.assertEqual(state.level, 5, 'Decoded level = 5');
            T.assertEqual(state.activeCharIdx, 1, 'Decoded active char = 1');
            T.assertEqual(state.hp, 85, 'Decoded HP = 85');
            T.assertEqual(state.armor, 50, 'Decoded Armor = 50');
            T.assertEqual(state.ammo.bullets, 100, 'Decoded bullets = 100');
            T.assertEqual(state.alive[0], true, 'Character 1 is alive');
            T.assertEqual(state.alive[2], false, 'Character 3 is dead');
            T.assertEqual(state.weapons[0], true, 'Weapon 0 unlocked');
        }

        // Невалидный пароль
        const bad = PasswordSystem.decode('ZZZZZZZZZZZZZZZZ');
        T.assertEqual(bad, null, 'Invalid password returns null');
    }

    testPasswords(T);
}
// For global execution in runner:
window.testStep17 = testStep17;
