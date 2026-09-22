/**
 * ============================================================================
 * Noodle - App Core & Orchestrierung (app-core.js)
 * ============================================================================
 * Zentrale Steuerungseinheit der Benutzeroberfläche:
 * - Globale Fehlerbehandlung (Error Boundaries)
 * - Workspace-Verwaltung (Personal / Work Wechsel)
 * - Theme- & Farb-Engine (12 Themes, sanfte Übergänge, Minimalist-Modus)
 * - Mobile Navigation (5-Tab Leiste, Bottom-Sheets, Swipe-Gesten)
 * - Fokus- & Zen-Modus Orchestrierung
 * - Lokalisierung & dynamische UI-Übersetzungen
 * ============================================================================
 */

let currentZenTaskInfo = null;
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
  const list = BOOST_ACTIVITIES[currentLang] || BOOST_ACTIVITIES['en'];
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

function handleSoundsMainClick() { togglePanel('audio'); switchAudioTab('ambient'); }
function handleMusicMainClick() { togglePanel('audio'); switchAudioTab('music'); }

function switchAudioTab(tabName) {
  if (typeof window !== 'undefined') window._lastActiveAudioTab = tabName;
  const tabConfigs = {
    ambient: {
      activeClass: 'flex-1 py-2 px-1.5 rounded-xl text-emerald-100 bg-gradient-to-r from-emerald-600/40 via-teal-600/35 to-emerald-600/40 border border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.35)] font-bold',
      inactiveClass: 'flex-1 py-2 px-1.5 rounded-xl text-gray-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent transition font-medium'
    },
    beats: {
      activeClass: 'flex-1 py-2 px-1.5 rounded-xl text-purple-100 bg-gradient-to-r from-purple-600/40 via-violet-600/35 to-purple-600/40 border border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.35)] font-bold',
      inactiveClass: 'flex-1 py-2 px-1.5 rounded-xl text-gray-400 hover:text-purple-300 hover:bg-purple-500/10 border border-transparent transition font-medium'
    },
    music: {
      activeClass: 'flex-1 py-2 px-1.5 rounded-xl text-cyan-100 bg-gradient-to-r from-cyan-600/40 via-sky-600/35 to-cyan-600/40 border border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.35)] font-bold',
      inactiveClass: 'flex-1 py-2 px-1.5 rounded-xl text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent transition font-medium'
    },
    dj: {
      activeClass: 'flex-1 py-2 px-1.5 rounded-xl text-amber-100 bg-gradient-to-r from-amber-600/40 via-orange-600/35 to-amber-600/40 border border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.35)] font-bold',
      inactiveClass: 'flex-1 py-2 px-1.5 rounded-xl text-gray-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent transition font-medium'
    }
  };

  const tabs = ['ambient', 'beats', 'music', 'dj'];
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
    const moodPresetsEl = document.getElementById('audio-studio-mood-presets');
    if (moodPresetsEl) {
      moodPresetsEl.classList.toggle('hidden', tabName === 'dj');
    }
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

let activeDancingSpecialButton = 'whatnow'; let currentPremiumDanceIndex = 0;
const premiumDances = ['premium-glow-btn', 'animate-premium-heartbeat', 'animate-premium-orbit', 'animate-premium-float', 'animate-premium-shimmer'];

function rotatePremiumDance() {
  const activeBtn = activeDancingSpecialButton === 'whatnow' ? document.getElementById('btn-whatnow-dance') : document.getElementById('btn-focus-mode');
  const inactiveBtn = activeDancingSpecialButton === 'whatnow' ? document.getElementById('btn-focus-mode') : document.getElementById('btn-whatnow-dance');
  if (inactiveBtn) { premiumDances.forEach(c => inactiveBtn.classList.remove(c)); inactiveBtn.classList.add('bg-purple-500/10', 'border-purple-500/30'); }
  if (activeBtn) {
    premiumDances.forEach(c => activeBtn.classList.remove(c)); activeBtn.classList.remove('bg-purple-500/10', 'border-purple-500/30');
    currentPremiumDanceIndex = (currentPremiumDanceIndex + 1) % premiumDances.length; activeBtn.classList.add(premiumDances[currentPremiumDanceIndex]);
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    e.preventDefault();
    closeAllPanelsAndModals();
    return;
  }

  const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
  if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement && document.activeElement.isContentEditable)) {
    return;
  }

  const pickModal = document.getElementById('helper-pick-modal');
  const isPickModalOpen = pickModal && !pickModal.classList.contains('hidden');
  const key = e.key.toLowerCase();

  if (isPickModalOpen) {
    if (e.key === ' ' || e.key === 'Enter') {
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

  // 2. Modal close helpers
  if (typeof closeHelperModal === 'function') closeHelperModal();
  if (typeof closeSportModal === 'function') closeSportModal();
  if (typeof closeSafeSpaceModal === 'function') closeSafeSpaceModal();
  if (typeof closeCustomItemModal === 'function') closeCustomItemModal();
  if (typeof closePrivacyModal === 'function') closePrivacyModal();
  if (typeof closeArchiveModal === 'function') closeArchiveModal();
  if (typeof closeExportModal === 'function') closeExportModal();
  if (typeof closeImportModal === 'function') closeImportModal();
  if (typeof closeDiceModal === 'function') closeDiceModal();
  if (typeof closeRouletteModal === 'function') closeRouletteModal();
  if (typeof closeReportDashboard === 'function') closeReportDashboard();
  if (typeof closeSettingsModal === 'function') closeSettingsModal();
  if (typeof closeCommandPalette === 'function') closeCommandPalette();
  if (typeof closeKeyboardShortcuts === 'function') closeKeyboardShortcuts();
  if (typeof closeP2PSyncModal === 'function') closeP2PSyncModal();
  if (typeof closeMobileQuickMenu === 'function') closeMobileQuickMenu();
  if (typeof closeMobileMenuDrawer === 'function') closeMobileMenuDrawer();
  if (typeof closeMobileToolsSheet === 'function') closeMobileToolsSheet();
  if (typeof closeBreakModal === 'function') closeBreakModal();
  if (typeof closeStepsModal === 'function') closeStepsModal();
  if (typeof closeNoteModal === 'function') closeNoteModal();
  if (typeof closeBrainstormModal === 'function') closeBrainstormModal();
  if (typeof toggleTerminForm === 'function') toggleTerminForm(false);
  if (typeof closeTaskOptionsMenu === 'function') closeTaskOptionsMenu();
  if (typeof hideSoundHoverSlider === 'function') hideSoundHoverSlider();

  // 3. Close all specific and generic modal elements
  const modalIds = [
    'brainstorm-modal', 'clarity-modal', 'sample-manager-modal', 'supermarket-modal',
    'feierabend-celebration-modal', 'privacy-legal-modal', 'note-detail-modal',
    'helper-safespace-modal', 'helper-pick-modal', 'helper-sport-modal',
    'helper-break-modal', 'helper-steps-modal', 'modal-p2p-sync',
    'modal-regulation',
    'modal-report-dashboard', 'modal-settings', 'modal-command-palette',
    'modal-keyboard-shortcuts', 'text-import-modal', 'report-export-modal',
    'mobile-menu-drawer', 'mobile-tools-sheet', 'modal-mobile-quick-menu',
    'modal-custom-item', 'modal-dice', 'modal-roulette', 'modal-archive'
  ];
  modalIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  document.querySelectorAll('.modal, [id$="-modal"], [id*="modal-"], [id*="-modal"]').forEach(el => {
    el.classList.add('hidden');
  });

  // 4. Close all dock popover panels, dropdowns, context menus, and hover popovers
  const allPanels = document.querySelectorAll('.dock-popover-panel, [id^="panel-"], [id$="-dropdown"], [id*="-popover"], #task-context-dropdown, #header-sound-volume-popover, .context-menu');
  allPanels.forEach(p => p.classList.add('hidden'));

  // 5. Reset active state on mac dock and clear pinned panel state
  if (typeof currentlyOpenPanel !== 'undefined') currentlyOpenPanel = null;
  if (typeof window !== 'undefined') {
    window.currentlyOpenPanel = null;
    window.pinnedPanel = null;
  }
  if (typeof pinnedPanel !== 'undefined') pinnedPanel = null;
  const dockContainer = document.querySelector('.desktop-tools-sidebar, .mac-dock-container');
  if (dockContainer) dockContainer.classList.remove('is-active');

  // 6. Close all open inline add inputs
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

// COMMAND PALETTE (STRG+K / CMD+K) CONTROLLER
let commandPaletteActiveIndex = 0;
let commandPaletteItems = [];

function openCommandPalette() {
  const modal = document.getElementById('modal-command-palette');
  const input = document.getElementById('cmd-palette-input');
  if (!modal || !input) return;
  modal.classList.remove('hidden');
  input.value = '';
  commandPaletteActiveIndex = 0;
  filterCommandPalette('');
  setTimeout(() => input.focus(), 30);
  if (typeof renderLucideIcons === 'function') renderLucideIcons();
}

function closeCommandPalette() {
  const modal = document.getElementById('modal-command-palette');
  if (modal) modal.classList.add('hidden');
}

function getAvailableCommands() {
  return [
    {
      id: 'timer_25',
      title: tr({
        de: '⏱️ Fokus-Timer: 25 Minuten starten',
        en: '⏱️ Focus Timer: Start 25 minutes',
        fr: '⏱️ Minuteur Focus : Démarrer 25 minutes',
        it: '⏱️ Timer Focus: Avvia 25 minuti',
        es: '⏱️ Temporizador Focus: Iniciar 25 minutos',
        el: '⏱️ Χρονόμετρο Εστίασης: Έναρξη 25 λεπτά'
      }),
      action: () => { if (typeof setTimerMinutes === 'function') setTimerMinutes(25); if (typeof startTimer === 'function') startTimer(); }
    },
    {
      id: 'timer_15',
      title: tr({
        de: '⏱️ Fokus-Timer: 15 Minuten Kurz-Sprint',
        en: '⏱️ Focus Timer: 15-minute quick sprint',
        fr: '⏱️ Minuteur Focus : Sprint rapide de 15 minutes',
        it: '⏱️ Timer Focus: Sprint rapido di 15 minuti',
        es: '⏱️ Temporizador Focus: Sprint rápido de 15 minutos',
        el: '⏱️ Χρονόμετρο Εστίασης: Γρήγορο σπριντ 15 λεπτών'
      }),
      action: () => { if (typeof setTimerMinutes === 'function') setTimerMinutes(15); if (typeof startTimer === 'function') startTimer(); }
    },
    {
      id: 'whatnow',
      title: tr({
        de: '💡 Was nun? – Nächste beste Aufgabe wählen',
        en: '💡 What now? – Pick next best task',
        fr: '💡 Et maintenant ? – Choisir la meilleure tâche',
        it: '💡 E adesso? – Scegli la migliore attività',
        es: '💡 ¿Y ahora qué? – Elegir la mejor tarea',
        el: '💡 Τι να κάνω; – Επιλογή επόμενης εργασίας'
      }),
      action: () => { if (typeof openHelperModal === 'function') openHelperModal('pick'); }
    },
    {
      id: 'brainstorm',
      title: tr({
        de: '🧠 Brainstorming Studio – Ideen & Gedanken erfassen',
        en: '🧠 Brainstorming Studio – Capture ideas & thoughts',
        fr: '🧠 Brainstorming Studio – Capturer des idées et pensées',
        it: '🧠 Brainstorming Studio – Cattura idee e pensieri',
        es: '🧠 Brainstorming Studio – Capturar ideas y pensamientos',
        el: '🧠 Brainstorming Studio – Καταγραφή ιδεών και σκέψεων'
      }),
      action: () => { if (typeof openBrainstormModal === 'function') openBrainstormModal(); }
    },
    {
      id: 'zen',
      title: tr({
        de: '👁️ Fokus-Modus (Zen) an / aus',
        en: '👁️ Focus Mode (Zen) on / off',
        fr: '👁️ Mode Focus (Zen) activer / désactiver',
        it: '👁️ Modalità Focus (Zen) attiva / disattiva',
        es: '👁️ Modo Focus (Zen) activar / desactivar',
        el: '👁️ Λειτουργία Εστίασης (Zen) ενεργοποίηση'
      }),
      action: () => { if (typeof toggleMinimalist === 'function') toggleMinimalist(); }
    },
    {
      id: 'pause_breath',
      title: tr({
        de: '🧘 4-4-4 Atem-Fokus (Nervensystem beruhigen)',
        en: '🧘 4-4-4 Box Breathing (Calm nervous system)',
        fr: '🧘 Respiration 4-4-4 (Calmer le système nerveux)',
        it: '🧘 Respirazione 4-4-4 (Calma il sistema nervoso)',
        es: '🧘 Respiración 4-4-4 (Calmar sistema nervioso)',
        el: '🧘 Αναπνοή 4-4-4 (Ηρεμία νευρικού συστήματος)'
      }),
      action: () => { if (typeof openBreakModal === 'function') openBreakModal('breath'); }
    },
    {
      id: 'regulation',
      title: tr({
        de: '🌿 Innere Ruhe & Somatische Regulation (Nervensystem beruhigen)',
        en: '🌿 Inner Peace & Somatic Regulation (Calm nervous system)',
        fr: '🌿 Paix Intérieure & Régulation Somatique',
        it: '🌿 Pace Interiore & Regolazione Somatica',
        es: '🌿 Paz Interior & Regulación Somática',
        el: '🌿 Εσωτερική Γαλήνη & Σωματική Ρύθμιση'
      }),
      action: () => { if (typeof openRegulationModal === 'function') openRegulationModal('reset'); }
    },
    {
      id: 'dashboard',
      title: tr({
        de: '📊 Produktivitäts- & Analyse-Dashboard',
        en: '📊 Productivity & Analytics Dashboard',
        fr: '📊 Tableau de bord Productivité & Analyse',
        it: '📊 Dashboard Produttività & Analisi',
        es: '📊 Panel de Productividad y Análisis',
        el: '📊 Πίνακας Παραγωγικότητας & Αναλύσεων'
      }),
      action: () => { if (typeof openReportDashboard === 'function') openReportDashboard(); }
    },
    {
      id: 'undo',
      title: tr({
        de: '↩️ Letzte Aktion rückgängig machen (Ctrl+Z)',
        en: '↩️ Undo last action (Ctrl+Z)',
        fr: '↩️ Annuler la dernière action (Ctrl+Z)',
        it: '↩️ Annulla ultima azione (Ctrl+Z)',
        es: '↩️ Deshacer última acción (Ctrl+Z)',
        el: '↩️ Αναίρεση τελευταίας ενέργειας (Ctrl+Z)'
      }),
      action: () => { if (typeof handleUndo === 'function') handleUndo(); }
    },
    {
      id: 'clear_columns',
      title: tr({
        de: '🧹 Spalten leeren (Alle Aufgaben im Bereich leeren)',
        en: '🧹 Clear columns (Clear all tasks in workspace)',
        fr: '🧹 Vider les colonnes (Vider toutes les tâches)',
        it: '🧹 Svuota colonne (Svuota tutte le attività)',
        es: '🧹 Vaciar columnas (Vaciar todas las tareas)',
        el: '🧹 Άδειασμα στηλών (Άδειασμα όλων των εργασιών)'
      }),
      action: () => { if (typeof handleClearAllLists === 'function') handleClearAllLists(); }
    },
    {
      id: 'reset',
      title: tr({
        de: '🔄 Board zurücksetzen (Reset)',
        en: '🔄 Reset board',
        fr: '🔄 Réinitialiser le tableau',
        it: '🔄 Ripristina lavagna',
        es: '🔄 Restablecer tablero',
        el: '🔄 Επαναφορά πίνακα'
      }),
      action: () => { if (typeof handleReset === 'function') handleReset(); }
    },
    {
      id: 'theme_latte',
      title: '☕ Theme: Oat & Latte (Cozy Milchkaffee & Hafer)',
      action: () => { setTheme('latte'); }
    },
    {
      id: 'theme_sunset',
      title: '🌅 Theme: Warm Sunset (Abendsonne & Pfirsich)',
      action: () => { setTheme('sunset'); }
    },
    {
      id: 'theme_matcha',
      title: '🍵 Theme: Matcha (Creme & Kräuter-Salbei)',
      action: () => { setTheme('matcha'); }
    },
    {
      id: 'theme_candlelight',
      title: '🕯️ Theme: Candlelight (Kerzenschein & Kaminfeuer)',
      action: () => { setTheme('candlelight'); }
    },
    {
      id: 'theme_honey',
      title: '🍯 Theme: Honig (Warmes Gold)',
      action: () => { setTheme('honey'); }
    },
    {
      id: 'theme_sage',
      title: '🌿 Theme: Salbei (Botanisch Grün)',
      action: () => { setTheme('sage'); }
    },
    {
      id: 'theme_aurora',
      title: '🌌 Theme: Aurora (Nacht-Violett)',
      action: () => { setTheme('aurora'); }
    },
    {
      id: 'theme_ocean',
      title: '🌊 Theme: Ozean (Meeres-Cyan)',
      action: () => { setTheme('ocean'); }
    },
    {
      id: 'settings',
      title: tr({
        de: '⚙️ Einstellungen, Impressum & Datenschutz',
        en: '⚙️ Settings, Legal & Privacy',
        fr: '⚙️ Paramètres, Mentions légales & Confidentialité',
        it: '⚙️ Impostazioni, Note legali & Privacy',
        es: '⚙️ Ajustes, Legal y Privacidad',
        el: '⚙️ Ρυθμίσεις, Νομικά & Απόρρητο'
      }),
      action: () => { openSettingsModal('general'); }
    }
  ];
}

function filterCommandPalette(query = '') {
  const resultsContainer = document.getElementById('cmd-palette-results');
  if (!resultsContainer) return;
  resultsContainer.innerHTML = '';
  const q = (query || '').toLowerCase().trim();

  // 1. Matched Commands
  const allCommands = getAvailableCommands();
  const matchedCommands = allCommands.filter(c => c.title.toLowerCase().includes(q));

  // 2. Open Tasks matching query
  const curItems = typeof getCurrentWorkspaceItems === 'function' ? getCurrentWorkspaceItems() : (typeof state !== 'undefined' ? state.items : {});
  const matchedTasks = [];
  if (curItems && typeof curItems === 'object') {
    Object.keys(curItems).forEach(col => {
      const items = curItems[col] || [];
      items.forEach((item, idx) => {
        const text = typeof item === 'object' ? item.task : item;
        if (text && (!q || text.toLowerCase().includes(q))) {
          matchedTasks.push({
            title: `📌 [${typeof t === 'function' ? t(col) : col}] ${text}`,
            action: () => {
              if (typeof startTaskTimerByIndex === 'function') startTaskTimerByIndex(col, idx);
              else { if (typeof setTimerMinutes === 'function') setTimerMinutes(25); if (typeof startTimer === 'function') startTimer(); }
            }
          });
        }
      });
    });
  }

  const combined = [];
  if (matchedCommands.length > 0) {
    combined.push({ isHeader: true, label: typeof t === 'function' ? t('cmd_actions') : 'Schnell-Aktionen' });
    matchedCommands.slice(0, 7).forEach(c => combined.push({ ...c, isAction: true }));
  }

  if (matchedTasks.length > 0) {
    combined.push({ isHeader: true, label: typeof t === 'function' ? t('cmd_tasks') : 'Gefundene Aufgaben' });
    matchedTasks.slice(0, 8).forEach(t => combined.push({ ...t, isAction: true }));
  }

  commandPaletteItems = combined.filter(c => c.isAction);

  if (commandPaletteItems.length === 0) {
    resultsContainer.innerHTML = `
      <div class="p-6 text-center text-gray-500 text-xs">
        <i data-lucide="search-x" class="w-6 h-6 mx-auto mb-1 opacity-50"></i>
        <span>${tr({
          de: 'Keine passenden Befehle oder Aufgaben gefunden',
          en: 'No matching commands or tasks found',
          fr: 'Aucune commande ou tâche correspondante trouvée',
          it: 'Nessun comando o attività corrispondente trovato',
          es: 'No se encontraron comandos o tareas coincidentes',
          el: 'Δεν βρέθηκαν εντολές ή εργασίες'
        })}</span>
      </div>
    `;
    if (typeof renderLucideIcons === 'function') renderLucideIcons();
    return;
  }

  let actionIdx = 0;
  combined.forEach(item => {
    if (item.isHeader) {
      const h = document.createElement('div');
      h.className = 'px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono';
      h.innerText = item.label;
      resultsContainer.appendChild(h);
    } else {
      const thisIdx = actionIdx++;
      const btn = document.createElement('button');
      btn.id = `cmd-item-${thisIdx}`;
      btn.className = `w-full px-3 py-2 text-left rounded-xl flex items-center justify-between text-xs transition cursor-pointer ${
        thisIdx === commandPaletteActiveIndex ? 'bg-purple-600/30 border border-purple-500/40 text-white font-semibold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
      }`;
      btn.setAttribute('data-cmd-idx', thisIdx);
      btn.innerHTML = `
        <span class="truncate">${escapeHtml(item.title)}</span>
        <i data-lucide="arrow-right" class="w-3.5 h-3.5 opacity-40 shrink-0"></i>
      `;
      btn.onclick = () => {
        closeCommandPalette();
        item.action();
      };
      resultsContainer.appendChild(btn);
    }
  });

  if (typeof renderLucideIcons === 'function') renderLucideIcons();
}

function handleCommandPaletteKeyDown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeCommandPalette();
    return;
  }
  if (!commandPaletteItems || commandPaletteItems.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    commandPaletteActiveIndex = (commandPaletteActiveIndex + 1) % commandPaletteItems.length;
    updateCommandPaletteHighlight();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    commandPaletteActiveIndex = (commandPaletteActiveIndex - 1 + commandPaletteItems.length) % commandPaletteItems.length;
    updateCommandPaletteHighlight();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const activeItem = commandPaletteItems[commandPaletteActiveIndex];
    if (activeItem && typeof activeItem.action === 'function') {
      closeCommandPalette();
      activeItem.action();
    }
  }
}

