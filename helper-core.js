/**
 * @file helper-core.js
 * @module ExecutiveHelperCore
 * @description
 * Kernlogik des „Was nun?"-Entscheidungsassistenten (`#helper-pick-modal`):
 * Energiebasierte Aufgaben-Empfehlung (Quick Win, Fokus, Deep Work),
 * A-vs.-B-Münzwurf-Entscheider sowie Sprachausgabe-Unterstützung.
 */
var currentZenTaskInfo = (typeof window !== 'undefined' && window.currentZenTaskInfo) || null;
var currentActiveTaskRef = (typeof currentActiveTaskRef !== 'undefined') ? currentActiveTaskRef : ((typeof window !== 'undefined' && window.currentActiveTaskRef) || null);
var currentGeneratedSteps = (typeof currentGeneratedSteps !== 'undefined') ? currentGeneratedSteps : ((typeof window !== 'undefined' && window.currentGeneratedSteps) || []);
var currentDopamineTask = (typeof currentDopamineTask !== 'undefined') ? currentDopamineTask : ((typeof window !== 'undefined' && window.currentDopamineTask) || null);
if (typeof window !== 'undefined') {
  window.currentActiveTaskRef = currentActiveTaskRef;
  window.currentGeneratedSteps = currentGeneratedSteps;
  window.currentDopamineTask = currentDopamineTask;
}
if (typeof globalThis !== 'undefined') {
  globalThis.currentActiveTaskRef = currentActiveTaskRef;
  globalThis.currentGeneratedSteps = currentGeneratedSteps;
  globalThis.currentDopamineTask = currentDopamineTask;
}

let suggestionCycleCount = 0;
let lastSuggestionThemeIndex = -1;

let suggestedTaskNamesInCurrentRun = [];
let currentSpeechUtterance = null;

let compassActiveDilemma = "";
let coinVetoInterval = null;
let coinVetoCountdownValue = 10;
let coinWinningOption = "";
let coinLosingOption = "";

let brainDumpThoughts = [];
let brainDumpCurrentIndex = 0;

function getNextNonRepeatingTheme() {
  let themeIndex;
  do {
    themeIndex = Math.floor(Math.random() * SUGGESTION_THEMES.length);
  } while (themeIndex === lastSuggestionThemeIndex && SUGGESTION_THEMES.length > 1);
  lastSuggestionThemeIndex = themeIndex;
  return SUGGESTION_THEMES[themeIndex];
}

function speakText(text, index = 0) {
  if (typeof speakWithProfile === 'function') {
    speakWithProfile(text, index);
  } else {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const langMap = { de: 'de-DE', en: 'en-US', es: 'es-ES', el: 'el-GR', fr: 'fr-FR', it: 'it-IT' };
        const targetLang = langMap[currentLang] || 'de-DE';
        utterance.lang = targetLang;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error(e);
      }
    }
  }
}

function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function cleanStepText(text) {
  if (!text) return '';
  let cleaned = text.replace(/^(?:schritt|step|schritte|steps|paso|etapa|βήμα|βημα)?\s*\d+[\s.:)\-]*\s*/i, '');
  cleaned = cleaned.replace(/^[\s.\-\u2022\u25CF\u25CB\u25AA\u25AB]+\s*/, '');
  return cleaned.trim();
}

function openHelperModal(type, force = false) {
  if (type === 'pick') {
    const modal = document.getElementById('helper-pick-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      const card = modal.firstElementChild || modal.querySelector('.theme-surface-modal');
      if (card) {
        card.classList.remove('hidden');
        card.style.removeProperty('display');
      }
    }
    suggestedTaskNamesInCurrentRun = []; 
    resetDopamineBox(); 
    pickRandomTask();
  } else if (type === 'steps') {
    const modal = document.getElementById('helper-steps-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      const card = modal.firstElementChild || modal.querySelector('.theme-surface-modal');
      if (card) {
        card.classList.remove('hidden');
        card.style.removeProperty('display');
      }
    }
    populateHelperTaskSelect(force);
  }
}

var safeTranslate = (typeof safeTranslate === 'function')
  ? safeTranslate
  : function(key) {
      if (typeof t === 'function') return t(key);
      if (typeof TRANSLATIONS === 'undefined') return key;
      const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
      return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.de?.[key] || key;
    };

