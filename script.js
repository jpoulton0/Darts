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

// --- AUTO-LOAD SAVED DATA & INITIALIZE FIREWORKS ---
window.addEventListener('DOMContentLoaded', () => {
    loadSetupFromStorage();
    startFireworks();
});

// --- LIGHTWEIGHT FIREWORK AUDIO SYNTHESIZER ---
function playFireworkSound() {
    try {
        if (!audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) audioCtx = new AudioCtx();
        }
        if (!audioCtx || audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Create short noise burst (150ms)
        const bufferSize = audioCtx.sampleRate * 0.15;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        // Lowpass filter to create a low "boom/pop" body
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600 + Math.random() * 400, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.15);

        // Fast volume decay
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        noise.start();
    } catch(e) {
        // Audio execution restricted prior to user touch/click interaction
    }
}

// --- FIREWORKS ANIMATION ENGINE ---
function startFireworks() {
    const canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    let particles = [];

    function createFirework() {
        const x = Math.random() * width;
        const y = Math.random() * (height * 0.6);
        const particleCount = 40 + Math.floor(Math.random() * 30);
        const colors = ['#00e676', '#ffd54f', '#ff1744', '#29b6f6', '#ab47bc', '#ffffff'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 1;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.02 + 0.015,
                color: color
            });
        }

        // Trigger audio synthesizer on burst
        playFireworkSound();
    }

    fireworksInterval = setInterval(createFirework, 450);

    function loop() {
        ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
        ctx.fillRect(0, 0, width, height);

        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // gravity
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
            } else {
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        if (document.getElementById('welcome-screen').style.display !== 'none') {
            requestAnimationFrame(loop);
        }
    }

    loop();
}

/**
 * Transitions from Retirement Splash to Darts Setup Screen
 */
function enterSetupScreen() {
    if (fireworksInterval) clearInterval(fireworksInterval);
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('setup-screen').style.display = 'flex';
}

/**
 * Swaps row inputs dynamically when throw order changes
 */
function swapPlayerPosition(fromRow, targetPosStr) {
    let targetRow = parseInt(targetPosStr);
    if (fromRow === targetRow) return;

    let nameFrom = document.getElementById('n' + fromRow).value;
    let scoreFrom = document.getElementById('s' + fromRow).value;
    let legsFrom = document.getElementById('l' + fromRow).value;

    let nameTarget = document.getElementById('n' + targetRow).value;
    let scoreTarget = document.getElementById('s' + targetRow).value;
    let legsTarget = document.getElementById('l' + targetRow).value;

    document.getElementById('n' + fromRow).value = nameTarget;
    document.getElementById('s' + fromRow).value = scoreTarget;
    document.getElementById('l' + fromRow).value = legsTarget;

    document.getElementById('n' + targetRow).value = nameFrom;
    document.getElementById('s' + targetRow).value = scoreFrom;
    document.getElementById('l' + targetRow).value = legsFrom;

    for (let i = 1; i <= 4; i++) {
        document.getElementById('pos' + i).value = i;
    }

    saveSetupToStorage();
}

function saveSetupToStorage() {
    let savedData = [];
    for(let i=1; i<=4; i++) {
        savedData.push({
            name: document.getElementById('n' + i).value,
            handicap: document.getElementById('s' + i).value,
            legs: document.getElementById('l' + i).value
        });
    }
    localStorage.setItem('lichfield_arrers_setup', JSON.stringify(savedData));
}

function loadSetupFromStorage() {
    let raw = localStorage.getItem('lichfield_arrers_setup');
    if(!raw) return;
    try {
        let data = JSON.parse(raw);
        data.forEach((item, idx) => {
            let i = idx + 1;
            if(document.getElementById('n' + i)) document.getElementById('n' + i).value = item.name;
            if(document.getElementById('s' + i)) document.getElementById('s' + i).value = item.handicap;
            if(document.getElementById('l' + i)) document.getElementById('l' + i).value = item.legs;
        });
    } catch(e) {
        console.error("Error loading stored setup:", e);
    }
}

