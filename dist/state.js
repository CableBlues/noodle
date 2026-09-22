/**
 * ============================================================================
 * Noodle - State Management & Datenpersistenz (state.js)
 * ============================================================================
 * Verwaltet den gesamten reaktiven Zustand der Applikation:
 * - Aufgaben-Listen (Personal & Work Workspace)
 * - Erledigte Aufgaben, Archiv & Wiederherstellung
 * - Historie & Undo-Stack (bis zu 20 Schritte)
 * - Schema-Versionierung & automatische Migrationen
 * - Fallback-Trimming bei QuotaExceeded-Fehlern
 * ============================================================================
 */

// Grundlegende Konfiguration & globale State-Deklarationen
let currentLang = localStorage.getItem('flowPlannerLanguage') || 'en';
let rawTheme = localStorage.getItem('flowPlannerTheme') || 'aurora';
let currentTheme = ['mono-hand', 'parchment', 'minimalist-light', 'terracotta-light'].includes(rawTheme) ? 'aurora' : rawTheme;
let isMinimalist = localStorage.getItem('flowPlannerMinimalist') === 'true';
let openTaskAddColumns = {};
let categoriesOrder = null;
let state = null;
let historyStack = [];

function loadCategoriesOrder() {
  try {
    const saved = localStorage.getItem('flowPlannerCategoriesOrder') || localStorage.getItem('flow_categories_order');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('[State] loadCategoriesOrder warning:', e);
  }
  
  // Standard-Layout
  return [
    ['daily', 'sun'],
    ['weekly', 'home'],
    ['todo', 'list-todo'],
    ['done', 'check-circle-2'],
    ['termine', 'calendar'],
    ['notes', 'file-text'],
    ['occasionally', 'clock']
  ];
}

function loadWorkCategoriesOrder() {
  try {
    const saved = localStorage.getItem('flowPlannerWorkCategoriesOrder') || localStorage.getItem('flow_work_categories_order');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('[State] loadWorkCategoriesOrder warning:', e);
  }
  
  return [
    ['work_focus', 'target'],
    ['work_in_progress', 'zap'],
    ['work_waiting', 'hourglass'],
    ['work_backlog', 'folder-kanban'],
    ['done', 'check-circle'],
    ['termine', 'clock'],
    ['notes', 'sticky-note']
  ];
}

function loadStudyCategoriesOrder() {
  try {
    const saved = localStorage.getItem('flowPlannerStudyCategoriesOrder') || localStorage.getItem('flow_study_categories_order');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('[State] loadStudyCategoriesOrder warning:', e);
  }
  
  return [
    ['study_focus', 'target'],
    ['study_modules', 'book-open'],
    ['study_submissions', 'clock'],
    ['study_deep', 'brain'],
    ['done', 'check-circle'],
    ['termine', 'calendar'],
    ['notes', 'file-text']
  ];
}

let workCategoriesOrder = null;
const WORK_CATEGORIES_ORDER = [
  ['work_focus', 'target'],
  ['work_in_progress', 'zap'],
  ['work_waiting', 'hourglass'],
  ['work_backlog', 'folder-kanban'],
  ['done', 'check-circle'],
  ['termine', 'clock'],
  ['notes', 'sticky-note']
];

let studyCategoriesOrder = null;
const STUDY_CATEGORIES_ORDER = [
  ['study_focus', 'target'],
  ['study_modules', 'book-open'],
  ['study_submissions', 'clock'],
  ['study_deep', 'brain'],
  ['done', 'check-circle'],
  ['termine', 'calendar'],
  ['notes', 'file-text']
];

const DEFAULT_WORK_TASKS_BY_LANG = {
  de: {
    work_focus: ['🎯 Wichtigste Tagesaufgabe (Must-Do)', '📧 E-Mails & Prioritäten sortieren (15 Min.)'],
    work_in_progress: ['⚡ Projekt-Konzept ausarbeiten', '📞 Kundenanfrage beantworten'],
    work_waiting: ['⏳ Feedback von Kollege/Chef zu Entwurf', '📄 Angebot Freigabe Kunde A'],
    work_backlog: ['📋 Dokumentation aktualisieren', '📊 Monatsbericht vorbereiten', '💡 Recherchen Q4'],
    termine: ['📅 Wöchentliches Team-Sync (Mo 10:00)'],
    notes: ['📌 Wichtige Links & Notizen zum aktuellen Sprint...']
  },
  en: {
    work_focus: ['🎯 Key priority of the day (Must-Do)', '📧 Sort emails & daily priorities (15 min)'],
    work_in_progress: ['⚡ Draft project concept', '📞 Answer client inquiry'],
    work_waiting: ['⏳ Waiting on design feedback', '📄 Client invoice approval'],
    work_backlog: ['📋 Update documentation', '📊 Prepare monthly report', '💡 Q4 Research'],
    termine: ['📅 Weekly Team Sync (Mon 10:00 AM)'],
    notes: ['📌 Key links & scratchpad for current sprint...']
  },
  es: {
    work_focus: ['🎯 Prioridad clave del día (Must-Do)', '📧 Revisar correos y prioridades'],
    work_in_progress: ['⚡ Elaborar concepto del proyecto', '📞 Responder consulta de cliente'],
    work_waiting: ['⏳ Esperando comentarios de diseño', '📄 Aprobación de factura'],
    work_backlog: ['📋 Actualizar documentación', '📊 Preparar informe mensual'],
    termine: ['📅 Sincronización semanal de equipo'],
    notes: ['📌 Notas clave y enlaces del sprint...']
  },
  fr: {
    work_focus: ['🎯 Priorité clé du jour (Must-Do)', '📧 Trier les e-mails et priorités'],
    work_in_progress: ['⚡ Rédiger le concept du projet', '📞 Répondre à la demande client'],
    work_waiting: ['⏳ En attente du retour client', '📄 Validation du devis'],
    work_backlog: ['📋 Mettre à jour la documentation', '📊 Préparer le rapport mensuel'],
    termine: ['📅 Réunion d\'équipe hebdomadaire'],
    notes: ['📌 Notes et liens importants...']
  },
  it: {
    work_focus: ['🎯 Priorità chiave del giorno (Must-Do)', '📧 Controllare email e priorità'],
    work_in_progress: ['⚡ Sviluppare concetto del progetto', '📞 Rispondere alla richiesta del cliente'],
    work_waiting: ['⏳ In attesa di feedback', '📄 Approvazione preventivo'],
    work_backlog: ['📋 Aggiornare documentazione', '📊 Preparare report mensile'],
    termine: ['📅 Sync settimanale del team'],
    notes: ['📌 Note e link importanti...']
  },
  el: {
    work_focus: ['🎯 Κύρια προτεραιότητα ημέρας (Must-Do)', '📧 Έλεγχος email & προτεραιοτήτων'],
    work_in_progress: ['⚡ Σύνταξη σχεδίου έργου', '📞 Απάντηση σε αίτημα πελάτη'],
    work_waiting: ['⏳ Αναμονή για σχόλια', '📄 Έγκριση προσφοράς'],
    work_backlog: ['📋 Ενημέρωση τεκμηρίωσης', '📊 Προετοιμασία μηνιαίας αναφοράς'],
    termine: ['📅 Εβδομαδιαίος συγχρονισμός ομάδας'],
    notes: ['📌 Σημειώσεις & σύνδεσμοι...']
  }
};

