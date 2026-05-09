// --- CHECKOUT DATA ---
const checkoutMap = {
     // 170 to 160
    170: "T20 T20 BULL", 167: "T20 T19 BULL", 164: "T20 T18 BULL", 161: "T20 T17 BULL", 160: "T20 T20 D20",
    // 150s
    158: "T20 T20 D19", 157: "T20 T19 D20", 156: "T20 T20 D18", 155: "T20 T19 D19", 154: "T20 T18 D20",
    153: "T20 T19 D18", 152: "T20 T20 D16", 151: "T20 T17 D20", 150: "T20 T18 D18", 
    // 140s
    149: "T20 T19 D16", 148: "T20 T20 D14", 147: "T20 T17 D18", 146: "T20 T18 D16", 145: "T20 T19 D14", 
    144: "T20 T18 D12", 143: "T20 T17 D16", 142: "T20 T14 D20", 141: "T20 T19 D12", 140: "T20 T20 D10",
    // 130s
    139: "T20 T13 D20", 138: "T20 T18 D12", 137: "T20 T15 D16", 136: "T20 T20 D8", 135: "25 T20 BULL", 
    134: "T20 T14 D16", 133: "T20 T19 D8", 132: "25 T19 BULL", 131: "T20 T13 D16", 130: "T20 T20 D5",
    // 120s
    129: "T19 T12 D18", 128: "T18 T14 D16", 127: "T20 T17 D8", 126: "T19 T19 D6", 125: "T18 T13 D16", 
    124: "T20 T16 D8", 123: "T19 T16 D9", 122: "T18 T20 D4", 121: "T20 T11 D14", 120: "T20 20 D20",
    // 110s
    119: "T19 T12 D13", 118: "T20 18 D20", 117: "T20 17 D20", 116: "T19 19 D20", 115: "T20 15 D20", 
    114: "T20 14 D20", 113: "T19 16 D20", 112: "T20 20 D16", 111: "T19 14 D20", 110: "T20 10 D20",
    // 100s
    109: "T20 9 D20", 108: "T20 16 D16", 107: "T19 10 D20", 106: "T20 10 D18", 105: "T19 16 D16", 
    104: "T18 10 D20", 103: "T19 6 D20", 102: "T20 10 D16", 101: "T17 10 D20", 100: "T20 D20",
    // 90s
    99: "T19 10 D16", 98: "T20 D19", 97: "T19 D20", 96: "T20 D18", 95: "T19 D19", 
    94: "T18 D20", 93: "T19 D18", 92: "T20 D16", 91: "T17 D20", 90: "T20 D15",
    // 80s
    89: "T19 D16", 88: "T20 D14", 87: "T17 D18", 86: "T18 D16", 85: "T15 D20", 
    84: "T20 D12", 83: "T17 D16", 82: "T14 D20", 81: "T19 D12", 80: "T20 D10",
    // 70s
    79: "T13 D20", 78: "T18 D12", 77: "T19 D10", 76: "T16 D14", 75: "T15 D15", 
    74: "T14 D16", 73: "T19 D8", 72: "T16 D12", 71: "T13 D16", 70: "T10 D20",
    // Low Finishes
    60: "20 D20", 50: "10 D20", 40: "D20", 38: "D19", 36: "D18", 32: "D16", 
    30: "D15", 24: "D12", 20: "D10", 16: "D8", 12: "D6", 10: "D5", 8: "D4", 4: "D2", 2: "D1"
};

// --- GLOBAL DATA STORAGE ---
let gs = { p: [], idx: 0, cur: "", starts: [], startingPlayerIndex: 0, sessionLegCount: 1 };

/**
 * Runs when you click "NEW LEG"
 */
function launchGame() {
    gs.p = [];
    gs.starts = [];
    for(let i=1; i<=4; i++) {
        let nameValue = document.getElementById('n' + i).value;
        let scoreValue = parseInt(document.getElementById('s' + i).value) || 501;
        let legsValue = parseInt(document.getElementById('l' + i).value) || 0;
        
        gs.starts.push(scoreValue);
        gs.p.push({
            n: nameValue, 
            s: scoreValue, 
            legs: legsValue
        });
    }

    gs.idx = gs.startingPlayerIndex;

    // Switch screens first
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    draw();

    // Announcement with delay to help iPhone browsers
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
 * Updates the Visual Scoreboard and Checkout Suggestion
 */
function draw() {
    let h = "";
    gs.p.forEach((p, i) => {
        let act = i === gs.idx ? 'active' : '';
        h += `<div class="player-box ${act}">
                <div style="font-weight:bold">${p.n}</div>
                <div class="score-val">${p.s}</div>
                <div style="font-size:0.7rem; color:#aaa">Legs: ${p.legs}</div>
              </div>`;
    });
    document.getElementById('scoreboard').innerHTML = h;
    document.getElementById('preview').innerText = gs.cur || "0";

    // --- CHECKOUT LOGIC ---
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

    // 1. Validate Score
    if(v <= 180 && (currentPlayer.s - v >= 0)) {
        currentPlayer.s -= v;
        
        // 2. Check for Win
        if(currentPlayer.s === 0) {
            let winText = "Game, shot, and the leg... " + currentPlayer.n;
            let winMsg = new SpeechSynthesisUtterance(winText);
            winMsg.rate = 1.1;
            winMsg.pitch = 1.5;
            window.speechSynthesis.speak(winMsg);

            document.getElementById('win-message').innerText = currentPlayer.n + " WINS!";
            document.getElementById('win-modal').style.display = 'flex';
            
            let legInput = document.getElementById('l' + (gs.idx + 1));
            legInput.value = parseInt(legInput.value) + 1;
            
            gs.startingPlayerIndex = (gs.startingPlayerIndex + 1) % 4;
            gs.sessionLegCount++; 
            
            gs.cur = "";
            draw();
            return; 
        }

        // 3. Move turn to Next Player
        gs.idx = (gs.idx + 1) % 4;
        let nextPlayer = gs.p[gs.idx];

        // 4. Wait 1 second, then announce the checkout if it exists
        setTimeout(() => {
            if (checkoutMap[nextPlayer.s]) {
                let reqText = nextPlayer.n + ", you require " + nextPlayer.s;
                let reqMsg = new SpeechSynthesisUtterance(reqText);
                reqMsg.rate = 1.1;
                reqMsg.pitch = 1.4; 
                window.speechSynthesis.speak(reqMsg);
            }
        }, 1000); // 1000ms = 1 second delay

    } else { 
        alert("Invalid score or bust!"); 
    }
    gs.cur = "";
    draw();
}

/**
 * Runs when you click "RETURN TO SCOREBOARD"
 */
function closeWinModal() {
    document.getElementById('win-modal').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('setup-screen').style.display = 'flex';
    
    for(let i=1; i<=4; i++) {
        document.getElementById('s'+i).value = gs.starts[i-1]; 
    }
}