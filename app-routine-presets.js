// app-routine-presets.js - Interaktiver Routine-Preset & Standard-Aufgaben Manager
// ============================================================================

let currentRoutinePresetTab = 'presets'; // 'presets' | 'custom' | 'suggestions'

function openRoutinePresetsModal(initialTab = 'presets') {
  currentRoutinePresetTab = initialTab;
  let modal = document.getElementById('modal-routine-presets');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-routine-presets';
    modal.className = 'fixed inset-0 z-[160000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none';
    modal.onclick = (e) => {
      if (e.target === modal) closeRoutinePresetsModal();
    };
    document.body.appendChild(modal);
  }

  modal.classList.remove('hidden');
  renderRoutinePresetsModalContent();
  if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
}

function closeRoutinePresetsModal() {
  const modal = document.getElementById('modal-routine-presets');
  if (modal) modal.classList.add('hidden');
}

function setRoutinePresetsTab(tab) {
  currentRoutinePresetTab = tab;
  renderRoutinePresetsModalContent();
}

function renderRoutinePresetsModalContent() {
  const modal = document.getElementById('modal-routine-presets');
  if (!modal) return;

  const curL = (typeof window !== 'undefined' && window.currentLang) ? window.currentLang : (typeof currentLang !== 'undefined' ? currentLang : 'de');
  const tStr = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[curL] || obj['de'] || obj['en'] || Object.values(obj)[0] || '';
  };

  const customDefaults = (typeof getCustomDefaults === 'function') ? getCustomDefaults() : null;
  const hasCustomDefaults = !!customDefaults;

  // Tab Header translations
  const tabs = [
    { id: 'presets', label: curL === 'de' ? '✨ Lifestyle-Presets' : (curL === 'es' ? '✨ Ajustes' : (curL === 'fr' ? '✨ Préréglages' : (curL === 'it' ? '✨ Preset' : (curL === 'el' ? '✨ Πρότυπα' : '✨ Routine Presets')))), icon: 'sparkles' },
    { id: 'custom', label: curL === 'de' ? '🛠️ Standards anpassen' : (curL === 'es' ? '🛠️ Personalizar' : (curL === 'fr' ? '🛠️ Personnaliser' : (curL === 'it' ? '🛠️ Personalizza' : (curL === 'el' ? '🛠️ Προσαρμογή' : '🛠️ Custom Defaults')))), icon: 'sliders' },
    { id: 'suggestions', label: curL === 'de' ? '💡 Inspiration & Ideen' : (curL === 'es' ? '💡 Ideas' : (curL === 'fr' ? '💡 Idées' : (curL === 'it' ? '💡 Ispirazione' : (curL === 'el' ? '💡 Ιδέες' : '💡 Task Inspiration')))), icon: 'lightbulb' }
  ];

  let bodyHtml = '';

  if (currentRoutinePresetTab === 'presets') {
    const presetsList = (typeof ROUTINE_PRESETS !== 'undefined') ? ROUTINE_PRESETS : [];
    bodyHtml = `
      <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
        <p class="text-xs text-gray-300/80 leading-relaxed mb-3">
          ${curL === 'de' 
            ? 'Wähle einen Alltagstyp, der zu deinem Lebensstil passt. Du kannst die Aufgaben jederzeit anpassen oder als deinen persönlichen Standard speichern.' 
            : 'Choose an archetype matching your daily rhythm. You can fine-tune tasks anytime or save them as your personal defaults.'}
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${presetsList.map(p => {
            const pName = tStr(p.name);
            const pTagline = tStr(p.tagline);
            const pBadge = tStr(p.badge);
            const dailyTasks = (p.tasks?.daily?.[curL] || p.tasks?.daily?.['de'] || p.tasks?.daily?.['en'] || []);
            const weeklyTasks = (p.tasks?.weekly?.[curL] || p.tasks?.weekly?.['de'] || p.tasks?.weekly?.['en'] || []);
            const count = dailyTasks.length + weeklyTasks.length;

            return `
              <div class="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between gap-3 group relative overflow-hidden">
                <div class="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br ${p.color} opacity-20 rounded-full blur-xl pointer-events-none group-hover:opacity-30 transition"></div>
                
                <div>
                  <div class="flex items-center justify-between gap-2 mb-1.5">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-xl bg-gradient-to-br ${p.color} p-0.5 flex items-center justify-center text-white shadow-md">
                        <div class="w-full h-full bg-[#111118]/80 rounded-[10px] flex items-center justify-center">
                          <i data-lucide="${p.icon}" class="w-4 h-4 text-white"></i>
                        </div>
                      </div>
                      <h4 class="text-xs font-bold text-white leading-tight">${pName}</h4>
                    </div>
                    ${pBadge ? `<span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">${pBadge}</span>` : ''}
                  </div>
                  <p class="text-[11px] text-gray-400 mb-2 leading-snug">${pTagline}</p>
                  
                  <div class="flex flex-wrap gap-1 mb-2">
                    ${dailyTasks.slice(0, 4).map(t => `<span class="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] text-gray-300">${t}</span>`).join('')}
                    ${dailyTasks.length > 4 ? `<span class="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-[9px] text-purple-300 font-mono">+${dailyTasks.length - 4}</span>` : ''}
                  </div>
                </div>

                <div class="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button onclick="applyRoutinePreset('${p.id}', false)" class="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] font-bold transition cursor-pointer active:scale-95 flex items-center justify-center gap-1">
                    <i data-lucide="play" class="w-3 h-3"></i>
                    <span>${curL === 'de' ? 'Jetzt anwenden' : 'Apply to Board'}</span>
                  </button>
                  <button onclick="applyRoutinePreset('${p.id}', true)" class="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-[11px] font-black transition cursor-pointer shadow-md shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-1">
                    <i data-lucide="check" class="w-3 h-3"></i>
                    <span>${curL === 'de' ? 'Als Standard setzen' : 'Set as Default'}</span>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } else if (currentRoutinePresetTab === 'custom') {
    const activeDaily = (customDefaults && Array.isArray(customDefaults.daily)) 
      ? customDefaults.daily 
      : ((typeof DEFAULT_TASKS_BY_LANG !== 'undefined' && DEFAULT_TASKS_BY_LANG[curL]?.daily) || []);
    const activeWeekly = (customDefaults && Array.isArray(customDefaults.weekly)) 
      ? customDefaults.weekly 
      : ((typeof DEFAULT_TASKS_BY_LANG !== 'undefined' && DEFAULT_TASKS_BY_LANG[curL]?.weekly) || []);
    const activeOccasionally = (customDefaults && Array.isArray(customDefaults.occasionally)) 
      ? customDefaults.occasionally 
      : ((typeof DEFAULT_TASKS_BY_LANG !== 'undefined' && DEFAULT_TASKS_BY_LANG[curL]?.occasionally) || []);

    bodyHtml = `
      <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
        <div class="flex items-center justify-between gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
          <div class="flex items-center gap-2 text-xs text-purple-200">
            <i data-lucide="info" class="w-4 h-4 text-purple-400 shrink-0"></i>
            <span>${curL === 'de' 
              ? 'Passe hier deine Standard-Vorlagen an. Jedes Mal, wenn du deinen Tages- oder Haushaltsplan neu lädst, werden genau diese Aufgaben genutzt!' 
              : 'Customize your personal default templates. Whenever you reload your daily or weekly plan, your chosen tasks will appear!'}</span>
          </div>
          ${hasCustomDefaults ? `
            <button onclick="resetUserDefaultsToOfficial()" class="px-2.5 py-1 text-[10px] font-mono font-bold bg-white/5 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl transition cursor-pointer shrink-0">
              ${curL === 'de' ? 'Zurücksetzen' : 'Reset'}
            </button>
          ` : ''}
        </div>

        <!-- Section: Daily Tasks -->
        <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-white flex items-center gap-1.5">
              <i data-lucide="sun" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>${curL === 'de' ? 'Tages-Standardaufgaben (Heute)' : 'Daily Default Tasks (Today)'}</span>
            </h4>
            <span class="text-[10px] font-mono text-purple-300 font-bold">${activeDaily.length} aktiv</span>
          </div>
          <div class="flex flex-wrap gap-1.5" id="custom-chips-daily">
            ${activeDaily.map((t, idx) => `
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-500/40 text-xs font-semibold">
                <span>${t}</span>
                <button onclick="removeCustomDefaultChip('daily', ${idx})" class="hover:text-rose-400 cursor-pointer transition p-0.5">
                  <i data-lucide="x" class="w-3 h-3"></i>
                </button>
              </span>
            `).join('')}
          </div>
          <div class="flex items-center gap-2 pt-1">
            <input type="text" id="input-new-custom-daily" placeholder="${curL === 'de' ? 'Neue Tagesaufgabe hinzufügen...' : 'Add daily task...'}" class="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none" onkeydown="if(event.key==='Enter') addCustomDefaultChip('daily')">
            <button onclick="addCustomDefaultChip('daily')" class="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer">
              +
            </button>
          </div>
        </div>

        <!-- Section: Weekly Tasks -->
        <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-white flex items-center gap-1.5">
              <i data-lucide="home" class="w-3.5 h-3.5 text-teal-400"></i>
              <span>${curL === 'de' ? 'Wöchentlicher Haushalt-Standard' : 'Weekly Household Defaults'}</span>
            </h4>
            <span class="text-[10px] font-mono text-teal-300 font-bold">${activeWeekly.length} aktiv</span>
          </div>
          <div class="flex flex-wrap gap-1.5" id="custom-chips-weekly">
            ${activeWeekly.map((t, idx) => `
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-500/20 text-teal-200 border border-teal-500/40 text-xs font-semibold">
                <span>${t}</span>
                <button onclick="removeCustomDefaultChip('weekly', ${idx})" class="hover:text-rose-400 cursor-pointer transition p-0.5">
                  <i data-lucide="x" class="w-3 h-3"></i>
                </button>
              </span>
            `).join('')}
          </div>
          <div class="flex items-center gap-2 pt-1">
            <input type="text" id="input-new-custom-weekly" placeholder="${curL === 'de' ? 'Neue Haushaltsaufgabe hinzufügen...' : 'Add weekly task...'}" class="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-teal-400 focus:outline-none" onkeydown="if(event.key==='Enter') addCustomDefaultChip('weekly')">
            <button onclick="addCustomDefaultChip('weekly')" class="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition cursor-pointer">
              +
            </button>
          </div>
        </div>

        <!-- Section: Occasionally Tasks -->
        <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-white flex items-center gap-1.5">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-indigo-400"></i>
              <span>${curL === 'de' ? 'Gelegentlich / Zyklische Aufgaben' : 'Occasional Tasks'}</span>
            </h4>
            <span class="text-[10px] font-mono text-indigo-300 font-bold">${activeOccasionally.length} aktiv</span>
          </div>
          <div class="flex flex-wrap gap-1.5" id="custom-chips-occasionally">
            ${activeOccasionally.map((t, idx) => `
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 text-xs font-semibold">
                <span>${t}</span>
                <button onclick="removeCustomDefaultChip('occasionally', ${idx})" class="hover:text-rose-400 cursor-pointer transition p-0.5">
                  <i data-lucide="x" class="w-3 h-3"></i>
                </button>
              </span>
            `).join('')}
          </div>
          <div class="flex items-center gap-2 pt-1">
            <input type="text" id="input-new-custom-occasionally" placeholder="${curL === 'de' ? 'Neue zyklische Aufgabe hinzufügen...' : 'Add occasional task...'}" class="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none" onkeydown="if(event.key==='Enter') addCustomDefaultChip('occasionally')">
            <button onclick="addCustomDefaultChip('occasionally')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer">
              +
            </button>
          </div>
        </div>

        <!-- Save current Board to defaults -->
        <div class="pt-2 flex items-center gap-2.5">
          <button onclick="saveCurrentBoardAsCustomDefaults()" class="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-purple-500/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5">
            <i data-lucide="save" class="w-3.5 h-3.5"></i>
            <span>${curL === 'de' ? 'Aktuelles Board als neuen Standard sichern' : 'Save Current Board as Defaults'}</span>
          </button>
        </div>
      </div>
    `;
  } else if (currentRoutinePresetTab === 'suggestions') {
    const catalog = (typeof TASK_SUGGESTIONS_CATALOG !== 'undefined') ? TASK_SUGGESTIONS_CATALOG : {};
    const catKeys = Object.keys(catalog);

    bodyHtml = `
      <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
        <p class="text-xs text-gray-300/80 leading-relaxed">
          ${curL === 'de'
            ? 'Klicke auf eine Aufgabe, um sie sofort mit 1 Klick in deine aktuelle Liste aufzunehmen:'
            : 'Click any suggestion chip to instantly insert it into your active board:'}
        </p>
        <div class="space-y-3">
          ${catKeys.map(catKey => {
            const cat = catalog[catKey];
            const title = tStr(cat.title);
            const items = cat.items || [];

            return `
              <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <h4 class="text-xs font-bold text-white flex items-center gap-1.5">
                  <i data-lucide="${cat.icon}" class="w-3.5 h-3.5 text-purple-400"></i>
                  <span>${title}</span>
                </h4>
                <div class="flex flex-wrap gap-1.5">
                  ${items.map(item => {
                    const taskName = tStr(item);
                    return `
                      <button onclick="insertSuggestionTaskDirect('${taskName}')" class="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-purple-500/20 text-gray-200 hover:text-purple-200 border border-white/10 hover:border-purple-500/40 text-xs font-medium transition cursor-pointer active:scale-95 flex items-center gap-1">
                        <span>+</span>
                        <span>${taskName}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="mobile-modal-card animate-spring-modal w-full max-w-2xl bg-[#0f0f17]/98 border border-purple-500/30 rounded-3xl shadow-2xl p-5 sm:p-6 text-left relative overflow-hidden flex flex-col">
      
      <!-- Background Ambient Glow -->
      <div class="absolute -top-24 -left-24 w-56 h-56 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -right-24 w-56 h-56 bg-pink-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Top Header -->
      <div class="w-full flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 shadow-md flex items-center justify-center text-white">
            <div class="w-full h-full bg-[#111118]/80 rounded-[14px] flex items-center justify-center">
              <i data-lucide="sparkles" class="w-4 h-4 text-purple-300"></i>
            </div>
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-black font-display text-white leading-tight">
              ${curL === 'de' ? 'Routinen & Standards anpassen' : 'Routine Presets & Defaults'}
            </h3>
            <p class="text-[11px] text-gray-400">
              ${curL === 'de' ? 'Vorkonfigurierte Lebensstile & persönliche Standard-Aufgaben' : 'Preconfigured lifestyles & custom default routines'}
            </p>
          </div>
        </div>
        <button onclick="closeRoutinePresetsModal()" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition flex items-center justify-center cursor-pointer">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Tabs Bar -->
      <div class="flex items-center gap-1.5 p-1 bg-black/40 border border-white/5 rounded-2xl mb-3.5">
        ${tabs.map(tab => `
          <button onclick="setRoutinePresetsTab('${tab.id}')" class="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${currentRoutinePresetTab === tab.id ? 'bg-purple-600/30 text-white border border-purple-500/40 shadow-xs' : 'text-gray-400 hover:text-gray-200'}">
            <i data-lucide="${tab.icon}" class="w-3.5 h-3.5"></i>
            <span class="truncate">${tab.label}</span>
          </button>
        `).join('')}
      </div>

      <!-- Tab Body -->
      <div class="w-full flex-1">
        ${bodyHtml}
      </div>

    </div>
  `;

  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    try { lucide.createIcons(); } catch (e) {}
  }
}

function applyRoutinePreset(presetId, saveAsDefault = true) {
  const presets = (typeof ROUTINE_PRESETS !== 'undefined') ? ROUTINE_PRESETS : [];
  const preset = presets.find(p => p.id === presetId);
  if (!preset) return;

  const curL = (typeof window !== 'undefined' && window.currentLang) ? window.currentLang : (typeof currentLang !== 'undefined' ? currentLang : 'de');
  const dailyTasks = preset.tasks?.daily?.[curL] || preset.tasks?.daily?.['de'] || preset.tasks?.daily?.['en'] || [];
  const weeklyTasks = preset.tasks?.weekly?.[curL] || preset.tasks?.weekly?.['de'] || preset.tasks?.weekly?.['en'] || [];
  const occasionalTasks = preset.tasks?.occasionally?.[curL] || preset.tasks?.occasionally?.['de'] || preset.tasks?.occasionally?.['en'] || [];

  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : null);
  if (currentState) {
    if (typeof saveHistory === 'function') saveHistory();
    if (!currentState.items) currentState.items = {};
    currentState.items.daily = [...dailyTasks];
    currentState.items.weekly = [...weeklyTasks];
    currentState.items.occasionally = [...occasionalTasks];
    if (typeof saveState === 'function') saveState();
    if (typeof renderApp === 'function') renderApp();
    if (typeof populateHelperTaskSelect === 'function') populateHelperTaskSelect();
  }

  if (saveAsDefault) {
    const customDefaults = {
      presetId: preset.id,
      daily: [...dailyTasks],
      weekly: [...weeklyTasks],
      occasionally: [...occasionalTasks],
      savedAt: new Date().toISOString()
    };
    if (typeof saveCustomDefaults === 'function') {
      saveCustomDefaults(customDefaults);
    } else {
      localStorage.setItem('flow_custom_default_tasks', JSON.stringify(customDefaults));
    }
  }

  closeRoutinePresetsModal();

  if (typeof showToast === 'function') {
    showToast(tr({
      de: `✨ Preset "${preset.name?.de || preset.id}" erfolgreich angewendet!`,
      en: `✨ Preset "${preset.name?.en || preset.id}" applied successfully!`,
      es: `✨ ¡Preset aplicado con éxito!`,
      fr: `✨ Préréglage appliqué avec succès !`,
      it: `✨ Preset applicato con successo!`,
      el: `✨ Το πρότυπο εφαρμόστηκε επιτυχώς!`
    }));
  }

  if (typeof triggerPraise === 'function') triggerPraise();
}

function addCustomDefaultChip(columnKey) {
  const inputEl = document.getElementById(`input-new-custom-${columnKey}`);
  if (!inputEl) return;
  const val = inputEl.value.trim();
  if (!val) return;

  const curL = (typeof window !== 'undefined' && window.currentLang) ? window.currentLang : (typeof currentLang !== 'undefined' ? currentLang : 'de');
  let defaults = (typeof getCustomDefaults === 'function') ? getCustomDefaults() : null;
  if (!defaults) {
    const loc = (typeof DEFAULT_TASKS_BY_LANG !== 'undefined' && DEFAULT_TASKS_BY_LANG[curL]) ? DEFAULT_TASKS_BY_LANG[curL] : { daily: [], weekly: [], occasionally: [] };
    defaults = {
      daily: [...(loc.daily || [])],
      weekly: [...(loc.weekly || [])],
      occasionally: [...(loc.occasionally || [])]
    };
  }

  if (!defaults[columnKey]) defaults[columnKey] = [];
  if (!defaults[columnKey].includes(val)) {
    defaults[columnKey].push(val);
    defaults.savedAt = new Date().toISOString();
    if (typeof saveCustomDefaults === 'function') saveCustomDefaults(defaults);
    inputEl.value = '';
    renderRoutinePresetsModalContent();
  }
}

function removeCustomDefaultChip(columnKey, index) {
  const curL = (typeof window !== 'undefined' && window.currentLang) ? window.currentLang : (typeof currentLang !== 'undefined' ? currentLang : 'de');
  let defaults = (typeof getCustomDefaults === 'function') ? getCustomDefaults() : null;
  if (!defaults) {
    const loc = (typeof DEFAULT_TASKS_BY_LANG !== 'undefined' && DEFAULT_TASKS_BY_LANG[curL]) ? DEFAULT_TASKS_BY_LANG[curL] : { daily: [], weekly: [], occasionally: [] };
    defaults = {
      daily: [...(loc.daily || [])],
      weekly: [...(loc.weekly || [])],
      occasionally: [...(loc.occasionally || [])]
    };
  }

  if (defaults[columnKey] && defaults[columnKey][index] !== undefined) {
    defaults[columnKey].splice(index, 1);
    defaults.savedAt = new Date().toISOString();
    if (typeof saveCustomDefaults === 'function') saveCustomDefaults(defaults);
    renderRoutinePresetsModalContent();
  }
}

function saveCurrentBoardAsCustomDefaults() {
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : null);
  if (!currentState || !currentState.items) return;

  const getTaskStrings = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => typeof item === 'object' ? (item.task || item.name || '') : String(item)).filter(Boolean);
  };

  const customDefaults = {
    daily: getTaskStrings(currentState.items.daily),
    weekly: getTaskStrings(currentState.items.weekly),
    occasionally: getTaskStrings(currentState.items.occasionally),
    savedAt: new Date().toISOString()
  };

  if (typeof saveCustomDefaults === 'function') {
    saveCustomDefaults(customDefaults);
  } else {
    localStorage.setItem('flow_custom_default_tasks', JSON.stringify(customDefaults));
  }

  if (typeof showToast === 'function') {
    showToast(tr({
      de: '💾 Dein aktuelles Board wurde als persönlicher Standard gesichert!',
      en: '💾 Your current board was saved as your personal default routine!',
      es: '💾 ¡Tu tablero actual se guardó como plantilla predeterminada!',
      fr: '💾 Ton tableau actuel a été enregistré comme standard !',
      it: '💾 La tua bacheca attuale è stata salvata come standard personale!',
      el: '💾 Το τρέχον πλάνο αποθηκεύτηκε ως πρότυπο!'
    }));
  }

  renderRoutinePresetsModalContent();
}

