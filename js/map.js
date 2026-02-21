// Test level 20x20
const testLevel = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 2, 2, 2, 2, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 0, 2, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 4, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 5, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

class GameMap {
    constructor(grid) {
        this.grid = grid;
        this.width = grid[0].length;
        this.height = grid.length;
        this.cellSize = 16;

        this.visited = Array.from({ length: this.height }, () => new Array(this.width).fill(false));

        this.doors = []; // List of {x, y, state, offset}
        this.initDoors();
    }

    initDoors() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === 9) {
                    this.doors.push({
                        x, y,
                        state: 'CLOSED', // CLOSED, OPENING, OPEN, CLOSING
                        offset: 0.0, // 0.0 = closed, 1.0 = fully open
                        timer: 0
                    });
                }
            }
        }
    }

    getDoor(x, y) {
        return this.doors.find(d => d.x === x && d.y === y);
    }

    update(dt) {
        for (let door of this.doors) {
            if (door.state === 'OPENING') {
                door.offset += dt * 2.0; // Speed
                if (door.offset >= 1.0) {
                    door.offset = 1.0;
                    door.state = 'OPEN';
                    door.timer = 0;
                }
            } else if (door.state === 'OPEN') {
                door.timer += dt;
                if (door.timer > 3.0) { // Auto close after 3s
                    door.state = 'CLOSING';
                }
            } else if (door.state === 'CLOSING') {
                door.offset -= dt * 2.0;
                if (door.offset <= 0.0) {
                    door.offset = 0.0;
                    door.state = 'CLOSED';
                }
            }
        }
    }

    tryOpenDoor(x, y) {
        const door = this.getDoor(x, y);
        if (door && (door.state === 'CLOSED' || door.state === 'CLOSING')) {
            door.state = 'OPENING';
            if (typeof AudioSystem !== 'undefined') AudioSystem.playDoorOpen();
        }
    }

    isWall(x, y) {
        if (!this.isInBounds(x, y)) return true;
        const type = this.grid[y][x];
        if (type === 0) return false;
        if (type === 9) {
            const door = this.getDoor(x, y);
            return door && door.state !== 'OPEN';
            // Simplified collision: solid unless fully open. 
            // Ideally check offset vs player position but this is enough for Step 7 basic.
        }
        return true;
    }

    getCell(x, y) {
        if (!this.isInBounds(x, y)) return 0;
        return this.grid[y][x];
    }

    revealCell(x, y) {
        if (this.isInBounds(x, y)) {
            this.visited[y][x] = true;
        }
    }

    isInBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    render2D(ctx, offsetX, offsetY) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                if (cell > 0) {
                    if (cell === 9) {
                        // Door
                        const door = this.getDoor(x, y);
                        ctx.fillStyle = (door.state === 'OPEN') ? '#00aa00' : '#aa00aa';
                        // Draw based on offset? Just fill for debug
                    } else {
                        ctx.fillStyle = this.getColor(cell);
                    }
                    ctx.fillRect(offsetX + x * this.cellSize, offsetY + y * this.cellSize, this.cellSize, this.cellSize);
                } else {
                    ctx.strokeStyle = '#333';
                    ctx.strokeRect(offsetX + x * this.cellSize, offsetY + y * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }
    }

    getColor(type) {
        const colors = {
            1: '#888888', // Grey wall
            2: '#aa0000', // Red wall
            3: '#00aa00', // Green wall
            4: '#0000aa', // Blue wall
            5: '#aaaa00', // Yellow wall
            9: '#aa00aa'  // Purple door
        };
        return colors[type] || '#ffffff';
    }
}
