
let brainstormViewMode = 'list'; // 'list' | 'cluster'

function setBrainstormViewMode(mode) {
  brainstormViewMode = mode;
  const listBtn = document.getElementById('brainstorm-view-btn-list');
  const clusterBtn = document.getElementById('brainstorm-view-btn-cluster');
  if (listBtn && clusterBtn) {
    if (mode === 'cluster') {
      clusterBtn.className = 'px-2 py-1 rounded-xl text-xs font-bold bg-teal-500/25 text-teal-300 border border-teal-500/40 shadow-xs cursor-pointer flex items-center gap-1';
      listBtn.className = 'px-2 py-1 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 border border-white/5 cursor-pointer flex items-center gap-1';
    } else {
      listBtn.className = 'px-2 py-1 rounded-xl text-xs font-bold bg-teal-500/25 text-teal-300 border border-teal-500/40 shadow-xs cursor-pointer flex items-center gap-1';
      clusterBtn.className = 'px-2 py-1 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 border border-white/5 cursor-pointer flex items-center gap-1';
    }
  }
  renderBrainstormUI();
}

function copyBrainstormAsMindmap() {
  if (brainstormIdeas.length === 0) return;
  const groups = {};
  Object.keys(BRAINSTORM_TAGS).forEach(t => groups[t] = []);
  brainstormIdeas.forEach(i => {
    if (!groups[i.tag]) groups[i.tag] = [];
    groups[i.tag].push(i);
  });

  let lines = ['# Mindmap - Brainstorming Studio (' + new Date().toLocaleDateString() + ')\n'];
  Object.entries(groups).forEach(([tag, items]) => {
    if (items.length > 0) {
      const conf = BRAINSTORM_TAGS[tag] || BRAINSTORM_TAGS.idea;
      lines.push(`## ${conf.icon} ${conf.label.de || tag}`);
      items.forEach(it => {
        const star = it.starred ? '⭐ ' : '';
        lines.push(`  - ${star}${it.text}`);
      });
      lines.push('');
    }
  });

  const text = lines.join('\n');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (typeof showToast === 'function') showToast(tr({ de: '🗺️ Mindmap in die Zwischenablage kopiert!', en: '🗺️ Mindmap copied to clipboard!' }));
    });
  }
}

function exportBrainstormAsActionPlan() {
  if (brainstormIdeas.length === 0) return;
  const quickwins = brainstormIdeas.filter(i => i.tag === 'quickwin');
  const projects = brainstormIdeas.filter(i => i.tag === 'project');
  const goals = brainstormIdeas.filter(i => i.tag === 'goal');
  const ideas = brainstormIdeas.filter(i => i.tag === 'idea');
  const questions = brainstormIdeas.filter(i => i.tag === 'question');

  let lines = [
    '# 🎯 Sofort-Aktionsplan (Synthetisiert)',
    `Erstellt am: ${new Date().toLocaleString()}`,
    '',
    '## ⚡ Phase 1: Quick Wins (Sofort umsetzen)',
    quickwins.length ? quickwins.map(q => `- [ ] ${q.text}`).join('\n') : '- Keine Quick Wins definiert',
    '',
    '## 🚀 Phase 2: Kern-Projekte',
    projects.length ? projects.map(p => `- [ ] ${p.text}`).join('\n') : '- Keine Projekte definiert',
    '',
    '## 🎯 Phase 3: Langfristige Ziele & Meilensteine',
    goals.length ? goals.map(g => `- [ ] ${g.text}`).join('\n') : '- Keine Ziele definiert',
    '',
    '## 💡 Ideenpool & Inspirationsspeicher',
    ideas.length ? ideas.map(i => `- ${i.text}`).join('\n') : '- Keine Ideen im Pool',
    '',
    '## ❓ Zu klärende Fragen & Recherchen',
    questions.length ? questions.map(q => `- [ ] ${q.text}`).join('\n') : '- Keine offenen Fragen'
  ];

  const text = lines.join('\n');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (typeof showToast === 'function') showToast(tr({ de: '📋 Aktionsplan in Zwischenablage kopiert!', en: '📋 Action plan copied to clipboard!' }));
    });
  }
}

// =============================================================
// NOODLE SMART BRAINSTORMING STUDIO (IDEEN-LABOR)
// Vollständig lautlos, mit Mikrofon-Spracheingabe & Board-Verknüpfung
// =============================================================

let brainstormIdeas = [];
let brainstormRecognition = null;
let isBrainstormRecording = false;
let brainstormActiveFilter = 'all'; // 'all', 'starred', 'idea', 'quickwin', 'project', 'question', 'goal'
let brainstormSearchQuery = '';
let currentSparksIndex = 0;

