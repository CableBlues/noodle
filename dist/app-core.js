/**
 * @file app-core.js
 * @module AppCore
 * @description
 * Zentrale Anwendungs-Orchestrierung & Lifecycle-Steuerung:
 * - Globale Fehlerbehandlung (Error Boundaries für Laufzeit- und Promise-Fehler)
 * - Workspace-Isolation und nahtloser Kontextwechsel (Personal / Work)
 * - Theme- & Farb-Engine (12 kuratierte Themes, Dark/Light-Adaption, Minimalist-Modus)
 * - Mobile Navigation (5-Tab-Architektur, Bottom-Sheets, Touch-Swipe-Gesten)
 * - Fokus- & Zen-Modus-Orchestrierung sowie mehrsprachige UI-Lokalisierung
 */

var currentZenTaskInfo = (typeof window !== 'undefined' && window.currentZenTaskInfo) || null;
if (typeof window !== 'undefined') window.currentZenTaskInfo = currentZenTaskInfo;
if (typeof globalThis !== 'undefined') globalThis.currentZenTaskInfo = currentZenTaskInfo;
let lastSelectedSound = 'birds';
let draggedColumnId = null;
let selectedCalendarDate = null; 

const HOVER_COLOR_PAIRS = [
  { hoverIcon: 'group-hover/task:text-emerald-400', text: 'group-hover/task:text-emerald-300' },
  { hoverIcon: 'group-hover/task:text-cyan-400', text: 'group-hover/task:text-cyan-300' },
  { hoverIcon: 'group-hover/task:text-amber-400', text: 'group-hover/task:text-amber-300' },
  { hoverIcon: 'group-hover/task:text-rose-400', text: 'group-hover/task:text-rose-300' },
  { hoverIcon: 'group-hover/task:text-purple-400', text: 'group-hover/task:text-purple-300' },
  { hoverIcon: 'group-hover/task:text-blue-400', text: 'group-hover/task:text-blue-300' },
  { hoverIcon: 'group-hover/task:text-pink-400', text: 'group-hover/task:text-pink-300' },
  { hoverIcon: 'group-hover/task:text-teal-400', text: 'group-hover/task:text-teal-300' },
  { hoverIcon: 'group-hover/task:text-orange-400', text: 'group-hover/task:text-orange-300' },
  { hoverIcon: 'group-hover/task:text-sky-400', text: 'group-hover/task:text-sky-300' }
];

const INSPIRATION_SAYINGS = {
  de: [
    "Du musst eine Aufgabe nicht perfekt machen. Sie unvollständig zu erledigen, ist unendlich viel besser, als sie gar nicht zu tun.",
    "Wenn dir der Anfang schwerfällt, nimm dir vor, nur eine einzige Minute daran zu arbeiten. Danach darfst du jederzeit aufhören.",
    "Dein Gehirn ist ein Prozessor, kein Datenspeicher. Schreib den Gedanken auf, um wertvollen Arbeitsspeicher im Kopf freizugeben.",
    "Manchmal ist eine Pause kein Luxus, sondern eine notwendige Wartung deines Systems. Gönne dir diesen Moment ohne Schuldgefühle.",
    "Fehlentscheidungen sind nur Datenpunkte. Sie zeigen dir, was nicht funktioniert, und helfen dir, deinen Weg feinzujustieren."
  ],
  en: [
    "You don't have to do a task perfectly. Doing it incompletely is infinitely better than not doing it at all.",
    "If starting feels hard, plan to work on it for just one minute. You can stop at any time after that.",
    "Your brain is a storage device. Write thoughts down to free up valuable memory in your head.",
    "Sometimes a break isn't a luxury, but a necessary maintenance of your system. Enjoy this moment guilt-free.",
    "Mistakes are simply data points. They show you what doesn't work and help you fine-tune your own path."
  ],
  es: [
    "No tienes que hacer una tarea a la perfección. Hacerla de forma incompleta es infinitamente mejor que no hacerla en absoluto.",
    "Si empezar te cuesta, plantéate trabajar solo un minuto en ello. Después puedes parar cuando quieras.",
    "Tu cerebro es un procesador, no un almacén de datos. Escribe tus pensamientos para liberar memoria valiosa en tu mente.",
    "A veces un descanso no es un lujo, sino un mantenimiento necesario de tu sistema. Date ese momento sin sentir culpa.",
    "Los errores son solo datos. Te muestran qué no funciona y te ayudan a ajustar tu propio camino."
  ],
  el: [
    "Δεν χρειάζεται να κάνεις μια εργασία τέλεια. Το να την κάνεις ημιτελή είναι απείρως καλύτερο από το να μην την κάνεις καθόλου.",
    "Αν το ξεκίνημα σου φαίνεται δύσκολο, σκέψου να δουλέψεις πάνω της μόνο για ένα λεπτό. Μετά μπορείς να σταματήσεις όποτε θέλεις.",
    "Ο εγκέφαλός σου είναι επεξεργαστής, όχι αποθηκευτικός χώρος. Γράψε τις σκέψεις σου για να ελευθερώσεις πολύτιμη μνήμη στο μυαλό σου.",
    "Μερικές φορές ένα διάλειμμα δεν είναι πολυτέλεια, αλλά απαραίτητη συντήρηση του συστήματός σου. Χάρισε στον εαυτό σου αυτή τη στιγμή χωρίς ενοχές.",
    "Τα λάθη είναι απλώς δεδομένα. Σου δείχνουν τι δεν λειτουργεί και σε βοηθούν να βελτιώσεις τον δικό σου δρόμο."
  ],
  fr: [
    "Tu n'as pas besoin de faire une tâche à la perfection. La faire de façon incomplète est infiniment mieux que ne pas la faire du tout.",
    "Si commencer te semble difficile, prévois de n'y travailler qu'une seule minute. Ensuite, tu peux t'arrêter à tout moment.",
    "Ton cerveau est un processeur, pas un espace de stockage. Note tes pensées pour libérer de la mémoire précieuse dans ta tête.",
    "Parfois, une pause n'est pas un luxe, mais un entretien nécessaire de ton système. Offre-toi ce moment sans culpabilité.",
    "Les erreurs ne sont que des données. Elles te montrent ce qui ne fonctionne pas et t'aident à ajuster ton propre chemin."
  ],
  it: [
    "Non devi fare un'attività alla perfezione. Farla in modo incompleto è infinitamente meglio che non farla affatto.",
    "Se iniziare ti sembra difficile, prevedi di lavorarci solo per un minuto. Dopo puoi fermarti quando vuoi.",
    "Il tuo cervello è un processore, non uno spazio di archiviazione. Scrivi i tuoi pensieri per liberare memoria preziosa nella tua mente.",
    "A volte una pausa non è un lusso, ma una manutenzione necessaria del tuo sistema. Concediti questo momento senza sensi di colpa.",
    "Gli errori sono solo dati. Ti mostrano cosa non funziona e ti aiutano a perfezionare il tuo percorso."
  ]
};

function suggestInspirationQuote() {
  const list = INSPIRATION_SAYINGS[currentLang] || INSPIRATION_SAYINGS['en'] || INSPIRATION_SAYINGS['de'];
  const randomQuote = list[Math.floor(Math.random() * list.length)];
  const box = document.getElementById('inspiration-quote-box'); if (box) box.innerText = randomQuote;
}

function suggestBoostActivity() {
  const activities = (typeof window !== 'undefined' && window.BOOST_ACTIVITIES) || (typeof BOOST_ACTIVITIES !== 'undefined' ? BOOST_ACTIVITIES : null);
  if (!activities) return;
  const curL = (typeof currentLang !== 'undefined' ? currentLang : (typeof window !== 'undefined' ? window.currentLang : 'de')) || 'de';
  const list = activities[curL] || activities['en'] || activities['de'];
  if (!list || list.length === 0) return;
  const randomActivity = list[Math.floor(Math.random() * list.length)];
  const box = document.getElementById('boost-activity-box'); if (box) box.innerText = randomActivity;
}