/**
 * Save complete session history log
 */
function saveSessionHistory() {
    let history = JSON.parse(localStorage.getItem('lichfield_arrers_history') || '[]');
    let now = new Date();
    let sessionRecord = {
        date: now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        players: gs.p.map(p => {
            let avg = p.scoringDarts > 0 ? ((p.scoringPoints / p.scoringDarts) * 3).toFixed(2) : "0.00";
            return {
                name: p.n,
                legsWon: p.legs,
                highCheckout: p.highestCheckout || "-",
                avg: avg
            };
        })
    };
    history.unshift(sessionRecord);
    localStorage.setItem('lichfield_arrers_history', JSON.stringify(history));
    alert("Session saved successfully!");
}

/**
 * Runs when you click "NEW LEG"
 */
function launchGame() {
    saveSetupToStorage();
    let isInitialStart = gs.p.length === 0;
    gs.starts = [];

    for(let i=1; i<=4; i++) {
        let nameValue = document.getElementById('n' + i).value;
        let scoreValue = parseInt(document.getElementById('s' + i).value) || 501;
        let legsValue = parseInt(document.getElementById('l' + i).value) || 0;
        
        gs.starts.push(scoreValue);

        if (isInitialStart) {
            gs.p.push({
                n: nameValue, 
                s: scoreValue, 
                legs: legsValue,
                scoringPoints: 0,
                scoringDarts: 0,
                legDarts: 0,
                legScoringPoints: 0,
                legScoringDarts: 0,
                highestCheckout: 0,
                hasStartedScoring: false 
            });
        } else {
            gs.p[i-1].n = nameValue;
            gs.p[i-1].s = scoreValue;
            gs.p[i-1].legs = legsValue;
            gs.p[i-1].legDarts = 0;
            gs.p[i-1].legScoringPoints = 0;
            gs.p[i-1].legScoringDarts = 0;
            gs.p[i-1].hasStartedScoring = false;
        }
    }

    gs.idx = gs.startingPlayerIndex;

    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    draw();

    setTimeout(() => {
        let starterName = gs.p[gs.idx].n;
        let startText = "Leg " + gs.sessionLegCount + " of the evening. " + starterName + " to throw first... Game on!";
        let startMsg = new SpeechSynthesisUtterance(startText);
        startMsg.rate = 1.1;
        startMsg.pitch = 1.5;
        window.speechSynthesis.speak(startMsg);
    }, 500); 
}

/**
 * Updates the Visual Scoreboard, Averages, and Checkout Suggestion
 */
function draw() {
    let h = "";
    gs.p.forEach((p, i) => {
        let act = i === gs.idx ? 'active' : '';
        
        let avg = p.scoringDarts > 0 
            ? ((p.scoringPoints / p.scoringDarts) * 3).toFixed(2) 
            : "0.00";

        let highCoText = p.highestCheckout > 0 ? p.highestCheckout : "-";

        h += `<div class="player-box ${act}">
                <div style="font-weight:bold">${p.n}</div>
                <div class="score-val">${p.s}</div>
                <div style="font-size:0.75rem; color:#00e676; font-weight:bold">3-Avg: ${avg}</div>
                <div style="font-size:0.7rem; color:#ffd54f">High CO: ${highCoText}</div>
                <div style="font-size:0.7rem; color:#aaa">Legs: ${p.legs}</div>
              </div>`;
    });
    document.getElementById('scoreboard').innerHTML = h;
    document.getElementById('preview').innerText = gs.cur || "0";

    let currentScore = gs.p[gs.idx].s;
    let suggestion = checkoutMap[currentScore] || ""; 
    document.getElementById('checkout-suggestion').innerText = suggestion;
}

// Numpad Logic
function addNum(n) { if(gs.cur.length < 3) { gs.cur += n; draw(); } }
function doUndo() { gs.cur = ""; draw(); }

/**
 * Runs when you click "ENTER"
 */
