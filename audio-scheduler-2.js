/**
 * @file audio-scheduler-2.js
 * @module AudioSchedulerAtmospheric
 * @description
 * Prozedurale Klangsynthese für rhythmische und atmosphärische Umgebungen:
 * Dampflokomotive (Schienenstoß & Dampf-Filter), Retro-Arcade-Arpeggios,
 * Ambient-Gitarren-Pads und Kloster-Glocken.
 */

function scheduleTrainSteamChuffs() {
  if (currentSoundType !== 'train') return;
  let timeout = setTimeout(() => {
    playTrainChuff();
    if (Math.random() > 0.75) playTrainTrackClack();
    scheduleTrainSteamChuffs();
  }, 400); 
  activeTimeouts.push(timeout);
}

function playTrainChuff() {
  if (!audioCtx || currentSoundType !== 'train') return;
  const now = audioCtx.currentTime;
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();
  const source = audioCtx.createBufferSource();

  source.buffer = getNoiseBuffer('pink');
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(180, now);
  filter.frequency.linearRampToValueAtTime(90, now + 0.12);
  filter.Q.setValueAtTime(3.5, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.45, now + 0.015); 
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(soundGainNode);

  source.start(now);
  source.stop(now + 0.2);
}

function playTrainTrackClack() {
  if (!audioCtx || currentSoundType !== 'train') return;
  const now = audioCtx.currentTime;
  
  const playClickNode = (pitch, delay) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, now + delay);
    osc.frequency.exponentialRampToValueAtTime(25, now + delay + 0.08);
    gain.gain.setValueAtTime(0, now + delay);
    gain.gain.linearRampToValueAtTime(0.25, now + delay + 0.005); 
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.08);
    osc.connect(gain);
    gain.connect(soundGainNode);
    osc.start(now + delay);
    osc.stop(now + delay + 0.1);
  };

  playClickNode(55, 0);
  playClickNode(48, 0.07);
}

function scheduleArcadeChiptunes() {
  if (currentSoundType !== 'arcade') return;
  let timeout = setTimeout(() => {
    playArcadeBeep();
    scheduleArcadeChiptunes();
  }, 900 + Math.random() * 2000);
  activeTimeouts.push(timeout);
}

function playArcadeBeep() {
  if (!audioCtx || currentSoundType !== 'arcade') return;
  const now = audioCtx.currentTime;
  
  const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 523.25]; 
  const startPitch = notes[Math.floor(Math.random() * notes.length)];
  
  let timeOffset = 0;
  for (let i = 0; i < 5; i++) { 
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'square';
    const pitch = startPitch * (1 + (i * 0.25));
    osc.frequency.setValueAtTime(pitch, now + timeOffset);
    
    gain.gain.setValueAtTime(0, now + timeOffset);
    gain.gain.linearRampToValueAtTime(0.15, now + timeOffset + 0.005); 
    gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + 0.08);
    
    osc.connect(gain);
    gain.connect(soundGainNode);
    
    osc.start(now + timeOffset);
    osc.stop(now + timeOffset + 0.1);
    
    timeOffset += 0.08;
  }
}

function scheduleGuitarPadMelody() {
  if (currentSoundType !== 'guitarpad') return;
  let timeout = setTimeout(() => {
    playGuitarPadChord();
    scheduleGuitarPadMelody();
  }, 3500 + Math.random() * 1500);
  activeTimeouts.push(timeout);
}

function playGuitarPadChord() {
  if (!audioCtx || currentSoundType !== 'guitarpad') return;
  const now = audioCtx.currentTime;
  
  const chords = [
    [130.81, 196.00, 261.63, 329.63, 392.00, 523.25],
    [146.83, 196.00, 293.66, 392.00, 440.00, 587.33]
  ];
  const notes = chords[Math.floor(Math.random() * chords.length)];
  
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + (idx * 0.06));
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    
    gain.gain.setValueAtTime(0, now + (idx * 0.06) + 0.03); 
    gain.gain.linearRampToValueAtTime(0.2, now + (idx * 0.06) + 0.03); 
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(soundGainNode);
    
    osc.start(now);
    osc.stop(now + 4.0);
  });
}

function scheduleMonasteryElements() {
  if (currentSoundType !== 'monastery') return;
  let timeout = setTimeout(() => {
    if (Math.random() > 0.3) playZenSingingBowl();
    if (Math.random() > 0.7) playMonasteryOhmChant();
    scheduleMonasteryElements();
  }, 4000 + Math.random() * 4000);
  activeTimeouts.push(timeout);
}

function playZenSingingBowl() {
  if (!audioCtx || currentSoundType !== 'monastery') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, now);
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.02); 
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
  
  osc.connect(gain);
  gain.connect(soundGainNode);
  
  osc.start(now);
  osc.stop(now + 4.0);
}

function playMonasteryOhmChant() {
  if (!audioCtx || currentSoundType !== 'monastery') return;
  const now = audioCtx.currentTime;
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();
  
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(65.41, now);
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(130.81, now);
  
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(380, now);
  filter.Q.setValueAtTime(6, now);
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.8); 
  gain.gain.linearRampToValueAtTime(0.25, now + 2.5);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
  
  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(soundGainNode);
  
  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 4.0);
  osc2.stop(now + 4.0);
}

