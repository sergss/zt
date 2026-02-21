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
let levelManager; // NEW

let gameState = 'MENU'; // MENU, PASSWORD, OPTIONS, SELECT_CHARACTER, PLAYING, KIA, GAMEOVER, LEVEL_COMPLETE, VICTORY, PAUSED

let menuSelectedIndex = 0;
const menuItems = ["NEW GAME", "PASSWORD", "OPTIONS"];
let pwdInput = "";
let pwdCursorX = 0;
let pwdCursorY = 0;
let pwdErrorTimer = 0;
const PWD_KEYS = [
    ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
    ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
    ['V', 'W', 'X', 'Y', 'Z', '0', '1'],
    ['2', '3', '4', '5', '6', '7', '8'],
    ['9', 'DEL', 'OK', '', '', '', '']
];
let optionVolume = 10;
let lastPassword = "";

function init() {
    console.log('Game Initialized');
    Input.init();

    roster = new CharacterRoster();
    textureManager = new TextureManager();
    hud = new HUD(CONFIG);
    levelManager = new LevelManager(); // NEW

    // Allow physical keyboard typing for password
    window.addEventListener('keydown', (e) => {
        if (gameState === 'PASSWORD') {
            const key = e.key.toUpperCase();
            if (key === 'BACKSPACE') {
                pwdInput = pwdInput.slice(0, -1);
                pwdErrorTimer = 0;
            } else if (key === 'ENTER') {
                if (pwdInput.length === 16) {
                    const decoded = PasswordSystem.decode(pwdInput);
                    if (decoded) {
                        levelManager.currentLevel = decoded.level;
                        roster = new CharacterRoster();
                        for (let i = 0; i < 5; i++) roster.characters[i].alive = decoded.alive[i];
                        if (roster.aliveCount() === 0) {
                            pwdErrorTimer = 2.0; // All dead
                        } else {
                            if (decoded.alive[decoded.activeCharIdx]) {
                                roster.selectedIndex = decoded.activeCharIdx;
                            } else {
                                roster.selectedIndex = roster.nextAliveIndex(0);
                            }
                            // Apply stats to roster
                            let c = roster.characters[roster.selectedIndex];
                            c.hp = decoded.hp || c.hp;
                            c.armor = decoded.armor || c.armor;

                            // Temporary store weapons and ammo to be applied in startLevel or here if player is created.
                            // Currently, startLevel creates the new Player object using the config. Let's add savedState to roster config.
                            c.savedState = {
                                weapons: decoded.weapons,
                                ammo: decoded.ammo
                            };

                            gameState = 'SELECT_CHARACTER';
                        }
                    } else {
                        pwdErrorTimer = 2.0;
                    }
                } else {
                    pwdErrorTimer = 2.0;
                }
            } else if (pwdInput.length < 16 && /^[A-Z0-9]$/.test(key)) {
                pwdInput += key;
                pwdErrorTimer = 0;
            }
        }
    });

    requestAnimationFrame(gameLoop);
}

function startLevel(characterConfig, isNextLevel = false) {
    const levelData = levelManager.getCurrentLevelData();
    map = new GameMap(levelData.map);

    if (isNextLevel && player) {
        // Keep surviving player stats, just move them and reset map reference
        player.x = levelData.playerStart.x;
        player.y = levelData.playerStart.y;
        player.angle = levelData.playerStart.angle;
        player.map = map;
    } else {
        // New character starting from currentLevel
        const newLevelData = levelManager.getCurrentLevelData();
        map = new GameMap(newLevelData.map);
        player = new Player(newLevelData.playerStart.x, newLevelData.playerStart.y, newLevelData.playerStart.angle, map, characterConfig);

        // Restore inventory if coming from password
        if (characterConfig && characterConfig.savedState) {
            player.weapons = characterConfig.savedState.weapons;
            player.ammo = characterConfig.savedState.ammo;
        }
    }

    // Step 10: Sprites - Placing all types for verification
    sprites = levelManager.getCurrentLevelData().items.map(item => {
        return new Sprite(item.x, item.y, item.type);
    });
    sprites.forEach(s => s.visible = true);

    // Step 11: Enemies
    enemies = levelManager.getCurrentLevelData().enemies.map(e => {
        return new Enemy(e.x, e.y, e.type);
    });

    raycaster = new Raycaster(map);
    renderer = new Renderer(ctx, CONFIG);

    gameState = 'PLAYING';
}

let kiaTimer = 0;
let levelTimer = 0; // shared timer for transitions
let showAutomap = false;

