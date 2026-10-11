import { describe, it, expect, beforeEach } from 'vitest';
import '../app-interaction-mode.js';

describe('Multi-Window Studio & Window Management Controls', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
    document.body.innerHTML = `
      <div id="panel-settings-dropdown" class="hidden">
        <button id="btn-mode-peek-pin"></button>
        <button id="btn-mode-click-only"></button>
        <span id="interaction-mode-badge"></span>
      </div>
      <div id="panel-shopping" class="hidden">
        <div class="flex items-center justify-between">
          <span>Shopping Header</span>
          <button aria-label="Einkaufsliste schließen">✕</button>
        </div>
      </div>
      <div id="panel-alarm" class="hidden">
        <div class="flex items-center justify-between">
          <span>Alarm Header</span>
          <button aria-label="Wecker-Hub schließen">✕</button>
        </div>
      </div>
    `;
    window.NoodleInteractionMode.setMode('multi-window', false);
  });

  it('initializes in multi-window mode by default', () => {
    expect(window.NoodleInteractionMode).toBeDefined();
    expect(window.NoodleInteractionMode.getMode()).toBe('multi-window');
  });

  it('decorates panel with 3 window controls [—], [⛶], [✕]', () => {
    const panel = document.getElementById('panel-shopping');
    window.NoodleInteractionMode.openWindow('shopping');

    const winControls = panel.querySelector('.noodle-win-controls');
    expect(winControls).not.toBeNull();

    const minBtn = winControls.querySelector('.noodle-win-min-btn');
    const maxBtn = winControls.querySelector('.noodle-win-max-btn');
    const closeBtn = winControls.querySelector('.noodle-win-close-btn');

    expect(minBtn).not.toBeNull();
    expect(maxBtn).not.toBeNull();
    expect(closeBtn).not.toBeNull();
  });

  it('minimizes window to live pill and restores on click', () => {
    const panel = document.getElementById('panel-shopping');
    window.NoodleInteractionMode.openWindow('shopping');
    expect(panel.classList.contains('hidden')).toBe(false);

    // Minimize window
    window.NoodleInteractionMode.minimizeWindow('shopping');
    expect(panel.classList.contains('hidden')).toBe(true);

    const dock = document.getElementById('noodle-minimized-dock');
    expect(dock).not.toBeNull();
    const pill = dock.querySelector('[data-min-panel="shopping"]');
    expect(pill).not.toBeNull();

    // Restore window
    window.NoodleInteractionMode.restoreWindow('shopping');
    expect(panel.classList.contains('hidden')).toBe(false);
    expect(dock.querySelector('[data-min-panel="shopping"]')).toBeNull();
  });

  it('supports multiple windows open in parallel', () => {
    const shopPanel = document.getElementById('panel-shopping');
    const alarmPanel = document.getElementById('panel-alarm');

    window.NoodleInteractionMode.openWindow('shopping');
    window.NoodleInteractionMode.openWindow('alarm');

    expect(shopPanel.classList.contains('hidden')).toBe(false);
    expect(alarmPanel.classList.contains('hidden')).toBe(false);

    // Maximize one without closing the other
    window.NoodleInteractionMode.toggleFullscreen('shopping');
    expect(shopPanel.classList.contains('noodle-panel-fullscreen')).toBe(true);
    expect(alarmPanel.classList.contains('hidden')).toBe(false);
  });
});
