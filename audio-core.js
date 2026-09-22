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
var playlistTracks = [];
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
window.playCheerfulSuccessJingle = playCheerfulSuccessJingle;

function triggerHapticFeedback(pattern = [15, 30, 15]) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    // Haptik nicht unterstützt oder geblockt
  }
}
window.triggerHapticFeedback = triggerHapticFeedback;

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
    btn.className = 'h-9 w-9 md:h-[36.5px] md:w-[36.5px] p-0 border border-purple-400/80 rounded-xl bg-purple-600/25 active:scale-95 text-white flex items-center justify-center cursor-pointer transition shadow-[0_0_16px_rgba(168,85,247,0.35)] shrink-0 group/sound-btn';
    btn.title = (typeof tr === 'function') ? tr({ de: 'Sound ausschalten (Klick)', en: 'Turn sound off (Click)' }) : 'Sound ausschalten';
    if (iconWrapper) {
      iconWrapper.innerHTML = '<i data-lucide="volume-2" class="w-4 h-4 text-purple-200 animate-pulse"></i>';
    }
    if (eqBars) {
      eqBars.classList.remove('hidden');
      eqBars.classList.add('flex');
    }
    if (label) label.textContent = '';
  } else {
    btn.className = 'h-9 w-9 md:h-[36.5px] md:w-[36.5px] p-0 border border-purple-500/30 hover:border-purple-400/60 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 active:scale-95 text-purple-200 hover:text-white flex items-center justify-center cursor-pointer transition shadow-[0_0_12px_rgba(168,85,247,0.12)] shrink-0 group/sound-btn opacity-90 hover:opacity-100';
    btn.title = (typeof tr === 'function') ? tr({ de: 'Sound einschalten (Klick)', en: 'Turn sound on (Click)' }) : 'Sound einschalten';
    if (iconWrapper) {
      iconWrapper.innerHTML = '<i data-lucide="volume-x" class="w-4 h-4 text-purple-300/80 group-hover/sound-btn:text-purple-200"></i>';
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
  const roundedPct = `${Math.round(val * 100)}%`;
  const percentEl = document.getElementById('header-sound-volume-percent');
  if (percentEl) {
    percentEl.textContent = roundedPct;
  }
  const studioPctEl = document.getElementById('audio-panel-master-volume-pct');
  if (studioPctEl) {
    studioPctEl.textContent = roundedPct;
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

function showSoundHoverSlider() {
  if (soundHoverSliderTimer) {
    clearTimeout(soundHoverSliderTimer);
    soundHoverSliderTimer = null;
  }
  const popover = document.getElementById('header-sound-volume-popover');
  if (popover) {
    popover.classList.remove('hidden');
    popover.classList.add('flex');
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }
}
window.showSoundHoverSlider = showSoundHoverSlider;

function hideSoundHoverSlider(delay = 650) {
  if (soundHoverSliderTimer) {
    clearTimeout(soundHoverSliderTimer);
  }
  soundHoverSliderTimer = setTimeout(() => {
    const popover = document.getElementById('header-sound-volume-popover');
    if (popover) {
      popover.classList.add('hidden');
      popover.classList.remove('flex');
    }
  }, delay);
}
window.hideSoundHoverSlider = hideSoundHoverSlider;

function toggleSoundVolumePopover(event) {
  if (event) event.stopPropagation();
  const popover = document.getElementById('header-sound-volume-popover');
  if (popover) {
    if (popover.classList.contains('hidden')) {
      showSoundHoverSlider();
    } else {
      hideSoundHoverSlider();
    }
  }
}
window.toggleSoundVolumePopover = toggleSoundVolumePopover;

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
    'bossa_nova', 'techno', 'dnb', 'afrobeats', 'swing', 'boombap', 'jazz_piano', 'rhodes', 'hypnotic_riff'
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
  window.applyAudioMoodPreset = applyAudioMoodPreset;
  window.updateAudioStudioHeader = updateAudioStudioHeader;
  window.stopAllStudioAudio = stopAllStudioAudio;
  window.stopAllSounds = stopAllSounds;
  window.updateMediaSession = updateMediaSession;
  window.toggleAudioTimerSync = toggleAudioTimerSync;
  window.toggleMasterSound = toggleMasterSound;
  window.isAnyAudioPlaying = isAnyAudioPlaying;
  window.updateHeaderSoundBtnUI = updateHeaderSoundBtnUI;
}
if (typeof globalThis !== 'undefined') {
  globalThis.audioCtx = audioCtx;
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
  globalThis.applyAudioMoodPreset = applyAudioMoodPreset;
  globalThis.updateAudioStudioHeader = updateAudioStudioHeader;
  globalThis.stopAllStudioAudio = stopAllStudioAudio;
  globalThis.stopAllSounds = stopAllSounds;
  globalThis.updateMediaSession = updateMediaSession;
  globalThis.toggleAudioTimerSync = toggleAudioTimerSync;
  globalThis.toggleMasterSound = toggleMasterSound;
  globalThis.isAnyAudioPlaying = isAnyAudioPlaying;
  globalThis.updateHeaderSoundBtnUI = updateHeaderSoundBtnUI;
}

