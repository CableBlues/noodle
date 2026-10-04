// app-shopping.js: Umfassende Smart Shopping Suite mit Gängen, Discounter-Hub & Smart Deal-Radar

const SHOPPING_DEPARTMENTS = {
  produce: {
    icon: 'apple',
    color: 'emerald',
    title: { en: 'Produce (Fruits & Veggies)', de: 'Obst & Gemüse', fr: 'Fruits & Légumes', it: 'Frutta & Verdura', es: 'Frutas & Verduras', el: 'Φρούτα & Λαχανικά' },
    keywords: [
      'apfel', 'apple', 'banan', 'tomate', 'salat', 'gurke', 'paprika', 'kartoffel', 'potato', 'zwiebel', 'onion', 'knoblauch', 'garlic', 'beere', 'berry', 'erdbeer', 'orange', 'zitrone', 'lemon', 'limette', 'avocado', 'karotte', 'carrot', 'spinat', 'spinach', 'pilz', 'mushroom', 'brokkoli', 'broccoli', 'blumenkohl', 'kohl', 'lauch', 'ingwer', 'ginger', 'kürbis', 'pumpkin', 'trauben', 'grape', 'birne', 'pear', 'mango', 'ananas', 'pineapple', 'kräuter', 'herbs', 'petersilie', 'basilikum', 'basil', 'rosmarin', 'rosemary', 'melone', 'melon', 'zucchini', 'aubergine', 'radieschen', 'pfirsich', 'peach', 'pflaume', 'plum', 'kirsche', 'cherry', 'kiwi', 'feige', 'fig'
    ]
  },
  dairy: {
    icon: 'milk',
    color: 'sky',
    title: { en: 'Dairy & Eggs', de: 'Kühlregal, Milch & Eier', fr: 'Produits Laitiers & Œufs', it: 'Latticini & Uova', es: 'Lácteos & Huevos', el: 'Γαλακτοκομικά & Αυγά' },
    keywords: [
      'milch', 'milk', 'lait', 'leche', 'latte', 'γάλα', 'hafermilch', 'oat milk', 'sojamilch', 'mandelmilch', 'käse', 'cheese', 'fromage', 'formaggio', 'queso', 'τυρί', 'butter', 'beurre', 'mantequilla', 'burro', 'βούτυρο', 'joghurt', 'yogurt', 'yaourt', 'γιαούρτι', 'quark', 'cottage', 'eier', 'egg', 'oeuf', 'uova', 'huevo', 'αυγά', 'sahne', 'cream', 'crème', 'panna', 'nata', 'sour cream', 'schmand', 'frischkäse', 'cream cheese', 'mozzarella', 'parmesan', 'feta', 'gouda', 'cheddar', 'tofu'
    ]
  },
  bakery: {
    icon: 'croissant',
    color: 'amber',
    title: { en: 'Bakery & Grains', de: 'Bäckerei & Getreide', fr: 'Boulangerie & Céréales', it: 'Panetteria & Cereali', es: 'Panadería & Cereales', el: 'Αρτοποιείο & Δημητριακά' },
    keywords: [
      'brot', 'bread', 'pain', 'pane', 'pan', 'ψωμί', 'brötchen', 'roll', 'bun', 'baguette', 'toast', 'croissant', 'haferflocken', 'oats', 'avoine', 'avena', 'müsli', 'granola', 'pasta', 'nudeln', 'spaghetti', 'penne', 'reis', 'rice', 'riz', 'riso', 'arroz', 'ρύζι', 'mehl', 'flour', 'farine', 'harina', 'farina', 'αλεύρι', 'kuchen', 'cake', 'wrap', 'tortilla', 'quinoa', 'couscous', 'bulgur'
    ]
  },
  meat: {
    icon: 'beef',
    color: 'rose',
    title: { en: 'Meat & Seafood', de: 'Fleisch & Fisch', fr: 'Viande & Poisson', it: 'Carne & Pesce', es: 'Carne & Pescado', el: 'Κρέας & Ψάρια' },
    keywords: [
      'fleisch', 'meat', 'viande', 'carne', 'κρέας', 'hähnchen', 'chicken', 'poulet', 'pollo', 'κοτόπουλο', 'rind', 'beef', 'boeuf', 'manzo', 'schwein', 'pork', 'porc', 'cerdo', 'maiale', 'hackfleisch', 'mince', 'viande hachée', 'macinato', 'wurst', 'sausage', 'saucisse', 'salchicha', 'schinken', 'ham', 'jambon', 'jamón', 'prosciutto', 'fisch', 'fish', 'poisson', 'pesce', 'pescado', 'ψάρι', 'lachs', 'salmon', 'saumon', 'salmone', 'salmón', 'thunfisch', 'tuna', 'garnelen', 'shrimp', 'crevette', 'gamberi'
    ]
  },
  pantry: {
    icon: 'soup',
    color: 'orange',
    title: { en: 'Pantry & Spices', de: 'Vorrat & Gewürze', fr: 'Épicerie & Épices', it: 'Dispensa & Spezie', es: 'Despensa & Especias', el: 'Τρόφιμα & Μπαχαρικά' },
    keywords: [
      'öl', 'oil', 'huile', 'olio', 'aceite', 'λάδι', 'olivenöl', 'olive oil', 'essig', 'vinegar', 'vinaigre', 'aceto', 'vinagre', 'ξύδι', 'salz', 'salt', 'sel', 'sale', 'αλάτι', 'pfeffer', 'pepper', 'poivre', 'pepe', 'pimienta', 'πιπέρι', 'zucker', 'sugar', 'sucre', 'zucchero', 'azúcar', 'ζάχαρη', 'honig', 'honey', 'miel', 'miele', 'μέλι', 'senf', 'mustard', 'moutarde', 'senape', 'mostaza', 'ketchup', 'mayo', 'mayonnaise', 'tomatenmark', 'tomato paste', 'dose', 'can', 'kichererbsen', 'chickpeas', 'linsen', 'lentils', 'bohnen', 'beans', 'pesto', 'gewürz', 'spice', 'sauce', 'soße', 'passierte tomaten', 'brühe', 'broth', 'bouillon', 'nüsse', 'nuts', 'mandeln', 'almonds', 'schokolade', 'chocolate', 'chips', 'snack'
    ]
  },
  drinks: {
    icon: 'cup-soda',
    color: 'cyan',
    title: { en: 'Beverages', de: 'Getränke', fr: 'Boissons', it: 'Bevande', es: 'Bebidas', el: 'Ποτά & Ροφήματα' },
    keywords: [
      'wasser', 'water', 'eau', 'acqua', 'agua', 'νερό', 'mineralwasser', 'sprudel', 'saft', 'juice', 'jus', 'succo', 'zumo', 'χυμός', 'kaffee', 'coffee', 'café', 'caffè', 'καφές', 'espresso', 'tee', 'tea', 'thé', 'té', 'τσάι', 'cola', 'limonade', 'soda', 'bier', 'beer', 'bière', 'birra', 'cerveza', 'μπύρα', 'wein', 'wine', 'vin', 'vino', 'vino', 'κρασί'
    ]
  },
  household: {
    icon: 'sparkle',
    color: 'purple',
    title: { en: 'Household & Care', de: 'Drogerie & Haushalt', fr: 'Maison & Soins', it: 'Casa & Cura', es: 'Hogar & Cuidado', el: 'Σπίτι & Φροντίδα' },
    keywords: [
      'toilettenpapier', 'toilet paper', 'papier toilette', 'carta igienica', 'papel higiénico', 'χαρτί υγείας', 'küchenrolle', 'paper towels', 'seife', 'soap', 'savon', 'sapone', 'jabón', 'σαπούνι', 'shampoo', 'duschgel', 'zahnpasta', 'toothpaste', 'dentifrice', 'dentifricio', 'pasta de dientes', 'οδοντόκρεμα', 'spülmittel', 'dish soap', 'liquide vaisselle', 'detersivo piatti', 'lavavajillas', 'waschmittel', 'detergent', 'lessive', 'detersivo', 'müllbeutel', 'trash bags', 'sacs poubelle', 'sacchetti spazzatura', 'bolsas de basura', 'schwamm', 'sponge', 'éponge', 'spugna', 'esponja', 'alufolie', 'backpapier', 'baking paper'
    ]
  }
};

