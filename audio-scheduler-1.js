// audio-scheduler-1.js: Sound-Scheduler fuer sanfte Melodien, Piano, Lofi, Chimes, Klangschalen, Spieluhr & Akustik-Gitarre

// -------------------------------------------------------------
// 1. SANFTES PIANO (PENTATONISCHE NEO-KLASSIK HARMONIEN)
// -------------------------------------------------------------
const PIANO_PENTATONIC = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.00  // A5
];

function scheduleGentlePianoMelody() {
  if (currentSoundType !== 'piano') return;
  const delay = 1400 + Math.random() * 2200; // Ruhiger Atem-Rhythmus
  const timeout = setTimeout(() => {
    if (currentSoundType !== 'piano') return;
    
    // Gelegentlich 2-Klang-Akkord, sonst zarter Einzelton
    const note1 = PIANO_PENTATONIC[Math.floor(Math.random() * PIANO_PENTATONIC.length)];
    playGentlePianoNote(note1, (Math.random() * 1.2 - 0.6));
    
    if (Math.random() > 0.65) {
      const t2 = setTimeout(() => {
        if (currentSoundType !== 'piano') return;
        const note2 = PIANO_PENTATONIC[Math.floor(Math.random() * PIANO_PENTATONIC.length)];
        playGentlePianoNote(note2, (Math.random() * 1.2 - 0.6));
      }, 180 + Math.random() * 250);
      activeTimeouts.push(t2);
    }

    scheduleGentlePianoMelody();
  }, delay);
  activeTimeouts.push(timeout);
}

function playGentlePianoNote(freq, pan = 0) {
  if (!audioCtx || currentSoundType !== 'piano') return;
  const now = audioCtx.currentTime;

  // Grundton (Sine) + Oberton (Triangle) für warmen, echten Rhodes/Piano-Klang
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, now);

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 2, now); // Sanfte Oktave

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);
  filter.frequency.exponentialRampToValueAtTime(250, now + 2.5);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.025); // Sehr weicher Anschlag
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0); // Langer Nachhall

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);

  if (audioCtx.createStereoPanner) {
    const panner = audioCtx.createStereoPanner();
    panner.pan.setValueAtTime(pan, now);
    gain.connect(panner);
    panner.connect(soundGainNode);
  } else {
    gain.connect(soundGainNode);
  }

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 3.2);
  osc2.stop(now + 3.2);
}

// -------------------------------------------------------------
// 2. LOFI TAPE CHORDS (WARME JAZZ-7TH AKKORDE)
// -------------------------------------------------------------
const LOFI_PROGRESSIONS = [
  [174.61, 220.00, 261.63, 329.63], // Fmaj7
  [164.81, 196.00, 246.94, 293.66], // Em7
  [146.83, 174.61, 220.00, 261.63], // Dm7
  [130.81, 164.81, 196.00, 246.94]  // Cmaj7
];
let lofiChordIndex = 0;

function scheduleLofiTapeChords() {
  if (currentSoundType !== 'lofi') return;
  const chord = LOFI_PROGRESSIONS[lofiChordIndex % LOFI_PROGRESSIONS.length];
  lofiChordIndex++;

  playLofiChord(chord);

  const timeout = setTimeout(() => {
    scheduleLofiTapeChords();
  }, 4800);
  activeTimeouts.push(timeout);
}

function playLofiChord(notes) {
  if (!audioCtx || currentSoundType !== 'lofi') return;
  const now = audioCtx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Warmes Tape-Gefühl mit Tiefpassfilter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, now);

    // Gestaffelter, sanfter Arpeggio-Einsatz
    const stagger = idx * 0.04;
    gain.gain.setValueAtTime(0, now + stagger);
    gain.gain.linearRampToValueAtTime(0.12 / notes.length, now + stagger + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(soundGainNode);

    osc.start(now + stagger);
    osc.stop(now + 4.7);
  });
}

// -------------------------------------------------------------
// 3. ZEN WINDSPIEL (METALL & BAMBUS GLOCKENSPIEL)
// -------------------------------------------------------------
const CHIME_FREQS = [880.00, 987.77, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00];

function scheduleZenWindChimes() {
  if (currentSoundType !== 'chimes') return;
  const delay = 1200 + Math.random() * 2600;
  const timeout = setTimeout(() => {
    if (currentSoundType !== 'chimes') return;
    playZenWindChime();
    scheduleZenWindChimes();
  }, delay);
  activeTimeouts.push(timeout);
}

