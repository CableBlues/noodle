// timer.js Teil 2/3: Klingel-/Chime-Logik & Ringing-Modal

var ringInterval = typeof ringInterval !== 'undefined' ? ringInterval : (typeof window !== 'undefined' ? window.ringInterval : null);
var ringTimeout = typeof ringTimeout !== 'undefined' ? ringTimeout : (typeof window !== 'undefined' ? window.ringTimeout : null);

function isTimerSoundActiveInChime() {
  if (typeof timerSoundEnabled !== 'undefined') return timerSoundEnabled;
  if (typeof window !== 'undefined' && typeof window.timerSoundEnabled !== 'undefined') return window.timerSoundEnabled;
  if (typeof globalThis !== 'undefined' && typeof globalThis.timerSoundEnabled !== 'undefined') return globalThis.timerSoundEnabled;
  return true;
}

function playMinuteChime() {
  if (!isTimerSoundActiveInChime()) return;
  try {
    if (typeof initAudioContext === 'function') initAudioContext();
    const ctx = typeof audioCtx !== 'undefined' ? audioCtx : (typeof window !== 'undefined' ? window.audioCtx : null);
    if (!ctx) return;
    const dest = typeof getMasterAudioDestination === 'function' ? getMasterAudioDestination() : ctx.destination;
    if (!dest) return;
    const now = ctx.currentTime;

    // 8 unterschiedliche, sanfte Klangmuster – wechseln zufällig ohne Sofort-Wiederholung
    let patternIdx;
    do {
      patternIdx = Math.floor(Math.random() * 8);
    } while (patternIdx === lastChimePatternIndex && 8 > 1);
    lastChimePatternIndex = patternIdx;

    const playTone = (freq, startAt, dur, type = 'sine', peakGain = 0.05) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + startAt);
      gainNode.gain.setValueAtTime(0, now + startAt);
      gainNode.gain.linearRampToValueAtTime(peakGain, now + startAt + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + startAt + dur);
      osc.connect(gainNode);
      gainNode.connect(dest);
      osc.start(now + startAt);
      osc.stop(now + startAt + dur + 0.05);
      if (typeof activeNodes !== 'undefined') activeNodes.push(osc);
    };

    if (patternIdx === 0) {
      // 1. Sanfte Glocke (C5 -> E5)
      playTone(523.25, 0, 1.1, 'sine', 0.045);
      playTone(659.25, 0.1, 1.0, 'sine', 0.03);
    } else if (patternIdx === 1) {
      // 2. Weicher Marimba-Pluck (G4 -> D5)
      playTone(392.00, 0, 0.6, 'triangle', 0.05);
      playTone(587.33, 0.09, 0.5, 'triangle', 0.035);
    } else if (patternIdx === 2) {
      // 3. Luftiger Funkeln-Akkord (G5 -> B5 -> D6)
      playTone(783.99, 0, 0.9, 'sine', 0.025);
      playTone(987.77, 0.05, 0.8, 'sine', 0.02);
      playTone(1174.66, 0.11, 0.7, 'sine', 0.015);
    } else if (patternIdx === 3) {
      // 4. Warmer Rhodes-Blip (A3 -> E4)
      playTone(220.00, 0, 0.8, 'sine', 0.05);
      playTone(329.63, 0.14, 0.65, 'triangle', 0.03);
    } else if (patternIdx === 4) {
      // 5. Windspiel-Flick (A5 -> C6 -> E6)
      playTone(880.00, 0, 0.5, 'sine', 0.03);
      playTone(1046.50, 0.07, 0.45, 'sine', 0.022);
      playTone(1318.51, 0.14, 0.4, 'sine', 0.016);
    } else if (patternIdx === 5) {
      // 6. Zarte Harfen-Noten (D5 -> F#5 -> A5)
      playTone(587.33, 0, 0.7, 'sine', 0.035);
      playTone(739.99, 0.08, 0.7, 'sine', 0.03);
      playTone(880.00, 0.16, 0.9, 'sine', 0.025);
    } else if (patternIdx === 6) {
      // 7. Tibetische Klangschalen-Harmonik (432Hz Resonanz)
      playTone(432.00, 0, 1.8, 'sine', 0.04);
      playTone(864.00, 0.02, 1.2, 'sine', 0.015);
    } else {
      // 8. Hauchzarte Spieluhr (E6 -> G6 -> C7)
      playTone(1318.51, 0, 0.6, 'sine', 0.025);
      playTone(1567.98, 0.09, 0.6, 'sine', 0.02);
      playTone(2093.00, 0.18, 0.8, 'sine', 0.015);
    }
  } catch (e) {
    console.error("Fehler beim Minuten-Glockenton:", e);
  }
}