function update(dt) {
    if (gameState === 'MENU') {
        if (Input.isActionActive('forward')) {
            menuSelectedIndex--;
            if (menuSelectedIndex < 0) menuSelectedIndex = menuItems.length - 1;
            Input.keys['KeyW'] = false; Input.keys['ArrowUp'] = false;
        }
        if (Input.isActionActive('backward')) {
            menuSelectedIndex++;
            if (menuSelectedIndex >= menuItems.length) menuSelectedIndex = 0;
            Input.keys['KeyS'] = false; Input.keys['ArrowDown'] = false;
        }
        if (Input.isActionActive('shoot')) {
            if (typeof AudioSystem !== 'undefined') AudioSystem.init();
            if (menuSelectedIndex === 0) {
                gameState = 'SELECT_CHARACTER';
                levelManager.currentLevel = 0;
                roster = new CharacterRoster();
            } else if (menuSelectedIndex === 1) {
                gameState = 'PASSWORD';
                pwdInput = "";
                pwdCursorX = 0;
                pwdCursorY = 0;
                pwdErrorTimer = 0;
            } else if (menuSelectedIndex === 2) {
                gameState = 'OPTIONS';
            }
            Input.keys['Space'] = false; Input.keys['Enter'] = false;
        }
        return;
    }

    if (gameState === 'OPTIONS') {
        if (Input.isActionActive('turnRight') || Input.actions.turnRight.some(k => Input.keys[k])) {
            optionVolume = Math.min(10, optionVolume + 1);
            Input.keys['KeyD'] = false; Input.keys['ArrowRight'] = false;
        }
        if (Input.isActionActive('turnLeft') || Input.actions.turnLeft.some(k => Input.keys[k])) {
            optionVolume = Math.max(0, optionVolume - 1);
            Input.keys['KeyA'] = false; Input.keys['ArrowLeft'] = false;
        }
        if (Input.isActionActive('shoot')) {
            gameState = 'MENU';
            Input.keys['Space'] = false; Input.keys['Enter'] = false;
        }
        return;
    }

    if (gameState === 'PASSWORD') {
        if (pwdErrorTimer > 0) pwdErrorTimer -= dt;

        if (Input.isActionActive('turnRight') || Input.actions.turnRight.some(k => Input.keys[k])) {
            pwdCursorX++;
            if (pwdCursorX >= PWD_KEYS[pwdCursorY].length || PWD_KEYS[pwdCursorY][pwdCursorX] === '') pwdCursorX = 0;
            Input.keys['KeyD'] = false; Input.keys['ArrowRight'] = false;
        }
        if (Input.isActionActive('turnLeft') || Input.actions.turnLeft.some(k => Input.keys[k])) {
            pwdCursorX--;
            if (pwdCursorX < 0) pwdCursorX = PWD_KEYS[pwdCursorY].filter(k => k !== '').length - 1;
            Input.keys['KeyA'] = false; Input.keys['ArrowLeft'] = false;
        }
        if (Input.isActionActive('forward')) {
            pwdCursorY--;
            if (pwdCursorY < 0) pwdCursorY = PWD_KEYS.length - 1;
            if (PWD_KEYS[pwdCursorY][pwdCursorX] === '') pwdCursorX = 0;
            Input.keys['KeyW'] = false; Input.keys['ArrowUp'] = false;
        }
        if (Input.isActionActive('backward')) {
            pwdCursorY++;
            if (pwdCursorY >= PWD_KEYS.length) pwdCursorY = 0;
            if (PWD_KEYS[pwdCursorY][pwdCursorX] === '') pwdCursorX = 0;
            Input.keys['KeyS'] = false; Input.keys['ArrowDown'] = false;
        }
        if (Input.isActionActive('shoot')) {
            const key = PWD_KEYS[pwdCursorY][pwdCursorX];
            if (key === 'DEL') {
                pwdInput = pwdInput.slice(0, -1);
            } else if (key === 'OK') {
                if (pwdInput.length === 16) {
                    const decoded = PasswordSystem.decode(pwdInput);
                    if (decoded) {
                        levelManager.currentLevel = decoded.level;
                        roster = new CharacterRoster();
                        for (let i = 0; i < 5; i++) roster.characters[i].alive = decoded.alive[i];
                        if (roster.aliveCount() === 0) {
                            pwdErrorTimer = 2.0; // All dead
                        } else {
                            if (decoded.alive[decoded.activeCharIdx]) {
                                roster.selectedIndex = decoded.activeCharIdx;
                            } else {
                                roster.selectedIndex = roster.nextAliveIndex(0);
                            }

                            let c = roster.characters[roster.selectedIndex];
                            c.hp = decoded.hp || c.hp;
                            c.armor = decoded.armor || c.armor;
                            c.savedState = {
                                weapons: decoded.weapons,
                                ammo: decoded.ammo
                            };

                            gameState = 'SELECT_CHARACTER';
                        }
                    } else {
                        pwdErrorTimer = 2.0;
                    }
                } else {
                    pwdErrorTimer = 2.0;
                }
            } else {
                if (pwdInput.length < 16) pwdInput += key;
            }
            Input.keys['Space'] = false; Input.keys['Enter'] = false;
        }
        if (Input.keys['Escape']) {
            gameState = 'MENU';
            Input.keys['Escape'] = false;
        }
        return;
    }

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

    if (gameState === 'LEVEL_COMPLETE') {
        if (Input.isActionActive('shoot')) {
            if (levelManager.nextLevel()) {
                startLevel(null, true);
            } else {
                gameState = 'VICTORY';
            }
            Input.keys['Space'] = false;
            Input.keys['Enter'] = false;
        }
        return;
    }

    if (gameState === 'VICTORY') {
        if (Input.isActionActive('shoot')) { // Press Enter to restart
            gameState = 'SELECT_CHARACTER';
            roster = new CharacterRoster(); // Reset roster
            Input.keys['Space'] = false;
            Input.keys['Enter'] = false;
        }
        return;
    }

    if (gameState === 'GAMEOVER') {
        if (Input.isActionActive('shoot')) { // Press Enter to restart
            gameState = 'SELECT_CHARACTER';
            roster = new CharacterRoster(); // Reset roster
            Input.keys['Space'] = false;
            Input.keys['Enter'] = false;
        }
        return;
    }

    if (gameState === 'PAUSED') {
        if (Input.keys['Escape']) {
            gameState = 'PLAYING';
            Input.keys['Escape'] = false;
        }
        if (Input.isActionActive('shoot')) {
            gameState = 'MENU';
            Input.keys['Space'] = false; Input.keys['Enter'] = false;
        }
        return;
    }

    if (gameState === 'PLAYING') {
        if (Input.keys['Escape']) {
            gameState = 'PAUSED';
            Input.keys['Escape'] = false;
        }

        if (Input.isActionActive('map')) {
            showAutomap = !showAutomap;
            Input.keys['Tab'] = false; // Debounce
        }

        if (player) {
            player.update(dt);

            if (player.hp <= 0) {
                roster.kill(player.name);
                gameState = 'KIA';
                kiaTimer = 3.0; // Show KIA screen for 3 seconds
                return;
            }

            // Sync enemies count to LevelManager
            const enemiesLeft = enemies.filter(e => e.hp > 0).length;
            levelManager.setEnemiesLeft(enemiesLeft);

            // Check Elevator Interaction (Type 8)
            let nearElevator = false;
            const checkDist = 0.6; // player radius is 0.2, so 0.6 checks surrounding tiles
            if (map.grid[Math.floor(player.y)] && map.grid[Math.floor(player.y)][Math.floor(player.x + checkDist)] === 8) nearElevator = true;
            if (map.grid[Math.floor(player.y)] && map.grid[Math.floor(player.y)][Math.floor(player.x - checkDist)] === 8) nearElevator = true;
            if (map.grid[Math.floor(player.y + checkDist)] && map.grid[Math.floor(player.y + checkDist)][Math.floor(player.x)] === 8) nearElevator = true;
            if (map.grid[Math.floor(player.y - checkDist)] && map.grid[Math.floor(player.y - checkDist)][Math.floor(player.x)] === 8) nearElevator = true;

            if (nearElevator && levelManager.isElevatorActive()) {
                if (typeof AudioSystem !== 'undefined') AudioSystem.playElevator();
                gameState = 'LEVEL_COMPLETE';
                const aliveStates = roster.characters.map(c => c.alive);
                let charIndex = roster.characters.findIndex(c => c.name === player.name);
                lastPassword = PasswordSystem.encode({
                    level: levelManager.currentLevel + 1,
                    alive: aliveStates,
                    activeCharIdx: charIndex >= 0 ? charIndex : 0,
                    hp: Math.floor(player.hp),
                    armor: Math.floor(player.armor),
                    weapons: player.weapons,
                    ammo: player.ammo
                });
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
                        if (typeof AudioSystem !== 'undefined') AudioSystem.playItemPickup();
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

    if (gameState === 'MENU') {
        ctx.fillStyle = '#f00';
        ctx.font = '60px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("ZERO TOLERANCE", CONFIG.SCREEN_WIDTH / 2, 150);

        ctx.font = '30px monospace';
        menuItems.forEach((item, index) => {
            if (index === menuSelectedIndex) {
                ctx.fillStyle = '#ff0';
                ctx.fillText("> " + item + " <", CONFIG.SCREEN_WIDTH / 2, 300 + index * 60);
            } else {
                ctx.fillStyle = '#fff';
                ctx.fillText(item, CONFIG.SCREEN_WIDTH / 2, 300 + index * 60);
            }
        });
        return;
    }

    if (gameState === 'OPTIONS') {
        ctx.fillStyle = '#fff';
        ctx.font = '40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("OPTIONS", CONFIG.SCREEN_WIDTH / 2, 150);

        ctx.font = '30px monospace';
        ctx.fillStyle = '#ff0';
        ctx.fillText("> VOLUME: " + optionVolume + " <", CONFIG.SCREEN_WIDTH / 2, 300);

        ctx.fillStyle = '#888';
        ctx.font = '20px monospace';
        ctx.fillText("Press SPACE to return", CONFIG.SCREEN_WIDTH / 2, 500);
        return;
    }

    if (gameState === 'PASSWORD') {
        ctx.fillStyle = '#fff';
        ctx.font = '40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("ENTER PASSWORD", CONFIG.SCREEN_WIDTH / 2, 80);

        // Draw input box
        ctx.fillStyle = '#111';
        // Need wider box for 16 chars: approx 16 * ~24 = 380px plus padding
        ctx.fillRect(CONFIG.SCREEN_WIDTH / 2 - 250, 110, 500, 60);
        ctx.strokeStyle = '#555';
        ctx.strokeRect(CONFIG.SCREEN_WIDTH / 2 - 250, 110, 500, 60);

        ctx.fillStyle = pwdErrorTimer > 0 ? '#f00' : '#0f0';
        ctx.font = '30px monospace';
        let displayPwd = pwdInput.padEnd(16, '_').match(/.{1,4}/g).join('-');
        ctx.fillText(displayPwd, CONFIG.SCREEN_WIDTH / 2, 150);

        if (pwdErrorTimer > 0) {
            ctx.fillStyle = '#f00';
            ctx.font = '20px monospace';
            ctx.fillText("INVALID PASSWORD", CONFIG.SCREEN_WIDTH / 2, 200);
        }

        // Draw On-Screen Keyboard
        const startX = CONFIG.SCREEN_WIDTH / 2 - (7 * 60) / 2 + 30;
        const startY = 240;
        ctx.font = '30px monospace';

        for (let y = 0; y < PWD_KEYS.length; y++) {
            for (let x = 0; x < PWD_KEYS[y].length; x++) {
                const key = PWD_KEYS[y][x];
                if (!key) continue;

                let px = startX + x * 60;
                let py = startY + y * 50;

                if (x === pwdCursorX && y === pwdCursorY) {
                    ctx.fillStyle = '#333';
                    ctx.fillRect(px - 25, py - 35, 50, 50);
                    ctx.fillStyle = '#ff0';
                } else {
                    ctx.fillStyle = '#fff';
                }

                if (key === 'DEL' || key === 'OK') {
                    ctx.font = '20px monospace';
                    ctx.fillText(key, px, py - 5);
                    ctx.font = '30px monospace';
                } else {
                    ctx.fillText(key, px, py);
                }
            }
        }

        ctx.fillStyle = '#888';
        ctx.font = '20px monospace';
        ctx.fillText("Type on keyboard and press ENTER", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT - 60);
        ctx.fillText("or select OK using WASD+SPACE", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT - 35);
        ctx.fillText("Press ESC to return to menu", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT - 10);
        return;
    }

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
                ctx.fillRect(CONFIG.SCREEN_WIDTH / 2 - 350, y - 45, 700, 80);
                ctx.strokeStyle = '#fff';
                ctx.strokeRect(CONFIG.SCREEN_WIDTH / 2 - 350, y - 45, 700, 80);
            }

            // Draw Portrait
            if (hud && hud.drawFace) {
                // Pass a mock 'player' object with the character's stats
                // The highlight box is y-45 to y+35 (80px tall).
                // Let's draw the face at size 68 (width 68, height 68 * 1.1 = 74.8).
                // y - 42 puts it right at the top of the highlight box + 3px padding.
                hud.drawFace(ctx, char, CONFIG.SCREEN_WIDTH / 2 - 340, y - 42, 68);
            }

            // Grey out dead characters
            ctx.fillStyle = char.alive ? '#fff' : '#555';

            // Name
            ctx.textAlign = 'left';
            ctx.font = '24px monospace';
            ctx.textBaseline = 'top';
            ctx.fillText(char.name + (char.alive ? "" : " (DECEASED)"), CONFIG.SCREEN_WIDTH / 2 - 250, y - 35);

            // Stats
            ctx.font = '16px monospace';
            ctx.fillStyle = char.alive ? '#aaa' : '#444';
            ctx.fillText(`HP: ${char.hp} | Armor: ${char.armor} | Speed: ${char.speed}`, CONFIG.SCREEN_WIDTH / 2 - 250, y - 5);
            ctx.textBaseline = 'alphabetic'; // reset
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

    if (gameState === 'LEVEL_COMPLETE') {
        ctx.fillStyle = '#002200';
        ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
        ctx.fillStyle = '#0f0';
        ctx.font = '50px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("SECTOR SECURED", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 - 80);

        if (lastPassword) {
            ctx.fillStyle = '#aaa';
            ctx.font = '24px monospace';
            ctx.fillText("PASSWORD FOR NEXT LEVEL:", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 - 10);

            ctx.fillStyle = '#ff0';
            ctx.font = '30px monospace';
            ctx.fillText(lastPassword.match(/.{1,4}/g).join('-'), CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 + 40);
        }

        ctx.fillStyle = '#fff';
        ctx.font = '20px monospace';
        ctx.fillText("Press SPACE to descend...", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 + 120);
        return;
    }

    if (gameState === 'VICTORY') {
        ctx.fillStyle = '#000044';
        ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
        ctx.fillStyle = '#00ffff';
        ctx.font = '60px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("MISSION ACCOMPLISHED", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 - 40);
        ctx.fillStyle = '#fff';
        ctx.font = '24px monospace';
        ctx.fillText("The station is clear.", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 + 20);
        ctx.fillStyle = '#aaa';
        ctx.font = '16px monospace';
        ctx.fillText("Press ENTER to return to roster.", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 + 60);
        return;
    }

    if (gameState === 'PLAYING') {
        // Draw 3D View (Step 5)
        if (renderer && player && map && raycaster && textureManager) {
            renderer.render3D(player, map, raycaster, textureManager, levelManager.isElevatorActive());

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

        // Draw Map (2D debug view) inside HUD
        // Draw AFTER HUD so it is not covered by the frame
        // consoleY = VIEWPORT_Y (80) + VIEWPORT_H (340) = 420
        // mapY = 420 + 10 = 430. mapX = 300
        const mapOffsetX = 300;
        const mapOffsetY = 430;

        ctx.save();
        // Clip map to its dedicated HUD window
        ctx.beginPath();
        ctx.rect(300, 430, 300, 160);
        ctx.clip();

        // Let's scroll the map so the player is mostly centered in the UI box
        const playerScreenX = player.x * map.cellSize;
        const playerScreenY = player.y * map.cellSize;
        const scrollX = mapOffsetX + 150 - playerScreenX;
        const scrollY = mapOffsetY + 80 - playerScreenY;

        map.render2D(ctx, scrollX, scrollY);

        // Draw Player on Map
        const pX = scrollX + playerScreenX;
        const pY = scrollY + playerScreenY;

        ctx.fillStyle = '#f00';
        ctx.beginPath();
        ctx.arc(pX, pY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ff0';
        ctx.beginPath();
        ctx.moveTo(pX, pY);
        ctx.lineTo(pX + Math.cos(player.angle) * 10, pY + Math.sin(player.angle) * 10);
        ctx.stroke();

        ctx.restore();

        // Step 16: Fullscreen Automap Overlay
        if (showAutomap && renderer && player && map) {
            renderer.renderAutomap(player, map);
        }
    }

    if (gameState === 'PAUSED') {
        // Redraw game under pause overlay? The game is actually cleared every frame.
        // If we want it frozen, we should just let PLAYING draw but skip update.
        // So let's draw the PLAYING scene first if PAUSED.
        if (renderer && player && map && raycaster && textureManager) {
            renderer.render3D(player, map, raycaster, textureManager, false);
            const allSprites = sprites.concat(enemies);
            renderer.renderSprites(player, allSprites, textureManager);
            renderer.renderWeapon(player);
            if (hud) hud.render(ctx, player, enemies.filter(e => e.hp > 0).length);
        }

        // Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
        ctx.fillStyle = '#fff';
        ctx.font = '50px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("PAUSED", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 - 30);
        ctx.font = '20px monospace';
        ctx.fillText("Press ESC to resume", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 + 20);
        ctx.fillText("Press SPACE to quit to menu", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 + 60);
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
