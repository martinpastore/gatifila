import { TYPES, JOKER_ID, JOKER_CHANCE, catSVG } from './cats.js';
import { ensureAudio, resumeIfSuspended, isMuted, toggleMuted } from './audio.js';

const COLS = 6, ROWS = 8;
const GAME_SECONDS = 90;
const TIME_BONUS = 1;

const MODE_COPY = {
  classic: 'Arrastrá en línea recta para juntar 3 o más gatitos del mismo tipo.',
  zen: 'Sin cronómetro. Arrastrá en línea recta y jugá a tu propio ritmo 🌿',
};

// ---- Referencias al DOM ----
const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const timeEl = document.getElementById('time');
const timebarEl = document.getElementById('timebar');
const overlayEl = document.getElementById('overlay');
const finalScoreEl = document.getElementById('finalScore');
const overlayTitleEl = document.getElementById('overlayTitle');
const overlayMsgEl = document.getElementById('overlayMsg');
const restartBtn = document.getElementById('restartBtn');
const toastEl = document.getElementById('toast');
const timeStatEl = document.getElementById('timeStat');
const bonusFlagEl = document.getElementById('bonusFlag');
const modeSelectEl = document.getElementById('modeSelect');
const modeButtons = document.querySelectorAll('.mode-btn');
const inlineRestartBtn = document.getElementById('inlineRestartBtn');
const modeSwitchBtn = document.getElementById('modeSwitchBtn');
const overlayModeSwitchBtn = document.getElementById('overlayModeSwitchBtn');
const subTextEl = document.getElementById('subText');
const timebarOuterEl = document.querySelector('.timebar-outer');
const muteBtn = document.getElementById('muteBtn');

boardEl.style.setProperty('--cols', COLS);

// ---- Estado del juego ----
let currentMode = 'classic';
let grid = [];
let cellEls = [];
let score = 0, best = 0, timeLeft = GAME_SECONDS;
let timerId = null, running = false;
let dragging = false, startCell = null, currentPath = [];
let toastTimer = null;

// ---- Toast ----
function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2000);
}

// ---- Generación y validación del tablero (con soporte de comodín) ----
function randType(){
  if(Math.random() < JOKER_CHANCE) return JOKER_ID;
  return Math.floor(Math.random() * (TYPES.length - 1));
}

function typesCompatible(types){
  let target = null;
  for(const t of types){
    if(t === JOKER_ID) continue;
    if(target === null) target = t;
    else if(target !== t) return false;
  }
  return true;
}

function pathIsValid(path){
  return typesCompatible(path.map(p => grid[p.row][p.col]));
}

function boardHasMove(g){
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const type = g[r][c];
      if(type === null) continue;
      for(const [dr,dc] of dirs){
        const r2=r+dr, c2=c+dc, r3=r+2*dr, c3=c+2*dc;
        if(r3<0||r3>=ROWS||c3<0||c3>=COLS) continue;
        if(typesCompatible([type, g[r2][c2], g[r3][c3]])) return true;
      }
    }
  }
  return false;
}

function randomGrid(){
  const g = [];
  for(let r=0;r<ROWS;r++){
    const row = [];
    for(let c=0;c<COLS;c++) row.push(randType());
    g.push(row);
  }
  return g;
}

function buildGridData(){
  let g = randomGrid();
  let attempts = 0;
  while(!boardHasMove(g) && attempts < 200){
    g = randomGrid();
    attempts++;
  }
  grid = g;
}

// ---- Render ----
function applyCatStyle(catEl, typeId){
  catEl.innerHTML = catSVG(TYPES[typeId]);
  catEl.dataset.type = typeId;
}

function renderBoard(){
  boardEl.innerHTML = '';
  cellEls = [];
  for(let r=0;r<ROWS;r++){
    const rowEls = [];
    for(let c=0;c<COLS;c++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      const cat = document.createElement('div');
      cat.className = 'cat';
      applyCatStyle(cat, grid[r][c]);
      cell.appendChild(cat);
      boardEl.appendChild(cell);
      rowEls.push(cell);
    }
    cellEls.push(rowEls);
  }
}

// ---- Selección por arrastre ----
function cellFromPoint(x, y){
  const el = document.elementFromPoint(x, y);
  if(!el) return null;
  const cellEl = el.closest('.cell');
  if(!cellEl || !boardEl.contains(cellEl)) return null;
  return { row: +cellEl.dataset.row, col: +cellEl.dataset.col };
}

