const Input = {
    keys: {},
    actions: {
        forward: ['KeyW', 'ArrowUp'],
        backward: ['KeyS', 'ArrowDown'],
        turnLeft: ['KeyA', 'ArrowLeft'],
        turnRight: ['KeyD', 'ArrowRight'],
        strafeLeft: ['KeyQ'],
        strafeRight: ['KeyE'],
        shoot: ['Space'],
        map: ['Tab'],
        weapon1: ['Digit1'],
        weapon2: ['Digit2'],
        weapon3: ['Digit3'],
        weapon4: ['Digit4'],
        weapon5: ['Digit5'],
        weapon6: ['Digit6'],
        weapon7: ['Digit7'],
        weaponCycle: ['WeaponCycle']
    },

    init() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            // Prevent scrolling for arrows and space
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mobile Touch Controls
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault(); // prevent mouse emulation click
                let key = btn.getAttribute('data-key');
                if (key === 'WeaponCycle') {
                    // We handle weapon cycle directly since it's not a holding action
                    // But we still set it so update loop can process it once
                    this.keys[key] = true;
                } else {
                    this.keys[key] = true;
                }
            }, { passive: false });

            // Handle touch end AND touch cancel (finger moved away)
            const release = (e) => {
                e.preventDefault();
                let key = btn.getAttribute('data-key');
                this.keys[key] = false;
            };

            btn.addEventListener('touchend', release, { passive: false });
            btn.addEventListener('touchcancel', release, { passive: false });
        });
    },

    isDown(code) {
        return !!this.keys[code];
    },

    isActionActive(action) {
        if (!this.actions[action]) return false;
        return this.actions[action].some(key => this.keys[key]);
    },

    // For debug display
    getPressedKeys() {
        return Object.keys(this.keys).filter(k => this.keys[k]);
    }
};
