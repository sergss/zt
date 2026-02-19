class Renderer {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.width = config.VIEWPORT_W;
        this.height = config.VIEWPORT_H;
        this.x = config.VIEWPORT_X;
        this.y = config.VIEWPORT_Y;
        this.fov = Math.PI / 3; // 60 degrees
    }

    render3D(player, map, raycaster, textureManager) {
        // Draw ceiling and floor
        this.ctx.fillStyle = '#333333'; // Ceiling
        this.ctx.fillRect(this.x, this.y, this.width, this.height / 2);
        this.ctx.fillStyle = '#555555'; // Floor
        this.ctx.fillRect(this.x, this.y + this.height / 2, this.width, this.height / 2);

        // Raycasting
        for (let x = 0; x < this.width; x++) {
            // Calculate ray angle
            let rayAngle = (player.angle - this.fov / 2.0) + (x / this.width) * this.fov;

            let result = raycaster.castRay(player.x, player.y, rayAngle);

            if (result.hit > 0) {
                // Correct fish-eye effect
                let perpDist = result.distance * Math.cos(rayAngle - player.angle);

                // Calculate height of line to draw on screen
                let lineHeight = Math.floor(this.height / perpDist);

                // Texture Mapping
                let tex = textureManager.getTexture(result.hit);

                if (tex) {
                    let texX = Math.floor(result.wallX * textureManager.size);

                    // Destination rectangle (strip)
                    let drawY = (this.height - lineHeight) / 2;

                    try {
                        this.ctx.drawImage(
                            tex,
                            texX, 0, 1, textureManager.size,
                            this.x + x, this.y + drawY, 1, lineHeight
                        );
                    } catch (e) {
                        this.ctx.fillStyle = '#ff00ff'; // Error color
                        this.ctx.fillRect(this.x + x, this.y + drawY, 1, lineHeight);
                    }
                } else {
                    // Fallback to solid color
                    let color = map.getColor(result.hit);
                    this.ctx.fillStyle = color;
                    let drawY = (this.height - lineHeight) / 2;
                    this.ctx.fillRect(this.x + x, this.y + drawY, 1, lineHeight);
                }

                // Darken side walls
                if (result.side === 1) {
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    let drawY = (this.height - lineHeight) / 2;
                    this.ctx.fillRect(this.x + x, this.y + drawY, 1, lineHeight);
                }
            }
        }
    }

    darkenColor(hex, factor) {
        // Simple hex darken
        let r = parseInt(hex.substr(1, 2), 16);
        let g = parseInt(hex.substr(3, 2), 16);
        let b = parseInt(hex.substr(5, 2), 16);

        r = Math.floor(r * factor);
        g = Math.floor(g * factor);
        b = Math.floor(b * factor);

        return `rgb(${r},${g},${b})`;
    }
}
