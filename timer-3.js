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

function toggleTimerVoice(force) {
  if (typeof force === 'boolean') {
    timerVoiceEnabled = force;
  } else {
    timerVoiceEnabled = !timerVoiceEnabled;
  }
  if (typeof window !== 'undefined') window.timerVoiceEnabled = timerVoiceEnabled;
  if (typeof globalThis !== 'undefined') globalThis.timerVoiceEnabled = timerVoiceEnabled;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('flowTimerVoiceEnabled', timerVoiceEnabled ? 'true' : 'false');
  }
  renderTimerCockpitContent();
  if (typeof showToast === 'function') {
    showToast(timerVoiceEnabled ? '🎙️ Sprachbegleitung aktiviert' : '🔇 Sprachbegleitung stumm');
  }
}
window.toggleTimerVoice = toggleTimerVoice;

function cycleTimerPreset(direction = 1) {
  const current = Math.round(timerInitialSeconds / 60) || 1;
  const next = Math.max(1, Math.min(240, current + direction));
  setTimerPreset(next);
}
window.cycleTimerPreset = cycleTimerPreset;
if (typeof globalThis !== 'undefined') {
  globalThis.cycleTimerPreset = cycleTimerPreset;
}

function stepCustomTimerMinutes(delta) {
  const inp = document.getElementById('timer-custom-mins-input');
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
  const inp = document.getElementById('timer-custom-mins-input');
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

function renderTimerCockpitContent() {
  const panel = document.getElementById('panel-timer-presets');
  if (!panel) return;

  const currentMins = Math.round(timerInitialSeconds / 60) || 3;
  const taskTitle = typeof activeTimerTask === 'object' && activeTimerTask ? (activeTimerTask.title || activeTimerTask.task) : (activeTimerTask || '');
  const openTasks = getAllOpenBoardTasks();
  const currentAudioMode = (typeof timerAudioMode !== 'undefined' ? timerAudioMode : 'ambient');
  const isVoiceOn = (typeof timerVoiceEnabled !== 'undefined' ? timerVoiceEnabled : true);
  const isSoundOn = (typeof timerSoundEnabled !== 'undefined' ? timerSoundEnabled : true);

  const presets = [
    { mins: 1, label: '1m' },
    { mins: 2, label: '2m' },
    { mins: 3, label: '🌱 3m Basic' },
    { mins: 5, label: '5m' },
    { mins: 10, label: '🚀 10m Sprint' },
    { mins: 15, label: '15m' },
    { mins: 20, label: '20m' },
    { mins: 25, label: '🍅 25m Pomo' },
    { mins: 45, label: '⚡ 45m Deep' }
  ];

  const masterVol = typeof soundMasterVolume !== 'undefined' ? soundMasterVolume : 0.5;
  const isMuted = (typeof isPlayerMuted !== 'undefined' && isPlayerMuted) || (typeof isTimerSoundActive === 'function' && !isTimerSoundActive());
  const currentVolPct = isMuted ? 0 : Math.round(masterVol * 100);

  panel.innerHTML = `
    <!-- 1. ZEIT-STEUERUNG (Übersichtlich & großzügig gegliedert) -->
    <div class="space-y-2 pb-3 border-b border-purple-500/20">
      <!-- Obere Leiste: Lautsprecher-Hover links, Schönes buntes Noodle Timer Logo, Close rechts -->
      <div class="flex items-center gap-2 justify-between">
        <!-- Lautsprecher Icon (Hover für vertikalen Master-Regler) -->
        <div class="relative group/cockpit-vol flex items-center shrink-0 select-none">
          <button onclick="toggleMasterSound(); renderTimerCockpitContent();" class="w-7 h-7 rounded-xl bg-black/50 hover:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center ${!isMuted ? 'text-purple-300' : 'text-gray-500'} transition cursor-pointer active:scale-95 shadow-inner" title="Sound stummschalten / aktivieren (Hovern für Lautstärkeregler)">
            <i data-lucide="${!isMuted ? 'volume-2' : 'volume-x'}" class="w-4 h-4"></i>
          </button>
          
          <!-- Hover-Flyout für den vertikalen Lautstärkeregler -->
          <div class="hidden group-hover/cockpit-vol:flex absolute left-0 top-full mt-2 z-40 w-8 py-2.5 bg-[#0c0b12]/98 border border-purple-500/40 rounded-2xl shadow-2xl flex-col items-center justify-between gap-1.5 backdrop-blur-xl animate-fade-in pointer-events-auto">
            <span class="text-[8.5px] font-mono font-bold text-purple-200" id="timer-cockpit-volume-percent">${currentVolPct}%</span>
            <div class="h-[70px] flex items-center justify-center my-0.5">
              <input type="range" orient="vertical" min="0" max="1" step="0.01" value="${isMuted ? 0 : masterVol}" oninput="handleHeaderVolumeInput(this.value); const pct=document.getElementById('timer-cockpit-volume-percent'); if(pct) pct.innerText = Math.round(this.value*100)+'%';" style="writing-mode: vertical-lr; direction: rtl; -webkit-appearance: slider-vertical; height: 70px; width: 6px;" class="master-volume-slider cursor-pointer accent-purple-400" title="Lautstärke">
            </div>
          </div>
        </div>

        <!-- Buntes Noodle Timer Branding Logo (Perfekt abgestimmt auf das Noodle Logo) -->
        <div class="flex items-center gap-1.5 select-none">
          <!-- 4-Farben Noodle Quad-Icon (wie im Haupt-Logo) -->
          <div class="flex items-center justify-center w-5 h-5 rounded-lg bg-purple-500/15 border border-purple-500/30 shadow-xs">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7.5" height="7.5" rx="2.2" fill="#c084fc" stroke="rgba(255,255,255,0.7)" stroke-width="0.75"/>
              <rect x="13.5" y="3" width="7.5" height="7.5" rx="2.2" fill="#38bdf8" stroke="rgba(255,255,255,0.7)" stroke-width="0.75"/>
              <rect x="3" y="13.5" width="7.5" height="7.5" rx="2.2" fill="#f472b6" stroke="rgba(255,255,255,0.7)" stroke-width="0.75"/>
              <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.2" fill="#34d399" stroke="rgba(255,255,255,0.7)" stroke-width="0.75"/>
            </svg>
          </div>
          <span class="font-display font-extrabold text-xs tracking-wide bg-gradient-to-r from-purple-300 via-pink-300 to-sky-300 bg-clip-text text-transparent drop-shadow-sm">
            Noodle Timer
          </span>
        </div>

        <!-- Schließen Button -->
        <button onclick="document.getElementById('panel-timer-presets').classList.add('hidden')" class="text-gray-400 hover:text-white text-xs font-bold p-1 rounded-lg hover:bg-white/10 transition cursor-pointer shrink-0" aria-label="Schließen" title="Schließen">✕</button>
      </div>

      <!-- Presets Grid (9 Vorangebotene Presets, 3x3 Grid) -->
      <div class="grid grid-cols-3 gap-1.5 pt-0.5">
        ${presets.map(p => `
          <button onclick="selectTimerPreset(${p.mins})" data-mins="${p.mins}" class="timer-preset-btn py-1.5 px-1 rounded-xl ${p.mins === currentMins ? 'bg-purple-600/40 border-purple-400 text-white shadow-xs font-bold ring-1 ring-purple-400/40' : 'bg-white/5 hover:bg-purple-600/20 hover:border-purple-400/50 border-white/10 text-gray-300 hover:text-white font-medium'} border text-[11px] font-mono transition text-center cursor-pointer truncate h-8 flex items-center justify-center">
            ${p.label}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- 2. AUFGABE VERKNÜPFEN (Mit feiner Amber-Trennlinie) -->
    <div class="space-y-1.5 py-1 pb-3 border-b border-amber-500/20">
      <div class="text-[9.5px] font-bold uppercase tracking-wider text-amber-300/90 font-mono flex items-center justify-between px-0.5">
        <span class="flex items-center gap-1.5">
          <i data-lucide="target" class="w-3.5 h-3.5 text-amber-400"></i>
          <span>Aufgabe verknüpfen</span>
        </span>
        ${taskTitle ? `<span class="text-[8.5px] text-amber-400 font-semibold px-1.5 py-0.2 rounded-full bg-amber-500/15 border border-amber-500/30">Aktiv</span>` : ''}
      </div>

      ${taskTitle ? `
        <div class="p-2 px-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 shadow-xs">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-xs shrink-0">🎯</span>
            <span class="text-xs font-bold text-amber-100 truncate">${(typeof escapeHtml === 'function') ? escapeHtml(taskTitle) : taskTitle}</span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button onclick="completeActiveTimerTask(event)" class="py-1 px-2.5 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold transition cursor-pointer active:scale-95 shadow-xs" title="Aufgabe als erledigt markieren">
              Fertig
            </button>
            <button onclick="unlinkTimerTask(event)" class="p-1 hover:bg-white/10 text-gray-400 hover:text-rose-400 rounded-lg text-xs transition cursor-pointer" title="Trennen">
              ✕
            </button>
          </div>
        </div>
      ` : `
        <div class="space-y-1.5">
          <select id="timer-task-select" onchange="if(this.value) linkTaskToTimer(this.value)" class="w-full py-1.5 px-2 bg-[#12111a] border border-amber-500/30 hover:border-amber-400/60 focus:border-amber-400 rounded-xl text-xs text-amber-100 outline-none cursor-pointer font-medium shadow-inner">
            <option value="" class="bg-[#12111a] text-gray-400">-- Aufgabe aus Board verknüpfen --</option>
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
          <div class="flex gap-1.5">
            <input type="text" id="timer-quick-task-input" placeholder="Oder Sofort-Ziel eingeben..." onkeydown="if(event.key==='Enter'&&this.value.trim()){linkTaskToTimer(this.value.trim());this.value='';}" class="flex-1 bg-[#12111a] border border-white/10 hover:border-amber-500/30 focus:border-amber-400 rounded-xl px-2.5 py-1 text-xs text-gray-200 placeholder-gray-500 outline-none">
            <button onclick="const inp=document.getElementById('timer-quick-task-input'); if(inp&&inp.value.trim()){linkTaskToTimer(inp.value.trim());inp.value='';}" class="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 hover:text-white border border-amber-500/30 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 shadow-xs">Fokus</button>
          </div>
        </div>
      `}
    </div>

    <!-- 3. AUDIO-MODI (Mit feiner Teal-Trennlinie) -->
    <div class="space-y-1.5 py-1 pb-3 border-b border-teal-500/20">
      <div class="text-[9.5px] font-bold uppercase tracking-wider text-teal-300/90 font-mono px-0.5 flex items-center gap-1.5">
        <i data-lucide="headphones" class="w-3.5 h-3.5 text-teal-400"></i>
        <span>Audio-Begleitung</span>
      </div>

      <div class="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
        <button onclick="setTimerAudioMode('ambient')" class="py-1.5 px-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${currentAudioMode === 'ambient' ? 'bg-teal-500/20 border-teal-400/60 text-teal-200 shadow-xs' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}">
          <span class="text-sm shrink-0">🌿</span>
          <div class="truncate">
            <div class="leading-none text-[10px]">Ambient Flow</div>
            <span class="text-[8px] font-normal text-gray-400">Naturklänge</span>
          </div>
        </button>

        <button onclick="setTimerAudioMode('soundmachine')" class="py-1.5 px-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${currentAudioMode === 'soundmachine' ? 'bg-purple-500/20 border-purple-400/60 text-purple-200 shadow-xs' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}">
          <span class="text-sm shrink-0">🎵</span>
          <div class="truncate">
            <div class="leading-none text-[10px]">Sound Machine</div>
            <span class="text-[8px] font-normal text-gray-400">Lo-Fi & Beats</span>
          </div>
        </button>

        <button onclick="setTimerAudioMode('radio')" class="py-1.5 px-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${currentAudioMode === 'radio' ? 'bg-rose-500/20 border-rose-400/60 text-rose-200 shadow-xs' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}">
          <span class="text-sm shrink-0">📻</span>
          <div class="truncate">
            <div class="leading-none text-[10px]">Live-Radio</div>
            <span class="text-[8px] font-normal text-gray-400">Jazz & Chill</span>
          </div>
        </button>

        <button onclick="setTimerAudioMode('silent')" class="py-1.5 px-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${currentAudioMode === 'silent' ? 'bg-sky-500/20 border-sky-400/60 text-sky-200 shadow-xs' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}">
          <span class="text-sm shrink-0">🔇</span>
          <div class="truncate">
            <div class="leading-none text-[10px]">Stille</div>
            <span class="text-[8px] font-normal text-gray-400">Nur End-Gong</span>
          </div>
        </button>
      </div>
    </div>

    <!-- 4. SPRACHBEGLEITUNG (Mit feiner Purple-Trennlinie) -->
    <div class="py-1 pb-3 border-b border-purple-500/20">
      <div class="p-2 px-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2 select-none shadow-xs">
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-sm shrink-0">🎙️</span>
          <div class="truncate">
            <div class="text-[10.5px] font-bold text-gray-200 leading-tight">Sprachbegleitung</div>
            <div class="text-[8.5px] text-gray-400 truncate">Sanfte Impulse zu Start, Pause & Ziel</div>
          </div>
        </div>
        <button onclick="toggleTimerVoice()" class="px-2.5 py-1 rounded-lg border text-[10px] font-bold transition cursor-pointer shrink-0 ${isVoiceOn ? 'bg-purple-500/30 border-purple-400 text-purple-200 shadow-xs' : 'bg-white/5 border-white/10 text-gray-400'}">
          ${isVoiceOn ? 'Aktiv' : 'Stumm'}
        </button>
      </div>
    </div>

    <!-- 5. WECKER & REMINDER INTEGRATION (Abgerundeter Abschlussbereich) -->
    <div class="pt-1 space-y-1.5">
      <div class="flex items-center justify-between text-[9.5px] font-bold uppercase tracking-wider text-cyan-300/90 font-mono px-0.5">
        <span class="flex items-center gap-1.5">
          <i data-lucide="bell" class="w-3.5 h-3.5 text-cyan-400"></i>
          <span>Wecker & Erinnerungen</span>
        </span>
        <button onclick="document.getElementById('panel-timer-presets').classList.add('hidden'); openAlarmModal('alarms');" class="text-[9.5px] text-cyan-400 hover:text-cyan-200 underline font-sans font-semibold cursor-pointer">
          Wecker-Hub ↗
        </button>
      </div>

      <!-- Schnelle Erinnerung -->
      <div class="flex gap-1.5 bg-black/40 p-1.5 rounded-xl border border-cyan-500/20 shadow-xs">
        <input type="text" id="timer-cockpit-reminder-input" placeholder="Schnell-Erinnerung..." onkeydown="if(event.key==='Enter') addReminderFromTimerCockpit();" class="flex-1 bg-transparent px-2 py-0.5 text-xs text-white placeholder-gray-500 outline-none">
        <select id="timer-cockpit-reminder-mins" class="bg-black/60 border border-white/10 rounded-lg text-[10px] text-cyan-300 font-bold px-1.5 outline-none cursor-pointer">
          <option value="5">5m</option>
          <option value="10" selected>10m</option>
          <option value="15">15m</option>
          <option value="25">25m</option>
          <option value="45">45m</option>
        </select>
        <button onclick="addReminderFromTimerCockpit()" class="px-2 py-0.5 bg-cyan-500/25 hover:bg-cyan-500/40 border border-cyan-400/40 text-cyan-200 hover:text-white rounded-lg text-[10px] font-bold transition cursor-pointer active:scale-95 shadow-xs">
          + Setzen
        </button>
      </div>
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
  document.querySelectorAll('#panel-calendar-dropdown, #panel-weather, #panel-pause-dropdown, #panel-settings-dropdown').forEach(el => el.classList.add('hidden'));

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
  }, 250);
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

  // Zeitansage zu Beginn einer frischen Sitzung (nicht beim Fortsetzen nach Pause), je nach Sound-Einstellung
  if (isFreshStart && isTimerSoundActive()) {
    try {
      const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
      const startMins = Math.round(timerInitialSeconds / 60);
      const phraseList = SESSION_START_PHRASES[lang] || SESSION_START_PHRASES.de;
      const phrase = pickWithoutImmediateRepeat(phraseList, lastSessionStartPhrase);
      lastSessionStartPhrase = phrase;
      let startText = phrase.replace('{mins}', startMins);
      if (startMins === 1) {
        startText = startText.replace('Minuten', 'Minute').replace('minutes', 'minute').replace('minutos', 'minuto').replace('λεπτά', 'λεπτό');
      }
      const startSessionToken = currentSpeechSessionId;
      const startTimeout = setTimeout(() => {
        if (!timerRunning || currentSpeechSessionId !== startSessionToken) return;
        speakSoftlyDynamic(startText, timerSeconds, timerInitialSeconds);
      }, 400);
      if (typeof activeTimeouts !== 'undefined' && Array.isArray(activeTimeouts)) {
        activeTimeouts.push(startTimeout);
      }
    } catch(e) {}
  }
  
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

      if (isTimerSoundActive()) {
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
        const timeUp = (typeof TIME_UP_PHRASES !== 'undefined' && TIME_UP_PHRASES[lang]) 
          ? TIME_UP_PHRASES[lang] 
          : "Die Zeit ist abgelaufen!";
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
    if (timerSeconds > 0 && timerSeconds % 60 === 0 && timerSeconds !== prevSecs && timerSeconds !== timerInitialSeconds) {
      const minsLeft = timerSeconds / 60;
      const shouldSpeak = (minsLeft % 2 === 1); // jede zweite Minute wird gesprochen

      if (shouldSpeak) {
        let speechText = "";
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
        
        if (minsLeft === 1) {
          if (lang === 'de') speechText = "Noch eine Minute";
          else if (lang === 'es') speechText = "Queda un minuto";
          else if (lang === 'el') speechText = "Απομένει ένα λεπτό";
          else if (lang === 'fr') speechText = "Il reste une minute";
          else if (lang === 'it') speechText = "Resta un minuto";
          else speechText = "One minute remaining";
        } else {
          if (lang === 'de') speechText = `Noch ${minsLeft} Minuten`;
          else if (lang === 'es') speechText = `Quedan ${minsLeft} minutos`;
          else if (lang === 'el') speechText = `Απομένουν ${minsLeft} λεπτά`;
          else if (lang === 'fr') speechText = `Il reste ${minsLeft} minutes`;
          else if (lang === 'it') speechText = `Restano ${minsLeft} minuti`;
          else speechText = `${minsLeft} minutes remaining`;
        }
        
        if (Math.random() < 0.55) {
          const motiv = getContextMotivation(timerSeconds, timerInitialSeconds);
          speechText += `. ${motiv}`;
        }
        
        speakSoftlyDynamic(speechText, timerSeconds, timerInitialSeconds);
      } else {
        playMinuteChime();
      }
      
      try { playRandomTimerAmbient(true); } catch(e) {}
    }

    // Überzeit-Phase (negative Zeit läuft nahtlos weiter: -1, -2, -3, -30, -60, -120...)
    if (timerSeconds < 0 && timerSeconds !== prevSecs) {
      const absSec = Math.abs(timerSeconds);
      const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';

      // Erste Ansage nach 30 Sekunden Überzeit
      if (absSec === 30) {
        const text30 = (typeof OVERDUE_30S_LABELS !== 'undefined' && OVERDUE_30S_LABELS[lang]) 
          ? OVERDUE_30S_LABELS[lang] 
          : "30 Sekunden über der Zeit.";
        speakSoftlyDynamic(text30, timerSeconds, timerInitialSeconds);
      }
      // Jede volle Minute Überzeit (-60s, -120s, -180s...)
      else if (absSec % 60 === 0) {
        const overdueMins = absSec / 60;
        const labelFn = (typeof OVERDUE_MINUTE_LABELS !== 'undefined' && OVERDUE_MINUTE_LABELS[lang]) 
          ? OVERDUE_MINUTE_LABELS[lang] 
          : ((n) => `${n} Minuten überzogen`);
        let speechText = labelFn(overdueMins);
        const overdueList = (typeof MOTIVATIONAL_CHUNKS !== 'undefined' && (MOTIVATIONAL_CHUNKS[lang] || MOTIVATIONAL_CHUNKS.de)) 
          ? (MOTIVATIONAL_CHUNKS[lang] || MOTIVATIONAL_CHUNKS.de).overdue 
          : [];
        if (overdueList && overdueList.length > 0) {
          const motiv = pickWithoutImmediateRepeat(overdueList, lastMotivationByTier['overdue']);
          lastMotivationByTier['overdue'] = motiv;
          if (motiv) speechText += `. ${motiv}`;
        }
        speakSoftlyDynamic(speechText, timerSeconds, timerInitialSeconds);
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
      playPauseBtn.className = 'w-6 h-6 rounded-lg bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/50 text-amber-200 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse';
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
  
  // Überzeit in allen Displays farblich und animiert hervorheben (querySelectorAll für Duplikate & mobile Ansichten)
  const displayElements = document.querySelectorAll(
    '#timer-display, #helper-pick-timer-display, #helper-steps-timer-display, #zen-timer-display, #game-hud-timer-display, #mobile-timer-display, #alarm-timer-display, .timer-display-live'
  );
  displayElements.forEach(el => {
    if (el) {
      el.innerText = str;
      el.classList.toggle('text-rose-400', isNegative);
      el.classList.toggle('animate-pulse', isNegative);
    }
  });
  
  // Zen & Mobile Timer Status Labels
  const zenStatus = document.getElementById('zen-timer-status');
  const mobStatus = document.getElementById('mobile-timer-status');
  [zenStatus, mobStatus].forEach(st => {
    if (st) {
      if (timerRunning) {
        st.innerText = isNegative ? '⚠️ Überzeit' : 'Fokus aktiv';
        st.className = isNegative ? 'text-[10px] text-rose-400 font-bold uppercase tracking-wider animate-pulse' : 'text-[10px] text-emerald-400 font-bold uppercase tracking-wider';
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

  // Browser-Tab-Titel bei laufendem Timer & Überzeit aktualisieren
  if (timerRunning) {
    if (isNegative) {
      document.title = `(${str}) ⚠️ Overtime — Noodle Studio`;
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
      el.classList.toggle('bg-rose-500', isNegative);
    }
  });

  const countEl = document.getElementById('ringing-live-counter');
  if (countEl) {
    countEl.innerText = str;
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
}
