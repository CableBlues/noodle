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
  let highestZIndex = 200020;
  const activeWindows = new Set();
  const minimizedWindows = new Set();

  const FLOATING_TOOL_NAMES = new Set([
    'shopping', 'cooking', 'radio', 'news', 'audio',
    'daily', 'impulse', 'inspiration', 'collab-chat', 'social',
    'health', 'humor-lab', 'radio-news',
    'dj', 'music', 'ambient', 'sounds'
  ]);

  const TRANSIENT_DROPDOWN_NAMES = new Set([
    'header-tools', 'weather', 'calendar-dropdown', 'pause-dropdown',
    'report', 'settings-dropdown', 'timer-presets', 'feedback', 'labs-menu', 'alarm'
  ]);

  const EXCLUDED_MODAL_IDS = new Set([
    'app-confirm-modal', 'modal-mobile-quick-add', 'modal-mobile-quick-menu',
    'feierabend-celebration-modal'
  ]);

  function applyModeClasses() {
    if (typeof document === 'undefined' || !document.body) return;
    document.body.classList.add('mode-multi-window');
    document.body.classList.remove('mode-click-only', 'mode-turbo', 'mode-fast-hover');
  }

  function setInteractionMode() {
    // Interaktionsmodi Studio / Kompakt / Turbo wurden entfernt; Standard ist Multi-Window
    applyModeClasses();
  }

  function normalizePanelName(panelName) {
    if (!panelName) return '';
    return String(panelName).replace(/^(panel-|modal-|helper-)/, '').replace(/-modal$/, '');
  }

  function getPanelMeta(panelName) {
    const cleanName = normalizePanelName(panelName);
    const metas = {
      'shopping': { title: 'Einkaufsliste', lucide: 'shopping-bag', short: 'Einkauf', color: 'text-emerald-400', getSummary: () => {
        const countEl = document.getElementById('shop-badge-count');
        const count = countEl && !countEl.classList.contains('hidden') ? countEl.textContent : '0';
        return `${count} Artikel auf der Liste`;
      }},
      'cooking': { title: 'Koch-Studio', lucide: 'utensils', short: 'Kochen', color: 'text-amber-400', getSummary: () => 'Smarte Rezepte & Zubereitung' },
      'clean-guide': { title: 'Putz-Guide', lucide: 'sparkles', short: 'Putz-Guide', color: 'text-cyan-400', getSummary: () => 'Schritt-für-Schritt Grundreinigung' },
      'cleaning-guide': { title: 'Putz-Guide', lucide: 'sparkles', short: 'Putz-Guide', color: 'text-cyan-400', getSummary: () => 'Schritt-für-Schritt Grundreinigung' },
      'cleaning': { title: 'Putz-Guide', lucide: 'brush', short: 'Putz-Guide', color: 'text-teal-400', getSummary: () => 'Schritt-für-Schritt Grundreinigung' },
      'steps': { title: 'Teilschritte', lucide: 'list-checks', short: 'Steps', color: 'text-purple-300', getSummary: () => 'Schritt-für-Schritt Fokus' },
      'break': { title: 'Pausen-Timer', lucide: 'coffee', short: 'Pause', color: 'text-teal-300', getSummary: () => 'Atem & Kurzentspannung' },
      'alarm': { title: 'Wecker & Timer', lucide: 'bell', short: 'Timer', color: 'text-rose-400', getSummary: () => {
        const timerEl = document.getElementById('timer-display');
        return timerEl ? `Timer: ${timerEl.textContent.trim()}` : 'Wecker & Countdown aktiv';
      }},
      
      'audio': { title: 'Sound Center', lucide: 'headphones', short: 'Sound', color: 'text-teal-400', getSummary: () => 'Ambient Mixer & Entspannung' },
      'ambient': { title: 'Ambient & Sounds', lucide: 'headphones', short: 'Sounds', color: 'text-teal-400', getSummary: () => 'Ambient Mixer & Naturklänge' },
      'sounds': { title: 'Ambient & Sounds', lucide: 'headphones', short: 'Sounds', color: 'text-teal-400', getSummary: () => 'Ambient Mixer & Naturklänge' },
      'music': { title: 'Musik & Medien', lucide: 'disc-3', short: 'Music', color: 'text-sky-400', getSummary: () => 'Eigene Tracks & Playlists' },
      'dj': { title: 'Noodle DJ Workstation', lucide: 'sliders', short: 'DJ', color: 'text-amber-400', getSummary: () => '2-Deck Mixer & FX' },
      'radio': { title: 'Radio Stream', lucide: 'radio', short: 'Radio', color: 'text-pink-400', getSummary: () => 'Live-Sender & Streams' },
      'news': { title: 'News Briefing', lucide: 'newspaper', short: 'News', color: 'text-purple-400', getSummary: () => 'Weltweite & lokale Nachrichten' },
      'sample-manager': { title: 'Sample Manager', lucide: 'sliders', short: 'Samples', color: 'text-violet-400', getSummary: () => 'Beispiel-Aufgaben verwalten' },

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
      'note-scanner': { title: 'Notiz-Scanner', lucide: 'camera', short: 'Scanner', color: 'text-blue-300', getSummary: () => 'Texte & Notizen scannen' },
      'note-detail': { title: 'Notiz bearbeiten', lucide: 'sticky-note', short: 'Notiz', color: 'text-amber-300', getSummary: () => 'Notiz-Editor' },
      'text-import': { title: 'Sammel-Import', lucide: 'file-text', short: 'Import', color: 'text-purple-300', getSummary: () => 'Aufgaben & Listen importieren' },
      'report-export': { title: 'Bericht-Export', lucide: 'file-text', short: 'Export', color: 'text-purple-300', getSummary: () => 'Wochen- & Monatsbericht' },
      'report-dashboard': { title: 'Statistik-Dashboard', lucide: 'bar-chart-2', short: 'Dashboard', color: 'text-purple-300', getSummary: () => 'Tages- & Wochenauswertung' },
      'learning-hub': { title: 'Wissens-Labor', lucide: 'graduation-cap', short: 'Lernen', color: 'text-amber-300', getSummary: () => 'Deep Learning & Quiz' },
      'undo-history': { title: 'Undo-Verlauf', lucide: 'history', short: 'Undo', color: 'text-cyan-300', getSummary: () => 'Vorherige Schritte wiederherstellen' },
      'postpone-termin': { title: 'Termin verschieben', lucide: 'calendar-sync', short: 'Termin', color: 'text-sky-300', getSummary: () => 'Datum & Uhrzeit anpassen' },
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
    const clean = normalizePanelName(panelName);
    if (clean === 'dj' || clean === 'music' || clean === 'ambient' || clean === 'sounds' || clean === 'media') {
      return document.getElementById('panel-audio');
    }
    return document.getElementById(panelName) ||
           document.getElementById(`panel-${panelName}`) ||
           document.getElementById(`modal-${panelName}`) ||
           document.getElementById(`helper-${panelName}-modal`) ||
           document.getElementById(`${panelName}-modal`) ||
           document.getElementById(`panel-${clean}`) ||
           document.getElementById(`modal-${clean}`) ||
           document.getElementById(`helper-${clean}-modal`) ||
           document.getElementById(`${clean}-modal`) ||
           document.getElementById(clean);
  }

  function isModalOverlay(el) {
    if (!el || !el.id) return false;
    if (EXCLUDED_MODAL_IDS.has(el.id)) return false;
    return el.id.endsWith('-modal') || el.id.startsWith('modal-');
  }

  function getMovableWindowBox(el) {
    if (!el) return null;
    if (isModalOverlay(el) && el.firstElementChild) {
      return el.firstElementChild;
    }
    return el;
  }

  function isFloatingDesktopWindow(el, clean) {
    if (!el) return false;
    const c = clean || normalizePanelName(el.id);
    if (TRANSIENT_DROPDOWN_NAMES.has(c)) return false;
    return FLOATING_TOOL_NAMES.has(c) || el.classList.contains('dock-popover-panel') || isModalOverlay(el);
  }

  function portalToolPanelsToBody() {
    if (typeof document === 'undefined' || !document.body) return;
    const headerTools = document.getElementById('panel-header-tools');
    if (headerTools) {
      headerTools.querySelectorAll('.dock-popover-panel').forEach(panel => {
        panel.classList.add('noodle-floating-tool-window');
        document.body.appendChild(panel);
      });
    }
  }

  function countVisibleFloatingWindows(excludeEl) {
    if (typeof document === 'undefined') return 0;
    let count = 0;
    document.querySelectorAll('.dock-popover-panel, .noodle-floating-tool-window, [id$="-modal"], [id^="modal-"]').forEach(w => {
      if (w === excludeEl || !w.id || EXCLUDED_MODAL_IDS.has(w.id)) return;
      const c = normalizePanelName(w.id);
      if (TRANSIENT_DROPDOWN_NAMES.has(c)) return;
      if (!w.classList.contains('hidden')) {
        count++;
      }
    });
    return count;
  }

  function positionFloatingWindow(el, panelName) {
    if (!el || typeof window === 'undefined') return;
    const clean = normalizePanelName(panelName || el.id);
    const isMobile = (window.innerWidth || document.documentElement.clientWidth || 0) <= 768;
    const winBox = getMovableWindowBox(el);
    if (!winBox) return;

    if (isModalOverlay(el)) {
      if (!isMobile) {
        el.classList.add('noodle-floating-modal-backdrop');
        winBox.classList.add('noodle-floating-modal-card');
      } else {
        el.classList.remove('noodle-floating-modal-backdrop');
        winBox.classList.remove('noodle-floating-modal-card');
        winBox.style.left = '';
        winBox.style.top = '';
        return;
      }
    }

    if (isMobile || !isFloatingDesktopWindow(el, clean)) return;
    if (el.classList.contains('noodle-panel-fullscreen') || winBox.classList.contains('noodle-panel-fullscreen') || el.classList.contains('noodle-panel-snapped')) {
      return;
    }

    const vw = window.innerWidth || document.documentElement.clientWidth || 1280;
    const vh = window.innerHeight || document.documentElement.clientHeight || 800;

    const applyCoords = () => {
      if (!el || el.classList.contains('hidden')) return;
      if (el.classList.contains('noodle-panel-fullscreen') || el.classList.contains('noodle-panel-snapped')) return;

      const rect = winBox.getBoundingClientRect();
      const w = Math.min(rect.width || 440, vw - 24);
      const h = Math.min(rect.height || 480, vh - 76);

      if (winBox.dataset.userMoved === 'true' && winBox.style.left && winBox.style.top) {
        const curLeft = parseFloat(winBox.style.left) || 20;
        const curTop = parseFloat(winBox.style.top) || 60;
        const clampedLeft = Math.max(12, Math.min(vw - Math.min(w, 180), curLeft));
        const clampedTop = Math.max(54, Math.min(vh - 64, curTop));
        winBox.style.left = `${Math.round(clampedLeft)}px`;
        winBox.style.top = `${Math.round(clampedTop)}px`;
        winBox.classList.add('noodle-window-positioned');
        return;
      }

      const openOthers = countVisibleFloatingWindows(el);
      const cascadeOffsets = [
        [0, 0],
        [38, 26],
        [-38, 26],
        [72, -20],
        [-72, -20],
        [20, 46],
        [-20, -36]
      ];
      const [offX, offY] = cascadeOffsets[openOthers % cascadeOffsets.length];

      const targetLeft = Math.max(16, Math.min(vw - w - 16, Math.round((vw - w) / 2 + offX)));
      const targetTop = Math.max(58, Math.min(vh - h - 20, Math.round((vh - h) / 2 + offY)));

      winBox.classList.add('noodle-window-positioned');
      winBox.style.left = `${targetLeft}px`;
      winBox.style.top = `${targetTop}px`;
      winBox.style.right = 'auto';
      winBox.style.bottom = 'auto';
    };

    applyCoords();
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(applyCoords);
    }
  }

  function attachWindowDrag(headerRow, winBox, el, clean) {
    if (!headerRow || !winBox || headerRow._noodleDragAttached) return;
    headerRow._noodleDragAttached = true;
    headerRow.classList.add('noodle-draggable-header');

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    headerRow.addEventListener('pointerdown', (e) => {
      if ((window.innerWidth || 0) <= 768) return;
      if (e.button !== 0) return;
      if (e.target.closest('button, input, select, textarea, a, label, .noodle-win-controls')) return;
      if (!isFloatingDesktopWindow(el, clean)) return;

      bringWindowToFront(clean);

      if (el.classList.contains('noodle-panel-fullscreen') || winBox.classList.contains('noodle-panel-fullscreen')) {
        el.classList.remove('noodle-panel-fullscreen');
        winBox.classList.remove('noodle-panel-fullscreen');
      }
      if (el.classList.contains('noodle-panel-snapped') && typeof unsnapWindow === 'function') {
        unsnapWindow(clean);
      }

      const rect = winBox.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;
      isDragging = true;

      winBox.classList.add('noodle-window-positioned');
      winBox.style.left = `${Math.round(initialLeft)}px`;
      winBox.style.top = `${Math.round(initialTop)}px`;
      winBox.style.right = 'auto';
      winBox.style.bottom = 'auto';
      winBox.style.transform = 'none';

      headerRow.classList.add('is-dragging');
      try { headerRow.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });

    headerRow.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const vw = window.innerWidth || document.documentElement.clientWidth || 1280;
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const newLeft = Math.max(8, Math.min(vw - 120, Math.round(initialLeft + dx)));
      const newTop = Math.max(48, Math.min(vh - 56, Math.round(initialTop + dy)));

      winBox.style.left = `${newLeft}px`;
      winBox.style.top = `${newTop}px`;
      winBox.dataset.userMoved = 'true';
    });

    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      headerRow.classList.remove('is-dragging');
      try { headerRow.releasePointerCapture(e.pointerId); } catch (err) {}
    };

    headerRow.addEventListener('pointerup', endDrag);
    headerRow.addEventListener('pointercancel', endDrag);
  }

  function bringWindowToFront(panelName) {
    const el = getPanelElement(panelName);
    if (!el) return;
    highestZIndex += 2;
    el.style.zIndex = highestZIndex;
    const winBox = getMovableWindowBox(el);
    if (winBox && winBox !== el) {
      winBox.style.zIndex = highestZIndex + 1;
    }
    document.querySelectorAll('.noodle-panel-focused').forEach(p => p.classList.remove('noodle-panel-focused'));
    el.classList.add('noodle-panel-focused');
  }

  function getMinimizedDock() {
    let dock = document.getElementById('noodle-minimized-dock');
    if (!dock && typeof document !== 'undefined' && document.body) {
      dock = document.createElement('div');
      dock.id = 'noodle-minimized-dock';
      dock.className = 'noodle-minimized-dock fixed bottom-4 right-4 z-[200500] flex items-center gap-2 flex-wrap pointer-events-auto select-none';
      dock.style.zIndex = '200500';
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
        <div class="noodle-taskbar-preview-card hidden group-hover/pill:flex absolute bottom-[calc(100%+10px)] right-0 w-64 p-3 rounded-2xl bg-[#12111c]/98 border border-white/10 shadow-2xl backdrop-blur-2xl flex-col gap-1.5 text-left z-[200550] animate-fade-in pointer-events-none">
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

  function closeHeaderToolsMenuOnLaunch(launchedCleanName) {
    if (launchedCleanName === 'header-tools') return;
    const headerTools = document.getElementById('panel-header-tools');
    if (headerTools && !headerTools.classList.contains('hidden')) {
      headerTools.classList.add('hidden');
      headerTools.style.removeProperty('display');
      headerTools.classList.remove('noodle-panel-peeking', 'noodle-panel-pinned', 'has-mobile-subpanel-open');
      if (typeof window !== 'undefined') {
        if (window.pinnedPanel === 'header-tools') window.pinnedPanel = null;
        if (window.currentlyOpenPanel === 'header-tools') window.currentlyOpenPanel = null;
      }
      if (typeof window.updateDashboardArrowUI === 'function') {
        window.updateDashboardArrowUI(false);
      }
    }
  }

  function openWindow(panelName) {
    const clean = normalizePanelName(panelName);
    const el = getPanelElement(panelName);
    if (!el) return;

    portalToolPanelsToBody();
    closeHeaderToolsMenuOnLaunch(clean);

    minimizedWindows.delete(panelName);
    minimizedWindows.delete(clean);
    activeWindows.add(clean);
    updateMinimizedDockUI();

    el.classList.remove('hidden', 'noodle-panel-peeking', 'noodle-panel-minimized');
    el.style.removeProperty('display');
    const winBox = getMovableWindowBox(el);
    if (winBox && winBox !== el) {
      winBox.classList.remove('hidden');
      winBox.style.removeProperty('display');
    }
    el.classList.add('noodle-panel-pinned');

    // Dynamic Render Callbacks first, then decorate so controls are never overwritten
    triggerPanelRender(clean);
    decoratePanel(el, clean);
    positionFloatingWindow(el, clean);
    bringWindowToFront(clean);

    if (!isFloatingDesktopWindow(el, clean) && typeof adjustPanelPosition === 'function') {
      try { adjustPanelPosition(el, clean); } catch (e) {}
    }

    if (typeof syncHeaderToolsMenuState === 'function') {
      try { syncHeaderToolsMenuState(); } catch (e) {}
    }
    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
  }

  function triggerPanelRender(panelName) {
    const clean = normalizePanelName(panelName);
    if (clean === 'shopping' && typeof renderShoppingList === 'function') renderShoppingList();
    if (clean === 'cooking' && typeof renderCookingPanel === 'function') renderCookingPanel(false);
    if (clean === 'alarm' && typeof renderAlarmPanel === 'function') renderAlarmPanel();
    if (clean === 'news') {
      if (typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.initNewsPanel === 'function') {
        RadioNewsEngine.initNewsPanel();
      } else if (typeof renderNewsBriefing === 'function') {
        renderNewsBriefing();
      }
    }
    if (clean === 'radio' && typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.initRadioPanel === 'function') {
      RadioNewsEngine.initRadioPanel();
    }
    if (clean === 'audio' || clean === 'dj' || clean === 'music' || clean === 'ambient' || clean === 'sounds') {
      const targetTab = (clean === 'dj' || clean === 'music' || clean === 'ambient')
        ? clean
        : (clean === 'sounds' ? 'ambient' : (window._lastActiveAudioTab || localStorage.getItem('flow_last_audio_tab') || 'ambient'));
      if (typeof switchAudioTab === 'function') switchAudioTab(targetTab);
    }
    if (clean === 'collab-chat' && typeof CollabEngine !== 'undefined') {
      if (typeof CollabEngine.renderChatMessages === 'function') CollabEngine.renderChatMessages();
      if (typeof CollabEngine.renderPresenceUI === 'function') CollabEngine.renderPresenceUI();
    }
    if (clean === 'health' && window.HealthEngine && typeof window.HealthEngine.renderPanel === 'function') {
      window.HealthEngine.renderPanel();
    }
    if (clean === 'humor-lab' && window.HumorEngine) {
      if (typeof window.HumorEngine.renderHumorPanel === 'function') window.HumorEngine.renderHumorPanel();
      else if (typeof window.HumorEngine.renderPanel === 'function') window.HumorEngine.renderPanel();
    }
    if (clean === 'social') {
      if (window.SocialHubEngine && typeof window.SocialHubEngine.render === 'function') window.SocialHubEngine.render();
      else if (window.SocialEngine && typeof window.SocialEngine.renderPanel === 'function') window.SocialEngine.renderPanel();
    }
    if (clean === 'calendar-dropdown' && typeof renderMiniCalendar === 'function') renderMiniCalendar();
    if (clean === 'weather' && typeof updateWeatherDisplay === 'function') updateWeatherDisplay();
    if (clean === 'report' && typeof updateReportPanel === 'function') updateReportPanel();
  }

  function minimizeWindow(panelName, event) {
    if (event) {
      try { event.preventDefault(); event.stopPropagation(); } catch (e) {}
    }
    const clean = normalizePanelName(panelName);
    const el = getPanelElement(panelName);
    if (!el) return;

    el.classList.add('hidden', 'noodle-panel-minimized');
    el.classList.remove('noodle-panel-focused');
    el.style.removeProperty('display');

    const winBox = getMovableWindowBox(el);
    if (winBox && winBox !== el) {
      winBox.classList.add('hidden');
      winBox.style.removeProperty('display');
    }

    minimizedWindows.add(clean);
    activeWindows.add(clean);

    updateMinimizedDockUI();

    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('medium');
    if (typeof showToast === 'function') {
      const meta = getPanelMeta(clean);
      showToast(`${meta.title} minimiert`);
    }
  }

  function restoreWindow(panelName) {
    const clean = normalizePanelName(panelName);
    const el = getPanelElement(panelName);
    if (!el) return;

    minimizedWindows.delete(panelName);
    minimizedWindows.delete(clean);
    el.classList.remove('hidden', 'noodle-panel-minimized');
    el.style.removeProperty('display');

    const winBox = getMovableWindowBox(el);
    if (winBox && winBox !== el) {
      winBox.style.removeProperty('display');
    }

    el.classList.add('noodle-panel-pinned');

    updateMinimizedDockUI();
    triggerPanelRender(clean);
    decoratePanel(el, clean);
    positionFloatingWindow(el, clean);
    bringWindowToFront(clean);

    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
  }

  function toggleFullscreen(panelName, event) {
    if (event) {
      try { event.preventDefault(); event.stopPropagation(); } catch (e) {}
    }
    const clean = normalizePanelName(panelName);
    const el = getPanelElement(panelName);
    if (!el) return;

    const winBox = getMovableWindowBox(el);
    const isFull = el.classList.contains('noodle-panel-fullscreen') || (winBox && winBox.classList.contains('noodle-panel-fullscreen'));
    if (isFull) {
      el.classList.remove('noodle-panel-fullscreen');
      if (winBox) winBox.classList.remove('noodle-panel-fullscreen');
      positionFloatingWindow(el, clean);
    } else {
      el.classList.add('noodle-panel-fullscreen');
      if (winBox && winBox !== el) winBox.classList.add('noodle-panel-fullscreen');
    }

    bringWindowToFront(clean);
    decoratePanel(el, clean);
    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
  }

  let _isClosingWindow = false;

  function closeWindow(panelName, event) {
    if (event) {
      try { event.preventDefault(); event.stopPropagation(); } catch (e) {}
    }
    const clean = normalizePanelName(panelName);
    const el = getPanelElement(panelName);
    if (el) {
      el.classList.add('hidden');
      el.style.removeProperty('display');
      el.classList.remove('noodle-panel-pinned', 'noodle-panel-fullscreen', 'noodle-panel-focused', 'noodle-panel-peeking', 'noodle-panel-minimized', 'noodle-panel-snapped');
      const winBox = getMovableWindowBox(el);
      if (winBox && winBox !== el) {
        winBox.classList.add('hidden');
        winBox.classList.remove('noodle-panel-fullscreen');
        winBox.style.removeProperty('display');
      }
      if (el.id) {
        activeWindows.delete(el.id);
        minimizedWindows.delete(el.id);
      }
    }

    activeWindows.delete(panelName);
    activeWindows.delete(clean);
    minimizedWindows.delete(panelName);
    minimizedWindows.delete(clean);
    updateMinimizedDockUI();

    if (typeof window !== 'undefined') {
      if (window.currentlyOpenPanel === clean || window.currentlyOpenPanel === panelName) window.currentlyOpenPanel = null;
      if (window.pinnedPanel === clean || window.pinnedPanel === panelName) window.pinnedPanel = null;
    }
    const isMobile = typeof window !== 'undefined' && (window.innerWidth || document.documentElement.clientWidth || 0) <= 768;
    if (isMobile && FLOATING_TOOL_NAMES.has(clean)) {
      const headerTools = document.getElementById('panel-header-tools');
      if (headerTools) {
        headerTools.classList.remove('has-mobile-subpanel-open', 'noodle-panel-peeking', 'noodle-panel-pinned');
        headerTools.classList.add('hidden');
        headerTools.style.removeProperty('display');
      }
    }
    const dockContainer = document.querySelector('.desktop-tools-sidebar, .mac-dock-container');
    if (dockContainer) dockContainer.classList.remove('is-active');
    if (typeof syncHeaderToolsMenuState === 'function') {
      try { syncHeaderToolsMenuState(); } catch (e) {}
    }

    // Run modal-specific cleanup hooks (stop timers, speech, audio, camera streams)
    if (!_isClosingWindow) {
      _isClosingWindow = true;
      try {
        const modalCleanupMap = {
          'pick': () => typeof closeHelperModal === 'function' && closeHelperModal(),
          'steps': () => typeof closeHelperModal === 'function' && closeHelperModal(),
          'cleaning': () => typeof closeCleaningGuideModal === 'function' && closeCleaningGuideModal(),
          'clean-guide': () => typeof closeCleaningGuideModal === 'function' && closeCleaningGuideModal(),
          'sport': () => typeof closeSportModal === 'function' && closeSportModal(),
          'break': () => typeof closeBreakModal === 'function' && closeBreakModal(),
          'safespace': () => typeof closeSafeSpaceModal === 'function' && closeSafeSpaceModal(),
          'clarity': () => typeof closeClarityModal === 'function' && closeClarityModal(),
          'regulation': () => typeof closeRegulationModal === 'function' && closeRegulationModal(),
          'brainstorm': () => typeof closeBrainstormModal === 'function' && closeBrainstormModal(),
          'sample-manager': () => typeof closeSampleManagerModal === 'function' && closeSampleManagerModal(),
          'supermarket': () => typeof closeSupermarketModal === 'function' && closeSupermarketModal(),
          'note-scanner': () => typeof closeNoteScannerModal === 'function' && closeNoteScannerModal(),
          'ocr-scanner': () => typeof closeNoteScannerModal === 'function' && closeNoteScannerModal(),
          'note-detail': () => typeof closeNoteDetailModal === 'function' && closeNoteDetailModal(),
          'text-import': () => typeof closeTextImportModal === 'function' && closeTextImportModal(),
          'postpone-termin': () => typeof closePostponeTerminModal === 'function' && closePostponeTerminModal(),
          'report-export': () => typeof closeReportExportModal === 'function' && closeReportExportModal(),
          'learning-hub': () => typeof closeLearningHubModal === 'function' && closeLearningHubModal(),
          'report-dashboard': () => typeof closeReportDashboard === 'function' && closeReportDashboard(),
          'settings': () => typeof closeSettingsModal === 'function' && closeSettingsModal(),
          'app-install': () => typeof closeInstallModal === 'function' && closeInstallModal(),
          'privacy-legal': () => typeof closePrivacyModal === 'function' && closePrivacyModal(),
          'undo-history': () => typeof closeUndoHistoryModal === 'function' && closeUndoHistoryModal(),
          'p2p-sync': () => typeof closeP2PSyncModal === 'function' && closeP2PSyncModal(),
          'feierabend-celebration': () => typeof closeFeierabendModal === 'function' && closeFeierabendModal(),
          'command-palette': () => typeof closeCommandPalette === 'function' && closeCommandPalette(),
          'keyboard-shortcuts': () => typeof closeKeyboardShortcuts === 'function' && closeKeyboardShortcuts(),
          'dice': () => typeof closeDiceModal === 'function' && closeDiceModal(),
          'roulette': () => typeof closeRouletteModal === 'function' && closeRouletteModal(),
          'custom-item': () => typeof closeCustomItemModal === 'function' && closeCustomItemModal(),
          'archive': () => typeof closeArchiveModal === 'function' && closeArchiveModal(),
          'export': () => typeof closeExportModal === 'function' && closeExportModal(),
          'import': () => typeof closeImportModal === 'function' && closeImportModal(),
          'news': () => typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.stopNewsReader === 'function' && RadioNewsEngine.stopNewsReader()
        };
        if (modalCleanupMap[clean]) {
          modalCleanupMap[clean]();
        }
      } catch (e) {} finally {
        _isClosingWindow = false;
      }
    }

    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
  }

  function closeAllWindows() {
    const list = Array.from(new Set([...activeWindows, ...minimizedWindows]));
    list.forEach(w => {
      try { closeWindow(w); } catch (e) {}
    });
    if (typeof document !== 'undefined') {
      document.querySelectorAll('.noodle-window-box, .noodle-floating-tool-window').forEach(box => {
        box.classList.add('hidden');
        box.style.removeProperty('display');
      });
    }
    activeWindows.clear();
    minimizedWindows.clear();
    updateMinimizedDockUI();
    if (typeof syncHeaderToolsMenuState === 'function') {
      try { syncHeaderToolsMenuState(); } catch (e) {}
    }
  }

  function togglePanel(panelName, event) {
    if (event) {
      try { event.stopPropagation(); } catch (e) {}
    }
    const clean = normalizePanelName(panelName);
    const el = getPanelElement(panelName);
    if (!el) return;

    if (minimizedWindows.has(clean) || minimizedWindows.has(panelName)) {
      restoreWindow(clean);
      return;
    }

    const isVisible = !el.classList.contains('hidden') && el.style.display !== 'none';
    if (isVisible) {
      if (el.classList.contains('noodle-panel-peeking')) {
        openWindow(clean);
      } else {
        closeWindow(clean);
      }
    } else {
      openWindow(clean);
    }
  }

  function isHeaderCloseButton(btn) {
    if (!btn || btn.classList.contains('noodle-win-btn') || btn.classList.contains('noodle-min-close-btn')) return false;
    if (btn.classList.contains('modal-close-btn')) return true;
    const txt = (btn.textContent || '').trim();
    if (txt === '✕' || txt === '×') return true;
    if (!txt && btn.querySelector('[data-lucide="x"], svg.lucide-x')) return true;
    return false;
  }

  // Findet oder erzeugt das deutliche 3er-Kontrollfeld [—] [□] [✕] im Fenster-Header
  function decoratePanel(el, panelName) {
    if (!el || EXCLUDED_MODAL_IDS.has(el.id)) return;
    const clean = normalizePanelName(panelName || el.id);
    if (!clean || clean === 'header-tools') return;

    const winBox = getMovableWindowBox(el);
    if (!winBox) return;

    const isFullscreen = el.classList.contains('noodle-panel-fullscreen') || winBox.classList.contains('noodle-panel-fullscreen');

    // 1. Suche vorhandenen Schließen-Button im Header & die passende Header-Zeile
    const allCloseBtns = Array.from(winBox.querySelectorAll('button')).filter(isHeaderCloseButton);
    const existingClose = allCloseBtns.find(b => !b.classList.contains('absolute')) || allCloseBtns[0] || null;

    let headerRow = winBox.querySelector('.noodle-window-titlebar') ||
      ((existingClose && !existingClose.classList.contains('absolute'))
        ? existingClose.parentElement
        : (winBox.querySelector('.flex.items-center.justify-between.border-b, .flex.flex-wrap.items-center.justify-between.border-b, .flex.items-center.justify-between') || null));

    // Falls ein dynamisches Panel (oder Modal) keine erkennbare obere Header-Zeile hat, eigene Titlebar oben einfügen
    if (!headerRow && isFloatingDesktopWindow(el, clean)) {
      const meta = getPanelMeta(clean);
      headerRow = document.createElement('div');
      headerRow.className = 'noodle-window-titlebar';
      headerRow.innerHTML = `
        <div class="flex items-center gap-2">
          <i data-lucide="${meta.lucide || 'layout'}" class="w-4 h-4 ${meta.color || 'text-purple-400'}"></i>
          <span class="text-xs font-extrabold tracking-wide ${meta.color || 'text-purple-300'}">${meta.title}</span>
        </div>
      `;
      winBox.insertBefore(headerRow, winBox.firstChild);
      if (typeof renderLucideIcons === 'function') {
        try { renderLucideIcons(false, headerRow); } catch (e) {}
      }
    }

    if (headerRow) {
      const dragBar = (headerRow.closest && winBox.contains(headerRow.closest('.border-b')))
        ? headerRow.closest('.border-b')
        : headerRow;

      // Dragging über die gesamte Titelleiste aktivieren
      attachWindowDrag(dragBar, winBox, el, clean);

      // Header-Doppelklick maximiert / stellt wieder her (Windows/macOS Standard)
      if (!dragBar._noodleDblClickAttached) {
        dragBar._noodleDblClickAttached = true;
        dragBar.addEventListener('dblclick', (e) => {
          if (e.target.closest('button, input, select, textarea, a')) return;
          toggleFullscreen(clean, e);
        });
      }

      let winControls = winBox.querySelector('.noodle-win-controls');
      if (!winControls) {
        winControls = document.createElement('div');
        winControls.className = 'noodle-win-controls flex items-center gap-1 shrink-0';
        winControls.setAttribute('data-panel-controls', clean);

        // 1. Minimize [—]
        const minBtn = document.createElement('button');
        minBtn.type = 'button';
        minBtn.className = 'noodle-win-btn noodle-win-min-btn';
        minBtn.title = 'Minimieren in Taskleiste [—]';
        minBtn.setAttribute('aria-label', 'Minimieren');
        minBtn.innerHTML = '<span>—</span>';
        minBtn.onclick = (e) => minimizeWindow(clean, e);
        winControls.appendChild(minBtn);

        // 2. Maximize / Restore [□ / ❐]
        const maxBtn = document.createElement('button');
        maxBtn.type = 'button';
        maxBtn.className = 'noodle-win-btn noodle-win-max-btn noodle-fullscreen-badge-btn';
        maxBtn.setAttribute('data-panel-fullscreen', clean);
        maxBtn.title = 'Maximieren / Vollbild [□]';
        maxBtn.setAttribute('aria-label', 'Maximieren');
        maxBtn.innerHTML = '<span>□</span>';
        maxBtn.onclick = (e) => toggleFullscreen(clean, e);
        winControls.appendChild(maxBtn);

        // 3. Close [✕]
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'noodle-win-btn noodle-win-close-btn';
        closeBtn.title = 'Schließen [✕]';
        closeBtn.setAttribute('aria-label', 'Schließen');
        closeBtn.innerHTML = '<span>✕</span>';
        closeBtn.onclick = (e) => closeWindow(clean, e);
        winControls.appendChild(closeBtn);

        headerRow.appendChild(winControls);

        if (typeof attachSnapHoverToControls === 'function') {
          attachSnapHoverToControls(winControls, clean);
        }
      } else {
        if (winControls.parentElement !== headerRow) {
          headerRow.appendChild(winControls);
        }
        winControls.setAttribute('data-panel-controls', clean);
        const minBtn = winControls.querySelector('.noodle-win-min-btn');
        if (minBtn) minBtn.onclick = (e) => minimizeWindow(clean, e);
        const maxBtn = winControls.querySelector('.noodle-win-max-btn');
        if (maxBtn) {
          maxBtn.setAttribute('data-panel-fullscreen', clean);
          maxBtn.onclick = (e) => toggleFullscreen(clean, e);
        }
        const closeBtn = winControls.querySelector('.noodle-win-close-btn');
        if (closeBtn) closeBtn.onclick = (e) => closeWindow(clean, e);
      }

      // Alte native Header-Schließen-Buttons ausblenden, sobald winControls aktiv sind
      allCloseBtns.forEach(oldBtn => {
        oldBtn.style.display = 'none';
      });
      if (headerRow.classList.contains('pr-6')) {
        headerRow.classList.remove('pr-6');
      }

      // Maximize Button State aktualisieren ([□] vs [❐])
      const maxBtn = winControls.querySelector('.noodle-win-max-btn');
      if (maxBtn) {
        maxBtn.innerHTML = isFullscreen ? '<span>❐</span>' : '<span>□</span>';
        maxBtn.title = isFullscreen ? 'Wiederherstellen / Normalgröße [❐]' : 'Maximieren / Vollbild [□]';
        if (typeof attachSnapHoverToControls === 'function') {
          attachSnapHoverToControls(winControls, clean);
        }
      }
    }

    // Klick bringt Fenster in den Vordergrund
    if (!winBox._noodleFocusAttached) {
      winBox._noodleFocusAttached = true;
      winBox.addEventListener('pointerdown', () => {
        bringWindowToFront(clean);
      }, { passive: true });
    }
  }

  // Gezielter Observer auf den bekannten Panels & Modals:
  // Sorgt dafür, dass JEDES Popup-Fenster und Tool beim Öffnen automatisch
  // zentriert, in den Vordergrund geholt und mit [—] [□] [✕] ausgestattet wird.
  function setupDOMObserver() {
    if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;

    const classObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          const el = m.target;
          if (!el || !el.id || EXCLUDED_MODAL_IDS.has(el.id)) continue;
          const isHidden = el.classList.contains('hidden');
          const wasHidden = el._noodleWasHidden !== false;
          el._noodleWasHidden = isHidden;

          if (!isHidden && wasHidden) {
            const clean = normalizePanelName(el.id);
            if (clean && clean !== 'header-tools') {
              closeHeaderToolsMenuOnLaunch(clean);
              decoratePanel(el, clean);
              positionFloatingWindow(el, clean);
              bringWindowToFront(clean);
            }
          }
        } else if (m.type === 'childList') {
          const el = m.target.closest ? m.target.closest('.dock-popover-panel, [id^="panel-"], [id$="-modal"], [id*="modal-"]') : null;
          if (el && el.id && !el.classList.contains('hidden')) {
            const winBox = getMovableWindowBox(el);
            if (winBox && !winBox.querySelector('.noodle-win-controls')) {
              decoratePanel(el, normalizePanelName(el.id));
            }
          }
        }
      }
    });

    document.querySelectorAll('.dock-popover-panel, [id^="panel-"], .modal, [id$="-modal"], [id*="modal-"]').forEach(el => {
      if (!el.id || EXCLUDED_MODAL_IDS.has(el.id)) return;
      el._noodleWasHidden = el.classList.contains('hidden');
      classObserver.observe(el, { attributes: true, attributeFilter: ['class'] });
    });

    // Für dynamisch gerenderte Panels auch childList überwachen, damit [—] [□] [✕] nach re-render erhalten bleiben
    ['panel-cooking', 'panel-health', 'panel-humor-lab', 'panel-social', 'panel-shopping', 'panel-news', 'panel-radio'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        classObserver.observe(el, { childList: true });
      }
    });
  }

  // Initialisierung nach DOM-Ready
  function init() {
    applyModeClasses(currentMode);
    portalToolPanelsToBody();

    // ESC schließt alle offenen Fenster & Tools
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        closeAllWindows();
      }
    }, true);

    const scanAndDecorate = () => {
      portalToolPanelsToBody();
      document.querySelectorAll('.dock-popover-panel, [id^="panel-"], .modal, [id$="-modal"], [id*="modal-"]').forEach(el => {
        if (!el.id || EXCLUDED_MODAL_IDS.has(el.id)) return;
        const panelName = normalizePanelName(el.id);
        decoratePanel(el, panelName);
      });
    };

    scanAndDecorate();
    setTimeout(scanAndDecorate, 300);
    setupDOMObserver();
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
    normalizePanelName,
    getPanelElement,
    getPanelMeta,
    openWindow,
    minimizeWindow,
    restoreWindow,
    toggleFullscreen,
    closeWindow,
    closeAllWindows,
    togglePanel,
    bringWindowToFront,
    decoratePanel,
    positionFloatingWindow,
    isFloatingDesktopWindow,
    updateSettingsUI: () => {},
    pinPanel: openWindow,
    unpinPanel: closeWindow,
    togglePin: togglePanel
  };

  window.setInteractionMode = setInteractionMode;
  window.getPanelElement = getPanelElement;
  window.getPanelMeta = getPanelMeta;
  window.minimizeWindow = minimizeWindow;
  window.restoreWindow = restoreWindow;
  window.closeWindow = closeWindow;
  window.closeAllWindows = closeAllWindows;
  window.closeAllToolWindows = closeAllWindows;
  window.toggleFullscreen = toggleFullscreen;
  window.togglePanelFullscreen = toggleFullscreen;
  window.togglePinPanel = togglePanel;
  window.togglePanel = togglePanel;
  window.bringWindowToFront = bringWindowToFront;

})();
