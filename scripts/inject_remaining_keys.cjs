const fs = require('fs');

const NEW_KEYS = {
  // Pick / WhatNow
  "pick_tab_suggestion": {
    de: "Fokus-Vorschlag", en: "Focus Suggestion", fr: "Suggestion de focus", it: "Suggerimento focus", es: "Sugerencia de enfoque", el: "Πρόταση εστίασης"
  },
  "pick_tab_dilemma": {
    de: "A vs. B Entscheider", en: "A vs B Decider", fr: "Décideur A vs B", it: "Decisore A vs B", es: "Decisor A vs B", el: "Αποφασιστής A vs B"
  },
  "pick_tab_braindump": {
    de: "Kopf leeren", en: "Clear Mind", fr: "Vider l'esprit", it: "Svuota la mente", es: "Vaciar la mente", el: "Άδειασμα μυαλού"
  },
  "pick_energy_low": {
    de: "🔋 Quick Win", en: "🔋 Quick Win", fr: "🔋 Gain rapide", it: "🔋 Vittoria rapida", es: "🔋 Victoria rápida", el: "🔋 Γρήγορη νίκη"
  },
  "pick_energy_med": {
    de: "⚡ Fokus", en: "⚡ Focus", fr: "⚡ Focus", it: "⚡ Focus", es: "⚡ Enfoque", el: "⚡ Εστίαση"
  },
  "pick_energy_high": {
    de: "🔥 Deep Work", en: "🔥 Deep Work", fr: "🔥 Travail profond", it: "🔥 Lavoro profondo", es: "🔥 Trabajo profundo", el: "🔥 Βαθιά εργασία"
  },
  "pick_energy_random": {
    de: "🎲 Random", en: "🎲 Random", fr: "🎲 Aléatoire", it: "🎲 Casuale", es: "🎲 Aleatorio", el: "🎲 Τυχαίο"
  },
  "pick_next_btn": {
    de: "Anderer Vorschlag", en: "Another Suggestion", fr: "Autre suggestion", it: "Altro suggerimento", es: "Otra sugerencia", el: "Άλλη πρόταση"
  },
  "pick_space_hint": {
    de: "[Space] = Starten", en: "[Space] = Start", fr: "[Espace] = Démarrer", it: "[Spazio] = Avvia", es: "[Espacio] = Iniciar", el: "[Space] = Έναρξη"
  },
  "pick_coin_flip": {
    de: "Münze werfen & entscheiden", en: "Flip coin & decide", fr: "Lancer la pièce & décider", it: "Lancia moneta & decidi", es: "Lanzar moneda y decidir", el: "Ρίξε νόμισμα & αποφάσισε"
  },
  "pick_start_focus": {
    de: "Direkt im Fokus starten 🧘", en: "Start directly in focus 🧘", fr: "Démarrer directement en focus 🧘", it: "Avvia direttamente in focus 🧘", es: "Iniciar directamente en enfoque 🧘", el: "Έναρξη απευθείας σε εστίαση 🧘"
  },
  "pick_save_task": {
    de: "Als Aufgabe speichern", en: "Save as task", fr: "Enregistrer comme tâche", it: "Salva come compito", es: "Guardar como tarea", el: "Αποθήκευση ως εργασία"
  },
  "pick_dilemma_hint": {
    de: "Zwischen zwei Dingen gefangen? Lass den Münzwurf entscheiden – dein Bauchgefühl merkt sofort, ob du mit dem Ergebnis zufrieden bist!",
    en: "Caught between two choices? Let the coin flip decide – your gut instinct will instantly tell if you agree!",
    fr: "Pris entre deux options ? Laissez la pièce décider : votre intuition saura immédiatement !",
    it: "Indeciso tra due opzioni? Lascia decidere la moneta: il tuo istinto capirà subito se sei d'accordo!",
    es: "¿Indeciso entre dos opciones? Deja que la moneda decida: ¡tu instinto sabrá al instante si estás conforme!",
    el: "Διχασμένος ανάμεσα σε δύο επιλογές; Άφησε το κέρμα να αποφασίσει – το ένστικτό σου θα καταλάβει αμέσως!"
  },
  "pick_braindump_hint": {
    de: "Was blockiert dich gerade oder liegt dir auf der Seele? Tippe es kurz ein und starte sofort ohne Ablenkung.",
    en: "What's blocking you or on your mind? Type it briefly and start immediately without distraction.",
    fr: "Qu'est-ce qui vous bloque ou vous pèse ? Notez-le brièvement et démarrez sans distraction.",
    it: "Cosa ti blocca o ti appesantisce? Scrivilo brevemente e inizia subito senza distrazioni.",
    es: "¿Qué te bloquea o te preocupa? Escríbelo brevemente y empieza de inmediato sin distracciones.",
    el: "Τι σε μπλοκάρει αυτή τη στιγμή; Γράψε το σύντομα και ξεκίνα αμέσως χωρίς περισπασμούς."
  },

  // Sport
  "sport_tab_presets": {
    de: "Programme", en: "Programs", fr: "Programmes", it: "Programmi", es: "Programas", el: "Προγράμματα"
  },
  "sport_tab_builder": {
    de: "Baukasten", en: "Builder", fr: "Générateur", it: "Costruttore", es: "Constructor", el: "Δημιουργός"
  },
  "sport_tab_library": {
    de: "Lexikon", en: "Library", fr: "Bibliothèque", it: "Biblioteca", es: "Biblioteca", el: "Βιβλιοθήκη"
  },
  "sport_tab_spoons": {
    de: "1-3 Löffel", en: "1-3 Spoons", fr: "1-3 Cuillères", it: "1-3 Cucchiai", es: "1-3 Cucharas", el: "1-3 Κουτάλια"
  },
  "sport_choose_workout": {
    de: "Wähle ein vorgefertigtes Workout:", en: "Choose a pre-made workout:", fr: "Choisissez un entraînement prêt :", it: "Scegli un allenamento pronto:", es: "Elige un entrenamiento preparado:", el: "Επίλεξε έτοιμη προπόνηση:"
  },
  "sport_no_equipment": {
    de: "Keine Geräte nötig", en: "No equipment needed", fr: "Aucun équipement nécessaire", it: "Nessun attrezzo necessario", es: "Sin equipo necesario", el: "Χωρίς εξοπλισμό"
  },
  "sport_duration_scope": {
    de: "⏱️ Dauer / Umfang", en: "⏱️ Duration / Scope", fr: "⏱️ Durée / Étendue", it: "⏱️ Durata / Volume", es: "⏱️ Duración / Alcance", el: "⏱️ Διάρκεια / Έκταση"
  },
  "sport_focus_zone": {
    de: "🎯 Fokus-Zone", en: "🎯 Focus Zone", fr: "🎯 Zone ciblée", it: "🎯 Zona focus", es: "🎯 Zona objetivo", el: "🎯 Ζώνη εστίασης"
  },
  "sport_available_equip": {
    de: "🪑 Verfügbares Equipment", en: "🪑 Available Equipment", fr: "🪑 Équipement disponible", it: "🪑 Attrezzatura disponibile", es: "🪑 Equipo disponible", el: "🪑 Διαθέσιμος εξοπλισμός"
  },
  "sport_interval_timing": {
    de: "⚡ Intervall-Taktung (Übung/Pause)", en: "⚡ Interval Timing (Work/Rest)", fr: "⚡ Rythme d'intervalles (Exercice/Pause)", it: "⚡ Intervalli (Esercizio/Pausa)", es: "⚡ Intervalos (Ejercicio/Descanso)", el: "⚡ Διαστήματα (Άσκηση/Διάλειμμα)"
  },
  "sport_quiet_apartment": {
    de: "🛋️ 100% Nachbarschafts-Freundlich", en: "🛋️ 100% Apartment Friendly", fr: "🛋️ 100% Adapté aux voisins", it: "🛋️ 100% Adatto ad appartamenti", es: "🛋️ 100% Silencioso para vecinos", el: "🛋️ 100% Φιλικό προς γείτονες"
  },
  "sport_whisper_quiet": {
    de: "Flüsterleise", en: "Whisper quiet", fr: "Silencieux", it: "Silenzioso", es: "Súper silencioso", el: "Αθόρυβο"
  },
  "sport_quiet_desc": {
    de: "Kein Springen, kein Trittschall, geräuschlos auf Teppich oder Parkett.",
    en: "No jumping, no impact noise, quiet on carpet or wood floor.",
    fr: "Pas de sauts, aucun impact, silencieux sur tapis ou parquet.",
    it: "Nessun salto, nessun impatto, silenzioso su tappeti o parquet.",
    es: "Sin saltos, sin ruidos de impacto, silencioso sobre alfombra.",
    el: "Χωρίς άλματα, αθόρυβο σε χαλί ή παρκέ."
  },
  "sport_start_custom": {
    de: "Individuelles Workout Starten 🚀", en: "Start Custom Workout 🚀", fr: "Démarrer l'entraînement personnalisé 🚀", it: "Avvia allenamento personalizzato 🚀", es: "Iniciar entrenamiento personalizado 🚀", el: "Έναρξη προσαρμοσμένης προπόνησης 🚀"
  },
  "sport_current_energy": {
    de: "Dein aktuelles Energie-Level", en: "Your current energy level", fr: "Votre niveau d'énergie actuel", it: "Il tuo livello di energia attuale", es: "Tu nivel de energía actual", el: "Το τρέχον επίπεδο ενέργειάς σου"
  },
  "sport_exercise_reward": {
    de: "Übung absolviert & belohnen", en: "Exercise completed & rewarded", fr: "Exercice terminé & récompensé", it: "Esercizio completato & ricompensa", es: "Ejercicio completado y recompensar", el: "Η άσκηση ολοκληρώθηκε & επιβράβευση"
  },
  "sport_resume": {
    de: "Fortsetzen", en: "Resume", fr: "Reprendre", it: "Riprendi", es: "Reanudar", el: "Συνέχιση"
  },
  "sport_pause": {
    de: "Pausieren", en: "Pause", fr: "Mettre en pause", it: "Pausa", es: "Pausar", el: "Παύση"
  },
  "sport_finish": {
    de: "Beenden", en: "Finish", fr: "Terminer", it: "Termina", es: "Finalizar", el: "Τερματισμός"
  },

  // Safe Space
  "safespace_tab_breath": {
    de: "Atem", en: "Breath", fr: "Respiration", it: "Respiro", es: "Respiración", el: "Αναπνοή"
  },
  "safespace_tab_anchor": {
    de: "Erdung", en: "Grounding", fr: "Ancrage", it: "Radicamento", es: "Conexión", el: "Γείωση"
  },
  "safespace_tab_eyes": {
    de: "Augen", en: "Eyes", fr: "Yeux", it: "Occhi", es: "Ojos", el: "Μάτια"
  },
  "safespace_tab_body": {
    de: "Körper", en: "Body", fr: "Corps", it: "Corpo", es: "Cuerpo", el: "Σώμα"
  },
  "safespace_tab_sound": {
    de: "Sound", en: "Sound", fr: "Son", it: "Suono", es: "Sonido", el: "Ήχος"
  },
  "safespace_breath_in": {
    de: "Einatmen...", en: "Inhale...", fr: "Inspirez...", it: "Inspira...", es: "Inhala...", el: "Εισπνοή..."
  },
  "safespace_creek_sound": {
    de: "Bach-Sound ein", en: "Brook sound on", fr: "Son de ruisseau activé", it: "Suono torrente on", es: "Sonido de arroyo activado", el: "Ήχος ρυακιού ενεργός"
  },
  "safespace_eyes_rule": {
    de: "20-20-20 Regel & Hand-Palming", en: "20-20-20 Rule & Hand Palming", fr: "Règle 20-20-20 & Palming", it: "Regola 20-20-20 & Palming", es: "Regla 20-20-20 y Palming", el: "Κανόνας 20-20-20 & Palming"
  },
  "safespace_eyes_rest": {
    de: "Augen ruhen", en: "Resting eyes", fr: "Reposer les yeux", it: "Riposa gli occhi", es: "Descansar ojos", el: "Ξεκούραση ματιών"
  },
  "safespace_eyes_start": {
    de: "20s Augen-Timer starten", en: "Start 20s eye timer", fr: "Démarrer le minuteur 20s", it: "Avvia timer 20s occhi", es: "Iniciar temporizador de 20s", el: "Έναρξη χρονομέτρου 20δ για τα μάτια"
  },
  "safespace_stretch_neck": {
    de: "1️⃣ Nacken-Dehnung", en: "1️⃣ Neck Stretch", fr: "1️⃣ Étirement du cou", it: "1️⃣ Stretching del collo", es: "1️⃣ Estiramiento de cuello", el: "1️⃣ Τέντωμα αυχένα"
  },
  "safespace_stretch_shoulders": {
    de: "2️⃣ Schulterkreisen & Brustöffner", en: "2️⃣ Shoulder Rolls & Chest Opener", fr: "2️⃣ Roulements d'épaules", it: "2️⃣ Cerchi con le spalle", es: "2️⃣ Giros de hombros", el: "2️⃣ Κυκλικές κινήσεις ώμων"
  },
  "safespace_stretch_wrists": {
    de: "3️⃣ Handgelenke & Finger lockern", en: "3️⃣ Wrist & Finger Release", fr: "3️⃣ Détente poignets & doigts", it: "3️⃣ Polsi & dita", es: "3️⃣ Relajar muñecas y dedos", el: "3️⃣ Χαλάρωση καρπών & δακτύλων"
  },
  "safespace_wave_90s": {
    de: "90s Welle reiten 🌊", en: "Ride 90s Wave 🌊", fr: "Surfer sur la vague de 90s 🌊", it: "Cavalca l'onda dei 90s 🌊", es: "Montar la ola de 90s 🌊", el: "Κύμα 90δ 🌊"
  },
  "safespace_save_anchor": {
    de: "Sichern 💾", en: "Save 💾", fr: "Enregistrer 💾", it: "Salva 💾", es: "Guardar 💾", el: "Αποθήκευση 💾"
  },
  "safespace_journal_submit": {
    de: "Eintragen", en: "Record", fr: "Inscrire", it: "Registra", es: "Anotar", el: "Καταχώριση"
  },

  // Calm & Regulation
  "calm_sigh_title": {
    de: "Physiologischer Seufzer (Stanford Neuroscience)", en: "Physiological Sigh (Stanford Neuroscience)", fr: "Soupir physiologique (Neurosciences de Stanford)", it: "Sospiro fisiologico (Neuroscienze di Stanford)", es: "Suspiro fisiológico (Neurociencia de Stanford)", el: "Φυσιολογικός Αναστεναγμός (Stanford Neuroscience)"
  },
  "calm_sigh_desc": {
    de: "Die schnellste biologische Methode zur Senkung von Herzfrequenz und CO₂-Druck", en: "The fastest biological method to reduce heart rate and CO₂ pressure", fr: "La méthode biologique la plus rapide pour réduire la fréquence cardiaque", it: "Il metodo biologico più rapido per ridurre la frequenza cardiaca", es: "El método biológico más rápido para reducir el ritmo cardíaco", el: "Η ταχύτερη βιολογική μέθοδος για μείωση καρδιακού ρυθμού και πίεσης CO₂"
  },
  "calm_start_pacer": {
    de: "Geführten Atem-Pacer starten", en: "Start Guided Breath Pacer", fr: "Démarrer le guide respiratoire", it: "Avvia guida respiratoria", es: "Iniciar guía de respiración", el: "Έναρξη καθοδηγούμενης αναπνοής"
  },
  "calm_bilateral_title": {
    de: "Bilaterale Stimulation / Schmetterlings-Umarmung", en: "Bilateral Stimulation / Butterfly Hug", fr: "Stimulation bilatérale / Étreinte papillon", it: "Stimolazione bilaterale / Abbraccio a farfalla", es: "Estimulación bilateral / Abrazo de mariposa", el: "Διμερής διέγερση / Αγκαλιά πεταλούδας"
  },
  "calm_left": {
    de: "LINKS", en: "LEFT", fr: "GAUCHE", it: "SINISTRA", es: "IZQUIERDA", el: "ΑΡΙΣΤΕΡΑ"
  },
  "calm_right": {
    de: "RECHTS", en: "RIGHT", fr: "DROITE", it: "DESTRA", es: "DERECHA", el: "ΔΕΞΙΑ"
  },
  "calm_start_rhythm": {
    de: "Rhythmus starten", en: "Start Rhythm", fr: "Démarrer le rythme", it: "Avvia ritmo", es: "Iniciar ritmo", el: "Έναρξη ρυθμού"
  },
  "calm_shake_title": {
    de: "Neurogenes Ausschütteln (60s Shake-Out)", en: "Neurogenic Shake-Out (60s)", fr: "Secouement neurogénique (60s)", it: "Scuotimento neurogenico (60s)", es: "Sacudida neurogénica (60s)", el: "Νευρογενές τίναγμα (60δ)"
  },
  "calm_shake_desc": {
    de: "Biologisches Entladen von Adrenalin aus Muskulatur und Faszien", en: "Biological release of adrenaline from muscles and fascia", fr: "Libération biologique de l'adrénaline des muscles", it: "Rilascio biologico di adrenalina dai muscoli", es: "Liberación biológica de adrenalina en músculos", el: "Βιολογική αποφόρτιση αδρεναλίνης από μύες & περιτονία"
  },
  "calm_start_shake": {
    de: "60s Timer starten", en: "Start 60s Timer", fr: "Démarrer le minuteur 60s", it: "Avvia timer 60s", es: "Iniciar temporizador 60s", el: "Έναρξη χρονομέτρου 60δ"
  },
  "calm_sud_title": {
    de: "Spannungsthermometer (SUD 1–10)", en: "Distress Thermometer (SUD 1–10)", fr: "Thermomètre de détresse (SUD 1–10)", it: "Termometro di tensione (SUD 1–10)", es: "Termómetro de tensión (SUD 1–10)", el: "Θερμόμετρο έντασης (SUD 1–10)"
  },
  "calm_emergency_phrases": {
    de: "Validierende Notfall-Leitsätze:", en: "Validating Emergency Statements:", fr: "Phrases d'urgence réconfortantes :", it: "Frasi di emergenza convalidanti:", es: "Frases de emergencia reconfortantes:", el: "Επιβεβαιωτικές φράσεις ανάγκης:"
  },
  "calm_helpline_title": {
    de: "Kostenfreie, vertrauliche und professionelle Ansprechpartner rund um die Uhr:", en: "Free, confidential and professional support 24/7:", fr: "Interlocuteurs gratuits, confidentiels et professionnels 24/7 :", it: "Contatti gratuiti, riservati e professionali h24:", es: "Contactos gratuitos, confidenciales y profesionales 24/7:", el: "Δωρεάν, εμπιστευτικές και επαγγελματικές γραμμές υποστήριξης όλο το 24ωρο:"
  },

  // Audio / DJ
  "audio_sounds_tab": {
    de: "Sounds", en: "Sounds", fr: "Sons", it: "Suoni", es: "Sonidos", el: "Ήχοι"
  },
  "audio_media_tab": {
    de: "Musik & Medien", en: "Music & Media", fr: "Musique & Médias", it: "Musica & Media", es: "Música y Medios", el: "Μουσική & Μέσα"
  },
  "audio_dj_tab": {
    de: "Noodle DJ", en: "Noodle DJ", fr: "Noodle DJ", it: "Noodle DJ", es: "Noodle DJ", el: "Noodle DJ"
  },

  // Reports
  "report_stats_tab": {
    de: "Statistiken", en: "Statistics", fr: "Statistiques", it: "Statistiche", es: "Estadísticas", el: "Στατιστικά"
  },
  "report_learn_tab": {
    de: "Wissens-Labor", en: "Learning Lab", fr: "Lab Savoir", it: "Laboratorio Sapere", es: "Laboratorio Saber", el: "Εργαστήριο Γνώσης"
  },
  "report_balance_index": {
    de: "Balance-Index", en: "Balance Index", fr: "Indice d'équilibre", it: "Indice di equilibrio", es: "Índice de equilibrio", el: "Δείκτης ισορροπίας"
  },
  "report_activity_trend": {
    de: "Aktivitäts-Trend", en: "Activity Trend", fr: "Tendance d'activité", it: "Trend di attività", es: "Tendencia de actividad", el: "Τάση δραστηριότητας"
  },
  "report_cat_distribution": {
    de: "Kategorie-Verteilung", en: "Category Distribution", fr: "Répartition par catégorie", it: "Distribuzione per categoria", es: "Distribución por categorías", el: "Κατανομή κατηγοριών"
  },
  "report_completed_tasks": {
    de: "Erledigte Aufgaben", en: "Completed Tasks", fr: "Tâches terminées", it: "Attività completate", es: "Tareas completadas", el: "Ολοκληρωμένες εργασίες"
  }
};

// 1. Update data-custom-translations.js
let custCode = fs.readFileSync('data-custom-translations.js', 'utf8');
const langs = ['de', 'en', 'fr', 'it', 'es', 'el'];

langs.forEach(lang => {
  const marker = `  "${lang}": {`;
  let additions = '';
  for (const [key, trs] of Object.entries(NEW_KEYS)) {
    if (trs[lang]) {
      const escaped = trs[lang].replace(/"/g, '\\"');
      additions += `\n    "${key}": "${escaped}",`;
    }
  }
  custCode = custCode.replace(marker, marker + additions);
});

fs.writeFileSync('data-custom-translations.js', custCode, 'utf8');
console.log('Successfully injected keys into data-custom-translations.js');
