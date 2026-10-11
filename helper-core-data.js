/**
 * @file helper-core-data.js
 * @module ExecutiveHelperData
 * @description
 * Statische Vorlagen und prozedurale Aufgaben-Zerlegungsmuster (`PROCEDURAL_BREAKDOWNS`)
 * für den „Was nun?"-Entscheidungsassistenten und das Energie-Budget-System (Spoon-Theorie).
 */
const DEFAULT_SPOON_OPTIONS = [
  { name: "Arbeit / Job-Sitzung 🖥️", cost: 3 },
  { name: "Haushalt / Saugen / Kochen 🧹", cost: 2 },
  { name: "Arzttermin / Wichtiges Telefonat 🩺", cost: 2 },
  { name: "Sanfter Spaziergang / Dehnen 🌳", cost: 1 },
  { name: "Mit Freunden treffen / Socialize 💬", cost: 2 }
];

const PROCEDURAL_BREAKDOWNS = {
  de: {
    "zimmer": [
      "1. Bringe Müll und schmutziges Geschirr in die Küche.",
      "2. Hebe alle Kleidungsstücke auf und sortiere sie (Wäsche vs. Schrank).",
      "3. Räume alle Oberflächen (Schreibtisch, Nachttisch) komplett frei.",
      "4. Fege, sauge oder wische den Boden einmal gründlich.",
      "5. Lüfte für 5 Minuten und mache dein Bett für das frische Gefühl."
    ],
    "steuer": [
      "1. Sammle alle Belege, Rechnungen und Dokumente des Jahres an einem Ort.",
      "2. Sortiere die Unterlagen chronologisch und nach Kategorien.",
      "3. Öffne das Steuerprogramm oder Elster und trage deine Stammdaten ein.",
      "4. Übertrage die Einnahmen und Werbungskosten Schritt für Schritt.",
      "5. Prüfe die Angaben noch einmal und klicke entspannt auf Absenden."
    ],
    "lernen": [
      "1. Räume deinen Arbeitsplatz komplett frei und schalte alle Benachrichtigungen aus.",
      "2. Verschaffe dir einen Überblick und wähle nur ein konkretes Thema aus.",
      "3. Schreibe die 3 wichtigsten Kernfragen auf ein leeres Blatt Papier.",
      "4. Lies die Unterlagen für 20 Minuten aktiv durch und beantworte die Fragen.",
      "5. Erkläre das Gelernte laut in eigenen Worten (Feynman-Methode)."
    ],
    "einkauf": [
      "1. Gehe in die Küche und mache ein schnelles Foto vom Kühlschrank-Inhalt.",
      "2. Schreibe eine strukturierte Einkaufsliste nach Abteilungen sortiert auf.",
      "3. Nimm Einkaufstaschen mit und überprüfe dein Budget.",
      "4. Gehe zügig durch den Supermarkt und weiche nicht von der Liste ab.",
      "5. Räume die Einkäufe direkt nach deiner Rückkehr ordentlich ein."
    ]
  },
  en: {
    "room": [
      "1. Take all trash and dirty dishes out to the kitchen.",
      "2. Pick up all clothes and sort them (laundry vs. closet).",
      "3. Clear all flat surfaces (desk, nightstand) completely.",
      "4. Vacuum, sweep, or mop the floor.",
      "5. Open windows for fresh air and make your bed."
    ],
    "tax": [
      "1. Collect all receipts, invoices, and documents in one single pile.",
      "2. Sort all documents chronologically and by category.",
      "3. Log into your tax software and enter your personal details.",
      "4. Step by step, fill in your income and deductible expenses.",
      "5. Review all calculated data once and hit submit."
    ],
    "study": [
      "1. Clear your desk completely and put your phone on silent.",
      "2. Select exactly one narrow sub-topic to focus on.",
      "3. Write down 3 key questions you want to answer on a blank paper.",
      "4. Read your study material actively for 20 minutes to answer them.",
      "5. Summarize and explain what you learned out loud in your own words."
    ],
    "shopping": [
      "1. Go to the kitchen and take a quick photo of what's in the fridge.",
      "2. Write a structured shopping list sorted by store section.",
      "3. Grab reusable bags and check your budget.",
      "4. Move briskly through the store and stick to the list.",
      "5. Put the groceries away neatly as soon as you get home."
    ]
  },
  es: {
    "cuarto": [
      "1. Lleva la basura y los platos sucios a la cocina.",
      "2. Recoge toda la ropa y clasifícala (lavar vs. armario).",
      "3. Despeja completamente todas las superficies (escritorio, mesita).",
      "4. Aspira, barre o friega el suelo a fondo.",
      "5. Ventila 5 minutos y haz la cama para esa sensación de frescor."
    ],
    "impuesto": [
      "1. Reúne todos los recibos, facturas y documentos del año en un solo lugar.",
      "2. Ordena los documentos cronológicamente y por categorías.",
      "3. Abre el programa de la declaración e introduce tus datos personales.",
      "4. Registra tus ingresos y gastos deducibles paso a paso.",
      "5. Revisa una vez más los datos y haz clic en enviar con tranquilidad."
    ],
    "estudiar": [
      "1. Despeja completamente tu escritorio y silencia el móvil.",
      "2. Ten una visión general y elige solo un tema concreto.",
      "3. Escribe las 3 preguntas clave más importantes en una hoja en blanco.",
      "4. Lee el material activamente durante 20 minutos y responde las preguntas.",
      "5. Explica en voz alta lo aprendido con tus propias palabras (método Feynman)."
    ],
    "compra": [
      "1. Ve a la cocina y haz una foto rápida del contenido de la nevera.",
      "2. Escribe una lista de la compra estructurada por secciones.",
      "3. Lleva bolsas reutilizables y revisa tu presupuesto.",
      "4. Recorre el supermercado con agilidad y no te desvíes de la lista.",
      "5. Guarda la compra ordenadamente nada más volver a casa."
    ]
  },
  el: {
    "δωμάτιο": [
      "1. Πήγαινε τα σκουπίδια και τα λερωμένα πιάτα στην κουζίνα.",
      "2. Μάζεψε όλα τα ρούχα και ταξινόμησέ τα (πλύσιμο vs ντουλάπα).",
      "3. Άδειασε τελείως όλες τις επιφάνειες (γραφείο, κομοδίνο).",
      "4. Σκούπισε ή σφουγγάρισε το πάτωμα σχολαστικά.",
      "5. Αερίστε για 5 λεπτά και στρώσε το κρεβάτι για αίσθηση φρεσκάδας."
    ],
    "φόρο": [
      "1. Συγκέντρωσε όλες τις αποδείξεις, τα τιμολόγια και τα έγγραφα του έτους σε ένα μέρος.",
      "2. Ταξινόμησε τα έγγραφα χρονολογικά και ανά κατηγορία.",
      "3. Άνοιξε το πρόγραμμα φορολογικής δήλωσης και συμπλήρωσε τα στοιχεία σου.",
      "4. Καταχώρησε τα έσοδα και τις εκπιπτόμενες δαπάνες βήμα-βήμα.",
      "5. Έλεγξε ξανά τα στοιχεία και πάτησε υποβολή με ηρεμία."
    ],
    "διάβασμα": [
      "1. Άδειασε τελείως το γραφείο σου και βάλε το κινητό σε σίγαση.",
      "2. Πάρε μια γενική εικόνα και επίλεξε μόνο ένα συγκεκριμένο θέμα.",
      "3. Γράψε τις 3 πιο σημαντικές ερωτήσεις σε ένα λευκό χαρτί.",
      "4. Διάβασε ενεργά το υλικό για 20 λεπτά και απάντησε στις ερωτήσεις.",
      "5. Εξήγησε δυνατά όσα έμαθες με δικά σου λόγια (μέθοδος Feynman)."
    ],
    "ψώνια": [
      "1. Πήγαινε στην κουζίνα και τράβηξε μια γρήγορη φωτογραφία του ψυγείου.",
      "2. Γράψε μια οργανωμένη λίστα αγορών χωρισμένη σε τμήματα.",
      "3. Πάρε μαζί σου τσάντες και έλεγξε τον προϋπολογισμό σου.",
      "4. Κινήσου γρήγορα στο σούπερ μάρκετ και μείνε πιστός στη λίστα.",
      "5. Τακτοποίησε τα ψώνια αμέσως μόλις επιστρέψεις."
    ]
  },
  fr: {
    "chambre": [
      "1. Apporte les déchets et la vaisselle sale à la cuisine.",
      "2. Ramasse tous les vêtements et trie-les (linge sale vs. placard).",
      "3. Débarrasse complètement toutes les surfaces (bureau, table de chevet).",
      "4. Aspire, balaie ou passe la serpillière sur le sol en profondeur.",
      "5. Aère 5 minutes et fais ton lit pour cette sensation de fraîcheur."
    ],
    "impôt": [
      "1. Rassemble tous les reçus, factures et documents de l'année au même endroit.",
      "2. Trie les documents par ordre chronologique et par catégorie.",
      "3. Ouvre ton logiciel de déclaration et saisis tes informations personnelles.",
      "4. Renseigne tes revenus et frais déductibles étape par étape.",
      "5. Vérifie une dernière fois les données et clique sereinement sur envoyer."
    ],
    "étudier": [
      "1. Débarrasse complètement ton bureau et mets ton téléphone en silencieux.",
      "2. Prends une vue d'ensemble et choisis un seul sujet précis.",
      "3. Écris les 3 questions clés les plus importantes sur une feuille blanche.",
      "4. Lis activement le contenu pendant 20 minutes et réponds aux questions.",
      "5. Explique à voix haute ce que tu as appris avec tes propres mots (méthode Feynman)."
    ],
    "courses": [
      "1. Va dans la cuisine et prends une photo rapide du contenu du frigo.",
      "2. Écris une liste de courses structurée par rayons.",
      "3. Prends des sacs réutilisables et vérifie ton budget.",
      "4. Parcours le supermarché rapidement sans t'écarter de la liste.",
      "5. Range les courses soigneusement dès ton retour."
    ]
  },
  it: {
    "camera": [
      "1. Porta in cucina la spazzatura e i piatti sporchi.",
      "2. Raccogli tutti i vestiti e smistali (bucato vs. armadio).",
      "3. Libera completamente tutte le superfici (scrivania, comodino).",
      "4. Aspira, spazza o lava il pavimento a fondo.",
      "5. Arieggia per 5 minuti e rifai il letto per quella sensazione di pulito."
    ],
    "tasse": [
      "1. Raccogli tutte le ricevute, fatture e documenti dell'anno in un unico posto.",
      "2. Ordina i documenti cronologicamente e per categoria.",
      "3. Apri il programma per la dichiarazione e inserisci i tuoi dati.",
      "4. Inserisci passo dopo passo entrate e spese detraibili.",
      "5. Ricontrolla i dati una volta e invia con tranquillità."
    ],
    "studiare": [
      "1. Libera completamente la scrivania e metti il telefono in silenzioso.",
      "2. Fatti un'idea generale e scegli un solo argomento specifico.",
      "3. Scrivi le 3 domande chiave più importanti su un foglio bianco.",
      "4. Leggi attivamente il materiale per 20 minuti e rispondi alle domande.",
      "5. Spiega ad alta voce ciò che hai imparato con parole tue (metodo Feynman)."
    ],
    "spesa": [
      "1. Vai in cucina e fai una foto veloce del contenuto del frigo.",
      "2. Scrivi una lista della spesa organizzata per reparti.",
      "3. Prendi le borse riutilizzabili e controlla il budget.",
      "4. Attraversa il supermercato con decisione senza allontanarti dalla lista.",
      "5. Riordina la spesa non appena torni a casa."
    ]
  }
};