function updateCommandPaletteHighlight() {
  commandPaletteItems.forEach((_, idx) => {
    const el = document.getElementById(`cmd-item-${idx}`);
    if (el) {
      if (idx === commandPaletteActiveIndex) {
        el.className = 'w-full px-3 py-2 text-left rounded-xl flex items-center justify-between text-xs transition cursor-pointer bg-purple-600/30 border border-purple-500/40 text-white font-semibold';
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.className = 'w-full px-3 py-2 text-left rounded-xl flex items-center justify-between text-xs transition cursor-pointer text-gray-300 hover:bg-white/5 hover:text-white';
      }
    }
  });
}

window.openCommandPalette = openCommandPalette;
window.closeCommandPalette = closeCommandPalette;
window.filterCommandPalette = filterCommandPalette;
window.handleCommandPaletteKeyDown = handleCommandPaletteKeyDown;

function openSettingsModal(tab = 'general') {
  const modal = document.getElementById('modal-settings');
  if (!modal) return;
  modal.classList.remove('hidden');
  switchSettingsTab(tab);
  renderLucideIcons();
}

function closeSettingsModal() {
  const modal = document.getElementById('modal-settings');
  if (modal) modal.classList.add('hidden');
}

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
  renderLucideIcons();
}

function getHistoryScreenshots() {
  try {
    const saved = localStorage.getItem('flow_history_screenshots');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.warn('getHistoryScreenshots error:', e);
    return [];
  }
}

