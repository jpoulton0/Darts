let gs = { p: [], idx: 0, cur: "" };

function launchGame() {
for(let i=1; i<=4; i++) {
gs.p.push({n:'P'+i, s:parseInt(document.getElementById('s'+i).value), h:[] });
}
document.getElementById('setup-screen').style.display='none';
document.getElementById('game-screen').style.display='flex';
draw();
}

function draw() {
let h = "";
gs.p.forEach((p, i) => {
let act = i === gs.idx ? 'active' : '';
h += `<div class="player-box ${act}"><div>${p.n}</div><div class="score-val">${p.s}</div></div>`;
});
document.getElementById('scoreboard').innerHTML = h;
document.getElementById('preview').innerText = gs.cur || "0";
}

function addNum(n) { if(gs.cur.length < 3) { gs.cur += n; draw(); } }

function doUndo() { gs.cur = ""; draw(); }

function submit() {
let v = parseInt(gs.cur) || 0;
if(v <= 180 && (gs.p[gs.idx].s - v >= 0)) {
gs.p[gs.idx].s -= v;
gs.idx = (gs.idx + 1) % 4;
} else { alert("Invalid score"); }
gs.cur = "";
draw();
}
