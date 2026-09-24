
  // ============================================================================
  // SPACED REPETITION & LEITNER BOX SYSTEM
  // ============================================================================
  const SR_STORAGE_KEY = 'noodle_flashcards_sr_v1';

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
    // rating: 'again' (Box 1), 'good' (Box +1), 'master' (Box 5)
    const data = getSRData();
    const entry = data[questionId] || { box: 1, streak: 0, lastReview: Date.now() };

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
    entry.lastReview = Date.now();
    data[questionId] = entry;
    saveSRData(data);

    if (typeof showToast === 'function') {
      showToast(`🧠 Leitner-Box: Stufe ${entry.box} / 5 gespeichert!`);
    }
    renderLearningSessionUI();
  }

// helper-learning.js: Deep Learning & Intelligent Quiz Engine
// 100% Serverless, Offline-first, Adaptive Active Recall & Deep Knowledge Synthesis
// Supports curated packs, dynamic custom topic synthesis, deep explanations & spaced repetition.

(function() {
  'use strict';

  // ============================================================================
  // 1. DATA: CURATED DEEP KNOWLEDGE PACKS
  // ============================================================================

  const CURATED_LEARNING_PACKS = {
    adhd_neuro: {
      id: 'adhd_neuro',
      title: 'ADHS, Dopamin & Neurobiologie',
      icon: '🧠',
      color: 'purple',
      desc: 'Exekutive Funktionen, Dopamin-Regulation, Reizfilter & Hyperfokus',
      level: 'Praxis & Wissenschaft',
      questions: [
        {
          id: 'adhd_1',
          question: 'Warum fällt Menschen mit ADHS der Start einer Aufgabe oft schwer, selbst wenn sie die Aufgabe erledigen wollen?',
          options: [
            'Wegen mangelnder Disziplin und fehlender Willenskraft.',
            'Durch eine veränderte Dopamin-Wiederaufnahme im präfrontalen Kortex, die eine höhere Aktivierungsschwelle (Interest-based Nervous System) erfordert.',
            'Weil das Kurzzeitgedächtnis bei ADHS grundsätzlich keine Aufgaben speichern kann.',
            'Aufgrund eines chronisch überhöhten Serotoninspiegels, der passive Lethargie erzeugt.'
          ],
          correct: 1,
          explanation: 'Das ADHS-Gehirn arbeitet mit einem „Interest-based Nervous System“: Die Dopamin-Transporter pumpen Dopamin im synaptischen Spalt zu schnell zurück. Ohne echtes Interesse, Dringlichkeit, Neuheit oder Herausforderung fehlt die biochemische Zündung.',
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
          explanation: 'ADHS-Gehirne erleben Zeit oft nicht als kontinuierliches Band, sondern binär: Entweder etwas passiert JETZT (und erfordert sofortige Aufmerksamkeit) oder es ist NICHT JETZT (und verschwindet aus dem Arbeitsfokus). Sichtbare Countdown-Timer machen Zeit physisch greifbar.',
          mnemonic: '💡 Merksatz: „Mach Zeit sichtbar.“ — Visuelle Balken & Sanduhren überbrücken die Zeitblindheit.',
          pitfall: 'Option C beschreibt reines Daten-Vergessen, nicht das fehlende lineare Zeitgefühl während des Tuns.'
        },
        {
          id: 'adhd_3',
          question: 'Was ist „Body Doubling“ und warum reduziert es Prokrastination signifikant?',
          options: [
            'Das Auslagern von Aufgaben an einen Doppelgänger oder Assistenten.',
            'Die physische oder virtuelle Anwesenheit einer anderen arbeitenden Person, die als sozialer Anker und externer Fokus-Stabilisator dient.',
            'Das gleichzeitige Ausführen von zwei Aufgaben mit beiden Händen.',
            'Eine psychologische Abspaltung bei Überlastung.'
          ],
          correct: 1,
          explanation: 'Body Doubling nutzt die Spiegelneuronen und den sozialen Bezugsrahmen. Die ruhige Anwesenheit einer anderen Person (ohne Einmischung) signalisiert dem Nervensystem: „Wir sind im Arbeitsmodus“, was den inneren Widerstand senkt.',
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
          explanation: 'ADHS ist kein genereller Mangel an Aufmerksamkeit, sondern eine Dysregulation. Wenn eine Tätigkeit fasziniert, schüttet das Belohnungssystem kontinuierlich Dopamin aus, was zu stundenlanger tiefer Versenkung ohne Ermüdungsgefühl führt.',
          mnemonic: '💡 Merksatz: „Aufmerksamkeits-Flutlicht statt Scheinwerfer.“ — Hyperfokus kanalisiert Energie maximal.',
          pitfall: 'Option A ist falsch: Hyperfokus lässt sich bei uninteressanten Pflichtaufgaben eben nicht einfach erzwingen.'
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
          explanation: 'Jede getroffene Entscheidung verbraucht Glukose und neuronale Ressourcen im präfrontalen Kortex. Durch feste Start-Rituale („Automatisierung der Banalitäten“) bleibt die geistige Frische für die eigentlichen Kernaufgaben erhalten.',
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
          explanation: 'Prof. Kleitman entdeckte: Wie im REM-Schlaf pulsiert auch unsere Wach-Aufmerksamkeit in 90-Minuten-Zyklen. Danach sinkt die neuronale Signalstärke; eine 15-minütige echte Pause lädt die Neurotransmitter wieder auf.',
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
          explanation: 'Koffein ist ein Antagonist: Es besetzt die Adenosin-Rezeptoren wie ein falscher Schlüssel im Schloss. Das Gehirn spürt die Müdigkeit nicht, während sich im Hintergrund immer mehr Adenosin anstaut. Lässt das Koffein nach, flutet das aufgestaute Adenosin die Rezeptoren (Koffein-Absturz).',
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
          explanation: 'Forschung von Dr. Andrew Huberman zeigt: NSDR senkt die Herzfrequenzvariabilität, schaltet das Gehirn in Theta-Wellen und beschleunigt das Abspeichern kurz zuvor gelernter Fähigkeiten um ein Vielfaches.',
          mnemonic: '💡 Merksatz: „Lernen geschieht im Tun, Festigung geschieht in der Ruhe.“ — 15 Min. NSDR ersetzen Stunden.',
          pitfall: 'Option C ist falsch: NSDR ist eine reine physiologische Atem- und Körper-Technik, keine Chemie.'
        }
      ]
    },
    stoicism_mental_models: {
      id: 'stoicism_mental_models',
      title: 'Stoizismus & Denkmodelle',
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
          explanation: 'Epiktet lehrte im Enchiridion: Seelenruhe (Ataraxie) entsteht, indem man 100% seiner Energie auf die eigenen Entscheidungen und Haltungen fokussiert, während man externe Umstände und Resultate gelassen annimmt.',
          mnemonic: '💡 Merksatz: „Fokus auf den Bogen, nicht auf den Wind.“ — Kontrolliere den Schuss, akzeptiere das Ziel.',
          pitfall: 'Option C ist der klassische Mythos über Stoizismus; Stoiker unterdrücken Gefühle nicht, sondern bewerten Reize weise.'
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
          explanation: '„Invert, always invert“: Anstatt zu fragen „Wie werde ich erfolgreich?“, fragt man „Was garantiert mein Scheitern?“ (z. B. Schlafmangel, Unzuverlässigkeit, Impulsivität). Das systematische Vermeiden von Dummheit ist oft leichter als Genialität.',
          mnemonic: '💡 Merksatz: „Vermeide die Klippe, statt fliegen zu lernen.“ — Vermeidung von Fehlern schlägt Heldentum.',
          pitfall: 'Option C (reines Toxic Positivity) blendet Risiken aus, während Inversion Risiken präventiv entschärft.'
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
          explanation: 'Ockhams Rasiermesser schneidet unnötige Spekulationen ab. Wenn jemand nicht sofort antwortet, ist die einfachste Erklärung „beschäftigt oder vergessen“, nicht eine absurde Verschwörung.',
          mnemonic: '💡 Merksatz: „Schneide den Spekulations-Ballast ab.“ — Die sparsamste Annahme gewinnt.',
          pitfall: 'Option D ist ein Denkfehler: Komplexität wird oft fälschlicherweise mit Weisheit verwechselt.'
        },
        {
          id: 'stoic_4',
          question: 'Was meint das Prinzip „Amor Fati“ (Liebe zum Schicksal)?',
          options: [
            'Schicksalsschläge nur mit Zähneknirschen zu ertragen.',
            'Jedes Ereignis – auch Rückschläge und Hindernisse – nicht nur zu tolerieren, sondern als notwendiges Material für persönliches Wachstum und Charakter zu umarmen.',
            'Fatalismus: Man glaubt, dass alles vorherbestimmt ist und nichts geändert werden kann.',
            'Die Liebe zu romantischen Geschichten.'
          ],
          correct: 1,
          explanation: 'Von Nietzsche geprägt und bei Marc Aurel verankert: „Das Hindernis für die Handlung fördert die Handlung. Was im Weg steht, wird zum Weg.“ Rückschläge sind Übungsfelder für Geduld, Mut und Kreativität.',
          mnemonic: '💡 Merksatz: „Hindernisse sind Brennstoff.“ — Das Feuer verbrennt nicht am Holz, es wächst daran.',
          pitfall: 'Option C beschreibt passiven Fatalismus, während Amor Fati aktive, freudige Gestaltungskraft ist.'
        },
        {
          id: 'stoic_5',
          question: 'Was besagt „Hanlons Rasiermesser“ (Hanlon’s Razor)?',
          options: [
            'Schreibe niemals der Bosheit zu, was durch Unwissenheit oder Gedankenlosigkeit hinreichend erklärt werden kann.',
            'Wer zuerst kommt, mahlt zuerst.',
            'Jeder Mensch handelt immer aus egoistischen Motiven.',
            'Man sollte niemals mit Fremden sprechen.'
          ],
          correct: 0,
          explanation: 'Menschen machen Fehler aus Hektik, Übermüdung oder Stress – selten aus böser Absicht gegen uns. Diese Heuristik verhindert unnötige Paranoia, Groll und verletzte Gefühle im Alltag.',
          mnemonic: '💡 Merksatz: „Verzeihe Hektik, vermute nicht Bosheit.“ — Schont Nerven und Beziehungen.',
          pitfall: 'Option C unterstellt universelle Bosheit/Egoismus – genau das Gegenteil von Hanlons Prinzip.'
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
          explanation: 'Nach jeder Ausführung einer synchronen Task leert die JS-Engine die gesamte Microtask-Queue (Promises, queueMicrotask, MutationObserver). Erst danach wird der nächste Macrotask (setTimeout, setInterval, I/O) aus der Task-Queue entnommen.',
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
          explanation: 'Ein idempotent ausgelegter Endpunkt (z. B. DELETE /item/123 oder PUT /user/profile) ändert den Zustand beim 2. oder 10. Aufruf nicht weiter. POST ist typischerweise nicht idempotent (erzeugt mehrfache Ressourcen).',
          mnemonic: '💡 Merksatz: „Lichtschalter AN: 1x oder 10x drücken = Licht bleibt AN.“',
          pitfall: 'Option D beschreibt Latenz/Performance, nicht das mathematische Konzept der Zustandskonsistenz.'
        },
        {
          id: 'code_3',
          question: 'Welches Sicherheitsrisiko wird durch konsequentes HTML-Entity-Escaping und DOMPurify bei Nutzereingaben verhindert?',
          options: [
            'Distributed Denial of Service (DDoS)',
            'Cross-Site Scripting (XSS), bei dem bösartiger JavaScript-Code in den Browser anderer Nutzer injiziert wird.',
            'SQL-Injection im Backend.',
            'Physischer Festplattendefekt auf dem Server.'
          ],
          correct: 1,
          explanation: 'Wenn rohe Benutzereingaben unescaped via innerHTML ins DOM gerendert werden, kann ein Angreifer script-Tags oder onload/onerror-Attribute einschleusen und Session-Tokens abgreifen.',
          mnemonic: '💡 Merksatz: „Traue keinem User-Input: Erst desinfizieren, dann rendern.“',
          pitfall: 'Option C (SQL Injection) betrifft Datenbankabfragen im Backend, nicht das clientseitige Browser-DOM.'
        },
        {
          id: 'code_4',
          question: 'Wofür steht das „Single Responsibility Principle“ (SRP) in den SOLID-Prinzipien?',
          options: [
            'Jedes Programm darf nur von einem einzigen Entwickler geschrieben werden.',
            'Ein Modul oder eine Klasse sollte genau einen wohl definierten Grund haben, sich zu ändern (eine einzige Verantwortlichkeit).',
            'Alle Funktionen müssen in einer einzigen Datei liegen.',
            'Es darf pro Server nur ein CPU-Kern genutzt werden.'
          ],
          correct: 1,
          explanation: 'SRP verhindert monströse "God Objects". Wenn eine Klasse gleichzeitig UI rendert, Netzwerk-Requests sendet und Daten speichert, führt jede Änderung an einem Teil zu Seiteneffekten im gesamten System.',
          mnemonic: '💡 Merksatz: „Ein Werkzeug, eine Aufgabe.“ — Trenne Datenlogik von Darstellung.',
          pitfall: 'Option C ist das Gegenteil von modularer Architektur.'
        },
        {
          id: 'code_5',
          question: 'Was ist der Hauptvorteil von zustandslosen (stateless) Client-Architekturen mit LocalStorage & P2P gegenüber serverbasierten Sessions?',
          options: [
            'Keine Serverkosten, 100% Datenschutz (Zero-Data-Retention auf Fremdservern) und vollkommene Offline-Resilienz.',
            'Dass Daten automatisch im gesamten Internet öffentlich sichtbar sind.',
            'Dass JavaScript nicht mehr kompiliert werden muss.',
            'Dass Bilder eine höhere Auflösung erhalten.'
          ],
          correct: 0,
          explanation: 'Local-First-Apps arbeiten unabhängig von Server-Verfügbarkeiten. Daten bleiben auf dem Gerät des Nutzers, Latenzen sind 0 ms und die App funktioniert im Flugzeug ebenso wie in abgelegenen Regionen.',
          mnemonic: '💡 Merksatz: „Local-First = Dein Gerät ist die primäre Quelle der Wahrheit.“',
          pitfall: 'Option B ist falsch: Lokale Speicherung schützt Privatsphäre maximal, statt Daten zu veröffentlichen.'
        }
      ]
    },

    science_universe: {
      id: 'science_universe',
      title: 'Kosmos, Quanten & Naturwissenschaften',
      icon: '🌌',
      color: 'indigo',
      desc: 'Quantenmechanik, Entropie, Relativität & biologische Systeme',
      level: 'Wissenschaft & Natur',
      questions: [
        {
          id: 'sci_1',
          question: 'Was beschreibt der 2. Hauptsatz der Thermodynamik (Entropiesatz) für geschlossene Systeme?',
          options: [
            'Energie kann aus dem Nichts erschaffen werden.',
            'Die Entropie (das Maß für Unordnung bzw. mikroskopische Zustandsvielfalt) nimmt in einem isolierten System spontan niemals ab, sondern strebt ein Maximum an.',
            'Kälte fließt von selbst in heißere Körper über.',
            'Die Lichtgeschwindigkeit verdoppelt sich bei sinkender Temperatur.'
          ],
          correct: 1,
          explanation: 'Der 2. Hauptsatz erklärt den Zeitpfeil: Wärme fließt nur von warm nach kalt, ein zerbrochenes Glas setzt sich nicht von selbst zusammen. Ordnung aufrechtzuerhalten erfordert immer kontinuierliche Energiezufuhr (z. B. Aufräumen, biologisches Leben).',
          mnemonic: '💡 Merksatz: „Ordnung braucht Energie — Unordnung passiert von allein.“',
          pitfall: 'Option A widerspricht dem 1. Hauptsatz (Energieerhaltungssatz).'
        },
        {
          id: 'sci_2',
          question: 'Was besagt die Heisenbergsche Unschärferelation in der Quantenphysik?',
          options: [
            'Dass Wissenschaftler ungenaue Messgeräte benutzen.',
            'Dass zwei komplementäre Eigenschaften eines Teilchens (wie Ort und Impuls) prinzipiell nicht gleichzeitig beliebig genau bestimmt werden können.',
            'Dass alle physikalischen Gesetze reine Schätzungen sind.',
            'Dass Atome größer sind als Planeten.'
          ],
          correct: 1,
          explanation: 'Die Unschärfe ist keine technische Messungenauigkeit, sondern eine fundamentale Welle-Teilchen-Natur der Realität. Je exakter der Ort eines Elektrons eingegrenzt wird, desto unbestimmter wird sein Impuls.',
          mnemonic: '💡 Merksatz: „Je schärfer der Ort, desto unschärfer die Bewegung.“',
          pitfall: 'Option A verwechselt fundamentale Quanten-Grenzen mit fehlerhaften Messinstrumenten.'
        },
        {
          id: 'sci_3',
          question: 'Wie erklärt Einsteins Allgemeine Relativitätstheorie das Phänomen der Gravitation?',
          options: [
            'Masse und Energie krümmen die vierdimensionale Raumzeit; Körper folgen lediglich den geradesten Linien (Geodäten) in diesem gekrümmten Raum.',
            'Als unsichtbare Seile, die zwischen Planeten gespannt sind.',
            'Durch magnetische Abstoßung im Vakuum.',
            'Durch die Reibung der Planeten an der Atmosphäre des Alls.'
          ],
          correct: 0,
          explanation: '„Die Materie sagt dem Raum, wie er sich krümmen soll; der Raum sagt der Materie, wie sie sich bewegen soll.“ (John Wheeler). Licht wird in der Nähe schwerer Sterne abgelenkt, weil der Raum selbst gekrümmt ist.',
          mnemonic: '💡 Merksatz: „Masse dellt das Raum-Gewebe ein.“ — Gravitation ist Geometrie.',
          pitfall: 'Option B & C sind überholte oder physikalisch unhaltbare Vorstellungen.'
        },
        {
          id: 'sci_4',
          question: 'Warum ist die Zell-Autophagie (Nobelpreis 2016) für die Langlebigkeit so entscheidend?',
          options: [
            'Weil sie neue Fettzellen produziert.',
            'Weil die Zelle beschädigte Proteine, defekte Zellorganellen und Abfallstoffe recycelt und als Bausteine für Erneuerung nutzt.',
            'Weil sie das Herz schneller schlagen lässt.',
            'Weil sie das Schlafen überflüssig macht.'
          ],
          correct: 1,
          explanation: 'Autophagie ist die körpereigene Müllabfuhr. Bei Fastenphasen oder Bewegung schaltet die Zelle auf Selbstreinigung um: Toxische Protein-Plaques und alte Mitochondrien werden enzymatisch zerlegt.',
          mnemonic: '💡 Merksatz: „Zelluläres Recycling statt Müllhalde.“ — Fasten stößt den Hausputz der Zellen an.',
          pitfall: 'Option A beschreibt Fettaufbau, das Gegenteil des metabolischen Schalters der Autophagie.'
        },
        {
          id: 'sci_5',
          question: 'Was ist „Quantenverschränkung“ (Quantum Entanglement)?',
          options: [
            'Das Verknoten von Kabeln hinter dem Schreibtisch.',
            'Ein Zustand, bei dem zwei Teilchen so gekoppelt sind, dass die Messung des Zustands des einen instantan den Zustand des anderen bestimmt — unabhängig von der Distanz.',
            'Eine chemische Bindung zwischen Wasserstoff und Sauerstoff.',
            'Die Gravitationsanziehung der Erde auf den Mond.'
          ],
          correct: 1,
          explanation: 'Einstein nannte es „spukhafte Fernwirkung“. Zwei verschränkte Photonen bilden ein gemeinsames quantenmechanisches System. Wird der Spin von Teilchen A gemessen, steht der von Teilchen B im selben Augenblick fest.',
          mnemonic: '💡 Merksatz: „Zwei Seiten derselben Münze, auch Lichtjahre voneinander entfernt.“',
          pitfall: 'Option C beschreibt kovalente chemische Bindungen, keine Quantenverschränkung.'
        }
      ]
    },

    financial_intelligence: {
      id: 'financial_intelligence',
      title: 'Finanzen & Verhaltensökonomik',
      icon: '📈',
      color: 'emerald',
      desc: 'Zinseszins, 72er-Regel, Sunk-Cost-Falle & Risikomanagement',
      level: 'Wirtschaft & Wohlstand',
      questions: [
        {
          id: 'fin_1',
          question: 'Wie funktioniert die „72er-Regel“ zur schnellen Berechnung von Zinseszins-Verdopplungen?',
          options: [
            'Man teilt 72 durch den jährlichen Zinssatz in Prozent — das Ergebnis ist die ungefähre Anzahl der Jahre bis zur Verdopplung des Kapitals.',
            'Man muss 72 Jahre lang sparen, um Millionär zu werden.',
            'Man multipliziert das Einkommen mit 72.',
            'Man darf maximal 72 Euro pro Monat ausgeben.'
          ],
          correct: 0,
          explanation: 'Bei 7% Rendite verdoppelt sich das Geld in ca. 72 / 7 ≈ 10,3 Jahren. Bei 10% Zinsen in nur 7,2 Jahren. Dies veranschaulicht die gewaltige Hebelkraft des Zinseszins-Effekts über die Zeit.',
          mnemonic: '💡 Merksatz: „72 / Rendite = Verdopplungsjahre.“ — Schnelle mentale Mathematik für Geld.',
          pitfall: 'Option B ignoriert Zinssätze und mathematische Exponentialfunktionen.'
        },
        {
          id: 'fin_2',
          question: 'Was beschreibt die „Sunk Cost Fallacy“ (Versunkene-Kosten-Falle)?',
          options: [
            'Dass Schiffe auf dem Meeresgrund an Wert verlieren.',
            'Die Tendenz, an einem verlustreichen Vorhaben festzuhalten, nur weil man bereits viel Zeit, Geld oder Mühe investiert hat — obwohl die Zukunftsaussichten negativ sind.',
            'Das automatische Sparen von Cent-Beträgen.',
            'Eine Steuerbefreiung für gemeinnützige Vereine.'
          ],
          correct: 1,
          explanation: 'Bereits ausgegebenes Geld oder vergangene Zeit sind verloren und können nicht zurückgeholt werden („sunk“). Rationale Entscheidungen müssen ausschließlich zukünftige Kosten und zukünftigen Nutzen bewerten.',
          mnemonic: '💡 Merksatz: „Gutes Geld nicht schlechtem hinterherwerfen.“ — Vergangene Kosten sind vergangen.',
          pitfall: 'Option A nimmt die Redewendung wortwörtlich statt als psychologischen Fehlschluss.'
        },
        {
          id: 'fin_3',
          question: 'Was ist der primäre Zweck eines „Notgroschens“ (Emergency Fund von 3-6 Monatsausgaben)?',
          options: [
            'Möglichst hohe spekulative Kursgewinne an der Börse erzielen.',
            'Psychologische Ruhe und finanzielle Resilienz, um bei plötzlichen Reparaturen oder Jobwechseln nicht zu teuren Konsumkrediten oder Notverkäufen gezwungen zu sein.',
            'Um am Jahresende Luxusartikel zu kaufen.',
            'Damit die Bank Gebühren erlassen kann.'
          ],
          correct: 1,
          explanation: 'Ein Notgroschen ist keine Rendite-Anlage, sondern eine emotionale und finanzielle Versicherung. Er schützt das langfristige Investitions-Depot davor, in Markttiefs panisch liquidiert werden zu müssen.',
          mnemonic: '💡 Merksatz: „Liquidität kauft Seelenruhe.“ — Sicherheit geht vor Rendite.',
          pitfall: 'Option A verwechselt Notfall-Liquidität auf dem Tagesgeld mit spekulativem Risikokapital.'
        }
      ]
    }
  };

  // ============================================================================
  // 2. STATE & GENERATOR ENGINE
  // ============================================================================

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
      const savedCustom = localStorage.getItem('flow_learning_custom_packs');
      if (savedCustom) customPacksStorage = JSON.parse(savedCustom);

      const savedMistakes = localStorage.getItem('flow_learning_mistakes');
      if (savedMistakes) activeLearningSession.mistakesArchive = JSON.parse(savedMistakes);
    } catch (e) {
      console.warn('[LearningHub] Storage load error:', e);
    }
  }

  function saveLearningStorage() {
    try {
      localStorage.setItem('flow_learning_custom_packs', JSON.stringify(customPacksStorage));
      localStorage.setItem('flow_learning_mistakes', JSON.stringify(activeLearningSession.mistakesArchive));
    } catch (e) {
      console.warn('[LearningHub] Storage save error:', e);
    }
  }

  // ============================================================================
  // 3. DYNAMIC QUESTION SYNTHESIZER FOR ANY CUSTOM TOPIC
  // ============================================================================

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
        pitfall: 'Option B (passives Wiederlesen) erzeugt eine trügerische Illusion von Kompetenz (Fluency Illusion).'
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
        pitfall: 'Passiver Konsum (Option D) trainiert das Wiedererkennen, nicht die aktive Problemlösungskompetenz.'
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

  // ============================================================================
  // 4. MODAL CONTROLLER & UI RENDERING
  // ============================================================================

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

  function selectLearningPack(packId) {
    if (CURATED_LEARNING_PACKS[packId]) {
      const pack = CURATED_LEARNING_PACKS[packId];
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
      if (typeof window.playCheerfulSuccessJingle === 'function') window.playCheerfulSuccessJingle();
      if (typeof window.triggerHapticFeedback === 'function') window.triggerHapticFeedback([20, 30, 20]);
      if (typeof window.addGamificationXP === 'function') window.addGamificationXP(15, 'Lern-Quiz');
    } else {
      if (typeof window.triggerHapticFeedback === 'function') window.triggerHapticFeedback([40]);
      if (!activeLearningSession.mistakesArchive.some(m => m.id === currentQ.id)) {
        activeLearningSession.mistakesArchive.push(currentQ);
        saveLearningStorage();
      }
    }

    renderLearningSessionUI();
  }

  function nextLearningQuestion() {
    if (activeLearningSession.currentIndex < activeLearningSession.questions.length - 1) {
      activeLearningSession.currentIndex++;
      renderLearningSessionUI();
    } else {
      finishLearningSession();
    }
  }

  function prevLearningQuestion() {
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

  function transferLearnedTopicToBoard() {
    const title = activeLearningSession.customTopic 
      ? '🧠 Wissens-Wiederholung: ' + activeLearningSession.customTopic 
      : '🧠 Vertiefung: ' + (CURATED_LEARNING_PACKS[activeLearningSession.packId]?.title || 'Lernsession');

    const curState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : null);
    if (!curState || !curState.items) return;

    const cat = curState.items.weekly ? 'weekly' : 'daily';
    if (!curState.items[cat]) curState.items[cat] = [];

    const nowISO = new Date().toISOString();
    curState.items[cat].push({
      id: 'learn_' + Date.now(),
      task: title,
      createdAt: nowISO,
      updatedAt: nowISO
    });

    if (typeof saveState === 'function') saveState();
    if (typeof renderApp === 'function') renderApp();
    if (typeof showToast === 'function') showToast('✨ Aufgabe ins Board übernommen!');
  }

  // ============================================================================
  // 5. HTML UI BUILDER (FOR MODAL AND EMBEDDED DASHBOARD VIEW)
  // ============================================================================

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

    let packsHtml = Object.values(CURATED_LEARNING_PACKS).map(pack => {
      const isActive = activeLearningSession.packId === pack.id && !activeLearningSession.customTopic;
      return '<button onclick="LearningHubEngine.selectLearningPack(\'' + pack.id + '\')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ' +
        (isActive 
          ? 'bg-purple-500/30 text-white border border-purple-400 shadow-sm' 
          : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 border border-white/5') +
        '">' +
        '<span>' + pack.icon + '</span>' +
        '<span class="truncate max-w-[140px]">' + pack.title.split(',')[0] + '</span>' +
        '</button>';
    }).join('');

    const hasMistakes = activeLearningSession.mistakesArchive && activeLearningSession.mistakesArchive.length > 0;
    if (hasMistakes) {
      packsHtml += '<button onclick="LearningHubEngine.startMistakesReviewSession()" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 cursor-pointer">' +
        '<span>🔁</span><span>Fehler (' + activeLearningSession.mistakesArchive.length + ')</span></button>';
    }

    let innerContent = '';

    if (isFinished) {
      const pct = Math.round((activeLearningSession.score / totalQ) * 100) || 0;
      let badgeEmoji = pct >= 80 ? '🌟 Meistergrad' : (pct >= 50 ? '🌱 Guter Fortschritt' : '📖 Wiederholung empfohlen');
      let badgeColor = pct >= 80 ? 'text-emerald-400' : (pct >= 50 ? 'text-amber-400' : 'text-rose-400');

      innerContent = '<div class="space-y-5 animate-fade-in text-left">' +
        '<div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">' + packsHtml + '</div>' +
        '<div class="p-6 rounded-3xl bg-gradient-to-br from-[#161624] to-[#0d0d16] border border-purple-500/30 shadow-2xl text-center space-y-4">' +
          '<div class="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-3xl mx-auto shadow-inner">🏆</div>' +
          '<div>' +
            '<span class="text-xs font-mono font-bold uppercase tracking-wider ' + badgeColor + '">' + badgeEmoji + '</span>' +
            '<h3 class="text-2xl font-black text-white font-display mt-1">Lern-Session erfolgreich!</h3>' +
            '<p class="text-xs text-gray-400 mt-0.5">Thema: <span class="text-purple-300 font-bold">' + (activeLearningSession.customTopic || CURATED_LEARNING_PACKS[activeLearningSession.packId]?.title) + '</span></p>' +
          '</div>' +
          '<div class="grid grid-cols-3 gap-2.5 max-w-md mx-auto pt-2">' +
            '<div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10">' +
              '<div class="text-[10px] text-gray-400 font-mono">Ergebnis</div>' +
              '<div class="text-xl font-black text-white font-display">' + activeLearningSession.score + ' / ' + totalQ + '</div>' +
            '</div>' +
            '<div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10">' +
              '<div class="text-[10px] text-gray-400 font-mono">Genauigkeit</div>' +
              '<div class="text-xl font-black ' + badgeColor + ' font-display">' + pct + '%</div>' +
            '</div>' +
            '<div class="p-3 rounded-2xl bg-white/[0.03] border border-white/10">' +
              '<div class="text-[10px] text-gray-400 font-mono">XP Bonus</div>' +
              '<div class="text-xl font-black text-amber-300 font-display">+' + activeLearningSession.xpEarned + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="flex flex-wrap items-center justify-center gap-2 pt-3">' +
            '<button onclick="LearningHubEngine.restartCurrentPack()" class="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-purple-900/30 flex items-center gap-1.5">' +
              '<i data-lucide="rotate-ccw" class="w-4 h-4"></i><span>Erneut üben</span>' +
            '</button>' +
            '<button onclick="LearningHubEngine.transferLearnedTopicToBoard()" class="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5">' +
              '<i data-lucide="plus" class="w-4 h-4"></i><span>Als Wiederholungs-Task ins Board</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    } else if (currentQ) {
      const answerState = activeLearningSession.answers[currentQ.id];
      const isAnswered = answerState !== undefined;
      const isBookmarked = activeLearningSession.bookmarked[currentQ.id];

      const optionsHtml = currentQ.options.map((optText, optIdx) => {
        let btnStyle = 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-gray-200';
        let icon = '<span class="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-gray-400 shrink-0">' + String.fromCharCode(65 + optIdx) + '</span>';

        if (isAnswered) {
          if (optIdx === currentQ.correct) {
            btnStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)] font-bold';
            icon = '<span class="w-6 h-6 rounded-lg bg-emerald-500 text-black flex items-center justify-center text-xs font-bold shrink-0">✓</span>';
          } else if (optIdx === answerState.selected && !answerState.isCorrect) {
            btnStyle = 'bg-rose-500/20 border-rose-400 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.2)] font-bold';
            icon = '<span class="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0">✕</span>';
          } else {
            btnStyle = 'bg-black/40 border-white/5 text-gray-500 opacity-60';
          }
        }

        return '<button onclick="LearningHubEngine.handleSelectAnswer(' + optIdx + ')" ' + (isAnswered ? 'disabled' : '') + ' class="w-full p-3.5 rounded-2xl border ' + btnStyle + ' transition-all duration-200 text-left flex items-center gap-3 cursor-pointer active:scale-[0.99] text-xs sm:text-sm">' +
          icon + '<span class="flex-1 leading-snug">' + optText + '</span></button>';
      }).join('');

      let explanationHtml = '';
      if (isAnswered) {
        explanationHtml = '<div class="p-4 rounded-2xl ' + (answerState.isCorrect ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-rose-950/40 border-rose-500/40') + ' border space-y-2.5 animate-fade-in text-xs">' +
          '<div class="flex items-center justify-between font-bold">' +
            '<span class="' + (answerState.isCorrect ? 'text-emerald-300' : 'text-rose-300') + ' flex items-center gap-1.5 text-sm">' +
              (answerState.isCorrect ? '✨ Exzellent! Richtig verstanden.' : '💡 Erkenntnisgewinn & Erklärung:') +
            '</span>' +
            '<span class="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">Active Recall</span>' +
          '</div>' +
          '<p class="text-gray-200 leading-relaxed">' + currentQ.explanation + '</p>' +
          (currentQ.mnemonic ? '<div class="p-2.5 bg-black/40 rounded-xl border border-white/10 text-amber-200 font-medium">' + currentQ.mnemonic + '</div>' : '') +
          (currentQ.pitfall ? '<div class="text-[11px] text-gray-400 italic">⚠️ Typischer Fehler: ' + currentQ.pitfall + '</div>' : '') +
          '<div class="pt-2 border-t border-white/10 flex items-center justify-between gap-1.5 flex-wrap">' +
            '<span class="text-[10px] text-gray-400 font-mono">🧠 Spaced Repetition (Leitner):</span>' +
            '<div class="flex items-center gap-1">' +
              '<button onclick="rateQuestionSR(\'' + currentQ.id + '\', \'again\')" class="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold transition cursor-pointer">Wiederholen (Box 1)</button>' +
              '<button onclick="rateQuestionSR(\'' + currentQ.id + '\', \'good\')" class="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition cursor-pointer">Gut (+1)</button>' +
              '<button onclick="rateQuestionSR(\'' + currentQ.id + '\', \'master\')" class="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition cursor-pointer">Meisterhaft (Box 5)</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }

      const progressPct = Math.round(((currentIdx + 1) / totalQ) * 100);

      innerContent = '<div class="space-y-4 animate-fade-in text-left">' +
        '<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-white/10 pb-3">' +
          '<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">' + packsHtml + '</div>' +
          '<div class="flex items-center gap-1.5 shrink-0">' +
            '<input type="text" id="learning-custom-topic-input" placeholder="Beliebiges Thema..." class="px-2.5 py-1.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-purple-400 w-36 sm:w-44" onkeydown="if(event.key===\'Enter\') LearningHubEngine.handleCustomTopicSubmit()">' +
            '<button onclick="LearningHubEngine.handleCustomTopicSubmit()" class="px-2.5 py-1.5 bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 border border-purple-400/50 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1" title="Neues Thema generieren">' +
              '<i data-lucide="sparkles" class="w-3.5 h-3.5"></i><span>Quiz</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="space-y-1.5">' +
          '<div class="flex items-center justify-between text-xs font-semibold text-gray-400">' +
            '<div class="flex items-center gap-2">' +
              '<span class="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold text-[11px]">Frage ' + (currentIdx + 1) + ' von ' + totalQ + '</span>' +
              '<span class="text-white font-bold truncate max-w-[200px]">' + (activeLearningSession.customTopic || CURATED_LEARNING_PACKS[activeLearningSession.packId]?.title) + '</span>' +
            '</div>' +
            '<div class="flex items-center gap-2">' +
              '<button onclick="LearningHubEngine.toggleBookmarkCurrentQuestion()" class="p-1 rounded-lg text-gray-400 hover:text-amber-300 transition cursor-pointer" title="' + (isBookmarked ? 'Lesezeichen entfernen' : 'Frage merken') + '">' +
                '<i data-lucide="bookmark" class="w-4 h-4 ' + (isBookmarked ? 'fill-amber-400 text-amber-400' : '') + '"></i>' +
              '</button>' +
              '<span class="font-mono text-purple-300 font-bold">' + activeLearningSession.score + ' Punkte (+' + activeLearningSession.xpEarned + ' XP)</span>' +
            '</div>' +
          '</div>' +
          '<div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">' +
            '<div class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300" style="width: ' + progressPct + '%"></div>' +
          '</div>' +
        '</div>' +
        '<div class="p-5 rounded-3xl bg-gradient-to-br from-[#141420] to-[#0f0e18] border border-white/10 shadow-xl space-y-4">' +
          '<h3 class="text-sm sm:text-base font-bold text-white leading-snug">' + currentQ.question + '</h3>' +
          '<div class="space-y-2 pt-1">' + optionsHtml + '</div>' +
          explanationHtml +
        '</div>' +
        '<div class="flex items-center justify-between pt-1">' +
          '<button onclick="LearningHubEngine.prevLearningQuestion()" ' + (currentIdx === 0 ? 'disabled' : '') + ' class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-gray-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">' +
            '<i data-lucide="chevron-left" class="w-4 h-4"></i><span>Zurück</span>' +
          '</button>' +
          '<div class="flex items-center gap-2">' +
            (isAnswered 
              ? '<button onclick="LearningHubEngine.nextLearningQuestion()" class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-purple-900/30 flex items-center gap-1.5">' +
                  '<span>' + (currentIdx === totalQ - 1 ? 'Auswertung anzeigen 🏆' : 'Nächste Frage') + '</span><i data-lucide="chevron-right" class="w-4 h-4"></i></button>'
              : '<span class="text-[11px] text-gray-400 italic">Wähle eine Antwort für die Erklärung...</span>') +
          '</div>' +
        '</div>' +
      '</div>';
    }

    containers.forEach(c => {
      c.innerHTML = innerContent;
    });

    renderLucideIcons();
  }

  function renderLucideIcons() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  // ============================================================================
  // 6. GLOBAL EXPORT
  // ============================================================================

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
    transferLearnedTopicToBoard,
    generateDynamicQuestionsForTopic,
    renderLearningSessionUI,
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
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.LearningHubEngine = LearningHubEngine;
    globalThis.openLearningHubModal = openLearningHubModal;
    globalThis.closeLearningHubModal = closeLearningHubModal;
  }

})();
