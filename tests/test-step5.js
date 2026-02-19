function testStep5(T) {
    const map = new GameMap([
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1]
    ]);
    const rc = new Raycaster(map);

    // Player at 1.5, 1.5
    // Cast East (0) -> should hit wall at x=2
    // Distance should be 2.0 - 1.5 = 0.5
    let res = rc.castRay(1.5, 1.5, 0);
    T.assert(res.hit === 1, 'Ray hit wall');
    T.assertInRange(res.distance, 0.49, 0.51, 'Distance approx 0.5');

    // Cast West (PI) -> should hit wall at x=0
    // Distance 1.5 - 1.0 = 0.5 (Wait, wall is at 0, boundary is 1.0)
    // Map cell 0 is x=0..1. Map cell 1 is x=1..2.
    // Player 1.5 is in cell 1.
    // West ray hits cell 0 boundary at x=1.0. Distance 0.5.
    res = rc.castRay(1.5, 1.5, Math.PI);
    T.assert(res.hit === 1, 'Ray Left hit wall');
    T.assertInRange(res.distance, 0.49, 0.51, 'Distance Left approx 0.5');
}
