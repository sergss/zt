function testStep3(T) {
    // Use the global testLevel from map.js
    const map = new GameMap(testLevel);

    T.assert(typeof GameMap !== 'undefined', 'GameMap class exists');
    T.assertEqual(map.width, 20, 'Map width = 20');
    T.assertEqual(map.height, 20, 'Map height = 20');
    T.assert(map.getCell(0, 0) === 1, 'Corner (0,0) is wall type 1');
    T.assert(map.getCell(1, 1) === 0, 'Inner (1,1) is empty');
    T.assert(map.isInBounds(19, 19), 'Cell (19,19) is in bounds');
    T.assert(!map.isInBounds(20, 20), 'Cell (20,20) is out of bounds');
}
