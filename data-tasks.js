// CONFIGURATION KEYS FOR LOCALSTORAGE
const STORE_KEY = 'flowPlannerV3';
const HISTORY_KEY = 'flowPlannerV3History';
window.STORE_KEY = STORE_KEY;
window.HISTORY_KEY = HISTORY_KEY;

// 4-LANGUAGE DEFAULT LIST DICTIONARY
const DEFAULT_TASKS_BY_LANG = {
  en: {
    daily: ['Meds', 'Brush teeth (morning)', 'Wash face', 'Make bed', 'Air out room', 'Cook a meal', 'Brush teeth (evening)', 'Take a shower', 'Tidy up'],
    weekly: ['Dusting', 'Vacuuming', 'Mopping', 'Washing dishes', 'Washing laundry', 'Hanging up laundry', 'Cleaning sink & mirror cabinet', 'Tiles & bathtub', 'Cleaning the toilet', 'Taking out the trash', 'Returning deposit bottles'],
    occasionally: ['Washing hair', 'Cutting hair', 'Changing bedsheets', 'Clipping nails', 'Cleaning doors & windows', 'Cleaning stove & fridge']
  },
  de: {
    daily: ['Medis', 'Zähne morgens', 'Gesicht waschen', 'Bett machen', 'Durchlüften', 'Kochen', 'Zähne abends', 'Duschen', 'Aufräumen'],
    weekly: ['Staub wischen', 'Staubsaugen', 'Boden wischen', 'Geschirr spülen', 'Wäsche waschen', 'Wäsche aufhängen', 'Waschbecken & Spiegelschrank', 'Fliesen & Badewanne', 'Klo putzen', 'Müll wegbringen', 'Pfandflaschen wegbringen'],
    occasionally: ['Haare waschen', 'Haare schneiden', 'Bettwäsche tauschen', 'Nägel schneiden', 'Türe/Fenster putzen', 'Herd & Kühlschrank putzen']
  },
  es: {
    daily: ['Medicación', 'Cepillarse los dientes (mañana)', 'Lavarse la cara', 'Hacer la cama', 'Ventilar', 'Cocinar', 'Cepillarse los dientes (noche)', 'Ducharse', 'Ordenar'],
    weekly: ['Quitar el polvo', 'Pasar la aspiradora', 'Fregar el suelo', 'Lavar los platos', 'Hacer la colada', 'Colgar la ropa', 'Limpiar el lavabo y espejo', 'Azulejos y bañera', 'Limpiar el váter', 'Sacar la basura', 'Llevar botellas retornables'],
    occasionally: ['Lavarse el pelo', 'Cortarse el pelo', 'Cambiar las sábanas', 'Cortarse las uñas', 'Limpiar puertas y ventanas', 'Limpiar cocina y nevera']
  },
  el: {
    daily: ['Φάρμακα', 'Πλύσιμο δοντιών (πρωί)', 'Πλύσιμο προσώπου', 'Στρώσιμο κρεβατιού', 'Αερισμός χώρου', 'Μαγειρική', 'Πλύσιμο δοντιών (βράδυ)', 'Ντους', 'Τακτοποίηση'],
    weekly: ['Ξεσκόνισμα', 'Σκούπισμα', 'Σφουγγάρισμα', 'Πλύσιμο πιάτων', 'Πλύσιμο ρούχων', 'Άπλωμα ρούχων', 'Καθαρισμός νιπτήρα & καθρέφτη', 'Πλακάκια & μπανιέρα', 'Καθαρισμός λεκάνης', 'Πέταμα σκουπιδιών', 'Επιστροφή άδειων μπουκαλιών'],
    occasionally: ['Λούσιμο', 'Κούρεμα', 'Αλλαγή σεντονιών', 'Κόψιμο νυχιών', 'Καθαρισμός πορτών & παραθύρων', 'Καθαρισμός κουζίνας & ψυγείου']
  },
  fr: {
    daily: ['Médicaments', 'Brossage des dents (matin)', 'Se laver le visage', 'Faire le lit', 'Aérer la pièce', 'Préparer un repas', 'Brossage des dents (soir)', 'Prendre une douche', 'Ranger'],
    weekly: ['Épousseter', 'Passer l\'aspirateur', 'Laver le sol', 'Faire la vaisselle', 'Faire une lessive', 'Étendre le linge', 'Nettoyer lavabo & armoire à miroir', 'Carrelage & baignoire', 'Nettoyer les toilettes', 'Sortir les poubelles', 'Rapporter les bouteilles consignées'],
    occasionally: ['Se laver les cheveux', 'Se couper les cheveux', 'Changer les draps', 'Se couper les ongles', 'Nettoyer portes & fenêtres', 'Nettoyer cuisinière & réfrigérateur']
  },
  it: {
    daily: ['Farmaci', 'Lavare i denti (mattina)', 'Lavarsi la faccia', 'Rifare il letto', 'Arieggiare la stanza', 'Preparare un pasto', 'Lavare i denti (sera)', 'Fare la doccia', 'Riordinare'],
    weekly: ['Spolverare', 'Passare l\'aspirapolvere', 'Lavare i pavimenti', 'Lavare i piatti', 'Fare il bucato', 'Stendere il bucato', 'Pulire lavandino e armadietto specchio', 'Piastrelle e vasca', 'Pulire il WC', 'Portare fuori la spazzatura', 'Riportare le bottiglie con vuoto a rendere'],
    occasionally: ['Lavare i capelli', 'Tagliare i capelli', 'Cambiare le lenzuola', 'Tagliare le unghie', 'Pulire porte e finestre', 'Pulire fornelli e frigorifero']
  }
};

// HUMANE STEP-BY-STEP TRANSLATED PRESET DATABASE (Mapped internally to German key standard)
const TASK_STEPS_DATABASE = Object.assign({},
  typeof TASK_STEPS_DATABASE_PART1 !== 'undefined' ? TASK_STEPS_DATABASE_PART1 : {},
  typeof TASK_STEPS_DATABASE_PART2 !== 'undefined' ? TASK_STEPS_DATABASE_PART2 : {},
  typeof TASK_STEPS_DATABASE_PART3 !== 'undefined' ? TASK_STEPS_DATABASE_PART3 : {}
);


