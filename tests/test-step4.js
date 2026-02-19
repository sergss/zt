function testStep4(T) {
    const map = new GameMap(testLevel);
    // Player at 1.5, 1.5 (inside empty cell), facing East (0)
    const p = new Player(1.5, 1.5, 0, map);

    // Initial state
    T.assertEqual(p.x, 1.5, 'Start X');
    T.assertEqual(p.y, 1.5, 'Start Y');

    // Move forward (East)
    Input.keys = { 'KeyW': true }; // Simulate input
    p.update(0.1); // 0.1s delta
    // Expected: x increased by moveSpeed * 0.1 = 3.0 * 0.1 = 0.3
    // New X approx 1.8
    T.assert(p.x > 1.5, 'Moved forward (+X)');
    T.assertEqual(p.y, 1.5, 'Y unchanged moving East');

    // Collision Test
    // Place player near wall at (0, 1) - Wall is column 0
    p.x = 1.1;
    p.y = 1.5;
    p.angle = Math.PI; // Face West
    Input.keys = { 'KeyW': true };

    // Try to move into wall
    p.update(0.1);
    // Should be blocked. The radius is 0.2. 
    // Target X would be 1.1 - 0.3 = 0.8. 
    // Boundary check: floor(0.8 - 0.2) = 0. Wall is at 0.
    // So movement should be blocked or clamped.

    // With current logic, we check if target enters wall.
    // If blocked, x stays same.
    T.assert(p.x === 1.1, 'Collision blocked movement into wall');

    // Clean up input
    Input.keys = {};
}