function saveHistoryScreenshots(list) {
  try {
    localStorage.setItem('flow_history_screenshots', JSON.stringify(list));
  } catch (e) {
    console.warn('saveHistoryScreenshots error:', e);
  }
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
    list.unshift({
      id: 'shot_' + Date.now(),
      title: userTitle.trim(),
      date: new Date().toLocaleDateString(),
      data: base64
    });
    saveHistoryScreenshots(list);
    renderHistoryGallery();
  };
  reader.readAsDataURL(file);
}

function deleteHistoryScreenshot(id) {
  let list = getHistoryScreenshots();
  list = list.filter(item => item.id !== id);
  saveHistoryScreenshots(list);
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
    card.innerHTML = `
      <div class="relative overflow-hidden bg-black/60 cursor-pointer" onclick="window.open('${escapeHtml(shot.data)}', '_blank')">
        <img src="${escapeHtml(shot.data)}" alt="${escapeHtml(shot.title)}" class="w-full h-32 object-cover transition transform duration-300 group-hover:scale-105" />
        <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
          <i data-lucide="maximize-2" class="w-4 h-4"></i>
          <span>Öffnen</span>
        </div>
      </div>
      <div class="p-2.5 flex items-center justify-between text-[11px] bg-[#111116]/90 border-t border-white/5 gap-2">
        <div class="truncate">
          <span class="truncate font-semibold text-white block">${escapeHtml(shot.title)}</span>
          <span class="text-[9px] text-gray-500 font-mono">${escapeHtml(shot.date || '')}</span>
        </div>
        <button onclick="deleteHistoryScreenshot('${escapeHtml(shot.id)}')" aria-label="Screenshot löschen" class="p-1 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 transition cursor-pointer shrink-0" title="Screenshot löschen">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
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

document.addEventListener('DOMContentLoaded', () => {
  setTheme(currentTheme); setLanguage(currentLang);
  const iconEl = document.getElementById('zen-btn-icon'); const textEl = document.getElementById('minimal-mode-btn-text');
  const zenView = document.getElementById('zen-chill-view');
  const mainEl = document.querySelector('main');
  if (isMinimalist) {
    document.body.classList.add('minimalist'); if (iconEl) iconEl.setAttribute('data-lucide', 'eye-off');
    if (textEl) textEl.innerText = t('standard_mode');
    if (zenView) { zenView.classList.remove('hidden'); zenView.classList.add('flex'); }
    if (mainEl) { mainEl.classList.add('hidden'); }
    updateZenView();
  } else {
    document.body.classList.remove('minimalist'); if (iconEl) iconEl.setAttribute('data-lucide', 'eye');
    if (textEl) textEl.innerText = t('minimal_mode');
    if (zenView) { zenView.classList.add('hidden'); zenView.classList.remove('flex'); }
    if (mainEl) { mainEl.classList.remove('hidden'); }
  }
  updateDateAndStreak(); updateWorkspaceSwitchUI(); if (typeof renderApp === 'function') renderApp(); updateZenView(); populateHelperTaskSelect(); suggestBoostActivity(); suggestInspirationQuote(); checkAndGenerateAutomaticReports();
  const btnHeader = document.getElementById('timer-toggle-btn'); if (btnHeader) { btnHeader.innerHTML = '<i data-lucide="play" class="w-3.5 h-3.5 text-[var(--accent-light)]"></i>'; }
  renderLucideIcons();
});

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

const ALL_VALID_THEMES = [
  'botanical', 'aurora', 'obsidian', 'ocean', 'sage', 'latte',
  'sunset', 'peach', 'crimson', 'honey', 'cyberpunk', 'matrix',
  'terracotta', 'royal', 'nebula', 'candlelight', 'matcha'
];

const THEME_ALIASES = {
  'default': 'botanical',
  'botanic': 'botanical',
  'eco': 'botanical',
  'nature': 'botanical',
  'journal': 'botanical',
  'handcrafted': 'botanical',
  'neon-cyber': 'cyberpunk',
  'synthwave': 'cyberpunk',
  'aurora-violet': 'aurora',
  'lavender-cloud': 'aurora',
  'forest': 'matrix',
  'lagoon': 'ocean',
  'glacier': 'ocean',
  'glacier-frost': 'ocean',
  'holo-chrome': 'ocean',
  'architect': 'ocean',
  'amber': 'honey',
  'honey-chamomile': 'honey',
  'cozy-amber': 'honey',
  'cozy': 'honey',
  'citrus': 'honey',
  'carbon': 'obsidian',
  'charcoal': 'obsidian',
  'executive': 'obsidian',
  'sakura': 'peach',
  'sakura-blossom': 'peach',
  'peach-cashmere': 'peach',
  'sage-breeze': 'sage',
  'eucalyptus-dew': 'sage',
  'matcha-latte': 'matcha',
  'matcha': 'sage',
  'matcha-sage': 'sage',
  'sage-latte': 'sage',
  'terracotta-sun': 'terracotta',
  'oat-latte': 'latte',
  'coffee': 'latte',
  'warm-sunset': 'sunset',
  'apricot': 'sunset',
  'cozy-candlelight': 'candlelight',
  'candlelight': 'candlelight',
  'fireplace': 'candlelight',
  'paper': 'botanical',
  'white': 'botanical',
  'light': 'botanical',
  'daylight': 'botanical'
};

function setTheme(theme) {
  if (THEME_ALIASES[theme]) theme = THEME_ALIASES[theme];
  if (!ALL_VALID_THEMES.includes(theme)) theme = 'botanical';
  if (typeof window !== 'undefined') window.currentTheme = theme;
  if (typeof globalThis !== 'undefined') globalThis.currentTheme = theme;
  try { currentTheme = theme; } catch(e) {}
  
  if (typeof document !== 'undefined' && document.body) {
    document.body.className = `h-full antialiased flex flex-col font-sans select-none overflow-x-hidden text-[#f4f4f5] theme-${theme}`;
    if (typeof isMinimalist !== 'undefined' && isMinimalist) document.body.classList.add('minimalist');
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

function setLanguage(lang) {
  if (!lang || !TRANSLATIONS[lang] || !DEFAULT_TASKS_BY_LANG[lang]) { lang = 'en'; }
  const oldLang = currentLang; currentLang = lang; localStorage.setItem('flowPlannerLanguage', lang);
  document.documentElement.lang = lang; translateUserTasks(oldLang, lang);
  translateUI(); const textEl = document.getElementById('minimal-mode-btn-text');
  if (textEl) { textEl.innerText = isMinimalist ? t('standard_mode') : t('minimal_mode'); }
  updateDateAndStreak(); if (typeof renderApp === 'function') renderApp(); updateZenView(); populateHelperTaskSelect();
  renderLucideIcons();
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

function translateUserTasks(fromLang, toLang) {
  if (fromLang === toLang) return; if (!DEFAULT_TASKS_BY_LANG[fromLang] || !DEFAULT_TASKS_BY_LANG[toLang]) return;
  saveHistory(); const cats = ['daily', 'weekly', 'occasionally'];
  cats.forEach(cat => {
    if (!state.items[cat]) return;
    state.items[cat] = state.items[cat].map(taskItem => {
      const taskName = typeof taskItem === 'object' ? taskItem.task : taskItem;
      const fromList = DEFAULT_TASKS_BY_LANG[fromLang][cat]; const oList = DEFAULT_TASKS_BY_LANG[toLang][cat];
      const idx = fromList.indexOf(taskName);
      if (idx !== -1) { const nextVal = oList[idx]; return typeof taskItem === 'object' ? { ...taskItem, task: nextVal } : nextVal; }
      return taskItem;
    });
  });
  if (state.completedSteps) {
    const nextStepsObj = {};
    for (let key in state.completedSteps) {
      let updatedKey = key;
      cats.forEach(cat => {
        const fromList = DEFAULT_TASKS_BY_LANG[fromLang][cat]; const oList = DEFAULT_TASKS_BY_LANG[toLang][cat];
        const idx = fromList.indexOf(key); if (idx !== -1) updatedKey = oList[idx];
      });
      nextStepsObj[updatedKey] = state.completedSteps[key];
    }
    state.completedSteps = nextStepsObj;
  }
  saveState();
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
  if (!currentZenTaskInfo || !currentZenTaskInfo.cat || !currentZenTaskInfo.task) {
    showToast(tr({ de: 'Keine aktive Aufgabe ausgewählt', en: 'No active task selected', es: 'Ninguna tarea activa seleccionada', el: 'Δεν επιλέχθηκε ενεργή εργασία', fr: 'Aucune tâche active sélectionnée', it: 'Nessuna attività attiva selezionata' }));
    return;
  }
  const cat = currentZenTaskInfo.cat;
  const taskTextToFind = currentZenTaskInfo.task;
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

function getTaskIconDetails(taskText, category = '') {
  if (!taskText) return { icon: 'check-circle', color: 'text-purple-400' };
  const rawTrimmed = String(taskText).trim();
  if (typeof TASK_ICONS !== 'undefined' && TASK_ICONS[rawTrimmed]) {
    return { icon: TASK_ICONS[rawTrimmed], color: 'text-purple-300' };
  }
  
  // Unicode-Normalisierung: Entfernt Akzente/Diakritika (z. B. é -> e, ά -> α, ñ -> n) für 100% verlässliche Spracherkennung
  const norm = rawTrimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const rules = [
    // 1. Medikamente / Gesundheit / Arzt
    { rx: /medi|pill|tablett|vitam|pharmak|arzt|doctor|docteur|dottore|medico|therap|apothek|ordonnan|farmac|φαρμακ|γιατρ|ασθεν/, ic: 'pill', col: 'text-rose-400' },
    // 2. Zähne / Mundhygiene
    { rx: /zahn|zahne|dient|tooth|teeth|dent|dond|brush|bross|spazzol|δοντ|βουρτσ/, ic: 'smile', col: 'text-cyan-400' },
    // 3. Gesicht waschen / Hautpflege
    { rx: /gesicht|face|visage|viso|προσωπ/, ic: 'smile', col: 'text-cyan-400' },
    // 4. Herd / Kühlschrank / Ofen / Küche Geräte
    { rx: /herd|kuhl|fridge|frigo|stov|four|horno|nevera|fornell|refrig|kuehl|backofen|oven|κουζιν|ψυγει/, ic: 'cooking-pot', col: 'text-orange-400' },
    // 5. Waschbecken / Spiegel / Bad-Armaturen
    { rx: /waschbeck|sink|lavabo|specch|miroir|espejo|spiegel|νιπτηρ|καθρεφτ/, ic: 'droplets', col: 'text-sky-400' },
    // 6. Geschirr spülen / Küche / Abwasch
    { rx: /spul|dish|vaissel|piat|plato|geschirr|spuel|πιατ|abwasch/, ic: 'utensils', col: 'text-emerald-400' },
    // 7. Wäsche waschen / Waschmaschine
    { rx: /laund|colad|lessiv|bucat|clothes|linge|roux|ρουχ|πλυντηρ|wasch.*wasch|wasche/, ic: 'washing-machine', col: 'text-indigo-400' },
    // 8. Wäsche aufhängen / Trocknen
    { rx: /aufhang|hang|colg|etend|stend|aplon|dry|sech|asciug|απλωμ/, ic: 'shirt', col: 'text-violet-400' },
    // 9. Duschen / Baden
    { rx: /dusch|shower|baign|doccia|duch|ντους|μπανι|bath/, ic: 'bath', col: 'text-sky-400' },
    // 10. Haare / Frisur / Schneiden
    { rx: /haare|haar|hair|pelo|cabell|cheveux|capell|fris|kour|coiff|tagli|μαλλι|κουρεμ|λουσιμ/, ic: 'scissors', col: 'text-pink-400' },
    // 11. Nägel / Maniküre
    { rx: /nagel|nail|ungl|un|ungh|nych|pedicur|manicur|νυχ/, ic: 'scissors', col: 'text-indigo-400' },
    // 12. Trinken / Wasser / Hydration
    { rx: /trink|wat|agu|eau|ner|glass|hydrat|bever|bere|boire|νερο|πινω|ποτηρ/, ic: 'glass-water', col: 'text-blue-400' },
    // 13. Bett / Schlafen / Bettwäsche
    { rx: /bett|bed|cama|lit|lett|krevat|schlaf|sleep|sommeil|dorm|drap|sabana|lenzuol|κρεβατ|σεντον|υπν/, ic: 'bed', col: 'text-amber-400' },
    // 14. Aufräumen / Ordnung / Putzen
    { rx: /aufraum|tidy|orden|rang|riordin|clean|putz|organi|nettoy|limp|puliz|τακτοπ|καθαρισ|οργαν/, ic: 'sparkles', col: 'text-yellow-400' },
    // 15. Staub wischen / Abstauben
    { rx: /staub|dust|polv|poussi|spolver|epousset|xesk|ξεσκον/, ic: 'feather', col: 'text-amber-300' },
    // 16. Staubsaugen / Saugen
    { rx: /saugen|staubsaug|vacu|aspir|skoupi|σκουπ/, ic: 'tornado', col: 'text-cyan-500' },
    // 17. Boden wischen / Feuchtwischen
    { rx: /wisch|mop|freg|sfoug|paviment|sol|σφουγγαρ/, ic: 'droplets', col: 'text-sky-500' },
    // 18. Bad / WC / Sanitär / Fliesen
    { rx: /klo|wc|toil|vater|lekan|bad|fliesen|λεκαν/, ic: 'sparkles', col: 'text-teal-500' },
    // 19. Müll wegbringen / Entsorgung
    { rx: /mull|trash|basur|poubelle|spazzatur|waste|abfall|skoupid|σκουπιδ|πεταμ/, ic: 'trash-2', col: 'text-rose-500' },
    // 20. Pfandflaschen / Recycling
    { rx: /pfand|bottle|bouteill|bottigl|envase|boukal|recycle|recyc|μπουκαλ|ανακυκλ/, ic: 'recycle', col: 'text-emerald-500' },
    // 21. Kochen / Mahlzeiten / Rezepte
    { rx: /koch|food|cook|comid|cena|recept|recet|cuisin|cucin|magir|essen|lunch|dinner|breakfast|dejeun|pranz|past|mahlzeit|φαγητ|μαγειρ|γευμα/, ic: 'cooking-pot', col: 'text-orange-400' },
    // 19. Einkauf / Supermarkt / Laden
    { rx: /einkauf|shop|compr|achat|spesa|supermarkt|market|store|kauf|epicerie|agor|αγορ|σουπερ/, ic: 'shopping-cart', col: 'text-emerald-400' },
    // 20. Arbeit / Job / Büro / Termine / Meetings
    { rx: /arbeit|work|trabaj|travail|lavor|doul|job|office|schreib|mail|call|anruf|meeting|appuntament|rendez|cita|termin|geschaft|δουλει|γραφει/, ic: 'briefcase', col: 'text-amber-500' },
    // 21. Lesen / Buch / Lernen / Studium / Uni / Vorlesung
    { rx: /les|book|libr|livr|vivl|lernen|study|etud|stud|buch|diavas|διαβασ|βιβλι|vorlesung|lecture|skript|klausur|exam|abgabe|deadline|seminar|modul|bachelor|master|prof|tutor|ubung|uebung/, ic: 'book-open', col: 'text-violet-400' },
    // 22. Sport / Fitness / Training / Laufen / Spazieren
    { rx: /sport|gym|fit|train|gymn|workout|run|laufen|gehen|walk|course|correre|caminar|marcher|exerc|ασκησ|γυμναστ|τρεξιμ/, ic: 'activity', col: 'text-green-400' },
    // 23. Pause / Ausruhen / Erholen / Meditation
    { rx: /paus|rest|desc|relax|chill|medit|mindful|repos|ripos|diahleim|διαλειμμ|χαλαρω/, ic: 'moon', col: 'text-indigo-300' },
    // 24. Lüften / Frische Luft / Durchatmen
    { rx: /luft|wind|vent|aer|luften|breath|resp|fresch|frisch|αερισμ|αερ/, ic: 'wind', col: 'text-cyan-300' }
  ];

  for (const r of rules) {
    if (r.rx.test(norm)) return { icon: r.ic, color: r.col };
  }

  const defaults = {
    daily: { icon: 'sun', color: 'text-amber-400' },
    weekly: { icon: 'calendar-days', color: 'text-purple-400' },
    todo: { icon: 'list-todo', color: 'text-blue-400' },
    done: { icon: 'check-circle', color: 'text-emerald-400' },
    termine: { icon: 'clock', color: 'text-amber-400' },
    occasionally: { icon: 'calendar-range', color: 'text-pink-400' },
    notes: { icon: 'sticky-note', color: 'text-yellow-400' },
    work_focus: { icon: 'target', color: 'text-amber-400' },
    work_in_progress: { icon: 'zap', color: 'text-blue-400' },
    work_waiting: { icon: 'hourglass', color: 'text-purple-400' },
    work_backlog: { icon: 'folder-kanban', color: 'text-indigo-400' },
    study_focus: { icon: 'target', color: 'text-amber-400' },
    study_modules: { icon: 'book-open', color: 'text-blue-400' },
    study_submissions: { icon: 'clock', color: 'text-rose-400' },
    study_deep: { icon: 'brain', color: 'text-purple-400' }
  };
  return defaults[category] || { icon: 'check-circle', color: 'text-purple-400' };
}

function getTaskIcon(taskText, category = '') { return getTaskIconDetails(taskText, category).icon; }
window.getTaskIconDetails = getTaskIconDetails;
window.getTaskIcon = getTaskIcon;

// ===== KEYBOARD SHORTCUTS MODAL (?) =====
function openKeyboardShortcuts() {
  const m = document.getElementById('modal-keyboard-shortcuts');
  if (m) {
    m.classList.remove('hidden');
    renderLucideIcons();
  }
}
window.openKeyboardShortcuts = openKeyboardShortcuts;

function closeKeyboardShortcuts() {
  const m = document.getElementById('modal-keyboard-shortcuts');
  if (m) m.classList.add('hidden');
}
window.closeKeyboardShortcuts = closeKeyboardShortcuts;

// ===== FULL LOCAL-FIRST BACKUP & RESTORE HUB =====
function downloadFullBackup() {
  try {
    const backupData = {
      app: 'Noodle',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      items: typeof items !== 'undefined' ? items : {},
      categoriesOrder: typeof categoriesOrder !== 'undefined' ? categoriesOrder : [],
      currentWorkspace: typeof currentWorkspace !== 'undefined' ? currentWorkspace : 'private',
      historyScreenshots: getHistoryScreenshots(),
      customTranslations: typeof customTranslations !== 'undefined' ? customTranslations : {},
      theme: localStorage.getItem('flow_theme') || 'dark',
      currentLang: typeof currentLang !== 'undefined' ? currentLang : 'en'
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `noodle-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    if (typeof showToast === 'function') {
      showToast(typeof tr === 'function' ? tr({ de: 'Backup erfolgreich heruntergeladen! 💾', en: 'Backup successfully downloaded! 💾' }) : 'Backup heruntergeladen! 💾');
    }
  } catch (e) {
    console.error('Backup download error:', e);
    if (typeof showToast === 'function') {
      showToast('Fehler beim Erstellen des Backups: ' + e.message);
    }
  }
}
window.downloadFullBackup = downloadFullBackup;

function handleRestoreBackupFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || (!data.items && !data.daily && !Array.isArray(data))) {
        throw new Error('Ungültiges Noodle Backup-Format');
      }

      const msg = typeof tr === 'function' ? tr({
        de: 'Möchtest du dieses Backup wirklich wiederherstellen? Bestehende Daten werden aktualisiert.',
        en: 'Do you really want to restore this backup? Existing data will be updated.'
      }) : 'Möchtest du dieses Backup wirklich wiederherstellen? Bestehende Daten werden aktualisiert.';

      const confirmed = typeof showConfirmDialog === 'function' ? await showConfirmDialog({
        title: typeof tr === 'function' ? tr({ de: 'Backup wiederherstellen?', en: 'Restore Backup?' }) : 'Backup wiederherstellen?',
        message: msg,
        confirmText: typeof tr === 'function' ? tr({ de: 'Wiederherstellen', en: 'Restore' }) : 'Wiederherstellen',
        isDanger: false,
        icon: 'rotate-ccw'
      }) : confirm(msg);

      if (confirmed) {
        if (data.items) {
          items = data.items;
          localStorage.setItem('flow_items_v2', JSON.stringify(items));
        }
        if (data.categoriesOrder && Array.isArray(data.categoriesOrder)) {
          categoriesOrder = data.categoriesOrder;
          localStorage.setItem('flow_categories_order', JSON.stringify(categoriesOrder));
        }
        if (data.historyScreenshots && Array.isArray(data.historyScreenshots)) {
          saveHistoryScreenshots(data.historyScreenshots);
        }

        if (typeof renderBoard === 'function') renderBoard();
        if (typeof renderLucideIcons === 'function') renderLucideIcons();
        if (typeof closeSettingsModal === 'function') closeSettingsModal();

        if (typeof showToast === 'function') {
          showToast('Backup erfolgreich wiederhergestellt! ✨');
        }
      }
    } catch (err) {
      if (typeof showToast === 'function') {
        showToast('Fehler beim Wiederherstellen: ' + err.message);
      }
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}
window.handleRestoreBackupFile = handleRestoreBackupFile;

function exportData() {
  if (typeof downloadFullBackup === 'function') {
    downloadFullBackup();
  }
}
window.exportData = exportData;

function importData() {
  const fileInput = document.getElementById('backup-restore-file-input');
  if (fileInput) {
    fileInput.click();
  } else {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      if (typeof handleRestoreBackupFile === 'function') handleRestoreBackupFile(e);
    };
    input.click();
  }
}
window.importData = importData;

// ===== PWA INSTALLATION ENGINE =====
window.deferredPwaPrompt = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPwaPrompt = e;
    const banner = document.getElementById('pwa-install-banner');
    if (banner && !sessionStorage.getItem('pwa_dismissed')) {
      banner.classList.remove('hidden');
      renderLucideIcons();
    }
  });

  window.addEventListener('appinstalled', () => {
    window.deferredPwaPrompt = null;
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.classList.add('hidden');
    if (typeof showToast === 'function') {
      showToast('Noodle erfolgreich installiert! 🎉');
    }
  });
}

function triggerPwaInstall() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.classList.add('hidden');
  if (window.deferredPwaPrompt) {
    window.deferredPwaPrompt.prompt();
    window.deferredPwaPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      }
      window.deferredPwaPrompt = null;
    });
  } else {
    if (typeof showToast === 'function') {
      showToast('Installiere Noodle über das Browsermenü („Zum Startbildschirm hinzufügen“)');
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
      this.color = Math.random() > 0.5 ? 'rgba(56, 189, 248,' : 'rgba(192, 132, 252,';
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

function switchMobileNavTab(tabName) {
  document.body.dataset.mobileNav = tabName;
  localStorage.setItem('flow_active_mobile_tab', tabName);

  // Update Nav-Bar Buttons
  const navTabs = ['planer', 'focus', 'audio', 'tools'];
  navTabs.forEach(t => {
    const btn = document.getElementById(`mob-nav-${t}`);
    if (btn) {
      btn.classList.toggle('active', t === tabName);
    }
  });

  // Tab-spezifische Initialisierungen
  if (tabName === 'planer') {
    const activeCat = document.body.dataset.mobileCat || localStorage.getItem('flowPlannerMobileCategory') || 'daily';
    if (typeof setMobileCategory === 'function') setMobileCategory(activeCat);
  } else if (tabName === 'focus') {
    if (typeof updateTimerDisplay === 'function') updateTimerDisplay();
  }

  // Scroll nach oben
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (typeof renderLucideIcons === 'function') renderLucideIcons();
  else if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}
window.switchMobileNavTab = switchMobileNavTab;

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
  window.getTaskIconDetails = getTaskIconDetails;
  window.getTaskIcon = getTaskIcon;
  window.openCommandPalette = openCommandPalette;
  window.closeCommandPalette = closeCommandPalette;
  window.switchMobileNavTab = switchMobileNavTab;
  window.openMobileQuickAddModal = openMobileQuickAddModal;
  window.closeMobileQuickAddModal = closeMobileQuickAddModal;
  window.selectMobileQuickAddCategory = selectMobileQuickAddCategory;
  window.selectMobilePriority = selectMobilePriority;
  window.toggleMobileVoiceInput = toggleMobileVoiceInput;
  window.submitMobileQuickAdd = submitMobileQuickAdd;
  window.toggleExtraThemesAccordion = toggleExtraThemesAccordion;
}
if (typeof globalThis !== 'undefined') {
  globalThis.setTheme = setTheme;
  globalThis.setLanguage = setLanguage;
  globalThis.toggleMinimalist = toggleMinimalist;
  globalThis.closeAllPanelsAndModals = closeAllPanelsAndModals;
  globalThis.getTaskIconDetails = getTaskIconDetails;
  globalThis.getTaskIcon = getTaskIcon;
  globalThis.openCommandPalette = openCommandPalette;
  globalThis.closeCommandPalette = closeCommandPalette;
  globalThis.switchMobileNavTab = switchMobileNavTab;
  globalThis.openMobileQuickAddModal = openMobileQuickAddModal;
  globalThis.closeMobileQuickAddModal = closeMobileQuickAddModal;
  globalThis.selectMobileQuickAddCategory = selectMobileQuickAddCategory;
  globalThis.selectMobilePriority = selectMobilePriority;
  globalThis.toggleMobileVoiceInput = toggleMobileVoiceInput;
  globalThis.submitMobileQuickAdd = submitMobileQuickAdd;
  globalThis.toggleExtraThemesAccordion = toggleExtraThemesAccordion;
}

