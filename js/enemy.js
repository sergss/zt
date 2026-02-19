class Enemy extends Sprite {
    constructor(x, y, type) {
        super(x, y, type);
        this.hp = 100;
        this.state = 'idle'; // idle, walk, attack, pain, death
        this.speed = 2.0;
        this.lastSeenPlayerTime = 0;
        this.active = true;
    }

    update(dt, player, map) {
        if (!this.active) return;

        // Basic billboarding is handled by renderer via Sprite properties
        this.updateDistance(player);

        // Simple state logic placeholder
        // If dead, change texture?
        if (this.hp <= 0) {
            this.state = 'dead';
            this.textureId = 'enemyDead'; // Need this texture
            // Don't collide? 
            return;
        }

        // TODO: AI Logic in Step 13
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.state = 'dead';
            console.log('Enemy died');
        } else {
            this.state = 'pain';
            console.log('Enemy hit, HP:', this.hp);
        }
    }
}