const DEFAULT_STUDY_TASKS_BY_LANG = {
  de: {
    study_focus: ['🎯 Tages-Lernziel: Skript Kapitel 3 durcharbeiten', '⏱️ 3x 45-Minuten Pomodoro Deep-Study'],
    study_modules: ['📚 Modul 1: Vorlesungs-Folien wiederholen', '📐 Modul 2: Übungsaufgaben rechnen', '🔬 Modul 3: Laborbericht / Skripte sichten'],
    study_submissions: ['⏳ Übungsblatt 4 abgeben (Deadline Do 23:59)', '📝 Seminararbeit: Einleitung & Gliederung einreichen'],
    study_deep: ['🧠 Zusammenfassung Modul A anfertigen', '🃏 30 Karteikarten wiederholen (Spaced Repetition)', '📑 Altklausuren 2023/24 unter Zeitlimit rechnen'],
    termine: ['⚠️ Klausur-Anmeldefrist nicht verpassen!', '👨‍🏫 Sprechstunde Dozent (Mi 14:00 Uhr)'],
    notes: ['📖 Literatur-Quellen, Bib-Links & Vorlesungs-Notizen...']
  },
  en: {
    study_focus: ['🎯 Daily Study Goal: Master Chapters 3 & 4', '⏱️ 3x 45-Minute Deep Focus Pomodoros'],
    study_modules: ['📚 Course 1: Review lecture slides', '📐 Course 2: Solve practice problem set', '🔬 Course 3: Read lab script & research notes'],
    study_submissions: ['⏳ Assignment 4 submission (Due Thu 11:59 PM)', '📝 Term paper: Submit outline & intro draft'],
    study_deep: ['🧠 Create summary cheat-sheet for Exam A', '🃏 Review 30 flashcards (Spaced Repetition)', '📑 Practice mock exams under time constraint'],
    termine: ['⚠️ Exam registration deadline!', '👨‍🏫 Professor office hours (Wed 2:00 PM)'],
    notes: ['📖 Bibliography links, lecture scratchpad & quotes...']
  },
  es: {
    study_focus: ['🎯 Objetivo de estudio: Repasar capítulo 3', '⏱️ 3 sesiones Pomodoro de estudio profundo'],
    study_modules: ['📚 Asignatura 1: Revisar diapositivas', '📐 Asignatura 2: Resolver ejercicios prácticos', '🔬 Asignatura 3: Lecturas complementarias'],
    study_submissions: ['⏳ Entrega de ejercicios (Jueves 23:59)', '📝 Trabajo de curso: Borrador inicial'],
    study_deep: ['🧠 Resumen temario examen', '🃏 Repasar tarjetas de memoria', '📑 Exámenes de años anteriores'],
    termine: ['⚠️ Límite de inscripción a exámenes', '👨‍🏫 Tutoría profesor (Mié 14:00)'],
    notes: ['📖 Bibliografía, enlaces de biblioteca y notas...']
  },
  fr: {
    study_focus: ['🎯 Objectif d\'étude : Travailler le chapitre 3', '⏱️ 3 sessions Pomodoro de travail intense'],
    study_modules: ['📚 Cours 1 : Relire les transparents', '📐 Cours 2 : Faire la fiche de TD', '🔬 Cours 3 : Notes de recherche'],
    study_submissions: ['⏳ Rendu du devoir (Jeudi 23h59)', '📝 Mémoire : Rédiger le plan détaillé'],
    study_deep: ['🧠 Fiche de révision pour l\'examen', '🃏 Réviser les flashcards (Répétition espacée)', '📑 Annales d\'examens 2023/24'],
    termine: ['⚠️ Date limite d\'inscription aux examens', '👨‍🏫 Heure de permanence professeur (Mer 14h)'],
    notes: ['📖 Références bibliographiques & notes de cours...']
  },
  it: {
    study_focus: ['🎯 Obiettivo di studio: Capitolo 3 & 4', '⏱️ 3 sessioni Pomodoro di studio profondo'],
    study_modules: ['📚 Corso 1: Rivedere le slide della lezione', '📐 Corso 2: Risolvere esercizi pratici', '🔬 Corso 3: Letture di approfondimento'],
    study_submissions: ['⏳ Consegna esercitazione (Giovedì 23:59)', '📝 Tesina: Bozze e indice argomenti'],
    study_deep: ['🧠 Sintesi e schemi per l\'esame', '🃏 Ripasso 30 flashcard (Ripetizione spaziata)', '📑 Simulazione prove d\'esame passate'],
    termine: ['⚠️ Scadenza iscrizione esami', '👨‍🏫 Ricevimento professore (Mer 14:00)'],
    notes: ['📖 Fonti bibliografiche, link biblioteca & appunti...']
  },
  el: {
    study_focus: ['🎯 Στόχος ημέρας: Κεφάλαιο 3 & 4', '⏱️ 3 συνεδρίες Pomodoro βαθιάς μελέτης'],
    study_modules: ['📚 Μάθημα 1: Επανάληψη διαφανειών', '📐 Μάθημα 2: Επίλυση ασκήσεων', '🔬 Μάθημα 3: Μελέτη εργαστηρίου'],
    study_submissions: ['⏳ Παράδοση εργασίας (Πέμπτη 23:59)', '📝 Εξαμηνιαία εργασία: Προσχέδιο'],
    study_deep: ['🧠 Περίληψη & σχεδιαγράμματα για την εξεταστική', '🃏 Επανάληψη καρτών μνήμης', '📑 Παλαιά θέματα εξετάσεων'],
    termine: ['⚠️ Προθεσμία δήλωσης μαθημάτων/εξετάσεων', '👨‍🏫 Ώρες γραφείου καθηγητή (Τετ 14:00)'],
    notes: ['📖 Βιβλιογραφία, σύνδεσμοι βιβλιοθήκης & σημειώσεις...']
  }
};

function createDefaultWorkItems(lang) {
  const curL = lang || (typeof currentLang !== 'undefined' ? currentLang : 'de');
  const defaults = DEFAULT_WORK_TASKS_BY_LANG[curL] || DEFAULT_WORK_TASKS_BY_LANG['de'];
  return {
    work_focus: [...defaults.work_focus],
    work_in_progress: [...defaults.work_in_progress],
    work_waiting: [...defaults.work_waiting],
    work_backlog: [...defaults.work_backlog],
    termine: [...(defaults.termine || [])],
    notes: [...defaults.notes]
  };
}

function createDefaultStudyItems(lang) {
  const curL = lang || (typeof currentLang !== 'undefined' ? currentLang : 'de');
  const defaults = DEFAULT_STUDY_TASKS_BY_LANG[curL] || DEFAULT_STUDY_TASKS_BY_LANG['de'];
  return {
    study_focus: [...defaults.study_focus],
    study_modules: [...defaults.study_modules],
    study_submissions: [...defaults.study_submissions],
    study_deep: [...defaults.study_deep],
    termine: [...(defaults.termine || [])],
    notes: [...defaults.notes]
  };
}

function createDefaultCookingState() {
  return {
    pantryItems: [],
    recipes: [
      {
        id: 'pasta-tomate',
        title: 'Schnelle Tomaten-Pasta',
        duration: '15 Min',
        ingredients: ['Pasta', 'Tomaten', 'Knoblauch', 'Olivenöl', 'Basilikum'],
        steps: ['Wasser aufkochen und die Pasta darin garen.', 'Tomaten mit Knoblauch in Öl anschwitzen.', 'Pasta mit den Tomaten vermengen und mit Basilikum servieren.']
      },
      {
        id: 'wrap-huhn',
        title: 'Wrap mit Hähnchen und Gemüse',
        duration: '20 Min',
        ingredients: ['Wraps', 'Hähnchen', 'Salat', 'Gurke', 'Joghurt'],
        steps: ['Hähnchen kurz erwärmen.', 'Salat und Gurke vorbereiten.', 'Alles in den Wrap geben und mit Joghurt abschließen.']
      },
      {
        id: 'omelette',
        title: 'Frühstücks-Omelett',
        duration: '10 Min',
        ingredients: ['Eier', 'Käse', 'Spinat', 'Pfeffer', 'Salz'],
        steps: ['Eier verquirlen und würzen.', 'Spinat kurz in der Pfanne andünsten.', 'Eier hinzugeben, mit Käse füllen und zusammenklappen.']
      },
      {
        id: 'linsen-suppe',
        title: 'Schnelle Linsensuppe',
        duration: '25 Min',
        ingredients: ['Linsen', 'Karotten', 'Zwiebel', 'Gemüsebrühe', 'Kräuter'],
        steps: ['Zwiebel und Karotten anschwitzen.', 'Linsen und Brühe dazugeben und köcheln lassen.', 'Mit Kräutern würzen und servieren.']
      }
    ],
    activeRecipeId: null,
    activeRecipe: null
  };
}

