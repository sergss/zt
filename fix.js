const fs = require("fs");
let code = fs.readFileSync("js/textures.js", "utf8");
const startMsg = "else if (type === 'guard' || type === 'guardAttack') {";
const endMsg = "else if (type === 'enemyDead') {";
const startIndex = code.indexOf(startMsg);
const endIndex = code.indexOf(endMsg);
if (startIndex > -1 && endIndex > -1 && endIndex > startIndex) {
    let newCode = code.substring(0, startIndex) + startMsg + `
            // Bulletproof Guard Texture
            ctx.fillStyle = '#222222'; ctx.fillRect(24, 2, 16, 12);
            ctx.fillStyle = '#ffaa00'; ctx.fillRect(26, 10, 12, 4);
            ctx.fillStyle = '#eeeecc'; ctx.fillRect(26, 14, 12, 6);
            ctx.fillStyle = '#334466'; ctx.fillRect(22, 20, 20, 24);
            ctx.fillStyle = '#111111'; ctx.fillRect(24, 22, 16, 14);
            ctx.fillStyle = '#444444'; ctx.fillRect(26, 24, 4, 6); ctx.fillRect(34, 24, 4, 6);
            ctx.fillStyle = '#334466'; ctx.fillRect(16, 22, 6, 12); ctx.fillRect(42, 22, 6, 12);
            ctx.fillStyle = '#222222'; ctx.fillRect(22, 42, 20, 4);
            ctx.fillStyle = '#dddddd'; ctx.fillRect(30, 42, 4, 4);
            ctx.fillStyle = '#223355'; ctx.fillRect(24, 46, 7, 14); ctx.fillRect(33, 46, 7, 14);
            ctx.fillStyle = '#111111'; ctx.fillRect(22, 58, 9, 6); ctx.fillRect(33, 58, 9, 6);
            ctx.fillStyle = '#111111'; ctx.fillRect(12, 32, 24, 6); ctx.fillRect(24, 38, 4, 6);
            ctx.fillStyle = '#444444'; ctx.fillRect(14, 30, 4, 2);

            if (type === 'guardAttack') {
                ctx.fillStyle = '#ffff00'; ctx.fillRect(8, 30, 6, 10);
                ctx.fillStyle = '#ffffff'; ctx.fillRect(10, 32, 2, 6);
            }
        }
        ` + code.substring(endIndex);
    fs.writeFileSync("js/textures.js", newCode);
    console.log("SUCCESS");
} else {
    console.log("Failed to find boundaries");
}
