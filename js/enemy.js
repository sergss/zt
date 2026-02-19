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
            // Removed from active logic, but keep in sprite list for rendering corpse?
            // Optional for now.
            return;
        }

        // For Step 11, enemies just stand "IDLE".
        // State is explicitly set to IDLE in constructor.
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
