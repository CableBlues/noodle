import { describe, it, expect, beforeEach } from 'vitest';
import '../utils.js';
import '../storage.js';
import '../data-tasks.js';
import '../state.js';
import '../app-interaction-mode.js';
import '../app-tasks.js';
import '../app-core.js';

describe('Globaler Escape-Taste (PC) Test: ALLE Menüs und Fenster schließen ausnahmslos', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  const triggerEscape = (target = document, key = 'Escape', code = 'Escape') => {
    const escEvent = new KeyboardEvent('keydown', {
      key,
      code,
      bubbles: true,
      cancelable: true
    });
    target.dispatchEvent(escEvent);
  };

  it('1. Schließt alle Multi-Window Tool-Fenster mit Escape', () => {
    const toolWindows = [
      'panel-shopping',
      'panel-cooking',
      'panel-news',
      'panel-audio',
      'panel-radio',
      'panel-health',
      'panel-humor-lab',
      'panel-social',
      'panel-collab-chat',
      'panel-alarm',
      'panel-weather',
      'panel-report'
    ];

    toolWindows.forEach(id => {
      const el = document.createElement('div');
      el.id = id;
      el.className = 'dock-popover-panel noodle-panel-pinned';
      document.body.appendChild(el);
    });

    triggerEscape(document);

    toolWindows.forEach(id => {
      const el = document.getElementById(id);
      expect(el.classList.contains('hidden'), `Tool-Fenster ${id} muss mit Escape geschlossen sein`).toBe(true);
      expect(el.classList.contains('noodle-panel-pinned')).toBe(false);
    });
  });

  it('2. Schließt alle Header- und Subheader-Menüs, Popovers und Dropdowns mit Escape', () => {
    const menus = [
      'panel-header-tools',
      'dropdown-header-workspace',
      'dropdown-mobile-workspace',
      'dropdown-manage-tables',
      'dropdown-manage-columns',
      'popover-add-list',
      'header-sound-volume-popover',
      'ticker-settings-popover',
      'panel-calendar-dropdown',
      'panel-pause-dropdown',
      'panel-timer-presets',
      'panel-settings-dropdown',
      'panel-search',
      'panel-labs-menu',
      'weather-search-results',
      'cmd-palette-results',
      'task-options-menu'
    ];

    menus.forEach(id => {
      const el = document.createElement('div');
      el.id = id;
      el.className = 'visible-menu';
      document.body.appendChild(el);
    });

    triggerEscape(window);

    menus.forEach(id => {
      const el = document.getElementById(id);
      expect(el.classList.contains('hidden'), `Menü/Dropdown ${id} muss mit Escape geschlossen sein`).toBe(true);
    });
  });

  it('3. Schließt alle modalen Haupt- und Helfer-Dialoge mit Escape', () => {
    const modals = [
      'modal-settings',
      'modal-command-palette',
      'modal-keyboard-shortcuts',
      'modal-report-dashboard',
      'report-export-modal',
      'helper-pick-modal',
      'helper-steps-modal',
      'helper-cleaning-modal',
      'helper-sport-modal',
      'helper-break-modal',
      'helper-safespace-modal',
      'clarity-modal',
      'modal-regulation',
      'brainstorm-modal',
      'sample-manager-modal',
      'supermarket-modal',
      'feierabend-celebration-modal',
      'modal-app-install',
      'privacy-legal-modal',
      'modal-undo-history',
      'modal-postpone-termin',
      'modal-template-builder',
      'modal-p2p-sync',
      'modal-learning-hub',
      'note-detail-modal',
      'text-import-modal',
      'onboarding-modal',
      'alarm-trigger-popup',
      'alarm-ring-modal',
      'alarm-active-modal',
      'praise-overlay'
    ];

    modals.forEach(id => {
      const el = document.createElement('div');
      el.id = id;
      el.className = 'modal flex';
      document.body.appendChild(el);
    });

    triggerEscape(document);

    modals.forEach(id => {
      const el = document.getElementById(id);
      expect(el.classList.contains('hidden'), `Modal ${id} muss mit Escape geschlossen sein`).toBe(true);
    });
  });

  it('4. Schließt native <dialog open> Elemente mit Escape', () => {
    const dialog = document.createElement('dialog');
    dialog.id = 'test-native-dialog';
    dialog.open = true;
    dialog.setAttribute('open', '');
    document.body.appendChild(dialog);

    triggerEscape(document);

    expect(dialog.open).toBe(false);
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(dialog.classList.contains('hidden')).toBe(true);
  });

  it('5. Schließt alle mobilen Menüs, Sheets und Drawers mit Escape', () => {
    const mobileElements = [
      'mobile-menu-drawer',
      'mobile-tools-sheet',
      'modal-mobile-lists-sheet',
      'modal-mobile-quick-menu',
      'modal-mobile-quick-add'
    ];

    mobileElements.forEach(id => {
      const el = document.createElement('div');
      el.id = id;
      el.className = 'active-drawer';
      document.body.appendChild(el);
    });

    triggerEscape(document);

    mobileElements.forEach(id => {
      const el = document.getElementById(id);
      expect(el.classList.contains('hidden'), `Mobiles Element ${id} muss mit Escape geschlossen sein`).toBe(true);
    });
  });

  it('6. Schließt Kontextmenüs und dynamische Popover mit Escape', () => {
    const ctx = document.createElement('div');
    ctx.id = 'task-context-dropdown';
    ctx.className = 'context-menu fixed p-2';
    document.body.appendChild(ctx);

    const popover = document.createElement('div');
    popover.className = 'dock-popover-panel noodle-floating-tool-window';
    document.body.appendChild(popover);

    const taskMenu = document.createElement('div');
    taskMenu.className = 'task-options-menu';
    document.body.appendChild(taskMenu);

    expect(ctx.classList.contains('hidden')).toBe(false);
    expect(popover.classList.contains('hidden')).toBe(false);
    expect(taskMenu.classList.contains('hidden')).toBe(false);

    triggerEscape(document);

    expect(ctx.classList.contains('hidden')).toBe(true);
    expect(popover.classList.contains('hidden')).toBe(true);
    expect(taskMenu.classList.contains('hidden')).toBe(true);
  });

  it('7. Funktioniert selbst wenn der Fokus in einem aktiven Input liegt', () => {
    const settingsModal = document.createElement('div');
    settingsModal.id = 'modal-settings';
    document.body.appendChild(settingsModal);

    const input = document.createElement('input');
    input.type = 'text';
    settingsModal.appendChild(input);
    input.focus();

    // Escape im Input auslösen
    triggerEscape(input);

    expect(settingsModal.classList.contains('hidden')).toBe(true);
  });

  it('8. Funktioniert selbst wenn ein inneres Element stopPropagation aufruft', () => {
    const colDropdown = document.createElement('div');
    colDropdown.id = 'dropdown-manage-columns';
    colDropdown.setAttribute('data-action', 'stopPropagation');
    document.body.appendChild(colDropdown);

    const childBtn = document.createElement('button');
    childBtn.addEventListener('keydown', (e) => {
      e.stopPropagation();
    });
    colDropdown.appendChild(childBtn);
    childBtn.focus();

    triggerEscape(childBtn);

    expect(colDropdown.classList.contains('hidden')).toBe(true);
  });

  it('9. Unterstützt alle Tastaturvarianten von Escape (Escape, Esc, e.code)', () => {
    const panel = document.createElement('div');
    panel.id = 'panel-shopping';
    panel.className = 'dock-popover-panel';
    document.body.appendChild(panel);

    // Test mit legacy key "Esc"
    triggerEscape(document, 'Esc', 'Escape');
    expect(panel.classList.contains('hidden')).toBe(true);

    panel.classList.remove('hidden');
    // Test mit code "Escape" bei abweichendem key
    triggerEscape(document, 'CustomKey', 'Escape');
    expect(panel.classList.contains('hidden')).toBe(true);
  });
});
