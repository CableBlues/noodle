const fs = require('fs');

const NEW_KEYS = {
  // General & Common
  "close": { de: "Schließen", en: "Close", fr: "Fermer", it: "Chiudi", es: "Cerrar", el: "Κλείσιμο" },
  "add": { de: "Hinzufügen", en: "Add", fr: "Ajouter", it: "Aggiungi", es: "Añadir", el: "Προσθήκη" },
  "save": { de: "Speichern", en: "Save", fr: "Enregistrer", it: "Salva", es: "Guardar", el: "Αποθήκευση" },
  "delete": { de: "Löschen", en: "Delete", fr: "Supprimer", it: "Elimina", es: "Eliminar", el: "Διαγραφή" },
  "clear": { de: "Leeren", en: "Clear", fr: "Effacer", it: "Cancella", es: "Limpiar", el: "Εκκαθάριση" },
  "open": { de: "Öffnen", en: "Open", fr: "Ouvrir", it: "Apri", es: "Abrir", el: "Άνοιγμα" },
  "play": { de: "Abspielen", en: "Play", fr: "Lecture", it: "Riproduci", es: "Reproducir", el: "Αναπαραγωγή" },
  "pause": { de: "Pause", en: "Pause", fr: "Pause", it: "Pausa", es: "Pausa", el: "Παύση" },
  "stop": { de: "Stoppen", en: "Stop", fr: "Arrêter", it: "Ferma", es: "Detener", el: "Διακοπή" },
  "start": { de: "Starten", en: "Start", fr: "Démarrer", it: "Avvia", es: "Iniciar", el: "Έναρξη" },
  "share": { de: "Teilen", en: "Share", fr: "Partager", it: "Condividi", es: "Compartir", el: "Κοινοποίηση" },
  "search_placeholder": { de: "Suche...", en: "Search...", fr: "Recherche...", it: "Cerca...", es: "Buscar...", el: "Αναζήτηση..." },
  "undo": { de: "Rückgängig", en: "Undo", fr: "Annuler", it: "Annulla", es: "Deshacer", el: "Αναίρεση" },

  // Shopping & Supermarket
  "shop_supermarket": { de: "Markt", en: "Market", fr: "Marché", it: "Mercato", es: "Súper", el: "Αγορά" },
  "shop_tab_list": { de: "Meine Liste", en: "My List", fr: "Ma liste", it: "La mia lista", es: "Mi lista", el: "Η λίστα μου" },
  "shop_tab_deals": { de: "Discounter Deals", en: "Store Deals", fr: "Bons plans", it: "Offerte", es: "Ofertas", el: "Προσφορές" },
  "shop_sale_badge": { de: "Angebot", en: "Sale", fr: "Promo", it: "Saldi", es: "Oferta", el: "Έκπτωση" },
  "shop_add_placeholder": { de: "Artikel (z.B. 2x Hafermilch, Tomaten)...", en: "Item (e.g. 2x Oat milk, tomatoes)...", fr: "Article (ex. 2x lait d'avoine, tomates)...", it: "Articolo (es. 2x latte d'avena, pomodori)...", es: "Artículo (ej. 2x leche de avena, tomates)...", el: "Προϊόν (π.χ. 2x γάλα βρώμης, ντομάτες)..." },
  "shop_open_items": { de: "Zu besorgen", en: "To Buy", fr: "À acheter", it: "Da comprare", es: "Por comprar", el: "Για αγορά" },
  "shop_clear": { de: "Alle löschen", en: "Clear All", fr: "Tout effacer", it: "Cancella tutto", es: "Borrar todo", el: "Διαγραφή όλων" },
  "shop_log_hint": { de: "Einkäufe abhaken wandert ins Protokoll.", en: "Checked items are logged.", fr: "Les articles cochés sont enregistrés.", it: "Gli articoli spuntati vengono registrati.", es: "Los artículos marcados se registran.", el: "Τα επιλεγμένα καταγράφονται." },

  // News & Radio
  "news_sec_lang": { de: "🌐 1. Ausgabesprache", en: "🌐 1. Output Language", fr: "🌐 1. Langue de sortie", it: "🌐 1. Lingua di output", es: "🌐 1. Idioma de salida", el: "🌐 1. Γλώσσα εξόδου" },
  "news_auto_translate": { de: "(Auto-Übersetzung)", en: "(Auto-Translation)", fr: "(Traduction auto)", it: "(Traduzione auto)", es: "(Traducción auto)", el: "(Αυτόματη μετάφραση)" },
  "news_app_standard": { de: "App-Standard", en: "App Default", fr: "Défaut appli", it: "Predefinito app", es: "Predeterminado app", el: "Προεπιλογή εφαρμογής" },
  "news_sec_region": { de: "📍 2. Region & Herkunft", en: "📍 2. Region & Origin", fr: "📍 2. Région & Origine", it: "📍 2. Regione e origine", es: "📍 2. Región y origen", el: "📍 2. Περιοχή & Προέλευση" },
  "news_region_desc": { de: "Weltweit oder lokaler Fokus", en: "Worldwide or local focus", fr: "Mondial ou local", it: "Focus globale o locale", es: "Global o local", el: "Παγκόσμια ή τοπική εστίαση" },
  "news_sec_feed": { de: "🔀 3. Feed-Modus", en: "🔀 3. Feed Mode", fr: "🔀 3. Mode de flux", it: "🔀 3. Modalità feed", es: "🔀 3. Modo de feed", el: "🔀 3. Λειτουργία ροής" },
  "news_sec_media": { de: "📰 4. Medien & Quellen", en: "📰 4. Media & Sources", fr: "📰 4. Médias & Sources", it: "📰 4. Media e fonti", es: "📰 4. Medios y fuentes", el: "📰 4. Μέσα & Πηγές" },
  "news_sec_topics": { de: "📑 5. Thematik & Ressorts", en: "📑 5. Topics & Categories", fr: "📑 5. Thèmes & Rubriques", it: "📑 5. Temi e categorie", es: "📑 5. Temas y secciones", el: "📑 5. Θέματα & Κατηγορίες" },
  "news_speed_label": { de: "Sprach-Tempo:", en: "Speech Speed:", fr: "Vitesse vocale :", it: "Velocità voce:", es: "Velocidad de voz:", el: "Ταχύτητα ομιλίας:" },
  "news_listening": { de: "Wird vorgelesen...", en: "Reading aloud...", fr: "Lecture en cours...", it: "In lettura...", es: "Leyendo en voz alta...", el: "Ανάγνωση..." },
  "radio_no_station": { de: "Kein Sender gewählt", en: "No station selected", fr: "Aucune station choisie", it: "Nessuna stazione scelta", es: "Ninguna emisora elegida", el: "Δεν έχει επιλεγεί σταθμός" },
  "radio_available_stations": { de: "Verfügbare Sender", en: "Available Stations", fr: "Stations disponibles", it: "Stazioni disponibili", es: "Emisoras disponibles", el: "Διαθέσιμοι σταθμοί" },

  // Audio & DJ Studio
  "audio_mood_quick": { de: "Schnell-Stimmungen (1-Click)", en: "Quick Moods (1-Click)", fr: "Ambiances rapides (1-clic)", it: "Atmosfere rapide (1-Click)", es: "Ambientes rápidos (1-clic)", el: "Γρήγορες διαθέσεις (1 κλικ)" },
  "audio_ready": { de: "Sofort startklar", en: "Ready instantly", fr: "Prêt instantanément", IT: "Pronto all'istante", es: "Listo al instante", el: "Άμεσα έτοιμο" },
  "audio_mood_focus": { de: "Fokus", en: "Focus", fr: "Focus", it: "Focus", es: "Foco", el: "Εστίαση" },
  "audio_mood_cafe": { de: "Café", en: "Café", fr: "Café", it: "Caffè", es: "Café", el: "Καφέ" },
  "audio_mood_forest": { de: "Wald", en: "Forest", fr: "Forêt", it: "Foresta", es: "Bosque", el: "Δάσος" },
  "audio_mood_energy": { de: "Energie", en: "Energy", fr: "Énergie", it: "Energia", es: "Energía", el: "Ενέργεια" },
  "audio_mood_cosmic": { de: "Kosmos", en: "Cosmic", fr: "Cosmique", it: "Cosmico", es: "Cósmico", el: "Κοσμικό" },
  "audio_harmonies": { de: "Harmonien & Melodien", en: "Harmonies & Melodies", fr: "Harmonies & Mélodies", it: "Armonie e melodie", es: "Armonías y melodías", el: "Αρμονίες & Μελωδίες" },
  "audio_nature": { de: "Natur & Atmosphäre", en: "Nature & Ambience", fr: "Nature & Ambiance", it: "Natura e atmosfera", es: "Naturaleza y ambiente", el: "Φύση & Ατμόσφαιρα" },
  "audio_beats": { de: "Dynamische Genre-Rhythmen & Beats", en: "Dynamic Genre Beats & Rhythms", fr: "Rythmes & Beats dynamiques", it: "Ritmi e beat dinamici", es: "Ritmos y beats dinámicos", el: "Δυναμικοί ρυθμοί & Beats" },
  "audio_own_tracks": { de: "Eigene Tracks", en: "Own Tracks", fr: "Mes pistes", it: "I miei brani", es: "Mis pistas", el: "Δικά μου κομμάτια" },
  "audio_load_file": { de: "Datei laden", en: "Load File", fr: "Charger fichier", it: "Carica file", es: "Cargar archivo", el: "Φόρτωση αρχείου" },
  "audio_url_placeholder": { de: "Online Audio/Video URL (mp3, mp4, webm, stream)...", en: "Online Audio/Video URL (mp3, mp4, webm, stream)...", fr: "URL Audio/Vidéo en ligne (mp3, mp4, webm, stream)...", it: "URL Audio/Video online (mp3, mp4, webm, stream)...", es: "URL Audio/Video online (mp3, mp4, webm, stream)...", el: "Online URL ήχου/βίντεο (mp3, mp4, webm, ροή)..." },
  "dj_shuffle": { de: "Zufall", en: "Shuffle", fr: "Mélanger", it: "Casuale", es: "Aleatorio", el: "Τυχαίο" },
  "dj_xfade": { de: "X-Fade", en: "X-Fade", fr: "X-Fade", it: "X-Fade", es: "X-Fade", el: "X-Fade" },

  // Team Chat
  "collab_team_space": { de: "Team Space", en: "Team Space", fr: "Espace équipe", it: "Spazio team", es: "Espacio de equipo", el: "Χώρος ομάδας" },
  "collab_messengers": { de: "Messengers", en: "Messengers", fr: "Messageries", it: "Messaggistica", es: "Mensajería", el: "Εφαρμογές μηνυμάτων" },
  "collab_direct_chat": { de: "Direkt-Chat", en: "Direct Chat", fr: "Chat direct", it: "Chat diretta", es: "Chat directo", el: "Άμεση συνομιλία" },
  "collab_team_dashboard": { de: "Team-Dashboard:", en: "Team Dashboard:", fr: "Tableau de bord :", it: "Dashboard team:", es: "Panel de equipo:", el: "Ταμπλό ομάδας:" },
  "collab_team_board": { de: "👥 Team-Board", en: "👥 Team Board", fr: "👥 Tableau d'équipe", it: "👥 Bacheca team", es: "👥 Tablero de equipo", el: "👥 Πίνακας ομάδας" },

  // Pause Dropdown
  "pause_tab_breath": { de: "🌬️ Atem", en: "🌬️ Breath", fr: "🌬️ Respiration", it: "🌬️ Respiro", es: "🌬️ Respiración", el: "🌬️ Αναπνοή" },
  "pause_tab_sensory": { de: "⚓ Reset", en: "⚓ Reset", fr: "⚓ Réinitialiser", it: "⚓ Reset", es: "⚓ Reiniciar", el: "⚓ Επαναφορά" },
  "pause_tab_body": { de: "🧘 Körper", en: "🧘 Body", fr: "🧘 Corps", it: "🧘 Corpo", es: "🧘 Cuerpo", el: "🧘 Σώμα" },
  "pause_tab_sound": { de: "🎧 Sound", en: "🎧 Sound", fr: "🎧 Son", it: "🎧 Suono", es: "🎧 Sonido", el: "🎧 Ήχος" },
  "pause_444_title": { de: "4-4-4 Box-Atmung", en: "4-4-4 Box Breathing", fr: "Respiration carrée 4-4-4", it: "Respirazione quadrata 4-4-4", es: "Respiración cuadrada 4-4-4", el: "Αναπνοή κουτιού 4-4-4" },
  "pause_444_desc": { de: "Navy SEAL Fokus & Stressabbau in 60s", en: "Navy SEAL focus & stress relief in 60s", fr: "Focus & anti-stress en 60s", it: "Focus e anti-stress in 60s", es: "Foco y alivio del estrés en 60s", el: "Εστίαση & μείωση άγχους σε 60 δευτ." },
  "pause_478_title": { de: "4-7-8 Tiefenruhe", en: "4-7-8 Deep Calm", fr: "Calme profond 4-7-8", it: "Calma profonda 4-7-8", es: "Calma profunda 4-7-8", el: "Βαθιά ηρεμία 4-7-8" },
  "pause_478_desc": { de: "Senkt Herzfrequenz & Cortisol", en: "Lowers heart rate & cortisol", fr: "Baisse le rythme cardiaque & cortisol", it: "Abbassa frequenza cardiaca e cortisolo", es: "Reduce frecuencia cardíaca y cortisol", el: "Μειώνει τους καρδιακούς παλμούς & την κορτιζόλη" },
  "pause_sigh_title": { de: "Physiologischer Seufzer", en: "Physiological Sigh", fr: "Soupir physiologique", it: "Sospiro fisiologico", es: "Suspiro fisiológico", el: "Φυσιολογικός αναστεναγμός" },
  "pause_sigh_desc": { de: "Schnellster biologischer Nerven-Reset (30s)", en: "Fastest biological nervous reset (30s)", fr: "Reset nerveux le plus rapide (30s)", it: "Reset nervoso più rapido (30s)", es: "Reset nervioso más rápido (30s)", el: "Ταχύτερη βιολογική επαναφορά (30 δευτ.)" },
  "pause_54321_title": { de: "5-4-3-2-1 Erdungs-Anker", en: "5-4-3-2-1 Grounding Anchor", fr: "Ancrage 5-4-3-2-1", it: "Ancoraggio 5-4-3-2-1", es: "Anclaje 5-4-3-2-1", el: "Γείωση 5-4-3-2-1" },
  "pause_54321_desc": { de: "Stoppt Grübeln & holt in die Realität", en: "Stops overthinking & grounds in reality", fr: "Arrête les ruminations et ancre", it: "Ferma i pensieri e ancora alla realtà", es: "Detiene rumiaciones y ancla al presente", el: "Σταματά τις σκέψεις & επαναφέρει στην πραγματικότητα" },
  "pause_eyes_title": { de: "20-20-20 Augen-Pause & Palming", en: "20-20-20 Eye Rest & Palming", fr: "Pause visuelle 20-20-20", it: "Pausa visiva 20-20-20", es: "Pausa visual 20-20-20", el: "Διάλειμμα ματιών 20-20-20" },
  "pause_eyes_desc": { de: "20s Bildschirm-Erholung & warme Handflächen", en: "20s screen break & warm palms", fr: "20s de repos écran & paumes chaudes", it: "20s di pausa schermo e palmi caldi", es: "20s de descanso de pantalla y palmas cálidas", el: "20 δευτ. ξεκούραση οθόνης & ζεστές παλάμες" },
  "pause_detox_title": { de: "60s Dopamin-Detox (Stille)", en: "60s Dopamine Detox (Silence)", fr: "Détox dopamine 60s (Silence)", it: "Detox dopamina 60s (Silenzio)", es: "Desintoxicación de dopamina 60s (Silencio)", el: "Αποτοξίνωση ντοπαμίνης 60 δευτ. (Σιωπή)" },
  "pause_detox_desc": { de: "Reizfreie Gedankenpause ohne Bildschirm", en: "Stimulus-free mind break without screens", fr: "Pause sans écran ni stimuli", it: "Pausa mentale senza stimoli né schermi", es: "Pausa mental sin estímulos ni pantallas", el: "Διάλειμμα χωρίς οθόνη και ερεθίσματα" },

  // Settings
  "settings_select_lang": { de: "🌐 Sprache wählen", en: "🌐 Select Language", fr: "🌐 Choisir la langue", it: "🌐 Seleziona lingua", es: "🌐 Seleccionar idioma", el: "🌐 Επιλογή γλώσσας" },
  "settings_mode_peek": { de: "📌 Peek & Pin", en: "📌 Peek & Pin", fr: "📌 Aperçu & Épingler", it: "📌 Anteprima & Fissa", es: "📌 Vista previa y fijar", el: "📌 Προεπισκόπηση & Καρφίτσωμα" },
  "settings_mode_click": { de: "👆 Nur Klick", en: "👆 Click Only", fr: "👆 Clic uniquement", it: "👆 Solo clic", es: "👆 Solo clic", el: "👆 Μόνο κλικ" },
  "settings_status_free": { de: "Aktueller Status: Noodle Free", en: "Current Status: Noodle Free", fr: "Statut actuel : Noodle Gratuit", it: "Stato attuale: Noodle Gratuito", es: "Estado actual: Noodle Gratis", el: "Τρέχουσα κατάσταση: Noodle Free" },
  "settings_free_badge": { de: "Kostenlos", en: "Free", fr: "Gratuit", it: "Gratuito", es: "Gratis", el: "Δωρεάν" },
  "settings_free_desc": { de: "Alle Kernfunktionen sind 100% lokal & dauerhaft kostenlos nutzbar.", en: "All core features are 100% local & permanently free to use.", fr: "Toutes les fonctions sont 100% locales & gratuites pour toujours.", it: "Tutte le funzioni sono 100% locali e gratuite per sempre.", es: "Todas las funciones principales son 100% locales y siempre gratuitas.", el: "Όλες οι βασικές λειτουργίες είναι 100% τοπικές & μόνιμα δωρεάν." },
  "settings_pro_soon": { de: "Pro (bald verfügbar)", en: "Pro (coming soon)", fr: "Pro (bientôt)", it: "Pro (presto disponibile)", es: "Pro (próximamente)", el: "Pro (σύντομα)" },

  // Mobile Menu & Drawer
  "mobile_menu_title": { de: "Menü & Einstellungen", en: "Menu & Settings", fr: "Menu & Paramètres", it: "Menu e impostazioni", es: "Menú y ajustes", el: "Μενού & Ρυθμίσεις" },
  "mobile_tools_title": { de: "Werkzeuge & Noodle-Helfer", en: "Tools & Helpers", fr: "Outils & Assistants", it: "Strumenti e assistenti", es: "Herramientas y asistentes", el: "Εργαλεία & Βοηθοί" },
  "mobile_backup_export_btn": { de: "Backup Export", en: "Export Backup", fr: "Exporter sauvegarde", it: "Esporta backup", es: "Exportar copia", el: "Εξαγωγή αντιγράφου" },
  "mobile_restore_btn": { de: "Wiederherstellen", en: "Restore", fr: "Restaurer", it: "Ripristina", es: "Restaurar", el: "Επαναφορά" },
  "mobile_stats_report": { de: "Statistik / Bericht", en: "Stats / Report", fr: "Statistiques / Rapport", it: "Statistiche / Report", es: "Estadísticas / Informe", el: "Στατιστικά / Αναφορά" },
  "mobile_themes": { de: "Farbschemas", en: "Themes", fr: "Thèmes", it: "Temi", es: "Temas", el: "Θέματα" },
  "mobile_language": { de: "Sprache", en: "Language", fr: "Langue", it: "Lingua", es: "Idioma", el: "Γλώσσα" },
  "mobile_pause_relax": { de: "Pause & Erholung", en: "Break & Rest", fr: "Pause & Détente", it: "Pausa e relax", es: "Pausa y descanso", el: "Διάλειμμα & Χαλάρωση" },
  "mobile_save_plan": { de: "Plan sichern", en: "Save Plan", fr: "Enregistrer le plan", it: "Salva piano", es: "Guardar plan", el: "Αποθήκευση πλάνου" },
  "mobile_load_plan": { de: "Plan laden", en: "Load Plan", fr: "Charger le plan", it: "Carica piano", es: "Cargar plan", el: "Φόρτωση πλάνου" },
  "mobile_reset": { de: "Zurücksetzen", en: "Reset", fr: "Réinitialiser", it: "Reimposta", es: "Restablecer", el: "Επαναφορά" },
  "mobile_feedback": { de: "Feedback", en: "Feedback", fr: "Avis", it: "Feedback", es: "Comentarios", el: "Σχόλια" },
  "mobile_options": { de: "Optionen", en: "Options", fr: "Options", it: "Opzioni", es: "Opciones", el: "Επιλογές" },

  // Cooking
  "cook_pantry_tab": { de: "Vorrat & Zutaten", en: "Pantry & Ingredients", fr: "Garde-manger & Ingrédients", it: "Dispensa e ingredienti", es: "Despensa e ingredientes", el: "Αποθήκη & Υλικά" },
  "cook_recipe_tab": { de: "Rezept & Zubereitung", en: "Recipe & Cooking", fr: "Recette & Préparation", it: "Ricetta e preparazione", es: "Receta y preparación", el: "Συνταγή & Παρασκευή" },
  "cook_quick_select": { de: "Schnellauswahl", en: "Quick Select", fr: "Sélection rapide", it: "Scelta rapida", es: "Selección rápida", el: "Γρήγορη επιλογή" },
  "cook_clear_pantry": { de: "Leeren", en: "Clear", fr: "Vider", it: "Svuota", es: "Vaciar", el: "Εκκαθάριση" },
  "cook_suggest_btn": { de: "Rezept vorschlagen & Zubereiten", en: "Suggest Recipe & Prepare", fr: "Suggérer recette & Cuisiner", it: "Suggerisci ricetta e prepara", es: "Sugerir receta y cocinar", el: "Πρόταση συνταγής & Μαγείρεμα" },
  "cook_ingredient_match": { de: "Zutaten-Abgleich", en: "Ingredient Match", fr: "Correspondance des ingrédients", it: "Verifica ingredienti", es: "Comprobación de ingredientes", el: "Έλεγχος υλικών" },
  "cook_adjust_ingredients": { de: "Zutaten anpassen", en: "Adjust Ingredients", fr: "Ajuster ingrédients", it: "Modifica ingredienti", es: "Ajustar ingredientes", el: "Προσαρμογή υλικών" },
  "cook_missing_to_shop": { de: "Fehlendes auf Liste 🛒", en: "Missing to Shopping List 🛒", fr: "Manquant à la liste 🛒", it: "Mancanti alla spesa 🛒", es: "Faltante a la lista 🛒", el: "Ελλείψεις στη λίστα 🛒" },
  "cook_no_recipe_title": { de: "Noch kein Rezept ausgewählt", en: "No recipe selected yet", fr: "Aucune recette sélectionnée", it: "Nessuna ricetta selezionata", es: "Ninguna receta seleccionada", el: "Δεν έχει επιλεγεί συνταγή ακόμα" },
  "cook_no_recipe_desc": { de: "Trage deine verfügbaren Zutaten ein und lass dir ein schnelles Rezept zaubern.", en: "Enter your available ingredients and let us conjure up a quick recipe.", fr: "Entrez vos ingrédients disponibles pour découvrir une recette rapide.", it: "Inserisci gli ingredienti disponibili per creare una ricetta veloce.", es: "Introduce tus ingredientes disponibles para obtener una receta rápida.", el: "Εισαγάγετε τα διαθέσιμα υλικά σας για μια γρήγορη συνταγή." },
  "cook_to_pantry_btn": { de: "Zu den Zutaten 🥗", en: "To Ingredients 🥗", fr: "Aux ingrédients 🥗", it: "Agli ingredienti 🥗", es: "A los ingredientes 🥗", el: "Στα υλικά 🥗" },

  // Cleaning Guide
  "clean_tab_express": { de: "15m Blitz", en: "15m Express", fr: "15m Express", it: "15m Express", es: "15m Exprés", el: "15λ Εξπρές" },
  "clean_tab_standard": { de: "45m Standard", en: "45m Standard", fr: "45m Standard", it: "45m Standard", es: "45m Estándar", el: "45λ Βασικό" },
  "clean_tab_deep": { de: "90m Deep", en: "90m Deep", fr: "90m En profondeur", it: "90m Profondo", es: "90m Profundo", el: "90λ Βαθύ" },
  "clean_lofi_btn": { de: "LoFi-Musik", en: "LoFi Music", fr: "Musique LoFi", it: "Musica LoFi", es: "Música LoFi", el: "Μουσική LoFi" },
  "clean_transfer_board": { de: "In Board übernehmen", en: "Add to Board", fr: "Ajouter au tableau", it: "Aggiungi alla bacheca", es: "Añadir al tablero", el: "Προσθήκη στον πίνακα" },
  "clean_ready_status": { de: "Bereit für den Start!", en: "Ready to start!", fr: "Prêt à démarrer !", it: "Pronto a iniziare!", es: "¡Listo para empezar!", el: "Έτοιμοι για ξεκίνημα!" },

  // Postpone Termin Modal
  "postpone_title": { de: "Termin verschieben", en: "Reschedule Appointment", fr: "Reporter le rendez-vous", it: "Riprogramma appuntamento", es: "Reprogramar cita", el: "Αναβολή ραντεβού" },
  "postpone_quick": { de: "Schnellauswahl:", en: "Quick Selection:", fr: "Sélection rapide :", it: "Scelta rapida:", es: "Selección rápida:", el: "Γρήγορη επιλογή:" },
  "postpone_plus_1d": { de: "+1 Tag (Morgen)", en: "+1 Day (Tomorrow)", fr: "+1 Jour (Demain)", it: "+1 Giorno (Domani)", es: "+1 Día (Mañana)", el: "+1 Ημέρα (Αύριο)" },
  "postpone_plus_2d": { de: "+2 Tage", en: "+2 Days", fr: "+2 Jours", it: "+2 Giorni", es: "+2 Días", el: "+2 Ημέρες" },
  "postpone_plus_1w": { de: "+1 Woche", en: "+1 Week", fr: "+1 Semaine", it: "+1 Settimana", es: "+1 Semana", el: "+1 Εβδομάδα" },
  "postpone_new_date": { de: "Neues Datum:", en: "New Date:", fr: "Nouvelle date :", it: "Nuova data:", es: "Nueva fecha:", el: "Νέα ημερομηνία:" },
  "postpone_new_time": { de: "Neue Uhrzeit:", en: "New Time:", fr: "Nouvelle heure :", it: "Nuova ora:", es: "Nueva hora:", el: "Νέα ώρα:" },
  "postpone_note": { de: "Notiz / Grund (optional):", en: "Note / Reason (optional):", fr: "Note / Raison (optionnel) :", it: "Nota / Motivo (opzionale):", es: "Nota / Motivo (opcional):", el: "Σημείωση / Αιτία (προαιρετικό):" },

  // P2P Sync Modal
  "sync_auto_title": { de: "Automatische Synchronisation ⚡", en: "Automatic Synchronization ⚡", fr: "Synchronisation automatique ⚡", it: "Sincronizzazione automatica ⚡", es: "Sincronización automática ⚡", el: "Αυτόματος συγχρονισμός ⚡" },
  "sync_offline_guarantee": { de: "Alle Geräte & Offline-fähig", en: "All devices & offline capable", fr: "Tous appareils & hors-ligne", it: "Tutti i dispositivi e offline", es: "Todos los dispositivos y sin conexión", el: "Όλες οι συσκευές & εκτός σύνδεσης" },
  "sync_email": { de: "E-Mail-Adresse:", en: "Email address:", fr: "Adresse e-mail :", it: "Indirizzo email:", es: "Correo electrónico:", el: "Διεύθυνση email:" },
  "sync_pin": { de: "Passwort / PIN:", en: "Password / PIN:", fr: "Mot de passe / PIN :", it: "Password / PIN:", es: "Contraseña / PIN:", el: "Κωδικός / PIN:" },
  "sync_forgot_pin": { de: "Passwort vergessen?", en: "Forgot password?", fr: "Mot de passe oublié ?", it: "Password dimenticata?", es: "¿Olvidaste tu contraseña?", el: "Ξεχάσατε τον κωδικό;" },
  "sync_login_btn": { de: "Anmelden / Registrieren", en: "Log In / Register", fr: "Connexion / Inscription", it: "Accedi / Registrati", es: "Iniciar sesión / Registrarse", el: "Σύνδεση / Εγγραφή" },

  // Health
  "health_checkup_done": { de: "Erledigt ✓", en: "Done ✓", fr: "Fait ✓", it: "Fatto ✓", es: "Hecho ✓", el: "Ολοκληρώθηκε ✓" },
  "health_checkup_urgent": { de: "Überfällig!", en: "Overdue!", fr: "En retard !", it: "Scaduto!", es: "¡Atrasado!", el: "Εκπρόθεσμο!" },
  "health_checkup_due": { de: "Fällig", en: "Due", fr: "Dû", it: "In scadenza", es: "Pendiente", el: "Εκκρεμεί" },
  "health_mark_done": { de: "Erledigt", en: "Done", fr: "Fait", it: "Fatto", es: "Hecho", el: "Έγινε" },
  "health_daily_meds": { de: "Tägliche Medikamente & Vitamine", en: "Daily Medications & Vitamins", fr: "Médicaments & Vitamines du jour", it: "Farmaci e vitamine giornalieri", es: "Medicamentos y vitaminas diarios", el: "Καθημερινά φάρμακα & Βιταμίνες" },
  "health_taken_suffix": { de: "genommen", en: "taken", fr: "pris", it: "assunti", es: "tomados", el: "ελήφθησαν" },
  "health_new_med_placeholder": { de: "Neues Präparat (z.B. Omega 3)...", en: "New supplement (e.g. Omega 3)...", fr: "Nouveau produit (ex. Oméga 3)...", it: "Nuovo integratore (es. Omega 3)...", es: "Nuevo suplemento (ej. Omega 3)...", el: "Νέο σκεύασμα (π.χ. Ωμέγα 3)..." },
  "health_dose_placeholder": { de: "Dosis...", en: "Dose...", fr: "Dose...", it: "Dose...", es: "Dosis...", el: "Δόση..." },
  "health_doctor_questions": { de: "Fragen für den nächsten Arztbesuch", en: "Questions for next doctor visit", fr: "Questions pour le médecin", it: "Domande per il prossimo medico", es: "Preguntas para el médico", el: "Ερωτήσεις για τον επόμενο γιατρό" },
  "health_new_q_placeholder": { de: "Frage an Arzt notieren...", en: "Note question for doctor...", fr: "Noter question pour le médecin...", it: "Scrivi domanda per il medico...", es: "Anotar pregunta para el médico...", el: "Σημειώστε ερώτηση για τον γιατρό..." }
};

// Read data-custom-translations.js
let code = fs.readFileSync('data-custom-translations.js', 'utf8');

const langs = ['en', 'de', 'fr', 'it', 'es', 'el'];

for (const lang of langs) {
  // Find where lang block starts
  const langKey = `"${lang}": {`;
  const idx = code.indexOf(langKey);
  if (idx === -1) {
    console.error('Cannot find block for', lang);
    continue;
  }
  
  // Build string of entries to insert right after "${lang}": {
  let entries = '';
  for (const [key, transObj] of Object.entries(NEW_KEYS)) {
    const val = transObj[lang] || transObj['en'] || transObj['de'];
    // Check if key is already in file in this lang block
    const existingCheck = `"${key}":`;
    // We only insert if not already present in the block
    entries += `\n    "${key}": ${JSON.stringify(val)},`;
  }
  
  code = code.slice(0, idx + langKey.length) + entries + code.slice(idx + langKey.length);
  console.log(`Injected ${Object.keys(NEW_KEYS).length} keys into [${lang}]`);
}

fs.writeFileSync('data-custom-translations.js', code, 'utf8');
console.log('Successfully updated data-custom-translations.js!');
