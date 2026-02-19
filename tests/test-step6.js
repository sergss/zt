function testStep6(T) {
    const map = new GameMap(testLevel);
    const rc = new Raycaster(map);

    // Test WallX calculation
    // Player at 1.5, 1.5. Look East (0). Hit at x=2.0.
    // Ray hits x=2 line. Y intersection should be 1.5.
    // wallX should be derived from Y. 1.5 -floor(1.5) = 0.5.

    let res = rc.castRay(1.5, 1.5, 0);
    T.assertInRange(res.wallX, 0.49, 0.51, 'WallX calculation (East)');

    // Look South (PI/2). Hit y=2.0 (if wall there).
    // Let's check a ray at 45 deg (PI/4).
    // RayDir: 0.707, 0.707.
    // Start 1.5, 1.5.
    // Will hit x=2 or y=2 first? 
    // Distance to x=2 is 0.5. Distance to y=2 is 0.5.
    // DDA preference depends on logic.
    // If it hits corner 2,2.

    // Let's test specific Texture Manager
    const tm = new TextureManager();
    T.assert(tm.getTexture(1) instanceof HTMLCanvasElement, 'Texture 1 generated');
    T.assert(tm.getTexture(2) instanceof HTMLCanvasElement, 'Texture 2 generated');
}
