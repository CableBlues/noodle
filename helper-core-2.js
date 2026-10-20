/**
 * @file helper-core-2.js
 * @module ExecutiveTaskBreakdown
 * @description
 * Verwaltet die Schritt-für-Schritt-Zerlegung (Micro-Steps) einzelner Aufgaben,
 * benutzerdefinierte Teilschritte (`state.customSteps`) und die Fortschrittsanzeige
 * innerhalb des Aufgaben-Assistenten.
 */
function getTaskStepsList(taskName) {
  if (!taskName) return [];
  if (state.customSteps && state.customSteps[taskName] && state.customSteps[taskName].length > 0) {
    return state.customSteps[taskName];
  }
  const deKey = (typeof getGermanStandardKey === 'function') ? getGermanStandardKey(taskName) : taskName;
  const taskDb = (typeof window !== 'undefined' && window.TASK_STEPS_DATABASE) 
    ? window.TASK_STEPS_DATABASE 
    : ((typeof TASK_STEPS_DATABASE !== 'undefined') ? TASK_STEPS_DATABASE : null);
  const dbExists = taskDb && taskDb[deKey];
  let steps = dbExists ? taskDb[deKey][currentLang] : null;
  if (!steps || steps.length === 0) {
    const templates = (typeof window !== 'undefined' && window.FALLBACK_STEPS) 
      ? window.FALLBACK_STEPS 
      : ((typeof FALLBACK_STEPS !== 'undefined') ? FALLBACK_STEPS : null);
    const template = templates ? (templates[currentLang] || templates['en']) : ["1. {task} vorbereiten", "2. Den ersten Minischritt ausführen", "3. Hauptteil erledigen", "4. Fertigstellen & abhaken!"];
    steps = template.map(step => step.replace('{task}', taskName));
  }
  return steps;
}

