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
        weapon7: ['Digit7']
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
