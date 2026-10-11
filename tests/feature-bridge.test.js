import { describe, it, expect, beforeEach, vi } from 'vitest';

// Load config, storage, state, translations, and feature bridge
import '../config.js';
import '../storage.js';
import '../state.js';
import '../data-translations.js';
import '../app-feature-bridge.js';

describe('Feature Bridge & Cross-Tool Interlinking', () => {
  beforeEach(() => {
    globalThis.state = {
      workspace: 'personal',
      items: {
        personal: {
          daily: [],
          todo: [],
          weekly: []
        }
      },
      done: {
        personal: []
      },
      cooking: {
        recipes: [
          {
            id: 'pasta-tomate',
            title: 'Schnelle Tomaten-Pasta',
            duration: '15 Min',
            ingredients: ['250g Pasta', '400g Tomaten', '2 Zehen Knoblauch']
          }
        ],
        pantryItems: ['250g Pasta']
      },
      shoppingList: []
    };

    globalThis.getCurrentWorkspaceItems = () => globalThis.state.items.personal;
    globalThis.showToast = vi.fn();
    globalThis.saveState = vi.fn();
    globalThis.saveHistory = vi.fn();
    globalThis.renderApp = vi.fn();
  });

  it('detects explicit and inline tool links from task text and objects', () => {
    // 1. Inline @timer
    const timerTask = { task: 'Code Review machen @timer 25m' };
    const timerLinks = globalThis.getTaskToolLinks(timerTask);
    expect(timerLinks.some(l => l.type === 'timer')).toBe(true);

    // 2. Inline @rezept
    const recipeTask = { task: 'Abendessen kochen @rezept:pasta-tomate' };
    const recipeLinks = globalThis.getTaskToolLinks(recipeTask);
    expect(recipeLinks.some(l => l.type === 'recipe')).toBe(true);

    // 3. Inline @sound
    const soundTask = { task: 'Fokus Arbeit @sound:rain' };
    const soundLinks = globalThis.getTaskToolLinks(soundTask);
    expect(soundLinks.some(l => l.type === 'sound')).toBe(true);

    // 4. Inline @einkauf
    const shopTask = { task: 'Supermarkt @einkauf' };
    const shopLinks = globalThis.getTaskToolLinks(shopTask);
    expect(shopLinks.some(l => l.type === 'shopping')).toBe(true);

    // 5. Inline @clarity
    const clarityTask = { task: 'Große Aufgabe anfangen @clarity' };
    const clarityLinks = globalThis.getTaskToolLinks(clarityTask);
    expect(clarityLinks.some(l => l.type === 'clarity')).toBe(true);

    // 6. Explicit toolLinks
    const explicitTask = {
      task: 'Projekt Dokumentation',
      toolLinks: {
        timer: { minutes: 50, label: '50m Deep Work' },
        flashcards: { deckId: 'adhd_neuro' }
      }
    };
    const explicitLinks = globalThis.getTaskToolLinks(explicitTask);
    expect(explicitLinks.find(l => l.type === 'timer')?.label).toBe('50m Deep Work');
    expect(explicitLinks.some(l => l.type === 'flashcards')).toBe(true);
  });

  it('generates HTML for interactive action pills on task card', () => {
    const taskObj = {
      task: 'Präsentation vorbereiten',
      toolLinks: {
        timer: { minutes: 25, label: '25m Pomodoro' }
      }
    };
    const html = globalThis.renderTaskToolBadgesHTML(taskObj, 'daily', 0);
    expect(html).toContain('executeToolLink');
    expect(html).toContain('25m Pomodoro');
  });

  it('bridges recipes to shopping list and board tasks', () => {
    // Add recipe ingredients to shopping list
    globalThis.handleAddShoppingItem = (name) => {
      globalThis.state.shoppingList.push({ name });
    };

    globalThis.bridgeRecipeToShopping('pasta-tomate');
    expect(globalThis.state.shoppingList.length).toBe(3);
    expect(globalThis.state.shoppingList.map(s => s.name)).toContain('250g Pasta');

    // Create board task from recipe
    globalThis.bridgeRecipeToBoardTask('pasta-tomate', 'daily');
    const dailyItems = globalThis.state.items.personal.daily;
    expect(dailyItems.length).toBe(1);
    expect(dailyItems[0].task).toContain('Schnelle Tomaten-Pasta');
    expect(dailyItems[0].toolLinks.recipe.id).toBe('pasta-tomate');
    expect(dailyItems[0].toolLinks.timer.minutes).toBe(15);
  });

  it('bridges OCR scanned text to board tasks and shopping list', () => {
    const ocrText = `- Milch kaufen\n- Butter 250g\n- Eier 10er Pack`;
    
    // OCR to Tasks
    globalThis.bridgeOcrToBoardTasks(ocrText, 'todo');
    const todoItems = globalThis.state.items.personal.todo;
    expect(todoItems.length).toBe(3);
    expect(todoItems[0].task).toBe('Milch kaufen');
    expect(todoItems[0].toolLinks.ocr).toBeDefined();

    // OCR to Shopping
    globalThis.state.shoppingList = [];
    globalThis.handleAddShoppingItem = (name) => {
      globalThis.state.shoppingList.push({ name });
    };
    globalThis.bridgeOcrToShopping(ocrText);
    expect(globalThis.state.shoppingList.length).toBe(3);
  });

  it('bridges clarity / breathing to micro-focus timer start', () => {
    globalThis.state.items.personal.daily.push({ task: 'Dringenden Bericht schreiben' });
    
    globalThis.linkTaskToTimer = vi.fn();
    globalThis.setCustomTimerMinutes = vi.fn();
    globalThis.startTimer = vi.fn();
    globalThis.playPresetSound = vi.fn();

    globalThis.startClarityMicroFocus(10);

    expect(globalThis.linkTaskToTimer).toHaveBeenCalledWith('Dringenden Bericht schreiben', 'daily', 0);
    expect(globalThis.setCustomTimerMinutes).toHaveBeenCalledWith(10);
    expect(globalThis.startTimer).toHaveBeenCalled();
  });
});