const BRAINSTORM_TAGS = {
  idea: { label: { de: 'Idee', en: 'Idea', fr: 'Idée', it: 'Idea', es: 'Idea', el: 'Ιδέα' }, icon: '💡', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  quickwin: { label: { de: 'Quick Win', en: 'Quick Win', fr: 'Gain rapide', it: 'Vittoria rapida', es: 'Victoria rápida', el: 'Γρήγορη νίκη' }, icon: '⚡', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  project: { label: { de: 'Projekt', en: 'Project', fr: 'Projet', it: 'Progetto', es: 'Proyecto', el: 'Έργο' }, icon: '🚀', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  question: { label: { de: 'Frage', en: 'Question', fr: 'Question', it: 'Domanda', es: 'Pregunta', el: 'Ερώτηση' }, icon: '❓', color: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  goal: { label: { de: 'Ziel', en: 'Goal', fr: 'Objectif', it: 'Obiettivo', es: 'Meta', el: 'Στόχος' }, icon: '🎯', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' }
};

const CREATIVE_SPARKS = [
  { de: 'Was wäre die radikalste 5-Minuten-Lösung?', en: 'What would the radical 5-minute solution look like?', fr: 'Quelle serait la solution radicale en 5 minutes ?', it: 'Quale sarebbe la soluzione rapida in 5 minuti ?', es: '¿Cuál sería la solución radical de 5 minutos?', el: 'Ποια θα ήταν η ριζοσπαστική λύση 5 λεπτών;' },
  { de: 'Wie würde man das genaue Gegenteil davon erreichen?', en: 'How would you achieve the exact opposite of this?', fr: 'Comment obtiendriez-vous exactement le contraire ?', it: 'Come faresti per ottenere l\'esatto opposto?', es: '¿Cómo lograrías exactamente lo opuesto?', el: 'Πώς θα πετύχαινες το ακριβώς αντίθετο;' },
  { de: 'Was, wenn das Budget und der Aufwand 0 € / 0 Std. wären?', en: 'What if the budget and effort were $0 / 0 hours?', fr: 'Et si le budget et l\'effort étaient de 0 € / 0 h ?', it: 'E se budget e impegno fossero 0 € / 0 ore ?', es: '¿Y si el presupuesto y esfuerzo fueran 0€ / 0h?', el: 'Τι θα γινόταν αν ο προϋπολογισμός ήταν 0€ / 0 ώρες;' },
  { de: 'Welches einzelne Element könnte man komplett weglassen?', en: 'Which single element could be completely removed?', fr: 'Quel élément unique pourrait être totalement supprimé ?', it: 'Quale singolo elemento potrebbe essere eliminato ?', es: '¿Qué elemento único podría eliminarse por completo?', el: 'Ποιο στοιχείο θα μπορούσες να παραλείψεις εντελώς;' },
  { de: 'Wie würde ein 10-jähriges Kind dieses Problem anpacken?', en: 'How would a 10-year-old child tackle this problem?', fr: 'Comment un enfant de 10 ans aborderait-il ce problème ?', it: 'Come affronterebbe questo problema un bambino di 10 anni ?', es: '¿Cómo abordaría este problema un niño de 10 años?', el: 'Πώς θα το αντιμετώπιζε ένα παιδί 10 ετών;' },
  { de: 'Was ist der wichtigste erste Dominostein für den Start?', en: 'What is the most crucial first domino to get started?', fr: 'Quel est le premier domino décisif pour démarrer ?', it: 'Qual è il primo domino fondamentale per iniziare ?', es: '¿Cuál es la primera ficha de dominó clave?', el: 'Ποιο είναι το πρώτο κρίσιμο βήμα εκκίνησης;' }
];

// --- INITIALISIERUNG & SPEICHERUNG ---
function getBrainstormStorageKey() {
  const wsId = (typeof currentWorkspaceId !== 'undefined' && currentWorkspaceId) ? currentWorkspaceId : 'default';
  return `noodle_brainstorm_ideas_${wsId}`;
}

function loadBrainstormIdeas() {
  try {
    const raw = localStorage.getItem(getBrainstormStorageKey());
    if (raw) {
      brainstormIdeas = JSON.parse(raw);
    } else {
      brainstormIdeas = [];
    }
  } catch (e) {
    console.warn('[Brainstorm] Load error:', e);
    brainstormIdeas = [];
  }
}

function saveBrainstormIdeas() {
  try {
    localStorage.setItem(getBrainstormStorageKey(), JSON.stringify(brainstormIdeas));
  } catch (e) {
    console.warn('[Brainstorm] Save error:', e);
  }
}

// --- MODAL ÖFFNEN / SCHLIESSEN ---
function openBrainstormModal() {
  loadBrainstormIdeas();
  const modal = document.getElementById('brainstorm-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  
  renderBrainstormUI();
  
  setTimeout(() => {
    const input = document.getElementById('brainstorm-quick-input');
    if (input && typeof input.focus === 'function') input.focus();
  }, 100);
}

function closeBrainstormModal() {
  stopBrainstormRecording();
  const modal = document.getElementById('brainstorm-modal');
  if (modal) modal.classList.add('hidden');
}

// --- MIKROFON & SPRACHEINGABE (VOICE-TO-IDEA) ---
function toggleBrainstormRecording() {
  if (isBrainstormRecording) {
    stopBrainstormRecording();
  } else {
    startBrainstormRecording();
  }
}

function startBrainstormRecording() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (typeof showToast === 'function') {
      showToast(tr({
        de: '🎙️ Spracherkennung in diesem Browser nicht verfügbar. Bitte Tastatur nutzen.',
        en: '🎙️ Speech recognition not supported in this browser. Please type.',
        fr: '🎙️ Reconnaissance vocale non supportée par ce navigateur.',
        it: '🎙️ Riconoscimento vocale non supportato su questo browser.',
        es: '🎙️ Reconocimiento de voz no compatible en este navegador.',
        el: '🎙️ Η αναγνώριση φωνής δεν υποστηρίζεται σε αυτό το πρόγραμμα περιήγησης.'
      }));
    }
    return;
  }

  try {
    brainstormRecognition = new SpeechRecognition();
    brainstormRecognition.continuous = true;
    brainstormRecognition.interimResults = true;
    
    // Sprache an aktuelle App-Sprache anpassen
    const langMap = { de: 'de-DE', en: 'en-US', fr: 'fr-FR', it: 'it-IT', es: 'es-ES', el: 'el-GR' };
    brainstormRecognition.lang = (typeof currentLang !== 'undefined' && langMap[currentLang]) ? langMap[currentLang] : 'de-DE';

    const livePill = document.getElementById('brainstorm-live-transcript');

    brainstormRecognition.onstart = () => {
      isBrainstormRecording = true;
      updateBrainstormMicBtnUI(true);
      if (livePill) {
        livePill.classList.remove('hidden');
        livePill.innerText = tr({ de: '🎙️ Höre zu... sprich deinen Gedanken aus', en: '🎙️ Listening... speak your thoughts' });
      }
    };

    brainstormRecognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (livePill && interimTranscript) {
        livePill.innerText = `🎙️ „${interimTranscript.trim()}“`;
      }

      if (finalTranscript.trim()) {
        const text = finalTranscript.trim();
        addBrainstormIdea(text, 'idea');
        if (livePill) {
          livePill.innerText = `✓ „${text}“ als Idee erfasst`;
          setTimeout(() => {
            if (isBrainstormRecording && livePill) {
              livePill.innerText = tr({ de: '🎙️ Höre zu... weiter sprechen', en: '🎙️ Listening... continue speaking' });
            }
          }, 1500);
        }
      }
    };

    brainstormRecognition.onerror = (e) => {
      console.warn('[Brainstorm] Speech recognition error:', e);
      stopBrainstormRecording();
    };

    brainstormRecognition.onend = () => {
      if (isBrainstormRecording) {
        stopBrainstormRecording();
      }
    };

    brainstormRecognition.start();
  } catch (e) {
    console.warn('[Brainstorm] Failed to start recognition:', e);
    stopBrainstormRecording();
  }
}

function stopBrainstormRecording() {
  isBrainstormRecording = false;
  if (brainstormRecognition) {
    try { brainstormRecognition.stop(); } catch (e) {}
    brainstormRecognition = null;
  }
  updateBrainstormMicBtnUI(false);
  const livePill = document.getElementById('brainstorm-live-transcript');
  if (livePill) livePill.classList.add('hidden');
}

function updateBrainstormMicBtnUI(recording) {
  const micBtn = document.getElementById('brainstorm-mic-btn');
  if (!micBtn) return;
  if (recording) {
    micBtn.className = 'p-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/30 animate-pulse transition cursor-pointer';
    micBtn.innerHTML = '<i data-lucide="mic-off" class="w-4 h-4"></i><span>Aufnahme stoppen</span>';
  } else {
    micBtn.className = 'p-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer';
    micBtn.innerHTML = '<i data-lucide="mic" class="w-4 h-4"></i><span>Sprechen (Mic)</span>';
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// --- IDEEN VERWALTUNG ---
function addBrainstormIdea(text, tag = 'idea') {
  if (!text || !text.trim()) return;
  
  // Bulk-Erkennung: Falls mehrzeilig, jede Zeile einzeln hinzufügen
  const lines = text.split(/\r?\n/).map(l => l.replace(/^[-*•\d.]+\s*/, '').trim()).filter(l => l.length > 0);
  
  lines.forEach(line => {
    brainstormIdeas.unshift({
      id: 'idea_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      text: line,
      tag: tag || 'idea',
      starred: false,
      createdAt: new Date().toISOString()
    });
  });

  saveBrainstormIdeas();
  renderBrainstormUI();

  if (typeof showToast === 'function') {
    showToast(tr({
      de: lines.length > 1 ? `💡 ${lines.length} Ideen hinzugefügt!` : '💡 Idee erfasst!',
      en: lines.length > 1 ? `💡 ${lines.length} ideas added!` : '💡 Idea captured!',
      fr: lines.length > 1 ? `💡 ${lines.length} idées ajoutées !` : '💡 Idée enregistrée !',
      it: lines.length > 1 ? `💡 ${lines.length} idee aggiunte!` : '💡 Idea acquisita!',
      es: lines.length > 1 ? `💡 ¡${lines.length} ideas añadidas!` : '💡 ¡Idea capturada!',
      el: lines.length > 1 ? `💡 ${lines.length} ιδέες προστέθηκαν!` : '💡 Η ιδέα καταγράφηκε!'
    }));
  }
}

function handleBrainstormInputKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const input = document.getElementById('brainstorm-quick-input');
    const tagSelect = document.getElementById('brainstorm-tag-select');
    if (input && input.value.trim()) {
      addBrainstormIdea(input.value.trim(), tagSelect ? tagSelect.value : 'idea');
      input.value = '';
    }
  }
}

function submitBrainstormInput() {
  const input = document.getElementById('brainstorm-quick-input');
  const tagSelect = document.getElementById('brainstorm-tag-select');
  if (input && input.value.trim()) {
    addBrainstormIdea(input.value.trim(), tagSelect ? tagSelect.value : 'idea');
    input.value = '';
    if (typeof input.focus === 'function') input.focus();
  }
}

function toggleStarIdea(id) {
  const item = brainstormIdeas.find(i => i.id === id);
  if (item) {
    item.starred = !item.starred;
    saveBrainstormIdeas();
    renderBrainstormUI();
  }
}

function setIdeaTag(id, newTag) {
  const item = brainstormIdeas.find(i => i.id === id);
  if (item && BRAINSTORM_TAGS[newTag]) {
    item.tag = newTag;
    saveBrainstormIdeas();
    renderBrainstormUI();
  }
}

function deleteBrainstormIdea(id) {
  if (id && typeof trackTombstone === 'function') {
    trackTombstone(id);
  }
  brainstormIdeas = brainstormIdeas.filter(i => i.id !== id);
  saveBrainstormIdeas();
  renderBrainstormUI();
}


async function clearAllBrainstormIdeas() {
  if (brainstormIdeas.length === 0) return;
  const msg = tr({
    de: 'Möchtest du wirklich alle gesammelten Ideen in dieser Brainstorming-Session löschen?',
    en: 'Are you sure you want to clear all collected ideas in this brainstorming session?'
  });
  const confirmed = typeof showConfirmDialog === 'function' ? await showConfirmDialog({
    title: typeof tr === 'function' ? tr({ de: 'Alle Ideen löschen?', en: 'Clear all ideas?' }) : 'Alle Ideen löschen?',
    message: msg,
    confirmText: typeof tr === 'function' ? tr({ de: 'Löschen', en: 'Delete' }) : 'Löschen',
    isDanger: true,
    icon: 'trash-2'
  }) : confirm(msg);

  if (confirmed) {
    brainstormIdeas = [];
    saveBrainstormIdeas();
    renderBrainstormUI();
  }
}

// --- 1-KLICK VERKNÜPFUNG MIT TASK-BOARD & NOTIZEN ---
function transferIdeaToBoard(id, targetColumn) {
  const item = brainstormIdeas.find(i => i.id === id);
  if (!item) return;

  if (typeof saveHistory === 'function') saveHistory();
  const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : null;
  if (!curItems) return;

  const targetTitle = {
    heute: tr({ de: 'Heute', en: 'Today' }),
    morgen: tr({ de: 'Demnächst', en: 'Next' }),
    spaeter: tr({ de: 'Später', en: 'Someday' }),
    notes: tr({ de: 'Notizen', en: 'Notes' }),
    termine: tr({ de: 'Termine', en: 'Appointments' })
  };

  if (targetColumn === 'notes') {
    if (!curItems.notes) curItems.notes = [];
    curItems.notes.push(item.text);
  } else if (targetColumn === 'termine') {
    if (!curItems.termine) curItems.termine = [];
    const today = (typeof getLocalDateISO === 'function') ? getLocalDateISO() : new Date().toISOString().split('T')[0];
    curItems.termine.push({
      task: item.text,
      date: today,
      time: '12:00',
      location: ''
    });
  } else {
    if (!curItems[targetColumn]) curItems[targetColumn] = [];
    curItems[targetColumn].push(item.text);
  }

  if (typeof saveState === 'function') saveState();
  if (typeof renderApp === 'function') renderApp();

  if (typeof showToast === 'function') {
    showToast(tr({
      de: `🚀 Idee erfolgreich nach „${targetTitle[targetColumn] || targetColumn}“ übertragen!`,
      en: `🚀 Idea successfully transferred to "${targetTitle[targetColumn] || targetColumn}"!`,
      fr: `🚀 Idée transférée vers « ${targetTitle[targetColumn] || targetColumn} » !`,
      it: `🚀 Idea trasferita in "${targetTitle[targetColumn] || targetColumn}"!`,
      es: `🚀 ¡Idea transferida a "${targetTitle[targetColumn] || targetColumn}"!`,
      el: `🚀 Η ιδέα μεταφέρθηκε επιτυχώς!`
    }));
  }
}

function expandIdeaToMicroSteps(id) {
  const item = brainstormIdeas.find(i => i.id === id);
  if (!item) return;

  // Erstelle 3 klare, mundgerechte Micro-Steps aus der Idee
  const baseText = item.text;
  const step1 = `${tr({ de: '1. Recherche & Vorbereitung für', en: '1. Research & preparation for' })}: ${baseText}`;
  const step2 = `${tr({ de: '2. Ersten Entwurf / Prototyp erstellen für', en: '2. Create first draft / prototype for' })}: ${baseText}`;
  const step3 = `${tr({ de: '3. Finalisieren & Umsetzen von', en: '3. Finalize & implement' })}: ${baseText}`;

  if (typeof saveHistory === 'function') saveHistory();
  const curItems = (typeof getCurrentWorkspaceItems === 'function') ? getCurrentWorkspaceItems() : null;
  if (curItems) {
    if (!curItems.morgen) curItems.morgen = [];
    curItems.morgen.push(step1);
    curItems.morgen.push(step2);
    curItems.morgen.push(step3);
    if (typeof saveState === 'function') saveState();
    if (typeof renderApp === 'function') renderApp();
  }

  if (typeof showToast === 'function') {
    showToast(tr({
      de: '✨ 3 Micro-Steps wurden in „Demnächst“ angelegt!',
      en: '✨ 3 micro-steps added to "Next" column!',
      fr: '✨ 3 micro-étapes créées !',
      it: '✨ 3 micro-passi creati!',
      es: '✨ ¡3 micro-pasos creados!',
      el: '✨ Δημιουργήθηκαν 3 μικρο-βήματα!'
    }));
  }
}

// --- EXPORTIEREN & KOPIEREN ---
function copyBrainstormAsMarkdown() {
  if (brainstormIdeas.length === 0) return;
  const lines = brainstormIdeas.map(item => {
    const star = item.starred ? '⭐ ' : '';
    const tagInfo = BRAINSTORM_TAGS[item.tag] ? `${BRAINSTORM_TAGS[item.tag].icon} ` : '';
    return `- [ ] ${star}${tagInfo}${item.text}`;
  });
  const text = `# Brainstorming - ${new Date().toLocaleDateString()}\n\n` + lines.join('\n');
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (typeof showToast === 'function') showToast(tr({ de: '📋 Als Markdown in Zwischenablage kopiert!', en: '📋 Copied as Markdown to clipboard!' }));
    });
  }
}

