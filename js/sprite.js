class Sprite {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'medkit', 'ammo', 'key', etc.
        this.textureId = type; // For now texture ID is same as type
        this.distance = 0;
        this.visible = true;
        this.active = true; // If false, removed from world
    }

    updateDistance(player) {
        this.distance = Math.pow(player.x - this.x, 2) + Math.pow(player.y - this.y, 2);
    }

    checkPickup(player) {
        if (!this.active) return false;

        // Simple distance check (0.5 units)
        if (this.distance < 0.25) { // 0.5^2 = 0.25
            return this.applyEffect(player);
        }
        return false;
    }

    applyEffect(player) {
        let picked = false;

        switch (this.type) {
            case 'medkit': // Big Health
            case 'healthBig':
                if (player.hp < 100) {
                    player.hp = Math.min(100, player.hp + 25);
                    picked = true;
                }
                break;
            case 'healthSmall':
                if (player.hp < 100) {
                    player.hp = Math.min(100, player.hp + 10);
                    picked = true;
                }
                break;
            case 'armor':
                if (player.armor < 100) {
                    player.armor = Math.min(100, player.armor + 25);
                    picked = true;
                }
                break;
            case 'key':
                // TODO: inventory key logic
                picked = true;
                break;

            // AMMO
            case 'ammo': // Generic
            case 'ammoBullets':
                if (player.ammo.bullets < 200) {
                    player.ammo.bullets = Math.min(200, player.ammo.bullets + 10);
                    picked = true;
                }
                break;
            case 'ammoShells':
                if (player.ammo.shells < 50) {
                    player.ammo.shells = Math.min(50, player.ammo.shells + 4);
                    picked = true;
                }
                break;
            case 'ammoBelt':
                if (player.ammo.belt < 200) {
                    player.ammo.belt = Math.min(200, player.ammo.belt + 20);
                    picked = true;
                }
                break;
            case 'ammoRockets':
                if (player.ammo.rockets < 50) {
                    player.ammo.rockets = Math.min(50, player.ammo.rockets + 2);
                    picked = true;
                }
                break;
            case 'ammoFuel':
                if (player.ammo.fuel < 200) {
                    player.ammo.fuel = Math.min(200, player.ammo.fuel + 20);
                    picked = true;
                }
                break;
            case 'ammoCells':
                if (player.ammo.cells < 200) {
                    player.ammo.cells = Math.min(200, player.ammo.cells + 20);
                    picked = true;
                }
                break;

            // WEAPONS
            case 'weaponShotgun':
                if (!player.weapons[1]) {
                    player.weapons[1] = true;
                    player.switchWeapon(1);
                    player.ammo.shells += 8;
                    picked = true;
                } else if (player.ammo.shells < 50) {
                    player.ammo.shells = Math.min(50, player.ammo.shells + 8);
                    picked = true;
                }
                break;
            case 'weaponAssaultRifle':
                if (!player.weapons[2]) {
                    player.weapons[2] = true;
                    player.switchWeapon(2);
                    player.ammo.bullets += 20;
                    picked = true;
                } else if (player.ammo.bullets < 200) {
                    player.ammo.bullets = Math.min(200, player.ammo.bullets + 20);
                    picked = true;
                }
                break;
            case 'weaponMachinegun':
                if (!player.weapons[3]) {
                    player.weapons[3] = true;
                    player.switchWeapon(3);
                    player.ammo.belt += 50;
                    picked = true;
                } else if (player.ammo.belt < 200) {
                    player.ammo.belt = Math.min(200, player.ammo.belt + 50);
                    picked = true;
                }
                break;
            case 'weaponRocketLauncher':
                if (!player.weapons[4]) {
                    player.weapons[4] = true;
                    player.switchWeapon(4);
                    player.ammo.rockets += 5;
                    picked = true;
                } else if (player.ammo.rockets < 50) {
                    player.ammo.rockets = Math.min(50, player.ammo.rockets + 5);
                    picked = true;
                }
                break;
            case 'weaponFlamethrower':
                if (!player.weapons[5]) {
                    player.weapons[5] = true;
                    player.switchWeapon(5);
                    player.ammo.fuel += 50;
                    picked = true;
                } else if (player.ammo.fuel < 200) {
                    player.ammo.fuel = Math.min(200, player.ammo.fuel + 50);
                    picked = true;
                }
                break;
            case 'weaponLaser':
                if (!player.weapons[6]) {
                    player.weapons[6] = true;
                    player.switchWeapon(6);
                    player.ammo.cells += 50;
                    picked = true;
                } else if (player.ammo.cells < 200) {
                    player.ammo.cells = Math.min(200, player.ammo.cells + 50);
                    picked = true;
                }
                break;
        }

        if (picked) {
            this.active = false;
            this.visible = false;
            return true;
        }
        return false;
    }
}
