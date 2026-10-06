function getCookingState() {
  if (!state.cooking) state.cooking = createDefaultCookingState();
  return state.cooking;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

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
  suggestCookingRecipe();
}

function buildDynamicRecipeFromPantry(pantry) {
  const items = pantry.map(i => i.trim().toLowerCase()).filter(Boolean);
  if (items.length === 0) return null;

  const carbs = items.filter(i => /(pasta|nudel|reis|kartoffel|brot|wrap|toast|fladen|grieß|hafer|baguette|rice|potato|bread|oats)/i.test(i));
  const proteins = items.filter(i => /(hähnchen|huhn|fleisch|rind|schwein|fisch|lachs|tuna|thunfisch|ei|tofu|bohnen|linsen|kichererbsen|quark|chicken|meat|beef|pork|fish|salmon|egg|beans|lentils)/i.test(i));
  const veggies = items.filter(i => /(tomate|gurke|paprika|zucchini|aubergine|spinat|pilz|champignon|zwiebel|knoblauch|karotte|möhre|brokkoli|tomato|cucumber|pepper|spinach|mushroom|onion|garlic|carrot|broccoli)/i.test(i));
  const dairy = items.filter(i => /(käse|feta|parmesan|mozzarella|butter|sahne|joghurt|frischkäse|schmand|cheese|cream|yogurt)/i.test(i));

  let duration = tr({ en: "15 min", de: "15 Min", fr: "15 min", it: "15 min", es: "15 min", el: "15 λεπ" });

  const primaryCarb = carbs[0] || null;
  const primaryProtein = proteins[0] || null;
  const primaryVeggie = veggies[0] || null;
  const primaryDairy = dairy[0] || null;

  let title = tr({
    en: "Creative Skillet Dish",
    de: "Kreative Restepfanne",
    fr: "Poêlée créative maison",
    it: "Padellata creativa",
    es: "Salteado creativo casero",
    el: "Δημιουργικό τηγανητό πιάτο"
  });

  if (primaryCarb && primaryProtein && primaryVeggie) {
    title = tr({
      en: `Savory ${capitalize(primaryCarb)} Skillet with ${capitalize(primaryProtein)} & ${capitalize(primaryVeggie)}`,
      de: `Herzhafte ${capitalize(primaryCarb)}-Pfanne mit ${capitalize(primaryProtein)} und ${capitalize(primaryVeggie)}`,
      fr: `Poêlée de ${capitalize(primaryCarb)} avec ${capitalize(primaryProtein)} et ${capitalize(primaryVeggie)}`,
      it: `Padellata di ${capitalize(primaryCarb)} con ${capitalize(primaryProtein)} e ${capitalize(primaryVeggie)}`,
      es: `Salteado de ${capitalize(primaryCarb)} con ${capitalize(primaryProtein)} y ${capitalize(primaryVeggie)}`,
      el: `Πιάτο ${capitalize(primaryCarb)} με ${capitalize(primaryProtein)} και ${capitalize(primaryVeggie)}`
    });
  } else if (primaryCarb && primaryDairy) {
    title = tr({
      en: `Creamy ${capitalize(primaryCarb)} Bowl with Melted ${capitalize(primaryDairy)}`,
      de: `Cremiges ${capitalize(primaryCarb)}-Gericht mit geschmolzenem ${capitalize(primaryDairy)}`,
      fr: `Plat crémeux de ${capitalize(primaryCarb)} au ${capitalize(primaryDairy)} fondu`,
      it: `Piatto cremoso di ${capitalize(primaryCarb)} con ${capitalize(primaryDairy)} fuso`,
      es: `Plato cremoso de ${capitalize(primaryCarb)} con ${capitalize(primaryDairy)} fundido`,
      el: `Κρεμώδες πιάτο ${capitalize(primaryCarb)} με λιωμένο ${capitalize(primaryDairy)}`
    });
  } else if (primaryProtein && primaryVeggie) {
    title = tr({
      en: `Stir-fried ${capitalize(primaryProtein)} with Fresh ${capitalize(primaryVeggie)}`,
      de: `Pfannengerührtes ${capitalize(primaryProtein)} mit frischem ${capitalize(primaryVeggie)}`,
      fr: `Sauté de ${capitalize(primaryProtein)} aux ${capitalize(primaryVeggie)} frais`,
      it: `Saltato di ${capitalize(primaryProtein)} con ${capitalize(primaryVeggie)} freschi`,
      es: `Salteado de ${capitalize(primaryProtein)} con ${capitalize(primaryVeggie)} frescos`,
      el: `Σοταρισμένο ${capitalize(primaryProtein)} με φρέσκα ${capitalize(primaryVeggie)}`
    });
  } else if (primaryCarb && primaryVeggie) {
    title = tr({
      en: `${capitalize(primaryCarb)} with Steamed ${capitalize(primaryVeggie)}`,
      de: `${capitalize(primaryCarb)} mit gedünstetem ${capitalize(primaryVeggie)}`,
      fr: `${capitalize(primaryCarb)} aux ${capitalize(primaryVeggie)} vapeur`,
      it: `${capitalize(primaryCarb)} con ${capitalize(primaryVeggie)} stufati`,
      es: `${capitalize(primaryCarb)} con ${capitalize(primaryVeggie)} al vapor`,
      el: `${capitalize(primaryCarb)} με λαχανικά ${capitalize(primaryVeggie)}`
    });
  } else if (primaryProtein && primaryDairy) {
    title = tr({
      en: `Savory ${capitalize(primaryProtein)} Gratin with ${capitalize(primaryDairy)}`,
      de: `Herzhaftes ${capitalize(primaryProtein)} überbacken mit ${capitalize(primaryDairy)}`,
      fr: `Gratin de ${capitalize(primaryProtein)} au ${capitalize(primaryDairy)}`,
      it: `Gratinato di ${capitalize(primaryProtein)} con ${capitalize(primaryDairy)}`,
      es: `Gratinado de ${capitalize(primaryProtein)} con ${capitalize(primaryDairy)}`,
      el: `Ογκρατέν ${capitalize(primaryProtein)} με ${capitalize(primaryDairy)}`
    });
  } else if (primaryProtein) {
    title = tr({
      en: `Quick Protein Plate (${capitalize(primaryProtein)})`,
      de: `Schnelles Protein-Gericht (${capitalize(primaryProtein)})`,
      fr: `Assiette rapide de protéines (${capitalize(primaryProtein)})`,
      it: `Piatto veloce di proteine (${capitalize(primaryProtein)})`,
      es: `Plato rápido de proteínas (${capitalize(primaryProtein)})`,
      el: `Γρήγορο πιάτο πρωτεΐνης (${capitalize(primaryProtein)})`
    });
  } else if (primaryCarb) {
    title = tr({
      en: `Satisfying ${capitalize(primaryCarb)} Creation`,
      de: `Sättigende ${capitalize(primaryCarb)}-Kreation`,
      fr: `Plat réconfortant de ${capitalize(primaryCarb)}`,
      it: `Creazione nutriente di ${capitalize(primaryCarb)}`,
      es: `Creación nutritiva de ${capitalize(primaryCarb)}`,
      el: `Χορταστικό πιάτο ${capitalize(primaryCarb)}`
    });
  } else if (primaryVeggie) {
    title = tr({
      en: `Fresh Colorful ${capitalize(primaryVeggie)} Medley`,
      de: `Bunte ${capitalize(primaryVeggie)}-Pfanne`,
      fr: `Poêlée colorée de ${capitalize(primaryVeggie)}`,
      it: `Padellata colorata di ${capitalize(primaryVeggie)}`,
      es: `Salteado colorido de ${capitalize(primaryVeggie)}`,
      el: `Πολύχρωμο πιάτο λαχανικών ${capitalize(primaryVeggie)}`
    });
  } else {
    title = tr({
      en: `Ingredient Medley: ${items.map(capitalize).join(' & ')}`,
      de: `Zutaten-Kombination: ${items.map(capitalize).join(' & ')}`,
      fr: `Méli-mélo d'ingrédients : ${items.map(capitalize).join(' & ')}`,
      it: `Combinazione di ingredienti: ${items.map(capitalize).join(' & ')}`,
      es: `Combinación de ingredientes: ${items.map(capitalize).join(' & ')}`,
      el: `Συνδυασμός υλικών: ${items.map(capitalize).join(' & ')}`
    });
  }

  let steps = [];
  steps.push(tr({
    en: "Preparation: Clean your prep area and rinse all fresh ingredients thoroughly.",
    de: "Vorbereitung: Reinige deine Arbeitsfläche und wasche frische Zutaten gründlich ab.",
    fr: "Préparation : Nettoie ton plan de travail et rince soigneusement les ingrédients frais.",
    it: "Preparazione: Pulisci la superficie di lavoro e lava accuratamente gli ingredienti freschi.",
    es: "Preparación: Limpia tu espacio de trabajo y lava bien todos los ingredientes frescos.",
    el: "Προετοιμασία: Καθάρισε τον πάγκο εργασίας και πλύνε καλά όλα τα φρέσκα υλικά."
  }));

  let prepIngredients = [...veggies, ...proteins].filter(i => !/(ei|linsen|bohnen|egg|lentil|bean)/i.test(i));
  if (prepIngredients.length > 0) {
    steps.push(tr({
      en: `Chop ${prepIngredients.map(capitalize).join(', ')} into even bite-sized pieces.`,
      de: `Schneide ${prepIngredients.map(capitalize).join(', ')} in gleichmäßige, mundgerechte Stücke.`,
      fr: `Coupe ${prepIngredients.map(capitalize).join(', ')} en morceaux réguliers.`,
      it: `Taglia ${prepIngredients.map(capitalize).join(', ')} in bocconcini regolari.`,
      es: `Corta ${prepIngredients.map(capitalize).join(', ')} en trozos regulares.`,
      el: `Κόψε ${prepIngredients.map(capitalize).join(', ')} σε ομοιόμορφα κομμάτια.`
    }));
  }

  if (primaryCarb) {
    if (/(pasta|nudel|reis|grieß|linsen|rice|lentil)/i.test(primaryCarb)) {
      steps.push(tr({
        en: `Bring salted water to a boil and cook ${capitalize(primaryCarb)} al dente according to instructions.`,
        de: `Bringe gesalzenes Wasser zum Kochen und bereite ${capitalize(primaryCarb)} bissfest nach Packungsanleitung zu.`,
        fr: `Porte de l'eau salée à ébullition et cuis ${capitalize(primaryCarb)} al dente selon les indications.`,
        it: `Porta a ebollizione l'acqua salata e cuoci ${capitalize(primaryCarb)} al dente.`,
        es: `Lleva agua con sal a ebullición y cocina ${capitalize(primaryCarb)} al dente.`,
        el: `Βράσε αλατισμένο νερό και μαγείρεψε ${capitalize(primaryCarb)} al dente.`
      }));
    } else if (/(kartoffel|potato)/i.test(primaryCarb)) {
      steps.push(tr({
        en: `Precook ${capitalize(primaryCarb)} or sauté sliced in oil until golden brown.`,
        de: `Vorkoche die ${capitalize(primaryCarb)} kurz oder brate sie direkt in feinen Spalten mit etwas Öl goldgelb an.`,
        fr: `Précuis les ${capitalize(primaryCarb)} ou fais-les dorer en tranches avec un filet d'huile.`,
        it: `Precuoci le ${capitalize(primaryCarb)} o falle dorare a spicchi con un filo d'olio.`,
        es: `Precocina las ${capitalize(primaryCarb)} o dóralas en gajos con un poco de aceite.`,
        el: `Προβράσε τις ${capitalize(primaryCarb)} ή σόταρε τες σε φέτες με λίγο λάδι μέχρι να ροδίσουν.`
      }));
    } else if (/(brot|wrap|toast|fladen|baguette|bread)/i.test(primaryCarb)) {
      steps.push(tr({
        en: `Warm ${capitalize(primaryCarb)} briefly in a dry pan or toaster for the best aroma.`,
        de: `Erwärme ${capitalize(primaryCarb)} kurz in einer trockenen Pfanne oder im Toaster für das beste Aroma.`,
        fr: `Réchauffe ${capitalize(primaryCarb)} dans une poêle sèche ou au grille-pain pour exhaler les arômes.`,
        it: `Scalda ${capitalize(primaryCarb)} in una padella asciutta o nel tostapane per esaltarne il profumo.`,
        es: `Calienta ${capitalize(primaryCarb)} en una sartén seca o tostadora para un gran aroma.`,
        el: `Ζέστανε ${capitalize(primaryCarb)} σε ένα στεγνό τηγάνι ή τοστιέρα για τέλειο άρωμα.`
      }));
    }
  }

  let panItems = [...proteins, ...veggies].filter(i => !/(pasta|nudel|reis|brot|wrap|toast|fladen|baguette|rice|bread)/i.test(i));
  if (panItems.length > 0) {
    let verb = proteins.length > 0 
      ? tr({
          en: "Sear the protein first, then add the vegetables",
          de: "Brate zuerst die Proteinquelle scharf an und füge kurz darauf das Gemüse hinzu",
          fr: "Saisis d'abord la source de protéines, puis ajoute les légumes",
          it: "Scotta prima la proteina, poi aggiungi le verdure",
          es: "Dora primero la proteína y luego añade las verduras",
          el: "Σοτάρισε πρώτα την πρωτεΐνη και μετά πρόσθεσε τα λαχανικά"
        })
      : tr({
          en: "Sauté the vegetables with some quality oil in a hot pan",
          de: "Dünste das Gemüse mit etwas gutem Öl in einer heißen Pfanne an",
          fr: "Fais revenir les légumes avec un filet d'huile dans une poêle chaude",
          it: "Salta le verdure con un filo d'olio in una padella calda",
          es: "Saltea las verduras con un poco de buen aceite en una sartén caliente",
          el: "Σοτάρισε τα λαχανικά με λίγο ελαιόλαδο σε ζεστό τηγάνι"
        });
    steps.push(`${verb} (${panItems.map(capitalize).join(', ')}).`);
  }

  if (primaryCarb && panItems.length > 0) {
    steps.push(tr({
      en: `Combine the cooked ${capitalize(primaryCarb)} directly in the warm pan with all ingredients.`,
      de: `Vermenge das Gekochte (${capitalize(primaryCarb)}) direkt in der warmen Pfanne mit den übrigen Zutaten.`,
      fr: `Mélange les ${capitalize(primaryCarb)} directement dans la poêle chaude avec le reste.`,
      it: `Unisci ${capitalize(primaryCarb)} direttamente nella padella calda con gli altri ingredienti.`,
      es: `Mezcla ${capitalize(primaryCarb)} directamente en la sartén caliente con el resto de ingredientes.`,
      el: `Ανάμειξε ${capitalize(primaryCarb)} απευθείας στο ζεστό τηγάνι με τα υπόλοιπα υλικά.`
    }));
  }

  if (primaryDairy) {
    steps.push(tr({
      en: `Add ${capitalize(primaryDairy)} and let it melt gently into the dish.`,
      de: `Füge ${capitalize(primaryDairy)} hinzu. Lasse ihn kurz mitschmelzen oder ziehe ihn sanft unter die heiße Masse.`,
      fr: `Ajoute ${capitalize(primaryDairy)} et laisse-le fondre doucement.`,
      it: `Aggiungi ${capitalize(primaryDairy)} e lascialo fondere dolcemente.`,
      es: `Añade ${capitalize(primaryDairy)} y deja que se funda suavemente.`,
      el: `Πρόσθεσε ${capitalize(primaryDairy)} και άφησέ το να λιώσει απαλά.`
    }));
  }

  steps.push(tr({
    en: "Finish: Season with salt, pepper, and fresh herbs. Serve warm and enjoy!",
    de: "Abschluss: Schmecke dein Gericht mit Salz, Pfeffer und Kräutern ab. Frisch servieren!",
    fr: "Finition : Assaisonne avec sel, poivre et herbes. Sers chaud et régale-toi !",
    it: "Completamento: Condisci con sale, pepe ed erbe aromatiche. Servi caldo e buon appetito!",
    es: "Final: Sazona con sal, pimienta y hierbas. ¡Sirve caliente y disfruta!",
    el: "Ολοκλήρωση: Καρύκευσε με αλάτι, πιπέρι και βότανα. Σέρβιρε ζεστό και καλή απόλαυση!"
  }));

  return {
    id: 'dynamic-generated',
    title,
    duration,
    ingredients: items.map(capitalize),
    steps
  };
}

