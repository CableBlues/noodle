// timer.js Teil 3/3: Timer-Start/Stop/Pause & UI-Updates
var timerHasTriggeredZero = false;

function isTimerSoundActive() {
  if (typeof timerSoundEnabled !== 'undefined') return timerSoundEnabled;
  if (typeof window !== 'undefined' && typeof window.timerSoundEnabled !== 'undefined') return window.timerSoundEnabled;
  if (typeof globalThis !== 'undefined' && typeof globalThis.timerSoundEnabled !== 'undefined') return globalThis.timerSoundEnabled;
  return true;
}

function getAllOpenBoardTasks() {
  try {
    const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : {};
    const tasks = [];
    const colOrder = ['todo', 'prio', 'focus', 'progress', 'doing', 'warten', 'backlog'];
    const colLabels = {
      todo: 'To-Do',
      prio: '⭐ Priorität',
      focus: '🎯 Fokus',
      progress: '⚡ In Arbeit',
      doing: '⚡ In Arbeit',
      warten: '⏳ Warten',
      backlog: '📦 Backlog'
    };

    if (curItems && typeof curItems === 'object') {
      const allCols = Object.keys(curItems);
      // Sortiere Spalten nach logischer Priorität
      allCols.sort((a, b) => {
        let idxA = colOrder.indexOf(a.toLowerCase());
        let idxB = colOrder.indexOf(b.toLowerCase());
        if (idxA === -1) idxA = 99;
        if (idxB === -1) idxB = 99;
        return idxA - idxB;
      });

      allCols.forEach(colId => {
        if (colId.toLowerCase().includes('done') || colId.toLowerCase().includes('archiv')) return;
        const list = curItems[colId] || [];
        const label = colLabels[colId.toLowerCase()] || (typeof tr === 'function' ? tr(colId) : colId);
        if (Array.isArray(list)) {
          list.forEach((item, idx) => {
            const title = typeof item === 'object' ? (item.task || item.title || item.name || '') : String(item || '');
            if (title && title.trim()) {
              tasks.push({ colId, colLabel: label, index: idx, title: title.trim() });
            }
          });
        }
      });
    }
    return tasks;
  } catch (e) {
    return [];
  }
}
window.getAllOpenBoardTasks = getAllOpenBoardTasks;

function linkTaskToTimer(taskTitle, colId = null, index = null) {
  if (!taskTitle) return;
  activeTimerTask = taskTitle;
  updateActiveTimerBadge();
  updateActiveTimerLabels();
  renderTimerCockpitContent();
  if (typeof showToast === 'function') {
    showToast(`🎯 Fokus-Aufgabe: "${taskTitle}"`);
  }
}
window.linkTaskToTimer = linkTaskToTimer;

function unlinkTimerTask(event) {
  if (event) event.stopPropagation();
  activeTimerTask = null;
  updateActiveTimerBadge();
  updateActiveTimerLabels();
  renderTimerCockpitContent();
  if (typeof showToast === 'function') {
    showToast(`Fokus-Aufgabe getrennt`);
  }
}
window.unlinkTimerTask = unlinkTimerTask;

function completeActiveTimerTask(event) {
  if (event) event.stopPropagation();
  if (!activeTimerTask) return;
  const taskName = typeof activeTimerTask === 'object' ? (activeTimerTask.title || activeTimerTask.task) : activeTimerTask;
  
  try {
    const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : {};
    let found = false;
    if (curItems && typeof curItems === 'object') {
      Object.keys(curItems).forEach(colId => {
        if (found) return;
        const list = curItems[colId] || [];
        if (Array.isArray(list)) {
          list.forEach((item, idx) => {
            if (found) return;
            const title = typeof item === 'object' ? (item.task || item.title || item.name || '') : String(item || '');
            if (title.trim() === taskName.trim()) {
              found = true;
              if (typeof handleCompleteTask === 'function') {
                handleCompleteTask(colId, idx);
              }
            }
          });
        }
      });
    }
  } catch (e) {}

  activeTimerTask = null;
  updateActiveTimerBadge();
  updateActiveTimerLabels();
  renderTimerCockpitContent();
  if (typeof showToast === 'function') {
    showToast(`🎉 Aufgabe "${taskName}" erledigt!`);
  }
}
window.completeActiveTimerTask = completeActiveTimerTask;

function setTimerAudioMode(mode) {
  const currentMode = typeof timerAudioMode !== 'undefined' ? timerAudioMode : 'ambient';
  
  // Wenn der gleiche Modus noch einmal angeklickt wird (außer wenn bereits silent) -> Ausschalten / Stille
  let newMode = mode;
  if (currentMode === mode && mode !== 'silent') {
    newMode = 'silent';
  }

  timerAudioMode = newMode;
  if (typeof window !== 'undefined') window.timerAudioMode = newMode;
  if (typeof globalThis !== 'undefined') globalThis.timerAudioMode = newMode;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('flowTimerAudioMode', newMode);
  }
  
  // Alle bisherigen Sounds sofort stoppen (exklusive Wiedergabe, kein Klang-Chaos)
  try {
    if (typeof stopAmbientSound === 'function') stopAmbientSound(true);
    if (typeof stopAllStudioAudio === 'function') stopAllStudioAudio();
    if (typeof stopAllSounds === 'function') stopAllSounds();
    if (typeof RadioNewsEngine !== 'undefined') {
      if (typeof RadioNewsEngine.toggleRadioPlayback === 'function' && (window.isRadioPlaying || RadioNewsEngine.isRadioPlaying)) {
        RadioNewsEngine.toggleRadioPlayback();
      }
      if (typeof RadioNewsEngine.stopNewsReader === 'function') {
        RadioNewsEngine.stopNewsReader();
      }
    }
    if (typeof window !== 'undefined' && window.radioAudioEl && !window.radioAudioEl.paused) {
      window.radioAudioEl.pause();
    }
    if (typeof pauseMusicTrack === 'function') pauseMusicTrack();
    if (typeof pauseDjDeck === 'function') { pauseDjDeck('a'); pauseDjDeck('b'); }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch(e) {}

  // Wenn ein neuer aktiver Modus gewählt wurde, sofort starten
  try {
    if (newMode === 'radio') {
      if (typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.playRadioStation === 'function') {
        const savedStation = localStorage.getItem('flow_radio_station') || 'groovesalad';
        RadioNewsEngine.playRadioStation(savedStation);
      }
    } else if (newMode === 'soundmachine') {
      if (typeof playAmbientSound === 'function') {
        playAmbientSound(typeof lastSelectedSound !== 'undefined' && lastSelectedSound ? lastSelectedSound : 'lofi');
      }
    } else if (newMode === 'ambient') {
      if (typeof playRandomTimerAmbient === 'function') {
        playRandomTimerAmbient(false, true);
      }
    }
  } catch(e) {
    console.warn("Audio mode live switch notice:", e);
  }

  renderTimerCockpitContent();
  const names = { ambient: '🌿 Ambient Flow', soundmachine: '🎵 Sound Machine', radio: '📻 Live-Radio', silent: '🔇 Stille' };
  if (typeof showToast === 'function') {
    showToast(`Audio: ${names[newMode] || newMode}`);
  }
}
window.setTimerAudioMode = setTimerAudioMode;

function toggleTimerVoiceFeature(feature) {
  if (feature === 'time') {
    timerVoiceTimeAnnounce = !(typeof timerVoiceTimeAnnounce !== 'undefined' ? timerVoiceTimeAnnounce : true);
    if (typeof window !== 'undefined') window.timerVoiceTimeAnnounce = timerVoiceTimeAnnounce;
    if (typeof globalThis !== 'undefined') globalThis.timerVoiceTimeAnnounce = timerVoiceTimeAnnounce;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('flowTimerVoiceTimeAnnounce', String(timerVoiceTimeAnnounce));
    }
  } else if (feature === 'motivation') {
    timerVoiceMotivation = !(typeof timerVoiceMotivation !== 'undefined' ? timerVoiceMotivation : true);
    if (typeof window !== 'undefined') window.timerVoiceMotivation = timerVoiceMotivation;
    if (typeof globalThis !== 'undefined') globalThis.timerVoiceMotivation = timerVoiceMotivation;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('flowTimerVoiceMotivation', String(timerVoiceMotivation));
    }
  }

  timerVoiceEnabled = !!(timerVoiceTimeAnnounce || timerVoiceMotivation);
  if (typeof window !== 'undefined') window.timerVoiceEnabled = timerVoiceEnabled;
  if (typeof globalThis !== 'undefined') globalThis.timerVoiceEnabled = timerVoiceEnabled;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('flowTimerVoiceEnabled', String(timerVoiceEnabled));
  }

  renderTimerCockpitContent();
  if (typeof showToast === 'function') {
    if (feature === 'time') {
      showToast(timerVoiceTimeAnnounce ? '⏱️ Zeitansagen: An' : '⏱️ Zeitansagen: Aus');
    } else if (feature === 'motivation') {
      showToast(timerVoiceMotivation ? '💡 Motivationssprüche: An' : '💡 Motivationssprüche: Aus');
    }
  }
}
window.toggleTimerVoiceFeature = toggleTimerVoiceFeature;
if (typeof globalThis !== 'undefined') globalThis.toggleTimerVoiceFeature = toggleTimerVoiceFeature;

