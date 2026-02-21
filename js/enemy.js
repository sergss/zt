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

        this.attackTimer = 0;
        this.painTimer = 0;
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

        if (this.state === 'PAIN') {
            this.painTimer -= dt;
            if (this.painTimer <= 0) {
                this.state = 'CHASE';
            }
            return; // Don't move or act while in pain
        }

        if (this.attackTimer > 0) {
            this.attackTimer -= dt;
        }

        // Step 13: Enemy AI
        if (this.state === 'IDLE') {
            if (this.checkLineOfSight(player, map)) {
                this.state = 'CHASE';
            }
        }

        if (this.state === 'CHASE' || this.state === 'ATTACK') {
            let dx = player.x - this.x;
            let dy = player.y - this.y;
            let dist = Math.hypot(dx, dy);

            let attackRadius = (this.type === 'soldier') ? 8.0 : 1.0;

            if (dist <= attackRadius && this.checkLineOfSight(player, map)) {
                this.state = 'ATTACK';
            } else {
                this.state = 'CHASE';
            }

            if (this.state === 'ATTACK') {
                if (this.attackTimer <= 0) {
                    let damage = Math.floor(Math.random() * 5) + 5; // 5 to 9 damage
                    if (player.takeDamage) player.takeDamage(damage);
                    this.attackTimer = 1.0; // 1 attack per second
                }
            } else if (this.state === 'CHASE') {
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

        // Animation state (Attack flash for 0.3s)
        if (this.state === 'ATTACK' && this.attackTimer > 0.7) {
            this.sprite = this.type + 'Attack';
        } else {
            this.sprite = this.type;
        }
        this.textureId = this.sprite;
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
        if (this.state === 'DEAD') return;
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.state = 'DEAD';
            this.sprite = 'enemyDead';
            this.textureId = this.sprite;
            console.log(this.type + ' died');
            if (typeof AudioSystem !== 'undefined') AudioSystem.playEnemyDeath(this.distance, this.type);
        } else {
            console.log(this.type + ' hit, HP:', this.hp);
            this.state = 'PAIN';
            this.painTimer = 0.3; // 0.3s stagger
            if (typeof AudioSystem !== 'undefined') AudioSystem.playHit(this.distance);
        }
    }
}
