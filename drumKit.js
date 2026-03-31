/**
 * drumKit.js - Simplified visual feedback
 */

class DrumKit {
    constructor(audio) {
        this.audio = audio;
        this.activePattern = null;
        this.activeSynths = {};
        this.flash = null;
    }
    
    update(pinches) {
        // Left hand = drum patterns
        let patternActive = false;
        for (let i = 0; i < pinches.left.length; i++) {
            const p = pinches.left[i];
            if (p.active) {
                if (this.activePattern !== p.finger) {
                    this.audio.setPattern(p.finger);
                    this.activePattern = p.finger;
                    this.flash = { x: p.x, y: p.y, c: CONFIG.patterns[p.finger].colour, t: performance.now() };
                }
                patternActive = true;
                break;
            }
        }
        
        if (!patternActive && this.activePattern) {
            this.audio.stopPattern();
            this.activePattern = null;
        }
        
        // Right hand = synths
        const activeNow = {};
        for (let i = 0; i < pinches.right.length; i++) {
            const p = pinches.right[i];
            if (p.active) {
                activeNow[p.finger] = true;
                const freq = CONFIG.synth.minFreq + (1 - p.pinchHeight) * (CONFIG.synth.maxFreq - CONFIG.synth.minFreq);
                
                if (!this.activeSynths[p.finger]) {
                    this.audio.startSynth(p.finger, freq);
                    this.activeSynths[p.finger] = true;
                } else {
                    this.audio.updateSynth(p.finger, freq);
                }
            }
        }
        
        // Stop inactive synths
        for (const f in this.activeSynths) {
            if (!activeNow[f]) {
                this.audio.stopSynth(f);
                delete this.activeSynths[f];
            }
        }
        
        // Update sequencer
        this.audio.update();
    }
    
    draw(pinches) {
        // Left hand
        for (let i = 0; i < pinches.left.length; i++) {
            const p = pinches.left[i];
            const c = CONFIG.patterns[p.finger].colour;
            const a = p.active ? 255 : 60;
            
            stroke(c[0], c[1], c[2], a);
            strokeWeight(p.active ? 4 : 2);
            line(p.thumbX, p.thumbY, p.tipX, p.tipY);
            
            noStroke();
            fill(c[0], c[1], c[2], a);
            circle(p.tipX, p.tipY, p.active ? 24 : 12);
        }
        
        // Right hand
        for (let i = 0; i < pinches.right.length; i++) {
            const p = pinches.right[i];
            const c = CONFIG.synth.colours[p.finger];
            const a = p.active ? 255 : 60;
            
            stroke(c[0], c[1], c[2], a);
            strokeWeight(p.active ? 5 : 2);
            line(p.thumbX, p.thumbY, p.tipX, p.tipY);
            
            noStroke();
            fill(c[0], c[1], c[2], a);
            circle(p.tipX, p.tipY, p.active ? 20 : 10);
        }
        
        // Flash effect
        if (this.flash) {
            const age = (performance.now() - this.flash.t) / 200;
            if (age < 1) {
                noStroke();
                fill(this.flash.c[0], this.flash.c[1], this.flash.c[2], 255 * (1 - age));
                circle(this.flash.x, this.flash.y, 60 + age * 40);
            } else {
                this.flash = null;
            }
        }
    }
    
    drawUI() {
        fill(255);
        textSize(14);
        textAlign(LEFT, TOP);
        text('LEFT: Drum patterns | RIGHT: Synth (up/down = pitch)', 10, 10);
        
        if (this.activePattern) {
            const c = CONFIG.patterns[this.activePattern].colour;
            fill(c[0], c[1], c[2]);
            text('Playing: ' + CONFIG.patterns[this.activePattern].name, 10, 30);
        }
    }
}
