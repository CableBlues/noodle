/**
 * @file helper-clarity.js
 * @module ClarityAndImpulseControl
 * @description
 * Modul zur Impulskontrolle, Selbstregulation und Reflexion (`#clarity-modal`).
 * Bietet einen interaktiven 90-Sekunden-Urge-Surfing-Timer, Streak-Tracking,
 * persönliche Motivationsgründe sowie ein lokal gespeichertes Reflexions-Journal.
 */

let clarityUrgeInterval = null;
let clarityUrgeSecondsLeft = 90;
let clarityUrgeTotalSeconds = 90;
let clarityUrgeRunning = false;

function getClarityState() {
  if (!state.clarity) {
    state.clarity = {
      streakDays: 0,
      lastCheckinDate: null,
      history: [],
      savedReasons: [],
      journalEntries: []
    };
  }
  if (!Array.isArray(state.clarity.savedReasons)) state.clarity.savedReasons = [];
  if (!Array.isArray(state.clarity.journalEntries)) state.clarity.journalEntries = [];
  return state.clarity;
}

function openClarityModal() {
  const modal = document.getElementById('clarity-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  switchClarityTab('urge');
  updateClarityStreakUI();
  renderClarityJournalList();
  renderClarityReasonsList();
  if (typeof playProceduralSound === 'function') playProceduralSound(0);
  if (typeof renderLucideIcons === 'function') renderLucideIcons();
}

function closeClarityModal() {
  const modal = document.getElementById('clarity-modal');
  if (modal) modal.classList.add('hidden');
  stopClarityUrgeTimer();
}

function switchClarityTab(tabName) {
  const tabs = ['urge', 'halt', 'shift', 'future', 'tracker'];
  tabs.forEach(t => {
    const pane = document.getElementById('clarity-pane-' + t);
    const btn = document.getElementById('clarity-tab-' + t);
    if (pane) {
      if (t === tabName) pane.classList.remove('hidden');
      else pane.classList.add('hidden');
    }
    if (btn) {
      if (t === tabName) {
        btn.classList.add('bg-teal-500/20', 'text-teal-300', 'border-teal-500/40');
        btn.classList.remove('text-gray-400', 'border-transparent');
      } else {
        btn.classList.remove('bg-teal-500/20', 'text-teal-300', 'border-teal-500/40');
        btn.classList.add('text-gray-400', 'border-transparent');
      }
    }
  });

  if (tabName === 'tracker') {
    updateClarityStreakUI();
    renderClarityJournalList();
  } else if (tabName === 'future') {
    renderClarityReasonsList();
  }
  if (typeof renderLucideIcons === 'function') renderLucideIcons();
}

// ============================================================================
// MODUL 1: URGE SURFING (90-SEKUNDEN WELLE & SOMATISCHE REGULATION)
// ============================================================================

const URGE_PHRASES = {
  de: [
    'Nimm den Impuls wahr, ohne zu kämpfen. Du bist der weite Himmel, nicht das vorüberziehende Wetter.',
    'Lass deine Schultern sinken und löse sanft deinen Kiefer. Du bist in diesem Moment vollkommen sicher.',
    'Atme ruhig in den Bauch: 4 Sekunden ein, 2 Sekunden sanft halten, 6 Sekunden langsam aus.',
    'Der Scheitelpunkt der biochemischen Welle zieht vorüber. Reize dauern selten länger als 90 Sekunden.',
    'Spüre deine Füße fest auf dem Boden. Du triffst die Entscheidung – nicht der flüchtige Reiz.',
    'Fast geschafft. Spüre, wie sich die Anspannung wie Nebel in der Morgensonne auflöst.'
  ],
  en: [
    'Notice the urge without fighting. You are the vast sky, not the passing weather.',
    'Drop your shoulders and unclench your jaw. You are safe in this present moment.',
    'Breathe into your belly: 4 seconds in, hold for 2, out slowly for 6.',
    'The peak of the biochemical wave is passing. Urges rarely last longer than 90 seconds.',
    'Feel your feet grounded on the floor. You hold the pen to your choices.',
    'Almost there. Feel the tension naturally melting away like morning mist.'
  ],
  fr: [
    'Observe l envie sans lutter. Tu es le ciel infini, pas le nuage qui passe.',
    'Relâche tes épaules et desserre la mâchoire. Tu es en sécurité ici et maintenant.',
    'Respire calmement : 4s d inspiration, 2s de pause, 6s d expiration lente.',
    'Le pic s estompe. Une impulsion neurochimique dure rarement plus de 90 secondes.',
    'Ressens tes pieds sur le sol. Tu restes le seul maître de tes décisions.',
    'Presque terminé. Ressens la tension qui s évapore naturellement.'
  ],
  it: [
    'Osserva l impulso senza combattere. Tu sei il cielo, non la nuvola che passa.',
    'Abbassa le spalle e rilassa la mascella. Sei al sicuro in questo momento.',
    'Respira nella pancia : 4s dentro, 2s trattieni, 6s espira lentamente.',
    'Il picco sta passando. Gli impulsi raramente durano più di 90 secondi.',
    'Senti i piedi ben saldi a terra. Sei tu a guidare le tue scelte.',
    'Quasi fatto. Senti la tensione che si scioglie dolcemente.'
  ],
  es: [
    'Observa el impulso sin luchar. Eres el cielo inmenso, no la nube pasajera.',
    'Baja los hombros y suelta la mandíbula. Estás a salvo en este momento.',
    'Respira hacia el abdomen : 4s dentro, 2s mantén, 6s exhala despacio.',
    'El pico está pasando. Los impulsos rara vez duran más de 90 segundos.',
    'Siente tus pies firmes en el suelo. Tú tienes el control de tus elecciones.',
    'Casi terminado. Siente cómo la tensión se disuelve por completo.'
  ],
  el: [
    'Παρατήρησε την παρόρμηση χωρίς πάλη. Είσαι ο ουρανός, όχι το σύννεφο.',
    'Χαλάρωσε τους ώμους και το σαγόνι. Είσαι απόλυτα ασφαλής στο τώρα.',
    'Ανάπνευσε ήρεμα : 4δ εισπνοή, 2δ κράτημα, 6δ αργή εκπνοή.',
    'Η κορύφωση περνά. Οι παρορμήσεις σπάνια διαρκούν πάνω από 90 δευτερόλεπτα.',
    'Νιώσε τα πόδια σου στο έδαφος. Εσύ επιλέγεις τη στάση σου.',
    'Σχεδόν τα κατάφερες. Νιώσε την ένταση να φεύγει γαλήνια.'
  ]
};

function toggleClarityUrgeTimer() {
  if (clarityUrgeRunning) {
    stopClarityUrgeTimer();
  } else {
    startClarityUrgeTimer();
  }
}

function startClarityUrgeTimer() {
  clarityUrgeRunning = true;
  clarityUrgeSecondsLeft = 90;
  clarityUrgeTotalSeconds = 90;

  const btn = document.getElementById('clarity-urge-toggle-btn');
  if (btn) {
    btn.innerHTML = '<i data-lucide="square" class="w-4 h-4"></i> <span>' + tr({ en: 'Pause Wave', de: 'Welle anhalten', fr: 'Arrêter la vague', it: 'Ferma onda', es: 'Detener ola', el: 'Διακοπή' }) + '</span>';
    btn.classList.add('bg-rose-500/20', 'text-rose-300', 'border-rose-500/40');
    btn.classList.remove('bg-teal-500', 'text-black');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  updateUrgeDisplay();

  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
  const phraseList = URGE_PHRASES[lang] || URGE_PHRASES.de;
  const initialText = phraseList[0];
  const phraseEl = document.getElementById('clarity-urge-phrase');
  if (phraseEl) phraseEl.innerText = initialText;

  if (typeof playProceduralSound === 'function') playProceduralSound(2);

  clearInterval(clarityUrgeInterval);
  clarityUrgeInterval = setInterval(() => {
    clarityUrgeSecondsLeft--;
    updateUrgeDisplay();

    if (clarityUrgeSecondsLeft % 15 === 0 && clarityUrgeSecondsLeft > 0) {
      const idx = Math.floor((90 - clarityUrgeSecondsLeft) / 15) % phraseList.length;
      const text = phraseList[idx];
      if (phraseEl) phraseEl.innerText = text;
      if (typeof playProceduralSound === 'function') playProceduralSound(0);
    }

    if (clarityUrgeSecondsLeft <= 0) {
      stopClarityUrgeTimer();
      onUrgeSurfingComplete();
    }
  }, 1000);
}

function stopClarityUrgeTimer() {
  clarityUrgeRunning = false;
  clearInterval(clarityUrgeInterval);
  const btn = document.getElementById('clarity-urge-toggle-btn');
  if (btn) {
    btn.innerHTML = '<i data-lucide="play" class="w-4 h-4"></i> <span>' + tr({ en: 'Ride the 90s Wave 🌊', de: '90s Welle reiten 🌊', fr: 'Surfer la vague 90s 🌊', it: 'Cavalca l onda di 90s 🌊', es: 'Surfear la ola de 90s 🌊', el: 'Δαμάστε το κύμα 90δ 🌊' }) + '</span>';
    btn.classList.remove('bg-rose-500/20', 'text-rose-300', 'border-rose-500/40');
    btn.classList.add('bg-teal-500', 'text-black');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function updateUrgeDisplay() {
  const timeEl = document.getElementById('clarity-urge-time');
  const barEl = document.getElementById('clarity-urge-bar');
  const breathEl = document.getElementById('clarity-urge-breath-guide');
  if (timeEl) {
    const mins = Math.floor(clarityUrgeSecondsLeft / 60);
    const secs = clarityUrgeSecondsLeft % 60;
    timeEl.innerText = mins + ':' + (secs < 10 ? '0' : '') + secs;
  }
  if (barEl) {
    const pct = ((clarityUrgeTotalSeconds - clarityUrgeSecondsLeft) / clarityUrgeTotalSeconds) * 100;
    barEl.style.width = pct + '%';
  }

  if (breathEl) {
    const cycle = (90 - clarityUrgeSecondsLeft) % 12;
    if (cycle < 4) {
      breathEl.innerText = tr({ en: '💨 Inhale softly through the nose (4s)...', de: '💨 Sanft durch die Nase einatmen (4s)...', fr: '💨 Inspire doucement par le nez (4s)...', it: '💨 Inspira dolcemente dal naso (4s)...', es: '💨 Inhala suave por la nariz (4s)...', el: '💨 Εισπνεύστε απαλά (4δ)...' });
      breathEl.className = 'text-xs font-bold text-teal-300 transition-colors';
    } else if (cycle < 6) {
      breathEl.innerText = tr({ en: '⏸️ Hold gently & relax the jaw (2s)...', de: '⏸️ Sanft halten & Kiefer lockern (2s)...', fr: '⏸️ Maintiens doucement & relâche (2s)...', it: '⏸️ Trattieni & rilassa il viso (2s)...', es: '⏸️ Mantén y relaja la mandíbula (2s)...', el: '⏸️ Κράτημα & χαλάρωση (2δ)...' });
      breathEl.className = 'text-xs font-bold text-cyan-300 transition-colors';
    } else {
      breathEl.innerText = tr({ en: '🌊 Exhale slowly & drop your shoulders (6s)...', de: '🌊 Langsam ausatmen & Schultern sinken lassen (6s)...', fr: '🌊 Expire lentement & baisse les épaules (6s)...', it: '🌊 Espira lentamente & rilassa le spalle (6s)...', es: '🌊 Exhala despacio y baja los hombros (6s)...', el: '🌊 Εκπνεύστε αργά (6δ)...' });
      breathEl.className = 'text-xs font-bold text-emerald-300 transition-colors';
    }
  }
}

function onUrgeSurfingComplete() {
  const phraseEl = document.getElementById('clarity-urge-phrase');
  const winMsg = tr({
    de: '🌱 Wundervoll gemeistert! Die biochemische Welle ist sanft abgeflaut. Du hast deinem Nervensystem Raum geschenkt und dich für Klarheit entschieden.',
    en: '🌱 Beautifully done! The biochemical wave has passed. You gave your nervous system room and chose clarity.',
    fr: '🌱 Magnifiquement surmonté ! La vague est passée. Tu as offert de l espace à ton esprit.',
    it: '🌱 Superato con successo! L onda è passata. Hai regalato spazio e chiarezza alla tua mente.',
    es: '🌱 ¡Superado con éxito! La ola ha pasado. Le diste espacio y claridad a tu mente.',
    el: '🌱 Εξαιρετικά! Το κύμα πέρασε. Χάρισες ηρεμία και διαύγεια στον εαυτό σου.'
  });
  if (phraseEl) {
    phraseEl.innerHTML = `
      <div class="space-y-2 text-center">
        <p class="text-xs text-teal-200 font-medium">${winMsg}</p>
        <div class="pt-2 flex justify-center">
          <button onclick="if(typeof startClarityMicroFocus === 'function') startClarityMicroFocus(10);" class="px-4 py-2 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-black font-black text-xs rounded-2xl shadow-xl transition cursor-pointer flex items-center gap-1.5 active:scale-95">
            <span>🚀 Jetzt mit 10m Micro-Focus starten</span>
          </button>
        </div>
      </div>
    `;
  }
  if (typeof playCheerfulSuccessJingle === 'function') playCheerfulSuccessJingle();
  if (typeof triggerCelebration === 'function') triggerCelebration();
  if (typeof addGamificationXP === 'function') addGamificationXP(50, 'Klarheits-Welle');
  
  showToast(tr({
    de: '90s Welle gemeistert! +50 XP Klarheit 🌟',
    en: 'Wave surmounted! +50 XP Clarity 🌟',
    fr: 'Vague surmontée ! +50 XP Clarté 🌟',
    it: 'Onda superata! +50 XP Chiarezza 🌟',
    es: '¡Ola superada! +50 XP Claridad 🌟',
    el: 'Το κύμα ξεπεράστηκε! +50 XP 🌟'
  }));
}

// ============================================================================
// MODUL 2: HALT+ BEDÜRFNIS-SPIEGEL
// ============================================================================

const HALT_DATA = {
  hungry: {
    icon: 'utensils',
    color: 'amber',
    title: { de: 'Körperliches Bedürfnis / Energieabfall', en: 'Physical Need / Energy Dip' },
    insight: {
      de: 'Wenn der Blutzucker sinkt oder der Körper dehydriert ist, sucht das Gehirn instinktiv nach schneller Belohnung. Dein Körper braucht schlicht echte Energie oder Flüssigkeit.',
      en: 'When blood sugar drops or dehydration sets in, the brain instinctively craves quick stimulation. Your body simply needs real nutrition or hydration.'
    },
    action: {
      de: '👉 Sanfte Sofort-Aktion: Trinke langsam ein großes Glas Wasser und iss eine Handvoll Nüsse, frisches Obst oder eine Kleinigkeit.',
      en: '👉 Gentle Action: Drink a large glass of water slowly and have a handful of nuts, fresh fruit, or a snack.'
    }
  },
  angry: {
    icon: 'flame',
    color: 'rose',
    title: { de: 'Innerer Druck / Frustration / Stress', en: 'Inner Pressure / Frustration / Stress' },
    insight: {
      de: 'Der Impuls dient oft als Fluchtventil vor innerer Anspannung oder Überforderung. Das Nervensystem will den Druck kurzfristig betäuben.',
      en: 'The impulse often acts as an escape valve to numb inner tension or overwhelm. The nervous system is seeking relief from pressure.'
    },
    action: {
      de: '👉 Sanfte Sofort-Aktion: Mache 3 bewusste „Physiologische Seufzer“ (2x tief durch die Nase ein, 1x lang aus) oder schüttle Arme & Beine aus.',
      en: '👉 Gentle Action: Take 3 physiological sighs (double inhale through nose, long exhale) or shake arms & legs for 30 seconds.'
    }
  },
  lonely: {
    icon: 'heart',
    color: 'purple',
    title: { de: 'Einsamkeit / Wunsch nach Verbundenheit', en: 'Loneliness / Need for Connection' },
    insight: {
      de: 'Dein Gehirn sehnt sich nach Wärme, Zuwendung oder Kontakt. Gewohnheits-Impulse täuschen diese menschliche Nähe nur künstlich vor.',
      en: 'Your brain is craving warmth, validation, or social contact. Habits only mimic this human connection artificially.'
    },
    action: {
      de: '👉 Sanfte Sofort-Aktion: Lege eine Hand auf dein Herz und spüre die Wärme, oder schicke einer lieben Person eine kurze herzliche Nachricht.',
      en: '👉 Gentle Action: Place a hand on your heart and feel the warmth, or send a short warm message to a loved one.'
    }
  },
  tired: {
    icon: 'moon',
    color: 'blue',
    title: { de: 'Mentale Erschöpfung / Reizüberflutung', en: 'Mental Exhaustion / Overstimulation' },
    insight: {
      de: 'Wenn der präfrontale Kortex ermüdet ist, sinkt die Selbstregulation. Dein Geist verlangt nicht nach mehr Reizen, sondern nach Stille und Pause.',
      en: 'When the prefrontal cortex is exhausted, self-regulation drops. Your mind does not need more stimulation, but true quiet rest.'
    },
    action: {
      de: '👉 Sanfte Sofort-Aktion: Schließe für 5 Minuten die Augen, blicke aus dem Fenster in die Ferne oder wasche dein Gesicht mit kaltem Wasser.',
      en: '👉 Gentle Action: Close your eyes for 5 minutes, gaze out of the window into the distance, or splash cool water on your face.'
    }
  },
  dopamine: {
    icon: 'zap',
    color: 'teal',
    title: { de: 'Reiz-Hunger & Rastlosigkeit', en: 'Restlessness & Novelty Craving' },
    insight: {
      de: 'Das Dopaminsystem sucht nach einem schnellen Neurochemie-Kick. Diese Rastlosigkeit lässt sich nachhaltig durch sanfte Bewegung stillen.',
      en: 'The dopamine system is seeking a quick neurochemical spike. This restlessness can be channeled naturally into physical movement.'
    },
    action: {
      de: '👉 Sanfte Sofort-Aktion: Wechsle den Raum, dehne dich ausgiebig nach oben und strecke deinen Rücken.',
      en: '👉 Gentle Action: Change the room, stretch your arms up high, and take a long mindful stretch.'
    }
  },
  shame: {
    icon: 'shield',
    color: 'indigo',
    title: { de: 'Selbstkritik / Flucht vor Unbehagen', en: 'Self-Criticism / Emotional Avoidance' },
    insight: {
      de: 'Oft wollen wir vor dem Gefühl weglaufen, „nicht genug geschafft“ zu haben. Sei voller Milde mit dir: Du musst nicht perfekt sein.',
      en: 'Often we try to escape feelings of falling short. Be gentle with yourself: you do not have to be perfect to be worthy.'
    },
    action: {
      de: '👉 Sanfte Sofort-Aktion: Sage dir innerlich: „Ich gebe gerade mein Bestes. Es ist vollkommen okay, jetzt innezuhalten.“',
      en: '👉 Gentle Action: Tell yourself: “I am doing my best right now. It is okay to pause.”'
    }
  }
};

function selectHaltCategory(key) {
  const item = HALT_DATA[key];
  if (!item) return;

  const resBox = document.getElementById('clarity-halt-result');
  if (!resBox) return;

  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
  const title = item.title[lang] || item.title.de;
  const insight = item.insight[lang] || item.insight.de;
  const action = item.action[lang] || item.action.de;

  resBox.innerHTML = '<div class="p-4 bg-white/[0.03] border border-teal-500/35 rounded-2xl space-y-2.5 text-left animate-fade-in shadow-lg">' +
    '<div class="flex items-center gap-2 font-bold text-xs text-teal-300">' +
      '<i data-lucide="' + item.icon + '" class="w-4 h-4 text-teal-400"></i>' +
      '<span>' + title + '</span>' +
    '</div>' +
    '<p class="text-xs text-gray-300 leading-relaxed">' + insight + '</p>' +
    '<div class="p-3 bg-teal-500/15 border border-teal-500/30 rounded-xl text-xs font-semibold text-teal-200">' +
      action +
    '</div>' +
  '</div>';
  resBox.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================================
// MODUL 3: SOMATISCHE SOFORT-BRÜCKEN (SHIFT)
// ============================================================================

const SHIFT_ACTIVITIES = [
  {
    icon: 'snowflake',
    title: { de: 'Kaltwasser-Reiz (Tauchreflex & Vagus-Reset)', en: 'Cold Face Splash (Mammalian Dive Reflex)' },
    desc: {
      de: 'Wasche dein Gesicht 20 Sekunden mit kaltem Wasser und kühle deine Handgelenke. Das aktiviert den Vagusnerv, senkt den Puls und reguliert das Nervensystem sofort.',
      en: 'Splash cool water on your face and wrists for 20 seconds. This activates the vagus nerve and immediately calms the nervous system.'
    }
  },
  {
    icon: 'wind',
    title: { de: '3x Physiologischer Seufzer (Huberman-Atem)', en: '3x Physiological Sighs (Vagus Reset)' },
    desc: {
      de: 'Zweimal tief durch die Nase einatmen (ein langer Atemzug, dann noch ein kurzer oberer Zug), gefolgt von einem langen, geräuschvollen Ausatmen durch den Mund. Baut akuten Stress sofort ab.',
      en: 'Take two deep inhales through the nose (one deep, one top-up), then one long audible exhale through the mouth. Drops acute stress instantly.'
    }
  },
  {
    icon: 'activity',
    title: { de: 'Somatic Shaking (30s Schütteln & Erden)', en: 'Somatic Shaking (30s Tension Release)' },
    desc: {
      de: 'Stelle dich hin und schüttle 30 Sekunden sanft deinen gesamten Körper, Arme und Beine aus. Baut rastlose Anspannung direkt ab.',
      en: 'Stand up and gently shake out your entire body, arms, and legs for 30 seconds. Naturally discharges restless tension.'
    }
  },
  {
    icon: 'eye',
    title: { de: '5-4-3-2-1 Sensorisches Erden im Raum', en: '5-4-3-2-1 Sensory Grounding' },
    desc: {
      de: 'Blicke dich um: Benenne 5 Dinge, die du siehst, 4 die du berühren kannst, 3 die du hörst, 2 die du riechst und nimm 1 tiefen Atemzug. Bringt den Geist sofort ins Hier & Jetzt.',
      en: 'Look around: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and take 1 deep breath.'
    }
  },
  {
    icon: 'cup-soda',
    title: { de: 'Achtsames Glas Wasser oder warmer Kräutertee', en: 'Mindful Sip of Water or Herbal Tea' },
    desc: {
      de: 'Trinke ein Glas kühles Wasser oder warmen Tee in 5 ganz langsamen, bewussten Schlucken. Spüre die Temperatur und Frische ganz aufmerksam.',
      en: 'Drink a glass of water or warm tea in 5 slow, mindful sips. Focus purely on the sensation of temperature.'
    }
  },
  {
    icon: 'sun',
    title: { de: 'Blick in die Weite (Optischer Weitsicht-Reflex)', en: 'Distant Gaze (Panoramic Vision)' },
    desc: {
      de: 'Gehe an ein Fenster und blicke 60 Sekunden lang ganz entspannt in den fernen Horizont. Panoramablick schaltet das Gehirn von Alarm auf Weite.',
      en: 'Look out of the window at the distant horizon for 60 seconds. Panoramic vision shifts the brain out of narrow stress focus.'
    }
  },
  {
    icon: 'heart-handshake',
    title: { de: 'Hand aufs Herz & Mitgefühl spüren', en: 'Hand on Heart & Self-Compassion' },
    desc: {
      de: 'Lege eine Hand flach auf deine Brust, schließe die Augen und spüre den warmen Druck deines Atems. Sanfte Berührung schüttet Oxytocin aus.',
      en: 'Place a hand on your chest, close your eyes, and feel the gentle warmth of your breath. Calms self-criticism immediately.'
    }
  },
  {
    icon: 'file-text',
    title: { de: 'Brain Dump: Gedanken auf Papier entladen', en: 'Brain Dump: Freeform Paper Release' },
    desc: {
      de: 'Schnapp dir einen Zettel und schreibe 2 Minuten lang ungefiltert auf, was dich gerade bedrückt oder unruhig macht. Danach weglegen oder zerreißen.',
      en: 'Grab a piece of paper and write out everything racing in your mind for 2 minutes. Release it onto the page.'
    }
  }
];

function suggestClarityShift() {
  const container = document.getElementById('clarity-shift-content');
  if (!container) return;
  const idx = Math.floor(Math.random() * SHIFT_ACTIVITIES.length);
  const act = SHIFT_ACTIVITIES[idx];

  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
  const title = act.title[lang] || act.title.de;
  const desc = act.desc[lang] || act.desc.de;

  container.innerHTML = '<div class="p-4 bg-teal-500/10 border border-teal-500/30 rounded-2xl text-left space-y-2 animate-fade-in shadow-md">' +
    '<div class="flex items-center gap-2 font-bold text-sm text-teal-300">' +
      '<i data-lucide="' + act.icon + '" class="w-5 h-5 text-teal-400"></i>' +
      '<span>' + title + '</span>' +
    '</div>' +
    '<p class="text-xs text-gray-200 leading-relaxed">' + desc + '</p>' +
  '</div>';
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================================
// MODUL 4: ZUKUNFTS-ICH (PERSPEKTIVEN-FILTER & ANKER)
// ============================================================================

function saveClarityReason(quickText = null) {
  const input = document.getElementById('clarity-reason-input');
  const text = quickText || (input ? input.value.trim() : '');
  if (!text) return;

  const cState = getClarityState();
  if (!cState.savedReasons.includes(text)) {
    cState.savedReasons.unshift(text);
    saveState();
  }
  if (input && !quickText) input.value = '';
  renderClarityReasonsList();
  showToast(tr({
    de: 'Ankergrund gesichert! ⚓',
    en: 'Personal anchor saved! ⚓'
  }));
}

function renderClarityReasonsList() {
  const listEl = document.getElementById('clarity-reasons-list');
  if (!listEl) return;
  const cState = getClarityState();
  const reasons = cState.savedReasons || [];
  if (reasons.length === 0) {
    listEl.innerHTML = '<p class="text-[11px] text-gray-500 italic text-center py-2">' + tr({ en: 'No personal anchors saved yet. Add your reasons for freedom above.', de: 'Noch keine persönlichen Anker gespeichert. Halte deine Gründe für Freiheit fest.' }) + '</p>';
    return;
  }
  listEl.innerHTML = reasons.slice(0, 6).map((r, i) =>
    '<div class="p-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl flex items-center justify-between text-xs text-gray-200 transition gap-2">' +
      '<span class="truncate font-medium flex items-center gap-2">' +
        '<span class="text-teal-400">⚓</span>' +
        '<span>' + escapeHtml(r) + '</span>' +
      '</span>' +
      '<button onclick="removeClarityReason(' + i + ')" aria-label="Anker entfernen" class="text-gray-500 hover:text-rose-400 text-xs p-1 cursor-pointer">✕</button>' +
    '</div>'
  ).join('');
}

function removeClarityReason(index) {
  const cState = getClarityState();
  if (!Array.isArray(cState.savedReasons)) return;
  cState.savedReasons.splice(index, 1);
  saveState();
  renderClarityReasonsList();
}

// ============================================================================
// MODUL 5: TAGE DER KLARHEIT & SANFTES REFLEXIONS-TAGEBUCH
// ============================================================================

function updateClarityStreakUI() {
  const cState = getClarityState();
  const countEl = document.getElementById('clarity-streak-count');
  if (countEl) countEl.textContent = String(cState.streakDays || 0);
}

function incrementClarityStreak() {
  const cState = getClarityState();
  cState.streakDays = (cState.streakDays || 0) + 1;
  cState.lastCheckinDate = new Date().toISOString();
  saveState();
  updateClarityStreakUI();
  if (typeof triggerCelebration === 'function') triggerCelebration();
  if (typeof addGamificationXP === 'function') addGamificationXP(30, 'Klarheits-Tag');
  showToast(tr({
    de: 'Klarheits-Tag erfolgreich festgehalten! Weiter so 🌟',
    en: 'Clarity day logged successfully! Keep going 🌟'
  }));
}

async function resetClarityStreak() {
  const confirmMsg = tr({
    de: 'Ein neuer Anlauf ist kein Versagen, sondern ein liebevoller Lernmoment. Dein Gehirn formt neue Pfade. Zähler auf 0 setzen?',
    en: 'Resetting is not failure, but a gentle learning moment. Your brain is building new pathways. Reset counter to 0?'
  });

  const confirmed = typeof showConfirmDialog === 'function' ? await showConfirmDialog({
    title: typeof tr === 'function' ? tr({ de: 'Sanfter Neustart', en: 'Gentle Reset' }) : 'Sanfter Neustart',
    message: confirmMsg,
    confirmText: typeof tr === 'function' ? tr({ de: 'Auf 0 setzen 🌱', en: 'Reset to 0 🌱' }) : 'Auf 0 setzen 🌱',
    isDanger: false,
    icon: 'refresh-cw'
  }) : confirm(confirmMsg);

  if (confirmed) {
    const cState = getClarityState();
    cState.streakDays = 0;
    saveState();
    updateClarityStreakUI();
    showToast(tr({
      de: 'Zähler zurückgesetzt. Sei voller Mitgefühl mit dir – heute ist ein neuer Tag! 🌱',
      en: 'Counter reset. Be kind to yourself – today is a fresh new day! 🌱'
    }));
  }
}

function addClarityJournalNote() {
  const input = document.getElementById('clarity-journal-input');
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  const cState = getClarityState();
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
  cState.journalEntries.unshift({
    id: 'cj_' + Date.now(),
    date: new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    text: text
  });
  input.value = '';
  saveState();
  renderClarityJournalList();
  showToast(tr({
    de: 'Reflexion im Klarheits-Tagebuch gespeichert 📖',
    en: 'Reflection saved in Clarity Journal 📖'
  }));
}

function renderClarityJournalList() {
  const listEl = document.getElementById('clarity-journal-list');
  if (!listEl) return;
  const cState = getClarityState();
  const entries = cState.journalEntries || [];
  if (entries.length === 0) {
    listEl.innerHTML = '<p class="text-[10px] text-gray-500 italic text-center py-2">' + tr({ de: 'Noch keine Notizen. Halte fest, was dir heute Kraft gegeben hat.', en: 'No notes yet. Capture what helped you stay grounded today.' }) + '</p>';
    return;
  }
  listEl.innerHTML = entries.slice(0, 4).map((entry, idx) =>
    '<div class="p-2.5 bg-white/[0.025] border border-white/5 rounded-xl space-y-1 text-left text-xs">' +
      '<div class="flex items-center justify-between text-[10px] text-teal-400/80 font-mono">' +
        '<span>' + escapeHtml(entry.date) + '</span>' +
        '<button onclick="deleteClarityJournalNote(' + idx + ')" class="text-gray-500 hover:text-rose-400 cursor-pointer">✕</button>' +
      '</div>' +
      '<p class="text-gray-200 text-xs leading-relaxed">' + escapeHtml(entry.text) + '</p>' +
    '</div>'
  ).join('');
}

function deleteClarityJournalNote(index) {
  const cState = getClarityState();
  if (!Array.isArray(cState.journalEntries)) return;
  cState.journalEntries.splice(index, 1);
  saveState();
  renderClarityJournalList();
}

// Global Exports
if (typeof window !== 'undefined') {
  window.openClarityModal = openClarityModal;
  window.closeClarityModal = closeClarityModal;
  window.switchClarityTab = switchClarityTab;
  window.toggleClarityUrgeTimer = toggleClarityUrgeTimer;
  window.startClarityUrgeTimer = startClarityUrgeTimer;
  window.stopClarityUrgeTimer = stopClarityUrgeTimer;
  window.selectHaltCategory = selectHaltCategory;
  window.suggestClarityShift = suggestClarityShift;
  window.saveClarityReason = saveClarityReason;
  window.removeClarityReason = removeClarityReason;
  window.incrementClarityStreak = incrementClarityStreak;
  window.resetClarityStreak = resetClarityStreak;
  window.addClarityJournalNote = addClarityJournalNote;
  window.deleteClarityJournalNote = deleteClarityJournalNote;
}
if (typeof globalThis !== 'undefined') {
  globalThis.openClarityModal = openClarityModal;
  globalThis.closeClarityModal = closeClarityModal;
  globalThis.switchClarityTab = switchClarityTab;
  globalThis.toggleClarityUrgeTimer = toggleClarityUrgeTimer;
  globalThis.startClarityUrgeTimer = startClarityUrgeTimer;
  globalThis.stopClarityUrgeTimer = stopClarityUrgeTimer;
  globalThis.selectHaltCategory = selectHaltCategory;
  globalThis.suggestClarityShift = suggestClarityShift;
  globalThis.saveClarityReason = saveClarityReason;
  globalThis.removeClarityReason = removeClarityReason;
  globalThis.incrementClarityStreak = incrementClarityStreak;
  globalThis.resetClarityStreak = resetClarityStreak;
  globalThis.addClarityJournalNote = addClarityJournalNote;
  globalThis.deleteClarityJournalNote = deleteClarityJournalNote;
}