// audio-generators.js: Startet die sanften Klangerzeuger & Melodie-Generatoren je nach Sound-Typ

function startAmbientGeneratorForType(type) {
  if (!audioCtx) return;

  if (type === 'piano') {
    // Sanftes, warmes generatives Piano
    scheduleGentlePianoMelody();

  } else if (type === 'lofi') {
    // Entspannte Lofi 7th-Chords & Tape-Atmosphäre
    scheduleLofiTapeChords();

  } else if (type === 'chimes') {
    // Sanftes Windspiel im Wind
    scheduleZenWindChimes();

  } else if (type === 'space') {
    // Warmer 432Hz Cosmic Synth Pad Drone
    startCosmicSpaceDrone();

  } else if (type === 'guitar') {
    // Zart gezupfte Akustik-Gitarre
    scheduleAcousticGuitarMelody();

  } else if (type === 'singingbowl') {
    // Tiefe tibetische Klangschalen mit binauralem Schwebungston
    scheduleSingingBowls();

  } else if (type === 'musicbox') {
    // Verträumte Spieluhr-Melodie
    scheduleMusicBoxLullaby();

  } else if (type === 'breeze') {
    // Warmes Blättersäuseln im Sommerwind (kein Regen/Wasser!)
    startForestBreezeSound();

  } else if (type === 'campfire') {
    // Warmes, sanftes Kaminfeuer
    const source = audioCtx.createBufferSource();
    source.buffer = getNoiseBuffer('brown');
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, audioCtx.currentTime);
    source.connect(filter);
    filter.connect(soundGainNode);
    source.start();
    activeNodes.push(source);
    scheduleCampfireCrackles();

  } else if (type === 'birds') {
    // Morgenwald mit sanfter Brise und zartem Zwitschern
    const source = audioCtx.createBufferSource();
    source.buffer = getNoiseBuffer('pink');
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, audioCtx.currentTime);
    source.connect(filter);
    filter.connect(soundGainNode);
    source.start();
    activeNodes.push(source);
    scheduleForestBirds();

  } else if (type === 'cafe') {
    // Sanftes, gemütliches Hintergrund-Café
    const source = audioCtx.createBufferSource();
    source.buffer = getNoiseBuffer('pink');
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, audioCtx.currentTime);
    source.connect(filter);
    filter.connect(soundGainNode);
    source.start();
    activeNodes.push(source);
    scheduleCafeCupClinks();

  } else if (type === 'clock') {
    // Gleichmäßiges, beruhigendes Pendel-Ticken
    scheduleTickTockRhythm();

  } else if (type === 'lofi_sunshine') {
    // Fröhliche Lofi Sunshine Chords & Vibes
    scheduleLofiSunshineMusic();

  } else if (type === 'summer_meadow') {
    // Sommerwiese mit Waldvögeln & lauer Sommerbrise
    const source = audioCtx.createBufferSource();
    source.buffer = getNoiseBuffer('pink');
    source.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, audioCtx.currentTime);
    source.connect(filter);
    filter.connect(soundGainNode);
    source.start();
    activeNodes.push(source);
    scheduleSummerMeadowNature();

  } else if (type === 'bossa_nova') {
    // Sommerliche Bossa Nova Akkorde & Rhythmus
    scheduleBossaNovaGuitar();

  } else if (type === 'techno') {
    // 128 BPM Techno Beat (4/4 Kick, Offbeat Hats, Claps & Rolling Bass)
    startBeatLookaheadLoop('techno', 128);

  } else if (type === 'dnb') {
    // 174 BPM Drum & Bass (Breakbeat, Snare Rolls & Sub Bass)
    startBeatLookaheadLoop('dnb', 174);

  } else if (type === 'synthwave') {
    // 110 BPM Synthwave / Retrowave (Gated 80s Kick, Snare, Pad Swells & Rolling Bass)
    startBeatLookaheadLoop('synthwave', 110);

  } else if (type === 'house') {
    // 124 BPM Deep House Groove (4-on-the-floor, 909 Clap, Offbeat Hat & Organ Bass)
    startBeatLookaheadLoop('house', 124);

  } else if (type === 'afrobeats') {
    // 102 BPM Afrobeats (Syncopated Log-Drum, Shaker & Rimshots)
    startBeatLookaheadLoop('afrobeats', 102);

  } else if (type === 'boombap') {
    // 92 BPM Boom-Bap Hip Hop (Punchy Kick, Snare & Dusty Hats)
    startBeatLookaheadLoop('boombap', 92);

  } else if (type === 'trap') {
    // 140 BPM Chill Trap (808 Sub Kick, Snappy Snare, Fast Hi-Hat Rolls & Bells)
    startBeatLookaheadLoop('trap', 140);

  } else if (type === 'chillstep') {
    // 90 BPM Chillstep / Downtempo (Atmospheric Pads, Heavy Slow Beat & Ambient FX)
    startBeatLookaheadLoop('chillstep', 90);

  } else if (type === 'phonk') {
    // 135 BPM Drift Phonk (Distorted 808s, Memphis Cowbell Melody & Crunchy Claps)
    startBeatLookaheadLoop('phonk', 135);

  } else if (type === 'swing') {
    // 116 BPM Swing & Jazz (Triplet Ride, Snare Ghosting & Walking Bass)
    startBeatLookaheadLoop('swing', 116);

  } else if (type === 'jazz_piano') {
    // 80 BPM Jazz Piano Akkorde (Lush 9th/11th/13th Voicings & Progressions)
    startBeatLookaheadLoop('jazz_piano', 80);

  } else if (type === 'rhodes') {
    // 75 BPM Fender Rhodes E-Piano (Vintage Bell Tines & Pan Tremolo)
    startBeatLookaheadLoop('rhodes', 75);

  } else if (type === 'hypnotic_riff') {
    // 120 BPM Hypnotic Minimalist Arpeggios & Ostinato Loops
    startBeatLookaheadLoop('hypnotic_riff', 120);
  }
}

