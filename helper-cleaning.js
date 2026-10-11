/**
 * @file helper-cleaning.js
 * @module CleaningCoach
 * @description
 * Geführter Aufräum- und Reinigungs-Assistent mit abgestuften Zeitprogrammen
 * (15-Minuten-Blitz-Reset, 30-Minuten-Standard, 60-Minuten-Deep-Clean),
 * interaktiver Checkliste und integrierter Timer-Steuerung.
 */

const CLEANING_LEVELS_DATA = {
  express: {
    id: 'express',
    title: '15-Minuten Blitz-Reset',
    subtitle: 'Schnelle optische Ordnung & sofortiger Wohlfühl-Effekt',
    icon: 'zap',
    color: 'amber',
    durationMin: 15,
    badge: 'Express',
    introTip: 'Perfekt für spontanen Besuch oder wenn der Kopf voll ist: Wir beseitigen nur die 5 größten optischen Unruhestifter für sofortige Erleichterung!',
    steps: [
      {
        id: 'exp_1',
        title: 'Müll & Leergut-Runde (3 Min)',
        desc: 'Mit einer Mülltüte zügig durch alle Räume gehen: Verpackungen, Papier, leere Flaschen und Dosen direkt einsammeln und wegbringen.',
        why: 'Müll raubt unbewusst enorm viel mentale Energie. Ist er weg, wirkt der Raum sofort zu 50 % aufgeräumter.',
        icon: 'trash-2'
      },
      {
        id: 'exp_2',
        title: 'Geschirr in die Küche bringen (3 Min)',
        desc: 'Alle benutzten Tassen, Teller, Gläser und Besteck von Schreibtisch, Couchtisch und Nachttisch direkt in die Spülmaschine oder Spüle stellen.',
        why: 'Freie Tische und kein herumstehendes Geschirr stoppen sofort Gerüche und optisches Chaos.',
        icon: 'coffee'
      },
      {
        id: 'exp_3',
        title: 'Oberflächen freiräumen (4 Min)',
        desc: 'Herumliegende Gegenstände (Kabel, Post, Klamotten) an ihren festen Platz legen oder kurz in einer Sammelkiste bündeln.',
        why: 'Freie, leere Tischflächen signalisieren dem Gehirn augenblicklich Ordnung und Ruhe.',
        icon: 'layers'
      },
      {
        id: 'exp_4',
        title: 'Kissen aufschütteln & Bett glätten (2 Min)',
        desc: 'Bettdecke glattziehen, Sofakissen aufschütteln und Kuscheldecke ordentlich zusammenfalten.',
        why: 'Kostet nur 1 Minute, lässt Schlaf- und Wohnbereich aber sofort wie ein gemütliches Hotelzimmer wirken.',
        icon: 'bed-double'
      },
      {
        id: 'exp_5',
        title: 'Stoßlüften & Frische-Finish (3 Min)',
        desc: 'Fenster für 3-5 Minuten weit öffnen (Durchzug). Verbrauchte Luft rauslassen, frische Energie hereinholen – fertig!',
        why: 'Frische kühle Luft vertreibt Müdigkeit und lässt das gesamte Zuhause sauber und klar riechen.',
        icon: 'wind'
      }
    ]
  },
  standard: {
    id: 'standard',
    title: '45-Minuten Standard-Grundreinigung',
    subtitle: 'Alle Kernzonen frisch, hygienisch & sauber',
    icon: 'spray-can',
    color: 'emerald',
    durationMin: 45,
    badge: 'Beliebt',
    introTip: 'Die solide Grundreinigung nach der goldenen Regel: Von oben nach unten, von innen nach außen, trocken vor nass und Reiniger zuerst einwirken lassen!',
    steps: [
      {
        id: 'std_1',
        title: 'Vorbereitung & Chemie wirken lassen (5 Min)',
        desc: 'Kalklöser in Dusche, Waschbecken & WC sprühen. Fettlöser/Spülmittel auf Herd & Küchenspüle geben. NICHT sofort schrubben, sondern einwirken lassen!',
        why: 'Profi-Prinzip: Der Reiniger zersetzt Kalk und Fett selbstständig. Während er wirkt, putzt du woanders – spart 80 % Kraftaufwand!',
        icon: 'spray-can'
      },
      {
        id: 'std_2',
        title: 'Entrümpeln & Müll einsacken (5 Min)',
        desc: 'Mit Mülltüte und Korb durch alle Zimmer gehen: Herumliegendes wegräumen, Müllbeutel verknoten und an die Wohnungstür stellen.',
        why: 'Auf zugestellten Flächen kann man nicht putzen. Erst freiräumen, dann mit Schwung wischen.',
        icon: 'trash-2'
      },
      {
        id: 'std_3',
        title: 'Staubwischen von oben nach unten (10 Min)',
        desc: 'Mit leicht feuchtem Mikrofasertuch Regale, Fensterbänke, Tische und Sideboards systematisch von oben nach unten abwischen.',
        why: 'Immer von oben nach unten arbeiten – herabfallender Staub wird später beim Saugen restlos aufgesaugt.',
        icon: 'feather'
      },
      {
        id: 'std_4',
        title: 'Küche auf Hochglanz bringen (7 Min)',
        desc: 'Der Reiniger hat gewirkt: Herd, Arbeitsplatten und Spüle mit gelbem Küchentuch abwischen, mit Wasser nachspülen und mit trockenem Tuch polieren.',
        why: 'Trockenpolieren verhindert hässliche Wasserflecken und lässt Edelstahl sofort funkeln.',
        icon: 'utensils'
      },
      {
        id: 'std_5',
        title: 'Bad & WC hygienisch reinigen (8 Min)',
        desc: 'Waschbecken und Dusche abspülen. Mit separatem rotem Tuch WC-Sitz desinfizieren, Kloschüssel mit der Bürste gründlich durchbürsten und spülen.',
        why: 'Hygiene-Farbleitsystem: Rotes Tuch nur für das WC nutzen, um Keimübertragung zu verhindern.',
        icon: 'bath'
      },
      {
        id: 'std_6',
        title: 'Böden saugen & feucht wischen (10 Min)',
        desc: 'Von der hintersten Zimmerecke rückwärts Richtung Wohnungstür gründlich saugen und bei Hartböden kurz feucht nachwischen. Fenster auf!',
        why: 'Wer rückwärts zur Tür arbeitet, tritt nicht auf die frisch geputzte, feuchte Fläche.',
        icon: 'brush'
      }
    ]
  },
  deep: {
    id: 'deep',
    title: '90-Minuten Tiefenreinigung (Deep Clean)',
    subtitle: 'Der komplette Wohlfühl-Reset für die ganze Wohnung',
    icon: 'gem',
    color: 'indigo',
    durationMin: 90,
    badge: 'Intensiv',
    introTip: 'Gönn deiner Wohnung und dir selbst einen echten Neuanfang. Schalte deine Lieblingsmusik ein und freue dich auf das frischeste Gefühl der Woche!',
    steps: [
      {
        id: 'deep_1',
        title: 'Textilien-Start & Betten abziehen (10 Min)',
        desc: 'Bettwäsche, Handtücher und Badematten abziehen und direkt eine 60°C-Maschine starten. Frische Bettwäsche bereitlegen.',
        why: 'Die Waschmaschine wäscht im Hintergrund, während du den Rest der Wohnung verwandelst.',
        icon: 'shirt'
      },
      {
        id: 'deep_2',
        title: 'Kühlschrank & Mülleimer Grundreinigung (15 Min)',
        desc: 'Kühlschrank ausmisten, Böden mit Essigwasser auswischen. Mülleimer leeren, kurz heiß auswaschen und frische Beutel einsetzen.',
        why: 'Saubere Mülleimer und ein frischer Kühlschrank neutralisieren 90 % aller schlechten Gerüche im Haushalt.',
        icon: 'refrigerator'
      },
      {
        id: 'deep_3',
        title: 'Sanitär & Küche Intensiv-Einwirkzeit (10 Min)',
        desc: 'Kalklöser auf Duschwände, Armaturen und Fugen sprühen. Backofen/Herd einsprühen. WC-Reiniger unter den Rand geben.',
        why: 'Lange Einwirkzeit löst selbst hartnäckigsten Urinstein und Kalk ganz ohne mühsames Scheuern.',
        icon: 'spray-can'
      },
      {
        id: 'deep_4',
        title: 'High & Low Dusting (Spinnweben & Leisten) (15 Min)',
        desc: 'Zuerst Decken-Ecken nach Spinnweben absuchen. Lampen, Monitore, Lichtschalter, Türgriffe und Fußleisten feucht abwischen.',
        why: 'Saubere Sockelleisten, Schalter und Türen lassen eine Wohnung sofort neuwertig und exklusiv wirken.',
        icon: 'layers'
      },
      {
        id: 'deep_5',
        title: 'Küche & Bad auf Hochglanz polieren (15 Min)',
        desc: 'Duschkabine, Waschbecken, Spüle und Herd abspülen. Spiegel und Glasflächen mit Glasreiniger streifenfrei polieren.',
        why: 'Funkelnde Spiegel und blitzblanke Armaturen sind das optische Highlight jedes Raumes.',
        icon: 'brush'
      },
      {
        id: 'deep_6',
        title: 'Polster & Matratzen absaugen & Bett beziehen (10 Min)',
        desc: 'Sofa-Ritzen absaugen, Matratze kurz wenden/absaugen und das frische, duftende Bett beziehen.',
        why: 'Entfernt Staub und Milben – herrlich frisches Gefühl beim nächsten Einschlafen.',
        icon: 'bed-double'
      },
      {
        id: 'deep_7',
        title: 'Böden intensiv saugen & feucht wischen (15 Min)',
        desc: 'Gründlich auch unter Sofas und Betten saugen. Mit warmem Bodenreiniger-Wasser von hinten nach vorn wischen. 10 Min durchlüften.',
        why: 'Der krönende Abschluss: Der Duft von sauberem Bodenwischwasser erfüllt die ganze Wohnung.',
        icon: 'brush'
      }
    ]
  }
};