const FALLBACK_STEPS = {
  en: [
    '1. Gather all materials and items needed for "{task}"',
    '2. Reduce distractions and silence your phone',
    '3. Complete the first small starting step immediately (2-5 mins)',
    '4. Focus on working through the main part of "{task}"',
    '5. Clean up your workspace, put away materials, and check it off! 🎉'
  ],
  de: [
    '1. Material & benötigte Gegenstände für "{task}" heraussuchen',
    '2. Ablenkungen reduzieren & Handy stummschalten',
    '3. Den ersten konkreten Anfangsschritt direkt ausführen (2-5 Min)',
    '4. Hauptteil von "{task}" fokussiert abarbeiten',
    '5. Arbeitsplatz säubern, Material verstauen & Aufgabe als erledigt abhaken! 🎉'
  ],
  es: [
    '1. Reunir todos los materiales y objetos necesarios para "{task}"',
    '2. Reducir las distracciones y silenciar el móvil',
    '3. Realizar el primer paso pequeño de inmediato (2-5 min)',
    '4. Concentrarse en avanzar la parte principal de "{task}"',
    '5. Limpiar el espacio de trabajo, guardar los materiales y marcar como hecho. 🎉'
  ],
  el: [
    '1. Συγκέντρωσε όλα τα απαραίτητα υλικά και αντικείμενα για την εργασία "{task}"',
    '2. Μείωσε τους περισπασμούς και βάλε το τηλέφωνο στο αθόρυβο',
    '3. Κάνε αμέσως το πρώτο μικρό βήμα για να ξεκινήσεις (2-5 λεπτά)',
    '4. Εστίασε στην ολοκλήρωση του κύριου μέρους της εργασίας "{task}"',
    '5. Καθάρισε τον χώρο εργασίας, μάζεψε τα υλικά και σημείωσε την ως ολοκληρωμένη! 🎉'
  ],
  fr: [
    '1. Rassemble tout le matériel et les objets nécessaires pour "{task}"',
    '2. Réduis les distractions et mets ton téléphone en silencieux',
    '3. Fais immédiatement le premier petit pas pour commencer (2-5 min)',
    '4. Concentre-toi pour avancer sur l\'essentiel de "{task}"',
    '5. Range ton espace de travail, range le matériel et coche la tâche ! 🎉'
  ],
  it: [
    '1. Raduna tutto il materiale e gli oggetti necessari per "{task}"',
    '2. Riduci le distrazioni e silenzia il telefono',
    '3. Fai subito il primo piccolo passo per iniziare (2-5 min)',
    '4. Concentrati per portare avanti la parte principale di "{task}"',
    '5. Riordina lo spazio di lavoro, riponi il materiale e spunta l\'attività! 🎉'
  ]
};

const CATEGORIES = [
  ['daily', 'sun'],
  ['weekly', 'calendar-days'],
  ['todo', 'list-todo'],
  ['termine', 'clock'],
  ['occasionally', 'calendar-range'],
  ['notes', 'sticky-note'],
  ['done', 'check-circle']
];