// --- KREATIVITÄTS-IMPULSE (SPARKS) ---
function nextCreativeSpark() {
  currentSparksIndex = (currentSparksIndex + 1) % CREATIVE_SPARKS.length;
  renderCreativeSparkUI();
}

function renderCreativeSparkUI() {
  const sparkEl = document.getElementById('brainstorm-spark-text');
  if (!sparkEl) return;
  const spark = CREATIVE_SPARKS[currentSparksIndex];
  sparkEl.innerText = tr(spark);
}

// --- RENDERING UI ---
function setBrainstormFilter(filter) {
  brainstormActiveFilter = filter;
  renderBrainstormUI();
}

function handleBrainstormSearch(query) {
  brainstormSearchQuery = (query || '').toLowerCase().trim();
  renderBrainstormUI();
}

function renderBrainstormUI() {
  const listEl = document.getElementById('brainstorm-ideas-list');
  const countEl = document.getElementById('brainstorm-count-badge');
  if (!listEl) return;

  renderCreativeSparkUI();

  let filtered = brainstormIdeas.slice();

  if (brainstormActiveFilter === 'starred') {
    filtered = filtered.filter(i => i.starred);
  } else if (brainstormActiveFilter !== 'all') {
    filtered = filtered.filter(i => i.tag === brainstormActiveFilter);
  }

  if (brainstormSearchQuery) {
    filtered = filtered.filter(i => i.text.toLowerCase().includes(brainstormSearchQuery));
  }

  if (countEl) {
    countEl.innerText = `${brainstormIdeas.length} ${tr({ de: 'Ideen', en: 'Ideas' })}`;
  }

  // Filter Tabs Styling aktualisieren
  const filterBtns = document.querySelectorAll('.brainstorm-filter-btn');
  filterBtns.forEach(btn => {
    const f = btn.getAttribute('data-filter');
    if (f === brainstormActiveFilter) {
      btn.className = 'brainstorm-filter-btn px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs';
    } else {
      btn.className = 'brainstorm-filter-btn px-2.5 py-1 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition cursor-pointer';
    }
  });

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center text-center text-gray-500 space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-1">
          💡
        </div>
        <p class="text-xs font-semibold text-gray-400">
          ${brainstormIdeas.length === 0 
            ? tr({ de: 'Noch keine Ideen erfasst. Tippe oben oder nutze das Mikrofon!', en: 'No ideas captured yet. Type above or speak with the microphone!' }) 
            : tr({ de: 'Keine Ideen entsprechen dem aktuellen Filter.', en: 'No ideas match the current filter.' })}
        </p>
        <p class="text-[11px] text-gray-500 max-w-xs">
          ${tr({ de: 'Sammle Gedanken völlig unzensiert – sortiere und überführe sie später mit 1 Klick ins Board.', en: 'Capture thoughts freely – organize and transfer them to your board with 1 click later.' })}
        </p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = '';

  if (brainstormViewMode === 'cluster') {
    listEl.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-1 custom-scrollbar flex-1';
    const tagKeys = ['quickwin', 'project', 'idea', 'goal', 'question'];
    tagKeys.forEach(tKey => {
      const tagItems = filtered.filter(i => i.tag === tKey);
      if (tagItems.length === 0 && brainstormActiveFilter !== 'all' && brainstormActiveFilter !== tKey) return;
      const tagConf = BRAINSTORM_TAGS[tKey];
      const col = document.createElement('div');
      col.className = 'p-3 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-2 min-w-0';
      col.innerHTML = `
        <div class="flex items-center justify-between pb-1.5 border-b border-white/10 shrink-0">
          <div class="flex items-center gap-1.5">
            <span>${tagConf.icon}</span>
            <span class="text-xs font-bold text-gray-200">${tagConf.label.de || tKey}</span>
          </div>
          <span class="px-1.5 py-0.2 rounded-md bg-white/5 text-[9.5px] font-mono font-bold text-teal-300">${tagItems.length}</span>
        </div>
        <div class="space-y-2 flex-1 overflow-y-auto max-h-[360px] custom-scrollbar pr-0.5">
          ${tagItems.length === 0 ? '<div class="text-[10px] text-gray-500 italic py-2 text-center">Keine Einträge</div>' : ''}
          ${tagItems.map(item => `
            <div class="group p-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-teal-500/40 rounded-xl transition flex flex-col gap-1.5 shadow-xs text-xs">
              <div class="flex items-start justify-between gap-1">
                <span class="text-gray-200 font-medium leading-relaxed select-text">${escapeHtml(item.text)}</span>
                <button onclick="deleteBrainstormIdea('${item.id}')" class="opacity-0 group-hover:opacity-100 p-0.5 text-gray-500 hover:text-red-400 transition cursor-pointer shrink-0">
                  <i data-lucide="trash-2" class="w-3 h-3"></i>
                </button>
              </div>
              <div class="flex items-center gap-1 pt-1 border-t border-white/5 flex-wrap">
                <button onclick="transferIdeaToBoard('${item.id}', 'heute')" class="px-1.5 py-0.5 rounded bg-teal-500/15 hover:bg-teal-500/30 text-teal-300 text-[9px] font-bold transition cursor-pointer">Heute</button>
                <button onclick="transferIdeaToBoard('${item.id}', 'morgen')" class="px-1.5 py-0.5 rounded bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 text-[9px] font-bold transition cursor-pointer">Demnächst</button>
                <button onclick="expandIdeaToMicroSteps('${item.id}')" class="px-1.5 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 text-[9px] font-bold transition cursor-pointer">Steps ✨</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      listEl.appendChild(col);
    });
    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') lucide.createIcons();
    return;
  }

  listEl.className = 'space-y-2.5 overflow-y-auto pr-1 custom-scrollbar flex-1';

  filtered.forEach(item => {
    const tagConfig = BRAINSTORM_TAGS[item.tag] || BRAINSTORM_TAGS.idea;
    const tagLabel = tr(tagConfig.label);
    const starIcon = item.starred ? '⭐' : '☆';
    const starClass = item.starred ? 'text-amber-400 font-bold' : 'text-gray-500 hover:text-amber-300';

    const card = document.createElement('div');
    card.className = 'group relative p-3 bg-white/[0.035] hover:bg-white/[0.06] border border-white/10 hover:border-teal-500/40 rounded-2xl transition flex flex-col gap-2 shadow-xs';
    card.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="brainstorm-tag-badge px-2 py-0.5 rounded-lg text-[10px] font-bold border ${tagConfig.color} flex items-center gap-1 cursor-pointer hover:opacity-80 transition" title="${tr({ de: 'Klicken zum Ändern der Kategorie', en: 'Click to change category' })}">
            <span>${tagConfig.icon}</span>
            <span>${tagLabel}</span>
          </span>
          <button onclick="toggleStarIdea('${item.id}')" class="p-1 text-sm ${starClass} transition cursor-pointer" title="${tr({ de: 'Favorit umschalten', en: 'Toggle favorite' })}">
            ${starIcon}
          </button>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
          <button onclick="deleteBrainstormIdea('${item.id}')" aria-label="${tr({ de: 'Idee löschen', en: 'Delete idea' })}" class="p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-white/10 transition cursor-pointer" title="${tr({ de: 'Idee löschen', en: 'Delete idea' })}">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>

      <!-- Idea Text -->
      <div class="text-xs text-gray-200 font-medium leading-relaxed break-normal whitespace-pre-wrap select-text">
        ${escapeHtml(item.text)}
      </div>

      <!-- Quick Transfer Footer -->
      <div class="pt-2 mt-1 border-t border-white/5 flex items-center justify-between gap-1 flex-wrap">
        <span class="text-[10px] text-gray-500 font-mono">${tr({ de: 'Übertragen nach:', en: 'Transfer to:' })}</span>
        <div class="flex items-center gap-1 flex-wrap">
          <button onclick="transferIdeaToBoard('${item.id}', 'heute')" class="px-2 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 hover:text-white text-[10px] font-bold transition cursor-pointer flex items-center gap-1">
            <i data-lucide="check-circle" class="w-3 h-3"></i>
            <span>Heute</span>
          </button>
          <button onclick="transferIdeaToBoard('${item.id}', 'morgen')" class="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 hover:text-white text-[10px] font-bold transition cursor-pointer flex items-center gap-1">
            <i data-lucide="arrow-right" class="w-3 h-3"></i>
            <span>Demnächst</span>
          </button>
          <button onclick="transferIdeaToBoard('${item.id}', 'spaeter')" class="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 hover:text-white text-[10px] font-bold transition cursor-pointer flex items-center gap-1">
            <i data-lucide="clock" class="w-3 h-3"></i>
            <span>Später</span>
          </button>
          <button onclick="transferIdeaToBoard('${item.id}', 'notes')" class="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-white text-[10px] font-bold transition cursor-pointer flex items-center gap-1">
            <i data-lucide="sticky-note" class="w-3 h-3"></i>
            <span>Notiz</span>
          </button>
          <button onclick="expandIdeaToMicroSteps('${item.id}')" class="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-white text-[10px] font-bold transition cursor-pointer flex items-center gap-1" title="${tr({ de: 'In 3 Micro-Steps zerlegen', en: 'Break down into 3 micro-steps' })}">
            <i data-lucide="layers" class="w-3 h-3"></i>
            <span>Steps ✨</span>
          </button>
        </div>
      </div>
    `;

    // Tag click to cycle tag
    const tagBadge = card.querySelector('.brainstorm-tag-badge');
    if (tagBadge) {
      tagBadge.onclick = (e) => {
        e.stopPropagation();
        cycleIdeaTag(item.id);
      };
    }

    if (listEl && typeof listEl.appendChild === 'function') {
      listEl.appendChild(card);
    }
  });

  if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }
}

function cycleIdeaTag(id) {
  const item = brainstormIdeas.find(i => i.id === id);
  if (!item) return;
  const tagKeys = Object.keys(BRAINSTORM_TAGS);
  const currentIdx = tagKeys.indexOf(item.tag);
  const nextTag = tagKeys[(currentIdx + 1) % tagKeys.length];
  setIdeaTag(id, nextTag);
}

// Global Window & GlobalThis Bindings für Event-Handler und Bundles
if (typeof window !== 'undefined') {
  window.openBrainstormModal = openBrainstormModal;
  window.closeBrainstormModal = closeBrainstormModal;
  window.toggleBrainstormRecording = toggleBrainstormRecording;
  window.startBrainstormRecording = startBrainstormRecording;
  window.stopBrainstormRecording = stopBrainstormRecording;
  window.addBrainstormIdea = addBrainstormIdea;
  window.handleBrainstormInputKeydown = handleBrainstormInputKeydown;
  window.submitBrainstormInput = submitBrainstormInput;
  window.toggleStarIdea = toggleStarIdea;
  window.setIdeaTag = setIdeaTag;
  window.cycleIdeaTag = cycleIdeaTag;
  window.deleteBrainstormIdea = deleteBrainstormIdea;
  window.clearAllBrainstormIdeas = clearAllBrainstormIdeas;
  window.transferIdeaToBoard = transferIdeaToBoard;
  window.expandIdeaToMicroSteps = expandIdeaToMicroSteps;
  window.copyBrainstormAsMarkdown = copyBrainstormAsMarkdown;
  window.nextCreativeSpark = nextCreativeSpark;
  window.renderCreativeSparkUI = renderCreativeSparkUI;
  window.setBrainstormFilter = setBrainstormFilter;
  window.handleBrainstormSearch = handleBrainstormSearch;
  window.renderBrainstormUI = renderBrainstormUI;
  window.loadBrainstormIdeas = loadBrainstormIdeas;
  window.saveBrainstormIdeas = saveBrainstormIdeas;

  window.setBrainstormViewMode = setBrainstormViewMode;
  window.copyBrainstormAsMindmap = copyBrainstormAsMindmap;
  window.exportBrainstormAsActionPlan = exportBrainstormAsActionPlan;

}

if (typeof globalThis !== 'undefined') {
  globalThis.openBrainstormModal = openBrainstormModal;
  globalThis.closeBrainstormModal = closeBrainstormModal;
  globalThis.toggleBrainstormRecording = toggleBrainstormRecording;
  globalThis.startBrainstormRecording = startBrainstormRecording;
  globalThis.stopBrainstormRecording = stopBrainstormRecording;
  globalThis.addBrainstormIdea = addBrainstormIdea;
  globalThis.handleBrainstormInputKeydown = handleBrainstormInputKeydown;
  globalThis.submitBrainstormInput = submitBrainstormInput;
  globalThis.toggleStarIdea = toggleStarIdea;
  globalThis.setIdeaTag = setIdeaTag;
  globalThis.cycleIdeaTag = cycleIdeaTag;
  globalThis.deleteBrainstormIdea = deleteBrainstormIdea;
  globalThis.clearAllBrainstormIdeas = clearAllBrainstormIdeas;
  globalThis.transferIdeaToBoard = transferIdeaToBoard;
  globalThis.expandIdeaToMicroSteps = expandIdeaToMicroSteps;
  globalThis.copyBrainstormAsMarkdown = copyBrainstormAsMarkdown;
  globalThis.nextCreativeSpark = nextCreativeSpark;
  globalThis.renderCreativeSparkUI = renderCreativeSparkUI;
  globalThis.setBrainstormFilter = setBrainstormFilter;
  globalThis.handleBrainstormSearch = handleBrainstormSearch;
  globalThis.renderBrainstormUI = renderBrainstormUI;
  globalThis.loadBrainstormIdeas = loadBrainstormIdeas;
  globalThis.saveBrainstormIdeas = saveBrainstormIdeas;

  globalThis.setBrainstormViewMode = setBrainstormViewMode;
  globalThis.copyBrainstormAsMindmap = copyBrainstormAsMindmap;
  globalThis.exportBrainstormAsActionPlan = exportBrainstormAsActionPlan;

}
