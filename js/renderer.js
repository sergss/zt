class Renderer {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.width = config.VIEWPORT_W;
        this.height = config.VIEWPORT_H;
        this.x = config.VIEWPORT_X;
        this.y = config.VIEWPORT_Y;
        this.fov = Math.PI / 3; // 60 degrees

        // Z-Buffer: Array to store perpendicular distance to wall for each column
        this.zBuffer = new Array(this.width).fill(0);
    }

    render3D(player, map, raycaster, textureManager, isElevatorActive = false) {
        // Draw ceiling and floor
        this.ctx.fillStyle = '#333333'; // Ceiling
        this.ctx.fillRect(this.x, this.y, this.width, this.height / 2);
        this.ctx.fillStyle = '#555555'; // Floor
        this.ctx.fillRect(this.x, this.y + this.height / 2, this.width, this.height / 2);

        // Distance fog for ceiling and floor
        // The horizon is at this.y + this.height/2.
        let horizonY = this.y + this.height / 2;
        let gradientCeil = this.ctx.createLinearGradient(0, this.y, 0, horizonY);
        gradientCeil.addColorStop(0, "rgba(0,0,0,0)");
        gradientCeil.addColorStop(1, "rgba(0,0,0,0.8)"); // Darker near horizon (further away)
        this.ctx.fillStyle = gradientCeil;
        this.ctx.fillRect(this.x, this.y, this.width, this.height / 2);

        let gradientFloor = this.ctx.createLinearGradient(0, horizonY, 0, this.y + this.height);
        gradientFloor.addColorStop(0, "rgba(0,0,0,0.8)"); // Darker near horizon
        gradientFloor.addColorStop(1, "rgba(0,0,0,0)");
        this.ctx.fillStyle = gradientFloor;
        this.ctx.fillRect(this.x, horizonY, this.width, this.height / 2);

        // Raycasting
        for (let x = 0; x < this.width; x++) {
            // Calculate ray angle
            let rayAngle = (player.angle - this.fov / 2.0) + (x / this.width) * this.fov;

            let result = raycaster.castRay(player.x, player.y, rayAngle);

            if (result.hit > 0) {
                // Correct fish-eye effect
                let perpDist = result.distance * Math.cos(rayAngle - player.angle);

                // Store in Z-Buffer
                this.zBuffer[x] = perpDist;

                // Calculate height of line to draw on screen
                let lineHeight = Math.floor(this.height / perpDist);

                // Texture Mapping
                let tex = textureManager.getTexture(result.hit);

                if (tex) {
                    let texX = Math.floor(result.wallX * textureManager.size);

                    // Destination rectangle (strip)
                    let drawY = (this.height - lineHeight) / 2;

                    try {
                        this.ctx.drawImage(
                            tex,
                            texX, 0, 1, textureManager.size,
                            this.x + x, this.y + drawY, 1, lineHeight
                        );
                    } catch (e) {
                        this.ctx.fillStyle = '#ff00ff'; // Error color
                        this.ctx.fillRect(this.x + x, this.y + drawY, 1, lineHeight);
                    }
                } else {
                    // Fallback to solid color
                    let color = map.getColor(result.hit);
                    this.ctx.fillStyle = color;
                    let drawY = (this.height - lineHeight) / 2;
                    this.ctx.fillRect(this.x + x, this.y + drawY, 1, lineHeight);
                }

                // Elevator Active Flickering
                if (result.hit === 8 && isElevatorActive) {
                    let time = Date.now() / 200;
                    let alpha = 0.5 + (Math.sin(time) * 0.4); // oscillates between 0.1 and 0.9
                    this.ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
                    let drawY = (this.height - lineHeight) / 2;
                    this.ctx.fillRect(this.x + x, this.y + drawY, 1, lineHeight);
                }

                // Darken side walls
                if (result.side === 1) {
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    let drawY = (this.height - lineHeight) / 2;
                    this.ctx.fillRect(this.x + x, this.y + drawY, 1, lineHeight);
                }

                // Distance fog overlay
                // Maximum visibility distance is around 12 units
                const fogDist = 12.0;
                if (perpDist > 2.0) {
                    let fogAlpha = Math.min(1.0, (perpDist - 2.0) / (fogDist - 2.0));
                    this.ctx.fillStyle = `rgba(0, 0, 0, ${fogAlpha})`;
                    let drawY = (this.height - lineHeight) / 2;
                    this.ctx.fillRect(this.x + x, this.y + drawY, 1, lineHeight);
                }

            } else {
                this.zBuffer[x] = Infinity; // Infinite distance if no hit
            }
        }
    }

    renderSprites(player, sprites, textureManager) {
        // 1. Calculate distance to each sprite
        for (let sprite of sprites) {
            sprite.updateDistance(player);
        }

        // 2. Sort sprites from far to close
        sprites.sort((a, b) => b.distance - a.distance);

        // 3. Project and Render
        for (let sprite of sprites) {
            if (!sprite.visible) continue;

            // Translate sprite position relative to camera
            const spriteX = sprite.x - player.x;
            const spriteY = sprite.y - player.y;

            // Transform with inverse camera matrix
            // [ planeX   dirX ] -1                                       [ dirY      -dirX ]
            // [               ]       =  1/(planeX*dirY-dirX*planeY) *   [                 ]
            // [ planeY   dirY ]                                          [ -planeY  planeX ]

            // Simplified projection logic based on Lodev's Raycasting Tutorial
            // We need player Direction vector (dirX, dirY) and Plane vector (planeX, planeY)
            // Derived from angle and FOV.
            // Direction:
            const dirX = Math.cos(player.angle);
            const dirY = Math.sin(player.angle);
            // Plane (perpendicular to dir, length tan(FOV/2))
            const planeLen = Math.tan(this.fov / 2); // 0.66 for FOV 66
            const planeX = -dirY * planeLen; // Rotate 90 deg?
            const planeY = dirX * planeLen;

            const invDet = 1.0 / (planeX * dirY - dirX * planeY); // Calculation required?

            // Actually, let's use the simpler angle-based projection if we don't have plane vectors explicitly stored.
            // Calculate angle to sprite relative to player angle
            let spriteAngle = Math.atan2(spriteY, spriteX) - player.angle;

            // Normalize angle to -PI to +PI
            while (spriteAngle < -Math.PI) spriteAngle += Math.PI * 2;
            while (spriteAngle > Math.PI) spriteAngle -= Math.PI * 2;

            // Check if visible (within FOV)
            // Small epsilon for clipping
            if (Math.abs(spriteAngle) < (this.fov / 2) + 0.2) {

                const dist = Math.sqrt(sprite.distance);
                const perpDist = dist * Math.cos(spriteAngle); // Fix fisheye? No, sprite usually uses direct distance for size, but perp for zbuffer check?
                // Standard: use perpDist for screen X, but size can be based on real dist.

                const screenX = (0.5 * (1 + spriteAngle / (this.fov / 2))) * this.width;

                const spriteHeight = Math.abs(this.height / dist); // Scale sprite
                const spriteWidth = Math.abs(this.height / dist); // Aspect ratio 1:1 generally

                const spriteTopY = (this.height - spriteHeight) / 2;

                const tex = textureManager.getTexture(sprite.textureId);

                // Draw vertical strips
                const startX = Math.floor(screenX - spriteWidth / 2);
                const endX = Math.floor(screenX + spriteWidth / 2);

                if (tex) {
                    // Distance fog for sprites via CSS filter
                    const fogDist = 12.0;
                    if (perpDist > 2.0) {
                        let fogAlpha = Math.min(1.0, (perpDist - 2.0) / (fogDist - 2.0));
                        this.ctx.filter = `brightness(${1.0 - fogAlpha})`;
                    }

                    for (let stripe = startX; stripe < endX; stripe++) {
                        if (stripe >= 0 && stripe < this.width) {
                            // Z-Buffer Check
                            // Only draw if sprite is closer than wall
                            if (dist < this.zBuffer[stripe]) { // Use dist or perpDist? usually perpDist for walls.
                                // Let's use perpDist for consistency with ZBuffer which is perpDist
                                // Wait, ZBuffer is perpDist.
                                // Sprite dist is Euclidean.
                                // If we use Euclidean for sprite size comparison vs perpDist wall... 
                                // Proper way: Transform sprite to Camera Space Z.

                                // Re-using Sprite Angle logic creates distortion?
                                // Let's stick to the check: if sprite is closer, draw.
                                // Warning: ZBuffer has perpDist. Sprite 'dist' is Euclidean.
                                // At edges of screen, perpDist < Euclidean.
                                // So we should compare with perpDist of sprite?
                                const spritePerpDist = dist * Math.cos(spriteAngle);

                                if (spritePerpDist < this.zBuffer[stripe]) {
                                    const texX = Math.floor((stripe - startX) * textureManager.size / spriteWidth);

                                    this.ctx.drawImage(tex,
                                        texX, 0, 1, textureManager.size,
                                        this.x + stripe, this.y + spriteTopY, 1, spriteHeight
                                    );
                                }
                            }
                        }
                    }

                    if (perpDist > 2.0) {
                        this.ctx.filter = 'none';
                    }
                }
            }
        }
    }

    renderProjectiles(player, projectiles) {
        projectiles.forEach(proj => {
            if (!proj.active) return;

            let dx = proj.x - player.x;
            let dy = proj.y - player.y;
            let dist = Math.hypot(dx, dy);

            let projAngle = Math.atan2(dy, dx) - player.angle;
            while (projAngle < -Math.PI) projAngle += Math.PI * 2;
            while (projAngle > Math.PI) projAngle -= Math.PI * 2;

            if (Math.abs(projAngle) < (this.fov / 2) + 0.2) {
                let perpDist = dist * Math.cos(projAngle);
                if (perpDist <= 0.2) return;

                let screenX = this.x + (0.5 * (1 + projAngle / (this.fov / 2))) * this.width;
                let screenY = this.y + (this.height / 2) + ((0.5 - proj.z) * this.height) / perpDist;

                if (proj.type === 'laser') {
                    // Draw a beam from player to the hit point
                    // We can just draw a bright vertical line at the destination and maybe a line to it
                    let size = this.height / perpDist;
                    this.ctx.fillStyle = '#0ff';
                    this.ctx.fillRect(screenX - size * 0.1, screenY - size / 2, size * 0.2, size);
                } else if (proj.type === 'rocket') {
                    let size = (this.height / perpDist) * 0.4;
                    this.ctx.fillStyle = '#666';
                    this.ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
                    this.ctx.fillStyle = '#f80'; // flame
                    this.ctx.fillRect(screenX - size / 4, screenY + size / 2, size / 2, size / 2);
                } else if (proj.type === 'fire') {
                    let size = (this.height / perpDist) * 0.8;
                    this.ctx.fillStyle = 'rgba(255, 100, 0, 0.8)';
                    this.ctx.beginPath();
                    this.ctx.arc(screenX, screenY, size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    // generic bullet tracer
                    let size = (this.height / perpDist) * 0.1;
                    this.ctx.fillStyle = '#ff0';
                    this.ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size * 2);
                }
            }
        });
    }

    renderParticles(player, particles) {
        particles.forEach(part => {
            if (!part.active) return;

            let dx = part.x - player.x;
            let dy = part.y - player.y;
            let dist = Math.hypot(dx, dy);

            let partAngle = Math.atan2(dy, dx) - player.angle;
            while (partAngle < -Math.PI) partAngle += Math.PI * 2;
            while (partAngle > Math.PI) partAngle -= Math.PI * 2;

            if (Math.abs(partAngle) < (this.fov / 2) + 0.2) {
                let perpDist = dist * Math.cos(partAngle);
                if (perpDist <= 0.2) return;

                let screenX = this.x + (0.5 * (1 + partAngle / (this.fov / 2))) * this.width;
                let screenY = this.y + (this.height / 2) + ((0.5 - part.z) * this.height) / perpDist;
                let size = (this.height / perpDist);

                if (part.type === 'explosion') {
                    size *= 1.5;
                    let alpha = part.life / part.maxLife;
                    this.ctx.fillStyle = `rgba(255, ${Math.floor(255 * alpha)}, 0, ${alpha})`;
                    this.ctx.beginPath();
                    this.ctx.arc(screenX, screenY, size / 2, 0, Math.PI * 2);
                    this.ctx.fill();

                    this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    this.ctx.beginPath();
                    this.ctx.arc(screenX, screenY, size / 4, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (part.type === 'firePatch') {
                    // Renders flat on the floor usually
                    size *= Math.random() * 0.5 + 0.8; // flicker
                    let bottomY = screenY + Math.abs(this.height / perpDist) / 2;
                    let alpha = (part.life / part.maxLife) * 0.8;
                    this.ctx.fillStyle = `rgba(255, ${Math.floor(Math.random() * 150)}, 0, ${alpha})`;
                    this.ctx.beginPath();
                    // Draw flame cone upwards from the floor
                    this.ctx.moveTo(screenX, bottomY);
                    this.ctx.lineTo(screenX - size / 2, bottomY - size);
                    this.ctx.lineTo(screenX + size / 2, bottomY - size);
                    this.ctx.fill();
                }
            }
        });
    }

    darkenColor(hex, factor) {
        // Simple hex darken
        let r = parseInt(hex.substr(1, 2), 16);
        let g = parseInt(hex.substr(3, 2), 16);
        let b = parseInt(hex.substr(5, 2), 16);

        r = Math.floor(r * factor);
        g = Math.floor(g * factor);
        b = Math.floor(b * factor);

        return `rgb(${r},${g},${b})`;
    }

    renderWeapon(player) {
        // ... (Keep existing implementation)
        // Since I am overwriting the file, I must include this method content again.
        // Calling a separate helper or just pasting it back.
        this._renderWeaponImpl(player);
    }

    _renderWeaponImpl(player) {
        const centerX = this.x + this.width / 2;
        const bottomY = this.y + this.height;
        let recoilY = 0;
        if (player.shootTimer > 0) {
            recoilY = Math.sin(player.shootTimer * Math.PI * 5) * 20;
        }

        const idx = player.currentWeaponIndex;
        let muzzleY = bottomY - 100 + recoilY; // Default fallback

        this.ctx.fillStyle = '#444';

        if (idx === 0) { // Pistol
            // Base
            this.ctx.fillStyle = '#333';
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 30, bottomY);
            this.ctx.lineTo(centerX + 30, bottomY);
            this.ctx.lineTo(centerX + 15, bottomY - 50 + recoilY);
            this.ctx.lineTo(centerX - 15, bottomY - 50 + recoilY);
            this.ctx.fill();
            // Barrel highlight
            this.ctx.fillStyle = '#111';
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 15, bottomY - 50 + recoilY);
            this.ctx.lineTo(centerX + 15, bottomY - 50 + recoilY);
            this.ctx.lineTo(centerX + 8, bottomY - 60 + recoilY);
            this.ctx.lineTo(centerX - 8, bottomY - 60 + recoilY);
            this.ctx.fill();
            muzzleY = bottomY - 60 + recoilY;
        }
        else if (idx === 1) { // Shotgun (Double Barrel)
            this.ctx.fillStyle = '#321'; // wooden stock
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 40, bottomY);
            this.ctx.lineTo(centerX + 40, bottomY);
            this.ctx.lineTo(centerX + 20, bottomY - 30 + recoilY);
            this.ctx.lineTo(centerX - 20, bottomY - 30 + recoilY);
            this.ctx.fill();

            this.ctx.fillStyle = '#222'; // barrels
            // left barrel
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 20, bottomY - 30 + recoilY);
            this.ctx.lineTo(centerX - 2, bottomY - 30 + recoilY);
            this.ctx.lineTo(centerX - 2, bottomY - 70 + recoilY);
            this.ctx.lineTo(centerX - 12, bottomY - 70 + recoilY);
            this.ctx.fill();
            // right barrel
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + 2, bottomY - 30 + recoilY);
            this.ctx.lineTo(centerX + 20, bottomY - 30 + recoilY);
            this.ctx.lineTo(centerX + 12, bottomY - 70 + recoilY);
            this.ctx.lineTo(centerX + 2, bottomY - 70 + recoilY);
            this.ctx.fill();
            muzzleY = bottomY - 70 + recoilY;
        }
        else if (idx === 2) { // Assault Rifle
            this.ctx.fillStyle = '#222';
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 35, bottomY);
            this.ctx.lineTo(centerX + 35, bottomY);
            this.ctx.lineTo(centerX + 15, bottomY - 45 + recoilY);
            this.ctx.lineTo(centerX - 15, bottomY - 45 + recoilY);
            this.ctx.fill();

            this.ctx.fillStyle = '#111';
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 15, bottomY - 45 + recoilY);
            this.ctx.lineTo(centerX + 15, bottomY - 45 + recoilY);
            this.ctx.lineTo(centerX + 6, bottomY - 80 + recoilY);
            this.ctx.lineTo(centerX - 6, bottomY - 80 + recoilY);
            this.ctx.fill();
            muzzleY = bottomY - 80 + recoilY;
        }
        else if (idx === 3) { // Machinegun
            this.ctx.fillStyle = '#333';
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 50, bottomY);
            this.ctx.lineTo(centerX + 50, bottomY);
            this.ctx.lineTo(centerX + 25, bottomY - 30 + recoilY);
            this.ctx.lineTo(centerX - 25, bottomY - 30 + recoilY);
            this.ctx.fill();

            // Twin barrels
            this.ctx.fillStyle = '#111';
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 25, bottomY - 30 + recoilY);
            this.ctx.lineTo(centerX - 5, bottomY - 30 + recoilY);
            this.ctx.lineTo(centerX - 8, bottomY - 75 + recoilY);
            this.ctx.lineTo(centerX - 18, bottomY - 75 + recoilY);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.moveTo(centerX + 5, bottomY - 30 + recoilY);
            this.ctx.lineTo(centerX + 25, bottomY - 30 + recoilY);
            this.ctx.lineTo(centerX + 18, bottomY - 75 + recoilY);
            this.ctx.lineTo(centerX + 8, bottomY - 75 + recoilY);
            this.ctx.fill();
            muzzleY = bottomY - 75 + recoilY;
        }
        else if (idx === 4) { // Rocket Launcher
            this.ctx.fillStyle = '#232';
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 40, bottomY);
            this.ctx.lineTo(centerX + 40, bottomY);
            this.ctx.lineTo(centerX + 25, bottomY - 60 + recoilY);
            this.ctx.lineTo(centerX - 25, bottomY - 60 + recoilY);
            this.ctx.fill();
            // Hole
            this.ctx.fillStyle = '#010';
            this.ctx.beginPath();
            this.ctx.ellipse(centerX, bottomY - 60 + recoilY, 20, 8, 0, 0, Math.PI * 2);
            this.ctx.fill();
            muzzleY = bottomY - 60 + recoilY;
        }
        else if (idx === 5) { // Flamethrower
            this.ctx.fillStyle = '#a40';
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 35, bottomY);
            this.ctx.lineTo(centerX + 35, bottomY);
            this.ctx.lineTo(centerX + 20, bottomY - 50 + recoilY);
            this.ctx.lineTo(centerX - 20, bottomY - 50 + recoilY);
            this.ctx.fill();
            // Pilot light
            this.ctx.fillStyle = '#f80';
            this.ctx.beginPath();
            this.ctx.arc(centerX, bottomY - 52 + recoilY, 6, 0, Math.PI * 2);
            this.ctx.fill();
            muzzleY = bottomY - 52 + recoilY;
        }
        else if (idx === 6) { // Laser
            this.ctx.fillStyle = '#ccc';
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 40, bottomY);
            this.ctx.lineTo(centerX + 40, bottomY);
            this.ctx.lineTo(centerX + 15, bottomY - 55 + recoilY);
            this.ctx.lineTo(centerX - 15, bottomY - 55 + recoilY);
            this.ctx.fill();
            // Blue energy core
            this.ctx.fillStyle = '#00f';
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 10, bottomY);
            this.ctx.lineTo(centerX + 10, bottomY);
            this.ctx.lineTo(centerX + 4, bottomY - 55 + recoilY);
            this.ctx.lineTo(centerX - 4, bottomY - 55 + recoilY);
            this.ctx.fill();
            muzzleY = bottomY - 55 + recoilY;
        }

        if (player.shootTimer > 0.05) {
            const flashSize = 40 + Math.random() * 20;
            let outerColor = `rgba(255, 255, 0, ${player.shootTimer * 5})`;
            let innerColor = `rgba(255, 255, 255, ${player.shootTimer * 5})`;

            if (idx === 5) { // Flame color
                outerColor = `rgba(255, 100, 0, ${player.shootTimer * 5})`;
                innerColor = `rgba(255, 200, 0, ${player.shootTimer * 5})`;
            } else if (idx === 6) { // Laser color
                outerColor = `rgba(0, 100, 255, ${player.shootTimer * 5})`;
                innerColor = `rgba(150, 200, 255, ${player.shootTimer * 5})`;
            }

            this.ctx.fillStyle = outerColor;
            this.ctx.beginPath();
            this.ctx.arc(centerX, muzzleY, flashSize, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = innerColor;
            this.ctx.beginPath();
            this.ctx.arc(centerX, muzzleY, flashSize * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    renderAutomap(player, map) {
        // Semi-transparent dark overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Automap properties
        const cellSize = 12;
        const offsetX = (this.width - map.width * cellSize) / 2;
        const offsetY = (this.height - map.height * cellSize) / 2;

        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                if (map.visited[y][x]) {
                    let cell = map.grid[y][x];

                    if (cell === 0) {
                        this.ctx.fillStyle = '#222'; // Floor
                    } else if (cell === 5 || cell === 9) {
                        this.ctx.fillStyle = '#aa0'; // Door
                    } else if (cell === 8) {
                        this.ctx.fillStyle = '#0f0'; // Elevator
                    } else if (cell >= 1 && cell <= 4) {
                        this.ctx.fillStyle = '#aaa'; // Wall
                    }

                    if (cell !== 0) {
                        this.ctx.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
                        // Cell border for structure
                        this.ctx.strokeStyle = '#111';
                        this.ctx.strokeRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
                    }
                }
            }
        }

        // Draw Player Marker
        this.ctx.fillStyle = '#f00';
        this.ctx.beginPath();
        const px = offsetX + player.x * cellSize;
        const py = offsetY + player.y * cellSize;

        // Triangle pointing in `player.angle` direction
        this.ctx.moveTo(
            px + Math.cos(player.angle) * 6,
            py + Math.sin(player.angle) * 6
        );
        this.ctx.lineTo(
            px + Math.cos(player.angle + Math.PI * 0.75) * 4,
            py + Math.sin(player.angle + Math.PI * 0.75) * 4
        );
        this.ctx.lineTo(
            px + Math.cos(player.angle - Math.PI * 0.75) * 4,
            py + Math.sin(player.angle - Math.PI * 0.75) * 4
        );
        this.ctx.fill();
    }
}
