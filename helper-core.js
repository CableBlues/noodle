/**
 * @file helper-core.js
 * @module ExecutiveHelperCore
 * @description
 * Kernlogik des „Was nun?"-Entscheidungsassistenten (`#helper-pick-modal`):
 * Energiebasierte Aufgaben-Empfehlung (Quick Win, Fokus, Deep Work),
 * A-vs.-B-Münzwurf-Entscheider sowie Sprachausgabe-Unterstützung.
 */
let currentActiveTaskRef = null;
let currentGeneratedSteps = [];
let currentDopamineTask = null;

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

function openHelperModal(type) {
  if (type === 'pick') {
    const modal = document.getElementById('helper-pick-modal');
    if (modal) modal.classList.remove('hidden');
    suggestedTaskNamesInCurrentRun = []; 
    resetDopamineBox(); 
    pickRandomTask();
  } else if (type === 'steps') {
    const modal = document.getElementById('helper-steps-modal');
    if (modal) modal.classList.remove('hidden');
    populateHelperTaskSelect();
  }
}

function openTaskStepsModal(category, index, event) {
  if (event) event.stopPropagation();
  const raw = state?.items?.[category]?.[index]; if (!raw) return;
  const task = typeof raw === 'object' ? raw.task : raw;
  currentActiveTaskRef = { category, index, task };
  openHelperModal('steps');
  const select = document.getElementById('helper-task-select');
  if (select) {
    let found = false;
    for (let opt of select.options) {
      if (opt.value === task) { select.value = task; found = true; break; }
    }
    if (!found) select.value = '';
  }
  generateTaskSteps(task);
}

