// Game Loop and Initialization

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const fpsElement = document.getElementById('fps');

let lastTime = 0;
let frameCount = 0;
let lastFpsTime = 0;
let fps = 0;

function init() {
    console.log('Game Initialized');
    Input.init();
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    // Update game logic here
}

function draw() {
    // Clear screen with black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

    // Draw debugging info
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    const pressed = Input.getPressedKeys().join(', ');
    ctx.fillText(`Pressed: ${pressed}`, 10, 50);

    // Show active actions
    let y = 70;
    for (const action in Input.actions) {
        if (Input.isActionActive(action)) {
            ctx.fillText(`Action: ${action}`, 10, y);
            y += 20;
        }
    }

}

function gameLoop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    update(dt);
    draw();

    // FPS Calculation
    frameCount++;
    if (timestamp - lastFpsTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFpsTime = timestamp;
        fpsElement.textContent = `FPS: ${fps}`;
    }

    requestAnimationFrame(gameLoop);
}

// Start the game
init();
