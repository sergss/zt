class Renderer {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.width = config.VIEWPORT_W;
        this.height = config.VIEWPORT_H;
        this.x = config.VIEWPORT_X;
        this.y = config.VIEWPORT_Y;
        this.fov = Math.PI / 3; // 60 degrees
    }

    render3D(player, map, raycaster) {
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
                // perpWallDist = dist * cos(rayAngle - playerAngle)
                let perpDist = result.distance * Math.cos(rayAngle - player.angle);

                // Calculate height of line to draw on screen
                // h = ScreenHeight / dist
                let lineHeight = Math.floor(this.height / perpDist);

                // Calculate lowest and highest pixel to fill in current stripe
                let drawStart = Math.floor(-lineHeight / 2 + this.height / 2);
                let drawEnd = Math.floor(lineHeight / 2 + this.height / 2);

                // Clamp
                // if (drawStart < 0) drawStart = 0;
                // if (drawEnd >= this.height) drawEnd = this.height - 1;

                // Color based on wall type
                let color = map.getColor(result.hit);

                // Darken side walls
                if (result.side === 1) {
                    color = this.darkenColor(color, 0.7);
                }

                // Draw vertical line
                this.ctx.fillStyle = color;
                // this.ctx.fillRect(this.x + x, this.y + drawStart, 1, drawEnd - drawStart);

                // Clipping to viewport
                let yStart = Math.max(0, drawStart);
                let yEnd = Math.min(this.height, drawEnd);
                let h = yEnd - yStart;

                if (h > 0) {
                    this.ctx.fillRect(this.x + x, this.y + drawStart + (this.height / 2 - lineHeight / 2), 1, lineHeight);
                    // Simplified: just ensure we draw at viewport offset
                    // Correct:
                    let screenY = this.y + Math.max(0, -lineHeight / 2 + this.height / 2);
                    let screenH = Math.min(this.height, lineHeight);
                    // The clamp logic is a bit tricky with viewport offset.

                    // Let's do simple rect with clipping via save/restore or just math.
                    // Math way:
                    let lineTop = (this.height - lineHeight) / 2;
                    let clipTop = Math.max(0, lineTop);
                    let clipBottom = Math.min(this.height, lineTop + lineHeight);

                    this.ctx.fillRect(this.x + x, this.y + clipTop, 1, clipBottom - clipTop);
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
