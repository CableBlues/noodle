import { describe, it, expect, beforeEach, vi } from 'vitest';

// Load prerequisites
import '../config.js';
import '../storage.js';
import '../state.js';
import '../data-translations.js';
import '../app-multitasking-hub.js';

describe('Multitasking & Snap-Layout Hub', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="main-content"></div>
      <div id="panel-alarm" class="hidden">
        <div class="flex items-center justify-between">
          <span>Wecker & Timer</span>
          <div class="noodle-win-controls" data-panel-controls="alarm">
            <button class="noodle-win-max-btn">⛶</button>
          </div>
        </div>
      </div>
      <div id="panel-cooking" class="hidden">
        <div class="flex items-center justify-between">
          <span>Koch-Studio</span>
        </div>
      </div>
    `;

    globalThis.showToast = vi.fn();
    globalThis.triggerHapticFeedback = vi.fn();
    globalThis.bringWindowToFront = vi.fn();
  });

  it('snaps window to 50:50 split layout and applies positioning styles', () => {
    const el = document.getElementById('panel-alarm');
    globalThis.snapWindow('panel-alarm', 'left-50');

    expect(el.classList.contains('noodle-panel-snapped')).toBe(true);
    expect(el.getAttribute('data-snap-layout')).toBe('left-50');
    expect(el.style.left).toBe('8px');
    expect(el.style.width).toBe('calc(50vw - 12px)');
  });

  it('unsnaps window cleanly back to default flow', () => {
    const el = document.getElementById('panel-alarm');
    globalThis.snapWindow('panel-alarm', 'right-50');
    expect(el.classList.contains('noodle-panel-snapped')).toBe(true);

    globalThis.unsnapWindow('panel-alarm');
    expect(el.classList.contains('noodle-panel-snapped')).toBe(false);
    expect(el.getAttribute('data-snap-layout')).toBeNull();
    expect(el.style.left).toBe('');
  });

  it('opens and closes the Mobile Multitasking Bottom-Sheet', () => {
    globalThis.openMobileMultitaskingSheet();
    const sheet = document.getElementById('modal-mobile-multitasking');
    expect(sheet).toBeDefined();
    expect(sheet.classList.contains('hidden')).toBe(false);

    globalThis.closeMobileMultitaskingSheet();
    expect(sheet.classList.contains('hidden')).toBe(true);
  });

  it('toggles mobile dual-screen split view mode', () => {
    globalThis.toggleMobileSplitView('board', 'alarm');
    expect(document.body.classList.contains('noodle-mobile-split-active')).toBe(true);

    globalThis.toggleMobileSplitView('board', 'alarm');
    expect(document.body.classList.contains('noodle-mobile-split-active')).toBe(false);
  });
});
