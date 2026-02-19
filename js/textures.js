class TextureManager {
    constructor() {
        this.textures = {};
        this.size = 64; // Texture size
        this.initTextures();
    }

    initTextures() {
        // Generate textures programmatically
        this.textures[1] = this.generateTexture('metal');
        this.textures[2] = this.generateTexture('bricks');
        this.textures[3] = this.generateTexture('tech');
        this.textures[4] = this.generateTexture('concrete');
        this.textures[5] = this.generateTexture('door');
    }

    generateTexture(type) {
        const canvas = document.createElement('canvas');
        canvas.width = this.size;
        canvas.height = this.size;
        const ctx = canvas.getContext('2d');

        // Fill background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.size, this.size);

        if (type === 'metal') {
            // Type 1: Metal panel (Grey with lines)
            ctx.fillStyle = '#888888';
            ctx.fillRect(0, 0, this.size, this.size);
            ctx.strokeStyle = '#555555';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, this.size, this.size);
            // Rivets
            ctx.fillStyle = '#333333';
            ctx.fillRect(4, 4, 4, 4);
            ctx.fillRect(56, 4, 4, 4);
            ctx.fillRect(4, 56, 4, 4);
            ctx.fillRect(56, 56, 4, 4);
            // Tech line
            ctx.fillStyle = '#444444';
            ctx.fillRect(10, 30, 44, 4);
        }
        else if (type === 'bricks') {
            // Type 2: Bricks (Reddish)
            ctx.fillStyle = '#800000'; // Dark red background relative to mortar
            ctx.fillRect(0, 0, this.size, this.size);
            ctx.fillStyle = '#aa4444'; // Red brick color
            const brickH = 16;
            const brickW = 32;
            for (let y = 0; y < this.size; y += brickH) {
                const offset = (y / brickH) % 2 === 0 ? 0 : brickW / 2;
                for (let x = -brickW / 2; x < this.size; x += brickW) {
                    ctx.fillRect(x + offset + 1, y + 1, brickW - 2, brickH - 2);
                }
            }
        }
        else if (type === 'tech') {
            // Type 3: Tech (Greenish wires/panels)
            ctx.fillStyle = '#222222';
            ctx.fillRect(0, 0, this.size, this.size);
            ctx.fillStyle = '#00aa00';
            ctx.fillRect(10, 10, 20, 44);
            ctx.fillStyle = '#008800';
            ctx.fillRect(35, 10, 20, 10);
            ctx.fillRect(35, 25, 20, 10);
            ctx.fillRect(35, 40, 20, 14);
            // Wires
            ctx.strokeStyle = '#00ff00';
            ctx.beginPath();
            ctx.moveTo(0, 32);
            ctx.lineTo(64, 32);
            ctx.stroke();
        }
        else if (type === 'concrete') {
            // Type 4: Concrete (Grey noise)
            ctx.fillStyle = '#666666';
            ctx.fillRect(0, 0, this.size, this.size);
            for (let i = 0; i < 100; i++) {
                ctx.fillStyle = Math.random() > 0.5 ? '#777777' : '#555555';
                ctx.fillRect(Math.random() * this.size, Math.random() * this.size, 2, 2);
            }
        }
        else if (type === 'door') {
            // Type 5: Door (Yellow/Caution)
            ctx.fillStyle = '#555500';
            ctx.fillRect(0, 0, this.size, this.size);
            ctx.fillStyle = '#aaaa00';
            ctx.fillRect(4, 4, 56, 56);
            ctx.fillStyle = '#333333';
            ctx.fillRect(28, 0, 8, 64); // Vertical split
            ctx.beginPath();
            ctx.arc(48, 32, 4, 0, Math.PI * 2); // Handle/Panel
            ctx.fill();
        }

        return canvas;
    }

    getTexture(id) {
        return this.textures[id];
    }
}