function switchImpulseTab(tabName) {
  const tabs = ['spark', 'inspire', 'clarity'];
  tabs.forEach(t => {
    const btn = document.getElementById(`impulse-tab-btn-${t}`);
    const pane = document.getElementById(`impulse-pane-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.className = 'flex-1 py-1.5 rounded-xl text-white bg-amber-500/30 border border-amber-500/50 transition flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold shadow-md';
      } else {
        btn.className = 'flex-1 py-1.5 rounded-xl text-gray-400 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer text-xs font-medium';
      }
    }
    if (pane) {
      if (t === tabName) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    }
  });
  if (tabName === 'spark') suggestBoostActivity();
  if (tabName === 'inspire') suggestInspirationQuote();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}
window.switchImpulseTab = switchImpulseTab;

function handleSoundsMainClick() { openAudioStudioMode('ambient'); }
function handleMusicMainClick() { openAudioStudioMode('music'); }

function openAudioStudioMode(mode) {
  if (typeof mode !== 'string') mode = 'ambient';
  if (mode === 'beats') mode = 'ambient';
  if (typeof window !== 'undefined') window._lastActiveAudioTab = mode;
  try { localStorage.setItem('flow_last_audio_tab', mode); } catch(e) {}

  const panel = document.getElementById('panel-audio');
  if (!panel) return;

  const isCurrentlyOpen = !panel.classList.contains('hidden') && panel.style.display !== 'none';
  const currentTab = panel.getAttribute('data-active-tab') || 'ambient';

  // Wenn dasselbe Tab bereits aktiv und offen ist -> Umschalten / Schließen
  if (isCurrentlyOpen && currentTab === mode) {
    if (typeof window.NoodleInteractionMode !== 'undefined' && typeof window.NoodleInteractionMode.closeWindow === 'function') {
      window.NoodleInteractionMode.closeWindow('audio');
    } else if (typeof togglePanel === 'function') {
      togglePanel('audio', true);
    } else {
      panel.classList.add('hidden');
      panel.style.removeProperty('display');
    }
    return;
  }

  // Panel öffnen / sichtbar machen
  if (typeof window.NoodleInteractionMode !== 'undefined' && typeof window.NoodleInteractionMode.openWindow === 'function') {
    window.NoodleInteractionMode.openWindow('audio');
  } else if (typeof togglePanel === 'function') {
    togglePanel('audio');
  } else {
    panel.classList.remove('hidden');
    panel.style.removeProperty('display');
  }

  // Auf gewünschten Tab umschalten & initialisieren
  if (typeof switchAudioTab === 'function') {
    switchAudioTab(mode);
  }

  // Vordergrund & Fokus sicherstellen
  if (typeof window.NoodleInteractionMode !== 'undefined' && typeof window.NoodleInteractionMode.bringWindowToFront === 'function') {
    window.NoodleInteractionMode.bringWindowToFront('audio');
  }
}
window.openAudioStudioMode = openAudioStudioMode;

function switchAudioTab(tabName) {
  if (tabName === 'beats') tabName = 'ambient';
  if (typeof window !== 'undefined') window._lastActiveAudioTab = tabName;
  const tabConfigs = {
    ambient: {
      activeClass: 'flex-1 py-1.5 px-1 rounded-xl text-emerald-100 bg-gradient-to-r from-emerald-600/40 via-teal-600/35 to-emerald-600/40 border border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.35)] font-bold',
      inactiveClass: 'flex-1 py-1.5 px-1 rounded-xl text-gray-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent transition font-medium'
    },
    music: {
      activeClass: 'flex-1 py-1.5 px-1 rounded-xl text-cyan-100 bg-gradient-to-r from-cyan-600/40 via-sky-600/35 to-cyan-600/40 border border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.35)] font-bold',
      inactiveClass: 'flex-1 py-1.5 px-1 rounded-xl text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent transition font-medium'
    },
    dj: {
      activeClass: 'flex-1 py-1.5 px-1 rounded-xl text-amber-100 bg-gradient-to-r from-amber-600/40 via-orange-600/35 to-amber-600/40 border border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.35)] font-bold',
      inactiveClass: 'flex-1 py-1.5 px-1 rounded-xl text-gray-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent transition font-medium'
    }
  };

  const tabs = ['ambient', 'mixer', 'beats', 'music', 'dj'];
  tabs.forEach(t => {
    const btn = document.getElementById(`audio-tab-btn-${t}`);
    const pane = document.getElementById(`audio-pane-${t}`);
    const conf = tabConfigs[t];
    if (btn && conf) {
      btn.className = (t === tabName) 
        ? `${conf.activeClass} transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs select-none` 
        : `${conf.inactiveClass} transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs select-none`;
    }
    if (pane) {
      if (t === tabName) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    }
  });
  const audioPanel = document.getElementById('panel-audio');
  if (audioPanel) {
    audioPanel.setAttribute('data-active-tab', tabName);
    audioPanel.classList.toggle('is-dj-mode', tabName === 'dj');
    const moodPresetsEl = document.getElementById('audio-studio-mood-presets');
    if (moodPresetsEl) {
      moodPresetsEl.classList.toggle('hidden', tabName === 'dj');
    }
    const rightMasterFader = document.getElementById('audio-studio-master-fader');
    if (rightMasterFader) {
      rightMasterFader.classList.toggle('hidden', tabName === 'dj');
    }
  }

  const headerIconBadge = document.getElementById('audio-studio-header-icon-badge');
  const headerSubtextBadge = document.getElementById('audio-studio-subtext-badge');
  if (headerIconBadge) {
    if (tabName === 'dj') {
      headerIconBadge.className = 'w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm shrink-0';
      headerIconBadge.innerHTML = '<i data-lucide="sliders" class="w-4 h-4"></i>';
      if (headerSubtextBadge) headerSubtextBadge.textContent = 'DJ';
    } else if (tabName === 'music') {
      headerIconBadge.className = 'w-7 h-7 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shadow-sm shrink-0';
      headerIconBadge.innerHTML = '<i data-lucide="disc-3" class="w-4 h-4"></i>';
      if (headerSubtextBadge) headerSubtextBadge.textContent = 'MUSIC';
    } else {
      headerIconBadge.className = 'w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-sm shrink-0';
      headerIconBadge.innerHTML = '<i data-lucide="headphones" class="w-4 h-4"></i>';
      if (headerSubtextBadge) headerSubtextBadge.textContent = 'SOUND';
    }
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();

  if (tabName === 'music' && typeof renderMusicPlaylist === 'function') {
    renderMusicPlaylist();
  }
  if (tabName === 'dj' && typeof initDjDecks === 'function') {
    initDjDecks();
  }
  if (audioPanel && typeof adjustPanelPosition === 'function') {
    adjustPanelPosition(audioPanel, 'audio');
  }
  if (typeof renderLucideIcons === 'function') renderLucideIcons();
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}
window.switchAudioTab = switchAudioTab;

function switchDailyTab(tabName) {
  const tabs = ['shopping', 'cooking', 'impulse', 'sport'];
  tabs.forEach(t => {
    const btn = document.getElementById(`daily-tab-btn-${t}`);
    const pane = document.getElementById(`daily-pane-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.className = 'flex-1 py-1.5 rounded-xl text-white bg-emerald-600/30 border border-emerald-500/50 transition flex items-center justify-center gap-1 cursor-pointer text-[10px] sm:text-[11px] font-bold shadow-sm';
      } else {
        btn.className = 'flex-1 py-1.5 rounded-xl text-gray-400 hover:text-white transition flex items-center justify-center gap-1 cursor-pointer text-[10px] sm:text-[11px] font-medium';
      }
    }
    if (pane) {
      if (t === tabName) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    }
  });
  if (tabName === 'cooking' && typeof renderCookingPanel === 'function') {
    renderCookingPanel(true);
  }
  if (tabName === 'impulse') {
    if (typeof suggestBoostActivity === 'function') suggestBoostActivity();
    if (typeof suggestInspirationQuote === 'function') suggestInspirationQuote();
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}
window.switchDailyTab = switchDailyTab;

// Performance: MutationObserver komplett entfernt, da redundant und Hauptursache für UI-Verzögerungen.

function rotatePremiumDance() {
  // Neutralized for calm dark design system
}

// Globaler Tastatur- & Shortcut-Handler
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.code === 'Escape') {
    try { document.activeElement?.blur?.(); } catch(err) {}
    e.preventDefault();
    closeAllPanelsAndModals();
    return;
  }

  const activeTag = document.activeElement?.tagName?.toLowerCase() || '';
  if (['input', 'textarea', 'select'].includes(activeTag) || document.activeElement?.isContentEditable) return;

  const pickModal = document.getElementById('helper-pick-modal');
  const isPickModalOpen = pickModal && !pickModal.classList.contains('hidden');
  const key = (e.key || '').toLowerCase();

  // Space / Leertaste -> Timer pausieren / starten
  if (e.key === ' ' || e.code === 'Space') {
    const isInteractive = (el) => el && typeof el.closest === 'function' && (el.isContentEditable || Boolean(el.closest('button, input, textarea, select, summary, a[href], [contenteditable="true"], [role="button"], [role="checkbox"], [role="radio"], [role="switch"], [role="menuitem"], [role="option"], [role="tab"]')));
    if (isInteractive(document.activeElement) || isInteractive(e.target)) return;

    if (isPickModalOpen) {
      e.preventDefault();
      if (typeof currentWhatNowChosen !== 'undefined' && currentWhatNowChosen && currentWhatNowChosen.task) {
        startZenWithTask(currentWhatNowChosen.task, currentWhatNowChosen.cat || 'todo');
      }
      return;
    }
    e.preventDefault();
    if (typeof toggleTimer === 'function') {
      toggleTimer();
    }
    return;
  }

  if (isPickModalOpen) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (typeof currentWhatNowChosen !== 'undefined' && currentWhatNowChosen && currentWhatNowChosen.task) {
        startZenWithTask(currentWhatNowChosen.task, currentWhatNowChosen.cat || 'todo');
      }
      return;
    }
    if (key === 'w' || key === 'r' || key === 'n') {
      e.preventDefault();
      if (typeof pickRandomTask === 'function') pickRandomTask();
      return;
    }
    if (key === '1') {
      e.preventDefault();
      if (typeof setWhatNowEnergyLevel === 'function') setWhatNowEnergyLevel('low');
      return;
    }
    if (key === '2') {
      e.preventDefault();
      if (typeof setWhatNowEnergyLevel === 'function') setWhatNowEnergyLevel('med');
      return;
    }
    if (key === '3') {
      e.preventDefault();
      if (typeof setWhatNowEnergyLevel === 'function') setWhatNowEnergyLevel('high');
      return;
    }
    if (key === '4') {
      e.preventDefault();
      if (typeof setWhatNowEnergyLevel === 'function') setWhatNowEnergyLevel('random');
      return;
    }
  }

  switch(key) {
    case '1':
      e.preventDefault();
      if (typeof setWorkspace === 'function') setWorkspace('private');
      break;
    case '2':
      e.preventDefault();
      if (typeof setWorkspace === 'function') setWorkspace('work');
      break;
    case '3':
      e.preventDefault();
      if (typeof setWorkspace === 'function') setWorkspace('study');
      break;
    case 'f':
      e.preventDefault();
      toggleMinimalist();
      break;
    case 't':
      e.preventDefault();
      toggleTimer();
      break;
    case 's':
      e.preventDefault();
      stopTimer();
      break;
    case 'w':
      e.preventDefault();
      openHelperModal('pick');
      break;
    case 'p':
      e.preventDefault();
      togglePanel('pause-dropdown');
      break;
    case 'k':
      e.preventDefault();
      togglePanel('cooking');
      break;
    case 'e':
      e.preventDefault();
      togglePanel('shopping');
      break;
    case 'u':
      e.preventDefault();
      handleUndo();
      break;
    case 'r':
      e.preventDefault();
      togglePanel('report');
      break;
    case 'b':
      e.preventDefault();
      if (typeof openBrainstormModal === 'function') openBrainstormModal();
      break;
    case 'i':
      e.preventDefault();
      togglePanel('inspiration');
      break;
    case 'o':
      e.preventDefault();
      if (typeof openSportModal === 'function') openSportModal();
      break;
    case 'h':
      e.preventDefault();
      togglePanel('logo-guide');
      break;
    case 'a':
      e.preventDefault();
      toggleTerminForm(true);
      break;
    case 'arrowleft':
    case 'arrowright':
      e.preventDefault();
      togglePanel('header-tools');
      break;
  }
});