// -------------------------------------------------------------
// SOUNDSCAPE HILFSGENERATOREN (DRONES & WINDE)
// -------------------------------------------------------------

function startCosmicSpaceDrone() {
  if (!audioCtx || currentSoundType !== 'space') return;
  const now = audioCtx.currentTime;

  const freqs = [65.4, 98.0, 130.8, 196.0]; // C2, G2, C3, G3 (harmonisch & erdend)
  const masterFilter = audioCtx.createBiquadFilter();
  masterFilter.type = 'lowpass';
  masterFilter.frequency.setValueAtTime(280, now);

  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.setValueAtTime(0.06, now); // Sehr langsames Atmen
  lfoGain.gain.setValueAtTime(90, now);
  lfo.connect(lfoGain);
  lfoGain.connect(masterFilter.frequency);
  lfo.start(now);
  activeNodes.push(lfo);

  masterFilter.connect(soundGainNode);

  freqs.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), now); // Leichte Schwebung

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18 / freqs.length, now + 3.0);

    osc.connect(gain);
    gain.connect(masterFilter);
    osc.start(now);
    activeNodes.push(osc);
  });
}

function startForestBreezeSound() {
  if (!audioCtx || currentSoundType !== 'breeze') return;
  const now = audioCtx.currentTime;

  const source = audioCtx.createBufferSource();
  source.buffer = getNoiseBuffer('pink');
  source.loop = true;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(320, now);
  filter.Q.setValueAtTime(1.8, now);

  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.setValueAtTime(0.09, now); // Sanftes Blätterschwanken
  lfoGain.gain.setValueAtTime(160, now);

  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 2.5);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(soundGainNode);

  lfo.start(now);
  source.start(now);
  activeNodes.push(lfo, source);
}

// ===== HIGH-FIDELITY AKUSTIK-FEEDBACK =====

function playTactileClickSound() {
  if (typeof initAudio === 'function') initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1400, now);
  osc.frequency.exponentialRampToValueAtTime(160, now + 0.015);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.02);
}

function playRhodesChime() {
  if (typeof initAudio === 'function') initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const chord = [523.25, 659.25, 783.99, 1046.50];

  chord.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.035);

    gain.gain.setValueAtTime(0, now + idx * 0.035);
    gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.035 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.035 + 0.75);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + idx * 0.035);
    osc.stop(now + idx * 0.035 + 0.8);
  });
}

window.playTactileClickSound = playTactileClickSound;
window.playRhodesChime = playRhodesChime;

// -------------------------------------------------------------
// 11. PREMIUM NATUR-SOUNDSCAPES: OZEAN, REGEN & WALDBACH
// -------------------------------------------------------------

function startOceanWavesSound() {
  if (!audioCtx || currentSoundType !== 'ocean') return;
  const now = audioCtx.currentTime;

  const source = audioCtx.createBufferSource();
  source.buffer = getNoiseBuffer('pink');
  source.loop = true;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(320, now);
  filter.Q.setValueAtTime(2.2, now);

  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.setValueAtTime(0.1, now);
  lfoGain.gain.setValueAtTime(220, now);
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.38, now + 2.0);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(soundGainNode);

  lfo.start(now);
  source.start(now);
  activeNodes.push(lfo, source);

  scheduleOceanSpray();
}

function startRainSound() {
  if (!audioCtx || currentSoundType !== 'rain') return;
  const now = audioCtx.currentTime;

  const source = audioCtx.createBufferSource();
  source.buffer = getNoiseBuffer('pink');
  source.loop = true;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(950, now);
  filter.Q.setValueAtTime(0.7, now);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.32, now + 2.0);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(soundGainNode);

  source.start(now);
  activeNodes.push(source);

  scheduleRainDroplets();
}

function startStreamWaterSound() {
  if (!audioCtx || currentSoundType !== 'stream') return;
  const now = audioCtx.currentTime;

  const source = audioCtx.createBufferSource();
  source.buffer = getNoiseBuffer('pink');
  source.loop = true;

  const filter1 = audioCtx.createBiquadFilter();
  filter1.type = 'bandpass';
  filter1.frequency.setValueAtTime(450, now);
  filter1.Q.setValueAtTime(1.8, now);

  const filter2 = audioCtx.createBiquadFilter();
  filter2.type = 'bandpass';
  filter2.frequency.setValueAtTime(1100, now);
  filter2.Q.setValueAtTime(2.5, now);

  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.setValueAtTime(0.4, now);
  lfoGain.gain.setValueAtTime(120, now);
  lfo.connect(lfoGain);
  lfoGain.connect(filter1.frequency);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 2.0);

  source.connect(filter1);
  source.connect(filter2);
  filter1.connect(gain);
  filter2.connect(gain);
  gain.connect(soundGainNode);

  lfo.start(now);
  source.start(now);
  activeNodes.push(lfo, source);

  scheduleStreamBubbles();
}
