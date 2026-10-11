// audio-scheduler-3.js: Sound-Scheduler fuer Typewriter, Storm, Frogs + Stop/Volume-Funktionen

function scheduleTypewriterClicks() {
  if (currentSoundType !== 'keyboard') return;
  let timeout = setTimeout(() => {
    playTypewriterClick();
    scheduleTypewriterClicks();
  }, 100 + Math.random() * 450);
  activeTimeouts.push(timeout);
}

function playTypewriterClick() {
  if (!audioCtx || currentSoundType !== 'keyboard') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800 + Math.random() * 600, now);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1300 + Math.random() * 900, now);
  filter.Q.setValueAtTime(7, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.4, now + 0.001); 
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(soundGainNode);

  osc.start(now);
  osc.stop(now + 0.02);

  if (Math.random() > 0.95) {
    setTimeout(playTypewriterBell, 200);
  }
}

function playTypewriterBell() {
  if (!audioCtx || currentSoundType !== 'keyboard') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(2400, now);
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.005); 
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
  
  osc.connect(gain);
  gain.connect(soundGainNode);
  
  osc.start(now);
  osc.stop(now + 0.7);
}

function scheduleStormThunderRumbles() {
  if (currentSoundType !== 'storm') return;
  let timeout = setTimeout(() => {
    playStormThunder();
    scheduleStormThunderRumbles();
  }, 10000 + Math.random() * 15000);
  activeTimeouts.push(timeout);
}

function playStormThunder() {
  if (!audioCtx || currentSoundType !== 'storm') return;
  const now = audioCtx.currentTime;
  const source = audioCtx.createBufferSource();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();
  
  source.buffer = getNoiseBuffer('brown');
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(45 + Math.random() * 30, now);
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.65 + Math.random() * 0.25, now + 1.2); 
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 7.5);
  
  source.connect(filter);
  filter.connect(gain);
  gain.connect(soundGainNode);
  
  source.start(now);
  source.stop(now + 8.0);
}

function scheduleFrogsChirpsAndCroaks() {
  if (currentSoundType !== 'frogs') return;
  let timeout = setTimeout(() => {
    if (Math.random() > 0.4) playFrogCroak();
    if (Math.random() > 0.2) playTeichCricketChirp();
    scheduleFrogsChirpsAndCroaks();
  }, 1500 + Math.random() * 2500);
  activeTimeouts.push(timeout);
}

function playFrogCroak() {
  if (!audioCtx || currentSoundType !== 'frogs') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80 + Math.random() * 40, now);
  
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(140, now);
  filter.Q.setValueAtTime(6, now);
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.02); 
  gain.gain.linearRampToValueAtTime(0.05, now + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(soundGainNode);
  
  osc.start(now);
  osc.stop(now + 0.28);
}

function playTeichCricketChirp() {
  if (!audioCtx || currentSoundType !== 'frogs') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(3900 + Math.random() * 400, now);
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.005); 
  gain.gain.linearRampToValueAtTime(0, now + 0.025);
  
  osc.connect(gain);
  gain.connect(soundGainNode);
  
  osc.start(now);
  osc.stop(now + 0.03);
}

// --- STOP & LAUTSTÄRKE ---

