/**
 * NOODLE SUITE - PSYCHOLOGICAL REGULATION & INNER PEACE STUDIO (app-regulation.js)
 * Evidence-based psychological & somatic tools for acute anxiety, panic, overwhelm & nervous system regulation.
 * Rooted in Polyvagal Theory, Somatic Experiencing, DBT (TIPP), EMDR (Bilateral Pacing), and ACT (Cognitive Defusion).
 */

(function() {
  'use strict';

  // --- STATE ---
  let activeRegulationTab = 'reset'; // 'reset', 'grounding', 'somatic', 'mind', 'audio', 'crisis'
  let breathTimer = null;
  let bilateralInterval = null;
  let bilateralSide = 'left';
  let shakeInterval = null;
  let shakeTimeRemaining = 60;
  let isShakeRunning = false;
  let audioContext = null;
  let activeAudioOsc = null;
  let activeAudioGain = null;
  let activeAudioType = null;
  let preDistressScore = null;
  let postDistressScore = null;
  let groundingStep = 1;

  // --- TRANSLATIONS FOR REGULATION STUDIO ---
  const REGULATION_TEXTS = {
    de: {
      title: "Innere Ruhe & Somatische Regulation",
      subtitle: "Neurobiologisch fundierte Methoden zur Beruhigung des vegetativen Nervensystems",
      tab_reset: "🚨 Akut-Reset",
      tab_grounding: "⚓ Erdung (5-4-3-2-1)",
      tab_somatic: "🌊 Körper-Release",
      tab_mind: "🧠 Beruhigender Dialog",
      tab_audio: "🎵 Bio-Resonanz (432Hz)",
      tab_crisis: "🤝 Notfall-Hilfe",
      
      // Akut Reset
      sigh_title: "Physiologischer Seufzer (Stanford Neuroscience)",
      sigh_desc: "Die biologisch schnellste Methode, um die Herzfrequenz zu senken und das Alarmsystem im Gehirn herunterzufahren.",
      sigh_step1: "1. Tief durch die Nase einatmen",
      sigh_step2: "2. Oben noch einen kurzen Hauch Luft nachziehen!",
      sigh_step3: "3. Sehr langsam und lang durch den Mund ausatmen (wie durch einen Strohhalm)",
      sigh_btn_start: "Geführten Atem-Pacer starten",
      sigh_btn_stop: "Atem-Pacer pausieren",
      
      bilateral_title: "Bilaterale Stimulation / Schmetterlings-Umarmung",
      bilateral_desc: "Kreuzweise sanftes Klopfen auf die Schlüsselbeine oder Oberschenkel. Bringt beide Gehirnhälften wieder in Gleichgewicht.",
      bilateral_left: "LINKS",
      bilateral_right: "RECHTS",
      bilateral_start: "Rhythmus starten",
      bilateral_stop: "Rhythmus anhalten",
      
      tipp_title: "TIPP-Kältereiz (Taucher-Reflex / DBT)",
      tipp_desc: "Kaltes Wasser auf Gesicht oder Nacken löst sofort den Säugetier-Tauchreflex aus und senkt den Puls innerhalb von 30 Sekunden.",
      tipp_step1: "• Nimm einen kalten Waschlappen oder kühles Wasser",
      tipp_step2: "• Lege es auf Stirn, Wangen und Schläfen",
      tipp_step3: "• Halte für 15-20 Sekunden sanft die Luft an und beuge dich leicht vor",
      
      // Grounding
      grounding_title: "Sensorisches 5-4-3-2-1 Grounding",
      grounding_intro: "Bringe dein Bewusstsein zurück ins Hier und Jetzt. Nimm dir für jeden Sinn bewusst Zeit.",
      ground_5: "5 DINGE SEHEN 👀",
      ground_5_text: "Schau dich um: Finde 5 Gegenstände mit einer bestimmten Farbe oder Form.",
      ground_4: "4 DINGE SPÜREN ✋",
      ground_4_text: "Fühle 4 reale Texturen: Kleidung, Stuhllehne, Tischkante, den Boden unter deinen Füßen.",
      ground_3: "3 DINGE HÖREN 👂",
      ground_3_text: "Schließe kurz die Augen: Lausche auf 3 Geräusche im Raum oder von draußen.",
      ground_2: "2 DINGE RIECHEN 👃",
      ground_2_text: "Atme bewusst ein: Nimm 2 Gerüche wahr (Raumluft, Kleidung, Kaffee, Seife).",
      ground_1: "1 DING SCHMECKEN 👅",
      ground_1_text: "Fokussiere den Geschmack im Mund oder nimm einen achtsamen Schluck kühles Wasser.",
      ground_next: "Weiter",
      ground_restart: "Neu starten",
      
      // Somatic
      shake_title: "Neurogenes Ausschütteln (60s Shake-Out)",
      shake_desc: "Tiere zittern nach Stress instinktiv, um Adrenalin aus den Muskeln abzutransportieren. Schüttle sanft Hände, Arme und Beine aus.",
      shake_start: "60s Timer starten",
      shake_running: "Schüttle Hände, Schultern und Beine locker aus...",
      shake_done: "Wunderbar! Spüre jetzt das leichte Kribbeln und die Entlastung.",
      
      pmr_title: "Mikro-PMR (Progressive Muskelentspannung)",
      pmr_desc: "Kurzes, starkes Anspannen für 5 Sekunden, gefolgt von tiefem Loslassen.",
      pmr_step1: "Schultern zu den Ohren hochziehen & fest anspannen (5s)...",
      pmr_step2: "Komplett fallen lassen und das plötzliche Gefühl von Schwere spüren (15s).",
      
      // Mind
      mind_title: "Validierende Leitsätze bei Anspannung & Panik",
      mind_desc: "Erinnere deinen Verstand daran, dass Anspannung eine natürliche körperliche Reaktion ist, die von selbst wieder abebbt.",
      reassurance_1: "„Mein Körper schlägt gerade falschen Alarm. Es fühlt sich unangenehm an, ist aber nicht gefährlich.“",
      reassurance_2: "„Die Adrenalinwelle hat ihren biologischen Höhepunkt nach ca. 3 Minuten. Sie flacht jetzt bereits ab.“",
      reassurance_3: "„Ich muss diesen Zustand jetzt nicht bekämpfen. Ich lasse ihn da sein, während mein Nervensystem sich beruhigt.“",
      reassurance_4: "„Ich bin hier, ich atme, ich bin in Sicherheit.“",
      
      sud_title: "Spannungsskala (SUD 1–10)",
      sud_label: "Wie hoch ist dein Anspannungslevel aktuell?",
      sud_calm: "1 (Sehr ruhig)",
      sud_intense: "10 (Maximale Anspannung)",
      sud_saved_pre: "Ausgangswert erfasst: Level",
      sud_saved_post: "Aktueller Wert: Level",
      sud_improvement: "Großartig! Dein Nervensystem hat sich messbar beruhigt.",
      
      // Audio
      audio_title: "Neuroakustische Frequenzen & Resonanz",
      audio_desc: "Sanfte Schwingungen zur Stimulation von Alphawellen (Entspannung) und Thetawellen (Tiefenruhe).",
      audio_432: "432 Hz Solfeggio (Natürliche Harmonie & Erdung)",
      audio_theta: "6 Hz Theta Binaural (Tiefe Beruhigung)",
      audio_ocean: "Somatic Ocean Wave (Weite & Rhythmus)",
      audio_play: "Frequenz abspielen",
      audio_stop: "Stopp",
      
      // Crisis
      crisis_title: "Kostenfreie & Anonyme Hilfsangebote",
      crisis_desc: "Wenn du dich überwältigt fühlst oder jemanden zum Reden brauchst, bist du nicht allein:",
      crisis_de_phone1: "TelefonSeelsorge (kostenfrei, 24/7): 0800 111 0 111 oder 0800 111 0 222",
      crisis_de_phone2: "Nummer gegen Kummer (für junge Menschen): 116 111",
      crisis_de_chat: "Online-Beratung & Chat: www.telefonseelsorge.de",
      crisis_at: "Österreich: 142 (Telefonseelsorge)",
      crisis_ch: "Schweiz: 143 (Die Dargebotene Hand)",
      crisis_intl: "International / Europaweiter Notruf: 112 (Notfall)"
    },
    en: {
      title: "Inner Peace & Somatic Regulation",
      subtitle: "Neurobiologically grounded practices to calm the autonomic nervous system",
      tab_reset: "🚨 Acute Reset",
      tab_grounding: "⚓ Grounding (5-4-3-2-1)",
      tab_somatic: "🌊 Body Release",
      tab_mind: "🧠 Reassuring Dialogue",
      tab_audio: "🎵 Bio-Resonance (432Hz)",
      tab_crisis: "🤝 Crisis Support",
      
      sigh_title: "Physiological Sigh (Stanford Neuroscience)",
      sigh_desc: "The fastest biological way to lower heart rate and down-regulate autonomic arousal.",
      sigh_step1: "1. Deep inhale through the nose",
      sigh_step2: "2. Take a quick sharp top-up sip of air at the peak!",
      sigh_step3: "3. Long, slow, relaxed exhale through the mouth",
      sigh_btn_start: "Start Guided Breath Pacer",
      sigh_btn_stop: "Pause Breath Pacer",
      
      bilateral_title: "Bilateral Stimulation / Butterfly Hug",
      bilateral_desc: "Gentle alternate tapping across your chest or thighs. Rebalances both brain hemispheres.",
      bilateral_left: "LEFT",
      bilateral_right: "RIGHT",
      bilateral_start: "Start Rhythm",
      bilateral_stop: "Stop Rhythm",
      
      tipp_title: "TIPP Cold Water Dive Reflex (DBT)",
      tipp_desc: "Cold water on your face triggers the mammalian dive reflex, activating the vagus nerve in under 30 seconds.",
      tipp_step1: "• Get a cold damp cloth or cold water",
      tipp_step2: "• Place gently over forehead, eyes, and cheeks",
      tipp_step3: "• Hold breath gently for 15-20 seconds and lean forward slightly",
      
      grounding_title: "5-4-3-2-1 Sensory Grounding",
      grounding_intro: "Bring your awareness back to the safety of the present moment.",
      ground_5: "5 THINGS TO SEE 👀",
      ground_5_text: "Look around: Identify 5 objects with a specific shape or color.",
      ground_4: "4 THINGS TO FEEL ✋",
      ground_4_text: "Touch 4 distinct textures: Clothing, table surface, chair, feet on ground.",
      ground_3: "3 THINGS TO HEAR 👂",
      ground_3_text: "Listen carefully: Pick out 3 distinct sounds near or far.",
      ground_2: "2 THINGS TO SMELL 👃",
      ground_2_text: "Breathe in: Notice 2 subtle scents (air, coffee, fabric, soap).",
      ground_1: "1 THING TO TASTE 👅",
      ground_1_text: "Notice any taste in your mouth or take a mindful sip of water.",
      ground_next: "Next",
      ground_restart: "Restart",
      
      shake_title: "Neurogenic Shake-Out (60s Release)",
      shake_desc: "Shake out excess adrenaline from hands, arms, and legs just like animals do to release stress.",
      shake_start: "Start 60s Timer",
      shake_running: "Loosely shake out your hands, shoulders, and legs...",
      shake_done: "Wonderful! Notice the subtle tingling and release in your body.",
      
      pmr_title: "Micro-PMR (Progressive Muscle Relaxation)",
      pmr_desc: "Tense tightly for 5 seconds, then completely release into deep softness.",
      pmr_step1: "Shrug shoulders high up to ears & squeeze tight (5s)...",
      pmr_step2: "Drop shoulders completely and feel the sudden heavy warmth (15s).",
      
      mind_title: "Compassionate De-escalation Self-Talk",
      mind_desc: "Remind your rational mind that intense arousal is a temporary biological wave.",
      reassurance_1: "“My body is sounding a false alarm. It is uncomfortable, but I am completely safe.”",
      reassurance_2: "“Adrenaline waves naturally peak within 3 minutes. It is already starting to subside.”",
      reassurance_3: "“I don't need to fight this sensation. I can let it be while my system calms itself.”",
      reassurance_4: "“I am here. I am breathing. I am safe in this moment.”",
      
      sud_title: "Distress Thermometer (SUD 1–10)",
      sud_label: "How intense is your tension right now?",
      sud_calm: "1 (Very calm)",
      sud_intense: "10 (Extreme arousal)",
      sud_saved_pre: "Baseline recorded: Level",
      sud_saved_post: "Current level: Level",
      sud_improvement: "Great job! Your nervous system has noticeably settled.",
      
      audio_title: "Neuroacoustic Healing Frequencies",
      audio_desc: "Gentle acoustic tones designed to stimulate alpha and theta brainwave coherence.",
      audio_432: "432 Hz Solfeggio (Natural Grounding Harmonic)",
      audio_theta: "6 Hz Theta Binaural (Deep Sedation)",
      audio_ocean: "Somatic Ocean Wave (Rhythm & Flow)",
      audio_play: "Play Frequency",
      audio_stop: "Stop",
      
      crisis_title: "Free, Confidential & 24/7 Crisis Support",
      crisis_desc: "If you feel overwhelmed and need someone to listen, compassionate help is always available:",
      crisis_de_phone1: "US/Canada: 988 (Suicide & Crisis Lifeline)",
      crisis_de_phone2: "UK: 111 (NHS Mental Health) or 116 123 (Samaritans)",
      crisis_de_chat: "Crisis Text Line: Text HOME to 741741",
      crisis_at: "International: Befrienders Worldwide (befrienders.org)",
      crisis_ch: "Europe Emergency: 112",
      crisis_intl: "You are not alone. Reaching out is a sign of strength."
    },
    fr: {
      title: "Paix Intérieure & Régulation Somatique",
      subtitle: "Méthodes neurobiologiques pour apaiser le système nerveux autonome",
      tab_reset: "🚨 Reset Aigu",
      tab_grounding: "⚓ Ancrage (5-4-3-2-1)",
      tab_somatic: "🌊 Libération Corporelle",
      tab_mind: "🧠 Dialogue Apaisant",
      tab_audio: "🎵 Bio-Résonance (432Hz)",
      tab_crisis: "🤝 Soutien d'Urgence",
      sigh_title: "Soupir Physiologique (Stanford)",
      sigh_desc: "La méthode biologique la plus rapide pour ralentir le rythme cardiaque.",
      sigh_step1: "1. Inspirez profondément par le nez",
      sigh_step2: "2. Reprenez une courte inspiration au sommet !",
      sigh_step3: "3. Expirez très lentement par la bouche",
      sigh_btn_start: "Démarrer le guide respiratoire",
      sigh_btn_stop: "Mettre en pause",
      bilateral_title: "Stimulation Bilatérale",
      bilateral_desc: "Tapottement alterné sur les épaules pour rééquilibrer le cerveau.",
      bilateral_left: "GAUCHE",
      bilateral_right: "DROITE",
      bilateral_start: "Démarrer le rythme",
      bilateral_stop: "Arrêter",
      grounding_title: "Ancrage Sensoriel 5-4-3-2-1",
      grounding_intro: "Revenez en douceur dans le moment présent.",
      ground_5: "5 CHOSES À VOIR 👀",
      ground_4: "4 CHOSES À TOUCHER ✋",
      ground_3: "3 CHOSES À ÉCOUTER 👂",
      ground_2: "2 CHOSES À SENTIR 👃",
      ground_1: "1 CHOSE À GOÛTER 👅",
      ground_next: "Suivant",
      ground_restart: "Recommencer",
      shake_title: "Secouement Neurogène (60s)",
      shake_desc: "Secouez doucement les bras et jambes pour libérer l'adrénaline.",
      shake_start: "Démarrer 60s",
      pmr_title: "Micro-Relaxation Musculaire",
      pmr_desc: "Haussez les épaules 5s, puis relâchez totalement.",
      mind_title: "Phrases d'Apaisement & ACT",
      reassurance_1: "« Mon corps déclenche une fausse alerte. C'est inconfortable, mais je suis en sécurité. »",
      reassurance_2: "« La vague d'adrénaline redescend en 3 minutes. Cela passe déjà. »",
      reassurance_3: "« Je respire et je m'ancre dans le présent. »",
      audio_title: "Fréquences Thérapeutiques",
      audio_432: "432 Hz Solfeggio (Harmonie)",
      audio_play: "Écouter",
      audio_stop: "Arrêter",
      crisis_title: "Aide & Écoute Anonyme",
      crisis_desc: "Numéro national d'aide d'urgence : 3114 (France, 24/7 gratuit)."
    },
    it: {
      title: "Pace Interiore & Regolazione Somatica",
      subtitle: "Metodi neurobiologici per calmare il sistema nervoso autonomo",
      tab_reset: "🚨 Reset Rapido",
      tab_grounding: "⚓ Radicamento (5-4-3-2-1)",
      tab_somatic: "🌊 Rilascio Corporeo",
      tab_mind: "🧠 Dialogo Rassicurante",
      tab_audio: "🎵 Bio-Risonanza (432Hz)",
      tab_crisis: "🤝 Supporto",
      sigh_title: "Sospiro Fisiologico (Stanford)",
      sigh_desc: "Il metodo più rapido per abbassare la frequenza cardiaca.",
      sigh_step1: "1. Inspira a fondo con il naso",
      sigh_step2: "2. Fai un ulteriore piccolo respiro al culmine!",
      sigh_step3: "3. Espira molto lentamente dalla bocca",
      sigh_btn_start: "Avvia ritmo",
      sigh_btn_stop: "Pausa",
      bilateral_title: "Stimolazione Bilaterale",
      bilateral_desc: "Picchiettamento alternato su spalle o cosce per ritrovare equilibrio.",
      bilateral_left: "SINISTRA",
      bilateral_right: "DESTRA",
      bilateral_start: "Avvia",
      bilateral_stop: "Stop",
      grounding_title: "Radicamento Sensoriale 5-4-3-2-1",
      grounding_intro: "Ritorna nel momento presente con i tuoi sensi.",
      ground_5: "5 COSE DA VEDERE 👀",
      ground_4: "4 COSE DA TOCCARE ✋",
      ground_3: "3 COSE DA ASCOLTARE 👂",
      ground_2: "2 COSE DA ODORARE 👃",
      ground_1: "1 COSA DA GUSTARE 👅",
      ground_next: "Avanti",
      ground_restart: "Riavvia",
      shake_title: "Scuotimento Neurogeno (60s)",
      shake_desc: "Scuoti delicatamente braccia e gambe per scaricare la tensione.",
      shake_start: "Avvia 60s",
      pmr_title: "Micro-Rilassamento Muscolare",
      pmr_desc: "Tendi le spalle per 5s, poi rilascia completamente.",
      mind_title: "Frasi Rassicuranti & ACT",
      reassurance_1: "«Il mio corpo sta dando un falso allarme. È spiacevole, ma sono al sicuro.»",
      reassurance_2: "«L'ondata di adrenalina dura pochi minuti. Sta già diminuendo.»",
      reassurance_3: "«Sono qui, respiro e lascio che il mio corpo si calmi.»",
      audio_title: "Frequenze Rilassanti",
      audio_432: "432 Hz Solfeggio (Armonia)",
      audio_play: "Riproduci",
      audio_stop: "Stop",
      crisis_title: "Supporto & Ascolto",
      crisis_desc: "Telefono Amico Italia: 02 2327 2327 o Emergenza 112."
    },
    es: {
      title: "Paz Interior & Regulación Somática",
      subtitle: "Métodos neurobiológicos para calmar el sistema nervioso autónomo",
      tab_reset: "🚨 Reset Rápido",
      tab_grounding: "⚓ Anclaje (5-4-3-2-1)",
      tab_somatic: "🌊 Liberación Corporal",
      tab_mind: "🧠 Diálogo Calmante",
      tab_audio: "🎵 Bio-Resonancia (432Hz)",
      tab_crisis: "🤝 Ayuda Inmediata",
      sigh_title: "Suspiro Fisiológico (Stanford)",
      sigh_desc: "La técnica biológica más rápida para bajar el ritmo cardíaco y la ansiedad.",
      sigh_step1: "1. Inhala profundo por la nariz",
      sigh_step2: "2. ¡Toma un sorbo extra de aire al final!",
      sigh_step3: "3. Exhala muy despacio por la boca",
      sigh_btn_start: "Iniciar guía respiratoria",
      sigh_btn_stop: "Pausar",
      bilateral_title: "Estimulación Bilateral",
      bilateral_desc: "Toques alternos en hombros o muslos para equilibrar el cerebro.",
      bilateral_left: "IZQUIERDA",
      bilateral_right: "DERECHA",
      bilateral_start: "Iniciar",
      bilateral_stop: "Detener",
      grounding_title: "Anclaje Sensorial 5-4-3-2-1",
      grounding_intro: "Vuelve con suavidad al momento presente.",
      ground_5: "5 COSAS QUE VER 👀",
      ground_4: "4 COSAS QUE SENTIR ✋",
      ground_3: "3 COSAS QUE ESCUCHAR 👂",
      ground_2: "2 COSAS QUE OLER 👃",
      ground_1: "1 COSA QUE SABOREAR 👅",
      ground_next: "Siguiente",
      ground_restart: "Reiniciar",
      shake_title: "Sacudida Neurobiológica (60s)",
      shake_desc: "Sacude suavemente manos, brazos y piernas para disipar la adrenalina.",
      shake_start: "Iniciar 60s",
      pmr_title: "Micro-Relajación Muscular",
      pmr_desc: "Tensa los hombros durante 5s y suelta por completo.",
      mind_title: "Afirmaciones de Seguridad & ACT",
      reassurance_1: "«Mi cuerpo está dando una falsa alarma. Es incómodo, pero estoy a salvo.»",
      reassurance_2: "«La ola de adrenalina baja en pocos minutos. Ya está disminuyendo.»",
      reassurance_3: "«Estoy aquí, respiro y dejo que mi cuerpo se calme a su ritmo.»",
      audio_title: "Frecuencias Curativas",
      audio_432: "432 Hz Solfeggio (Armonía)",
      audio_play: "Reproducir",
      audio_stop: "Parar",
      crisis_title: "Líneas de Ayuda Gratuitas",
      crisis_desc: "Teléfono de la Esperanza (España): 717 003 717 o Emergencias 112."
    },
    el: {
      title: "Εσωτερική Γαλήνη & Σωματική Ρύθμιση",
      subtitle: "Νευροβιολογικές τεχνικές ηρεμίας του αυτόνομου νευρικού συστήματος",
      tab_reset: "🚨 Άμεση Επαναφορά",
      tab_grounding: "⚓ Γείωση (5-4-3-2-1)",
      tab_somatic: "🌊 Σωματική Αποφόρτιση",
      tab_mind: "🧠 Καθησυχαστικός Διάλογος",
      tab_audio: "🎵 Βιο-Συχνότητες (432Hz)",
      tab_crisis: "🤝 Γραμμές Βοήθειας",
      sigh_title: "Φυσιολογικός Αναστεναγμός (Stanford)",
      sigh_desc: "Η ταχύτερη βιολογική μέθοδος για μείωση των παλμών της καρδιάς.",
      sigh_step1: "1. Βαθιά εισπνοή από τη μύτη",
      sigh_step2: "2. Μια επιπλέον μικρή εισπνοή στην κορυφή!",
      sigh_step3: "3. Πολύ αργή εκπνοή από το στόμα",
      sigh_btn_start: "Έναρξη αναπνοής",
      sigh_btn_stop: "Παύση",
      bilateral_title: "Διμερής Διέγερση",
      bilateral_desc: "Εναλλάξ απαλά χτυπήματα στους ώμους για εξισορρόπηση των ημισφαιρίων.",
      bilateral_left: "ΑΡΙΣΤΕΡΑ",
      bilateral_right: "ΔΕΞΙΑ",
      bilateral_start: "Έναρξη",
      bilateral_stop: "Διακοπή",
      grounding_title: "Αισθητηριακή Γείωση 5-4-3-2-1",
      grounding_intro: "Επιστροφή με ασφάλεια στο παρόν.",
      ground_5: "5 ΠΡΑΓΜΑΤΑ ΝΑ ΔΕΙΣ 👀",
      ground_4: "4 ΠΡΑΓΜΑΤΑ ΝΑ ΑΓΓΙΞΕΙΣ ✋",
      ground_3: "3 ΠΡΑΓΜΑΤΑ ΝΑ ΑΚΟΥΣΕΙΣ 👂",
      ground_2: "2 ΠΡΑΓΜΑΤΑ ΝΑ ΜΥΡΙΣΕΙΣ 👃",
      ground_1: "1 ΠΡΑΓΜΑ ΝΑ ΓΕΥΤΕΙΣ 👅",
      ground_next: "Επόμενο",
      ground_restart: "Επανεκκίνηση",
      shake_title: "Νευρογενές Τίναγμα (60s)",
      shake_desc: "Απαλό τίναγμα χεριών και ποδιών για απομάκρυνση της αδρεναλίνης.",
      shake_start: "Έναρξη 60s",
      pmr_title: "Μικρο-Μυϊκή Χαλάρωση",
      pmr_desc: "Σφίξιμο ώμων για 5s και πλήρης απελευθέρωση.",
      mind_title: "Καθησυχαστικές Σκέψεις",
      reassurance_1: "«Το σώμα μου δίνει έναν ψευδή συναγερμό. Είναι δυσάρεστο, αλλά είμαι ασφαλής.»",
      reassurance_2: "«Το κύμα αδρεναλίνης θα κοπάσει σε λίγα λεπτά. Ήδη υποχωρεί.»",
      reassurance_3: "«Είμαι εδώ, αναπνέω και εμπιστεύομαι το σώμα μου να ηρεμήσει.»",
      audio_title: "Θεραπευτικές Συχνότητες",
      audio_432: "432 Hz Solfeggio (Αρμονία)",
      audio_play: "Αναπαραγωγή",
      audio_stop: "Διακοπή",
      crisis_title: "Γραμμές Βοήθειας & Στήριξης",
      crisis_desc: "Γραμμή Ψυχολογικής Υποστήριξης 10306 ή Άμεση Δράση 112."
    }
  };

  function getLang() {
    return (typeof currentLang !== 'undefined' && REGULATION_TEXTS[currentLang]) ? currentLang : 'de';
  }

  function getRegText(key) {
    const lang = getLang();
    return REGULATION_TEXTS[lang]?.[key] || REGULATION_TEXTS.de?.[key] || REGULATION_TEXTS.en?.[key] || '';
  }

  // --- MODAL CONTROLS ---
  function openRegulationModal(tab = 'reset') {
    const modal = document.getElementById('modal-regulation');
    if (!modal) return;
    modal.classList.remove('hidden');
    switchRegulationTab(tab);
    if (typeof renderLucideIcons === 'function') renderLucideIcons(false, modal);
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  function closeRegulationModal() {
    const modal = document.getElementById('modal-regulation');
    if (!modal) return;
    modal.classList.add('hidden');
    stopBreathPacer();
    stopBilateralPacing();
    stopShakeTimer();
    stopBioAudio();
  }

  function switchRegulationTab(tab) {
    activeRegulationTab = tab;
    const tabs = ['reset', 'grounding', 'somatic', 'mind', 'audio', 'crisis'];
    tabs.forEach(t => {
      const btn = document.getElementById(`reg-tab-btn-${t}`);
      const pane = document.getElementById(`reg-pane-${t}`);
      if (pane) {
        if (t === tab) pane.classList.remove('hidden');
        else pane.classList.add('hidden');
      }
      if (btn) {
        if (t === tab) {
          btn.className = "py-2 px-2.5 rounded-xl bg-gradient-to-r from-teal-500/25 to-emerald-500/25 border border-teal-400/60 text-teal-200 font-bold shadow-[0_0_15px_rgba(20,184,166,0.25)] flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-all";
        } else {
          btn.className = "py-2 px-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-gray-400 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer text-xs font-medium transition-all";
        }
      }
    });

    if (tab === 'grounding') {
      renderGroundingStep();
    }
  }

  // --- 1. PHYSIOLOGICAL SIGH PACER ---
  let isPacerRunning = false;
  function toggleBreathPacer() {
    if (isPacerRunning) stopBreathPacer();
    else startBreathPacer();
  }

  function startBreathPacer() {
    stopBreathPacer();
    isPacerRunning = true;
    const btn = document.getElementById('reg-pacer-toggle-btn');
    if (btn) btn.innerHTML = `<i data-lucide="pause" class="w-4 h-4"></i> <span>${getRegText('sigh_btn_stop')}</span>`;
    if (typeof renderLucideIcons === 'function') renderLucideIcons();

    const circle = document.getElementById('reg-sigh-circle');
    const label = document.getElementById('reg-sigh-label');
    const sub = document.getElementById('reg-sigh-sub');
    const timer = document.getElementById('reg-sigh-timer');

    function cycle() {
      if (!isPacerRunning) return;
      // Phase 1: Inhale 1 (2.5s)
      if (label) label.innerText = getRegText('sigh_step1');
      if (sub) sub.innerText = "Nase • Tief einatmen";
      if (timer) timer.innerText = "2.5s";
      if (circle) {
        circle.style.transform = "scale(1.35)";
        circle.style.borderColor = "rgba(20, 184, 166, 0.9)";
        circle.style.backgroundColor = "rgba(20, 184, 166, 0.2)";
      }

      breathTimer = setTimeout(() => {
        if (!isPacerRunning) return;
        // Phase 2: Inhale Top-up (1.2s)
        if (label) label.innerText = getRegText('sigh_step2');
        if (sub) sub.innerText = "Kurz nachatmen!";
        if (timer) timer.innerText = "1.0s";
        if (circle) {
          circle.style.transform = "scale(1.55)";
          circle.style.borderColor = "rgba(56, 189, 248, 1)";
          circle.style.backgroundColor = "rgba(56, 189, 248, 0.25)";
        }

        breathTimer = setTimeout(() => {
          if (!isPacerRunning) return;
          // Phase 3: Long Exhale (6.5s)
          if (label) label.innerText = getRegText('sigh_step3');
          if (sub) sub.innerText = "Mund • Ganz entspannt loslassen...";
          if (timer) timer.innerText = "6.5s";
          if (circle) {
            circle.style.transform = "scale(0.85)";
            circle.style.borderColor = "rgba(168, 85, 247, 0.7)";
            circle.style.backgroundColor = "rgba(168, 85, 247, 0.1)";
          }

          breathTimer = setTimeout(cycle, 6500);
        }, 1200);
      }, 2500);
    }

    cycle();
  }

  function stopBreathPacer() {
    isPacerRunning = false;
    if (breathTimer) {
      clearTimeout(breathTimer);
      breathTimer = null;
    }
    const btn = document.getElementById('reg-pacer-toggle-btn');
    if (btn) btn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i> <span>${getRegText('sigh_btn_start')}</span>`;
    const circle = document.getElementById('reg-sigh-circle');
    const label = document.getElementById('reg-sigh-label');
    const sub = document.getElementById('reg-sigh-sub');
    const timer = document.getElementById('reg-sigh-timer');
    if (circle) {
      circle.style.transform = "scale(1)";
      circle.style.borderColor = "rgba(20, 184, 166, 0.5)";
      circle.style.backgroundColor = "rgba(20, 184, 166, 0.08)";
    }
    if (label) label.innerText = getRegText('sigh_step1');
    if (sub) sub.innerText = "Bereit zum Starten";
    if (timer) timer.innerText = "Start";
    if (typeof renderLucideIcons === 'function') renderLucideIcons();
  }

  // --- 2. BILATERAL STIMULATION PACER ---
  let isBilateralRunning = false;
  function toggleBilateralPacing() {
    if (isBilateralRunning) stopBilateralPacing();
    else startBilateralPacing();
  }

  function startBilateralPacing() {
    stopBilateralPacing();
    isBilateralRunning = true;
    const btn = document.getElementById('reg-bilateral-toggle-btn');
    if (btn) btn.innerHTML = `<i data-lucide="pause" class="w-4 h-4"></i> <span>${getRegText('bilateral_stop')}</span>`;
    if (typeof renderLucideIcons === 'function') renderLucideIcons();

    bilateralSide = 'left';
    updateBilateralVisuals();

    bilateralInterval = setInterval(() => {
      bilateralSide = bilateralSide === 'left' ? 'right' : 'left';
      updateBilateralVisuals();
      playSoftTick(bilateralSide === 'left' ? 440 : 554);
    }, 850);
  }

  function updateBilateralVisuals() {
    const leftEl = document.getElementById('reg-bilateral-left');
    const rightEl = document.getElementById('reg-bilateral-right');
    if (!leftEl || !rightEl) return;

    if (bilateralSide === 'left') {
      leftEl.className = "flex-1 py-6 rounded-2xl bg-gradient-to-r from-teal-500/30 to-emerald-500/30 border-2 border-teal-400 text-white font-bold text-sm shadow-[0_0_25px_rgba(20,184,166,0.4)] scale-105 transition-all duration-150 flex flex-col items-center justify-center gap-2";
      rightEl.className = "flex-1 py-6 rounded-2xl bg-white/5 border border-white/10 text-gray-500 font-medium text-sm transition-all duration-150 flex flex-col items-center justify-center gap-2";
    } else {
      leftEl.className = "flex-1 py-6 rounded-2xl bg-white/5 border border-white/10 text-gray-500 font-medium text-sm transition-all duration-150 flex flex-col items-center justify-center gap-2";
      rightEl.className = "flex-1 py-6 rounded-2xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400 text-white font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-105 transition-all duration-150 flex flex-col items-center justify-center gap-2";
    }
  }

  function stopBilateralPacing() {
    isBilateralRunning = false;
    if (bilateralInterval) {
      clearInterval(bilateralInterval);
      bilateralInterval = null;
    }
    const btn = document.getElementById('reg-bilateral-toggle-btn');
    if (btn) btn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i> <span>${getRegText('bilateral_start')}</span>`;
    const leftEl = document.getElementById('reg-bilateral-left');
    const rightEl = document.getElementById('reg-bilateral-right');
    if (leftEl) leftEl.className = "flex-1 py-6 rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-medium text-sm transition-all flex flex-col items-center justify-center gap-2";
    if (rightEl) rightEl.className = "flex-1 py-6 rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-medium text-sm transition-all flex flex-col items-center justify-center gap-2";
    if (typeof renderLucideIcons === 'function') renderLucideIcons();
  }

  // --- 3. SENSORISCHES GROUNDING (5-4-3-2-1) ---
  function renderGroundingStep() {
    const titleEl = document.getElementById('reg-ground-title');
    const textEl = document.getElementById('reg-ground-text');
    const barEl = document.getElementById('reg-ground-bar');
    const badgeEl = document.getElementById('reg-ground-badge');
    if (!titleEl || !textEl || !barEl) return;

    const steps = [
      { title: getRegText('ground_5'), text: getRegText('ground_5_text'), pct: 20, icon: 'eye' },
      { title: getRegText('ground_4'), text: getRegText('ground_4_text'), pct: 40, icon: 'hand' },
      { title: getRegText('ground_3'), text: getRegText('ground_3_text'), pct: 60, icon: 'volume-2' },
      { title: getRegText('ground_2'), text: getRegText('ground_2_text'), pct: 80, icon: 'wind' },
      { title: getRegText('ground_1'), text: getRegText('ground_1_text'), pct: 100, icon: 'smile' }
    ];

    const current = steps[groundingStep - 1] || steps[0];
    titleEl.innerText = current.title;
    textEl.innerText = current.text;
    barEl.style.width = `${current.pct}%`;
    if (badgeEl) badgeEl.innerText = `Schritt ${groundingStep} von 5`;
  }

  function nextGroundingStep() {
    if (groundingStep < 5) {
      groundingStep++;
      playSoftChime();
    } else {
      groundingStep = 1;
      if (typeof showToast === 'function') {
        showToast(typeof tr === 'function' ? tr({
          de: "✨ Erdung abgeschlossen! Spüre die Stabilität unter deinen Füßen.",
          en: "✨ Grounding complete! Notice the stability beneath your feet."
        }) : "✨ Erdung abgeschlossen!");
      }
    }
    renderGroundingStep();
  }

  function resetGroundingSteps() {
    groundingStep = 1;
    renderGroundingStep();
  }

  // --- 4. SHAKE-OUT TIMER (60s) ---
  function toggleShakeTimer() {
    if (isShakeRunning) stopShakeTimer();
    else startShakeTimer();
  }

  function startShakeTimer() {
    stopShakeTimer();
    isShakeRunning = true;
    shakeTimeRemaining = 60;
    const btn = document.getElementById('reg-shake-btn');
    const countEl = document.getElementById('reg-shake-count');
    const statusEl = document.getElementById('reg-shake-status');
    const ring = document.getElementById('reg-shake-ring');

    if (btn) btn.innerHTML = `<i data-lucide="pause" class="w-4 h-4"></i> <span>Stopp</span>`;
    if (statusEl) statusEl.innerText = getRegText('shake_running');
    if (ring) ring.classList.add('animate-pulse');
    if (typeof renderLucideIcons === 'function') renderLucideIcons();

    shakeInterval = setInterval(() => {
      shakeTimeRemaining--;
      if (countEl) countEl.innerText = `${shakeTimeRemaining}s`;
      if (shakeTimeRemaining <= 0) {
        stopShakeTimer();
        if (statusEl) statusEl.innerText = getRegText('shake_done');
        playSoftChime();
        if (typeof showToast === 'function') {
          showToast(typeof tr === 'function' ? tr({
            de: "🌊 60s Shake-Out beendet! Dein Körper baut Stresshormone spürbar ab.",
            en: "🌊 60s Shake-Out finished! Your body is actively releasing stress hormones."
          }) : "🌊 Shake-Out beendet!");
        }
      }
    }, 1000);
  }

  function stopShakeTimer() {
    isShakeRunning = false;
    if (shakeInterval) {
      clearInterval(shakeInterval);
      shakeInterval = null;
    }
    const btn = document.getElementById('reg-shake-btn');
    const countEl = document.getElementById('reg-shake-count');
    const statusEl = document.getElementById('reg-shake-status');
    const ring = document.getElementById('reg-shake-ring');
    if (btn) btn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i> <span>${getRegText('shake_start')}</span>`;
    if (countEl) countEl.innerText = `${shakeTimeRemaining}s`;
    if (ring) ring.classList.remove('animate-pulse');
    if (typeof renderLucideIcons === 'function') renderLucideIcons();
  }

  // --- 5. BIO-FREQUENZ AUDIO SYNTHESIZER ---
  function getAudioCtx() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioContext = new AudioCtx();
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  }

  function playBioFrequency(type) {
    if (activeAudioType === type) {
      stopBioAudio();
      return;
    }

    stopBioAudio();
    const ctx = getAudioCtx();
    if (!ctx) return;

    activeAudioType = type;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 1.2);
    gain.connect(ctx.destination);
    activeAudioGain = gain;

    if (type === '432') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime);
      osc.connect(gain);
      osc.start();
      activeAudioOsc = osc;
    } else if (type === 'theta') {
      // 6 Hz binaural beat (Carrier 216 Hz & 222 Hz)
      const merger = ctx.createChannelMerger(2);
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      oscL.type = 'sine';
      oscR.type = 'sine';
      oscL.frequency.setValueAtTime(216, ctx.currentTime);
      oscR.frequency.setValueAtTime(222, ctx.currentTime);

      oscL.connect(gain);
      oscR.connect(gain);
      oscL.start();
      oscR.start();
      activeAudioOsc = { stop: () => { oscL.stop(); oscR.stop(); } };
    } else if (type === 'ocean') {
      // Procedural soft pink/brown noise wave
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      noise.start();
      activeAudioOsc = noise;
    }

    updateAudioButtonsUI();
  }

  function stopBioAudio() {
    if (activeAudioGain && audioContext) {
      try {
        activeAudioGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      } catch (e) {}
    }
    if (activeAudioOsc) {
      setTimeout(() => {
        try {
          if (activeAudioOsc.stop) activeAudioOsc.stop();
        } catch (e) {}
        activeAudioOsc = null;
        activeAudioGain = null;
      }, 350);
    }
    activeAudioType = null;
    updateAudioButtonsUI();
  }

  function updateAudioButtonsUI() {
    ['432', 'theta', 'ocean'].forEach(t => {
      const btn = document.getElementById(`reg-audio-btn-${t}`);
      if (!btn) return;
      const stateSpan = btn.querySelector('.audio-state-text');
      if (activeAudioType === t) {
        btn.className = "py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-500/30 to-cyan-500/30 border border-teal-400 text-teal-200 font-bold shadow-[0_0_20px_rgba(20,184,166,0.3)] flex items-center justify-between cursor-pointer transition-all";
        if (stateSpan) stateSpan.innerText = "Aktiv (Klick zum Stoppen)";
      } else {
        btn.className = "py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white flex items-center justify-between cursor-pointer transition-all";
        if (stateSpan) stateSpan.innerText = "Starten";
      }
    });
  }

  // --- 6. SUD DISTRESS SCALE (1-10) ---
  function selectSUDLevel(level) {
    if (preDistressScore === null) {
      preDistressScore = level;
      const display = document.getElementById('reg-sud-pre-display');
      if (display) display.innerText = `${getRegText('sud_saved_pre')} ${level}/10`;
    } else {
      postDistressScore = level;
      const display = document.getElementById('reg-sud-post-display');
      if (display) {
        display.innerText = `${getRegText('sud_saved_post')} ${level}/10`;
      }
      if (preDistressScore > level && typeof showToast === 'function') {
        showToast(`🌿 ${getRegText('sud_improvement')} (-${preDistressScore - level} Punkte)`);
      }
    }
    highlightSUDButtons(level);
  }

  function highlightSUDButtons(activeLevel) {
    for (let i = 1; i <= 10; i++) {
      const btn = document.getElementById(`reg-sud-btn-${i}`);
      if (btn) {
        if (i === activeLevel) {
          btn.className = "w-8 h-8 rounded-xl bg-teal-500 text-black font-black text-xs shadow-lg scale-110 transition cursor-pointer";
        } else {
          btn.className = "w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold transition cursor-pointer";
        }
      }
    }
  }

  // --- AUDIO HELPERS ---
  function playSoftTick(freq = 440) {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {}
  }

  function playSoftChime() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    } catch (e) {}
  }

  // --- GLOBAL EXPORTS ---
  const RegulationStudio = {
    openModal: openRegulationModal,
    closeModal: closeRegulationModal,
    switchTab: switchRegulationTab,
    togglePacer: toggleBreathPacer,
    toggleBilateral: toggleBilateralPacing,
    nextGrounding: nextGroundingStep,
    resetGrounding: resetGroundingSteps,
    toggleShake: toggleShakeTimer,
    playFrequency: playBioFrequency,
    stopAudio: stopBioAudio,
    selectSUD: selectSUDLevel
  };

  if (typeof window !== 'undefined') {
    window.RegulationStudio = RegulationStudio;
    window.openRegulationModal = openRegulationModal;
    window.closeRegulationModal = closeRegulationModal;
    window.switchRegulationTab = switchRegulationTab;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.RegulationStudio = RegulationStudio;
    globalThis.openRegulationModal = openRegulationModal;
    globalThis.closeRegulationModal = closeRegulationModal;
    globalThis.switchRegulationTab = switchRegulationTab;
  }

})();
