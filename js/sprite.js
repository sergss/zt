class Sprite {
    constructor(x, y, textureId) {
        this.x = x;
        this.y = y;
        this.textureId = textureId;
        this.distance = 0; // Distance to player, updated each frame
    }

    updateDistance(player) {
        this.distance = Math.pow(player.x - this.x, 2) + Math.pow(player.y - this.y, 2);
    }
}