const SUGGESTION_THEMES = [
  {
    text: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500',
    box: 'border-cyan-500/20 bg-cyan-950/10 shadow-[0_4px_30px_rgba(6,182,212,0.05)]',
    cardBorder: 'border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.15)]',
    accentText: 'text-cyan-400',
    progressBarBg: 'bg-cyan-500',
    btnNext: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500',
    btnSteps: 'border-cyan-500/25 bg-cyan-500/5 text-cyan-300 hover:bg-cyan-500/15 hover:border-cyan-400/40',
    btnDone: 'bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-400 text-cyan-200'
  },
  {
    text: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400',
    box: 'border-indigo-500/20 bg-indigo-950/10 shadow-[0_4px_30px_rgba(99,102,241,0.05)]',
    cardBorder: 'border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.15)]',
    accentText: 'text-indigo-400',
    progressBarBg: 'bg-indigo-500',
    btnNext: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500',
    btnSteps: 'border-indigo-500/25 bg-indigo-500/5 text-indigo-300 hover:bg-indigo-500/15 hover:border-indigo-400/40',
    btnDone: 'bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 hover:border-purple-400 text-cyan-200'
  },
  {
    text: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500',
    box: 'border-purple-500/20 bg-purple-950/10 shadow-[0_4px_30px_rgba(168,85,247,0.05)]',
    cardBorder: 'border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.15)]',
    accentText: 'text-purple-400',
    progressBarBg: 'bg-purple-500',
    btnNext: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500',
    btnSteps: 'border-purple-500/25 bg-purple-500/5 text-purple-300 hover:bg-purple-500/15 hover:border-purple-400/40',
    btnDone: 'bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 hover:border-purple-400 text-cyan-200'
  },
  {
    text: 'text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400',
    box: 'border-teal-500/20 bg-[#0f1f18]/30 shadow-[0_4px_30px_rgba(20,184,166,0.05)]',
    cardBorder: 'border-teal-500/20 shadow-[0_0_40px_rgba(20,184,166,0.15)]',
    accentText: 'text-teal-400',
    progressBarBg: 'bg-teal-500',
    btnNext: 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-600',
    btnSteps: 'border-teal-500/25 bg-teal-500/5 text-teal-300 hover:bg-teal-500/15 hover:border-teal-400/40',
    btnDone: 'bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/25 hover:border-teal-400 text-teal-200'
  },
  {
    text: 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500',
    box: 'border-blue-500/20 bg-[#111325]/30 shadow-[0_4px_30px_rgba(59,130,246,0.05)]',
    cardBorder: 'border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.15)]',
    accentText: 'text-blue-400',
    progressBarBg: 'bg-blue-500',
    btnNext: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500',
    btnSteps: 'border-blue-500/25 bg-blue-500/5 text-blue-300 hover:bg-blue-500/15 hover:border-blue-400/40',
    btnDone: 'bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 hover:border-blue-400 text-teal-200'
  },
  {
    text: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-500',
    box: 'border-fuchsia-500/20 bg-[#1f111a]/30 shadow-[0_4px_30px_rgba(217,70,239,0.05)]',
    cardBorder: 'border-fuchsia-500/20 shadow-[0_0_40px_rgba(217,70,239,0.15)]',
    accentText: 'text-fuchsia-400',
    progressBarBg: 'bg-fuchsia-500',
    btnNext: 'bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500',
    btnSteps: 'border-fuchsia-500/25 bg-fuchsia-500/5 text-fuchsia-300 hover:bg-fuchsia-500/15 hover:border-fuchsia-400/40',
    btnDone: 'bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/25 hover:border-fuchsia-400 text-fuchsia-200'
  }
];

