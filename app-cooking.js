/**
 * @file app-cooking.js
 * @module CookingStudio
 * @description
 * Rezept-Verwaltung, Vorratskammer-Abgleich (`pantryItems`) und interaktiver
 * Schritt-für-Schritt-Kochmodus. Ermöglicht das direkte Übertragen fehlender
 * Zutaten auf die Einkaufsliste (`app-shopping.js`).
 */

const DEFAULT_CURATED_RECIPES = [
  {
    id: 'pasta-tomate',
    title: 'Schnelle Mediterrane Tomaten-Pasta',
    duration: '15 Min',
    category: 'schnell',
    servings: 2,
    tags: ['Schnell', 'Vegetarisch', 'Pasta'],
    ingredients: ['250g Pasta', '400g Tomaten', '2 Zehen Knoblauch', '2 EL Olivenöl', '1 Handvoll Basilikum', '50g Parmesan', '1 Prise Salz', '1 Prise Pfeffer'],
    steps: [
      'Bring reichlich gesalzenes Wasser in einem großen Topf zum Kochen und gare die 250g Pasta ca. 9-10 Minuten al dente.',
      'Schneide in der Zwischenzeit den Knoblauch in feine Scheiben und würfle die frischen Tomaten.',
      'Erhitze 2 EL Olivenöl in einer Pfanne auf mittlerer Stufe und schwitze den Knoblauch 1 Minute sanft an.',
      'Gib die Tomatenwürfel hinzu und lasse die Sauce ca. 5 Minuten leicht einkochen. Mit Salz und Pfeffer abschmecken.',
      'Gieße die Pasta ab, hebe etwas Nudelwasser auf und schwenke die Nudeln direkt in der Tomatensauce.',
      'Mit frischem Basilikum und frisch geriebenem Parmesan garnieren und heiß servieren!'
    ]
  },
  {
    id: 'wrap-huhn',
    title: 'High-Protein Hähnchen & Avocado Wrap',
    duration: '15 Min',
    category: 'protein',
    servings: 2,
    tags: ['High Protein', 'Schnell', 'Fitness'],
    ingredients: ['2 Vollkorn Wraps', '250g Hähnchenbrust', '1 Avocado', '100g Gurke', '100g Griechischer Joghurt', '50g Frischer Spinat', '1 TL Paprikapulver', '1 Prise Salz'],
    steps: [
      'Schneide die Hähnchenbrust in Streifen und würze sie mit Salz und Paprikapulver.',
      'Brate das Hähnchen in einer heißen Pfanne mit etwas Öl ca. 6-7 Minuten goldbraun durch.',
      'Schneide Avocado und Gurke in feine Streifen und wasche den Spinat gründlich.',
      'Erwärme die Wraps kurz für 20 Sekunden in einer trockenen Pfanne für maximale Flexibilität.',
      'Bestreiche die Wraps mit griechischem Joghurt, belege sie mit Spinat, Gurke, Avocado und dem gebratenen Hähnchen.',
      'Die Seiten einklappen, stramm aufrollen, diagonal durchschneiden und genießen.'
    ]
  },
  {
    id: 'omelette',
    title: 'Power Protein-Omelett mit Feta & Spinat',
    duration: '10 Min',
    category: 'protein',
    servings: 1,
    tags: ['High Protein', 'Vegetarisch', 'Frühstück'],
    ingredients: ['3 Eier', '60g Feta Käse', '80g Frischer Blattspinat', '1 TL Butter', '1 Prise Pfeffer', '1 Prise Muskatnuss'],
    steps: [
      'Verquirle 3 Eier in einer Schüssel mit Pfeffer und einer kleinen Prise Muskatnuss.',
      'Lasse 1 TL Butter in einer beschichteten Pfanne auf mittlerer Hitze schmelzen und dünste den Spinat 1 Minute an.',
      'Gieße die Eiermasse gleichmäßig über den Spinat in die Pfanne.',
      'Lasse das Omelett bei mittlerer Hitze ca. 3-4 Minuten stocken, bis die Unterseite goldgelb ist.',
      'Krümle 60g Feta über eine Hälfte des Omeletts und klappe die andere Hälfte vorsichtig darüber.',
      'Noch 1 Minute ruhen lassen, damit der Feta leicht cremig schmilzt, und direkt servieren!'
    ]
  },
  {
    id: 'linsen-curry',
    title: 'Cremiges Rote-Linsen Kokos-Curry',
    duration: '20 Min',
    category: 'vegan',
    servings: 3,
    tags: ['Vegan', 'Meal Prep', 'Curry'],
    ingredients: ['200g Rote Linsen', '400ml Kokosmilch', '1 Zwiebel', '2 Karotten', '1 Stück Ingwer', '1 EL Currypulver', '250ml Gemüsebrühe', '1 Handvoll Koriander'],
    steps: [
      'Würfle die Zwiebel, schneide Karotten in Scheiben und reibe den frischen Ingwer fein.',
      'Erhitze etwas Öl in einem Topf und schwitze Zwiebel, Ingwer und 1 EL Currypulver 2 Minuten an.',
      'Spüle die roten Linsen unter kaltem Wasser ab und gib sie zusammen mit den Karotten in den Topf.',
      'Mit 400ml Kokosmilch und 250ml Gemüsebrühe aufgießen und aufkochen lassen.',
      'Bei mittlerer Hitze ca. 12-15 Minuten sanft köcheln lassen, bis die Linsen butterweich und sämig sind.',
      'Mit Salz, Pfeffer und Limettensaft abschmecken. Mit frischem Koriander servieren (optional mit Reis).'
    ]
  },
  {
    id: 'quinoa-bowl',
    title: 'Bunte Buddha Bowl mit Kichererbsen',
    duration: '20 Min',
    category: 'vegan',
    servings: 2,
    tags: ['Vegan', 'Meal Prep', 'Bowls'],
    ingredients: ['150g Quinoa', '1 Dose Kichererbsen', '1 Gurke', '1 Paprika', '1 Avocado', '2 EL Tahini', '1 EL Zitronensaft', '1 EL Olivenöl'],
    steps: [
      'Spüle Quinoa heiß ab und koche ihn mit der doppelten Menge Wasser und etwas Salz ca. 15 Minuten gar.',
      'Spüle Kichererbsen ab, tupfe sie trocken und röste sie in einer Pfanne mit etwas Olivenöl und Paprika 5 Minuten knusprig.',
      'Schneide Gurke, Paprika und Avocado in mundgerechte Scheiben.',
      'Rühre für das Dressing 2 EL Tahini mit 1 EL Zitronensaft, 2 EL warmem Wasser, Salz und Pfeffer cremig.',
      'Richte Quinoa in zwei Schalen an, platziere Gemüse und geröstete Kichererbsen darauf und beträufle alles mit dem Tahini-Dressing.'
    ]
  },
  {
    id: 'lachs-reis',
    title: 'Lachsfilet aus der Pfanne mit Brokkoli & Reis',
    duration: '20 Min',
    category: 'protein',
    servings: 2,
    tags: ['High Protein', 'Gesund', 'Fisch'],
    ingredients: ['2 Lachsfilets (ca. 300g)', '150g Basmati Reis', '300g Brokkoli', '1 Zitrone', '1 EL Sojasauce', '1 EL Butter', '1 Prise Meersalz'],
    steps: [
      'Gare den Basmati Reis nach Packungsanleitung in leicht gesalzenem Wasser ca. 12 Minuten.',
      'Teile den Brokkoli in Röschen und dünste ihn in einem Topf mit wenig Salzwasser oder Dampfeinsatz für 6 Minuten bissfest.',
      'Tupfe die Lachsfilets trocken, salze sie leicht und brate sie in einer heißen Pfanne mit 1 EL Butter auf der Hautseite ca. 4 Minuten knusprig.',
      'Wende den Lachs vorsichtig und brate ihn für weitere 2-3 Minuten auf mittlerer Stufe saftig durch.',
      'Beträufle den Lachs mit etwas frischem Zitronensaft und einem Spritzer Sojasauce.',
      'Reis, Brokkoli und Lachsfilet auf Tellern anrichten und sofort genießen.'
    ]
  },
  {
    id: 'shakshuka',
    title: 'Wärmende Shakshuka mit Feta & Eiern',
    duration: '20 Min',
    category: 'vegetarisch',
    servings: 2,
    tags: ['Vegetarisch', 'Pfannengericht', 'Klassiker'],
    ingredients: ['1 Dose gehackte Tomaten', '1 Rote Paprika', '1 Zwiebel', '2 Zehen Knoblauch', '3 Eier', '80g Feta Käse', '1 TL Kreuzkümmel', '1 Fladenbrot'],
    steps: [
      'Würfle Zwiebel und Paprika und hacke den Knoblauch fein.',
      'Dünste Zwiebel und Paprika in Olivenöl für 5 Minuten weich. Knoblauch und 1 TL Kreuzkümmel kurz mitbraten.',
      'Gib die gehackten Tomaten dazu, salze und pfeffere und lasse die Sauce ca. 8 Minuten sämig einköcheln.',
      'Mache mit einem Löffel 3 kleine Mulden in die Sauce und schlage vorsichtig jeweils ein Ei hinein.',
      'Feta darüber krümeln, Deckel auf die Pfanne setzen und bei geringer Hitze 5-6 Minuten stocken lassen (bis das Eiweiß fest, Eigelb noch flüssig ist).',
      'Mit frischer Petersilie bestreuen und direkt aus der Pfanne mit getoastetem Fladenbrot dippen!'
    ]
  },
  {
    id: 'kartoffel-suppe',
    title: 'Cremige Kartoffel-Lauch-Suppe',
    duration: '25 Min',
    category: 'vegetarisch',
    servings: 4,
    tags: ['Suppen', 'Vegetarisch', 'Comfort Food'],
    ingredients: ['600g Kartoffeln', '1 Stange Lauch', '1 Zwiebel', '800ml Gemüsebrühe', '100ml Sahne oder Hafer-Cuisine', '1 EL Butter', '1 Prise Muskat'],
    steps: [
      'Schäle und würfle die Kartoffeln. Wasche den Lauch gründlich und schneide ihn in Ringe.',
      'Dünste Zwiebel und Lauch in 1 EL Butter in einem großen Topf für ca. 3 Minuten an.',
      'Kartoffelwürfel hinzugeben, mit 800ml Gemüsebrühe aufgießen und aufkochen lassen.',
      'Bei mittlerer Hitze ca. 15-18 Minuten köcheln lassen, bis die Kartoffeln weich sind.',
      'Topf vom Herd nehmen, Sahne dazugeben und mit dem Pürierstab cremig fein pürieren.',
      'Mit Salz, Pfeffer und einer Prise frischer Muskatnuss abschmecken und servieren.'
    ]
  }
];

