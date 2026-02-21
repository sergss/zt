class AudioSystem {
    static ctx = null;
    static masterGain = null;
    static enabled = true;
    static initialized = false;

    // We can't start audio until player interacts
    static init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            // Add a compressor to prevent clipping when many sounds play
            this.compressor = this.ctx.createDynamicsCompressor();
            this.compressor.threshold.value = -10;
            this.compressor.knee.value = 10;
            this.compressor.ratio.value = 12;
            this.compressor.attack.value = 0;
            this.compressor.release.value = 0.25;
            this.compressor.connect(this.ctx.destination);

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5; // Default volume
            this.masterGain.connect(this.compressor);

            // Resume contextual tracking
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            this.initialized = true;
            this.startAmbient();
            console.log("AudioSystem initialized.");
        } catch (e) {
            console.warn("Web Audio API not supported", e);
            this.enabled = false;
        }
    }

    static getVolume(baseVol, distance) {
        if (distance === undefined) return baseVol;
        // Simple linear falloff up to 15 cells distance
        let factor = Math.max(0.01, 1.0 - (distance / 15.0));
        return baseVol * factor;
    }

    static playTone(freq, type, duration, vol = 1.0, distance) {
        if (!this.enabled || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        let finalVol = this.getVolume(vol, distance);
        gain.gain.setValueAtTime(finalVol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    static playNoise(duration, vol = 1.0, distance) {
        if (!this.enabled || !this.ctx) return;

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        const gain = this.ctx.createGain();
        let finalVol = this.getVolume(vol, distance);
        gain.gain.setValueAtTime(finalVol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
    }

    static startAmbient() {
        if (!this.enabled || !this.ctx) return;

        // Low frequency drone
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 40; // deep bass

        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // very slow modulation

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 5;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        const gain = this.ctx.createGain();
        gain.gain.value = 0.2; // quiet ambient volume

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        lfo.start();

        // Random sparse high tones
        setInterval(() => {
            if (Math.random() > 0.6) {
                this.playTone(200 + Math.random() * 300, 'sine', 3.0, 0.05);
            }
        }, 8000);
    }

    // Game-specific sounds
    static playShootPistol(dist) {
        if (!this.enabled) return;
        this.playNoise(0.1, 0.5, dist);
        this.playTone(400, 'square', 0.1, 0.3, dist);
    }

    static playShootShotgun(dist) {
        if (!this.enabled) return;
        this.playNoise(0.3, 0.8, dist);
        this.playTone(100, 'sawtooth', 0.2, 0.5, dist);
    }

    static playShootRifle(dist) {
        if (!this.enabled) return;
        this.playNoise(0.05, 0.4, dist);
        this.playTone(600, 'square', 0.05, 0.2, dist);
    }

    static playShoot(weaponName, dist) {
        if (!this.initialized) this.init();
        if (weaponName === 'Pistol') this.playShootPistol(dist);
        else if (weaponName === 'Shotgun') this.playShootShotgun(dist);
        else if (weaponName === 'Assault Rifle' || weaponName === 'Machine Gun') this.playShootRifle(dist);
        else {
            // Generic fallback
            this.playNoise(0.2, 0.5, dist);
        }
    }

    static playHit(dist) {
        if (!this.initialized) this.init();
        this.playTone(150, 'sawtooth', 0.1, 0.4, dist);
        this.playNoise(0.1, 0.3, dist);
    }

    static playItemPickup() {
        if (!this.initialized) this.init();
        this.playTone(800, 'sine', 0.1, 0.2);
        setTimeout(() => this.playTone(1200, 'sine', 0.15, 0.2), 100);
    }

    static playDoorOpen(dist) {
        if (!this.initialized) this.init();
        this.playNoise(0.5, 0.2, dist);
        this.playTone(100, 'triangle', 0.5, 0.1, dist);
    }

    static playElevator() {
        if (!this.initialized) this.init();
        this.playTone(50, 'sine', 2.0, 0.3);
        this.playNoise(2.0, 0.1);
    }

    static playEnemyDeath(dist, type) {
        if (!this.initialized) this.init();
        if (type === 'zombie') {
            this.playTone(60, 'sawtooth', 0.5, 0.6, dist);
            this.playNoise(0.5, 0.3, dist);
        } else if (type === 'soldier') {
            this.playTone(120, 'square', 0.2, 0.5, dist);
            this.playNoise(0.3, 0.6, dist);
        } else if (type === 'alien') {
            this.playTone(400, 'sine', 0.4, 0.4, dist);
            this.playNoise(0.6, 0.3, dist); // Hiss
        } else {
            this.playTone(80, 'sawtooth', 0.3, 0.6, dist);
            this.playNoise(0.4, 0.5, dist);
        }
    }

    static playPlayerDamage() {
        if (!this.initialized) this.init();
        this.playTone(60, 'sawtooth', 0.2, 0.8);
        this.playNoise(0.2, 0.6);
    }
}