const TASK_ICONS = {
  'Medis': 'pill', 'Meds': 'pill', 'Medicación': 'pill', 'Φάρμακα': 'pill', 'Médicaments': 'pill', 'Farmaci': 'pill',
  'Zähne morgens': 'sun', 'Brush teeth (morning)': 'sun', 'Cepillarse los dientes (mañana)': 'sun', 'Πλύσιμο δοντιών (πρωί)': 'sun', 'Brossage des dents (matin)': 'sun', 'Lavare i denti (mattina)': 'sun',
  'Gesicht waschen': 'smile', 'Wash face': 'smile', 'Lavarse la cara': 'smile', 'Πλύσιμο προσώπου': 'smile', 'Se laver le visage': 'smile', 'Lavarsi la faccia': 'smile',
  'Bett machen': 'bed', 'Make bed': 'bed', 'Hacer la cama': 'bed', 'Στρώσιμο κρεβατιού': 'bed', 'Faire le lit': 'bed', 'Rifare il letto': 'bed',
  'Durchlüften': 'wind', 'Air out room': 'wind', 'Ventilar': 'wind', 'Αερισμός χώρου': 'wind', 'Aérer la pièce': 'wind', 'Arieggiare la stanza': 'wind',
  'Kochen': 'cooking-pot', 'Cook a meal': 'cooking-pot', 'Cocinar': 'cooking-pot', 'Μαγειρική': 'cooking-pot', 'Préparer un repas': 'cooking-pot', 'Preparare un pasto': 'cooking-pot',
  'Zähne abends': 'moon', 'Brush teeth (evening)': 'moon', 'Cepillarse los dientes (noche)': 'moon', 'Πλύσιμο δοντιών (βράδυ)': 'moon', 'Brossage des dents (soir)': 'moon', 'Lavare i denti (sera)': 'moon',
  'Duschen': 'bath', 'Take a shower': 'bath', 'Ducharse': 'bath', 'Ντους': 'bath', 'Prendre une douche': 'bath', 'Fare la doccia': 'bath',
  'Aufräumen': 'sparkles', 'Tidy up': 'sparkles', 'Ordenar': 'sparkles', 'Τακτοποίηση': 'sparkles', 'Ranger': 'sparkles', 'Riordinare': 'sparkles',
  'Staub wischen': 'feather', 'Dusting': 'feather', 'Quitar el polvo': 'feather', 'Ξεσκόνισμα': 'feather', 'Épousseter': 'feather', 'Spolverare': 'feather',
  'Staubsaugen': 'tornado', 'Vacuuming': 'tornado', 'Pasar la aspiradora': 'tornado', 'Σκούπισμα': 'tornado', 'Passer l\'aspirateur': 'tornado', 'Passare l\'aspirapolvere': 'tornado',
  'Boden wischen': 'droplets', 'Mopping': 'droplets', 'Fregar el suelo': 'droplets', 'Σφουγγάρισμα': 'droplets', 'Laver le sol': 'droplets', 'Lavare i pavimenti': 'droplets',
  'Geschirr spülen': 'utensils', 'Washing dishes': 'utensils', 'Lavar los platos': 'utensils', 'Πλύσιμο πιάτων': 'utensils', 'Faire la vaisselle': 'utensils', 'Lavare i piatti': 'utensils',
  'Wäsche waschen': 'washing-machine', 'Washing laundry': 'washing-machine', 'Hacer la colada': 'washing-machine', 'Πλύσιμο ρούχων': 'washing-machine', 'Faire une lessive': 'washing-machine', 'Fare il bucato': 'washing-machine',
  'Wäsche aufhängen': 'shirt', 'Hanging up laundry': 'shirt', 'Colgar la ropa': 'shirt', 'Άπλωμα ρούχων': 'shirt', 'Étendre le linge': 'shirt', 'Stendere il bucato': 'shirt',
  'Waschbecken & Spiegelschrank': 'droplets', 'Waschbecken & Spiegelschrank putzen': 'droplets', 'Cleaning sink & mirror cabinet': 'droplets', 'Limpiar el lavabo y espejo': 'droplets', 'Καθαρισμός νιπτήρα & καθρέφτη': 'droplets', 'Nettoyer lavabo & armoire à miroir': 'droplets', 'Pulire lavandino e armadietto specchio': 'droplets',
  'Fliesen & Badewanne': 'bath', 'Tiles & bathtub': 'bath', 'Azulejos y bañera': 'bath', 'Πλακάκια & μπανιέρα': 'bath', 'Carrelage & baignoire': 'bath', 'Piastrelle e vasca': 'bath',
  'Klo putzen': 'sparkles', 'Cleaning the toilet': 'sparkles', 'Limpiar el váter': 'sparkles', 'Καθαρισμός λεκάνης': 'sparkles', 'Nettoyer les toilettes': 'sparkles', 'Pulire il WC': 'sparkles',
  'Müll wegbringen': 'trash-2', 'Taking out the trash': 'trash-2', 'Sacar la basura': 'trash-2', 'Πέταμα σκουπιδιών': 'trash-2', 'Sortir les poubelles': 'trash-2', 'Portare fuori la spazzatura': 'trash-2',
  'Pfandflaschen wegbringen': 'recycle', 'Returning deposit bottles': 'recycle', 'Llevar botellas retornables': 'recycle', 'Επιστροφή άδειων μπουκαλιών': 'recycle', 'Rapporter les bouteilles consignées': 'recycle', 'Riportare le bottiglie con vuoto a rendere': 'recycle',
  'Haare waschen': 'droplet', 'Washing hair': 'droplet', 'Lavarse el pelo': 'droplet', 'Λούσιμο': 'droplet', 'Se laver les cheveux': 'droplet', 'Lavare i capelli': 'droplet',
  'Haare schneiden': 'scissors', 'Cutting hair': 'scissors', 'Cortarse el pelo': 'scissors', 'Κούρεμα': 'scissors', 'Se couper les cheveux': 'scissors', 'Tagliare i capelli': 'scissors',
  'Bettwäsche tauschen': 'refresh-cw', 'Changing bedsheets': 'refresh-cw', 'Cambiar las sábanas': 'refresh-cw', 'Αλλαγή σεντονιών': 'refresh-cw', 'Changer les draps': 'refresh-cw', 'Cambiare le lenzuola': 'refresh-cw',
  'Nägel schneiden': 'scissors', 'Clipping nails': 'scissors', 'Cortarse las uñas': 'scissors', 'Κόψιμο νυχιών': 'scissors', 'Se couper les ongles': 'scissors', 'Tagliare le unghie': 'scissors',
  'Türe/Fenster putzen': 'sparkles', 'Cleaning doors & windows': 'sparkles', 'Limpiar puertas y ventanas': 'sparkles', 'Καθαρισμός πορτών & παραθύρων': 'sparkles', 'Nettoyer portes & fenêtres': 'sparkles', 'Pulire porte e finestre': 'sparkles',
  'Herd & Kühlschrank putzen': 'cooking-pot', 'Cleaning stove & fridge': 'cooking-pot', 'Limpiar cocina y nevera': 'cooking-pot', 'Καθαρισμός κουζίνας & ψυγείου': 'cooking-pot', 'Nettoyer cuisinière & frigo': 'cooking-pot', 'Pulire fornelli e frigo': 'cooking-pot',
  'Wichtigste Aufgabe (Fokus)': 'target', 'Key Priority (Focus)': 'target', 'Prioridad clave (Foco)': 'target', 'Priorité clé (Focus)': 'target', 'Priorità chiave (Focus)': 'target', 'Κύρια προτεραιότητα (Focus)': 'target',
  '10 Min. Abend-Aufräumen': 'sparkles', '10 min. Evening Tidy-up': 'sparkles', '10 min recogida nocturna': 'sparkles', '10 min rangement du soir': 'sparkles', '10 min riordino serale': 'sparkles', '10 λ. βραδινή τακτοποίηση': 'sparkles',
  'Großes Glas Wasser trinken': 'glass-water', 'Drink large glass of water': 'glass-water', 'Beber un gran vaso de agua': 'glass-water', 'Boire un grand verre d\'eau': 'glass-water', 'Bere un grande bicchiere d\'acqua': 'glass-water', 'Μεγάλο ποτήρι νερό': 'glass-water',
  'Pflanzen gießen': 'droplets', 'Water plants': 'droplets', 'Regar las plantas': 'droplets', 'Arroser les plantes': 'droplets', 'Annaffiare le piante': 'droplets', 'Πότισμα φυτών': 'droplets',
  'Digitales Aufräumen (Desktop/Downloads)': 'folder-kanban', 'Digital declutter (desktop/downloads)': 'folder-kanban', 'Limpieza digital (escritorio/descargas)': 'folder-kanban', 'Tri numérique (bureau/téléchargements)': 'folder-kanban', 'Decluttering digitale (desktop/download)': 'folder-kanban', 'Ψηφιακό ξεκαθάρισμα': 'folder-kanban',
  'Kaffeemaschine entkalken': 'coffee', 'Descaling coffee machine': 'coffee', 'Descalcificar cafetera': 'coffee', 'Détartrer cafetière': 'coffee', 'Decalcificare macchina caffè': 'coffee', 'Αφαλάτωση καφετιέρας': 'coffee',
  'Schränke / Kleidung ausmisten': 'shirt', 'Closet / wardrobe declutter': 'shirt', 'Ordenar armario y ropa': 'shirt', 'Désencombrer placards & vêtements': 'shirt', 'Riordinare armadio e vestiti': 'shirt', 'Ξεκαθάρισμα ντουλάπας': 'shirt',
  '25 Min. Pomodoro-Sprint': 'timer', '25 min Pomodoro sprint': 'timer', 'Sprint Pomodoro de 25 min': 'timer',
  '15 Min. Spaziergang an der frischen Luft': 'footprints', '15 min outdoor walk': 'footprints', '15 min paseo al aire libre': 'footprints', '15 min promenade au grand air': 'footprints',
  'Meditation / 5 Min. bewusst atmen': 'heart', 'Meditation / 5 min breathwork': 'heart', 'Meditación / 5 min respiración': 'heart'
};