function toggleTimerVoice(force) {
  if (typeof force === 'boolean') {
    timerVoiceEnabled = force;
  } else {
    timerVoiceEnabled = !timerVoiceEnabled;
  }
  timerVoiceTimeAnnounce = timerVoiceEnabled;
  timerVoiceMotivation = timerVoiceEnabled;
  if (typeof window !== 'undefined') {
    window.timerVoiceEnabled = timerVoiceEnabled;
    window.timerVoiceTimeAnnounce = timerVoiceTimeAnnounce;
    window.timerVoiceMotivation = timerVoiceMotivation;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.timerVoiceEnabled = timerVoiceEnabled;
    globalThis.timerVoiceTimeAnnounce = timerVoiceTimeAnnounce;
    globalThis.timerVoiceMotivation = timerVoiceMotivation;
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('flowTimerVoiceEnabled', timerVoiceEnabled ? 'true' : 'false');
    localStorage.setItem('flowTimerVoiceTimeAnnounce', timerVoiceTimeAnnounce ? 'true' : 'false');
    localStorage.setItem('flowTimerVoiceMotivation', timerVoiceMotivation ? 'true' : 'false');
  }
  renderTimerCockpitContent();
  if (typeof showToast === 'function') {
    showToast(timerVoiceEnabled ? '🎙️ Sprachbegleitung: An' : '🔇 Sprachbegleitung: Aus');
  }
}
window.toggleTimerVoice = toggleTimerVoice;

function cycleTimerPreset(direction = 1) {
  const current = Math.round(timerInitialSeconds / 60) || 1;
  const next = Math.max(1, Math.min(240, current + direction));
  setTimerPreset(next);
  if (typeof renderTimerCockpitContent === 'function') {
    const panel = document.getElementById('panel-timer-presets');
    if (panel && !panel.classList.contains('hidden')) {
      renderTimerCockpitContent();
    }
  }
}
window.cycleTimerPreset = cycleTimerPreset;
if (typeof globalThis !== 'undefined') {
  globalThis.cycleTimerPreset = cycleTimerPreset;
}

function handleCustomTimerDirectInput(val) {
  const mins = parseInt(val, 10);
  if (mins && mins >= 1 && mins <= 240) {
    setTimerPreset(mins);
    const slider = document.querySelector('#panel-timer-presets input[type="range"]');
    if (slider) slider.value = Math.min(120, mins);
    const sliderVal = document.getElementById('timer-custom-slider-val');
    if (sliderVal) sliderVal.innerText = `Dauer: ${mins} Minuten`;
    document.querySelectorAll('.timer-preset-btn').forEach(btn => {
      const bMins = parseInt(btn.dataset.mins, 10);
      if (bMins === mins) {
        btn.className = 'timer-preset-btn px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-600/70 to-indigo-600/70 border-purple-400 text-white font-bold ring-1 ring-purple-400/70 shadow-[0_0_10px_rgba(168,85,247,0.35)] border text-[10px] font-mono transition text-center cursor-pointer truncate active:scale-95';
      } else {
        btn.className = 'timer-preset-btn px-2.5 py-1 rounded-xl bg-white/5 hover:bg-purple-600/20 text-gray-300 hover:text-white border border-white/10 text-[10px] font-mono transition text-center cursor-pointer truncate active:scale-95';
      }
    });
  }
}
window.handleCustomTimerDirectInput = handleCustomTimerDirectInput;
if (typeof globalThis !== 'undefined') globalThis.handleCustomTimerDirectInput = handleCustomTimerDirectInput;

function handleCustomSliderInput(val) {
  const mins = parseInt(val, 10) || 1;
  setTimerPreset(mins);
  const numInput = document.getElementById('timer-custom-number-input');
  if (numInput) numInput.value = mins;
  const sliderVal = document.getElementById('timer-custom-slider-val');
  if (sliderVal) sliderVal.innerText = `Dauer: ${mins} Minuten`;
  document.querySelectorAll('.timer-preset-btn').forEach(btn => {
    const bMins = parseInt(btn.dataset.mins, 10);
    if (bMins === mins) {
      btn.className = 'timer-preset-btn px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-600/70 to-indigo-600/70 border-purple-400 text-white font-bold ring-1 ring-purple-400/70 shadow-[0_0_10px_rgba(168,85,247,0.35)] border text-[10px] font-mono transition text-center cursor-pointer truncate active:scale-95';
    } else {
      btn.className = 'timer-preset-btn px-2.5 py-1 rounded-xl bg-white/5 hover:bg-purple-600/20 text-gray-300 hover:text-white border border-white/10 text-[10px] font-mono transition text-center cursor-pointer truncate active:scale-95';
    }
  });
}
window.handleCustomSliderInput = handleCustomSliderInput;
if (typeof globalThis !== 'undefined') globalThis.handleCustomSliderInput = handleCustomSliderInput;

function setCustomTimerDirect(mins) {
  setTimerPreset(mins);
  renderTimerCockpitContent();
}
window.setCustomTimerDirect = setCustomTimerDirect;
if (typeof globalThis !== 'undefined') globalThis.setCustomTimerDirect = setCustomTimerDirect;

function stepCustomTimerMinutes(delta) {
  const inp = document.getElementById('timer-custom-number-input') || document.getElementById('timer-custom-mins-input');
  let current = parseInt(inp ? inp.value : '1', 10) || Math.round(timerInitialSeconds / 60) || 1;
  let next = Math.max(1, Math.min(240, current + delta));
  if (inp) inp.value = next;
  setTimerPreset(next);
  renderTimerCockpitContent();
}
window.stepCustomTimerMinutes = stepCustomTimerMinutes;
if (typeof globalThis !== 'undefined') {
  globalThis.stepCustomTimerMinutes = stepCustomTimerMinutes;
}

function handleCustomTimerInput(val) {
  const mins = parseInt(val, 10);
  if (mins && mins >= 1 && mins <= 240) {
    setTimerPreset(mins);
  }
}
window.handleCustomTimerInput = handleCustomTimerInput;
if (typeof globalThis !== 'undefined') {
  globalThis.handleCustomTimerInput = handleCustomTimerInput;
}

function applyCustomTimerMinutes() {
  const inp = document.getElementById('timer-custom-number-input') || document.getElementById('timer-custom-mins-input');
  if (!inp) return;
  const mins = parseInt(inp.value, 10);
  if (mins && mins > 0) {
    selectTimerPreset(mins);
    const panel = document.getElementById('panel-timer-presets');
    if (panel) panel.classList.add('hidden');
  }
}
window.applyCustomTimerMinutes = applyCustomTimerMinutes;
if (typeof globalThis !== 'undefined') {
  globalThis.applyCustomTimerMinutes = applyCustomTimerMinutes;
}

function startTaskTimer(taskName, event) {
  if (event) event.stopPropagation();
  if (!taskName) return;
  activeTimerTask = taskName; 
  
  const mins = getCurrentPresetMinutes();
  timerSeconds = mins * 60;
  timerInitialSeconds = mins * 60;
  timerHasTriggeredZero = false;
  
  updateActiveTimerLabels();
  startTimer();
  updateTimerDisplay();
  updateTimerUI();
  if (typeof showToast === 'function') showToast(`⏱️ Focus: "${taskName}" (${mins}m)`);
}

function updateActiveTimerLabels() {
  const text = activeTimerTask || "";
  const pickLabel = document.getElementById('helper-pick-timer-task');
  if (pickLabel) pickLabel.innerText = text;
  const stepsLabel = document.getElementById('helper-steps-timer-task');
  if (stepsLabel) stepsLabel.innerText = text;
}

function updateActiveTimerBadge() {
  const badgeContainer = document.getElementById('active-timer-badge-container');
  const badge = document.getElementById('active-timer-badge');
  const taskTitle = typeof activeTimerTask === 'object' && activeTimerTask ? (activeTimerTask.title || activeTimerTask.task) : (activeTimerTask || '');
  
  if (badge) {
    if (taskTitle) {
      if (badgeContainer) badgeContainer.classList.remove('hidden');
      badge.classList.remove('hidden');
      badge.innerText = `🎯 ${taskTitle}`;
      badge.title = `Fokus: ${taskTitle} (Klicken für Optionen)`;
    } else {
      if (badgeContainer) badgeContainer.classList.add('hidden');
      badge.classList.add('hidden');
    }
  }
}

function setTimerPreset(mins) {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerRunning = false; 
  timerTargetEndTime = null;
  timerHasTriggeredZero = false;
  timerSeconds = mins * 60;
  timerInitialSeconds = mins * 60;
  
  if (typeof stopAmbientSound === 'function') stopAmbientSound(true);
  if (typeof stopLookaheadSequencer === 'function') stopLookaheadSequencer();
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }
  
  const dropdowns = ['timer-preset-select-real', 'helper-pick-timer-preset-select-real', 'helper-steps-timer-preset-select-real'];
  dropdowns.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = String(mins);
  });
  
  updateTimerDisplay();
  updateTimerUI();
  if (typeof renderApp === 'function') renderApp();
  if (typeof showToast === 'function') showToast(`⏱️ ${mins}m`);
}

