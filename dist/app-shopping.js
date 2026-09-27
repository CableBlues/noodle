// app-shopping.js: Umfassende Smart Shopping Suite mit Gängen, Mengen, Quick-Chips & Supermarkt-Modus

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

function handleAddShoppingItem(explicitName = null) {
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

  // Bulk-Splitter: Komma oder Zeilenumbruch
  const itemsToAdd = rawInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);

  itemsToAdd.forEach(text => {
    // Check if quantity is mentioned e.g. "2x Milch" or "500g Pasta" or "3 Äpfel"
    let name = text;
    let qty = 1;
    let unit = '';

    const qtyMatch = text.match(/^(\d+)\s*(x|kg|g|l|ml|bund|stk|packung|dose|gläser|glas)?\s+(.+)$/i);
    if (qtyMatch) {
      qty = parseInt(qtyMatch[1], 10) || 1;
      unit = qtyMatch[2] || '';
      name = qtyMatch[3].trim();
    }

    const dept = getDepartmentForItem(name);

    // Prüfen ob bereits vorhanden -> dann Menge erhöhen
    const existingIndex = state.shoppingList.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
    if (existingIndex !== -1) {
      state.shoppingList[existingIndex].qty = (state.shoppingList[existingIndex].qty || 1) + qty;
      if (unit) state.shoppingList[existingIndex].unit = unit;
    } else {
      state.shoppingList.push({
        id: 'shop-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        name,
        qty,
        unit,
        dept,
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
  handleAddShoppingItem(hItem.name);
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
    en: `Added ${count} ingredients to shopping list! 🛒`,
    fr: `${count} ingrédients ajoutés à la liste de courses ! 🛒`,
    it: `${count} ingredienti aggiunti alla lista della spesa! 🛒`,
    es: `¡${count} ingredientes añadidos a la lista! 🛒`,
    el: `${count} υλικά προστέθηκαν στη λίστα αγορών! 🛒`
  }));
}

// -------------------------------------------------------------
// DOCK POPUP UI RENDERING
// -------------------------------------------------------------
function updateShoppingListPopup(skipLucide = false) {
  const rowsContainer = document.getElementById('shopping-list-rows');
  const badgeEl = document.getElementById('shop-badge-count');
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

  const panel = rowsContainer.closest('.dock-popover-panel') || document.getElementById('panel-shopping');
  if (skipLucide && panel && panel.classList.contains('hidden')) {
    return;
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
        html += `
          <div class="flex items-center justify-between gap-1.5 p-1.5 bg-black/40 hover:bg-white/[0.04] border border-white/5 rounded-xl text-gray-300 transition group">
            <input type="checkbox" onclick="handleToggleShoppingItem(${originalIdx})" class="w-4 h-4 rounded bg-black border-white/10 text-[#00ff66] accent-[#00ff66] cursor-pointer shrink-0" />
            <span class="truncate font-medium flex-1 pl-1 text-xs text-[#00f2ff]" title="${safeEscape(item.name)}">${qtyLabel}${safeEscape(item.name)}</span>
            
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
    'Tipp: Nutze den Supermarkt-Modus für große Tasten zum schnellen Abhaken.',
    'Tipp: Sortiere deine Liste nach Regal-Gängen, um Zeit zu sparen.'
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

  if (countEl) {
    countEl.innerText = `${list.length} ${tr({ en: 'items to buy', de: 'Artikel im Plan', fr: 'articles à acheter', it: 'da comprare', es: 'por comprar', el: 'για αγορά' })} (${boughtCount} ${tr({ en: 'in cart', de: 'im Wagen', fr: 'dans le panier', it: 'nel carrello', es: 'en el carrito', el: 'στο καλάθι' })})`;
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
        <p class="text-xs text-gray-400">${tr({ en: 'Add groceries above to start your organized shopping trip.', de: 'Füge oben Artikel hinzu, um deinen geordneten Einkauf zu starten.', fr: 'Ajoute des articles ci-dessus pour préparer tes courses.', it: 'Aggiungi articoli qui sopra per iniziare la spesa.', es: 'Añade artículos arriba para organizar tu compra.', el: 'Προσθέστε προϊόντα παραπάνω για να ξεκινήσετε.' })}</p>
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
      html += `
        <div class="flex items-center justify-between p-3 bg-black/40 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 rounded-xl transition cursor-pointer group" onclick="handleToggleShoppingItem(${originalIdx})">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-6 h-6 rounded-lg border-2 border-white/30 group-hover:border-emerald-400 flex items-center justify-center transition">
              <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition"></i>
            </div>
            <span class="font-bold text-sm text-[#00f2ff] truncate">${escapeHtml(item.name)}</span>
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

if (typeof window !== 'undefined') {
  window.SHOPPING_DEPARTMENTS = SHOPPING_DEPARTMENTS;
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
}
if (typeof globalThis !== 'undefined') {
  globalThis.SHOPPING_DEPARTMENTS = SHOPPING_DEPARTMENTS;
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
}