const ROUTINE_PRESETS = [
  {
    id: 'balance',
    name: {
      de: 'Harmonischer Alltag (Standard)',
      en: 'Mindful Daily Balance (Standard)',
      es: 'Equilibrio Diario (Estándar)',
      fr: 'Équilibre du Quotidien (Standard)',
      it: 'Equilibrio Quotidiano (Standard)',
      el: 'Καθημερινή Ισορροπία (Πρότυπο)'
    },
    tagline: {
      de: 'Ausgewogene Struktur für Morgen, Tag & Abend',
      en: 'Balanced flow for morning, workday & evening',
      es: 'Estructura equilibrada para mañana, día y noche',
      fr: 'Structure équilibrée pour matin, journée et soir',
      it: 'Struttura equilibrata per mattina, giorno e sera',
      el: 'Ισορροπημένη ροή για πρωί, ημέρα και βράδυ'
    },
    icon: 'sparkles',
    badge: {
      de: 'Empfohlen',
      en: 'Recommended',
      es: 'Recomendado',
      fr: 'Recommandé',
      it: 'Consigliato',
      el: 'Προτεινόμενο'
    },
    color: 'from-purple-500 to-indigo-500',
    tasks: {
      daily: {
        de: ['Medis', 'Zähne morgens', 'Gesicht waschen', 'Bett machen', 'Durchlüften', 'Wichtigste Aufgabe (Fokus)', 'Kochen', '10 Min. Abend-Aufräumen', 'Duschen', 'Zähne abends'],
        en: ['Meds', 'Brush teeth (morning)', 'Wash face', 'Make bed', 'Air out room', 'Key Priority (Focus)', 'Cook a meal', '10 min. Evening Tidy-up', 'Take a shower', 'Brush teeth (evening)'],
        es: ['Medicación', 'Cepillarse los dientes (mañana)', 'Lavarse la cara', 'Hacer la cama', 'Ventilar', 'Prioridad clave (Foco)', 'Cocinar', '10 min recogida nocturna', 'Ducharse', 'Cepillarse los dientes (noche)'],
        fr: ['Médicaments', 'Brossage des dents (matin)', 'Se laver le visage', 'Faire le lit', 'Aérer la pièce', 'Priorité clé (Focus)', 'Préparer un repas', '10 min rangement du soir', 'Prendre une douche', 'Brossage des dents (soir)'],
        it: ['Farmaci', 'Lavare i denti (mattina)', 'Lavarsi la faccia', 'Rifare il letto', 'Arieggiare la stanza', 'Priorità chiave (Focus)', 'Preparare un pasto', '10 min riordino serale', 'Fare la doccia', 'Lavare i denti (sera)'],
        el: ['Φάρμακα', 'Πλύσιμο δοντιών (πρωί)', 'Πλύσιμο προσώπου', 'Στρώσιμο κρεβατιού', 'Αερισμός χώρου', 'Κύρια προτεραιότητα (Focus)', 'Μαγειρική', '10 λ. βραδινή τακτοποίηση', 'Ντους', 'Πλύσιμο δοντιών (βράδυ)']
      },
      weekly: {
        de: ['Staub wischen', 'Staubsaugen', 'Boden wischen', 'Geschirr spülen', 'Wäsche waschen', 'Wäsche aufhängen', 'Waschbecken & Spiegelschrank', 'Fliesen & Badewanne', 'Klo putzen', 'Müll wegbringen', 'Pfandflaschen wegbringen'],
        en: ['Dusting', 'Vacuuming', 'Mopping', 'Washing dishes', 'Washing laundry', 'Hanging up laundry', 'Cleaning sink & mirror cabinet', 'Tiles & bathtub', 'Cleaning the toilet', 'Taking out the trash', 'Returning deposit bottles'],
        es: ['Quitar el polvo', 'Pasar la aspiradora', 'Fregar el suelo', 'Lavar los platos', 'Hacer la colada', 'Colgar la ropa', 'Limpiar el lavabo y espejo', 'Azulejos y bañera', 'Limpiar el váter', 'Sacar la basura', 'Llevar botellas retornables'],
        fr: ['Épousseter', 'Passer l\'aspirateur', 'Laver le sol', 'Faire la vaisselle', 'Faire une lessive', 'Étendre le linge', 'Nettoyer lavabo & armoire à miroir', 'Carrelage & baignoire', 'Nettoyer les toilettes', 'Sortir les poubelles', 'Rapporter les bouteilles consignées'],
        it: ['Spolverare', 'Passare l\'aspirapolvere', 'Lavare i pavimenti', 'Lavare i piatti', 'Fare il bucato', 'Stendere il bucato', 'Pulire lavandino e armadietto specchio', 'Piastrelle e vasca', 'Pulire il WC', 'Portare fuori la spazzatura', 'Riportare le bottiglie con vuoto a rendere'],
        el: ['Ξεσκόνισμα', 'Σκούπισμα', 'Σφουγγάρισμα', 'Πλύσιμο πιάτων', 'Πλύσιμο ρούχων', 'Άπλωμα ρούχων', 'Καθαρισμός νιπτήρα & καθρέφτη', 'Πλακάκια & μπανιέρα', 'Καθαρισμός λεκάνης', 'Πέταμα σκουπιδιών', 'Επιστροφή άδειων μπουκαλιών']
      },
      occasionally: {
        de: ['Bettwäsche tauschen', 'Nägel schneiden', 'Haare waschen', 'Haare schneiden', 'Türe/Fenster putzen', 'Herd & Kühlschrank putzen'],
        en: ['Changing bedsheets', 'Clipping nails', 'Washing hair', 'Cutting hair', 'Cleaning doors & windows', 'Cleaning stove & fridge'],
        es: ['Cambiar las sábanas', 'Cortarse las uñas', 'Lavarse el pelo', 'Cortarse el pelo', 'Limpiar puertas y ventanas', 'Limpiar cocina y nevera'],
        fr: ['Changer les draps', 'Se couper les ongles', 'Se laver les cheveux', 'Se couper les cheveux', 'Nettoyer portes & fenêtres', 'Nettoyer cuisinière & réfrigérateur'],
        it: ['Cambiare le lenzuola', 'Tagliare le unghie', 'Lavare i capelli', 'Tagliare i capelli', 'Pulire porte e finestre', 'Pulire fornelli e frigorifero'],
        el: ['Αλλαγή σεντονιών', 'Κόψιμο νυχιών', 'Λούσιμο', 'Κούρεμα', 'Καθαρισμός πορτών & παραθύρων', 'Καθαρισμός κουζίνας & ψυγείου']
      }
    }
  },
  {
    id: 'minimalist',
    name: {
      de: 'Minimalist (Leicht & Schnell)',
      en: 'Minimalist (Light & Fast)',
      es: 'Minimalista (Ligero y Rápido)',
      fr: 'Minimaliste (Léger & Rapide)',
      it: 'Minimalista (Leggero e Rapido)',
      el: 'Μινιμαλιστικό (Ελαφρύ & Γρήγορο)'
    },
    tagline: {
      de: 'Nur die absoluten Kernaufgaben — maximale mentale Entlastung',
      en: 'Only the core essentials — zero overwhelm, maximum headspace',
      es: 'Solo lo esencial — sin agobios, máxima claridad mental',
      fr: 'Seulement l\'essentiel — zéro surcharge, esprit clair',
      it: 'Solo l\'essenziale assoluto — zero stress, massima lucidità',
      el: 'Μόνο τα απολύτως απαραίτητα — μέγιστη ηρεμία'
    },
    icon: 'feather',
    badge: {
      de: 'Leicht',
      en: 'Light',
      es: 'Ligero',
      fr: 'Léger',
      it: 'Leggero',
      el: 'Ελαφρύ'
    },
    color: 'from-teal-500 to-emerald-500',
    tasks: {
      daily: {
        de: ['Zähne morgens', 'Bett machen', 'Wichtigste Aufgabe (Fokus)', 'Zähne abends'],
        en: ['Brush teeth (morning)', 'Make bed', 'Key Priority (Focus)', 'Brush teeth (evening)'],
        es: ['Cepillarse los dientes (mañana)', 'Hacer la cama', 'Prioridad clave (Foco)', 'Cepillarse los dientes (noche)'],
        fr: ['Brossage des dents (matin)', 'Faire le lit', 'Priorité clé (Focus)', 'Brossage des dents (soir)'],
        it: ['Lavare i denti (mattina)', 'Rifare il letto', 'Priorità chiave (Focus)', 'Lavare i denti (sera)'],
        el: ['Πλύσιμο δοντιών (πρωί)', 'Στρώσιμο κρεβατιού', 'Κύρια προτεραιότητα (Focus)', 'Πλύσιμο δοντιών (βράδυ)']
      },
      weekly: {
        de: ['Staubsaugen', 'Geschirr spülen', 'Wäsche waschen', 'Müll wegbringen'],
        en: ['Vacuuming', 'Washing dishes', 'Washing laundry', 'Taking out the trash'],
        es: ['Pasar la aspiradora', 'Lavar los platos', 'Hacer la colada', 'Sacar la basura'],
        fr: ['Passer l\'aspirateur', 'Faire la vaisselle', 'Faire une lessive', 'Sortir les poubelles'],
        it: ['Passare l\'aspirapolvere', 'Lavare i piatti', 'Fare il bucato', 'Portare fuori la spazzatura'],
        el: ['Σκούπισμα', 'Πλύσιμο πιάτων', 'Πλύσιμο ρούχων', 'Πέταμα σκουπιδιών']
      },
      occasionally: {
        de: ['Bettwäsche tauschen', 'Nägel schneiden'],
        en: ['Changing bedsheets', 'Clipping nails'],
        es: ['Cambiar las sábanas', 'Cortarse las uñas'],
        fr: ['Changer les draps', 'Se couper les ongles'],
        it: ['Cambiare le lenzuola', 'Tagliare le unghie'],
        el: ['Αλλαγή σεντονιών', 'Κόψιμο νυχιών']
      }
    }
  },
  {
    id: 'adhd_focus',
    name: {
      de: 'Klarheit & ADHS-Fokus',
      en: 'Clarity & ADHD Flow',
      es: 'Claridad y Enfoque TDAH',
      fr: 'Clarté & Focus TDAH',
      it: 'Chiarezza & Focus ADHD',
      el: 'Διαύγεια & Εστίαση ADHD'
    },
    tagline: {
      de: 'Klare Micro-Steps, niedrige Hürden & schnelle Dopamin-Erfolge',
      en: 'Bite-sized micro steps, low barrier & quick dopamine wins',
      es: 'Micro-pasos claros, baja barrera de inicio y recompensas',
      fr: 'Micro-étapes simples, démarrage facile & victoires rapides',
      it: 'Micro-passi chiari, avvio facile e gratificazioni veloci',
      el: 'Μικρά κατανοητά βήματα & άμεση ικανοποίηση'
    },
    icon: 'zap',
    badge: {
      de: 'Neurodivers',
      en: 'Neuro-Friendly',
      es: 'Neurodiverso',
      fr: 'Neuro-friendly',
      it: 'Neuro-friendly',
      el: 'Neuro-friendly'
    },
    color: 'from-amber-500 to-rose-500',
    tasks: {
      daily: {
        de: ['Großes Glas Wasser trinken', 'Medis', 'Zähne morgens', 'Fenster 5 Min. aufreißen', '1 Wichtigste Aufgabe (Fokus)', '5 Min. Reset nach Arbeit', '10 Min. Abend-Aufräumen', 'Zähne abends'],
        en: ['Drink large glass of water', 'Meds', 'Brush teeth (morning)', 'Open window for 5 mins', '1 Main Focus Task', '5 min post-work reset', '10 min. Evening Tidy-up', 'Brush teeth (evening)'],
        es: ['Beber un gran vaso de agua', 'Medicación', 'Cepillarse los dientes (mañana)', 'Abrir ventana 5 min', '1 Tarea clave (Foco)', '5 min reseteo post-trabajo', '10 min recogida nocturna', 'Cepillarse los dientes (noche)'],
        fr: ['Boire un grand verre d\'eau', 'Médicaments', 'Brossage des dents (matin)', 'Ouvrir la fenêtre 5 min', '1 Tâche Focus Principale', '5 min pause reset après travail', '10 min rangement du soir', 'Brossage des dents (soir)'],
        it: ['Bere un grande bicchiere d\'acqua', 'Farmaci', 'Lavare i denti (mattina)', 'Aprire finestra 5 min', '1 Attività Chiave (Focus)', '5 min reset post-lavoro', '10 min riordino serale', 'Lavare i denti (sera)'],
        el: ['Μεγάλο ποτήρι νερό', 'Φάρμακα', 'Πλύσιμο δοντιών (πρωί)', 'Άνοιγμα παραθύρου 5 λ.', '1 Κύρια εργασία εστίασης', '5 λ. αποφόρτιση μετά τη δουλειά', '10 λ. βραδινή τακτοποίηση', 'Πλύσιμο δοντιών (βράδυ)']
      },
      weekly: {
        de: ['15 Min. Turbo-Staubsaugen', '1 Waschladung waschen & aufhängen', 'Klo kurz reinigen', 'Müllbeutel vor die Tür', 'Pfandflaschen sammeln'],
        en: ['15 min turbo vacuuming', '1 laundry batch wash & hang', 'Quick toilet refresh', 'Trash to front door', 'Collect deposit bottles'],
        es: ['15 min aspirado turbo', '1 lavadora y colgar ropa', 'Repaso rápido al váter', 'Basura a la puerta', 'Reunir botellas retornables'],
        fr: ['15 min aspirateur express', '1 lessive lavée et étendue', 'Coup de propre aux toilettes', 'Poubelle devant la porte', 'Rassembler bouteilles consignées'],
        it: ['15 min aspirapolvere rapido', '1 carico bucato lavato e steso', 'Pulizia veloce del WC', 'Spazzatura vicino alla porta', 'Raccogliere bottiglie vuoto'],
        el: ['15 λ. γρήγορο σκούπισμα', '1 πλυντήριο ρούχων & άπλωμα', 'Γρήγορο καθάρισμα λεκάνης', 'Σκουπίδια έξω από την πόρτα', 'Μάζεμα μπουκαλιών']
      },
      occasionally: {
        de: ['Bettwäsche tauschen', 'Digitales Aufräumen (Desktop/Downloads)', 'Nägel schneiden'],
        en: ['Changing bedsheets', 'Digital declutter (desktop/downloads)', 'Clipping nails'],
        es: ['Cambiar las sábanas', 'Limpieza digital (escritorio/descargas)', 'Cortarse las uñas'],
        fr: ['Changer les draps', 'Tri numérique (bureau/téléchargements)', 'Se couper les ongles'],
        it: ['Cambiare le lenzuola', 'Decluttering digitale (desktop/download)', 'Tagliare le unghie'],
        el: ['Αλλαγή σεντονιών', 'Ψηφιακό ξεκαθάρισμα (desktop/downloads)', 'Κόψιμο νυχιών']
      }
    }
  },
  {
    id: 'productivity_deepwork',
    name: {
      de: 'Deep Work & Produktivität',
      en: 'Deep Work & High Performance',
      es: 'Deep Work y Alta Productividad',
      fr: 'Deep Work & Haute Performance',
      it: 'Deep Work & Alta Produttività',
      el: 'Βαθιά Εργασία & Παραγωγικότητα'
    },
    tagline: {
      de: 'Fokus-Blöcke, Inbox-Zero & klare Energie-Pausen',
      en: 'Focus sprints, inbox zero & deliberate recovery breaks',
      es: 'Bloques de enfoque, bandeja a cero y pausas estratégicas',
      fr: 'Blocs de concentration, inbox zero & vraies pauses',
      it: 'Sessioni di focus, inbox zero e pause rigeneranti',
      el: 'Μπλοκ συγκέντρωσης, inbox zero & συνειδητά διαλείμματα'
    },
    icon: 'target',
    badge: {
      de: 'Pro Fokus',
      en: 'Pro Focus',
      es: 'Pro Enfoque',
      fr: 'Pro Focus',
      it: 'Pro Focus',
      el: 'Pro Focus'
    },
    color: 'from-cyan-500 to-blue-600',
    tasks: {
      daily: {
        de: ['Tages-Fokus & Top 3 Ziele definieren', 'Inbox & Nachrichten sortieren (15 Min.)', 'Fokus-Block 1 (90 Min. Deep Work)', 'Mittags-Spaziergang / Bewegung', 'Fokus-Block 2', 'Tages-Abschluss & Schreibtisch klären'],
        en: ['Set daily focus & top 3 goals', 'Triage inbox & messages (15 min)', 'Focus Block 1 (90 min Deep Work)', 'Midday walk / stretch', 'Focus Block 2', 'Day shutdown & clear workspace'],
        es: ['Definir foco diario y 3 objetivos clave', 'Organizar bandeja y mensajes (15 min)', 'Bloque Focus 1 (90 min Deep Work)', 'Paseo de mediodía / estiramientos', 'Bloque Focus 2', 'Cierre del día y despejar escritorio'],
        fr: ['Définir le focus et le top 3 du jour', 'Trier la boîte de réception (15 min)', 'Bloc Focus 1 (90 min Deep Work)', 'Marche / étirements à midi', 'Bloc Focus 2', 'Clôture de journée et bureau net'],
        it: ['Definire focus del giorno e top 3 obiettivi', 'Gestire email e messaggi (15 min)', 'Blocco Focus 1 (90 min Deep Work)', 'Passeggiata di mezzogiorno / movimento', 'Blocco Focus 2', 'Chiusura giornata e scrivania libera'],
        el: ['Ορισμός κύριου στόχου & top 3 προτεραιότητες', 'Έλεγχος μηνυμάτων & email (15 λ.)', 'Focus Block 1 (90 λ. Deep Work)', 'Μεσημεριανός περίπατος / διάταση', 'Focus Block 2', 'Κλείσιμο ημέρας & τακτοποίηση γραφείου']
      },
      weekly: {
        de: ['Wochenrückblick & Planung nächste Woche', 'Digitales Backup & Inbox-Zero', 'Arbeitsplatz gründlich reinigen', 'Staubsaugen & Haushalt-Check'],
        en: ['Weekly review & next week planning', 'Digital backup & Inbox-Zero', 'Deep clean workspace', 'Vacuuming & quick home check'],
        es: ['Revisión semanal y planificación', 'Backup digital y bandeja limpia', 'Limpieza a fondo del escritorio', 'Pasar aspiradora y repaso del hogar'],
        fr: ['Bilan hebdomadaire & planning semaine pro', 'Sauvegarde numérique & boîte vide', 'Nettoyage complet du bureau', 'Aspirateur & check maison'],
        it: ['Revisione settimanale e pianificazione', 'Backup digitale e inbox vuota', 'Pulizia accurata della scrivania', 'Aspirapolvere e controllo casa'],
        el: ['Εβδομαδιαία ανασκόπηση & προγραμματισμός', 'Ψηφιακό backup & inbox-zero', 'Σχολαστικό καθάρισμα γραφείου', 'Σκούπισμα & έλεγχος σπιτιού']
      },
      occasionally: {
        de: ['Monats-Ziele reflektieren', 'Dateien & Archiv aufräumen', 'Hardware & Tastatur desinfizieren'],
        en: ['Monthly goals review', 'Archive & files cleanup', 'Sanitize hardware & keyboard'],
        es: ['Revisar metas del mes', 'Limpieza de archivos y descargas', 'Desinfectar teclado y equipo'],
        fr: ['Bilan des objectifs mensuels', 'Rangement des archives et fichiers', 'Désinfecter clavier et matériel'],
        it: ['Riflessione obiettivi mensili', 'Archivio e pulizia cartelle', 'Igienizzare tastiera e dispositivi'],
        el: ['Αναστοχασμός μηνιαίων στόχων', 'Οργάνωση αρχείων & αρχειοθήκης', 'Απολύμανση πληκτρολογίου & συσκευών']
      }
    }
  },
  {
    id: 'blank',
    name: {
      de: 'Tabula Rasa (Leere Vorlage)',
      en: 'Tabula Rasa (Clean Slate)',
      es: 'Tabula Rasa (Plantilla Vacía)',
      fr: 'Tabula Rasa (Page Blanche)',
      it: 'Tabula Rasa (Modello Vuoto)',
      el: 'Tabula Rasa (Κενός Πίνακας)'
    },
    tagline: {
      de: 'Komplett leer starten & deine Routinen frei gestalten',
      en: 'Start completely empty and craft your own custom system',
      es: 'Empieza desde cero y crea tu propio sistema a medida',
      fr: 'Pars de zéro et construis ton système sur-mesure',
      it: 'Inizia da zero e crea le tue routine liberamente',
      el: 'Ξεκίνα από το μηδέν και δημιούργησε το δικό σου σύστημα'
    },
    icon: 'circle-dashed',
    badge: {
      de: 'Frei',
      en: 'Custom',
      es: 'Libre',
      fr: 'Libre',
      it: 'Libero',
      el: 'Ελεύθερο'
    },
    color: 'from-gray-500 to-slate-700',
    tasks: {
      daily: { de: [], en: [], es: [], fr: [], it: [], el: [] },
      weekly: { de: [], en: [], es: [], fr: [], it: [], el: [] },
      occasionally: { de: [], en: [], es: [], fr: [], it: [], el: [] }
    }
  }
];