function adjustTimerMinutes(delta) {
  let currentMins = Math.round((typeof timerInitialSeconds !== 'undefined' && timerInitialSeconds ? timerInitialSeconds : 180) / 60);
  if (isNaN(currentMins) || currentMins < 1) currentMins = 1;
  let newMins = currentMins + delta;
  if (newMins < 1) newMins = 1;
  if (newMins > 240) newMins = 240;
  setTimerPreset(newMins);
}
window.adjustTimerMinutes = adjustTimerMinutes;
if (typeof globalThis !== 'undefined') globalThis.adjustTimerMinutes = adjustTimerMinutes;

function renderTimerCockpitContent() {
  const panel = document.getElementById('panel-timer-presets');
  if (!panel) return;

  const currentMins = Math.round(timerInitialSeconds / 60) || 3;
  const taskTitle = typeof activeTimerTask === 'object' && activeTimerTask ? (activeTimerTask.title || activeTimerTask.task) : (activeTimerTask || '');
  const openTasks = getAllOpenBoardTasks();
  const currentAudioMode = (typeof timerAudioMode !== 'undefined' ? timerAudioMode : 'silent');
  const isTimeAnnounce = (typeof timerVoiceTimeAnnounce !== 'undefined' ? timerVoiceTimeAnnounce : true) && (typeof timerVoiceEnabled !== 'undefined' ? timerVoiceEnabled : true);
  const isMotivation = (typeof timerVoiceMotivation !== 'undefined' ? timerVoiceMotivation : true) && (typeof timerVoiceEnabled !== 'undefined' ? timerVoiceEnabled : true);
  const isVoiceActive = isTimeAnnounce || isMotivation;

  const presets = [
    { mins: 1, label: '1m' },
    { mins: 3, label: '3m' },
    { mins: 5, label: '5m' },
    { mins: 10, label: '10m' },
    { mins: 15, label: '15m' },
    { mins: 25, label: '25m 🍅' },
    { mins: 45, label: '45m' },
    { mins: 60, label: '60m 🎯' }
  ];

  const masterVol = typeof soundMasterVolume !== 'undefined' ? soundMasterVolume : 0.5;
  const isMuted = (typeof isPlayerMuted !== 'undefined' && isPlayerMuted) || (typeof isTimerSoundActive === 'function' && !isTimerSoundActive());
  const currentVolPct = isMuted ? 0 : Math.round(masterVol * 100);
  const isRunning = typeof timerRunning !== 'undefined' ? timerRunning : (typeof window !== 'undefined' ? window.timerRunning : false);

  panel.innerHTML = `
    <!-- 1. KOPFZEILE: NOODLE LOGO + TIMER UNTERSCHRIFT (LINKS) | LAUTSTÄRKE & CLOSE (RECHTS) -->
    <div class="flex items-center justify-between pb-2 border-b border-white/10 select-none">
      
      <!-- Noodle Logo & TIMER Subtext -->
      <div class="flex items-center gap-2">
        <div class="relative flex flex-col items-center justify-center shrink-0">
          <div class="relative overflow-hidden flex items-center justify-center">
            <img src="logo-noodle.png" alt="Noodle" class="h-[22px] w-auto max-w-none object-contain select-none pointer-events-none" />
          </div>
          <div class="relative h-[9px] w-full flex items-center justify-center overflow-hidden mt-0.5">
            <span class="badge-tool-subtext select-none">TIMER</span>
          </div>
        </div>
        <span class="w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]' : 'bg-purple-500/50'}"></span>
      </div>

      <!-- Rechts: Vertikale Lautstärke & Schließen -->
      <div class="flex items-center gap-2">
        
        <!-- Vertikaler Lautstärke-Controller Popover -->
        <div class="relative group/vol flex items-center">
          <button onclick="toggleMasterSound(); renderTimerCockpitContent();" class="h-7 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-purple-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 shadow-sm" title="Lautstärke anpassen">
            <i data-lucide="${!isMuted ? 'volume-2' : 'volume-x'}" class="w-3.5 h-3.5 ${!isMuted ? 'text-purple-300' : 'text-gray-500'}"></i>
            <span class="text-[9.5px] font-mono text-purple-200/90 font-bold">${currentVolPct}%</span>
          </button>

          <!-- Vertikaler Slider (Hover/Active Popover) -->
          <div class="hidden group-hover/vol:flex absolute right-0 top-full mt-2 z-[300] bg-[#0c0918]/98 border border-purple-500/40 p-2.5 rounded-2xl shadow-2xl backdrop-blur-2xl flex-col items-center gap-2 animate-fade-in ring-1 ring-purple-500/30">
            <span class="text-[9px] font-mono font-bold text-purple-200">${currentVolPct}%</span>
            <div class="h-24 flex items-center justify-center py-1">
              <input type="range" min="0" max="1" step="0.02" value="${isMuted ? 0 : masterVol}" 
                     oninput="handleHeaderVolumeInput(this.value)" 
                     class="h-20 w-1.5 accent-purple-400 cursor-pointer [writing-mode:bt-lr] [-webkit-appearance:slider-vertical]" 
                     style="-webkit-appearance: slider-vertical; writing-mode: bt-lr;">
            </div>
            <button onclick="toggleMasterSound(); renderTimerCockpitContent();" class="text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition cursor-pointer">
              ${isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        </div>

        <!-- Schließen Button -->
        <button onclick="document.getElementById('panel-timer-presets').classList.add('hidden')" class="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-gray-400 hover:text-white text-xs font-bold flex items-center justify-center transition cursor-pointer" title="Schließen">✕</button>
      </div>
    </div>

    <!-- 2. ZEIT-SCHNELLWAHL (KOMPAKT & MINIMAL) -->
    <div class="p-2 rounded-2xl bg-purple-950/20 border border-purple-500/25 shadow-inner flex flex-col gap-1.5">
      <div class="flex items-center justify-between px-0.5">
        <span class="text-[10.5px] font-bold text-purple-200 font-display flex items-center gap-1.5">
          <i data-lucide="clock" class="w-3.5 h-3.5 text-purple-400"></i>
          <span>Dauer wählen</span>
        </span>
        <span class="text-[9.5px] font-mono font-bold text-purple-300/90 bg-purple-500/20 px-2 py-0.5 rounded-lg border border-purple-500/30">${currentMins} Min.</span>
      </div>

      <!-- Kompakte Presets (8 klare Tasten in 2 Reihen) -->
      <div class="grid grid-cols-4 gap-1">
        ${presets.map(p => `
          <button onclick="setCustomTimerDirect(${p.mins});" data-mins="${p.mins}" class="timer-preset-btn py-1 px-1 rounded-xl ${p.mins === currentMins ? 'bg-gradient-to-r from-purple-600/70 to-indigo-600/70 border-purple-400 text-white font-bold ring-1 ring-purple-400/70 shadow-[0_0_8px_rgba(168,85,247,0.35)]' : 'bg-white/5 hover:bg-purple-600/20 text-gray-300 hover:text-white'} border border-white/10 text-[10.5px] font-mono transition text-center cursor-pointer truncate active:scale-95">
            ${p.label}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- 3. SPRACHBEGLEITUNG (ZEITANSAGEN & MOTIVATION) -->
    <div class="p-2 rounded-2xl bg-indigo-950/25 border border-indigo-500/30 shadow-inner flex flex-col gap-1.5">
      <div class="flex items-center justify-between px-0.5">
        <span class="text-[10.5px] font-bold text-indigo-300 font-display flex items-center gap-1.5">
          <i data-lucide="mic" class="w-3.5 h-3.5 text-indigo-400"></i>
          <span>Sprachbegleitung</span>
        </span>
        <span class="text-[9px] font-mono font-bold ${isVoiceActive ? 'text-emerald-300' : 'text-gray-500'}">
          ${isVoiceActive ? '● Aktiv' : '○ Aus'}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-1.5">
        <!-- Zeitansagen Toggle -->
        <button onclick="toggleTimerVoiceFeature('time');" class="py-1.5 px-2 rounded-xl border text-[10px] font-semibold flex items-center justify-between gap-1 transition cursor-pointer ${isTimeAnnounce ? 'bg-gradient-to-r from-indigo-600/40 to-purple-600/40 border-indigo-400/70 text-white shadow-[0_0_10px_rgba(99,102,241,0.25)] ring-1 ring-indigo-400/40' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}">
          <span class="flex items-center gap-1 truncate">
            <span>⏱️</span>
            <span class="truncate">Zeitansagen</span>
          </span>
          <span class="text-[9px] font-mono font-bold ${isTimeAnnounce ? 'text-indigo-200' : 'text-gray-500'}">${isTimeAnnounce ? 'AN' : 'AUS'}</span>
        </button>

        <!-- Motivationssprüche Toggle -->
        <button onclick="toggleTimerVoiceFeature('motivation');" class="py-1.5 px-2 rounded-xl border text-[10px] font-semibold flex items-center justify-between gap-1 transition cursor-pointer ${isMotivation ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-pink-400/70 text-white shadow-[0_0_10px_rgba(236,72,153,0.25)] ring-1 ring-pink-400/40' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}">
          <span class="flex items-center gap-1 truncate">
            <span>💡</span>
            <span class="truncate">Motivation</span>
          </span>
          <span class="text-[9px] font-mono font-bold ${isMotivation ? 'text-pink-200' : 'text-gray-500'}">${isMotivation ? 'AN' : 'AUS'}</span>
        </button>
      </div>

      <!-- Stimmen-Vielfalt (Wechselnd: Frau, Mann, Kind) mit Hörproben -->
      <div class="pt-1 border-t border-indigo-500/20 flex flex-col gap-1">
        <div class="flex items-center justify-between px-0.5">
          <span class="text-[9px] font-semibold text-indigo-300 flex items-center gap-1">
            <span>🎭</span>
            <span>Wechselnde Stimmen</span>
          </span>
          <span class="text-[8.5px] font-mono text-indigo-200/90 bg-indigo-500/20 px-1.5 py-0.2 rounded border border-indigo-500/30">
            Frau · Mann · Kind
          </span>
        </div>
        <div class="grid grid-cols-3 gap-1">
          <button onclick="previewVoiceCategory('female');" class="py-1 px-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-[9.5px] font-medium flex items-center justify-center gap-1 transition cursor-pointer active:scale-95" title="Hörprobe: Frauenstimmen (warm & freundlich)">
            <span>👩</span>
            <span class="truncate">Frauen</span>
          </button>
          <button onclick="previewVoiceCategory('male');" class="py-1 px-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-[9.5px] font-medium flex items-center justify-center gap-1 transition cursor-pointer active:scale-95" title="Hörprobe: Männerstimmen (tief-warm & gelassen)">
            <span>👨</span>
            <span class="truncate">Männer</span>
          </button>
          <button onclick="previewVoiceCategory('child');" class="py-1 px-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-[9.5px] font-medium flex items-center justify-center gap-1 transition cursor-pointer active:scale-95" title="Hörprobe: Kinderstimmen (jung, hell & fröhlich)">
            <span>🧒</span>
            <span class="truncate">Kinder</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 4. SOUNDS, MUSIK & RADIO -->
    <div class="p-2 rounded-2xl bg-teal-950/20 border border-teal-500/30 shadow-inner flex flex-col gap-1.5">
      <div class="flex items-center justify-between px-0.5">
        <span class="text-[10.5px] font-bold text-teal-300 font-display flex items-center gap-1.5">
          <i data-lucide="music-2" class="w-3.5 h-3.5 text-teal-400"></i>
          <span>Klang & Musik</span>
        </span>
        <span class="text-[9px] font-mono text-teal-400/80 font-bold uppercase tracking-wider">
          ${currentAudioMode === 'ambient' ? '🌿 Sounds' : (currentAudioMode === 'soundmachine' || currentAudioMode === 'music' ? '🎵 Musik' : (currentAudioMode === 'radio' ? '📻 Radio' : '🔇 Aus'))}
        </span>
      </div>

      <!-- 4 Buttons: Sounds, Musik, Radio, Stille -->
      <div class="grid grid-cols-4 gap-1">
        <button onclick="setTimerAudioMode('ambient');" class="py-1.5 px-1 rounded-xl border text-[10px] font-semibold transition text-center cursor-pointer truncate ${currentAudioMode === 'ambient' ? 'bg-teal-500/30 border-teal-400 text-teal-200 shadow-[0_0_8px_rgba(20,184,166,0.3)] font-bold' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}">
          🌿 Sounds
        </button>
        <button onclick="setTimerAudioMode('soundmachine');" class="py-1.5 px-1 rounded-xl border text-[10px] font-semibold transition text-center cursor-pointer truncate ${currentAudioMode === 'soundmachine' || currentAudioMode === 'music' ? 'bg-teal-500/30 border-teal-400 text-teal-200 shadow-[0_0_8px_rgba(20,184,166,0.3)] font-bold' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}">
          🎵 Musik
        </button>
        <button onclick="setTimerAudioMode('radio');" class="py-1.5 px-1 rounded-xl border text-[10px] font-semibold transition text-center cursor-pointer truncate ${currentAudioMode === 'radio' ? 'bg-teal-500/30 border-teal-400 text-teal-200 shadow-[0_0_8px_rgba(20,184,166,0.3)] font-bold' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}">
          📻 Radio
        </button>
        <button onclick="setTimerAudioMode('silent');" class="py-1.5 px-1 rounded-xl border text-[10px] font-semibold transition text-center cursor-pointer truncate ${currentAudioMode === 'silent' ? 'bg-teal-500/30 border-teal-400 text-teal-200 shadow-[0_0_8px_rgba(20,184,166,0.3)] font-bold' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}">
          🔇 Stille
        </button>
      </div>
    </div>

    <!-- 5. FOKUS-ZIEL (AUFGABE AUS DEM BOARD) & CHRONOMETER -->
    <div class="p-2 rounded-2xl bg-amber-950/20 border border-amber-500/30 shadow-inner flex flex-col gap-1.5">
      <div class="flex items-center justify-between px-0.5">
        <span class="text-[10.5px] font-bold text-amber-300 font-display flex items-center gap-1.5">
          <i data-lucide="target" class="w-3.5 h-3.5 text-amber-400"></i>
          <span>Fokus-Ziel (Aufgabe)</span>
        </span>
        <div class="flex items-center gap-1">
          <button onclick="document.getElementById('panel-timer-presets').classList.add('hidden'); toggleChronometer();" class="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-mono text-[9px] font-bold flex items-center gap-1 transition cursor-pointer" title="Stoppuhr / Zeiterfassung starten">
            <i data-lucide="watch" class="w-2.5 h-2.5"></i>
            <span>Chrono</span>
          </button>
          ${taskTitle ? `<span class="text-[8.5px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">Verknüpft</span>` : ''}
        </div>
      </div>

      ${taskTitle ? `
        <div class="flex items-center justify-between gap-1.5 p-1.5 bg-amber-500/15 border border-amber-500/35 rounded-xl text-[11px] text-amber-100 min-w-0 shadow-inner">
          <span class="truncate font-medium">${(typeof escapeHtml === 'function') ? escapeHtml(taskTitle) : taskTitle}</span>
          <div class="flex items-center gap-1 shrink-0">
            <button onclick="completeActiveTimerTask(event)" class="px-2 py-0.5 bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-300 rounded-lg text-[9.5px] font-bold cursor-pointer transition" title="Aufgabe als erledigt markieren">✓ Erledigt</button>
            <button onclick="unlinkTimerTask(event)" class="text-gray-400 hover:text-rose-400 text-xs px-1 cursor-pointer transition" title="Verknüpfung lösen">✕</button>
          </div>
        </div>
      ` : `
        <select id="timer-task-select" onchange="if(this.value) linkTaskToTimer(this.value)" class="w-full py-1.5 px-2 bg-black/60 border border-white/10 hover:border-amber-400/40 rounded-xl text-[10.5px] text-gray-200 outline-none cursor-pointer truncate transition">
          <option value="" class="text-gray-500">-- Aufgabe aus Board verknüpfen --</option>
          ${(() => {
            const groups = {};
            openTasks.forEach(t => {
              const grp = t.colLabel || t.colId;
              if (!groups[grp]) groups[grp] = [];
              groups[grp].push(t);
            });
            return Object.keys(groups).map(grpName => `
              <optgroup label="${(typeof escapeHtml === 'function') ? escapeHtml(grpName) : grpName}" class="bg-[#161522] text-amber-300 font-bold">
                ${groups[grpName].map(t => `
                  <option value="${(typeof escapeHtml === 'function') ? escapeHtml(t.title) : t.title}" class="bg-[#12111a] text-white font-normal">
                    ${(typeof escapeHtml === 'function') ? escapeHtml(t.title) : t.title}
                  </option>
                `).join('')}
              </optgroup>
            `).join('');
          })()}
        </select>
      `}
    </div>

    <!-- 6. WECKER & ERINNERUNGEN FOOTER -->
    <div class="pt-0.5 border-t border-white/10 flex items-center justify-between">
      <button onclick="document.getElementById('panel-timer-presets').classList.add('hidden'); openAlarmModal('alarms');" class="w-full py-1 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-400/40 text-cyan-300 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer text-[10.5px]" title="Wecker & Erinnerungen öffnen">
        <i data-lucide="bell" class="w-3 h-3"></i>
        <span>Wecker & Erinnerungen öffnen ↗</span>
      </button>
    </div>
  `;

  if (typeof lucide !== 'undefined') lucide.createIcons();
}
window.renderTimerCockpitContent = renderTimerCockpitContent;

function addReminderFromTimerCockpit() {
  const inp = document.getElementById('timer-cockpit-reminder-input');
  const sel = document.getElementById('timer-cockpit-reminder-mins');
  if (!inp || !inp.value.trim()) return;
  const text = inp.value.trim();
  const mins = parseInt(sel?.value || '10') || 10;
  
  if (typeof alarmState !== 'undefined' && Array.isArray(alarmState.reminders)) {
    alarmState.reminders.push({
      id: Date.now().toString(),
      text: text,
      time: Date.now() + mins * 60000,
      completed: false
    });
    if (typeof saveAlarmState === 'function') saveAlarmState();
    if (typeof updateAlarmBadge === 'function') updateAlarmBadge();
    if (typeof renderAlarmPanel === 'function') renderAlarmPanel();
  }
  
  if (typeof showToast === 'function') showToast(`🔔 Erinnerung "${text}" in ${mins}m gesetzt!`);
  inp.value = '';
}
window.addReminderFromTimerCockpit = addReminderFromTimerCockpit;

let timerPresetHoverTimeout = null;

function openTimerPresetMenu() {
  if (timerPresetHoverTimeout) {
    clearTimeout(timerPresetHoverTimeout);
    timerPresetHoverTimeout = null;
  }
  const panel = document.getElementById('panel-timer-presets');
  if (!panel) return;
  
  // Andere Popovers schließen
  document.querySelectorAll('#panel-calendar-dropdown, #panel-weather, #panel-pause-dropdown, #panel-settings-dropdown, #panel-header-tools, #panel-alarm, #panel-report').forEach(el => el.classList.add('hidden'));

  renderTimerCockpitContent();
  panel.classList.remove('hidden');
}
window.openTimerPresetMenu = openTimerPresetMenu;

function closeTimerPresetMenu() {
  if (timerPresetHoverTimeout) clearTimeout(timerPresetHoverTimeout);
  timerPresetHoverTimeout = setTimeout(() => {
    const panel = document.getElementById('panel-timer-presets');
    const trigger = document.getElementById('btn-timer-presets');
    const isOverPanel = panel && panel.matches(':hover');
    const isOverTrigger = trigger && trigger.matches(':hover');
    if (panel && !isOverPanel && !isOverTrigger) {
      panel.classList.add('hidden');
    }
  }, 180);
}
window.closeTimerPresetMenu = closeTimerPresetMenu;

function toggleTimerPresetMenu(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const panel = document.getElementById('panel-timer-presets');
  if (!panel) return;
  if (panel.classList.contains('hidden')) {
    openTimerPresetMenu();
  } else {
    panel.classList.add('hidden');
  }
}
window.toggleTimerPresetMenu = toggleTimerPresetMenu;

function selectTimerPreset(mins) {
  setTimerPreset(mins);
  const panel = document.getElementById('panel-timer-presets');
  if (panel) panel.classList.add('hidden');
}
window.selectTimerPreset = selectTimerPreset;

// Outside click zum Schließen des Timer-Preset Menüs
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('panel-timer-presets');
    const trigger = document.getElementById('btn-timer-presets');
    if (panel && !panel.classList.contains('hidden')) {
      if (!panel.contains(e.target) && !trigger?.contains(e.target)) {
        panel.classList.add('hidden');
      }
    }
  });
}

function syncTimerWithTimestamp() {
  const isRunning = typeof timerRunning !== 'undefined' ? timerRunning : (typeof window !== 'undefined' ? window.timerRunning : false);
  const targetEnd = typeof timerTargetEndTime !== 'undefined' ? timerTargetEndTime : (typeof window !== 'undefined' ? window.timerTargetEndTime : null);
  if (!isRunning || !targetEnd) return;
  const now = Date.now();
  timerSeconds = Math.round((targetEnd - now) / 1000);
  updateTimerDisplay();
}

// Hintergrund-Synchronisierung bei Tab-Fokus / Display-Entsperrung
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncTimerWithTimestamp();
    }
  });
  window.addEventListener('focus', () => {
    syncTimerWithTimestamp();
  });
}

function startTimer() {
  if (timerRunning) return;
  
  // Wenn der Timer bei 0 stand und neu gestartet wird, Preset-Minuten nutzen
  if (timerSeconds === 0 && !timerTargetEndTime) {
    const mins = getCurrentPresetMinutes();
    timerSeconds = mins * 60;
    timerInitialSeconds = mins * 60;
    timerHasTriggeredZero = false;
  }
  
  const isFreshStart = timerSeconds === timerInitialSeconds;
  if (isFreshStart) {
    timerHasTriggeredZero = false;
  }
  
  timerRunning = true;
  timerTargetEndTime = Date.now() + (timerSeconds * 1000);
  updateTimerDisplay();
  updateTimerUI();
  updateMuteButtonsUI();
  
  // Intelligentes Audio-Routing je nach gewähltem Begleit-Modus
  try {
    const activeAudioMode = (typeof timerAudioMode !== 'undefined' ? timerAudioMode : 'ambient');
    if (activeAudioMode === 'silent') {
      // Keine kontinuierliche Hintergrundmusik
    } else if (activeAudioMode === 'radio') {
      if (typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.playRadioStation === 'function') {
        const savedStation = localStorage.getItem('flow_radio_station') || 'lofi';
        RadioNewsEngine.playRadioStation(savedStation);
      } else if (typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.toggleRadioPlayback === 'function' && !RadioNewsEngine.isRadioPlaying) {
        RadioNewsEngine.toggleRadioPlayback();
      }
    } else if (activeAudioMode === 'soundmachine') {
      if (typeof playAmbientSound === 'function') {
        playAmbientSound(typeof lastSelectedSound !== 'undefined' && lastSelectedSound ? lastSelectedSound : 'lofi');
      }
    } else {
      // Standard: Ambient Flow
      if (localStorage.getItem('flow_audio_timer_sync') === 'true' && typeof playAmbientSound === 'function') {
        if (!currentSoundType && (!activeUserAudio || activeUserAudio.paused)) {
          playAmbientSound(typeof lastSelectedSound !== 'undefined' && lastSelectedSound ? lastSelectedSound : 'lofi');
        }
      } else {
        playRandomTimerAmbient();
      }
    }
  } catch(e) {
    console.warn("Timer Audio routing notice:", e);
  }

  const isTimeAnnounceActive = (typeof timerVoiceTimeAnnounce !== 'undefined' ? timerVoiceTimeAnnounce : true) && (typeof timerVoiceEnabled !== 'undefined' ? timerVoiceEnabled : true);
  const isMotivationActive = (typeof timerVoiceMotivation !== 'undefined' ? timerVoiceMotivation : true) && (typeof timerVoiceEnabled !== 'undefined' ? timerVoiceEnabled : true);
  const isVoiceActiveNow = (isTimeAnnounceActive || isMotivationActive) && isTimerSoundActive();

  // Zeitansage / Begrüßung zu Beginn einer frischen Sitzung (nicht beim Fortsetzen nach Pause)
  if (isFreshStart && isVoiceActiveNow) {
    try {
      const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
      const startMins = Math.round(timerInitialSeconds / 60);
      const activeTaskName = typeof activeTimerTask === 'object' && activeTimerTask ? (activeTimerTask.title || activeTimerTask.task) : (activeTimerTask || '');
      
      const speechItems = [];
      if (isTimeAnnounceActive) {
        let timeText = "";
        if (activeTaskName && typeof activeTaskName === 'string' && activeTaskName.trim()) {
          const cleanTask = activeTaskName.trim().replace(/^[\d\.\-\*•✓\s]+/, '');
          const phraseList = (typeof SESSION_START_TASK_PHRASES !== 'undefined' && SESSION_START_TASK_PHRASES[lang]) 
            ? SESSION_START_TASK_PHRASES[lang] 
            : (typeof SESSION_START_TASK_PHRASES !== 'undefined' ? SESSION_START_TASK_PHRASES.de : null);
          const phrase = (phraseList && phraseList.length > 0)
            ? pickWithoutImmediateRepeat(phraseList, lastSessionStartPhrase)
            : (SESSION_START_PHRASES[lang] || SESSION_START_PHRASES.de)[0];
          lastSessionStartPhrase = phrase;
          timeText = phrase.replace('{mins}', startMins).replace('{task}', cleanTask);
        } else {
          const phraseList = SESSION_START_PHRASES[lang] || SESSION_START_PHRASES.de;
          const phrase = pickWithoutImmediateRepeat(phraseList, lastSessionStartPhrase);
          lastSessionStartPhrase = phrase;
          timeText = phrase.replace('{mins}', startMins);
        }
        if (startMins === 1 && timeText) {
          timeText = timeText.replace('Minuten', 'Minute').replace('minutes', 'minute').replace('minutos', 'minuto').replace('λεπτά', 'λεπτό');
        }
        if (timeText) speechItems.push({ text: timeText });
      }

      if (isMotivationActive) {
        const motiv = getContextMotivation(timerSeconds, timerInitialSeconds, activeTaskName);
        if (motiv) speechItems.push({ text: motiv });
      }

      if (speechItems.length > 0) {
        const startSessionToken = currentSpeechSessionId;
        const startTimeout = setTimeout(() => {
          if (!timerRunning || currentSpeechSessionId !== startSessionToken) return;
          if (typeof speakVoiceSequence === 'function') {
            speakVoiceSequence(speechItems);
          } else {
            speakSoftlyDynamic(speechItems.map(s => s.text).join('. '), timerSeconds, timerInitialSeconds);
          }
        }, 400);
        if (typeof activeTimeouts !== 'undefined' && Array.isArray(activeTimeouts)) {
          activeTimeouts.push(startTimeout);
        }
      }
    } catch(e) {}
  }
  
  let lastAnnouncedElapsedMinute = 0;
  let lastSoundSwitchedElapsedMinute = 0;

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!timerRunning || !timerTargetEndTime) return;
    
    const now = Date.now();
    const prevSecs = timerSeconds;
    timerSeconds = Math.round((timerTargetEndTime - now) / 1000);
    
    // Punktgenauer Null-Übergang (wird exakt einmal ausgelöst!)
    if (timerSeconds <= 0 && !timerHasTriggeredZero && prevSecs > 0) {
      timerHasTriggeredZero = true;
      if (typeof playProceduralSound === 'function') playProceduralSound();
      
      startPleasantRinging();
      
      if (typeof stopAmbientSound === 'function') {
        stopAmbientSound(true);
      }

      if (isTimerSoundActive() && (isTimeAnnounceActive || isMotivationActive)) {
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
        let timeUp = "Fokuszeit gemeistert! Zieh ruhig weiter durch, wenn du im Flow bist.";
        if (typeof getTimeUpPhrase === 'function') {
          timeUp = getTimeUpPhrase(lang);
        } else if (typeof TIME_UP_PHRASES !== 'undefined' && TIME_UP_PHRASES[lang]) {
          const raw = TIME_UP_PHRASES[lang];
          timeUp = Array.isArray(raw) ? (typeof pickWithoutImmediateRepeat === 'function' ? pickWithoutImmediateRepeat(raw, lastMotivationByTier?.['time_up']) : raw[0]) : raw;
        }
        const timeUpSessionToken = currentSpeechSessionId;
        const timeUpTimeout = setTimeout(() => {
          if (!timerRunning || currentSpeechSessionId !== timeUpSessionToken) return;
          speakSoftlyDynamic(timeUp, 0, timerInitialSeconds);
        }, 600);
        if (typeof activeTimeouts !== 'undefined' && Array.isArray(activeTimeouts)) {
          activeTimeouts.push(timeUpTimeout);
        }
      }
    }
    
    // Countdown-Phase (positive Restzeit)
    if (timerSeconds > 0 && timerSeconds < timerInitialSeconds) {
      const elapsedSec = timerInitialSeconds - timerSeconds;
      const elapsedMins = Math.floor(elapsedSec / 60);
      const minsLeft = Math.ceil(timerSeconds / 60);
      const prevElapsedMins = Math.floor((timerInitialSeconds - prevSecs) / 60);

      // Jede neue Minute präzise erfassen
      if (elapsedMins > prevElapsedMins && elapsedMins !== lastAnnouncedElapsedMinute) {
        lastAnnouncedElapsedMinute = elapsedMins;

        // Alle 2 Minuten (z.B. nach 2 Min, 4 Min, 6 Min) sowie bei 2m und 1m Restzeit sprechen
        const isTwoMinMark = (elapsedMins % 2 === 0);
        const isFinalStretch = (minsLeft === 2 || minsLeft === 1);
        const shouldSpeak = isTwoMinMark || isFinalStretch || (timerInitialSeconds <= 180);

        if (shouldSpeak && isVoiceActiveNow) {
          let timeText = "";
          const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
          
          if (isTimeAnnounceActive) {
            if (minsLeft === 1) {
              if (lang === 'de') timeText = "Noch 1 Minute verbleibend";
              else if (lang === 'es') timeText = "Queda 1 minuto";
              else if (lang === 'el') timeText = "Απομένει 1 λεπτό";
              else if (lang === 'fr') timeText = "Il reste 1 minute";
              else if (lang === 'it') timeText = "Resta 1 minuto";
              else timeText = "1 minute remaining";
            } else {
              if (lang === 'de') timeText = `Noch ${minsLeft} Minuten verbleibend`;
              else if (lang === 'es') timeText = `Quedan ${minsLeft} minutos`;
              else if (lang === 'el') timeText = `Απομένουν ${minsLeft} λεπτά`;
              else if (lang === 'fr') timeText = `Il reste ${minsLeft} minutes`;
              else if (lang === 'it') timeText = `Restano ${minsLeft} minuti`;
              else timeText = `${minsLeft} minutes remaining`;
            }
          }
          
          // Motivationsspruch harmonisch einbinden
          let motivText = "";
          if (isMotivationActive) {
            const activeTaskName = typeof activeTimerTask === 'object' && activeTimerTask ? (activeTimerTask.title || activeTimerTask.task) : (activeTimerTask || '');
            const motiv = getContextMotivation(timerSeconds, timerInitialSeconds, activeTaskName);
            if (motiv) {
              motivText = motiv;
            }
          }

          const speechItems = [];
          if (timeText) speechItems.push({ text: timeText });
          if (motivText) speechItems.push({ text: motivText });
          
          if (speechItems.length > 0) {
            // Nach der Zeitansage: Sound alle 2 Minuten wechseln!
            if (typeof speakVoiceSequence === 'function') {
              speakVoiceSequence(speechItems, () => {
                if (isTwoMinMark && lastSoundSwitchedElapsedMinute !== elapsedMins) {
                  lastSoundSwitchedElapsedMinute = elapsedMins;
                  try { playRandomTimerAmbient(true); } catch(e) {}
                }
              });
            } else {
              speakSoftlyDynamic(speechItems.map(s => s.text).join('. '), timerSeconds, timerInitialSeconds, () => {
                if (isTwoMinMark && lastSoundSwitchedElapsedMinute !== elapsedMins) {
                  lastSoundSwitchedElapsedMinute = elapsedMins;
                  try { playRandomTimerAmbient(true); } catch(e) {}
                }
              });
            }
          } else {
            playMinuteChime();
          }

          // Falls Sprachbegleitung aus ist, Sound trotzdem alle 2 Minuten nach der Zeitgrenze wechseln
          if (!isVoiceActiveNow && isTwoMinMark && lastSoundSwitchedElapsedMinute !== elapsedMins) {
            lastSoundSwitchedElapsedMinute = elapsedMins;
            try { playRandomTimerAmbient(true); } catch(e) {}
          }
        } else {
          // Ungerade Zwischen-Minuten: Nur sanfter Glockenton, KEIN Sound-Wechsel
          playMinuteChime();
        }
      }
    }

    // Flow-Verlängerungs-Phase (negative Zeit läuft nahtlos weiter: -1, -2, -3, -30, -60, -120...)
    if (timerSeconds < 0 && timerSeconds !== prevSecs) {
      const absSec = Math.abs(timerSeconds);
      const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
      const activeTaskName = typeof activeTimerTask === 'object' && activeTimerTask ? (activeTimerTask.title || activeTimerTask.task) : (activeTimerTask || '');

      // Erste Ansage nach 30 Sekunden Verlängerung
      if (absSec === 30 && isVoiceActiveNow) {
        const speechItems = [];
        if (isTimeAnnounceActive) {
          const text30 = (typeof OVERDUE_30S_LABELS !== 'undefined' && OVERDUE_30S_LABELS[lang]) 
            ? OVERDUE_30S_LABELS[lang] 
            : "30 Sekunden im Flow.";
          if (text30) speechItems.push({ text: text30 });
        }
        if (isMotivationActive) {
          const motiv = (typeof getOverdueMotivation === 'function')
            ? getOverdueMotivation(lang, activeTaskName, 0.5)
            : ((typeof MOTIVATIONAL_CHUNKS !== 'undefined' && (MOTIVATIONAL_CHUNKS[lang] || MOTIVATIONAL_CHUNKS.de))
                ? pickWithoutImmediateRepeat((MOTIVATIONAL_CHUNKS[lang] || MOTIVATIONAL_CHUNKS.de).overdue, lastMotivationByTier?.['overdue'])
                : "");
          if (motiv) speechItems.push({ text: motiv });
        }
        if (speechItems.length > 0) {
          if (typeof speakVoiceSequence === 'function') speakVoiceSequence(speechItems);
          else speakSoftlyDynamic(speechItems.map(s => s.text).join(' '), timerSeconds, timerInitialSeconds);
        }
      }
      // Jede volle Minute Flow-Verlängerung (-60s, -120s, -180s...)
      else if (absSec % 60 === 0 && isVoiceActiveNow) {
        const overdueMins = absSec / 60;
        const speechItems = [];
        if (isTimeAnnounceActive) {
          const labelFn = (typeof OVERDUE_MINUTE_LABELS !== 'undefined' && OVERDUE_MINUTE_LABELS[lang]) 
            ? OVERDUE_MINUTE_LABELS[lang] 
            : ((n) => n === 1 ? "1 Minute Flow-Verlängerung" : `${n} Minuten Flow-Verlängerung`);
          const label = labelFn(overdueMins);
          if (label) speechItems.push({ text: label });
        }
        if (isMotivationActive) {
          const motiv = (typeof getOverdueMotivation === 'function')
            ? getOverdueMotivation(lang, activeTaskName, overdueMins)
            : ((typeof MOTIVATIONAL_CHUNKS !== 'undefined' && (MOTIVATIONAL_CHUNKS[lang] || MOTIVATIONAL_CHUNKS.de))
                ? pickWithoutImmediateRepeat((MOTIVATIONAL_CHUNKS[lang] || MOTIVATIONAL_CHUNKS.de).overdue, lastMotivationByTier?.['overdue'])
                : "");
          if (motiv) speechItems.push({ text: motiv });
        }
        if (speechItems.length > 0) {
          if (typeof speakVoiceSequence === 'function') speakVoiceSequence(speechItems);
          else speakSoftlyDynamic(speechItems.map(s => s.text).join('. '), timerSeconds, timerInitialSeconds);
        }
      }
      // Zwischen-Signalton alle 30s bei halben Minuten (-90s, -150s, -210s...)
      else if (absSec % 30 === 0) {
        playMinuteChime();
      }
    }
    
    updateTimerDisplay();
  }, 250);
}

function pauseTimer() {
  if (!timerRunning) return;
  if (typeof currentSpeechSessionId !== 'undefined') {
    currentSpeechSessionId++;
  }
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerTargetEndTime = null;
  timerRunning = false;
  updateTimerUI();
  
  if (typeof stopPleasantRinging === 'function') {
    stopPleasantRinging();
  }
  if (typeof ringInterval !== 'undefined' && ringInterval) {
    clearTimeout(ringInterval);
    clearInterval(ringInterval);
    ringInterval = null;
  }
  if (typeof ringTimeout !== 'undefined' && ringTimeout) {
    clearTimeout(ringTimeout);
    ringTimeout = null;
  }
  if (typeof activeTimeouts !== 'undefined' && Array.isArray(activeTimeouts)) {
    activeTimeouts.forEach(t => clearTimeout(t));
    activeTimeouts.length = 0;
  }
  
  if (typeof stopAmbientSound === 'function') {
    stopAmbientSound(true);
  }
  if (typeof stopLookaheadSequencer === 'function') {
    stopLookaheadSequencer();
  }
  if (typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.toggleRadioPlayback === 'function' && window.isRadioPlaying) {
    RadioNewsEngine.toggleRadioPlayback();
  }
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (e) { console.warn('[Timer] pause speech cancel warning:', e); }
    setTimeout(() => { try { window.speechSynthesis.cancel(); } catch (e) {} }, 0);
    setTimeout(() => { try { window.speechSynthesis.cancel(); } catch (e) {} }, 50);
  }
  updateTimerDisplay();
}

function stopTimer() {
  if (typeof currentSpeechSessionId !== 'undefined') {
    currentSpeechSessionId++;
  }
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerTargetEndTime = null;
  timerRunning = false;
  timerHasTriggeredZero = false;
  timerSeconds = timerInitialSeconds; 
  activeTimerTask = null;
  
  if (typeof stopPleasantRinging === 'function') {
    stopPleasantRinging();
  } else if (typeof dismissRingingModalOnly === 'function') {
    dismissRingingModalOnly();
  }
  if (typeof ringInterval !== 'undefined' && ringInterval) {
    clearTimeout(ringInterval);
    clearInterval(ringInterval);
    ringInterval = null;
  }
  if (typeof ringTimeout !== 'undefined' && ringTimeout) {
    clearTimeout(ringTimeout);
    ringTimeout = null;
  }
  if (typeof activeTimeouts !== 'undefined' && Array.isArray(activeTimeouts)) {
    activeTimeouts.forEach(t => clearTimeout(t));
    activeTimeouts.length = 0;
  }
  
  document.title = 'Noodle Studio';
  
  updateActiveTimerLabels();
  updateTimerDisplay();
  updateTimerUI();
  if (typeof renderApp === 'function') renderApp();
  
  // Alle Ambient-Sounds, Sequencer, User-Audios, Radio und Sprachausgaben SOFORT stoppen
  if (typeof stopAmbientSound === 'function') {
    stopAmbientSound(true);
  }
  if (typeof stopLookaheadSequencer === 'function') {
    stopLookaheadSequencer();
  }
  if (typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.toggleRadioPlayback === 'function' && window.isRadioPlaying) {
    RadioNewsEngine.toggleRadioPlayback();
  }
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (e) { console.warn('[Timer] stop speech cancel warning:', e); }
    setTimeout(() => { try { window.speechSynthesis.cancel(); } catch (e) {} }, 0);
    setTimeout(() => { try { window.speechSynthesis.cancel(); } catch (e) {} }, 50);
  }
}

function toggleTimer() {
  if (timerRunning) pauseTimer();
  else startTimer();
}

function resetTimer() {
  stopTimer();
}

function updateTimerUI() {
  const playBtns = ['timer-play-btn', 'helper-pick-timer-play-btn', 'helper-steps-timer-play'];
  const pauseBtns = ['timer-pause-btn', 'helper-pick-timer-pause-btn', 'helper-steps-timer-pause'];
  const muteBtns = ['timer-mute-btn', 'helper-pick-timer-mute-btn', 'helper-steps-timer-mute'];
  
  playBtns.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (timerRunning) el.classList.add('hidden');
      else el.classList.remove('hidden');
    }
  });
  
  pauseBtns.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (timerRunning) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
  });

  const playPauseBtn = document.getElementById('timer-play-pause-btn');
  const playPauseIcon = document.getElementById('timer-play-pause-icon');
  if (playPauseBtn && playPauseIcon) {
    if (timerRunning) {
      playPauseIcon.setAttribute('data-lucide', 'pause');
      playPauseBtn.className = 'w-6 h-6 rounded-lg bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/50 text-[#ff7a00] hover:text-white flex items-center justify-center transition cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse';
      playPauseBtn.title = 'Fokus pausieren [T]';
    } else {
      playPauseIcon.setAttribute('data-lucide', 'play');
      playPauseBtn.className = 'w-6 h-6 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-300 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-95';
      playPauseBtn.title = 'Fokus starten [T]';
    }
  }
  
  muteBtns.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (timerRunning) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
  });
  
  const zenPlay = document.getElementById('zen-play-btn');
  const zenPause = document.getElementById('zen-pause-btn');
  if (zenPlay && zenPause) {
    if (timerRunning) {
      zenPlay.classList.add('hidden');
      zenPause.classList.remove('hidden');
    } else {
      zenPlay.classList.remove('hidden');
      zenPause.classList.add('hidden');
    }
  }

  updateActiveTimerBadge();
  updateMuteButtonsUI();

  const timerContainers = [
    document.getElementById('timer-trigger-container'),
    document.getElementById('helper-pick-timer-box'),
    document.getElementById('helper-steps-timer-box')
  ];
  timerContainers.forEach(el => {
    if (el) el.classList.toggle('timer-active-glow', !!timerRunning);
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateTimerDisplay() {
  const isNegative = timerSeconds < 0;
  const absoluteSeconds = Math.abs(timerSeconds);
  const mins = Math.floor(absoluteSeconds / 60);
  const secs = absoluteSeconds % 60;
  
  const sign = isNegative ? '-' : '';
  const str = `${sign}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  
  // Flow-Verlängerung in allen Displays farblich und animiert hervorheben (querySelectorAll für Duplikate & mobile Ansichten)
  const displayElements = document.querySelectorAll(
    '#timer-display, #helper-pick-timer-display, #helper-steps-timer-display, #zen-timer-display, #game-hud-timer-display, #mobile-timer-display, #alarm-timer-display, .timer-display-live'
  );
  displayElements.forEach(el => {
    if (el) {
      el.innerText = str;
      el.classList.toggle('text-purple-300', isNegative);
      el.classList.toggle('animate-pulse', isNegative);
    }
  });

  const totalSecs = (typeof timerInitialSeconds !== 'undefined' && timerInitialSeconds > 0) ? timerInitialSeconds : 120;
  const progressPct = Math.max(0, Math.min(100, ((typeof timerSeconds !== 'undefined' ? timerSeconds : 120) / totalSecs) * 100));
  const cockpitProg = document.getElementById('timer-cockpit-progress-bar');
  if (cockpitProg) {
    cockpitProg.style.width = `${progressPct}%`;
  }
  const headerProg = document.getElementById('timer-progress-bar');
  if (headerProg) {
    headerProg.style.width = `${progressPct}%`;
  }
  
  // Zen & Mobile Timer Status Labels
  const zenStatus = document.getElementById('zen-timer-status');
  const mobStatus = document.getElementById('mobile-timer-status');
  [zenStatus, mobStatus].forEach(st => {
    if (st) {
      if (timerRunning) {
        st.innerText = isNegative ? '🚀 Flow-Verlängerung' : 'Fokus aktiv';
        st.className = isNegative ? 'text-[10px] text-purple-300 font-bold uppercase tracking-wider animate-pulse' : 'text-[10px] text-emerald-400 font-bold uppercase tracking-wider';
      } else {
        st.innerText = 'Bereit';
        st.className = 'text-[10px] text-gray-400 font-bold uppercase tracking-wider';
      }
    }
  });

  // Mobile Timer Play/Pause Buttons
  const mobPlayBtn = document.getElementById('mobile-timer-play-btn');
  const mobPauseBtn = document.getElementById('mobile-timer-pause-btn');
  if (mobPlayBtn && mobPauseBtn) {
    if (timerRunning) {
      mobPlayBtn.classList.add('hidden');
      mobPauseBtn.classList.remove('hidden');
    } else {
      mobPlayBtn.classList.remove('hidden');
      mobPauseBtn.classList.add('hidden');
    }
  }

  // Browser-Tab-Titel bei laufendem Timer & Flow-Verlängerung aktualisieren
  if (timerRunning) {
    if (isNegative) {
      document.title = `(${str}) 🚀 Flow — Noodle Studio`;
    } else {
      document.title = `(${str}) Noodle Studio`;
    }
  } else {
    document.title = 'Noodle Studio';
  }
  
  const pct = timerInitialSeconds > 0 ? Math.max(0, (timerSeconds / timerInitialSeconds) * 100) : 100;
  const progressBars = document.querySelectorAll(
    '#timer-progress-bar, #helper-pick-timer-progress-bar, #helper-steps-timer-progress-bar, .timer-progress-live'
  );
  progressBars.forEach(el => {
    if (el) {
      el.style.width = isNegative ? '100%' : `${pct}%`;
      el.classList.toggle('bg-purple-500', isNegative);
    }
  });

  const countEl = document.getElementById('ringing-live-counter');
  if (countEl) {
    countEl.innerText = str;
  }
}

