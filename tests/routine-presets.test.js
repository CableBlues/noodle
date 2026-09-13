// tests/routine-presets.test.js - Unit Tests for Routine Presets, Custom Defaults & Suggestions
import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';

describe('Routine Presets & Custom Defaults Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="main-content"></div>
      <div id="modal-routine-presets" class="hidden"></div>
      <div id="toast" class="hidden"><span id="toast-message"></span></div>
    `;

    // Load data and modules into window
    const dataTasks = fs.readFileSync('data-tasks.js', 'utf8');
    const stateJs = fs.readFileSync('state.js', 'utf8');
    const presetsJs = fs.readFileSync('app-routine-presets.js', 'utf8');

    new Function('window', 'document', 'globalThis', dataTasks)(window, document, window);
    new Function('window', 'document', 'globalThis', stateJs)(window, document, window);
    new Function('window', 'document', 'globalThis', presetsJs)(window, document, window);

    window.state = window.migrateState(null, 'de');
  });

  it('provides comprehensive ROUTINE_PRESETS and TASK_SUGGESTIONS_CATALOG', () => {
    expect(window.ROUTINE_PRESETS).toBeDefined();
    expect(Array.isArray(window.ROUTINE_PRESETS)).toBe(true);
    expect(window.ROUTINE_PRESETS.length).toBeGreaterThanOrEqual(4);

    const presetIds = window.ROUTINE_PRESETS.map(p => p.id);
    expect(presetIds).toContain('balance');
    expect(presetIds).toContain('minimalist');
    expect(presetIds).toContain('adhd_focus');
    expect(presetIds).toContain('productivity_deepwork');

    expect(window.TASK_SUGGESTIONS_CATALOG).toBeDefined();
    expect(window.TASK_SUGGESTIONS_CATALOG.morning).toBeDefined();
    expect(window.TASK_SUGGESTIONS_CATALOG.household).toBeDefined();
    expect(window.TASK_SUGGESTIONS_CATALOG.focus).toBeDefined();
  });

  it('persists and retrieves user custom defaults in localStorage', () => {
    expect(window.getCustomDefaults()).toBeNull();

    const custom = {
      daily: ['Mein Morgen-Kaffee', 'Fokus-Sprint', 'Abend-Spaziergang'],
      weekly: ['Bad putzen', 'Wäsche'],
      occasionally: ['Pflanzen umtopfen']
    };

    window.saveCustomDefaults(custom);
    const loaded = window.getCustomDefaults();
    expect(loaded).toBeDefined();
    expect(loaded.daily).toEqual(['Mein Morgen-Kaffee', 'Fokus-Sprint', 'Abend-Spaziergang']);

    // Reload daily tasks uses user custom defaults
    window.reloadDailyTasks();
    expect(window.state.items.daily).toEqual(['Mein Morgen-Kaffee', 'Fokus-Sprint', 'Abend-Spaziergang']);

    // Resetting defaults clears custom defaults and restores official ones
    window.resetUserDefaultsToOfficial();
    expect(window.getCustomDefaults()).toBeNull();

    window.reloadDailyTasks();
    expect(window.state.items.daily.length).toBeGreaterThan(0);
    expect(window.state.items.daily).toContain('Zähne morgens');
  });

  it('applies routine presets directly and updates board state', () => {
    window.applyRoutinePreset('minimalist', true);
    expect(window.state.items.daily).toEqual(['Zähne morgens', 'Bett machen', 'Wichtigste Aufgabe (Fokus)', 'Zähne abends']);
    expect(window.state.items.weekly).toEqual(['Staubsaugen', 'Geschirr spülen', 'Wäsche waschen', 'Müll wegbringen']);

    const custom = window.getCustomDefaults();
    expect(custom).toBeDefined();
    expect(custom.presetId).toBe('minimalist');
  });

  it('inserts suggestion tasks directly into active board categories', () => {
    const initialDailyCount = window.state.items.daily.length;
    window.insertSuggestionTaskDirect('Großes Glas Wasser trinken', 'daily');
    expect(window.state.items.daily.length).toBe(initialDailyCount + 1);
    expect(window.state.items.daily).toContain('Großes Glas Wasser trinken');
  });
});