const QUICK_ESSENTIALS = {
  en: ['🥛 Milk', '🥚 Eggs', '🍞 Bread', '🧈 Butter', '🍎 Apples', '🍌 Bananas', '☕ Coffee', '🍝 Pasta', '🧅 Onions', '🧀 Cheese'],
  de: ['🥛 Milch', '🥚 Eier', '🍞 Brot', '🧈 Butter', '🍎 Äpfel', '🍌 Bananen', '☕ Kaffee', '🍝 Nudeln', '🧅 Zwiebeln', '🧀 Käse'],
  fr: ['🥛 Lait', '🥚 Œufs', '🍞 Pain', '🧈 Beurre', '🍎 Pommes', '🍌 Bananes', '☕ Café', '🍝 Pâtes', '🧅 Oignons', '🧀 Fromage'],
  it: ['🥛 Latte', '🥚 Uova', '🍞 Pane', '🧈 Burro', '🍎 Mele', '🍌 Banane', '☕ Caffè', '🍝 Pasta', '🧅 Cipolle', '🧀 Formaggio'],
  es: ['🥛 Leche', '🥚 Huevos', '🍞 Pan', '🧈 Mantequilla', '🍎 Manzanas', '🍌 Plátanos', '☕ Café', '🍝 Pasta', '🧅 Cebollas', '🧀 Queso'],
  el: ['🥛 Γάλα', '🥚 Αυγά', '🍞 Ψωμί', '🧈 Βούτυρο', '🍎 Μήλα', '🍌 Μπανάνες', '☕ Καφές', '🍝 Ζυμαρικά', '🧅 Κρεμμύδια', '🧀 Τυρί']
};

// -------------------------------------------------------------
// DISCOUNTER & DEALS ENGINE (STORES & LIVE CATALOG)
// -------------------------------------------------------------
const DISCOUNT_STORES = {
  aldi: { name: 'Aldi', color: '#0284c7', bg: 'bg-sky-500/15', border: 'border-sky-500/40', text: 'text-sky-300', icon: 'shopping-bag', badge: 'Aldi Süd/Nord' },
  lidl: { name: 'Lidl', color: '#eab308', bg: 'bg-yellow-500/15', border: 'border-yellow-500/40', text: 'text-yellow-300', icon: 'percent', badge: 'Lidl Plus' },
  rewe: { name: 'Rewe', color: '#dc2626', bg: 'bg-red-500/15', border: 'border-red-500/40', text: 'text-red-300', icon: 'tag', badge: 'Rewe Beste Wahl' },
  penny: { name: 'Penny', color: '#ea580c', bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-300', icon: 'flame', badge: 'Penny Knüller' },
  kaufland: { name: 'Kaufland', color: '#9333ea', bg: 'bg-purple-500/15', border: 'border-purple-500/40', text: 'text-purple-300', icon: 'award', badge: 'Kaufland Card' },
  edeka: { name: 'Edeka', color: '#16a34a', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-300', icon: 'heart', badge: 'Gut & Günstig' }
};

const DEFAULT_DISCOUNT_DEALS = [
  { id: 'deal-aldi-01', store: 'aldi', name: 'Bio Vollmilch 3.8%', originalPrice: 1.49, price: 1.09, discountPct: 27, unit: '1 L', dept: 'dairy', badge: 'Bio Hit', validUntil: 'Sa. diese Woche' },
  { id: 'deal-aldi-02', store: 'aldi', name: 'Deutsche Markenbutter', originalPrice: 2.29, price: 1.39, discountPct: 39, unit: '250 g', dept: 'dairy', badge: 'Super-Knüller', validUntil: 'Sa. diese Woche' },
  { id: 'deal-aldi-03', store: 'aldi', name: 'Bananen Bio Fairtrade', originalPrice: 1.99, price: 1.29, discountPct: 35, unit: '1 kg', dept: 'produce', badge: 'Fairtrade', validUntil: 'Sa. diese Woche' },
  { id: 'deal-aldi-04', store: 'aldi', name: 'Natives Olivenöl Extra', originalPrice: 8.99, price: 5.99, discountPct: 33, unit: '750 ml', dept: 'pantry', badge: 'Aktion', validUntil: 'Sa. diese Woche' },
  { id: 'deal-aldi-05', store: 'aldi', name: 'Lachsfilet frisch mit Haut', originalPrice: 5.99, price: 4.29, discountPct: 28, unit: '300 g', dept: 'meat', badge: 'Frische-Tipp', validUntil: 'Sa. diese Woche' },
  { id: 'deal-aldi-06', store: 'aldi', name: 'Haferflocken Zart & Kernig', originalPrice: 0.79, price: 0.49, discountPct: 38, unit: '500 g', dept: 'bakery', badge: 'Dauer-Günstig', validUntil: 'Sa. diese Woche' },

  { id: 'deal-lidl-01', store: 'lidl', name: 'Barista Hafermilch Ungesüßt', originalPrice: 1.89, price: 1.19, discountPct: 37, unit: '1 L', dept: 'dairy', badge: 'Lidl Plus', validUntil: 'Sa. diese Woche' },
  { id: 'deal-lidl-02', store: 'lidl', name: 'Gouda jung in Scheiben', originalPrice: 2.69, price: 1.69, discountPct: 37, unit: '400 g', dept: 'dairy', badge: 'XXL Packung', validUntil: 'Sa. diese Woche' },
  { id: 'deal-lidl-03', store: 'lidl', name: 'Avocados Ready-to-Eat', originalPrice: 2.49, price: 1.49, discountPct: 40, unit: '2er Pack', dept: 'produce', badge: 'Knaller', validUntil: 'Sa. diese Woche' },
  { id: 'deal-lidl-04', store: 'lidl', name: 'Lavazza Crema e Aroma Bohnen', originalPrice: 14.99, price: 9.99, discountPct: 33, unit: '1 kg', dept: 'drinks', badge: 'Marken-Highlight', validUntil: 'Sa. diese Woche' },
  { id: 'deal-lidl-05', store: 'lidl', name: 'Hähnchen-Brustfilet Teilstücke', originalPrice: 7.49, price: 4.99, discountPct: 33, unit: '600 g', dept: 'meat', badge: 'Frische-Hit', validUntil: 'Sa. diese Woche' },
  { id: 'deal-lidl-06', store: 'lidl', name: 'Italienische Pasta Spaghetti & Penne', originalPrice: 1.19, price: 0.69, discountPct: 42, unit: '500 g', dept: 'bakery', badge: '42% Sparen', validUntil: 'Sa. diese Woche' },

  { id: 'deal-rewe-01', store: 'rewe', name: 'Kerrygold Original Irische Butter', originalPrice: 3.29, price: 1.99, discountPct: 40, unit: '250 g', dept: 'dairy', badge: 'Wochen-Knüller', validUntil: 'Sa. diese Woche' },
  { id: 'deal-rewe-02', store: 'rewe', name: 'Barilla Pasta Sorten', originalPrice: 1.99, price: 0.88, discountPct: 56, unit: '500 g', dept: 'bakery', badge: 'Top Sparpreis', validUntil: 'Sa. diese Woche' },
  { id: 'deal-rewe-03', store: 'rewe', name: 'Jacobs Krönung Kaffee gemahlen', originalPrice: 6.99, price: 4.44, discountPct: 36, unit: '500 g', dept: 'drinks', badge: 'Kaffee-Hit', validUntil: 'Sa. diese Woche' },
  { id: 'deal-rewe-04', store: 'rewe', name: 'Bio Freilandeier Gr. M/L', originalPrice: 3.29, price: 2.49, discountPct: 24, unit: '10er Pack', dept: 'dairy', badge: 'Bio Region', validUntil: 'Sa. diese Woche' },
  { id: 'deal-rewe-05', store: 'rewe', name: 'Bio Gurken aus Deutschland', originalPrice: 1.49, price: 0.79, discountPct: 47, unit: '1 Stück', dept: 'produce', badge: 'Lokal & Bio', validUntil: 'Sa. diese Woche' },

  { id: 'deal-penny-01', store: 'penny', name: 'Ritter Sport Bunte Vielfalt', originalPrice: 1.49, price: 0.88, discountPct: 41, unit: '100 g', dept: 'pantry', badge: 'Penny Knüller', validUntil: 'Sa. diese Woche' },
  { id: 'deal-penny-02', store: 'penny', name: 'Speisekartoffeln festkochend', originalPrice: 3.49, price: 1.99, discountPct: 43, unit: '2.5 kg', dept: 'produce', badge: 'Sack-Preis', validUntil: 'Sa. diese Woche' },
  { id: 'deal-penny-03', store: 'penny', name: 'Coca-Cola / Fanta / Sprite', originalPrice: 1.49, price: 0.99, discountPct: 34, unit: '1.25 L', dept: 'drinks', badge: 'Erfrischung', validUntil: 'Sa. diese Woche' },
  { id: 'deal-penny-04', store: 'penny', name: 'Toilettenpapier 3-lagig sanft', originalPrice: 4.29, price: 2.99, discountPct: 30, unit: '10x 200 Blatt', dept: 'household', badge: 'Haushalts-Hit', validUntil: 'Sa. diese Woche' },

  { id: 'deal-kaufland-01', store: 'kaufland', name: 'Gemischtes Hackfleisch Rind & Schwein', originalPrice: 5.49, price: 3.49, discountPct: 36, unit: '500 g', dept: 'meat', badge: 'Kaufland Card', validUntil: 'Sa. diese Woche' },
  { id: 'deal-kaufland-02', store: 'kaufland', name: 'Äpfel Gala / Elstar Tafeläpfel', originalPrice: 2.99, price: 1.59, discountPct: 47, unit: '1 kg', dept: 'produce', badge: 'Knack-Frisch', validUntil: 'Sa. diese Woche' },
  { id: 'deal-kaufland-03', store: 'kaufland', name: 'Dallmayr Prodomo Spitzenkaffee', originalPrice: 7.49, price: 4.99, discountPct: 33, unit: '500 g', dept: 'drinks', badge: 'Kaffee des Monats', validUntil: 'Sa. diese Woche' },

  { id: 'deal-edeka-01', store: 'edeka', name: 'Mozzarella di Bufala Campana', originalPrice: 2.49, price: 1.49, discountPct: 40, unit: '125 g', dept: 'dairy', badge: 'Gourmet Deal', validUntil: 'Sa. diese Woche' },
  { id: 'deal-edeka-02', store: 'edeka', name: 'Bio Rispen-Tomaten aromatisch', originalPrice: 2.99, price: 1.79, discountPct: 40, unit: '500 g', dept: 'produce', badge: 'Bio Qualität', validUntil: 'Sa. diese Woche' },
  { id: 'deal-edeka-03', store: 'edeka', name: 'Pesto Alla Genovese Barilla', originalPrice: 3.29, price: 1.99, discountPct: 39, unit: '190 g', dept: 'pantry', badge: 'Genuss-Hit', validUntil: 'Sa. diese Woche' }
];

let globalDiscountDeals = [...DEFAULT_DISCOUNT_DEALS];
let activeDiscountStore = 'all';
let activeDiscountSearch = '';
let activeShoppingTab = 'list'; // 'list' or 'deals'

async function fetchLiveDiscounterDeals() {
  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
    // Auf file:// Protokoll blockieren Browser CORS-Fetches auf lokale Dateien.
    // Direkt die eingebetteten Standard-Deals nutzen ohne Fehlermeldung.
    return;
  }
  try {
    const res = await fetch('api/discounts.php', { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.deals) && data.deals.length > 0) {
        globalDiscountDeals = data.deals;
        if (typeof renderDiscounterDeals === 'function') {
          renderDiscounterDeals();
        }
      }
    }
  } catch (err) {
    // Graceful offline fallback to DEFAULT_DISCOUNT_DEALS
  }
}