// =========================================================================
// CHRONOMETER (OFFENE AUFGABEN-ZEITERFASSUNG / STOPPUHR & FLOW-LOGGER)
// =========================================================================

var chronometerActive = false;
var chronometerSeconds = 0;
var chronometerInterval = null;
var activeChronometerTask = null;
var chronometerStartTime = null;

function formatChronometerTime(secs) {
  const s = Math.max(0, Math.floor(secs));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const remSec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
}

function startTaskChronometer(colId, index, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  try {
    const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : {};
    const taskItem = curItems[colId]?.[index];
    const taskTitle = typeof taskItem === 'object' && taskItem ? (taskItem.task || taskItem.title || taskItem.name || '') : String(taskItem || '');
    
    startChronometer(taskTitle || 'Fokus-Aufgabe', colId, index);
  } catch (e) {
    console.warn('[Chronometer] Error starting task chronometer:', e);
  }
}
window.startTaskChronometer = startTaskChronometer;

function startChronometer(taskTitle = null, colId = null, index = null) {
  // Wenn schon ein Countdown-Timer läuft, pausieren
  if (timerRunning) {
    pauseTimer();
  }

  if (chronometerInterval) {
    clearInterval(chronometerInterval);
    chronometerInterval = null;
  }

  chronometerActive = true;
  chronometerSeconds = 0;
  chronometerStartTime = Date.now();
  activeChronometerTask = taskTitle ? { title: taskTitle, colId, index } : null;

  updateChronometerUI(true);

  chronometerInterval = setInterval(() => {
    if (!chronometerActive) return;
    chronometerSeconds = Math.round((Date.now() - chronometerStartTime) / 1000);
    updateChronometerDisplay();
  }, 500);

  updateChronometerDisplay();

  const titleStr = taskTitle ? ` für "${taskTitle}"` : '';
  if (typeof showToast === 'function') {
    showToast(`⏱️ Chronometer gestartet${titleStr}`);
  }
}
window.startChronometer = startChronometer;