// Weckruf mit prozeduralen Synthesizer-Mustern (wechselt zufällig)
function startPleasantRinging() {
  stopPleasantRinging();
  if (!isTimerSoundActiveInChime()) return;
  
  // Wechselt durch 6 sanfte Melodien
  currentEndingPatternIndex = (currentEndingPatternIndex + 1) % 6;
  const patternId = currentEndingPatternIndex;

  const playSynthPattern = () => {
    try {
      if (typeof initAudioContext === 'function') initAudioContext();
      const ctx = typeof audioCtx !== 'undefined' ? audioCtx : (typeof window !== 'undefined' ? window.audioCtx : null);
      if (!ctx) return;
      
      const dest = typeof getMasterAudioDestination === 'function' ? getMasterAudioDestination() : ctx.destination;
      if (!dest) return;
      const now = ctx.currentTime;

      if (patternId === 0) {
        // 1. Sanfter Fmaj7-Akkord (Rhodes Tape Style)
        const notes = [174.61, 220.00, 261.63, 329.63];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.12);
          
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.06, now + i * 0.12 + 0.15);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
          
          osc.connect(gainNode);
          gainNode.connect(dest);
          
          osc.start(now);
          osc.stop(now + 3.0);
          if (typeof activeNodes !== 'undefined') activeNodes.push(osc);
        });
      } else if (patternId === 1) {
        // 2. Pentatonisches Glockenspiel (G4, A4, C5, D5, E5)
        const notes = [392.00, 440.00, 523.25, 587.33, 659.25];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.05, now + i * 0.08 + 0.03);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
          
          osc.connect(gainNode);
          gainNode.connect(dest);
          
          osc.start(now);
          osc.stop(now + 1.5);
          if (typeof activeNodes !== 'undefined') activeNodes.push(osc);
        });
      } else if (patternId === 2) {
        // 3. Warmer Ambient-Pad Swell mit Filter (432Hz)
        const notes = [108.00, 216.00, 324.00, 432.00];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gainNode = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(90, now);
          filter.frequency.exponentialRampToValueAtTime(750, now + 1.2);

          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.07, now + 0.8);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

          osc.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(dest);

          osc.start(now);
          osc.stop(now + 3.0);
          if (typeof activeNodes !== 'undefined') activeNodes.push(osc);
        });
      } else if (patternId === 3) {
        // 4. Spieluhr & Celesta Arpeggios (C-Dur / F-Dur)
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          
          gainNode.gain.setValueAtTime(0, now + i * 0.1);
          gainNode.gain.linearRampToValueAtTime(0.04, now + i * 0.1 + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 1.8);
          
          osc.connect(gainNode);
          gainNode.connect(dest);
          
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 2.0);
          if (typeof activeNodes !== 'undefined') activeNodes.push(osc);
        });
      } else if (patternId === 4) {
        // 5. Tibetische Gong- & Klangschalen-Harmonie
        const notes = [216.00, 432.00, 648.00];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.06 / (i + 1), now + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
          
          osc.connect(gainNode);
          gainNode.connect(dest);
          
          osc.start(now);
          osc.stop(now + 3.6);
          if (typeof activeNodes !== 'undefined') activeNodes.push(osc);
        });
      } else {
        // 6. Zartes Neo-Klassik Piano-Motiv (Am7 / Cmaj7)
        const notes = [220.00, 261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gainNode = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.09);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, now);

          gainNode.gain.setValueAtTime(0, now + i * 0.09);
          gainNode.gain.linearRampToValueAtTime(0.05, now + i * 0.09 + 0.04);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

          osc.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(dest);

          osc.start(now + i * 0.09);
          osc.stop(now + i * 0.09 + 2.5);
          if (typeof activeNodes !== 'undefined') activeNodes.push(osc);
        });
      }
    } catch (e) {
      console.error("Synthesizer-Wiedergabefehler:", e);
    }
  };
  
  playSynthPattern();
  // Zweites kurzes Signal nach 3.5 Sekunden, danach Ton beenden (damit Sprache frei ist)
  ringInterval = setTimeout(playSynthPattern, 3500);
  
  showRingingModal();
}

// Schließt nur das Modal und stoppt den Alarmton – Timer läuft im Minus weiter
function dismissRingingModalOnly() {
  if (ringInterval) {
    clearTimeout(ringInterval);
    clearInterval(ringInterval);
    ringInterval = null;
  }
  if (ringTimeout) {
    clearTimeout(ringTimeout);
    ringTimeout = null;
  }
  hideRingingModal();
}

