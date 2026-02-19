class Renderer {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.width = config.VIEWPORT_W;
        this.height = config.VIEWPORT_H;
        this.x = config.VIEWPORT_X;
        this.y = config.VIEWPORT_Y;
        this.fov = Math.PI / 3; // 60 degrees
    }

    render3D(player, map, raycaster, textureManager) {
        // Draw ceiling and floor
        this.ctx.fillStyle = '#333333'; // Ceiling
        this.ctx.fillRect(this.x, this.y, this.width, this.height / 2);
        this.ctx.fillStyle = '#555555'; // Floor
        this.ctx.fillRect(this.x, this.y + this.height / 2, this.width, this.height / 2);

        // Raycasting
        for (let x = 0; x < this.width; x++) {
            // Calculate ray angle
            let rayAngle = (player.angle - this.fov / 2.0) + (x / this.width) * this.fov;

            let result = raycaster.castRay(player.x, player.y, rayAngle);

            if (result.hit > 0) {
                // Correct fish-eye effect
                let perpDist = result.distance * Math.cos(rayAngle - player.angle);

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

                // Darken side walls
                if (result.side === 1) {
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    let drawY = (this.height - lineHeight) / 2;
                    this.ctx.fillRect(this.x + x, this.y + drawY, 1, lineHeight);
                }
            }
        }
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
        // Draw weapon at bottom center
        const centerX = this.x + this.width / 2;
        const bottomY = this.y + this.height;

        const weaponWidth = 120;
        const weaponHeight = 120;

        // Recoil offset
        let recoilY = 0;
        if (player.shootTimer > 0) {
            recoilY = Math.sin(player.shootTimer * Math.PI * 5) * 20;
        }

        // Draw Weapon Shape (Pixel Art Placeholder)
        this.ctx.fillStyle = '#444';

        if (player.currentWeaponIndex === 0) { // Knife
            this.ctx.fillStyle = '#888';
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, bottomY);
            this.ctx.lineTo(centerX + 30, bottomY - 80 + recoilY); // Tip
            this.ctx.lineTo(centerX + 60, bottomY);
            this.ctx.fill();
        }
        else if (player.currentWeaponIndex === 1) { // Pistol
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(centerX - 20, bottomY - 100 + recoilY, 40, 100);
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(centerX - 5, bottomY - 100 + recoilY, 10, 100); // Barrel
        }
        else if (player.currentWeaponIndex === 2) { // Shotgun
            this.ctx.fillStyle = '#222';
            this.ctx.fillRect(centerX - 40, bottomY - 80 + recoilY, 20, 80); // Left barrel
            this.ctx.fillRect(centerX + 20, bottomY - 80 + recoilY, 20, 80); // Right barrel
            this.ctx.fillStyle = '#533';
            this.ctx.fillRect(centerX - 10, bottomY - 60 + recoilY, 20, 60); // Stock
        }
        else {
            // Generic block for others
            this.ctx.fillStyle = '#555';
            this.ctx.fillRect(centerX - 30, bottomY - 90 + recoilY, 60, 90);
        }

        // Muzzle Flash
        if (player.shootTimer > 0.1) {
            const flashSize = 40 + Math.random() * 20;
            this.ctx.fillStyle = `rgba(255, 255, 0, ${player.shootTimer * 5})`;
            this.ctx.beginPath();
            this.ctx.arc(centerX, bottomY - 100 + recoilY, flashSize, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = `rgba(255, 255, 255, ${player.shootTimer * 5})`;
            this.ctx.beginPath();
            this.ctx.arc(centerX, bottomY - 100 + recoilY, flashSize * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}