function suggestCookingRecipe() {
  const cooking = getCookingState();
  const pantry = (cooking.pantryItems || []).map(item => String(item).trim().toLowerCase()).filter(Boolean);
  const recipes = Array.isArray(cooking.recipes) && cooking.recipes.length ? cooking.recipes : createDefaultCookingState().recipes;

  cooking.activeRecipe = null;
  cooking.activeRecipeId = null;

  if (!pantry.length) {
    saveState();
    return null;
  }

  const ranked = recipes.map(recipe => {
    let score = 0;
    let directMatches = 0;
    const recipeIngredients = (recipe.ingredients || []).map(item => String(item).trim().toLowerCase());
    
    recipeIngredients.forEach(ingredient => {
      if (pantry.includes(ingredient)) {
        score += 10;
        directMatches += 1;
      } else if (pantry.some(item => item.includes(ingredient) || ingredient.includes(item))) {
        score += 4;
      }
    });
    
    return { ...recipe, score, directMatches, recipeIngredients };
  }).sort((a, b) => b.score - a.score);

  const bestPredefined = ranked[0];
  const best = (bestPredefined && bestPredefined.directMatches >= 2) ? bestPredefined : buildDynamicRecipeFromPantry(pantry);

  if (best) {
    cooking.activeRecipeId = best.id;
    cooking.activeRecipe = best;
  }
  
  saveState();
  return best;
}

