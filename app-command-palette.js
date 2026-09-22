// app-command-palette.js: Globales Command Menu (Strg+K / Cmd+K) für blitzschnelle Navigation & Power-User-Aktionen

let commandPaletteSelectedIndex = 0;
let commandPaletteFilteredItems = [];

function getCommandPaletteActions() {
  const t = typeof window.t === 'function' ? window.t : (k) => k;
  const tr = typeof window.tr === 'function' ? window.tr : (o) => (o.de || o.en || Object.values(o)[0]);

  const baseActions = [
    {
      id: 'cmd-timer-start-25',
      title: tr({ de: 'Timer starten (25 Min Fokus)', en: 'Start Timer (25 Min Focus)' }),
      category: tr({ de: 'Fokus & Timer', en: 'Focus & Timer' }),
      icon: 'timer',
      color: 'text-emerald-400',
      action: () => {
        if (typeof setCustomTimerMinutes === 'function') setCustomTimerMinutes(25);
        if (typeof startTimer === 'function') startTimer();
      }
    },
    {
      id: 'cmd-timer-pause',
      title: tr({ de: 'Timer pausieren / fortsetzen', en: 'Pause / Resume Timer' }),
      category: tr({ de: 'Fokus & Timer', en: 'Focus & Timer' }),
      icon: 'pause-circle',
      color: 'text-amber-400',
      action: () => {
        if (typeof toggleTimer === 'function') toggleTimer();
        else if (typeof pauseTimer === 'function') pauseTimer();
      }
    },
    {
      id: 'cmd-timer-reset',
      title: tr({ de: 'Timer zurücksetzen', en: 'Reset Timer' }),
      category: tr({ de: 'Fokus & Timer', en: 'Focus & Timer' }),
      icon: 'rotate-ccw',
      color: 'text-rose-400',
      action: () => {
        if (typeof stopTimer === 'function') stopTimer();
      }
    },
    {
      id: 'cmd-zen-toggle',
      title: tr({ de: 'Zen / Minimalist-Modus umschalten', en: 'Toggle Zen / Minimalist Mode' }),
      category: tr({ de: 'Ansicht', en: 'View' }),
      icon: 'maximize-2',
      color: 'text-purple-400',
      action: () => {
        if (typeof toggleMinimalist === 'function') toggleMinimalist();
      }
    },
    {
      id: 'cmd-sound-toggle',
      title: tr({ de: 'Ambient Sound / Audio umschalten', en: 'Toggle Ambient Sound / Audio' }),
      category: tr({ de: 'Audio', en: 'Audio' }),
      icon: 'volume-2',
      color: 'text-purple-300',
      action: () => {
        if (typeof toggleMasterSound === 'function') toggleMasterSound();
      }
    },
    {
      id: 'cmd-open-shopping',
      title: tr({ de: 'Einkaufsliste öffnen [E]', en: 'Open Shopping List [E]' }),
      category: tr({ de: 'Werkzeuge', en: 'Tools' }),
      icon: 'shopping-cart',
      color: 'text-emerald-400',
      action: () => {
        if (typeof togglePanel === 'function') togglePanel('shopping');
      }
    },
    {
      id: 'cmd-open-cooking',
      title: tr({ de: 'Smarte Küche & Vorrats-Rezepte [K]', en: 'Smart Cooking & Pantry [K]' }),
      category: tr({ de: 'Werkzeuge', en: 'Tools' }),
      icon: 'cooking-pot',
      color: 'text-orange-400',
      action: () => {
        if (typeof togglePanel === 'function') togglePanel('cooking');
      }
    },
    {
      id: 'cmd-open-sport',
      title: tr({ de: 'Sport & 60s Micro-Workouts [O]', en: 'Sport & 60s Workouts [O]' }),
      category: tr({ de: 'Werkzeuge', en: 'Tools' }),
      icon: 'activity',
      color: 'text-rose-400',
      action: () => {
        if (typeof openSportModal === 'function') openSportModal();
      }
    },
    {
      id: 'cmd-open-radio',
      title: tr({ de: 'Live-Radio & Focus Streams öffnen', en: 'Open Live Radio' }),
      category: tr({ de: 'Audio & Medien', en: 'Audio & Media' }),
      icon: 'radio',
      color: 'text-rose-400',
      action: () => {
        if (typeof togglePanel === 'function') togglePanel('radio');
      }
    },
    {
      id: 'cmd-open-news',
      title: tr({ de: 'Nachrichten & Audio-Ticker öffnen', en: 'Open News & TTS' }),
      category: tr({ de: 'Audio & Medien', en: 'Audio & Media' }),
      icon: 'newspaper',
      color: 'text-pink-400',
      action: () => {
        if (typeof togglePanel === 'function') togglePanel('news');
      }
    },
    {
      id: 'cmd-open-cleaning',
      title: tr({ de: 'Putz-Guide & Haushalts-Routinen', en: 'Open Cleaning Guide' }),
      category: tr({ de: 'Werkzeuge', en: 'Tools' }),
      icon: 'sparkles',
      color: 'text-teal-400',
      action: () => {
        if (typeof openCleaningGuideModal === 'function') openCleaningGuideModal();
      }
    },
    {
      id: 'cmd-open-brainstorm',
      title: tr({ de: 'Brainstorming & Ideen-Board öffnen', en: 'Open Brainstorming & Ideas' }),
      category: tr({ de: 'Werkzeuge', en: 'Tools' }),
      icon: 'lightbulb',
      color: 'text-teal-400',
      action: () => {
        if (typeof openBrainstormModal === 'function') openBrainstormModal();
      }
    },
    {
      id: 'cmd-open-clarity',
      title: tr({ de: 'Tage der Klarheit (Impuls-Tracker)', en: 'Days of Clarity (Impulse Tracker)' }),
      category: tr({ de: 'Werkzeuge', en: 'Tools' }),
      icon: 'shield-check',
      color: 'text-sky-400',
      action: () => {
        if (typeof openClarityModal === 'function') openClarityModal();
      }
    },
    {
      id: 'cmd-open-collab-chat',
      title: tr({ de: 'Team-Chat & Live-Kollaboration', en: 'Team Chat & Live Collaboration' }),
      category: tr({ de: 'Werkzeuge', en: 'Tools' }),
      icon: 'message-square',
      color: 'text-violet-400',
      action: () => {
        if (typeof togglePanel === 'function') togglePanel('collab-chat');
        else if (typeof CollabEngine !== 'undefined') CollabEngine.toggleChat();
      }
    },
    {
      id: 'cmd-open-dice',
      title: tr({ de: 'Glückswürfel werfen (Aufgabe auslosen)', en: 'Roll Lucky Dice (Pick task)' }),
      category: tr({ de: 'Werkzeuge', en: 'Tools' }),
      icon: 'dice-5',
      color: 'text-amber-400',
      action: () => {
        if (typeof rollTaskDice === 'function') rollTaskDice('daily');
      }
    },
    {
      id: 'cmd-reload-daily',
      title: tr({ de: 'Heute-Spalte (Tagesplan) neu laden 🌅', en: 'Reload Today\'s Column 🌅' }),
      category: tr({ de: 'Aufgaben & Board', en: 'Tasks & Board' }),
      icon: 'refresh-cw',
      color: 'text-amber-400',
      action: () => {
        if (typeof reloadDailyTasks === 'function') reloadDailyTasks(false);
      }
    },
    {
      id: 'cmd-reload-weekly',
      title: tr({ de: 'Haushalt-Spalte für neue Woche laden 🧹', en: 'Reload Weekly Household Column 🧹' }),
      category: tr({ de: 'Aufgaben & Board', en: 'Tasks & Board' }),
      icon: 'refresh-cw',
      color: 'text-emerald-400',
      action: () => {
        if (typeof reloadWeeklyHouseholdTasks === 'function') reloadWeeklyHouseholdTasks(false);
      }
    },
    {
      id: 'cmd-open-reports',
      title: tr({ de: 'Statistiken & Berichte anzeigen', en: 'View Analytics & Reports' }),
      category: tr({ de: 'Werkzeuge', en: 'Tools' }),
      icon: 'bar-chart-2',
      color: 'text-purple-400',
      action: () => {
        if (typeof openReportDashboard === 'function') openReportDashboard();
      }
    },
    {
      id: 'cmd-backup-download',
      title: tr({ de: 'Sicherheitskopie (JSON Backup) herunterladen', en: 'Download Backup JSON' }),
      category: tr({ de: 'Daten', en: 'Data' }),
      icon: 'download',
      color: 'text-cyan-400',
      action: () => {
        if (typeof downloadFullBackup === 'function') downloadFullBackup();
        else if (typeof handleSaveJson === 'function') handleSaveJson();
      }
    },
    {
      id: 'cmd-theme-botanical',
      title: tr({ de: 'Theme: 🌿 Botanik & Handschrift (Menschlich & Ökologisch)', en: 'Theme: 🌿 Botanical & Handschrift (Organic Warmth)' }),
      category: tr({ de: 'Design', en: 'Design' }),
      icon: 'palette',
      color: 'text-emerald-400',
      action: () => { if (typeof setTheme === 'function') setTheme('botanical'); }
    },
    {
      id: 'cmd-theme-aurora',
      title: tr({ de: 'Theme: Aurora (Signature Violett)', en: 'Theme: Aurora (Violet)' }),
      category: tr({ de: 'Design', en: 'Design' }),
      icon: 'palette',
      color: 'text-purple-400',
      action: () => { if (typeof setTheme === 'function') setTheme('aurora'); }
    },
    {
      id: 'cmd-theme-obsidian',
      title: tr({ de: 'Theme: Obsidian (OLED Tiefschwarz)', en: 'Theme: Obsidian (OLED Black)' }),
      category: tr({ de: 'Design', en: 'Design' }),
      icon: 'palette',
      color: 'text-slate-300',
      action: () => { if (typeof setTheme === 'function') setTheme('obsidian'); }
    },
    {
      id: 'cmd-theme-ocean',
      title: tr({ de: 'Theme: Ocean (Meeres-Cyan & Ice)', en: 'Theme: Ocean (Cyan & Ice)' }),
      category: tr({ de: 'Design', en: 'Design' }),
      icon: 'palette',
      color: 'text-cyan-400',
      action: () => { if (typeof setTheme === 'function') setTheme('ocean'); }
    },
    {
      id: 'cmd-theme-sage',
      title: tr({ de: 'Theme: Sage & Matcha (Milder Salbei)', en: 'Theme: Sage & Matcha' }),
      category: tr({ de: 'Design', en: 'Design' }),
      icon: 'palette',
      color: 'text-emerald-400',
      action: () => { if (typeof setTheme === 'function') setTheme('sage'); }
    },
    {
      id: 'cmd-theme-latte',
      title: tr({ de: 'Theme: Oat & Latte (Milchkaffee)', en: 'Theme: Oat & Latte' }),
      category: tr({ de: 'Design', en: 'Design' }),
      icon: 'palette',
      color: 'text-amber-300',
      action: () => { if (typeof setTheme === 'function') setTheme('latte'); }
    },
    {
      id: 'cmd-theme-sunset',
      title: tr({ de: 'Theme: Warm Sunset (Abendsonne)', en: 'Theme: Warm Sunset' }),
      category: tr({ de: 'Design', en: 'Design' }),
      icon: 'palette',
      color: 'text-orange-400',
      action: () => { if (typeof setTheme === 'function') setTheme('sunset'); }
    },
    {
      id: 'cmd-theme-peach',
      title: tr({ de: 'Theme: Sakura Blossom (Blüten-Rosé)', en: 'Theme: Sakura Blossom' }),
      category: tr({ de: 'Design', en: 'Design' }),
      icon: 'palette',
      color: 'text-rose-400',
      action: () => { if (typeof setTheme === 'function') setTheme('peach'); }
    },
    {
      id: 'cmd-theme-crimson',
      title: tr({ de: 'Theme: Crimson Ruby (Deep-Focus)', en: 'Theme: Crimson Ruby' }),
      category: tr({ de: 'Design', en: 'Design' }),
      icon: 'palette',
      color: 'text-red-400',
      action: () => { if (typeof setTheme === 'function') setTheme('crimson'); }
    },
    {
      id: 'cmd-theme-honey',
      title: tr({ de: 'Theme: Honey Chamomile (Warmer Bernstein)', en: 'Theme: Honey Chamomile' }),
      category: tr({ de: 'Design', en: 'Design' }),
      icon: 'palette',
      color: 'text-amber-400',
      action: () => { if (typeof setTheme === 'function') setTheme('honey'); }
    },
    {
      id: 'cmd-open-onboarding',
      title: tr({ de: 'App-Einführung & Tour starten ✨ [Onboarding]', en: 'Start App Tour & Onboarding ✨' }),
      category: tr({ de: 'Hilfe & Guide', en: 'Help & Guide' }),
      icon: 'sparkles',
      color: 'text-purple-400',
      action: () => {
        if (typeof startOnboardingTour === 'function') startOnboardingTour();
      }
    },
    {
      id: 'cmd-open-settings',
      title: tr({ de: 'Einstellungen & Synchronisation', en: 'Settings & Sync' }),
      category: tr({ de: 'System', en: 'System' }),
      icon: 'settings',
      color: 'text-gray-300',
      action: () => {
        if (typeof openSettingsModal === 'function') openSettingsModal();
      }
    }
  ];

  // Dynamische Aufgaben, Notizen und Termine erfassen
  const taskActions = [];
  try {
    const curItems = typeof getCurrentWorkspaceItems === 'function' 
      ? getCurrentWorkspaceItems() 
      : (window.state && window.state.items ? window.state.items : {});

    if (curItems) {
      for (const colKey in curItems) {
        const list = curItems[colKey] || [];
        const colTitle = (typeof t === 'function' ? t(colKey) : colKey) || colKey;
        
        list.forEach((item, idx) => {
          const taskText = typeof item === 'object' ? (item.task || item.name || '') : String(item);
          if (!taskText) return;
          
          taskActions.push({
            id: `task-${colKey}-${idx}`,
            title: taskText,
            category: `${colTitle}`,
            icon: colKey === 'termine' ? 'calendar' : (colKey === 'notes' ? 'sticky-note' : 'check-circle'),
            color: colKey === 'termine' ? 'text-amber-400' : (colKey === 'notes' ? 'text-amber-200' : 'text-purple-300'),
            action: () => {
              if (colKey === 'notes' && typeof openNoteDetailModal === 'function') {
                openNoteDetailModal(idx);
              } else if (colKey === 'termine' && typeof editTermin === 'function') {
                editTermin(idx);
              } else if (typeof setActiveTimerTask === 'function') {
                setActiveTimerTask(colKey, idx);
                if (typeof showToast === 'function') {
                  showToast(`Fokus auf: "${taskText}" gesetzt 🎯`);
                }
              }
            }
          });
        });
      }
    }
  } catch (e) {
    console.warn('[CommandPalette] Error indexing tasks:', e);
  }

  return [...taskActions, ...baseActions];
}

