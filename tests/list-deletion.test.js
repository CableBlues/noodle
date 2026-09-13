import { describe, it, expect, beforeEach, vi } from 'vitest';

import '../utils.js';
import '../storage.js';
import '../data-translations.js';
import '../data-tasks.js';
import '../state.js';
import '../app-core.js';
import '../app-dice.js';
import '../app-tasks.js';

describe('List and Column Deletion & Clearing Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <main></main>
      <div id="toast-overlay" class="hidden"><div id="toast-card"></div></div>
      <div id="modal-manage-columns" class="hidden"></div>
    `;

    window.speechSynthesis = { cancel: vi.fn(), speak: vi.fn() };
    window.state = window.loadState();
    window.categoriesOrder = window.loadCategoriesOrder();
    window.historyStack = [];
    if (typeof window.renderApp === 'function') window.renderApp();
  });

  it('clears all tasks in a regular column and supports 1-click undo', () => {
    const items = window.getCurrentWorkspaceItems();
    items.todo = [{ task: 'Task 1' }, { task: 'Task 2' }, { task: 'Task 3' }];
    expect(items.todo.length).toBe(3);

    window.clearColumnTasks('todo');
    expect(items.todo.length).toBe(0);

    window.handleUndo();
    const restoredItems = window.getCurrentWorkspaceItems();
    expect(restoredItems.todo.length).toBe(3);
    expect(restoredItems.todo[0].task).toBe('Task 1');
  });

  it('clears the done column correctly and allows undo', () => {
    window.state.done = [{ task: 'Done 1' }, { task: 'Done 2' }];
    expect(window.getCurrentWorkspaceDone().length).toBe(2);

    window.clearColumnTasks('done');
    expect(window.getCurrentWorkspaceDone().length).toBe(0);

    window.handleUndo();
    expect(window.getCurrentWorkspaceDone().length).toBe(2);
  });

  it('archives tasks from a column into state.archive', () => {
    const items = window.getCurrentWorkspaceItems();
    items.daily = [{ task: 'Morning Routine' }, { task: 'Take Vitamins' }];
    window.state.archive = [];

    window.archiveColumnTasks('daily');
    expect(items.daily.length).toBe(0);
    expect(window.state.archive.length).toBe(2);
    expect(window.state.archive[0].task).toBe('Morning Routine');
    expect(window.state.archive[0].origin).toBe('daily');

    window.handleUndo();
    const restored = window.getCurrentWorkspaceItems();
    expect(restored.daily.length).toBe(2);
  });

  it('clears completed tasks within a column and cleans corresponding entries', () => {
    const items = window.getCurrentWorkspaceItems();
    items.todo = [
      { task: 'Open Task 1', completed: false },
      { task: 'Finished Task 2', completed: true },
      { task: 'Open Task 3', completed: false }
    ];

    window.clearCompletedInColumn('todo');
    expect(items.todo.length).toBe(2);
    expect(items.todo.map(t => t.task)).toEqual(['Open Task 1', 'Open Task 3']);

    window.handleUndo();
    const restored = window.getCurrentWorkspaceItems();
    expect(restored.todo.length).toBe(3);
  });

  it('hides and restores columns via column visibility and default reset', () => {
    const initialCount = window.categoriesOrder.length;
    expect(window.categoriesOrder.some(([id]) => id === 'occasionally')).toBe(true);

    window.toggleColumnVisibility('occasionally');
    expect(window.categoriesOrder.some(([id]) => id === 'occasionally')).toBe(false);
    expect(window.categoriesOrder.length).toBe(initialCount - 1);

    window.toggleColumnVisibility('occasionally');
    expect(window.categoriesOrder.some(([id]) => id === 'occasionally')).toBe(true);
    expect(window.categoriesOrder.length).toBe(initialCount);

    window.resetColumnsToDefault();
    expect(window.categoriesOrder.length).toBe(7);
  });

  it('removes a column with deleteColumn and restores it via undo', async () => {
    window.showConfirmDialog = vi.fn().mockResolvedValue(true);
    const items = window.getCurrentWorkspaceItems();
    items.notes = [{ task: 'Secret Note' }];

    const initialLen = window.categoriesOrder.length;
    await window.deleteColumn('notes');

    expect(window.categoriesOrder.some(([id]) => id === 'notes')).toBe(false);
    expect(window.categoriesOrder.length).toBe(initialLen - 1);

    window.handleUndo();
    expect(window.categoriesOrder.some(([id]) => id === 'notes')).toBe(true);
  });

  it('renders decluttered menu on hover, showing Erledigte aufräumen only for done column and no Spalten anpassen in menu', () => {
    window.currentLang = 'de';
    // Open on regular column
    window.openColumnOptionsMenu('todo');
    let dropdown = document.getElementById('column-options-dropdown');
    expect(dropdown).not.toBeNull();
    expect(dropdown.textContent).not.toContain('Erledigte aufräumen');
    expect(dropdown.textContent).not.toContain('Spalten anpassen');
    expect(dropdown.textContent).toContain('Archivieren');
    expect(dropdown.textContent).toContain('Spalte leeren');

    // Close and open on done column
    window.closeColumnOptionsMenu();
    expect(document.getElementById('column-options-dropdown')).toBeNull();

    window.openColumnOptionsMenu('done');
    dropdown = document.getElementById('column-options-dropdown');
    expect(dropdown).not.toBeNull();
    expect(dropdown.textContent).toContain('Erledigte aufräumen');
    expect(dropdown.textContent).toContain('Archivieren');
    expect(dropdown.textContent).not.toContain('Spalten anpassen');
  });

  it('renders column header without top quick add plus button and provides Glückswürfel', () => {
    window.renderApp();
    const todoArticle = document.querySelector('article[data-category="todo"]');
    expect(todoArticle).not.toBeNull();
    expect(todoArticle.innerHTML).not.toContain('quickAddTaskTop');

    const fortuneHtml = window.renderColumnFortuneIconHTML('todo');
    expect(fortuneHtml).toContain('Glückswürfel');
    expect(fortuneHtml).toContain('rollTaskDice');
    expect(fortuneHtml).not.toContain('rollTaskRoulette');
  });

  it('creates a new custom column directly from Spalten anpassen modal via submitAddListFromManager', () => {
    window.openColumnsManagerModal();
    const modal = document.getElementById('modal-manage-columns');
    expect(modal).not.toBeNull();
    expect(modal.classList.contains('hidden')).toBe(false);

    const input = document.getElementById('manage-columns-new-title');
    const select = document.getElementById('manage-columns-new-icon');
    expect(input).not.toBeNull();
    expect(select).not.toBeNull();

    input.value = 'Reiseplanung ✈️';
    select.value = 'sparkles';

    const initialLen = window.categoriesOrder.length;
    window.submitAddListFromManager();

    expect(window.categoriesOrder.length).toBe(initialLen + 1);
    const added = window.categoriesOrder[window.categoriesOrder.length - 1];
    expect(added[1]).toBe('sparkles');
    expect(added[2]).toBe('Reiseplanung ✈️');
    expect(added[3]).toBe(true);

    const curItems = window.getCurrentWorkspaceItems();
    expect(Array.isArray(curItems[added[0]])).toBe(true);

    // Verify it renders on the board
    window.renderApp();
    const customArticle = document.querySelector(`article[data-category="${added[0]}"]`);
    expect(customArticle).not.toBeNull();
  });

  it('renders and operates hover dropdown for Spalten anpassen', () => {
    document.body.innerHTML += `
      <div id="dropdown-manage-columns" class="hidden"></div>
    `;

    window.openColumnsDropdown();
    const dropdown = document.getElementById('dropdown-manage-columns');
    expect(dropdown.classList.contains('hidden')).toBe(false);
    expect(dropdown.innerHTML).toContain('Spalten & Listen verwalten');
    expect(dropdown.innerHTML).toContain('manage-columns-new-title');

    window.closeColumnsDropdown();
    expect(dropdown.classList.contains('hidden')).toBe(true);
  });
});


