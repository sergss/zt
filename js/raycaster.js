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
            // Jump to next map square
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
                dist = sideDistX - deltaDistX;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
                dist = sideDistY - deltaDistY;
            }

            // Reveal fog-of-war for Automap
            this.map.revealCell(Math.floor(posX), Math.floor(posY));
            this.map.revealCell(mapX, mapY);

            // Check if ray has hit a wall or object
            if (this.map.isInBounds(mapX, mapY)) {
                let type = this.map.getCell(mapX, mapY);
                if (type > 0) {
                    if (type === 9) {
                        // Door Frame handling (simplified: checks if ray hits the 'solid' part of the sliding door)
                        // Note: To do this properly requires recalculating 'wallX' here to see if we hit the door or the gap.

                        // Calculate where exactly screen-wise we hit
                        // Reuse wallX logic
                        let testWallX;
                        if (side === 0) testWallX = posY + dist * rayDirY;
                        else testWallX = posX + dist * rayDirX;
                        testWallX -= Math.floor(testWallX);

                        // Invert wallX if needed (standard logic)
                        if (side === 0 && rayDirX > 0) testWallX = 1.0 - testWallX;
                        if (side === 1 && rayDirY < 0) testWallX = 1.0 - testWallX;

                        let door = this.map.getDoor(mapX, mapY);
                        // If door is closed (offset 0), testWallX always hits (unless we want thin doors)
                        // If door is sliding: usually it slides "into" the wall.
                        // Let's assume it slides 'up' (texture wise) or 'sideways'.
                        // Wolf3D sliding blocks:
                        // If wallX > door.offset, it hits. Else it passes.

                        if (door && testWallX < (1.0 - door.offset)) { // Hit the door part
                            hit = type;
                            // Store door specific info if needed, e.g. for renderer to offset texture
                        } else {
                            // Ray passed through the open part of the door
                            hit = 0; // Continue ray
                        }
                    } else {
                        hit = type;
                    }
                }
            } else {
                hit = -1; // Out of bounds
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