function closeAllPanelsAndModals() {
  // 1. Cancel all active hover timeouts
  if (typeof hoverPanelShowTimeout !== 'undefined' && hoverPanelShowTimeout) {
    clearTimeout(hoverPanelShowTimeout);
    hoverPanelShowTimeout = null;
  }
  if (typeof hoverPanelHideTimeout !== 'undefined' && hoverPanelHideTimeout) {
    clearTimeout(hoverPanelHideTimeout);
    hoverPanelHideTimeout = null;
  }
  if (typeof taskMenuCloseTimer !== 'undefined' && taskMenuCloseTimer) {
    clearTimeout(taskMenuCloseTimer);
    taskMenuCloseTimer = null;
  }

  // 2. Close all floating desktop tool windows (Shopping, Cooking, Radio, Audio/DJ, News, Alarm, Daily, Impulse, etc.)
  if (typeof window !== 'undefined' && window.NoodleInteractionMode && typeof window.NoodleInteractionMode.closeAllWindows === 'function') {
    try { window.NoodleInteractionMode.closeAllWindows(); } catch(e) {}
  }
  if (typeof closeAllToolWindows === 'function') {
    try { closeAllToolWindows(); } catch(e) {}
  }
  if (typeof closeAllWindows === 'function') {
    try { closeAllWindows(); } catch(e) {}
  }
  document.querySelectorAll('.noodle-window-box, .noodle-floating-tool-window').forEach(box => {
    box.classList.add('hidden');
    box.style.removeProperty('display');
  });

  // 3. Modal close helpers
  if (typeof closeHelperModal === 'function') closeHelperModal();
  if (typeof closeCleaningGuideModal === 'function') closeCleaningGuideModal();
  if (typeof closeSportModal === 'function') closeSportModal();
  if (typeof closeSafeSpaceModal === 'function') closeSafeSpaceModal();
  if (typeof closeClarityModal === 'function') closeClarityModal();
  if (typeof closeRegulationModal === 'function') closeRegulationModal();
  if (typeof closeCustomItemModal === 'function') closeCustomItemModal();
  if (typeof closePrivacyModal === 'function') closePrivacyModal();
  if (typeof closeArchiveModal === 'function') closeArchiveModal();
  if (typeof closeExportModal === 'function') closeExportModal();
  if (typeof closeImportModal === 'function') closeImportModal();
  if (typeof closeDiceModal === 'function') closeDiceModal();
  if (typeof closeRouletteModal === 'function') closeRouletteModal();
  if (typeof closeReportDashboard === 'function') closeReportDashboard();
  if (typeof closeSettingsModal === 'function') closeSettingsModal();
  if (typeof closeInstallModal === 'function') closeInstallModal();
  if (typeof closeUndoHistoryModal === 'function') closeUndoHistoryModal();
  if (typeof closePostponeTerminModal === 'function') closePostponeTerminModal();
  if (typeof closeTextImportModal === 'function') closeTextImportModal();
  if (typeof closeReportExportModal === 'function') closeReportExportModal();
  if (typeof closeSampleManagerModal === 'function') closeSampleManagerModal();
  if (typeof closeSupermarketModal === 'function') closeSupermarketModal();
  if (typeof closeFeierabendModal === 'function') closeFeierabendModal();
  if (typeof closeCommandPalette === 'function') closeCommandPalette();
  if (typeof closeKeyboardShortcuts === 'function') closeKeyboardShortcuts();
  if (typeof closeP2PSyncModal === 'function') closeP2PSyncModal();
  if (typeof closeMobileQuickMenu === 'function') closeMobileQuickMenu();
  if (typeof closeMobileMenuDrawer === 'function') closeMobileMenuDrawer();
  if (typeof closeMobileToolsSheet === 'function') closeMobileToolsSheet();
  if (typeof closeBreakModal === 'function') closeBreakModal();
  if (typeof closeStepsModal === 'function') closeStepsModal();
  if (typeof closeNoteModal === 'function') closeNoteModal();
  if (typeof closeNoteDetailModal === 'function') closeNoteDetailModal();
  if (typeof closeBrainstormModal === 'function') closeBrainstormModal();
  if (typeof closeLearningHubModal === 'function') closeLearningHubModal();
  if (typeof closeNoteScannerModal === 'function') closeNoteScannerModal();
  if (typeof toggleTerminForm === 'function') toggleTerminForm(false);
  if (typeof closeTaskOptionsMenu === 'function') closeTaskOptionsMenu();
  if (typeof closeTemplateBuilderModal === 'function') closeTemplateBuilderModal();
  if (typeof hideSoundHoverSlider === 'function') hideSoundHoverSlider();

  // 4. Close all specific and generic modal elements
  const modalIds = [
    'modal-template-builder',
    'brainstorm-modal', 'clarity-modal', 'sample-manager-modal', 'supermarket-modal',
    'feierabend-celebration-modal', 'privacy-legal-modal', 'note-detail-modal',
    'helper-safespace-modal', 'helper-pick-modal', 'helper-sport-modal',
    'helper-break-modal', 'helper-steps-modal', 'helper-cleaning-modal', 'modal-p2p-sync',
    'modal-regulation', 'note-scanner-modal', 'modal-learning-hub',
    'modal-report-dashboard', 'modal-settings', 'modal-command-palette',
    'modal-keyboard-shortcuts', 'text-import-modal', 'report-export-modal',
    'mobile-menu-drawer', 'mobile-tools-sheet', 'modal-mobile-quick-menu',
    'modal-custom-item', 'modal-dice', 'modal-roulette', 'modal-archive',
    'modal-app-install', 'modal-undo-history', 'modal-postpone-termin',
    'app-confirm-modal', 'confirm-dialog-modal'
  ];
  modalIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      el.style.display = '';
    }
  });
  document.querySelectorAll('.modal, [id$="-modal"], [id*="modal-"], [id*="-modal"], .app-modal').forEach(el => {
    el.classList.add('hidden');
    el.style.display = '';
  });

  // 5. Close all subheader and header dropdowns, tools hub and popovers
  const subheaderDropdowns = [
    'dropdown-header-workspace', 'dropdown-manage-tables', 'dropdown-manage-columns',
    'popover-add-list', 'floating-add-list-container', 'panel-header-tools',
    'header-sound-volume-popover', 'weather-search-results', 'cmd-palette-results',
    'panel-search', 'panel-settings-dropdown', 'panel-calendar-dropdown',
    'panel-weather', 'panel-pause-dropdown', 'panel-timer-presets', 'panel-feedback',
    'panel-report', 'panel-labs-menu', 'panel-news', 'panel-alarm'
  ];
  subheaderDropdowns.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      el.style.display = '';
      el.classList.remove('noodle-panel-peeking', 'noodle-panel-pinned');
    }
  });

  // 6. Close all dock popover panels, dropdowns, context menus, and hover popovers
  const allPanels = document.querySelectorAll('.dock-popover-panel, [id^="panel-"], [id$="-dropdown"], [id*="-popover"], [id$="-popover"], #task-context-dropdown, #header-sound-volume-popover, .context-menu');
  allPanels.forEach(p => {
    p.classList.add('hidden');
    p.style.display = '';
    p.classList.remove('noodle-panel-peeking', 'noodle-panel-pinned');
  });

  // 7. PanelManager & ModalManager Fallback
  if (typeof PanelManager !== 'undefined' && typeof PanelManager.closeAll === 'function') PanelManager.closeAll();
  if (typeof ModalManager !== 'undefined' && typeof ModalManager.closeAll === 'function') ModalManager.closeAll();
  if (typeof ModalFocusManager !== 'undefined' && typeof ModalFocusManager.reset === 'function') ModalFocusManager.reset();

  // 8. Reset active state on mac dock and clear pinned panel state
  if (typeof currentlyOpenPanel !== 'undefined') currentlyOpenPanel = null;
  if (typeof window !== 'undefined') {
    window.currentlyOpenPanel = null;
    window.pinnedPanel = null;
  }
  if (typeof pinnedPanel !== 'undefined') pinnedPanel = null;
  const dockContainer = document.querySelector('.desktop-tools-sidebar, .mac-dock-container');
  if (dockContainer) dockContainer.classList.remove('is-active');

  // 9. Close all open inline add inputs
  if (typeof openTaskAddColumns !== 'undefined' && typeof openTaskAddColumns === 'object') {
    let reRenderNeeded = false;
    Object.keys(openTaskAddColumns).forEach(k => {
      if (openTaskAddColumns[k]) {
        openTaskAddColumns[k] = false;
        reRenderNeeded = true;
      }
    });
    if (reRenderNeeded && typeof renderApp === 'function') {
      renderApp();
    }
  }

  // 10. Blur active element so focus does not stay trapped in inputs
  if (typeof document !== 'undefined' && document.activeElement && typeof document.activeElement.blur === 'function') {
    try { document.activeElement.blur(); } catch(e) {}
  }

  // 11. Synchronize UI indicators (dashboard arrow flips back to chevron-right)
  if (typeof window !== 'undefined' && typeof window.updateDashboardArrowUI === 'function') {
    window.updateDashboardArrowUI(false);
  }
  if (typeof syncHeaderToolsMenuState === 'function') {
    try { syncHeaderToolsMenuState(); } catch(e) {}
  }
}
window.closeAllPanelsAndModals = closeAllPanelsAndModals;