function stopChronometer(isCompleted = false) {
  if (!chronometerActive && !chronometerInterval) return;

  if (chronometerInterval) {
    clearInterval(chronometerInterval);
    chronometerInterval = null;
  }

  const durationSec = chronometerSeconds;
  const timeFormatted = formatChronometerTime(durationSec);
  const taskObj = activeChronometerTask;
  chronometerActive = false;
  chronometerStartTime = null;

  updateChronometerUI(false);
  updateTimerDisplay(); // Setzt Standardanzeige zurück

  if (durationSec > 10 && taskObj && taskObj.title) {
    // In Wochenbericht / Notizen vermerken
    try {
      if (typeof logFocusSessionToReport === 'function') {
        logFocusSessionToReport(taskObj.title, durationSec);
      }
    } catch(e) {}

    if (typeof showToast === 'function') {
      showToast(`⏱️ Chronometer beendet: "${taskObj.title}" dauerte ${timeFormatted}`);
    }
  } else if (typeof showToast === 'function') {
    showToast(`⏱️ Chronometer gestoppt (${timeFormatted})`);
  }

  activeChronometerTask = null;
}
window.stopChronometer = stopChronometer;

function toggleChronometer() {
  if (chronometerActive) {
    stopChronometer(false);
  } else {
    startChronometer(activeTimerTask || null);
  }
}
window.toggleChronometer = toggleChronometer;