function playZenWindChime() {
  if (!audioCtx || currentSoundType !== 'chimes') return;
  const now = audioCtx.currentTime;
  const freq = CHIME_FREQS[Math.floor(Math.random() * CHIME_FREQS.length)];

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(freq, now);
  filter.Q.setValueAtTime(20, now); // Kristallklar resonierend

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.16, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

  osc.connect(filter);
  filter.connect(gain);

  if (audioCtx.createStereoPanner) {
    const panner = audioCtx.createStereoPanner();
    panner.pan.setValueAtTime(Math.random() * 1.6 - 0.8, now);
    gain.connect(panner);
    panner.connect(soundGainNode);
  } else {
    gain.connect(soundGainNode);
  }

  osc.start(now);
  osc.stop(now + 4.0);
}

// -------------------------------------------------------------
// 4. TIBETISCHE KLANGSCHALE (SINGING BOWL)
// -------------------------------------------------------------
function scheduleSingingBowls() {
  if (currentSoundType !== 'singingbowl') return;
  playSingingBowl();
  const delay = 8000 + Math.random() * 4000;
  const timeout = setTimeout(() => {
    scheduleSingingBowls();
  }, delay);
  activeTimeouts.push(timeout);
}

function playSingingBowl() {
  if (!audioCtx || currentSoundType !== 'singingbowl') return;
  const now = audioCtx.currentTime;
  const baseFreq = 216.0; // 432Hz Sub-Harmonische

  const freqs = [baseFreq, baseFreq * 2.76, baseFreq * 5.4]; // Echte Klangschalen-Harmonik
  freqs.forEach((f, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    // Leichte 1.5Hz Schwebung
    osc.frequency.setValueAtTime(f + (i === 0 ? 0.8 : 0), now);

    const amp = (0.2 / (i + 1));
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(amp, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 7.5);

    osc.connect(gain);
    gain.connect(soundGainNode);

    osc.start(now);
    osc.stop(now + 8.0);
  });
}

// -------------------------------------------------------------
// 5. SPIELUHR / CELESTIAL MUSIC BOX
// -------------------------------------------------------------
const MUSIC_BOX_NOTES = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];

function scheduleMusicBoxLullaby() {
  if (currentSoundType !== 'musicbox') return;
  const delay = 600 + Math.random() * 1200;
  const timeout = setTimeout(() => {
    if (currentSoundType !== 'musicbox') return;
    const note = MUSIC_BOX_NOTES[Math.floor(Math.random() * MUSIC_BOX_NOTES.length)];
    playMusicBoxNote(note);
    scheduleMusicBoxLullaby();
  }, delay);
  activeTimeouts.push(timeout);
}

function playMusicBoxNote(freq) {
  if (!audioCtx || currentSoundType !== 'musicbox') return;
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

  osc.connect(gain);
  gain.connect(soundGainNode);

  osc.start(now);
  osc.stop(now + 2.4);
}

// -------------------------------------------------------------
// 6. AKUSTIK-GITARRE (WARM NYLON PLUCKS)
// -------------------------------------------------------------
const GUITAR_STRINGS = [196.00, 246.94, 293.66, 329.63, 392.00, 493.88];

function scheduleAcousticGuitarMelody() {
  if (currentSoundType !== 'guitar') return;
  const delay = 1600 + Math.random() * 2400;
  const timeout = setTimeout(() => {
    if (currentSoundType !== 'guitar') return;
    playGuitarPluck();
    scheduleAcousticGuitarMelody();
  }, delay);
  activeTimeouts.push(timeout);
}

function playGuitarPluck() {
  if (!audioCtx || currentSoundType !== 'guitar') return;
  const now = audioCtx.currentTime;
  const freq = GUITAR_STRINGS[Math.floor(Math.random() * GUITAR_STRINGS.length)];

  const osc = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(550, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(soundGainNode);

  osc.start(now);
  osc.stop(now + 2.7);
}

// -------------------------------------------------------------
// 7. KLASSIKER: KAMINFEUER, VÖGEL, CAFÉ & PENDELUHR
// -------------------------------------------------------------
function scheduleCampfireCrackles() {
  if (currentSoundType !== 'campfire') return;
  let timeout = setTimeout(() => {
    playCampfireCrack();
    scheduleCampfireCrackles();
  }, 60 + Math.random() * 300);
  activeTimeouts.push(timeout);
}

function playCampfireCrack() {
  if (!audioCtx || currentSoundType !== 'campfire') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'triangle';
  filter.type = 'bandpass';
  filter.frequency.value = 1600 + Math.random() * 2500;
  filter.Q.value = 5;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(soundGainNode);

  osc.frequency.setValueAtTime(80 + Math.random() * 180, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.03 + Math.random() * 0.03, now + 0.001); 
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.01 + Math.random() * 0.015);

  osc.start(now);
  osc.stop(now + 0.04);
}