function saveCategoriesOrder() {
  try {
    const ws = (typeof state !== 'undefined' && state && state.activeWorkspace) ? state.activeWorkspace : ((typeof window !== 'undefined' && window.state && window.state.activeWorkspace) ? window.state.activeWorkspace : 'private');
    if (ws === 'study') {
      const order = (typeof window !== 'undefined' && window.studyCategoriesOrder) ? window.studyCategoriesOrder : (studyCategoriesOrder || STUDY_CATEGORIES_ORDER);
      localStorage.setItem('flowPlannerStudyCategoriesOrder', JSON.stringify(order));
      localStorage.setItem('flow_study_categories_order', JSON.stringify(order));
    } else if (ws === 'work') {
      const order = (typeof window !== 'undefined' && window.workCategoriesOrder) ? window.workCategoriesOrder : (workCategoriesOrder || WORK_CATEGORIES_ORDER);
      localStorage.setItem('flowPlannerWorkCategoriesOrder', JSON.stringify(order));
      localStorage.setItem('flow_work_categories_order', JSON.stringify(order));
    } else {
      const order = (typeof window !== 'undefined' && window.categoriesOrder) ? window.categoriesOrder : categoriesOrder;
      localStorage.setItem('flowPlannerCategoriesOrder', JSON.stringify(order));
      localStorage.setItem('flow_categories_order', JSON.stringify(order));
    }
  } catch (err) {
    console.warn('[Categories] Error saving categories order:', err);
  }
}

function computeStringHash(str) {
  let hash = 0;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function getStableId(item, prefix = 'item') {
  if (!item) return null;
  if (typeof item === 'object' && item.id) return item.id;
  const str = typeof item === 'object' ? (item.task || item.name || item.text || item.title || JSON.stringify(item)) : String(item);
  return `${prefix}_h${computeStringHash(str)}`;
}

function generateStableId(prefix = 'item') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function ensureItemIdentity(item, fallbackPrefix = 'item') {
  if (!item) return null;
  const nowISO = new Date().toISOString();
  if (typeof item === 'string') {
    return {
      id: getStableId(item, fallbackPrefix),
      task: item,
      createdAt: nowISO,
      updatedAt: nowISO
    };
  }
  if (typeof item === 'object') {
    const copy = { ...item };
    if (!copy.id) {
      copy.id = getStableId(copy, fallbackPrefix);
    }
    if (!copy.createdAt) {
      copy.createdAt = nowISO;
    }
    if (!copy.updatedAt) {
      copy.updatedAt = copy.createdAt || nowISO;
    }
    clearTombstone(copy.id);
    return copy;
  }
  return item;
}

function trackTombstone(id) {
  if (!id) return;
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : null);
  if (!currentState) return;
  if (!currentState._tombstones || typeof currentState._tombstones !== 'object') {
    currentState._tombstones = {};
  }
  currentState._tombstones[id] = new Date().toISOString();
}

function clearTombstone(id) {
  if (!id) return;
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : null);
  if (currentState && currentState._tombstones && currentState._tombstones[id]) {
    delete currentState._tombstones[id];
  }
}


function getYearAndWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getCustomDefaults() {
  try {
    const raw = (typeof localStorage !== 'undefined') ? (localStorage.getItem('flow_custom_default_tasks') || localStorage.getItem('flowPlannerCustomDefaults')) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.warn('[State] getCustomDefaults warning:', e);
  }
  return null;
}

function saveCustomDefaults(customDefaults) {
  try {
    if (customDefaults && typeof customDefaults === 'object') {
      const serialized = JSON.stringify(customDefaults);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('flow_custom_default_tasks', serialized);
        localStorage.setItem('flowPlannerCustomDefaults', serialized);
      }
    } else {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('flow_custom_default_tasks');
        localStorage.removeItem('flowPlannerCustomDefaults');
      }
    }
  } catch (e) {
    console.warn('[State] saveCustomDefaults warning:', e);
  }
}

function migrateState(raw, lang) {
  const currentL = lang || (typeof currentLang !== 'undefined' ? currentLang : 'en');
  const localizedDefaults = (typeof DEFAULT_TASKS_BY_LANG !== 'undefined' && DEFAULT_TASKS_BY_LANG[currentL]) 
    ? DEFAULT_TASKS_BY_LANG[currentL] 
    : ((typeof DEFAULT_TASKS_BY_LANG !== 'undefined' && DEFAULT_TASKS_BY_LANG['en']) ? DEFAULT_TASKS_BY_LANG['en'] : { daily: [], weekly: [], occasionally: [] });
  const customDefaults = getCustomDefaults();
  const initDaily = (customDefaults && Array.isArray(customDefaults.daily)) ? customDefaults.daily : (localizedDefaults.daily || []);
  const initWeekly = (customDefaults && Array.isArray(customDefaults.weekly)) ? customDefaults.weekly : (localizedDefaults.weekly || []);
  const initOccasionally = (customDefaults && Array.isArray(customDefaults.occasionally)) ? customDefaults.occasionally : (localizedDefaults.occasionally || []);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentWeekStr = getYearAndWeek(new Date());

  if (!raw || typeof raw !== 'object') {
    return {
      version: 3,
      lastDate: todayStr,
      lastWeeklyResetWeek: currentWeekStr,
      activeWorkspace: 'private',
      _tombstones: {},
      items: {
        daily: [...initDaily],
        weekly: [...initWeekly],
        occasionally: [...initOccasionally],
        todo: [],
        termine: [],
        notes: []
      },
      done: [],
      archive: [],
      streak: 0,
      completedSteps: {},
      customSteps: {},
      workItems: typeof createDefaultWorkItems === 'function' ? createDefaultWorkItems(currentL) : {},
      workDone: [],
      studyItems: typeof createDefaultStudyItems === 'function' ? createDefaultStudyItems(currentL) : {},
      studyDone: [],
      sampleBannerDismissed: false,
      shoppingList: [],
      shoppingHistory: [],
      cooking: typeof createDefaultCookingState === 'function' ? createDefaultCookingState() : {},
      clarity: { streakDays: 0, lastCheckinDate: null, history: [], savedReasons: [] },
      userPlan: 'free' // 'free' | 'pro' — Grundlage für spätere Paywall-Logik
    };
  }

  const s = { ...raw };
  s.version = 3;
  if (!s.lastDate) s.lastDate = todayStr;
  if (!s.lastWeeklyResetWeek) s.lastWeeklyResetWeek = currentWeekStr;
  if (!s.userPlan || (s.userPlan !== 'free' && s.userPlan !== 'pro')) {
    s.userPlan = 'free'; // 'free' | 'pro' — Grundlage für spätere Paywall-Logik
  }

  // 0. Tombstones initialisieren & aufräumen (> 30 Tage)
  if (!s._tombstones || typeof s._tombstones !== 'object') {
    s._tombstones = {};
  } else {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    for (const [tId, tTime] of Object.entries(s._tombstones)) {
      const ts = new Date(tTime).getTime();
      if (isNaN(ts) || ts < thirtyDaysAgo) {
        delete s._tombstones[tId];
      }
    }
  }

  // 1. Items normalisieren
  if (!s.items || typeof s.items !== 'object') {
    s.items = {
      daily: [...(localizedDefaults.daily || [])],
      weekly: [...(localizedDefaults.weekly || [])],
      occasionally: [...(localizedDefaults.occasionally || [])],
      todo: [],
      termine: [],
      notes: []
    };
  } else {
    ['daily', 'weekly', 'occasionally', 'todo', 'termine'].forEach(k => {
      if (!Array.isArray(s.items[k])) {
        s.items[k] = [];
      }
    });
    if (typeof s.items.notes === 'string') {
      s.items.notes = s.items.notes.split('\n').map(x => x.trim()).filter(Boolean);
    } else if (!Array.isArray(s.items.notes)) {
      s.items.notes = [];
    }
  }

  // 2. Arrays & Basis-Eigenschaften
  if (!Array.isArray(s.done)) s.done = [];
  if (!Array.isArray(s.archive)) s.archive = [];
  if (typeof s.streak !== 'number') s.streak = 0;
  if (!s.completedSteps || typeof s.completedSteps !== 'object') s.completedSteps = {};
  if (!s.customSteps || typeof s.customSteps !== 'object') s.customSteps = {};
  if (s.sampleBannerDismissed === undefined) s.sampleBannerDismissed = false;

  // 3. Workspaces
  s.activeWorkspace = (s.activeWorkspace === 'work' || s.activeWorkspace === 'study') ? s.activeWorkspace : 'private';
  if (!s.workItems || typeof s.workItems !== 'object') {
    s.workItems = typeof createDefaultWorkItems === 'function' ? createDefaultWorkItems(currentL) : {};
  }
  if (s.workItems && typeof s.workItems === 'object') {
    ['work_focus', 'work_in_progress', 'work_waiting', 'work_backlog', 'termine', 'notes'].forEach(k => {
      if (!Array.isArray(s.workItems[k])) s.workItems[k] = [];
    });
  }
  if (!Array.isArray(s.workDone)) s.workDone = [];

  if (!s.studyItems || typeof s.studyItems !== 'object') {
    s.studyItems = typeof createDefaultStudyItems === 'function' ? createDefaultStudyItems(currentL) : {};
  }
  if (s.studyItems && typeof s.studyItems === 'object') {
    ['study_focus', 'study_modules', 'study_submissions', 'study_deep', 'termine', 'notes'].forEach(k => {
      if (!Array.isArray(s.studyItems[k])) s.studyItems[k] = [];
    });
  }
  if (!Array.isArray(s.studyDone)) s.studyDone = [];


  // 4. Shopping & Cooking
  if (!Array.isArray(s.shoppingList)) {
    s.shoppingList = [];
  } else {
    s.shoppingList = s.shoppingList.map(item => ensureItemIdentity(item, 'shop')).filter(Boolean);
  }
  if (!Array.isArray(s.shoppingHistory)) s.shoppingHistory = [];
  if (!s.cooking || typeof s.cooking !== 'object') {
    s.cooking = typeof createDefaultCookingState === 'function' ? createDefaultCookingState() : {};
  } else {
    s.cooking = {
      pantryItems: Array.isArray(s.cooking.pantryItems) ? s.cooking.pantryItems.map(p => ensureItemIdentity(p, 'pantry')).filter(Boolean) : [],
      recipes: Array.isArray(s.cooking.recipes) && s.cooking.recipes.length ? s.cooking.recipes : (typeof createDefaultCookingState === 'function' ? createDefaultCookingState().recipes : []),
      activeRecipeId: s.cooking.activeRecipeId || null,
      activeRecipe: s.cooking.activeRecipe || null
    };
  }

  // 5. Clarity
  if (!s.clarity || typeof s.clarity !== 'object') {
    s.clarity = { streakDays: 0, lastCheckinDate: null, history: [], savedReasons: [] };
  } else {
    s.clarity.streakDays = s.clarity.streakDays || 0;
    s.clarity.lastCheckinDate = s.clarity.lastCheckinDate || null;
    s.clarity.history = Array.isArray(s.clarity.history) ? s.clarity.history : [];
    s.clarity.savedReasons = Array.isArray(s.clarity.savedReasons) ? s.clarity.savedReasons : [];
  }

  // 6. Deduplizierung daily tasks (Face washing terms)
  if (Array.isArray(s.items.daily)) {
    const faceWashingTerms = [
      'Gesicht waschen', 'Wash face', 'Lavarse la cara', 
      'Πλύσιμο προσώπου', 'Se laver le visage', 'Lavarsi la faccia'
    ];
    let foundFace = false;
    s.items.daily = s.items.daily.filter(item => {
      const taskName = typeof item === 'object' ? item.task : item;
      if (faceWashingTerms.includes(taskName)) {
        if (foundFace) return false;
        foundFace = true;
        return true;
      }
      return true;
    });
  }

  // 7. Migration für Waschbecken & Spiegelschrank (ohne "putzen")
  const renameOldTask = (list) => {
    if (!Array.isArray(list)) return;
    list.forEach((item, i) => {
      if (typeof item === 'string' && item === 'Waschbecken & Spiegelschrank putzen') {
        list[i] = 'Waschbecken & Spiegelschrank';
      } else if (typeof item === 'object' && item && item.task === 'Waschbecken & Spiegelschrank putzen') {
        item.task = 'Waschbecken & Spiegelschrank';
      }
    });
  };
  if (s.items) {
    Object.values(s.items).forEach(renameOldTask);
  }
  if (s.workspaces) {
    Object.values(s.workspaces).forEach(ws => {
      if (ws && ws.items) Object.values(ws.items).forEach(renameOldTask);
    });
  }

  return s;
}