const TASK_SUGGESTIONS_CATALOG = {
  morning: {
    icon: 'sun',
    title: {
      de: '🌅 Morgenroutine & Start',
      en: '🌅 Morning Routine & Kickoff',
      es: '🌅 Rutina Matutina y Arranque',
      fr: '🌅 Routine Matinale & Réveil',
      it: '🌅 Routine Mattutina & Avvio',
      el: '🌅 Πρωινή Ρουτίνα & Ξεκίνημα'
    },
    items: [
      { de: 'Großes Glas Wasser trinken', en: 'Drink large glass of water', es: 'Beber un gran vaso de agua', fr: 'Boire un grand verre d\'eau', it: 'Bere un grande bicchiere d\'acqua', el: 'Μεγάλο ποτήρι νερό' },
      { de: 'Medis', en: 'Meds', es: 'Medicación', fr: 'Médicaments', it: 'Farmaci', el: 'Φάρμακα' },
      { de: 'Zähne morgens', en: 'Brush teeth (morning)', es: 'Cepillarse los dientes (mañana)', fr: 'Brossage des dents (matin)', it: 'Lavare i denti (mattina)', el: 'Πλύσιμο δοντιών (πρωί)' },
      { de: 'Gesicht waschen', en: 'Wash face', es: 'Lavarse la cara', fr: 'Se laver le visage', it: 'Lavarsi la faccia', el: 'Πλύσιμο προσώπου' },
      { de: 'Bett machen', en: 'Make bed', es: 'Hacer la cama', fr: 'Faire le lit', it: 'Rifare il letto', el: 'Στρώσιμο κρεβατιού' },
      { de: 'Durchlüften (5-10 Min.)', en: 'Air out room (5-10 min)', es: 'Ventilar (5-10 min)', fr: 'Aérer la pièce (5-10 min)', it: 'Arieggiare la stanza (5-10 min)', el: 'Αερισμός χώρου (5-10 λ.)' },
      { de: '5 Min. Dehnen / Mobility', en: '5 min stretching / mobility', es: '5 min estiramientos', fr: '5 min étirements / mobilité', it: '5 min stretching / mobilità', el: '5 λ. διατάσεις / κινητικότητα' },
      { de: 'Gesunder Snack / Frühstück', en: 'Healthy breakfast / snack', es: 'Desayuno o snack saludable', fr: 'Petit-déjeuner sain / encas', it: 'Colazione o spuntino sano', el: 'Υγιεινό πρωινό / σνακ' }
    ]
  },
  focus: {
    icon: 'target',
    title: {
      de: '🎯 Fokus, Arbeit & Lernen',
      en: '🎯 Focus, Work & Study',
      es: '🎯 Enfoque, Trabajo y Estudio',
      fr: '🎯 Focus, Travail & Études',
      it: '🎯 Focus, Lavoro & Studio',
      el: '🎯 Εστίαση, Εργασία & Μελέτη'
    },
    items: [
      { de: 'Wichtigste Aufgabe (Fokus)', en: 'Key Priority (Focus)', es: 'Prioridad clave (Foco)', fr: 'Priorité clé (Focus)', it: 'Priorità chiave (Focus)', el: 'Κύρια προτεραιότητα (Focus)' },
      { de: 'Inbox & E-Mails sortieren (15 Min.)', en: 'Triage inbox & emails (15 min)', es: 'Revisar correos (15 min)', fr: 'Trier la boîte e-mail (15 min)', it: 'Gestire email (15 min)', el: 'Έλεγχος email (15 λ.)' },
      { de: '25 Min. Pomodoro-Sprint', en: '25 min Pomodoro sprint', es: 'Sprint Pomodoro de 25 min', fr: 'Sprint Pomodoro de 25 min', it: 'Sessione Pomodoro di 25 min', el: '25 λ. Pomodoro sprint' },
      { de: 'Arbeitsplatz aufräumen & frei machen', en: 'Clear & organize workspace', es: 'Despejar y ordenar escritorio', fr: 'Ranger et dégager le bureau', it: 'Liberare e ordinare la scrivania', el: 'Τακτοποίηση επιφάνειας γραφείου' },
      { de: 'Tages-Abschluss & Reflektion', en: 'Day shutdown & reflection', es: 'Cierre del día y reflexión', fr: 'Clôture de journée & bilan', it: 'Chiusura di giornata e bilancio', el: 'Κλείσιμο ημέρας & ανασκόπηση' }
    ]
  },
  household: {
    icon: 'home',
    title: {
      de: '🧹 Haushalt & Sauberkeit',
      en: '🧹 Household & Cleanliness',
      es: '🧹 Hogar y Limpieza',
      fr: '🧹 Maison & Ménage',
      it: '🧹 Casa & Pulizia',
      el: '🧹 Σπίτι & Καθαριότητα'
    },
    items: [
      { de: 'Staub wischen', en: 'Dusting', es: 'Quitar el polvo', fr: 'Épousseter', it: 'Spolverare', el: 'Ξεσκόνισμα' },
      { de: 'Staubsaugen', en: 'Vacuuming', es: 'Pasar la aspiradora', fr: 'Passer l\'aspirateur', it: 'Passare l\'aspirapolvere', el: 'Σκούπισμα' },
      { de: 'Boden wischen', en: 'Mopping', es: 'Fregar el suelo', fr: 'Laver le sol', it: 'Lavare i pavimenti', el: 'Σφουγγάρισμα' },
      { de: 'Geschirr spülen', en: 'Washing dishes', es: 'Lavar los platos', fr: 'Faire la vaisselle', it: 'Lavare i piatti', el: 'Πλύσιμο πιάτων' },
      { de: 'Wäsche waschen', en: 'Washing laundry', es: 'Hacer la colada', fr: 'Faire une lessive', it: 'Fare il bucato', el: 'Πλύσιμο ρούχων' },
      { de: 'Wäsche aufhängen', en: 'Hanging up laundry', es: 'Colgar la ropa', fr: 'Étendre le linge', it: 'Stendere il bucato', el: 'Άπλωμα ρούχων' },
      { de: 'Waschbecken & Spiegelschrank', en: 'Cleaning sink & mirror cabinet', es: 'Limpiar el lavabo y espejo', fr: 'Nettoyer lavabo & armoire à miroir', it: 'Pulire lavandino e specchio', el: 'Καθαρισμός νιπτήρα & καθρέφτη' },
      { de: 'Fliesen & Badewanne', en: 'Tiles & bathtub', es: 'Azulejos y bañera', fr: 'Carrelage & baignoire', it: 'Piastrelle e vasca', el: 'Πλακάκια & μπανιέρα' },
      { de: 'Klo putzen', en: 'Cleaning the toilet', es: 'Limpiar el váter', fr: 'Nettoyer les toilettes', it: 'Pulire il WC', el: 'Καθαρισμός λεκάνης' },
      { de: 'Müll wegbringen', en: 'Taking out the trash', es: 'Sacar la basura', fr: 'Sortir les poubelles', it: 'Portare fuori la spazzatura', el: 'Πέταμα σκουπιδιών' },
      { de: 'Pfandflaschen wegbringen', en: 'Returning deposit bottles', es: 'Llevar botellas retornables', fr: 'Rapporter les bouteilles', it: 'Riportare le bottiglie', el: 'Επιστροφή άδειων μπουκαλιών' },
      { de: 'Pflanzen gießen', en: 'Water plants', es: 'Regar las plantas', fr: 'Arroser les plantes', it: 'Annaffiare le piante', el: 'Πότισμα φυτών' }
    ]
  },
  wellness: {
    icon: 'heart-pulse',
    title: {
      de: '🌿 Selfcare & Wohlbefinden',
      en: '🌿 Self-Care & Well-Being',
      es: '🌿 Autocuidado y Bienestar',
      fr: '🌿 Bien-être & Self-Care',
      it: '🌿 Cura di sé & Benessere',
      el: '🌿 Αυτοφροντίδα & Ευεξία'
    },
    items: [
      { de: 'Duschen', en: 'Take a shower', es: 'Ducharse', fr: 'Prendre une douche', it: 'Fare la doccia', el: 'Ντους' },
      { de: 'Haare waschen', en: 'Washing hair', es: 'Lavarse el pelo', fr: 'Se laver les cheveux', it: 'Lavare i capelli', el: 'Λούσιμο' },
      { de: 'Nägel schneiden', en: 'Clipping nails', es: 'Cortarse las uñas', fr: 'Se couper les ongles', it: 'Tagliare le unghie', el: 'Κόψιμο νυχιών' },
      { de: '15 Min. Spaziergang an der frischen Luft', en: '15 min outdoor walk', es: '15 min paseo al aire libre', fr: '15 min promenade au grand air', it: '15 min passeggiata all\'aria aperta', el: '15 λ. βόλτα στον καθαρό αέρα' },
      { de: 'Meditation / 5 Min. bewusst atmen', en: 'Meditation / 5 min breathwork', es: 'Meditación / 5 min respiración', fr: 'Méditation / 5 min respiration', it: 'Meditazione / 5 min respirazione', el: 'Διαλογισμός / 5 λ. αναπνοές' },
      { de: 'Kochen (Frische Mahlzeit)', en: 'Cook a fresh meal', es: 'Cocinar comida fresca', fr: 'Cuisiner un bon repas', it: 'Cucinare un pasto fresco', el: 'Μαγειρική (φρέσκο γεύμα)' }
    ]
  },
  evening: {
    icon: 'moon',
    title: {
      de: '🌙 Abendroutine & Erholung',
      en: '🌙 Evening Routine & Rest',
      es: '🌙 Rutina Nocturna y Descanso',
      fr: '🌙 Routine du Soir & Sommeil',
      it: '🌙 Routine Serale & Riposo',
      el: '🌙 Βραδινή Ρουτίνα & Χαλάρωση'
    },
    items: [
      { de: '10 Min. Abend-Aufräumen', en: '10 min. Evening Tidy-up', es: '10 min recogida nocturna', fr: '10 min rangement du soir', it: '10 min riordino serale', el: '10 λ. βραδινή τακτοποίηση' },
      { de: 'Zähne abends', en: 'Brush teeth (evening)', es: 'Cepillarse los dientes (noche)', fr: 'Brossage des dents (soir)', it: 'Lavare i denti (sera)', el: 'Πλύσιμο δοντιών (βράδυ)' },
      { de: 'Bildschirm-Pause (30 Min. vor Schlaf)', en: 'Screen-free time (30 min before bed)', es: 'Pausa de pantallas antes de dormir', fr: 'Pause écran (30 min avant sommeil)', it: 'Pausa schermi prima di dormire', el: 'Χωρίς οθόνες (30 λ. πριν τον ύπνο)' },
      { de: 'Buch / Kapitel lesen', en: 'Read a book / chapter', es: 'Leer un libro / capítulo', fr: 'Lire un livre / chapitre', it: 'Leggere un libro / capitolo', el: 'Διάβασμα βιβλίου' },
      { de: '3 Dinge für morgen notieren', en: 'Write down 3 things for tomorrow', es: 'Anotar 3 tareas para mañana', fr: 'Noter 3 priorités pour demain', it: 'Annotare 3 cose per domani', el: 'Σημείωση 3 στόχων για αύριο' }
    ]
  },
  deepclean: {
    icon: 'sparkle',
    title: {
      de: '✨ Gelegentlich & Tiefenreinigung',
      en: '✨ Occasional & Deep Cleaning',
      es: '✨ Ocasional y Limpieza Profunda',
      fr: '✨ Occasionnel & Grand Nettoyage',
      it: '✨ Occasionale & Pulizia Profonda',
      el: '✨ Περιοδική & Βαθιά Καθαριότητα'
    },
    items: [
      { de: 'Bettwäsche tauschen', en: 'Changing bedsheets', es: 'Cambiar las sábanas', fr: 'Changer les draps', it: 'Cambiare le lenzuola', el: 'Αλλαγή σεντονιών' },
      { de: 'Türe/Fenster putzen', en: 'Cleaning doors & windows', es: 'Limpiar puertas y ventanas', fr: 'Nettoyer portes & fenêtres', it: 'Pulire porte e finestre', el: 'Καθαρισμός πορτών & παραθύρων' },
      { de: 'Herd & Kühlschrank putzen', en: 'Cleaning stove & fridge', es: 'Limpiar cocina y nevera', fr: 'Nettoyer cuisinière & réfrigérateur', it: 'Pulire fornelli e frigorifero', el: 'Καθαρισμός κουζίνας & ψυγείου' },
      { de: 'Kaffeemaschine entkalken', en: 'Descaling coffee machine', es: 'Descalcificar cafetera', fr: 'Détartrer cafetière', it: 'Decalcificare macchina caffè', el: 'Αφαλάτωση καφετιέρας' },
      { de: 'Digitales Aufräumen (Desktop/Downloads)', en: 'Digital declutter (desktop/downloads)', es: 'Limpieza digital (escritorio/descargas)', fr: 'Tri numérique (bureau/téléchargements)', it: 'Decluttering digitale (desktop/download)', el: 'Ψηφιακό ξεκαθάρισμα' },
      { de: 'Schränke / Kleidung ausmisten', en: 'Closet / wardrobe declutter', es: 'Ordenar armario y ropa', fr: 'Désencombrer placards & vêtements', it: 'Riordinare armadio e vestiti', el: 'Ξεκαθάρισμα ντουλάπας' }
    ]
  }
};

