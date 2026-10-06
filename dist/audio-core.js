
// =========================================================================
// MULTI-TRACK AMBIENT MIXER & BINAURAL FOCUS FREQUENCIES ENGINE
// =========================================================================

var activeAmbientLayers = {}; // [type]: { source, gainNode, filter, volume }
var activeBinauralBeat = null; // 'alpha', 'theta', 'gamma', or null
var binauralAudioNodes = null;
var binauralVolume = 0.4;

const SOUND_MIX_PRESETS = {
  rainy_cafe: {
    name: 'Regnerisches Café',
    icon: '☕',
    layers: { cafe: 0.65, stream: 0.5 }
  },
  camp_forest: {
    name: 'Wald & Lagerfeuer',
    icon: '🏕️',
    layers: { campfire: 0.7, birds: 0.4, breeze: 0.35 }
  },
  zen_deep: {
    name: 'Zen Deep Space',
    icon: '🧘',
    layers: { space: 0.65, breeze: 0.3 }
  },
  study_cozy: {
    name: 'Cozy Study Corner',
    icon: '📚',
    layers: { cafe: 0.45, campfire: 0.4, breeze: 0.25 }
  }
};

function isAmbientLayerActive(type) {
  return Boolean(activeAmbientLayers[type]);
}

function getAmbientLayerVolume(type) {
  return activeAmbientLayers[type] ? (activeAmbientLayers[type].volume || 0.5) : 0.5;
}

function setAmbientLayerVolume(type, vol) {
  const v = Math.max(0, Math.min(1, parseFloat(vol)));
  if (activeAmbientLayers[type]) {
    activeAmbientLayers[type].volume = v;
    if (activeAmbientLayers[type].gainNode && audioCtx) {
      const now = audioCtx.currentTime;
      activeAmbientLayers[type].gainNode.gain.cancelScheduledValues(now);
      activeAmbientLayers[type].gainNode.gain.linearRampToValueAtTime(v * (soundMasterVolume || 0.5), now + 0.05);
    }
  }
  updateMixerUI();
}

function toggleAmbientLayer(type, forceState) {
  initAudioContext();
  if (!audioCtx) return;

  const isRunning = Boolean(activeAmbientLayers[type]);
  const shouldRun = forceState !== undefined ? forceState : !isRunning;

  if (!shouldRun && isRunning) {
    stopAmbientLayer(type);
  } else if (shouldRun && !isRunning) {
    startAmbientLayer(type);
  }
  updateMixerUI();
}

function startAmbientLayer(type, initialVolume = 0.5) {
  initAudioContext();
  if (!audioCtx) return;
  if (activeAmbientLayers[type]) return; // already active

  const masterDest = getMasterAudioDestination() || audioCtx.destination;
  const layerGain = audioCtx.createGain();
  const vol = Math.max(0, Math.min(1, initialVolume));
  layerGain.gain.setValueAtTime(vol * (soundMasterVolume || 0.5), audioCtx.currentTime);
  layerGain.connect(masterDest);

  const layerObj = {
    type: type,
    gainNode: layerGain,
    volume: vol,
    nodes: []
  };

  const now = audioCtx.currentTime;

  if (type === 'cafe') {
    const source = audioCtx.createBufferSource();
    source.buffer = getNoiseBuffer('pink');
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);
    source.connect(filter);
    filter.connect(layerGain);
    source.start(now);
    layerObj.nodes.push(source, filter);
  } else if (type === 'stream') {
    const source = audioCtx.createBufferSource();
    source.buffer = getNoiseBuffer('pink');
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(1.2, now);
    source.connect(filter);
    filter.connect(layerGain);
    source.start(now);
    layerObj.nodes.push(source, filter);
  } else if (type === 'campfire') {
    const source = audioCtx.createBufferSource();
    source.buffer = getNoiseBuffer('brown');
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);
    source.connect(filter);
    filter.connect(layerGain);
    source.start(now);
    layerObj.nodes.push(source, filter);
  } else if (type === 'birds') {
    const source = audioCtx.createBufferSource();
    source.buffer = getNoiseBuffer('pink');
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);
    source.connect(filter);
    filter.connect(layerGain);
    source.start(now);
    layerObj.nodes.push(source, filter);
  } else if (type === 'breeze') {
    const source = audioCtx.createBufferSource();
    source.buffer = getNoiseBuffer('pink');
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, now);
    source.connect(filter);
    filter.connect(layerGain);
    source.start(now);
    layerObj.nodes.push(source, filter);
  } else if (type === 'space') {
    const freqs = [65.4, 98.0, 130.8];
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, now);
    filter.connect(layerGain);
    freqs.forEach(f => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      oscGain.gain.setValueAtTime(0.12 / freqs.length, now);
      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start(now);
      layerObj.nodes.push(osc, oscGain);
    });
    layerObj.nodes.push(filter);
  }

  activeAmbientLayers[type] = layerObj;
  updateMixerUI();
}

function stopAmbientLayer(type) {
  if (!activeAmbientLayers[type]) return;
  const layer = activeAmbientLayers[type];
  if (layer.gainNode && audioCtx) {
    try {
      layer.gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
      layer.gainNode.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
    } catch (e) {}
  }
  setTimeout(() => {
    (layer.nodes || []).forEach(node => {
      try { if (node.stop) node.stop(); } catch (e) {}
      try { if (node.disconnect) node.disconnect(); } catch (e) {}
    });
    try { if (layer.gainNode) layer.gainNode.disconnect(); } catch (e) {}
  }, 180);
  delete activeAmbientLayers[type];
  updateMixerUI();
}

function stopAllAmbientLayers() {
  Object.keys(activeAmbientLayers).forEach(stopAmbientLayer);
  stopBinauralBeat();
  updateMixerUI();
}

function applySoundMixPreset(presetKey) {
  const preset = SOUND_MIX_PRESETS[presetKey];
  if (!preset) return;

  stopAllAmbientLayers();
  setTimeout(() => {
    Object.entries(preset.layers).forEach(([type, vol]) => {
      startAmbientLayer(type, vol);
    });
    if (typeof showToast === 'function') {
      showToast(`🎛️ Mix-Preset aktiv: ${preset.name}`);
    }
    updateMixerUI();
  }, 200);
}

// =========================================================================
// BINAURAL FOCUS FREQUENCIES (ALPHA, THETA, GAMMA)
// =========================================================================

function toggleBinauralBeat(type) {
  if (activeBinauralBeat === type) {
    stopBinauralBeat();
  } else {
    playBinauralBeat(type);
  }
}

function playBinauralBeat(type) {
  initAudioContext();
  if (!audioCtx) return;

  stopBinauralBeat();

  let baseFreq = 200;
  let beatDiff = 10; // Alpha 10 Hz (8-12 Hz)
  let label = 'Alpha (10 Hz) · Flow & Entspannung';

  if (type === 'theta') {
    baseFreq = 150;
    beatDiff = 6; // Theta 6 Hz (4-7 Hz)
    label = 'Theta (6 Hz) · Tiefenmeditation & Intuition';
  } else if (type === 'gamma') {
    baseFreq = 240;
    beatDiff = 40; // Gamma 40 Hz (30-50 Hz)
    label = 'Gamma (40 Hz) · Spitzen-Fokus & Kognition';
  }

  const now = audioCtx.currentTime;
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.001, now);
  masterGain.gain.linearRampToValueAtTime(binauralVolume * (soundMasterVolume || 0.5) * 0.4, now + 1.2);
  masterGain.connect(getMasterAudioDestination() || audioCtx.destination);

  // Left channel
  const oscL = audioCtx.createOscillator();
  const panL = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
  oscL.type = 'sine';
  oscL.frequency.setValueAtTime(baseFreq, now);

  // Right channel
  const oscR = audioCtx.createOscillator();
  const panR = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
  oscR.type = 'sine';
  oscR.frequency.setValueAtTime(baseFreq + beatDiff, now);

  if (panL && panR) {
    panL.pan.setValueAtTime(-1.0, now);
    panR.pan.setValueAtTime(1.0, now);
    oscL.connect(panL);
    panL.connect(masterGain);
    oscR.connect(panR);
    panR.connect(masterGain);
  } else {
    oscL.connect(masterGain);
    oscR.connect(masterGain);
  }

  oscL.start(now);
  oscR.start(now);

  activeBinauralBeat = type;
  binauralAudioNodes = { oscL, oscR, panL, panR, masterGain };

  if (typeof showToast === 'function') {
    showToast(`🧠 Binaurale Frequenz: ${label}`);
  }
  updateMixerUI();
}