function generateTaskSteps(specificTask) {
  let val = specificTask;
  if (!val) {
    const select = document.getElementById('helper-task-select'); val = select ? select.value : '';
  }
  if (!val) {
    const resBox = document.getElementById('helper-steps-result');
    if (resBox) resBox.innerHTML = `<p class="text-xs text-gray-400 italic text-center py-4">${tr({ de: 'Bitte wähle oben eine Aufgabe aus.', en: 'Please select a task.', es: 'Por favor, selecciona una tarea arriba.', el: 'Παρακαλώ επίλεξε μια εργασία παραπάνω.', fr: 'Merci de choisir une tâche ci-dessus.', it: "Seleziona un'attività qui sopra." })}</p>`;
    return;
  }
  if (!currentActiveTaskRef || currentActiveTaskRef.task !== val) currentActiveTaskRef = { task: val };
  const resBox = document.getElementById('helper-steps-result'); if (!resBox) return;
  
  const steps = getTaskStepsList(val);
  currentGeneratedSteps = steps; resBox.innerHTML = '';
  if (!state.completedSteps) state.completedSteps = {};
  const completedIndices = state.completedSteps[val] || [];
  
  if (steps.length === 0) {
    resBox.innerHTML = `<div class="text-center py-3 text-xs text-gray-400">Noch keine Teilschritte vorhanden. Füge unten eigene Schritte hinzu.</div>`;
  } else {
    steps.forEach((stepText, idx) => {
      const isChecked = completedIndices.includes(idx);
      const cleanedText = cleanStepText(stepText);
      
      const stepDiv = document.createElement('div');
      stepDiv.className = `group flex items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all duration-200 ${isChecked ? 'bg-white/[0.02] border-[#00ff66]/20 opacity-80' : 'bg-white/[0.04] border-white/10 hover:border-[#00f2ff]/40'} cursor-pointer`;
      
      stepDiv.innerHTML = `
        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleCustomStepCheck('${val.replace(/'/g, "\\'")}', ${idx}, event)" class="w-4 h-4 rounded text-[var(--accent)] cursor-pointer accent-[var(--accent)] shrink-0" />
        <span class="step-text flex-1 text-xs leading-snug break-words font-medium ${isChecked ? 'line-through text-[#00ff66]' : 'text-[#c0caf5]'}" onclick="toggleCustomStepCheck('${val.replace(/'/g, "\\'")}', ${idx}, event)">${cleanedText}</span>
        <button onclick="deleteCustomStep('${val.replace(/'/g, "\\'")}', ${idx}, event)" aria-label="Schritt entfernen" class="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 rounded transition cursor-pointer shrink-0" title="Schritt entfernen">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      `;
      resBox.appendChild(stepDiv);
    });
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addCustomStepToActiveTask() {
  const input = document.getElementById('helper-new-step-input');
  if (!input || !input.value.trim()) return;
  const newStep = input.value.trim();
  
  let targetTask = currentActiveTaskRef?.task;
  if (!targetTask) {
    const select = document.getElementById('helper-task-select'); 
    targetTask = select ? select.value : '';
  }
  if (!targetTask) {
    showToast(tr({ de: 'Bitte wähle zuerst eine Aufgabe aus!', en: 'Please select a task first!' }));
    return;
  }
  
  if (!state.customSteps) state.customSteps = {};
  if (!state.customSteps[targetTask]) {
    state.customSteps[targetTask] = [...getTaskStepsList(targetTask)];
  }
  
  state.customSteps[targetTask].push(newStep);
  input.value = '';
  saveState();
  generateTaskSteps(targetTask);
  showToast(tr({ de: 'Teilschritt hinzugefügt! 🪜', en: 'Substep added! 🪜' }));
}

function loadDefaultStepSuggestions() {
  let targetTask = currentActiveTaskRef?.task;
  if (!targetTask) {
    const select = document.getElementById('helper-task-select'); 
    targetTask = select ? select.value : '';
  }
  if (!targetTask) return;
  
  const deKey = (typeof getGermanStandardKey === 'function') ? getGermanStandardKey(targetTask) : targetTask;
  const taskDb = (typeof window !== 'undefined' && window.TASK_STEPS_DATABASE) 
    ? window.TASK_STEPS_DATABASE 
    : ((typeof TASK_STEPS_DATABASE !== 'undefined') ? TASK_STEPS_DATABASE : null);
  const dbExists = taskDb && taskDb[deKey];
  let defaultList = dbExists ? taskDb[deKey][currentLang] : null;
  if (!defaultList || defaultList.length === 0) {
    const templates = (typeof window !== 'undefined' && window.FALLBACK_STEPS) 
      ? window.FALLBACK_STEPS 
      : ((typeof FALLBACK_STEPS !== 'undefined') ? FALLBACK_STEPS : null);
    const template = templates ? (templates[currentLang] || templates['en']) : ["1. {task} vorbereiten", "2. Minischritt ausführen", "3. Hauptteil erledigen", "4. Fertigstellen"];
    defaultList = template.map(step => step.replace('{task}', targetTask));
  }
  
  if (!state.customSteps) state.customSteps = {};
  state.customSteps[targetTask] = [...defaultList];
  if (state.completedSteps) delete state.completedSteps[targetTask];
  saveState();
  generateTaskSteps(targetTask);
  showToast(tr({ de: 'Standard-Vorschläge geladen! 💡', en: 'Default suggestions loaded! 💡' }));
}

function deleteCustomStep(taskName, stepIndex, event) {
  if (event) event.stopPropagation();
  if (!state.customSteps) state.customSteps = {};
  if (!state.customSteps[taskName]) {
    state.customSteps[taskName] = [...getTaskStepsList(taskName)];
  }
  state.customSteps[taskName].splice(stepIndex, 1);
  if (state.completedSteps && state.completedSteps[taskName]) {
    state.completedSteps[taskName] = state.completedSteps[taskName].filter(i => i !== stepIndex).map(i => i > stepIndex ? i - 1 : i);
  }
  saveState();
  generateTaskSteps(taskName);
}

function toggleCustomStepCheck(targetTask, stepIndex, event) {
  if (event) event.stopPropagation();
  if (!targetTask) return;
  
  if (!state.completedSteps) state.completedSteps = {};
  if (!state.completedSteps[targetTask]) state.completedSteps[targetTask] = [];
  
  const isCompleted = state.completedSteps[targetTask].includes(stepIndex);
  if (!isCompleted) {
    state.completedSteps[targetTask].push(stepIndex);
    if (typeof playProceduralSound === 'function') playProceduralSound(3);
  } else {
    state.completedSteps[targetTask] = state.completedSteps[targetTask].filter(i => i !== stepIndex);
  }
  
  saveState();
  generateTaskSteps(targetTask);
  
  const steps = getTaskStepsList(targetTask);
  const completedCount = state.completedSteps[targetTask].length;
  if (steps.length > 0 && completedCount === steps.length) {
    setTimeout(() => {
      closeHelperModal(); 
      delete state.completedSteps[targetTask]; 
      saveState();
      
      let targetCat = currentActiveTaskRef?.category;
      let catToUse = targetCat; let idxToUse = -1;
      if (catToUse && state.items[catToUse]) {
        idxToUse = state.items[catToUse].indexOf(targetTask);
      }
      if (idxToUse === -1) {
        for (const cat of ['daily', 'weekly', 'todo', 'occasionally', 'termine']) {
          const idx = (state?.items?.[cat] || []).indexOf(targetTask);
          if (idx !== -1) { catToUse = cat; idxToUse = idx; break; }
        }
      }
      if (catToUse && idxToUse !== -1) {
        handleCompleteTask(catToUse, idxToUse);
      } else {
        if (typeof playProceduralSound === 'function') playProceduralSound(3); 
        if (typeof triggerConfetti === 'function') triggerConfetti();
        if (typeof showPraise === 'function') showPraise();
        showToast(tr({
          de: `🎉 Alle Schritte gelöst! "${targetTask}" ist erledigt!`,
          en: `🎉 All steps completed! "${targetTask}" is done!`
        }));
      }
    }, 400);
  }
}

function startZenFromStepsModal() {
  let targetTask = currentActiveTaskRef?.task;
  if (!targetTask) {
    const select = document.getElementById('helper-task-select'); 
    targetTask = select ? select.value : '';
  }
  closeHelperModal();
  if (targetTask && typeof startZenWithTask === 'function') {
    startZenWithTask(targetTask);
  } else if (typeof toggleZenMode === 'function') {
    toggleZenMode();
  }
}

function triggerDopamineKick() {
  const dopamineTasksObj = (typeof DOPAMINE_TASKS !== 'undefined') ? DOPAMINE_TASKS : null;
  const tips = dopamineTasksObj ? (dopamineTasksObj[currentLang] || dopamineTasksObj['en']) : ["Do 5 jumping jacks."];
  const randomTask = tips[Math.floor(Math.random() * tips.length)];
  currentDopamineTask = randomTask;
  
  const boxEl = document.getElementById('dopamine-task-box');
  if (boxEl) {
    const doneBtnLabel = safeTranslate('dopamine_kick_done');
    const rerollLabel = safeTranslate('dopamine_kick_other');
    
    boxEl.innerHTML = `
      <span id="dopamine-task-text" class="font-bold text-pink-300 text-sm animate-pulse">${randomTask}</span>
      <div class="flex items-center gap-2 w-full mt-2 justify-center">
        <button onclick="completeDopamineKick()" class="px-4 py-1.5 bg-pink-500 hover:bg-pink-400 text-white rounded-lg text-xs font-bold transition cursor-pointer font-sans shadow-md">
          ${doneBtnLabel}
        </button>
        <button onclick="triggerDopamineKick()" class="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-[10px] font-semibold transition cursor-pointer font-sans">
          ${rerollLabel}
        </button>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function completeDopamineKick() {
  if (!currentDopamineTask) return;
  saveHistory();
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const todayStr = now.toISOString().split('T')[0];
  const logText = `${safeTranslate('dopamine_kick_success_log')} ${currentDopamineTask}`;
    
  state.done.push({ task: logText, origin: 'boost', date: todayStr, time: timeStr });
  saveState();
  if (typeof playProceduralSound === 'function') playProceduralSound(3);
  if (typeof triggerConfetti === 'function') triggerConfetti();
  if (typeof showPraise === 'function') showPraise();
  resetDopamineBox();
  if (typeof updateReportPanel === 'function') updateReportPanel();
  showToast(safeTranslate('dopamine_kick_completed_toast'));
}

function resetDopamineBox() {
  currentDopamineTask = null;
  const boxEl = document.getElementById('dopamine-task-box');
  if (boxEl) {
    const title = safeTranslate('dopamine_kick_title');
    const btnLabel = safeTranslate('dopamine_kick_start');
    boxEl.innerHTML = `
      <span id="dopamine-task-text" class="font-bold">${title}</span>
      <div class="flex items-center gap-2 w-full mt-1 justify-center">
        <button onclick="triggerDopamineKick()" class="px-3 py-1.5 bg-pink-500/25 hover:bg-pink-500/40 border border-pink-500/40 text-pink-100 rounded-lg text-[10px] font-bold transition cursor-pointer font-sans">
          ${btnLabel}
        </button>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function openWhatNowModal() {
  const fn = (typeof window !== 'undefined' && window.openHelperModal) || (typeof openHelperModal === 'function' ? openHelperModal : null);
  if (fn) {
    fn('pick');
  } else {
    const modal = document.getElementById('helper-pick-modal');
    if (modal) modal.classList.remove('hidden');
  }
}

if (typeof window !== 'undefined') {
  if (typeof openHelperModal !== 'undefined') window.openHelperModal = openHelperModal;
  if (typeof openWhatNowModal !== 'undefined') window.openWhatNowModal = openWhatNowModal;
  if (typeof closeHelperModal !== 'undefined') window.closeHelperModal = closeHelperModal;
  if (typeof openTaskStepsModal !== 'undefined') window.openTaskStepsModal = openTaskStepsModal;
  if (typeof speakText !== 'undefined') window.speakText = speakText;
  if (typeof stopSpeaking !== 'undefined') window.stopSpeaking = stopSpeaking;
  if (typeof cleanStepText !== 'undefined') window.cleanStepText = cleanStepText;
  if (typeof pickRandomTask !== 'undefined') window.pickRandomTask = pickRandomTask;
  if (typeof generateTaskSteps !== 'undefined') window.generateTaskSteps = generateTaskSteps;
  if (typeof saveStepsToTasks !== 'undefined') window.saveStepsToTasks = saveStepsToTasks;
  if (typeof triggerDopamineKick !== 'undefined') window.triggerDopamineKick = triggerDopamineKick;
  if (typeof completeDopamineKick !== 'undefined') window.completeDopamineKick = completeDopamineKick;
  if (typeof resetDopamineBox !== 'undefined') window.resetDopamineBox = resetDopamineBox;
  if (typeof switchWhatNowTab !== 'undefined') window.switchWhatNowTab = switchWhatNowTab;
  if (typeof setWhatNowEnergyLevel !== 'undefined') window.setWhatNowEnergyLevel = setWhatNowEnergyLevel;
  if (typeof startZenWithTask !== 'undefined') window.startZenWithTask = startZenWithTask;
  if (typeof start2MinKickstart !== 'undefined') window.start2MinKickstart = start2MinKickstart;
  if (typeof completeWhatNowTask !== 'undefined') window.completeWhatNowTask = completeWhatNowTask;
  if (typeof flipWhatNowDilemma !== 'undefined') window.flipWhatNowDilemma = flipWhatNowDilemma;
  if (typeof launchBrainDumpAsFocus !== 'undefined') window.launchBrainDumpAsFocus = launchBrainDumpAsFocus;
  if (typeof saveBrainDumpAsTask !== 'undefined') window.saveBrainDumpAsTask = saveBrainDumpAsTask;
  if (typeof populateWhatNowDilemmaDefaults !== 'undefined') window.populateWhatNowDilemmaDefaults = populateWhatNowDilemmaDefaults;
  if (typeof suggestBoostActivity !== 'undefined') window.suggestBoostActivity = suggestBoostActivity;
}

if (typeof globalThis !== 'undefined') {
  if (typeof openHelperModal !== 'undefined') globalThis.openHelperModal = openHelperModal;
  if (typeof openWhatNowModal !== 'undefined') globalThis.openWhatNowModal = openWhatNowModal;
  if (typeof closeHelperModal !== 'undefined') globalThis.closeHelperModal = closeHelperModal;
  if (typeof openTaskStepsModal !== 'undefined') globalThis.openTaskStepsModal = openTaskStepsModal;
  if (typeof speakText !== 'undefined') globalThis.speakText = speakText;
  if (typeof stopSpeaking !== 'undefined') globalThis.stopSpeaking = stopSpeaking;
  if (typeof cleanStepText !== 'undefined') globalThis.cleanStepText = cleanStepText;
  if (typeof pickRandomTask !== 'undefined') globalThis.pickRandomTask = pickRandomTask;
  if (typeof generateTaskSteps !== 'undefined') globalThis.generateTaskSteps = generateTaskSteps;
  if (typeof saveStepsToTasks !== 'undefined') globalThis.saveStepsToTasks = saveStepsToTasks;
  if (typeof triggerDopamineKick !== 'undefined') globalThis.triggerDopamineKick = triggerDopamineKick;
  if (typeof completeDopamineKick !== 'undefined') globalThis.completeDopamineKick = completeDopamineKick;
  if (typeof resetDopamineBox !== 'undefined') globalThis.resetDopamineBox = resetDopamineBox;
  if (typeof switchWhatNowTab !== 'undefined') globalThis.switchWhatNowTab = switchWhatNowTab;
  if (typeof setWhatNowEnergyLevel !== 'undefined') globalThis.setWhatNowEnergyLevel = setWhatNowEnergyLevel;
  if (typeof startZenWithTask !== 'undefined') globalThis.startZenWithTask = startZenWithTask;
  if (typeof start2MinKickstart !== 'undefined') globalThis.start2MinKickstart = start2MinKickstart;
  if (typeof completeWhatNowTask !== 'undefined') globalThis.completeWhatNowTask = completeWhatNowTask;
  if (typeof flipWhatNowDilemma !== 'undefined') globalThis.flipWhatNowDilemma = flipWhatNowDilemma;
  if (typeof launchBrainDumpAsFocus !== 'undefined') globalThis.launchBrainDumpAsFocus = launchBrainDumpAsFocus;
  if (typeof saveBrainDumpAsTask !== 'undefined') globalThis.saveBrainDumpAsTask = saveBrainDumpAsTask;
  if (typeof populateWhatNowDilemmaDefaults !== 'undefined') globalThis.populateWhatNowDilemmaDefaults = populateWhatNowDilemmaDefaults;
  if (typeof suggestBoostActivity !== 'undefined') globalThis.suggestBoostActivity = suggestBoostActivity;
}