function stopAmbientSound(silent = false) {
  clearActiveTimeouts();
  const now = (typeof audioCtx !== 'undefined' && audioCtx && typeof audioCtx.currentTime === 'number') ? audioCtx.currentTime : 0;

  // 0. Ausstehende Crossfade-Nodes und Crossfade-Gains sofort hart stoppen & trennen
  if (typeof pendingCrossfadeNodes !== 'undefined' && pendingCrossfadeNodes.length > 0) {
    pendingCrossfadeNodes.forEach(node => {
      try { if (typeof node.stop === 'function') node.stop(0); } catch(e) { console.warn('[Audio] pendingCrossfadeNode.stop error:', e); }
      try { node.disconnect(); } catch(e) { console.warn('[Audio] pendingCrossfadeNode.disconnect error:', e); }
    });
    pendingCrossfadeNodes = [];
  }

  if (typeof pendingCrossfadeGains !== 'undefined' && pendingCrossfadeGains.length > 0) {
    pendingCrossfadeGains.forEach(gain => {
      try { gain.gain.cancelScheduledValues(now); } catch(e) { console.warn('[Audio] pendingGain.cancelScheduledValues error:', e); }
      try { gain.gain.setValueAtTime(0, now); } catch(e) { console.warn('[Audio] pendingGain.setValueAtTime error:', e); }
      try { gain.disconnect(); } catch(e) { console.warn('[Audio] pendingGain.disconnect error:', e); }
    });
    pendingCrossfadeGains = [];
  }

  // 1. MASTER GAIN sofort kappen und trennen -> KEIN Ton erreicht mehr die Lautsprecher!
  if (typeof masterGainNode !== 'undefined' && masterGainNode) {
    try { masterGainNode.gain.cancelScheduledValues(now); } catch(e) { console.warn('[Audio] masterGain.cancelScheduledValues error:', e); }
    try { masterGainNode.gain.setValueAtTime(0, now); } catch(e) { console.warn('[Audio] masterGain.setValueAtTime error:', e); }
    try { masterGainNode.disconnect(); } catch(e) { console.warn('[Audio] masterGain.disconnect error:', e); }
    masterGainNode = null;
  }

  // 2. Sound Gain trennen
  if (typeof soundGainNode !== 'undefined' && soundGainNode) {
    try { soundGainNode.gain.cancelScheduledValues(now); } catch(e) { console.warn('[Audio] soundGain.cancelScheduledValues error:', e); }
    try { soundGainNode.gain.setValueAtTime(0, now); } catch(e) { console.warn('[Audio] soundGain.setValueAtTime error:', e); }
    try { soundGainNode.disconnect(); } catch(e) { console.warn('[Audio] soundGain.disconnect error:', e); }
    soundGainNode = null;
  }

  // 3. Alle aktiven Oszillatoren / Noise Nodes stoppen & trennen
  if (typeof activeNodes !== 'undefined' && activeNodes.length > 0) {
    activeNodes.forEach(node => {
      try { if (typeof node.stop === 'function') node.stop(0); } catch(e) { console.warn('[Audio] activeNode.stop error:', e); }
      try { node.disconnect(); } catch(e) { console.warn('[Audio] activeNode.disconnect error:', e); }
    });
    activeNodes = [];
  }

  // 4. HTML5 Audio stoppen
  if (typeof activeUserAudio !== 'undefined' && activeUserAudio) {
    try { activeUserAudio.pause(); } catch(e) { console.warn('[Audio] activeUserAudio.pause error:', e); }
    try { activeUserAudio.currentTime = 0; } catch(e) { console.warn('[Audio] activeUserAudio.currentTime error:', e); }
    try { activeUserAudio.src = ""; } catch(e) { console.warn('[Audio] activeUserAudio.src error:', e); }
    activeUserAudio = null;
  }

  // Alle HTML5-Audio-Elemente im DOM anhalten
  try {
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(a => {
      try { a.pause(); a.currentTime = 0; } catch(e) { console.warn('[Audio] DOM audio reset error:', e); }
    });
  } catch(e) {
    console.warn('[Audio] DOM audio pause error:', e);
  }

  // 5. Sprachausgabe sofort abbrechen & alle Timeouts invalidieren
  if (typeof currentSpeechSessionId !== 'undefined') {
    currentSpeechSessionId++;
  }
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch(e) { console.warn('[Audio] speechSynthesis.cancel warning:', e); }
    setTimeout(() => { try { window.speechSynthesis.cancel(); } catch(e) { console.warn('[Audio] deferred cancel warning:', e); } }, 0);
    setTimeout(() => { try { window.speechSynthesis.cancel(); } catch(e) { console.warn('[Audio] deferred cancel 50ms warning:', e); } }, 50);
  }

  // Debug-Log für Graph-Zustand
  if (typeof audioCtx !== 'undefined' && audioCtx) {
    console.log(`[Audio] stopAmbientSound abgeschlossen | AudioContext State: ${audioCtx.state} | Aktive Nodes: 0 | Pending Crossfades: 0`);
  }

  currentSoundType = null;
  updateSoundscapeUI();
  
  const nameLabel = document.getElementById('user-sound-name'); 
  if (nameLabel) nameLabel.classList.add('hidden');
  
  if (!silent) {
    const toastLabel = { 
      de: 'Focus Sound gestoppt', 
      en: 'Focus Sound stopped', 
      es: 'Sonido de enfoque detenido', 
      el: 'Ήχος εστίασης σταμάτησε' 
    }[currentLang] || 'Sound stopped';
    showToast(toastLabel);
  }
}