function openMobileQuickMenu() {
  const modal = document.getElementById('modal-mobile-quick-menu');
  if (modal) {
    modal.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}
window.openMobileQuickMenu = openMobileQuickMenu;

function closeMobileQuickMenu() {
  const modal = document.getElementById('modal-mobile-quick-menu');
  if (modal) modal.classList.add('hidden');
}
window.closeMobileQuickMenu = closeMobileQuickMenu;

// SPARKLES & CELEBRATION CANVAS PARTICLES (PURE VANILLA JS)
function triggerSparkleEffect(x, y) {
  try {
    const canvas = document.createElement('canvas');
    canvas.className = 'fixed inset-0 pointer-events-none z-[150000]';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return; }

    const originX = x || (window.innerWidth / 2);
    const originY = y || (window.innerHeight / 3);

    const particles = [];
    const colors = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ffffff', '#c084fc'];
    for (let i = 0; i < 36; i++) {
      const angle = (Math.PI * 2 * i) / 36 + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 7 + 2.5;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        radius: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18; // Gravity
        p.life -= 0.024;
        p.alpha = Math.max(0, p.life);
        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
      frame++;
      if (alive && frame < 90) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(animate);
  } catch (e) {
    console.warn('triggerSparkleEffect error:', e);
  }
}
window.triggerSparkleEffect = triggerSparkleEffect;

// COMMAND PALETTE (STRG+K / CMD+K) CONTROLLER handled by app-command-palette.js

function openSettingsModal(tab = 'general') {
  const modal = document.getElementById('modal-settings');
  if (!modal) return;
  switchSettingsTab(tab);
  if (typeof ModalFocusManager !== 'undefined') {
    ModalFocusManager.open(modal, document.getElementById(`settings-tab-${tab}`), closeSettingsModal);
  } else { modal.classList.remove('hidden'); }
  renderLucideIcons();
}
window.openSettingsModal = openSettingsModal;

function closeSettingsModal() {
  const modal = document.getElementById('modal-settings');
  if (!modal) return;
  if (typeof ModalFocusManager !== 'undefined') ModalFocusManager.close(modal);
  else modal.classList.add('hidden');
}
window.closeSettingsModal = closeSettingsModal;

function switchSettingsTab(tabName) {
  const tabs = ['general', 'history', 'impressum', 'privacy', 'licenses'];
  tabs.forEach(t => {
    const btn = document.getElementById(`settings-tab-${t}`);
    const pane = document.getElementById(`settings-pane-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.className = 'py-2 px-2.5 rounded-xl bg-purple-600 text-white transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md';
      } else {
        btn.className = 'py-2 px-2.5 rounded-xl text-gray-400 hover:text-white transition cursor-pointer flex items-center justify-center gap-1.5';
      }
    }
    if (pane) {
      if (t === tabName) pane.classList.remove('hidden');
      else pane.classList.add('hidden');
    }
  });
  if (tabName === 'history') renderHistoryGallery();
  if (tabName === 'privacy' && typeof updateUmamiOptOutUI === 'function') updateUmamiOptOutUI();
  renderLucideIcons();
}

function getHistoryScreenshots() {
  try {
    if (typeof window !== 'undefined' && window.AppStorage && typeof window.AppStorage.get === 'function') {
      const stored = window.AppStorage.get('flow_history_screenshots');
      if (Array.isArray(stored)) return stored;
    }
    const saved = localStorage.getItem('flow_history_screenshots');
    return saved ? JSON.parse(saved) : [];
  } catch (e) { return []; }
}

function saveHistoryScreenshots(list) {
  try {
    if (typeof window !== 'undefined' && window.AppStorage && typeof window.AppStorage.set === 'function') {
      window.AppStorage.set('flow_history_screenshots', list);
    } else {
      localStorage.setItem('flow_history_screenshots', JSON.stringify(list));
    }
  } catch (e) {}
}

function handleHistoryScreenshotUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    const defaultTitle = 'Screenshot ' + new Date().toLocaleDateString();
    const promptMsg = typeof tr === 'function' ? tr({
      de: 'Titel oder Notiz für diesen Screenshot (z. B. "Früher Prototyp"):',
      en: 'Title or note for this screenshot (e.g. "Early Prototype"):'
    }) : 'Titel oder Notiz für diesen Screenshot:';
    const userTitle = prompt(promptMsg, defaultTitle) || defaultTitle;
    const list = getHistoryScreenshots();
    list.unshift({ id: 'shot_' + Date.now(), title: userTitle.trim(), date: new Date().toLocaleDateString(), data: base64 });
    saveHistoryScreenshots(list);
    renderHistoryGallery();
  };
  reader.readAsDataURL(file);
}

function deleteHistoryScreenshot(id) {
  saveHistoryScreenshots(getHistoryScreenshots().filter(item => item.id !== id));
  renderHistoryGallery();
}

function renderHistoryGallery() {
  const grid = document.getElementById('history-gallery-grid');
  const countEl = document.getElementById('history-gallery-count');
  if (!grid) return;
  grid.innerHTML = '';

  const customShots = getHistoryScreenshots();
  if (countEl) countEl.innerText = `${customShots.length} ${customShots.length === 1 ? 'Bild' : 'Bilder'}`;

  if (customShots.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full p-8 text-center border border-dashed border-white/10 rounded-2xl text-gray-400 space-y-2">
        <i data-lucide="image" class="w-8 h-8 text-gray-500 mx-auto mb-1"></i>
        <div class="font-bold text-xs text-gray-300">Noch keine Screenshots hinterlegt</div>
        <div class="text-[11px] text-gray-500 max-w-sm mx-auto leading-normal">Klicke oben auf „Screenshot hinzufügen 📷“, um Bilder früherer Versionen und Meilensteine hier zu sammeln.</div>
      </div>
    `;
    renderLucideIcons();
    return;
  }

  customShots.forEach(shot => {
    const card = document.createElement('div');
    card.className = 'group relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 hover:border-purple-500/50 transition flex flex-col justify-between';
    const safeDataUrl = typeof sanitizeUrl === 'function' ? sanitizeUrl(shot.data) : (shot.data || '');
    const safeTitle = typeof escapeHtml === 'function' ? escapeHtml(shot.title) : String(shot.title || '');
    const safeDate = typeof escapeHtml === 'function' ? escapeHtml(shot.date || '') : String(shot.date || '');
    const safeId = typeof escapeAttr === 'function' ? escapeAttr(shot.id) : String(shot.id || '');

    card.innerHTML = `<div class="relative overflow-hidden bg-black/60 cursor-pointer btn-open-shot"><img src="${escapeAttr(safeDataUrl)}" alt="${safeTitle}" class="w-full h-32 object-cover transition transform duration-300 group-hover:scale-105" /><div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1"><i data-lucide="maximize-2" class="w-4 h-4"></i><span>Öffnen</span></div></div><div class="p-2.5 flex items-center justify-between text-[11px] bg-[#111116]/90 border-t border-white/5 gap-2"><div class="truncate"><span class="truncate font-semibold text-white block">${safeTitle}</span><span class="text-[9px] text-gray-500 font-mono">${safeDate}</span></div><button class="btn-delete-shot p-1 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 transition cursor-pointer shrink-0" data-shot-id="${safeId}" aria-label="Screenshot löschen" title="Screenshot löschen"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button></div>`;

    const openTrigger = card.querySelector('.btn-open-shot');
    if (openTrigger) {
      openTrigger.addEventListener('click', () => {
        if (safeDataUrl && safeDataUrl !== '#') window.open(safeDataUrl, '_blank', 'noopener,noreferrer');
      });
    }
    const delBtn = card.querySelector('.btn-delete-shot');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteHistoryScreenshot(shot.id);
      });
    }
    grid.appendChild(card);
  });
  renderLucideIcons();
}

function saveGeneralSetting(key, val) {
  try {
    if (key === 'defaultWorkspace') {
      localStorage.setItem('flow_default_ws', val);
      const wsP = document.getElementById('setting-ws-private');
      const wsW = document.getElementById('setting-ws-work');
      if (wsP && wsW) {
        if (val === 'private') {
          wsP.className = 'flex-1 py-2 px-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold transition cursor-pointer';
          wsW.className = 'flex-1 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white font-bold transition cursor-pointer';
        } else {
          wsW.className = 'flex-1 py-2 px-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold transition cursor-pointer';
          wsP.className = 'flex-1 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white font-bold transition cursor-pointer';
        }
      }
    } else if (key === 'defaultTimer') {
      localStorage.setItem('flow_default_timer_min', val);
      [15, 25, 45, 60].forEach(m => {
        const b = document.getElementById(`setting-timer-${m}`);
        if (b) {
          if (m === val) b.className = 'py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono font-bold cursor-pointer';
          else b.className = 'py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-mono font-bold hover:text-white cursor-pointer';
        }
      });
      if (typeof timerMinutes !== 'undefined' && (typeof isTimerRunning === 'undefined' || !isTimerRunning)) {
        timerMinutes = val;
        timerSeconds = val * 60;
        if (typeof updateTimerDisplay === 'function') updateTimerDisplay();
      }
    }
  } catch (e) {
    console.warn('saveGeneralSetting error:', e);
  }
}

async function clearAllApplicationData() {
  const msg = typeof tr === 'function' ? tr({
    de: 'Möchtest du wirklich alle lokalen Daten unwiderruflich löschen und die App zurücksetzen?',
    en: 'Are you sure you want to completely erase all local data and reset the app?'
  }) : 'Möchtest du wirklich alle lokalen Daten unwiderruflich löschen und die App zurücksetzen?';

  const confirmed = typeof showConfirmDialog === 'function' ? await showConfirmDialog({
    title: typeof tr === 'function' ? tr({ de: 'App zurücksetzen?', en: 'Reset App?' }) : 'App zurücksetzen?',
    message: msg,
    confirmText: typeof tr === 'function' ? tr({ de: 'Alles löschen', en: 'Erase all' }) : 'Alles löschen',
    isDanger: true,
    icon: 'trash-2'
  }) : confirm(msg);

  if (confirmed) {
    try {
      if (typeof IDB_VAULT !== 'undefined' && IDB_VAULT && typeof IDB_VAULT.getAllKeys === 'function') {
        const keys = await IDB_VAULT.getAllKeys();
        for (const k of keys) {
          try { await IDB_VAULT.remove(k); } catch (err) {}
        }
      }
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch (e) {
      console.warn('clearAllApplicationData error:', e);
      window.location.reload();
    }
  }
}
window.clearAllApplicationData = clearAllApplicationData;

function initAppCoreOnDomReady() {
  const initTheme = (typeof currentTheme !== 'undefined' ? currentTheme : (typeof window !== 'undefined' ? window.currentTheme : null)) || (typeof localStorage !== 'undefined' && localStorage.getItem('flowPlannerTheme')) || 'aurora';
  const initLang = (typeof currentLang !== 'undefined' ? currentLang : (typeof window !== 'undefined' ? window.currentLang : null)) || (typeof localStorage !== 'undefined' && localStorage.getItem('flowPlannerLanguage')) || 'de';
  const safeCall = (fnName, ...args) => {
    if (typeof window !== 'undefined' && typeof window[fnName] === 'function') return window[fnName](...args);
  };
  if (typeof setTheme === 'function') setTheme(initTheme, true); else safeCall('setTheme', initTheme, true);
  if (typeof setLanguage === 'function') setLanguage(initLang, true); else safeCall('setLanguage', initLang, true);

  const iconEl = document.getElementById('zen-btn-icon'); const textEl = document.getElementById('minimal-mode-btn-text');
  const zenView = document.getElementById('zen-chill-view'); const mainEl = document.querySelector('main');
  const isMin = typeof isMinimalist !== 'undefined' ? isMinimalist : (typeof window !== 'undefined' && window.isMinimalist);
  const _t = typeof t === 'function' ? t : (typeof window !== 'undefined' && typeof window.t === 'function' ? window.t : (k => k));

  if (isMin) {
    document.body.classList.add('minimalist'); if (iconEl) iconEl.setAttribute('data-lucide', 'eye-off');
    if (textEl) textEl.innerText = _t('standard_mode');
    if (zenView) { zenView.classList.remove('hidden'); zenView.classList.add('flex'); }
    if (mainEl) { mainEl.classList.add('hidden'); }
    if (typeof updateZenView === 'function') updateZenView(); else safeCall('updateZenView');
  } else {
    document.body.classList.remove('minimalist'); if (iconEl) iconEl.setAttribute('data-lucide', 'eye');
    if (textEl) textEl.innerText = _t('minimal_mode');
    if (zenView) { zenView.classList.add('hidden'); zenView.classList.remove('flex'); }
    if (mainEl) { mainEl.classList.remove('hidden'); }
  }

  if (typeof updateDateAndStreak === 'function') updateDateAndStreak(); else safeCall('updateDateAndStreak');
  if (typeof updateWorkspaceSwitchUI === 'function') updateWorkspaceSwitchUI(); else safeCall('updateWorkspaceSwitchUI');
  if (typeof renderApp === 'function') renderApp(); else safeCall('renderApp');
  if (typeof updateZenView === 'function') updateZenView(); else safeCall('updateZenView');
  if (typeof populateHelperTaskSelect === 'function') populateHelperTaskSelect(); else safeCall('populateHelperTaskSelect');
  if (typeof suggestBoostActivity === 'function') suggestBoostActivity(); else safeCall('suggestBoostActivity');
  if (typeof suggestInspirationQuote === 'function') suggestInspirationQuote(); else safeCall('suggestInspirationQuote');
  if (typeof checkAndGenerateAutomaticReports === 'function') checkAndGenerateAutomaticReports(); else safeCall('checkAndGenerateAutomaticReports');

  const btnHeader = document.getElementById('timer-toggle-btn'); if (btnHeader) { btnHeader.innerHTML = '<i data-lucide="play" class="w-3.5 h-3.5 text-[var(--accent-light)]"></i>'; }
  if (typeof renderLucideIcons === 'function') renderLucideIcons(); else safeCall('renderLucideIcons');
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initAppCoreOnDomReady);
}

