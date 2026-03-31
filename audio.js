/**
 * audio.js - Optimized drum sequencer and synth
 */

class JungleAudio {
    constructor() {
        this.ctx = null;
        this.started = false;
        this.currentPattern = null;
        this.step = 0;
        this.nextStepTime = 0;
        this.stepInterval = 60 / CONFIG.bpm / 4;
        
        this.synths = {};
        this.compressor = null;
        
        // Pre-generated noise buffer
        this.noiseBuffer = null;
    }
    
    start() {
        if (this.started) return;
        
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.started = true;
        this.nextStepTime = this.ctx.currentTime;
        
        // Master compressor
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -10;
        this.compressor.knee.value = 10;
        this.compressor.ratio.value = 4;
        this.compressor.connect(this.ctx.destination);
        
        // Pre-generate noise buffer (reusable)
        const bufferSize = this.ctx.sampleRate * 0.2;
        this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        console.log('Audio started');
    }
    
    update() {
        if (!this.started || !this.currentPattern) return;
        
        const now = this.ctx.currentTime;
        
        // Schedule ahead for tight timing
        while (this.nextStepTime < now + 0.1) {
            this.scheduleStep(this.nextStepTime);
            this.nextStepTime += this.stepInterval;
            this.step = (this.step + 1) % 16;
        }
    }
    
    scheduleStep(time) {
        const p = this.currentPattern;
        if (p.kick[this.step]) this.playKick(time);
        if (p.snare[this.step]) this.playSnare(time);
        if (p.hihat[this.step]) this.playHihat(time);
    }
    
    setPattern(finger) {
        if (CONFIG.patterns[finger]) {
            this.currentPattern = CONFIG.patterns[finger];
            this.step = 0;
            this.nextStepTime = this.ctx.currentTime;
        }
    }
    
    stopPattern() {
        this.currentPattern = null;
    }
    
    playKick(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);
        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain).connect(this.compressor);
        osc.start(t);
        osc.stop(t + 0.2);
    }
    
    playSnare(t) {
        // Noise
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const noiseGain = this.ctx.createGain();
        const hp = this.ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 2000;
        noiseGain.gain.setValueAtTime(0.4, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        noise.connect(hp).connect(noiseGain).connect(this.compressor);
        noise.start(t);
        noise.stop(t + 0.1);
        
        // Body
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = 180;
        oscGain.gain.setValueAtTime(0.5, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.connect(oscGain).connect(this.compressor);
        osc.start(t);
        osc.stop(t + 0.06);
    }
    
    playHihat(t) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const gain = this.ctx.createGain();
        const hp = this.ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 8000;
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        noise.connect(hp).connect(gain).connect(this.compressor);
        noise.start(t);
        noise.stop(t + 0.04);
    }
    
    startSynth(finger, freq) {
        if (!this.started || this.synths[finger]) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        filter.type = 'lowpass';
        filter.frequency.value = freq * 3;
        filter.Q.value = 3;
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.03);
        
        osc.connect(filter).connect(gain).connect(this.compressor);
        osc.start();
        
        this.synths[finger] = { osc, gain, filter };
    }
    
    updateSynth(finger, freq) {
        const s = this.synths[finger];
        if (!s) return;
        s.osc.frequency.value = freq;
        s.filter.frequency.value = freq * 3;
    }
    
    stopSynth(finger) {
        const s = this.synths[finger];
        if (!s) return;
        
        const now = this.ctx.currentTime;
        s.gain.gain.linearRampToValueAtTime(0, now + 0.05);
        s.osc.stop(now + 0.1);
        delete this.synths[finger];
    }
}
