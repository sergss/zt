class PasswordSystem {
    static _chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    static encode(state) {
        let bits = new Array(80).fill(0);

        function setBits(offset, length, value) {
            for (let i = 0; i < length; i++) {
                bits[offset + i] = (value >> i) & 1;
            }
        }

        setBits(0, 5, state.level & 0x1F);

        let aliveMask = 0;
        for (let i = 0; i < 5; i++) if (state.alive[i]) aliveMask |= (1 << i);
        setBits(5, 5, aliveMask);

        setBits(10, 3, state.activeCharIdx & 0x7);
        setBits(13, 8, Math.min(255, state.hp));
        setBits(21, 7, Math.min(127, state.armor));

        let wMask = 0;
        for (let i = 0; i < 7; i++) if (state.weapons && state.weapons[i]) wMask |= (1 << i);
        setBits(28, 7, wMask);

        if (state.ammo) {
            setBits(35, 8, Math.min(255, state.ammo.bullets || 0));
            setBits(43, 7, Math.min(127, state.ammo.shells || 0));
            setBits(50, 8, Math.min(255, state.ammo.belt || 0));
            setBits(58, 7, Math.min(127, state.ammo.rockets || 0));
            setBits(65, 8, Math.min(255, state.ammo.fuel || 0));
            setBits(73, 7, Math.min(127, state.ammo.cells || 0));
        }

        let password = "";
        let checkSum = 0;
        for (let i = 0; i < 15; i++) {
            let val = 0;
            for (let b = 0; b < 5; b++) {
                val |= (bits[i * 5 + b] << b);
            }
            val = (val ^ (i + 5)) & 0x1F;
            password += this._chars[val];
            checkSum = (checkSum + val) & 0x1F;
        }

        password += this._chars[checkSum];
        return password;
    }

    static decode(password) {
        if (!password) return null;
        password = password.replace(/[^A-Z0-9]/ig, '').toUpperCase();
        if (password.length !== 16) return null;

        let checkSum = 0;
        let decodedVals = [];

        for (let i = 0; i < 15; i++) {
            let charIndex = this._chars.indexOf(password[i]);
            if (charIndex === -1) return null;

            checkSum = (checkSum + charIndex) & 0x1F;
            decodedVals.push((charIndex ^ (i + 5)) & 0x1F);
        }

        let checksumCharIndex = this._chars.indexOf(password[15]);
        if (checksumCharIndex !== checkSum) return null;

        let bits = new Array(80).fill(0);
        for (let i = 0; i < 15; i++) {
            let val = decodedVals[i];
            for (let b = 0; b < 5; b++) {
                bits[i * 5 + b] = (val >> b) & 1;
            }
        }

        function getBits(offset, length) {
            let val = 0;
            for (let i = 0; i < length; i++) {
                val |= (bits[offset + i] << i);
            }
            return val;
        }

        let state = {
            level: getBits(0, 5),
            alive: [false, false, false, false, false],
            activeCharIdx: getBits(10, 3),
            hp: getBits(13, 8),
            armor: getBits(21, 7),
            weapons: [false, false, false, false, false, false, false],
            ammo: {
                bullets: getBits(35, 8),
                shells: getBits(43, 7),
                belt: getBits(50, 8),
                rockets: getBits(58, 7),
                fuel: getBits(65, 8),
                cells: getBits(73, 7),
                infinite: 999
            }
        };

        let aliveMask = getBits(5, 5);
        for (let i = 0; i < 5; i++) state.alive[i] = (aliveMask & (1 << i)) !== 0;

        let wMask = getBits(28, 7);
        for (let i = 0; i < 7; i++) state.weapons[i] = (wMask & (1 << i)) !== 0;

        return state;
    }
}
