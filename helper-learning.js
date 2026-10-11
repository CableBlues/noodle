/**
 * @file helper-learning.js
 * @module LearningHub
 * @description
 * Wissens- und Lernmodul (`#modal-learning-hub`) mit interaktiven 3D-Karteikarten,
 * Spaced-Repetition-Algorithmus (Leitner / SM-2), kuratierten Wissenspaketen
 * sowie Editor für eigene Lernkarten-Decks.
 */

(function() {
  'use strict';

  const SR_STORAGE_KEY = 'noodle_flashcards_sr_v2';
  const CUSTOM_PACKS_KEY = 'noodle_custom_learning_packs_v2';

  // --------------------------------------------------------------------------
  // 1. CURATED DEEP KNOWLEDGE PACKS
  // --------------------------------------------------------------------------
  const CURATED_LEARNING_PACKS = {
    adhd_neuro: {
      id: 'adhd_neuro',
      title: 'Neuro-Fokus, Dopamin & Kognitionsbiologie',
      icon: '🧠',
      color: 'purple',
      desc: 'Aktivierungs-Energie, Dopamin-Regulation, Reizfilter & Flow-Zustand',
      level: 'Praxis & Wissenschaft',
      questions: [
        {
          id: 'adhd_1',
          question: 'Warum fällt der Start einer Aufgabe oft schwer, selbst wenn man sie unbedingt erledigen will?',
          options: [
            'Wegen mangelnder Disziplin und fehlender Willenskraft.',
            'Durch eine veränderte Dopamin-Wiederaufnahme im präfrontalen Kortex, die eine höhere Aktivierungsschwelle (Interest-based Nervous System) erfordert.',
            'Weil das Kurzzeitgedächtnis bei hoher Reizdichte keine Aufgaben speichern kann.',
            'Aufgrund eines chronisch überhöhten Serotoninspiegels, der passive Lethargie erzeugt.'
          ],
          correct: 1,
          explanation: 'Das menschliche Motivationssystem arbeitet oft mit einem „Interest-based Nervous System“: Die Dopamin-Transporter pumpen Dopamin im synaptischen Spalt zu schnell zurück. Ohne echtes Interesse, Dringlichkeit, Neuheit oder Herausforderung fehlt die biochemische Zündung.',
          mnemonic: '💡 Merksatz: „Nicht Willensschwäche, sondern Zündkerzen-Mangel.“ — Dopamin ist der Treibstoff für den Handlungsstart.',
          pitfall: 'Option A verwechselt neurologische Dopamin-Verfügbarkeit fälschlicherweise mit Charakterfragen.'
        },
        {
          id: 'adhd_2',
          question: 'Was versteht man unter dem Begriff „Zeitblindheit“ (Time Blindness) und wie begegnet man ihr effektiv?',
          options: [
            'Eine Sehschwäche beim Ablesen von analogen Uhren.',
            'Die Unfähigkeit, Zeiträume linear im Arbeitsgedächtnis zu fühlen — nur „Jetzt“ und „Nicht jetzt“. Hilfe: Analoge Timer & Time-Tracking.',
            'Das Vergessen von Geburtstagen und Kalenderdaten.',
            'Ein Zustand, bei dem man während des Schlafs die Orientierung verliert.'
          ],
          correct: 1,
          explanation: 'Das Arbeitsgedächtnis erlebt Zeit oft nicht als kontinuierliches Band, sondern binär: Entweder etwas passiert JETZT oder NICHT JETZT. Sichtbare Countdown-Timer machen Zeit physisch greifbar.',
          mnemonic: '💡 Merksatz: „Mach Zeit sichtbar.“ — Visuelle Balken & Sanduhren überbrücken die Zeitblindheit.',
          pitfall: 'Option C beschreibt reines Daten-Vergessen, nicht das fehlende lineare Zeitgefühl während des Tuns.'
        },
        {
          id: 'adhd_3',
          question: 'Was ist „Body Doubling“ (Fokus-Partner) und warum reduziert es Prokrastination signifikant?',
          options: [
            'Das Auslagern von Aufgaben an einen Doppelgänger oder Assistenten.',
            'Die physische oder virtuelle Anwesenheit einer anderen arbeitenden Person, die als sozialer Anker und externer Fokus-Stabilisator dient.',
            'Das gleichzeitige Ausführen von zwei Aufgaben mit beiden Händen.',
            'Eine psychologische Abspaltung bei Überlastung.'
          ],
          correct: 1,
          explanation: 'Co-Working und Body Doubling nutzen die Spiegelneuronen und den sozialen Bezugsrahmen. Die ruhige Anwesenheit einer anderen Person (ohne Einmischung) signalisiert dem Nervensystem: „Wir sind im Arbeitsmodus“, was den inneren Widerstand senkt.',
          mnemonic: '💡 Merksatz: „Geteilte Präsenz halbiert die Reibung.“ — Coworking stabilisiert den Arbeitsfokus.',
          pitfall: 'Option A verwechselt Body Doubling mit Delegation; Option C mit Multitasking.'
        },
        {
          id: 'adhd_4',
          question: 'Wie unterscheidet sich der „Hyperfokus“ von normaler Konzentration?',
          options: [
            'Hyperfokus ist willentlich steuerbar und lässt sich auf Knopfdruck für jede beliebige Aufgabe aktivieren.',
            'Hyperfokus ist ein Zustand intensiver Versenkung bei hohem intrinsischem Interesse, bei dem Zeit, Hunger und Umgebungssignale komplett ausgeblendet werden.',
            'Hyperfokus tritt ausschließlich bei mathematischen Berechnungen auf.',
            'Hyperfokus ist ein medizinisches Synonym für Schlaflosigkeit.'
          ],
          correct: 1,
          explanation: 'Tiefe Versenkung (Hyperfokus) ist kein genereller Mangel an Aufmerksamkeit, sondern eine intensive Selektion. Wenn eine Tätigkeit fasziniert, schüttet das Belohnungssystem kontinuierlich Dopamin aus, was zu stundenlanger tiefer Versenkung ohne Ermüdungsgefühl führt.',
          mnemonic: '💡 Merksatz: „Aufmerksamkeits-Flutlicht statt Scheinwerfer.“ — Hyperfokus kanalisiert Energie maximal.',
          pitfall: 'Option A ist falsch: Hyperfokus lässt sich bei uninteressanten Pflichtaufgaben nicht einfach erzwingen.'
        },
        {
          id: 'adhd_5',
          question: 'Was ist die wirksamste Strategie gegen die „Decision Fatigue“ (Entscheidungsmüdigkeit) am Tagesbeginn?',
          options: [
            'Morgens alle offenen Möglichkeiten spontan durchdenken.',
            'Feste Standard-Routinen für Kleidung, Frühstück und die ersten 30 Minuten etablieren, um die Willenskraft-Ressource zu schonen.',
            'Möglichst viele Benachrichtigungen auf dem Smartphone aktivieren.',
            'Entscheidungen immer auf den späten Abend verschieben.'
          ],
          correct: 1,
          explanation: 'Jede getroffene Entscheidung verbraucht Glukose und neuronale Ressourcen im präfrontalen Kortex. Durch feste Start-Rituale bleibt die geistige Frische für die eigentlichen Kernaufgaben erhalten.',
          mnemonic: '💡 Merksatz: „Routinen befreien den Geist.“ — Schütze deine Morgen-Entscheidungen.',
          pitfall: 'Option A führt direkt zur Paralyse und verbraucht das Dopamin-Budget vor Arbeitsbeginn.'
        }
      ]
    },

    productivity_science: {
      id: 'productivity_science',
      title: 'Produktivitäts- & Fokus-Wissenschaft',
      icon: '⚡',
      color: 'amber',
      desc: 'Time-Blocking, Ultradian Rhythms, Parkinsons Gesetz & Zeigarnik-Effekt',
      level: 'Wissenschaft & Neurobiologie',
      questions: [
        {
          id: 'prod_1',
          question: 'Was besagt das „Parkinsonsche Gesetz“ (Parkinson\'s Law) und wie nutzt man es für maximale Produktivität?',
          options: [
            'Dass Aufgaben immer mehr Geld kosten als ursprünglich geplant.',
            'Dass Arbeit sich genau in dem Maße ausdehnt, wie Zeit für ihre Erledigung zur Verfügung steht — Lösung: Künstlich knappe Time-Boxes setzen.',
            'Dass man nie mehr als 3 Aufgaben pro Tag anfangen darf.',
            'Dass die Geschwindigkeit der Arbeit vom Alter des Ausführenden abhängt.'
          ],
          correct: 1,
          explanation: 'Wenn man für einen Bericht 2 Wochen einplant, dauert er 2 Wochen (mit Grübeln und Perfektionismus). Gibt man sich ein striktes 3-Stunden-Fenster, zwingt dies das Gehirn zur Konzentration auf das absolut Wesentliche.',
          mnemonic: '💡 Merksatz: „Arbeit ist wie Gas — sie füllt jeden Raum aus.“ — Verknappe die Box, schärfe den Fokus.',
          pitfall: 'Option A beschreibt Kosten-Kalkulationsfehler, nicht die zeitliche Ausdehnung von Arbeit.'
        },
        {
          id: 'prod_2',
          question: 'Wie funktioniert der „Zeigarnik-Effekt“ und wie schützt man sich vor mentalem Brain Fog?',
          options: [
            'Das Gehirn erinnert sich besser an erledigte Dinge als an offene.',
            'Das Arbeitsgedächtnis hält unerledigte, unterbrochene Aufgaben in ständiger unbewusster Wachsamkeit (Open Loops), was Energie raubt — Lösung: Sofort aufschreiben (Brain Dump).',
            'Ein Zustand, bei dem man Namen von Personen vergisst.',
            'Dass Pausen die Arbeitsleistung stets verringern.'
          ],
          correct: 1,
          explanation: 'Bluma Zeigarnik entdeckte: Das Gehirn erzeugt kognitive Spannung für alle offenen Schleifen. Sobald man einen konkreten nächsten Schritt aufschreibt, signalisiert man dem Gehirn Sicherheit und beendet den Hintergrund-Energieverbrauch.',
          mnemonic: '💡 Merksatz: „Dein Gehirn ist eine Denkmaschine, kein Speicher-Stick.“ — Schließe Open Loops auf Papier.',
          pitfall: 'Option A ist das genaue Gegenteil der Entdeckung von Zeigarnik.'
        },
        {
          id: 'prod_3',
          question: 'Was sind „Ultradiane Rhythmen“ (Basic Rest-Activity Cycle) im menschlichen Gehirn?',
          options: [
            'Schlafzyklen, die nur alle 7 Tage auftreten.',
            'Biologische 90- bis 120-Minuten-Wellen neuronaler Höchstleistung, gefolgt von einem natürlichen 15-20 Min. Tiefpunkt für Regeneration.',
            'Tägliche Mahlzeiten-Rhythmen für den Blutzucker.',
            'Die Anzahl der Herzschläge pro Stunde.'
          ],
          correct: 1,
          explanation: 'Wie im REM-Schlaf pulsiert auch unsere Wach-Aufmerksamkeit in 90-Minuten-Zyklen. Danach sinkt die neuronale Signalstärke; eine 15-minütige echte Pause lädt die Neurotransmitter wieder auf.',
          mnemonic: '💡 Merksatz: „Surfe auf der 90-Minuten-Welle.“ — Arbeite intensiv im Peak, erhole dich im Tal.',
          pitfall: 'Option C bezieht sich auf Ernährung, nicht auf die Zyklen des zentralen Nervensystems.'
        }
      ]
    },

    sleep_recovery: {
      id: 'sleep_recovery',
      title: 'Schlaf-Biologie & Erholung (NSDR)',
      icon: '🌙',
      color: 'indigo',
      desc: 'Zirkadiane Rhythmik, Adenosin-Druck, Melatonin & Non-Sleep Deep Rest',
      level: 'Gesundheit & Neurowissenschaft',
      questions: [
        {
          id: 'sleep_1',
          question: 'Wie reguliert das Molekül „Adenosin“ den Schlafdruck und wie interagiert Koffein damit?',
          options: [
            'Adenosin wird nachts gebildet und Koffein zerstört es dauerhaft.',
            'Adenosin baut sich mit jeder wachen Stunde im Gehirn auf und erzeugt Schlafdruck. Koffein blockiert temporär die Adenosin-Rezeptoren (ohne das Adenosin abzubauen), was nach Abklingen zum Koffein-Crash führt.',
            'Adenosin ist ein Muskelhormon, das Koffein bindet.',
            'Adenosin verhindert die Aufnahme von Vitamin D.'
          ],
          correct: 1,
          explanation: 'Koffein ist ein Antagonist: Es besetzt die Adenosin-Rezeptoren wie ein falscher Schlüssel im Schloss. Das Gehirn spürt die Müdigkeit nicht, während sich im Hintergrund immer mehr Adenosin anstaut. Lässt das Koffein nach, flutet das aufgestaute Adenosin die Rezeptoren.',
          mnemonic: '💡 Merksatz: „Koffein leiht Energie aus der Zukunft, erzeugt aber keine neue.“',
          pitfall: 'Option A ist falsch: Koffein baut Adenosin nicht ab, sondern maskiert es nur temporär.'
        },
        {
          id: 'sleep_2',
          question: 'Was ist „NSDR“ (Non-Sleep Deep Rest / Yoga Nidra) und welchen messbaren Effekt hat es auf das Gehirn?',
          options: [
            'Ein 8-stündiger Koma-Schlaf.',
            'Ein 10-20 minütiger geführter Zustand tiefer physischer Entspannung bei wachem Geist, der Dopamin im Striatum regeneriert und neuroplastische Lernspuren konsolidiert.',
            'Ein Medikament zur Einschlafhilfe.',
            'Ein Cardio-Intervall-Workout für den Abend.'
          ],
          correct: 1,
          explanation: 'NSDR senkt die Herzfrequenz, schaltet das Gehirn in regenerative Theta-Wellen und beschleunigt das Abspeichern kurz zuvor gelernter Fähigkeiten um ein Vielfaches.',
          mnemonic: '💡 Merksatz: „Lernen geschieht im Tun, Festigung geschieht in der Ruhe.“',
          pitfall: 'Option C ist falsch: NSDR ist eine reine physiologische Atem- und Körper-Technik.'
        }
      ]
    },

    stoicism_mental_models: {
      id: 'stoicism_mental_models',
      title: 'Stoizismus & Mentale Denkmodelle',
      icon: '🏛️',
      color: 'amber',
      desc: 'Dichotomie der Kontrolle, Kritisches Denken & Mentale Heuristiken',
      level: 'Philosophie & Entscheidung',
      questions: [
        {
          id: 'stoic_1',
          question: 'Was besagt Epiktets fundamentale „Dichotomie der Kontrolle“?',
          options: [
            'Man muss versuchen, alles in seiner Umwelt aktiv zu kontrollieren.',
            'Dinge teilen sich in das auf, was in unserer Macht steht (eigene Urteile, Absichten, Handlungen), und das, was außerhalb liegt (Meinungen anderer, Zufälle, Ergebnisse).',
            'Man sollte niemals emotionale Gefühle empfinden oder zeigen.',
            'Kontrolle ist eine Illusion, daher ist jedes Handeln sinnlos.'
          ],
          correct: 1,
          explanation: 'Epiktet lehrte: Seelenruhe (Ataraxie) entsteht, indem man 100% seiner Energie auf die eigenen Entscheidungen und Haltungen fokussiert, während man externe Umstände gelassen annimmt.',
          mnemonic: '💡 Merksatz: „Fokus auf den Bogen, nicht auf den Wind.“ — Kontrolliere den Schuss, akzeptiere das Ziel.',
          pitfall: 'Option C ist der klassische Mythos: Stoiker unterdrücken Gefühle nicht, sondern bewerten Reize weise.'
        },
        {
          id: 'stoic_2',
          question: 'Wie funktioniert das mentale Denkmodell der „Inversion“ (Umkehrung nach Carl Jacobi & Charlie Munger)?',
          options: [
            'Man löst ein Problem, indem man überlegt, wie man das absolute Gegenteil (das Desaster) garantiert herbeiführen würde — und vermeidet diese Punkte.',
            'Man kehrt die Reihenfolge der Wörter in einem Satz um.',
            'Man ignoriert alle negativen Möglichkeiten und denkt nur positiv.',
            'Man wechselt alle 5 Minuten das Thema.'
          ],
          correct: 0,
          explanation: '„Invert, always invert“: Anstatt zu fragen „Wie werde ich erfolgreich?“, fragt man „Was garantiert mein Scheitern?“. Das systematische Vermeiden von Dummheit ist oft leichter als Genialität.',
          mnemonic: '💡 Merksatz: „Vermeide die Klippe, statt fliegen zu lernen.“ — Fehlervermeidung schlägt Heldentum.',
          pitfall: 'Option C (Toxic Positivity) blendet Risiken aus, während Inversion Risiken präventiv entschärft.'
        },
        {
          id: 'stoic_3',
          question: 'Was beschreibt das Prinzip von „Ockhams Rasiermesser“ (Occam’s Razor)?',
          options: [
            'Ein Rasiermesser für die tägliche Morgenroutine.',
            'Bei mehreren konkurrierenden Hypothesen ist die einfachste Erklärung mit den wenigsten unbewiesenen Annahmen meist die wahrscheinlichste.',
            'Dass jede Theorie mathematisch bewiesen werden muss.',
            'Dass komplexe Erklärungen immer tiefer und wahrer sind als einfache.'
          ],
          correct: 1,
          explanation: 'Ockhams Rasiermesser schneidet unnötige Spekulationen ab. Die sparsamste und plausibelste Annahme gewinnt.',
          mnemonic: '💡 Merksatz: „Schneide den Spekulations-Ballast ab.“ — Die sparsamste Annahme gewinnt.',
          pitfall: 'Option D ist ein Denkfehler: Komplexität wird fälschlicherweise mit Weisheit verwechselt.'
        }
      ]
    },

    software_architecture: {
      id: 'software_architecture',
      title: 'Coding, Web-Architektur & Clean Code',
      icon: '💻',
      color: 'sky',
      desc: 'Event-Loop, SOLID, Idempotenz, Security & Clean Design',
      level: 'Technologie & Systeme',
      questions: [
        {
          id: 'code_1',
          question: 'Wie verarbeitet der JavaScript Event-Loop Microtasks (z. B. Promise.then) im Vergleich zu Macrotasks (z. B. setTimeout)?',
          options: [
            'Macrotasks haben immer Vorrang vor Microtasks.',
            'Die Microtask-Queue wird nach dem aktuellen Call-Stack vollständig abgearbeitet, BEVOR der nächste Macrotask oder Rendering-Frame ausgeführt wird.',
            'Microtasks und Macrotasks werden rein zufällig parallel in Web-Workern gestartet.',
            'Promises blockieren den Browser-Thread synchron bis zur Serverantwort.'
          ],
          correct: 1,
          explanation: 'Nach jeder Ausführung einer synchronen Task leert die JS-Engine die gesamte Microtask-Queue (Promises, queueMicrotask). Erst danach wird der nächste Macrotask aus der Task-Queue entnommen.',
          mnemonic: '💡 Merksatz: „Microtasks räumen den Tisch ab, bevor die nächste Runde serviert wird.“',
          pitfall: 'Option A ist falsch: setTimeout(..., 0) wartet immer, bis alle anstehenden Promise-Callbacks fertig sind.'
        },
        {
          id: 'code_2',
          question: 'Was bedeutet „Idempotenz“ bei HTTP-Methoden und API-Operationen?',
          options: [
            'Dass die Methode nur mit Authentifizierungs-Token funktioniert.',
            'Dass mehrfache identische Anfragen denselben Systemzustand auf dem Server erzeugen wie ein einzelner Aufruf (z. B. GET, PUT, DELETE).',
            'Dass Daten automatisch verschlüsselt in einer SQL-Datenbank abgelegt werden.',
            'Dass die Schnittstelle in unter 50 Millisekunden antwortet.'
          ],
          correct: 1,
          explanation: 'Ein idempotent ausgelegter Endpunkt ändert den Zustand beim 2. oder 10. Aufruf nicht weiter. POST ist typischerweise nicht idempotent.',
          mnemonic: '💡 Merksatz: „Lichtschalter AN: 1x oder 10x drücken = Licht bleibt AN.“',
          pitfall: 'Option D beschreibt Latenz/Performance, nicht Zustandskonsistenz.'
        }
      ]
    },

    cognitive_biases: {
      id: 'cognitive_biases',
      title: 'Kognitive Biases & Rationales Entscheiden',
      icon: '🎯',
      color: 'rose',
      desc: 'Confirmation Bias, Dunning-Kruger, Availability & Anchoring',
      level: 'Psychologie & Kognition',
      questions: [
        {
          id: 'bias_1',
          question: 'Was beschreibt der „Confirmation Bias“ (Bestätigungsfehler)?',
          options: [
            'Dass man eine Bestätigungs-E-Mail nach einem Kauf erhält.',
            'Die unbewusste Tendenz, nur Informationen wahrzunehmen und zu suchen, die die eigene bestehende Meinung stützen, während Gegenbeweise ignoriert oder abgewertet werden.',
            'Die Fähigkeit, mathematische Beweise fehlerfrei zu bestätigen.',
            'Dass man anderen Menschen grundsätzlich immer zustimmt.'
          ],
          correct: 1,
          explanation: 'Das Gehirn schützt sein bestehendes Weltbild, um kognitive Dissonanz zu vermeiden. Echte Rationalität erfordert das aktive Suchen nach widerlegenden Beweisen (Falsifikation).',
          mnemonic: '💡 Merksatz: „Suche nach dem Gegenbeweis, nicht nach dem Schulterklopfen.“',
          pitfall: 'Option D beschreibt soziale Gefälligkeit (People Pleasing), nicht den kognitiven Bestätigungsfehler.'
        },
        {
          id: 'bias_2',
          question: 'Was kennzeichnet den „Dunning-Kruger-Effekt“?',
          options: [
            'Dass erfahrene Meister sich selbst stark überschätzen.',
            'Dass Personen mit geringem Wissen in einem Bereich ihre eigene Inkompetenz nicht erkennen und ihr Können drastisch überschätzen, während Experten zu Zweifeln neigen.',
            'Ein Gesetz über das schnelle Erlernen von Fremdsprachen.',
            'Eine Technik zur Reduzierung von Arbeitsstress.'
          ],
          correct: 1,
          explanation: 'Um eigene Fehler zu erkennen, benötigt man genau jene Fachkompetenz, die einem Anfänger noch fehlt („Mount Stupid“). Erst mit tieferem Wissen begreift man die wahre Komplexität.',
          mnemonic: '💡 Merksatz: „Wenig Wissen erzeugt Gewissheit — tiefes Wissen erzeugt Demut.“',
          pitfall: 'Option A vertauscht die Rollen von Anfängern und Experten.'
        }
      ]
    }
  };

  // --------------------------------------------------------------------------
  // 2. SPACED REPETITION & LEITNER ENGINE
  // --------------------------------------------------------------------------
  const LEITNER_INTERVALS_DAYS = [1, 3, 7, 14, 30]; // Box 1 to 5

  function getSRData() {
    try {
      const raw = localStorage.getItem(SR_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveSRData(data) {
    try {
      localStorage.setItem(SR_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function rateQuestionSR(questionId, rating) {
    // rating: 'again' (Box 1), 'good' (+1 Box), 'master' (Box 5)
    const data = getSRData();
    const entry = data[questionId] || { box: 1, streak: 0, lastReview: Date.now(), reps: 0 };

    if (rating === 'again') {
      entry.box = 1;
      entry.streak = 0;
    } else if (rating === 'good') {
      entry.box = Math.min(5, (entry.box || 1) + 1);
      entry.streak = (entry.streak || 0) + 1;
    } else if (rating === 'master') {
      entry.box = 5;
      entry.streak = (entry.streak || 0) + 3;
    }

    entry.reps = (entry.reps || 0) + 1;
    entry.lastReview = Date.now();
    const daysToAdd = LEITNER_INTERVALS_DAYS[entry.box - 1] || 1;
    entry.nextReview = Date.now() + (daysToAdd * 24 * 60 * 60 * 1000);

    data[questionId] = entry;
    saveSRData(data);

    if (typeof showToast === 'function') {
      showToast(`🧠 Leitner-Box: Stufe ${entry.box}/5 gespeichert (Nächste Wdh: in ${daysToAdd}T)`);
    }

    if (typeof playProceduralSound === 'function') playProceduralSound(3);

    renderLearningSessionUI();
    return entry;
  }

  // --------------------------------------------------------------------------
  // 3. STATE & LEARNING SESSION CONTROLLER
  // --------------------------------------------------------------------------
  let currentLearningMode = 'quiz'; // 'quiz' | 'flashcard' | 'decks'
  let isFlashcardFlipped = false;

  let activeLearningSession = {
    packId: 'adhd_neuro',
    customTopic: null,
    questions: [],
    currentIndex: 0,
    score: 0,
    xpEarned: 0,
    answers: {},
    bookmarked: {},
    notes: {},
    isFinished: false,
    startTime: null,
    mistakesArchive: []
  };

  let customPacksStorage = {};

  function loadLearningStorage() {
    try {
      const savedCustom = localStorage.getItem(CUSTOM_PACKS_KEY);
      if (savedCustom) customPacksStorage = JSON.parse(savedCustom);

      const savedMistakes = localStorage.getItem('flow_learning_mistakes');
      if (savedMistakes) activeLearningSession.mistakesArchive = JSON.parse(savedMistakes);
    } catch (e) {
      console.warn('[LearningHub] Storage load error:', e);
    }
  }

  function saveLearningStorage() {
    try {
      localStorage.setItem(CUSTOM_PACKS_KEY, JSON.stringify(customPacksStorage));
      localStorage.setItem('flow_learning_mistakes', JSON.stringify(activeLearningSession.mistakesArchive));
    } catch (e) {
      console.warn('[LearningHub] Storage save error:', e);
    }
  }

  function getAllPacks() {
    return { ...CURATED_LEARNING_PACKS, ...customPacksStorage };
  }

  // --------------------------------------------------------------------------
  // 4. DYNAMIC SYNTHESIZER
  // --------------------------------------------------------------------------
  function generateDynamicQuestionsForTopic(rawTopic) {
    const topic = (rawTopic || 'Allgemeinwissen').trim();
    const cleanName = topic.charAt(0).toUpperCase() + topic.slice(1);

    return [
      {
        id: 'dyn_' + Date.now() + '_1',
        question: 'Was ist das fundamentale Kernprinzip oder das primäre Ziel von „' + cleanName + '“?',
        options: [
          'Die gezielte Strukturierung, Analyse und Beherrschung der Kernmechanismen von ' + cleanName + ', um verlässliche Ergebnisse zu erzielen.',
          'Ein veraltetes Konzept, das in der modernen Praxis keine Relevanz mehr besitzt.',
          'Die zufällige und unkontrollierte Ausführung ohne definierte Methodik.',
          'Ein rein theoretisches Modell ohne jede praktische Anwendbarkeit im Alltag.'
        ],
        correct: 0,
        explanation: 'Bei ' + cleanName + ' geht es im Kern darum, fundamentale Zusammenhänge zu verstehen, Heuristiken anzuwenden und Fehlerquellen systematisch zu minimieren.',
        mnemonic: '💡 Merksatz: „Verstehe das Fundament von ' + cleanName + ', bevor du komplexe Details optimierst.“',
        pitfall: 'Die anderen Optionen degradieren das Thema fälschlicherweise zu Zufall oder Irrelevanz.'
      },
      {
        id: 'dyn_' + Date.now() + '_2',
        question: 'Welcher typische Denkfehler oder Fallstrick tritt bei Einsteigern in „' + cleanName + '“ am häufigsten auf?',
        options: [
          'Sich zu schnell in unwichtigen Rand-Details zu verlieren, anstatt zuerst die wichtigsten 20% der Grundlagen (Pareto-Prinzip) zu meistern.',
          'Zu viel Wasser während der Lernphase zu trinken.',
          'Das Thema ausschließlich mit analogen Notizen auf Papier zu strukturieren.',
          'Zu viele Fragen an erfahrene Experten zu stellen.'
        ],
        correct: 0,
        explanation: 'Der häufigste Fehler bei ' + cleanName + ' ist "Majoring in minor things": Man verbringt 80% der Zeit mit Nischen-Konfigurationen, anstatt die tragenden Kernkonzepte zu verinnerlichen.',
        mnemonic: '💡 Merksatz: „Pareto anwenden: Die ersten 20% Kernwissen bringen 80% Verständnis.“',
        pitfall: 'Option A beschreibt den universellen kognitiven Engpass bei neuen Lernfeldern.'
      },
      {
        id: 'dyn_' + Date.now() + '_3',
        question: 'Wie lässt sich das Wissen über „' + cleanName + '“ am effektivsten im Alltag verankern (Feynman-Methode)?',
        options: [
          'Indem man das Konzept so einfach erklärt, dass es ein 10-jähriges Kind ohne Fachchinesisch verstehen würde.',
          'Indem man das Lehrbuch 10-mal hintereinander stumm durchliest ohne Notizen.',
          'Indem man alle Fachbegriffe auswendig lernt, ohne die Zusammenhänge zu begreifen.',
          'Indem man niemals praktische Übungen durchführt.'
        ],
        correct: 0,
        explanation: 'Die Feynman-Technik deckt Wissenslücken schonungslos auf: Wer ein Konzept von ' + cleanName + ' nicht in einfachen Worten erklären kann, hat es noch nicht tief verstanden.',
        mnemonic: '💡 Merksatz: „Einfachheit ist das Siegel der Wahrheit.“ — Erkläre es einem Laien.',
        pitfall: 'Option B (passives Wiederlesen) erzeugt eine trügerische Illusion von Kompetenz.'
      },
      {
        id: 'dyn_' + Date.now() + '_4',
        question: 'Welcher Ansatz führt bei der praktischen Anwendung von „' + cleanName + '“ zu langfristigem Meistergrad?',
        options: [
          'Deliberate Practice (Gezieltes Üben an der eigenen Leistungsgrenze mit sofortigem Feedback und Fehleranalyse).',
          'Reine Wiederholung von Dingen, die man ohnehin schon perfekt beherrscht.',
          'Das Vermeiden jeglicher Herausforderungen und Tests.',
          'Ausschließlicher Konsum von passiven Video-Tutorials ohne eigene Umsetzung.'
        ],
        correct: 0,
        explanation: 'Nach Anders Ericsson entsteht Spitzenleistung in ' + cleanName + ' durch Deliberate Practice: Man sucht gezielt die Bereiche auf, in denen man noch Fehler macht, und korrigiert sie unmittelbar.',
        mnemonic: '💡 Merksatz: „Übe dort, wo es hakt — nicht dort, wo es glänzt.“',
        pitfall: 'Passiver Konsum trainiert das Wiedererkennen, nicht die aktive Problemlösungskompetenz.'
      },
      {
        id: 'dyn_' + Date.now() + '_5',
        question: 'Wie reagiert ein kompetenter Experte, wenn bei „' + cleanName + '“ unerwartete Widersprüche oder Probleme auftauchen?',
        options: [
          'Er wendet First-Principles-Denken an: Zerlegt das Problem in seine elementaren Grundwahrheiten und baut die Lösung von unten neu auf.',
          'Er ignoriert die Daten und beharrt stur auf seiner ursprünglichen Meinung.',
          'Er bricht das gesamte Projekt sofort frustriert ab.',
          'Er schiebt die Schuld ausschließlich auf externe Werkzeuge.'
        ],
        correct: 0,
        explanation: 'First Principles (Erste Prinzipien): Anstatt nach Analogie („Das haben wir schon immer so gemacht“) zu verfahren, fragt man: Was wissen wir über ' + cleanName + ' mit absoluter Sicherheit?',
        mnemonic: '💡 Merksatz: „Vom Fundament her denken, nicht von der Konvention.“',
        pitfall: 'Option A beschreibt die wissenschaftliche Denkweise, die echte Innovation ermöglicht.'
      }
    ];
  }

  // --------------------------------------------------------------------------
  // 5. SESSION & CONTROLLER ACTIONS
  // --------------------------------------------------------------------------
  function openLearningHubModal(customTopic = null) {
    loadLearningStorage();
    const modal = document.getElementById('modal-learning-hub');
    if (!modal) return;

    if (customTopic) {
      startLearningSessionWithTopic(customTopic);
    } else if (activeLearningSession.questions.length === 0) {
      selectLearningPack('adhd_neuro');
    } else {
      renderLearningSessionUI();
    }

    modal.classList.remove('hidden');
    renderLucideIcons();
  }

  function closeLearningHubModal() {
    const modal = document.getElementById('modal-learning-hub');
    if (modal) modal.classList.add('hidden');
  }

  function switchLearningMode(mode) {
    currentLearningMode = mode;
    isFlashcardFlipped = false;
    renderLearningSessionUI();
    if (typeof playProceduralSound === 'function') playProceduralSound(0);
  }

  function flipFlashcard() {
    isFlashcardFlipped = !isFlashcardFlipped;
    renderLearningSessionUI();
    if (typeof playProceduralSound === 'function') playProceduralSound(6);
  }

  function selectLearningPack(packId) {
    const allPacks = getAllPacks();
    if (allPacks[packId]) {
      const pack = allPacks[packId];
      activeLearningSession = {
        packId: packId,
        customTopic: null,
        questions: [...pack.questions],
        currentIndex: 0,
        score: 0,
        xpEarned: 0,
        answers: {},
        bookmarked: {},
        notes: {},
        isFinished: false,
        startTime: Date.now(),
        mistakesArchive: activeLearningSession.mistakesArchive || []
      };
      isFlashcardFlipped = false;
      renderLearningSessionUI();
    }
  }

  function startLearningSessionWithTopic(topicName) {
    const topic = (topicName || '').trim();
    if (!topic) return;

    const questions = generateDynamicQuestionsForTopic(topic);
    activeLearningSession = {
      packId: 'custom',
      customTopic: topic,
      questions: questions,
      currentIndex: 0,
      score: 0,
      xpEarned: 0,
      answers: {},
      bookmarked: {},
      notes: {},
      isFinished: false,
      startTime: Date.now(),
      mistakesArchive: activeLearningSession.mistakesArchive || []
    };
    isFlashcardFlipped = false;
    renderLearningSessionUI();
  }

  function handleCustomTopicSubmit() {
    const input = document.getElementById('learning-custom-topic-input') || document.getElementById('dash-learning-custom-topic-input');
    if (!input || !input.value.trim()) return;
    startLearningSessionWithTopic(input.value.trim());
    input.value = '';
  }

  function handleSelectAnswer(optionIndex) {
    if (activeLearningSession.isFinished) return;
    const currentQ = activeLearningSession.questions[activeLearningSession.currentIndex];
    if (!currentQ) return;

    if (activeLearningSession.answers[currentQ.id] !== undefined) return;

    const isCorrect = optionIndex === currentQ.correct;
    activeLearningSession.answers[currentQ.id] = {
      selected: optionIndex,
      isCorrect: isCorrect,
      timestamp: Date.now()
    };

    if (isCorrect) {
      activeLearningSession.score++;
      activeLearningSession.xpEarned += 15;
      rateQuestionSR(currentQ.id, 'good');
      if (typeof window.playCheerfulSuccessJingle === 'function') window.playCheerfulSuccessJingle();
      if (typeof window.triggerHapticFeedback === 'function') window.triggerHapticFeedback([20, 30, 20]);
      if (typeof window.addGamificationXP === 'function') window.addGamificationXP(15, 'Lern-Quiz');
    } else {
      rateQuestionSR(currentQ.id, 'again');
      if (typeof window.triggerHapticFeedback === 'function') window.triggerHapticFeedback([40]);
      if (!activeLearningSession.mistakesArchive.some(m => m.id === currentQ.id)) {
        activeLearningSession.mistakesArchive.push(currentQ);
        saveLearningStorage();
      }
    }

    renderLearningSessionUI();
  }

  function nextLearningQuestion() {
    isFlashcardFlipped = false;
    if (activeLearningSession.currentIndex < activeLearningSession.questions.length - 1) {
      activeLearningSession.currentIndex++;
      renderLearningSessionUI();
    } else {
      finishLearningSession();
    }
  }

  function prevLearningQuestion() {
    isFlashcardFlipped = false;
    if (activeLearningSession.currentIndex > 0) {
      activeLearningSession.currentIndex--;
      renderLearningSessionUI();
    }
  }

  function toggleBookmarkCurrentQuestion() {
    const currentQ = activeLearningSession.questions[activeLearningSession.currentIndex];
    if (!currentQ) return;
    activeLearningSession.bookmarked[currentQ.id] = !activeLearningSession.bookmarked[currentQ.id];
    renderLearningSessionUI();
  }

  function startMistakesReviewSession() {
    if (activeLearningSession.mistakesArchive.length === 0) {
      if (typeof showToast === 'function') showToast('Keine offenen Fehler zum Wiederholen vorhanden! 🎉');
      return;
    }

    activeLearningSession = {
      packId: 'mistakes_review',
      customTopic: 'Fehler-Wiederholung (Spaced Recall)',
      questions: [...activeLearningSession.mistakesArchive],
      currentIndex: 0,
      score: 0,
      xpEarned: 0,
      answers: {},
      bookmarked: {},
      notes: {},
      isFinished: false,
      startTime: Date.now(),
      mistakesArchive: activeLearningSession.mistakesArchive
    };
    isFlashcardFlipped = false;
    renderLearningSessionUI();
  }

  function finishLearningSession() {
    activeLearningSession.isFinished = true;
    renderLearningSessionUI();
    if (typeof showToast === 'function') {
      showToast('🏆 Lern-Session abgeschlossen: +' + activeLearningSession.xpEarned + ' XP!');
    }
  }

  function restartCurrentPack() {
    if (activeLearningSession.customTopic) {
      startLearningSessionWithTopic(activeLearningSession.customTopic);
    } else {
      selectLearningPack(activeLearningSession.packId || 'adhd_neuro');
    }
  }

  function speakQuestionAloud() {
    const currentQ = activeLearningSession.questions[activeLearningSession.currentIndex];
    if (!currentQ) return;
    const textToSpeak = isFlashcardFlipped
      ? (currentQ.explanation + ' ' + (currentQ.mnemonic || ''))
      : currentQ.question;

    if (typeof speakWithProfile === 'function') {
      speakWithProfile(textToSpeak, 'mentor');
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined') {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'de-DE';
      window.speechSynthesis.speak(utterance);
    }
  }

  function createCustomDeck(title, desc, questions) {
    if (!title || !Array.isArray(questions) || questions.length === 0) return false;
    loadLearningStorage();
    const id = 'custom_deck_' + Date.now();
    customPacksStorage[id] = {
      id,
      title,
      icon: '✨',
      color: 'amber',
      desc: desc || 'Eigenes Wissens-Set',
      level: 'Individuell',
      questions
    };
    saveLearningStorage();
    selectLearningPack(id);
    if (typeof showToast === 'function') showToast(`📦 Neues Deck "${title}" erfolgreich gespeichert!`);
    return id;
  }

  // --------------------------------------------------------------------------
  // 6. UI BUILDER (QUIZ, 3D FLASHCARDS, DECKS & LEITNER OVERVIEW)
  // --------------------------------------------------------------------------
  function renderLearningSessionUI() {
    const containers = [
      document.getElementById('learning-hub-content'),
      document.getElementById('dash-learning-hub-content')
    ].filter(Boolean);

    if (containers.length === 0) return;

    const totalQ = activeLearningSession.questions.length || 1;
    const currentIdx = activeLearningSession.currentIndex;
    const currentQ = activeLearningSession.questions[currentIdx] || activeLearningSession.questions[0];
    const isFinished = activeLearningSession.isFinished;
    const srData = getSRData();

    const activeTabClasses = 'bg-gradient-to-r from-purple-600/40 via-pink-600/35 to-purple-600/40 text-white border-purple-400/80 shadow-[0_0_12px_rgba(168,85,247,0.35)] font-bold';
    const inactiveTabClasses = 'text-gray-400 hover:text-purple-200 border-transparent hover:bg-white/5 font-semibold';

    const allPacks = getAllPacks();
    let packsHtml = Object.values(allPacks).map(pack => {
      const isActive = activeLearningSession.packId === pack.id && !activeLearningSession.customTopic;
      return '<button onclick="LearningHubEngine.selectLearningPack(\'' + pack.id + '\')" class="px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ' +
        (isActive 
          ? 'bg-purple-500/30 text-white border border-purple-400 shadow-sm' 
          : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 border border-white/5') +
        '">' +
        '<span>' + (pack.icon || '📚') + '</span>' +
        '<span class="truncate max-w-[130px]">' + pack.title.split(',')[0] + '</span>' +
        '</button>';
    }).join('');

    const hasMistakes = activeLearningSession.mistakesArchive && activeLearningSession.mistakesArchive.length > 0;
    if (hasMistakes) {
      packsHtml += '<button onclick="LearningHubEngine.startMistakesReviewSession()" class="px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 cursor-pointer">' +
        '<span>🔁</span><span>Fehler (' + activeLearningSession.mistakesArchive.length + ')</span></button>';
    }

    let modeContent = '';

    // ========================================================================
    // TAB 1: INTERAKTIVES QUIZ
    // ========================================================================
    if (currentLearningMode === 'quiz') {
      if (isFinished) {
        const pct = Math.round((activeLearningSession.score / totalQ) * 100) || 0;
        let badgeEmoji = pct >= 80 ? '🌟 Meistergrad' : (pct >= 50 ? '🌱 Guter Fortschritt' : '📖 Wiederholung empfohlen');
        let badgeColor = pct >= 80 ? 'text-emerald-400' : (pct >= 50 ? 'text-amber-400' : 'text-rose-400');

        modeContent = '<div class="p-6 rounded-3xl bg-gradient-to-br from-[#161624] to-[#0d0d16] border border-purple-500/30 shadow-2xl text-center space-y-4">' +
          '<div class="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-3xl mx-auto shadow-inner">🏆</div>' +
          '<div>' +
            '<span class="text-xs font-mono font-bold uppercase tracking-wider ' + badgeColor + '">' + badgeEmoji + '</span>' +
            '<h3 class="text-xl font-black text-white font-display mt-1">Lern-Session erfolgreich!</h3>' +
            '<p class="text-xs text-gray-400 mt-0.5">Thema: <span class="text-purple-300 font-bold">' + (activeLearningSession.customTopic || allPacks[activeLearningSession.packId]?.title) + '</span></p>' +
          '</div>' +
          '<div class="grid grid-cols-3 gap-2 max-w-md mx-auto pt-1">' +
            '<div class="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10">' +
              '<div class="text-[10px] text-gray-400 font-mono">Ergebnis</div>' +
              '<div class="text-lg font-black text-white font-display">' + activeLearningSession.score + ' / ' + totalQ + '</div>' +
            '</div>' +
            '<div class="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10">' +
              '<div class="text-[10px] text-gray-400 font-mono">Genauigkeit</div>' +
              '<div class="text-lg font-black ' + badgeColor + ' font-display">' + pct + '%</div>' +
            '</div>' +
            '<div class="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10">' +
              '<div class="text-[10px] text-gray-400 font-mono">XP Bonus</div>' +
              '<div class="text-lg font-black text-amber-300 font-display">+' + activeLearningSession.xpEarned + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="flex flex-wrap items-center justify-center gap-2 pt-2">' +
            '<button onclick="LearningHubEngine.restartCurrentPack()" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-md flex items-center gap-1.5">' +
              '<i data-lucide="rotate-ccw" class="w-4 h-4"></i><span>Erneut üben</span>' +
            '</button>' +
            '<button onclick="LearningHubEngine.switchLearningMode(\'flashcard\')" class="px-4 py-2 rounded-xl bg-pink-600/40 hover:bg-pink-600/60 text-pink-200 border border-pink-500/40 text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5">' +
              '<span>🎴 Als Karteikarten wiederholen</span>' +
            '</button>' +
          '</div>' +
        '</div>';
      } else if (currentQ) {
        const answerState = activeLearningSession.answers[currentQ.id];
        const isAnswered = answerState !== undefined;
        const isBookmarked = activeLearningSession.bookmarked[currentQ.id];

        const optionsHtml = (currentQ.options || []).map((optText, optIdx) => {
          let btnStyle = 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-gray-200';
          let icon = '<span class="w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-gray-400 shrink-0">' + String.fromCharCode(65 + optIdx) + '</span>';

          if (isAnswered) {
            if (optIdx === currentQ.correct) {
              btnStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)] font-bold';
              icon = '<span class="w-5 h-5 rounded-lg bg-emerald-500 text-black flex items-center justify-center text-xs font-bold shrink-0">✓</span>';
            } else if (optIdx === answerState.selected && !answerState.isCorrect) {
              btnStyle = 'bg-rose-500/20 border-rose-400 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.2)] font-bold';
              icon = '<span class="w-5 h-5 rounded-lg bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0">✕</span>';
            } else {
              btnStyle = 'bg-black/40 border-white/5 text-gray-500 opacity-60';
            }
          }

          return '<button onclick="LearningHubEngine.handleSelectAnswer(' + optIdx + ')" ' + (isAnswered ? 'disabled' : '') + ' class="w-full p-3 rounded-2xl border ' + btnStyle + ' transition-all duration-200 text-left flex items-center gap-2.5 cursor-pointer active:scale-[0.99] text-xs sm:text-sm">' +
            icon + '<span class="flex-1 leading-snug">' + optText + '</span></button>';
        }).join('');

        let explanationHtml = '';
        if (isAnswered) {
          explanationHtml = '<div class="p-3.5 rounded-2xl ' + (answerState.isCorrect ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-rose-950/40 border-rose-500/40') + ' border space-y-2 animate-fade-in text-xs">' +
            '<div class="flex items-center justify-between font-bold">' +
              '<span class="' + (answerState.isCorrect ? 'text-emerald-300' : 'text-rose-300') + ' flex items-center gap-1.5 text-xs font-bold">' +
                (answerState.isCorrect ? '✨ Richtig gelöst!' : '💡 Erklärung & Kernwissen:') +
              '</span>' +
              '<button onclick="LearningHubEngine.speakQuestionAloud()" class="text-gray-400 hover:text-white text-[10px] flex items-center gap-1 cursor-pointer font-normal">🔊 Vorlesen</button>' +
            '</div>' +
            '<p class="text-gray-200 leading-relaxed text-[11.5px]">' + currentQ.explanation + '</p>' +
            (currentQ.mnemonic ? '<div class="p-2 bg-black/40 rounded-xl border border-white/10 text-amber-200 text-[11px] font-medium">' + currentQ.mnemonic + '</div>' : '') +
            (currentQ.pitfall ? '<div class="text-[10.5px] text-gray-400 italic">⚠️ Typischer Fehler: ' + currentQ.pitfall + '</div>' : '') +
          '</div>';
        }

        const progressPct = Math.round(((currentIdx + 1) / totalQ) * 100);

        modeContent = '<div class="space-y-3">' +
          '<div class="space-y-1">' +
            '<div class="flex items-center justify-between text-xs font-semibold text-gray-400">' +
              '<div class="flex items-center gap-2">' +
                '<span class="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold text-[10.5px]">Frage ' + (currentIdx + 1) + ' von ' + totalQ + '</span>' +
                '<span class="text-white font-bold truncate max-w-[200px] text-xs">' + (activeLearningSession.customTopic || allPacks[activeLearningSession.packId]?.title) + '</span>' +
              '</div>' +
              '<div class="flex items-center gap-2">' +
                '<button onclick="LearningHubEngine.speakQuestionAloud()" class="text-gray-400 hover:text-white p-1 cursor-pointer" title="Frage vorlesen">🔊</button>' +
                '<button onclick="LearningHubEngine.toggleBookmarkCurrentQuestion()" class="p-1 rounded-lg text-gray-400 hover:text-amber-300 transition cursor-pointer" title="' + (isBookmarked ? 'Lesezeichen entfernen' : 'Frage merken') + '">' +
                  '<i data-lucide="bookmark" class="w-3.5 h-3.5 ' + (isBookmarked ? 'fill-amber-400 text-amber-400' : '') + '"></i>' +
                '</button>' +
                '<span class="font-mono text-purple-300 font-bold text-xs">+' + activeLearningSession.xpEarned + ' XP</span>' +
              '</div>' +
            '</div>' +
            '<div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">' +
              '<div class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300" style="width: ' + progressPct + '%"></div>' +
            '</div>' +
          '</div>' +

          '<div class="p-4 rounded-3xl bg-gradient-to-br from-[#141420] to-[#0f0e18] border border-white/10 shadow-xl space-y-3">' +
            '<h3 class="text-xs sm:text-sm font-bold text-white leading-snug">' + currentQ.question + '</h3>' +
            '<div class="space-y-1.5 pt-0.5">' + optionsHtml + '</div>' +
            explanationHtml +
          '</div>' +

          '<div class="flex items-center justify-between pt-0.5">' +
            '<button onclick="LearningHubEngine.prevLearningQuestion()" ' + (currentIdx === 0 ? 'disabled' : '') + ' class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-gray-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer">' +
              '<i data-lucide="chevron-left" class="w-3.5 h-3.5"></i><span>Zurück</span>' +
            '</button>' +
            '<div class="flex items-center gap-2">' +
              (isAnswered 
                ? '<button onclick="LearningHubEngine.nextLearningQuestion()" class="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-md flex items-center gap-1">' +
                    '<span>' + (currentIdx === totalQ - 1 ? 'Auswertung 🏆' : 'Weiter') + '</span><i data-lucide="chevron-right" class="w-3.5 h-3.5"></i></button>'
                : '<span class="text-[10px] text-gray-400 italic">Antwort wählen...</span>') +
            '</div>' +
          '</div>' +
        '</div>';
      }
    }

    // ========================================================================
    // TAB 2: 3D KARTEIKARTEN (FLASHCARDS MIT SPACED REPETITION)
    // ========================================================================
    else if (currentLearningMode === 'flashcard') {
      const qEntry = srData[currentQ.id] || { box: 1, reps: 0 };
      const daysUntilReview = LEITNER_INTERVALS_DAYS[qEntry.box - 1] || 1;

      modeContent = '<div class="space-y-3 animate-fade-in">' +
        '<div class="flex items-center justify-between text-xs font-semibold text-gray-400">' +
          '<div class="flex items-center gap-2">' +
            '<span class="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono font-bold text-[10.5px]">Karte ' + (currentIdx + 1) + ' von ' + totalQ + '</span>' +
            '<span class="text-xs px-2 py-0.5 rounded-md bg-white/5 text-amber-300 border border-white/5 font-mono">📦 Box ' + qEntry.box + ' / 5</span>' +
          '</div>' +
          '<div class="flex items-center gap-2">' +
            '<button onclick="LearningHubEngine.speakQuestionAloud()" class="text-gray-400 hover:text-white p-1 cursor-pointer" title="Laut vorlesen">🔊 Vorlesen</button>' +
            '<button onclick="LearningHubEngine.toggleBookmarkCurrentQuestion()" class="p-1 rounded-lg text-gray-400 hover:text-amber-300 transition cursor-pointer">' +
              '<i data-lucide="bookmark" class="w-3.5 h-3.5 ' + (activeLearningSession.bookmarked[currentQ.id] ? 'fill-amber-400 text-amber-400' : '') + '"></i>' +
            '</button>' +
          '</div>' +
        '</div>' +

        '<!-- 3D Interactive Flashcard Card -->' +
        '<div onclick="LearningHubEngine.flipFlashcard()" class="min-h-[190px] p-5 rounded-3xl bg-gradient-to-br ' + (isFlashcardFlipped ? 'from-purple-950/50 via-[#151224] to-[#0e0d18] border-purple-500/40' : 'from-[#141422] to-[#0a0a10] border-white/15') + ' border shadow-2xl flex flex-col justify-between cursor-pointer transition-all duration-300 transform active:scale-[0.99] select-none">' +
          '<div>' +
            '<div class="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider ' + (isFlashcardFlipped ? 'text-pink-300' : 'text-gray-400') + ' mb-2">' +
              '<span>' + (isFlashcardFlipped ? 'Antwort & Erklärung (Rückseite)' : 'Frage / Konzept (Vorderseite)') + '</span>' +
              '<span>🔄 Klick zum Umdrehen</span>' +
            '</div>' +
            (isFlashcardFlipped ? (
              '<div class="space-y-2 text-xs leading-relaxed text-gray-100">' +
                '<p class="font-medium">' + currentQ.explanation + '</p>' +
                (currentQ.mnemonic ? '<div class="p-2 bg-black/50 rounded-xl border border-amber-500/30 text-amber-200 text-[11px] font-medium">' + currentQ.mnemonic + '</div>' : '') +
              '</div>'
            ) : (
              '<div class="text-sm sm:text-base font-bold text-white leading-relaxed pt-2">' + currentQ.question + '</div>'
            )) +
          '</div>' +
          '<div class="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500">' +
            '<span>' + (allPacks[activeLearningSession.packId]?.title || 'Lernkarten') + '</span>' +
            '<span>Wiederholungen: ' + (qEntry.reps || 0) + '</span>' +
          '</div>' +
        '</div>' +

        '<!-- Leitner Rating Action Buttons -->' +
        (isFlashcardFlipped ? (
          '<div class="space-y-1.5 animate-fade-in">' +
            '<div class="text-[9px] font-bold uppercase tracking-wider text-gray-400 text-center">Wie gut wusstest du die Antwort?</div>' +
            '<div class="grid grid-cols-3 gap-2">' +
              '<button onclick="LearningHubEngine.rateQuestionSR(\'' + currentQ.id + '\', \'again\'); LearningHubEngine.nextLearningQuestion();" class="py-2 px-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex flex-col items-center cursor-pointer shadow-sm">' +
                '<span>🔴 Nochmal</span>' +
                '<span class="text-[9px] opacity-75 font-normal">Box 1 (1 Tag)</span>' +
              '</button>' +
              '<button onclick="LearningHubEngine.rateQuestionSR(\'' + currentQ.id + '\', \'good\'); LearningHubEngine.nextLearningQuestion();" class="py-2 px-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex flex-col items-center cursor-pointer shadow-sm">' +
                '<span>🟡 Gut</span>' +
                '<span class="text-[9px] opacity-75 font-normal">+1 Box (' + daysUntilReview + 'T)</span>' +
              '</button>' +
              '<button onclick="LearningHubEngine.rateQuestionSR(\'' + currentQ.id + '\', \'master\'); LearningHubEngine.nextLearningQuestion();" class="py-2 px-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex flex-col items-center cursor-pointer shadow-sm">' +
                '<span>🟢 Gemastert</span>' +
                '<span class="text-[9px] opacity-75 font-normal">Box 5 (30 Tage)</span>' +
              '</button>' +
            '</div>' +
          '</div>'
        ) : (
          '<div class="flex items-center justify-between pt-1">' +
            '<button onclick="LearningHubEngine.prevLearningQuestion()" ' + (currentIdx === 0 ? 'disabled' : '') + ' class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-gray-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer">' +
              '<i data-lucide="chevron-left" class="w-3.5 h-3.5"></i><span>Vorige Karte</span>' +
            '</button>' +
            '<button onclick="LearningHubEngine.flipFlashcard()" class="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center gap-1">' +
              '<span>Antwort aufdecken 🔄</span>' +
            '</button>' +
            '<button onclick="LearningHubEngine.nextLearningQuestion()" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer">' +
              '<span>Nächste</span><i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>' +
            '</button>' +
          '</div>'
        )) +
      '</div>';
    }

    // ========================================================================
    // TAB 3: DECKS & LEITNER-BOXEN ÜBERSICHT
    // ========================================================================
    else if (currentLearningMode === 'decks') {
      let boxCounts = [0, 0, 0, 0, 0];
      let totalReviewed = 0;
      Object.values(srData).forEach(entry => {
        const b = (entry.box >= 1 && entry.box <= 5) ? entry.box : 1;
        boxCounts[b - 1]++;
        totalReviewed++;
      });

      modeContent = '<div class="space-y-4 animate-fade-in">' +
        '<!-- Leitner Mastery Box Distribution -->' +
        '<div class="p-3.5 rounded-2xl bg-[#0d0d16] border border-white/10 space-y-2.5">' +
          '<div class="flex items-center justify-between text-xs font-bold text-gray-200">' +
            '<span>🧠 Leitner-Boxen Lernfortschritt</span>' +
            '<span class="text-purple-300 font-mono text-[11px]">' + totalReviewed + ' Karten im System</span>' +
          '</div>' +
          '<div class="grid grid-cols-5 gap-1.5 text-center text-xs font-mono">' +
            [1, 2, 3, 4, 5].map(b => `
              <div class="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                <div class="text-[9px] text-gray-400">Box ${b}</div>
                <div class="font-bold text-white">${boxCounts[b - 1]}</div>
                <div class="text-[8.5px] text-gray-500">${LEITNER_INTERVALS_DAYS[b - 1]}T</div>
              </div>
            `).join('') +
          '</div>' +
        '</div>' +

        '<!-- Decks Library -->' +
        '<div class="space-y-2">' +
          '<div class="text-xs font-bold text-gray-300">📚 Verfügbare Decks (' + Object.keys(allPacks).length + ')</div>' +
          '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">' +
            Object.values(allPacks).map(pack => `
              <div onclick="LearningHubEngine.selectLearningPack('${pack.id}'); LearningHubEngine.switchLearningMode('quiz');" class="p-2.5 rounded-2xl border ${activeLearningSession.packId === pack.id ? 'border-purple-500/60 bg-purple-950/20' : 'border-white/5 bg-white/[0.02] hover:border-purple-500/30'} transition cursor-pointer flex flex-col justify-between gap-1 group">
                <div class="flex items-start justify-between gap-1">
                  <div class="font-bold text-xs text-white group-hover:text-purple-300 truncate">${pack.icon || '📚'} ${pack.title}</div>
                  <span class="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 shrink-0 font-mono">${pack.questions.length} Karten</span>
                </div>
                <div class="text-[10px] text-gray-400 line-clamp-1">${pack.desc || ''}</div>
              </div>
            `).join('') +
          '</div>' +
        '</div>' +
      '</div>';
    }

    // Modal / Container Shell
    const shellHtml = '<div class="space-y-3.5 text-left">' +
      '<!-- 3-TAB SUB-NAVIGATION -->' +
      '<div class="flex items-center bg-black/60 p-1 rounded-2xl border border-white/10 text-xs gap-1 shadow-sm select-none">' +
        '<button onclick="LearningHubEngine.switchLearningMode(\'quiz\')" class="flex-1 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 text-xs cursor-pointer border ' + (currentLearningMode === 'quiz' ? activeTabClasses : inactiveTabClasses) + '">' +
          '<span>🎯</span><span>Quiz & Test</span>' +
        '</button>' +
        '<button onclick="LearningHubEngine.switchLearningMode(\'flashcard\')" class="flex-1 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 text-xs cursor-pointer border ' + (currentLearningMode === 'flashcard' ? activeTabClasses : inactiveTabClasses) + '">' +
          '<span>🎴</span><span>3D Karteikarten</span>' +
        '</button>' +
        '<button onclick="LearningHubEngine.switchLearningMode(\'decks\')" class="flex-1 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 text-xs cursor-pointer border ' + (currentLearningMode === 'decks' ? activeTabClasses : inactiveTabClasses) + '">' +
          '<span>📦</span><span>Decks & Leitner</span>' +
        '</button>' +
      '</div>' +

      '<!-- Packs Quick Bar & Dynamic Topic Creator -->' +
      '<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">' +
        '<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">' + packsHtml + '</div>' +
        '<div class="flex items-center gap-1.5 shrink-0">' +
          '<input type="text" id="learning-custom-topic-input" placeholder="Neues Thema eingeben..." class="px-2.5 py-1 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-purple-400 w-36 sm:w-44" onkeydown="if(event.key===\'Enter\') LearningHubEngine.handleCustomTopicSubmit()">' +
          '<button onclick="LearningHubEngine.handleCustomTopicSubmit()" class="px-2.5 py-1 bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 border border-purple-400/50 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1" title="Generieren">' +
            '<i data-lucide="lightbulb" class="w-3.5 h-3.5"></i><span>Generieren</span>' +
          '</button>' +
        '</div>' +
      '</div>' +

      '<!-- MAIN MODE CONTENT -->' +
      modeContent +
    '</div>';

    containers.forEach(c => {
      c.innerHTML = shellHtml;
    });

    renderLucideIcons();
  }

  function renderLucideIcons() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  // --------------------------------------------------------------------------
  // 7. GLOBAL EXPORTS
  // --------------------------------------------------------------------------
  const LearningHubEngine = {
    openLearningHubModal,
    closeLearningHubModal,
    selectLearningPack,
    startLearningSessionWithTopic,
    handleCustomTopicSubmit,
    handleSelectAnswer,
    nextLearningQuestion,
    prevLearningQuestion,
    toggleBookmarkCurrentQuestion,
    startMistakesReviewSession,
    restartCurrentPack,
    generateDynamicQuestionsForTopic,
    renderLearningSessionUI,
    switchLearningMode,
    flipFlashcard,
    rateQuestionSR,
    speakQuestionAloud,
    createCustomDeck,
    CURATED_LEARNING_PACKS,
    getSession: () => activeLearningSession
  };

  if (typeof window !== 'undefined') {
    window.LearningHubEngine = LearningHubEngine;
    window.openLearningHubModal = openLearningHubModal;
    window.closeLearningHubModal = closeLearningHubModal;
    window.CURATED_LEARNING_PACKS = CURATED_LEARNING_PACKS;
    window.generateDynamicQuestionsForTopic = generateDynamicQuestionsForTopic;
    window.selectLearningPack = selectLearningPack;
    window.startLearningSessionWithTopic = startLearningSessionWithTopic;
    window.renderLearningHub = renderLearningSessionUI;
    window.rateQuestionSR = rateQuestionSR;
    window.getSRData = getSRData;
    window.renderLearningSessionUI = renderLearningSessionUI;
    window.activeLearningSession = activeLearningSession;
    window.customPacksStorage = customPacksStorage;
    window.switchLearningMode = switchLearningMode;
    window.flipFlashcard = flipFlashcard;
    window.createCustomDeck = createCustomDeck;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.LearningHubEngine = LearningHubEngine;
    globalThis.openLearningHubModal = openLearningHubModal;
    globalThis.closeLearningHubModal = closeLearningHubModal;
    globalThis.CURATED_LEARNING_PACKS = CURATED_LEARNING_PACKS;
    globalThis.generateDynamicQuestionsForTopic = generateDynamicQuestionsForTopic;
    globalThis.selectLearningPack = selectLearningPack;
    globalThis.startLearningSessionWithTopic = startLearningSessionWithTopic;
    globalThis.renderLearningHub = renderLearningSessionUI;
    globalThis.renderLearningSessionUI = renderLearningSessionUI;
    globalThis.activeLearningSession = activeLearningSession;
    globalThis.rateQuestionSR = rateQuestionSR;
    globalThis.getSRData = getSRData;
    globalThis.switchLearningMode = switchLearningMode;
    globalThis.flipFlashcard = flipFlashcard;
    globalThis.createCustomDeck = createCustomDeck;
  }
})();