function stopBinauralBeat() {
  if (binauralAudioNodes && audioCtx) {
    try {
      const now = audioCtx.currentTime;
      binauralAudioNodes.masterGain.gain.cancelScheduledValues(now);
      binauralAudioNodes.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
      setTimeout(() => {
        try { if (binauralAudioNodes.oscL) binauralAudioNodes.oscL.stop(); } catch (e) {}
        try { if (binauralAudioNodes.oscR) binauralAudioNodes.oscR.stop(); } catch (e) {}
        try { if (binauralAudioNodes.masterGain) binauralAudioNodes.masterGain.disconnect(); } catch (e) {}
        binauralAudioNodes = null;
      }, 350);
    } catch (e) {}
  }
  activeBinauralBeat = null;
  updateMixerUI();
}

function setBinauralVolume(vol) {
  binauralVolume = Math.max(0, Math.min(1, parseFloat(vol)));
  if (binauralAudioNodes && audioCtx) {
    const now = audioCtx.currentTime;
    binauralAudioNodes.masterGain.gain.cancelScheduledValues(now);
    binauralAudioNodes.masterGain.gain.linearRampToValueAtTime(binauralVolume * (soundMasterVolume || 0.5) * 0.4, now + 0.05);
  }
}

function updateMixerUI() {
  const mixerLayers = ['cafe', 'stream', 'campfire', 'birds', 'breeze', 'space'];
  mixerLayers.forEach(layer => {
    const active = isAmbientLayerActive(layer);
    const vol = getAmbientLayerVolume(layer);

    const btn = document.getElementById(`mixer-toggle-${layer}`);
    const slider = document.getElementById(`mixer-vol-${layer}`);
    const valBadge = document.getElementById(`mixer-val-${layer}`);

    if (btn) {
      if (active) {
        btn.className = 'px-2.5 py-1 rounded-xl text-xs font-bold bg-fuchsia-500/25 text-fuchsia-200 border border-fuchsia-400/60 shadow-sm flex items-center gap-1.5 cursor-pointer';
      } else {
        btn.className = 'px-2.5 py-1 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 border border-white/10 flex items-center gap-1.5 cursor-pointer';
      }
    }
    if (slider) {
      slider.value = vol;
      slider.disabled = !active;
      slider.style.opacity = active ? '1' : '0.4';
    }
    if (valBadge) {
      valBadge.innerText = `${Math.round(vol * 100)}%`;
      valBadge.style.opacity = active ? '1' : '0.4';
    }
  });

  // Binaural UI
  ['alpha', 'theta', 'gamma'].forEach(b => {
    const btn = document.getElementById(`binaural-btn-${b}`);
    if (btn) {
      if (activeBinauralBeat === b) {
        btn.className = 'flex-1 py-1.5 px-2 rounded-xl font-bold text-xs bg-fuchsia-500 text-black shadow-lg shadow-fuchsia-500/30 transition flex items-center justify-center gap-1 cursor-pointer animate-pulse';
      } else {
        btn.className = 'flex-1 py-1.5 px-2 rounded-xl font-semibold text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center justify-center gap-1 cursor-pointer';
      }
    }
  });

  const binLiveBadge = document.getElementById('binaural-live-indicator');
  if (binLiveBadge) {
    binLiveBadge.classList.toggle('hidden', !activeBinauralBeat);
  }

  updateAudioStudioHeader();
  updateHeaderSoundBtnUI();
}

// Globale Audio-Variablen
var audioCtx = null;
var currentSoundType = null;
var soundGainNode = null;
var soundOscillators = [];
var soundMasterVolume = 0.5;
var activeUserAudio = null; // Speichert das aktive HTML5-Audio-Objekt
var localSoundCache = {}; 
var activeNodes = [];
var activeTimeouts = [];
var noiseBuffers = {};
var pendingCrossfadeNodes = [];
var pendingCrossfadeGains = [];

// Playlist-Zustände für eigene Tracks
var DEFAULT_PRELOADED_TRACKS = [
  { id: 'track_lofi', name: '☕ Deep Focus Lofi', url: 'music/deep_focus_lofi.mp3', bpm: 85, presetKey: 'lofi_chill', duration: 180, isPreloaded: true },
  { id: 'track_deep_house', name: '🪩 Deep House Sunset', url: 'music/deep_house_sunset.mp3', bpm: 126, presetKey: 'deep_house', duration: 210, isPreloaded: true },
  { id: 'track_synthwave', name: '🌆 Synthwave Neon Drive', url: 'music/synthwave_neon_drive.mp3', bpm: 128, presetKey: 'cyber_wave', duration: 195, isPreloaded: true },
  { id: 'track_zen', name: '🍃 Zen Meditation Flow', url: 'music/zen_meditation_flow.mp3', bpm: 118, presetKey: 'ambient_flow', duration: 240, isPreloaded: true }
];
var playlistTracks = [...DEFAULT_PRELOADED_TRACKS];
var currentTrackIndex = 0;
var isPlayerShuffleEnabled = true; // standardmäßig aktiv (zufällige Wiedergabe)
var playerRepeatMode = 'all'; // 'off' | 'all' | 'one'
var isPlayerMuted = false;
var volumeBeforeMute = 0.5;
var draggedTrackIndex = null;
var masterGainNode = null;

function getMasterAudioDestination() {
  initAudioContext();
  if (!audioCtx) return null;
  if (!masterGainNode) {
    masterGainNode = audioCtx.createGain();
    masterGainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
    masterGainNode.connect(audioCtx.destination);
  }
  return masterGainNode;
}
window.getMasterAudioDestination = getMasterAudioDestination;

function initAudioContext() {
  try {
    if (!audioCtx || audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    if (audioCtx && !masterGainNode) {
      masterGainNode = audioCtx.createGain();
      masterGainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
      masterGainNode.connect(audioCtx.destination);
    }
  } catch (e) {
    console.warn("AudioContext init warning:", e);
  }
}

// Mobiler Audio-Unlock für iOS Safari & Android beim ersten Benutzerkontakt
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  const unlockMobileAudio = () => {
    initAudioContext();
    if (typeof window.removeEventListener === 'function') {
      window.removeEventListener('touchstart', unlockMobileAudio);
      window.removeEventListener('touchend', unlockMobileAudio);
      window.removeEventListener('pointerdown', unlockMobileAudio);
      window.removeEventListener('click', unlockMobileAudio);
    }
  };
  window.addEventListener('touchstart', unlockMobileAudio, { passive: true, once: true });
  window.addEventListener('touchend', unlockMobileAudio, { passive: true, once: true });
  window.addEventListener('pointerdown', unlockMobileAudio, { passive: true, once: true });
  window.addEventListener('click', unlockMobileAudio, { passive: true, once: true });

  // Nahtloses Reaktivieren beim Zurückkehren aus dem Hintergrund (iOS Safari & Android)
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && audioCtx && audioCtx.state === 'suspended' && (currentSoundType || (activeUserAudio && !activeUserAudio.paused))) {
        audioCtx.resume().catch(() => {});
      }
    });
  }
}