function getCookingState() {
  if (!state.cooking) {
    state.cooking = {
      pantryItems: [],
      recipes: DEFAULT_CURATED_RECIPES,
      activeRecipeId: null,
      activeRecipe: null,
      activeStepIndex: 0,
      servingsMultiplier: 1,
      filterCategory: 'all',
      searchQuery: '',
      activeTimer: null
    };
  }
  // Ensure recipes array exists and is populated
  if (!Array.isArray(state.cooking.recipes) || state.cooking.recipes.length === 0) {
    state.cooking.recipes = [...DEFAULT_CURATED_RECIPES];
  }
  if (typeof state.cooking.activeStepIndex !== 'number') {
    state.cooking.activeStepIndex = 0;
  }
  if (typeof state.cooking.servingsMultiplier !== 'number' || state.cooking.servingsMultiplier <= 0) {
    state.cooking.servingsMultiplier = 1;
  }
  return state.cooking;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ----------------------------------------------------------------------------
// SERVING SCALER UTILITY
// ----------------------------------------------------------------------------
function scaleIngredientText(ingredientStr, multiplier) {
  if (!ingredientStr || multiplier === 1) return ingredientStr;
  
  // Check if string starts with a fraction (e.g. 1/2 Zitrone)
  const fractionMatch = ingredientStr.match(/^(\d+)\s*\/\s*(\d+)\s*(.*)$/);
  if (fractionMatch) {
    const val = (parseFloat(fractionMatch[1]) / parseFloat(fractionMatch[2])) * multiplier;
    const rest = fractionMatch[3];
    return `${formatScaledNumber(val)} ${rest}`.trim();
  }

  // Otherwise match standard number + unit (e.g. 250g Pasta, 1 Dose Tomaten, 400ml Kokosmilch)
  return ingredientStr.replace(/^(\d+(?:[.,]\d+)?)\s*([a-zA-ZäöüÄÖÜ]+|\b)/, (match, number, unit) => {
    const parsed = parseFloat(number.replace(',', '.'));
    if (isNaN(parsed)) return match;
    const scaled = parsed * multiplier;
    return `${formatScaledNumber(scaled)}${unit ? (unit.length <= 2 ? unit : ' ' + unit) : ''}`;
  });
}

function formatScaledNumber(val) {
  if (val <= 0) return '0';
  if (Math.abs(val - Math.round(val)) < 0.05) {
    return String(Math.round(val));
  }
  if (Math.abs(val - 0.5) < 0.05) return '½';
  if (Math.abs(val - 0.25) < 0.05) return '¼';
  if (Math.abs(val - 0.75) < 0.05) return '¾';
  if (Math.abs(val - 1.5) < 0.05) return '1 ½';
  if (Math.abs(val - 2.5) < 0.05) return '2 ½';
  return val.toFixed(1).replace('.0', '').replace('.', ',');
}

// ----------------------------------------------------------------------------
// INGREDIENT & PANTRY MANAGEMENT
// ----------------------------------------------------------------------------
function addCookingIngredient(value) {
  const text = String(value || '').trim();
  if (!text) return false;
  const cooking = getCookingState();
  const normalized = text.toLowerCase();
  const exists = (cooking.pantryItems || []).some(item => String(item).trim().toLowerCase() === normalized);
  if (exists) return false;
  if (!Array.isArray(cooking.pantryItems)) cooking.pantryItems = [];
  cooking.pantryItems.push(text);
  saveState();
  return true;
}

function removeCookingIngredient(index) {
  const cooking = getCookingState();
  if (!Array.isArray(cooking.pantryItems) || index < 0 || index >= cooking.pantryItems.length) return;
  cooking.pantryItems.splice(index, 1);
  saveState();
  renderCookingPanel(true);
}

function clearCookingPantry() {
  const cooking = getCookingState();
  cooking.pantryItems = [];
  saveState();
  renderCookingPanel(true);
  if (typeof playProceduralSound === 'function') playProceduralSound(11);
}

function resetCookingPantry() {
  clearCookingPantry();
}

// ----------------------------------------------------------------------------
// DYNAMIC SKILLET GENERATOR (RESTEVERWERTUNG)
// ----------------------------------------------------------------------------
function buildDynamicRecipeFromPantry(pantry) {
  const items = pantry.map(i => i.trim().toLowerCase()).filter(Boolean);
  if (items.length === 0) return null;

  const carbs = items.filter(i => /(pasta|nudel|reis|kartoffel|brot|wrap|toast|fladen|grieß|hafer|baguette|rice|potato|bread|oats)/i.test(i));
  const proteins = items.filter(i => /(hähnchen|huhn|fleisch|rind|schwein|fisch|lachs|tuna|thunfisch|ei|tofu|bohnen|linsen|kichererbsen|quark|chicken|meat|beef|pork|fish|salmon|egg|beans|lentils)/i.test(i));
  const veggies = items.filter(i => /(tomate|gurke|paprika|zucchini|aubergine|spinat|pilz|champignon|zwiebel|knoblauch|karotte|möhre|brokkoli|tomato|cucumber|pepper|spinach|mushroom|onion|garlic|carrot|broccoli)/i.test(i));
  const dairy = items.filter(i => /(käse|feta|parmesan|mozzarella|butter|sahne|joghurt|frischkäse|schmand|cheese|cream|yogurt)/i.test(i));

  let duration = "15 Min";
  const primaryCarb = carbs[0] || null;
  const primaryProtein = proteins[0] || null;
  const primaryVeggie = veggies[0] || null;
  const primaryDairy = dairy[0] || null;

  let title = "Kreative Restepfanne";
  if (primaryCarb && primaryProtein && primaryVeggie) {
    title = `Herzhafte ${capitalize(primaryCarb)}-Pfanne mit ${capitalize(primaryProtein)} & ${capitalize(primaryVeggie)}`;
  } else if (primaryCarb && primaryDairy) {
    title = `Cremiges ${capitalize(primaryCarb)}-Gericht mit geschmolzenem ${capitalize(primaryDairy)}`;
  } else if (primaryProtein && primaryVeggie) {
    title = `Pfannengerührtes ${capitalize(primaryProtein)} mit ${capitalize(primaryVeggie)}`;
  } else if (primaryCarb && primaryVeggie) {
    title = `${capitalize(primaryCarb)} mit frischem ${capitalize(primaryVeggie)}`;
  } else if (primaryProtein && primaryDairy) {
    title = `Herzhaftes ${capitalize(primaryProtein)} überbacken mit ${capitalize(primaryDairy)}`;
  } else if (primaryProtein) {
    title = `Schnelles Protein-Gericht (${capitalize(primaryProtein)})`;
  } else if (primaryCarb) {
    title = `Sättigende ${capitalize(primaryCarb)}-Kreation`;
  } else if (primaryVeggie) {
    title = `Bunte ${capitalize(primaryVeggie)}-Pfanne`;
  } else {
    title = `Zutaten-Kombination: ${items.map(capitalize).join(' & ')}`;
  }

  let steps = [
    "Vorbereitung: Reinige deine Arbeitsfläche und wasche alle frischen Zutaten gründlich ab."
  ];

  let prepIngredients = [...veggies, ...proteins].filter(i => !/(ei|linsen|bohnen|egg|lentil|bean)/i.test(i));
  if (prepIngredients.length > 0) {
    steps.push(`Schneide ${prepIngredients.map(capitalize).join(', ')} in gleichmäßige, mundgerechte Stücke.`);
  }

  if (primaryCarb) {
    if (/(pasta|nudel|reis|grieß|linsen|rice|lentil)/i.test(primaryCarb)) {
      steps.push(`Bringe gesalzenes Wasser zum Kochen und bereite ${capitalize(primaryCarb)} bissfest nach Packungsanleitung zu.`);
    } else if (/(kartoffel|potato)/i.test(primaryCarb)) {
      steps.push(`Vorkoche die ${capitalize(primaryCarb)} kurz oder brate sie direkt in feinen Spalten mit etwas Öl ca. 10 Min goldgelb an.`);
    } else if (/(brot|wrap|toast|fladen|baguette|bread)/i.test(primaryCarb)) {
      steps.push(`Erwärme ${capitalize(primaryCarb)} kurz in einer trockenen Pfanne oder im Toaster für das beste Röstaroma.`);
    }
  }

  let panItems = [...proteins, ...veggies].filter(i => !/(pasta|nudel|reis|brot|wrap|toast|fladen|baguette|rice|bread)/i.test(i));
  if (panItems.length > 0) {
    let verb = proteins.length > 0 
      ? "Brate zuerst die Proteinquelle scharf an und füge kurz darauf das Gemüse hinzu"
      : "Dünste das Gemüse mit etwas gutem Öl in einer heißen Pfanne für ca. 5 Min an";
    steps.push(`${verb} (${panItems.map(capitalize).join(', ')}).`);
  }

  if (primaryCarb && panItems.length > 0) {
    steps.push(`Vermenge das Gekochte (${capitalize(primaryCarb)}) direkt in der warmen Pfanne mit den übrigen Zutaten.`);
  }

  if (primaryDairy) {
    steps.push(`Füge ${capitalize(primaryDairy)} hinzu. Lasse ihn kurz mitschmelzen oder ziehe ihn sanft unter die heiße Pfannenmasse.`);
  }

  steps.push("Abschluss: Schmecke dein Gericht mit Salz, Pfeffer und frischen Kräutern ab. Heiß servieren und genießen!");

  return {
    id: 'dynamic-generated',
    title,
    duration,
    servings: 2,
    tags: ['Resteverwertung', 'Kreativ'],
    ingredients: items.map(capitalize),
    steps
  };
}

function calculateRecipeMatch(recipe, pantry) {
  if (!recipe || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) return { percent: 0, matched: [], missing: [] };
  const pantryNorm = (pantry || []).map(p => String(p).trim().toLowerCase()).filter(Boolean);
  if (pantryNorm.length === 0) return { percent: 0, matched: [], missing: recipe.ingredients };

  let matched = [];
  let missing = [];

  recipe.ingredients.forEach(ing => {
    const norm = String(ing).toLowerCase();
    const hasMatch = pantryNorm.some(p => norm.includes(p) || p.includes(norm.replace(/^\d+[\w\s.,/]*\b/, '').trim()));
    if (hasMatch) {
      matched.push(ing);
    } else {
      missing.push(ing);
    }
  });

  const percent = Math.round((matched.length / recipe.ingredients.length) * 100);
  return { percent, matched, missing };
}

function suggestCookingRecipe() {
  const cooking = getCookingState();
  const pantry = (cooking.pantryItems || []).map(item => String(item).trim().toLowerCase()).filter(Boolean);
  const recipes = cooking.recipes || DEFAULT_CURATED_RECIPES;

  if (!pantry.length) {
    cooking.activeRecipe = null;
    cooking.activeRecipeId = null;
    saveState();
    return null;
  }

  const ranked = recipes.map(recipe => {
    const match = calculateRecipeMatch(recipe, pantry);
    return { ...recipe, matchPercent: match.percent, matchedCount: match.matched.length };
  }).sort((a, b) => b.matchPercent - a.matchPercent);

  const best = (ranked[0] && ranked[0].matchedCount >= 2) ? ranked[0] : buildDynamicRecipeFromPantry(pantry);

  if (best) {
    cooking.activeRecipeId = best.id;
    cooking.activeRecipe = best;
    cooking.activeStepIndex = 0;
  }
  
  saveState();
  return best;
}

// ----------------------------------------------------------------------------
// STEP-BY-STEP COOKING MODE & TIMERS & TTS
// ----------------------------------------------------------------------------
let activeCookingTimerInterval = null;
let activeCookingTimerSeconds = 0;
let activeCookingTimerTotal = 0;
let activeCookingTimerStep = null;

function extractMinutesFromText(text) {
  if (!text) return null;
  const match = text.match(/(\d+)\s*(?:-|bis|\s+)?(?:\d+)?\s*(?:min|minute|minuten)\b/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

function startCookingTimer(minutes, stepIndex) {
  stopCookingTimer();
  activeCookingTimerTotal = minutes * 60;
  activeCookingTimerSeconds = activeCookingTimerTotal;
  activeCookingTimerStep = stepIndex;

  if (typeof playProceduralSound === 'function') playProceduralSound(3);

  activeCookingTimerInterval = setInterval(() => {
    activeCookingTimerSeconds--;
    updateCookingTimerDisplay();

    if (activeCookingTimerSeconds <= 0) {
      stopCookingTimer();
      onCookingTimerFinished(minutes);
    }
  }, 1000);

  renderCookingPanel(true);
}

function stopCookingTimer() {
  if (activeCookingTimerInterval) {
    clearInterval(activeCookingTimerInterval);
    activeCookingTimerInterval = null;
  }
  activeCookingTimerSeconds = 0;
  activeCookingTimerTotal = 0;
  activeCookingTimerStep = null;
  renderCookingPanel(true);
}

function updateCookingTimerDisplay() {
  const el = document.getElementById('cooking-live-timer');
  if (!el) return;
  const mins = Math.floor(activeCookingTimerSeconds / 60);
  const secs = activeCookingTimerSeconds % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  el.textContent = formatted;
}

function onCookingTimerFinished(minutes) {
  if (typeof playProceduralSound === 'function') {
    playProceduralSound(1); // Finish chime
    setTimeout(() => playProceduralSound(1), 400);
  }

  // Voice notification
  const msg = `Der ${minutes}-Minuten Koch-Timer ist fertig! Bitte Pfanne oder Topf prüfen.`;
  speakCookingText(msg);

  if (typeof showFloatingToast === 'function') {
    showFloatingToast(`⏱️ Koch-Timer (${minutes} Min.) beendet!`, 'success');
  }
}

function speakCookingText(text) {
  if (!text) return;
  if (typeof speakWithProfile === 'function') {
    speakWithProfile(text, 'chef');
    return;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined') {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = (typeof currentLang !== 'undefined' && currentLang) ? (currentLang === 'de' ? 'de-DE' : 'en-US') : 'de-DE';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

function readCurrentCookingStepAloud() {
  const cooking = getCookingState();
  const recipe = cooking.activeRecipe;
  if (!recipe || !Array.isArray(recipe.steps)) return;
  const stepIdx = cooking.activeStepIndex || 0;
  const stepText = recipe.steps[stepIdx];
  if (!stepText) return;

  const header = `Schritt ${stepIdx + 1} von ${recipe.steps.length}. `;
  speakCookingText(header + stepText);
  if (typeof playProceduralSound === 'function') playProceduralSound(0);
}

function nextCookingStep() {
  const cooking = getCookingState();
  const recipe = cooking.activeRecipe;
  if (!recipe || !Array.isArray(recipe.steps)) return;
  if (cooking.activeStepIndex < recipe.steps.length - 1) {
    cooking.activeStepIndex++;
    saveState();
    renderCookingPanel(true);
    if (typeof playProceduralSound === 'function') playProceduralSound(2);
    // Auto read step
    readCurrentCookingStepAloud();
  }
}

function prevCookingStep() {
  const cooking = getCookingState();
  if (cooking.activeStepIndex > 0) {
    cooking.activeStepIndex--;
    saveState();
    renderCookingPanel(true);
    if (typeof playProceduralSound === 'function') playProceduralSound(2);
  }
}

function setCookingStep(stepIndex) {
  const cooking = getCookingState();
  const recipe = cooking.activeRecipe;
  if (!recipe || !Array.isArray(recipe.steps)) return;
  if (stepIndex >= 0 && stepIndex < recipe.steps.length) {
    cooking.activeStepIndex = stepIndex;
    saveState();
    renderCookingPanel(true);
  }
}

function changeServingsMultiplier(delta) {
  const cooking = getCookingState();
  const current = cooking.servingsMultiplier || 1;
  const updated = Math.max(0.5, Math.min(6, current + delta));
  cooking.servingsMultiplier = updated;
  saveState();
  renderCookingPanel(true);
  if (typeof playProceduralSound === 'function') playProceduralSound(6);
}

// ----------------------------------------------------------------------------
// SELECT & MANAGE RECIPES
// ----------------------------------------------------------------------------
function selectActiveRecipe(recipeId) {
  const cooking = getCookingState();
  const found = (cooking.recipes || DEFAULT_CURATED_RECIPES).find(r => r.id === recipeId);
  if (found) {
    cooking.activeRecipeId = found.id;
    cooking.activeRecipe = found;
    cooking.activeStepIndex = 0;
    currentCookingTab = 'mode';
    saveState();
    renderCookingPanel(true);
    if (typeof playProceduralSound === 'function') playProceduralSound(0);
  }
}

let currentCookingTab = 'recipes'; // 'recipes' | 'mode' | 'pantry' | 'new_recipe'

function switchCookingTab(tab) {
  currentCookingTab = tab;
  renderCookingPanel(true);
  if (typeof playProceduralSound === 'function') playProceduralSound(0);
}

function handleCookingAddIngredient() {
  const input = document.getElementById('cooking-ingredient-input');
  if (!input) return;
  const added = addCookingIngredient(input.value);
  if (added) {
    input.value = '';
    renderCookingPanel(true);
    if (typeof playProceduralSound === 'function') playProceduralSound(3);
  }
}

function handleQuickAddStaple(name) {
  const added = addCookingIngredient(name);
  if (added) {
    renderCookingPanel(true);
    if (typeof playProceduralSound === 'function') playProceduralSound(3);
  }
}

function handleCookingSuggest() {
  const recipe = suggestCookingRecipe();
  if (recipe) {
    currentCookingTab = 'mode';
    renderCookingPanel(true);
    if (typeof playProceduralSound === 'function') playProceduralSound(0);
  } else {
    currentCookingTab = 'pantry';
    renderCookingPanel(true);
  }
}

function addRecipeMissingIngredientsToShopping() {
  const cooking = getCookingState();
  const activeRecipe = cooking.activeRecipe;
  if (!activeRecipe || !Array.isArray(activeRecipe.ingredients)) return;
  
  const match = calculateRecipeMatch(activeRecipe, cooking.pantryItems || []);
  const itemsToAdd = (match.missing && match.missing.length > 0) ? match.missing : activeRecipe.ingredients;
  const scaledItems = itemsToAdd.map(item => scaleIngredientText(item, cooking.servingsMultiplier || 1));

  if (typeof importRecipeIngredientsToShoppingList === 'function') {
    const addedCount = importRecipeIngredientsToShoppingList(scaledItems, activeRecipe.title);
    if (typeof showFloatingToast === 'function') {
      showFloatingToast(`🛒 ${addedCount} Zutat(en) zur Einkaufsliste hinzugefügt!`, 'success');
    }
  } else if (typeof addIngredientsToShoppingList === 'function') {
    addIngredientsToShoppingList(scaledItems, activeRecipe.title);
  }

  if (typeof playProceduralSound === 'function') playProceduralSound(3);
}

function saveCustomRecipeFromForm() {
  const titleInput = document.getElementById('new-recipe-title');
  const durationInput = document.getElementById('new-recipe-duration');
  const categorySelect = document.getElementById('new-recipe-category');
  const ingredientsInput = document.getElementById('new-recipe-ingredients');
  const stepsInput = document.getElementById('new-recipe-steps');

  if (!titleInput || !ingredientsInput || !stepsInput) return;

  const title = titleInput.value.trim();
  const duration = durationInput ? durationInput.value.trim() || '20 Min' : '20 Min';
  const category = categorySelect ? categorySelect.value : 'schnell';
  const ingredients = ingredientsInput.value.split('\n').map(s => s.trim()).filter(Boolean);
  const steps = stepsInput.value.split('\n').map(s => s.trim()).filter(Boolean);

  if (!title || ingredients.length === 0 || steps.length === 0) {
    alert('Bitte Titel, mindestens eine Zutat und einen Zubereitungsschritt angeben.');
    return;
  }

  const newRecipe = {
    id: 'custom-' + Date.now(),
    title,
    duration,
    category,
    servings: 2,
    tags: ['Eigenes Rezept', category],
    ingredients,
    steps
  };

  const cooking = getCookingState();
  cooking.recipes.unshift(newRecipe);
  cooking.activeRecipeId = newRecipe.id;
  cooking.activeRecipe = newRecipe;
  cooking.activeStepIndex = 0;
  saveState();

  currentCookingTab = 'mode';
  renderCookingPanel(true);
  if (typeof playProceduralSound === 'function') playProceduralSound(3);
}

function deleteCustomRecipe(recipeId, e) {
  if (e) e.stopPropagation();
  if (!confirm('Möchtest du dieses eigene Rezept wirklich löschen?')) return;
  const cooking = getCookingState();
  cooking.recipes = (cooking.recipes || []).filter(r => r.id !== recipeId);
  if (cooking.activeRecipeId === recipeId) {
    cooking.activeRecipeId = null;
    cooking.activeRecipe = null;
  }
  saveState();
  renderCookingPanel(true);
  if (typeof playProceduralSound === 'function') playProceduralSound(11);
}

// ----------------------------------------------------------------------------
// RENDER PANEL
// ----------------------------------------------------------------------------
function renderCookingPanel(skipLucide = false) {
  const panel = document.getElementById('panel-cooking');
  if (!panel) return;
  if (skipLucide && panel.classList.contains('hidden')) return;

  panel.style.width = "440px";
  panel.style.maxWidth = "95vw";

  const cooking = getCookingState();
  const activeRecipe = cooking.activeRecipe;
  const pantry = cooking.pantryItems || [];
  const multiplier = cooking.servingsMultiplier || 1;

  const staples = [
    { label: 'Pasta 🍝', val: 'Pasta' },
    { label: 'Reis 🍚', val: 'Reis' },
    { label: 'Eier 🥚', val: 'Eier' },
    { label: 'Käse 🧀', val: 'Käse' },
    { label: 'Hähnchen 🍗', val: 'Hähnchen' },
    { label: 'Tomaten 🍅', val: 'Tomaten' },
    { label: 'Knoblauch 🧄', val: 'Knoblauch' },
    { label: 'Spinat 🥬', val: 'Spinat' }
  ];

  const activeTabClasses = 'bg-gradient-to-r from-orange-600/40 via-amber-600/35 to-orange-600/40 text-white border-orange-400/80 shadow-[0_0_12px_rgba(249,115,22,0.35)] font-bold';
  const inactiveTabClasses = 'text-gray-400 hover:text-orange-200 border-transparent hover:bg-white/5 font-semibold';

  let contentHtml = '';

  // --------------------------------------------------------------------------
  // TAB 1: REZEPTKATALOG & SUCHE
  // --------------------------------------------------------------------------
  if (currentCookingTab === 'recipes') {
    const filter = cooking.filterCategory || 'all';
    const query = (cooking.searchQuery || '').toLowerCase();
    const allRecipes = cooking.recipes || DEFAULT_CURATED_RECIPES;

    const filtered = allRecipes.filter(r => {
      if (filter !== 'all') {
        const catMatch = r.category === filter || (r.tags || []).some(t => t.toLowerCase() === filter.toLowerCase());
        if (!catMatch) return false;
      }
      if (query) {
        const matchTitle = r.title.toLowerCase().includes(query);
        const matchIng = (r.ingredients || []).some(i => i.toLowerCase().includes(query));
        if (!matchTitle && !matchIng) return false;
      }
      return true;
    });

    contentHtml = `
      <div class="space-y-2.5 animate-fade-in">
        <!-- Search & New Recipe Row -->
        <div class="flex gap-2">
          <div class="relative flex-1">
            <input 
              id="cooking-search-input" 
              type="text" 
              value="${escapeHtml(cooking.searchQuery || '')}"
              placeholder="🔍 Rezepte oder Zutaten suchen..." 
              oninput="getCookingState().searchQuery = this.value; renderCookingPanel(true);"
              class="w-full min-h-[34px] rounded-xl border border-white/10 bg-[#0a0a0f] px-3 text-xs text-gray-200 placeholder:text-gray-500 outline-none focus:border-[#ff7a00] font-semibold"
            />
          </div>
          <button 
            onclick="switchCookingTab('new_recipe')" 
            class="min-h-[34px] px-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-md cursor-pointer"
            title="Eigenes Rezept erstellen"
          >
            <span>+ Neu</span>
          </button>
        </div>

        <!-- Filter Tags -->
        <div class="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
          ${[
            { id: 'all', label: 'Alle' },
            { id: 'schnell', label: '⚡ Schnell (<20m)' },
            { id: 'protein', label: '💪 High Protein' },
            { id: 'vegetarisch', label: '🌱 Veggie' },
            { id: 'vegan', label: '🥑 Vegan' }
          ].map(cat => `
            <button 
              onclick="getCookingState().filterCategory = '${cat.id}'; renderCookingPanel(true);"
              class="px-2.5 py-1 rounded-lg shrink-0 font-medium transition cursor-pointer border ${filter === cat.id ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 font-bold' : 'bg-white/[0.03] text-gray-400 border-white/5 hover:text-white'}"
            >
              ${cat.label}
            </button>
          `).join('')}
        </div>

        <!-- Recipes Grid / List -->
        <div class="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          ${filtered.length ? filtered.map(recipe => {
            const match = calculateRecipeMatch(recipe, pantry);
            const isCustom = recipe.id && recipe.id.startsWith('custom-');
            const isActive = activeRecipe && activeRecipe.id === recipe.id;

            return `
              <div 
                onclick="selectActiveRecipe('${escapeAttr(recipe.id)}')"
                class="group p-2.5 rounded-2xl border ${isActive ? 'border-orange-500/50 bg-orange-950/20 shadow-md' : 'border-white/5 bg-[#0a0a0f]/60 hover:border-orange-500/30 hover:bg-white/[0.03]'} transition cursor-pointer flex flex-col gap-1.5"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="font-bold text-xs ${isActive ? 'text-orange-300' : 'text-gray-200 group-hover:text-orange-200'} flex-1 leading-snug">
                    ${escapeHtml(recipe.title)}
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <span class="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400 font-semibold border border-white/5">
                      ⏱️ ${escapeHtml(recipe.duration || '20 Min')}
                    </span>
                    ${isCustom ? `
                      <button onclick="deleteCustomRecipe('${escapeAttr(recipe.id)}', event)" title="Rezept löschen" class="text-gray-500 hover:text-rose-400 p-0.5 text-xs">🗑️</button>
                    ` : ''}
                  </div>
                </div>

                <div class="flex items-center justify-between text-[10px]">
                  <!-- Tags -->
                  <div class="flex flex-wrap gap-1">
                    ${(recipe.tags || []).slice(0, 3).map(tag => `
                      <span class="px-1.5 py-0.2 rounded bg-white/[0.04] text-gray-400 text-[9px]">${escapeHtml(tag)}</span>
                    `).join('')}
                  </div>

                  <!-- Pantry Match Score -->
                  <div class="text-[9.5px] font-bold ${match.percent >= 75 ? 'text-emerald-400' : match.percent >= 40 ? 'text-amber-400' : 'text-gray-500'}">
                    ${match.percent > 0 ? `📦 ${match.percent}% vorrätig` : `${recipe.ingredients.length} Zutaten`}
                  </div>
                </div>
              </div>
            `;
          }).join('') : `
            <div class="py-8 text-center text-xs text-gray-500 italic">
              Keine Rezepte für diesen Filter gefunden.
            </div>
          `}
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // TAB 2: INTERAKTIVER KOCHMODUS (STEP-BY-STEP & TIMERS)
  // --------------------------------------------------------------------------
  else if (currentCookingTab === 'mode') {
    if (!activeRecipe) {
      contentHtml = `
        <div class="p-6 text-center rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <span class="text-4xl block">👨‍🍳</span>
          <div class="text-xs font-bold text-white">Kein aktives Rezept ausgewählt</div>
          <p class="text-[11px] text-gray-400">Wähle ein Rezept aus dem Katalog oder lasse dir eines aus deinen Zutaten vorschlagen.</p>
          <div class="flex justify-center gap-2 pt-1">
            <button onclick="switchCookingTab('recipes')" class="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer">
              📖 Zum Rezeptbuch
            </button>
            <button onclick="handleCookingSuggest()" class="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-gray-200 rounded-xl text-xs font-semibold transition cursor-pointer">
              🍳 Aus Vorrat kochen
            </button>
          </div>
        </div>
      `;
    } else {
      const stepIdx = cooking.activeStepIndex || 0;
      const totalSteps = (activeRecipe.steps || []).length;
      const currentStepText = activeRecipe.steps && activeRecipe.steps[stepIdx] ? activeRecipe.steps[stepIdx] : '';
      const detectedMinutes = extractMinutesFromText(currentStepText);
      const isTimerRunning = activeCookingTimerInterval !== null;
      const isTimerForThisStep = activeCookingTimerStep === stepIdx;

      const baseServings = activeRecipe.servings || 2;
      const currentServings = Math.round(baseServings * multiplier);

      contentHtml = `
        <div class="space-y-2.5 animate-fade-in">
          <!-- Recipe Header Card with Servings Multiplier -->
          <div class="rounded-2xl border border-orange-500/25 bg-orange-950/20 p-2.5 shadow-inner space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="text-xs font-black text-orange-200 font-display">${escapeHtml(activeRecipe.title)}</h3>
                <div class="text-[9.5px] text-gray-400 flex items-center gap-2 mt-0.5">
                  <span>⏱️ ${escapeHtml(activeRecipe.duration)}</span>
                  <span>•</span>
                  <span>${totalSteps} Schritte</span>
                </div>
              </div>

              <!-- Servings Scaler -->
              <div class="flex items-center gap-1 bg-black/50 border border-white/10 rounded-xl px-1.5 py-0.5 shrink-0">
                <button onclick="changeServingsMultiplier(-0.5)" class="text-xs font-bold text-gray-400 hover:text-white px-1 cursor-pointer" title="Weniger Portionen">-</button>
                <span class="text-[10px] font-bold text-orange-300 min-w-[50px] text-center">🍽️ ${currentServings} Port.</span>
                <button onclick="changeServingsMultiplier(0.5)" class="text-xs font-bold text-gray-400 hover:text-white px-1 cursor-pointer" title="Mehr Portionen">+</button>
              </div>
            </div>

            <!-- Ingredients Summary with Missing to Shopping & Board Task Bridge -->
            <div class="border-t border-white/5 pt-1.5">
              <div class="flex items-center justify-between text-[9px] font-bold uppercase text-gray-400 mb-1 flex-wrap gap-1">
                <span>Zutaten (skaliert)</span>
                <div class="flex items-center gap-2">
                  <button onclick="if(typeof bridgeRecipeToBoardTask === 'function') bridgeRecipeToBoardTask(getCookingState().activeRecipe.id);" class="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center gap-0.5 text-[9.5px]" title="Rezept als verknüpfte Aufgabe im Kanban-Board anlegen">
                    <i data-lucide="plus-circle" class="w-3 h-3"></i>
                    <span>📋 Als Aufgabe ins Board</span>
                  </button>
                  <button onclick="addRecipeMissingIngredientsToShopping()" class="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-0.5 text-[9.5px]" title="Zutaten auf die Einkaufsliste setzen">
                    <i data-lucide="shopping-cart" class="w-3 h-3"></i>
                    <span>🛒 Auf Einkaufsliste</span>
                  </button>
                </div>
              </div>
              <div class="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto pr-1">
                ${(activeRecipe.ingredients || []).map(ing => {
                  const scaled = scaleIngredientText(ing, multiplier);
                  const norm = ing.toLowerCase();
                  const inPantry = pantry.some(p => p.toLowerCase().includes(norm) || norm.includes(p.toLowerCase()));
                  return `
                    <span class="px-1.5 py-0.5 rounded-md text-[9px] font-medium border ${inPantry ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-orange-500/15 text-orange-300 border-orange-500/30'}">
                      ${inPantry ? '✓' : '•'} ${escapeHtml(scaled)}
                    </span>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Active Cooking Step Focus Card -->
          <div class="rounded-2xl border border-white/10 bg-[#0a0a0f] p-3 shadow-lg space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                Schritt ${stepIdx + 1} von ${totalSteps}
              </span>
              <button 
                onclick="readCurrentCookingStepAloud()" 
                class="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-orange-500/20 text-gray-300 hover:text-orange-200 border border-white/10 text-[10px] font-semibold transition flex items-center gap-1 cursor-pointer"
                title="Diesen Schritt laut vorlesen"
              >
                <span>🔊 Vorlesen</span>
              </button>
            </div>

            <!-- Step Progress Bar -->
            <div class="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div class="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-300" style="width: ${((stepIdx + 1) / totalSteps) * 100}%"></div>
            </div>

            <!-- Big Step Instruction Text -->
            <div class="text-xs text-gray-100 font-medium leading-relaxed min-h-[48px] bg-white/[0.02] p-2 rounded-xl border border-white/5">
              ${escapeHtml(currentStepText)}
            </div>

            <!-- Integrated Cooking Timer Widget -->
            ${detectedMinutes || isTimerRunning ? `
              <div class="p-2 rounded-xl bg-orange-950/30 border border-orange-500/30 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-base">⏱️</span>
                  <div>
                    <div class="text-[9px] font-bold text-orange-300 uppercase">Koch-Timer</div>
                    <div id="cooking-live-timer" class="text-xs font-black text-white font-mono">
                      ${isTimerRunning ? `${String(Math.floor(activeCookingTimerSeconds / 60)).padStart(2, '0')}:${String(activeCookingTimerSeconds % 60).padStart(2, '0')}` : `${detectedMinutes || 5}:00 Min`}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-1.5">
                  ${isTimerRunning ? `
                    <button onclick="stopCookingTimer()" class="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold transition cursor-pointer">
                      Stopp
                    </button>
                  ` : `
                    <button onclick="startCookingTimer(${detectedMinutes || 5}, ${stepIdx})" class="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg text-[10px] font-bold transition shadow-sm cursor-pointer">
                      ▶ Timer starten (${detectedMinutes || 5} Min)
                    </button>
                  `}
                </div>
              </div>
            ` : ''}

            <!-- Step Navigation Buttons -->
            <div class="flex items-center justify-between gap-2 pt-1">
              <button 
                onclick="prevCookingStep()" 
                ${stepIdx === 0 ? 'disabled' : ''}
                class="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1"
              >
                <span>← Zurück</span>
              </button>

              ${stepIdx < totalSteps - 1 ? `
                <button 
                  onclick="nextCookingStep()" 
                  class="flex-1 py-1.5 px-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Weiter →</span>
                </button>
              ` : `
                <button 
                  onclick="if (typeof playProceduralSound === 'function') playProceduralSound(1); switchCookingTab('recipes');" 
                  class="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>🎉 Fertig! Guten Appetit</span>
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }
  }

  // --------------------------------------------------------------------------
  // TAB 3: VORRAT & RESTEVERWERTUNG (PANTRY)
  // --------------------------------------------------------------------------
  else if (currentCookingTab === 'pantry') {
    contentHtml = `
      <div class="space-y-2.5 animate-fade-in">
        <!-- Ingredient Add Input -->
        <div class="flex gap-1.5">
          <input 
            id="cooking-ingredient-input" 
            type="text" 
            placeholder="Zutat eingeben (z.B. Paprika, Eier, Reis)..." 
            class="flex-1 min-h-[34px] rounded-xl border border-white/10 bg-[#0a0a0f] px-3 text-xs text-gray-200 placeholder:text-gray-500 outline-none focus:border-[#ff7a00] font-semibold" 
          />
          <button 
            onclick="handleCookingAddIngredient()" 
            class="min-h-[34px] rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-3.5 text-xs font-bold text-white transition shadow-md cursor-pointer"
          >
            + Hinzufügen
          </button>
        </div>

        <!-- Quick Select Staples -->
        <div class="space-y-1">
          <div class="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-0.5">Schnellauswahl Grundzutaten</div>
          <div class="flex flex-wrap gap-1">
            ${staples.map(s => `
              <button 
                onclick="handleQuickAddStaple('${s.val}')" 
                class="px-2 py-0.5 bg-white/[0.03] hover:bg-orange-500/15 border border-white/5 hover:border-orange-500/30 rounded-lg text-[10px] text-gray-300 transition cursor-pointer font-medium hover:scale-105 active:scale-95"
              >
                ${s.label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Pantry List -->
        <div class="rounded-2xl border border-white/5 bg-[#0a0a0e]/40 p-2.5 shadow-inner">
          <div class="mb-1.5 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-gray-400 px-0.5">
            <span>Vorhandene Zutaten (${pantry.length})</span>
            ${pantry.length > 0 ? `
              <button onclick="clearCookingPantry()" class="text-rose-400 hover:text-rose-300 cursor-pointer">Alle leeren</button>
            ` : ''}
          </div>
          ${pantry.length ? `
            <div class="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto pr-1">
              ${pantry.map((item, index) => `
                <span class="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10.5px] text-emerald-300 font-semibold">
                  ${escapeHtml(capitalize(item))}
                  <button type="button" onclick="removeCookingIngredient(${index})" aria-label="Zutat entfernen" class="ml-1 text-orange-400/80 hover:text-red-400 font-bold transition cursor-pointer text-xs">×</button>
                </span>
              `).join('')}
            </div>
          ` : `
            <div class="text-[10.5px] text-gray-500 italic py-2 text-center">Noch keine Zutaten eingetragen. Wähle oben Zutaten aus deinem Kühlschrank!</div>
          `}
        </div>

        <!-- Suggest Smart Skillet Recipe Button -->
        <div class="pt-0.5">
          <button 
            onclick="handleCookingSuggest()" 
            class="w-full min-h-[36px] rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#ff3366] hover:from-[#ff8c1a] hover:to-[#ff4d7d] text-white font-bold text-xs shadow-md transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🍳 Smart-Rezept aus Vorrat zaubern</span>
          </button>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // TAB 4: NEUES REZEPT ERSTELLEN
  // --------------------------------------------------------------------------
  else if (currentCookingTab === 'new_recipe') {
    contentHtml = `
      <div class="space-y-2.5 animate-fade-in">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-orange-300">Eigenes Rezept anlegen</span>
          <button onclick="switchCookingTab('recipes')" class="text-xs text-gray-400 hover:text-white cursor-pointer">Abbrechen</button>
        </div>

        <div class="space-y-2 text-xs">
          <div>
            <label class="text-[9px] font-bold uppercase text-gray-400 block mb-0.5">Rezepttitel</label>
            <input id="new-recipe-title" type="text" placeholder="z.B. Omas Gemüseauflauf" class="w-full min-h-[30px] rounded-xl border border-white/10 bg-[#0a0a0f] px-2.5 text-xs text-white outline-none focus:border-orange-500" />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[9px] font-bold uppercase text-gray-400 block mb-0.5">Dauer</label>
              <input id="new-recipe-duration" type="text" placeholder="z.B. 25 Min" class="w-full min-h-[30px] rounded-xl border border-white/10 bg-[#0a0a0f] px-2.5 text-xs text-white outline-none focus:border-orange-500" />
            </div>
            <div>
              <label class="text-[9px] font-bold uppercase text-gray-400 block mb-0.5">Kategorie</label>
              <select id="new-recipe-category" class="w-full min-h-[30px] rounded-xl border border-white/10 bg-[#0a0a0f] px-2 text-xs text-gray-300 outline-none focus:border-orange-500">
                <option value="schnell">Schnelle Küche</option>
                <option value="protein">High Protein</option>
                <option value="vegetarisch">Vegetarisch</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-[9px] font-bold uppercase text-gray-400 block mb-0.5">Zutaten (eine pro Zeile)</label>
            <textarea id="new-recipe-ingredients" rows="3" placeholder="250g Pasta&#10;2 Tomaten&#10;1 Zehe Knoblauch" class="w-full rounded-xl border border-white/10 bg-[#0a0a0f] p-2 text-xs text-white outline-none focus:border-orange-500 resize-none font-mono"></textarea>
          </div>

          <div>
            <label class="text-[9px] font-bold uppercase text-gray-400 block mb-0.5">Zubereitungsschritte (einer pro Zeile)</label>
            <textarea id="new-recipe-steps" rows="3" placeholder="Wasser zum Kochen bringen.&#10;Tomaten und Knoblauch anbraten.&#10;Nudeln untermengen und servieren." class="w-full rounded-xl border border-white/10 bg-[#0a0a0f] p-2 text-xs text-white outline-none focus:border-orange-500 resize-none font-mono"></textarea>
          </div>

          <button onclick="saveCustomRecipeFromForm()" class="w-full min-h-[34px] rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-md transition cursor-pointer">
            ✓ Rezept speichern & öffnen
          </button>
        </div>
      </div>
    `;
  }

  // Header and Navigation Shell
  panel.innerHTML = `
    <!-- HEADER -->
    <div class="flex items-center justify-between border-b border-white/10 pb-2">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-300 shadow-sm shrink-0">
          <i data-lucide="chef-hat" class="w-4 h-4"></i>
        </div>
        <div class="relative flex flex-col items-center justify-center shrink-0">
          <div class="relative overflow-hidden flex items-center justify-center">
            <img src="logo-noodle.png" alt="Noodle" class="h-[22px] w-auto max-w-none object-contain select-none pointer-events-none" />
          </div>
          <div class="relative h-[9px] w-full flex items-center justify-center overflow-hidden mt-0.5">
            <span class="badge-tool-subtext select-none">COOK</span>
          </div>
        </div>
      </div>
      <button onclick="togglePanel('cooking')" aria-label="Koch-Panel schließen" class="text-gray-400 hover:text-white text-xs font-bold p-1 cursor-pointer">✕</button>
    </div>

    <!-- 3-TAB SUB-NAVIGATION -->
    <div class="flex items-center bg-black/60 p-1 rounded-2xl border border-white/10 text-xs gap-1 shadow-sm select-none">
      <button onclick="switchCookingTab('recipes')" class="flex-1 py-1 px-1 rounded-xl transition flex items-center justify-center gap-1 text-[10.5px] cursor-pointer border ${currentCookingTab === 'recipes' ? activeTabClasses : inactiveTabClasses}">
        <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
        <span>Rezepte</span>
      </button>
      <button onclick="switchCookingTab('mode')" class="flex-1 py-1 px-1 rounded-xl transition flex items-center justify-center gap-1 text-[10.5px] cursor-pointer border ${currentCookingTab === 'mode' ? activeTabClasses : inactiveTabClasses}">
        <i data-lucide="cooking-pot" class="w-3.5 h-3.5"></i>
        <span>Kochmodus</span>
      </button>
      <button onclick="switchCookingTab('pantry')" class="flex-1 py-1 px-1 rounded-xl transition flex items-center justify-center gap-1 text-[10.5px] cursor-pointer border ${currentCookingTab === 'pantry' ? activeTabClasses : inactiveTabClasses}">
        <i data-lucide="utensils" class="w-3.5 h-3.5"></i>
        <span>Vorrat</span>
      </button>
    </div>

    <!-- TAB CONTENT -->
    ${contentHtml}
  `;

  // Enter key listener for ingredient input
  const input = panel.querySelector('#cooking-ingredient-input');
  if (input) {
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCookingAddIngredient();
      }
    };
  }

  if (!skipLucide && typeof renderLucideIcons === 'function') {
    renderLucideIcons();
  }
}

// ----------------------------------------------------------------------------
// EXPORTS & GLOBAL REGISTRATION
// ----------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  window.renderCookingPanel = renderCookingPanel;
  window.handleCookingAddIngredient = handleCookingAddIngredient;
  window.handleQuickAddStaple = handleQuickAddStaple;
  window.switchCookingTab = switchCookingTab;
  window.handleCookingSuggest = handleCookingSuggest;
  window.resetCookingPantry = resetCookingPantry;
  window.clearCookingPantry = clearCookingPantry;
  window.addCookingIngredient = addCookingIngredient;
  window.removeCookingIngredient = removeCookingIngredient;
  window.suggestCookingRecipe = suggestCookingRecipe;
  window.addRecipeMissingIngredientsToShopping = addRecipeMissingIngredientsToShopping;
  window.getCookingState = getCookingState;
  window.selectActiveRecipe = selectActiveRecipe;
  window.nextCookingStep = nextCookingStep;
  window.prevCookingStep = prevCookingStep;
  window.setCookingStep = setCookingStep;
  window.changeServingsMultiplier = changeServingsMultiplier;
  window.scaleIngredientText = scaleIngredientText;
  window.startCookingTimer = startCookingTimer;
  window.stopCookingTimer = stopCookingTimer;
  window.readCurrentCookingStepAloud = readCurrentCookingStepAloud;
  window.extractMinutesFromText = extractMinutesFromText;
  window.calculateRecipeMatch = calculateRecipeMatch;
  window.saveCustomRecipeFromForm = saveCustomRecipeFromForm;
  window.deleteCustomRecipe = deleteCustomRecipe;
}

if (typeof globalThis !== 'undefined') {
  globalThis.renderCookingPanel = renderCookingPanel;
  globalThis.handleCookingAddIngredient = handleCookingAddIngredient;
  globalThis.handleQuickAddStaple = handleQuickAddStaple;
  globalThis.switchCookingTab = switchCookingTab;
  globalThis.handleCookingSuggest = handleCookingSuggest;
  globalThis.resetCookingPantry = resetCookingPantry;
  globalThis.clearCookingPantry = clearCookingPantry;
  globalThis.addCookingIngredient = addCookingIngredient;
  globalThis.removeCookingIngredient = removeCookingIngredient;
  globalThis.suggestCookingRecipe = suggestCookingRecipe;
  globalThis.addRecipeMissingIngredientsToShopping = addRecipeMissingIngredientsToShopping;
  globalThis.getCookingState = getCookingState;
  globalThis.selectActiveRecipe = selectActiveRecipe;
  globalThis.nextCookingStep = nextCookingStep;
  globalThis.prevCookingStep = prevCookingStep;
  globalThis.setCookingStep = setCookingStep;
  globalThis.changeServingsMultiplier = changeServingsMultiplier;
  globalThis.scaleIngredientText = scaleIngredientText;
  globalThis.startCookingTimer = startCookingTimer;
  globalThis.stopCookingTimer = stopCookingTimer;
  globalThis.readCurrentCookingStepAloud = readCurrentCookingStepAloud;
  globalThis.extractMinutesFromText = extractMinutesFromText;
  globalThis.calculateRecipeMatch = calculateRecipeMatch;
  globalThis.saveCustomRecipeFromForm = saveCustomRecipeFromForm;
  globalThis.deleteCustomRecipe = deleteCustomRecipe;
}