function openTaskStepsModal(category, index, event, taskNameFallback) {
  if (event && typeof event.stopPropagation === 'function') {
    try { event.stopPropagation(); } catch (e) {}
  }
  if (typeof closeTaskOptionsMenu === 'function') {
    try { closeTaskOptionsMenu(true); } catch (e) {}
  } else if (typeof window !== 'undefined' && typeof window.closeTaskOptionsMenu === 'function') {
    try { window.closeTaskOptionsMenu(true); } catch (e) {}
  }

  const curItems = (typeof getCurrentWorkspaceItems === 'function')
    ? getCurrentWorkspaceItems()
    : (state?.items || {});
  let raw = curItems?.[category]?.[index];
  if (!raw && state?.items?.[category]?.[index]) {
    raw = state.items[category][index];
  }
  if (!raw && state?.workItems?.[category]?.[index]) {
    raw = state.workItems[category][index];
  }
  if (!raw && state?.studyItems?.[category]?.[index]) {
    raw = state.studyItems[category][index];
  }
  if (!raw && category === 'termine' && Array.isArray(state?.termine)) {
    raw = state.termine[index];
  }
  if (!raw && typeof category === 'string' && (index === undefined || index === null)) {
    raw = category;
  }
  if (!raw && taskNameFallback) {
    raw = taskNameFallback;
  }
  if (!raw && curItems?.[category] && taskNameFallback) {
    const found = curItems[category].find(item => {
      const t = (typeof item === 'object' && item) ? (item.task || item.title || item.name || item.text) : item;
      return t === taskNameFallback;
    });
    if (found) raw = found;
  }
  if (!raw) return;
  const task = typeof raw === 'object' && raw
    ? (raw.task || raw.title || raw.name || raw.text || '')
    : String(raw || '');
  if (!task) return;

  currentActiveTaskRef = { category, index, task };
  if (typeof window !== 'undefined') window.currentActiveTaskRef = currentActiveTaskRef;
  if (typeof globalThis !== 'undefined') globalThis.currentActiveTaskRef = currentActiveTaskRef;
  
  openHelperModal('steps', true);

  const select = document.getElementById('helper-task-select');
  if (select) {
    let found = false;
    for (let opt of select.options) {
      if (opt.value === task) { opt.selected = true; found = true; break; }
    }
    if (!found) {
      const opt = document.createElement('option');
      opt.value = task;
      opt.innerText = task;
      opt.selected = true;
      select.appendChild(opt);
    }
    select.value = task;
  }

  const modal = document.getElementById('helper-steps-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    const card = modal.firstElementChild || modal.querySelector('.theme-surface-modal');
    if (card) {
      card.classList.remove('hidden');
      card.style.removeProperty('display');
    }
  }

  if (typeof generateTaskSteps === 'function') {
    generateTaskSteps(task);
  } else if (typeof window !== 'undefined' && typeof window.generateTaskSteps === 'function') {
    window.generateTaskSteps(task);
  }
}

function closeHelperModal() {
  const pickModal = document.getElementById('helper-pick-modal');
  const stepsModal = document.getElementById('helper-steps-modal');
  if (pickModal) {
    pickModal.classList.add('hidden');
    pickModal.style.display = '';
    const card = pickModal.firstElementChild || pickModal.querySelector('.theme-surface-modal');
    if (card) {
      card.classList.remove('hidden');
      card.style.removeProperty('display');
    }
  }
  if (stepsModal) {
    stepsModal.classList.add('hidden');
    stepsModal.style.display = '';
    const card = stepsModal.firstElementChild || stepsModal.querySelector('.theme-surface-modal');
    if (card) {
      card.classList.remove('hidden');
      card.style.removeProperty('display');
    }
  }
  _lastPopulatedHelperTaskKey = null;
  stopSpeaking();
}

let _lastPopulatedHelperTaskKey = null;

function populateHelperTaskSelect(force = false) {
  const select = document.getElementById('helper-task-select'); if (!select) return;
  
  const pickModal = document.getElementById('helper-pick-modal');
  const stepsModal = document.getElementById('helper-steps-modal');
  const isModalVisible = (pickModal && !pickModal.classList.contains('hidden')) || (stepsModal && !stepsModal.classList.contains('hidden'));

  if (!isModalVisible && !force) return;

  const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
  const totalItemCount = state?.items ? Object.values(state.items).reduce((acc, l) => acc + (Array.isArray(l) ? l.length : 0), 0) : 0;
  const stateKey = `${lang}-${totalItemCount}`;

  if (!force && _lastPopulatedHelperTaskKey === stateKey && select.options.length > 1) {
    return;
  }
  _lastPopulatedHelperTaskKey = stateKey;

  select.innerHTML = `<option value="">${safeTranslate('dropdown_placeholder')}</option>`;
  const allTasks = [];
  const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : (state?.items || {});
  if (curItems && typeof curItems === 'object') {
    Object.values(curItems).forEach(list => {
      (Array.isArray(list) ? list : []).filter(Boolean).forEach(task => {
        const name = typeof task === 'object' && task ? (task.task || task.title || task.name || task.text) : task;
        if (name && !allTasks.includes(name)) allTasks.push(name);
      });
    });
  }
  ['daily', 'weekly', 'todo', 'occasionally'].forEach(cat => {
    (state?.items?.[cat] || []).filter(Boolean).forEach(task => { 
      const name = typeof task === 'object' && task ? (task.task || task.title || task.name || task.text) : task;
      if (name && !allTasks.includes(name)) allTasks.push(name); 
    });
  });
  
  const presetsExist = typeof DEFAULT_TASKS_BY_LANG !== 'undefined' && DEFAULT_TASKS_BY_LANG[lang];
  const standardPresetsInCurrentLang = presetsExist 
    ? [...(DEFAULT_TASKS_BY_LANG[lang].daily || []), ...(DEFAULT_TASKS_BY_LANG[lang].weekly || []), ...(DEFAULT_TASKS_BY_LANG[lang].occasionally || [])]
    : [];
    
  standardPresetsInCurrentLang.forEach(task => { if (task && !allTasks.includes(task)) allTasks.push(task); });
  allTasks.forEach(task => {
    const opt = document.createElement('option'); opt.value = task; opt.innerText = task; select.appendChild(opt);
  });
}

function onHelperSelectTask() {
  const select = document.getElementById('helper-task-select');
  const val = select ? select.value : '';
  if (val) { 
    currentActiveTaskRef = { task: val }; 
    generateTaskSteps(val); 
    activeTimerTask = val;
    updateActiveTimerLabels();
  }
}

function isEveningTeethTask(taskText) {
  const text = String(taskText).toLowerCase();
  return text.includes('zähne abends') || 
         text.includes('teeth (evening)') || 
         text.includes('dientes (noche)') || 
         text.includes('δόντια βράδυ');
}

function isHouseworkTask(taskText) {
  const text = String(taskText).toLowerCase();
  return /saugen|wischen|spül|wasch|müll|aufräum|tidy|clean|dust|laundry|dish|cook|trash|staub|freg|aspir|sfoug|skoupi|piat|roux|organi|clean/.test(text);
}

