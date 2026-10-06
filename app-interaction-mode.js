/**
 * app-interaction-mode.js
 * High-Tech Interaction Engine: Peek & Pin vs. Click-Only Dual-Modality
 * =====================================================================
 * - Bietet Hover-Vorschau (Peek) & Klick-Fixierung (Pin) ohne Konflikte.
 * - Auto-Erkennung von Touch-Geräten (keine Hover-Fallen auf Tablets/Smartphones).
 * - Manueller Umschalter in Settings: "Peek & Pin" vs. "Nur Klick".
 * - Visuelle Affordance: Interaktive 📌-Badges in allen Panel-Headern & Tooltips.
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
      if (saved === 'click-only' || saved === 'peek-pin') return saved;
    } catch (e) {}
    // Standard: Touch-Geräte starten in 'click-only', Desktop mit Maus in 'peek-pin'
    return isTouchDevice() ? 'click-only' : 'peek-pin';
  }

  let currentMode = getSavedMode();

  function applyModeClasses(mode) {
    if (typeof document === 'undefined' || !document.body) return;
    document.body.classList.toggle('mode-peek-pin', mode === 'peek-pin');
    document.body.classList.toggle('mode-click-only', mode === 'click-only');
    updateSettingsUI(mode);
  }

  function setInteractionMode(mode, showNotification = true) {
    if (mode !== 'click-only' && mode !== 'peek-pin') return;
    currentMode = mode;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {}

    applyModeClasses(mode);

    if (showNotification && typeof showToast === 'function') {
      if (mode === 'peek-pin') {
        const msg = typeof tr === 'function' ? tr({
          de: '📌 Peek & Pin aktiv: Hovern für Vorschau, Klicken zum Fixieren',
          en: '📌 Peek & Pin active: Hover to peek, click to pin'
        }) : '📌 Peek & Pin aktiv: Hovern für Vorschau, Klicken zum Fixieren';
        showToast(msg);
      } else {
        const msg = typeof tr === 'function' ? tr({
          de: '👆 Nur-Klick aktiv: Panels & Menüs öffnen stabil per Klick',
          en: '👆 Click-Only active: Panels & menus open stably via click'
        }) : '👆 Nur-Klick aktiv: Panels & Menüs öffnen stabil per Klick';
        showToast(msg);
      }
    }

    if (typeof triggerHapticFeedback === 'function') {
      triggerHapticFeedback('light');
    }

    // Event für andere Module
    window.dispatchEvent(new CustomEvent('noodle-interaction-mode-changed', { detail: { mode } }));
  }

  function updateSettingsUI(mode) {
    const btnPeek = document.getElementById('btn-mode-peek-pin');
    const btnClick = document.getElementById('btn-mode-click-only');
    const badge = document.getElementById('interaction-mode-badge');

    const activeClasses = 'bg-purple-600 text-white font-bold shadow-md border border-purple-400/40';
    const inactiveClasses = 'bg-white/[0.03] text-gray-400 hover:text-white border border-transparent';

    if (btnPeek) {
      btnPeek.className = `py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${mode === 'peek-pin' ? activeClasses : inactiveClasses}`;
    }
    if (btnClick) {
      btnClick.className = `py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${mode === 'click-only' ? activeClasses : inactiveClasses}`;
    }

    if (badge) {
      if (isTouchDevice() && !localStorage.getItem(STORAGE_KEY)) {
        badge.textContent = 'Auto (Touch)';
      } else {
        badge.textContent = mode === 'peek-pin' ? 'Peek & Pin' : 'Nur Klick';
      }
    }

    // Auch im großen Einstellungs-Modal aktualisieren (falls vorhanden)
    const modalRadioPeek = document.getElementById('modal-radio-mode-peek');
    const modalRadioClick = document.getElementById('modal-radio-mode-click');
    if (modalRadioPeek && modalRadioClick) {
      modalRadioPeek.checked = (mode === 'peek-pin');
      modalRadioClick.checked = (mode === 'click-only');
    }
  }

  function getPanelTitle(panelName) {
    const titles = {
      'header-tools': 'Tools Hub',
      'shopping': 'Einkaufsliste',
      'cooking': 'Koch-Studio',
      'alarm': 'Wecker & Timer',
      'weather': 'Wetter',
      'news': 'News Briefing',
      'radio': 'Radio',
      'audio': 'Sound Center',
      'health': 'Gesundheit',
      'humor-lab': 'Humor Lab',
      'social': 'Community',
      'collab-chat': 'Team Chat',
      'report': 'Statistiken',
      'settings-dropdown': 'Optionen',
      'pause-dropdown': 'Pausen-Hub',
      'calendar-dropdown': 'Kalender',
      'timer-presets': 'Fokus-Cockpit'
    };
    return titles[panelName] || panelName;
  }

  function pinPanel(panelName) {
    const el = document.getElementById(`panel-${panelName}`);
    if (!el) return;

    if (el.classList.contains('hidden')) {
      el.classList.remove('hidden');
      if (typeof adjustPanelPosition === 'function') adjustPanelPosition(el, panelName);
    }

    window.pinnedPanel = panelName;
    window.currentlyOpenPanel = panelName;

    el.classList.remove('noodle-panel-peeking');
    el.classList.add('noodle-panel-pinned');

    decoratePanel(el, panelName);

    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('medium');
    
    // Zarter mechanischer Sound / Burst wenn Pin einrastet
    if (typeof playSoundEffect === 'function') {
      try { playSoundEffect('click'); } catch (e) {}
    }
  }

  function unpinPanel(panelName, andClose = false) {
    const el = document.getElementById(`panel-${panelName}`);
    if (!el) return;

    if (window.pinnedPanel === panelName) {
      window.pinnedPanel = null;
    }

    el.classList.remove('noodle-panel-pinned');

    if (andClose) {
      el.classList.add('hidden');
      el.classList.remove('noodle-panel-peeking');
      if (window.currentlyOpenPanel === panelName) window.currentlyOpenPanel = null;
    } else {
      el.classList.add('noodle-panel-peeking');
    }

    decoratePanel(el, panelName);
  }

  function togglePin(panelName, event) {
    if (event) event.stopPropagation();
    if (window.pinnedPanel === panelName) {
      // Wenn bereits gepinnt: Klick löst und schließt das Panel
      unpinPanel(panelName, true);
    } else {
      // Wenn im Peek-Status: Klick fixiert fest!
      pinPanel(panelName);
    }
  }

  // Findet den besten Container im Panel-Header für den Pin-Button
  function decoratePanel(el, panelName) {
    if (!el) return;

    const isPinned = window.pinnedPanel === panelName;

    // Suche oder erstelle den Pin-Button
    let pinBtn = el.querySelector(`.noodle-pin-badge-btn[data-panel-pin="${panelName}"]`);
    if (!pinBtn) {
      // Suche den Header des Panels (typischerweise ein .flex.items-center.justify-between oder ein Container mit ✕)
      const closeBtn = el.querySelector('button[aria-label*="schließen"], button[aria-label*="close"], button:contains("✕")') ||
                       Array.from(el.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === '✕');
      
      const headerRow = closeBtn ? closeBtn.parentElement : el.querySelector('.flex.items-center.justify-between') || el.firstElementChild;

      if (headerRow) {
        pinBtn = document.createElement('button');
        pinBtn.type = 'button';
        pinBtn.className = 'noodle-pin-badge-btn';
        pinBtn.setAttribute('data-panel-pin', panelName);
        pinBtn.onclick = (e) => togglePin(panelName, e);

        // Vor dem Close-Button einfügen
        if (closeBtn && closeBtn.parentElement === headerRow) {
          headerRow.insertBefore(pinBtn, closeBtn);
        } else {
          headerRow.appendChild(pinBtn);
        }
      }
    }

    if (pinBtn) {
      const pinTitle = isPinned
        ? (typeof tr === 'function' ? tr({ de: 'Fixiert (Klick zum Schließen)', en: 'Pinned (Click to close)' }) : 'Fixiert (Klick zum Schließen)')
        : (typeof tr === 'function' ? tr({ de: 'Klick zum Fixieren 📌', en: 'Click to pin 📌' }) : 'Klick zum Fixieren 📌');
      
      const pinText = isPinned
        ? (typeof tr === 'function' ? tr({ de: 'Fixiert', en: 'Pinned' }) : 'Fixiert')
        : (typeof tr === 'function' ? tr({ de: 'Fixieren', en: 'Pin' }) : 'Fixieren');

      pinBtn.title = pinTitle;
      pinBtn.setAttribute('data-noodle-tooltip', pinTitle);
      pinBtn.innerHTML = `
        <span class="noodle-pin-icon">📌</span>
        <span class="noodle-pin-status-text">${pinText}</span>
      `;
    }

    // Auto-Pin bei erster Klick-Interaktion im Panel:
    // Wenn der Nutzer aktiv in ein peeking Panel klickt (z.B. Tab wechseln, Suche tippen),
    // soll das Panel stabil gepinnt werden, damit es nicht durch versehentliches Maus-Abdriften schließt!
    if (!el._noodleAutoPinAttached) {
      el._noodleAutoPinAttached = true;
      el.addEventListener('pointerdown', (e) => {
        // Nicht auslösen wenn Close-Button geklickt wurde
        const isClose = e.target.closest && (e.target.closest('button[aria-label*="schließen"]') || (e.target.textContent && e.target.textContent.trim() === '✕'));
        if (isClose) return;

        if (window.pinnedPanel !== panelName && !el.classList.contains('hidden')) {
          pinPanel(panelName);
        }
      }, { passive: true });
    }
  }

  // Initialisierung nach DOM-Ready
  function init() {
    applyModeClasses(currentMode);

    // ESC schließt jedes offene Panel und löst Pins
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (window.pinnedPanel || window.currentlyOpenPanel) {
          const active = window.pinnedPanel || window.currentlyOpenPanel;
          const el = document.getElementById(`panel-${active}`);
          if (el) {
            el.classList.add('hidden');
            el.classList.remove('noodle-panel-pinned', 'noodle-panel-peeking');
          }
          window.pinnedPanel = null;
          window.currentlyOpenPanel = null;
        }
      }
    });

    // Touch-Event Listener: Schaltet hybrid-Laptops bei Touch-Nutzung automatisch um
    window.addEventListener('touchstart', function onFirstTouch() {
      if (!localStorage.getItem(STORAGE_KEY)) {
        currentMode = 'click-only';
        applyModeClasses('click-only');
      }
      window.removeEventListener('touchstart', onFirstTouch);
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Öffentliche Schnittstelle
  window.NoodleInteractionMode = {
    getMode: () => currentMode,
    setMode: setInteractionMode,
    isTouchDevice,
    pinPanel,
    unpinPanel,
    togglePin,
    decoratePanel,
    updateSettingsUI
  };

  window.setInteractionMode = setInteractionMode;
  window.togglePinPanel = togglePin;

})();