if (typeof window !== 'undefined') {
  window.STORE_KEY = STORE_KEY;
  window.HISTORY_KEY = HISTORY_KEY;
  window.DEFAULT_TASKS_BY_LANG = DEFAULT_TASKS_BY_LANG;
  window.TASK_ICONS = TASK_ICONS;
  window.CATEGORIES = CATEGORIES;
  window.FALLBACK_STEPS = FALLBACK_STEPS;
  window.ROUTINE_PRESETS = ROUTINE_PRESETS;
  window.TASK_SUGGESTIONS_CATALOG = TASK_SUGGESTIONS_CATALOG;
}
if (typeof globalThis !== 'undefined') {
  globalThis.STORE_KEY = STORE_KEY;
  globalThis.HISTORY_KEY = HISTORY_KEY;
  globalThis.DEFAULT_TASKS_BY_LANG = DEFAULT_TASKS_BY_LANG;
  globalThis.TASK_ICONS = TASK_ICONS;
  globalThis.CATEGORIES = CATEGORIES;
  globalThis.FALLBACK_STEPS = FALLBACK_STEPS;
  globalThis.ROUTINE_PRESETS = ROUTINE_PRESETS;
  globalThis.TASK_SUGGESTIONS_CATALOG = TASK_SUGGESTIONS_CATALOG;
}
