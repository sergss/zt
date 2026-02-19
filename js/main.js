// Game Loop and Initialization

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const fpsElement = document.getElementById('fps');

let lastTime = 0;
let frameCount = 0;
let lastFpsTime = 0;
let fps = 0;

let map;
let player;

function init() {
    console.log('Game Initialized');
    Input.init();

    map = new GameMap(testLevel);
    player = new Player(1.5, 1.5, 0, map);

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    if (player) {
        player.update(dt);
    }
}

function draw() {
    // Clear screen with black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

    // Draw Map (2D debug view)
    map.render2D(ctx, 0, 0);

    // Draw Player
    const pX = player.x * map.cellSize;
    const pY = player.y * map.cellSize;

    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(pX, pY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw Direction
    ctx.strokeStyle = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(pX, pY);
    ctx.lineTo(pX + Math.cos(player.angle) * 10, pY + Math.sin(player.angle) * 10);
    ctx.stroke();

    // Draw debugging info
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    const pressed = Input.getPressedKeys().join(', ');
    ctx.fillText(`Pressed: ${pressed}`, 10, 340); // Moved down below map (20*16 = 320)

    // Show active actions
    let y = 360;
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