// Hilfsfunktion: Erzeugt lückenlose Rausch-Loops im Arbeitsspeicher
function getNoiseBuffer(type) {
  initAudioContext();
  if (!audioCtx) return null;
  if (noiseBuffers[type]) return noiseBuffers[type];
  
  const sampleRate = audioCtx.sampleRate || 44100;
  const bufferSize = sampleRate * 4;
  const buffer = audioCtx.createBuffer(2, bufferSize, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  
  if (type === 'pink') {
    let b0_l=0, b1_l=0, b2_l=0, b3_l=0, b4_l=0, b5_l=0, b6_l=0;
    let b0_r=0, b1_r=0, b2_r=0, b3_r=0, b4_r=0, b5_r=0, b6_r=0;
    for (let i = 0; i < bufferSize; i++) {
      let white_l = Math.random() * 2 - 1;
      b0_l = 0.99886 * b0_l + white_l * 0.0555179;
      b1_l = 0.99332 * b1_l + white_l * 0.0750759;
      b2_l = 0.96900 * b2_l + white_l * 0.1538520;
      b3_l = 0.86650 * b3_l + white_l * 0.3104856;
      b4_l = 0.55000 * b4_l + white_l * 0.5329522;
      b5_l = -0.7616 * b5_l - white_l * 0.0168980;
      left[i] = (b0_l + b1_l + b2_l + b3_l + b4_l + b5_l + b6_l + white_l * 0.5362) * 0.11;
      b6_l = white_l * 0.115926;
      
      let white_r = Math.random() * 2 - 1;
      b0_r = 0.99886 * b0_r + white_r * 0.0555179;
      b1_r = 0.99332 * b1_r + white_r * 0.0750759;
      b2_r = 0.96900 * b2_r + white_r * 0.1538520;
      b3_r = 0.86650 * b3_r + white_r * 0.3104856;
      b4_r = 0.55000 * b4_r + white_r * 0.5329522;
      b5_r = -0.7616 * b5_r - white_r * 0.0168980;
      right[i] = (b0_r + b1_r + b2_r + b3_r + b4_r + b5_r + b6_r + white_r * 0.5362) * 0.11;
      b6_r = white_r * 0.115926;
    }
  } else if (type === 'brown') {
    let lastOut_l = 0.0, lastOut_r = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      let white_l = Math.random() * 2 - 1;
      left[i] = (lastOut_l + (0.02 * white_l)) / 1.02;
      lastOut_l = left[i];
      left[i] *= 3.5;
      
      let white_r = Math.random() * 2 - 1;
      right[i] = (lastOut_r + (0.02 * white_r)) / 1.02;
      lastOut_r = right[i];
      right[i] *= 3.5;
    }
  }
  noiseBuffers[type] = buffer;
  return buffer;
}

function clearActiveTimeouts() {
  activeTimeouts.forEach(clearTimeout);
  activeTimeouts = [];
}

// Hauptfunktion zum Abspielen der 18 Naturgeräusche (mit integriertem Crossfade-Support & Toggle-Stopp)
function playAmbientSound(type, crossfade = false) {
  initAudioContext();
  if (!audioCtx) return;

  // Wenn der geklickte Sound bereits läuft -> stoppen (Toggle-Funktion)
  if (currentSoundType === type) {
    stopAmbientSound(true);
    if (typeof stopAllStudioAudio === 'function') stopAllStudioAudio();
    updateSoundscapeUI();
    if (typeof showToast === 'function') {
      showToast(typeof tr === 'function' ? tr({ de: 'Audio gestoppt ⏹️', en: 'Audio stopped ⏹️' }) : 'Audio gestoppt ⏹️');
    }
    return;
  }

  // Ansonsten: Alle anderen vorher laufenden Sounds/Musik/Radio restlos stoppen
  if (typeof stopAllStudioAudio === 'function') stopAllStudioAudio();
  stopAmbientSound(true);

  // Exklusivität: Radio stoppen falls aktiv
  try {
    if (typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.toggleRadioPlayback === 'function' && window.isRadioPlaying) {
      RadioNewsEngine.toggleRadioPlayback();
    } else if (typeof window !== 'undefined' && window.radioAudioEl && !window.radioAudioEl.paused) {
      window.radioAudioEl.pause();
    }
  } catch (e) {}

  currentSoundType = type;
  soundGainNode = audioCtx.createGain();
  soundGainNode.gain.setValueAtTime(soundMasterVolume * 1.0, audioCtx.currentTime);
  soundGainNode.connect(getMasterAudioDestination() || audioCtx.destination);

  // Generatoren anstoßen
  startAmbientGeneratorForType(type);

  updateSoundscapeUI();
  lastSelectedSound = type;
}

// Harmonisches Audio-Ducking für Sprachansagen
function duckAmbientVolume(ratio = 0.18) {
  if (soundGainNode && audioCtx) {
    try {
      const now = audioCtx.currentTime;
      soundGainNode.gain.cancelScheduledValues(now);
      soundGainNode.gain.setValueAtTime(soundGainNode.gain.value, now);
      soundGainNode.gain.linearRampToValueAtTime(soundMasterVolume * ratio, now + 0.2);
    } catch (e) {
      console.warn('[Audio] duckAmbientVolume error:', e);
    }
  }
  if (activeUserAudio) {
    try { activeUserAudio.volume = Math.max(0, Math.min(1, soundMasterVolume * ratio)); } catch (e) { console.warn('[Audio] duck activeUserAudio error:', e); }
  }
}

function restoreAmbientVolume() {
  if (soundGainNode && audioCtx) {
    try {
      const now = audioCtx.currentTime;
      soundGainNode.gain.cancelScheduledValues(now);
      soundGainNode.gain.setValueAtTime(soundGainNode.gain.value, now);
      soundGainNode.gain.linearRampToValueAtTime(soundMasterVolume * 1.0, now + 0.45);
    } catch (e) {
      console.warn('[Audio] restoreAmbientVolume error:', e);
    }
  }
  if (activeUserAudio) {
    try { activeUserAudio.volume = Math.max(0, Math.min(1, soundMasterVolume * 0.7)); } catch (e) { console.warn('[Audio] restore activeUserAudio error:', e); }
  }
}

// Sanfter, gleitender Lautstärke-Fade-Out am Sitzungsende
function fadeOutAmbientSound(durationSeconds = 4.5) {
  if (soundGainNode && audioCtx) {
    try {
      const now = audioCtx.currentTime;
      soundGainNode.gain.setValueAtTime(soundGainNode.gain.value, now);
      soundGainNode.gain.linearRampToValueAtTime(0.0001, now + durationSeconds);
    } catch (e) {
      console.warn('[Audio] Fade-Out Fehler:', e);
    }
  }
  if (activeUserAudio) {
    let steps = 25;
    let stepTime = (durationSeconds * 1000) / steps;
    let currentVol = activeUserAudio.volume;
    let volStep = currentVol / steps;
    let fadeInterval = setInterval(() => {
      if (activeUserAudio && activeUserAudio.volume > volStep) {
        activeUserAudio.volume -= volStep;
      } else {
        clearInterval(fadeInterval);
        try { if (activeUserAudio) activeUserAudio.pause(); } catch (e) { console.warn('[Audio] fadeOut activeUserAudio.pause error:', e); }
      }
    }, stepTime);
  }
  
  setTimeout(() => {
    stopAmbientSound(true); 
  }, durationSeconds * 1000 + 100);
}