let activeCleaningLevel = 'standard';
let activeCleaningCompletedSteps = {};
let cleaningTimerInterval = null;
let cleaningTimerSecondsLeft = 45 * 60;
let isCleaningTimerRunning = false;
let isCleaningLoFiActive = false;

function openCleaningGuideModal(defaultLevel = null) {
  const modal = document.getElementById('helper-cleaning-modal');
  if (!modal) return;
  
  if (defaultLevel && CLEANING_LEVELS_DATA[defaultLevel]) {
    activeCleaningLevel = defaultLevel;
  }
  
  // Gespeicherten Zustand aus localStorage laden
  try {
    const saved = localStorage.getItem('flow_cleaning_state');
    if (saved) {
      activeCleaningCompletedSteps = JSON.parse(saved);
    }
  } catch (e) {}

  modal.classList.remove('hidden');
  renderCleaningGuideUI();
}

function closeCleaningGuideModal() {
  const modal = document.getElementById('helper-cleaning-modal');
  if (modal) modal.classList.add('hidden');
  pauseCleaningTimer();
}

function switchCleaningLevel(levelKey) {
  if (!CLEANING_LEVELS_DATA[levelKey]) return;
  activeCleaningLevel = levelKey;
  resetCleaningTimer(CLEANING_LEVELS_DATA[levelKey].durationMin * 60);
  renderCleaningGuideUI();
}