// Gruppiert alle Farbschemata nach visueller Verwandtschaft, damit der automatische
// Gruppiert alle Farbschemata nach visueller Verwandtschaft
const THEME_FAMILIES = {
  'green-nature': ['botanical', 'sage', 'matrix', 'matcha'],
  'cozy-warm': ['latte', 'sunset', 'candlelight', 'honey', 'terracotta'],
  'purple-dreams': ['aurora', 'cyberpunk', 'peach', 'royal', 'nebula'],
  'cool-icy': ['ocean', 'obsidian', 'crimson']
};

function getThemeFamily(theme) {
  for (const family in THEME_FAMILIES) {
    if (THEME_FAMILIES[family].includes(theme)) return family;
  }
  return null;
}

// Wählt ein zufälliges, aber verwandtes Farbschema zum aktuell aktiven aus
function getSimilarTheme(current) {
  const family = getThemeFamily(current);
  const allThemes = Object.values(THEME_FAMILIES).flat();
  const pool = family ? THEME_FAMILIES[family].filter(t => t !== current) : allThemes.filter(t => t !== current);
  if (pool.length === 0) return current;
  return pool[Math.floor(Math.random() * pool.length)];
}

var ALL_VALID_THEMES = window.ALL_VALID_THEMES = ['aurora', 'obsidian', 'botanical', 'latte', 'peach', 'ocean', 'code-night', 'matrix', 'ruby', 'cobalt', 'fruity-classic', 'fruity-studio'];

const THEME_ALIASES = {
  'default': 'aurora',
  'fruity': 'fruity-classic',
  'fruityloops': 'fruity-classic',
  'flstudio': 'fruity-studio',
  'fl-studio': 'fruity-studio',
  'daylight': 'botanical',
  'paper': 'botanical',
  'aurora-violet': 'aurora',
  'lavender-cloud': 'aurora',
  'syntax': 'aurora',
  'editor': 'aurora',
  'dark': 'aurora',
  'matrix': 'botanical',
  'forest': 'botanical',
  'matcha': 'botanical',
  'matcha-sage': 'botanical',
  'sage': 'botanical',
  'sage-breeze': 'botanical',
  'sage-latte': 'botanical',
  'eco': 'botanical',
  'nature': 'botanical',
  'carbon': 'obsidian',
  'charcoal': 'obsidian',
  'executive': 'obsidian',
  'ruby': 'peach',
  'cyberpunk': 'peach',
  'neon-cyber': 'peach',
  'synthwave': 'peach',
  'sakura': 'peach',
  'sakura-blossom': 'peach',
  'peach-cashmere': 'peach',
  'sunset': 'latte',
  'warm-sunset': 'latte',
  'honey': 'latte',
  'honey-chamomile': 'latte',
  'cozy-amber': 'latte',
  'cozy': 'latte',
  'citrus': 'latte',
  'amber': 'latte',
  'oat-latte': 'latte',
  'coffee': 'latte',
  'candlelight': 'latte',
  'cozy-candlelight': 'latte',
  'fireplace': 'latte',
  'terracotta-sun': 'latte',
  'terracotta': 'latte',
  'cobalt': 'ocean',
  'lagoon': 'ocean',
  'glacier': 'ocean',
  'glacier-frost': 'ocean',
  'holo-chrome': 'ocean',
  'architect': 'ocean'
};

function setTheme(theme, skipRender = false) {
  if (THEME_ALIASES[theme]) theme = THEME_ALIASES[theme];
  if (!ALL_VALID_THEMES.includes(theme)) theme = 'code-night';
  if (typeof window !== 'undefined') window.currentTheme = theme;
  if (typeof globalThis !== 'undefined') globalThis.currentTheme = theme;
  try { currentTheme = theme; } catch(e) {}
  
  if (typeof document !== 'undefined' && document.body) {
    document.body.className = `h-full antialiased flex flex-col font-sans select-none overflow-x-hidden text-[#f4f4f5] theme-${theme}`;
    if (typeof isMinimalist !== 'undefined' && isMinimalist) document.body.classList.add('minimalist');
  }
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.className = `theme-${theme}`;
  }
  try { localStorage.setItem('flowPlannerTheme', theme); } catch(e) {}

  // Update theme swatches active glow ring
  if (typeof document !== 'undefined') {
    document.querySelectorAll('[data-theme-swatch]').forEach(el => {
      const swTheme = el.getAttribute('data-theme-swatch');
      if (swTheme === theme) {
        el.classList.add('ring-2', 'ring-white', 'scale-110', 'shadow-lg');
      } else {
        el.classList.remove('ring-2', 'ring-white', 'scale-110', 'shadow-lg');
      }
    });
  }
  if (!skipRender && typeof renderApp === 'function') {
    try { renderApp(); } catch(e) {}
  }
}

function toggleExtraThemesAccordion(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const container = document.getElementById('container-extra-themes');
  const icon = document.getElementById('icon-extra-themes-arrow');
  if (container) {
    const isHidden = container.classList.contains('hidden');
    if (isHidden) {
      container.classList.remove('hidden');
      container.classList.add('grid');
      if (icon) icon.classList.add('rotate-180', 'text-purple-400');
    } else {
      container.classList.add('hidden');
      container.classList.remove('grid');
      if (icon) icon.classList.remove('rotate-180', 'text-purple-400');
    }
  }
}

// Sanfter, langsamer Farbwechsel (z.B. nach dem Erledigen einer Aufgabe): aktiviert kurzzeitig
// eine deutlich langsamere Übergangsdauer für den gesamten Seitenbaum und wechselt dann das Theme.
function setThemeSlow(theme) {
  setTheme(theme);
  // Erst NACH setTheme() hinzufügen, da setTheme() den kompletten className ersetzt
  document.body.classList.add('theme-fade-slow');
  setTimeout(() => {
    document.body.classList.remove('theme-fade-slow');
  }, 2600);
}

function setLanguage(lang, skipRender = false) {
  if (!lang) { lang = 'en'; }
  const transMap = typeof TRANSLATIONS !== 'undefined' ? TRANSLATIONS : ((typeof window !== 'undefined' && window.TRANSLATIONS) ? window.TRANSLATIONS : null);
  if (transMap && (!transMap[lang] || Object.keys(transMap[lang]).length < 20) && typeof loadLanguage === 'function') {
    loadLanguage(lang).then(() => {
      translateUI();
      if (!skipRender) {
        if (typeof renderApp === 'function') renderApp();
        else if (typeof window !== 'undefined' && typeof window.renderApp === 'function') window.renderApp();
      }
    }).catch(() => {});
  }
  const oldLang = (typeof currentLang !== 'undefined' ? currentLang : (typeof window !== 'undefined' ? window.currentLang : 'en')) || 'en';
  if (typeof window !== 'undefined') window.currentLang = lang;
  if (typeof globalThis !== 'undefined') globalThis.currentLang = lang;
  try { currentLang = lang; } catch(e) {}
  try { localStorage.setItem('flowPlannerLanguage', lang); } catch(e) {}
  if (typeof document !== 'undefined' && document.documentElement) document.documentElement.lang = lang;
  if (typeof translateUserTasks === 'function') translateUserTasks(oldLang, lang);
  translateUI();
  const textEl = document.getElementById('minimal-mode-btn-text');
  const isMin = typeof isMinimalist !== 'undefined' ? isMinimalist : (typeof window !== 'undefined' && window.isMinimalist);
  const _t = typeof t === 'function' ? t : (typeof window !== 'undefined' && typeof window.t === 'function' ? window.t : (k => k));
  if (textEl) { textEl.innerText = isMin ? _t('standard_mode') : _t('minimal_mode'); }
  if (!skipRender) {
    if (typeof updateDateAndStreak === 'function') updateDateAndStreak();
    else if (typeof window !== 'undefined' && typeof window.updateDateAndStreak === 'function') window.updateDateAndStreak();

    if (typeof renderApp === 'function') renderApp();
    else if (typeof window !== 'undefined' && typeof window.renderApp === 'function') window.renderApp();

    if (typeof updateZenView === 'function') updateZenView();
    else if (typeof window !== 'undefined' && typeof window.updateZenView === 'function') window.updateZenView();

    if (typeof populateHelperTaskSelect === 'function') populateHelperTaskSelect();
    else if (typeof window !== 'undefined' && typeof window.populateHelperTaskSelect === 'function') window.populateHelperTaskSelect();
  }
  // 1. Localize News Language independently from Region
  if (typeof RadioNewsEngine !== 'undefined') {
    if (typeof RadioNewsEngine.syncAppLanguage === 'function') {
      RadioNewsEngine.syncAppLanguage(lang);
    } else if (typeof RadioNewsEngine.initNewsPanel === 'function') {
      RadioNewsEngine.initNewsPanel();
    }
  }

  // 2. Weather: Keep user's real location if detected/custom, or update to language capital if fallback
  if (typeof localizeWeatherForLanguage === 'function') {
    localizeWeatherForLanguage(lang);
  } else if (typeof updateWeatherDisplay === 'function') {
    updateWeatherDisplay();
  } else if (typeof window !== 'undefined' && typeof window.localizeWeatherForLanguage === 'function') {
    window.localizeWeatherForLanguage(lang);
  } else if (typeof window !== 'undefined' && typeof window.updateWeatherDisplay === 'function') {
    window.updateWeatherDisplay();
  }

  if (!skipRender && typeof renderLucideIcons === 'function') {
    renderLucideIcons();
  }
}