// Fröhliche Dur-Erfolgs-Jingles (C-Dur / F-Dur / G-Dur Arpeggios mit glockenreinem Kalimba- / Marimba-Charakter)
function playCheerfulSuccessJingle() {
  initAudioContext();
  if (!audioCtx || isPlayerMuted) return;
  try {
    const now = audioCtx.currentTime;
    // Harmonische Dur-Akkordfolgen zur Auswahl
    const chordProgressions = [
      [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6 (C-Dur)
      [587.33, 739.99, 880.00, 1174.66], // D5, F#5, A5, D6 (D-Dur)
      [698.46, 880.00, 1046.50, 1396.91], // F5, A5, C6, F6 (F-Dur)
      [783.99, 987.77, 1174.66, 1567.98]  // G5, B5, D6, G6 (G-Dur)
    ];
    const notes = chordProgressions[Math.floor(Math.random() * chordProgressions.length)];
    
    notes.forEach((freq, i) => {
      const startTime = now + (i * 0.065);
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      const vol = 0.22 * (soundMasterVolume || 0.5);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.5);
      osc.onended = () => {
        try { osc.disconnect(); } catch (e) {}
        try { gain.disconnect(); } catch (e) {}
      };
    });
  } catch (e) {
    console.warn('[Audio] playCheerfulSuccessJingle warning:', e);
  }
}

// ============================================================================
// NOODLE INTERACTIVE UI SOUNDS (Pleasant Short Nature & Game Sound Effects)
// ============================================================================

// ============================================================================
// 🎮 MEGA GAME & NATURE PROCEDURAL SOUND ENGINE (30+ Playful Procedural Sounds)
// ============================================================================

let lastUiSoundTime = 0;
let uiSoundIndex = 0;
let lastPlayedSoundKey = '';

// Helper to get consistent audio destination
function getUiAudioDest() {
  if (!audioCtx) return null;
  return (typeof getMasterAudioDestination === 'function') ? (getMasterAudioDestination() || audioCtx.destination) : audioCtx.destination;
}

// 30+ Playful Game & Delightful UI Sound Synthesizers
function playGameSound(type) {
  initAudioContext();
  if (!audioCtx || isPlayerMuted) return;
  const now = audioCtx.currentTime;
  const dest = getUiAudioDest();
  if (!dest) return;
  const masterVol = Math.min(0.6, (soundMasterVolume || 0.5) * 0.42);

  const ALL_GAME_SOUNDS = [
    'coin', 'gem', 'boing', 'pop', 'bloop', 'squeak', 'powerup', 'jump',
    'laser', 'sparkle', 'marimba', 'xylophone', 'robot', 'cork_pop',
    'snack', 'bell', 'pebble', 'whistle', 'arcade_blip', 'bamboo',
    'chirp', 'victory_pip', 'waterdrop', 'soft_click', 'bubble_double',
    'glockenspiel', 'drum_pop', 'star_ping', 'rubber_duck', 'wobble'
  ];

  let soundType = type;
  if (!soundType || soundType === 'random') {
    // Pick random without immediate repeat
    const pool = ALL_GAME_SOUNDS.filter(s => s !== lastPlayedSoundKey);
    soundType = pool[Math.floor(Math.random() * pool.length)] || 'coin';
  }
  lastPlayedSoundKey = soundType;

  try {
    switch (soundType) {
      // 1. Mario-style arcade coin (B5 -> E6)
      case 'coin': {
        const notes = [987.77, 1318.51];
        notes.forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const t = now + (i * 0.042);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(masterVol * 0.55, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t);
          osc.stop(t + 0.15);
          osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        });
        break;
      }

      // 2. Shiny Gem Twinkle (E6 -> G#6 -> B6)
      case 'gem': {
        const notes = [1318.51, 1661.22, 1975.53];
        notes.forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const t = now + (i * 0.03);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(masterVol * 0.45, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t);
          osc.stop(t + 0.13);
          osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        });
        break;
      }

      // 3. Comic Cartoon Boing (spring pitch bounce)
      case 'boing': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.16);

        gain.gain.setValueAtTime(masterVol * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.19);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 4. Snappy Soap Bubble Pop
      case 'pop':
      case 'menu_pop': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(1180, now + 0.025);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(masterVol * 0.65, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.07);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 5. Liquid Cartoon Bloop
      case 'bloop': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(920, now + 0.05);

        gain.gain.setValueAtTime(masterVol * 0.55, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.075);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 6. Squeaky Toy Squeak
      case 'squeak':
      case 'rubber_duck': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.linearRampToValueAtTime(1650, now + 0.035);
        osc.frequency.linearRampToValueAtTime(1320, now + 0.07);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(masterVol * 0.45, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.085);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 7. Ascending Powerup Arpeggio (C5 -> E5 -> G5 -> C6)
      case 'powerup':
      case 'pip_up': {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const t = now + (i * 0.028);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(masterVol * 0.45, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t);
          osc.stop(t + 0.09);
          osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        });
        break;
      }

      // 8. 8-Bit Jump Sound
      case 'jump':
      case 'jump_blip': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.055);

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, now);

        gain.gain.setValueAtTime(masterVol * 0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.065);
        osc.onended = () => { try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 9. Retro Laser Blip
      case 'laser':
      case 'laser_blip': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1750, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.045);

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now);

        gain.gain.setValueAtTime(masterVol * 0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.055);
        osc.onended = () => { try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 10. Star Sparkle Cascade
      case 'sparkle':
      case 'star': {
        const notes = [783.99, 1046.50, 1318.51, 1567.98];
        notes.forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const t = now + (i * 0.022);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(masterVol * 0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t);
          osc.stop(t + 0.1);
          osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        });
        break;
      }

      // 11. Warm Wooden Marimba Hit (Pentatonic scale)
      case 'marimba': {
        const pitches = [440, 523.25, 587.33, 659.25, 783.99, 880];
        const pitch = pitches[Math.floor(Math.random() * pitches.length)];
        const osc = audioCtx.createOscillator();
        const filter = audioCtx.createBiquadFilter();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(pitch, now);
        osc.frequency.exponentialRampToValueAtTime(pitch * 0.6, now + 0.04);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(pitch * 1.5, now);
        filter.Q.setValueAtTime(3.0, now);

        gain.gain.setValueAtTime(masterVol * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.09);
        osc.onended = () => { try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 12. Bright Xylophone Strike
      case 'xylophone': {
        const pitches = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
        const pitch = pitches[Math.floor(Math.random() * pitches.length)];
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, now);

        gain.gain.setValueAtTime(masterVol * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.12);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 13. R2D2 Cute Robot Chirp
      case 'robot': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.setValueAtTime(1800, now + 0.02);
        osc.frequency.setValueAtTime(900, now + 0.04);
        osc.frequency.setValueAtTime(1500, now + 0.06);

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, now);

        gain.gain.setValueAtTime(masterVol * 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.085);
        osc.onended = () => { try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 14. Champagne Cork Pop
      case 'cork_pop':
      case 'menu_close': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(masterVol * 0.65, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.06);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 15. Cute Snack / Nibble Pip
      case 'snack': {
        [0, 0.025].forEach((offset, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const t = now + offset;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(idx === 0 ? 880 : 1200, t);
          osc.frequency.exponentialRampToValueAtTime(400, t + 0.02);

          gain.gain.setValueAtTime(masterVol * 0.45, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t);
          osc.stop(t + 0.03);
          osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        });
        break;
      }

      // 16. Hotel Service Bell Ting
      case 'bell': {
        const osc = audioCtx.createOscillator();
        const oscHarmonic = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2093.00, now); // C7
        oscHarmonic.type = 'sine';
        oscHarmonic.frequency.setValueAtTime(4186.01, now); // C8

        gain.gain.setValueAtTime(masterVol * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

        osc.connect(gain);
        oscHarmonic.connect(gain);
        gain.connect(dest);
        osc.start(now);
        oscHarmonic.start(now);
        osc.stop(now + 0.22);
        oscHarmonic.stop(now + 0.22);
        osc.onended = () => { try { osc.disconnect(); oscHarmonic.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 17. Smooth Zen Stone / Pebble Click
      case 'pebble': {
        [1950, 2680].forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.004);
          gain.gain.setValueAtTime(masterVol * 0.35, now + idx * 0.004);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035 + idx * 0.004);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now + idx * 0.004);
          osc.stop(now + 0.045);
          osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        });
        break;
      }

      // 18. Slide Whistle Up
      case 'whistle': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(550, now);
        osc.frequency.exponentialRampToValueAtTime(1450, now + 0.07);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(masterVol * 0.4, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.085);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 19. Nintendo Select Blip
      case 'arcade_blip': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1760, now + 0.018);

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);

        gain.gain.setValueAtTime(masterVol * 0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.045);
        osc.onended = () => { try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 20. Resonant Bamboo Woodblock
      case 'bamboo': {
        const osc = audioCtx.createOscillator();
        const filter = audioCtx.createBiquadFilter();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(820, now);
        filter.Q.setValueAtTime(4.0, now);

        gain.gain.setValueAtTime(masterVol * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.05);
        osc.onended = () => { try { osc.disconnect(); filter.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 21. Bird Tweet
      case 'chirp':
      case 'bird_chirp': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2800, now);
        osc.frequency.linearRampToValueAtTime(3600, now + 0.025);
        osc.frequency.exponentialRampToValueAtTime(2950, now + 0.06);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(masterVol * 0.35, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.07);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 22. Mini Victory Triad Pip
      case 'victory_pip': {
        const notes = [659.25, 880.00, 1318.51];
        notes.forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const t = now + (i * 0.028);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(masterVol * 0.45, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t);
          osc.stop(t + 0.11);
          osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        });
        break;
      }

      // 23. Crystalline Water Droplet
      case 'waterdrop':
      case 'droplet': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.exponentialRampToValueAtTime(1520, now + 0.022);
        osc.frequency.exponentialRampToValueAtTime(1080, now + 0.07);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(masterVol * 0.55, now + 0.007);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.08);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 24. Clean Mechanical Tactile Click
      case 'soft_click':
      case 'switch_tap': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.018);

        gain.gain.setValueAtTime(masterVol * 0.55, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.025);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 25. Double Soap Bubble Pop (Pop-Pop!)
      case 'bubble_double': {
        [0, 0.038].forEach((offset, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const t = now + offset;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(idx === 0 ? 520 : 840, t);
          osc.frequency.exponentialRampToValueAtTime(idx === 0 ? 1100 : 1600, t + 0.02);

          gain.gain.setValueAtTime(masterVol * 0.5, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t);
          osc.stop(t + 0.05);
          osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        });
        break;
      }

      // 26. Pure Glockenspiel Chime
      case 'glockenspiel': {
        const pitches = [1318.51, 1567.98, 1760.00, 2093.00];
        const pitch = pitches[Math.floor(Math.random() * pitches.length)];
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, now);

        gain.gain.setValueAtTime(masterVol * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.18);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 27. Funky Drum Pop / Rim Tick
      case 'drum_pop': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.035);

        gain.gain.setValueAtTime(masterVol * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.045);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 28. High Star Ping
      case 'star_ping': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2637.02, now); // E7

        gain.gain.setValueAtTime(masterVol * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.14);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      // 29. Comic Jelly Wobble
      case 'wobble': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.linearRampToValueAtTime(460, now + 0.025);
        osc.frequency.linearRampToValueAtTime(340, now + 0.05);
        osc.frequency.linearRampToValueAtTime(420, now + 0.075);

        gain.gain.setValueAtTime(masterVol * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.095);
        osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch(e) {} };
        break;
      }

      default: {
        // Fallback to crisp pop
        playGameSound('pop');
        break;
      }
    }
  } catch (err) {
    console.warn('[Audio] playGameSound error:', err);
  }
}

