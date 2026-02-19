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
        this.cellSize = 16; // Using 16px as per tasks.md for debugging view
    }

    isWall(x, y) {
        if (!this.isInBounds(x, y)) return true;
        return this.grid[y][x] > 0 && this.grid[y][x] !== 9; // 9 is door (passable if open, but for now just treat type 1-5 as solid)
        // Adjusting logic: tasks.md says 1-5 are walls. 9 is door. 
        // For basic collision, usually doors are walls until opened.
        // Step 3 tests just check isWall(0,0) (type 1) vs inner (type 0).
    }

    getCell(x, y) {
        if (!this.isInBounds(x, y)) return 0;
        return this.grid[y][x];
    }

    isInBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    render2D(ctx, offsetX, offsetY) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                if (cell > 0) {
                    ctx.fillStyle = this.getColor(cell);
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
