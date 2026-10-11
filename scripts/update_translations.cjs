const fs = require('fs');

// 1. Missing keys from check_i18n.cjs:
// celebration_btn_report, shop_tab_pantry, settings_open_all, report_dashboard_title
// plus unnatural phrase overrides:
// audio_no_sound_active, board_clear_lists

const NEW_TRANSLATIONS = {
  // Existing missing keys & refinements
  "celebration_btn_report": {
    "en": "View Daily Report 📊",
    "de": "Tagesbilanz & Report ansehen 📊",
    "fr": "Voir le bilan de la journée 📊",
    "it": "Visualizza resoconto giornaliero 📊",
    "es": "Ver reporte del día 📊",
    "el": "Προβολή αναφοράς ημέρας 📊"
  },
  "shop_tab_pantry": {
    "en": "Pantry",
    "de": "Vorrat",
    "fr": "Garde-manger",
    "it": "Dispensa",
    "es": "Despensa",
    "el": "Προμήθειες"
  },
  "settings_open_all": {
    "en": "All Settings & Themes ⚙️",
    "de": "Alle Einstellungen & Themes ⚙️",
    "fr": "Tous les réglages et thèmes ⚙️",
    "it": "Tutte le impostazioni e temi ⚙️",
    "es": "Todos los ajustes y temas ⚙️",
    "el": "Όλες οι ρυθμίσεις & θέματα ⚙️"
  },
  "report_dashboard_title": {
    "en": "Stats & Progress",
    "de": "Statistiken & Fortschritt",
    "fr": "Statistiques et progrès",
    "it": "Statistiche e progressi",
    "es": "Estadísticas y progreso",
    "el": "Στατιστικά & Πρόοδος"
  },
  "audio_no_sound_active": {
    "en": "No sound active · Choose a preset or track",
    "de": "Kein Sound aktiv · Wähle ein Preset oder Track",
    "fr": "Aucun son actif · Choisissez une ambiance ou piste",
    "it": "Nessun suono attivo · Scegli un preset o brano",
    "es": "Sin sonido activo · Elige un preset o pista",
    "el": "Κανένας ενεργός ήχος · Επιλέξτε preset ή κομμάτι"
  },
  "board_clear_lists": {
    "en": "Clear boards",
    "de": "Karten leeren",
    "fr": "Vider les listes",
    "it": "Svuota schede",
    "es": "Limpiar tableros",
    "el": "Εκκαθάριση πινάκων"
  },

  // Newly identified UI elements
  "radio_no_station_selected": {
    "en": "No station selected",
    "de": "Kein Sender gewählt",
    "fr": "Aucune station sélectionnée",
    "it": "Nessuna stazione selezionata",
    "es": "Ninguna emisora seleccionada",
    "el": "Δεν έχει επιλεγεί σταθμός"
  },
  "safespace_relieve_inertia": {
    "en": "Breaks physical inertia & brain fog",
    "de": "Löst körperliche Starre & Trägheit",
    "fr": "Dissipe la lourdeur corporelle et l'inertie",
    "it": "Scioglie rigidità corporea e inerzia",
    "es": "Disipa la pesadez y la fatiga corporal",
    "el": "Διαλύει τη σωματική δυσκαμψία & αδράνεια"
  },
  "safespace_open_fullscreen": {
    "en": "Open Fullscreen Recovery Studio ↗",
    "de": "Vollbild Recovery Studio öffnen ↗",
    "fr": "Ouvrir le studio de récupération plein écran ↗",
    "it": "Apri studio di recupero a schermo intero ↗",
    "es": "Abrir estudio de relajación a pantalla completa ↗",
    "el": "Άνοιγμα στούντιο αποκατάστασης πλήρους οθόνης ↗"
  },
  "quick_lang_select": {
    "en": "🌐 Select Language",
    "de": "🌐 Sprache wählen",
    "fr": "🌐 Choisir la langue",
    "it": "🌐 Seleziona lingua",
    "es": "🌐 Seleccionar idioma",
    "el": "🌐 Επιλογή γλώσσας"
  },
  "mode_studio_short": {
    "en": "◨ Studio",
    "de": "◨ Studio",
    "fr": "◨ Studio",
    "it": "◨ Studio",
    "es": "◨ Studio",
    "el": "◨ Studio"
  },
  "mode_compact_short": {
    "en": "🗗 Compact",
    "de": "🗗 Kompakt",
    "fr": "🗗 Compact",
    "it": "🗗 Compatto",
    "es": "🗗 Compacto",
    "el": "🗗 Συμπαγές"
  },
  "mode_turbo_short": {
    "en": "⚡ Turbo",
    "de": "⚡ Turbo",
    "fr": "⚡ Turbo",
    "it": "⚡ Turbo",
    "es": "⚡ Turbo",
    "el": "⚡ Turbo"
  },
  "volume": {
    "en": "Volume",
    "de": "Lautstärke",
    "fr": "Volume",
    "it": "Volume",
    "es": "Volumen",
    "el": "Ένταση"
  },
  "collab_share_current_board": {
    "en": "Share current board with team",
    "de": "Aktuelles Board fürs Team teilen",
    "fr": "Partager le tableau actuel avec l'équipe",
    "it": "Condividi la bacheca corrente con il team",
    "es": "Compartir tablero actual con el equipo",
    "el": "Κοινοποίηση τρέχοντος πίνακα με την ομάδα"
  },
  "news_loading_live": {
    "en": "Loading live news...",
    "de": "Lädt Live-Nachrichten...",
    "fr": "Chargement des actualités en direct...",
    "it": "Caricamento notizie in tempo reale...",
    "es": "Cargando noticias en directo...",
    "el": "Φόρτωση ζωντανών ειδήσεων..."
  },
  "news_output_lang": {
    "en": "1. Output Language (Translation)",
    "de": "1. Ausgabesprache (Übersetzung)",
    "fr": "1. Langue d'affichage (Traduction)",
    "it": "1. Lingua di visualizzazione (Traduzione)",
    "es": "1. Idioma de visualización (Traducción)",
    "el": "1. Γλώσσα προβολής (Μετάφραση)"
  },
  "shop_add_list_btn": {
    "en": "Add list",
    "de": "Liste hinzufügen",
    "fr": "Ajouter une liste",
    "it": "Aggiungi lista",
    "es": "Añadir lista",
    "el": "Προσθήκη λίστας"
  },
  "shop_cat_wishes": {
    "en": "❤️ Wishlist",
    "de": "❤️ Wünsche",
    "fr": "❤️ Envies & Cadeaux",
    "it": "❤️ Desideri",
    "es": "❤️ Deseos",
    "el": "❤️ Επιθυμίες"
  },
  "create": {
    "en": "Create",
    "de": "Erstellen",
    "fr": "Créer",
    "it": "Crea",
    "es": "Crear",
    "el": "Δημιουργία"
  },
  "sound_birds": {
    "en": "🐦 Birds",
    "de": "🐦 Vögel",
    "fr": "🐦 Oiseaux",
    "it": "🐦 Uccelli",
    "es": "🐦 Pájaros",
    "el": "🐦 Πουλιά"
  },
  "safespace_breath_calm": {
    "en": "Breathing & Calm",
    "de": "Atemübung & Ruhe",
    "fr": "Respiration & Sérénité",
    "it": "Respirazione & Calma",
    "es": "Respiración & Calma",
    "el": "Αναπνοή & Ηρεμία"
  },
  "pick_executive_subtitle": {
    "en": "Executive assistant for your next immediate step",
    "de": "Exekutiv-Assistent für deinen nächsten Schritt",
    "fr": "Assistant d'action pour votre prochaine étape",
    "it": "Assistente per il tuo prossimo passo immediato",
    "es": "Asistente para tu próximo paso inmediato",
    "el": "Βοηθός δράσης για το επόμενο άμεσο βήμα σου"
  },
  "sport_opt_3min": {
    "en": "3 min · 3 exercises (Express)",
    "de": "3 Min. · 3 Übungen (Express)",
    "fr": "3 min · 3 exercices (Express)",
    "it": "3 min · 3 esercizi (Express)",
    "es": "3 min · 3 ejercicios (Exprés)",
    "el": "3 λεπτά · 3 ασκήσεις (Express)"
  },
  "sport_opt_5min": {
    "en": "5 min · 5 exercises (Optimal)",
    "de": "5 Min. · 5 Übungen (Optimal)",
    "fr": "5 min · 5 exercices (Idéal)",
    "it": "5 min · 5 esercizi (Ideale)",
    "es": "5 min · 5 ejercicios (Óptimo)",
    "el": "5 λεπτά · 5 ασκήσεις (Ιδανικό)"
  },
  "sport_opt_8min": {
    "en": "8 min · 8 exercises (Intensive)",
    "de": "8 Min. · 8 Übungen (Intensiv)",
    "fr": "8 min · 8 exercices (Intensif)",
    "it": "8 min · 8 esercizi (Intensivo)",
    "es": "8 min · 8 ejercicios (Intensivo)",
    "el": "8 λεπτά · 8 ασκήσεις (Εντατικό)"
  },
  "sport_opt_12min": {
    "en": "12 min · 12 exercises (Power)",
    "de": "12 Min. · 12 Übungen (Power)",
    "fr": "12 min · 12 exercices (Énergie)",
    "it": "12 min · 12 esercizi (Energia)",
    "es": "12 min · 12 ejercicios (Potencia)",
    "el": "12 λεπτά · 12 ασκήσεις (Δυναμικό)"
  },
  "sport_opt_16min": {
    "en": "16 min · 16 exercises (Full Circuit)",
    "de": "16 Min. · 16 Übungen (Voller Zirkel)",
    "fr": "16 min · 16 exercices (Circuit complet)",
    "it": "16 min · 16 esercizi (Circuito completo)",
    "es": "16 min · 16 ejercicios (Circuito total)",
    "el": "16 λεπτά · 16 ασκήσεις (Πλήρης κύκλος)"
  },
  "sport_zone_fullbody": {
    "en": "🌟 Balanced Full-Body Mix",
    "de": "🌟 Ausgewogener Ganzkörper-Mix",
    "fr": "🌟 Corps entier équilibré",
    "it": "🌟 Corpo intero equilibrato",
    "es": "🌟 Cuerpo completo equilibrado",
    "el": "🌟 Ισορροπημένο πλήρες σώμα"
  },
  "sport_zone_core": {
    "en": "🔥 Core & Trunk Stability",
    "de": "🔥 Core & Rumpfstabilität",
    "fr": "🔥 Gainage & Stabilité du tronc",
    "it": "🔥 Core & Stabilità del busto",
    "es": "🔥 Core & Estabilidad del tronco",
    "el": "🔥 Κορμός & Σταθερότητα"
  },
  "sport_zone_legs_nojump": {
    "en": "🦵 Legs & Glutes (No Jumping)",
    "de": "🦵 Beine & Gesäß (Ohne Springen)",
    "fr": "🦵 Jambes & Fessiers (Sans sauts)",
    "it": "🦵 Gambe & Glutei (Senza salti)",
    "es": "🦵 Piernas & Glúteos (Sin saltos)",
    "el": "🦵 Πόδια & Γλουτοί (Χωρίς άλματα)"
  },
  "sport_zone_upper": {
    "en": "💪 Upper Body & Posture",
    "de": "💪 Oberkörper & Haltung",
    "fr": "💪 Haut du corps & Posture",
    "it": "💪 Parte superiore & Postura",
    "es": "💪 Tren superior & Postura",
    "el": "💪 Άνω μέρος σώματος & Στάση"
  },
  "sport_composed_exercises": {
    "en": "Prepared exercises:",
    "de": "Zusammengestellte Übungen:",
    "fr": "Exercices préparés :",
    "it": "Esercizi preparati:",
    "es": "Ejercicios preparados:",
    "el": "Επιλεγμένες ασκήσεις:"
  },
  "sport_cat_all": {
    "en": "All categories",
    "de": "Alle Kategorien",
    "fr": "Toutes les catégories",
    "it": "Tutte le categorie",
    "es": "Todas las categorías",
    "el": "Όλες οι κατηγορίες"
  },
  "sport_cat_legs": {
    "en": "🦵 Legs & Glutes",
    "de": "🦵 Beine & Gesäß",
    "fr": "🦵 Jambes & Fessiers",
    "it": "🦵 Gambe & Glutei",
    "es": "🦵 Piernas & Glúteos",
    "el": "🦵 Πόδια & Γλουτοί"
  },
  "sport_cat_upper": {
    "en": "💪 Upper Body",
    "de": "💪 Oberkörper",
    "fr": "💪 Haut du corps",
    "it": "💪 Parte superiore",
    "es": "💪 Tren superior",
    "el": "💪 Άνω μέρος σώματος"
  },
  "sport_cat_flow": {
    "en": "🤸 Full Body & Flow",
    "de": "🤸 Ganzkörper & Flow",
    "fr": "🤸 Corps entier & Fluidité",
    "it": "🤸 Corpo intero & Flow",
    "es": "🤸 Cuerpo completo & Movilidad",
    "el": "🤸 Πλήρες σώμα & Ροή"
  },
  "sport_spoon_1": {
    "en": "🔋 1 Spoon · Lying or seated (Gentle)",
    "de": "🔋 1 Löffel · Liegend oder sitzend (Extrem sanft)",
    "fr": "🔋 1 Cuillère · Allongé ou assis (Très doux)",
    "it": "🔋 1 Cucchiaio · Sdraiato o seduto (Molto dolce)",
    "es": "🔋 1 Cuchara · Acostado o sentado (Muy suave)",
    "el": "🔋 1 Κουτάλι · Ξαπλωτός ή καθιστός (Πολύ απαλό)"
  },
  "sport_spoon_2": {
    "en": "🔋 2 Spoons · Standing stretch & release (Moderate)",
    "de": "🔋 2 Löffel · Im Stehen dehnen & lockern (Moderat)",
    "fr": "🔋 2 Cuillères · Debout, étirements (Modéré)",
    "it": "🔋 2 Cucchiai · In piedi, stretching leggero (Moderato)",
    "es": "🔋 2 Cucharas · De pie, estiramientos suaves (Moderado)",
    "el": "🔋 2 Κουτάλια · Όρθιες διατάσεις (Μέτριο)"
  },
  "sport_spoon_3": {
    "en": "🔋 3 Spoons · Activating mini boost (Effective)",
    "de": "🔋 3 Löffel · Aktivierender Mini-Boost (Effektiv)",
    "fr": "🔋 3 Cuillères · Mini-boost énergisant (Efficace)",
    "it": "🔋 3 Cucchiai · Mini-carica attivante (Efficace)",
    "es": "🔋 3 Cucharas · Mini-impulso energizante (Eficaz)",
    "el": "🔋 3 Κουτάλια · Τονωτική ώθηση (Αποτελεσματικό)"
  },
  "exercise": {
    "en": "Exercise",
    "de": "Übung",
    "fr": "Exercice",
    "it": "Esercizio",
    "es": "Ejercicio",
    "el": "Άσκηση"
  },
  "sport_focus_legs": {
    "en": "🎯 Focus: Legs & Glutes",
    "de": "🎯 Fokus: Beine & Gesäß",
    "fr": "🎯 Cible : Jambes & Fessiers",
    "it": "🎯 Focus: Gambe & Glutei",
    "es": "🎯 Enfoque: Piernas & Glúteos",
    "el": "🎯 Εστίαση: Πόδια & Γλουτοί"
  },
  "sport_next_up": {
    "en": "Next up:",
    "de": "Als Nächstes:",
    "fr": "À suivre :",
    "it": "Successivo:",
    "es": "A continuación:",
    "el": "Ακολουθεί:"
  },
  "sport_ex_glute_bridge": {
    "en": "Glute Bridge",
    "de": "Beckenbrücke",
    "fr": "Pont fessier",
    "it": "Ponte per glutei",
    "es": "Puente de glúteos",
    "el": "Γέφυρα γλουτών"
  },
  "settings_all_devices": {
    "en": "All Devices & Offline Ready",
    "de": "Alle Geräte & Offline-fähig",
    "fr": "Tous appareils & Mode hors-ligne",
    "it": "Tutti i dispositivi & Offline",
    "es": "Todos los dispositivos & Offline",
    "el": "Όλες οι συσκευές & Λειτουργία εκτός σύνδεσης"
  },
  "settings_install_local_title": {
    "en": "Install Noodle as local application",
    "de": "Noodle als lokale Anwendung installieren",
    "fr": "Installer Noodle comme application locale",
    "it": "Installa Noodle come applicazione locale",
    "es": "Instalar Noodle como aplicación local",
    "el": "Εγκατάσταση του Noodle ως τοπική εφαρμογή"
  },
  "settings_interaction_desc": {
    "en": "Choose how tool panels, assistants, and popovers appear in your workspace.",
    "de": "Wähle, wie Tool-Panels, Assistenten und Popovers im Workspace angezeigt werden.",
    "fr": "Choisissez comment les panneaux et popovers s'affichent dans l'espace de travail.",
    "it": "Scegli come visualizzare pannelli e popover nell'area di lavoro.",
    "es": "Elige cómo se muestran los paneles y popovers en tu espacio de trabajo.",
    "el": "Επιλέξτε πώς εμφανίζονται τα παράθυρα εργαλείων και τα popovers στον χώρο εργασίας."
  },
  "mode_studio_dock": {
    "en": "◨ Studio Dock",
    "de": "◨ Studio Dock",
    "fr": "◨ Studio Dock",
    "it": "◨ Studio Dock",
    "es": "◨ Studio Dock",
    "el": "◨ Studio Dock"
  },
  "mode_studio_dock_desc": {
    "en": "Tools open with a click, minimize to the taskbar, or pin to the sidebar.",
    "de": "Tools öffnen per Klick, minimieren in Taskleiste oder heften an die Seitenleiste an.",
    "fr": "Les outils s'ouvrent au clic, se réduisent en barre des tâches ou s'épinglent.",
    "it": "Gli strumenti si aprono con un clic, si riducono nella barra o si agganciano.",
    "es": "Las herramientas se abren con un clic, se minimizan o se anclan al lateral.",
    "el": "Τα εργαλεία ανοίγουν με κλικ, ελαχιστοποιούνται ή καρφιτσώνονται στο πλάι."
  },
  "mode_compact_focus": {
    "en": "🗗 Compact / Focus",
    "de": "🗗 Kompakt / Fokus",
    "fr": "🗗 Compact / Focus",
    "it": "🗗 Compatto / Focus",
    "es": "🗗 Compacto / Enfoque",
    "el": "🗗 Συμπαγές / Εστίαση"
  },
  "mode_compact_desc": {
    "en": "Panels open centered as compact overlays and close when clicking outside.",
    "de": "Panels öffnen zentriert als kompakte Popups und schließen bei Klicks außerhalb.",
    "fr": "Les fenêtres s'ouvrent centrées et se ferment d'un simple clic extérieur.",
    "it": "I pannelli si aprono al centro e si chiudono cliccando all'esterno.",
    "es": "Los paneles se abren centrados y se cierran al hacer clic fuera.",
    "el": "Τα παράθυρα ανοίγουν κεντραρισμένα και κλείνουν με κλικ έξω από αυτά."
  },
  "mode_turbo_hover": {
    "en": "⚡ Turbo-Hover",
    "de": "⚡ Turbo-Hover",
    "fr": "⚡ Turbo-Hover",
    "it": "⚡ Turbo-Hover",
    "es": "⚡ Turbo-Hover",
    "el": "⚡ Turbo-Hover"
  },
  "mode_turbo_desc": {
    "en": "For fast workflows: Ultra-fast 40ms hover switching inspired by Edge tabs.",
    "de": "Für Ungeduldige: Ultraschnelle Reaktionszeit (40ms) beim Überfahren wie Microsoft Edge Tabs.",
    "fr": "Pour les rapides : Basculement ultra-rapide au survol (40 ms) comme les onglets Edge.",
    "it": "Per la massima rapidità: Cambio ultra-veloce al passaggio del mouse (40 ms) in stile schede Edge.",
    "es": "Para flujos rápidos: Cambio ultra-rápido al pasar el ratón (40 ms) estilo pestañas Edge.",
    "el": "Για γρήγορη ροή: Υπερταχεία εναλλαγή (40ms) με αιώρηση όπως οι καρτέλες Edge."
  },
  "settings_timer_preset_desc": {
    "en": "Default minutes configured for new timer sessions.",
    "de": "Voreingestellte Minuten für neue Timer-Sitzungen.",
    "fr": "Durée par défaut en minutes pour chaque nouvelle session de minuteur.",
    "it": "Minuti predefiniti per ogni nuova sessione del timer.",
    "es": "Minutos predeterminados para las nuevas sesiones de temporizador.",
    "el": "Προεπιλεγμένα λεπτά για νέες συνεδρίες χρονοδιακόπτη."
  },
  "settings_reset_desc": {
    "en": "Restores browser storage completely back to its original state.",
    "de": "Setzt den Browser-Speicher vollständig auf den Ursprungszustand zurück.",
    "fr": "Réinitialise complètement les données locales à leur état d'origine.",
    "it": "Ripristina completamente la memoria del browser allo stato iniziale.",
    "es": "Restablece por completo la memoria local a su estado original.",
    "el": "Επαναφέρει πλήρως τη μνήμη της εφαρμογής στην αρχική της κατάσταση."
  },
  "settings_add_screenshot": {
    "en": "Attach screenshot 📷",
    "de": "Screenshot hinzufügen 📷",
    "fr": "Joindre une capture d'écran 📷",
    "it": "Allega screenshot 📷",
    "es": "Adjuntar captura de pantalla 📷",
    "el": "Επισύναψη στιγμιότυπου 📷"
  },
  "cmd_run": {
    "en": "↵ Execute",
    "de": "↵ Ausführen",
    "fr": "↵ Exécuter",
    "it": "↵ Esegui",
    "es": "↵ Ejecutar",
    "el": "↵ Εκτέλεση"
  },
  "cmd_shortcuts_help": {
    "en": "Keyboard shortcuts (?)",
    "de": "Tastaturkürzel (?)",
    "fr": "Raccourcis clavier (?)",
    "it": "Scorciatoie da tastiera (?)",
    "es": "Atajos de teclado (?)",
    "el": "Συντομεύσεις πληκτρολογίου (?)"
  },
  "step": {
    "en": "Step",
    "de": "Schritt",
    "fr": "Étape",
    "it": "Passo",
    "es": "Paso",
    "el": "Βήμα"
  },
  "cleaning_step_timer": {
    "en": "Step focus timer:",
    "de": "Schritt-Fokus-Timer:",
    "fr": "Minuteur d'étape :",
    "it": "Timer focalizzato sul passo:",
    "es": "Temporizador por paso:",
    "el": "Χρονόμετρο εστίασης βήματος:"
  },
  "clean_cheat_sheet_title": {
    "en": "Pro cheat sheet for beginners (Colors & Rules)",
    "de": "Profi-Spickzettel für Einsteiger (Farben & Regeln)",
    "fr": "Fiche mémo efficace (Codes couleurs & Bonnes pratiques)",
    "it": "Guida rapida per principianti (Colori & Regole)",
    "es": "Guía práctica para principiantes (Códigos de color & Reglas)",
    "el": "Πρακτικός οδηγός για αρχάριους (Χρώματα & Κανόνες)"
  },
  "clean_cloth_blue": {
    "en": "For dust, shelves, desks & mirrors",
    "de": "Für Staub, Regale, Schreibtisch & Spiegel",
    "fr": "Pour la poussière, étagères, bureaux et miroirs",
    "it": "Per polvere, mensole, scrivanie e specchi",
    "es": "Para polvo, estantes, escritorios y espejos",
    "el": "Για σκόνη, ράφια, γραφεία & καθρέφτες"
  },
  "clean_cloth_yellow": {
    "en": "For kitchen, stove, dining tables & counters",
    "de": "Für Küche, Herd, Tische & Oberflächen",
    "fr": "Pour la cuisine, plaques, tables et plans de travail",
    "it": "Per cucina, fornelli, tavoli e superfici",
    "es": "Para cocina, fogones, mesas y encimeras",
    "el": "Για κουζίνα, εστίες, τραπέζια & επιφάνειες"
  },
  "clean_cloth_red": {
    "en": "Dedicated strictly for toilet & sanitaries (Hygiene!)",
    "de": "Nur für WC & Sanitärbereich (Hygiene!)",
    "fr": "Exclusivement réservé aux toilettes (Hygiène !)",
    "it": "Esclusivamente per WC e sanitari (Igiene!)",
    "es": "Exclusivo para inodoro y sanitarios (¡Higiene!)",
    "el": "Αποκλειστικά για τουαλέτα & είδη υγιεινής (Υγιεινή!)"
  },
  "clean_tip_chemicals": {
    "en": "Spray limescale remover & bath spray, wait 5 min doing something else – no hard scrubbing needed!",
    "de": "Sprühe Kalklöser & Badreiniger ein und mache 5 Min was anderes – kein Schrubben nötig!",
    "fr": "Pulvérisez le nettoyant anticalcaire et laissez agir 5 min : inutile de frotter fort !",
    "it": "Spruzza l'anticalcare e lascia agire 5 min facendo altro: nessuno sfregamento faticoso!",
    "es": "Aplica el antical y déjalo actuar 5 min mientras haces otra cosa: ¡no hace falta frotar fuerte!",
    "el": "Ψεκάστε το καθαριστικό αλάτων και αφήστε το 5 λεπτά να δράσει – δεν χρειάζεται τρίψιμο!"
  },
  "clean_tip_dry_before_wet": {
    "en": "Always vacuum or sweep dry crumbs and dust first before wiping with water.",
    "de": "Erst Krümel und Staub trocken wegfegen/saugen, bevor du mit Wasser wischst.",
    "fr": "Aspirez ou balayez toujours les miettes sèches avant de passer la serpillère.",
    "it": "Aspira o spazza sempre polvere e briciole a secco prima di lavare con acqua.",
    "es": "Pasa siempre la aspiradora o barre el polvo seco antes de fregar con agua.",
    "el": "Σκουπίστε πρώτα στεγνά ψίχουλα και σκόνη πριν σφουγγαρίσετε με νερό."
  },
  "audio_studio_full_title": {
    "en": "Audio & Atmosphere Studio",
    "de": "Audio & Atmosphere Studio",
    "fr": "Studio d'Ambiance & Audio",
    "it": "Studio Audio & Atmosfere",
    "es": "Estudio de Audio & Atmósferas",
    "el": "Στούντιο Ήχου & Ατμόσφαιρας"
  },
  "badge_pro_studio": {
    "en": "Pro Studio",
    "de": "Pro Studio",
    "fr": "Studio Pro",
    "it": "Studio Pro",
    "es": "Estudio Pro",
    "el": "Pro Studio"
  },
  "audio_studio_sub": {
    "en": "Nature sounds, genre beats, MP3, Spotify, DJ",
    "de": "Naturklänge, Genre-Beats, MP3, Spotify, DJ",
    "fr": "Sons de la nature, rythmes, MP3, Spotify, DJ",
    "it": "Suoni della natura, beat per genere, MP3, Spotify, DJ",
    "es": "Sonidos naturales, ritmos por género, MP3, Spotify, DJ",
    "el": "Ήχοι φύσης, ρυθμοί, MP3, Spotify, DJ"
  },
  "boost_30s": {
    "en": "30s Micro-Action",
    "de": "30s Überwindung",
    "fr": "Micro-action 30s",
    "it": "Micro-azione 30s",
    "es": "Micro-acción de 30s",
    "el": "Μικρο-δράση 30 δευτ."
  },
  "safespace_exercises_grounding": {
    "en": "Exercises & Grounding",
    "de": "Übungen & Erdung",
    "fr": "Exercices & Ancrage",
    "it": "Esercizi & Radicamento",
    "es": "Ejercicios & Conexión a tierra",
    "el": "Ασκήσεις & Γείωση"
  },
  "sport_body_title": {
    "en": "Fitness & Body",
    "de": "Sport & Körper",
    "fr": "Mouvement & Corps",
    "it": "Attività fisica & Corpo",
    "es": "Movimiento & Cuerpo",
    "el": "Άσκηση & Σώμα"
  },
  "sport_1min_workouts": {
    "en": "1-Minute Workouts",
    "de": "1-Minuten Workouts",
    "fr": "Entraînements d'une minute",
    "it": "Allenamenti da 1 minuto",
    "es": "Entrenamientos de 1 minuto",
    "el": "Προπονήσεις 1 λεπτού"
  },
  "preset_cozy_focus": {
    "en": "Cozy Focus",
    "de": "Gemütlicher Fokus",
    "fr": "Focus chaleureux",
    "it": "Focus accogliente",
    "es": "Enfoque acogedor",
    "el": "Ζεστή εστίαση"
  },
  "safespace_tab_wave90": {
    "en": "90s Wave",
    "de": "90s Welle",
    "fr": "Vague 90s",
    "it": "Onda 90s",
    "es": "Ola de 90s",
    "el": "Κύμα 90 δευτ."
  },
  "safespace_tab_need": {
    "en": "Underlying Need",
    "de": "Bedürfnis",
    "fr": "Besoin réel",
    "it": "Bisogno reale",
    "es": "Necesidad real",
    "el": "Πραγματική ανάγκη"
  },
  "safespace_tab_bridge": {
    "en": "Action Bridge",
    "de": "Brücke",
    "fr": "Passerelle",
    "it": "Ponte d'azione",
    "es": "Puente de acción",
    "el": "Γέφυρα δράσης"
  },
  "safespace_need_longing": {
    "en": "Connection / Closeness",
    "de": "Sehnsucht / Nähe",
    "fr": "Lien / Proximité",
    "it": "Affetto / Vicinanza",
    "es": "Conexión / Afecto",
    "el": "Σύνδεση / Εγγύτητα"
  },
  "safespace_need_fatigue": {
    "en": "Physical Fatigue",
    "de": "Müdigkeit",
    "fr": "Fatigue physique",
    "it": "Stanchezza fisica",
    "es": "Fatiga física",
    "el": "Σωματική κούραση"
  },
  "safespace_need_exhaustion": {
    "en": "Mental Overload",
    "de": "Erschöpfter Geist",
    "fr": "Surcharge mentale",
    "it": "Sovraccarico mentale",
    "es": "Sobrecarga mental",
    "el": "Πνευματική εξάντληση"
  },
  "safespace_need_escape": {
    "en": "Avoiding uncomfortable feeling",
    "de": "Flucht vor Gefühl",
    "fr": "Évitement d'une émotion",
    "it": "Fuga da un'emozione",
    "es": "Evasión de una emoción",
    "el": "Αποφυγή δύσκολου συναισθήματος"
  },
  "safespace_other_bridge": {
    "en": "Suggest another instant bridge 🔄",
    "de": "Andere Sofort-Brücke vorschlagen 🔄",
    "fr": "Proposer une autre passerelle immédiate 🔄",
    "it": "Suggerisci un'altra alternativa immediata 🔄",
    "es": "Sugerir otra alternativa inmediata 🔄",
    "el": "Πρότεινε άλλη άμεση εναλλακτική 🔄"
  },
  "safespace_personal_anchors_title": {
    "en": "Your personal anchors (Why staying strong matters):",
    "de": "Deine persönlichen Anker (Warum lohnt es sich standhaft zu bleiben?):",
    "fr": "Vos ancrages personnels (Pourquoi cela vaut la peine de tenir bon) :",
    "it": "Le tue ancore personali (Perché vale la pena perseverare):",
    "es": "Tus anclas personales (Por qué vale la pena mantenerte firme):",
    "el": "Οι προσωπικές σου άγκυρες (Γιατί αξίζει να παραμείνεις σταθερός):"
  },
  "safespace_anchor_loved_ones": {
    "en": "❤️ For my loved ones",
    "de": "❤️ Für meine Liebsten",
    "fr": "❤️ Pour ceux que j'aime",
    "it": "❤️ Per i miei cari",
    "es": "❤️ Por mis seres queridos",
    "el": "❤️ Για τα αγαπημένα μου πρόσωπα"
  },
  "safespace_butterfly_instruction": {
    "en": "Cross arms over your chest and alternate gentle taps on your collarbones",
    "de": "Verschränke die Arme über der Brust und klopfe abwechselnd sanft auf die Schlüsselbeine",
    "fr": "Croisez les bras sur votre poitrine et tapotez doucement vos clavicules en alternance",
    "it": "Incrocia le braccia sul petto e picchietta dolcemente le clavicole alternando i lati",
    "es": "Cruza los brazos sobre el pecho y da suaves toques alternos sobre las clavículas",
    "el": "Σταύρωσε τα χέρια στο στήθος και χτύπα απαλά εναλλάξ τις κλείδες σου"
  },
  "safespace_sensory_grounding": {
    "en": "Sensory Grounding",
    "de": "Sensorische Verankerung",
    "fr": "Ancrage sensoriel",
    "it": "Radicamento sensoriale",
    "es": "Anclaje sensorial",
    "el": "Αισθητηριακή γείωση"
  },
  "safespace_shake_limbs": {
    "en": "Gently shake out hands, shoulders, and legs...",
    "de": "Schüttle Hände, Schultern und Beine locker aus...",
    "fr": "Secouez doucement les mains, les épaules et les jambes...",
    "it": "Scuoti dolcemente mani, spalle e gambe...",
    "es": "Sacude suavemente manos, hombros y piernas...",
    "el": "Τίναξε απαλά τα χέρια, τους ώμους και τα πόδια σου..."
  },
  "safespace_choose_level": {
    "en": "Select level",
    "de": "Level wählen",
    "fr": "Choisir le niveau",
    "it": "Seleziona livello",
    "es": "Seleccionar nivel",
    "el": "Επιλογή επιπέδου"
  },
  "safespace_tension_level_desc": {
    "en": "Click your current tension level for quick self-assessment:",
    "de": "Klicke dein aktuelles Anspannungsniveau zur Selbsteinschätzung:",
    "fr": "Évaluez votre niveau actuel de tension pour vous orienter :",
    "it": "Indica il tuo livello di tensione attuale per autovalutarti:",
    "es": "Haz clic en tu nivel de tensión actual para orientarte:",
    "el": "Επιλέξτε το τρέχον επίπεδο έντασης για γρήγορη αξιολόγηση:"
  },
  "safespace_frequencies_desc": {
    "en": "100% offline generated frequencies for neuroacoustic soothing:",
    "de": "100% offline synthetisierte Frequenzen zur neuroakustischen Beruhigung:",
    "fr": "Fréquences générées à 100% hors-ligne pour l'apaisement neuroacoustique :",
    "it": "Frequenze generate al 100% offline per la distensione neuroacustica:",
    "es": "Frecuencias generadas 100% offline para la calma neuroacústica:",
    "el": "Συχνότητες παραγόμενες 100% εκτός σύνδεσης για νευροακουστική ηρεμία:"
  },
  "safespace_frequencies_subtitle": {
    "en": "Deep relaxation for the autonomic nervous system",
    "de": "Tiefenentspannung für das vegetative System",
    "fr": "Relaxation profonde du système nerveux autonome",
    "it": "Rilassamento profondo del sistema nervoso autonomo",
    "es": "Relajación profunda del sistema nervioso autónomo",
    "el": "Βαθιά χαλάρωση για το αυτόνομο νευρικό σύστημα"
  },
  "dilemma_radical_question": {
    "en": "What would be the most radical 5-minute solution?",
    "de": "Was wäre die radikalste 5-Minuten-Lösung?",
    "fr": "Quelle serait la solution la plus radicale en 5 minutes ?",
    "it": "Quale sarebbe la soluzione più radicale in 5 minuti?",
    "es": "¿Cuál sería la solución más radical en 5 minutos?",
    "el": "Ποια θα ήταν η πιο ριζοσπαστική λύση 5 λεπτών;"
  },
  "badge_100_offline": {
    "en": "100% Offline",
    "de": "100% Offline",
    "fr": "100% Hors-ligne",
    "it": "100% Offline",
    "es": "100% Offline",
    "el": "100% Εκτός σύνδεσης"
  },
  "pwa_native_app_desc": {
    "en": "Use as a native standalone app on your device",
    "de": "Als native App auf deinem Gerät nutzen",
    "fr": "Utiliser comme application autonome sur votre appareil",
    "it": "Utilizza come app autonoma sul tuo dispositivo",
    "es": "Úsala como app independiente en tu dispositivo",
    "el": "Χρήση ως αυτόνομη εφαρμογή στη συσκευή σας"
  },
  "badge_100_offline_capable": {
    "en": "100% Offline Ready",
    "de": "100% Offline-fähig",
    "fr": "100% Hors-ligne",
    "it": "100% Compatibile offline",
    "es": "100% Funcional sin conexión",
    "el": "100% Λειτουργία εκτός σύνδεσης"
  },
  "pwa_install_now_btn": {
    "en": "Install Now 📲",
    "de": "Jetzt installieren 📲",
    "fr": "Installer maintenant 📲",
    "it": "Installa ora 📲",
    "es": "Instalar ahora 📲",
    "el": "Εγκατάσταση τώρα 📲"
  },
  "pwa_offline_benefit": {
    "en": "Offline advantage:",
    "de": "Offline-Vorteil:",
    "fr": "Avantage hors-ligne :",
    "it": "Vantaggio offline:",
    "es": "Ventaja sin conexión:",
    "el": "Πλεονέκτημα εκτός σύνδεσης:"
  },
  "pwa_step1_safari": {
    "en": "Step 1: Open in Safari",
    "de": "Schritt 1: In Safari öffnen",
    "fr": "Étape 1 : Ouvrir dans Safari",
    "it": "Passo 1: Apri in Safari",
    "es": "Paso 1: Abrir en Safari",
    "el": "Βήμα 1: Άνοιγμα στο Safari"
  },
  "presets_card_desc": {
    "en": "Choose preconfigured routine presets (Focus, Minimalist, Household Guide).",
    "de": "Wähle vorkonfigurierte Routine-Presets (Fokus, Minimalist, Haushalts-Guide).",
    "fr": "Choisissez des modèles de routines préconfigurés (Focus, Minimaliste, Entretien).",
    "it": "Scegli routine preconfigurate (Focus, Minimalista, Guida domestica).",
    "es": "Elige rutinas preconfiguradas (Enfoque, Minimalista, Guía del hogar).",
    "el": "Επιλέξτε προρυθμισμένες ρουτίνες (Εστίαση, Μινιμαλιστική, Οικιακός οδηγός)."
  },
  "presets_choose_btn": {
    "en": "Choose Presets",
    "de": "Presets wählen",
    "fr": "Choisir les modèles",
    "it": "Scegli preset",
    "es": "Elegir rutinas",
    "el": "Επιλογή προτύπων"
  },
  "sync_devices_title": {
    "en": "Sync & Device Pairing",
    "de": "Sync & Geräte-Kopplung",
    "fr": "Synchronisation & Appairage",
    "it": "Sincronizzazione & Dispositivi",
    "es": "Sincronización & Dispositivos",
    "el": "Συγχρονισμός & Σύζευξη"
  },
  "sync_devices_desc": {
    "en": "Pair your phone or second screen in real-time via QR code or cloud.",
    "de": "Kopple dein Smartphone oder Zweitgerät in Echtzeit via QR-Code oder Cloud.",
    "fr": "Connectez votre smartphone ou deuxième écran en temps réel par QR code ou cloud.",
    "it": "Collega lo smartphone o secondo schermo in tempo reale tramite codice QR o cloud.",
    "es": "Vincula tu smartphone o segunda pantalla en tiempo real con código QR o nube.",
    "el": "Συνδέστε το κινητό ή τη δεύτερη οθόνη σας σε πραγματικό χρόνο μέσω QR code ή cloud."
  },
  "notifications_desc": {
    "en": "Enable system notifications for timers and audio reminders.",
    "de": "Erlaube System-Benachrichtigungen für Timer und akustische Erinnerungen.",
    "fr": "Autorisez les notifications système pour les minuteurs et rappels sonores.",
    "it": "Abilita notifiche di sistema per timer e promemoria audio.",
    "es": "Permite notificaciones del sistema para temporizadores y recordatorios sonoros.",
    "el": "Επιτρέψτε τις ειδοποιήσεις συστήματος για χρονόμετρα και ηχητικές υπενθυμίσεις."
  },
  "offline_download_desc": {
    "en": "Download the complete Noodle app as a portable offline file on the go.",
    "de": "Lade die komplette Noodle App als portable Offline-Datei für unterwegs herunter.",
    "fr": "Téléchargez l'application complète sous forme de fichier hors-ligne autonome.",
    "it": "Scarica l'intera app Noodle come pacchetto offline portatile per l'uso ovunque.",
    "es": "Descarga la aplicación completa como archivo offline portátil para llevar.",
    "el": "Κατεβάστε ολόκληρη την εφαρμογή ως φορητό αυτόνομο αρχείο για χρήση εκτός σύνδεσης."
  },
  "offline_bundle_btn": {
    "en": "Offline Bundle",
    "de": "Offline-Paket",
    "fr": "Pack hors-ligne",
    "it": "Pacchetto offline",
    "es": "Paquete sin conexión",
    "el": "Πακέτο εκτός σύνδεσης"
  },
  "step_choose_placeholder": {
    "en": "Select step",
    "de": "Schritt wählen",
    "fr": "Sélectionner une étape",
    "it": "Seleziona passo",
    "es": "Seleccionar paso",
    "el": "Επιλογή βήματος"
  }
};