// Master Nature Sound Synthesizers (alias and backwards compatibility)
function playNatureSound(type) {
  const map = {
    waterdrop: 'waterdrop',
    droplet: 'waterdrop',
    bamboo: 'bamboo',
    woodblock: 'bamboo',
    pebble: 'pebble',
    zen_stone: 'pebble',
    bird_chirp: 'chirp',
    chirp: 'chirp',
    rain_chime: 'glockenspiel'
  };
  playGameSound(map[type] || type || 'waterdrop');
}

// Master UI sound dispatcher: plays contextual or highly-varied rotating game sounds
function playUiSound(category = 'click', specificType = null) {
  const currentTime = Date.now();
  if (currentTime - lastUiSoundTime < 30) return; // Debounce fast spam
  lastUiSoundTime = currentTime;

  if (specificType) {
    playGameSound(specificType);
    return;
  }

  // 1. Context: Opening menus, popovers, drawers
  if (category === 'menu_open' || category === 'open') {
    const openSounds = ['pop', 'bloop', 'boing', 'whistle', 'powerup', 'bubble_double'];
    const pick = openSounds[Math.floor(Math.random() * openSounds.length)];
    playGameSound(pick);
    return;
  }

  // 2. Context: Closing modals, dropdowns
  if (category === 'menu_close' || category === 'close') {
    const closeSounds = ['cork_pop', 'pebble', 'drum_pop', 'pop'];
    const pick = closeSounds[Math.floor(Math.random() * closeSounds.length)];
    playGameSound(pick);
    return;
  }

  // 3. Context: Checkbox / Task done / Quest complete
  if (category === 'task_done' || category === 'checkbox' || category === 'done') {
    const doneSounds = ['coin', 'gem', 'powerup', 'victory_pip', 'sparkle', 'star_ping'];
    const pick = doneSounds[Math.floor(Math.random() * doneSounds.length)];
    playGameSound(pick);
    return;
  }

  // 4. Context: Tabs & Navigations
  if (category === 'tab' || category === 'nav') {
    const tabSounds = ['marimba', 'xylophone', 'arcade_blip', 'robot', 'glockenspiel', 'bloop'];
    const pick = tabSounds[Math.floor(Math.random() * tabSounds.length)];
    playGameSound(pick);
    return;
  }

  // 5. Context: General Clicks - Rich variety with anti-repetition rotation
  uiSoundIndex++;
  const CLICK_PALETTE = [
    'bloop', 'marimba', 'pop', 'coin', 'xylophone',
    'bamboo', 'whistle', 'gem', 'snack', 'robot',
    'bubble_double', 'glockenspiel', 'pebble', 'boing', 'sparkle',
    'arcade_blip', 'soft_click', 'chirp', 'drum_pop', 'wobble'
  ];
  
  const pick = CLICK_PALETTE[uiSoundIndex % CLICK_PALETTE.length];
  playGameSound(pick);
}

// Helper alias for opening / closing menus
function playMenuSound(isOpen = true) {
  playUiSound(isOpen ? 'menu_open' : 'menu_close');
}