window.migrateState = migrateState;

function loadState() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed) {
        return migrateState(parsed, typeof currentLang !== 'undefined' ? currentLang : 'de');
      }
    }
  } catch (e) {
    console.warn('[State] loadState parse warning, returning migrated defaults:', e);
  }
  return migrateState(null, typeof currentLang !== 'undefined' ? currentLang : 'de');
}

function setWorkspace(mode) {
  if (mode !== 'private' && mode !== 'work' && mode !== 'study') return;
  state.activeWorkspace = mode;
  saveState();
  updateWorkspaceSwitchUI();
  if (typeof renderApp === 'function') renderApp();
  if (typeof populateHelperTaskSelect === 'function') populateHelperTaskSelect();
  if (typeof showToast === 'function') {
    if (mode === 'study') {
      showToast(tr({
        de: '🎓 Studium-Modus aktiviert!',
        en: '🎓 Study Mode activated!',
        es: '🎓 ¡Modo Estudio activado!',
        el: '🎓 Ενεργοποιήθηκε ο Χώρος Σπουδών!',
        fr: '🎓 Mode Études activé !',
        it: '🎓 Modalità Studio attivata!'
      }));
    } else if (mode === 'work') {
      showToast(tr({
        de: '💼 Arbeitsmodus aktiviert!',
        en: '💼 Work Mode activated!',
        es: '💼 ¡Modo Trabajo activado!',
        el: '💼 Ενεργοποιήθηκε ο Χώρος Εργασίας!',
        fr: '💼 Mode Travail activé !',
        it: '💼 Modalità Lavoro attivata!'
      }));
    } else {
      showToast(tr({
        de: '🏠 Privat-Modus aktiviert!',
        en: '🏠 Personal Mode activated!',
        es: '🏠 ¡Modo Personal activado!',
        el: '🏠 Ενεργοποιήθηκε ο Προσωπικός Χώρος!',
        fr: '🏠 Mode Personnel activé !',
        it: '🏠 Modalità Personale attivata!'
      }));
    }
  }
}
window.setWorkspace = setWorkspace;
window.switchWorkspace = setWorkspace;

function toggleWorkspace() {
  const current = (state && state.activeWorkspace) ? state.activeWorkspace : 'private';
  const nextMode = (current === 'private') ? 'work' : ((current === 'work') ? 'study' : 'private');
  setWorkspace(nextMode);
}
window.toggleWorkspace = toggleWorkspace;

let headerWsDropdownTimer = null;

function cancelCloseHeaderWorkspaceDropdown() {
  if (headerWsDropdownTimer) {
    clearTimeout(headerWsDropdownTimer);
    headerWsDropdownTimer = null;
  }
}
window.cancelCloseHeaderWorkspaceDropdown = cancelCloseHeaderWorkspaceDropdown;

function openHeaderWorkspaceDropdown() {
  cancelCloseHeaderWorkspaceDropdown();
  const el = document.getElementById('dropdown-header-workspace');
  if (el) {
    el.classList.remove('hidden');
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }
}
window.openHeaderWorkspaceDropdown = openHeaderWorkspaceDropdown;

function closeHeaderWorkspaceDropdown() {
  if (headerWsDropdownTimer) clearTimeout(headerWsDropdownTimer);
  headerWsDropdownTimer = setTimeout(() => {
    const el = document.getElementById('dropdown-header-workspace');
    if (el) el.classList.add('hidden');
  }, 220);
}
window.closeHeaderWorkspaceDropdown = closeHeaderWorkspaceDropdown;

function toggleHeaderWorkspaceDropdown(event) {
  if (event) event.stopPropagation();
  const el = document.getElementById('dropdown-header-workspace');
  if (!el) return;
  if (el.classList.contains('hidden')) {
    openHeaderWorkspaceDropdown();
  } else {
    el.classList.add('hidden');
  }
}
window.toggleHeaderWorkspaceDropdown = toggleHeaderWorkspaceDropdown;

