class Enemy extends Sprite {
    constructor(x, y, type) {
        super(x, y, type);

        // Ensure strict adherence to Step 11 properties
        this.x = x;
        this.y = y;
        this.hp = 100;
        this.type = type; // zombie, soldier, alien
        this.state = 'IDLE'; // IDLE as requested
        this.sprite = type; // The texture ID is used as the sprite name
        this.textureId = this.sprite; // Mapper for the renderer

        this.speed = 2.0;
        this.active = true;
        this.visible = true; // Make sure they are visible for renderer
    }

    update(dt, player, map) {
        if (!this.active) return;

        // Basic billboarding is handled by renderer via Sprite properties
        this.updateDistance(player);

        if (this.hp <= 0 && this.state !== 'DEAD') {
            this.state = 'DEAD';
            this.sprite = 'enemyDead'; // Switch to dead texture
            this.textureId = this.sprite;
            return;
        }

        if (this.state === 'DEAD') return;

        // Step 13: Enemy AI
        if (this.state === 'IDLE') {
            if (this.checkLineOfSight(player, map)) {
                this.state = 'CHASE';
            }
        }

        if (this.state === 'CHASE') {
            let dx = player.x - this.x;
            let dy = player.y - this.y;
            let dist = Math.hypot(dx, dy);

            if (dist > 0.5) { // Move closer if not in melee range
                let moveX = (dx / dist) * this.speed * dt;
                let moveY = (dy / dist) * this.speed * dt;

                // Move with basic wall collision
                if (!map.isWall(Math.floor(this.x + moveX), Math.floor(this.y))) {
                    this.x += moveX;
                }
                if (!map.isWall(Math.floor(this.x), Math.floor(this.y + moveY))) {
                    this.y += moveY;
                }
            }
        }
    }

    checkLineOfSight(player, map) {
        if (!map) return false;
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let dist = Math.hypot(dx, dy);

        if (dist === 0) return true;

        // Raycast step approach
        let steps = Math.ceil(dist * 2);
        let stepX = dx / steps;
        let stepY = dy / steps;

        let cx = this.x;
        let cy = this.y;

        for (let i = 0; i < steps; i++) {
            cx += stepX;
            cy += stepY;
            if (map.isWall(Math.floor(cx), Math.floor(cy))) {
                return false;
            }
        }
        return true;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.state = 'DEAD';
            this.sprite = 'enemyDead';
            this.textureId = this.sprite;
            console.log(this.type + ' died');
        } else {
            console.log(this.type + ' hit, HP:', this.hp);
        }
    }
}