function translateUI() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['en']?.[key] || TRANSLATIONS['de']?.[key];
    if (translated) {
      const icon = el.querySelector('i, svg');
      if (icon) {
        const textSpan = el.querySelector('span:not(.icon)');
        if (textSpan) {
          textSpan.innerText = translated;
        } else {
          const iconHTML = icon.outerHTML;
          el.innerHTML = `${iconHTML} <span>${translated}</span>`;
        }
      } else {
        el.innerText = translated;
      }
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translated = TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['en']?.[key] || TRANSLATIONS['de']?.[key];
    if (translated) el.setAttribute('placeholder', translated);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const translated = TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['en']?.[key] || TRANSLATIONS['de']?.[key];
    if (translated) el.setAttribute('title', translated);
  });
}

function translateTaskString(taskName, targetLang) {
  if (!taskName || typeof taskName !== 'string') return taskName;
  const target = targetLang || (typeof currentLang !== 'undefined' ? currentLang : 'de');
  const allLangs = ['de', 'en', 'es', 'fr', 'it', 'el'];

  // 1. Check DEFAULT_TASKS_BY_LANG (Personal)
  const defTasks = (typeof window !== 'undefined' && window.DEFAULT_TASKS_BY_LANG) || (typeof DEFAULT_TASKS_BY_LANG !== 'undefined' ? DEFAULT_TASKS_BY_LANG : null);
  if (defTasks) {
    const cats = ['daily', 'weekly', 'occasionally'];
    for (const cat of cats) {
      for (const l of allLangs) {
        const list = defTasks[l]?.[cat];
        if (Array.isArray(list)) {
          const idx = list.indexOf(taskName);
          if (idx !== -1 && defTasks[target]?.[cat]?.[idx]) {
            return defTasks[target][cat][idx];
          }
        }
      }
    }
  }

  // 2. Check DEFAULT_WORK_TASKS_BY_LANG (Work)
  const defWork = (typeof window !== 'undefined' && window.DEFAULT_WORK_TASKS_BY_LANG) || (typeof DEFAULT_WORK_TASKS_BY_LANG !== 'undefined' ? DEFAULT_WORK_TASKS_BY_LANG : null);
  if (defWork) {
    const workCats = ['work_focus', 'work_in_progress', 'work_waiting', 'work_backlog', 'termine', 'notes'];
    for (const cat of workCats) {
      for (const l of allLangs) {
        const list = defWork[l]?.[cat];
        if (Array.isArray(list)) {
          const idx = list.indexOf(taskName);
          if (idx !== -1 && defWork[target]?.[cat]?.[idx]) {
            return defWork[target][cat][idx];
          }
        }
      }
    }
  }

  // 3. Check DEFAULT_STUDY_TASKS_BY_LANG (Study)
  const defStudy = (typeof window !== 'undefined' && window.DEFAULT_STUDY_TASKS_BY_LANG) || (typeof DEFAULT_STUDY_TASKS_BY_LANG !== 'undefined' ? DEFAULT_STUDY_TASKS_BY_LANG : null);
  if (defStudy) {
    const studyCats = ['study_focus', 'study_modules', 'study_submissions', 'study_deep', 'termine', 'notes'];
    for (const cat of studyCats) {
      for (const l of allLangs) {
        const list = defStudy[l]?.[cat];
        if (Array.isArray(list)) {
          const idx = list.indexOf(taskName);
          if (idx !== -1 && defStudy[target]?.[cat]?.[idx]) {
            return defStudy[target][cat][idx];
          }
        }
      }
    }
  }

  // 4. Check ROUTINE_PRESETS
  const rPresets = (typeof window !== 'undefined' && window.ROUTINE_PRESETS) || (typeof ROUTINE_PRESETS !== 'undefined' ? ROUTINE_PRESETS : null);
  if (Array.isArray(rPresets)) {
    for (const preset of rPresets) {
      if (preset.tasks) {
        for (const cat in preset.tasks) {
          const catObj = preset.tasks[cat];
          if (typeof catObj === 'object') {
            for (const l of allLangs) {
              const list = catObj[l];
              if (Array.isArray(list)) {
                const idx = list.indexOf(taskName);
                if (idx !== -1 && catObj[target]?.[idx]) {
                  return catObj[target][idx];
                }
              }
            }
          }
        }
      }
    }
  }

  return taskName;
}
window.translateTaskString = translateTaskString;

function translateTaskCollection(collection, targetLang) {
  if (!collection || typeof collection !== 'object') return collection;
  for (const cat in collection) {
    if (Array.isArray(collection[cat])) {
      collection[cat] = collection[cat].map(item => {
        if (!item) return item;
        if (typeof item === 'string') {
          return translateTaskString(item, targetLang);
        }
        if (typeof item === 'object' && item.task) {
          return {
            ...item,
            task: translateTaskString(item.task, targetLang)
          };
        }
        return item;
      });
    }
  }
  return collection;
}

function translateUserTasks(fromLang, toLang) {
  if (fromLang === toLang) return;
  const s = (typeof state !== 'undefined') ? state : ((typeof window !== 'undefined' && window.state) ? window.state : null);
  if (!s) return;
  if (typeof saveHistory === 'function') saveHistory();

  // 1. Translate state.items (Personal workspace)
  if (s.items) {
    translateTaskCollection(s.items, toLang);
  }

  // 2. Translate state.workItems (Work workspace)
  if (s.workItems) {
    translateTaskCollection(s.workItems, toLang);
  }

  // 3. Translate state.studyItems (Study workspace)
  if (s.studyItems) {
    translateTaskCollection(s.studyItems, toLang);
  }

  // 4. Translate state.completedSteps
  if (s.completedSteps) {
    const nextStepsObj = {};
    for (let key in s.completedSteps) {
      const translatedKey = translateTaskString(key, toLang);
      nextStepsObj[translatedKey] = s.completedSteps[key];
    }
    s.completedSteps = nextStepsObj;
  }

  // 5. Translate completed tasks history
  ['completedTasks', 'workDone', 'studyDone'].forEach(prop => {
    if (Array.isArray(s[prop])) {
      s[prop] = s[prop].map(t => {
        if (!t) return t;
        if (typeof t === 'string') return translateTaskString(t, toLang);
        if (typeof t === 'object' && t.task) {
          return { ...t, task: translateTaskString(t.task, toLang) };
        }
        return t;
      });
    }
  });

  // 6. Translate active focus / timer task
  if (s.currentFocusTask) {
    s.currentFocusTask = translateTaskString(s.currentFocusTask, toLang);
  }
  if (s.activeTimerTask) {
    s.activeTimerTask = translateTaskString(s.activeTimerTask, toLang);
  }

  if (typeof saveState === 'function') saveState();
}

function toggleMinimalist() {
  isMinimalist = !isMinimalist; 
  localStorage.setItem('flowPlannerMinimalist', String(isMinimalist));
  const iconEl = document.getElementById('zen-btn-icon'); 
  const textEl = document.getElementById('minimal-mode-btn-text');
  const btnEl = document.getElementById('btn-focus-mode');
  const zenView = document.getElementById('zen-chill-view');
  const mainEl = document.querySelector('main');
  
  if (isMinimalist) {
    document.body.classList.add('minimalist'); 
    if (iconEl) iconEl.setAttribute('data-lucide', 'eye-off');
    if (textEl) textEl.innerText = t('standard_mode'); 
    if (btnEl) {
      btnEl.classList.remove('bg-purple-500/10', 'border-purple-500/30', 'text-purple-200');
      btnEl.classList.add('bg-purple-600/30', 'border-purple-400', 'text-white', 'shadow-[0_0_15px_rgba(168,85,247,0.4)]');
      btnEl.title = t('standard_mode') + ' [F]';
    }
    if (zenView) { zenView.classList.remove('hidden'); zenView.classList.add('flex'); }
    if (mainEl) { mainEl.classList.add('hidden'); }
    updateZenView();
  } else {
    document.body.classList.remove('minimalist'); 
    if (iconEl) iconEl.setAttribute('data-lucide', 'eye');
    if (textEl) textEl.innerText = t('minimal_mode');
    if (btnEl) {
      btnEl.classList.remove('bg-purple-600/30', 'border-purple-400', 'text-white', 'shadow-[0_0_15px_rgba(168,85,247,0.4)]');
      btnEl.classList.add('bg-purple-500/10', 'border-purple-500/30', 'text-purple-200');
      btnEl.title = t('minimal_mode') + ' [F]';
    }
    if (zenView) { zenView.classList.add('hidden'); zenView.classList.remove('flex'); }
    if (mainEl) { mainEl.classList.remove('hidden'); }
  }
  renderLucideIcons();
  showToast(isMinimalist ? t('toast_zen_active') : t('toast_zen_inactive'));
}

function zenCompleteCurrentTask() {
  const zenInfo = (typeof window !== 'undefined' && window.currentZenTaskInfo) || (typeof currentZenTaskInfo !== 'undefined' ? currentZenTaskInfo : null);
  if (!zenInfo || !zenInfo.cat || !zenInfo.task) {
    showToast(tr({ de: 'Keine aktive Aufgabe ausgewählt', en: 'No active task selected', es: 'Ninguna tarea activa seleccionada', el: 'Δεν επιλέχθηκε ενεργή εργασία', fr: 'Aucune tâche active sélectionnée', it: 'Nessuna attività attiva selezionata' }));
    return;
  }
  const cat = zenInfo.cat;
  const taskTextToFind = zenInfo.task;
  if (!state.items[cat]) return;
  const index = state.items[cat].findIndex(item => {
    const tStr = typeof item === 'object' ? item.task : item;
    return tStr === taskTextToFind;
  });
  if (index !== -1) {
    handleCompleteTask(cat, index);
  } else if (state.items[cat].length > 0) {
    handleCompleteTask(cat, 0);
  }
}

