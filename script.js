// --- CHECKOUT DATA ---
const checkoutMap = {
    170: "T20 T20 BULL", 167: "T20 T19 BULL", 164: "T20 T18 BULL", 161: "T20 T17 BULL", 160: "T20 T20 D20",
    158: "T20 T20 D19", 157: "T20 T19 D20", 156: "T20 T20 D18", 155: "T20 T19 D19", 154: "T20 T18 D20",
    153: "T20 T19 D18", 152: "T20 T20 D16", 151: "T20 T17 D20", 150: "T20 T18 D18", 
    149: "T20 T19 D16", 148: "T20 T20 D14", 147: "T20 T17 D18", 146: "T20 T18 D16", 145: "T20 T19 D14", 
    144: "T20 T18 D12", 143: "T20 T17 D16", 142: "T20 T14 D20", 141: "T20 T19 D12", 140: "T20 T20 D10",
    139: "T20 T13 D20", 138: "T20 T18 D12", 137: "T20 T15 D16", 136: "T20 T20 D8", 135: "25 T20 BULL", 
    134: "T20 T14 D16", 133: "T20 T19 D8", 132: "25 T19 BULL", 131: "T20 T13 D16", 130: "T20 T20 D5",
    129: "T19 T12 D18", 128: "T18 T14 D16", 127: "T20 T17 D8", 126: "T19 T19 D6", 125: "T18 T13 D16", 
    124: "T20 T16 D8", 123: "T19 T16 D9", 122: "T18 T20 D4", 121: "T20 T11 D14", 120: "T20 20 D20",
    119: "T19 T12 D13", 118: "T20 18 D20", 117: "T20 17 D20", 116: "T19 19 D20", 115: "T20 15 D20", 
    114: "T20 14 D20", 113: "T19 16 D20", 112: "T20 20 D16", 111: "T19 14 D20", 110: "T20 10 D20",
    109: "T20 9 D20", 108: "T20 16 D16", 107: "T19 10 D20", 106: "T20 10 D18", 105: "T19 16 D16", 
    104: "T18 10 D20", 103: "T19 6 D20", 102: "T20 10 D16", 101: "T17 10 D20", 100: "T20 D20",
    99: "T19 10 D16", 98: "T20 D19", 97: "T19 D20", 96: "T20 D18", 95: "T19 D19", 
    94: "T18 D20", 93: "T19 D18", 92: "T20 D16", 91: "T17 D20", 90: "T20 D15",
    89: "T19 D16", 88: "T20 D14", 87: "T17 D18", 86: "T18 D16", 85: "T15 D20", 
    84: "T20 D12", 83: "T17 D16", 82: "T14 D20", 81: "T19 D12", 80: "T20 D10",
    79: "T13 D20", 78: "T18 D12", 77: "T19 D10", 76: "T16 D14", 75: "T15 D15", 
    74: "T14 D16", 73: "T19 D8", 72: "T16 D12", 71: "T13 D16", 70: "T10 D20",
    60: "20 D20", 50: "10 D20", 40: "D20", 38: "D19", 36: "D18", 32: "D16", 
    30: "D15", 24: "D12", 20: "D10", 16: "D8", 12: "D6", 10: "D5", 8: "D4", 4: "D2", 2: "D1"
};

// --- GLOBAL DATA STORAGE ---
let gs = { p: [], idx: 0, cur: "", starts: [], startingPlayerIndex: 0, sessionLegCount: 1 };
let fireworksInterval = null;
let audioCtx = null;
let soundEnabled = false;

// --- AUTO-LOAD SAVED DATA & INITIALIZE FIREWORKS ---
window.addEventListener('DOMContentLoaded', () => {
    loadSetupFromStorage();
    startFireworks();
});

// Enable Web Audio on user gesture
function enableAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    soundEnabled = true;
    let btn = document.getElementById('sound-toggle-btn');
    if (btn) btn.innerText = "🔊 SOUND ON";
}

// SYNTHESIZE FIREWORK EXPLOSION SOUND
function playFireworkSound() {
    if (!soundEnabled || !audioCtx) return;

    try {
        const bufferSize = audioCtx.sampleRate * 0.4; // 0.4 sec duration
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Fill channel with white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        // Low-pass filter for deep boom effect
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150 + Math.random() * 200, audioCtx.currentTime);

        // Exponential volume decay envelope
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx
