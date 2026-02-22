/**
 * Класс, отвечающий за подбираемые предметы в игре.
 * Предметы (оружие, броня, аптечки, патроны) разбросаны по уровню
 * и могут быть подобраны игроком при приближении.
 */
class Item extends Sprite {
    /**
     * Создает новый предмет на уровне.
     * @param {number} x - Координата X на карте
     * @param {number} y - Координата Y на карте
     * @param {string} type - Тип предмета (например, 'healthSmall', 'weaponShotgun')
     */
    constructor(x, y, type) {
        super(x, y, type);
    }

    /**
     * Применяет эффект от предмета к игроку, если тот подошел достаточно близко.
     * @param {Player} player - Объект игрока
     * @returns {boolean} true, если предмет был успешно подобран и применен
     */
    applyEffect(player) {
        let picked = false;

        switch (this.type) {
            case 'medkit': // Большая аптечка
            case 'healthBig':
                if (player.hp < 100) {
                    player.hp = Math.min(100, player.hp + 25);
                    picked = true;
                }
                break;
            case 'healthSmall': // Малая аптечка
            case 'health_pack': // Устаревший ID для совместимости
                if (player.hp < 100) {
                    player.hp = Math.min(100, player.hp + 10);
                    picked = true;
                }
                break;
            case 'armor': // Броня
                if (player.armor < 100) {
                    player.armor = Math.min(100, player.armor + 25);
                    picked = true;
                }
                break;
            case 'key': // Ключ-карта (пока не используется функционально)
                picked = true;
                break;

            // --- ПАТРОНЫ ---
            case 'ammo': // Стандартные пули
            case 'ammoBullets':
            case 'ammo_bullets':
                if (player.ammo.bullets < 200) {
                    player.ammo.bullets = Math.min(200, player.ammo.bullets + 10);
                    picked = true;
                }
                break;
            case 'ammoShells': // Дробь
                if (player.ammo.shells < 50) {
                    player.ammo.shells = Math.min(50, player.ammo.shells + 4);
                    picked = true;
                }
                break;
            case 'ammoBelt': // Пулеметная лента
                if (player.ammo.belt < 200) {
                    player.ammo.belt = Math.min(200, player.ammo.belt + 20);
                    picked = true;
                }
                break;
            case 'ammoRockets': // Ракеты
                if (player.ammo.rockets < 50) {
                    player.ammo.rockets = Math.min(50, player.ammo.rockets + 2);
                    picked = true;
                }
                break;
            case 'ammoFuel': // Топливо для огнемета
                if (player.ammo.fuel < 200) {
                    player.ammo.fuel = Math.min(200, player.ammo.fuel + 20);
                    picked = true;
                }
                break;
            case 'ammoCells': // Батареи для лазера
                if (player.ammo.cells < 200) {
                    player.ammo.cells = Math.min(200, player.ammo.cells + 20);
                    picked = true;
                }
                break;

            // --- ОРУЖИЕ ---
            case 'weaponShotgun':
            case 'weapon_shotgun':
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
            case 'weapon_assault_rifle':
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
            case 'weapon_rocket':
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

    /**
     * Проверяет, может ли игрок подобрать предмет (по расстоянию)
     * и применяет эффект, если может.
     * @param {Player} player - Объект игрока
     * @returns {boolean} true если предмет был подобран
     */
    checkPickup(player) {
        if (!this.active) return false;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 0.5) { // Радиус подбора
            return this.applyEffect(player);
        }
        return false;
    }
}
