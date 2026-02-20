const fs = require('fs');

const file = 'd:/code/zt/js/textures.js';
let content = fs.readFileSync(file, 'utf-8');

const attackCode = `
        else if (type === 'zombieAttack') {
            // Zombie Attack: Both arms raised and reaching forward
            ctx.fillStyle = '#554433'; ctx.fillRect(18, 20, 28, 26);
            ctx.fillStyle = '#66aa66'; ctx.beginPath(); ctx.moveTo(24, 20); ctx.lineTo(32, 34); ctx.lineTo(40, 20); ctx.fill();
            ctx.fillStyle = '#66aa66'; ctx.fillRect(22, 4, 20, 18);
            ctx.fillStyle = '#dd6688'; ctx.beginPath(); ctx.arc(32, 6, 8, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#222222'; ctx.fillRect(26, 10, 4, 4); ctx.fillRect(36, 12, 3, 3);
            ctx.fillStyle = '#331111'; ctx.fillRect(28, 18, 10, 4); // Mouth wider open
            ctx.fillStyle = '#aaaaaa'; ctx.fillRect(29, 18, 2, 2); ctx.fillRect(33, 18, 2, 2);
            ctx.fillStyle = '#334455'; ctx.fillRect(20, 46, 10, 16); ctx.fillRect(36, 46, 8, 10);
            ctx.fillStyle = '#66aa66'; ctx.fillRect(37, 56, 6, 8);
            
            // Both arms attack forward
            ctx.fillStyle = '#554433'; ctx.fillRect(4, 20, 14, 8); // Right shoulder extending out
            ctx.fillStyle = '#66aa66'; ctx.fillRect(0, 18, 8, 12); // Right claw
            
            ctx.fillStyle = '#554433'; ctx.fillRect(46, 20, 14, 8); // Left shoulder extending out
            ctx.fillStyle = '#66aa66'; ctx.fillRect(56, 18, 8, 12); // Left claw

            ctx.fillStyle = '#880000'; ctx.fillRect(20, 26, 6, 8); ctx.fillRect(26, 32, 4, 4); ctx.fillRect(40, 48, 6, 14);
        }
        else if (type === 'soldierAttack') {
            // Soldier Attack: Muzzle Flash
            ctx.fillStyle = '#ffccaa'; ctx.fillRect(24, 6, 16, 14);
            ctx.fillStyle = '#223322'; ctx.beginPath(); ctx.arc(32, 10, 10, Math.PI, 0); ctx.fill(); ctx.fillRect(22, 10, 20, 4);
            ctx.fillStyle = '#111111'; ctx.fillRect(24, 12, 16, 4);
            ctx.fillStyle = '#ff8800'; ctx.fillRect(26, 13, 4, 2);
            ctx.fillStyle = '#334433'; ctx.fillRect(20, 20, 24, 24);
            ctx.fillStyle = '#112211'; ctx.fillRect(22, 22, 20, 18);
            ctx.fillStyle = '#445544'; ctx.fillRect(24, 34, 6, 6); ctx.fillRect(34, 34, 6, 6);
            ctx.fillStyle = '#111111'; ctx.fillRect(20, 40, 24, 4);
            ctx.fillStyle = '#aaaaaa'; ctx.fillRect(30, 40, 4, 4);
            ctx.fillStyle = '#334433'; ctx.fillRect(22, 44, 8, 14); ctx.fillRect(34, 44, 8, 14);
            ctx.fillStyle = '#111111'; ctx.fillRect(20, 58, 10, 6); ctx.fillRect(34, 58, 10, 6);
            ctx.fillStyle = '#334433'; ctx.fillRect(14, 22, 6, 14); ctx.fillRect(44, 22, 6, 14);
            
            // Gun
            ctx.fillStyle = '#111111'; ctx.fillRect(6, 30, 36, 6); ctx.fillRect(20, 36, 6, 8); ctx.fillRect(36, 30, 10, 8);
            ctx.fillStyle = '#555555'; ctx.fillRect(10, 28, 4, 2);
            ctx.fillStyle = '#aaaaaa'; ctx.fillRect(8, 32, 4, 2);
            
            // Muzzle Flash
            ctx.fillStyle = '#ffff00';
            ctx.beginPath(); ctx.arc(4, 33, 6, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ff8800';
            ctx.beginPath(); ctx.arc(4, 33, 4, 0, Math.PI*2); ctx.fill();
        }
        else if (type === 'alienAttack') {
            // Alien Attack: Claws raised, inner jaw out
            const cx = 32;
            ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); ctx.moveTo(cx, 36); ctx.bezierCurveTo(cx+24, 20, cx+30, 50, cx+16, 56); ctx.bezierCurveTo(cx+10, 60, cx-20, 55, cx-24, 45); ctx.stroke();
            ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(cx+21,34); ctx.lineTo(cx+23,36); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx+23,40); ctx.lineTo(cx+25,42); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx+20,48); ctx.lineTo(cx+22,46); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx+16,52); ctx.lineTo(cx+18,50); ctx.stroke();
            ctx.fillStyle = '#444'; ctx.beginPath(); ctx.moveTo(cx-24,45); ctx.lineTo(cx-30,40); ctx.lineTo(cx-22,38); ctx.fill();
            ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(cx-8, 26); ctx.quadraticCurveTo(cx-14, 10, cx-6, 12); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx+8, 26); ctx.quadraticCurveTo(cx+14, 10, cx+6, 12); ctx.stroke();
            ctx.fillStyle = '#0a0a0a'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(cx-6, 38); ctx.lineTo(cx-16, 46); ctx.lineTo(cx-10, 56); ctx.stroke(); ctx.beginPath(); ctx.arc(cx-16, 46, 2, 0, Math.PI*2); ctx.fill(); 
            ctx.beginPath(); ctx.moveTo(cx-10, 56); ctx.lineTo(cx-16, 62); ctx.lineTo(cx-12, 62); ctx.fill(); ctx.beginPath(); ctx.moveTo(cx-10, 56); ctx.lineTo(cx-6, 60); ctx.lineTo(cx-4, 58); ctx.fill();
            ctx.beginPath(); ctx.moveTo(cx+6, 38); ctx.lineTo(cx+16, 46); ctx.lineTo(cx+10, 56); ctx.stroke(); ctx.beginPath(); ctx.arc(cx+16, 46, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(cx+10, 56); ctx.lineTo(cx+16, 62); ctx.lineTo(cx+12, 62); ctx.fill(); ctx.beginPath(); ctx.moveTo(cx+10, 56); ctx.lineTo(cx+6, 60); ctx.lineTo(cx+4, 58); ctx.fill();
            
            // Raised Arms (Attacking)
            ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(cx-10, 24); ctx.lineTo(cx-24, 16); ctx.lineTo(cx-30, 24); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx+10, 24); ctx.lineTo(cx+24, 16); ctx.lineTo(cx+30, 24); ctx.stroke();
            ctx.fillStyle = '#1e1e1e'; ctx.beginPath(); ctx.arc(cx-10, 24, 3, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(cx+10, 24, 3, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#555'; ctx.lineWidth = 2; // Brighter claws
            ctx.beginPath(); ctx.moveTo(cx-30, 24); ctx.lineTo(cx-28, 32); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx-30, 24); ctx.lineTo(cx-32, 30); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx+30, 24); ctx.lineTo(cx+28, 32); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx+30, 24); ctx.lineTo(cx+32, 30); ctx.stroke();

            ctx.fillStyle = '#0a0a0a'; ctx.beginPath(); ctx.moveTo(cx, 20); ctx.lineTo(cx+9, 24); ctx.lineTo(cx+6, 32); ctx.lineTo(cx+3, 38); ctx.lineTo(cx-3, 38); ctx.lineTo(cx-6, 32); ctx.lineTo(cx-9, 24); ctx.fill();
            ctx.strokeStyle = '#444'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(cx-6, 26); ctx.quadraticCurveTo(cx, 28, cx+6, 26); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx-5, 29); ctx.quadraticCurveTo(cx, 31, cx+5, 29); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx-4, 32); ctx.quadraticCurveTo(cx, 34, cx+4, 32); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx-3, 35); ctx.quadraticCurveTo(cx, 36, cx+3, 35); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx, 24); ctx.lineTo(cx, 38); ctx.stroke();

            ctx.fillStyle = '#080808'; ctx.beginPath(); ctx.moveTo(cx-8, 16); ctx.bezierCurveTo(cx-8, 4, cx-4, 0, cx, 0); ctx.bezierCurveTo(cx+4, 0, cx+8, 4, cx+8, 16); ctx.fill();
            ctx.fillStyle = '#111'; ctx.beginPath(); ctx.moveTo(cx-8, 14); ctx.lineTo(cx-6, 22); ctx.lineTo(cx-4, 25); ctx.lineTo(cx, 24); ctx.lineTo(cx+4, 25); ctx.lineTo(cx+6, 22); ctx.lineTo(cx+8, 14); ctx.fill();
            
            ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 6; ctx.fillStyle = '#ff0000';
            ctx.beginPath(); ctx.moveTo(cx-7, 16); ctx.lineTo(cx-2, 18); ctx.lineTo(cx-4, 15); ctx.fill();
            ctx.beginPath(); ctx.moveTo(cx+7, 16); ctx.lineTo(cx+2, 18); ctx.lineTo(cx+4, 15); ctx.fill();
            ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(cx-4, 16.5, 0.5, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(cx+4, 16.5, 0.5, 0, Math.PI*2); ctx.fill();

            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(cx-5, 18); ctx.lineTo(cx, 16); ctx.lineTo(cx+5, 18); ctx.lineTo(cx+4, 24); ctx.lineTo(cx, 26); ctx.lineTo(cx-4, 24); ctx.fill();
            
            // Inner jaw jutting forward
            ctx.fillStyle = '#888'; ctx.fillRect(cx-2, 22, 4, 3);
            ctx.fillStyle = '#aaa'; ctx.fillRect(cx-1, 25, 1, 2); ctx.fillRect(cx+1, 25, 1, 2); // Tiny teeth
            
            ctx.fillStyle = 'rgba(200, 255, 200, 0.5)';
            ctx.fillRect(cx-4, 25, 1, 4); ctx.fillRect(cx+2, 24, 1, 6);
        }
`;

content = content.replace('        } // End of generateItemTexture', attackCode + '\n        } // End of generateItemTexture');

fs.writeFileSync(file, content);
console.log('Attack textures added.');