function handleCookingAddIngredient() {
  const input = document.getElementById('cooking-ingredient-input');
  if (!input) return;
  const added = addCookingIngredient(input.value);
  if (added) {
    input.value = '';
    suggestCookingRecipe();
    renderCookingPanel(true);
    if (typeof playProceduralSound === 'function') playProceduralSound(3);
  }
}

function handleQuickAddStaple(name) {
  const added = addCookingIngredient(name);
  if (added) {
    suggestCookingRecipe();
    renderCookingPanel(true);
    if (typeof playProceduralSound === 'function') playProceduralSound(3);
  }
}

function handleCookingSuggest() {
  const recipe = suggestCookingRecipe();
  if (recipe) {
    renderCookingPanel(true);
    if (typeof playProceduralSound === 'function') playProceduralSound(0);
  }
}

function toggleCookingStepCheckbox(stepIndex) {
  if (typeof playProceduralSound === 'function') playProceduralSound(6);
  const checkbox = document.getElementById(`cook-step-${stepIndex}`);
  const label = document.getElementById(`cook-step-label-${stepIndex}`);
  if (checkbox && label) {
    if (checkbox.checked) {
      label.classList.add('line-through', 'text-gray-500', 'opacity-60');
    } else {
      label.classList.remove('line-through', 'text-gray-500', 'opacity-60');
    }
  }
}