function getLine(start, end){
  const dr = end.row - start.row, dc = end.col - start.col;
  if(dr === 0 && dc === 0) return [start];
  if(dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
  const path = [];
  for(let i=0;i<=steps;i++){
    path.push({ row: start.row + stepR*i, col: start.col + stepC*i });
  }
  return path;
}

function clearHighlight(){
  for(const p of currentPath){
    const el = cellEls[p.row][p.col];
    el.classList.remove('sel-ok','sel-bad');
  }
  currentPath = [];
}

function applyHighlight(path){
  const valid = pathIsValid(path);
  for(const p of path){
    const el = cellEls[p.row][p.col];
    el.classList.add(valid ? 'sel-ok' : 'sel-bad');
  }
  return valid;
}

function onDown(x, y){
  if(!running) return;
  const c = cellFromPoint(x, y);
  if(!c) return;
  dragging = true;
  startCell = c;
  clearHighlight();
  currentPath = [c];
  applyHighlight(currentPath);
}

function onMove(x, y){
  if(!dragging) return;
  const c = cellFromPoint(x, y);
  if(!c) return;
  const line = getLine(startCell, c);
  if(!line) return;
  clearHighlight();
  currentPath = line;
  applyHighlight(currentPath);
}

function onUp(){
  if(!dragging) return;
  dragging = false;
  const path = currentPath;
  const valid = pathIsValid(path);
  clearHighlight();
  if(valid && path.length >= 3){
    resolveMatch(path);
  }
}

boardEl.addEventListener('pointerdown', e => { e.preventDefault(); onDown(e.clientX, e.clientY); });
window.addEventListener('pointermove', e => { if(dragging){ e.preventDefault(); onMove(e.clientX, e.clientY); } }, { passive:false });
window.addEventListener('pointerup', onUp);
window.addEventListener('pointercancel', onUp);

// ---- Bonus de tiempo (modo Clásico) ----
function addTimeBonus(seconds){
  timeLeft += seconds;
  timeEl.textContent = Math.max(timeLeft, 0);
  timebarEl.style.width = Math.min(100, Math.max(timeLeft,0) / GAME_SECONDS * 100) + '%';
  if(timeLeft > 15){
    timebarEl.style.background = 'linear-gradient(90deg, var(--accent), var(--accent-dark))';
  }
  timeStatEl.classList.remove('time-bonus');
  void timeStatEl.offsetWidth;
  bonusFlagEl.textContent = '+' + seconds + 's';
  timeStatEl.classList.add('time-bonus');
}

// ---- Resolución de matches y caída de columnas ----
function resolveMatch(path){
  const jokerCount = path.filter(p => grid[p.row][p.col] === JOKER_ID).length;
  const pts = path.length * 10 + (path.length >= 5 ? 20 : 0) + jokerCount * 5;
  score += pts;
  scoreEl.textContent = score;
  if(score > best){ best = score; bestEl.textContent = best; }
  if(currentMode === 'classic'){ addTimeBonus(TIME_BONUS); }

  const cols = new Set();
  for(const p of path){
    cols.add(p.col);
    grid[p.row][p.col] = null;
    const el = cellEls[p.row][p.col];
    el.classList.add('pop');
  }

  setTimeout(() => {
    for(const col of cols) collapseColumn(col);
    if(running && !boardHasMove(grid)){
      setTimeout(reshuffleBoard, 320);
    }
  }, 260);
}

function reshuffleBoard(){
  buildGridData();
  renderBoard();
  showToast('Sin jugadas posibles — ¡grilla nueva!');
}

function collapseColumn(col){
  const stack = [];
  for(let r=ROWS-1;r>=0;r--){
    if(grid[r][col] !== null) stack.push(grid[r][col]);
  }
  const newCol = new Array(ROWS).fill(null);
  for(let i=0;i<stack.length;i++){
    newCol[ROWS-1-i] = stack[i];
  }
  for(let r=ROWS-1;r>=0;r--){
    if(newCol[r] === null) newCol[r] = randType();
  }
  for(let r=0;r<ROWS;r++){
    grid[r][col] = newCol[r];
    const cell = cellEls[r][col];
    const oldCat = cell.querySelector('.cat');
    const cat = document.createElement('div');
    cat.className = 'cat enter';
    applyCatStyle(cat, newCol[r]);
    cell.replaceChild(cat, oldCat);
    cell.classList.remove('pop');
  }
}

// ---- Cronómetro (modo Clásico) ----
function tick(){
  timeLeft -= 1;
  timeEl.textContent = Math.max(timeLeft,0);
  timebarEl.style.width = Math.min(100, Math.max(timeLeft,0) / GAME_SECONDS * 100) + '%';
  if(timeLeft <= 15){ timebarEl.style.background = 'linear-gradient(90deg, var(--bad), var(--accent-dark))'; }
  if(timeLeft <= 0){ endGame(); }
}

// ---- Ciclo de partida ----
function startGame(mode){
  ensureAudio();
  resumeIfSuspended();
  currentMode = mode;
  subTextEl.textContent = MODE_COPY[mode];
  score = 0;
  scoreEl.textContent = '0';
  bestEl.textContent = best;
  buildGridData();
  renderBoard();
  overlayEl.classList.add('hidden');
  modeSelectEl.classList.add('hidden');
  running = true;
  clearInterval(timerId);
  timerId = null;

  if(mode === 'classic'){
    timeStatEl.style.display = '';
    timebarOuterEl.style.display = '';
    timeLeft = GAME_SECONDS;
    timeEl.textContent = GAME_SECONDS;
    timebarEl.style.width = '100%';
    timebarEl.style.background = 'linear-gradient(90deg, var(--accent), var(--accent-dark))';
    timerId = setInterval(tick, 1000);
  } else {
    timeStatEl.style.display = 'none';
    timebarOuterEl.style.display = 'none';
  }
}

function endGame(){
  running = false;
  clearInterval(timerId);
  finalScoreEl.textContent = score;
  overlayTitleEl.textContent = '¡Se acabó el tiempo!';
  overlayMsgEl.textContent = score >= best && score > 0 ? '¡Nuevo mejor puntaje!' : '';
  overlayEl.classList.remove('hidden');
}

function backToModeSelect(){
  running = false;
  clearInterval(timerId);
  overlayEl.classList.add('hidden');
  modeSelectEl.classList.remove('hidden');
}

// ---- Listeners de UI ----
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => startGame(btn.dataset.mode));
});
inlineRestartBtn.addEventListener('click', () => startGame(currentMode));
modeSwitchBtn.addEventListener('click', backToModeSelect);
overlayModeSwitchBtn.addEventListener('click', backToModeSelect);
restartBtn.addEventListener('click', () => startGame(currentMode));

// ---- Música / mute ----
function updateMuteBtn(){
  muteBtn.textContent = isMuted() ? '🔇 Música' : '🔊 Música';
}
updateMuteBtn();

muteBtn.addEventListener('click', () => {
  ensureAudio();
  resumeIfSuspended();
  toggleMuted();
  updateMuteBtn();
});
