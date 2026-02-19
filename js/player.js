class Player {
    constructor(x, y, angle, map) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.map = map;

        this.moveSpeed = 3.0; // Units per second
        this.rotSpeed = 3.0;  // Radians per second

        // Stats
        this.hp = 55;
        this.armor = 0;

        // Weapon System
        // 7 weapons. All unlocked for testing.
        // 0: Pistol, 1: Shotgun, 2: Assault Rifle, 3: MG, 4: Rocket, 5: Flame, 6: Laser
        this.weapons = [true, true, true, true, true, true, true];
        this.currentWeaponIndex = 0; // Pistol
        this.weapon = WEAPONS[this.currentWeaponIndex].name;

        this.ammo = {
            bullets: 20,  // Pistol/Assault Rifle
            shells: 0,    // Shotgun
            belt: 0,      // MG
            rockets: 0,   // Rocket
            fuel: 0,      // Flamethrower
            cells: 0,     // Laser
            infinite: 999
        };

        this.lastShotTime = 0;
        this.shootTimer = 0; // Visual recoil/flash timer

        this.radius = 0.2;    // Collision radius
    }

    switchWeapon(index) {
        if (index >= 0 && index < WEAPONS.length) {
            if (this.weapons[index]) {
                this.currentWeaponIndex = index;
                this.weapon = WEAPONS[index].name;
                return true;
            }
        }
        return false;
    }

    shoot(time) {
        const weaponProto = WEAPONS[this.currentWeaponIndex];

        // Check Cooldown
        if (time - this.lastShotTime < weaponProto.fireRate) return false;

        // Check Ammo
        const type = weaponProto.ammoType;
        if (this.ammo[type] >= weaponProto.ammoPerShot) {
            // FIRE!
            if (type !== 'infinite') {
                this.ammo[type] -= weaponProto.ammoPerShot;
            }
            this.lastShotTime = time;
            this.shootTimer = 0.2; // Flash duration
            return true;
        }
        return false;
    }

    update(dt) {
        if (this.shootTimer > 0) {
            this.shootTimer -= dt;
            if (this.shootTimer < 0) this.shootTimer = 0;
        }

        // Rotation
        if (Input.isActionActive('turnLeft')) {
            this.angle -= this.rotSpeed * dt;
        }
        if (Input.isActionActive('turnRight')) {
            this.angle += this.rotSpeed * dt;
        }

        // Movement
        let moveStep = this.moveSpeed * dt;
        let newX = this.x;
        let newY = this.y;

        // Forward/Backward
        if (Input.isActionActive('forward')) {
            newX += Math.cos(this.angle) * moveStep;
            newY += Math.sin(this.angle) * moveStep;
        }
        if (Input.isActionActive('backward')) {
            newX -= Math.cos(this.angle) * moveStep;
            newY -= Math.sin(this.angle) * moveStep;
        }

        // Strafing
        if (Input.isActionActive('strafeLeft')) {
            newX += Math.cos(this.angle - Math.PI / 2) * moveStep;
            newY += Math.sin(this.angle - Math.PI / 2) * moveStep;
        }
        if (Input.isActionActive('strafeRight')) {
            newX += Math.cos(this.angle + Math.PI / 2) * moveStep;
            newY += Math.sin(this.angle + Math.PI / 2) * moveStep;
        }

        // Collision Detection (Slide against walls)
        this.handleCollision(newX, newY);
    }

    handleCollision(targetX, targetY) {
        // Check X axis movement
        if (!this.map.isWall(Math.floor(targetX + Math.sign(targetX - this.x) * this.radius), Math.floor(this.y)) &&
            !this.map.isWall(Math.floor(targetX + Math.sign(targetX - this.x) * this.radius), Math.floor(this.y - this.radius)) &&
            !this.map.isWall(Math.floor(targetX + Math.sign(targetX - this.x) * this.radius), Math.floor(this.y + this.radius))
        ) {
            this.x = targetX;
        }

        // Check Y axis movement
        if (!this.map.isWall(Math.floor(this.x), Math.floor(targetY + Math.sign(targetY - this.y) * this.radius)) &&
            !this.map.isWall(Math.floor(this.x - this.radius), Math.floor(targetY + Math.sign(targetY - this.y) * this.radius)) &&
            !this.map.isWall(Math.floor(this.x + this.radius), Math.floor(targetY + Math.sign(targetY - this.y) * this.radius))
        ) {
            this.y = targetY;
        }
    }
}
