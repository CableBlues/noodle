// tests/undo-history-suite.test.js - Tests for Undo History & Step Selection
import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';

describe('Undo History & Step Selection Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="main-content"></div>
      <button id="btn-board-undo"><span id="undo-count-badge" class="hidden"></span></button>
      <button id="btn-undo-history-trigger"></button>
      <div id="modal-undo-history" class="hidden">
        <div id="undo-history-list"></div>
      </div>
      <div id="toast-overlay" class="hidden">
        <div id="toast-card"></div>
      </div>
    `;

    const stateJs = fs.readFileSync('state.js', 'utf8');
    new Function('window', 'document', 'globalThis', stateJs)(window, document, window);

    window.categoriesOrder = [['daily', 'sun'], ['weekly', 'home'], ['todo', 'list-todo']];
    window.state = {
      version: 3,
      items: { daily: ['Task 1', 'Task 2'], weekly: ['Clean house'], todo: [] },
      done: [],
      activeWorkspace: 'private'
    };
    window.historyStack = [];
  });

  it('records action labels in history snapshots', () => {
    window.saveHistory('Aufgabe erledigt: "Task 1"');
    expect(window.historyStack.length).toBe(1);
    expect(window.historyStack[0]._actionLabel).toBe('Aufgabe erledigt: "Task 1"');
    expect(window.historyStack[0].items.daily).toEqual(['Task 1', 'Task 2']);
  });

  it('shows action in toast when performing handleUndo', () => {
    window.saveHistory('Aufgabe hinzugefügt: "Einkaufen"');
    window.state.items.daily.push('Einkaufen');

    expect(window.historyStack.length).toBe(1);

    window.handleUndo();

    expect(window.historyStack.length).toBe(0);
    expect(window.state.items.daily).toEqual(['Task 1', 'Task 2']);
  });

  it('allows restoring to a specific step in history (handleUndoToStep)', () => {
    // Action 1: Add task A
    window.saveHistory('Aktion 1: Task A hinzugefügt');
    window.state.items.daily.push('Task A');

    // Action 2: Add task B
    window.saveHistory('Aktion 2: Task B hinzugefügt');
    window.state.items.daily.push('Task B');

    // Action 3: Add task C
    window.saveHistory('Aktion 3: Task C hinzugefügt');
    window.state.items.daily.push('Task C');

    expect(window.historyStack.length).toBe(3);

    // Rollback to step index 1 (which holds state before Action 2 was performed)
    window.handleUndoToStep(1);

    expect(window.historyStack.length).toBe(1);
    expect(window.state.items.daily).toEqual(['Task 1', 'Task 2', 'Task A']);
  });

  it('populates undo history modal list with action entries', () => {
    window.saveHistory('Aufgabe erledigt: "Zähne putzen"');
    window.saveHistory('Aufgabe verschoben: "Post"');

    window.openUndoHistoryModal();

    const modal = document.getElementById('modal-undo-history');
    expect(modal.classList.contains('hidden')).toBe(false);

    const list = document.getElementById('undo-history-list');
    expect(list.children.length).toBe(2);
    expect(list.textContent).toContain('Aufgabe verschoben: "Post"');
    expect(list.textContent).toContain('Aufgabe erledigt: "Zähne putzen"');
  });
});
