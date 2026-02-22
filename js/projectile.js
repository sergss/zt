class Projectile {
    constructor(x, y, angle, type, damage, owner) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.type = type; // 'bullet', 'rocket', 'laser', 'fire'
        this.damage = damage;
        this.owner = owner; // 'player' or 'enemy'
        this.active = true;
        this.distanceTraveled = 0;

        // Visual Z-height (0 is floor, 1 is ceiling). 0.5 is middle.
        this.z = 0.35; // Start lower (from gun barrel height)

        switch (type) {
            case 'bullet':
                this.speed = 40.0;
                this.maxDist = 30.0;
                this.radius = 0.1;
                break;
            case 'rocket':
                this.speed = 10.0;
                this.maxDist = 50.0;
                this.radius = 0.3;
                break;
            case 'fire':
                this.speed = 8.0;
                this.maxDist = 8.0;
                this.radius = 0.4;
                break;
            case 'laser':
                this.speed = 100.0; // Basically instant
                this.maxDist = 30.0;
                this.radius = 0.1;
                break;
        }
    }

    update(dt, map, enemies, particles) {
        if (!this.active) return;

        let moveDist = this.speed * dt;
        let dx = Math.cos(this.angle) * moveDist;
        let dy = Math.sin(this.angle) * moveDist;

        // Move step by step for collision accuracy
        let steps = Math.ceil(moveDist / 0.5);
        if (steps < 1) steps = 1;

        let stepX = dx / steps;
        let stepY = dy / steps;

        for (let i = 0; i < steps; i++) {
            this.x += stepX;
            this.y += stepY;
            this.distanceTraveled += Math.hypot(stepX, stepY);

            if (this.distanceTraveled > this.maxDist) {
                this.destroy(map, enemies, particles);
                return;
            }

            // Check wall collision
            let gridX = Math.floor(this.x);
            let gridY = Math.floor(this.y);

            if (map.isWall(gridX, gridY)) {
                this.destroy(map, enemies, particles, true);
                return;
            }

            // Check enemy collision
            if (this.owner === 'player') {
                for (let enemy of enemies) {
                    if (enemy.hp > 0) {
                        let edx = enemy.x - this.x;
                        let edy = enemy.y - this.y;
                        let edist = Math.hypot(edx, edy);
                        // Enemy radius is ~0.4
                        if (edist < this.radius + 0.4) {
                            if (this.type !== 'rocket') {
                                enemy.takeDamage(this.damage);
                            }
                            // Rockets explode, handling damage in destroy()
                            this.destroy(map, enemies, particles, false, enemy);
                            return;
                        }
                    }
                }
            }
        }

        // Ascend to eye-level (0.5) over distance
        if (this.z < 0.5) {
            this.z += moveDist * 0.08;
            if (this.z > 0.5) this.z = 0.5;
        }
    }

    destroy(map, enemies, particles, hitWall = false, hitEnemy = null) {
        this.active = false;

        if (this.type === 'rocket') {
            // Explosion logic (radius 3.0)
            if (typeof AudioSystem !== 'undefined') AudioSystem.playExplosion();

            // Damage enemies in radius
            for (let enemy of enemies) {
                if (enemy.hp > 0) {
                    let dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                    if (dist < 3.0) {
                        // Damage falloff
                        let dmg = Math.floor(this.damage * (1 - (dist / 3.0)));
                        enemy.takeDamage(dmg);
                    }
                }
            }

            // Spawn explosion particle
            particles.push(new Particle(this.x, this.y, 0.5, 'explosion', 0.5));
        }
        else if (this.type === 'fire') {
            // Drop a fire patch on the ground
            particles.push(new Particle(this.x, this.y, 0.0, 'firePatch', 3.0, this.damage));
        }
    }
}

class Particle {
    constructor(x, y, z, type, maxLife, damage = 0) {
        this.x = x;
        this.y = y;
        this.z = z; // 0 is floor, 0.5 is mid-air
        this.type = type; // 'explosion', 'firePatch', 'sparks'
        this.maxLife = maxLife;
        this.life = maxLife;
        this.damage = damage;
        this.active = true;

        this.tickTimer = 0;
    }

    update(dt, player, enemies) {
        if (!this.active) return;

        this.life -= dt;
        if (this.life <= 0) {
            this.active = false;
            return;
        }

        // Fire damage tick (e.g. 5 damage every 0.5 seconds)
        if (this.type === 'firePatch' && this.damage > 0) {
            this.tickTimer += dt;
            if (this.tickTimer >= 0.5) {
                this.tickTimer = 0;

                // Damage enemies touching it
                for (let enemy of enemies) {
                    if (enemy.hp > 0 && Math.hypot(enemy.x - this.x, enemy.y - this.y) < 0.6) {
                        enemy.takeDamage(this.damage);
                    }
                }

                // Damage player touching it
                if (player.hp > 0 && Math.hypot(player.x - this.x, player.y - this.y) < 0.6) {
                    player.takeDamage(this.damage);
                }
            }
        }
    }
}