// Global Automated UI Sound Listener for all buttons & interactive controls
function initGlobalUiSounds() {
  if (typeof document === 'undefined') return;
  if (window._uiSoundsInitialized) return;
  window._uiSoundsInitialized = true;

  document.addEventListener('pointerdown', (e) => {
    const target = e.target;
    if (!target) return;

    // Check if target or ancestor is interactive
    const interactiveEl = target.closest('button, a, [role="button"], input[type="button"], input[type="submit"], input[type="checkbox"], input[type="radio"], select, .cursor-pointer, .tab-btn, .pill-btn, .modal-close-btn, .column-options-btn, .task-check-btn, [data-sound-trigger]');
    
    if (interactiveEl) {
      // Don't play if element has custom sound override (e.g. DJ pads, piano keys)
      if (interactiveEl.dataset && interactiveEl.dataset.noUiSound) return;
      if (interactiveEl.closest('#dj-sampler-pad-grid, #audio-piano-keyboard')) return;

      // If it has a specific sound trigger
      if (interactiveEl.dataset && interactiveEl.dataset.soundTrigger) {
        playUiSound(interactiveEl.dataset.soundTrigger);
        return;
      }

      // Checkbox / Task checking
      if (interactiveEl.matches('input[type="checkbox"], .task-check-btn, [aria-checked]')) {
        playUiSound('task_done');
        return;
      }

      // Tab or Navigation
      if (interactiveEl.matches('.tab-btn, [role="tab"], [id*="tab"], .nav-item, [data-nav]')) {
        playUiSound('tab');
        return;
      }

      // Modal / Menu close trigger
      const isCloseTrigger = interactiveEl.matches('[id*="close"], [aria-label*="schließen"], [aria-label*="close"], [onclick*="close"], [onclick*="toggleTerminForm(false)"], .modal-close-btn');
      if (isCloseTrigger) {
        playUiSound('menu_close');
        return;
      }

      // Modal / Menu open trigger
      const isMenuTrigger = interactiveEl.matches('[id*="menu"], [id*="popover"], [id*="dropdown"], [onclick*="toggle"], [onclick*="open"], [onclick*="Menu"], [onclick*="Modal"], [onclick*="Popover"], [onclick*="Dropdown"]');
      if (isMenuTrigger) {
        playUiSound('menu_open');
        return;
      }

      // General Button / Interactive Click
      playUiSound('click');
    }
  }, { passive: true });
}

// Global exports
window.playGameSound = playGameSound;
window.playNatureSound = playNatureSound;
window.playUiSound = playUiSound;
window.initGlobalUiSounds = initGlobalUiSounds;

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalUiSounds);
  } else {
    initGlobalUiSounds();
  }
}

window.playCheerfulSuccessJingle = playCheerfulSuccessJingle;

if (typeof window.triggerHapticFeedback !== 'function') {
  window.triggerHapticFeedback = function(pattern = [15, 30, 15]) {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      // Haptik nicht unterstützt oder geblockt
    }
  };
}

const MOOD_PRESET_NAMES = {
  deep_focus: { name: 'Deep Focus (Lofi Tape Chords)', sound: 'lofi' },
  cozy_cafe: { name: 'Cozy Café (Jazz Piano & Coffee)', sound: 'jazz_piano' },
  zen_forest: { name: 'Zen Forest (Waldvögel & Natur)', sound: 'birds' },
  energy_boost: { name: 'Energy Boost (Techno 128 BPM)', sound: 'techno' },
  cosmic_flow: { name: 'Cosmic Focus (432Hz Drone)', sound: 'space' }
};

function applyAudioMoodPreset(presetKey) {
  const preset = MOOD_PRESET_NAMES[presetKey];
  if (!preset) return;

  document.querySelectorAll('.mood-preset-card').forEach(btn => {
    btn.classList.toggle('border-purple-500/80', btn.id === `mood-btn-${presetKey}`);
    btn.classList.toggle('bg-purple-500/25', btn.id === `mood-btn-${presetKey}`);
  });

  playAmbientSound(preset.sound);
  updateAudioStudioHeader(preset.name);
  if (typeof showToast === 'function') {
    showToast(tr({
      de: `Stimmung aktiviert: ${preset.name} ✨`,
      en: `Mood active: ${preset.name} ✨`,
      fr: `Ambiance activée : ${preset.name} ✨`,
      it: `Atmosfera attivata: ${preset.name} ✨`,
      es: `Ambiente activado: ${preset.name} ✨`,
      el: `Ενεργοποιήθηκε η ατμόσφαιρα: ${preset.name} ✨`
    }));
  }
}
window.applyAudioMoodPreset = applyAudioMoodPreset;

function updateAudioStudioHeader(customTitle) {
  const titleEl = document.getElementById('audio-studio-now-playing');
  const liveBadge = document.getElementById('audio-studio-live-badge');
  const eqBars = document.getElementById('studio-eq-bars');
  
  const isPlaying = (typeof currentSoundType !== 'undefined' && currentSoundType) || 
                    (typeof activeUserAudio !== 'undefined' && activeUserAudio && !activeUserAudio.paused) || 
                    (typeof djDecks !== 'undefined' && djDecks && (djDecks.a?.isPlaying || djDecks.b?.isPlaying));
  
  if (isPlaying) {
    if (liveBadge) liveBadge.classList.remove('hidden');
    if (eqBars) eqBars.classList.add('animate-pulse');
    if (titleEl) {
      if (customTitle) {
        titleEl.textContent = '▶ ' + customTitle;
      } else if (currentSoundType) {
        const soundTitle = (typeof t === 'function' && t('sound_' + currentSoundType)) ? t('sound_' + currentSoundType) : currentSoundType.toUpperCase();
        titleEl.textContent = '▶ ' + soundTitle;
      } else if (typeof activeUserAudio !== 'undefined' && activeUserAudio && typeof playlistTracks !== 'undefined' && playlistTracks[currentTrackIndex]) {
        titleEl.textContent = '▶ ' + playlistTracks[currentTrackIndex].name;
      }
    }
  } else {
    if (liveBadge) liveBadge.classList.add('hidden');
    if (eqBars) eqBars.classList.remove('animate-pulse');
    if (titleEl) {
      titleEl.textContent = (typeof tr === 'function') 
        ? tr({ de: 'Kein Sound aktiv · Wähle einen Preset oder Track', en: 'No audio active · Choose a preset or track' }) 
        : 'Kein Sound aktiv · Wähle einen Preset oder Track';
    }
  }
  updateHeaderSoundBtnUI();
}
window.updateAudioStudioHeader = updateAudioStudioHeader;

function isAnyAudioPlaying() {
  return (typeof currentSoundType !== 'undefined' && Boolean(currentSoundType)) || 
         (typeof activeUserAudio !== 'undefined' && activeUserAudio && !activeUserAudio.paused) || 
         (typeof djDecks !== 'undefined' && djDecks && (djDecks.a?.isPlaying || djDecks.b?.isPlaying));
}
window.isAnyAudioPlaying = isAnyAudioPlaying;

function updateHeaderSoundBtnUI() {
  const btn = document.getElementById('header-btn-sound-toggle');
  const iconWrapper = document.getElementById('header-sound-icon-wrapper');
  const eqBars = document.getElementById('header-sound-eq-bars');
  const label = document.getElementById('header-sound-label');
  if (!btn) return;

  const isPlaying = isAnyAudioPlaying();
  if (isPlaying) {
    btn.className = 'h-[38px] w-[38px] p-0 border border-lime-400/80 rounded-xl bg-gradient-to-tr from-lime-600/35 to-emerald-600/35 active:scale-95 text-white flex items-center justify-center cursor-pointer transition shadow-[0_0_18px_rgba(132,204,22,0.45)] shrink-0 group/sound-btn';
    btn.title = (typeof tr === 'function') ? tr({ de: 'Sound ausschalten (Klick)', en: 'Turn sound off (Click)' }) : 'Sound ausschalten';
    if (iconWrapper) {
      iconWrapper.innerHTML = '<i data-lucide="volume-2" class="w-[18px] h-[18px] text-lime-300 animate-pulse"></i>';
    }
    if (eqBars) {
      eqBars.classList.remove('hidden');
      eqBars.classList.add('flex');
    }
    if (label) label.textContent = '';
  } else {
    btn.className = 'h-[38px] w-[38px] p-0 border border-purple-400/50 hover:border-purple-300 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 active:scale-95 text-purple-300 hover:text-white flex items-center justify-center cursor-pointer transition shadow-[0_0_14px_rgba(168,85,247,0.28)] shrink-0 group/sound-btn';
    btn.title = (typeof tr === 'function') ? tr({ de: 'Sound einschalten (Klick)', en: 'Turn sound on (Click)' }) : 'Sound einschalten';
    if (iconWrapper) {
      iconWrapper.innerHTML = '<i data-lucide="volume-x" class="w-[18px] h-[18px] text-purple-400 group-hover/sound-btn:text-purple-300 group-hover/sound-btn:scale-110 transition-transform"></i>';
    }
    if (eqBars) {
      eqBars.classList.add('hidden');
      eqBars.classList.remove('flex');
    }
    if (label) label.textContent = '';
  }
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}
window.updateHeaderSoundBtnUI = updateHeaderSoundBtnUI;