// ===== HIGH-FIDELITY WEB AUDIO LOOKAHEAD SEQUENCER & SYNTHESIZER ENGINE =====

var currentBeatBpm = 120;
var beatStepIndex = 0;
var nextBeatTime = 0.0;
var beatSchedulerTimer = null;
var lookaheadIntervalMs = 25.0;
var scheduleAheadSec = 0.12;

function setBeatBpm(bpm) {
  var val = parseInt(bpm, 10);
  if (isNaN(val)) val = 120;
  currentBeatBpm = Math.max(60, Math.min(220, val));
  var display = document.getElementById('beat-bpm-val');
  if (display) display.innerText = currentBeatBpm + ' BPM';
  var slider = document.getElementById('beat-bpm-slider');
  if (slider) slider.value = currentBeatBpm;
}
window.setBeatBpm = setBeatBpm;

function changeBeatBpm(delta) {
  setBeatBpm((currentBeatBpm || 120) + delta);
}
window.changeBeatBpm = changeBeatBpm;

function toggleGenreBeat(genre) {
  if (typeof playAmbientSound === 'function') {
    playAmbientSound(genre);
  }
}
window.toggleGenreBeat = toggleGenreBeat;

function setSequencerBpm(bpm) {
  setBeatBpm(bpm);
}
window.setSequencerBpm = setSequencerBpm;

// --- INSTRUMENT SYNTHESIS MODULES ---

function playDrumKick(time, punch = true, pitch = 135, decay = 0.28, vol = 0.45) {
  if (!audioCtx || !soundGainNode) return;
  try {
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(punch ? pitch : 90, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.08);

    var v = vol * (soundMasterVolume || 0.5);
    gain.gain.setValueAtTime(v, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);

    osc.connect(gain);
    gain.connect(soundGainNode);
    osc.start(time);
    osc.stop(time + decay + 0.02);
    activeNodes.push(osc);
  } catch(e) { console.warn('playDrumKick error:', e); }
}

function playDrumSnare(time, isClap = false, vol = 0.3) {
  if (!audioCtx || !soundGainNode) return;
  try {
    var source = audioCtx.createBufferSource();
    source.buffer = getNoiseBuffer('pink');
    var filter = audioCtx.createBiquadFilter();
    filter.type = isClap ? 'bandpass' : 'highpass';
    filter.frequency.setValueAtTime(isClap ? 1200 : 1800, time);
    if (isClap) filter.Q.setValueAtTime(2.5, time);

    var gain = audioCtx.createGain();
    var v = vol * (soundMasterVolume || 0.5);
    gain.gain.setValueAtTime(v, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + (isClap ? 0.16 : 0.18));

    source.connect(filter);
    filter.connect(gain);
    gain.connect(soundGainNode);
    source.start(time);
    source.stop(time + 0.2);
    activeNodes.push(source);

    // Snare Body Tone
    if (!isClap) {
      var body = audioCtx.createOscillator();
      var bodyGain = audioCtx.createGain();
      body.type = 'triangle';
      body.frequency.setValueAtTime(180, time);
      body.frequency.exponentialRampToValueAtTime(80, time + 0.06);
      bodyGain.gain.setValueAtTime(v * 0.5, time);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
      body.connect(bodyGain);
      bodyGain.connect(soundGainNode);
      body.start(time);
      body.stop(time + 0.12);
      activeNodes.push(body);
    }
  } catch(e) { console.warn('playDrumSnare error:', e); }
}

