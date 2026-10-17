/**
 * @file app-interaction-mode.js
 * @module WindowManager
 * @description
 * Multi-Window Studio & Smart-Glance Fenstermanagement:
 * - Einheitliche Fenstersteuerung (Minimieren, Maximieren/Wiederherstellen, Schließen) für alle Modals & Tools
 * - Dynamischer `MutationObserver` für konsistente Fenster-Header über Tab-Wechsel hinweg
 * - Paralleles Multitasking mit frei positionierbaren Tool-Fenstern
 * - Taskleiste am unteren Bildschirmrand mit Live-Glance-Vorschau
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'noodle_interaction_mode';

  function isTouchDevice() {
    return (
      (typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(hover: none) and (pointer: coarse)').matches) ||
      (typeof navigator !== 'undefined' && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window))
    );
  }

  function getSavedMode() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'click-only' || saved === 'multi-window' || saved === 'turbo') return saved;
      if (saved === 'peek-pin') return 'multi-window';
    } catch (e) {}
    return 'multi-window';
  }

  let currentMode = getSavedMode();
  let highestZIndex = 100030;
  const activeWindows = new Set();
  const minimizedWindows = new Set();

  function applyModeClasses(mode) {
    if (typeof document === 'undefined' || !document.body) return;
    document.body.classList.toggle('mode-multi-window', mode === 'multi-window');
    document.body.classList.toggle('mode-click-only', mode === 'click-only');
    document.body.classList.toggle('mode-turbo', mode === 'turbo');
    document.body.classList.toggle('mode-fast-hover', mode === 'turbo');
    updateSettingsUI(mode);
  }

  function setInteractionMode(mode, showNotification = true) {
    if (mode === 'peek-pin') mode = 'multi-window';
    if (mode !== 'click-only' && mode !== 'multi-window' && mode !== 'turbo') return;
    currentMode = mode;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {}

    applyModeClasses(mode);

    if (showNotification && typeof showToast === 'function') {
      let msg = '';
      if (mode === 'turbo') {
        msg = typeof tr === 'function' ? tr({
          de: 'Turbo-Modus aktiv: Schneller Wechsel & Reaktionen',
          en: 'Turbo mode active: Instant hover switching & responsiveness'
        }) : 'Turbo-Modus aktiv: Schneller Wechsel & Reaktionen';
      } else if (mode === 'click-only') {
        msg = typeof tr === 'function' ? tr({
          de: 'Kompakt-Modus aktiv: Panels öffnen per Klick',
          en: 'Compact mode active: Panels open on click'
        }) : 'Kompakt-Modus aktiv: Panels öffnen per Klick';
      } else {
        msg = typeof tr === 'function' ? tr({
          de: 'Studio-Modus aktiv: Fenster minimieren, maximieren & parallel nutzen',
          en: 'Studio mode active: Minimize, maximize & run tools in parallel'
        }) : 'Studio-Modus aktiv: Fenster minimieren, maximieren & parallel nutzen';
      }
      showToast(msg);
    }

    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
    window.dispatchEvent(new CustomEvent('noodle-interaction-mode-changed', { detail: { mode } }));
  }

  function updateSettingsUI(mode) {
    const btnMulti = document.getElementById('btn-mode-peek-pin');
    const btnClick = document.getElementById('btn-mode-click-only');
    const btnTurbo = document.getElementById('btn-mode-turbo');
    const badge = document.getElementById('interaction-mode-badge');

    const activeClasses = 'bg-purple-600 text-white font-bold shadow-md border border-purple-400/40';
    const activeTurboClasses = 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black shadow-[0_0_12px_rgba(245,158,11,0.4)] border border-amber-300';
    const inactiveClasses = 'bg-white/[0.03] text-gray-400 hover:text-white border border-transparent';

    if (btnMulti) {
      btnMulti.className = `py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${mode === 'multi-window' ? activeClasses : inactiveClasses}`;
    }
    if (btnClick) {
      btnClick.className = `py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${mode === 'click-only' ? activeClasses : inactiveClasses}`;
    }
    if (btnTurbo) {
      btnTurbo.className = `py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${mode === 'turbo' ? activeTurboClasses : inactiveClasses}`;
    }

    if (badge) {
      if (mode === 'turbo') {
        badge.textContent = 'Turbo';
        badge.className = 'text-[8.5px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/40 shadow-xs';
      } else if (mode === 'click-only') {
        badge.textContent = 'Kompakt';
        badge.className = 'text-[8.5px] text-purple-300 font-mono bg-purple-500/20 px-1.5 py-0.2 rounded border border-purple-500/30';
      } else {
        badge.textContent = 'Studio';
        badge.className = 'text-[8.5px] text-purple-300 font-mono bg-purple-500/20 px-1.5 py-0.2 rounded border border-purple-500/30';
      }
    }

    const modalRadioPeek = document.getElementById('modal-radio-mode-peek');
    const modalRadioClick = document.getElementById('modal-radio-mode-click');
    const modalRadioTurbo = document.getElementById('modal-radio-mode-turbo');
    if (modalRadioPeek) modalRadioPeek.checked = (mode === 'multi-window');
    if (modalRadioClick) modalRadioClick.checked = (mode === 'click-only');
    if (modalRadioTurbo) modalRadioTurbo.checked = (mode === 'turbo');
  }

  function getPanelMeta(panelName) {
    const cleanName = panelName.replace(/^(panel-|modal-|helper-)/, '');
    const metas = {
      'shopping': { title: 'Einkaufsliste', lucide: 'shopping-bag', short: 'Einkauf', color: 'text-emerald-400', getSummary: () => {
        const countEl = document.getElementById('shop-badge-count');
        const count = countEl && !countEl.classList.contains('hidden') ? countEl.textContent : '0';
        return `${count} Artikel auf der Liste`;
      }},
      'cooking': { title: 'Koch-Studio', lucide: 'utensils', short: 'Kochen', color: 'text-amber-400', getSummary: () => 'Smarte Rezepte & Zubereitung' },
      'clean-guide': { title: 'Putz-Guide', lucide: 'sparkles', short: 'Putz-Guide', color: 'text-cyan-400', getSummary: () => 'Schritt-für-Schritt Grundreinigung' },
      'cleaning-guide': { title: 'Putz-Guide', lucide: 'sparkles', short: 'Putz-Guide', color: 'text-cyan-400', getSummary: () => 'Schritt-für-Schritt Grundreinigung' },
      'alarm': { title: 'Wecker & Timer', lucide: 'bell', short: 'Timer', color: 'text-rose-400', getSummary: () => {
        const timerEl = document.getElementById('timer-display');
        return timerEl ? `Timer: ${timerEl.textContent.trim()}` : 'Wecker & Countdown aktiv';
      }},
      
      'audio': { title: 'Sound Center', lucide: 'headphones', short: 'Sound', color: 'text-teal-400', getSummary: () => 'Ambient Mixer & Entspannung' },
      'radio': { title: 'Radio Stream', lucide: 'radio', short: 'Radio', color: 'text-pink-400', getSummary: () => 'Live-Sender & Streams' },
      'news': { title: 'News Briefing', lucide: 'newspaper', short: 'News', color: 'text-purple-400', getSummary: () => 'Weltweite & lokale Nachrichten' },
      'sample-manager': { title: 'Sample Manager', lucide: 'sliders', short: 'Samples', color: 'text-violet-400', getSummary: () => 'Eigene DJ-Samples verwalten' },

      'health': { title: 'Gesundheit & Vital', lucide: 'heart', short: 'Health', color: 'text-rose-400', getSummary: () => 'Wasser, Puls & Vorsorge' },
      'humor-lab': { title: 'Fun-Labor', lucide: 'smile', short: 'Fun', color: 'text-yellow-400', getSummary: () => 'Entlastung & Soundboard' },
      'brainstorm': { title: 'Brainstorming Hub', lucide: 'lightbulb', short: 'Brainstorm', color: 'text-amber-300', getSummary: () => 'Gedankenblitze & Ideen-Board' },
      'inspiration': { title: 'Inspiration & Zitate', lucide: 'sparkles', short: 'Ideen', color: 'text-amber-300', getSummary: () => 'Tages-Zitate & Motivation' },
      'clarity': { title: 'Clarity Gedanken', lucide: 'brain', short: 'Clarity', color: 'text-indigo-300', getSummary: () => 'Gedanken sortieren & Klarheit' },

      'pick': { title: 'Entscheidungshilfe', lucide: 'lightbulb', short: 'Was Jetzt', color: 'text-emerald-300', getSummary: () => 'Nächster Fokus-Schritt' },
      'whatnow': { title: 'Entscheidungshilfe', lucide: 'lightbulb', short: 'Was Jetzt', color: 'text-emerald-300', getSummary: () => 'Nächster Fokus-Schritt' },
      'sport': { title: 'Bewegungspause', lucide: 'activity', short: 'Sport', color: 'text-green-400', getSummary: () => 'Micro-Workouts & Dehnen' },
      'safespace': { title: 'Safe Space', lucide: 'shield', short: 'Safe Space', color: 'text-cyan-300', getSummary: () => 'Ruheort & Beruhigung' },
      'dice': { title: 'Würfel Studio', lucide: 'dices', short: 'Würfel', color: 'text-purple-300', getSummary: () => 'Zufalls-Entscheidung' },
      'roulette': { title: 'Entscheidungs-Rad', lucide: 'disc', short: 'Roulette', color: 'text-rose-300', getSummary: () => 'Glücksrad für Aufgaben' },
      'regulation': { title: 'Regulation Studio', lucide: 'wind', short: 'Regulation', color: 'text-teal-300', getSummary: () => 'Nervensystem regulieren' },
      'ocr-scanner': { title: 'OCR Scanner', lucide: 'scan-text', short: 'Scanner', color: 'text-blue-300', getSummary: () => 'Texte & Notizen scannen' },
      'supermarket': { title: 'Supermarkt-Modus', lucide: 'shopping-bag', short: 'Markt', color: 'text-emerald-400', getSummary: () => 'Vollbild Einkaufsmodus' },
      'p2p-sync': { title: 'P2P Synchronisierung', lucide: 'refresh-cw', short: 'Sync', color: 'text-emerald-300', getSummary: () => 'Echtzeit-Gerätekopplung' },
      'app-install': { title: 'App Installation & Setup', lucide: 'download', short: 'Install', color: 'text-purple-300', getSummary: () => 'Windows, Mac, Android, Linux & Offline' },
      'settings': { title: 'Optionen & Einstellungen', lucide: 'settings', short: 'Settings', color: 'text-gray-300', getSummary: () => 'Designs, Sprache & Steuerung' },

      'weather': { title: 'Wetter', lucide: 'cloud-sun', short: 'Wetter', color: 'text-sky-400', getSummary: () => {
        const tempEl = document.getElementById('weather-current-temp');
        return tempEl ? `${tempEl.textContent.trim()} • Wetterbericht` : 'Live-Wetter & Vorhersage';
      }},
      'calendar-dropdown': { title: 'Kalender & Termine', lucide: 'calendar', short: 'Kalender', color: 'text-blue-400', getSummary: () => 'Monatsübersicht & Fristen' },
      'pause-dropdown': { title: 'Pausen-Hub', lucide: 'wind', short: 'Pause', color: 'text-teal-300', getSummary: () => 'Atemübungen & Entspannung' },
      'report': { title: 'Statistiken', lucide: 'bar-chart-2', short: 'Stats', color: 'text-emerald-400', getSummary: () => 'Tages- & Wochenauswertung' },
      'settings-dropdown': { title: 'Optionen', lucide: 'settings', short: 'Settings', color: 'text-gray-300', getSummary: () => 'Designs, Sprache & Steuerung' },
      'timer-presets': { title: 'Fokus-Cockpit', lucide: 'zap', short: 'Fokus', color: 'text-purple-300', getSummary: () => 'Pomodoro, Flow & Deep Work' },
      'header-tools': { title: 'Tools Hub', lucide: 'layout-grid', short: 'Tools', color: 'text-purple-400', getSummary: () => 'Noodle Studio Werkzeuge' },
      'labs-menu': { title: 'Labs', lucide: 'flask-conical', short: 'Labs', color: 'text-fuchsia-300', getSummary: () => 'Experimental Labs & Tools' },
      'social': { title: 'Social Creator Hub', lucide: 'share-2', short: 'Social', color: 'text-indigo-400', getSummary: () => 'Post-Planer & Formate' },
      'collab-chat': { title: 'Team Chat', lucide: 'message-square', short: 'Chat', color: 'text-cyan-400', getSummary: () => 'Live-Teamchat' }
    };

    return metas[cleanName] || metas[panelName] || {
      title: cleanName.replace(/-/g, ' ').toUpperCase(),
      lucide: 'layout',
      short: cleanName.substring(0, 8),
      color: 'text-purple-300',
      getSummary: () => 'Aktiv im Studio'
    };
  }

  function getPanelElement(panelName) {
    if (!panelName) return null;
    return document.getElementById(`panel-${panelName}`) ||
           document.getElementById(`modal-${panelName}`) ||
           document.getElementById(`helper-${panelName}-modal`) ||
           document.getElementById(`${panelName}-modal`) ||
           document.getElementById(panelName);
  }

  function bringWindowToFront(panelName) {
    const el = getPanelElement(panelName);
    if (!el) return;
    highestZIndex += 2;
    el.style.zIndex = highestZIndex;
    document.querySelectorAll('.noodle-panel-focused').forEach(p => p.classList.remove('noodle-panel-focused'));
    el.classList.add('noodle-panel-focused');
  }

  function getMinimizedDock() {
    let dock = document.getElementById('noodle-minimized-dock');
    if (!dock && typeof document !== 'undefined' && document.body) {
      dock = document.createElement('div');
      dock.id = 'noodle-minimized-dock';
      dock.className = 'noodle-minimized-dock fixed bottom-4 right-4 z-[100080] flex items-center gap-2 flex-wrap pointer-events-auto select-none';
      document.body.appendChild(dock);
    }
    return dock;
  }

  function updateMinimizedDockUI() {
    const dock = getMinimizedDock();
    if (!dock) return;

    if (minimizedWindows.size === 0) {
      dock.innerHTML = '';
      dock.classList.add('hidden');
      return;
    }

    dock.classList.remove('hidden');
    dock.innerHTML = '';

    minimizedWindows.forEach(panelName => {
      const meta = getPanelMeta(panelName);
      const pill = document.createElement('div');
      pill.className = 'noodle-min-pill relative flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#0f1017]/95 border border-purple-500/40 hover:border-purple-400 text-xs text-white shadow-xl backdrop-blur-xl cursor-pointer transition-all duration-150 animate-spring-modal group/pill';
      pill.setAttribute('data-min-panel', panelName);

      const summaryText = typeof meta.getSummary === 'function' ? meta.getSummary() : 'Aktiv';
      const iconKey = meta.lucide || 'layout';

      pill.innerHTML = `
        <i data-lucide="${iconKey}" class="w-3.5 h-3.5 ${meta.color}"></i>
        <span class="font-bold text-[11px] ${meta.color}">${meta.short}</span>
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
        <button class="noodle-min-close-btn ml-1 w-4 h-4 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 text-[9px] transition" title="Schließen">✕</button>

        <!-- Windows-Style Hover Thumbnail Preview Card -->
        <div class="noodle-taskbar-preview-card hidden group-hover/pill:flex absolute bottom-[calc(100%+10px)] right-0 w-64 p-3 rounded-2xl bg-[#12111c]/98 border border-white/10 shadow-2xl backdrop-blur-2xl flex-col gap-1.5 text-left z-[100090] animate-fade-in pointer-events-none">
          <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
            <div class="flex items-center gap-1.5">
              <i data-lucide="${iconKey}" class="w-4 h-4 ${meta.color}"></i>
              <span class="font-bold text-xs text-white">${meta.title}</span>
            </div>
            <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">Live</span>
          </div>
          <p class="text-[11px] text-gray-300 leading-snug">${summaryText}</p>
          <div class="text-[9.5px] text-gray-400 font-medium pt-0.5 flex items-center gap-1">
            <span>Klick zum Wiederherstellen</span>
          </div>
        </div>
      `;

      pill.onclick = (e) => {
        if (e.target.closest('.noodle-min-close-btn')) {
          e.stopPropagation();
          closeWindow(panelName);
        } else {
          restoreWindow(panelName);
        }
      };

      dock.appendChild(pill);
    });

    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      try { lucide.createIcons({ root: dock }); } catch(e){}
    }
  }

  function openWindow(panelName) {
    const el = getPanelElement(panelName);
    if (!el) return;

    minimizedWindows.delete(panelName);
    activeWindows.add(panelName);
    updateMinimizedDockUI();

    el.classList.remove('hidden', 'noodle-panel-peeking', 'noodle-panel-minimized');
    el.classList.add('noodle-panel-pinned');

    bringWindowToFront(panelName);
    decoratePanel(el, panelName);

    // Dynamic Render Callbacks
    triggerPanelRender(panelName);

    if (typeof adjustPanelPosition === 'function') {
      try { adjustPanelPosition(el, panelName); } catch (e) {}
    }

    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
  }

  function triggerPanelRender(panelName) {
    const clean = panelName.replace(/^(panel-|modal-|helper-)/, '');
    if (clean === 'cooking' && typeof renderCookingPanel === 'function') renderCookingPanel(true);
    if (clean === 'health' && window.HealthEngine && window.HealthEngine.renderPanel) window.HealthEngine.renderPanel();
    if (clean === 'humor-lab' && window.HumorEngine && window.HumorEngine.renderPanel) window.HumorEngine.renderPanel();
    if (clean === 'social' && window.SocialEngine && window.SocialEngine.renderPanel) window.SocialEngine.renderPanel();
    if (clean === 'calendar-dropdown' && typeof renderMiniCalendar === 'function') renderMiniCalendar();
    if (clean === 'weather' && typeof updateWeatherDisplay === 'function') updateWeatherDisplay();
  }

  function minimizeWindow(panelName, event) {
    if (event) event.stopPropagation();
    const el = getPanelElement(panelName);
    if (!el) return;

    el.classList.add('hidden', 'noodle-panel-minimized');
    el.classList.remove('noodle-panel-focused');
    minimizedWindows.add(panelName);
    activeWindows.add(panelName);

    updateMinimizedDockUI();

    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('medium');
    if (typeof showToast === 'function') {
      const meta = getPanelMeta(panelName);
      showToast(`${meta.title} minimiert`);
    }
  }

  function restoreWindow(panelName) {
    const el = getPanelElement(panelName);
    if (!el) return;

    minimizedWindows.delete(panelName);
    el.classList.remove('hidden', 'noodle-panel-minimized');
    el.classList.add('noodle-panel-pinned');

    updateMinimizedDockUI();
    bringWindowToFront(panelName);
    decoratePanel(el, panelName);
    triggerPanelRender(panelName);

    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
  }

  function toggleFullscreen(panelName, event) {
    if (event) event.stopPropagation();
    const el = getPanelElement(panelName);
    if (!el) return;

    const isFull = el.classList.contains('noodle-panel-fullscreen');
    if (isFull) {
      el.classList.remove('noodle-panel-fullscreen');
    } else {
      el.classList.add('noodle-panel-fullscreen');
    }

    bringWindowToFront(panelName);
    decoratePanel(el, panelName);
    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
  }

  function closeWindow(panelName, event) {
    if (event) event.stopPropagation();
    const el = getPanelElement(panelName);
    if (el) {
      el.classList.add('hidden');
      el.classList.remove('noodle-panel-pinned', 'noodle-panel-fullscreen', 'noodle-panel-focused', 'noodle-panel-peeking', 'noodle-panel-minimized');
    }

    activeWindows.delete(panelName);
    minimizedWindows.delete(panelName);
    updateMinimizedDockUI();

    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
  }

  function togglePanel(panelName, event) {
    if (event) event.stopPropagation();
    const el = getPanelElement(panelName);
    if (!el) return;

    if (minimizedWindows.has(panelName)) {
      restoreWindow(panelName);
      return;
    }

    const isVisible = !el.classList.contains('hidden');
    if (isVisible) {
      if (el.classList.contains('noodle-panel-focused')) {
        minimizeWindow(panelName);
      } else {
        bringWindowToFront(panelName);
      }
    } else {
      openWindow(panelName);
    }
  }

  // Findet oder erzeugt das 3er-Kontrollfeld [—] [⛶] [✕] im Panel-Header
  function decoratePanel(el, panelName) {
    if (!el) return;

    const isFullscreen = el.classList.contains('noodle-panel-fullscreen');

    // 1. Suche Header-Zeile
    const existingClose = el.querySelector('button[aria-label*="schließen"], button[aria-label*="close"], .modal-close-btn') ||
                          Array.from(el.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === '✕');

    const headerRow = existingClose ? existingClose.parentElement : (el.querySelector('.flex.items-center.justify-between') || el.querySelector('.border-b') || el.firstElementChild);

    if (headerRow) {
      // Header-Doppelklick maximiert / stellt wieder her (Windows/macOS Standard)
      if (!headerRow._noodleDblClickAttached) {
        headerRow._noodleDblClickAttached = true;
        headerRow.addEventListener('dblclick', (e) => {
          if (e.target.closest('button, input, select, textarea, a')) return;
          toggleFullscreen(panelName, e);
        });
      }

      let winControls = el.querySelector(`.noodle-win-controls[data-panel-controls="${panelName}"]`);
      if (!winControls) {
        winControls = document.createElement('div');
        winControls.className = 'noodle-win-controls flex items-center gap-1 shrink-0';
        winControls.setAttribute('data-panel-controls', panelName);

        // 1. Minimize [—]
        const minBtn = document.createElement('button');
        minBtn.type = 'button';
        minBtn.className = 'noodle-win-btn noodle-win-min-btn';
        minBtn.title = 'Minimieren in Taskleiste [—]';
        minBtn.setAttribute('aria-label', 'Minimieren');
        minBtn.innerHTML = '<span>—</span>';
        minBtn.onclick = (e) => minimizeWindow(panelName, e);
        winControls.appendChild(minBtn);

        // 2. Maximize / Restore [⛶ / 🗗]
        const maxBtn = document.createElement('button');
        maxBtn.type = 'button';
        maxBtn.className = 'noodle-win-btn noodle-win-max-btn noodle-fullscreen-badge-btn';
        maxBtn.setAttribute('data-panel-fullscreen', panelName);
        maxBtn.title = 'Maximieren / Vollbild [⛶]';
        maxBtn.setAttribute('aria-label', 'Maximieren');
        maxBtn.innerHTML = '<span>⛶</span>';
        maxBtn.onclick = (e) => toggleFullscreen(panelName, e);
        winControls.appendChild(maxBtn);

        // 3. Close [✕]
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'noodle-win-btn noodle-win-close-btn';
        closeBtn.title = 'Schließen [✕]';
        closeBtn.setAttribute('aria-label', 'Schließen');
        closeBtn.innerHTML = '<span>✕</span>';
        closeBtn.onclick = (e) => closeWindow(panelName, e);
        winControls.appendChild(closeBtn);

        // Alte native Schließen-Elemente im gesamten Panel sauber ausblenden
        el.querySelectorAll('.modal-close-btn, button[aria-label*="schließen"], button[aria-label*="close"]').forEach(oldBtn => {
          if (!oldBtn.classList.contains('noodle-win-btn')) {
            oldBtn.style.display = 'none';
          }
        });
        if (existingClose && !existingClose.classList.contains('noodle-win-btn')) {
          existingClose.style.display = 'none';
        }

        headerRow.appendChild(winControls);

        if (typeof attachSnapHoverToControls === 'function') {
          attachSnapHoverToControls(winControls, panelName);
        }
      }

      // Maximize Button State aktualisieren
      const maxBtn = winControls.querySelector('.noodle-win-max-btn');
      if (maxBtn) {
        maxBtn.innerHTML = isFullscreen ? '<span>🗗</span>' : '<span>⛶</span>';
        maxBtn.title = isFullscreen ? 'Wiederherstellen / Normalgröße [🗗]' : 'Maximieren / Vollbild [⛶]';
        if (typeof attachSnapHoverToControls === 'function') {
          attachSnapHoverToControls(winControls, panelName);
        }
      }
    }

    // Klick bringt Panel in den Vordergrund
    if (!el._noodleFocusAttached) {
      el._noodleFocusAttached = true;
      el.addEventListener('pointerdown', () => {
        bringWindowToFront(panelName);
      }, { passive: true });
    }
  }

  // Performance: Subtree MutationObserver entfernt. Fenster-Controls werden effizient
  // on-demand beim Öffnen oder initial einmalig registriert, statt bei jedem Klick den DOM-Baum zu durchsuchen.
  function setupDOMObserver() {
    // Bewusst kein teurer body-subtree MutationObserver mehr nötig
  }

  // Initialisierung nach DOM-Ready
  function init() {
    applyModeClasses(currentMode);

    // ESC schließt oder minimiert aktives Fenster
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const focused = document.querySelector('.noodle-panel-focused');
        if (focused && focused.id) {
          const id = focused.id.replace(/^(panel-|modal-|helper-)/, '');
          closeWindow(id);
        }
      }
    });

    // Alle vorhandenen Panels & Modals registrieren & mit Window-Controls versehen
    const scanAndDecorate = () => {
      document.querySelectorAll('.dock-popover-panel, [id^="panel-"], .modal, [id$="-modal"], [id*="modal-"]').forEach(el => {
        if (!el.id) return;
        const panelName = el.id.replace(/^(panel-|modal-|helper-)/, '');
        decoratePanel(el, panelName);
      });
    };

    scanAndDecorate();
    setTimeout(scanAndDecorate, 300);
    setupDOMObserver();
    setupTurboHoverListeners();
  }

  // Edge-Tab Style Fast Hover Listener für Tabs & Workspaces
  function setupTurboHoverListeners() {
    if (typeof document === 'undefined') return;

    // 1. Mobile/Board Category Tab Quick-Hover
    document.addEventListener('mouseover', (e) => {
      if (currentMode !== 'turbo') return;
      
      const tabBtn = e.target.closest('.mobile-tab-btn[data-cat]');
      if (tabBtn && tabBtn.dataset && tabBtn.dataset.cat) {
        const cat = tabBtn.dataset.cat;
        if (typeof window.setMobileCategory === 'function' && document.body.dataset.mobileCat !== cat) {
          window.setMobileCategory(cat);
        }
        return;
      }

      // 2. Workspace Dropdown Options Quick-Hover Switch
      const wsBtn = e.target.closest('#dropdown-header-workspace button[id^="header-ws-opt-"]');
      if (wsBtn) {
        const wsId = wsBtn.id.replace('header-ws-opt-', '');
        if (wsId && typeof window.setWorkspace === 'function' && window.state && window.state.activeWorkspace !== wsId) {
          window.setWorkspace(wsId);
        }
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Öffentliche Schnittstelle & Globals
  window.NoodleInteractionMode = {
    getMode: () => currentMode,
    setMode: setInteractionMode,
    isTouchDevice,
    openWindow,
    minimizeWindow,
    restoreWindow,
    toggleFullscreen,
    closeWindow,
    togglePanel,
    bringWindowToFront,
    decoratePanel,
    updateSettingsUI,
    pinPanel: openWindow,
    unpinPanel: closeWindow,
    togglePin: togglePanel
  };

  window.setInteractionMode = setInteractionMode;
  window.minimizeWindow = minimizeWindow;
  window.restoreWindow = restoreWindow;
  window.closeWindow = closeWindow;
  window.togglePanelFullscreen = toggleFullscreen;
  window.togglePinPanel = togglePanel;
  window.togglePanel = togglePanel;
  window.bringWindowToFront = bringWindowToFront;

})();