// -------------------------------------------------------------
// SMART DEAL-RADAR & MATCHING ENGINE
// -------------------------------------------------------------
function findBestDealForShoppingItem(name) {
  if (!name || typeof name !== 'string') return null;
  const clean = name.toLowerCase().replace(/[^a-z0-9äöüß]/gi, ' ').trim();
  const words = clean.split(/\s+/).filter(w => w.length > 2 && !['ein', 'eine', 'packung', 'dose', 'glas', 'stk', 'liter'].includes(w));

  let bestMatch = null;
  let highestScore = 0;

  globalDiscountDeals.forEach(deal => {
    const dealClean = deal.name.toLowerCase();
    let score = 0;

    // Exact or direct inclusion match
    if (dealClean.includes(clean) || clean.includes(dealClean)) {
      score += 10;
    }

    // Word matches
    words.forEach(w => {
      if (dealClean.includes(w)) {
        score += 3;
      }
    });

    // Special item mapping
    if ((clean.includes('milch') || clean.includes('hafer')) && (dealClean.includes('milch') || dealClean.includes('hafer'))) score += 5;
    if (clean.includes('butter') && dealClean.includes('butter')) score += 5;
    if ((clean.includes('pasta') || clean.includes('nudel') || clean.includes('spaghetti')) && (dealClean.includes('pasta') || dealClean.includes('spaghetti'))) score += 5;
    if (clean.includes('kaffee') && (dealClean.includes('kaffee') || dealClean.includes('lavazza') || dealClean.includes('dallmayr') || dealClean.includes('jacobs'))) score += 5;
    if (clean.includes('ei') && dealClean.includes('eier')) score += 5;
    if (clean.includes('apfel') && dealClean.includes('äpfel')) score += 5;
    if (clean.includes('banan') && dealClean.includes('banan')) score += 5;
    if (clean.includes('hack') && dealClean.includes('hack')) score += 5;
    if (clean.includes('lachs') && dealClean.includes('lachs')) score += 5;
    if (clean.includes('käse') && dealClean.includes('gouda')) score += 4;
    if (clean.includes('öl') && dealClean.includes('olivenöl')) score += 5;

    if (score > highestScore && score >= 4) {
      highestScore = score;
      bestMatch = deal;
    }
  });

  if (!bestMatch) return null;

  const storeInfo = DISCOUNT_STORES[bestMatch.store] || { name: bestMatch.store, color: '#10b981', text: 'text-emerald-300' };
  const savings = ((bestMatch.originalPrice || 0) - (bestMatch.price || 0)).toFixed(2);

  return {
    deal: bestMatch,
    storeInfo,
    savings,
    discountPct: bestMatch.discountPct || Math.round(((bestMatch.originalPrice - bestMatch.price) / bestMatch.originalPrice) * 100)
  };
}

function getShoppingListRadarMatches() {
  const list = state.shoppingList || [];
  const matches = [];
  list.forEach((item, idx) => {
    const match = findBestDealForShoppingItem(item.name);
    if (match) {
      matches.push({ itemIndex: idx, item, ...match });
    }
  });
  return matches;
}

function getDepartmentForItem(name) {
  if (!name) return 'other';
  const clean = name.toLowerCase().trim();
  for (const deptKey in SHOPPING_DEPARTMENTS) {
    const dept = SHOPPING_DEPARTMENTS[deptKey];
    if (dept.keywords.some(kw => clean.includes(kw))) {
      return deptKey;
    }
  }
  return 'other';
}
window.SHOPPING_DEPARTMENTS = SHOPPING_DEPARTMENTS;
window.getDepartmentForItem = getDepartmentForItem;

