class CharacterRoster {
    constructor() {
        this.characters = [
            { name: 'John "Gore" Miller', hp: 100, maxHp: 100, speed: 3.0, armor: 50, startWeapon: 2, alive: true, portrait: '#ffaaaa' }, // Assault Rifle
            { name: 'Sarah "Snipe" Connor', hp: 80, maxHp: 80, speed: 3.5, armor: 25, startWeapon: 1, alive: true, portrait: '#aaffaa' },  // Shotgun
            { name: 'Big Bob', hp: 150, maxHp: 150, speed: 2.0, armor: 100, startWeapon: 0, alive: true, portrait: '#aaaaff' },          // Pistol, Tank
            { name: 'Dr. "Crazy" Ivan', hp: 60, maxHp: 60, speed: 2.5, armor: 0, startWeapon: 4, alive: true, portrait: '#ffffaa' },     // Rocket
            { name: 'Agent X', hp: 90, maxHp: 90, speed: 4.0, armor: 25, startWeapon: 6, alive: true, portrait: '#ffaaff' }              // Laser
        ];
        this.selectedIndex = 0;
    }

    getAliveCharacters() {
        return this.characters.filter(c => c.alive);
    }

    aliveCount() {
        return this.getAliveCharacters().length;
    }

    isAlive(name) {
        const c = this.characters.find(ch => ch.name === name);
        return c ? c.alive : false;
    }

    kill(name) {
        const c = this.characters.find(ch => ch.name === name);
        if (c) c.alive = false;
    }

    isGameOver() {
        return this.aliveCount() === 0;
    }

    nextAliveIndex(currentIndex) {
        // Move to the next alive character (wrap around)
        for (let i = 1; i <= this.characters.length; i++) {
            let idx = (currentIndex + i) % this.characters.length;
            if (this.characters[idx].alive) return idx;
        }
        return currentIndex;
    }
}
