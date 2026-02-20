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
let sprites = [];
let enemies = [];

function init() {
    console.log('Game Initialized');
    Input.init();

    map = new GameMap(testLevel);
    player = new Player(1.5, 1.5, 0, map);

    // Step 10: Sprites - Placing all types for verification
    sprites = [
        new Sprite(3.5, 6.5, 'healthBig'),     // Medkit (+25 HP)
        new Sprite(4.5, 6.5, 'armor'),         // Armor (+25)
        new Sprite(5.5, 6.5, 'key'),           // Key

        // Weapons
        new Sprite(2.5, 6.5, 'weaponShotgun'),
        new Sprite(2.5, 7.5, 'weaponAssaultRifle'),
        new Sprite(2.5, 8.5, 'weaponMachinegun'),
        new Sprite(3.5, 8.5, 'weaponRocketLauncher'),
        new Sprite(4.5, 8.5, 'weaponFlamethrower'),
        new Sprite(5.5, 8.5, 'weaponLaser'),

        // Ammo
        new Sprite(6.5, 6.5, 'ammoBullets'),
        new Sprite(6.5, 7.5, 'ammoShells'),
        new Sprite(6.5, 8.5, 'ammoBelt'),
        new Sprite(7.5, 6.5, 'ammoRockets'),
        new Sprite(7.5, 7.5, 'ammoFuel'),
        new Sprite(7.5, 8.5, 'ammoCells')
    ];
    // Make them visible by default
    sprites.forEach(s => s.visible = true);

    // Step 11: Enemies (5 enemies of different types)
    enemies = [
        new Enemy(14.5, 14.5, 'soldier'),
        new Enemy(16.5, 14.5, 'soldier'),
        new Enemy(15.5, 16.5, 'zombie'),
        new Enemy(14.5, 17.5, 'zombie'),
        new Enemy(17.5, 17.5, 'alien')
    ];

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
                const weaponProto = WEAPONS[player.currentWeaponIndex];

                for (let s = 0; s < (weaponProto.count || 1); s++) {
                    let shootAngle = player.angle + (Math.random() - 0.5) * weaponProto.spread;
                    let rayHit = raycaster.castRay(player.x, player.y, shootAngle);
                    let wallDist = rayHit ? rayHit.distance : weaponProto.range;

                    let closestEnemy = null;
                    let closestDist = Math.min(weaponProto.range, wallDist);

                    enemies.forEach(enemy => {
                        if (enemy.hp <= 0) return;

                        const dx = enemy.x - player.x;
                        const dy = enemy.y - player.y;
                        const dist = Math.hypot(dx, dy);

                        if (dist < closestDist) {
                            let angleToEnemy = Math.atan2(dy, dx);
                            let diff = angleToEnemy - shootAngle;

                            while (diff > Math.PI) diff -= Math.PI * 2;
                            while (diff < -Math.PI) diff += Math.PI * 2;

                            // The enemy is approx 0.8 units wide. angular width ~= 0.4 / dist. 
                            let hitAngle = 0.4 / Math.max(0.5, dist);

                            if (Math.abs(diff) < hitAngle) {
                                closestEnemy = enemy;
                                closestDist = dist;
                            }
                        }
                    });

                    if (closestEnemy) {
                        closestEnemy.takeDamage(weaponProto.damage);
                    }
                }

                const dist = 1.0;
                const targetX = Math.floor(player.x + Math.cos(player.angle) * dist);
                const targetY = Math.floor(player.y + Math.sin(player.angle) * dist);

                if (map.getDoor(targetX, targetY)) {
                    map.tryOpenDoor(targetX, targetY);
                }
            } else {
                // If didn't fire (cooldown or no ammo), still try to open door
                const dist = 1.0;
                const targetX = Math.floor(player.x + Math.cos(player.angle) * dist);
                const targetY = Math.floor(player.y + Math.sin(player.angle) * dist);

                if (map.getDoor(targetX, targetY)) {
                    map.tryOpenDoor(targetX, targetY);
                }
            }
        }

        // Sprite Updates (Step 10 pick up)
        for (let i = sprites.length - 1; i >= 0; i--) {
            const sprite = sprites[i];
            if (sprite.active) {
                sprite.updateDistance(player);
                if (sprite.checkPickup(player)) {
                    console.log('Picked up:', sprite.type);
                }
            }
        }
    }

    if (map) {
        map.update(dt);
    }

    // Step 11: Update enemies
    enemies.forEach(enemy => {
        enemy.update(dt, player, map);
    });
}

function draw() {
    // Clear screen with black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

    // Draw 3D View (Step 5)
    if (renderer && player && map && raycaster && textureManager) {
        renderer.render3D(player, map, raycaster, textureManager);

        // Step 10 & 11: Render Sprites and Enemies
        // We combine them for correct Z-sorting
        const allSprites = sprites.concat(enemies);
        renderer.renderSprites(player, allSprites, textureManager);

        renderer.renderWeapon(player);
    }

    // Draw HUD (Step 8)
    if (hud && player) {
        // Count active enemies (hp > 0)
        const enemiesLeft = enemies.filter(e => e.hp > 0).length;
        hud.render(ctx, player, enemiesLeft);
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
