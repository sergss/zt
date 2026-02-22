class HUD {
    constructor(config) {
        this.width = config.SCREEN_WIDTH;
        this.height = config.SCREEN_HEIGHT;
        this.viewX = config.VIEWPORT_X;
        this.viewY = config.VIEWPORT_Y;
        this.viewW = config.VIEWPORT_W;
        this.viewH = config.VIEWPORT_H;

        // Colors based on original
        this.baseGreen = '#063820';
        this.darkGreen = '#031f11';
        this.neonGreen = '#0f0';
        this.yellowText = '#fd0';
        this.orangeId = '#c46927';
    }

    render(ctx, player, enemiesLeft, map) {
        // 1. Draw Background
        // Top
        ctx.fillStyle = this.baseGreen;
        ctx.fillRect(0, 0, this.width, this.viewY);
        // Bottom
        ctx.fillRect(0, this.viewY + this.viewH, this.width, this.height - (this.viewY + this.viewH));
        // Left
        ctx.fillRect(0, this.viewY, this.viewX, this.viewH);
        // Right
        ctx.fillRect(this.viewX + this.viewW, this.viewY, this.width - (this.viewX + this.viewW), this.viewH);

        // Frame Border around Viewport
        ctx.strokeStyle = '#334433';
        ctx.lineWidth = 4;
        ctx.strokeRect(this.viewX - 2, this.viewY - 2, this.viewW + 4, this.viewH + 4);

        // Grid lines on side borders for "tech" feel
        ctx.strokeStyle = '#1b2a1a';
        ctx.lineWidth = 1;
        for (let y = this.viewY; y < this.viewY + this.viewH; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.viewX, y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(this.viewX + this.viewW, y); ctx.lineTo(this.width, y); ctx.stroke();
        }

        // 2. Center Viewport Background (before 3D renders)
        // Handled by renderer mostly, but we draw the tech bevels around it

        // --- TOP BEVEL / WEAPONS BAR ---
        this.drawTopWeaponsBar(ctx, player);

        // --- SIDE PANELS (HP / ARMOR / SCORE ) ---
        this.drawSideIndicators(ctx, player, enemiesLeft);

        // --- BOTTOM CONSOLE ---
        this.drawBottomConsole(ctx, player, map);
    }

    drawTopWeaponsBar(ctx, player) {
        // Top area: y = 0 to 80
        const numSlots = 7;
        const slotWidth = 85;
        const slotSpacing = 10;
        const totalW = (slotWidth * numSlots) + (slotSpacing * (numSlots - 1));
        const startX = (this.width - totalW) / 2;
        const topY = 10;

        // Draw 7 slots
        for (let i = 0; i < numSlots; i++) {
            const x = startX + i * (slotWidth + slotSpacing);

            // Slot background
            ctx.fillStyle = '#111';
            ctx.fillRect(x, topY, slotWidth, 55);
            ctx.strokeStyle = '#055'; // Dark teal grid line
            ctx.lineWidth = 1;
            ctx.strokeRect(x, topY, slotWidth, 55);
            // Internal grid
            ctx.beginPath(); ctx.moveTo(x + slotWidth / 2, topY); ctx.lineTo(x + slotWidth / 2, topY + 55); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x, topY + 27); ctx.lineTo(x + slotWidth, topY + 27); ctx.stroke();

            // Which weapon goes here?
            let wepIndex = i;
            const wep = WEAPONS[wepIndex];

            // Highlight if selected
            if (player.currentWeaponIndex === wepIndex) {
                ctx.strokeStyle = this.neonGreen;
                ctx.lineWidth = 2;
                ctx.strokeRect(x - 2, topY - 2, slotWidth + 4, 59);
            }

            if (wep) {
                // Name (truncate if too long)
                let printName = wep.name.toUpperCase();
                if (printName === "ASSAULT RIFLE") printName = "A. RIFLE";
                if (printName === "ROCKET LAUNCHER") printName = "RL/RPG";

                ctx.fillStyle = this.yellowText;
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(printName, x + slotWidth / 2, topY - 2);

                // Ammo
                ctx.fillStyle = this.yellowText;
                ctx.textAlign = 'left';
                let ammo = player.ammo[wep.ammoType] || 0;
                ctx.fillText(ammo.toString(), x + 4, topY + 50);

                // Icon (placeholder based on index)
                ctx.fillStyle = '#666';
                if (i === 0) { // Pistol
                    ctx.fillRect(x + 20, topY + 15, 25, 6);
                    ctx.fillRect(x + 20, topY + 21, 6, 10);
                } else if (i === 1) { // Shotgun
                    ctx.fillStyle = '#842';
                    ctx.fillRect(x + 10, topY + 18, 50, 6);
                    ctx.fillRect(x + 10, topY + 24, 15, 8);
                    ctx.fillRect(x + 40, topY + 24, 20, 4);
                } else if (i === 2 || i === 3) { // Rifle/MG
                    ctx.fillRect(x + 10, topY + 16, 55, 12);
                } else if (i === 4) { // Rocket
                    ctx.fillStyle = '#563'; // Olive green tube
                    ctx.fillRect(x + 10, topY + 15, 60, 10);
                } else if (i === 5) { // Flamethrower
                    ctx.fillStyle = '#a00'; // Red tank
                    ctx.fillRect(x + 15, topY + 15, 30, 12);
                    ctx.fillStyle = '#f80'; // flame
                    ctx.fillRect(x + 50, topY + 16, 15, 6);
                } else if (i === 6) { // Laser
                    ctx.fillStyle = '#11a';
                    ctx.fillRect(x + 15, topY + 16, 45, 8);
                    ctx.fillStyle = '#eff';
                    ctx.fillRect(x + 60, topY + 18, 10, 4);
                }
            }
        }
    }

    drawSideIndicators(ctx, player, enemiesLeft) {
        // Left Box: 50 (Health/Armor combo value in orig, we'll show HP)
        ctx.fillStyle = '#000';
        ctx.fillRect(100, 200, 50, 30);
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth = 2;
        ctx.strokeRect(100, 200, 50, 30);

        ctx.fillStyle = this.yellowText;
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(Math.floor(player.hp).toString(), 125, 222);

        // Right Box: Enemies Left (Wait, in orig it might be something else, let's use it for enemies)
        ctx.fillStyle = '#000';
        ctx.fillRect(this.width - 150, 200, 50, 30);
        ctx.strokeRect(this.width - 150, 200, 50, 30);

        ctx.fillStyle = this.yellowText;
        ctx.fillText(enemiesLeft.toString(), this.width - 125, 222);
    }

    drawBottomConsole(ctx, char, map) {
        const consoleY = this.viewY + this.viewH;

        // 1. Left decorative tech area
        ctx.fillStyle = this.darkGreen;
        ctx.fillRect(20, consoleY + 20, 260, 150);
        ctx.strokeStyle = this.neonGreen; ctx.lineWidth = 2;
        ctx.strokeRect(20, consoleY + 20, 260, 150);
        // Small decorative bar inside
        ctx.fillStyle = '#053'; ctx.fillRect(40, consoleY + 130, 150, 30);
        ctx.fillStyle = '#0a4'; ctx.fillRect(40, consoleY + 130, 150 * (char.armor / 100), 30);
        ctx.fillStyle = this.neonGreen; ctx.font = '10px monospace'; ctx.textAlign = 'right';
        ctx.fillText("167.05 MHZ", 180, consoleY + 125);
        ctx.fillStyle = '#0f0'; ctx.fillText(`ARMOR: ${char.armor}`, 180, consoleY + 150);

        // 2. ID Card (Right)
        this.drawIDCard(ctx, char, this.width - 340, consoleY + 10);

        // 3. Center Minimap Frame
        ctx.fillStyle = '#000';
        const mapX = 300;
        const mapY = consoleY + 10;
        const mapW = 300;
        const mapH = 160;
        ctx.fillRect(mapX, mapY, mapW, mapH);
        ctx.strokeStyle = this.neonGreen;
        ctx.lineWidth = 4;
        ctx.strokeRect(mapX, mapY, mapW, mapH);
    }

    drawIDCard(ctx, char, cardX, cardY) {
        const cardW = 320;
        const cardH = 160;

        // Card Base
        ctx.fillStyle = this.orangeId;
        ctx.fillRect(cardX, cardY, cardW, cardH);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeRect(cardX, cardY, cardW, cardH);

        // Seal/Logo background
        ctx.fillStyle = '#46b'; // Light blue box for UN
        ctx.fillRect(cardX + cardW - 120, cardY + 10, 110, 30);
        ctx.fillStyle = '#cdf';
        ctx.font = 'bold 24px serif';
        ctx.textAlign = 'center';
        ctx.fillText('U N', cardX + cardW - 65, cardY + 34);

        ctx.fillStyle = '#000';
        ctx.textAlign = 'left';

        ctx.font = 'bold 16px "Courier New", Courier, monospace';
        let displayName = char.name;
        if (char.name.includes("John")) displayName = "Capt. J. Miller";
        else if (char.name.includes("Sarah")) displayName = "Sgt. S. Connor";
        else if (char.name.includes("Crazy")) displayName = "Dr. I. Vanko";
        else if (char.name.includes("Bob")) displayName = "Pvt. R. Biggs";
        else if (char.name.includes("Agent")) displayName = "Special Agent X";

        ctx.fillText(displayName, cardX + 110, cardY + 50);

        ctx.font = 'bold 14px "Courier New", Courier, monospace';
        ctx.fillText('3534C-148', cardX + 110, cardY + 68);
        ctx.fillText(char.weapon ? char.weapon.toUpperCase() : 'MARKSMAN', cardX + 110, cardY + 84);

        // Detailed Stats
        let hair = 'BLK'; let sex = 'M'; let eyes = 'BRN';
        if (char.name.includes("Agent")) { hair = 'N/A'; eyes = 'N/A'; sex = 'U'; }
        else if (char.name.includes("Sarah")) { hair = 'BRN'; eyes = 'BLU'; sex = 'F'; }
        else if (char.name.includes("Crazy")) { hair = 'WHT'; eyes = 'GRN'; }

        const statsStr1 = `Hair:${hair} Ht:180`;
        const statsStr2 = `Eyes:${eyes} Wt:${char.maxHp || 100}`;
        const statsStr3 = `Sex:${sex}`;
        const dobStr = `DOB:01-15-70`;

        ctx.font = '12px "Courier New", Courier, monospace';
        ctx.fillText(statsStr1, cardX + 110, cardY + 104);
        ctx.fillText(statsStr2, cardX + 110, cardY + 118);
        ctx.fillText(statsStr3, cardX + 110, cardY + 132);
        ctx.fillText(dobStr, cardX + 110, cardY + 146);

        // Signature
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        let sigX = cardX + 10;
        let sigY = cardY + 140;
        // Just scribbling the first letter of the name
        ctx.fillText(displayName.split('.')[1] || displayName, sigX, sigY + 10);
        ctx.moveTo(sigX, sigY);
        ctx.bezierCurveTo(sigX + 20, sigY - 10, sigX + 30, sigY + 5, sigX + 80, sigY - 5);
        ctx.stroke();

        this.drawFace(ctx, char, cardX + 10, cardY + 10, 90);
    }

    drawFace(ctx, char, x, y, size = 90) {
        ctx.save();
        ctx.translate(x, y);
        const s = size / 100; // Work in a 100x100 space internally
        ctx.scale(s, s);

        // Backdrop
        ctx.fillStyle = '#6a8db4'; // Blueish grey photo background
        let isDead = char.hp <= 0;
        let isHurt = char.hp > 0 && char.hp < (char.maxHp || 100) * 0.4;

        // Blink if hurt
        if (isHurt && Math.floor(Date.now() / 250) % 2 === 0) {
            ctx.fillStyle = '#bd2d2d'; // Reddish danger background
        }

        ctx.fillRect(0, 0, 100, 110);

        let cName = char.name || '';

        if (cName.includes("John")) {
            // African-American character based on the new screenshot (Capt. S. Haile vibe)
            ctx.fillStyle = '#6b4531'; // Darker skin
            ctx.beginPath(); ctx.ellipse(50, 60, 25, 35, 0, 0, Math.PI * 2); ctx.fill();

            // Neck / Shirt
            ctx.fillRect(40, 85, 20, 25);
            ctx.fillStyle = '#1c624d'; // Green uniform
            ctx.beginPath(); ctx.moveTo(10, 110); ctx.lineTo(40, 85); ctx.lineTo(60, 85); ctx.lineTo(90, 110); ctx.fill();
            ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.moveTo(40, 85); ctx.lineTo(50, 95); ctx.lineTo(60, 85); ctx.fill();

            // Hair
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(50, 35, 23, Math.PI, 0); ctx.fill();
            ctx.fillRect(27, 35, 8, 20); // Sideburns
            ctx.fillRect(65, 35, 8, 20);

            // Beard / Stubble
            ctx.fillStyle = '#211';
            ctx.beginPath(); ctx.moveTo(35, 75); ctx.lineTo(50, 95); ctx.lineTo(65, 75); ctx.fill();
            ctx.fillStyle = '#6b4531'; // mouth cutout
            ctx.beginPath(); ctx.ellipse(50, 80, 10, 6, 0, 0, Math.PI * 2); ctx.fill();

            // Eyes & Brows
            ctx.fillStyle = '#fff'; ctx.fillRect(35, 48, 10, 5); ctx.fillRect(55, 48, 10, 5);
            ctx.fillStyle = '#000'; ctx.fillRect(40, 48, 4, 4); ctx.fillRect(56, 48, 4, 4);
            ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(33, 44); ctx.lineTo(47, 46); ctx.stroke(); // Angled brow
            ctx.beginPath(); ctx.moveTo(53, 46); ctx.lineTo(67, 44); ctx.stroke();

            // Nose
            ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(46, 50, 8, 18);

            // Mouth
            ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
            if (isDead) { ctx.beginPath(); ctx.arc(50, 85, 6, 0, Math.PI * 2); ctx.stroke(); }
            else if (isHurt) { ctx.beginPath(); ctx.moveTo(42, 85); ctx.lineTo(58, 83); ctx.stroke(); }
            else { ctx.beginPath(); ctx.moveTo(44, 85); ctx.lineTo(56, 85); ctx.stroke(); }
        } else {
            // General Template for others
            ctx.fillStyle = '#e8ba9c'; // Light skin
            if (cName.includes("Crazy")) ctx.fillStyle = '#ffd1b3';
            ctx.beginPath(); ctx.ellipse(50, 60, 22, 30, 0, 0, Math.PI * 2); ctx.fill();

            ctx.fillRect(40, 80, 20, 30); // Neck
            ctx.fillStyle = '#223'; // Dark uniform
            ctx.beginPath(); ctx.moveTo(10, 110); ctx.lineTo(35, 90); ctx.lineTo(65, 90); ctx.lineTo(90, 110); ctx.fill();

            // Eyes
            ctx.fillStyle = '#fff'; ctx.fillRect(38, 50, 8, 4); ctx.fillRect(54, 50, 8, 4);
            ctx.fillStyle = '#000'; ctx.fillRect(41, 50, 3, 3); ctx.fillRect(56, 50, 3, 3);

            // Nose
            ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(48, 54, 4, 12);

            // Mouth
            ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
            if (isDead) {
                ctx.beginPath(); ctx.ellipse(50, 78, 6, 8, 0, 0, Math.PI * 2); ctx.stroke();
                ctx.fillStyle = 'red'; ctx.fill();
                ctx.beginPath(); ctx.moveTo(37, 48); ctx.lineTo(47, 56); ctx.moveTo(47, 48); ctx.lineTo(37, 56); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(53, 48); ctx.lineTo(63, 56); ctx.moveTo(63, 48); ctx.lineTo(53, 56); ctx.stroke();
            } else {
                ctx.beginPath(); ctx.moveTo(44, 78); ctx.lineTo(56, 78); ctx.stroke();
            }

            // Hair/Masks
            if (cName.includes("Sarah")) {
                ctx.fillStyle = '#521';
                ctx.beginPath(); ctx.moveTo(28, 60); ctx.quadraticCurveTo(50, 10, 72, 60); ctx.quadraticCurveTo(50, 10, 28, 60); ctx.fill();
                ctx.fillRect(25, 40, 10, 40); ctx.fillRect(65, 40, 10, 40);
            } else if (cName.includes("Crazy")) {
                ctx.fillStyle = '#eee';
                ctx.beginPath(); ctx.moveTo(25, 55); ctx.lineTo(15, 20); ctx.lineTo(35, 30); ctx.lineTo(45, 10); ctx.lineTo(55, 30); ctx.lineTo(70, 15); ctx.lineTo(75, 55); ctx.fill();
                ctx.strokeRect(35, 47, 12, 12); ctx.strokeRect(53, 47, 12, 12); // Glasses
            } else if (cName.includes("Bob")) {
                ctx.fillStyle = '#111'; ctx.fillRect(35, 48, 30, 8); // Shades
                ctx.fillStyle = '#642'; ctx.fillRect(38, 76, 12, 4); // Cigar
            } else if (cName.includes("Agent")) {
                ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(50, 56, 24, 32, 0, 0, Math.PI * 2); ctx.fill(); // Helmet
                ctx.fillStyle = '#f00'; ctx.fillRect(30, 45, 40, 14); // Visor
                ctx.fillStyle = '#fff'; ctx.fillRect(34, 47, 32, 3);
            }
        }

        // Blood Splatters
        if (char.hp < (char.maxHp || 100)) {
            ctx.fillStyle = 'rgba(200, 0, 0, 0.8)';
            if (char.hp < (char.maxHp || 100) * 0.7) {
                ctx.beginPath(); ctx.arc(70, 50, 6, 0, Math.PI * 2); ctx.fill();
                ctx.fillRect(68, 50, 4, 15);
            }
            if (char.hp < (char.maxHp || 100) * 0.3) {
                ctx.beginPath(); ctx.arc(30, 70, 8, 0, Math.PI * 2); ctx.fill();
                ctx.fillRect(28, 70, 6, 30);
                if (!cName.includes("Agent")) {
                    ctx.fillRect(40, 40, 4, 18);
                    ctx.fillRect(58, 45, 6, 12);
                }
            }
        }

        // Shadow / Frame Edge
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, 100, 110);
        ctx.restore();
    }
}