function updateWorkspaceSwitchUI() {
  const currentWs = (state && state.activeWorkspace) ? state.activeWorkspace : 'private';

  // 1. BOARD SUB-HEADER WORKSPACE BUTTON & DROPDOWN (Links vor den Spalten platziert)
  const headerBtn = document.getElementById('btn-header-workspace');
  const headerIcon = document.getElementById('header-ws-icon');
  const headerLabel = document.getElementById('header-ws-label');

  if (headerBtn && headerIcon && headerLabel) {
    if (currentWs === 'study') {
      headerIcon.textContent = '🎓';
      headerLabel.textContent = typeof t === 'function' ? t('workspace_study') : 'Studium';
      headerBtn.className = 'px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 hover:border-emerald-400/60 text-emerald-200/90 hover:text-emerald-100 transition-all duration-200 hover:scale-110 active:scale-95 flex items-center gap-1 text-[11px] font-medium cursor-pointer shadow-xs hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] group/ws shrink-0';
    } else if (currentWs === 'work') {
      headerIcon.textContent = '💼';
      headerLabel.textContent = typeof t === 'function' ? t('workspace_work') : 'Arbeit';
      headerBtn.className = 'px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/20 hover:border-blue-400/60 text-blue-200/90 hover:text-blue-100 transition-all duration-200 hover:scale-110 active:scale-95 flex items-center gap-1 text-[11px] font-medium cursor-pointer shadow-xs hover:shadow-[0_0_12px_rgba(59,130,246,0.25)] group/ws shrink-0';
    } else {
      headerIcon.textContent = '🏠';
      headerLabel.textContent = typeof t === 'function' ? t('workspace_private') : 'Privat';
      headerBtn.className = 'px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/20 hover:border-purple-400/60 text-purple-200/90 hover:text-purple-100 transition-all duration-200 hover:scale-110 active:scale-95 flex items-center gap-1 text-[11px] font-medium cursor-pointer shadow-xs hover:shadow-[0_0_12px_rgba(168,85,247,0.25)] group/ws shrink-0';
    }
  }

  // Active option highlight inside Header Dropdown (Solid backgrounds to avoid overlap artifacts)
  const optPriv = document.getElementById('header-ws-opt-private');
  const optWork = document.getElementById('header-ws-opt-work');
  const optStudy = document.getElementById('header-ws-opt-study');
  if (optPriv) optPriv.className = `p-2 rounded-xl text-left flex items-center gap-2.5 transition cursor-pointer border ${currentWs === 'private' ? 'bg-purple-500/20 border-purple-400/50 text-purple-100 shadow-xs' : 'hover:bg-white/[0.08] border-transparent text-gray-300'}`;
  if (optWork) optWork.className = `p-2 rounded-xl text-left flex items-center gap-2.5 transition cursor-pointer border ${currentWs === 'work' ? 'bg-blue-500/20 border-blue-400/50 text-blue-100 shadow-xs' : 'hover:bg-white/[0.08] border-transparent text-gray-300'}`;
  if (optStudy) optStudy.className = `p-2 rounded-xl text-left flex items-center gap-2.5 transition cursor-pointer border ${currentWs === 'study' ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-100 shadow-xs' : 'hover:bg-white/[0.08] border-transparent text-gray-300'}`;

  // 2. SETTINGS / MOBILE TOGGLE FALLBACKS
  const toggleBtn = document.getElementById('btn-workspace-toggle');
  const iconEl = document.getElementById('ws-toggle-icon');
  const textEl = document.getElementById('ws-toggle-text');
  
  const mobileToggleBtn = document.getElementById('mobile-btn-workspace-toggle');
  const mobileIconEl = document.getElementById('mobile-ws-toggle-icon');
  const mobileTextEl = document.getElementById('mobile-ws-toggle-text');

  let currentIcon = '🏠';
  let currentLabel = typeof t === 'function' ? t('workspace_private') : 'Privat';
  if (currentWs === 'work') {
    currentIcon = '💼';
    currentLabel = typeof t === 'function' ? t('workspace_work') : 'Arbeit';
  } else if (currentWs === 'study') {
    currentIcon = '🎓';
    currentLabel = typeof t === 'function' ? t('workspace_study') : 'Studium';
  }

  if (iconEl) iconEl.textContent = currentIcon;
  if (textEl) {
    textEl.textContent = currentLabel;
    textEl.className = currentWs === 'work' ? 'truncate text-blue-300' : (currentWs === 'study' ? 'truncate text-emerald-300' : 'truncate text-purple-300');
  }
  if (toggleBtn) {
    toggleBtn.title = currentLabel;
  }

  if (mobileIconEl) mobileIconEl.textContent = currentIcon;
  if (mobileTextEl) {
    mobileTextEl.textContent = currentLabel;
    mobileTextEl.className = currentWs === 'work' ? 'text-xs font-bold text-blue-300 hidden sm:inline' : (currentWs === 'study' ? 'text-xs font-bold text-emerald-300 hidden sm:inline' : 'text-xs font-bold text-purple-300 hidden sm:inline');
  }
  if (mobileToggleBtn) {
    mobileToggleBtn.title = currentLabel;
  }
}
window.updateWorkspaceSwitchUI = updateWorkspaceSwitchUI;

function loadHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('[State] loadHistory warning:', e);
  }
  return [];
}

// Initialisierung nach Definition aller Konstruktoren und Konstanten
categoriesOrder = loadCategoriesOrder();
workCategoriesOrder = loadWorkCategoriesOrder();
studyCategoriesOrder = loadStudyCategoriesOrder();
state = loadState();
historyStack = loadHistory();

// PERFORMANCE-FIX: saveState() wurde bisher bei JEDEM Aufruf (42 Stellen im Code) zusaetzlich
// den kompletten historyStack (bis zu 20 volle State-Kopien) neu serialisiert und geschrieben,
// obwohl sich die History in den allermeisten dieser Faelle gar nicht geaendert hatte. Das
// blockierte den Main-Thread unnoetig bei jeder kleinen Aktion (Task abhaken, Item hinzufuegen...).
// Jetzt wird die History nur noch dann persistiert, wenn sie sich tatsaechlich aendert
// (saveHistory() / handleUndo()). Das Endergebnis in localStorage ist zu jedem Zeitpunkt exakt
// identisch zu vorher - nur die Anzahl unnoetiger Schreibvorgaenge sinkt drastisch.
let syncEngineDebounceTimer = null;

function saveState(skipP2PSync = false) {
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : state;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(currentState));
    if (typeof IDB_VAULT !== 'undefined' && IDB_VAULT && typeof IDB_VAULT.set === 'function') {
      IDB_VAULT.set(STORE_KEY, currentState);
    }
  } catch (e) {
    console.warn('[State] Storage quota exceeded or write failed, attempting emergency trim:', e);
    try {
      if (currentState && Array.isArray(currentState.archive) && currentState.archive.length > 30) {
        currentState.archive.splice(0, currentState.archive.length - 20);
      }
      if (currentState && Array.isArray(currentState.shoppingHistory) && currentState.shoppingHistory.length > 30) {
        currentState.shoppingHistory.splice(0, currentState.shoppingHistory.length - 20);
      }
      if (currentState && Array.isArray(currentState.done) && currentState.done.length > 50) {
        currentState.done.splice(0, currentState.done.length - 30);
      }
      try { localStorage.removeItem(HISTORY_KEY); } catch (eh) {}
      try { localStorage.removeItem('flow_backup_before_sync'); } catch (eb) {}
      localStorage.setItem(STORE_KEY, JSON.stringify(currentState));
      if (typeof IDB_VAULT !== 'undefined' && IDB_VAULT && typeof IDB_VAULT.set === 'function') {
        IDB_VAULT.set(STORE_KEY, currentState);
      }
    } catch (err) {
      console.error('[State] Critical failure writing state to localStorage:', err);
      if (typeof IDB_VAULT !== 'undefined' && IDB_VAULT && typeof IDB_VAULT.set === 'function') {
        IDB_VAULT.set(STORE_KEY, currentState);
      }
    }
  }
  if (!skipP2PSync && typeof p2pSyncEngine !== 'undefined' && p2pSyncEngine.isConnected()) {
    p2pSyncEngine.broadcastStateUpdate();
  }
  if (!skipP2PSync && typeof cloudSyncEngine !== 'undefined' && typeof FlowAuth !== 'undefined' && FlowAuth.isLoggedIn()) {
    cloudSyncEngine.triggerAutoPush();
  }
}

function persistHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historyStack));
  } catch (e) {
    if (Array.isArray(historyStack) && historyStack.length > 5) {
      historyStack = historyStack.slice(-5);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(historyStack));
      } catch (e2) {
        try { localStorage.removeItem(HISTORY_KEY); } catch (e3) {}
      }
    }
  }
}

function updateUndoUI() {
  if (typeof document === 'undefined') return;
  const undoBtn = document.getElementById('btn-board-undo');
  if (undoBtn) {
    const hasHistory = Array.isArray(historyStack) && historyStack.length > 0;
    undoBtn.classList.toggle('hidden', !hasHistory);
    undoBtn.disabled = !hasHistory;
  }
}