// -------------------------------------------------------------
// TAB SWITCHER: [ LISTE ] vs [ DISCOUNTER-DEALS ]
// -------------------------------------------------------------
function switchShoppingTab(tabName) {
  activeShoppingTab = tabName;
  const listPane = document.getElementById('shopping-pane-list');
  const dealsPane = document.getElementById('shopping-pane-deals');
  const btnList = document.getElementById('shopping-tab-btn-list');
  const btnDeals = document.getElementById('shopping-tab-btn-deals');

  if (tabName === 'deals') {
    if (listPane) listPane.classList.add('hidden');
    if (dealsPane) dealsPane.classList.remove('hidden');
    if (btnList) {
      btnList.className = 'flex-1 py-1.5 px-2 rounded-xl text-gray-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent transition text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer';
    }
    if (btnDeals) {
      btnDeals.className = 'flex-1 py-1.5 px-2 rounded-xl text-emerald-100 bg-gradient-to-r from-emerald-600/40 via-teal-600/35 to-emerald-600/40 border border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.35)] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer';
    }
    renderDiscounterDeals();
  } else {
    if (listPane) listPane.classList.remove('hidden');
    if (dealsPane) dealsPane.classList.add('hidden');
    if (btnList) {
      btnList.className = 'flex-1 py-1.5 px-2 rounded-xl text-emerald-100 bg-gradient-to-r from-emerald-600/40 via-teal-600/35 to-emerald-600/40 border border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.35)] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer';
    }
    if (btnDeals) {
      btnDeals.className = 'flex-1 py-1.5 px-2 rounded-xl text-gray-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent transition text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer';
    }
    updateShoppingListPopup();
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}
window.switchShoppingTab = switchShoppingTab;

// -------------------------------------------------------------
// ADDING & MODIFYING ITEMS
// -------------------------------------------------------------
function handleAddShoppingItem(explicitName = null, options = {}) {
  let rawInput = explicitName;
  if (!rawInput) {
    const inputEl = document.getElementById('shop-add-name') || document.getElementById('supermarket-add-input');
    rawInput = inputEl ? inputEl.value.trim() : '';
    if (inputEl) inputEl.value = '';
  }

  if (!rawInput) {
    showToast(tr({
      de: "Bitte Artikelname eingeben!",
      en: "Please enter an item name!",
      fr: "Veuillez entrer un article !",
      it: "Inserisci il nome dell'articolo!",
      es: "¡Introduce un artículo!",
      el: "Παρακαλώ εισάγετε ένα προϊόν!"
    }));
    return;
  }

  saveHistory();
  if (!Array.isArray(state.shoppingList)) state.shoppingList = [];

  const itemsToAdd = rawInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);

  itemsToAdd.forEach(text => {
    let name = text;
    let qty = options.qty || 1;
    let unit = options.unit || '';

    if (!options.qty) {
      const qtyMatch = text.match(/^(\d+)\s*(x|kg|g|l|ml|bund|stk|packung|dose|gläser|glas)?\s+(.+)$/i);
      if (qtyMatch) {
        qty = parseInt(qtyMatch[1], 10) || 1;
        unit = qtyMatch[2] || '';
        name = qtyMatch[3].trim();
      }
    }

    const dept = options.dept || getDepartmentForItem(name);

    const existingIndex = state.shoppingList.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
    if (existingIndex !== -1) {
      state.shoppingList[existingIndex].qty = (state.shoppingList[existingIndex].qty || 1) + qty;
      if (unit) state.shoppingList[existingIndex].unit = unit;
      if (options.dealInfo) state.shoppingList[existingIndex].dealInfo = options.dealInfo;
    } else {
      state.shoppingList.push({
        id: 'shop-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        name,
        qty,
        unit,
        dept,
        dealInfo: options.dealInfo || null,
        addedAt: new Date().toISOString()
      });
    }
  });

  saveState();
  renderApp();
  renderSupermarketModal();

  if (itemsToAdd.length === 1) {
    showToast(tr({
      de: `"${itemsToAdd[0]}" hinzugefügt! 🛒`,
      en: `Added "${itemsToAdd[0]}"! 🛒`,
      fr: `"${itemsToAdd[0]}" ajouté ! 🛒`,
      it: `"${itemsToAdd[0]}" aggiunto! 🛒`,
      es: `¡"${itemsToAdd[0]}" añadido! 🛒`,
      el: `Το "${itemsToAdd[0]}" προστέθηκε! 🛒`
    }));
  } else {
    showToast(tr({
      de: `${itemsToAdd.length} Artikel hinzugefügt! 🛒`,
      en: `${itemsToAdd.length} items added! 🛒`,
      fr: `${itemsToAdd.length} articles ajoutés ! 🛒`,
      it: `${itemsToAdd.length} articoli aggiunti ! 🛒`,
      es: `¡${itemsToAdd.length} artículos añadidos! 🛒`,
      el: `${itemsToAdd.length} προϊόντα προστέθηκαν! 🛒`
    }));
  }
}

function addDealToShoppingList(dealId) {
  const deal = globalDiscountDeals.find(d => d.id === dealId);
  if (!deal) return;

  const storeInfo = DISCOUNT_STORES[deal.store] || { name: deal.store };
  const dealName = `${deal.name} (${storeInfo.name})`;

  handleAddShoppingItem(dealName, {
    qty: 1,
    unit: deal.unit || '',
    dept: deal.dept || getDepartmentForItem(deal.name),
    dealInfo: {
      id: deal.id,
      store: deal.store,
      storeName: storeInfo.name,
      price: deal.price,
      originalPrice: deal.originalPrice,
      discountPct: deal.discountPct
    }
  });

  if (typeof triggerCelebration === 'function') triggerCelebration();
  showToast(`🏷️ ${deal.name} (${deal.price.toFixed(2)} € bei ${storeInfo.name}) auf Liste gesetzt! 🎉`);
}
window.addDealToShoppingList = addDealToShoppingList;

function applyDealToShoppingItem(itemIndex, dealId) {
  if (!state.shoppingList || !state.shoppingList[itemIndex]) return;
  const deal = globalDiscountDeals.find(d => d.id === dealId);
  if (!deal) return;

  saveHistory();
  const storeInfo = DISCOUNT_STORES[deal.store] || { name: deal.store };
  state.shoppingList[itemIndex].name = `${deal.name} (${storeInfo.name})`;
  state.shoppingList[itemIndex].dept = deal.dept || getDepartmentForItem(deal.name);
  state.shoppingList[itemIndex].dealInfo = {
    id: deal.id,
    store: deal.store,
    storeName: storeInfo.name,
    price: deal.price,
    originalPrice: deal.originalPrice,
    discountPct: deal.discountPct
  };

  saveState();
  renderApp();
  renderSupermarketModal();
  showToast(`✨ Deal angewendet: ${deal.name} (${deal.price.toFixed(2)} €) bei ${storeInfo.name}!`);
}
window.applyDealToShoppingItem = applyDealToShoppingItem;

function adjustShoppingItemQty(index, delta) {
  if (!state.shoppingList || !state.shoppingList[index]) return;
  saveHistory();
  const current = state.shoppingList[index].qty || 1;
  const newQty = current + delta;
  if (newQty <= 0) {
    handleDeleteShoppingItem(index);
    return;
  }
  state.shoppingList[index].qty = newQty;
  saveState();
  renderApp();
  renderSupermarketModal();
}

function handleDeleteShoppingItem(index) {
  if (!state.shoppingList || !state.shoppingList[index]) return;
  saveHistory();
  const removed = state.shoppingList.splice(index, 1)[0];
  const shopId = (removed && typeof removed === 'object' && removed.id) 
    ? removed.id 
    : ((typeof getStableId === 'function') ? getStableId(removed, 'shop') : null);
  if (shopId && typeof trackTombstone === 'function') {
    trackTombstone(shopId);
  }
  saveState();

  renderApp();
  renderSupermarketModal();
  showToast(tr({
    de: `"${removed.name}" gelöscht.`,
    en: `Deleted "${removed.name}".`,
    fr: `"${removed.name}" supprimé.`,
    it: `"${removed.name}" eliminato.`,
    es: `"${removed.name}" eliminado.`,
    el: `Το "${removed.name}" διαγράφηκε.`
  }));
}

