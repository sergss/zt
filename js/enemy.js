class Enemy extends Sprite {
    constructor(x, y, type) {
        super(x, y, type);

        // Ensure strict adherence to Step 11 properties
        this.x = x;
        this.y = y;
        this.type = type; // zombie, soldier, alien, boss
        this.state = 'IDLE'; // IDLE as requested
        this.sprite = type; // The texture ID is used as the sprite name
        this.textureId = this.sprite; // Mapper for the renderer

        // Set stats based on type
        switch (type) {
            case 'zombie':
                this.hp = 50;
                this.speed = 1.5;
                break;
            case 'soldier':
                this.hp = 100;
                this.speed = 2.0;
                break;
            case 'alien':
                this.hp = 150;
                this.speed = 2.5;
                break;
            case 'boss':
                this.hp = 1000;
                this.speed = 3.2;
                break;
            default:
                this.hp = 100;
                this.speed = 2.0;
        }

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
            let dist = Math.hypot(player.x - this.x, player.y - this.y);
            // Passive detection: player must be relatively close (6.0 units) and visible
            if (dist < 6.0 && this.checkLineOfSight(player, map)) {
                this.alert();
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
                    let baseDamage = 5;
                    let maxDamage = 9;
                    if (this.type === 'soldier') { baseDamage = 10; maxDamage = 19; }
                    else if (this.type === 'alien') { baseDamage = 15; maxDamage = 29; }
                    else if (this.type === 'boss') { baseDamage = 25; maxDamage = 45; }

                    let damage = Math.floor(Math.random() * (maxDamage - baseDamage + 1)) + baseDamage;
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

    alert() {
        if (this.state === 'IDLE' && this.hp > 0) {
            this.state = 'CHASE';
            this.attackTimer = 1.0; // Reaction time before first attack
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
        if (this.state === 'DEAD') return;
        this.alert();
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