function saveHistory() {
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof globalThis !== 'undefined' && globalThis.state ? globalThis.state : state);
  const stack = (typeof window !== 'undefined' && Array.isArray(window.historyStack)) ? window.historyStack : (typeof globalThis !== 'undefined' && Array.isArray(globalThis.historyStack) ? globalThis.historyStack : historyStack);
  if (currentState) {
    const activeCats = (typeof window !== 'undefined' && window.categoriesOrder) ? window.categoriesOrder : (typeof categoriesOrder !== 'undefined' ? categoriesOrder : null);
    const activeWorkCats = (typeof window !== 'undefined' && window.workCategoriesOrder) ? window.workCategoriesOrder : (typeof workCategoriesOrder !== 'undefined' ? workCategoriesOrder : null);
    const activeStudyCats = (typeof window !== 'undefined' && window.studyCategoriesOrder) ? window.studyCategoriesOrder : (typeof studyCategoriesOrder !== 'undefined' ? studyCategoriesOrder : null);

    const snapshot = JSON.parse(JSON.stringify(currentState));
    if (activeCats) {
      snapshot._savedCategoriesOrder = JSON.parse(JSON.stringify(activeCats));
    }
    if (activeWorkCats) {
      snapshot._savedWorkCategoriesOrder = JSON.parse(JSON.stringify(activeWorkCats));
    }
    if (activeStudyCats) {
      snapshot._savedStudyCategoriesOrder = JSON.parse(JSON.stringify(activeStudyCats));
    }

    stack.push(snapshot);
    if (stack.length > 15) stack.shift();
    historyStack = stack;
    if (typeof window !== 'undefined') window.historyStack = stack;
    if (typeof globalThis !== 'undefined') globalThis.historyStack = stack;
    persistHistory();
    updateUndoUI();
  }
}

function t(key) {
  const trans = (typeof window !== 'undefined' && window.TRANSLATIONS && Object.keys(window.TRANSLATIONS).length > 0)
    ? window.TRANSLATIONS
    : ((typeof globalThis !== 'undefined' && globalThis.TRANSLATIONS && Object.keys(globalThis.TRANSLATIONS).length > 0)
      ? globalThis.TRANSLATIONS
      : (typeof TRANSLATIONS !== 'undefined' ? TRANSLATIONS : {}));
  const lang = (typeof window !== 'undefined' && window.currentLang) 
    ? window.currentLang 
    : (typeof globalThis !== 'undefined' && globalThis.currentLang ? globalThis.currentLang : (typeof currentLang !== 'undefined' ? currentLang : 'de'));
  return trans[lang]?.[key] || trans['de']?.[key] || trans['en']?.[key] || (typeof TRANSLATIONS !== 'undefined' ? (TRANSLATIONS[lang]?.[key] || TRANSLATIONS['de']?.[key] || TRANSLATIONS['en']?.[key]) : null) || key;
}

// Kleiner Helfer für lokale, funktionsnahe Textbausteine (Toasts, Inline-Labels),
// die nicht Teil des globalen TRANSLATIONS-Wörterbuchs sind.
// Nutzung: tr({ en: '...', de: '...', fr: '...', it: '...', es: '...', el: '...' })
function tr(map) {
  if (!map || typeof map !== 'object') return String(map || '');
  const lang = (typeof window !== 'undefined' && window.currentLang) 
    ? window.currentLang 
    : (typeof globalThis !== 'undefined' && globalThis.currentLang ? globalThis.currentLang : (typeof currentLang !== 'undefined' ? currentLang : 'de'));
  return map[lang] || map.de || map.en || Object.values(map)[0] || '';
}

function getGermanStandardKey(taskName) {
  const cats = ['daily', 'weekly', 'occasionally'];
  for (const cat of cats) {
    for (const lang of ['de', 'en', 'es', 'el', 'fr', 'it']) {
      const list = DEFAULT_TASKS_BY_LANG[lang][cat];
      const idx = list.indexOf(taskName);
      if (idx !== -1) {
        return DEFAULT_TASKS_BY_LANG['de'][cat][idx];
      }
    }
  }
  return taskName;
}

function handleUndo() {
  const stack = (typeof window !== 'undefined' && Array.isArray(window.historyStack)) ? window.historyStack : (typeof globalThis !== 'undefined' && Array.isArray(globalThis.historyStack) ? globalThis.historyStack : historyStack);
  if (!stack || stack.length === 0) {
    showToast(t('toast_no_undo'));
    updateUndoUI();
    return;
  }
  const popped = stack.pop();
  if (!popped) return;

  if (popped._savedCategoriesOrder) {
    categoriesOrder = JSON.parse(JSON.stringify(popped._savedCategoriesOrder));
    if (typeof window !== 'undefined') window.categoriesOrder = categoriesOrder;
    if (typeof globalThis !== 'undefined') globalThis.categoriesOrder = categoriesOrder;
    if (typeof saveCategoriesOrder === 'function') saveCategoriesOrder();
  }
  if (popped._savedWorkCategoriesOrder) {
    workCategoriesOrder = JSON.parse(JSON.stringify(popped._savedWorkCategoriesOrder));
    if (typeof window !== 'undefined') window.workCategoriesOrder = workCategoriesOrder;
    if (typeof globalThis !== 'undefined') globalThis.workCategoriesOrder = workCategoriesOrder;
    if (typeof saveCategoriesOrder === 'function') saveCategoriesOrder();
  }
  if (popped._savedStudyCategoriesOrder) {
    studyCategoriesOrder = JSON.parse(JSON.stringify(popped._savedStudyCategoriesOrder));
    if (typeof window !== 'undefined') window.studyCategoriesOrder = studyCategoriesOrder;
    if (typeof globalThis !== 'undefined') globalThis.studyCategoriesOrder = studyCategoriesOrder;
    if (typeof saveCategoriesOrder === 'function') saveCategoriesOrder();
  }

  delete popped._savedCategoriesOrder;
  delete popped._savedWorkCategoriesOrder;

  state = popped;
  if (typeof window !== 'undefined') window.state = state;
  if (typeof globalThis !== 'undefined') globalThis.state = state;
  historyStack = stack;
  if (typeof window !== 'undefined') window.historyStack = stack;
  if (typeof globalThis !== 'undefined') globalThis.historyStack = stack;

  persistHistory();
  updateUndoUI();
  saveState();
  showToast(t('toast_undo_applied'));
  if (typeof renderApp === 'function') {
    renderApp();
  }
  if (typeof populateHelperTaskSelect === 'function') {
    populateHelperTaskSelect();
  }
}

async function handleReset() {
  const confirmMsg = tr({
    de: 'Möchtest du den gesamten Plan wirklich zurücksetzen?',
    en: 'Do you really want to reset your entire plan?',
    fr: 'Veux-tu vraiment réinitialiser tout le plan ?',
    it: 'Vuoi davvero reimpostare l\'intero piano?',
    es: '¿Seguro que quieres reiniciar todo el plan?',
    el: 'Θέλεις πραγματικά να επαναφέρεις ολόκληρο το πλάνο σου;'
  });
  
  const confirmed = typeof showConfirmDialog === 'function' ? await showConfirmDialog({
    title: typeof tr === 'function' ? tr({ de: 'Plan zurücksetzen?', en: 'Reset Plan?' }) : 'Plan zurücksetzen?',
    message: confirmMsg,
    confirmText: typeof tr === 'function' ? tr({ de: 'Zurücksetzen', en: 'Reset' }) : 'Zurücksetzen',
    isDanger: true,
    icon: 'trash-2'
  }) : confirm(confirmMsg);

  if (confirmed) {
    saveHistory();
    const localizedDefaults = DEFAULT_TASKS_BY_LANG[currentLang] || DEFAULT_TASKS_BY_LANG['en'] || DEFAULT_TASKS_BY_LANG['de'];
    state = {
      version: 3, lastDate: new Date().toISOString().split('T')[0],
      items: { daily: [...localizedDefaults.daily], weekly: [...localizedDefaults.weekly], occasionally: [...localizedDefaults.occasionally], todo: [], termine: [], notes: [] },
      done: [], archive: [], streak: 0, completedSteps: {}, customSteps: {},
      shoppingList: [], shoppingHistory: [],
      cooking: createDefaultCookingState(),
      clarity: { streakDays: 0, lastCheckinDate: null, history: [], savedReasons: [] }
    };
    
    categoriesOrder = [
      ['daily', 'sun'],
      ['weekly', 'calendar-days'],
      ['todo', 'list-todo'],
      ['done', 'check-circle'],
      ['termine', 'clock'],
      ['notes', 'sticky-note'],
      ['occasionally', 'calendar-range']
    ];
    saveCategoriesOrder();
    saveState();
    
    showToast(t('toast_reset_success'));
    renderApp();
    populateHelperTaskSelect();
  }
}

