import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Shopping Discounter Deals & Smart Deal-Radar Suite', () => {
  beforeEach(() => {
    // Setup global browser mocks
    global.window = global;
    global.state = {
      shoppingList: [],
      shoppingHistory: []
    };
    global.currentLang = 'de';
    global.tr = (obj) => (obj && obj.de ? obj.de : (obj && obj.en ? obj.en : ''));
    global.showToast = () => {};
    global.saveHistory = () => {};
    global.saveState = () => {};
    global.renderApp = () => {};
    global.renderLucideIcons = () => {};
  });

  it('should load app-shopping.js and initialize stores & default deals', async () => {
    const code = fs.readFileSync(path.join(process.cwd(), 'app-shopping.js'), 'utf8');
    eval(code);

    expect(window.DISCOUNT_STORES).toBeDefined();
    expect(window.DISCOUNT_STORES.aldi).toBeDefined();
    expect(window.DISCOUNT_STORES.lidl).toBeDefined();
    expect(window.DISCOUNT_STORES.rewe).toBeDefined();
    expect(window.DISCOUNT_STORES.penny).toBeDefined();
    expect(window.DISCOUNT_STORES.kaufland).toBeDefined();
    expect(window.DISCOUNT_STORES.edeka).toBeDefined();
  });

  it('should match grocery items to relevant discounter deals via Deal-Radar', async () => {
    const code = fs.readFileSync(path.join(process.cwd(), 'app-shopping.js'), 'utf8');
    eval(code);

    // Test Milk matching
    const milkDeal = findBestDealForShoppingItem('Milch');
    expect(milkDeal).not.toBeNull();
    expect(milkDeal.deal.name.toLowerCase()).toContain('milch');
    expect(milkDeal.storeInfo).toBeDefined();
    expect(milkDeal.discountPct).toBeGreaterThan(0);

    // Test Butter matching
    const butterDeal = findBestDealForShoppingItem('Markenbutter');
    expect(butterDeal).not.toBeNull();
    expect(butterDeal.deal.name.toLowerCase()).toContain('butter');

    // Test Coffee matching
    const coffeeDeal = findBestDealForShoppingItem('Kaffee');
    expect(coffeeDeal).not.toBeNull();
    expect(coffeeDeal.deal.dept).toBe('drinks');
  });

  it('should manage pantry items, quantities and freshness calculation', async () => {
    const code = fs.readFileSync(path.join(process.cwd(), 'app-shopping.js'), 'utf8');
    eval(code);

    // 1. Add pantry item
    window.handleAddPantryItem('500g Reis', { qty: 1, unit: '500g', dept: 'bakery', expiryDays: 10 });
    expect(state.pantryItems.length).toBe(1);
    expect(state.pantryItems[0].name).toBe('Reis');
    expect(state.pantryItems[0].qty).toBe(1);

    // 2. Freshness check
    const fresh = window.getPantryItemFreshness(state.pantryItems[0]);
    expect(fresh.status).toBe('good');
    expect(fresh.daysLeft).toBeGreaterThanOrEqual(9);

    // 3. Adjust quantity
    window.adjustPantryItemQty(0, 2);
    expect(state.pantryItems[0].qty).toBe(3);

    // 4. Move to shopping list
    window.movePantryItemToShoppingList(0);
    expect(state.shoppingList.length).toBe(1);
    expect(state.shoppingList[0].name).toBe('Reis');

    // 5. Delete from pantry
    window.handleDeletePantryItem(0);
    expect(state.pantryItems.length).toBe(0);
  });

  it('should calculate estimated shopping total and format list for share', async () => {
    const code = fs.readFileSync(path.join(process.cwd(), 'app-shopping.js'), 'utf8');
    eval(code);

    window.addDealToShoppingList('deal-aldi-01'); // Bio Vollmilch 1.09€
    window.addDealToShoppingList('deal-aldi-02'); // Butter 1.39€

    const total = window.calculateShoppingListTotal();
    expect(total.hasPrices).toBe(true);
    expect(total.totalNum).toBeCloseTo(2.48, 2);

    const shareText = window.formatShoppingListForShare();
    expect(shareText).toContain('Noodle Einkaufszettel');
    expect(shareText).toContain('Kühlregal');
    expect(shareText).toContain('Bio Vollmilch');
  });

  it('should import recipe ingredients directly to shopping list', async () => {
    const code = fs.readFileSync(path.join(process.cwd(), 'app-shopping.js'), 'utf8');
    eval(code);

    const ingredients = ['400g Spaghetti', '200g Guanciale', '4 Eier', '100g Pecorino'];
    window.importRecipeIngredientsToShoppingList('Carbonara', ingredients);

    expect(state.shoppingList.length).toBe(4);
    expect(state.shoppingList.some(item => item.name.includes('Spaghetti'))).toBe(true);
    expect(state.shoppingList.some(item => item.name.includes('Eier'))).toBe(true);
  });
});

