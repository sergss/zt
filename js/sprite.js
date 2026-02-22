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
}
