function testStep7(T) {
    const mapLevel = [
        [1, 1, 1],
        [1, 9, 1], // Door at (1,1)
        [1, 1, 1]
    ];
    const map = new GameMap(mapLevel);

    // Check door initialization
    const door = map.getDoor(1, 1);
    T.assert(typeof door === 'object', 'Door object created at (1,1)');
    T.assert(door.state === 'CLOSED', 'Door initially CLOSED');
    T.assert(map.isWall(1, 1) === true, 'Closed door is wall');

    // Open door
    map.tryOpenDoor(1, 1);
    T.assert(door.state === 'OPENING', 'Door state -> OPENING');

    // Update map to simulate time
    map.update(0.6); // +0.6s * 2.0 speed = 1.2 offset -> Full open

    T.assert(door.state === 'OPEN', 'Door state -> OPEN after update');
    T.assert(map.isWall(1, 1) === false, 'Open door is NOT wall');

    // Raycaster check
    // Ray passing through open door
    const rc = new Raycaster(map);
    // Cast from (1, 0.5) downwards (Angle PI/2) through (1,1) to (1,2)
    // Map:
    // 1 1 1 (y=0)
    // 1 9 1 (y=1) -> OPEN
    // 1 1 1 (y=2)
    // Ray starts at 1.5, 0.5. Dir Y+.
    // Hits 1,2? Wall.

    const res = rc.castRay(1.5, 0.5, Math.PI / 2);
    // Should NOT hit door (type 9) because it's open. Should hit wall at y=2 (type 1).
    T.assert(res.hit === 1, 'Ray passes through OPEN door');
    T.assertEqual(res.mapY, 2, 'Ray hits wall behind door');

    // Close door test
    door.state = 'CLOSED';
    door.offset = 0;
    const resClosed = rc.castRay(1.5, 0.5, Math.PI / 2);
    T.assert(resClosed.hit === 9, 'Ray hits CLOSED door');
}