function toggleCleaningStep(stepId, event) {
  if (event) event.stopPropagation();
  activeCleaningCompletedSteps[stepId] = !activeCleaningCompletedSteps[stepId];
  
  try {
    localStorage.setItem('flow_cleaning_state', JSON.stringify(activeCleaningCompletedSteps));
  } catch (e) {}
  
  renderCleaningGuideUI();
}

function resetCleaningProgress() {
  const data = CLEANING_LEVELS_DATA[activeCleaningLevel];
  if (!data) return;
  
  data.steps.forEach(s => {
    delete activeCleaningCompletedSteps[s.id];
  });
  
  try {
    localStorage.setItem('flow_cleaning_state', JSON.stringify(activeCleaningCompletedSteps));
  } catch (e) {}
  
  renderCleaningGuideUI();
}

function renderCleaningGuideUI() {
  const data = CLEANING_LEVELS_DATA[activeCleaningLevel];
  if (!data) return;

  // Level Tabs
  ['express', 'standard', 'deep'].forEach(lvl => {
    const btn = document.getElementById('cleaning-tab-' + lvl);
    if (btn) {
      if (lvl === activeCleaningLevel) {
        btn.className = 'flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all bg-emerald-500/25 text-emerald-200 border border-emerald-500/40 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer';
      } else {
        btn.className = 'flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 flex items-center justify-center gap-1.5 cursor-pointer';
      }
    }
  });

  // Header Info
  const titleEl = document.getElementById('cleaning-guide-title');
  if (titleEl) titleEl.innerText = data.title;
  
  const introEl = document.getElementById('cleaning-guide-intro-tip');
  if (introEl) introEl.innerText = data.introTip;

  // Steps Rendering
  const container = document.getElementById('cleaning-guide-steps-container');
  if (container) {
    let completedCount = 0;
    
    container.innerHTML = data.steps.map((step, idx) => {
      const isDone = !!activeCleaningCompletedSteps[step.id];
      if (isDone) completedCount++;

      return `
        <div onclick="toggleCleaningStep('${step.id}', event)" class="group p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
          isDone 
            ? 'bg-emerald-950/20 border-emerald-500/30 opacity-70' 
            : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
        }">
          <div class="flex items-start gap-3">
            <div class="mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
              isDone ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-white/20 group-hover:border-emerald-400 text-transparent'
            }">
              <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <h5 class="text-xs font-bold ${isDone ? 'line-through text-emerald-300' : 'text-white'}">${step.title}</h5>
                <span class="text-[9px] font-mono font-semibold text-gray-400 px-1.5 py-0.2 rounded bg-black/40 border border-white/5">Schritt ${idx + 1}/${data.steps.length}</span>
              </div>
              <p class="text-[11px] text-gray-300 mt-1 leading-relaxed">${step.desc}</p>
              ${step.why ? `<div class="mt-1.5 text-[10px] text-emerald-400/90 font-mono flex items-start gap-1">
                <span class="shrink-0">💡</span>
                <span>${step.why}</span>
              </div>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Progress Bar
    const progressPercent = Math.round((completedCount / data.steps.length) * 100);
    const progressBar = document.getElementById('cleaning-progress-bar');
    if (progressBar) progressBar.style.width = progressPercent + '%';

    const progressLabel = document.getElementById('cleaning-progress-label');
    if (progressLabel) progressLabel.innerText = completedCount + ' von ' + data.steps.length + ' erledigt (' + progressPercent + '%)';
  }

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// Timer Functions
function startCleaningTimer() {
  if (isCleaningTimerRunning) return;
  isCleaningTimerRunning = true;
  updateCleaningTimerButtons();
  
  cleaningTimerInterval = setInterval(() => {
    if (cleaningTimerSecondsLeft > 0) {
      cleaningTimerSecondsLeft--;
      updateCleaningTimerDisplay();
    } else {
      pauseCleaningTimer();
      if (typeof triggerCelebration === 'function') triggerCelebration();
    }
  }, 1000);
}

function pauseCleaningTimer() {
  isCleaningTimerRunning = false;
  if (cleaningTimerInterval) clearInterval(cleaningTimerInterval);
  updateCleaningTimerButtons();
}

function resetCleaningTimer(seconds) {
  pauseCleaningTimer();
  cleaningTimerSecondsLeft = seconds !== undefined ? seconds : CLEANING_LEVELS_DATA[activeCleaningLevel].durationMin * 60;
  updateCleaningTimerDisplay();
}

function updateCleaningTimerDisplay() {
  const display = document.getElementById('cleaning-timer-display');
  if (!display) return;
  const mins = Math.floor(cleaningTimerSecondsLeft / 60);
  const secs = cleaningTimerSecondsLeft % 60;
  display.innerText = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

function updateCleaningTimerButtons() {
  const startBtn = document.getElementById('cleaning-timer-start-btn');
  const pauseBtn = document.getElementById('cleaning-timer-pause-btn');
  if (startBtn && pauseBtn) {
    if (isCleaningTimerRunning) {
      startBtn.classList.add('hidden');
      pauseBtn.classList.remove('hidden');
    } else {
      startBtn.classList.remove('hidden');
      pauseBtn.classList.add('hidden');
    }
  }
}

function toggleCleaningLoFi() {
  isCleaningLoFiActive = !isCleaningLoFiActive;
  const btn = document.getElementById('cleaning-lofi-btn');
  if (btn) {
    if (isCleaningLoFiActive) {
      btn.classList.add('bg-purple-500/30', 'text-purple-200', 'border-purple-400');
      if (typeof window.startLoFiBeats === 'function') window.startLoFiBeats();
    } else {
      btn.classList.remove('bg-purple-500/30', 'text-purple-200', 'border-purple-400');
      if (typeof window.stopLoFiBeats === 'function') window.stopLoFiBeats();
    }
  }
}

function transferCleaningStepsToBoard(targetCategory = 'weekly') {
  const data = CLEANING_LEVELS_DATA[activeCleaningLevel];
  if (!data) return;

  const curState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : null);
  if (!curState || !curState.items) return;

  const cat = (curState.items[targetCategory]) ? targetCategory : 'weekly';
  if (!curState.items[cat]) curState.items[cat] = [];

  let addedCount = 0;
  const nowISO = new Date().toISOString();

  data.steps.forEach((step, idx) => {
    if (!activeCleaningCompletedSteps[step.id]) {
      const taskText = `🧹 ${step.title.split('(')[0].trim()}`;
      const exists = curState.items[cat].some(item => (typeof item === 'object' ? item.task === taskText : item === taskText));
      if (!exists) {
        curState.items[cat].push({
          id: `clean_${step.id}_${Date.now()}_${idx}`,
          task: taskText,
          createdAt: nowISO,
          updatedAt: nowISO
        });
        addedCount++;
      }
    }
  });

  if (typeof saveState === 'function') saveState();
  if (typeof renderApp === 'function') renderApp();

  closeCleaningGuideModal();
  if (typeof showToast === 'function') {
    const msg = tr({
      en: `✨ Added ${addedCount} steps to your board!`,
      de: `✨ ${addedCount} Schritte in dein Board übernommen!`,
      fr: `✨ ${addedCount} étapes ajoutées à votre tableau !`,
      it: `✨ ${addedCount} passaggi aggiunti alla tua bacheca!`,
      es: `✨ ¡${addedCount} pasos agregados a tu tablero!`,
      el: `✨ Προστέθηκαν ${addedCount} βήματα στον πίνακά σου!`
    });
    showToast(msg);
  }
}

if (typeof window !== 'undefined') {
  window.openCleaningGuideModal = openCleaningGuideModal;
  window.closeCleaningGuideModal = closeCleaningGuideModal;
  window.switchCleaningLevel = switchCleaningLevel;
  window.toggleCleaningStep = toggleCleaningStep;
  window.resetCleaningProgress = resetCleaningProgress;
  window.startCleaningTimer = startCleaningTimer;
  window.pauseCleaningTimer = pauseCleaningTimer;
  window.resetCleaningTimer = resetCleaningTimer;
  window.toggleCleaningLoFi = toggleCleaningLoFi;
  window.transferCleaningStepsToBoard = transferCleaningStepsToBoard;
  window.CLEANING_LEVELS_DATA = CLEANING_LEVELS_DATA;
}
if (typeof globalThis !== 'undefined') {
  globalThis.openCleaningGuideModal = openCleaningGuideModal;
  globalThis.closeCleaningGuideModal = closeCleaningGuideModal;
  globalThis.switchCleaningLevel = switchCleaningLevel;
  globalThis.toggleCleaningStep = toggleCleaningStep;
  globalThis.resetCleaningProgress = resetCleaningProgress;
  globalThis.startCleaningTimer = startCleaningTimer;
  globalThis.pauseCleaningTimer = pauseCleaningTimer;
  globalThis.resetCleaningTimer = resetCleaningTimer;
  globalThis.toggleCleaningLoFi = toggleCleaningLoFi;
  globalThis.transferCleaningStepsToBoard = transferCleaningStepsToBoard;
  globalThis.CLEANING_LEVELS_DATA = CLEANING_LEVELS_DATA;
}