function resetUserDefaultsToOfficial() {
  if (typeof saveCustomDefaults === 'function') {
    saveCustomDefaults(null);
  } else {
    localStorage.removeItem('flow_custom_default_tasks');
    localStorage.removeItem('flowPlannerCustomDefaults');
  }

  if (typeof showToast === 'function') {
    showToast(tr({
      de: '🔄 Standards auf Noodle-Original zurückgesetzt',
      en: '🔄 Defaults reset to official Noodle templates',
      es: '🔄 Ajustes restaurados a los originales',
      fr: '🔄 Préréglages réinitialisés',
      it: '🔄 Standard ripristinati agli originali',
      el: '🔄 Επαναφορά στα αρχικά πρότυπα'
    }));
  }

  renderRoutinePresetsModalContent();
}

function insertSuggestionTaskDirect(taskName, targetCategory = 'daily') {
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : null);
  if (!currentState) return;
  if (typeof saveHistory === 'function') saveHistory();

  if (!currentState.items) currentState.items = {};
  if (!currentState.items[targetCategory]) currentState.items[targetCategory] = [];
  
  currentState.items[targetCategory].push(taskName);
  if (typeof saveState === 'function') saveState();
  if (typeof renderApp === 'function') renderApp();
  if (typeof populateHelperTaskSelect === 'function') populateHelperTaskSelect();

  if (typeof showToast === 'function') {
    showToast(tr({
      de: `✨ "${taskName}" hinzugefügt!`,
      en: `✨ "${taskName}" added!`,
      es: `✨ ¡"${taskName}" añadida!`,
      fr: `✨ « ${taskName} » ajoutée !`,
      it: `✨ "${taskName}" aggiunta!`,
      el: `✨ Το "${taskName}" προστέθηκε!`
    }));
  }
}

