import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Cooking Hub & Smart Recipe Assistant Suite', () => {
  beforeEach(() => {
    // Reset DOM & Globals
    document.body.innerHTML = `
      <div id="panel-cooking" class="dock-popover-panel"></div>
    `;

    global.state = {
      pantryItems: [],
      shoppingList: [],
      cooking: {
        pantryItems: [],
        recipes: [],
        activeRecipeId: null,
        activeRecipe: null,
        activeStepIndex: 0,
        servingsMultiplier: 1,
        filterCategory: 'all',
        searchQuery: ''
      }
    };

    global.saveState = vi.fn();
    global.escapeHtml = (s) => String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    global.t = (key) => key;
    global.renderLucideIcons = vi.fn();
    global.playProceduralSound = vi.fn();
    global.showFloatingToast = vi.fn();
    global.importRecipeIngredientsToShoppingList = vi.fn((items, title) => items.length);

    // Load app-cooking.js
    const code = fs.readFileSync(path.join(process.cwd(), 'app-cooking.js'), 'utf8');
    eval(code);
  });

  it('should scale ingredient quantities accurately with serving multiplier', () => {
    // Integer scaling
    expect(scaleIngredientText('250g Pasta', 2)).toBe('500g Pasta');
    expect(scaleIngredientText('2 Zehen Knoblauch', 3)).toBe('6 Zehen Knoblauch');
    
    // Decimals and fractions
    expect(scaleIngredientText('1/2 Zitrone', 2)).toBe('1 Zitrone');
    expect(scaleIngredientText('1 Dose Tomaten', 0.5)).toBe('½ Dose Tomaten');
    expect(scaleIngredientText('400ml Kokosmilch', 1.5)).toBe('600ml Kokosmilch');
  });

  it('should manage curated catalog, custom recipes and deletion', () => {
    const cooking = getCookingState();
    expect(cooking.recipes.length).toBeGreaterThanOrEqual(6);

    // Add custom recipe
    document.body.innerHTML += `
      <input id="new-recipe-title" value="Vegane Burrito Bowl" />
      <input id="new-recipe-duration" value="15 Min" />
      <select id="new-recipe-category"><option value="vegan" selected>Vegan</option></select>
      <textarea id="new-recipe-ingredients">150g Reis&#10;1 Dose Schwarze Bohnen&#10;1 Avocado</textarea>
      <textarea id="new-recipe-steps">Reis kochen.&#10;Bohnen erwärmen.&#10;Avocado schneiden und anrichten.</textarea>
    `;

    saveCustomRecipeFromForm();
    expect(cooking.recipes[0].title).toBe('Vegane Burrito Bowl');
    expect(cooking.activeRecipe.title).toBe('Vegane Burrito Bowl');
    expect(cooking.recipes[0].ingredients.length).toBe(3);
    expect(cooking.recipes[0].steps.length).toBe(3);

    // Delete custom recipe
    const customId = cooking.recipes[0].id;
    global.confirm = () => true;
    deleteCustomRecipe(customId);
    expect(cooking.recipes.some(r => r.id === customId)).toBe(false);
  });

  it('should calculate pantry match percentages and handle dynamic skillet generation', () => {
    addCookingIngredient('Pasta');
    addCookingIngredient('Tomaten');
    addCookingIngredient('Knoblauch');

    const cooking = getCookingState();
    expect(cooking.pantryItems.length).toBe(3);

    const pastaRecipe = cooking.recipes.find(r => r.id === 'pasta-tomate');
    expect(pastaRecipe).toBeDefined();

    const match = calculateRecipeMatch(pastaRecipe, cooking.pantryItems);
    expect(match.percent).toBeGreaterThanOrEqual(30);
    expect(match.matched.length).toBeGreaterThanOrEqual(2);

    // Smart suggest
    const suggested = suggestCookingRecipe();
    expect(suggested).toBeDefined();
    expect(suggested.title).toContain('Pasta');
  });

  it('should handle step-by-step navigation and audio timer triggers', () => {
    selectActiveRecipe('pasta-tomate');
    const cooking = getCookingState();
    expect(cooking.activeRecipe).not.toBeNull();
    expect(cooking.activeStepIndex).toBe(0);

    // Step navigation
    nextCookingStep();
    expect(cooking.activeStepIndex).toBe(1);
    prevCookingStep();
    expect(cooking.activeStepIndex).toBe(0);

    // Timer minute extraction
    const textWithTime = "Lasse die Sauce ca. 5 Minuten leicht einkochen.";
    expect(extractMinutesFromText(textWithTime)).toBe(5);
  });

  it('should export scaled ingredients to shopping list', () => {
    selectActiveRecipe('wrap-huhn');
    changeServingsMultiplier(1); // multiplier = 2
    addRecipeMissingIngredientsToShopping();

    expect(global.importRecipeIngredientsToShoppingList).toHaveBeenCalled();
  });
});