function handleToggleShoppingItem(index) {
  if (!state.shoppingList || !state.shoppingList[index]) return;
  saveHistory();
  const item = state.shoppingList.splice(index, 1)[0];
  if (!Array.isArray(state.shoppingHistory)) state.shoppingHistory = [];
  
  const todayStr = new Date().toLocaleDateString(currentLang === 'de' ? 'de-DE' : 'en-US', { month: '2-digit', day: '2-digit' });
  state.shoppingHistory.push({
    name: item.name,
    qty: item.qty || 1,
    unit: item.unit || '',
    dept: item.dept || 'other',
    dealInfo: item.dealInfo || null,
    date: todayStr
  });

  saveState();
  if (typeof playProceduralSound === 'function') playProceduralSound(3);
  renderApp();
  renderSupermarketModal();

  showToast(tr({
    de: `"${item.name}" eingekauft! ✅`,
    en: `Bought "${item.name}"! ✅`,
    fr: `"${item.name}" acheté ! ✅`,
    it: `"${item.name}" acquistato! ✅`,
    es: `¡"${item.name}" comprado! ✅`,
    el: `Το "${item.name}" αγοράστηκε! ✅`
  }));
}

function restoreShoppingHistoryItem(historyIndex) {
  if (!state.shoppingHistory || !state.shoppingHistory[historyIndex]) return;
  saveHistory();
  const hItem = state.shoppingHistory.splice(historyIndex, 1)[0];
  handleAddShoppingItem(hItem.name, { qty: hItem.qty, unit: hItem.unit, dept: hItem.dept, dealInfo: hItem.dealInfo });
}

function toggleShoppingHistory() {
  const visible = localStorage.getItem('flow_shop_history_visible') === 'true';
  localStorage.setItem('flow_shop_history_visible', String(!visible));
  renderApp();
}

async function clearShoppingList() {
  if (!state.shoppingList || state.shoppingList.length === 0) return;
  const confirmMsg = tr({
    de: "Gesamte Einkaufsliste leeren?",
    en: "Clear entire shopping list?",
    fr: "Vider toute la liste de courses ?",
    it: "Svuotare l'intera lista della spesa?",
    es: "¿Vaciar toda la lista de compras?",
    el: "Εκκαθάριση όλης της λίστας αγορών;"
  });
  const confirmed = typeof showConfirmDialog === 'function' ? await showConfirmDialog({
    title: typeof tr === 'function' ? tr({ de: 'Einkaufsliste leeren?', en: 'Clear shopping list?' }) : 'Einkaufsliste leeren?',
    message: confirmMsg,
    confirmText: typeof tr === 'function' ? tr({ de: 'Leeren', en: 'Clear' }) : 'Leeren',
    isDanger: true,
    icon: 'trash-2'
  }) : confirm(confirmMsg);

  if (confirmed) {
    saveHistory();
    state.shoppingList = [];
    saveState();
    renderApp();
    renderSupermarketModal();
  }
}

async function clearShoppingHistory() {
  if (!state.shoppingHistory || state.shoppingHistory.length === 0) return;
  const confirmMsg = tr({
    de: "Einkaufs-Protokoll leeren?",
    en: "Clear shopping history?",
    fr: "Vider l'historique des achats ?",
    it: "Svuotare la cronologia degli acquisti?",
    es: "¿Vaciar el historial de compras?",
    el: "Εκκαθάριση ιστορικού αγορών;"
  });
  const confirmed = typeof showConfirmDialog === 'function' ? await showConfirmDialog({
    title: typeof tr === 'function' ? tr({ de: 'Protokoll leeren?', en: 'Clear history?' }) : 'Protokoll leeren?',
    message: confirmMsg,
    confirmText: typeof tr === 'function' ? tr({ de: 'Leeren', en: 'Clear' }) : 'Leeren',
    isDanger: true,
    icon: 'trash-2'
  }) : confirm(confirmMsg);

  if (confirmed) {
    saveHistory();
    state.shoppingHistory = [];
    saveState();
    renderApp();
    renderSupermarketModal();
  }
}

function addIngredientsToShoppingList(ingredients, recipeTitle = '') {
  if (!Array.isArray(ingredients) || ingredients.length === 0) return;
  saveHistory();
  if (!Array.isArray(state.shoppingList)) state.shoppingList = [];

  let count = 0;
  ingredients.forEach(ing => {
    const name = String(ing).trim();
    if (name) {
      handleAddShoppingItem(name);
      count++;
    }
  });

  if (typeof triggerCelebration === 'function') triggerCelebration();
  showToast(tr({
    de: `${count} Zutaten zu deiner Einkaufsliste hinzugefügt! 🛒`,
    en: `${count} ingredients to shopping list! 🛒`,
    fr: `${count} ingrédients ajoutés à la liste de courses ! 🛒`,
    it: `${count} ingredienti aggiunti alla lista della spesa! 🛒`,
    es: `¡${count} ingredientes añadidos a la lista! 🛒`,
    el: `${count} υλικά προστέθηκαν στη λίστα αγορών! 🛒`
  }));
}

// -------------------------------------------------------------
// DISCOUNTER HUB RENDERING (DEALS TAB)
// -------------------------------------------------------------
function filterDiscounterDeals(storeKey) {
  activeDiscountStore = storeKey;
  renderDiscounterDeals();
}
window.filterDiscounterDeals = filterDiscounterDeals;

function searchDiscounterDeals(query) {
  activeDiscountSearch = query.toLowerCase().trim();
  renderDiscounterDeals();
}
window.searchDiscounterDeals = searchDiscounterDeals;

function renderDiscounterDeals() {
  const container = document.getElementById('discounter-deals-container');
  if (!container) return;

  const filtered = globalDiscountDeals.filter(deal => {
    if (activeDiscountStore !== 'all' && deal.store !== activeDiscountStore) return false;
    if (activeDiscountSearch) {
      const matchName = deal.name.toLowerCase().includes(activeDiscountSearch);
      const matchBadge = (deal.badge || '').toLowerCase().includes(activeDiscountSearch);
      const matchStore = (deal.store || '').toLowerCase().includes(activeDiscountSearch);
      if (!matchName && !matchBadge && !matchStore) return false;
    }
    return true;
  });

  // Store Filter Buttons Strip
  const storesStrip = `
    <div class="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
      <button onclick="filterDiscounterDeals('all')" class="px-2.5 py-1 rounded-xl text-[10px] font-bold transition shrink-0 cursor-pointer ${activeDiscountStore === 'all' ? 'bg-emerald-500 text-black shadow-md' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}">
        ✨ Alle (${globalDiscountDeals.length})
      </button>
      ${Object.keys(DISCOUNT_STORES).map(key => {
        const store = DISCOUNT_STORES[key];
        const isActive = activeDiscountStore === key;
        const count = globalDiscountDeals.filter(d => d.store === key).length;
        return `
          <button onclick="filterDiscounterDeals('${key}')" class="px-2.5 py-1 rounded-xl text-[10px] font-bold transition shrink-0 cursor-pointer flex items-center gap-1 ${isActive ? `${store.bg} ${store.text} border ${store.border} shadow-md` : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}">
            <span>${store.name}</span>
            <span class="text-[9px] opacity-70">(${count})</span>
          </button>
        `;
      }).join('')}
    </div>
  `;

  // Search Bar
  const searchBar = `
    <div class="relative">
      <input type="text" placeholder="Angebote durchsuchen (z.B. Butter, Kaffee, Bio)..." value="${activeDiscountSearch}" oninput="searchDiscounterDeals(this.value)" class="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 pl-8 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition" />
      <i data-lucide="search" class="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5"></i>
      ${activeDiscountSearch ? `<button onclick="searchDiscounterDeals('');" class="absolute right-2.5 top-2 text-gray-400 hover:text-white text-xs font-bold">✕</button>` : ''}
    </div>
  `;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="space-y-2">
        ${storesStrip}
        ${searchBar}
        <div class="text-center py-6 text-gray-500 italic text-xs">
          Keine Angebote für diesen Filter gefunden.
        </div>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  const dealsList = `
    <div class="grid grid-cols-1 gap-2 max-h-[320px] overflow-y-auto pr-1">
      ${filtered.map(deal => {
        const store = DISCOUNT_STORES[deal.store] || { name: deal.store, text: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
        const safeName = typeof escapeHtml === 'function' ? escapeHtml(deal.name) : deal.name;
        const discountPct = deal.discountPct || Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);

        return `
          <div class="p-2.5 bg-black/50 hover:bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 rounded-2xl transition flex items-center justify-between gap-2.5 group">
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center gap-1.5">
                <span class="px-1.5 py-0.2 rounded-md ${store.bg} ${store.text} border ${store.border} text-[9px] font-bold font-mono">
                  ${store.name}
                </span>
                <span class="px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold">
                  -${discountPct}%
                </span>
                ${deal.badge ? `<span class="text-[9px] text-gray-400 font-medium">${deal.badge}</span>` : ''}
              </div>
              <div class="font-bold text-xs text-white group-hover:text-emerald-300 transition truncate" title="${safeName}">
                ${safeName}
              </div>
              <div class="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                <span class="text-white font-bold text-xs text-emerald-400">${deal.price.toFixed(2)} €</span>
                <span class="line-through text-gray-500 text-[10px]">${deal.originalPrice.toFixed(2)} €</span>
                ${deal.unit ? `<span>(${deal.unit})</span>` : ''}
              </div>
            </div>

            <button onclick="addDealToShoppingList('${deal.id}')" class="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold text-[11px] rounded-xl transition shadow-md flex items-center gap-1 shrink-0 cursor-pointer active:scale-95" title="Auf Einkaufsliste übernehmen">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>+ Liste</span>
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.innerHTML = `
    <div class="space-y-2">
      ${storesStrip}
      ${searchBar}
      ${dealsList}
    </div>
  `;

  if (typeof lucide !== 'undefined') lucide.createIcons();
}
window.renderDiscounterDeals = renderDiscounterDeals;