function openTaskSuggestionsPopover(catId, targetInputId) {
  openRoutinePresetsModal('suggestions');
}

if (typeof window !== 'undefined') {
  window.openRoutinePresetsModal = openRoutinePresetsModal;
  window.closeRoutinePresetsModal = closeRoutinePresetsModal;
  window.setRoutinePresetsTab = setRoutinePresetsTab;
  window.applyRoutinePreset = applyRoutinePreset;
  window.addCustomDefaultChip = addCustomDefaultChip;
  window.removeCustomDefaultChip = removeCustomDefaultChip;
  window.saveCurrentBoardAsCustomDefaults = saveCurrentBoardAsCustomDefaults;
  window.resetUserDefaultsToOfficial = resetUserDefaultsToOfficial;
  window.insertSuggestionTaskDirect = insertSuggestionTaskDirect;
  window.openTaskSuggestionsPopover = openTaskSuggestionsPopover;
}
if (typeof globalThis !== 'undefined') {
  globalThis.openRoutinePresetsModal = openRoutinePresetsModal;
  globalThis.closeRoutinePresetsModal = closeRoutinePresetsModal;
  globalThis.applyRoutinePreset = applyRoutinePreset;
  globalThis.saveCurrentBoardAsCustomDefaults = saveCurrentBoardAsCustomDefaults;
  globalThis.resetUserDefaultsToOfficial = resetUserDefaultsToOfficial;
  globalThis.openTaskSuggestionsPopover = openTaskSuggestionsPopover;
}