let editingTerminIndex = null;
let isTerminFormOpen = false;

function toggleTerminForm(open, prefilledDate) {
  isTerminFormOpen = open !== undefined ? open : !isTerminFormOpen;
  if (!isTerminFormOpen) {
    editingTerminIndex = null;
    selectedCalendarDate = null;
  } else if (prefilledDate) {
    selectedCalendarDate = prefilledDate;
  }
  if (typeof renderApp === 'function') renderApp();
  if (isTerminFormOpen) {
    setTimeout(() => { const inputTitle = document.getElementById('add-termin-title'); if (inputTitle && typeof inputTitle.focus === 'function') inputTitle.focus(); }, 50);
  }
}

function editTermin(index, event) {
  if (event) event.stopPropagation();
  const termin = state.items.termine?.[index];
  if (!termin) return;
  editingTerminIndex = index;
  isTerminFormOpen = true;
  if (typeof renderApp === 'function') renderApp();
  setTimeout(() => {
    const titleEl = document.getElementById('add-termin-title');
    const locEl = document.getElementById('add-termin-location');
    const dateEl = document.getElementById('add-termin-date');
    const timeEl = document.getElementById('add-termin-time');
    const statusEl = document.getElementById('add-termin-status');
    if (titleEl) titleEl.value = termin.task || termin.name || '';
    if (locEl) locEl.value = termin.location || '';
    if (dateEl) dateEl.value = termin.date || '';
    if (timeEl) timeEl.value = termin.time || '10:00';
    if (statusEl) statusEl.value = termin.status || 'open';
    if (titleEl) titleEl.focus();
  }, 50);
}

function handleAddTermin() {
  const titleEl = document.getElementById('add-termin-title');
  const locEl = document.getElementById('add-termin-location');
  const dateEl = document.getElementById('add-termin-date');
  const timeEl = document.getElementById('add-termin-time');
  const statusEl = document.getElementById('add-termin-status');
  const title = titleEl ? titleEl.value.trim() : '';
  const location = locEl ? locEl.value.trim() : '';
  const date = dateEl ? dateEl.value : '';
  const time = timeEl ? timeEl.value : '';
  const status = statusEl ? statusEl.value : 'open';

  if (!title) { showToast(t('toast_appointment_name_error')); return; }
  saveHistory();
  if (!state.items.termine) state.items.termine = [];
  
  if (editingTerminIndex !== null && editingTerminIndex >= 0 && state.items.termine[editingTerminIndex]) {
    const existing = state.items.termine[editingTerminIndex];
    state.items.termine[editingTerminIndex] = {
      ...(typeof existing === 'object' ? existing : {}),
      task: title,
      date,
      time,
      location,
      status: status || existing.status || 'open',
      updatedAt: new Date().toISOString()
    };
    editingTerminIndex = null;
    showToast(tr({
      de: 'Termin aktualisiert 📅',
      en: 'Appointment updated 📅',
      fr: 'Rendez-vous mis à jour 📅',
      it: 'Appuntamento aggiornato 📅',
      es: 'Cita actualizada 📅',
      el: 'Το ραντεβού ενημερώθηκε 📅'
    }));
  } else {
    state.items.termine.push({
      task: title,
      date,
      time,
      location,
      status: status || 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    showToast(t('toast_appointment_saved'));
  }
  isTerminFormOpen = false;
  selectedCalendarDate = null;
  saveState();
  if (typeof renderApp === 'function') renderApp();
  populateHelperTaskSelect();
}

// Task icon detection handled by data-tasks.js

// ===== KEYBOARD SHORTCUTS MODAL (?) =====
function openKeyboardShortcuts() {
  const m = document.getElementById('modal-keyboard-shortcuts');
  if (m) {
    if (typeof ModalFocusManager !== 'undefined') ModalFocusManager.open(m, null, closeKeyboardShortcuts);
    else m.classList.remove('hidden');
    renderLucideIcons();
  }
}
window.openKeyboardShortcuts = openKeyboardShortcuts;

function closeKeyboardShortcuts() {
  const m = document.getElementById('modal-keyboard-shortcuts');
  if (m) {
    if (typeof ModalFocusManager !== 'undefined') ModalFocusManager.close(m);
    else m.classList.add('hidden');
  }
}
window.closeKeyboardShortcuts = closeKeyboardShortcuts;

// ===== FULL LOCAL-FIRST BACKUP & RESTORE HUB (Delegiert an app-backup.js) =====
// Implementierung befindet sich in app-backup.js für saubere Modularität.


// ===== PWA INSTALLATION ENGINE =====
window.deferredPwaPrompt = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPwaPrompt = e;
    // Nie automatisch beim Laden anbieten! Installation wird gezielt im Onboarding und in den Optionen angeboten.
  });

  window.addEventListener('appinstalled', () => {
    window.deferredPwaPrompt = null;
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.classList.add('hidden');
    if (typeof showToast === 'function') {
      showToast(tr({
        de: 'Noodle erfolgreich installiert! 🎉',
        en: 'Noodle successfully installed! 🎉',
        fr: 'Noodle a été installé avec succès ! 🎉',
        it: 'Noodle installato con successo! 🎉',
        es: '¡Noodle se ha instalado con éxito! 🎉',
        el: 'Το Noodle εγκαταστάθηκε επιτυχώς! 🎉'
      }));
    }
  });
}

function triggerPwaInstall() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.classList.add('hidden');
  if (typeof openInstallModal === 'function') {
    openInstallModal();
  } else if (window.AppInstallationHub && typeof window.AppInstallationHub.openInstallModal === 'function') {
    window.AppInstallationHub.openInstallModal();
  } else if (window.deferredPwaPrompt) {
    window.deferredPwaPrompt.prompt();
    window.deferredPwaPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      }
      window.deferredPwaPrompt = null;
    });
  } else {
    if (typeof showToast === 'function') {
      showToast(tr({
        de: 'Installiere Noodle über dein Browsermenü („Zum Startbildschirm hinzufügen“ oder „App installieren“)',
        en: 'Install Noodle via your browser menu ("Add to Home Screen" or "Install App")'
      }));
    }
  }
}
window.triggerPwaInstall = triggerPwaInstall;

function dismissPwaBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.classList.add('hidden');
  sessionStorage.setItem('pwa_dismissed', 'true');
}
window.dismissPwaBanner = dismissPwaBanner;

// ===== GLOBAL KEYBOARD SHORTCUTS LISTENER =====
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    const targetTag = e.target.tagName?.toLowerCase();
    const isEditing = targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select' || e.target.isContentEditable;

    // Strg+K / Cmd+K Spotlight Command Palette
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (typeof openCommandPalette === 'function') openCommandPalette();
      return;
    }

    // Escape -> Close active popovers and dropdowns
    if (e.key === 'Escape') {
      if (typeof closeManageTablesDropdown === 'function') closeManageTablesDropdown();
      if (typeof closeHeaderWorkspaceDropdown === 'function') closeHeaderWorkspaceDropdown(true);
      const toolsPanel = document.getElementById('panel-header-tools');
      if (toolsPanel && !toolsPanel.classList.contains('hidden')) {
        if (typeof toggleDashboardOverlay === 'function') toggleDashboardOverlay();
        else toolsPanel.classList.add('hidden');
      }
      const soundVol = document.getElementById('header-sound-volume-popover');
      if (soundVol && !soundVol.classList.contains('hidden')) soundVol.classList.add('hidden');
      if (typeof closeAllPanelsAndModals === 'function') closeAllPanelsAndModals();
      return;
    }

    if (isEditing) return;

    // '?' -> Keyboard shortcuts cheat sheet
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      openKeyboardShortcuts();
    }
    // 'N' or 'n' -> New task modal
    else if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      if (typeof openTaskModal === 'function') openTaskModal('daily');
    }
    // 'T' or 't' -> Toggle Pomodoro focus timer
    else if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      if (typeof toggleTimer === 'function') toggleTimer();
    }
    // 'Z' or 'z' -> Toggle Minimalist / Zen mode
    else if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      if (typeof toggleMinimalist === 'function') toggleMinimalist();
    }
    // '1' -> Switch to Private workspace
    else if (e.key === '1') {
      e.preventDefault();
      if (typeof switchWorkspace === 'function') switchWorkspace('private');
    }
    // '2' -> Switch to Work workspace
    else if (e.key === '2') {
      e.preventDefault();
      if (typeof switchWorkspace === 'function') switchWorkspace('work');
    }
  });
}

// ===== AMBIENT BACKGROUND STARDUST & IDLE FLOW ENGINE =====
function initAmbientFlowCanvas() {
  const canvas = document.getElementById('ambient-flow-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  let isMobile = width <= 768;
  let particles = [];
  const particleCount = isMobile 
    ? Math.min(16, Math.floor((width * height) / 48000))
    : Math.min(38, Math.floor((width * height) / 32000));

  class FlowParticle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.radius = 1 + Math.random() * 1.6;
      this.vx = (Math.random() - 0.5) * 0.22;
      this.vy = -0.15 - Math.random() * 0.32;
      this.baseAlpha = 0.15 + Math.random() * 0.35;
      this.alpha = this.baseAlpha;
      this.color = Math.random() > 0.5 ? 'rgba(137, 207, 240,' : 'rgba(192, 132, 252,';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color} ${this.alpha})`;
      ctx.fill();
    }
  }

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    for (let i = 0; i < particleCount; i++) particles.push(new FlowParticle());
    particles.forEach(p => p.draw());
    return;
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new FlowParticle());
  }

  let animId = null;
  let lastFrameTime = 0;
  const targetFrameInterval = isMobile ? 40 : 30; // ~25 FPS mobile, ~33 FPS desktop: smooth ambient feel with minimal CPU load

  function renderAmbient(timestamp) {
    animId = requestAnimationFrame(renderAmbient);

    if (timestamp - lastFrameTime < targetFrameInterval) return;
    lastFrameTime = timestamp;

    ctx.clearRect(0, 0, width, height);

    // Draw connecting faint energy lines between nearby nodes (desktop only to save mobile battery)
    if (!isMobile && particles.length <= 40) {
      const len = particles.length;
      for (let i = 0; i < len; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < len; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 10000) { // 100px squared, avoids Math.sqrt overhead
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / 100) * 0.07;
            ctx.strokeStyle = `rgba(129, 140, 248, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    }

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
  }

  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      isMobile = width <= 768;
    }, 150);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animId) { cancelAnimationFrame(animId); animId = null; }
    } else {
      if (!animId) {
        lastFrameTime = performance.now();
        animId = requestAnimationFrame(renderAmbient);
      }
    }
  });

  animId = requestAnimationFrame(renderAmbient);
}