// -------------------------------------------------------------
// DOCK POPUP UI RENDERING & SMART DEAL-RADAR
// -------------------------------------------------------------
function updateShoppingListPopup(skipLucide = false) {
  const rowsContainer = document.getElementById('shopping-list-rows');
  const badgeEl = document.getElementById('shop-badge-count');
  const radarBannerContainer = document.getElementById('shopping-radar-banner-container');
  if (!rowsContainer) return;

  const list = state.shoppingList || [];
  if (badgeEl) {
    if (list.length > 0) {
      badgeEl.classList.remove('hidden');
      badgeEl.innerText = list.length;
    } else {
      badgeEl.classList.add('hidden');
    }
  }

  // Quick Chips rendern
  const chipsContainer = document.getElementById('shop-quick-chips');
  if (chipsContainer) {
    const essentials = QUICK_ESSENTIALS[currentLang] || QUICK_ESSENTIALS.en;
    chipsContainer.innerHTML = essentials.map(item => `
      <button onclick="handleAddShoppingItem('${item}')" class="px-2 py-0.5 bg-white/[0.04] hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-200 border border-white/5 hover:border-emerald-500/30 rounded-lg text-[10px] font-semibold transition cursor-pointer shrink-0">
        + ${item}
      </button>
    `).join('');
  }

  // Smart Deal-Radar Matching
  const matches = getShoppingListRadarMatches();
  if (radarBannerContainer) {
    if (matches.length > 0) {
      radarBannerContainer.classList.remove('hidden');
      const topMatch = matches[0];
      radarBannerContainer.innerHTML = `
        <div class="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-teal-950/60 to-cyan-950/70 border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] space-y-1.5 animate-pulse-slow">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <span class="animate-bounce">⚡</span>
              <span>Spar-Radar: ${matches.length} ${matches.length === 1 ? 'Angebot' : 'Angebote'} gefunden!</span>
            </div>
            <button onclick="switchShoppingTab('deals')" class="text-[10px] text-emerald-400 hover:text-emerald-200 font-bold underline cursor-pointer">
              Alle Deals ➔
            </button>
          </div>
          <div class="text-[11px] text-gray-300 flex items-center justify-between gap-1">
            <span class="truncate">💡 <strong>${escapeHtml(topMatch.item.name)}</strong>: ${topMatch.deal.name} bei <strong>${topMatch.storeInfo.name}</strong> für <strong>${topMatch.deal.price.toFixed(2)} €</strong> (-${topMatch.discountPct}%)</span>
            <button onclick="applyDealToShoppingItem(${topMatch.itemIndex}, '${topMatch.deal.id}')" class="px-2 py-0.5 bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-[9px] rounded-lg shrink-0 cursor-pointer shadow">
              Anpassen
            </button>
          </div>
        </div>
      `;
    } else {
      radarBannerContainer.classList.add('hidden');
      radarBannerContainer.innerHTML = '';
    }
  }

  if (list.length === 0) {
    rowsContainer.innerHTML = `<div class="text-center text-gray-500 italic py-3 text-xs">${tr({ de: 'Einkaufsliste ist leer. Tippe oben oder nutze die Schnell-Chips!', en: 'Shopping list is clear. Type above or tap quick chips!', fr: 'Liste de courses vide. Tape ci-dessus ou utilise les puces rapides !', it: 'La lista della spesa è vuota!', es: '¡La lista de compras está vacía!', el: 'Η λίστα αγορών είναι άδεια!' })}</div>`;
  } else {
    // Gruppierung nach Gängen
    const grouped = {};
    list.forEach((item, originalIdx) => {
      const dept = item.dept || getDepartmentForItem(item.name);
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push({ item, originalIdx });
    });

    let html = '';
    for (const deptKey in grouped) {
      const deptInfo = SHOPPING_DEPARTMENTS[deptKey] || { icon: 'box', color: 'gray', title: { en: 'Other' } };
      const deptTitle = deptInfo.title[currentLang] || deptInfo.title.en || deptKey;
      
      html += `
        <div class="space-y-1 pt-1">
          <div class="flex items-center gap-1.5 text-[10px] font-bold text-[#c084fc] uppercase tracking-wider px-1">
            <i data-lucide="${deptInfo.icon}" class="w-3 h-3 text-${deptInfo.color}-400"></i>
            <span>${deptTitle}</span>
          </div>
      `;

      grouped[deptKey].forEach(({ item, originalIdx }) => {
        const safeEscape = typeof escapeHtml === 'function' ? escapeHtml : (str) => String(str || '');
        const qtyLabel = (item.qty && item.qty > 1) ? `${item.qty}${item.unit ? item.unit : 'x'} ` : '';
        
        // Inline Deal Radar Tag
        let inlineDealBadge = '';
        if (item.dealInfo) {
          const sName = item.dealInfo.storeName || item.dealInfo.store;
          inlineDealBadge = `<span class="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold ml-1 shrink-0">🏷️ ${sName} ${item.dealInfo.price.toFixed(2)}€</span>`;
        } else {
          const autoDeal = findBestDealForShoppingItem(item.name);
          if (autoDeal) {
            inlineDealBadge = `
              <button onclick="applyDealToShoppingItem(${originalIdx}, '${autoDeal.deal.id}')" class="px-1.5 py-0.2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold ml-1 shrink-0 cursor-pointer" title="Deal bei ${autoDeal.storeInfo.name} für ${autoDeal.deal.price.toFixed(2)} € (-${autoDeal.discountPct}%) anwenden">
                🏷️ ${autoDeal.storeInfo.name} ${autoDeal.deal.price.toFixed(2)}€ (-${autoDeal.discountPct}%)
              </button>
            `;
          }
        }

        html += `
          <div class="flex items-center justify-between gap-1.5 p-1.5 bg-black/40 hover:bg-white/[0.04] border border-white/5 rounded-xl text-gray-300 transition group">
            <input type="checkbox" onclick="handleToggleShoppingItem(${originalIdx})" class="w-4 h-4 rounded bg-black border-white/10 text-[#00ff66] accent-[#00ff66] cursor-pointer shrink-0" />
            <div class="flex-1 min-w-0 flex items-center gap-1 pl-1">
              <span class="truncate font-medium text-xs text-[#00f2ff]" title="${safeEscape(item.name)}">${qtyLabel}${safeEscape(item.name)}</span>
              ${inlineDealBadge}
            </div>
            
            <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
              <button onclick="adjustShoppingItemQty(${originalIdx}, -1)" class="w-4 h-4 rounded bg-white/5 hover:bg-white/10 text-[#c0caf5] text-[10px] flex items-center justify-center cursor-pointer font-bold">-</button>
              <span class="text-[10px] font-mono text-[#00f2ff] px-0.5">${item.qty || 1}</span>
              <button onclick="adjustShoppingItemQty(${originalIdx}, 1)" class="w-4 h-4 rounded bg-white/5 hover:bg-white/10 text-[#c0caf5] text-[10px] flex items-center justify-center cursor-pointer font-bold">+</button>
              <button onclick="handleDeleteShoppingItem(${originalIdx})" aria-label="Artikel löschen" class="p-1 text-gray-500 hover:text-red-400 rounded transition cursor-pointer ml-1">
                <i data-lucide="trash-2" class="w-3 h-3"></i>
              </button>
            </div>
          </div>
        `;
      });

      html += `</div>`;
    }
    rowsContainer.innerHTML = html;
  }

  // History Log Rendering
  const historyBox = document.getElementById('shop-history-box');
  const historyList = document.getElementById('shop-history-list');
  const isHistoryVisible = localStorage.getItem('flow_shop_history_visible') === 'true';
  if (historyBox) {
    if (isHistoryVisible) historyBox.classList.remove('hidden');
    else historyBox.classList.add('hidden');
  }
  if (historyList) {
    historyList.innerHTML = '';
    const hist = state.shoppingHistory || [];
    const safeEscape = typeof escapeHtml === 'function' ? escapeHtml : (str) => String(str || '');
    if (hist.length === 0) {
      historyList.innerHTML = `<div class="text-gray-600 italic text-center py-1 text-[9px]">${tr({ de: 'Noch keine Einkäufe.', en: 'No purchases yet.', fr: 'Aucun achat pour le moment.', it: 'Ancora nessun acquisto.', es: 'Aún no hay compras.', el: 'Δεν υπάρχουν ακόμη αγορές.' })}</div>`;
    } else {
      hist.slice().reverse().forEach((hItem, hIdx) => {
        const realIdx = hist.length - 1 - hIdx;
        const hDiv = document.createElement('div');
        hDiv.className = 'flex justify-between items-center py-1 px-1 border-b border-white/[0.02] text-gray-400 text-[10px] hover:bg-white/[0.02] rounded';
        hDiv.innerHTML = `
          <span class="truncate max-w-[140px] line-through text-gray-400 font-medium">${safeEscape(hItem.name)}</span>
          <div class="flex items-center gap-1.5">
            <span class="font-mono text-[8px] text-gray-500">${hItem.date || ''}</span>
            <button onclick="restoreShoppingHistoryItem(${realIdx})" aria-label="Wieder auf Liste setzen" class="text-[#00ff66] hover:text-[#00ff66]/80 text-[9px] font-bold cursor-pointer" title="Wieder auf Liste setzen">＋</button>
          </div>
        `;
        historyList.appendChild(hDiv);
      });
    }
  }

  const tipBox = document.getElementById('panel-daily') || document.getElementById('panel-shopping');
  if (tipBox) { generateSmartShoppingTips(tipBox); }
  if (!skipLucide) { renderLucideIcons(); }
}

