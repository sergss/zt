class Player {
    constructor(x, y, angle, map) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.map = map;

        this.moveSpeed = 3.0; // Units per second
        this.rotSpeed = 3.0;  // Radians per second
        this.radius = 0.2;    // Collision radius
    }

    update(dt) {
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

        // Simple blocking if both fail? The above separates X and Y sliding. 
        // Note: The collision logic in tasks.md was "check cell before moving".
        // Improved logic: checking corners of the player's bounding box (radius).
    }
}
