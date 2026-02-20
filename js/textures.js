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

        // Items
        const items = [
            'medkit', 'healthBig', 'healthSmall', 'armor', 'key',
            'ammo', 'ammoBullets', 'ammoShells', 'ammoBelt', 'ammoRockets', 'ammoFuel', 'ammoCells',
            'weaponShotgun', 'weaponAssaultRifle', 'weaponMachinegun', 'weaponRocketLauncher', 'weaponFlamethrower', 'weaponLaser',
            'enemyGuard', 'enemyDead', // Keep legacy for tests if any
            'zombie', 'soldier', 'alien'
        ];
        items.forEach(type => {
            this.textures[type] = this.generateTexture(type);
        });
    }

    generateTexture(type) {
        if ([
            'medkit', 'healthBig', 'healthSmall', 'armor', 'key', 'ammo',
            'ammoBullets', 'ammoShells', 'ammoBelt', 'ammoRockets', 'ammoFuel', 'ammoCells',
            'weaponShotgun', 'weaponAssaultRifle', 'weaponMachinegun', 'weaponRocketLauncher', 'weaponFlamethrower', 'weaponLaser',
            'enemyGuard', 'enemyDead',
            'zombie', 'soldier', 'alien'
        ].includes(type)) {
            return this.generateItemTexture(type);
        }

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

    generateItemTexture(type) {
        const canvas = document.createElement('canvas');
        canvas.width = this.size;
        canvas.height = this.size;
        const ctx = canvas.getContext('2d');

        // Transparent BG
        // ctx.clearRect(0,0,this.size, this.size); 

        if (type === 'medkit' || type === 'healthBig') {
            // White Square
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(16, 16, 32, 32);
            // Border (optional, but good for visibility)
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 1;
            ctx.strokeRect(16, 16, 32, 32);

            // Red Cross
            ctx.fillStyle = '#cc0000';
            const center = 32;
            const thick = 8;
            // Vertical bar
            ctx.fillRect(center - thick / 2, 22, thick, 20);
            // Horizontal bar
            ctx.fillRect(22, center - thick / 2, 20, thick);
        }
        else if (type === 'healthSmall') {
            // Blue potion/vial
            ctx.fillStyle = '#0000aa';
            ctx.beginPath();
            ctx.moveTo(24, 48);
            ctx.lineTo(40, 48);
            ctx.lineTo(40, 32);
            ctx.lineTo(32, 24);
            ctx.lineTo(24, 32);
            ctx.fill();
            ctx.fillStyle = '#4444ff';
            ctx.fillRect(28, 50, 8, 4); // Base
        }
        else if (type === 'armor') {
            // Shield Shape
            ctx.fillStyle = '#00aa00'; // Green Shield
            ctx.beginPath();
            ctx.moveTo(16, 16); // Top Left
            ctx.lineTo(48, 16); // Top Right
            ctx.lineTo(48, 40); // Side Right
            ctx.lineTo(32, 56); // Point
            ctx.lineTo(16, 40); // Side Left
            ctx.closePath();
            ctx.fill();

            // Inner Detail (Lighter Green)
            ctx.fillStyle = '#00cc00';
            ctx.beginPath();
            ctx.moveTo(22, 22);
            ctx.lineTo(42, 22);
            ctx.lineTo(42, 38);
            ctx.lineTo(32, 48);
            ctx.lineTo(22, 38);
            ctx.closePath();
            ctx.fill();
        }
        else if (type === 'ammo' || type === 'ammoBullets') {
            // Green Box
            ctx.fillStyle = '#444444';
            ctx.fillRect(20, 32, 24, 24); // Grey case
            ctx.fillStyle = '#aaaa00'; // Bullets
            ctx.fillRect(22, 34, 4, 4);
            ctx.fillRect(28, 34, 4, 4);
            ctx.fillRect(34, 34, 4, 4);
        }
        else if (type === 'ammoShells') {
            // Red Box
            ctx.fillStyle = '#aa0000';
            ctx.fillRect(16, 32, 32, 20);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(18, 34, 28, 16);
            // Label
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(20, 40, 24, 4);
        }
        else if (type === 'key') {
            // Yellow Card
            ctx.fillStyle = '#aaaa00';
            ctx.beginPath();
            ctx.ellipse(32, 32, 10, 20, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffff00';
            ctx.fillRect(24, 16, 16, 32);
            ctx.fillStyle = '#cccc00';
            ctx.fillRect(28, 20, 8, 24);
        }
        else if (type === 'weaponShotgun') {
            // Long black gun on floor
            ctx.fillStyle = '#111111';
            ctx.fillRect(10, 32, 44, 8); // Barrel
            ctx.fillStyle = '#553311'; // Stock
            ctx.fillRect(40, 30, 14, 12);
        }
        else if (type === 'weaponAssaultRifle') {
            // Grey Rifle
            ctx.fillStyle = '#444444';
            ctx.fillRect(10, 32, 30, 8);
            ctx.fillStyle = '#111111';
            ctx.fillRect(40, 32, 14, 10); // Stock
            ctx.fillRect(20, 26, 4, 6); // Sight
            ctx.fillRect(24, 40, 4, 8); // Mag
        }
        else if (type === 'weaponMachinegun') {
            // Big rapid fire gun (Minigun style?)
            ctx.fillStyle = '#222222';
            ctx.fillRect(10, 28, 40, 12);
            ctx.fillStyle = '#555555';
            ctx.fillRect(10, 30, 40, 2);
            ctx.fillRect(10, 34, 40, 2);
        }
        else if (type === 'weaponRocketLauncher') {
            // Green Tube
            ctx.fillStyle = '#224422';
            ctx.fillRect(8, 26, 48, 16);
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(10, 34, 6, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (type === 'weaponFlamethrower') {
            // Red/Orange tanks + nozzle
            ctx.fillStyle = '#aa4400';
            ctx.fillRect(30, 20, 20, 24); // Tank
            ctx.fillStyle = '#333333';
            ctx.fillRect(10, 30, 30, 6); // Nozzle
        }
        else if (type === 'weaponLaser') {
            // Futuristic White/Blue
            ctx.fillStyle = '#eeeeee';
            ctx.fillRect(14, 30, 36, 10);
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(16, 32, 30, 2); // Glow
        }
        else if (type === 'ammoBelt') {
            // Ammo Belt / Box
            ctx.fillStyle = '#333300';
            ctx.fillRect(16, 24, 32, 24);
            ctx.fillStyle = '#ffff00';
            for (let i = 0; i < 4; i++) ctx.fillRect(18 + i * 8, 26, 4, 20); // Bullets
        }
        else if (type === 'ammoRockets') {
            // Rocket Bundle
            ctx.fillStyle = '#335533';
            ctx.fillRect(20, 20, 10, 30);
            ctx.fillRect(34, 20, 10, 30);
            ctx.fillStyle = '#aa0000'; // Tips
            ctx.beginPath(); ctx.moveTo(20, 20); ctx.lineTo(25, 10); ctx.lineTo(30, 20); ctx.fill();
            ctx.beginPath(); ctx.moveTo(34, 20); ctx.lineTo(39, 10); ctx.lineTo(44, 20); ctx.fill();
        }
        else if (type === 'ammoFuel') {
            // Red Canister
            ctx.fillStyle = '#cc0000';
            ctx.fillRect(20, 16, 24, 40);
            ctx.fillStyle = '#ffffff';
            ctx.font = "10px monospace";
            ctx.fillText("GAS", 22, 40);
        }
        else if (type === 'ammoCells') {
            // Battery Pack
            ctx.fillStyle = '#444444';
            ctx.fillRect(20, 20, 24, 32);
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(24, 24, 16, 20); // Energy
        }
        else if (type === 'enemyGuard') {
            // Humanoid shape
            // Head
            ctx.fillStyle = '#eec'; // Skin
            ctx.fillRect(24, 4, 16, 16);
            // Helmet/Hat
            ctx.fillStyle = '#333';
            ctx.fillRect(22, 2, 20, 6);
            // Body (Uniform)
            ctx.fillStyle = '#334466'; // Blue-ish uniform
            ctx.fillRect(20, 20, 24, 24);
            // Legs
            ctx.fillStyle = '#223355';
            ctx.fillRect(22, 44, 8, 20);
            ctx.fillRect(34, 44, 8, 20);
            // Gun
            ctx.fillStyle = '#111';
            ctx.fillRect(10, 30, 20, 6);
        }
        else if (type === 'enemyDead') {
            // Lying down
            ctx.fillStyle = '#334466';
            ctx.fillRect(10, 40, 44, 12); // Body
            ctx.fillStyle = '#aa0000'; // Blood
            ctx.beginPath();
            ctx.arc(32, 46, 10, 0, Math.PI * 2);
            ctx.fill();
        }
        // New Enemies for Step 11
        else if (type === 'zombie') {
            // Zombie: Pale green skin, torn brown clothes, blood, asymmetrical

            // Body (Torn clothes)
            ctx.fillStyle = '#554433';
            ctx.fillRect(18, 20, 28, 26); // Torso
            // Shirt tear
            ctx.fillStyle = '#66aa66'; // Exposed chest
            ctx.beginPath();
            ctx.moveTo(24, 20); ctx.lineTo(32, 34); ctx.lineTo(40, 20); ctx.fill();

            // Head (pale green)
            ctx.fillStyle = '#66aa66';
            ctx.fillRect(22, 4, 20, 18);
            ctx.fillStyle = '#dd6688'; // Brain
            ctx.beginPath(); ctx.arc(32, 6, 8, Math.PI, 0); ctx.fill();
            // Eyes & Mouth (Hollow)
            ctx.fillStyle = '#222222';
            ctx.fillRect(26, 10, 4, 4);
            ctx.fillRect(36, 12, 3, 3); // Wonky eye
            ctx.fillStyle = '#331111';
            ctx.fillRect(28, 18, 10, 3);
            ctx.fillStyle = '#aaaaaa'; // Teeth
            ctx.fillRect(29, 18, 2, 2); ctx.fillRect(33, 18, 2, 2);

            // Legs (torn trousers, one exposed bone/leg)
            ctx.fillStyle = '#334455'; // Trousers
            ctx.fillRect(20, 46, 10, 16);
            ctx.fillRect(36, 46, 8, 10); // Missing lower leg
            ctx.fillStyle = '#66aa66'; // Exposed leg
            ctx.fillRect(37, 56, 6, 8);

            // Arms (one outstretched, one dangling)
            ctx.fillStyle = '#554433';
            ctx.fillRect(8, 20, 10, 8); // Right shoulder
            ctx.fillStyle = '#66aa66';
            ctx.fillRect(0, 22, 12, 4); // Right arm forward
            ctx.fillStyle = '#554433';
            ctx.fillRect(46, 20, 8, 12); // Left shoulder/sleeve
            ctx.fillStyle = '#66aa66';
            ctx.fillRect(48, 32, 4, 12); // Left arm down

            // Blood stains
            ctx.fillStyle = '#880000';
            ctx.fillRect(20, 26, 6, 8);
            ctx.fillRect(26, 32, 4, 4);
            ctx.fillRect(40, 48, 6, 14);
            ctx.fillRect(8, 22, 4, 4);
        }
        else if (type === 'soldier') {
            // Soldier: Tactical gear, helmet, visor, rifle

            // Head/Skin
            ctx.fillStyle = '#ffccaa';
            ctx.fillRect(24, 6, 16, 14);

            // Helmet (Dark green, brim)
            ctx.fillStyle = '#223322';
            ctx.beginPath();
            ctx.arc(32, 10, 10, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(22, 10, 20, 4); // Brim

            // Visor / Goggles
            ctx.fillStyle = '#111111';
            ctx.fillRect(24, 12, 16, 4);
            ctx.fillStyle = '#ff8800'; // Reflection
            ctx.fillRect(26, 13, 4, 2);

            // Body (Armor Vest & Pads)  
            ctx.fillStyle = '#334433'; // Undershirt
            ctx.fillRect(20, 20, 24, 24);
            ctx.fillStyle = '#112211'; // Tactical Vest
            ctx.fillRect(22, 22, 20, 18);
            // Pouches
            ctx.fillStyle = '#445544';
            ctx.fillRect(24, 34, 6, 6);
            ctx.fillRect(34, 34, 6, 6);
            // Belt
            ctx.fillStyle = '#111111';
            ctx.fillRect(20, 40, 24, 4);
            ctx.fillStyle = '#aaaaaa'; // Buckle
            ctx.fillRect(30, 40, 4, 4);

            // Legs & Boots
            ctx.fillStyle = '#334433'; // Pants
            ctx.fillRect(22, 44, 8, 14);
            ctx.fillRect(34, 44, 8, 14);
            ctx.fillStyle = '#111111'; // Boots
            ctx.fillRect(20, 58, 10, 6);
            ctx.fillRect(34, 58, 10, 6);

            // Arms
            ctx.fillStyle = '#334433';
            ctx.fillRect(14, 22, 6, 14); // Left arm
            ctx.fillRect(44, 22, 6, 14); // Right arm

            // Gun (Assault Rifle detailing)
            ctx.fillStyle = '#111111';
            ctx.fillRect(6, 30, 36, 6); // Barrel & Body
            ctx.fillRect(20, 36, 6, 8); // Magazine
            ctx.fillRect(36, 30, 10, 8); // Stock
            ctx.fillStyle = '#555555';
            ctx.fillRect(10, 28, 4, 2); // Sight
            ctx.fillStyle = '#aaaaaa';
            ctx.fillRect(8, 32, 4, 2); // Muzzle flash guard 
        }
        else if (type === 'alien') {
            // Alien: Purple, insectoid limbs, scaly body, large glowing eyes

            // Tapered scaly body
            ctx.fillStyle = '#5500aa';
            ctx.beginPath();
            ctx.moveTo(32, 20); ctx.lineTo(44, 30);
            ctx.lineTo(38, 48); ctx.lineTo(26, 48);
            ctx.lineTo(20, 30); ctx.fill();

            // Ribbed Scales
            ctx.strokeStyle = '#330066';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(24, 30); ctx.lineTo(40, 30); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(26, 36); ctx.lineTo(38, 36); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(28, 42); ctx.lineTo(36, 42); ctx.stroke();

            // Head (Xenomorph/Mantis shaped)
            ctx.fillStyle = '#440088';
            ctx.beginPath();
            ctx.moveTo(32, 2); ctx.lineTo(42, 10);
            ctx.lineTo(38, 22); ctx.lineTo(26, 22);
            ctx.lineTo(22, 10); ctx.fill();

            // Glowing Slanted Eyes
            ctx.fillStyle = '#00ffcc';
            ctx.beginPath();
            ctx.ellipse(27, 14, 4, 8, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath();
            ctx.ellipse(37, 14, 4, 8, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
            // Slit Pupils
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(27, 14, 1, 6, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath();
            ctx.ellipse(37, 14, 1, 6, Math.PI / 4, 0, Math.PI * 2); ctx.fill();

            // Reverse-jointed Legs
            ctx.strokeStyle = '#5500aa';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            // Left (rear from view)
            ctx.beginPath(); ctx.moveTo(26, 46); ctx.lineTo(16, 54); ctx.lineTo(20, 64); ctx.stroke();
            // Right (front from view)
            ctx.beginPath(); ctx.moveTo(38, 46); ctx.lineTo(48, 54); ctx.lineTo(44, 64); ctx.stroke();

            // Insectoid Arms/Claws
            // Left arm dangling
            ctx.beginPath(); ctx.moveTo(22, 26); ctx.lineTo(10, 36); ctx.lineTo(14, 46); ctx.stroke();
            // Right arm raised
            ctx.beginPath(); ctx.moveTo(42, 26); ctx.lineTo(54, 18); ctx.lineTo(60, 26); ctx.stroke();

            // Sharp Claws (pinkish/purple)
            ctx.fillStyle = '#ff00ff';
            ctx.beginPath(); ctx.moveTo(14, 46); ctx.lineTo(10, 52); ctx.lineTo(18, 52); ctx.fill();
            ctx.beginPath(); ctx.moveTo(60, 26); ctx.lineTo(64, 18); ctx.lineTo(54, 20); ctx.fill();
        } // End of generateItemTexture

        return canvas;
    }

    getTexture(id) {
        return this.textures[id];
    }
}