function toggleMasterSound() {
  if (isAnyAudioPlaying()) {
    if (typeof currentSoundType !== 'undefined' && currentSoundType) {
      window._lastPlayedSound = currentSoundType;
    }
    stopAllStudioAudio();
  } else {
    const soundToPlay = window._lastPlayedSound || 'lofi';
    if (typeof playAmbientSound === 'function') {
      playAmbientSound(soundToPlay);
    }
    if (typeof showToast === 'function') {
      showToast(tr({ de: 'Sound aktiviert 🔊', en: 'Sound active 🔊', fr: 'Son activé 🔊', it: 'Suono attivato 🔊', es: 'Sonido activado 🔊', el: 'Ήχος ενεργός 🔊' }));
    }
  }
  updateHeaderSoundBtnUI();
}
window.toggleMasterSound = toggleMasterSound;

function stopAllStudioAudio() {
  if (typeof stopAmbientSound === 'function') stopAmbientSound(true);
  if (typeof pauseMusicTrack === 'function') pauseMusicTrack();
  if (typeof pauseDjDeck === 'function') { pauseDjDeck('a'); pauseDjDeck('b'); }
  updateAudioStudioHeader();
  updateHeaderSoundBtnUI();
  document.querySelectorAll('.mood-preset-card').forEach(btn => {
    btn.classList.remove('border-purple-500/80', 'bg-purple-500/25');
  });
  if (typeof showToast === 'function') {
    showToast(tr({ de: 'Sound gestoppt ⏹️', en: 'Sound stopped ⏹️', fr: 'Son arrêté ⏹️', it: 'Suono interrotto ⏹️', es: 'Sonido detenido ⏹️', el: 'Ο ήχος σταμάτησε ⏹️' }));
  }
}
window.stopAllStudioAudio = stopAllStudioAudio;

function handleHeaderVolumeInput(val) {
  if (typeof setSoundVolume === 'function') setSoundVolume(val);
  if (typeof setMusicPlayerVolume === 'function') setMusicPlayerVolume(val);
  const numVal = `${Math.round(val * 100)}`;
  const percentEl = document.getElementById('header-sound-volume-percent');
  if (percentEl) {
    percentEl.textContent = numVal;
  }
  const studioPctEl = document.getElementById('audio-panel-master-volume-pct');
  if (studioPctEl) {
    studioPctEl.textContent = `${numVal}%`;
  }
  document.querySelectorAll('.master-volume-slider').forEach(s => {
    if (s.value !== val) s.value = val;
  });
  const headerSlider = document.getElementById('header-sound-volume-slider');
  if (headerSlider && headerSlider.value !== val) headerSlider.value = val;
  const studioSlider = document.getElementById('audio-panel-master-volume-slider');
  if (studioSlider && studioSlider.value !== val) studioSlider.value = val;
}
window.handleHeaderVolumeInput = handleHeaderVolumeInput;
window.handleStudioMasterVolume = handleHeaderVolumeInput;

let soundHoverSliderTimer = null;
let soundVolumePinned = false;

function showSoundHoverSlider() {
  if (typeof window !== 'undefined' && window.NoodleInteractionMode && typeof window.NoodleInteractionMode.getMode === 'function') {
    if (window.NoodleInteractionMode.getMode() === 'click-only') return;
  }
  if (soundHoverSliderTimer) {
    clearTimeout(soundHoverSliderTimer);
    soundHoverSliderTimer = null;
  }
  const popover = document.getElementById('header-sound-volume-popover');
  if (popover) {
    popover.classList.remove('hidden');
    popover.classList.add('flex');
    if (!soundVolumePinned) {
      popover.classList.add('noodle-panel-peeking');
      popover.classList.remove('noodle-panel-pinned');
    }
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }
}
window.showSoundHoverSlider = showSoundHoverSlider;

function hideSoundHoverSlider(delay = 350) {
  if (soundVolumePinned) return;
  if (soundHoverSliderTimer) {
    clearTimeout(soundHoverSliderTimer);
  }
  soundHoverSliderTimer = setTimeout(() => {
    if (soundVolumePinned) return;
    const popover = document.getElementById('header-sound-volume-popover');
    const container = document.getElementById('header-btn-sound-container');
    try {
      if (popover && popover.matches(':hover')) return;
      if (container && container.matches(':hover')) return;
    } catch (e) {}
    if (popover) {
      popover.classList.add('hidden');
      popover.classList.remove('flex', 'noodle-panel-peeking', 'noodle-panel-pinned');
    }
  }, delay);
}
window.hideSoundHoverSlider = hideSoundHoverSlider;

function toggleSoundVolumePopover(event) {
  if (event) event.stopPropagation();
  const popover = document.getElementById('header-sound-volume-popover');
  if (!popover) return;

  if (popover.classList.contains('hidden')) {
    soundVolumePinned = true;
    popover.classList.remove('hidden', 'noodle-panel-peeking');
    popover.classList.add('flex', 'noodle-panel-pinned');
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  } else if (!soundVolumePinned) {
    soundVolumePinned = true;
    popover.classList.remove('noodle-panel-peeking');
    popover.classList.add('noodle-panel-pinned');
  } else {
    soundVolumePinned = false;
    popover.classList.add('hidden');
    popover.classList.remove('flex', 'noodle-panel-peeking', 'noodle-panel-pinned');
  }
}
window.toggleSoundVolumePopover = toggleSoundVolumePopover;

document.addEventListener('pointerdown', (e) => {
  const popover = document.getElementById('header-sound-volume-popover');
  const container = document.getElementById('header-btn-sound-container');
  if (popover && !popover.classList.contains('hidden')) {
    if (popover.contains(e.target) || (container && container.contains(e.target))) {
      soundVolumePinned = true;
      popover.classList.remove('noodle-panel-peeking');
      popover.classList.add('noodle-panel-pinned');
      return;
    }
    soundVolumePinned = false;
    popover.classList.add('hidden');
    popover.classList.remove('flex', 'noodle-panel-peeking', 'noodle-panel-pinned');
  }
}, { passive: true });

function toggleAudioTimerSync(enabled) {
  try {
    localStorage.setItem('flow_audio_timer_sync', enabled ? 'true' : 'false');
    if (typeof showToast === 'function') {
      showToast(enabled 
        ? tr({ de: 'Timer-Sync aktiviert: Sound startet & pausiert automatisch mit dem Fokus-Timer ⏱️', en: 'Timer-Sync active: Sound starts & pauses with focus timer ⏱️' })
        : tr({ de: 'Timer-Sync deaktiviert', en: 'Timer-Sync disabled' })
      );
    }
  } catch (e) {}
}
window.toggleAudioTimerSync = toggleAudioTimerSync;