function scheduleForestBirds() {
  if (currentSoundType !== 'birds') return;
  let timeout = setTimeout(() => {
    playBirdSinging();
    scheduleForestBirds();
  }, 2200 + Math.random() * 3500);
  activeTimeouts.push(timeout);
}

function playBirdSinging() {
  if (!audioCtx || currentSoundType !== 'birds') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  let baseFreq = 2200 + Math.random() * 700;
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.linearRampToValueAtTime(baseFreq + 500, now + 0.12);
  osc.frequency.exponentialRampToValueAtTime(baseFreq - 150, now + 0.26);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.03); 
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

  osc.connect(gain);
  gain.connect(soundGainNode);

  osc.start(now);
  osc.stop(now + 0.35);
}

function scheduleCafeCupClinks() {
  if (currentSoundType !== 'cafe') return;
  let timeout = setTimeout(() => {
    playCafeCupClink();
    scheduleCafeCupClinks();
  }, 3500 + Math.random() * 5500);
  activeTimeouts.push(timeout);
}

function playCafeCupClink() {
  if (!audioCtx || currentSoundType !== 'cafe') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(3200 + Math.random() * 600, now);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(3200, now);
  filter.Q.setValueAtTime(8, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(soundGainNode);

  osc.start(now);
  osc.stop(now + 0.25);
}

function scheduleTickTockRhythm() {
  if (currentSoundType !== 'clock') return;
  let timeout = setTimeout(() => {
    playClockTick();
    scheduleTickTockRhythm();
  }, 1000);
  activeTimeouts.push(timeout);
}

function playClockTick() {
  if (!audioCtx || currentSoundType !== 'clock') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.015);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

  osc.connect(gain);
  gain.connect(soundGainNode);

  osc.start(now);
  osc.stop(now + 0.03);
}

// -------------------------------------------------------------
// 10. LOFI SUNSHINE (WARME MAJOR-7TH & 9TH RHODES JAZZ-CHORDS)
// -------------------------------------------------------------
const LOFI_SUNSHINE_CHORDS = [
  [349.23, 440.00, 523.25, 659.25], // Fmaj7 (F4, A4, C5, E5)
  [392.00, 493.88, 587.33, 698.46], // G9 (G4, B4, D5, F5)
  [329.63, 392.00, 493.88, 587.33], // Em7 (E4, G4, B4, D5)
  [440.00, 523.25, 659.25, 783.99]  // Am7 (A4, C5, E5, G5)
];
let lofiSunshineChordIndex = 0;

function scheduleLofiSunshineMusic() {
  if (currentSoundType !== 'lofi_sunshine') return;
  const chord = LOFI_SUNSHINE_CHORDS[lofiSunshineChordIndex % LOFI_SUNSHINE_CHORDS.length];
  lofiSunshineChordIndex++;

  if (audioCtx) {
    chord.forEach((freq, idx) => {
      const t = setTimeout(() => {
        if (currentSoundType !== 'lofi_sunshine') return;
        playLofiSunshineNote(freq, (idx * 0.35) - 0.5);
      }, idx * 45);
      activeTimeouts.push(t);
    });
  }

  const timeout = setTimeout(() => {
    scheduleLofiSunshineMusic();
  }, 3200 + Math.random() * 800);
  activeTimeouts.push(timeout);
}

function playLofiSunshineNote(freq, pan = 0) {
  if (!audioCtx || currentSoundType !== 'lofi_sunshine') return;
  const now = audioCtx.currentTime;
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, now);
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 2, now);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1100, now);
  filter.frequency.exponentialRampToValueAtTime(320, now + 2.8);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(soundGainNode);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 3.3);
  osc2.stop(now + 3.3);
}

// -------------------------------------------------------------
// 11. SOMMERWIESE & VOGELSTIMMEN (SINGENDE WALDVÖGEL & SOMMERWIND)
// -------------------------------------------------------------
function scheduleSummerMeadowNature() {
  if (currentSoundType !== 'summer_meadow') return;
  const timeout = setTimeout(() => {
    if (Math.random() > 0.3) playCheerfulMeadowBirdChirp();
    scheduleSummerMeadowNature();
  }, 1200 + Math.random() * 2400);
  activeTimeouts.push(timeout);
}