function renderCookingPanel(skipLucide = false) {
  const panel = document.getElementById('panel-cooking');
  if (!panel) return;
  if (skipLucide && panel.classList.contains('hidden')) return;

  panel.style.width = "380px";
  panel.style.maxWidth = "95vw";

  const cooking = getCookingState();
  const activeRecipe = cooking.activeRecipe;
  const pantry = cooking.pantryItems || [];

  const staples = [
    { label: 'Pasta 🍝', val: 'Pasta' },
    { label: 'Reis 🍚', val: 'Reis' },
    { label: 'Ei 🥚', val: 'Eier' },
    { label: 'Käse 🧀', val: 'Käse' },
    { label: 'Hähnchen 🍗', val: 'Hähnchen' },
    { label: 'Tomate 🍅', val: 'Tomaten' },
    { label: 'Zwiebel 🧅', val: 'Zwiebeln' },
    { label: 'Gemüse 🥦', val: 'Gemüse' }
  ];

  panel.innerHTML = `
    <div class="flex items-center justify-between border-b border-white/10 pb-2.5">
      <div class="relative flex flex-col items-center justify-center shrink-0">
        <div class="relative overflow-hidden flex items-center justify-center">
          <img src="logo-noodle.png" alt="Noodle" class="h-[22px] w-auto max-w-none object-contain select-none pointer-events-none" />
        </div>
        <div class="relative h-[9px] w-full flex items-center justify-center overflow-hidden mt-0.5">
          <span class="badge-tool-subtext select-none">COOK</span>
        </div>
      </div>
      <button onclick="togglePanel('cooking')" aria-label="Koch-Panel schließen" class="text-gray-400 hover:text-white text-xs font-bold p-1 cursor-pointer">✕</button>
    </div>

    <div class="space-y-4 pt-3 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
      
      <div class="flex gap-2">
        <input id="cooking-ingredient-input" type="text" placeholder="${t('cook_add_ingredient_placeholder')}" class="flex-1 min-h-[36px] rounded-xl border border-white/10 bg-[#0a0a0f] px-3 text-xs text-gray-200 placeholder:text-gray-500 outline-none focus:border-[#ff7a00] focus:shadow-[0_0_12px_rgba(255,122,0,0.35)] font-semibold" />
        <button onclick="handleCookingAddIngredient()" class="min-h-[36px] rounded-xl bg-[#ff7a00] px-4 text-xs font-bold text-white transition hover:bg-[#ff8c1a] cursor-pointer shadow-md">${t('cook_add_ingredient')}</button>
      </div>

      <div class="space-y-1">
        <div class="text-[9px] font-bold uppercase tracking-wider text-gray-400">Schnellauswahl</div>
        <div class="flex flex-wrap gap-1.5">
          ${staples.map(s => `
            <button onclick="handleQuickAddStaple('${s.val}')" class="px-2 py-1 bg-white/[0.03] hover:bg-[#ff8c1a]/10 border border-white/5 hover:border-orange-500/30 rounded-lg text-[10px] text-gray-300 transition cursor-pointer font-medium hover:scale-105 active:scale-95">
              ${s.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="rounded-2xl border border-white/5 bg-[#0a0a0e]/40 p-3 shadow-inner">
        <div class="mb-2 text-[9px] font-bold uppercase tracking-wider text-gray-400">${t('cook_ingredients')}</div>
        ${pantry.length ? `
          <div class="flex flex-wrap gap-1.5">
            ${pantry.map((item, index) => `
              <span class="inline-flex items-center gap-1.5 rounded-lg border border-[#00ff66]/30 bg-[#00ff66]/15 px-2.5 py-1 text-[11px] text-[#00ff66] font-semibold">
                ${escapeHtml(capitalize(item))}
                <button type="button" onclick="removeCookingIngredient(${index}); renderCookingPanel(true);" aria-label="Zutat entfernen" class="ml-1 text-[#ff7a00]/60 hover:text-red-400 font-bold transition cursor-pointer text-xs">×</button>
              </span>
            `).join('')}
          </div>
        ` : `
          <div class="text-[11px] text-gray-500 italic py-1">${t('cook_pantry_empty')}</div>
        `}
      </div>

      <div class="flex gap-2">
        <button onclick="handleCookingSuggest()" class="flex-1 min-h-[36px] rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#ff3366] hover:from-[#ff8c1a] hover:to-[#ff4d7d] text-white font-bold text-xs shadow-md transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5">
          <i data-lucide="cooking-pot" class="w-4 h-4"></i>
          <span>${t('cook_suggest')}</span>
        </button>
        <button onclick="resetCookingPantry()" class="px-3 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/[0.08] transition cursor-pointer">
          Leeren
        </button>
      </div>

      <div class="rounded-2xl border border-orange-500/20 bg-orange-950/5 p-3.5 shadow-inner">
        <div class="mb-2.5 flex items-center justify-between">
          <span class="text-[9px] font-bold uppercase tracking-widest text-[#ff7a00]">${t('cook_suggestion_title')}</span>
          ${activeRecipe ? `
            <span class="text-[9px] px-2 py-0.5 rounded-full bg-[#ff7a00]/15 text-[#ff7a00] font-bold border border-[#ff7a00]/30">${escapeHtml(activeRecipe.duration)}</span>
          ` : ''}
        </div>

        ${activeRecipe ? `
          <div class="text-sm font-black text-[#c084fc] leading-tight font-display mb-2">${escapeHtml(activeRecipe.title)}</div>
          
          <div class="mb-3 space-y-1">
            <div class="text-[9px] font-bold uppercase tracking-wider text-gray-400">Rezept-Zutaten</div>
            <div class="flex flex-wrap gap-1.5 text-[10px]">
              ${(activeRecipe.ingredients || []).map(ing => {
                const normalized = ing.toLowerCase();
                const matched = pantry.some(p => p.toLowerCase().includes(normalized) || normalized.includes(p.toLowerCase()));
                return `
                  <span class="px-2 py-0.5 rounded-md ${matched ? 'bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/30' : 'bg-[#ff7a00]/15 text-[#ff7a00] border border-[#ff7a00]/30'} font-semibold">
                    ${matched ? '✔️' : '❌'} ${escapeHtml(capitalize(ing))}
                  </span>
                `;
              }).join('')}
            </div>
          </div>

          <div class="space-y-1.5 border-t border-white/5 pt-3">
            <div class="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">${t('cook_steps')}</div>
            <div class="space-y-2">
              ${(activeRecipe.steps || []).map((step, idx) => `
                <label class="flex items-start gap-2.5 cursor-pointer select-none group/step">
                  <input type="checkbox" id="cook-step-${idx}" onchange="toggleCookingStepCheckbox(${idx})" class="w-4 h-4 rounded border-white/10 bg-[#0a0a0f] text-orange-500 focus:ring-0 accent-orange-500 shrink-0 mt-0.5 cursor-pointer" />
                  <span id="cook-step-label-${idx}" class="text-[11px] text-[#00f2ff] group-hover/step:brightness-125 leading-normal font-medium transition duration-150">
                    ${escapeHtml(step)}
                  </span>
                </label>
              `).join('')}
            </div>
            
            <button onclick="addRecipeMissingIngredientsToShopping()" class="w-full mt-2.5 py-1.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
              <i data-lucide="shopping-basket" class="w-3.5 h-3.5"></i>
              <span data-i18n="cook_add_to_shop">Zutaten auf Einkaufsliste setzen 🛒</span>
            </button>
          </div>
        ` : `
          <div class="text-xs text-gray-400 italic text-center py-4">Gib deine Zutaten ein, um eine passende Anleitung zu erhalten.</div>
        `}
      </div>

    </div>
  `;

  const input = panel.querySelector('#cooking-ingredient-input');
  if (input) {
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCookingAddIngredient();
      }
    };
  }
  if (!skipLucide) renderLucideIcons();
}

function resetCookingPantry() {
  const cooking = getCookingState();
  cooking.pantryItems = [];
  cooking.activeRecipeId = null;
  cooking.activeRecipe = null;
  saveState();
  renderCookingPanel(true);
  if (typeof playProceduralSound === 'function') playProceduralSound(11);
}

function addRecipeMissingIngredientsToShopping() {
  const cooking = getCookingState();
  const activeRecipe = cooking.activeRecipe;
  if (!activeRecipe || !Array.isArray(activeRecipe.ingredients)) return;
  const pantry = (cooking.pantryItems || []).map(p => p.toLowerCase());
  const missing = activeRecipe.ingredients.filter(ing => {
    const norm = ing.toLowerCase();
    return !pantry.some(p => p.includes(norm) || norm.includes(p));
  });
  const itemsToAdd = missing.length > 0 ? missing : activeRecipe.ingredients;
  if (typeof addIngredientsToShoppingList === 'function') {
    addIngredientsToShoppingList(itemsToAdd, activeRecipe.title);
  }
}

if (typeof window !== 'undefined') {
  window.renderCookingPanel = typeof renderCookingPanel !== 'undefined' ? renderCookingPanel : undefined;
  window.handleCookingAddIngredient = typeof handleCookingAddIngredient !== 'undefined' ? handleCookingAddIngredient : undefined;
  window.handleQuickAddStaple = typeof handleQuickAddStaple !== 'undefined' ? handleQuickAddStaple : undefined;
  window.handleCookingSuggest = typeof handleCookingSuggest !== 'undefined' ? handleCookingSuggest : undefined;
  window.toggleCookingStepCheckbox = typeof toggleCookingStepCheckbox !== 'undefined' ? toggleCookingStepCheckbox : undefined;
  window.resetCookingPantry = typeof resetCookingPantry !== 'undefined' ? resetCookingPantry : undefined;
  window.openPantryModal = typeof openPantryModal !== 'undefined' ? openPantryModal : undefined;
  window.closePantryModal = typeof closePantryModal !== 'undefined' ? closePantryModal : undefined;
  window.openRecipeModal = typeof openRecipeModal !== 'undefined' ? openRecipeModal : undefined;
  window.closeRecipeModal = typeof closeRecipeModal !== 'undefined' ? closeRecipeModal : undefined;
  window.addCookingIngredient = addCookingIngredient;
  window.removeCookingIngredient = removeCookingIngredient;
  window.suggestCookingRecipe = typeof suggestCookingRecipe !== 'undefined' ? suggestCookingRecipe : undefined;
  window.clearCookingPantry = typeof clearCookingPantry !== 'undefined' ? clearCookingPantry : undefined;
  window.addRecipeMissingIngredientsToShopping = addRecipeMissingIngredientsToShopping;
  window.getCookingState = typeof getCookingState !== 'undefined' ? getCookingState : undefined;
}

if (typeof globalThis !== 'undefined') {
  globalThis.renderCookingPanel = typeof renderCookingPanel !== 'undefined' ? renderCookingPanel : undefined;
  globalThis.handleCookingAddIngredient = typeof handleCookingAddIngredient !== 'undefined' ? handleCookingAddIngredient : undefined;
  globalThis.handleQuickAddStaple = typeof handleQuickAddStaple !== 'undefined' ? handleQuickAddStaple : undefined;
  globalThis.handleCookingSuggest = typeof handleCookingSuggest !== 'undefined' ? handleCookingSuggest : undefined;
  globalThis.toggleCookingStepCheckbox = typeof toggleCookingStepCheckbox !== 'undefined' ? toggleCookingStepCheckbox : undefined;
  globalThis.resetCookingPantry = typeof resetCookingPantry !== 'undefined' ? resetCookingPantry : undefined;
  globalThis.openPantryModal = typeof openPantryModal !== 'undefined' ? openPantryModal : undefined;
  globalThis.closePantryModal = typeof closePantryModal !== 'undefined' ? closePantryModal : undefined;
  globalThis.openRecipeModal = typeof openRecipeModal !== 'undefined' ? openRecipeModal : undefined;
  globalThis.closeRecipeModal = typeof closeRecipeModal !== 'undefined' ? closeRecipeModal : undefined;
  globalThis.addCookingIngredient = addCookingIngredient;
  globalThis.removeCookingIngredient = removeCookingIngredient;
  globalThis.suggestCookingRecipe = typeof suggestCookingRecipe !== 'undefined' ? suggestCookingRecipe : undefined;
  globalThis.clearCookingPantry = typeof clearCookingPantry !== 'undefined' ? clearCookingPantry : undefined;
  globalThis.addRecipeMissingIngredientsToShopping = addRecipeMissingIngredientsToShopping;
  globalThis.getCookingState = typeof getCookingState !== 'undefined' ? getCookingState : undefined;
}
