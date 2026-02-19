class Raycaster {
    constructor(map) {
        this.map = map;
    }

    castRay(posX, posY, rayAngle) {
        let rayDirX = Math.cos(rayAngle);
        let rayDirY = Math.sin(rayAngle);

        let mapX = Math.floor(posX);
        let mapY = Math.floor(posY);

        // Length of ray from one x or y-side to next x or y-side
        let deltaDistX = Math.abs(1 / rayDirX);
        let deltaDistY = Math.abs(1 / rayDirY);

        let stepX, stepY;
        let sideDistX, sideDistY;
        let side; // 0 for NS, 1 for EW

        // Calculate step and initial sideDist
        if (rayDirX < 0) {
            stepX = -1;
            sideDistX = (posX - mapX) * deltaDistX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1.0 - posX) * deltaDistX;
        }
        if (rayDirY < 0) {
            stepY = -1;
            sideDistY = (posY - mapY) * deltaDistY;
        } else {
            stepY = 1;
            sideDistY = (mapY + 1.0 - posY) * deltaDistY;
        }

        // DDA Loop
        let hit = 0;
        let dist = 0;
        let maxDist = 20.0; // Max draw distance

        while (hit === 0 && dist < maxDist) {
            // Jump to next map square, OR in x-direction, OR in y-direction
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
                dist = sideDistX - deltaDistX; // Actual distance is previous sideDist
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
                dist = sideDistY - deltaDistY;
            }

            // Check if ray has hit a wall
            if (this.map.isWall(mapX, mapY)) {
                hit = this.map.getCell(mapX, mapY);
            }
        }

        // Calculate distance projected on camera direction (Euclidean distance corrected for fish-eye is handled later or here?)
        // Standard Wolf3D correction uses perpWallDist.
        // But here we return raw distance and hit info.
        // Let's return the Euclidean distance from origin for now, caller handles fisheye or we do it here if we pass player angle.
        // Actually, the DDA `dist` calculation above (sideDist - delta) IS perpWallDist equivalent if using camera plane formulation.
        // But we are using angle. So `dist` is Euclidean distance.
        // Let's stick to returning Euclidean distance and intersection details.

        // Calculate distance projected on camera direction
        // We use the Euclidean distance 'dist' from DDA for depth, but we need wallX for texture.

        let wallX;
        if (side === 0) {
            wallX = posY + dist * rayDirY;
        } else {
            wallX = posX + dist * rayDirX;
        }
        wallX -= Math.floor(wallX);

        // Invert wallX if needed
        if (side === 0 && rayDirX > 0) wallX = 1.0 - wallX;
        if (side === 1 && rayDirY < 0) wallX = 1.0 - wallX;

        return {
            distance: dist,
            hit: hit,
            side: side,
            mapX: mapX,
            mapY: mapY,
            wallX: wallX
        };
    }
}
