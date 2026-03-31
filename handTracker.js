/**
 * handTracker.js - Optimized hand tracking
 */

class HandTracker {
    constructor() {
        this.hands = [];
        this.ready = false;
        this.handPose = null;
        this.video = null;
        this.detecting = false;
    }
    
    init(video) {
        this.video = video;
        console.log('HandTracker: Loading model...');
        
        // Simpler initialization
        this.handPose = ml5.handPose(video.elt, { maxHands: 2, flipped: true }, () => {
            console.log('HandTracker: Ready');
            this.ready = true;
            this.detect();
        });
    }
    
    detect() {
        if (!this.handPose || !this.video || this.detecting) return;
        this.detecting = true;
        
        this.handPose.detect(this.video.elt, (results) => {
            this.hands = results || [];
            this.detecting = false;
        });
    }
    
    getPinches(canvasW, canvasH) {
        const result = { left: [], right: [] };
        const scaleX = canvasW / CONFIG.videoWidth;
        const scaleY = canvasH / CONFIG.videoHeight;
        const threshold = CONFIG.pinchThreshold;
        
        for (let i = 0; i < this.hands.length; i++) {
            const hand = this.hands[i];
            if (!hand) continue;
            
            const kp = hand.keypoints;
            const wrist = kp[0];
            const thumb = kp[4];
            if (!wrist || !thumb) continue;
            
            const isLeft = wrist.x > CONFIG.videoWidth / 2;
            const arr = isLeft ? result.left : result.right;
            
            const fingers = [[8,'index'], [12,'middle'], [16,'ring'], [20,'pinky']];
            
            for (let j = 0; j < 4; j++) {
                const [idx, name] = fingers[j];
                const tip = kp[idx];
                if (!tip) continue;
                
                const dist = Math.hypot(thumb.x - tip.x, thumb.y - tip.y);
                const mx = (thumb.x + tip.x) * 0.5 * scaleX;
                const my = (thumb.y + tip.y) * 0.5 * scaleY;
                
                arr.push({
                    finger: name,
                    x: mx,
                    y: my,
                    thumbX: thumb.x * scaleX,
                    thumbY: thumb.y * scaleY,
                    tipX: tip.x * scaleX,
                    tipY: tip.y * scaleY,
                    active: dist < threshold,
                    pinchHeight: my / canvasH
                });
            }
        }
        
        return result;
    }
    
    isReady() { return this.ready; }
    getHandCount() { return this.hands.length; }
}