function stopPleasantRinging() {
  dismissRingingModalOnly();
  // Sound sofort und vollständig stoppen
  if (typeof stopAmbientSound === 'function') {
    stopAmbientSound(true);
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function showRingingModal() {
  if (document.getElementById('timer-ringing-modal')) return;
  
  const modal = document.createElement('div');
  modal.id = 'timer-ringing-modal';
  modal.className = 'fixed top-4 right-4 z-[200000] w-[calc(100%-2rem)] max-w-sm animate-bounce-short pointer-events-auto';
  
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
  
  const title = {
    de: 'Fokus-Sitzung beendet! 🎉',
    en: 'Focus Session Finished! 🎉',
    es: '¡Sesión de enfoque terminada! 🎉',
    el: 'Η συνεδρία εστίασης ολοκληρώθηκε! 🎉',
    fr: 'Session de focus terminée ! 🎉',
    it: 'Sessione di focus terminata! 🎉'
  }[lang] || 'Session Finished! 🎉';

  const initialMins = Math.floor(timerInitialSeconds / 60);
  const initialSecs = timerInitialSeconds % 60;
  const totalDurationStr = `${initialMins}:${String(initialSecs).padStart(2, '0')}`;

  const durationLabel = {
    de: `Geplante Fokusdauer: ${totalDurationStr} Min.`,
    en: `Target focus duration: ${totalDurationStr} Min.`,
    es: `Duración prevista: ${totalDurationStr} Min.`,
    el: `Προβλεπόμενη διάρκεια: ${totalDurationStr} λεπτά.`,
    fr: `Durée prévue : ${totalDurationStr} min.`,
    it: `Durata prevista: ${totalDurationStr} min.`
  }[lang] || `Focus: ${totalDurationStr}`;

  const overdueHint = {
    de: 'Timer läuft im Minus weiter',
    en: 'Timer counting in overtime',
    es: 'Temporizador en tiempo extra',
    el: 'Χρονόμετρο σε καθυστέρηση',
    fr: 'Minuteur en dépassement',
    it: 'Timer in straordinario'
  }[lang] || 'Timer counting in overtime';

  const keepWorkingText = {
    de: 'Weiterarbeiten ⏳',
    en: 'Keep working ⏳',
    es: 'Seguir trabajando ⏳',
    el: 'Συνέχιση εργασίας ⏳',
    fr: 'Continuer ⏳',
    it: 'Continua ⏳'
  }[lang] || 'Keep working ⏳';

  const stopBtnText = {
    de: 'Stoppen & Reset 🔕',
    en: 'Stop & Reset 🔕',
    es: 'Detener y reiniciar 🔕',
    el: 'Διακοπή & Επαναφορά 🔕',
    fr: 'Arrêter 🔕',
    it: 'Ferma 🔕'
  }[lang] || 'Stop & Reset 🔕';

  modal.innerHTML = `
    <div class="relative w-full bg-[#111116]/95 border border-purple-500/50 p-4 rounded-2xl shadow-[0_10px_40px_rgba(139,92,246,0.35)] backdrop-blur-xl text-center text-white flex flex-col items-center gap-3">
      <button onclick="dismissRingingModalOnly()" aria-label="Schließen (Timer läuft im Minus weiter)" class="absolute top-2.5 right-2.5 text-gray-400 hover:text-white text-sm font-bold p-1 cursor-pointer transition" title="Schließen (Timer läuft im Minus weiter)">✕</button>
      
      <div class="flex items-center gap-3 w-full pr-6 text-left">
        <div class="h-10 w-10 shrink-0 bg-purple-500/20 border border-purple-500/40 rounded-xl flex items-center justify-center text-xl animate-pulse">
          ✨
        </div>
        <div>
          <h2 class="font-display font-black text-sm text-white">${title}</h2>
          <p class="text-[10px] text-purple-300 font-bold">${durationLabel}</p>
        </div>
      </div>
      
      <div class="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-rose-400 animate-ping"></span>
          <span class="text-[10px] text-rose-300 font-medium">${overdueHint}</span>
        </div>
        <p id="ringing-live-counter" class="text-xs text-rose-300 font-black font-mono tracking-widest">-00:00</p>
      </div>

      <div class="w-full grid grid-cols-2 gap-2 pt-0.5">
        <button onclick="dismissRingingModalOnly()" class="w-full py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-[11px] font-bold rounded-xl shadow-md transition duration-150 transform active:scale-95 cursor-pointer">
          ${keepWorkingText}
        </button>
        <button onclick="stopTimer()" class="w-full py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-rose-300 border border-white/10 text-[11px] font-semibold rounded-xl transition cursor-pointer">
          ${stopBtnText}
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function hideRingingModal() {
  const modal = document.getElementById('timer-ringing-modal');
  if (modal) modal.remove();
}

if (typeof window !== 'undefined') {
  window.playMinuteChime = playMinuteChime;
  window.startPleasantRinging = startPleasantRinging;
  window.dismissRingingModalOnly = dismissRingingModalOnly;
  window.stopPleasantRinging = stopPleasantRinging;
  window.showRingingModal = showRingingModal;
  window.hideRingingModal = hideRingingModal;
}
if (typeof globalThis !== 'undefined') {
  globalThis.playMinuteChime = playMinuteChime;
  globalThis.startPleasantRinging = startPleasantRinging;
  globalThis.dismissRingingModalOnly = dismissRingingModalOnly;
  globalThis.stopPleasantRinging = stopPleasantRinging;
  globalThis.showRingingModal = showRingingModal;
  globalThis.hideRingingModal = hideRingingModal;
}