async function handleClearAllLists() {
  const curItems = typeof getCurrentWorkspaceItems === 'function' ? getCurrentWorkspaceItems() : (state ? state.items : {});
  const ws = state && state.activeWorkspace ? state.activeWorkspace : 'private';
  const curDone = typeof getCurrentWorkspaceDone === 'function' ? getCurrentWorkspaceDone() : (ws === 'study' ? state?.studyDone : ws === 'work' ? state?.workDone : state?.done);
  
  let totalTasks = (Array.isArray(curDone) ? curDone.length : 0);
  if (curItems && typeof curItems === 'object') {
    Object.values(curItems).forEach(list => {
      if (Array.isArray(list)) totalTasks += list.length;
    });
  }

  if (totalTasks === 0) {
    if (typeof showToast === 'function') {
      showToast(tr({
        de: 'Die Spalten sind bereits leer! ℹ️',
        en: 'The columns are already empty! ℹ️',
        fr: 'Les colonnes sont déjà vides ! ℹ️',
        it: 'Le colonne sono già vuote! ℹ️',
        es: '¡Las columnas ya están vacías! ℹ️',
        el: 'Οι στήλες είναι ήδη άδειες! ℹ️'
      }));
    }
    return;
  }

  const confirmMsg = tr({
    de: `Möchtest du wirklich alle ${totalTasks} Aufgaben aus allen Spalten dieses Bereichs leeren?`,
    en: `Do you really want to clear all ${totalTasks} tasks from all columns in this workspace?`,
    fr: `Veux-tu vraiment vider toutes les ${totalTasks} tâches de toutes les colonnes de cet espace ?`,
    it: `Vuoi davvero svuotare tutte le ${totalTasks} attività da tutte le colonne di questo spazio?`,
    es: `¿Seguro que quieres vaciar todas las ${totalTasks} tareas de todas las columnas de este espacio?`,
    el: `Θέλεις πραγματικά να αδειάσεις όλες τις ${totalTasks} εργασίες από όλες τις στήλες αυτού του χώρου;`
  });

  const confirmed = typeof showConfirmDialog === 'function' ? await showConfirmDialog({
    title: typeof tr === 'function' ? tr({ de: 'Spalten leeren?', en: 'Clear all columns?' }) : 'Spalten leeren?',
    message: confirmMsg,
    confirmText: typeof tr === 'function' ? tr({ de: 'Spalten leeren', en: 'Clear columns' }) : 'Spalten leeren',
    isDanger: true,
    icon: 'eraser'
  }) : confirm(confirmMsg);

  if (confirmed) {
    if (typeof saveHistory === 'function') saveHistory();
    if (curItems && typeof curItems === 'object') {
      Object.keys(curItems).forEach(colId => {
        curItems[colId] = [];
      });
    }
    if (ws === 'study') {
      state.studyDone = [];
    } else if (ws === 'work') {
      state.workDone = [];
    } else {
      state.done = [];
    }
    saveState();
    if (typeof renderApp === 'function') renderApp();
    if (typeof populateHelperTaskSelect === 'function') populateHelperTaskSelect();
    if (typeof updateZenView === 'function') updateZenView();
    if (typeof showToast === 'function') {
      showToast(tr({
        de: `🧹 Alle Spalten geleert (${totalTasks} Aufgaben entfernt)`,
        en: `🧹 All columns cleared (${totalTasks} tasks removed)`,
        fr: `🧹 Toutes les colonnes vidées (${totalTasks} tâches supprimées)`,
        it: `🧹 Tutte le colonne svuotate (${totalTasks} attività rimosse)`,
        es: `🧹 Todas las columnas vaciadas (${totalTasks} tareas eliminadas)`,
        el: `🧹 Όλες οι στήλες άδειασαν (${totalTasks} εργασίες αφαιρέθηκαν)`
      }));
    }
  }
}
window.handleClearAllLists = handleClearAllLists;
window.clearAllLists = handleClearAllLists;
window.handleClearAllColumns = handleClearAllLists;
window.clearAllColumns = handleClearAllLists;
if (typeof globalThis !== 'undefined') {
  globalThis.handleClearAllLists = handleClearAllLists;
  globalThis.clearAllLists = handleClearAllLists;
  globalThis.handleClearAllColumns = handleClearAllLists;
  globalThis.clearAllColumns = handleClearAllLists;
}

function handleSaveJson() {
  const today = state.lastDate || new Date().toISOString().split('T')[0];
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `flow-backup-${today}.json`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast(tr({
    de: 'Backup erfolgreich heruntergeladen 💾',
    en: 'Backup successfully exported 💾',
    fr: 'Sauvegarde exportée avec succès 💾',
    it: 'Backup esportato con successo 💾',
    es: 'Copia de seguridad exportada con éxito 💾',
    el: 'Το αντίγραφο ασφαλείας εξήχθη επιτυχώς 💾'
  }));
}

function handleOpenFile(e) {
  const file = e.target.files?.[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (imported) {
        saveHistory();
        state = migrateState(imported, typeof currentLang !== 'undefined' ? currentLang : 'de');
        saveState();
        showToast(t('toast_import_success'));
        renderApp();
        populateHelperTaskSelect();
      }
    } catch(err) {
      showToast(t('toast_import_error'));
    }
  };
  reader.readAsText(file);
}

function convertNoteToTask(noteIndex, targetCategory = 'todo', event) {
  if (event) event.stopPropagation();
  if (!state.items.notes || !state.items.notes[noteIndex]) return;
  saveHistory();
  const [noteItem] = state.items.notes.splice(noteIndex, 1);
  const noteText = typeof noteItem === 'object' ? noteItem.task : noteItem;
  if (!state.items[targetCategory]) state.items[targetCategory] = [];
  state.items[targetCategory].push(noteText);
  saveState();
  showToast(tr({
    de: `Notiz in "${t(targetCategory)}" umgewandelt! ✨`,
    en: `Note converted to "${t(targetCategory)}"! ✨`,
    es: `¡Nota convertida a "${t(targetCategory)}"! ✨`,
    el: `Η σημείωση μετατράπηκε σε "${t(targetCategory)}"! ✨`,
    fr: `Note convertie en "${t(targetCategory)}" ! ✨`,
    it: `Nota convertita in "${t(targetCategory)}"! ✨`
  }));
  renderApp();
  populateHelperTaskSelect();
}

function copyNoteText(noteIndex, event) {
  if (event) event.stopPropagation();
  if (!state.items.notes || !state.items.notes[noteIndex]) return;
  const noteItem = state.items.notes[noteIndex];
  const noteText = typeof noteItem === 'object' ? noteItem.task : noteItem;
  navigator.clipboard?.writeText(noteText).then(() => {
    showToast(tr({
      de: 'Notiz in Zwischenablage kopiert! 📋',
      en: 'Note copied to clipboard! 📋',
      es: '¡Nota copiada al portapapeles! 📋',
      el: 'Η σημείωση αντιγράφηκε στο πρόχειρο! 📋',
      fr: 'Note copiée dans le presse-papiers ! 📋',
      it: 'Nota copiata negli appunti! 📋'
    }));
  }).catch(() => {});
}

