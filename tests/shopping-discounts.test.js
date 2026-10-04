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

  it('should add discounter deal to shopping list with store metadata and department', async () => {
    const code = fs.readFileSync(path.join(process.cwd(), 'app-shopping.js'), 'utf8');
    eval(code);

    window.addDealToShoppingList('deal-lidl-01'); // Barista Hafermilch
    expect(state.shoppingList.length).toBe(1);
    expect(state.shoppingList[0].name).toContain('Hafermilch');
    expect(state.shoppingList[0].name).toContain('Lidl');
    expect(state.shoppingList[0].dept).toBe('dairy');
    expect(state.shoppingList[0].dealInfo).toBeDefined();
    expect(state.shoppingList[0].dealInfo.store).toBe('lidl');
    expect(state.shoppingList[0].dealInfo.price).toBe(1.19);
  });
});
