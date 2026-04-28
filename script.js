let gs = { p: [], idx: 0, cur: "", starts: [], startingPlayerIndex: 0 };

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

    // Set the first player for this leg based on the rotation
    gs.idx = gs.startingPlayerIndex;
    
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    draw();
}

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
}

function addNum(n) { if(gs.cur.length < 3) { gs.cur += n; draw(); } }
function doUndo() { gs.cur = ""; draw(); }

function submit() {
    let v = parseInt(gs.cur) || 0;
    let currentPlayer = gs.p[gs.idx];

    if(v <= 180 && (currentPlayer.s - v >= 0)) {
        currentPlayer.s -= v;
        
        if(currentPlayer.s === 0) {
	//--NEW: VOICE ANNOUNCEMENT ---
            let text = currentPlayer.n + " wins the leg!";
            let msg = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(msg);
            // -------------------------------
            document.getElementById('win-message').innerText = currentPlayer.n + " WINS!";
            document.getElementById('win-modal').style.display = 'flex';
            
            // Auto-increment the leg box in the setup screen
            let legInput = document.getElementById('l' + (gs.idx + 1));
            legInput.value = parseInt(legInput.value) + 1;

            // PREPARE FOR NEXT LEG: Move the starting player to the next person in line
            // This ensures Leg 1 = P1, Leg 2 = P2, Leg 3 = P3, Leg 4 = P4, Leg 5 = P1
            gs.startingPlayerIndex = (gs.startingPlayerIndex + 1) % 4;
        }

        gs.idx = (gs.idx + 1) % 4;
    } else { 
        alert("Invalid score or bust!"); 
    }
    gs.cur = "";
    draw();
}

function closeWinModal() {
    document.getElementById('win-modal').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('setup-screen').style.display = 'flex';
    
    for(let i=1; i<=4; i++) {
        document.getElementById('s'+i).value = gs.starts[i-1]; 
    }
}