// Música lofi generada con Web Audio API (sin archivos de audio externos).
// Este módulo no toca el DOM: expone funciones para iniciar el audio y
// controlar el mute; quien lo use decide cómo reflejarlo en la UI.

const MUTE_KEY = 'gatifila_muted';
const VOLUME = 0.32;
const BPM = 76;
const BEAT = 60 / BPM;
const CHORDS = [
  [220.00, 261.63, 329.63, 392.00], // Am7
  [293.66, 349.23, 440.00, 523.25], // Dm7
  [196.00, 246.94, 293.66, 349.23], // G7
  [261.63, 329.63, 392.00, 493.88], // Cmaj7
];

let audioCtx = null;
let masterGain = null;
let muted = false;
try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch(e) {}

function playPad(freqs, startTime, dur){
  const padGain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1100;
  padGain.connect(filter);
  filter.connect(masterGain);
  const attack = 1.2, release = 1.8;
  padGain.gain.setValueAtTime(0, startTime);
  padGain.gain.linearRampToValueAtTime(0.18, startTime + attack);
  padGain.gain.setValueAtTime(0.18, Math.max(startTime + attack, startTime + dur - release));
  padGain.gain.linearRampToValueAtTime(0, startTime + dur);
  freqs.forEach(f => {
    [-3, 3].forEach(detune => {
      const osc = audioCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;
      osc.detune.value = detune;
      osc.connect(padGain);
      osc.start(startTime);
      osc.stop(startTime + dur + 0.05);
    });
  });
}

function playKick(time){
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, time);
  osc.frequency.exponentialRampToValueAtTime(45, time + 0.15);
  g.gain.setValueAtTime(0.5, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(time);
  osc.stop(time + 0.2);
}

function playHat(time){
  const bufferSize = Math.floor(audioCtx.sampleRate * 0.05);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1) * (1 - i/bufferSize);
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 6000;
  const g = audioCtx.createGain();
  g.gain.value = 0.06;
  src.connect(filter);
  filter.connect(g);
  g.connect(masterGain);
  src.start(time);
}

function scheduleBar(chord, barStart){
  playPad(chord, barStart, BEAT * 4 + 0.3);
  for(let i=0;i<4;i++){
    const t = barStart + i * BEAT;
    playHat(t);
    if(i === 0 || i === 2) playKick(t);
  }
}

function startScheduler(){
  let barIndex = 0;
  let nextBarTime = audioCtx.currentTime + 0.15;
  setInterval(() => {
    while(nextBarTime < audioCtx.currentTime + 1.0){
      scheduleBar(CHORDS[barIndex % CHORDS.length], nextBarTime);
      nextBarTime += BEAT * 4;
      barIndex++;
    }
  }, 200);
}

function startVinylCrackle(){
  const dur = 3;
  const bufferSize = Math.floor(audioCtx.sampleRate * dur);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++){
    let sample = (Math.random()*2-1) * 0.15;
    if(Math.random() < 0.0008) sample = (Math.random()*2-1) * 0.8;
    data[i] = sample;
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 3500;
  filter.Q.value = 0.6;
  const g = audioCtx.createGain();
  g.gain.value = 0.05;
  src.connect(filter);
  filter.connect(g);
  g.connect(masterGain);
  src.start();
}

/** Crea el AudioContext y arranca la música (una sola vez). Llamar dentro
 * de un gesto del usuario (click/tap) para respetar las políticas de autoplay. */
export function ensureAudio(){
  if(audioCtx) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if(!Ctx) return;
  audioCtx = new Ctx();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = muted ? 0 : VOLUME;
  masterGain.connect(audioCtx.destination);
  startVinylCrackle();
  startScheduler();
}

/** Reanuda el contexto si el navegador lo dejó suspendido. */
export function resumeIfSuspended(){
  if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

export function isMuted(){
  return muted;
}

export function setMuted(m){
  muted = m;
  try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch(e) {}
  if(masterGain){
    masterGain.gain.linearRampToValueAtTime(m ? 0 : VOLUME, audioCtx.currentTime + 0.15);
  }
}

export function toggleMuted(){
  setMuted(!muted);
  return muted;
}
