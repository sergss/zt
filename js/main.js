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
let raycaster;
let renderer;
let textureManager;
let hud;

function init() {
    console.log('Game Initialized');
    Input.init();

    map = new GameMap(testLevel);
    player = new Player(1.5, 1.5, 0, map);

    // Initialize Raycaster and Renderer for Step 5
    raycaster = new Raycaster(map);
    renderer = new Renderer(ctx, CONFIG);
    textureManager = new TextureManager();
    hud = new HUD(CONFIG);

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    if (player) {
        player.update(dt);

        // Door Interaction (Space)
        if (Input.isActionActive('shoot')) {
            // Simple interaction: Check cell in front of player
            const dist = 1.0;
            const targetX = Math.floor(player.x + Math.cos(player.angle) * dist);
            const targetY = Math.floor(player.y + Math.sin(player.angle) * dist);

            if (map.getDoor(targetX, targetY)) {
                map.tryOpenDoor(targetX, targetY);
            }
        }
    }

    if (map) {
        map.update(dt);
    }
}

function draw() {
    // Clear screen with black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

    // Draw 3D View (Step 5)
    if (renderer && player && map && raycaster && textureManager) {
        renderer.render3D(player, map, raycaster, textureManager);
    }

    // Draw Map (2D debug view) - Keep it for now, maybe move it or toggle it?
    // Tasks.md says "Keep 2D-minimap nearby (for debug)"
    // Let's render it at 0,0 (top left)
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

    // Draw HUD (Step 8)
    if (hud && player) {
        hud.render(ctx, player, 0); // 0 enemies for now
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
