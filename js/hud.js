class HUD {
    constructor(config) {
        this.width = config.SCREEN_WIDTH;
        this.height = config.SCREEN_HEIGHT;
        this.viewX = config.VIEWPORT_X;
        this.viewY = config.VIEWPORT_Y;
        this.viewW = config.VIEWPORT_W;
        this.viewH = config.VIEWPORT_H;
    }

    render(ctx, player, enemiesLeft) {
        // 1. Draw Background / Frame
        // Top Bar
        ctx.fillStyle = '#222222';
        ctx.fillRect(0, 0, this.width, this.viewY);
        // Bottom Bar
        ctx.fillRect(0, this.viewY + this.viewH, this.width, this.height - (this.viewY + this.viewH));
        // Left Side
        ctx.fillRect(0, this.viewY, this.viewX, this.viewH);
        // Right Side
        ctx.fillRect(this.viewX + this.viewW, this.viewY, this.width - (this.viewX + this.viewW), this.viewH);

        // Frame Border around Viewport
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 4;
        ctx.strokeRect(this.viewX - 2, this.viewY - 2, this.viewW + 4, this.viewH + 4);

        // 2. Draw Stats
        this.drawBars(ctx, player);
        this.drawInfo(ctx, player, enemiesLeft);
        this.drawCompass(ctx, player);
    }

    drawBars(ctx, player) {
        const barHeight = 15;
        const barWidth = 200;
        // Place below viewport, aligned left-ish
        const startY = this.viewY + this.viewH + 20;
        const startX = this.viewX + 20; // Start inside viewport width

        // HP Bar
        ctx.fillStyle = '#000000';
        ctx.fillRect(startX, startY, barWidth, barHeight);
        ctx.fillStyle = '#00aa00';
        const hpPct = Math.max(0, player.hp / 100);
        ctx.fillRect(startX, startY, barWidth * hpPct, barHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        ctx.fillText(`HEALTH ${player.hp}%`, startX, startY - 5);

        // Armor Bar
        const armorY = startY + 40;
        ctx.fillStyle = '#000000';
        ctx.fillRect(startX, armorY, barWidth, barHeight);
        ctx.fillStyle = '#0000aa';
        const armPct = Math.max(0, player.armor / 100);
        ctx.fillRect(startX, armorY, barWidth * armPct, barHeight);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(`ARMOR  ${player.armor}%`, startX, armorY - 5);
    }

    drawInfo(ctx, player, enemiesLeft) {
        // Center area for Weapons
        const centerX = this.viewX + this.viewW / 2;
        const startY = this.viewY + this.viewH + 40;

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';

        // Ammo
        let ammoCount = 0;
        const currentWep = WEAPONS[player.currentWeaponIndex];
        if (currentWep) {
            ammoCount = player.ammo[currentWep.ammoType] || 0;
        }
        ctx.fillText(`${ammoCount}`, centerX - 50, startY);
        ctx.font = '14px monospace';
        ctx.fillText(`AMMO`, centerX - 50, startY + 20);

        // Weapon
        ctx.font = '20px monospace';
        ctx.fillText(`${player.weapon.toUpperCase()}`, centerX + 50, startY);
        ctx.font = '14px monospace';
        ctx.fillText(`WEAPON`, centerX + 50, startY + 20);

        // Enemies/Score - Move to Right side of bottom panel
        const rightX = this.viewX + this.viewW - 80;
        ctx.textAlign = 'right';
        ctx.font = '16px monospace';
        ctx.fillText(`ENEMIES: ${enemiesLeft}`, rightX, startY);
        ctx.fillText(`SCORE: 0`, rightX, startY - 25);

        // Reset alignment
        ctx.textAlign = 'left';
    }

    drawCompass(ctx, player) {
        // Compass on the far right panel (outside viewport)
        const cX = this.viewX + this.viewW + 80; // ~ 160+640+80 = 880
        const cY = this.viewY + this.viewH / 2; // Vertically centered in right panel? No, that's too high maybe.
        // Let's put it bottom right, consistent with previous, but clear of text.
        // Or in the right sidebar.
        const compassY = 500;

        const radius = 35;

        // ... drawing code same ...
        ctx.fillStyle = '#003300';
        ctx.beginPath();
        ctx.arc(cX, compassY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cX, compassY);
        ctx.lineTo(cX + Math.cos(player.angle) * (radius - 5), compassY + Math.sin(player.angle) * (radius - 5));
        ctx.stroke();

        ctx.fillStyle = '#aaaaaa';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('N', cX, compassY - radius - 5);
        ctx.textBaseline = 'middle';
        ctx.fillText('E', cX + radius + 10, compassY);
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
    }
}
