function testStep10(T) {
    T.assert(typeof Sprite === 'function', 'Sprite class defined');

    const s1 = new Sprite(10, 10, 'medkit');
    const s2 = new Sprite(20, 20, 'ammo');

    const p = { x: 0, y: 0 };

    s1.updateDistance(p); // DistSq = 100+100 = 200
    s2.updateDistance(p); // DistSq = 400+400 = 800

    T.assert(s1.distance === 200, 'Distance calc correct s1');
    T.assert(s2.distance === 800, 'Distance calc correct s2');

    const sprites = [s1, s2];
    // Sort logic used in renderer: b.dist - a.dist (Descending/Far to Near)
    sprites.sort((a, b) => b.distance - a.distance);

    T.assertEqual(sprites[0], s2, 'Sorted: Far sprite first');
    T.assertEqual(sprites[1], s1, 'Sorted: Near sprite second');

    // Check texture generation
    const tm = new TextureManager();
    const tex = tm.getTexture('medkit');
    T.assert(tex instanceof HTMLCanvasElement, 'Medkit texture generated');
}
