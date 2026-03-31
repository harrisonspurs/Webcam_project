/**
 * config.js - Optimized configuration
 */

const CONFIG = {
    // Smaller video = faster tracking
    videoWidth: 320,
    videoHeight: 240,
    
    // BPM for drum patterns
    bpm: 170,
    
    // Pinch threshold (in video pixels)
    pinchThreshold: 30,
    
    // Classic jungle/amen break patterns
    patterns: {
        index: {
            name: 'Amen',
            colour: [255, 100, 100],
            kick:  [1,0,0,0, 0,0,1,0, 0,1,0,0, 0,0,0,0],
            snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
            hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0]
        },
        middle: {
            name: 'Think',
            colour: [100, 255, 100],
            kick:  [1,0,0,0, 0,0,0,0, 1,0,1,0, 0,0,0,0],
            snare: [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,0],
            hihat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1]
        },
        ring: {
            name: 'Funky',
            colour: [100, 100, 255],
            kick:  [1,0,0,1, 0,0,1,0, 0,0,1,0, 0,0,0,0],
            snare: [0,0,0,0, 1,0,0,0, 0,1,0,0, 1,0,1,0],
            hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0]
        },
        pinky: {
            name: 'Apache',
            colour: [255, 255, 100],
            kick:  [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
            snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
            hihat: [1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1]
        }
    },
    
    // Synth settings
    synth: {
        minFreq: 80,
        maxFreq: 600,
        colours: {
            index: [255, 50, 150],
            middle: [50, 255, 200],
            ring: [200, 150, 255],
            pinky: [255, 200, 50]
        }
    }
};
