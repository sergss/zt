function testStep1(T) {
    T.assert(typeof CONFIG !== 'undefined', 'Config object exists');
    T.assertEqual(CONFIG.SCREEN_WIDTH, 960, 'Screen width is 960');
    T.assertEqual(CONFIG.SCREEN_HEIGHT, 600, 'Screen height is 600');

    const canvas = document.getElementById('gameCanvas');
    T.assert(canvas !== null, 'Canvas element exists');
    if (canvas) {
        T.assertEqual(canvas.width, 960, 'Canvas width is 960');
        T.assertEqual(canvas.height, 600, 'Canvas height is 600');
        const ctx = canvas.getContext('2d');
        T.assert(ctx instanceof CanvasRenderingContext2D, '2D Context is available');
    }
}