function playCheerfulMeadowBirdChirp() {
  if (!audioCtx || currentSoundType !== 'summer_meadow') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const baseFreq = 2200 + Math.random() * 1200;

  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.linearRampToValueAtTime(baseFreq + 600, now + 0.05);
  osc.frequency.linearRampToValueAtTime(baseFreq - 200, now + 0.12);
  osc.frequency.linearRampToValueAtTime(baseFreq + 400, now + 0.18);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

  osc.connect(gain);
  gain.connect(soundGainNode);

  osc.start(now);
  osc.stop(now + 0.25);
}

// -------------------------------------------------------------
// 12. BOSSA NOVA VIBES (SOMMERLICHE JAZZ-GITARR-AKKORDE)
// -------------------------------------------------------------
const BOSSA_NOVA_PROGRESSION = [
  [261.63, 329.63, 392.00, 493.88], // Cmaj7
  [220.00, 261.63, 329.63, 392.00], // Am7
  [293.66, 349.23, 440.00, 523.25], // Dm7
  [196.00, 246.94, 293.66, 349.23]  // G7
];
let bossaChordIndex = 0;

function scheduleBossaNovaGuitar() {
  if (currentSoundType !== 'bossa_nova') return;
  const chord = BOSSA_NOVA_PROGRESSION[bossaChordIndex % BOSSA_NOVA_PROGRESSION.length];
  bossaChordIndex++;

  if (audioCtx) {
    chord.forEach((freq, idx) => {
      const t1 = setTimeout(() => {
        if (currentSoundType !== 'bossa_nova') return;
        playBossaNote(freq);
      }, idx * 30);
      activeTimeouts.push(t1);
    });

    const t2 = setTimeout(() => {
      if (currentSoundType !== 'bossa_nova') return;
      chord.slice(1).forEach((freq) => {
        playBossaNote(freq * 1.0, 0.7);
      });
    }, 280);
    activeTimeouts.push(t2);
  }

  const timeout = setTimeout(() => {
    scheduleBossaNovaGuitar();
  }, 1400);
  activeTimeouts.push(timeout);
}

function playBossaNote(freq, volMod = 1.0) {
  if (!audioCtx || currentSoundType !== 'bossa_nova') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1400, now);
  filter.frequency.exponentialRampToValueAtTime(450, now + 0.8);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.16 * volMod, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(soundGainNode);

  osc.start(now);
  osc.stop(now + 0.95);
}


// -------------------------------------------------------------
// 11. SCHEDULER FUER OZEAN-GISCHT, REGEN-TROPFEN & BACH-BLASEN
// -------------------------------------------------------------

function scheduleOceanSpray() {
  if (currentSoundType !== 'ocean') return;
  let timeout = setTimeout(() => {
    playOceanSpray();
    scheduleOceanSpray();
  }, 4000 + Math.random() * 5000);
  activeTimeouts.push(timeout);
}

function playOceanSpray() {
  if (!audioCtx || currentSoundType !== 'ocean') return;
  const now = audioCtx.currentTime;
  const source = audioCtx.createBufferSource();
  source.buffer = getNoiseBuffer('white');
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1800 + Math.random() * 800, now);
  filter.Q.setValueAtTime(2.0, now);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.06 + Math.random() * 0.04, now + 0.6);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(soundGainNode);

  source.start(now);
  source.stop(now + 2.3);
}

function scheduleRainDroplets() {
  if (currentSoundType !== 'rain') return;
  let timeout = setTimeout(() => {
    playRainDroplet();
    scheduleRainDroplets();
  }, 250 + Math.random() * 700);
  activeTimeouts.push(timeout);
}

function playRainDroplet() {
  if (!audioCtx || currentSoundType !== 'rain') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  const startFreq = 1600 + Math.random() * 1200;
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(startFreq * 0.4, now + 0.035);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.04 + Math.random() * 0.03, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

  osc.connect(gain);
  gain.connect(soundGainNode);

  osc.start(now);
  osc.stop(now + 0.045);
}

function scheduleStreamBubbles() {
  if (currentSoundType !== 'stream') return;
  let timeout = setTimeout(() => {
    playStreamBubble();
    scheduleStreamBubbles();
  }, 800 + Math.random() * 1600);
  activeTimeouts.push(timeout);
}

function playStreamBubble() {
  if (!audioCtx || currentSoundType !== 'stream') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  const startFreq = 600 + Math.random() * 700;
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, now + 0.06);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.06 + Math.random() * 0.04, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

  osc.connect(gain);
  gain.connect(soundGainNode);

  osc.start(now);
  osc.stop(now + 0.08);
}