let currentWhatNowEnergyLevel = 'med';
let currentWhatNowChosen = null;
let currentWhatNowSelectedMinutes = 25;

function switchWhatNowTab(tabName) {
  const normTab = (tabName === 'dilemma') ? 'dilemma' : 'suggestion';
  const TABS = ['suggestion', 'dilemma'];
  
  TABS.forEach(t => {
    const pane = document.getElementById(`whatnow-pane-${t}`);
    const tabBtn = document.getElementById(`whatnow-tab-${t}`);
    if (pane) {
      if (t === normTab) pane.classList.remove('hidden');
      else pane.classList.add('hidden');
    }
    if (tabBtn) {
      if (t === normTab) {
        tabBtn.className = 'btn-secondary btn-sm px-3.5 py-1.5 rounded-lg text-purple-300 font-bold transition cursor-pointer flex-1 flex items-center justify-center gap-1.5 shadow-xs';
      } else {
        tabBtn.className = 'btn-ghost btn-sm px-3.5 py-1.5 rounded-lg text-gray-400 hover:text-white transition cursor-pointer flex-1 flex items-center justify-center gap-1.5';
      }
    }
  });

  if (normTab === 'dilemma') {
    populateWhatNowDilemmaDefaults();
  }
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function setWhatNowEnergyLevel(level) {
  currentWhatNowEnergyLevel = level;
  const ENERGY_CONFIG = {
    low: {
      active: 'py-1 px-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex flex-col items-center gap-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs',
      inactive: 'py-1 px-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex flex-col items-center gap-0.5 text-gray-400 hover:text-teal-300 bg-white/5 border border-white/5'
    },
    med: {
      active: 'py-1 px-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex flex-col items-center gap-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs',
      inactive: 'py-1 px-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex flex-col items-center gap-0.5 text-gray-400 hover:text-purple-300 bg-white/5 border border-white/5'
    },
    high: {
      active: 'py-1 px-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex flex-col items-center gap-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs',
      inactive: 'py-1 px-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex flex-col items-center gap-0.5 text-gray-400 hover:text-sky-300 bg-white/5 border border-white/5'
    },
    random: {
      active: 'py-1 px-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex flex-col items-center gap-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs',
      inactive: 'py-1 px-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex flex-col items-center gap-0.5 text-gray-400 hover:text-amber-300 bg-white/5 border border-white/5'
    }
  };

  ['low', 'med', 'high', 'random'].forEach(l => {
    const btn = document.getElementById(`whatnow-energy-${l}`);
    if (!btn) return;
    const cfg = ENERGY_CONFIG[l] || ENERGY_CONFIG.med;
    btn.className = (l === level) ? cfg.active : cfg.inactive;
  });

  // Dauer exakt an die gewählte Kategorie koppeln
  if (level === 'low') {
    currentWhatNowSelectedMinutes = 5;
  } else if (level === 'high') {
    currentWhatNowSelectedMinutes = 45;
  } else {
    currentWhatNowSelectedMinutes = 25;
  }

  suggestedTaskNamesInCurrentRun = [];
  pickRandomTask();
}

/**
 * Erlaubt dem Nutzer, die Fokus-Dauer interaktiv selbst zu wählen
 */
function setWhatNowDuration(mins) {
  const num = parseInt(mins, 10);
  if (isNaN(num) || num <= 0) return;
  currentWhatNowSelectedMinutes = num;

  // Alle Chips visuell aktualisieren (im differenzierten Brainstorming & Statistik Filter-Design)
  [5, 15, 25, 45, 60].forEach(m => {
    const chip = document.getElementById(`whatnow-chip-${m}`);
    if (chip) {
      if (m === num) {
        chip.className = 'whatnow-dur-chip py-1 px-2 rounded-lg text-xs font-bold transition cursor-pointer text-center bg-purple-500/25 text-purple-200 border border-purple-400/50 shadow-xs';
      } else {
        chip.className = 'whatnow-dur-chip py-1 px-2 rounded-lg text-xs font-semibold transition cursor-pointer text-center bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5';
      }
    }
  });

  const disp = document.getElementById('whatnow-custom-duration-display');
  if (disp) disp.innerText = `${num} Min.`;

  const metaTimer = document.getElementById('whatnow-meta-timer-label');
  if (metaTimer) metaTimer.innerText = `${num} Min.`;

  const startBtnLabel = document.getElementById('whatnow-start-btn-label');
  if (startBtnLabel) startBtnLabel.innerText = `Fokus starten (${num} Min.)`;
}

/**
 * Startet den Fokus mit der vom Nutzer aktuell ausgewählten Dauer
 */
function startWhatNowCurrentFocus() {
  if (!currentWhatNowChosen || !currentWhatNowChosen.task) return;
  const mins = currentWhatNowSelectedMinutes || 25;
  startInstantGuidedFlow(currentWhatNowChosen.task, currentWhatNowChosen.cat || 'todo', mins);
}

function startZenWithTask(taskText, cat = 'todo', minutes = null) {
  closeHelperModal();
  if (!isMinimalist) {
    toggleMinimalist();
  }
  currentZenTaskInfo = { cat, task: taskText };
  if (typeof window !== 'undefined') window.currentZenTaskInfo = currentZenTaskInfo;
  if (typeof globalThis !== 'undefined') globalThis.currentZenTaskInfo = currentZenTaskInfo;

  const zenTaskText = document.getElementById('zen-task-text');
  const zenCatEl = document.getElementById('zen-task-cat');
  if (zenTaskText) zenTaskText.innerText = taskText;
  if (zenCatEl) zenCatEl.innerText = `${t(cat)}`;
  
  const timerDuration = (minutes && Number.isFinite(minutes) && minutes > 0) ? minutes : 25;
  setTimerPreset(timerDuration);
  startTimer();
  renderZenSubtasks(taskText);
  
  showToast(tr({
    de: `Fokus gestartet: "${taskText}" (${timerDuration} Min.) 🧘`,
    en: `Focus started: "${taskText}" (${timerDuration} min.) 🧘`,
    es: `Enfoque iniciado: "${taskText}" (${timerDuration} min.) 🧘`,
    el: `Η εστίαση ξεκίνησε: "${taskText}" (${timerDuration} λεπ.) 🧘`,
    fr: `Focus démarré : "${taskText}" (${timerDuration} min.) 🧘`,
    it: `Focus avviato: "${taskText}" (${timerDuration} min.) 🧘`
  }));
}

function start2MinKickstart(taskText, cat = 'todo') {
  closeHelperModal();
  if (!isMinimalist) {
    toggleMinimalist();
  }
  currentZenTaskInfo = { cat, task: taskText };
  if (typeof window !== 'undefined') window.currentZenTaskInfo = currentZenTaskInfo;
  if (typeof globalThis !== 'undefined') globalThis.currentZenTaskInfo = currentZenTaskInfo;

  const zenTaskText = document.getElementById('zen-task-text');
  const zenCatEl = document.getElementById('zen-task-cat');
  if (zenTaskText) zenTaskText.innerText = taskText;
  if (zenCatEl) zenCatEl.innerText = `${t(cat)} · 2-Min Kickstart`;
  
  setTimerPreset(2);
  startTimer();
  renderZenSubtasks(taskText);
  
  showToast(tr({
    de: `2-Minuten-Kickstart: Nur anfangen! ⏱️`,
    en: `2-Minute Kickstart: Just start! ⏱️`,
    es: `¡Inicio de 2 minutos: solo empieza! ⏱️`,
    el: `Εκκίνηση 2 λεπτών: Απλά ξεκίνα! ⏱️`,
    fr: `Démarrage 2 min : Juste commencer ! ⏱️`,
    it: `Kickstart di 2 minuti: Inizia subito! ⏱️`
  }));
}

function completeWhatNowTask(cat, taskIndex) {
  if (typeof handleCompleteTask === 'function') {
    handleCompleteTask(cat, taskIndex);
  }
  if (typeof playProceduralSound === 'function') playProceduralSound(3);
  if (typeof triggerCelebration === 'function') triggerCelebration();
  
  showToast(tr({
    de: `Stark gemacht! +30 XP Belohnung 🎉`,
    en: `Great job! +30 XP Reward 🎉`,
    fr: `Bravo ! +30 XP Récompense 🎉`,
    it: `Ottimo lavoro! +30 XP Ricompensa 🎉`,
    es: `¡Excelente! +30 XP Recompensa 🎉`,
    el: `Υπέροχα! +30 XP Επιβράβευση 🎉`
  }));

  setTimeout(() => {
    pickRandomTask();
  }, 200);
}

function populateWhatNowDilemmaDefaults() {
  const inputA = document.getElementById('whatnow-dilemma-a');
  const inputB = document.getElementById('whatnow-dilemma-b');
  if (!inputA || !inputB) return;

  if (!inputA.value.trim() && !inputB.value.trim()) {
    const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : (state?.items || {});
    const all = [];
    ['daily', 'todo', 'weekly', 'occasionally', 'termine'].forEach(cat => {
      (curItems[cat] || []).filter(Boolean).forEach(t => {
        const text = typeof t === 'object' ? (t.task || t.name) : t;
        if (text && !all.includes(text)) all.push(text);
      });
    });

    if (all.length >= 2) {
      inputA.value = all[0];
      inputB.value = all[1];
    } else if (all.length === 1) {
      inputA.value = all[0];
      inputB.value = tr({ de: '30 Min Pause & Spaziergang', en: '30 min break & walk' });
    }
  }
}

function flipWhatNowDilemma() {
  const optA = document.getElementById('whatnow-dilemma-a')?.value.trim() || 'Option A';
  const optB = document.getElementById('whatnow-dilemma-b')?.value.trim() || 'Option B';
  const resBox = document.getElementById('whatnow-dilemma-result');
  if (!resBox) return;
  
  resBox.classList.remove('hidden');
  resBox.innerHTML = `
    <div class="flex items-center justify-center gap-2 py-3 text-amber-300 font-bold">
      <span class="text-xl animate-spin">🪙</span>
      <span class="text-xs">Münze dreht sich in der Luft...</span>
    </div>
  `;

  if (typeof playProceduralSound === 'function') playProceduralSound(6);

  setTimeout(() => {
    const winner = Math.random() < 0.5 ? optA : optB;
    const loser = (winner === optA) ? optB : optA;
    const safeWinner = winner.replace(/'/g, "\\'");

    resBox.innerHTML = `
      <div class="space-y-2.5 text-center">
        <div class="text-[10px] uppercase font-bold tracking-wider text-amber-400 font-mono">Die Münze hat entschieden:</div>
        <div class="text-base sm:text-lg font-display font-black text-white px-2 break-words">🏆 ${escapeHtml(winner)}</div>
        <p class="text-[11px] text-gray-300 italic px-2 leading-relaxed">
          Spürst du Erleichterung? Dann starte sofort! Fühlt es sich falsch an? Dann nimm dein echtes Ziel: <strong>${escapeHtml(loser)}</strong>.
        </p>
        <button onclick="startZenWithTask('${safeWinner}', 'todo')" class="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95">
          <i data-lucide="play" class="w-3.5 h-3.5 fill-black"></i>
          <span>Mit "${escapeHtml(winner)}" im Fokus starten ➔</span>
        </button>
      </div>
    `;
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }, 650);
}

/**
 * Schätzt die Dauer einer Aufgabe in Minuten präzise anhand von:
 * 1. Expliziten Task-Attributen (estimatedMinutes, estMinutes, duration)
 * 2. Zeitangaben im Tasktext (z.B. "5 Min", "15m", "1h", "90 min", "2 Stunden")
 * 3. Anzahl der Teilschritte (Checklisten-Umfang)
 * 4. Semantischen Signalwörtern (Quick-Win vs. Deep-Work)
 * 5. Kategorie-Standardwerten
 */
function estimateTaskDuration(rawItem, taskText, cat, totalSteps = 0) {
  const isObj = typeof rawItem === 'object' && rawItem !== null;

  // 1. Explizite numerische Attribute am Objekt
  if (isObj) {
    if (typeof rawItem.estimatedMinutes === 'number' && rawItem.estimatedMinutes > 0) {
      return Math.round(rawItem.estimatedMinutes);
    }
    if (typeof rawItem.estMinutes === 'number' && rawItem.estMinutes > 0) {
      return Math.round(rawItem.estMinutes);
    }
    if (rawItem.duration) {
      const durStr = String(rawItem.duration).trim();
      const numMatch = durStr.match(/(\d+)/);
      if (numMatch) {
        let mins = parseInt(numMatch[1], 10);
        if (/stunde|std|hour|hr|h\b/i.test(durStr)) mins *= 60;
        if (mins > 0) return mins;
      }
    }
  }

  const text = String(taskText || '').trim();

  // 2. Zeitangaben im Text erkennen
  // a) Stunden: z.B. "(1.5 Std)", "1h", "2 Stunden"
  const hourMatch = text.match(/(?:^|\s|\()(\d+(?:[.,]\d+)?)\s*(?:stunden?|std\.?|hours?|hrs?|h)(?:\b|\)|\.|\/)/i);
  if (hourMatch) {
    const val = parseFloat(hourMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      return Math.round(val * 60);
    }
  }

  // b) Minuten: z.B. "(15 Min.)", "5min", "25 Min", "90m"
  const minMatch = text.match(/(?:^|\s|\()(\d+)\s*(?:minuten?|mins?|m)(?:\b|\)|\.|\/)/i);
  if (minMatch) {
    const val = parseInt(minMatch[1], 10);
    if (!isNaN(val) && val > 0) {
      return val;
    }
  }

  const lower = text.toLowerCase();

  // 3. Teilschritte: Wenn viele Subtasks da sind, ist es Deep Work
  if (totalSteps >= 5) return 50;
  if (totalSteps >= 3) return 30;

  // 4. Signalwörter für Quick Win (2-10 Min)
  const isQuickWord = /(?:^|\b)(?:kurz|quick|anrufen|call|mail|email|e-mail|nachricht|chat|check|überprüfen|pruefen|senden|abschicken|müll|abwasch|spülen|bett|lüften|wasser|medis|medikament|zähne|trinken|überweisen|bezahlen|bestellen|buchen|notieren|aufräumen|ordnen)(?:\b|$)/i.test(lower);
  if (isQuickWord) {
    if (cat === 'daily' || isHouseworkTask(taskText)) return 5;
    return 10;
  }

  // 5. Signalwörter für Deep Work (40+ Min)
  const isDeepWord = /(?:^|\b)(?:deep\s*work|projekt|project|konzept|programmieren|coding|develop|entwickeln|recherche|research|ausarbeiten|schreiben|write|essay|thesis|arbeit|kapitel|analyse|lernen|klausur|prüfung|exam|studie|vorbereitung|präsentation|slides|refactor|architektur)(?:\b|$)/i.test(lower);
  if (isDeepWord) {
    return 50;
  }

  // 6. Kategorie-Standardwerte
  if (cat === 'daily' || isHouseworkTask(taskText)) return 5;
  if (cat === 'occasionally') return 15;
  if (cat === 'work_focus' || cat === 'study_focus') return 25;
  if (cat === 'weekly') return 30;
  if (cat === 'work_backlog' || cat === 'study_modules') return 45;
  if (cat === 'termine') return 20;

  // Standard To-Do
  return 20;
}

/**
 * Intelligente Priorisierungs-Engine fuer "Was nun?"
 * Berechnet fuer jede offene Aufgabe einen qualifizierten Score
 */
function pickRandomTask() {
  const box = document.getElementById('helper-pick-box');
  if (!box) return;

  const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : (state?.items || {});
  const todayISO = new Date().toISOString().split('T')[0];

  const candidatePool = [];

  // Scanne alle Kategorien
  const scanCategories = ['daily', 'todo', 'weekly', 'work_focus', 'work_backlog', 'study_focus', 'study_modules', 'occasionally', 'termine'];
  
  scanCategories.forEach(cat => {
    const list = curItems[cat] || [];
    list.filter(Boolean).forEach((rawItem, idx) => {
      const isObj = typeof rawItem === 'object' && rawItem !== null;
      const taskText = isObj ? (rawItem.task || rawItem.name || '') : String(rawItem || '');
      if (!taskText || isEveningTeethTask(taskText)) return;

      // Status ueberpruefen (z.B. bei Terminen)
      if (isObj && (rawItem.status === 'stattgefunden' || rawItem.status === 'nicht_stattgefunden')) return;

      // Termin-Filterung: Zukuenftige Termine duerfen NIEMALS einbezogen werden, ausschliesslich HEUTE!
      const itemDate = isObj ? (rawItem.date || '') : '';
      if (cat === 'termine') {
        if (!itemDate || itemDate !== todayISO) return;
      } else if (itemDate && itemDate > todayISO) {
        return;
      }

      // Berechne Teilschritte
      let stepsCompleted = 0;
      let totalSteps = 0;
      if (state.customSteps && state.customSteps[taskText]) {
        totalSteps = state.customSteps[taskText].length;
        stepsCompleted = (state.completedSteps && state.completedSteps[taskText]) ? state.completedSteps[taskText].length : 0;
      }

      // Basis-Dauer präzise gemäß Text, Attributen und Kategorie schätzen
      const estMinutes = estimateTaskDuration(rawItem, taskText, cat, totalSteps);

      // Executive Scoring
      let score = 50;
      let reasonKey = 'smart_recommendation';
      let reasonLabel = '💡 Smarter Fokus-Vorschlag';

      // 1. Termine/Deadlines von heute
      if (cat === 'termine' || itemDate === todayISO) {
        score += 80;
        reasonKey = 'due_today';
        reasonLabel = '📌 Heute fällig';
      }

      // 2. Explizit hohe Priorität
      const isHighPrio = isObj && (rawItem.priority === 'high' || rawItem.prio === 'high' || rawItem.isUrgent);
      if (isHighPrio) {
        score += 60;
        reasonKey = 'high_priority';
        reasonLabel = '🔥 Hohe Priorität';
      }

      // 3. Bereits angefangene Aufgaben mit Checklisten-Fortschritt
      if (totalSteps > 0 && stepsCompleted > 0 && stepsCompleted < totalSteps) {
        score += 45;
        reasonKey = 'in_progress';
        reasonLabel = `🪜 In Arbeit (${stepsCompleted}/${totalSteps} Schritte)`;
      }

      // 4. Kategorie-Gewichtung
      if (cat === 'daily' || cat === 'work_focus') score += 30;
      else if (cat === 'todo') score += 20;

      candidatePool.push({
        cat,
        idx,
        task: taskText,
        estMinutes,
        score,
        reasonLabel,
        totalSteps,
        stepsCompleted,
        isHousework: isHouseworkTask(taskText)
      });
    });
  });

  // Filter nach aktuellem Energie-Level
  let filteredCandidates = candidatePool.filter(c => !suggestedTaskNamesInCurrentRun.includes(c.task));
  if (filteredCandidates.length === 0 && candidatePool.length > 0) {
    suggestedTaskNamesInCurrentRun = [];
    filteredCandidates = [...candidatePool];
  }

  if (currentWhatNowEnergyLevel === 'low') {
    // ⚡ QUICK WIN: Dauer <= 12 Min. (Dailies, Haushalt, Teilschritte, kurze To-Dos)
    const quickPool = filteredCandidates.filter(c => c.estMinutes <= 12 || c.cat === 'daily' || c.isHousework);
    const poolToUse = quickPool.length > 0 ? quickPool : filteredCandidates;
    poolToUse.sort((a, b) => {
      if (quickPool.length === 0) return a.estMinutes - b.estMinutes;
      return b.score - a.score;
    });
    filteredCandidates = poolToUse;
  } else if (currentWhatNowEnergyLevel === 'high') {
    // 🧠 DEEP WORK: Dauer >= 35 Min. (Projekte, Backlog, viele Teilschritte, lange Tasks)
    const deepPool = filteredCandidates.filter(c => c.estMinutes >= 35 || c.cat === 'work_backlog' || c.cat === 'study_modules' || c.totalSteps >= 4);
    const poolToUse = deepPool.length > 0 ? deepPool : filteredCandidates;
    poolToUse.sort((a, b) => {
      if (deepPool.length === 0) return b.estMinutes - a.estMinutes;
      return b.score - a.score;
    });
    filteredCandidates = poolToUse;
  } else if (currentWhatNowEnergyLevel === 'random') {
    // 🎲 ZUFALL: Zufällig gemischt
    filteredCandidates.sort(() => Math.random() - 0.5);
  } else {
    // 🎯 FOKUS: Standard Fokus-Aufgaben (12 - 35 Min.)
    const focusPool = filteredCandidates.filter(c => c.estMinutes >= 12 && c.estMinutes <= 35);
    const poolToUse = focusPool.length > 0 ? focusPool : filteredCandidates;
    poolToUse.sort((a, b) => b.score - a.score);
    filteredCandidates = poolToUse;
  }

  const chosen = filteredCandidates[0] || null;
  currentWhatNowChosen = chosen;

  if (!chosen) {
    const doneMsg = tr({ 
      de: 'Alle Aufgaben für heute erledigt. Gute Arbeit!', 
      en: 'All tasks for today completed. Well done!', 
      es: 'Todas las tareas completadas. ¡Buen trabajo!', 
      el: 'Όλες οι εργασίες ολοκληρώθηκαν. Καλή δουλειά!' 
    });

    box.className = "p-6 rounded-3xl bg-[#13131c]/90 border border-emerald-500/30 text-center space-y-3.5 shadow-[0_0_40px_rgba(16,185,129,0.1)]";
    box.innerHTML = `
      <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mx-auto shadow-sm">
        <i data-lucide="check-circle-2" class="w-6 h-6"></i>
      </div>
      <div class="text-white font-display font-bold text-base leading-snug">${doneMsg}</div>
      <p class="text-xs text-gray-400 max-w-sm mx-auto">Keine offenen Aufgaben in dieser Kategorie. Möchtest du im Zen-Modus frei fokussieren?</p>
      <button onclick="startInstantGuidedFlow('Freie Fokus-Session', 'todo', 25)" class="mt-2 py-2.5 px-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black rounded-2xl text-xs transition cursor-pointer shadow-lg active:scale-95">
        Freie Fokus-Session starten 🧘
      </button>
    `;
    activeTimerTask = "";
    updateActiveTimerLabels();
    return;
  }

  suggestedTaskNamesInCurrentRun.push(chosen.task);
  activeTimerTask = chosen.task;
  updateActiveTimerLabels();

  // Ermittle Teilschritte
  const steps = (typeof getTaskStepsList === 'function') ? getTaskStepsList(chosen.task) : [];
  const completedIndices = (state.completedSteps && state.completedSteps[chosen.task]) ? state.completedSteps[chosen.task] : [];
  let firstStep = "Arbeitsplatz vorbereiten und für 2 Minuten fokussieren.";
  if (steps && steps.length > 0) {
    firstStep = (typeof cleanStepText === 'function') ? cleanStepText(steps[0]) : steps[0];
  }

  const safeTask = chosen.task.replace(/'/g, "\\'");
  const catLabel = typeof t === 'function' ? t(chosen.cat) : chosen.cat;

  let stepsListHtml = '';
  if (steps && steps.length > 0) {
    stepsListHtml = `
      <div class="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
        <div class="flex items-center justify-between text-[10px] text-amber-300 font-bold uppercase tracking-wider">
          <span class="flex items-center gap-1"><i data-lucide="footprints" class="w-3 h-3 text-amber-400"></i> Teilschritte (${completedIndices.length}/${steps.length})</span>
          <span class="text-[9px] text-gray-400">Direkt anklickbar</span>
        </div>
        <div class="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
          ${steps.map((st, sIdx) => {
            const isDone = completedIndices.includes(sIdx);
            const clText = (typeof cleanStepText === 'function') ? cleanStepText(st) : st;
            return `
              <div onclick="if(typeof toggleCustomStepCheck==='function'){toggleCustomStepCheck('${safeTask}', ${sIdx}, event); pickRandomTask();}" class="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 hover:bg-white/5 border border-white/5 transition cursor-pointer text-left">
                <input type="checkbox" ${isDone ? 'checked' : ''} onclick="event.stopPropagation(); if(typeof toggleCustomStepCheck==='function'){toggleCustomStepCheck('${safeTask}', ${sIdx}, event); pickRandomTask();}" class="w-3.5 h-3.5 accent-amber-400 rounded cursor-pointer shrink-0" />
                <span class="text-[11px] leading-snug break-words ${isDone ? 'line-through text-emerald-400 opacity-60' : 'text-gray-200'}">${escapeHtml(clText)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  box.className = "p-3 sm:p-4 rounded-2xl bg-white/[0.025] border border-white/10 space-y-2.5 text-left transition-all duration-300";
  box.innerHTML = `
    <!-- Bento Header: Kategorie, Dauer & Begründung -->
    <div class="flex items-center justify-between gap-1.5 text-xs flex-wrap">
      <div class="flex items-center gap-1.5">
        <span class="px-2 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 font-mono shadow-xs">
          <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
          ${escapeHtml(catLabel)}
        </span>
        <span class="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-[11px] font-mono font-bold flex items-center gap-1">
          <i data-lucide="timer" class="w-3 h-3 text-purple-400"></i>
          <span id="whatnow-meta-timer-label">${currentWhatNowSelectedMinutes} Min.</span>
        </span>
        ${steps && steps.length > 0 ? `
          <span class="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-amber-300/90 text-[10px] font-mono flex items-center gap-1">
            <i data-lucide="footprints" class="w-3 h-3 text-amber-400"></i>
            <span>${completedIndices.length}/${steps.length} Schritte</span>
          </span>
        ` : ''}
      </div>
      <span class="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 font-medium font-mono shrink-0">
        ${escapeHtml(chosen.reasonLabel.replace(/[💡📌🔥🪜]/g, '').trim())}
      </span>
    </div>

    <!-- Aktueller Vorschlag mit Fokus-Typografie -->
    <div class="space-y-1.5 pt-0.5">
      <h2 class="text-base sm:text-lg font-display font-bold text-white leading-snug tracking-tight break-words">
        ${escapeHtml(chosen.task)}
      </h2>
      <!-- Creative Sparks Bar (wie im Brainstorming Studio) -->
      <div class="p-2 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2 text-xs text-gray-200">
        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-400 shrink-0"></i>
        <span class="truncate leading-normal"><strong class="text-white font-semibold">Schritt 1:</strong> <span class="text-teal-200/90 font-medium">${escapeHtml(firstStep)}</span></span>
      </div>
    </div>

    <!-- Interaktive Dauer-Auswahl (Filter-Chips wie im Brainstorming & Statistik Dashboard) -->
    <div class="p-1.5 sm:p-2 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-1.5">
      <div class="flex items-center gap-1.5 text-xs text-gray-300 shrink-0 font-medium">
        <i data-lucide="clock" class="w-3.5 h-3.5 text-purple-400"></i>
        <span class="text-[11px] font-semibold text-gray-400 hidden sm:inline">Dauer:</span>
        <span id="whatnow-custom-duration-display" class="font-mono font-bold text-purple-300 text-xs px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/30">${currentWhatNowSelectedMinutes} Min.</span>
      </div>
      
      <div class="flex items-center gap-1">
        ${[5, 15, 25, 45, 60].map(m => {
          const isActive = (m === currentWhatNowSelectedMinutes);
          const chipCls = isActive 
            ? 'whatnow-dur-chip py-1 px-2 rounded-lg text-xs font-bold transition cursor-pointer text-center bg-purple-500/25 text-purple-200 border border-purple-400/50 shadow-xs' 
            : 'whatnow-dur-chip py-1 px-2 rounded-lg text-xs font-semibold transition cursor-pointer text-center bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5';
          return `<button type="button" onclick="setWhatNowDuration(${m})" id="whatnow-chip-${m}" class="${chipCls}">${m} Min</button>`;
        }).join('')}
      </div>
    </div>

    <!-- Hauptaktionen: Fokus starten & Anderer Vorschlag -->
    <div class="pt-0.5 space-y-1.5">
      <div class="grid grid-cols-2 gap-2">
        <!-- 1. Fokus starten: btn-primary mit edlem Violett/Indigo Design -->
        <button id="whatnow-start-btn" onclick="startWhatNowCurrentFocus()" class="btn-primary w-full py-2.5 px-3 font-bold text-xs rounded-xl transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-md">
          <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i>
          <span id="whatnow-start-btn-label">Fokus starten (${currentWhatNowSelectedMinutes} Min.)</span>
          <kbd class="hidden sm:inline px-1 py-0.5 rounded bg-black/30 border border-white/15 text-[9px] font-mono font-bold opacity-80">[Space]</kbd>
        </button>

        <!-- 2. Anderer Vorschlag: btn-secondary im stilvollen Brainstorming/Statistik Look -->
        <button id="helper-pick-next-btn" onclick="pickRandomTask()" class="btn-secondary w-full py-2.5 px-3 text-purple-200 hover:text-white font-bold text-xs rounded-xl transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs" title="Anderen Vorschlag laden [W]">
          <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-purple-300"></i>
          <span>Anderer Vorschlag</span>
          <kbd class="hidden sm:inline px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] font-mono text-purple-300/80">[W]</kbd>
        </button>
      </div>

      <!-- Footer-Aktionen: Erledigen & Info -->
      <div class="flex items-center justify-between gap-2 text-[10.5px] px-0.5 pt-0.5">
        <button onclick="completeWhatNowTask('${chosen.cat}', ${chosen.idx})" class="py-1 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 border border-emerald-500/25 font-semibold transition flex items-center gap-1 cursor-pointer active:scale-95">
          <i data-lucide="check" class="w-3 h-3 text-emerald-400"></i>
          <span>Schon erledigt? Abhaken</span>
        </button>
        <span class="text-gray-400 truncate hidden sm:inline flex items-center gap-1">
          <i data-lucide="sparkles" class="w-3 h-3 text-teal-400"></i>
          <span>Startet den Timer im Zen-Fokus</span>
        </span>
      </div>
    </div>
  `;
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

/**
 * Startet den geführten Instant-Start Modus fuer ungeduldige Nutzer:
 * Stellt den passenden Timer ein, schaltet in den Fokus und verbindet zur naechsten Aufgabe nach Abschluss.
 */
function startInstantGuidedFlow(taskName, category, estMinutes = 20) {
  if (typeof window !== 'undefined') window._isGuidedFlowActive = true;
  const minutesToSet = Math.max(2, Math.min(120, estMinutes || 20));
  if (typeof startZenWithTask === 'function') {
    startZenWithTask(taskName, category, minutesToSet);
  } else {
    if (typeof setTimerPreset === 'function') setTimerPreset(minutesToSet);
    if (typeof startTimer === 'function') startTimer();
    if (typeof closeHelperModal === 'function') closeHelperModal();
    if (typeof showToast === 'function') {
      showToast(tr({
        de: `⚡ Fokus gestartet: "${taskName}" (${minutesToSet} Min.)`,
        en: `⚡ Focus started: "${taskName}" (${minutesToSet} min.)`
      }));
    }
  }
}
if (typeof window !== 'undefined') {
  window.openHelperModal = openHelperModal;
  window.openTaskStepsModal = openTaskStepsModal;
  window.closeHelperModal = closeHelperModal;
  window.populateHelperTaskSelect = populateHelperTaskSelect;
  window.onHelperSelectTask = onHelperSelectTask;
  window.speakText = speakText;
  window.stopSpeaking = stopSpeaking;
  window.cleanStepText = cleanStepText;
  window.switchWhatNowTab = switchWhatNowTab;
  window.setWhatNowEnergyLevel = setWhatNowEnergyLevel;
  window.setWhatNowDuration = setWhatNowDuration;
  window.startWhatNowCurrentFocus = startWhatNowCurrentFocus;
  window.startZenWithTask = startZenWithTask;
  window.start2MinKickstart = start2MinKickstart;
  window.completeWhatNowTask = completeWhatNowTask;
  window.populateWhatNowDilemmaDefaults = populateWhatNowDilemmaDefaults;
  window.flipWhatNowDilemma = flipWhatNowDilemma;
  window.pickRandomTask = pickRandomTask;
  window.startInstantGuidedFlow = startInstantGuidedFlow;
}
if (typeof globalThis !== 'undefined') {
  globalThis.openHelperModal = openHelperModal;
  globalThis.openTaskStepsModal = openTaskStepsModal;
  globalThis.closeHelperModal = closeHelperModal;
  globalThis.populateHelperTaskSelect = populateHelperTaskSelect;
  globalThis.onHelperSelectTask = onHelperSelectTask;
  globalThis.speakText = speakText;
  globalThis.stopSpeaking = stopSpeaking;
  globalThis.cleanStepText = cleanStepText;
  globalThis.switchWhatNowTab = switchWhatNowTab;
  globalThis.setWhatNowEnergyLevel = setWhatNowEnergyLevel;
  globalThis.setWhatNowDuration = setWhatNowDuration;
  globalThis.startWhatNowCurrentFocus = startWhatNowCurrentFocus;
  globalThis.startZenWithTask = startZenWithTask;
  globalThis.start2MinKickstart = start2MinKickstart;
  globalThis.completeWhatNowTask = completeWhatNowTask;
  globalThis.populateWhatNowDilemmaDefaults = populateWhatNowDilemmaDefaults;
  globalThis.flipWhatNowDilemma = flipWhatNowDilemma;
  globalThis.pickRandomTask = pickRandomTask;
  globalThis.startInstantGuidedFlow = startInstantGuidedFlow;
}