function updateChronometerDisplay() {
  if (!chronometerActive) return;
  const displayEl = document.getElementById('timer-display');
  const str = formatChronometerTime(chronometerSeconds);
  if (displayEl) {
    displayEl.innerText = `⏱️ ${str}`;
    displayEl.className = 'font-display font-black text-xs md:text-sm tracking-wider text-emerald-300 leading-none select-none animate-pulse';
  }

  const progressBar = document.getElementById('timer-progress-bar');
  if (progressBar) {
    progressBar.style.width = '100%';
    progressBar.className = 'h-full bg-emerald-400 transition-all duration-300';
  }

  // Task-Badge im Header
  const badge = document.getElementById('active-timer-badge');
  if (badge) {
    if (activeChronometerTask && activeChronometerTask.title) {
      badge.textContent = `⏱️ ${activeChronometerTask.title}`;
      badge.classList.remove('hidden');
    } else {
      badge.textContent = `⏱️ Chrono`;
      badge.classList.remove('hidden');
    }
  }

  document.title = `(${str}) ⏱️ Chrono — Noodle`;
}

function updateChronometerUI(isActive) {
  const playBtn = document.getElementById('timer-play-btn');
  const pauseBtn = document.getElementById('timer-pause-btn');
  const stopBtn = document.getElementById('timer-stop-btn');

  if (isActive) {
    if (playBtn) playBtn.classList.add('hidden');
    if (pauseBtn) {
      pauseBtn.classList.remove('hidden');
      pauseBtn.setAttribute('onclick', 'stopChronometer()');
      pauseBtn.setAttribute('title', 'Chronometer stoppen');
    }
    if (stopBtn) {
      stopBtn.setAttribute('onclick', 'stopChronometer()');
      stopBtn.setAttribute('title', 'Chronometer beenden');
    }
  } else {
    if (pauseBtn) {
      pauseBtn.setAttribute('onclick', 'pauseTimer()');
      pauseBtn.setAttribute('title', 'Pause timer [T]');
      pauseBtn.classList.add('hidden');
    }
    if (playBtn) playBtn.classList.remove('hidden');
    if (stopBtn) {
      stopBtn.setAttribute('onclick', 'stopTimer()');
      stopBtn.setAttribute('title', 'Reset timer [S]');
    }
    const badge = document.getElementById('active-timer-badge');
    if (badge && !timerRunning) badge.classList.add('hidden');
    document.title = 'Noodle Studio';
  }
}

