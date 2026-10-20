/**
 * @file app-multitasking-hub.js
 * @module MultitaskingHub
 * @description
 * Desktop Snap-Layouts & Mobile Multitasking-Engine:
 * - Desktop Snap-Layout-Picker (50:50 Split, 65:35 Fokus-Split, 4-Quadranten-Grid, Drag-to-Edge-Snapping)
 * - Mobile Dynamic Island mit Echtzeit-Status für aktive Timer, Soundscapes, Radio und Koch-Schritte
 * - Vertikaler Dual-Screen / Split-View-Modus für mobile Endgeräte mit verstellbarem Touch-Divider
 * - Tastatur-Schnellnavigation (`Alt+Tab` / `Win+Pfeiltasten`)
 */

(function(global) {
  'use strict';

  // --------------------------------------------------------------------------
  // STATE & REGISTRY
  // --------------------------------------------------------------------------
  const snappedWindows = new Map(); // panelName -> layoutType
  let activeSnapFlyout = null;
  let flyoutCloseTimer = null;
  let mobileSplitActive = false;
  let mobileSplitTools = { top: null, bottom: null };

  function isMobileViewport() {
    return window.innerWidth <= 768 || ('ontouchstart' in window && window.innerWidth <= 1024);
  }

  // --------------------------------------------------------------------------
  // 1. DESKTOP SNAP LAYOUTS (WINDOWS 11 STYLE)
  // --------------------------------------------------------------------------

  const SNAP_LAYOUTS = {
    'left-50': {
      title: 'Links 50%',
      style: { left: '8px', top: '56px', width: 'calc(50vw - 12px)', height: 'calc(100vh - 64px)', right: 'auto', bottom: 'auto' }
    },
    'right-50': {
      title: 'Rechts 50%',
      style: { left: 'calc(50vw + 4px)', top: '56px', width: 'calc(50vw - 12px)', height: 'calc(100vh - 64px)', right: 'auto', bottom: 'auto' }
    },
    'left-65': {
      title: 'Fokus 65%',
      style: { left: '8px', top: '56px', width: 'calc(65vw - 12px)', height: 'calc(100vh - 64px)', right: 'auto', bottom: 'auto' }
    },
    'right-35': {
      title: 'Begleiter 35%',
      style: { left: 'calc(65vw + 4px)', top: '56px', width: 'calc(35vw - 12px)', height: 'calc(100vh - 64px)', right: 'auto', bottom: 'auto' }
    },
    'top-left': {
      title: 'Oben Links 25%',
      style: { left: '8px', top: '56px', width: 'calc(50vw - 12px)', height: 'calc(50vh - 36px)', right: 'auto', bottom: 'auto' }
    },
    'top-right': {
      title: 'Oben Rechts 25%',
      style: { left: 'calc(50vw + 4px)', top: '56px', width: 'calc(50vw - 12px)', height: 'calc(50vh - 36px)', right: 'auto', bottom: 'auto' }
    },
    'bottom-left': {
      title: 'Unten Links 25%',
      style: { left: '8px', top: 'calc(50vh + 26px)', width: 'calc(50vw - 12px)', height: 'calc(50vh - 36px)', right: 'auto', bottom: 'auto' }
    },
    'bottom-right': {
      title: 'Unten Rechts 25%',
      style: { left: 'calc(50vw + 4px)', top: 'calc(50vh + 26px)', width: 'calc(50vw - 12px)', height: 'calc(50vh - 36px)', right: 'auto', bottom: 'auto' }
    },
    'full': {
      title: 'Vollbild',
      style: { left: '0px', top: '0px', width: '100vw', height: '100vh', right: '0px', bottom: '0px' }
    }
  };

  /**
   * Rastet ein Fenster in das gewünschte Snap-Layout ein
   */
  function snapWindow(panelName, layoutType) {
    const el = (typeof getPanelElement === 'function') ? getPanelElement(panelName) : document.getElementById(panelName);
    if (!el) return;

    const layout = SNAP_LAYOUTS[layoutType];
    if (!layout) return;

    const winBox = el.querySelector('.noodle-floating-modal-card') || el;

    // Reset old snap / fullscreen classes
    el.classList.remove('noodle-panel-fullscreen', 'hidden', 'noodle-panel-minimized');
    winBox.classList.remove('noodle-panel-fullscreen');
    el.classList.add('noodle-panel-pinned', 'noodle-panel-snapped');
    winBox.classList.add('noodle-window-positioned');
    el.setAttribute('data-snap-layout', layoutType);

    // Set layout coordinates on movable window box
    Object.assign(winBox.style, {
      position: 'fixed',
      margin: '0',
      maxWidth: 'none',
      transform: 'none',
      borderRadius: (layoutType === 'full') ? '0px' : '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.15)',
      ...layout.style
    });

    snappedWindows.set(panelName, layoutType);
    hideSnapFlyout();

    if (typeof bringWindowToFront === 'function') bringWindowToFront(panelName);
    if (typeof showToast === 'function') {
      showToast(`🔲 Fenster eingerastet: ${layout.title}`);
    }
    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');

    updateMultitaskingState();
  }

  /**
   * Stellt ein gesnapptes Fenster wieder auf die zentrierte Standardgröße zurück
   */
  function unsnapWindow(panelName) {
    const el = (typeof getPanelElement === 'function') ? getPanelElement(panelName) : document.getElementById(panelName);
    if (!el) return;

    const winBox = el.querySelector('.noodle-floating-modal-card') || el;

    el.classList.remove('noodle-panel-snapped');
    el.removeAttribute('data-snap-layout');
    snappedWindows.delete(panelName);

    // Reset inline sizing styles to defaults and re-center
    winBox.style.width = '';
    winBox.style.height = '';
    winBox.style.maxWidth = '';
    winBox.style.right = '';
    winBox.style.bottom = '';
    winBox.style.left = '';
    winBox.style.top = '';
    winBox.style.borderRadius = '';
    delete winBox.dataset.userMoved;

    if (el !== winBox) {
      el.style.left = '';
      el.style.top = '';
      el.style.width = '';
      el.style.height = '';
    }

    if (window.NoodleInteractionMode && typeof window.NoodleInteractionMode.positionFloatingWindow === 'function') {
      window.NoodleInteractionMode.positionFloatingWindow(el, panelName);
    }

    updateMultitaskingState();
  }

  // --------------------------------------------------------------------------
  // 2. WINDOWS 11 SNAP LAYOUT FLYOUT POPUP
  // --------------------------------------------------------------------------

  function showSnapFlyout(anchorBtn, panelName) {
    if (isMobileViewport()) return; // On mobile, use dynamic island / split sheet instead
    clearTimeout(flyoutCloseTimer);

    let flyout = document.getElementById('noodle-snap-flyout');
    if (!flyout) {
      flyout = document.createElement('div');
      flyout.id = 'noodle-snap-flyout';
      flyout.className = 'fixed z-[200600] p-3 rounded-2xl bg-[#0f0e18]/98 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col gap-2.5 text-gray-200 select-none animate-spring-modal';
      flyout.style.zIndex = '200600';
      document.body.appendChild(flyout);

      flyout.onmouseenter = () => clearTimeout(flyoutCloseTimer);
      flyout.onmouseleave = () => scheduleCloseSnapFlyout(200);
    }

    activeSnapFlyout = { panelName, anchorBtn };

    const isSnapped = snappedWindows.has(panelName);

    flyout.innerHTML = `
      <div class="flex items-center justify-between pb-1.5 border-b border-white/10">
        <span class="text-[11px] font-bold text-gray-200 flex items-center gap-1.5">
          <i data-lucide="layout-grid" class="w-3.5 h-3.5 text-purple-400"></i>
          <span>Fenster-Layout & Multitasking</span>
        </span>
      </div>

      <div class="flex flex-col gap-1.5 w-60 pt-1">
        <div class="grid grid-cols-2 gap-1.5">
          <!-- Links 50% -->
          <button onclick="snapWindow('${panelName}', 'left-50'); hideSnapFlyout();" class="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/50 transition flex items-center justify-between text-left cursor-pointer group">
            <div class="flex items-center gap-1.5">
              <span class="text-xs">◧</span>
              <span class="text-[11px] font-bold text-white group-hover:text-cyan-300">Links 50%</span>
            </div>
          </button>
          <!-- Rechts 50% -->
          <button onclick="snapWindow('${panelName}', 'right-50'); hideSnapFlyout();" class="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-purple-400/50 transition flex items-center justify-between text-left cursor-pointer group">
            <div class="flex items-center gap-1.5">
              <span class="text-xs">◨</span>
              <span class="text-[11px] font-bold text-white group-hover:text-purple-300">Rechts 50%</span>
            </div>
          </button>
        </div>

        <!-- Vollbild / Normalgröße -->
        <button onclick="toggleFullscreen('${panelName}'); hideSnapFlyout();" class="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-purple-400/50 transition flex items-center justify-between text-left cursor-pointer group">
          <div class="flex items-center gap-2">
            <span class="text-sm">□</span>
            <div>
              <div class="text-xs font-bold text-white group-hover:text-purple-300">Maximieren / Vollbild</div>
              <div class="text-[9.5px] text-gray-400">Großes Studio-Fenster umschalten</div>
            </div>
          </div>
          <span class="text-[10px] text-purple-300 font-mono font-bold">MAX</span>
        </button>
      </div>

      ${isSnapped ? `
        <div class="pt-1.5 border-t border-white/10 flex justify-end">
          <button onclick="unsnapWindow('${panelName}'); hideSnapFlyout();" class="text-[10.5px] text-cyan-300 hover:text-white transition cursor-pointer flex items-center gap-1 font-bold">
            <span>↩ Zentriert frei schwebend</span>
          </button>
        </div>
      ` : ''}
    `;

    // Positioning near anchorBtn
    const rect = anchorBtn.getBoundingClientRect();
    let left = rect.left - 100;
    let top = rect.bottom + 8;
    if (left + 280 > window.innerWidth) left = window.innerWidth - 290;
    if (left < 10) left = 10;
    if (top + 200 > window.innerHeight) top = rect.top - 210;

    flyout.style.left = `${left}px`;
    flyout.style.top = `${top}px`;
    flyout.classList.remove('hidden');

    if (typeof renderLucideIcons === 'function') renderLucideIcons();
  }

  function scheduleCloseSnapFlyout(delay = 250) {
    clearTimeout(flyoutCloseTimer);
    flyoutCloseTimer = setTimeout(hideSnapFlyout, delay);
  }

  function hideSnapFlyout() {
    clearTimeout(flyoutCloseTimer);
    const flyout = document.getElementById('noodle-snap-flyout');
    if (flyout) flyout.classList.add('hidden');
    activeSnapFlyout = null;
  }

  // --------------------------------------------------------------------------
  // 3. MOBILE DYNAMIC ISLAND & MULTITASKING STATUS PILL
  // --------------------------------------------------------------------------

  function getActiveMultitaskBackgroundInfo() {
    const tasks = [];

    // 1. Timer Active
    if (typeof state !== 'undefined' && state.timerRunning && state.timerSecondsLeft > 0) {
      const mins = Math.floor(state.timerSecondsLeft / 60);
      const secs = state.timerSecondsLeft % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      const taskName = (typeof activeTimerTask !== 'undefined' && activeTimerTask) ? activeTimerTask.title : 'Fokus';
      tasks.push({
        type: 'timer',
        icon: '⏱️',
        label: `${formatted}`,
        sub: taskName,
        action: () => togglePanel('alarm')
      });
    }

    // 2. Audio Player / Soundscape Active
    if (typeof isAudioPlaying !== 'undefined' && isAudioPlaying) {
      tasks.push({
        type: 'audio',
        icon: '🎧',
        label: 'Soundscape',
        sub: 'Lo-Fi Focus',
        action: () => togglePanel('audio')
      });
    }

    // 3. Cooking Active
    if (typeof getCookingState === 'function') {
      const cooking = getCookingState();
      if (cooking && cooking.activeRecipe) {
        tasks.push({
          type: 'cooking',
          icon: '🍳',
          label: `Schritt ${(cooking.activeStepIndex || 0) + 1}`,
          sub: cooking.activeRecipe.title,
          action: () => togglePanel('cooking')
        });
      }
    }

    return tasks;
  }

  function renderMobileDynamicIsland() {
    let island = document.getElementById('mobile-dynamic-island');
    if (!island && typeof document !== 'undefined' && document.body) {
      island = document.createElement('div');
      island.id = 'mobile-dynamic-island';
      island.className = 'fixed top-3 inset-x-0 mx-auto w-fit max-w-[92vw] z-[200070] pointer-events-auto select-none transition-all duration-300 hidden';
      document.body.appendChild(island);
    }
    if (!island) return;

    const bgTasks = getActiveMultitaskBackgroundInfo();

    // Nur einblenden, wenn tatsächlich ein Hintergrund-Task aktiv ist (Timer läuft, Musik spielt, Rezept aktiv)
    if (!bgTasks || bgTasks.length === 0) {
      island.classList.add('hidden');
      island.innerHTML = '';
      return;
    }

    island.classList.remove('hidden');

    const primary = bgTasks[0];
    island.innerHTML = `
      <div onclick="openMobileMultitaskingSheet()" class="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#12111e]/95 border border-purple-500/40 hover:border-purple-400 shadow-[0_10px_30px_rgba(0,0,0,0.85)] backdrop-blur-2xl cursor-pointer active:scale-95 transition-all duration-200">
        <span class="text-sm animate-pulse">${primary.icon}</span>
        <div class="flex items-center gap-1.5">
          <span class="font-mono font-bold text-xs text-white">${primary.label}</span>
          <span class="text-[10px] text-gray-400 truncate max-w-[110px] hidden sm:inline">• ${escapeHtml(primary.sub)}</span>
        </div>
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
        ${bgTasks.length > 1 ? `<span class="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200">+${bgTasks.length - 1}</span>` : ''}
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 4. MOBILE MULTITASKING BOTTOM-SHEET / APP-SWITCHER
  // --------------------------------------------------------------------------

  function openMobileMultitaskingSheet() {
    let sheet = document.getElementById('modal-mobile-multitasking');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'modal-mobile-multitasking';
      sheet.className = 'fixed inset-0 z-[200085] bg-black/80 backdrop-blur-md flex flex-col justify-end animate-fade-in';
      document.body.appendChild(sheet);
    }

    const bgTasks = getActiveMultitaskBackgroundInfo();
    const openPanels = (typeof activeWindows !== 'undefined') ? Array.from(activeWindows) : [];

    sheet.innerHTML = `
      <div class="w-full max-h-[85vh] bg-[#12111d] border-t border-white/20 rounded-t-3xl p-5 flex flex-col gap-4 text-gray-200 overflow-y-auto custom-scrollbar shadow-2xl animate-spring-modal">
        <!-- Sheet Handle -->
        <div class="w-12 h-1.5 rounded-full bg-white/20 mx-auto -mt-1 shrink-0"></div>

        <!-- Header -->
        <div class="flex items-center justify-between pb-2 border-b border-white/10">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <i data-lucide="layers" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white tracking-tight">Multitasking Center</h3>
              <p class="text-[10px] text-gray-400 font-mono">Mobile App-Switcher & Split-View</p>
            </div>
          </div>
          <button onclick="closeMobileMultitaskingSheet()" class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-gray-300 text-xs">✕</button>
        </div>

        <!-- 1. Live Background Controls (Timer / Sound) -->
        ${bgTasks.length > 0 ? `
          <div class="space-y-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-300">Aktive Hintergrund-Prozesse</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${bgTasks.map(t => `
                <div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2.5">
                    <span class="text-xl">${t.icon}</span>
                    <div>
                      <div class="text-xs font-bold text-white">${t.label}</div>
                      <div class="text-[10px] text-gray-400">${escapeHtml(t.sub)}</div>
                    </div>
                  </div>
                  <button onclick="(${t.action.toString()})(); closeMobileMultitaskingSheet();" class="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-md">Öffnen</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 2. Dual-Screen / Split-View Trigger -->
        <div class="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/30 flex items-center justify-between gap-2">
          <div>
            <div class="text-xs font-bold text-purple-200">⚡ Dual-Split Screen (Oben / Unten)</div>
            <div class="text-[10px] text-gray-400">Board oben + Timer/Einkauf unten parallel nutzen</div>
          </div>
          <button onclick="toggleMobileSplitView('board', 'alarm'); closeMobileMultitaskingSheet();" class="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md whitespace-nowrap cursor-pointer">
            ${mobileSplitActive ? 'Split beenden' : 'Split starten'}
          </button>
        </div>

        <!-- 3. Offene Werkzeuge Carousel -->
        <div class="space-y-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-purple-300">Geöffnete Werkzeuge (${openPanels.length})</span>
          <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            ${openPanels.map(pName => {
              const meta = (typeof getPanelMeta === 'function') ? getPanelMeta(pName) : { icon: '🗗', title: pName };
              return `
                <div onclick="if(typeof bringWindowToFront === 'function') bringWindowToFront('${pName}'); if(typeof restoreWindow === 'function') restoreWindow('${pName}'); closeMobileMultitaskingSheet();" class="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-purple-500/40 transition cursor-pointer flex items-center gap-2">
                  <span class="text-base">${meta.icon}</span>
                  <span class="text-xs font-semibold text-gray-200 truncate">${meta.title}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Footer -->
        <button onclick="closeMobileMultitaskingSheet()" class="w-full py-2.5 rounded-2xl bg-white/10 text-white font-bold text-xs transition cursor-pointer">
          Schließen
        </button>
      </div>
    `;

    sheet.classList.remove('hidden');
    if (typeof renderLucideIcons === 'function') renderLucideIcons();
  }

  function closeMobileMultitaskingSheet() {
    const sheet = document.getElementById('modal-mobile-multitasking');
    if (sheet) sheet.classList.add('hidden');
  }

  // --------------------------------------------------------------------------
  // 5. MOBILE DUAL-SPLIT VIEW (TOP / BOTTOM DUAL PANES)
  // --------------------------------------------------------------------------

  function toggleMobileSplitView(topTool = 'board', bottomTool = 'alarm') {
    mobileSplitActive = !mobileSplitActive;
    const body = document.body;
    if (!body) return;

    body.classList.toggle('noodle-mobile-split-active', mobileSplitActive);

    if (mobileSplitActive) {
      if (typeof openWindow === 'function') openWindow(bottomTool);
      const bottomEl = (typeof getPanelElement === 'function') ? getPanelElement(bottomTool) : document.getElementById(bottomTool);
      if (bottomEl) {
        bottomEl.classList.add('noodle-mobile-split-bottom');
      }
      if (typeof showToast === 'function') showToast('⚡ Dual-Split Screen aktiv: 2 Tools parallel!');
    } else {
      document.querySelectorAll('.noodle-mobile-split-bottom').forEach(el => el.classList.remove('noodle-mobile-split-bottom'));
      if (typeof showToast === 'function') showToast('Dual-Split Screen beendet');
    }

    updateMultitaskingState();
  }

  // --------------------------------------------------------------------------
  // 6. SNAP HOVER HOOKS FOR WINDOW CONTROLS
  // --------------------------------------------------------------------------

  function attachSnapHoverToControls(winControls, panelName) {
    if (!winControls || winControls._snapHoverAttached) return;
    winControls._snapHoverAttached = true;

    const maxBtn = winControls.querySelector('.noodle-win-max-btn');
    if (maxBtn) {
      maxBtn.addEventListener('mouseenter', () => {
        showSnapFlyout(maxBtn, panelName);
      });

      maxBtn.addEventListener('mouseleave', () => {
        scheduleCloseSnapFlyout(300);
      });
    }
  }

  function updateMultitaskingState() {
    renderMobileDynamicIsland();
  }

  // --------------------------------------------------------------------------
  // 7. KEYBOARD SHORTCUTS (ALT+TAB & WIN+ARROWS)
  // --------------------------------------------------------------------------

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      // Alt + Tab / Cmd + K for Mobile Multitasking / App Switcher
      if ((e.altKey && e.key === 'Tab') || (e.ctrlKey && e.key === 'q')) {
        e.preventDefault();
        openMobileMultitaskingSheet();
      }

      // Live Status Updates interval
      setInterval(renderMobileDynamicIsland, 1000);
    });

    // Auto-update observer
    setInterval(renderMobileDynamicIsland, 1500);
  }

  // --------------------------------------------------------------------------
  // GLOBAL EXPORTS
  // --------------------------------------------------------------------------
  global.snapWindow = snapWindow;
  global.unsnapWindow = unsnapWindow;
  global.showSnapFlyout = showSnapFlyout;
  global.hideSnapFlyout = hideSnapFlyout;
  global.openMobileMultitaskingSheet = openMobileMultitaskingSheet;
  global.closeMobileMultitaskingSheet = closeMobileMultitaskingSheet;
  global.toggleMobileSplitView = toggleMobileSplitView;
  global.attachSnapHoverToControls = attachSnapHoverToControls;

})(typeof window !== 'undefined' ? window : globalThis);