function updateSoundscapeUI() {
  const sounds = [
    'piano', 'lofi', 'chimes', 'space', 'guitar', 'singingbowl', 'musicbox',
    'breeze', 'campfire', 'birds', 'cafe', 'clock', 'lofi_sunshine', 'summer_meadow',
    'bossa_nova', 'techno', 'dnb', 'afrobeats', 'swing', 'boombap', 'synthwave', 'house', 'trap', 'chillstep', 'phonk', 'jazz_piano', 'rhodes', 'hypnotic_riff'
  ];
  sounds.forEach(st => {
    const btn = document.getElementById("sound-btn-" + st);
    if (btn) {
      if (typeof currentSoundType !== 'undefined' && st === currentSoundType) {
        btn.className = 'p-1.5 bg-purple-500/30 border border-purple-400 rounded-xl text-left transition cursor-pointer flex items-center gap-1.5 min-w-0 h-8.5 shadow-[0_0_12px_rgba(168,85,247,0.3)] animate-pulse';
      } else {
        btn.className = 'p-1.5 bg-white/5 hover:bg-purple-500/20 border border-white/10 rounded-xl text-left transition cursor-pointer flex items-center gap-1.5 min-w-0 h-8.5';
      }
    }
  });
  const indicator = document.getElementById('soundscape-indicator');
  const dockSoundBadge = document.getElementById('dock-sound-active-badge');
  const isAudioActive = (typeof currentSoundType !== 'undefined' && Boolean(currentSoundType)) || (typeof isBeatPlaying !== 'undefined' && Boolean(isBeatPlaying));
  if (indicator) {
    if (isAudioActive) indicator.classList.remove('hidden');
    else indicator.classList.add('hidden');
  }
  if (dockSoundBadge) {
    if (isAudioActive) dockSoundBadge.classList.remove('hidden');
    else dockSoundBadge.classList.add('hidden');
  }
  updateAudioStudioHeader();
  updateHeaderSoundBtnUI();
}

function updateMediaSession(title, artist = 'Noodle Focus', album = 'Focus Sound Studio') {
  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
    try {
      if (typeof MediaMetadata !== 'undefined') {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: title || 'Noodle Focus Sound',
          artist: artist,
          album: album,
          artwork: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
          ]
        });
      }

      navigator.mediaSession.setActionHandler('play', () => {
        if (typeof toggleMasterSound === 'function') toggleMasterSound();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (typeof stopAllSounds === 'function') stopAllSounds();
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        if (typeof stopAllSounds === 'function') stopAllSounds();
      });
    } catch (e) {
      // MediaSession fallback
    }
  }
}

function stopAllSounds() {
  if (typeof stopAllStudioAudio === 'function') stopAllStudioAudio();
  if (typeof stopAmbientSound === 'function') stopAmbientSound(true);
  if (typeof stopLoFiBeats === 'function') stopLoFiBeats();
  if (typeof stopBeatSequencer === 'function') stopBeatSequencer();
  if (typeof RadioNewsEngine !== 'undefined') {
    if (typeof RadioNewsEngine.toggleRadioPlayback === 'function' && window.isRadioPlaying) {
      RadioNewsEngine.toggleRadioPlayback();
    }
    if (typeof RadioNewsEngine.stopNewsReader === 'function') {
      RadioNewsEngine.stopNewsReader();
    }
  }
  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
    try {
      navigator.mediaSession.playbackState = 'none';
    } catch (e) {}
  }
}

if (typeof document !== 'undefined') {
  const initAudioStudioUI = () => {
    const syncCheckbox = document.getElementById('audio-timer-sync-toggle');
    if (syncCheckbox) {
      syncCheckbox.checked = localStorage.getItem('flow_audio_timer_sync') === 'true';
    }
    updateAudioStudioHeader();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAudioStudioUI);
  } else {
    initAudioStudioUI();
  }
}

if (typeof window !== 'undefined') {
  window.audioCtx = audioCtx;
  window.DEFAULT_PRELOADED_TRACKS = DEFAULT_PRELOADED_TRACKS;
  window.playlistTracks = playlistTracks;
  window.currentTrackIndex = currentTrackIndex;
  window.activeUserAudio = activeUserAudio;
  window.isPlayerShuffleEnabled = isPlayerShuffleEnabled;
  window.playerRepeatMode = playerRepeatMode;
  window.soundMasterVolume = soundMasterVolume;
  window.getMasterAudioDestination = getMasterAudioDestination;
  window.initAudioContext = initAudioContext;
  window.playCheerfulSuccessJingle = playCheerfulSuccessJingle;
  window.triggerHapticFeedback = triggerHapticFeedback;
  window.updateSoundscapeUI = updateSoundscapeUI;

  window.isAmbientLayerActive = isAmbientLayerActive;
  window.getAmbientLayerVolume = getAmbientLayerVolume;
  window.setAmbientLayerVolume = setAmbientLayerVolume;
  window.toggleAmbientLayer = toggleAmbientLayer;
  window.stopAllAmbientLayers = stopAllAmbientLayers;
  window.applySoundMixPreset = applySoundMixPreset;
  window.toggleBinauralBeat = toggleBinauralBeat;
  window.setBinauralVolume = setBinauralVolume;
  window.updateMixerUI = updateMixerUI;

  window.applyAudioMoodPreset = applyAudioMoodPreset;
  window.updateAudioStudioHeader = updateAudioStudioHeader;
  window.stopAllStudioAudio = stopAllStudioAudio;
  window.stopAllSounds = stopAllSounds;
  window.updateMediaSession = updateMediaSession;
  window.toggleAudioTimerSync = toggleAudioTimerSync;
  window.toggleMasterSound = toggleMasterSound;
  window.isAnyAudioPlaying = isAnyAudioPlaying;
  window.updateHeaderSoundBtnUI = updateHeaderSoundBtnUI;
  window.playNatureSound = playNatureSound;
  window.playGameSound = playGameSound;
  window.playUiSound = playUiSound;
  window.playMenuSound = playMenuSound;
}
if (typeof globalThis !== 'undefined') {
  globalThis.audioCtx = audioCtx;
  globalThis.DEFAULT_PRELOADED_TRACKS = DEFAULT_PRELOADED_TRACKS;
  globalThis.playlistTracks = playlistTracks;
  globalThis.currentTrackIndex = currentTrackIndex;
  globalThis.activeUserAudio = activeUserAudio;
  globalThis.isPlayerShuffleEnabled = isPlayerShuffleEnabled;
  globalThis.playerRepeatMode = playerRepeatMode;
  globalThis.soundMasterVolume = soundMasterVolume;
  globalThis.getMasterAudioDestination = getMasterAudioDestination;
  globalThis.initAudioContext = initAudioContext;
  globalThis.playCheerfulSuccessJingle = playCheerfulSuccessJingle;
  globalThis.triggerHapticFeedback = triggerHapticFeedback;
  globalThis.updateSoundscapeUI = updateSoundscapeUI;

  globalThis.isAmbientLayerActive = isAmbientLayerActive;
  globalThis.getAmbientLayerVolume = getAmbientLayerVolume;
  globalThis.setAmbientLayerVolume = setAmbientLayerVolume;
  globalThis.toggleAmbientLayer = toggleAmbientLayer;
  globalThis.stopAllAmbientLayers = stopAllAmbientLayers;
  globalThis.applySoundMixPreset = applySoundMixPreset;
  globalThis.toggleBinauralBeat = toggleBinauralBeat;
  globalThis.setBinauralVolume = setBinauralVolume;
  globalThis.updateMixerUI = updateMixerUI;

  globalThis.applyAudioMoodPreset = applyAudioMoodPreset;
  globalThis.updateAudioStudioHeader = updateAudioStudioHeader;
  globalThis.stopAllStudioAudio = stopAllStudioAudio;
  globalThis.stopAllSounds = stopAllSounds;
  globalThis.updateMediaSession = updateMediaSession;
  globalThis.toggleAudioTimerSync = toggleAudioTimerSync;
  globalThis.toggleMasterSound = toggleMasterSound;
  globalThis.isAnyAudioPlaying = isAnyAudioPlaying;
  globalThis.updateHeaderSoundBtnUI = updateHeaderSoundBtnUI;
  globalThis.playNatureSound = playNatureSound;
  globalThis.playGameSound = playGameSound;
  globalThis.playUiSound = playUiSound;
  globalThis.playMenuSound = playMenuSound;
}