if (typeof window !== 'undefined') {
  window.startTaskTimer = startTaskTimer;
  window.updateActiveTimerLabels = updateActiveTimerLabels;
  window.updateActiveTimerBadge = updateActiveTimerBadge;
  window.setTimerPreset = setTimerPreset;
  window.openTimerPresetMenu = openTimerPresetMenu;
  window.closeTimerPresetMenu = closeTimerPresetMenu;
  window.toggleTimerPresetMenu = toggleTimerPresetMenu;
  window.selectTimerPreset = selectTimerPreset;
  window.syncTimerWithTimestamp = syncTimerWithTimestamp;
  window.startTimer = startTimer;
  window.pauseTimer = pauseTimer;
  window.stopTimer = stopTimer;
  window.toggleTimer = toggleTimer;
  window.resetTimer = resetTimer;
  window.updateTimerUI = updateTimerUI;
  window.updateTimerDisplay = updateTimerDisplay;
  window.startTaskChronometer = startTaskChronometer;
  window.startChronometer = startChronometer;
  window.stopChronometer = stopChronometer;
  window.toggleChronometer = toggleChronometer;
}
if (typeof globalThis !== 'undefined') {
  globalThis.startTaskTimer = startTaskTimer;
  globalThis.updateActiveTimerLabels = updateActiveTimerLabels;
  globalThis.updateActiveTimerBadge = updateActiveTimerBadge;
  globalThis.setTimerPreset = setTimerPreset;
  globalThis.openTimerPresetMenu = openTimerPresetMenu;
  globalThis.closeTimerPresetMenu = closeTimerPresetMenu;
  globalThis.toggleTimerPresetMenu = toggleTimerPresetMenu;
  globalThis.selectTimerPreset = selectTimerPreset;
  globalThis.syncTimerWithTimestamp = syncTimerWithTimestamp;
  globalThis.startTimer = startTimer;
  globalThis.pauseTimer = pauseTimer;
  globalThis.stopTimer = stopTimer;
  globalThis.toggleTimer = toggleTimer;
  globalThis.resetTimer = resetTimer;
  globalThis.updateTimerUI = updateTimerUI;
  globalThis.updateTimerDisplay = updateTimerDisplay;
  globalThis.startTaskChronometer = startTaskChronometer;
  globalThis.startChronometer = startChronometer;
  globalThis.stopChronometer = stopChronometer;
  globalThis.toggleChronometer = toggleChronometer;
}