// ============================================================================
// NATIVE MOBILE NAVIGATION CONTROLLER (5 TABS & FAB)
// ============================================================================

// switchMobileNavTab handled by app-tasks.js

let selectedMobileQuickAddCat = 'daily';
let selectedMobileQuickAddPrio = 'normal';
let mobileSpeechRecognition = null;

function openMobileQuickAddModal() {
  const modal = document.getElementById('modal-mobile-quick-add');
  if (!modal) return;
  
  selectedMobileQuickAddCat = document.body.dataset.mobileCat || 'daily';
  selectedMobileQuickAddPrio = 'normal';
  
  const textarea = document.getElementById('mobile-quick-add-input');
  if (textarea) textarea.value = '';
  
  renderMobileQuickAddChips();
  selectMobilePriority('normal');
  
  modal.classList.remove('hidden');
  if (textarea) {
    setTimeout(() => textarea.focus(), 100);
  }
}

function closeMobileQuickAddModal() {
  const modal = document.getElementById('modal-mobile-quick-add');
  if (modal) modal.classList.add('hidden');
  if (mobileSpeechRecognition) {
    try { mobileSpeechRecognition.stop(); } catch(e){}
    mobileSpeechRecognition = null;
  }
}

function renderMobileQuickAddChips() {
  const container = document.getElementById('mobile-quick-add-cat-chips');
  const label = document.getElementById('mobile-quick-add-cat-label');
  if (!container) return;
  
  const isWork = state && state.activeWorkspace === 'work';
  const activeOrder = isWork ? (workCategoriesOrder || WORK_CATEGORIES_ORDER) : categoriesOrder;
  
  if (label) {
    const found = activeOrder.find(([id]) => id === selectedMobileQuickAddCat);
    label.textContent = found ? (found[2] || t(found[0])) : t(selectedMobileQuickAddCat);
  }
  
  container.innerHTML = activeOrder.map(([id, iconKey, customTitle]) => {
    const isSel = id === selectedMobileQuickAddCat;
    const title = customTitle || t(id);
    return `
      <button type="button" onclick="selectMobileQuickAddCategory('${id}')" class="px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
        isSel 
          ? 'bg-purple-600 text-white border border-purple-400 shadow-sm scale-105' 
          : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
      }">
        <i data-lucide="${iconKey}" class="w-3.5 h-3.5"></i>
        <span>${title}</span>
      </button>
    `;
  }).join('');
  
  if (typeof renderLucideIcons === 'function') renderLucideIcons();
  else if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function selectMobileQuickAddCategory(catId) {
  selectedMobileQuickAddCat = catId;
  renderMobileQuickAddChips();
}

function selectMobilePriority(prio) {
  selectedMobileQuickAddPrio = prio;
  ['high', 'medium', 'normal'].forEach(p => {
    const btn = document.getElementById(`mob-prio-${p}`);
    if (btn) {
      if (p === prio) {
        if (p === 'high') btn.className = 'mob-prio-btn py-2 px-2.5 rounded-xl border border-rose-400 bg-rose-500/30 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md scale-105';
        else if (p === 'medium') btn.className = 'mob-prio-btn py-2 px-2.5 rounded-xl border border-amber-400 bg-amber-500/30 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md scale-105';
        else btn.className = 'mob-prio-btn py-2 px-2.5 rounded-xl border border-purple-400 bg-purple-500/30 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md scale-105';
      } else {
        btn.className = `mob-prio-btn py-2 px-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 text-xs font-bold transition flex items-center justify-center gap-1.5 opacity-60`;
      }
    }
  });
}

function toggleMobileVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (typeof showToast === 'function') showToast(tr({ de: 'Spracheingabe im Browser nicht verfügbar.', en: 'Voice input not available in this browser.' }));
    return;
  }
  
  const micBtn = document.getElementById('mobile-mic-voice-btn');
  if (mobileSpeechRecognition) {
    try { mobileSpeechRecognition.stop(); } catch(e){}
    mobileSpeechRecognition = null;
    if (micBtn) micBtn.classList.remove('bg-rose-500', 'text-white', 'animate-pulse');
    return;
  }
  
  mobileSpeechRecognition = new SpeechRecognition();
  mobileSpeechRecognition.continuous = false;
  mobileSpeechRecognition.interimResults = false;
  mobileSpeechRecognition.lang = typeof currentLang !== 'undefined' ? (currentLang === 'de' ? 'de-DE' : currentLang === 'fr' ? 'fr-FR' : currentLang === 'el' ? 'el-GR' : 'en-US') : 'de-DE';
  
  if (micBtn) micBtn.classList.add('bg-rose-500', 'text-white', 'animate-pulse');
  
  mobileSpeechRecognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    const textarea = document.getElementById('mobile-quick-add-input');
    if (textarea) {
      textarea.value = (textarea.value ? textarea.value + ' ' : '') + transcript;
    }
  };
  
  mobileSpeechRecognition.onend = () => {
    mobileSpeechRecognition = null;
    if (micBtn) micBtn.classList.remove('bg-rose-500', 'text-white', 'animate-pulse');
  };
  
  mobileSpeechRecognition.onerror = () => {
    mobileSpeechRecognition = null;
    if (micBtn) micBtn.classList.remove('bg-rose-500', 'text-white', 'animate-pulse');
  };
  
  mobileSpeechRecognition.start();
}

function submitMobileQuickAdd() {
  const textarea = document.getElementById('mobile-quick-add-input');
  if (!textarea) return;
  const text = textarea.value.trim();
  if (!text) {
    if (typeof showToast === 'function') showToast(tr({ de: 'Bitte gib einen Aufgabentext ein.', en: 'Please enter a task description.' }));
    return;
  }
  
  const cat = selectedMobileQuickAddCat || 'daily';
  let formattedText = text;
  if (selectedMobileQuickAddPrio === 'high') formattedText = '🔥 ' + formattedText;
  else if (selectedMobileQuickAddPrio === 'medium') formattedText = '⚡ ' + formattedText;
  
  if (typeof addTaskDirectly === 'function') {
    addTaskDirectly(cat, formattedText);
  } else {
    const curItems = getCurrentWorkspaceItems();
    if (!curItems[cat]) curItems[cat] = [];
    curItems[cat].unshift({ task: formattedText, done: false, date: new Date().toISOString() });
    if (typeof saveState === 'function') saveState();
    if (typeof renderBoard === 'function') renderBoard();
  }
  
  closeMobileQuickAddModal();
  setMobileCategory(cat);
  if (typeof showToast === 'function') {
    showToast(tr({ de: `✨ Aufgabe zu "${t(cat)}" hinzugefügt!`, en: `✨ Task added to "${t(cat)}"!` }));
  }
}

// Swipe Gesture Controller for Mobile Column Switching
function initMobileSwipeGestures() {
  if (typeof window === 'undefined') return;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  
  document.addEventListener('touchstart', (e) => {
    if (window.innerWidth > 768) return;
    if (document.body.dataset.mobileNav && document.body.dataset.mobileNav !== 'planer') return;
    if (e.target.closest('#modal-mobile-quick-add, #modal-mobile-quick-menu, .mobile-category-tabs, input[type="range"], .modal-card, [data-no-swipe]')) return;
    
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  
  document.addEventListener('touchend', (e) => {
    if (window.innerWidth > 768) return;
    if (document.body.dataset.mobileNav && document.body.dataset.mobileNav !== 'planer') return;
    if (e.target.closest('#modal-mobile-quick-add, #modal-mobile-quick-menu, .mobile-category-tabs, input[type="range"], .modal-card, [data-no-swipe]')) return;
    
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    if (Math.abs(diffX) > 55 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
      if (typeof stepMobileCategory === 'function') {
        if (diffX < 0) {
          stepMobileCategory(1);
        } else {
          stepMobileCategory(-1);
        }
      }
    }
  }, { passive: true });
}

// Auto-Wiederherstellung des letzten mobilen Tabs beim Start & Swipe-Init
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth <= 768) {
      const savedTab = localStorage.getItem('flow_active_mobile_tab') || 'planer';
      switchMobileNavTab(savedTab);
    }
    initMobileSwipeGestures();
  });
}

if (typeof window !== 'undefined') {
  window.setTheme = setTheme;
  window.setLanguage = setLanguage;
  window.toggleMinimalist = toggleMinimalist;
  window.closeAllPanelsAndModals = closeAllPanelsAndModals;
  if (typeof getTaskIconDetails !== 'undefined') window.getTaskIconDetails = getTaskIconDetails;
  if (typeof getTaskIcon !== 'undefined') window.getTaskIcon = getTaskIcon;
  if (typeof openCommandPalette !== 'undefined') window.openCommandPalette = openCommandPalette;
  if (typeof closeCommandPalette !== 'undefined') window.closeCommandPalette = closeCommandPalette;
  if (typeof switchMobileNavTab !== 'undefined') window.switchMobileNavTab = switchMobileNavTab;
  Object.assign(window, { openMobileQuickAddModal, closeMobileQuickAddModal, selectMobileQuickAddCategory, selectMobilePriority, toggleMobileVoiceInput, submitMobileQuickAdd, toggleExtraThemesAccordion, renderHistoryGallery, deleteHistoryScreenshot });
}
if (typeof globalThis !== 'undefined' && typeof window !== 'undefined' && globalThis !== window) {
  Object.assign(globalThis, {
    setTheme, setLanguage, toggleMinimalist, closeAllPanelsAndModals,
    getTaskIconDetails: typeof getTaskIconDetails !== 'undefined' ? getTaskIconDetails : undefined,
    getTaskIcon: typeof getTaskIcon !== 'undefined' ? getTaskIcon : undefined,
    openCommandPalette: typeof openCommandPalette !== 'undefined' ? openCommandPalette : undefined,
    closeCommandPalette: typeof closeCommandPalette !== 'undefined' ? closeCommandPalette : undefined,
    switchMobileNavTab: typeof switchMobileNavTab !== 'undefined' ? switchMobileNavTab : undefined,
    openMobileQuickAddModal, closeMobileQuickAddModal, selectMobileQuickAddCategory,
    selectMobilePriority, toggleMobileVoiceInput, submitMobileQuickAdd,
    toggleExtraThemesAccordion, renderHistoryGallery, deleteHistoryScreenshot
  });
}
