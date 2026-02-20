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
let roster;

let gameState = 'SELECT_CHARACTER'; // SELECT_CHARACTER, PLAYING, KIA, GAMEOVER

function init() {
    console.log('Game Initialized');
    Input.init();

    roster = new CharacterRoster();
    textureManager = new TextureManager();
    hud = new HUD(CONFIG);

    requestAnimationFrame(gameLoop);
}

function startLevel(characterConfig) {
    map = new GameMap(testLevel);
    player = new Player(1.5, 1.5, 0, map, characterConfig);

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
    sprites.forEach(s => s.visible = true);

    // Step 11: Enemies (5 enemies of different types)
    enemies = [
        new Enemy(14.5, 14.5, 'soldier'),
        new Enemy(16.5, 14.5, 'soldier'),
        new Enemy(15.5, 16.5, 'zombie'),
        new Enemy(14.5, 17.5, 'zombie'),
        new Enemy(17.5, 17.5, 'alien')
    ];

    raycaster = new Raycaster(map);
    renderer = new Renderer(ctx, CONFIG);

    gameState = 'PLAYING';
}

let kiaTimer = 0;

function update(dt) {
    if (gameState === 'SELECT_CHARACTER') {
        if (Input.isActionActive('forward')) {
            roster.selectedIndex--;
            if (roster.selectedIndex < 0) roster.selectedIndex = roster.characters.length - 1;
            Input.keys['ArrowUp'] = false; // Debounce hack
            Input.keys['w'] = false;
        }
        if (Input.isActionActive('backward')) {
            roster.selectedIndex++;
            if (roster.selectedIndex >= roster.characters.length) roster.selectedIndex = 0;
            Input.keys['ArrowDown'] = false;
            Input.keys['s'] = false;
        }
        if (Input.isActionActive('shoot')) { // Enter or Space
            const selected = roster.characters[roster.selectedIndex];
            if (selected.alive) {
                startLevel(selected);
            }
            Input.keys['Space'] = false;
            Input.keys['Enter'] = false;
        }
        return;
    }

    if (gameState === 'KIA') {
        kiaTimer -= dt;
        if (kiaTimer <= 0) {
            if (roster.isGameOver()) {
                gameState = 'GAMEOVER';
            } else {
                gameState = 'SELECT_CHARACTER';
                roster.selectedIndex = roster.nextAliveIndex(0);
            }
        }
        return;
    }

    if (gameState === 'GAMEOVER') {
        // Wait for restart maybe later
        return;
    }

    if (gameState === 'PLAYING') {
        if (player) {
            player.update(dt);

            if (player.hp <= 0) {
                roster.kill(player.name);
                gameState = 'KIA';
                kiaTimer = 3.0; // Show KIA screen for 3 seconds
                return;
            }

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
}

function draw() {
    // Clear screen with black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

    if (gameState === 'SELECT_CHARACTER') {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

        ctx.fillStyle = '#fff';
        ctx.font = '30px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("CHOOSE YOUR OPERATIVE", CONFIG.SCREEN_WIDTH / 2, 50);

        roster.characters.forEach((char, index) => {
            let y = 120 + index * 80;

            // Highlight selected
            if (index === roster.selectedIndex) {
                ctx.fillStyle = '#333';
                ctx.fillRect(CONFIG.SCREEN_WIDTH / 2 - 300, y - 40, 600, 70);
                ctx.strokeStyle = '#fff';
                ctx.strokeRect(CONFIG.SCREEN_WIDTH / 2 - 300, y - 40, 600, 70);
            }

            // Grey out dead characters
            ctx.fillStyle = char.alive ? '#fff' : '#555';

            // Name
            ctx.textAlign = 'left';
            ctx.font = '24px monospace';
            ctx.fillText(char.name + (char.alive ? "" : " (DECEASED)"), CONFIG.SCREEN_WIDTH / 2 - 280, y);

            // Stats
            ctx.font = '16px monospace';
            ctx.fillStyle = char.alive ? '#aaa' : '#444';
            ctx.fillText(`HP: ${char.hp} | Armor: ${char.armor} | Speed: ${char.speed}`, CONFIG.SCREEN_WIDTH / 2 - 280, y + 20);
        });

        // Instructions
        ctx.fillStyle = '#0f0';
        ctx.textAlign = 'center';
        ctx.font = '20px monospace';
        ctx.fillText("Use UP/DOWN arrows to select. Press ENTER or SPACE to confirm.", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT - 30);
        return;
    }

    if (gameState === 'KIA') {
        ctx.fillStyle = '#400'; // Dark red
        ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
        ctx.fillStyle = '#f00';
        ctx.font = '50px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("K. I. A.", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 - 30);
        ctx.fillStyle = '#fff';
        ctx.font = '30px monospace';
        ctx.fillText(player.name + " was killed in action.", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 + 30);
        return;
    }

    if (gameState === 'GAMEOVER') {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
        ctx.fillStyle = '#f00';
        ctx.font = '60px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("GAME OVER", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2);
        ctx.fillStyle = '#fff';
        ctx.font = '20px monospace';
        ctx.fillText("The team has been wiped out.", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 + 50);
        return;
    }

    if (gameState === 'PLAYING') {
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

        // Draw Damage Flash (Step 13)
        if (player && player.damageFlash > 0) {
            // Start fading from alpha 0.6 downwards
            ctx.fillStyle = `rgba(255, 0, 0, ${player.damageFlash * 2})`;
            ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
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