function playDrumHiHat(time, open = false, isRide = false, vol = 0.22) {
  if (!audioCtx || !soundGainNode) return;
  try {
    var source = audioCtx.createBufferSource();
    source.buffer = getNoiseBuffer('pink');
    var filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(isRide ? 5500 : 7800, time);

    var gain = audioCtx.createGain();
    var v = vol * (soundMasterVolume || 0.5);
    var dur = isRide ? 0.35 : (open ? 0.28 : 0.045);
    gain.gain.setValueAtTime(v, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(soundGainNode);
    source.start(time);
    source.stop(time + dur + 0.02);
    activeNodes.push(source);
  } catch(e) { console.warn('playDrumHiHat error:', e); }
}

function playSynthBass(time, freq, dur = 0.25, vol = 0.35) {
  if (!audioCtx || !soundGainNode) return;
  try {
    var osc = audioCtx.createOscillator();
    var filter = audioCtx.createBiquadFilter();
    var gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, time);
    filter.frequency.exponentialRampToValueAtTime(90, time + dur);

    var v = vol * (soundMasterVolume || 0.5);
    gain.gain.setValueAtTime(v, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(soundGainNode);
    osc.start(time);
    osc.stop(time + dur + 0.02);
    activeNodes.push(osc);
  } catch(e) { console.warn('playSynthBass error:', e); }
}

// 🎹 FENDER RHODES VOICE
function playRhodesChord(time, notes, dur = 1.4, vol = 0.28) {
  if (!audioCtx || !soundGainNode) return;
  try {
    var v = (vol / notes.length) * (soundMasterVolume || 0.5);
    notes.forEach((freq, idx) => {
      var t = time + (idx * 0.015);
      var osc1 = audioCtx.createOscillator();
      var osc2 = audioCtx.createOscillator(); // Bell tine
      var filter = audioCtx.createBiquadFilter();
      var gain = audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 4, t); // Tine harmonic

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, t);
      filter.frequency.exponentialRampToValueAtTime(350, t + dur);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(v, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(soundGainNode);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur + 0.05);
      osc2.stop(t + dur + 0.05);
      activeNodes.push(osc1, osc2);
    });
  } catch(e) { console.warn('playRhodesChord error:', e); }
}

