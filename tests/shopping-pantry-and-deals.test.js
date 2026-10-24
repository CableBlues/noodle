/**
 * @file tests/shopping-pantry-and-deals.test.js
 * @description
 * Tests für die Einkaufslisten-, Vorratskammer- und Deal-Radar-Engine (app-shopping.js).
 * Testet automatische Abteilungserkennung, Mengenerfassung, Mehrfacheingabe,
 * Deal-Matching, Vorratsverwaltung mit Haltbarkeitsberechnung und Resilienz gegen fehlerhafte Werte.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Einkaufslisten, Deal-Radar und Vorratskammer (app-shopping.js)', () => {
  beforeEach(async () => {
    localStorage.clear();

    // DOM vorbereiten
    document.body.innerHTML = `
      <div id="shopping-pane-list"></div>
      <div id="shopping-pane-deals"></div>
      <div id="shopping-pane-pantry"></div>
      <div id="shopping-list-rows"></div>
      <div id="shop-badge-count" class="hidden"></div>
      <div id="supermarket-content"></div>
      <div id="supermarket-progress-bar"></div>
      <div id="supermarket-progress-text"></div>
      <div id="pantry-items-container"></div>
      <input id="shop-add-name" />
      <input id="pantry-add-input" />
    `;

    // Globaler State für Noodle
    window.state = {
      shoppingList: [],
      shoppingHistory: [],
      pantryItems: [],
      activeWorkspace: 'private',
      historyStack: []
    };

    // Globale Hilfsfunktionen mocken
    window.saveState = vi.fn(() => {
      localStorage.setItem('noodle_state', JSON.stringify(window.state));
    });
    window.renderApp = vi.fn();
    window.showToast = vi.fn();
    window.saveHistory = vi.fn();
    window.tr = (obj) => (typeof obj === 'object' && obj !== null ? obj.de || Object.values(obj)[0] : String(obj));

    // Module importieren
    await import('../app-shopping.js');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Automatische Abteilungserkennung (getDepartmentForItem)', () => {
    it('erkennt Obst und Gemüse zuverlässig', () => {
      expect(window.getDepartmentForItem('Frische Bio-Bananen')).toBe('produce');
      expect(window.getDepartmentForItem('Äpfel Elstar')).toBe('produce');
      expect(window.getDepartmentForItem('Tomaten')).toBe('produce');
    });

    it('erkennt Kühlregal- und Milchprodukte', () => {
      expect(window.getDepartmentForItem('Vollmilch 3.5%')).toBe('dairy');
      expect(window.getDepartmentForItem('Butter')).toBe('dairy');
      expect(window.getDepartmentForItem('Gouda gerieben')).toBe('dairy');
    });

    it('erkennt Drogerie- und Hygieneartikel', () => {
      expect(window.getDepartmentForItem('Zahnpasta')).toBe('household');
      expect(window.getDepartmentForItem('Shampoo')).toBe('household');
      expect(window.getDepartmentForItem('Toilettenpapier 3-lagig')).toBe('household');
    });

    it('fällt bei unbekannten Begriffen auf other zurück', () => {
      expect(window.getDepartmentForItem('XYZ Unbekanntes Ding')).toBe('other');
      expect(window.getDepartmentForItem('')).toBe('other');
      expect(window.getDepartmentForItem(null)).toBe('other');
    });
  });

  describe('2. Einkaufsartikel hinzufügen (handleAddShoppingItem)', () => {
    it('fügt einen einzelnen Artikel mit Standardmenge 1 hinzu', () => {
      window.handleAddShoppingItem('Hafermilch');

      expect(window.state.shoppingList.length).toBe(1);
      const item = window.state.shoppingList[0];
      expect(item.name).toBe('Hafermilch');
      expect(item.qty).toBe(1);
      expect(item.dept).toBe('dairy');
      expect(window.saveState).toHaveBeenCalled();
    });

    it('parst Mengenangaben und Einheiten aus dem Text', () => {
      window.handleAddShoppingItem('2 kg Kartoffeln');
      window.handleAddShoppingItem('3x Schokolade');

      expect(window.state.shoppingList.length).toBe(2);

      const kartoffeln = window.state.shoppingList.find(i => i.name === 'Kartoffeln');
      expect(kartoffeln).toBeDefined();
      expect(kartoffeln.qty).toBe(2);
      expect(kartoffeln.unit.toLowerCase()).toBe('kg');

      const schoko = window.state.shoppingList.find(i => i.name === 'Schokolade');
      expect(schoko).toBeDefined();
      expect(schoko.qty).toBe(3);
    });

    it('addiert Menge bei mehrfachem Hinzufügen des gleichen Artikels', () => {
      window.handleAddShoppingItem('Kaffee');
      window.handleAddShoppingItem('2x Kaffee');

      expect(window.state.shoppingList.length).toBe(1);
      expect(window.state.shoppingList[0].qty).toBe(3);
    });

    it('unterstützt kommagetrennte Mehrfacheingaben in einem Rutsch', () => {
      window.handleAddShoppingItem('Brot, Eier, 1 l Orangensaft');

      expect(window.state.shoppingList.length).toBe(3);
      expect(window.state.shoppingList.some(i => i.name === 'Brot')).toBe(true);
      expect(window.state.shoppingList.some(i => i.name === 'Eier')).toBe(true);
      const saft = window.state.shoppingList.find(i => i.name === 'Orangensaft');
      expect(saft).toBeDefined();
      expect(saft.qty).toBe(1);
      expect(saft.unit.toLowerCase()).toBe('l');
    });

    it('lehnt leere Eingaben ab und zeigt Hinweis-Toast', () => {
      window.handleAddShoppingItem('   ');
      expect(window.state.shoppingList.length).toBe(0);
      expect(window.showToast).toHaveBeenCalled();
    });
  });

  describe('3. Artikel abhaken, löschen und Mengen anpassen', () => {
    it('verschiebt abgehakten Artikel in den Verlauf (handleToggleShoppingItem)', () => {
      window.handleAddShoppingItem('Reis');
      expect(window.state.shoppingList.length).toBe(1);
      expect(window.state.shoppingHistory.length).toBe(0);

      window.handleToggleShoppingItem(0);

      expect(window.state.shoppingList.length).toBe(0);
      expect(window.state.shoppingHistory.length).toBe(1);
      expect(window.state.shoppingHistory[0].name).toBe('Reis');
    });

    it('stellt Artikel aus dem Verlauf wieder her (restoreShoppingHistoryItem)', () => {
      window.state.shoppingHistory = [{ name: 'Nudeln', qty: 2, dept: 'pantry' }];

      window.restoreShoppingHistoryItem(0);

      expect(window.state.shoppingHistory.length).toBe(0);
      expect(window.state.shoppingList.length).toBe(1);
      expect(window.state.shoppingList[0].name).toBe('Nudeln');
    });

    it('erhöht und verringert Menge (adjustShoppingItemQty) und löscht bei 0', () => {
      window.handleAddShoppingItem('Tee');
      expect(window.state.shoppingList[0].qty).toBe(1);

      window.adjustShoppingItemQty(0, 1);
      expect(window.state.shoppingList[0].qty).toBe(2);

      window.adjustShoppingItemQty(0, -1);
      expect(window.state.shoppingList[0].qty).toBe(1);

      // Verringern auf 0 löscht das Element
      window.adjustShoppingItemQty(0, -1);
      expect(window.state.shoppingList.length).toBe(0);
    });

    it('löscht einen Artikel dauerhaft (handleDeleteShoppingItem)', () => {
      window.handleAddShoppingItem('Zucker');
      window.handleAddShoppingItem('Salz');

      window.handleDeleteShoppingItem(0); // Zucker löschen

      expect(window.state.shoppingList.length).toBe(1);
      expect(window.state.shoppingList[0].name).toBe('Salz');
    });

    it('leert erledigte Einträge auf der Liste (clearCompletedShopItems)', () => {
      window.state.shoppingList = [
        { name: 'Erledigtes Brot', checked: true },
        { name: 'Noch zu kaufende Milch', checked: false }
      ];

      window.clearCompletedShopItems();
      expect(window.state.shoppingList.length).toBe(1);
      expect(window.state.shoppingList[0].name).toBe('Noch zu kaufende Milch');
      expect(window.saveState).toHaveBeenCalled();
    });
  });

  describe('4. Deal-Radar und Preissummen-Berechnung', () => {
    it('findet passende Discounter-Angebote für Einkaufsartikel', () => {
      const match = window.findBestDealForShoppingItem('Hackfleisch gemischt');
      expect(match).not.toBeNull();
      expect(match.deal).toBeDefined();
      expect(match.deal.price).toBeGreaterThan(0);
    });

    it('übernimmt ein Angebot direkt auf die Einkaufsliste (addDealToShoppingList)', () => {
      window.addDealToShoppingList('deal-kaufland-01');

      expect(window.state.shoppingList.length).toBe(1);
      const item = window.state.shoppingList[0];
      expect(item.dealInfo).toBeDefined();
      expect(item.dealInfo.price).toBe(3.49);
      expect(item.dealInfo.store).toBe('kaufland');
    });

    it('berechnet Gesamtsumme (calculateShoppingListTotal) korrekt und ist robust gegen NaN', () => {
      window.state.shoppingList = [
        { name: 'Hackfleisch', qty: 2, dealInfo: { price: 3.50 } }, // 7.00 €
        { name: 'Kaffee', qty: 1, dealInfo: { price: 5.00 } },       // 5.00 €
        { name: 'Kaputter Artikel', qty: NaN, dealInfo: { price: NaN } }, // NaN robust abgefangen
        { name: 'Artikel ohne Preis', qty: 1 }                       // kein Preis
      ];

      const res = window.calculateShoppingListTotal();
      expect(res.itemCount).toBe(4);
      expect(res.totalNum).toBeCloseTo(12.00, 2);
      expect(res.totalFormatted).toContain('12.00 €');
      expect(res.hasPrices).toBe(true);
    });
  });

  describe('5. Vorratskammer (Pantry Management)', () => {
    it('fügt Vorratsartikel mit Haltbarkeitsdatum hinzu (handleAddPantryItem)', () => {
      window.handleAddPantryItem('Olivenöl', { qty: 2, expiryDays: 30 });

      const pantry = window.getPantryItems();
      expect(pantry.length).toBe(1);
      expect(pantry[0].name).toBe('Olivenöl');
      expect(pantry[0].qty).toBe(2);
      expect(pantry[0].expiresAt).toBeDefined();
    });

    it('berechnet die Frischeampel korrekt (getPantryItemFreshness)', () => {
      const now = new Date();

      // 1. Abgelaufen vor 2 Tagen
      const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const expiredFreshness = window.getPantryItemFreshness({ expiresAt: pastDate });
      expect(expiredFreshness.status).toBe('expired');
      expect(expiredFreshness.daysLeft).toBeLessThan(0);

      // 2. Heute ablaufend
      const todayDate = now.toISOString().split('T')[0];
      const todayFreshness = window.getPantryItemFreshness({ expiresAt: todayDate });
      expect(todayFreshness.status).toBe('warning');
      expect(todayFreshness.daysLeft).toBe(0);

      // 3. Haltbar für 10 Tage
      const futureDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const goodFreshness = window.getPantryItemFreshness({ expiresAt: futureDate });
      expect(goodFreshness.status).toBe('good');
      expect(goodFreshness.daysLeft).toBeGreaterThan(3);

      // 4. Ohne Ablaufdatum
      const eternalFreshness = window.getPantryItemFreshness({ expiresAt: null });
      expect(eternalFreshness.status).toBe('good');
    });

    it('verlängert das Mindesthaltbarkeitsdatum (extendPantryExpiry)', () => {
      const initialDate = '2026-11-01';
      window.state.pantryItems = [{ name: 'Quinoa', qty: 1, expiresAt: initialDate }];

      window.extendPantryExpiry(0, 14);

      const pantry = window.getPantryItems();
      expect(pantry[0].expiresAt).toBe('2026-11-15');
    });

    it('verschiebt Vorratsartikel auf die Einkaufsliste (movePantryItemToShoppingList)', () => {
      window.state.pantryItems = [{ name: 'Mehl', qty: 2, unit: 'kg', dept: 'pantry' }];

      window.movePantryItemToShoppingList(0);

      expect(window.state.shoppingList.length).toBe(1);
      const added = window.state.shoppingList[0];
      expect(added.name).toBe('Mehl');
      expect(added.qty).toBe(2);
      expect(added.unit).toBe('kg');
    });

    it('verschiebt gekauften Artikel in den Vorrat (moveBoughtItemToPantry)', () => {
      const boughtItem = { name: 'Müsli', qty: 1, unit: 'packung', dept: 'pantry' };

      window.moveBoughtItemToPantry(boughtItem, 21);

      const pantry = window.getPantryItems();
      expect(pantry.length).toBe(1);
      expect(pantry[0].name).toBe('Müsli');
      expect(pantry[0].qty).toBe(1);
      expect(pantry[0].expiresAt).toBeDefined();
    });
  });
});