function reloadDailyTasks(isAuto = false) {
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : state;
  if (!currentState) return;
  if (!isAuto && typeof saveHistory === 'function') saveHistory();

  const curL = (typeof window !== 'undefined' && window.currentLang)
    ? window.currentLang
    : ((typeof globalThis !== 'undefined' && globalThis.currentLang)
        ? globalThis.currentLang
        : (typeof currentLang !== 'undefined' ? currentLang : 'de'));
  
  const customDefaults = getCustomDefaults();
  let dailyTasks = null;
  if (customDefaults && Array.isArray(customDefaults.daily)) {
    dailyTasks = customDefaults.daily;
  } else {
    const localizedDefaults = (typeof DEFAULT_TASKS_BY_LANG !== 'undefined' && DEFAULT_TASKS_BY_LANG[curL]) 
      ? DEFAULT_TASKS_BY_LANG[curL] 
      : ((typeof DEFAULT_TASKS_BY_LANG !== 'undefined' && DEFAULT_TASKS_BY_LANG['de']) ? DEFAULT_TASKS_BY_LANG['de'] : { daily: [] });
    dailyTasks = localizedDefaults.daily || [];
  }

  if (!currentState.items) currentState.items = {};
  currentState.items.daily = [...dailyTasks];

  if (currentState.workItems) {
    const workDefaults = (typeof DEFAULT_WORK_TASKS_BY_LANG !== 'undefined' && DEFAULT_WORK_TASKS_BY_LANG[curL])
      ? DEFAULT_WORK_TASKS_BY_LANG[curL]
      : (typeof DEFAULT_WORK_TASKS_BY_LANG !== 'undefined' ? DEFAULT_WORK_TASKS_BY_LANG['de'] : { work_focus: [] });
    if (workDefaults && workDefaults.work_focus) {
      currentState.workItems.work_focus = [...workDefaults.work_focus];
    }
  }

  currentState.lastDate = new Date().toISOString().split('T')[0];
  saveState();
  if (typeof renderApp === 'function') renderApp();
  if (typeof populateHelperTaskSelect === 'function') populateHelperTaskSelect();

  if (!isAuto && typeof showToast === 'function') {
    showToast(tr({
      de: '🌅 Tagesplan für heute neu geladen!',
      en: '🌅 Today\'s plan reloaded!',
      fr: '🌅 Plan d\'aujourd\'hui rechargé !',
      it: '🌅 Piano di oggi ricaricato!',
      es: '🌅 ¡Plan de hoy recargado!',
      el: '🌅 Το ημερήσιο πλάνο επαναφορτώθηκε!'
    }));
  }
}

function reloadWeeklyHouseholdTasks(isAuto = false) {
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : state;
  if (!currentState) return;
  if (!isAuto && typeof saveHistory === 'function') saveHistory();

  const curL = (typeof window !== 'undefined' && window.currentLang)
    ? window.currentLang
    : ((typeof globalThis !== 'undefined' && globalThis.currentLang)
        ? globalThis.currentLang
        : (typeof currentLang !== 'undefined' ? currentLang : 'de'));
  
  const customDefaults = getCustomDefaults();
  let weeklyTasks = null;
  if (customDefaults && Array.isArray(customDefaults.weekly)) {
    weeklyTasks = customDefaults.weekly;
  } else {
    const localizedDefaults = (typeof DEFAULT_TASKS_BY_LANG !== 'undefined' && DEFAULT_TASKS_BY_LANG[curL]) 
      ? DEFAULT_TASKS_BY_LANG[curL] 
      : ((typeof DEFAULT_TASKS_BY_LANG !== 'undefined' && DEFAULT_TASKS_BY_LANG['de']) ? DEFAULT_TASKS_BY_LANG['de'] : { weekly: [] });
    weeklyTasks = localizedDefaults.weekly || [];
  }

  if (!currentState.items) currentState.items = {};
  currentState.items.weekly = [...weeklyTasks];

  currentState.lastWeeklyResetWeek = getYearAndWeek(new Date());
  saveState();
  if (typeof renderApp === 'function') renderApp();
  if (typeof populateHelperTaskSelect === 'function') populateHelperTaskSelect();

  if (!isAuto && typeof showToast === 'function') {
    showToast(tr({
      de: '🧹 Haushalts-Plan für die neue Woche geladen!',
      en: '🧹 Weekly household plan reloaded!',
      fr: '🧹 Plan de ménage de la semaine rechargé !',
      it: '🧹 Piano domestico per la nuova settimana caricato!',
      es: '🧹 ¡Plan del hogar de la semana recargado!',
      el: '🧹 Το εβδομαδιαίο πρόγραμμα καθαριότητας επαναφορτώθηκε!'
    }));
  }
}

function checkAutoRollovers() {
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : state;
  if (!currentState) return;

  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];
  const currentWeekStr = getYearAndWeek(now);

  let stateModified = false;

  // 1. Täglicher Rollover für Heute (daily / work_focus)
  if (currentState.lastDate && currentState.lastDate !== todayISO) {
    const prevDate = currentState.lastDate;
    if (typeof generateReportContent === 'function' && typeof triggerAutomaticDownload === 'function') {
      try {
        const { reportText, filename } = generateReportContent('daily', prevDate);
        triggerAutomaticDownload(reportText, filename);
      } catch (e) {
        console.warn('[Rollover] Auto-report warning:', e);
      }
    }
    reloadDailyTasks(true);
    stateModified = true;
  }

  // 2. Wöchentlicher Rollover für Haushalt (weekly)
  if (currentState.lastWeeklyResetWeek && currentState.lastWeeklyResetWeek !== currentWeekStr) {
    reloadWeeklyHouseholdTasks(true);
    stateModified = true;
  }

  if (stateModified) {
    saveState();
    if (typeof renderApp === 'function') renderApp();
  }
}

// Init auto rollover check
if (typeof window !== 'undefined') {
  window.addEventListener('focus', checkAutoRollovers);
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkAutoRollovers();
    });
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkAutoRollovers);
    } else {
      checkAutoRollovers();
    }
  }
  setInterval(checkAutoRollovers, 60000);
}

if (typeof window !== 'undefined') {
  window.openTaskAddColumns = openTaskAddColumns;
  window.getYearAndWeek = getYearAndWeek;
  window.reloadDailyTasks = reloadDailyTasks;
  window.reloadWeeklyHouseholdTasks = reloadWeeklyHouseholdTasks;
  window.checkAutoRollovers = checkAutoRollovers;
  window.computeStringHash = computeStringHash;
  window.getStableId = getStableId;
  window.generateStableId = generateStableId;
  window.ensureItemIdentity = ensureItemIdentity;
  window.trackTombstone = trackTombstone;
  window.clearTombstone = clearTombstone;
  window.saveState = saveState;
  window.loadState = loadState;
  window.saveHistory = saveHistory;
  window.loadHistory = loadHistory;
  window.migrateState = migrateState;
  window.handleUndo = handleUndo;
  window.updateUndoUI = updateUndoUI;
  window.loadCategoriesOrder = loadCategoriesOrder;
  window.loadWorkCategoriesOrder = loadWorkCategoriesOrder;
  window.loadStudyCategoriesOrder = loadStudyCategoriesOrder;
  window.categoriesOrder = categoriesOrder;
  window.workCategoriesOrder = workCategoriesOrder;
  window.studyCategoriesOrder = studyCategoriesOrder;
  window.STUDY_CATEGORIES_ORDER = STUDY_CATEGORIES_ORDER;
  window.WORK_CATEGORIES_ORDER = WORK_CATEGORIES_ORDER;
  window.getCustomDefaults = getCustomDefaults;
  window.saveCustomDefaults = saveCustomDefaults;
  window.t = t;
  window.tr = tr;
}
if (typeof globalThis !== 'undefined') {
  globalThis.openTaskAddColumns = openTaskAddColumns;
  globalThis.getYearAndWeek = getYearAndWeek;
  globalThis.reloadDailyTasks = reloadDailyTasks;
  globalThis.reloadWeeklyHouseholdTasks = reloadWeeklyHouseholdTasks;
  globalThis.getCustomDefaults = getCustomDefaults;
  globalThis.saveCustomDefaults = saveCustomDefaults;
  globalThis.checkAutoRollovers = checkAutoRollovers;
  globalThis.computeStringHash = computeStringHash;
  globalThis.getStableId = getStableId;
  globalThis.generateStableId = generateStableId;
  globalThis.ensureItemIdentity = ensureItemIdentity;
  globalThis.trackTombstone = trackTombstone;
  globalThis.clearTombstone = clearTombstone;
  globalThis.saveState = saveState;
  globalThis.loadState = loadState;
  globalThis.saveHistory = saveHistory;
  globalThis.loadHistory = loadHistory;
  globalThis.migrateState = migrateState;
  globalThis.handleUndo = handleUndo;
  globalThis.updateUndoUI = updateUndoUI;
  globalThis.loadCategoriesOrder = loadCategoriesOrder;
  globalThis.loadWorkCategoriesOrder = loadWorkCategoriesOrder;
  globalThis.loadStudyCategoriesOrder = loadStudyCategoriesOrder;
  globalThis.categoriesOrder = categoriesOrder;
  globalThis.workCategoriesOrder = workCategoriesOrder;
  globalThis.studyCategoriesOrder = studyCategoriesOrder;
  globalThis.STUDY_CATEGORIES_ORDER = STUDY_CATEGORIES_ORDER;
  globalThis.WORK_CATEGORIES_ORDER = WORK_CATEGORIES_ORDER;
  globalThis.t = t;
  globalThis.tr = tr;
}


