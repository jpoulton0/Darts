// --- GLOBAL DATA STORAGE ---
// p: players, idx: current thrower, cur: typed score, starts: handicaps, 
// startingPlayerIndex: who starts the leg, sessionLegCount: track leg #
let gs = { p: [], idx: 0, cur: "", starts: [], startingPlayerIndex: 0, sessionLegCount: 1 };

/**
 * Runs when you click "NEW LEG"
 * Gathers names/scores/legs from the boxes and starts the game
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

    // --- ANNOUNCEMENT WITH DELAY ---
    // We wait 100 milliseconds (0.1 seconds) before speaking
    setTimeout(() => {
        let starterName = gs.p[gs.idx].n;
        let startText = "Leg " + gs.sessionLegCount + " of the evening. " + starterName + " to throw first... Game on!";
        let startMsg = new SpeechSynthesisUtterance(startText);
        startMsg.rate = 1.1;
        startMsg.pitch = 1.5;
        window.speechSynthesis.speak(startMsg);
    }, 100); 
}

/**
 * Updates the Visual Scoreboard
 * Highlights the active player and shows the typed numbers
 */
function draw() {
    let h = "";
    gs.p.forEach((p, i) => {
        let act = i === gs.idx ? 'active' : ''; // Check if it's this player's turn
        h += `<div class="player-box ${act}">
                <div style="font-weight:bold">${p.n}</div>
                <div class="score-val">${p.s}</div>
                <div style="font-size:0.7rem; color:#aaa">Legs: ${p.legs}</div>
              </div>`;
    });
    document.getElementById('scoreboard').innerHTML = h;
    document.getElementById('preview').innerText = gs.cur || "0";
}

// Numpad Logic: Limits entry to 3 digits (max 180)
function addNum(n) { if(gs.cur.length < 3) { gs.cur += n; draw(); } }

// Clear the current typed number (Undo button)
function doUndo() { gs.cur = ""; draw(); }

/**
 * Runs when you click "ENTER"
 * Subtracts score, checks for wins, and handles voice calls
 */
function submit() {
    let v = parseInt(gs.cur) || 0;
    let currentPlayer = gs.p[gs.idx];

    // Validate: Score must be 180 or less and not leave a negative total
    if(v <= 180 && (currentPlayer.s - v >= 0)) {
        currentPlayer.s -= v;
        
        // WIN CONDITION: Player hits exactly 0
        if(currentPlayer.s === 0) {
            // --- ANNOUNCEMENT: WINNER ---
            let winText = "Game, shot, and the leg... " + currentPlayer.n;
            let winMsg = new SpeechSynthesisUtterance(winText);
            winMsg.rate = 1.1;
            winMsg.pitch = 1.5;
            window.speechSynthesis.speak(winMsg);

            // Show the custom winner pop-up
            document.getElementById('win-message').innerText = currentPlayer.n + " WINS!";
            document.getElementById('win-modal').style.display = 'flex';
            
            // Auto-update the "Legs Won" box on the setup screen for the winner
            let legInput = document.getElementById('l' + (gs.idx + 1));
            legInput.value = parseInt(legInput.value) + 1;
            
            // LOGIC: Set who starts the NEXT leg
            gs.startingPlayerIndex = (gs.startingPlayerIndex + 1) % 4;
            gs.sessionLegCount++; // Increase the session leg counter
        }

        // Move the turn to the next player in the list
        gs.idx = (gs.idx + 1) % 4;
    } else { 
        alert("Invalid score or bust!"); 
    }
    gs.cur = ""; // Clear the typing area
    draw();
}

/**
 * Runs when you click "RETURN TO SCOREBOARD"
 * Takes you back to setup and puts the handicaps back in the boxes
 */
function closeWinModal() {
    document.getElementById('win-modal').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('setup-screen').style.display = 'flex';
    
    // Restore the original handicaps for the next leg
    for(let i=1; i<=4; i++) {
        document.getElementById('s'+i).value = gs.starts[i-1]; 
    }
} 
