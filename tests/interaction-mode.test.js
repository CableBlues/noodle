import { describe, it, expect, beforeEach } from 'vitest';
import '../app-interaction-mode.js';

describe('Interaction Mode: Peek & Pin vs. Click-Only Dual Modality', () => {
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
    window.pinnedPanel = null;
    window.currentlyOpenPanel = null;
    window.NoodleInteractionMode.setMode('peek-pin', false);
  });

  it('initializes in peek-pin mode by default on desktop', () => {
    expect(window.NoodleInteractionMode).toBeDefined();
    expect(window.NoodleInteractionMode.getMode()).toBe('peek-pin');
    expect(document.body.classList.contains('mode-peek-pin')).toBe(true);
  });

  it('switches to click-only mode and persists in localStorage', () => {
    window.NoodleInteractionMode.setMode('click-only', false);

    expect(window.NoodleInteractionMode.getMode()).toBe('click-only');
    expect(localStorage.getItem('noodle_interaction_mode')).toBe('click-only');
    expect(document.body.classList.contains('mode-click-only')).toBe(true);
    expect(document.body.classList.contains('mode-peek-pin')).toBe(false);
  });

  it('pins and unpins panel correctly with visual feedback', () => {
    const panel = document.getElementById('panel-shopping');

    window.NoodleInteractionMode.pinPanel('shopping');
    expect(window.pinnedPanel).toBe('shopping');
    expect(panel.classList.contains('hidden')).toBe(false);
    expect(panel.classList.contains('noodle-panel-pinned')).toBe(true);

    // Decorate panel added pin button
    const pinBtn = panel.querySelector('.noodle-pin-badge-btn');
    expect(pinBtn).not.toBeNull();
    expect(pinBtn.textContent).toContain('Fixiert');

    // Unpin closes panel
    window.NoodleInteractionMode.unpinPanel('shopping', true);
    expect(window.pinnedPanel).toBeNull();
    expect(panel.classList.contains('hidden')).toBe(true);
  });

  it('togglePin promotes peeking panel to pinned state', () => {
    const panel = document.getElementById('panel-alarm');
    panel.classList.remove('hidden');
    panel.classList.add('noodle-panel-peeking');
    window.pinnedPanel = null;

    window.NoodleInteractionMode.togglePin('alarm');
    expect(window.pinnedPanel).toBe('alarm');
    expect(panel.classList.contains('noodle-panel-pinned')).toBe(true);
    expect(panel.classList.contains('noodle-panel-peeking')).toBe(false);
  });
});
