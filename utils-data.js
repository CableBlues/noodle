/**
 * @file utils-data.js
 * @module UtilsData
 * @description
 * Mehrsprachige Textdatenbank (`TIERED_PRAISES`) für kontextabhängiges positives Feedback
 * beim Abschließen von Aufgaben, gestaffelt nach Tagesfortschritt (Stufe 1 bis 4).
 */

const TIERED_PRAISES = {
  de: {
    // Stufe 1: Erster Einstieg (1 Aufgabe geschafft)
    tier1: [
      "Guter Start! Der Anfang ist gemacht. Weiter so!",
      "Schöner Einstieg! Schritt für Schritt geht es voran.",
      "Erster Schritt geschafft! Die Trägheit hat verloren.",
      "Klasse! Ein wunderbarer erster Haken heute.",
      "Sehr gut! Der erste Dominostein ist gefallen. Welcher kommt als nächstes?",
      "Ein schöner, ruhiger Anfang. Geh entspannt zur nächsten Aufgabe über.",
      "Der erste Haken sitzt. Atme kurz durch und bleib im Fluss!"
    ],
    // Stufe 2: Erste Dynamik (2 bis 4 Aufgaben geschafft)
    tier2: [
      "Du bist im Rhythmus! Dranbleiben lohnt sich.",
      "Klasse Fortschritt! Jede kleine Aufgabe summiert sich.",
      "Ganz stark! Du baust gerade richtig Schwung auf.",
      "Sehr fleißig! Spürst du, wie es im Kopf leichter wird?",
      "Wunderbar! Du machst heute tolle Fortschritte.",
      "Dein Fokus stabilisiert sich. Ein Schritt nach dem anderen!",
      "Sehr diszipliniert. Du hast das heute fest im Griff."
    ],
    // Stufe 3: Hohe Ausdauer (5 bis 8 Aufgaben geschafft)
    tier3: [
      "Richtig starker Fokus! Du ziehst das super durch.",
      "Klasse Leistung! Du hast heute schon richtig viel bewegt.",
      "Sehr ausdauernd! Dein Fokus ist heute wirklich bemerkenswert.",
      "Hut ab! Du beweist echtes Durchhaltevermögen.",
      "Großartig gemacht! Du bist voll in deinem Element.",
      "Dein Tag nimmt richtig Form an. Sehr inspirierend!",
      "Hervorragende Arbeit. Du meisterst deine To-Dos heute souverän."
    ],
    // Stufe 4: Meisterstufe (9+ Aufgaben geschafft)
    tier4: [
      "Sensationell! Du hast heute unglaublich viel geschafft.",
      "Einfach meisterhaft! Du darfst richtig stolz auf dich sein.",
      "Phänomenaler Tag! Dein Flow ist heute unaufhaltbar.",
      "Absolute Spitzenklasse! Gönn dir ruhig auch mal eine wohlverdiente Pause.",
      "Was für ein produktiver Tag! Du hast heute alles gegeben.",
      "Gigantische Leistung! Dein Kopf darf jetzt langsam in den Feierabend gehen.",
      "Das war weltklasse! Ein echter Triumph über deine To-Do-Liste."
    ]
  },
  en: {
    tier1: [
      "Great start! The beginning is made. Keep it up!",
      "Nice entry! Step by step, you are moving forward.",
      "First step achieved! Inertia has lost.",
      "Great! A wonderful first checkmark today.",
      "Very good! The first domino has fallen. Which one is next?",
      "A nice, calm start. Gently move on to your next task.",
      "The first task is checked. Take a breath and stay in your flow!"
    ],
    tier2: [
      "You are in the rhythm! Staying on track is paying off.",
      "Great progress! Every small task adds up.",
      "So strong! You are building real momentum right now.",
      "Excellent work! Do you feel your mind getting lighter?",
      "Wonderful! You are making great strides today.",
      "Your focus is stabilizing. One step at a time!",
      "Very disciplined. You have a firm grip on your day."
    ],
    tier3: [
      "Outstanding focus! You are pushing through beautifully.",
      "Splendid job! You've already moved so much today.",
      "Highly persistent! Your determination today is truly remarkable.",
      "Hats off! You are showing incredible willpower.",
      "Magnificently done! You are fully in your zone.",
      "Your day is shaping up beautifully. Highly inspiring!",
      "Superb work. You are mastering your to-dos with ease."
    ],
    tier4: [
      "Sensational! You have accomplished an incredible amount today.",
      "Simply masterful! You should be really proud of yourself.",
      "Phenomenal day! Your flow is absolutely unstoppable.",
      "Top-tier productivity! Feel free to treat yourself to a well-deserved break.",
      "What a productive day! You've given it your absolute all.",
      "Gigantic achievement! Your mind can slowly transition to rest now.",
      "That was world-class! A true triumph over your to-do list."
    ]
  },
  es: {
    tier1: [
      "¡Buen comienzo! El primer paso ya está dado. ¡Sigue así!",
      "¡Bonito inicio! Vas avanzando paso a paso.",
      "¡Primer paso conseguido! La inercia ha perdido.",
      "¡Genial! Una primera tarea marcada hoy.",
      "¡Muy bien! Ha caído la primera ficha de dominó. ¿Cuál sigue?",
      "Un comienzo tranquilo y agradable. Pasa relajado a la siguiente tarea.",
      "La primera tarea está lista. Respira hondo y mantén el ritmo."
    ],
    tier2: [
      "¡Estás en racha! Seguir así merece la pena.",
      "¡Gran progreso! Cada pequeña tarea suma.",
      "¡Qué fuerza! Estás ganando mucho impulso ahora mismo.",
      "¡Muy aplicado! ¿Notas cómo tu mente se siente más ligera?",
      "¡Maravilloso! Hoy estás avanzando de verdad.",
      "Tu enfoque se está estabilizando. ¡Un paso tras otro!",
      "Muy disciplinado. Hoy tienes el control total."
    ],
    tier3: [
      "¡Un enfoque realmente fuerte! Lo estás llevando genial.",
      "¡Gran rendimiento! Hoy ya has hecho muchísimo.",
      "¡Mucha constancia! Tu concentración de hoy es realmente notable.",
      "¡Chapó! Estás demostrando una gran fuerza de voluntad.",
      "¡Estupendamente hecho! Estás totalmente en tu elemento.",
      "Tu día está tomando muy buena forma. ¡Muy inspirador!",
      "Trabajo excelente. Estás dominando tus tareas hoy con soltura."
    ],
    tier4: [
      "¡Sensacional! Hoy has logrado una cantidad increíble.",
      "¡Simplemente magistral! Puedes estar muy orgulloso de ti.",
      "¡Día fenomenal! Tu flow hoy es imparable.",
      "¡Nivel absoluto! Date el gusto de una pausa bien merecida.",
      "¡Qué día tan productivo! Hoy has dado todo de ti.",
      "¡Logro gigantesco! Tu mente ya puede ir entrando en modo descanso.",
      "¡Eso fue de primer nivel! Un auténtico triunfo sobre tu lista de tareas."
    ]
  },
  el: {
    tier1: [
      "Καλή αρχή! Το πρώτο βήμα έγινε. Συνέχισε έτσι!",
      "Ωραία αρχή! Προχωράς βήμα βήμα.",
      "Πρώτο βήμα ολοκληρώθηκε! Η αδράνεια έχασε.",
      "Τέλεια! Ένα υπέροχο πρώτο τικ σήμερα.",
      "Πολύ καλά! Το πρώτο ντόμινο έπεσε. Ποιο είναι το επόμενο;",
      "Μια ήρεμη, ωραία αρχή. Πέρνα χαλαρά στην επόμενη εργασία.",
      "Το πρώτο τικ μπήκε. Πάρε μια ανάσα και μείνε στη ροή σου!"
    ],
    tier2: [
      "Είσαι μέσα στον ρυθμό! Αξίζει να συνεχίσεις.",
      "Υπέροχη πρόοδος! Κάθε μικρή εργασία προστίθεται.",
      "Πολύ δυνατά! Χτίζεις πραγματική φόρα αυτή τη στιγμή.",
      "Πολύ επιμελής! Νιώθεις πώς το μυαλό σου γίνεται πιο ελαφρύ;",
      "Υπέροχα! Κάνεις σήμερα εκπληκτική πρόοδο.",
      "Η εστίασή σου σταθεροποιείται. Ένα βήμα τη φορά!",
      "Πολύ πειθαρχημένος! Έχεις σήμερα τον απόλυτο έλεγχο."
    ],
    tier3: [
      "Πραγματικά δυνατή εστίαση! Το πας υπέροχα.",
      "Σπουδαία απόδοση! Έχεις ήδη κάνει πάρα πολλά σήμερα.",
      "Πολύ επίμονος! Η αποφασιστικότητά σου σήμερα είναι εντυπωσιακή.",
      "Μπράβο σου! Δείχνεις πραγματική δύναμη θέλησης.",
      "Υπέροχη δουλειά! Είσαι απόλυτα μέσα στο στοιχείο σου.",
      "Η μέρα σου παίρνει πολύ ωραία μορφή. Πολύ εμπνευστικό!",
      "Εξαιρετική δουλειά. Κατακτάς σήμερα τις εργασίες σου με άνεση."
    ],
    tier4: [
      "Εντυπωσιακό! Έχεις καταφέρει απίστευτα πολλά σήμερα.",
      "Απλά μαεστρικό! Μπορείς να είσαι πολύ περήφανος για σένα.",
      "Φαινομενική μέρα! Η ροή σου σήμερα είναι ασταμάτητη.",
      "Απόλυτη κορυφή! Χάρισε στον εαυτό σου ένα καλά αξιοποιημένο διάλειμμα.",
      "Τι παραγωγική μέρα! Έδωσες σήμερα τον καλύτερό σου εαυτό.",
      "Γιγάντια επίτευξη! Το μυαλό σου μπορεί τώρα σιγά σιγά να ξεκουραστεί.",
      "Αυτό ήταν παγκόσμιας κλάσης! Ένας πραγματικός θρίαμβος πάνω στη λίστα εργασιών σου."
    ]
  },
  fr: {
    tier1: [
      "Beau départ ! Le premier pas est fait. Continue comme ça !",
      "Joli début ! Tu avances pas à pas.",
      "Premier pas franchi ! L'inertie a perdu.",
      "Génial ! Une belle première tâche cochée aujourd'hui.",
      "Très bien ! Le premier domino est tombé. Lequel est le prochain ?",
      "Un début calme et agréable. Passe tranquillement à la tâche suivante.",
      "La première tâche est cochée. Respire un coup et reste dans ton élan !"
    ],
    tier2: [
      "Tu es dans le rythme ! Ça vaut le coup de continuer.",
      "Super progrès ! Chaque petite tâche s'additionne.",
      "Quelle force ! Tu prends vraiment de l'élan en ce moment.",
      "Très appliqué ! Tu sens ton esprit s'alléger ?",
      "Formidable ! Tu fais de vrais progrès aujourd'hui.",
      "Ta concentration se stabilise. Un pas après l'autre !",
      "Très discipliné. Tu maîtrises parfaitement ta journée."
    ],
    tier3: [
      "Une concentration vraiment forte ! Tu gères ça à merveille.",
      "Belle performance ! Tu as déjà accompli énormément aujourd'hui.",
      "Très persévérant ! Ta détermination aujourd'hui est vraiment remarquable.",
      "Chapeau bas ! Tu fais preuve d'une réelle force de volonté.",
      "Magnifiquement fait ! Tu es pleinement dans ton élément.",
      "Ta journée prend une belle forme. Très inspirant !",
      "Travail remarquable. Tu maîtrises tes tâches aujourd'hui avec brio."
    ],
    tier4: [
      "Sensationnel ! Tu as accompli une quantité incroyable aujourd'hui.",
      "Tout simplement magistral ! Tu peux être vraiment fier de toi.",
      "Journée phénoménale ! Ton flow est aujourd'hui totalement inarrêtable.",
      "Niveau absolu ! Offre-toi une pause bien méritée.",
      "Quelle journée productive ! Tu as tout donné aujourd'hui.",
      "Exploit gigantesque ! Ton esprit peut maintenant doucement passer en mode repos.",
      "C'était du grand art ! Un vrai triomphe sur ta liste de tâches."
    ]
  },
  it: {
    tier1: [
      "Ottimo inizio! Il primo passo è fatto. Continua così!",
      "Bell'inizio! Stai andando avanti passo dopo passo.",
      "Primo passo raggiunto! L'inerzia ha perso.",
      "Fantastico! Un primo bel segno di spunta oggi.",
      "Molto bene! È caduto il primo domino. Quale sarà il prossimo?",
      "Un inizio calmo e piacevole. Passa con serenità all'attività successiva.",
      "Il primo compito è spuntato. Fai un respiro e resta nel flusso!"
    ],
    tier2: [
      "Sei nel ritmo giusto! Vale la pena continuare così.",
      "Ottimo progresso! Ogni piccola attività fa la differenza.",
      "Che forza! Stai prendendo davvero slancio in questo momento.",
      "Molto diligente! Senti come la mente si alleggerisce?",
      "Meraviglioso! Oggi stai facendo grandi progressi.",
      "La tua concentrazione si sta stabilizzando. Un passo alla volta!",
      "Molto disciplinato. Oggi hai il pieno controllo della giornata."
    ],
    tier3: [
      "Una concentrazione davvero forte! Ce la stai facendo alla grande.",
      "Ottima prestazione! Hai già fatto tantissimo oggi.",
      "Molto costante! La tua determinazione oggi è davvero notevole.",
      "Tanto di cappello! Stai dimostrando una vera forza di volontà.",
      "Fatto magnificamente! Sei pienamente nel tuo elemento.",
      "La tua giornata sta prendendo una bella forma. Molto ispirante!",
      "Lavoro eccellente. Oggi domini le tue attività con grande scioltezza."
    ],
    tier4: [
      "Sensazionale! Oggi hai realizzato una quantità incredibile di cose.",
      "Semplicemente magistrale! Puoi essere davvero orgoglioso di te.",
      "Giornata fenomenale! Il tuo flow oggi è assolutamente inarrestabile.",
      "Livello assoluto! Concediti pure una pausa ben meritata.",
      "Che giornata produttiva! Oggi hai dato veramente il massimo.",
      "Impresa gigantesca! La tua mente può ora piano piano entrare in modalità riposo.",
      "Roba da fuoriclasse! Un vero trionfo sulla tua lista di cose da fare."
    ]
  }
};

// Hilfsfunktion: Liefert den nächsten nicht-wiederholenden Index
