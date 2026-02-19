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
        const barHeight = 20;
        const barWidth = 200;
        const startY = this.viewY + this.viewH + 30;
        const startX = 20;

        // HP Bar
        ctx.fillStyle = '#000000';
        ctx.fillRect(startX, startY, barWidth, barHeight);
        ctx.fillStyle = '#00aa00';
        const hpPct = Math.max(0, player.hp / 100);
        ctx.fillRect(startX, startY, barWidth * hpPct, barHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.fillText(`HEALTH ${player.hp}%`, startX + 10, startY + 15);

        // Armor Bar
        const armorY = startY + 30;
        ctx.fillStyle = '#000000';
        ctx.fillRect(startX, armorY, barWidth, barHeight);
        ctx.fillStyle = '#0000aa';
        const armPct = Math.max(0, player.armor / 100);
        ctx.fillRect(startX, armorY, barWidth * armPct, barHeight);

        ctx.fillText(`ARMOR  ${player.armor}%`, startX + 10, armorY + 15);
    }

    drawInfo(ctx, player, enemiesLeft) {
        const startX = 300;
        const startY = this.viewY + this.viewH + 45;

        ctx.fillStyle = '#ffffff';
        ctx.font = '24px monospace';

        // Ammo
        let ammoCount = player.ammo[player.weapon.toLowerCase()] || 0;
        ctx.fillText(`AMMO ${ammoCount}`, startX, startY);

        // Weapon
        ctx.fillText(`WEAPON: ${player.weapon.toUpperCase()}`, startX + 200, startY);

        // Enemies
        ctx.fillText(`ENEMIES: ${enemiesLeft}`, startX + 500, startY);

        // Score (Placeholder)
        ctx.fillText(`SCORE: 0`, startX + 500, startY - 30);
    }

    drawCompass(ctx, player) {
        // Simple Compass Circle
        const cX = 850;
        const cY = 500;
        const radius = 40;

        ctx.fillStyle = '#003300';
        ctx.beginPath();
        ctx.arc(cX, cY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Direction Indicator
        // Player angle is in radians. 0 = East.
        // We want to show which way is North relative to player look? 
        // Or show player arrow inside static compass?
        // Let's do static compass (North is Up), moving arrow.

        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cX, cY);
        // Arrow points in direction of player angle
        ctx.lineTo(cX + Math.cos(player.angle) * (radius - 5), cY + Math.sin(player.angle) * (radius - 5));
        ctx.stroke();

        // N, E, S, W labels
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '12px monospace';
        ctx.fillText('N', cX - 4, cY - radius - 5);
        ctx.fillText('E', cX + radius + 5, cY + 4);
    }
}
