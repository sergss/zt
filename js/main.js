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

        // Weapon Switching
        for (let i = 1; i <= 7; i++) {
            if (Input.isActionActive('weapon' + i)) {
                player.switchWeapon(i - 1);
            }
        }

        // Shoot Action
        if (Input.isActionActive('shoot')) {
            // 1. Try to shoot weapon
            if (player.shoot(Date.now() / 1000)) {
                // Shot fired successfully
                // Logic for door opening moved: Doors can be opened by "using" (Space) or maybe shooting triggers it?
                // For now, let's keep space as "use" AND "shoot" OR separate them.
                // Classic Wolf3D: Ctrl to shoot, Space to Open.
                // Our config: Space is shoot. 
                // Let's make shooting ALSO open doors if close enough? 

                // Or: Check door if NOT fired? No, Space is primarily shoot.
                // Let's do: Attempt shoot. If shoot, also check for door hit?
                // Actually, Wolf3D: Space opens doors. Ctrl shoots.

                // User's Input Map: shoot = Space.
                // If we want space to open doors, we might have issues if we shoot every time.
                // Let's assume Space = Shoot AND Open Door (if in front).

                const dist = 1.0;
                const targetX = Math.floor(player.x + Math.cos(player.angle) * dist);
                const targetY = Math.floor(player.y + Math.sin(player.angle) * dist);

                if (map.getDoor(targetX, targetY)) {
                    map.tryOpenDoor(targetX, targetY);
                }
            } else {
                // If didn't fire (cooldown or no ammo), still try to open door?
                // Yes, useful for when out of ammo or just wanting to open.
                const dist = 1.0;
                const targetX = Math.floor(player.x + Math.cos(player.angle) * dist);
                const targetY = Math.floor(player.y + Math.sin(player.angle) * dist);

                if (map.getDoor(targetX, targetY)) {
                    map.tryOpenDoor(targetX, targetY);
                }
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
        renderer.renderWeapon(player);
    }



    // Draw HUD (Step 8)
    if (hud && player) {
        hud.render(ctx, player, 0); // 0 enemies for now
    }

    // Draw Map (2D debug view)
    // Draw AFTER HUD so it is not covered by the frame
    map.render2D(ctx, 0, 0);

    // Draw Player on Map
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