function generateSmartShoppingTips(container) {
  const tipEl = document.getElementById('shopping-smart-tip-text');
  if (!tipEl) return;
  const tips = [
    'Tipp: Kaufe frisches Obst & Gemüse zuerst und Kühlwaren ganz zum Schluss!',
    'Tipp: Nutze den Reiter "Deals" für wöchentliche Discounter-Aktionen!',
    'Tipp: Der Spar-Radar zeigt dir automatisch die besten Angebote für deine Liste.'
  ];
  tipEl.innerText = tips[Math.floor(Math.random() * tips.length)];
  tipEl.className = 'text-xs text-[#ff7a00] font-medium';
}
window.generateSmartShoppingTips = generateSmartShoppingTips;

// -------------------------------------------------------------
// SUPERMARKT-MODUS (VOLLBILD / GROSSES MODAL)
// -------------------------------------------------------------
function openSupermarketModal() {
  const modal = document.getElementById('supermarket-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  renderSupermarketModal();
  if (typeof playProceduralSound === 'function') playProceduralSound(0);
}

function closeSupermarketModal() {
  const modal = document.getElementById('supermarket-modal');
  if (modal) modal.classList.add('hidden');
}

function renderSupermarketModal() {
  const container = document.getElementById('supermarket-content');
  const progressEl = document.getElementById('supermarket-progress-bar');
  const countEl = document.getElementById('supermarket-progress-text');
  if (!container) return;

  const list = state.shoppingList || [];
  const hist = state.shoppingHistory || [];
  const total = list.length + hist.length;
  const boughtCount = hist.length;

  // Calculate potential savings with Deal-Radar
  const matches = getShoppingListRadarMatches();
  const totalSavings = matches.reduce((acc, m) => acc + parseFloat(m.savings || 0), 0);

  if (countEl) {
    let text = `${list.length} ${tr({ en: 'items to buy', de: 'Artikel im Plan', fr: 'articles à acheter', it: 'da comprare', es: 'por comprar', el: 'για αγορά' })} (${boughtCount} ${tr({ en: 'in cart', de: 'im Wagen', fr: 'dans le panier', it: 'nel carrello', es: 'en el carrito', el: 'στο καλάθι' })})`;
    if (totalSavings > 0) {
      text += ` • ⚡ Bis zu ${totalSavings.toFixed(2)} € Sparpotenzial!`;
    }
    countEl.innerText = text;
  }

  if (progressEl && total > 0) {
    const pct = Math.round((boughtCount / total) * 100);
    progressEl.style.width = `${pct}%`;
  }

  if (list.length === 0 && hist.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 space-y-3">
        <div class="text-4xl">🛒</div>
        <h4 class="font-bold text-base text-white">${tr({ en: 'Your cart is clear!', de: 'Dein Einkaufswagen ist leer!', fr: 'Ton panier est vide !', it: 'Il tuo carrello è vuoto!', es: '¡Tu carrito está vacío!', el: 'Το καλάθι είναι άδειο!' })}</h4>
        <p class="text-xs text-gray-400">${tr({ en: 'Add groceries above to start your organized shopping trip.', de: 'Füge oben Artikel hinzu oder nutze die Angebote im Discounter-Tab!', fr: 'Ajoute des articles ci-dessus pour préparer tes courses.', it: 'Aggiungi articoli qui sopra per iniziare la spesa.', es: 'Añade artículos arriba para organizar tu compra.', el: 'Προσθέστε προϊόντα παραπάνω για να ξεκινήσετε.' })}</p>
      </div>
    `;
    return;
  }

  // Gruppierung nach Gängen
  const grouped = {};
  list.forEach((item, originalIdx) => {
    const dept = item.dept || getDepartmentForItem(item.name);
    if (!grouped[dept]) grouped[dept] = [];
    grouped[dept].push({ item, originalIdx });
  });

  let html = '<div class="space-y-4">';

  for (const deptKey in grouped) {
    const deptInfo = SHOPPING_DEPARTMENTS[deptKey] || { icon: 'box', color: 'gray', title: { en: 'Other' } };
    const deptTitle = deptInfo.title[currentLang] || deptInfo.title.en || deptKey;

    html += `
      <div class="p-3 bg-white/[0.02] border border-white/10 rounded-2xl space-y-2">
        <div class="flex items-center gap-2 font-bold text-xs text-[#c084fc] pb-1 border-b border-white/5">
          <i data-lucide="${deptInfo.icon}" class="w-4 h-4 text-${deptInfo.color}-400"></i>
          <span>${deptTitle}</span>
          <span class="text-[10px] text-gray-500 font-mono">(${grouped[deptKey].length})</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
    `;

    grouped[deptKey].forEach(({ item, originalIdx }) => {
      const qtyLabel = (item.qty && item.qty > 1) ? `<span class="px-2 py-0.5 rounded-lg bg-[#00f2ff]/20 text-[#00f2ff] font-bold text-xs">${item.qty}${item.unit ? ' ' + item.unit : 'x'}</span>` : '';
      
      let dealTag = '';
      if (item.dealInfo) {
        dealTag = `<span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">🏷️ ${item.dealInfo.storeName || item.dealInfo.store} ${item.dealInfo.price.toFixed(2)}€</span>`;
      }

      html += `
        <div class="flex items-center justify-between p-3 bg-black/40 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 rounded-xl transition cursor-pointer group" onclick="handleToggleShoppingItem(${originalIdx})">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-6 h-6 rounded-lg border-2 border-white/30 group-hover:border-emerald-400 flex items-center justify-center transition">
              <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition"></i>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-bold text-sm text-[#00f2ff] truncate">${escapeHtml(item.name)}</span>
              ${dealTag}
            </div>
          </div>
          <div class="flex items-center gap-2" onclick="event.stopPropagation()">
            ${qtyLabel}
            <button onclick="handleDeleteShoppingItem(${originalIdx})" aria-label="Artikel löschen" class="p-1.5 text-gray-500 hover:text-red-400 rounded-lg transition cursor-pointer">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
  }

  // Bereits im Wagen (History)
  if (hist.length > 0) {
    html += `
      <div class="pt-3 border-t border-white/10">
        <div class="flex items-center justify-between text-xs text-gray-400 font-bold mb-2">
          <span class="flex items-center gap-1.5 text-[#00ff66]">
            <i data-lucide="check-circle-2" class="w-4 h-4"></i>
            <span>${tr({ en: 'In Cart (Bought)', de: 'Bereits im Einkaufswagen', fr: 'Dans le panier', it: 'Nel carrello', es: 'En el carrito', el: 'Στο καλάθι' })} (${hist.length})</span>
          </span>
          <button onclick="clearShoppingHistory()" class="text-[10px] text-gray-500 hover:text-red-400 cursor-pointer">${tr({ en: 'Clear', de: 'Leeren', fr: 'Vider', it: 'Svuota', es: 'Vaciar', el: 'Καθαρισμός' })}</button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 opacity-60">
    `;

    hist.slice().reverse().forEach((hItem, hIdx) => {
      const realIdx = hist.length - 1 - hIdx;
      html += `
        <div class="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-[#00ff66]">
          <span class="line-through truncate text-[#00ff66]">${hItem.name}</span>
          <button onclick="restoreShoppingHistoryItem(${realIdx})" class="px-2 py-0.5 bg-white/5 hover:bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/30 rounded text-[10px] font-semibold cursor-pointer">
            ↩ ${tr({ en: 'Undo', de: 'Zurück', fr: 'Annuler', it: 'Ripristina', es: 'Deshacer', el: 'Αναίρεση' })}
          </button>
        </div>
      `;
    });

    html += `</div></div>`;
  }

  html += '</div>';
  container.innerHTML = html;
  renderLucideIcons();
}

function openShoppingModal() {
  openSupermarketModal();
}

function closeShoppingModal() {
  closeSupermarketModal();
}

function quickAddShopItem(name) {
  handleAddShoppingItem(name);
}

function clearCompletedShopItems() {
  if (!Array.isArray(state.shoppingList)) return;
  saveHistory();
  const completed = state.shoppingList.filter(item => item.checked);
  state.shoppingList = state.shoppingList.filter(item => !item.checked);
  saveState();
  if (typeof renderShoppingRows === 'function') renderShoppingRows();
  if (typeof renderSupermarketModal === 'function') renderSupermarketModal();
  if (completed.length > 0) {
    showToast(typeof tr === 'function' ? tr({
      de: `${completed.length} erledigte Artikel gelöscht! 🗑️`,
      en: `${completed.length} completed items cleared! 🗑️`
    }) : `${completed.length} Artikel gelöscht! 🗑️`);
  }
}

// Fetch live deals on initialization
if (typeof window !== 'undefined') {
  setTimeout(fetchLiveDiscounterDeals, 500);
}

if (typeof window !== 'undefined') {
  window.SHOPPING_DEPARTMENTS = SHOPPING_DEPARTMENTS;
  window.DISCOUNT_STORES = DISCOUNT_STORES;
  window.getDepartmentForItem = getDepartmentForItem;
  window.handleAddShoppingItem = handleAddShoppingItem;
  window.quickAddShopItem = quickAddShopItem;
  window.handleToggleShoppingItem = handleToggleShoppingItem;
  window.handleDeleteShoppingItem = handleDeleteShoppingItem;
  window.adjustShoppingItemQty = adjustShoppingItemQty;
  window.restoreShoppingHistoryItem = restoreShoppingHistoryItem;
  window.toggleShoppingHistory = toggleShoppingHistory;
  window.clearShoppingList = clearShoppingList;
  window.clearCompletedShopItems = clearCompletedShopItems;
  window.clearShoppingHistory = clearShoppingHistory;
  window.addIngredientsToShoppingList = addIngredientsToShoppingList;
  window.openSupermarketModal = openSupermarketModal;
  window.closeSupermarketModal = closeSupermarketModal;
  window.openShoppingModal = openShoppingModal;
  window.closeShoppingModal = closeShoppingModal;
  window.renderSupermarketModal = renderSupermarketModal;
  window.switchShoppingTab = switchShoppingTab;
  window.renderDiscounterDeals = renderDiscounterDeals;
  window.filterDiscounterDeals = filterDiscounterDeals;
  window.findBestDealForShoppingItem = findBestDealForShoppingItem;
  window.getShoppingListRadarMatches = getShoppingListRadarMatches;
  window.addDealToShoppingList = addDealToShoppingList;
  window.applyDealToShoppingItem = applyDealToShoppingItem;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SHOPPING_DEPARTMENTS = SHOPPING_DEPARTMENTS;
  globalThis.DISCOUNT_STORES = DISCOUNT_STORES;
  globalThis.getDepartmentForItem = getDepartmentForItem;
  globalThis.handleAddShoppingItem = handleAddShoppingItem;
  globalThis.quickAddShopItem = quickAddShopItem;
  globalThis.handleToggleShoppingItem = handleToggleShoppingItem;
  globalThis.handleDeleteShoppingItem = handleDeleteShoppingItem;
  globalThis.adjustShoppingItemQty = adjustShoppingItemQty;
  globalThis.restoreShoppingHistoryItem = restoreShoppingHistoryItem;
  globalThis.toggleShoppingHistory = toggleShoppingHistory;
  globalThis.clearShoppingList = clearShoppingList;
  globalThis.clearCompletedShopItems = clearCompletedShopItems;
  globalThis.clearShoppingHistory = clearShoppingHistory;
  globalThis.addIngredientsToShoppingList = addIngredientsToShoppingList;
  globalThis.openSupermarketModal = openSupermarketModal;
  globalThis.closeSupermarketModal = closeSupermarketModal;
  globalThis.openShoppingModal = openShoppingModal;
  globalThis.closeShoppingModal = closeShoppingModal;
  globalThis.renderSupermarketModal = renderSupermarketModal;
  globalThis.switchShoppingTab = switchShoppingTab;
  globalThis.renderDiscounterDeals = renderDiscounterDeals;
  globalThis.filterDiscounterDeals = filterDiscounterDeals;
  globalThis.searchDiscounterDeals = searchDiscounterDeals;
  globalThis.findBestDealForShoppingItem = findBestDealForShoppingItem;
  globalThis.getShoppingListRadarMatches = getShoppingListRadarMatches;
  globalThis.addDealToShoppingList = addDealToShoppingList;
  globalThis.applyDealToShoppingItem = applyDealToShoppingItem;
}