function openCommandPalette() {
  let modal = document.getElementById('command-palette-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'command-palette-modal';
    modal.className = 'fixed inset-0 z-[150000] flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-md animate-fade-in';
    modal.innerHTML = `
      <div id="command-palette-card" class="mobile-modal-card animate-spring-modal w-full max-w-xl bg-[#111116]/98 border border-purple-500/30 rounded-3xl shadow-2xl backdrop-blur-2xl text-white relative flex flex-col overflow-hidden text-left" onclick="event.stopPropagation()">
        
        <!-- Input Header -->
        <div class="flex items-center gap-3 p-4 border-b border-white/10">
          <i data-lucide="search" class="w-5 h-5 text-purple-400 shrink-0"></i>
          <input type="text" id="command-palette-input" placeholder="Befehl oder Aufgabe suchen (z.B. Timer, Theme, Notiz)..." class="w-full bg-transparent text-sm text-white placeholder:text-gray-500 outline-none font-semibold" autocomplete="off" />
          <kbd class="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 rounded-lg">ESC</kbd>
        </div>

        <!-- Results List -->
        <div id="command-palette-results" class="max-h-[360px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between p-2.5 px-4 bg-white/[0.02] border-t border-white/5 text-[11px] text-gray-400 font-mono">
          <div class="flex items-center gap-2">
            <span>↑↓ Navigieren</span>
            <span>↵ Ausführen</span>
          </div>
          <span class="text-purple-300/80 font-bold">Noodle Palette</span>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.onclick = closeCommandPalette;
    
    const input = modal.querySelector('#command-palette-input');
    input.oninput = (e) => filterCommandPalette(e.target.value);
    input.onkeydown = handleCommandPaletteKeydown;
  }

  modal.classList.remove('hidden');
  const input = modal.querySelector('#command-palette-input');
  if (input) {
    input.value = '';
    input.focus();
  }
  commandPaletteSelectedIndex = 0;
  filterCommandPalette('');
  if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
}

function closeCommandPalette() {
  const modal = document.getElementById('command-palette-modal');
  if (modal) modal.classList.add('hidden');
}

function filterCommandPalette(query) {
  const allActions = getCommandPaletteActions();
  const q = (query || '').trim().toLowerCase();

  if (!q) {
    commandPaletteFilteredItems = allActions.slice(0, 30);
  } else {
    commandPaletteFilteredItems = allActions.filter(item => {
      return item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    }).slice(0, 30);
  }

  commandPaletteSelectedIndex = 0;
  renderCommandPaletteResults();
}

function renderCommandPaletteResults() {
  const container = document.getElementById('command-palette-results');
  if (!container) return;

  if (commandPaletteFilteredItems.length === 0) {
    container.innerHTML = `
      <div class="py-8 text-center text-gray-500 text-xs font-medium">
        Keine passenden Befehle oder Aufgaben gefunden
      </div>
    `;
    return;
  }

  container.innerHTML = commandPaletteFilteredItems.map((item, idx) => {
    const isSelected = idx === commandPaletteSelectedIndex;
    const safeTitle = typeof escapeHtml === 'function' ? escapeHtml(item.title) : item.title;
    const safeCat = typeof escapeHtml === 'function' ? escapeHtml(item.category) : item.category;

    return `
      <div 
        id="cmd-item-${idx}" 
        onclick="executeCommandPaletteItem(${idx})" 
        onmouseenter="setCommandPaletteHover(${idx})"
        class="flex items-center justify-between p-2.5 px-3 rounded-2xl transition cursor-pointer ${isSelected ? 'bg-purple-600/30 border border-purple-500/50 text-white shadow-sm' : 'hover:bg-white/5 text-gray-300 border border-transparent'}"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-7 h-7 rounded-xl ${isSelected ? 'bg-purple-500/30 text-white' : 'bg-white/5 text-gray-400'} flex items-center justify-center shrink-0">
            <i data-lucide="${item.icon || 'terminal'}" class="w-3.5 h-3.5 ${item.color || ''}"></i>
          </div>
          <span class="text-xs font-semibold truncate ${isSelected ? 'text-white font-bold' : ''}">${safeTitle}</span>
        </div>
        <span class="text-[10px] font-mono font-medium text-gray-400 shrink-0 ml-2 px-2 py-0.5 bg-white/5 rounded-lg border border-white/5">${safeCat}</span>
      </div>
    `;
  }).join('');

  if (typeof renderLucideIcons === 'function') renderLucideIcons();
  else if (typeof lucide !== 'undefined' && lucide.createIcons) try { lucide.createIcons(); } catch(e) {}

  scrollSelectedCommandIntoView();
}

function setCommandPaletteHover(index) {
  commandPaletteSelectedIndex = index;
  const items = document.querySelectorAll('#command-palette-results > div');
  items.forEach((el, i) => {
    if (i === index) {
      el.className = 'flex items-center justify-between p-2.5 px-3 rounded-2xl transition cursor-pointer bg-purple-600/30 border border-purple-500/50 text-white shadow-sm';
    } else {
      el.className = 'flex items-center justify-between p-2.5 px-3 rounded-2xl transition cursor-pointer hover:bg-white/5 text-gray-300 border border-transparent';
    }
  });
}

function handleCommandPaletteKeydown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (commandPaletteFilteredItems.length > 0) {
      commandPaletteSelectedIndex = (commandPaletteSelectedIndex + 1) % commandPaletteFilteredItems.length;
      renderCommandPaletteResults();
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (commandPaletteFilteredItems.length > 0) {
      commandPaletteSelectedIndex = (commandPaletteSelectedIndex - 1 + commandPaletteFilteredItems.length) % commandPaletteFilteredItems.length;
      renderCommandPaletteResults();
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    executeCommandPaletteItem(commandPaletteSelectedIndex);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    closeCommandPalette();
  }
}

function scrollSelectedCommandIntoView() {
  const selectedEl = document.getElementById(`cmd-item-${commandPaletteSelectedIndex}`);
  if (selectedEl) {
    selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function executeCommandPaletteItem(index) {
  const item = commandPaletteFilteredItems[index];
  if (!item) return;
  closeCommandPalette();
  if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('medium');
  if (typeof item.action === 'function') {
    try {
      item.action();
    } catch (e) {
      console.error('[CommandPalette] Execution error:', e);
    }
  }
}

// Global Keyboard Shortcut: Strg+K / Cmd+K
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const modal = document.getElementById('command-palette-modal');
      if (modal && !modal.classList.contains('hidden')) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    }
  });
}

const CommandPalette = {
  open: openCommandPalette,
  close: closeCommandPalette,
  toggle: () => {
    const modal = document.getElementById('command-palette-modal');
    if (modal && !modal.classList.contains('hidden')) {
      closeCommandPalette();
    } else {
      openCommandPalette();
    }
  },
  getActions: getCommandPaletteActions
};

if (typeof window !== 'undefined') {
  window.CommandPalette = CommandPalette;
  window.openCommandPalette = openCommandPalette;
  window.closeCommandPalette = closeCommandPalette;
  window.executeCommandPaletteItem = executeCommandPaletteItem;
  window.setCommandPaletteHover = setCommandPaletteHover;
}
if (typeof globalThis !== 'undefined') {
  globalThis.CommandPalette = CommandPalette;
  globalThis.openCommandPalette = openCommandPalette;
  globalThis.closeCommandPalette = closeCommandPalette;
}
