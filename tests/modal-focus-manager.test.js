import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Production code dependencies
import '../utils.js';
import '../data-tasks.js';
import '../app-core.js';

describe('UI/UX Schritt 14 – ModalFocusManager', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    if (typeof window.ModalFocusManager !== 'undefined') {
      window.ModalFocusManager.reset();
    }
  });

  // 1. Initialfokus beim Öffnen
  it('1. Initialfokus: Öffnet Modal und setzt Fokus auf bevorzugtes Element oder erstes fokussierbares Element', () => {
    const triggerBtn = document.createElement('button');
    triggerBtn.id = 'trigger-btn';
    document.body.appendChild(triggerBtn);
    triggerBtn.focus();

    const modal = document.createElement('div');
    modal.id = 'test-modal';
    modal.className = 'hidden';
    modal.innerHTML = `
      <button id="modal-btn-1">Erster Button</button>
      <button id="modal-btn-2">Zweiter Button</button>
    `;
    document.body.appendChild(modal);

    // Ohne preferredFocusEl -> erster Button
    window.ModalFocusManager.open(modal);
    expect(modal.classList.contains('hidden')).toBe(false);
    expect(document.activeElement.id).toBe('modal-btn-1');

    window.ModalFocusManager.close(modal);

    // Mit preferredFocusEl -> zweiter Button
    window.ModalFocusManager.open(modal, modal.querySelector('#modal-btn-2'));
    expect(document.activeElement.id).toBe('modal-btn-2');
  });

  // 2. Tab vom letzten zum ersten Element
  it('2. Tab-Falle: Tab auf dem letzten Element springt zum ersten Element', () => {
    const modal = document.createElement('div');
    modal.id = 'tab-modal';
    modal.innerHTML = `
      <button id="btn-first">Erster</button>
      <input id="input-middle" type="text" />
      <button id="btn-last">Letzter</button>
    `;
    document.body.appendChild(modal);

    window.ModalFocusManager.open(modal);
    const lastBtn = modal.querySelector('#btn-last');
    lastBtn.focus();
    expect(document.activeElement.id).toBe('btn-last');

    // Simuliere Tab (ohne Shift)
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    window.ModalFocusManager.handleKeydown(tabEvent);

    expect(tabEvent.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('btn-first');
  });

  // 3. Shift+Tab vom ersten zum letzten Element
  it('3. Shift+Tab: Shift+Tab auf dem ersten Element springt zum letzten Element', () => {
    const modal = document.createElement('div');
    modal.id = 'shift-tab-modal';
    modal.innerHTML = `
      <button id="shift-first">Erster</button>
      <button id="shift-last">Letzter</button>
    `;
    document.body.appendChild(modal);

    window.ModalFocusManager.open(modal);
    const firstBtn = modal.querySelector('#shift-first');
    firstBtn.focus();
    expect(document.activeElement.id).toBe('shift-first');

    // Simuliere Shift+Tab
    const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    window.ModalFocusManager.handleKeydown(shiftTabEvent);

    expect(shiftTabEvent.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('shift-last');
  });

  // 4. Modal mit null bzw. einem fokussierbaren Element
  it('4. Null oder 1 Element: Tab entweicht nicht aus dem Modal', () => {
    // A. Genau 1 Element (z. B. nur Schließen-Button wie bei Keyboard Shortcuts)
    const singleModal = document.createElement('div');
    singleModal.id = 'single-modal';
    singleModal.innerHTML = `<button id="only-close-btn">Schließen</button>`;
    document.body.appendChild(singleModal);

    window.ModalFocusManager.open(singleModal);
    expect(document.activeElement.id).toBe('only-close-btn');

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    window.ModalFocusManager.handleKeydown(tabEvent);
    expect(tabEvent.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('only-close-btn');

    window.ModalFocusManager.close(singleModal);

    // B. Null fokussierbare Elemente -> Container erhält tabindex="-1" und Fokus bleibt dort
    const emptyModal = document.createElement('div');
    emptyModal.id = 'empty-modal';
    emptyModal.innerHTML = `<p>Nur Text, keine Buttons</p>`;
    document.body.appendChild(emptyModal);

    window.ModalFocusManager.open(emptyModal);
    expect(emptyModal.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(emptyModal);

    const emptyTab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    window.ModalFocusManager.handleKeydown(emptyTab);
    expect(emptyTab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(emptyModal);
  });

  // 5. Ausschluss versteckter, deaktivierter und inaktiver Tab-Elemente
  it('5. Ausschluss inaktiver Elemente: .hidden, [hidden], [disabled] und inaktive Tab-Panels werden ignoriert', () => {
    const modal = document.createElement('div');
    modal.id = 'tabs-modal';
    modal.innerHTML = `
      <div class="tabs-header">
        <button id="tab-btn-1">Tab 1</button>
        <button id="tab-btn-2">Tab 2</button>
        <button id="disabled-btn" disabled>Deaktiviert</button>
        <button id="hidden-attr-btn" hidden>Hidden Attr</button>
        <button id="hidden-class-btn" class="hidden">Hidden Class</button>
      </div>
      <div id="pane-1">
        <button id="pane-1-btn">Aktiv Tab Button</button>
      </div>
      <div id="pane-2" class="hidden">
        <button id="pane-2-btn">Inaktiver Tab Button</button>
      </div>
    `;
    document.body.appendChild(modal);

    const focusables = window.ModalFocusManager.getFocusableElements(modal);
    const ids = focusables.map(el => el.id);

    expect(ids).toContain('tab-btn-1');
    expect(ids).toContain('tab-btn-2');
    expect(ids).toContain('pane-1-btn');

    // Dürfen NICHT enthalten sein:
    expect(ids).not.toContain('disabled-btn');
    expect(ids).not.toContain('hidden-attr-btn');
    expect(ids).not.toContain('hidden-class-btn');
    expect(ids).not.toContain('pane-2-btn');
  });

  // 6. Fokuswiederherstellung nach normalem Schließen
  it('6. Fokus-Rückgabe: Nach close() kehrt der Fokus zum auslösenden Element zurück', () => {
    const trigger = document.createElement('button');
    trigger.id = 'main-trigger';
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const modal = document.createElement('div');
    modal.id = 'restore-modal';
    modal.innerHTML = `<button id="m-btn">Inner</button>`;
    document.body.appendChild(modal);

    window.ModalFocusManager.open(modal);
    expect(document.activeElement.id).toBe('m-btn');

    window.ModalFocusManager.close(modal);
    expect(document.activeElement).toBe(trigger);
  });

  // 7. Verschachtelung: Kinddialog schließen → Fokus im Elterndialog; Elterndialog schließen → Auslöser
  it('7. Verschachtelung: Kinddialog (z. B. Confirm) gibt Fokus an Elterndialog (Settings) zurück, Elterndialog an Auslöser', () => {
    const rootTrigger = document.createElement('button');
    rootTrigger.id = 'root-trigger';
    document.body.appendChild(rootTrigger);
    rootTrigger.focus();

    // 1. Elterndialog (z. B. Settings)
    const parentModal = document.createElement('div');
    parentModal.id = 'parent-modal';
    parentModal.innerHTML = `
      <button id="parent-close">Schließen</button>
      <button id="parent-open-child">Öffne Kinddialog</button>
    `;
    document.body.appendChild(parentModal);

    window.ModalFocusManager.open(parentModal);
    const childTrigger = parentModal.querySelector('#parent-open-child');
    childTrigger.focus();
    expect(document.activeElement).toBe(childTrigger);

    // 2. Kinddialog (z. B. Confirm)
    const childModal = document.createElement('div');
    childModal.id = 'child-modal';
    childModal.innerHTML = `
      <button id="child-cancel">Abbrechen</button>
      <button id="child-ok">OK</button>
    `;
    document.body.appendChild(childModal);

    window.ModalFocusManager.open(childModal, childModal.querySelector('#child-ok'));
    expect(document.activeElement.id).toBe('child-ok');
    expect(window.ModalFocusManager.stack.length).toBe(2);

    // Schließe Kinddialog -> Fokus muss zurück auf childTrigger im Elterndialog!
    window.ModalFocusManager.close(childModal);
    expect(document.activeElement).toBe(childTrigger);
    expect(window.ModalFocusManager.stack.length).toBe(1);

    // Schließe Elterndialog -> Fokus muss zurück auf rootTrigger!
    window.ModalFocusManager.close(parentModal);
    expect(document.activeElement).toBe(rootTrigger);
    expect(window.ModalFocusManager.stack.length).toBe(0);
  });

  // 8. Doppelte Öffnung desselben Dialogs überschreibt ursprünglichen Auslöser nicht
  it('8. Doppelte Öffnung: Erneutes open() desselben Dialogs überschreibt ursprünglichen Auslöser nicht', () => {
    const originalTrigger = document.createElement('button');
    originalTrigger.id = 'orig-trigger';
    document.body.appendChild(originalTrigger);
    originalTrigger.focus();

    const modal = document.createElement('div');
    modal.id = 'dup-modal';
    modal.innerHTML = `
      <button id="dup-tab-1">Tab 1</button>
      <button id="dup-tab-2">Tab 2</button>
    `;
    document.body.appendChild(modal);

    window.ModalFocusManager.open(modal, modal.querySelector('#dup-tab-1'));
    expect(document.activeElement.id).toBe('dup-tab-1');

    // Fokus ändert sich im Dialog
    modal.querySelector('#dup-tab-2').focus();
    expect(document.activeElement.id).toBe('dup-tab-2');

    // Erneuter Aufruf von open() (z. B. Tabwechsel oder externer Aufruf)
    window.ModalFocusManager.open(modal, modal.querySelector('#dup-tab-2'));
    expect(window.ModalFocusManager.stack.length).toBe(1);

    // Beim Schließen muss der ursprüngliche Auslöser fokussiert werden, nicht tab-2!
    window.ModalFocusManager.close(modal);
    expect(document.activeElement).toBe(originalTrigger);
  });

  // 9. reset() hinterlässt keinen aktiven Stack-Eintrag und stellt keinen Fokus auf geschlossene Dialoge wieder her
  it('9. reset(): Leert Stack vollständig ohne verwaiste Fokus-Sprünge', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    const modal = document.createElement('div');
    modal.innerHTML = `<button id="btn-in-modal">Btn</button>`;
    document.body.appendChild(modal);

    window.ModalFocusManager.open(modal);
    expect(window.ModalFocusManager.stack.length).toBe(1);

    window.ModalFocusManager.reset();
    expect(window.ModalFocusManager.stack.length).toBe(0);
    expect(window.ModalFocusManager.hasActiveModal()).toBe(false);

    // Escape löst keinen Fehler aus und manipuliert nicht den Stack
    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    window.ModalFocusManager.handleKeydown(escEvent);
    expect(escEvent.defaultPrevented).toBe(false);
  });

  // 10. Nicht-modale Elemente lösen keine Fokusfalle aus
  it('10. Nicht-modale Elemente: Popovers und Dropdowns aktivieren keine Fokusfalle', () => {
    const popover = document.createElement('div');
    popover.id = 'header-sound-volume-popover';
    popover.innerHTML = `<input type="range" id="vol-slider" />`;
    document.body.appendChild(popover);

    // Nicht-modale Elemente werden nicht an ModalFocusManager übergeben
    expect(window.ModalFocusManager.hasActiveModal()).toBe(false);

    // Tab-Events werden nicht abgefangen
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    window.ModalFocusManager.handleKeydown(tabEvent);
    expect(tabEvent.defaultPrevented).toBe(false);
  });

  // Integrationstests für die Pilot-Modale
  describe('Pilot-Modale Integration', () => {
    it('openKeyboardShortcuts / closeKeyboardShortcuts nutzen ModalFocusManager sauber', () => {
      const openBtn = document.createElement('button');
      openBtn.id = 'btn-open-shortcuts';
      document.body.appendChild(openBtn);
      openBtn.focus();

      // Erzeuge das DOM-Element für Shortcuts
      const modal = document.createElement('div');
      modal.id = 'modal-keyboard-shortcuts';
      modal.className = 'hidden';
      modal.innerHTML = `<button data-action="closeKeyboardShortcuts" aria-label="Schließen">X</button>`;
      document.body.appendChild(modal);

      window.openKeyboardShortcuts();
      expect(modal.classList.contains('hidden')).toBe(false);
      expect(window.ModalFocusManager.hasActiveModal()).toBe(true);

      // Schließen
      window.closeKeyboardShortcuts();
      expect(modal.classList.contains('hidden')).toBe(true);
      expect(window.ModalFocusManager.hasActiveModal()).toBe(false);
      expect(document.activeElement).toBe(openBtn);
    });

    it('openSettingsModal / closeSettingsModal nutzen ModalFocusManager sauber', () => {
      const openBtn = document.createElement('button');
      openBtn.id = 'btn-open-settings';
      document.body.appendChild(openBtn);
      openBtn.focus();

      const modal = document.createElement('div');
      modal.id = 'modal-settings';
      modal.className = 'hidden';
      modal.innerHTML = `
        <button id="settings-tab-general">Allgemein</button>
        <button data-action="closeSettingsModal" aria-label="Schließen">X</button>
      `;
      document.body.appendChild(modal);

      window.openSettingsModal('general');
      expect(modal.classList.contains('hidden')).toBe(false);
      expect(window.ModalFocusManager.hasActiveModal()).toBe(true);

      window.closeSettingsModal();
      expect(modal.classList.contains('hidden')).toBe(true);
      expect(window.ModalFocusManager.hasActiveModal()).toBe(false);
      expect(document.activeElement).toBe(openBtn);
    });
  });
});
