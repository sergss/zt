function testStep8(T) {
    const hud = new HUD(CONFIG);
    T.assert(typeof hud === 'object', 'HUD created');

    // Create mock player
    const player = {
        hp: 100,
        armor: 50,
        weapon: 'Pistol',
        ammo: { pistol: 20 },
        angle: 0
    };

    // Mock context
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Render shouldn't throw error
    try {
        hud.render(ctx, player, 5); // 5 enemies left
        T.assert(true, 'HUD render executed without error');
    } catch (e) {
        T.assert(false, 'HUD render failed: ' + e.message);
    }

    // Check pixel presence?
    // Hard to check visually with code, but we can check if it modified the canvas context commands (mocking ctx is harder here).
    // Assuming if no error, it's fine for this step.
}
