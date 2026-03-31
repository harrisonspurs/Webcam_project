/**
 * sketch.js - Optimized main sketch
 */

let video, audio, tracker, kit;
let started = false;
let lastDetect = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1);
    frameRate(30);
    noSmooth();
    
    // Small video for fast processing
    video = createCapture({ video: { width: CONFIG.videoWidth, height: CONFIG.videoHeight } });
    video.size(CONFIG.videoWidth, CONFIG.videoHeight);
    video.hide();
    
    audio = new JungleAudio();
    tracker = new HandTracker();
    kit = new DrumKit(audio);
    
    // Init tracker after short delay
    setTimeout(() => tracker.init(video), 500);
}

function draw() {
    // Draw mirrored video
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();
    
    // Slight darken
    noStroke();
    fill(0, 30);
    rect(0, 0, width, height);
    
    if (!started) {
        // Start prompt
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        text('CLICK TO START', width/2, height/2 - 30);
        textSize(14);
        text('Left hand = drums | Right hand = synth', width/2, height/2 + 10);
        return;
    }
    
    // Run detection every other frame
    if (tracker.isReady() && frameCount % 2 === 0) {
        tracker.detect();
    }
    
    // Get pinches and update
    const pinches = tracker.getPinches(width, height);
    kit.update(pinches);
    kit.draw(pinches);
    kit.drawUI();
}

function mousePressed() {
    if (!started) {
        started = true;
        audio.start();
    }
}

function keyPressed() {
    if (!started) {
        started = true;
        audio.start();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