function submit() {
    let v = parseInt(gs.cur) || 0;
    let currentPlayer = gs.p[gs.idx];

    if(v <= 180 && (currentPlayer.s - v >= 0)) {
        let startScore = currentPlayer.s;

        if (!currentPlayer.hasStartedScoring) {
            if (v > 0) {
                currentPlayer.hasStartedScoring = true;
                currentPlayer.legDarts += 3;
                if (startScore > 75) {
                    currentPlayer.scoringPoints += v;
                    currentPlayer.scoringDarts += 3;
                    currentPlayer.legScoringPoints += v;
                    currentPlayer.legScoringDarts += 3;
                }
            }
        } 
        else {
            currentPlayer.legDarts += 3;
            if (startScore > 75) {
                currentPlayer.scoringPoints += v;
                currentPlayer.scoringDarts += 3;
                currentPlayer.legScoringPoints += v;
                currentPlayer.legScoringDarts += 3;
            }
        }

        currentPlayer.s -= v;
        
        if(currentPlayer.s === 0) {
            let checkoutScore = startScore;
            if (checkoutScore > currentPlayer.highestCheckout) {
                currentPlayer.highestCheckout = checkoutScore;
            }

            let legAvg = currentPlayer.legScoringDarts > 0 
                ? ((currentPlayer.legScoringPoints / currentPlayer.legScoringDarts) * 3).toFixed(2)
                : "0.00";

            let winText = "Game, shot, and the leg... " + currentPlayer.n;
            let winMsg = new SpeechSynthesisUtterance(winText);
            winMsg.rate = 1.1;
            winMsg.pitch = 1.5;
            window.speechSynthesis.speak(winMsg);

            document.getElementById('win-message').innerText = currentPlayer.n + " WINS LEG " + gs.sessionLegCount + "!";
            document.getElementById('summary-winner').innerText = currentPlayer.n;
            document.getElementById('summary-checkout').innerText = checkoutScore;
            document.getElementById('summary-darts').innerText = currentPlayer.legDarts;
            document.getElementById('summary-avg').innerText = legAvg;

            document.getElementById('win-modal').style.display = 'flex';
            
            let legInput = document.getElementById('l' + (gs.idx + 1));
            legInput.value = parseInt(legInput.value) + 1;
            saveSetupToStorage();
            
            gs.startingPlayerIndex = (gs.startingPlayerIndex + 1) % 4;
            gs.sessionLegCount++; 
            
            gs.cur = "";
            draw();
            return; 
        }

        gs.idx = (gs.idx + 1) % 4;
        let nextPlayer = gs.p[gs.idx];

        setTimeout(() => {
            const bogeys = [169, 168, 166, 165, 163, 162, 159];
            
            if (nextPlayer.s <= 170 && !bogeys.includes(nextPlayer.s)) {
                let score = nextPlayer.s;
                let scoreText = score.toString();

                if (score >= 100) {
                    scoreText = "one... hundred... and... " + (score - 100);
                }

                let reqText = nextPlayer.n + "... you require... " + scoreText;
                let reqMsg = new SpeechSynthesisUtterance(reqText);
                
                reqMsg.rate = 0.9; 
                reqMsg.pitch = 1.3; 
                window.speechSynthesis.speak(reqMsg);
            }
        }, 1000); 

    } else { 
        alert("Invalid score or bust!"); 
    }
    gs.cur = "";
    draw();
}

/**
 * Runs when you click "RETURN TO SCOREBOARD" / "NEXT LEG"
 */
function closeWinModal() {
    document.getElementById('win-modal').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('setup-screen').style.display = 'flex';
    
    for(let i=1; i<=4; i++) {
        document.getElementById('s'+i).value = gs.starts[i-1];
        
        let p = gs.p[i-1];
        if (p) {
            let avg = p.scoringDarts > 0 
                ? ((p.scoringPoints / p.scoringDarts) * 3).toFixed(2) 
                : "0.00";
            
            if (document.getElementById('co' + i)) document.getElementById('co' + i).innerText = p.highestCheckout > 0 ? p.highestCheckout : "-";
            if (document.getElementById('avg' + i)) document.getElementById('avg' + i).innerText = avg;
        }
    }
}