function closeHelperModal() {
  const pickModal = document.getElementById('helper-pick-modal');
  const stepsModal = document.getElementById('helper-steps-modal');
  if (pickModal) pickModal.classList.add('hidden');
  if (stepsModal) stepsModal.classList.add('hidden');
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
  ['daily', 'weekly', 'todo', 'occasionally'].forEach(cat => {
    (state?.items?.[cat] || []).filter(Boolean).forEach(task => { 
      const name = typeof task === 'object' ? task.task : task;
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
        tabBtn.className = 'py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/25 to-amber-600/25 border border-amber-400/40 text-amber-200 text-center transition cursor-pointer flex items-center justify-center gap-2 shadow-sm font-bold';
      } else {
        tabBtn.className = 'py-2 px-3 rounded-xl text-gray-400 hover:text-white text-center transition cursor-pointer flex items-center justify-center gap-2 border border-transparent font-bold';
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
  ['low', 'med', 'high', 'random'].forEach(l => {
    const btn = document.getElementById(`whatnow-energy-${l}`);
    if (!btn) return;
    if (l === level) {
      btn.className = 'py-1.5 px-1.5 rounded-xl text-[10px] font-bold text-amber-200 bg-amber-500/20 border border-amber-500/40 transition cursor-pointer flex flex-col items-center gap-0.5 shadow-sm';
    } else {
      btn.className = 'py-1.5 px-1.5 rounded-xl text-[10px] font-bold text-gray-400 hover:text-white transition cursor-pointer flex flex-col items-center gap-0.5 border border-transparent';
    }
  });
  suggestedTaskNamesInCurrentRun = [];
  pickRandomTask();
}

function startZenWithTask(taskText, cat = 'todo') {
  closeHelperModal();
  if (!isMinimalist) {
    toggleMinimalist();
  }
  currentZenTaskInfo = { cat, task: taskText };
  const zenTaskText = document.getElementById('zen-task-text');
  const zenCatEl = document.getElementById('zen-task-cat');
  if (zenTaskText) zenTaskText.innerText = taskText;
  if (zenCatEl) zenCatEl.innerText = `${t(cat)}`;
  
  setTimerPreset(25);
  startTimer();
  renderZenSubtasks(taskText);
  
  showToast(tr({
    de: `Fokus gestartet: "${taskText}" 🧘`,
    en: `Focus started: "${taskText}" 🧘`,
    es: `Enfoque iniciado: "${taskText}" 🧘`,
    el: `Η εστίαση ξεκίνησε: "${taskText}" 🧘`,
    fr: `Focus démarré : "${taskText}" 🧘`,
    it: `Focus avviato: "${taskText}" 🧘`
  }));
}

function start2MinKickstart(taskText, cat = 'todo') {
  closeHelperModal();
  if (!isMinimalist) {
    toggleMinimalist();
  }
  currentZenTaskInfo = { cat, task: taskText };
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

      // Basis-Dauer schaetzen
      let estMinutes = 20;
      if (cat === 'daily' || isHouseworkTask(taskText)) estMinutes = 10;
      else if (cat === 'todo' || cat === 'work_backlog') estMinutes = 30;
      if (isObj && rawItem.estimatedMinutes) estMinutes = rawItem.estimatedMinutes;

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
    // Quick Win: 2-5 Min (bevorzugt kurze Tasks, Dailies, Haushalt, oder Teilschritte)
    filteredCandidates.sort((a, b) => {
      const aQuick = (a.estMinutes <= 10 || a.cat === 'daily' || a.isHousework) ? 1 : 0;
      const bQuick = (b.estMinutes <= 10 || b.cat === 'daily' || b.isHousework) ? 1 : 0;
      return (bQuick * 100 + b.score) - (aQuick * 100 + a.score);
    });
  } else if (currentWhatNowEnergyLevel === 'high') {
    // Deep Work: 45+ Min (bevorzugt grosse To-Dos, Projekte)
    filteredCandidates.sort((a, b) => {
      const aDeep = (a.cat === 'todo' || a.cat === 'work_backlog' || a.estMinutes >= 25) ? 1 : 0;
      const bDeep = (b.cat === 'todo' || b.cat === 'work_backlog' || b.estMinutes >= 25) ? 1 : 0;
      return (bDeep * 100 + b.score) - (aDeep * 100 + a.score);
    });
  } else if (currentWhatNowEnergyLevel === 'random') {
    // Zufall
    filteredCandidates.sort(() => Math.random() - 0.5);
  } else {
    // Standard 'med' (Fokus): Höchster Score gewinnt
    filteredCandidates.sort((a, b) => b.score - a.score);
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

    box.className = "p-6 rounded-2xl bg-black/40 border border-emerald-500/30 text-center space-y-3";
    box.innerHTML = `
      <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mx-auto shadow-sm">
        <i data-lucide="check-circle-2" class="w-5 h-5"></i>
      </div>
      <div class="text-emerald-300 font-display font-bold text-sm leading-snug">${doneMsg}</div>
      <button onclick="startZenWithTask('Freie Fokus-Session', 'todo')" class="mt-2 py-2 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition cursor-pointer">
        Freie Fokus-Session starten
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
        <div class="flex items-center justify-between text-[10px] text-purple-300 font-bold uppercase tracking-wider">
          <span class="flex items-center gap-1"><i data-lucide="footprints" class="w-3 h-3 text-purple-400"></i> Teilschritte (${completedIndices.length}/${steps.length})</span>
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

  box.className = "p-5 rounded-2xl bg-[#14141e] border border-white/10 shadow-xl space-y-4 text-left transition-all duration-300";
  box.innerHTML = `
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300 font-semibold text-[10px] uppercase tracking-wider font-mono">
          ${escapeHtml(catLabel)}
        </span>
        <span class="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-[10px] font-mono">
          ~${chosen.estMinutes} Min
        </span>
      </div>
      <span class="text-[9px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 font-medium font-mono">
        ${escapeHtml(chosen.reasonLabel.replace(/[💡📌🔥🪜]/g, '').trim())}
      </span>
    </div>

    <!-- Task Title -->
    <div>
      <h2 class="text-xl sm:text-2xl font-display font-bold text-white leading-tight tracking-tight break-words">
        ${escapeHtml(chosen.task)}
      </h2>
      <div class="mt-2.5 flex items-start gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-gray-300 font-medium">
        <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0"></i>
        <span class="leading-relaxed"><strong class="text-white">Erster Schritt:</strong> ${escapeHtml(firstStep)}</span>
      </div>
    </div>

    ${stepsListHtml}

    <!-- Primary Action Buttons & Instant-Start -->
    <div class="space-y-2 pt-1">
      <button onclick="startInstantGuidedFlow('${safeTask}', '${chosen.cat}', ${chosen.estMinutes})" class="w-full py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.35)] transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-2">
        <i data-lucide="zap" class="w-4 h-4 fill-black"></i>
        <span>⚡ Instant-Start (Geführter Ablauf)</span>
      </button>

      <div class="grid grid-cols-2 gap-2">
        <button onclick="start2MinKickstart('${safeTask}', '${chosen.cat}')" class="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer" title="2-Minuten-Timer starten">
          <i data-lucide="timer" class="w-3.5 h-3.5 text-amber-400"></i>
          <span>2-Min Start</span>
        </button>

        <button onclick="completeWhatNowTask('${chosen.cat}', ${chosen.idx})" class="py-2.5 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer" title="Als erledigt markieren">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          <span>Erledigt</span>
        </button>
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
  if (typeof setTimerPreset === 'function') {
    const minutesToSet = Math.max(2, Math.min(60, estMinutes || 20));
    setTimerPreset(minutesToSet);
  }
  if (typeof startZenWithTask === 'function') {
    startZenWithTask(taskName, category);
  } else if (typeof startTimer === 'function') {
    startTimer();
  }
  if (typeof closeHelperModal === 'function') closeHelperModal();
  if (typeof showToast === 'function') {
    showToast(tr({
      de: `⚡ Instant-Ablauf gestartet: ${taskName} (${estMinutes} Min.)`,
      en: `⚡ Instant flow started: ${taskName} (${estMinutes} min.)`
    }));
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
  globalThis.startZenWithTask = startZenWithTask;
  globalThis.start2MinKickstart = start2MinKickstart;
  globalThis.completeWhatNowTask = completeWhatNowTask;
  globalThis.populateWhatNowDilemmaDefaults = populateWhatNowDilemmaDefaults;
  globalThis.flipWhatNowDilemma = flipWhatNowDilemma;
  globalThis.pickRandomTask = pickRandomTask;
  globalThis.startInstantGuidedFlow = startInstantGuidedFlow;
}