// Now read data-custom-translations.js, parse customTranslations, merge NEW_TRANSLATIONS and save back
let fileContent = fs.readFileSync('data-custom-translations.js', 'utf8');
const langs = ['en', 'de', 'fr', 'it', 'es', 'el'];

// Parse current customTranslations using VM
let window = {};
eval(fileContent);

langs.forEach(lang => {
  if (!customTranslations[lang]) customTranslations[lang] = {};
  for (const [key, map] of Object.entries(NEW_TRANSLATIONS)) {
    if (map[lang]) {
      customTranslations[lang][key] = map[lang];
    }
  }
});

const output = `// data-custom-translations.js: Synchronized custom translations
if (typeof window.TRANSLATIONS === 'undefined') { window.TRANSLATIONS = {}; }

const customTranslations = ${JSON.stringify(customTranslations, null, 2)};

// Deep merge into global TRANSLATIONS
for (const lang of Object.keys(customTranslations)) {
  if (!window.TRANSLATIONS[lang]) window.TRANSLATIONS[lang] = {};
  Object.assign(window.TRANSLATIONS[lang], customTranslations[lang]);
}

if (typeof globalThis !== 'undefined') {
  if (!globalThis.TRANSLATIONS) globalThis.TRANSLATIONS = {};
  for (const lang of Object.keys(customTranslations)) {
    if (!globalThis.TRANSLATIONS[lang]) globalThis.TRANSLATIONS[lang] = {};
    Object.assign(globalThis.TRANSLATIONS[lang], customTranslations[lang]);
  }
}
`;

fs.writeFileSync('data-custom-translations.js', output, 'utf8');
console.log('Successfully updated data-custom-translations.js with new translated keys!');
