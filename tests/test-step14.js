function testStep14(T) {
    const roster = new CharacterRoster();

    T.assertEqual(roster.aliveCount(), 5, 'Start with 5 alive');

    roster.kill('Sarah "Snipe" Connor');
    T.assertEqual(roster.aliveCount(), 4, '4 alive after 1 death');
    T.assert(!roster.isAlive('Sarah "Snipe" Connor'), 'Sarah is dead');

    // Kill all remaining
    roster.characters.forEach(c => roster.kill(c.name));
    T.assertEqual(roster.aliveCount(), 0, '0 alive = game over');
    T.assert(roster.isGameOver(), 'Game over when all dead');
}

window.testStep14 = testStep14;