// 🎹 JAZZ PIANO VOICING
function playJazzPianoChord(time, notes, dur = 1.8, vol = 0.32) {
  if (!audioCtx || !soundGainNode) return;
  try {
    var v = (vol / notes.length) * (soundMasterVolume || 0.5);
    notes.forEach((freq, idx) => {
      var t = time + (idx * 0.025);
      var osc = audioCtx.createOscillator();
      var osc2 = audioCtx.createOscillator();
      var filter = audioCtx.createBiquadFilter();
      var gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(450, t + dur);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(v, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(soundGainNode);

      osc.start(t);
      osc2.start(t);
      osc.stop(t + dur + 0.05);
      osc2.stop(t + dur + 0.05);
      activeNodes.push(osc, osc2);
    });
  } catch(e) { console.warn('playJazzPianoChord error:', e); }
}

// 🔮 HYPNOTIC MINIMALIST ARPEGGIO RIFF
function playHypnoticNote(time, freq, dur = 0.38, vol = 0.25) {
  if (!audioCtx || !soundGainNode) return;
  try {
    var osc = audioCtx.createOscillator();
    var filter = audioCtx.createBiquadFilter();
    var gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, time);
    filter.frequency.exponentialRampToValueAtTime(300, time + dur);
    filter.Q.setValueAtTime(4, time);

    var v = vol * (soundMasterVolume || 0.5);
    gain.gain.setValueAtTime(v, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(soundGainNode);

    osc.start(time);
    osc.stop(time + dur + 0.02);
    activeNodes.push(osc);
  } catch(e) { console.warn('playHypnoticNote error:', e); }
}

// --- MUSICAL DATA & CHORD SEQUENCES ---

var JAZZ_VOICINGS = [
  [220.00, 261.63, 329.63, 392.00, 493.88], // Am9
  [146.83, 220.00, 261.63, 311.13, 392.00], // D9(b13)
  [130.81, 196.00, 246.94, 329.63, 392.00], // Gmaj9
  [164.81, 246.94, 329.63, 392.00, 440.00]  // Em11
];

var RHODES_PROGRESSIONS = [
  [174.61, 220.00, 261.63, 329.63, 440.00], // Fmaj9
  [164.81, 196.00, 246.94, 293.66, 392.00], // Em9
  [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9
  [130.81, 164.81, 196.00, 246.94, 329.63]  // Cmaj9
];

var HYPNOTIC_NOTES = [
  220.00, 261.63, 329.63, 392.00, 440.00, 523.25, 440.00, 329.63,
  196.00, 246.94, 293.66, 392.00, 493.88, 587.33, 493.88, 293.66
];

// 🎹 SYNTHWAVE / RETROWAVE POLYPHONIC PAD
function playSynthwavePad(time, notes, dur = 1.2, vol = 0.26) {
  if (!audioCtx || !soundGainNode) return;
  try {
    var v = (vol / notes.length) * (soundMasterVolume || 0.5);
    notes.forEach((freq, idx) => {
      var t = time + (idx * 0.008);
      var osc1 = audioCtx.createOscillator();
      var osc2 = audioCtx.createOscillator();
      var filter = audioCtx.createBiquadFilter();
      var gain = audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, t);
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq * 1.006, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.frequency.exponentialRampToValueAtTime(450, t + dur);
      filter.Q.setValueAtTime(2.5, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(v, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(soundGainNode);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur + 0.05);
      osc2.stop(t + dur + 0.05);
      activeNodes.push(osc1, osc2);
    });
  } catch(e) { console.warn('playSynthwavePad error:', e); }
}

// 🔔 MEMPHIS COWBELL / PHONK BELL
function playPhonkCowbell(time, freq = 587.33, vol = 0.28) {
  if (!audioCtx || !soundGainNode) return;
  try {
    var osc1 = audioCtx.createOscillator();
    var osc2 = audioCtx.createOscillator();
    var filter = audioCtx.createBiquadFilter();
    var gain = audioCtx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(freq * 1.48, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.2, time);
    filter.Q.setValueAtTime(6.0, time);

    var v = vol * (soundMasterVolume || 0.5);
    gain.gain.setValueAtTime(v, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.24);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(soundGainNode);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.26);
    osc2.stop(time + 0.26);
    activeNodes.push(osc1, osc2);
  } catch(e) { console.warn('playPhonkCowbell error:', e); }
}

// 🔊 808 SUB BASS / GLIDE
function play808SubBass(time, startFreq = 85, endFreq = 42, dur = 0.45, vol = 0.5) {
  if (!audioCtx || !soundGainNode) return;
  try {
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    var filter = audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, time);

    var v = vol * (soundMasterVolume || 0.5);
    gain.gain.setValueAtTime(v, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(soundGainNode);

    osc.start(time);
    osc.stop(time + dur + 0.02);
    activeNodes.push(osc);
  } catch(e) { console.warn('play808SubBass error:', e); }
}

// 🪩 DEEP HOUSE ORGAN BASS
function playHouseBass(time, freq, dur = 0.22, vol = 0.38) {
  if (!audioCtx || !soundGainNode) return;
  try {
    var osc1 = audioCtx.createOscillator();
    var osc2 = audioCtx.createOscillator();
    var filter = audioCtx.createBiquadFilter();
    var gain = audioCtx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(480, time);
    filter.frequency.exponentialRampToValueAtTime(140, time + dur);
    filter.Q.setValueAtTime(3.0, time);

    var v = vol * (soundMasterVolume || 0.5);
    gain.gain.setValueAtTime(v, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(soundGainNode);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + dur + 0.02);
    osc2.stop(time + dur + 0.02);
    activeNodes.push(osc1, osc2);
  } catch(e) { console.warn('playHouseBass error:', e); }
}

var SYNTHWAVE_PAD_PROGRESSION = [
  [220.00, 261.63, 329.63, 392.00], // Am7
  [174.61, 220.00, 261.63, 329.63], // Fmaj7
  [130.81, 164.81, 196.00, 246.94], // Cmaj7
  [196.00, 246.94, 293.66, 392.00]  // G
];

var PHONK_COWBELL_MELODY = [
  587.33, 0, 587.33, 698.46, 0, 587.33, 523.25, 0,
  587.33, 0, 783.99, 698.46, 0, 587.33, 440.00, 523.25
];

// --- 16-STEP LOOKAHEAD STEP DISPATCHER ---

function scheduleBeat16thStep(step, time) {
  var st = currentSoundType;
  if (!st) return;

  // 1. ⚡ TECHNO (128 BPM Standard)
  if (st === 'techno') {
    // 4-on-the-floor Kick
    if (step % 4 === 0) playDrumKick(time, true, 145, 0.28, 0.5);
    // Offbeat Open Hi-Hat
    if (step % 4 === 2) playDrumHiHat(time, true, false, 0.28);
    // Closed Hat 16ths
    if (step % 2 === 1) playDrumHiHat(time, false, false, 0.12);
    // Clap on 4 and 12
    if (step === 4 || step === 12) playDrumSnare(time, true, 0.32);
    // Rolling 16th Bassline
    var bassNotes = [55, 55, 65.4, 55, 55, 55, 73.4, 55, 55, 55, 65.4, 55, 55, 55, 82.4, 73.4];
    playSynthBass(time, bassNotes[step], 0.18, 0.28);

  // 2. ⚡ DRUM & BASS (174 BPM Standard)
  } else if (st === 'dnb') {
    // Breakbeat Kick on 0, 10
    if (step === 0 || step === 10) playDrumKick(time, true, 160, 0.2, 0.52);
    // Snare on 4, 12
    if (step === 4 || step === 12) playDrumSnare(time, false, 0.42);
    // Fast 16th Ride & Ghost Snare
    playDrumHiHat(time, step % 4 === 2, true, step % 2 === 0 ? 0.22 : 0.14);
    if (step === 7 || step === 15) playDrumSnare(time, false, 0.12);
    // Deep Sub Bass
    if (step % 8 === 0) playSynthBass(time, 43.65, 0.5, 0.45); // F0 Sub

  // 3. 🌆 SYNTHWAVE / RETROWAVE (110 BPM Standard)
  } else if (st === 'synthwave') {
    // Punchy 80s Kick
    if (step === 0 || step === 6 || step === 8 || step === 10) playDrumKick(time, true, 140, 0.25, 0.48);
    // Gated 80s Snare on 4, 12
    if (step === 4 || step === 12) playDrumSnare(time, false, 0.42);
    // 16th Hi-Hats with 8th accents
    playDrumHiHat(time, false, false, step % 2 === 0 ? 0.22 : 0.12);
    if (step === 2 || step === 10 || step === 14) playDrumHiHat(time, true, false, 0.18);
    // 16th Rolling Synth Bassline
    var swBass = [55, 55, 55, 55, 43.65, 43.65, 43.65, 43.65, 65.41, 65.41, 65.41, 65.41, 48.99, 48.99, 48.99, 48.99];
    playSynthBass(time, swBass[step], 0.15, 0.32);
    // Atmospheric Synth Pad Swells on 0 and 8
    if (step === 0 || step === 8) {
      var padChord = SYNTHWAVE_PAD_PROGRESSION[(step === 0 ? 0 : 1)];
      playSynthwavePad(time, padChord, 1.4, 0.25);
    }

  // 4. 🪩 DEEP HOUSE GROOVE (124 BPM Standard)
  } else if (st === 'house') {
    // 4-on-the-floor Kick
    if (step % 4 === 0) playDrumKick(time, true, 135, 0.26, 0.52);
    // 909 Open Hat on offbeats
    if (step % 4 === 2) playDrumHiHat(time, true, false, 0.32);
    // Shuffled closed hats
    if (step % 2 === 1) playDrumHiHat(time, false, false, 0.16);
    // 909 Clap on 4, 12
    if (step === 4 || step === 12) playDrumSnare(time, true, 0.36);
    // Bouncy Deep House Bass
    var houseBassSteps = [65.41, 0, 0, 65.41, 0, 0, 77.78, 0, 87.31, 0, 0, 65.41, 0, 58.27, 0, 0];
    if (houseBassSteps[step] > 0) {
      playHouseBass(time, houseBassSteps[step], 0.22, 0.38);
    }

  // 5. 🌴 AFROBEATS (102 BPM Standard)
  } else if (st === 'afrobeats') {
    // Syncopated Log-Drum / Kick on 0, 6, 10
    if (step === 0 || step === 6 || step === 10) playDrumKick(time, false, 110, 0.32, 0.48);
    // Rimshot on 4, 10, 13
    if (step === 4 || step === 10 || step === 13) playDrumSnare(time, true, 0.28);
    // Shaker groove
    playDrumHiHat(time, false, false, (step % 2 === 1) ? 0.2 : 0.1);
    // Bass Thump
    if (step === 0 || step === 8) playSynthBass(time, 65.4, 0.3, 0.32);

  // 6. 🎤 BOOM-BAP HIP-HOP (92 BPM Standard)
  } else if (st === 'boombap') {
    // Punchy Kick on 0, 8, 11
    if (step === 0 || step === 8 || step === 11) playDrumKick(time, true, 130, 0.3, 0.5);
    // Crisp Snare on 4, 12
    if (step === 4 || step === 12) playDrumSnare(time, false, 0.38);
    // Closed Hat on 8ths
    if (step % 2 === 0) playDrumHiHat(time, false, false, 0.18);
    if (step % 4 === 2) playDrumHiHat(time, true, false, 0.12);

  // 7. 💎 CHILL TRAP (140 BPM Standard)
  } else if (st === 'trap') {
    // 808 Sub Kick on 0, 7, 10
    if (step === 0) play808SubBass(time, 130, 48, 0.55, 0.55);
    if (step === 7) play808SubBass(time, 110, 43.65, 0.4, 0.45);
    if (step === 10) play808SubBass(time, 120, 55, 0.45, 0.5);
    // Half-time Snare / Clap on step 8
    if (step === 8) playDrumSnare(time, true, 0.45);
    // Fast Hi-Hats with rolling bursts on 12-15
    if (step >= 12) {
      playDrumHiHat(time, false, false, 0.24);
    } else if (step % 2 === 0) {
      playDrumHiHat(time, false, false, 0.18);
    }
    // Moody Trap Bell
    if (step === 0 || step === 6 || step === 11) {
      var bellFreqs = [587.33, 523.25, 440.00];
      playHypnoticNote(time, bellFreqs[step === 0 ? 0 : (step === 6 ? 1 : 2)], 0.35, 0.25);
    }

  // 8. ☁️ CHILLSTEP / DOWNTEMPO (90 BPM Standard)
  } else if (st === 'chillstep') {
    // Heavy slow kick on 0, 10
    if (step === 0) playDrumKick(time, true, 120, 0.38, 0.52);
    if (step === 10) playDrumKick(time, false, 105, 0.28, 0.42);
    // Ambient Half-time Snare with reverb decay on step 8
    if (step === 8) {
      playDrumSnare(time, false, 0.38);
      playDrumHiHat(time, true, true, 0.22);
    }
    // Ticking hi-hats
    if (step % 2 === 0) playDrumHiHat(time, false, false, 0.14);
    if (step % 4 === 2) playDrumHiHat(time, true, false, 0.1);
    // Ambient Pad Chords & Sub
    if (step === 0) {
      playRhodesChord(time, [130.81, 196.00, 261.63, 329.63], 1.8, 0.3);
      playSynthBass(time, 32.7, 0.8, 0.45);
    } else if (step === 8) {
      playRhodesChord(time, [110.00, 164.81, 220.00, 261.63], 1.6, 0.28);
      playSynthBass(time, 27.5, 0.7, 0.42);
    }

  // 9. 🏎️ DRIFT PHONK (135 BPM Standard)
  } else if (st === 'phonk') {
    // Punchy 808 Kick on 0, 3, 8, 11
    if (step === 0 || step === 3 || step === 8 || step === 11) {
      playDrumKick(time, true, 160, 0.22, 0.55);
      play808SubBass(time, 120, 48.99, 0.35, 0.45);
    }
    // Crunchy Memphis Clap on 4, 12
    if (step === 4 || step === 12) playDrumSnare(time, true, 0.46);
    // Riding Hats
    playDrumHiHat(time, step % 4 === 2, false, 0.18);
    // Memphis Phonk Cowbell Riff
    var cowbellPitch = PHONK_COWBELL_MELODY[step];
    if (cowbellPitch > 0) {
      playPhonkCowbell(time, cowbellPitch, 0.32);
    }

  // 10. 🎷 SWING & JAZZ (Fallback)
  } else if (st === 'swing') {
    // Swing Triplet Ride Cymbal (1, 2+, 3, 4+)
    if (step % 4 === 0) playDrumHiHat(time, false, true, 0.3);
    if (step % 4 === 3) playDrumHiHat(time, true, true, 0.22);
    // Ghost Brush Snare on 4, 12
    if (step === 4 || step === 12) playDrumSnare(time, false, 0.2);
    // Walking Bass Quarter Notes
    if (step % 4 === 0) {
      var walkNotes = [110.0, 123.47, 130.81, 146.83];
      playSynthBass(time, walkNotes[(step / 4) % walkNotes.length], 0.35, 0.35);
    }

  // 11. 🎹 JAZZ PIANO CHORDS
  } else if (st === 'jazz_piano') {
    if (step === 0 || step === 8) {
      var chordIdx = Math.floor(step / 8) % JAZZ_VOICINGS.length;
      playJazzPianoChord(time, JAZZ_VOICINGS[chordIdx], 1.8, 0.35);
    }

  // 12. 🪕 FENDER RHODES CHORDS & LOOPS
  } else if (st === 'rhodes') {
    if (step === 0 || step === 8) {
      var rIdx = Math.floor(step / 8) % RHODES_PROGRESSIONS.length;
      playRhodesChord(time, RHODES_PROGRESSIONS[rIdx], 1.7, 0.32);
    }

  // 13. 🔮 HYPNOTIC ARPEGGIO RIFF
  } else if (st === 'hypnotic_riff') {
    var noteFreq = HYPNOTIC_NOTES[step % HYPNOTIC_NOTES.length];
    playHypnoticNote(time, noteFreq, 0.32, 0.28);
    if (step % 4 === 0) playDrumKick(time, false, 100, 0.2, 0.22); // Subtle pulse
  }
}

function runBeatLookaheadScheduler() {
  if (!audioCtx || !currentSoundType) return;
  var isBeatType = ['techno', 'dnb', 'afrobeats', 'swing', 'boombap', 'synthwave', 'house', 'trap', 'chillstep', 'phonk', 'jazz_piano', 'rhodes', 'hypnotic_riff'].includes(currentSoundType);
  if (!isBeatType) return;

  var secPer16th = (60.0 / (currentBeatBpm || 120)) / 4.0;

  while (nextBeatTime < audioCtx.currentTime + scheduleAheadSec) {
    scheduleBeat16thStep(beatStepIndex, nextBeatTime);
    nextBeatTime += secPer16th;
    beatStepIndex = (beatStepIndex + 1) % 16;
  }

  beatSchedulerTimer = setTimeout(runBeatLookaheadScheduler, lookaheadIntervalMs);
  activeTimeouts.push(beatSchedulerTimer);
}

function startBeatLookaheadLoop(type, defaultBpm) {
  if (!audioCtx) return;
  if (defaultBpm && !document.getElementById('beat-bpm-slider')?.dataset?.userTouched) {
    setBeatBpm(defaultBpm);
  }
  beatStepIndex = 0;
  nextBeatTime = audioCtx.currentTime + 0.05;
  runBeatLookaheadScheduler();
}
window.startBeatLookaheadLoop = startBeatLookaheadLoop;

 
 
