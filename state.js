/**
 * @file state.js
 * @module StateManager
 * @description
 * Zentrales State-Management & Datenpersistenz:
 * - Reaktive Aufgaben-Listen für getrennte Workspaces (Personal & Work)
 * - Erledigte Aufgaben, Archiv, Tombstone-Tracking & Wiederherstellung
 * - Transaktionaler History- & Undo-Stack (bis zu 20 Snapshots)
 * - Schema-Versionierung, Daten-Sanitizing & automatische Migrationen
 * - Automatische Speicherbereinigung bei `QuotaExceededError`
 */

// Grundlegende Konfiguration & globale State-Deklarationen
var STORE_KEY = (typeof window !== 'undefined' && window.STORE_KEY) || (typeof globalThis !== 'undefined' && globalThis.STORE_KEY) || 'flowPlannerV3';
var HISTORY_KEY = (typeof window !== 'undefined' && window.HISTORY_KEY) || (typeof globalThis !== 'undefined' && globalThis.HISTORY_KEY) || 'flowPlannerV3History';
if (typeof window !== 'undefined') {
  window.STORE_KEY = STORE_KEY;
  window.HISTORY_KEY = HISTORY_KEY;
}
if (typeof globalThis !== 'undefined') {
  globalThis.STORE_KEY = STORE_KEY;
  globalThis.HISTORY_KEY = HISTORY_KEY;
}

var ALL_VALID_THEMES = (typeof window !== 'undefined' && window.ALL_VALID_THEMES) || ['aurora', 'obsidian', 'botanical', 'latte', 'peach', 'ocean', 'code-night', 'matrix', 'ruby', 'cobalt', 'fruity-classic', 'fruity-studio'];
if (typeof window !== 'undefined') window.ALL_VALID_THEMES = ALL_VALID_THEMES;
var currentLang = (typeof window !== 'undefined' && window.currentLang) || (typeof localStorage !== 'undefined' && localStorage.getItem('flowPlannerLanguage')) || 'de';
var rawTheme = (typeof window !== 'undefined' && window.currentTheme) || (typeof localStorage !== 'undefined' && localStorage.getItem('flowPlannerTheme')) || 'aurora';
if (!ALL_VALID_THEMES.includes(rawTheme)) {
  rawTheme = 'code-night';
  try { if (typeof localStorage !== 'undefined') localStorage.setItem('flowPlannerTheme', 'code-night'); } catch(e) {}
}
var currentTheme = rawTheme;
var isMinimalist = (typeof localStorage !== 'undefined' && localStorage.getItem('flowPlannerMinimalist') === 'true');
var openTaskAddColumns = (typeof window !== 'undefined' && window.openTaskAddColumns) || {};
var categoriesOrder = (typeof window !== 'undefined' && window.categoriesOrder) || null;
var state = (typeof window !== 'undefined' && window.state) ? window.state : (typeof globalThis !== 'undefined' && globalThis.state ? globalThis.state : null);
var historyStack = (typeof window !== 'undefined' && Array.isArray(window.historyStack)) ? window.historyStack : (typeof globalThis !== 'undefined' && Array.isArray(globalThis.historyStack) ? globalThis.historyStack : []);

if (typeof window !== 'undefined') {
  window.currentLang = currentLang;
  window.currentTheme = currentTheme;
  window.rawTheme = rawTheme;
  window.isMinimalist = isMinimalist;
  window.openTaskAddColumns = openTaskAddColumns;
  window.categoriesOrder = categoriesOrder;
  window.state = state;
  window.historyStack = historyStack;
}
if (typeof globalThis !== 'undefined') {
  globalThis.currentLang = currentLang;
  globalThis.currentTheme = currentTheme;
  globalThis.rawTheme = rawTheme;
  globalThis.isMinimalist = isMinimalist;
  globalThis.openTaskAddColumns = openTaskAddColumns;
  globalThis.categoriesOrder = categoriesOrder;
  globalThis.state = state;
  globalThis.historyStack = historyStack;
}


// Helper to ensure 'notes' is positioned before 'termine' if both are present in saved orders
function reorderNotesBeforeTermine(arr) {
  if (!Array.isArray(arr)) return arr;
  const termineIdx = arr.findIndex(([id]) => id === 'termine');
  const notesIdx = arr.findIndex(([id]) => id === 'notes');
  if (termineIdx !== -1 && notesIdx !== -1 && notesIdx > termineIdx) {
    const [notesItem] = arr.splice(notesIdx, 1);
    arr.splice(termineIdx, 0, notesItem);
  }
  return arr;
}

// Helper to ensure 'todo' is positioned before 'daily' (Heute)
function reorderTodoBeforeDaily(arr) {
  if (!Array.isArray(arr)) return arr;
  const dailyIdx = arr.findIndex(([id]) => id === 'daily');
  const todoIdx = arr.findIndex(([id]) => id === 'todo');
  if (dailyIdx !== -1 && todoIdx !== -1 && todoIdx > dailyIdx) {
    const [todoItem] = arr.splice(todoIdx, 1);
    arr.splice(dailyIdx, 0, todoItem);
  }
  return arr;
}

// Helper to ensure 'done' (Erledigt) is positioned before 'occasionally' (Gelegentlich)
function reorderDoneBeforeOccasionally(arr) {
  if (!Array.isArray(arr)) return arr;
  const doneIdx = arr.findIndex(([id]) => id === 'done');
  const occIdx = arr.findIndex(([id]) => id === 'occasionally');
  if (doneIdx !== -1 && occIdx !== -1 && doneIdx !== occIdx - 1) {
    const [doneItem] = arr.splice(doneIdx, 1);
    const newOccIdx = arr.findIndex(([id]) => id === 'occasionally');
    arr.splice(newOccIdx, 0, doneItem);
  }
  return arr;
}

function loadCategoriesOrder() {
  try {
    const saved = localStorage.getItem('flowPlannerCategoriesOrder') || localStorage.getItem('flow_categories_order');
    if (saved) return reorderDoneBeforeOccasionally(reorderTodoBeforeDaily(reorderNotesBeforeTermine(JSON.parse(saved))));
  } catch (e) {
    console.warn('[State] loadCategoriesOrder warning:', e);
  }
  
  // Standard-Layout (To Do vor Heute, Erledigt vor Gelegentlich)
  return [
    ['weekly', 'home'],
    ['todo', 'list-todo'],
    ['daily', 'sun'],
    ['notes', 'file-text'],
    ['termine', 'calendar'],
    ['done', 'check-circle-2'],
    ['occasionally', 'clock']
  ];
}

function loadWorkCategoriesOrder() {
  try {
    const saved = localStorage.getItem('flowPlannerWorkCategoriesOrder') || localStorage.getItem('flow_work_categories_order');
    if (saved) return reorderNotesBeforeTermine(JSON.parse(saved));
  } catch (e) {
    console.warn('[State] loadWorkCategoriesOrder warning:', e);
  }
  
  return [
    ['work_focus', 'target'],
    ['work_in_progress', 'zap'],
    ['work_waiting', 'hourglass'],
    ['work_backlog', 'folder-kanban'],
    ['done', 'check-circle'],
    ['notes', 'sticky-note'],
    ['termine', 'clock']
  ];
}

function loadStudyCategoriesOrder() {
  try {
    const saved = localStorage.getItem('flowPlannerStudyCategoriesOrder') || localStorage.getItem('flow_study_categories_order');
    if (saved) return reorderNotesBeforeTermine(JSON.parse(saved));
  } catch (e) {
    console.warn('[State] loadStudyCategoriesOrder warning:', e);
  }
  
  return [
    ['study_focus', 'target'],
    ['study_modules', 'book-open'],
    ['study_submissions', 'clock'],
    ['study_deep', 'brain'],
    ['done', 'check-circle'],
    ['notes', 'file-text'],
    ['termine', 'calendar']
  ];
}

let workCategoriesOrder = null;
const WORK_CATEGORIES_ORDER = [
  ['work_focus', 'target'],
  ['work_in_progress', 'zap'],
  ['work_waiting', 'hourglass'],
  ['work_backlog', 'folder-kanban'],
  ['done', 'check-circle'],
    ['notes', 'sticky-note'],
    ['termine', 'clock']
];

let studyCategoriesOrder = null;
const STUDY_CATEGORIES_ORDER = [
  ['study_focus', 'target'],
  ['study_modules', 'book-open'],
  ['study_submissions', 'clock'],
  ['study_deep', 'brain'],
  ['done', 'check-circle'],
    ['notes', 'file-text'],
    ['termine', 'calendar']
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

if (typeof window !== 'undefined') {
  window.DEFAULT_WORK_TASKS_BY_LANG = DEFAULT_WORK_TASKS_BY_LANG;
  window.DEFAULT_STUDY_TASKS_BY_LANG = DEFAULT_STUDY_TASKS_BY_LANG;
}
if (typeof globalThis !== 'undefined') {
  globalThis.DEFAULT_WORK_TASKS_BY_LANG = DEFAULT_WORK_TASKS_BY_LANG;
  globalThis.DEFAULT_STUDY_TASKS_BY_LANG = DEFAULT_STUDY_TASKS_BY_LANG;
}

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
  const nowISO = new Date().toISOString();
  currentState._tombstones[String(id)] = nowISO;
  currentState.updatedAt = nowISO;
}

function clearTombstone(id) {
  if (!id) return;
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : null);
  if (currentState && currentState._tombstones && currentState._tombstones[id]) {
    delete currentState._tombstones[id];
  }
}

function trackItemDeletion(item, category = 'task', ws = 'private') {
  if (!item) return;
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : null);
  if (!currentState) return;
  if (!currentState._tombstones || typeof currentState._tombstones !== 'object') {
    currentState._tombstones = {};
  }
  const nowISO = new Date().toISOString();
  currentState.updatedAt = nowISO;

  // 1. Explizite ID speichern
  if (typeof item === 'object' && item !== null && item.id) {
    currentState._tombstones[String(item.id)] = nowISO;
  }

  // 2. Text- / Content-Hash erzeugen und in allen Prefix-Formen tombstonen
  const itemText = (typeof item === 'object' && item !== null)
    ? (item.task || item.name || item.text || item.title || JSON.stringify(item))
    : String(item || '');

  if (itemText && typeof computeStringHash === 'function') {
    const hash = computeStringHash(itemText);
    const prefix = ws === 'work' ? 'wtask' : (ws === 'study' ? 'stask' : 'task');
    currentState._tombstones[`${prefix}_${category}_h${hash}`] = nowISO;
    currentState._tombstones[`task_${category}_h${hash}`] = nowISO;
    currentState._tombstones[`${category}_h${hash}`] = nowISO;
    currentState._tombstones[`hash_${hash}`] = nowISO;
    if (category === 'done' || category === 'workDone' || category === 'studyDone') {
      currentState._tombstones[`done_h${hash}`] = nowISO;
      currentState._tombstones[`wdone_h${hash}`] = nowISO;
      currentState._tombstones[`sdone_h${hash}`] = nowISO;
    }
  }
}

function clearItemTombstone(item, category = 'task', ws = 'private') {
  if (!item) return;
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : null);
  if (!currentState || !currentState._tombstones) return;

  if (typeof item === 'object' && item !== null && item.id) {
    delete currentState._tombstones[String(item.id)];
  }

  const itemText = (typeof item === 'object' && item !== null)
    ? (item.task || item.name || item.text || item.title || JSON.stringify(item))
    : String(item || '');

  if (itemText && typeof computeStringHash === 'function') {
    const hash = computeStringHash(itemText);
    const prefix = ws === 'work' ? 'wtask' : (ws === 'study' ? 'stask' : 'task');
    delete currentState._tombstones[`${prefix}_${category}_h${hash}`];
    delete currentState._tombstones[`task_${category}_h${hash}`];
    delete currentState._tombstones[`${category}_h${hash}`];
    delete currentState._tombstones[`hash_${hash}`];
    delete currentState._tombstones[`done_h${hash}`];
    delete currentState._tombstones[`wdone_h${hash}`];
    delete currentState._tombstones[`sdone_h${hash}`];
  }
}

function trackCategoryClear(colId, ws = 'private', itemsToClear = []) {
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : null);
  if (!currentState) return;
  const nowISO = new Date().toISOString();
  currentState._clearedAt = currentState._clearedAt || {};
  currentState._clearedAt[`${ws}_${colId}`] = nowISO;
  currentState.updatedAt = nowISO;

  if (Array.isArray(itemsToClear)) {
    itemsToClear.forEach(item => {
      trackItemDeletion(item, colId, ws);
    });
  }
}

function trackAllListsClear(ws = 'private', curItems = {}, curDone = []) {
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : null);
  if (!currentState) return;
  const nowISO = new Date().toISOString();
  currentState._clearedAt = currentState._clearedAt || {};
  currentState._clearedAt[`${ws}__all`] = nowISO;
  currentState.updatedAt = nowISO;

  if (curItems && typeof curItems === 'object') {
    Object.entries(curItems).forEach(([colId, list]) => {
      if (Array.isArray(list)) {
        currentState._clearedAt[`${ws}_${colId}`] = nowISO;
        list.forEach(item => trackItemDeletion(item, colId, ws));
      }
    });
  }
  if (Array.isArray(curDone)) {
    currentState._clearedAt[`${ws}_done`] = nowISO;
    curDone.forEach(item => trackItemDeletion(item, 'done', ws));
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
  const currentL = lang || (typeof window !== 'undefined' && window.currentLang ? window.currentLang : (typeof currentLang !== 'undefined' ? currentLang : 'de'));
  const defTasksMap = (typeof window !== 'undefined' && window.DEFAULT_TASKS_BY_LANG)
    ? window.DEFAULT_TASKS_BY_LANG
    : ((typeof globalThis !== 'undefined' && globalThis.DEFAULT_TASKS_BY_LANG)
        ? globalThis.DEFAULT_TASKS_BY_LANG
        : (typeof DEFAULT_TASKS_BY_LANG !== 'undefined' ? DEFAULT_TASKS_BY_LANG : null));
  const localizedDefaults = (defTasksMap && defTasksMap[currentL]) 
    ? defTasksMap[currentL] 
    : ((defTasksMap && defTasksMap['de']) ? defTasksMap['de'] : { daily: [], weekly: [], occasionally: [] });
  const customDefaults = getCustomDefaults();
  const hasCustomDaily = customDefaults && Array.isArray(customDefaults.daily) && customDefaults.daily.length > 0;
  const hasCustomWeekly = customDefaults && Array.isArray(customDefaults.weekly) && customDefaults.weekly.length > 0;
  const hasCustomOccasional = customDefaults && Array.isArray(customDefaults.occasionally) && customDefaults.occasionally.length > 0;

  const initDaily = hasCustomDaily ? customDefaults.daily : (localizedDefaults.daily || []);
  const initWeekly = hasCustomWeekly ? customDefaults.weekly : (localizedDefaults.weekly || []);
  const initOccasionally = hasCustomOccasional ? customDefaults.occasionally : (localizedDefaults.occasionally || []);

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
      userPlan: 'free', // 'free' | 'pro' — Grundlage für spätere Paywall-Logik
      settings: { language: currentL, theme: 'aurora', isMinimalist: false }
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

  // Intelligente chronologische Sortierung für Standard-Aufgaben
  const sortCategoryByDefaults = (list, refList) => {
    if (!Array.isArray(list) || !Array.isArray(refList) || list.length === 0) return list;
    return [...list].sort((a, b) => {
      const taskA = typeof a === 'object' ? (a.task || '') : String(a);
      const taskB = typeof b === 'object' ? (b.task || '') : String(b);
      const idxA = refList.indexOf(taskA);
      const idxB = refList.indexOf(taskB);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  };

  if (s.items && localizedDefaults) {
    if (localizedDefaults.daily) s.items.daily = sortCategoryByDefaults(s.items.daily, localizedDefaults.daily);
    if (localizedDefaults.weekly) s.items.weekly = sortCategoryByDefaults(s.items.weekly, localizedDefaults.weekly);
    if (localizedDefaults.occasionally) s.items.occasionally = sortCategoryByDefaults(s.items.occasionally, localizedDefaults.occasionally);
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

  // 5.5 Settings
  if (!s.settings || typeof s.settings !== 'object') {
    s.settings = { language: currentL, theme: 'aurora', isMinimalist: false };
  } else if (!s.settings.language) {
    s.settings.language = currentL;
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

  // 8. Migration: "10 Minuten abends aufräumen" / "10 Min. Abend-Aufräumen" -> "5min aufräumen"
  const renameTidyUpTask = (list) => {
    if (!Array.isArray(list)) return;
    list.forEach((item, i) => {
      const taskText = typeof item === 'object' && item !== null ? item.task : String(item || '');
      if (/10\s*min.*abend.*aufraum/i.test(taskText) || /10\s*minuten.*abends.*aufraum/i.test(taskText) || /10\s*min.*evening.*tidy/i.test(taskText)) {
        if (typeof item === 'string') {
          list[i] = '5min aufräumen';
        } else if (typeof item === 'object' && item) {
          item.task = '5min aufräumen';
        }
      }
    });
  };
  if (s.items) {
    Object.values(s.items).forEach(renameTidyUpTask);
  }
  if (Array.isArray(s.done)) {
    renameTidyUpTask(s.done);
  }
  if (s.workspaces) {
    Object.values(s.workspaces).forEach(ws => {
      if (ws && ws.items) Object.values(ws.items).forEach(renameTidyUpTask);
      if (ws && Array.isArray(ws.done)) renameTidyUpTask(ws.done);
    });
  }

  // 8b. Migration: Entferne toolLinks von allen Aufgaben
  const scrubToolLinks = (list) => {
    if (!Array.isArray(list)) return;
    list.forEach(item => {
      if (item && typeof item === 'object' && item.toolLinks) {
        delete item.toolLinks;
      }
    });
  };
  if (s.items) Object.values(s.items).forEach(scrubToolLinks);
  if (s.workspaces) {
    Object.values(s.workspaces).forEach(ws => {
      if (ws && ws.items) Object.values(ws.items).forEach(scrubToolLinks);
    });
  }

  // 9. Duschen / 10. Aufräumen / 11. Kochen (nur bei Erst-Migration von < v3)
  const isV3Clean = !!(raw && raw.version >= 3 && raw._migrationV3TasksPlaced);
  if (!isV3Clean) {
    if (s.items && Array.isArray(s.items.daily)) {
      const isShower = (t) => {
        const text = (typeof t === 'object' && t !== null) ? (t.task || '') : String(t || '');
        return /^(duschen|take a shower|ducharse|prendre une douche|fare la doccia|ντους)$/i.test(text.trim());
      };
      const showerIndex = s.items.daily.findIndex(isShower);
      if (showerIndex !== -1) {
        s.items.daily.splice(showerIndex, 1);
      }
    }
    if (s.items) {
      if (!Array.isArray(s.items.occasionally)) s.items.occasionally = [];
      const hasShower = s.items.occasionally.some(t => {
        const text = (typeof t === 'object' && t !== null) ? (t.task || '') : String(t || '');
        return /^(duschen|take a shower|ducharse|prendre une douche|fare la doccia|ντους)$/i.test(text.trim());
      });
      if (!hasShower && !raw) {
        s.items.occasionally.unshift('Duschen');
      }
    }

    // 10. Aufräumen muss bei Haushalt (weekly) bleiben & in Gelegentlich (3-Tage-Zyklus)
    if (s.items) {
      if (!Array.isArray(s.items.weekly)) s.items.weekly = [];
      const hasWeeklyClean = s.items.weekly.some(t => {
        const text = (typeof t === 'object' && t !== null) ? (t.task || '') : String(t || '');
        return /(aufräum|aufraeum|aufraum|tidy|ordenar|ranger|riordinar|τακτοποί)/i.test(text);
      });
      if (!hasWeeklyClean && !raw) {
        s.items.weekly.unshift('Aufräumen');
      }

      if (typeof checkOccasionalAufräumen === 'function') {
        checkOccasionalAufräumen(s);
      }
    }

    // 11. Wichtigste Aufgabe & Kochen von Täglich (Heute) entfernen, Kochen in Gelegentlich verschieben
    const isFocusOrCookingInDaily = (t) => {
      const text = ((typeof t === 'object' && t !== null) ? (t.task || '') : String(t || '')).trim();
      return /^(1\s*)?(wichtigste aufgabe(\s*\(fokus\))?|key priority(\s*\(focus\))?|1 main focus task|prioridad clave(\s*\(foco\))?|1 tarea clave(\s*\(foco\))?|priorité clé(\s*\(focus\))?|1 tâche focus principale|priorità chiave(\s*\(focus\))?|1 attività chiave(\s*\(focus\))?|κύρια προτεραιότητα(\s*\(focus\))?|1 κύρια εργασία εστίασης|kochen|cook a meal|cocinar|préparer un repas|preparare un pasto|μαγειρική)$/i.test(text);
    };
    if (s.items && Array.isArray(s.items.daily)) {
      s.items.daily = s.items.daily.filter(t => !isFocusOrCookingInDaily(t));
    }
    if (s.items) {
      if (!Array.isArray(s.items.occasionally)) s.items.occasionally = [];
      const hasCooking = s.items.occasionally.some(t => {
        const text = ((typeof t === 'object' && t !== null) ? (t.task || '') : String(t || '')).trim();
        return /^(kochen|cook a meal|cocinar|préparer un repas|preparare un pasto|μαγειρική)$/i.test(text);
      });
      if (!hasCooking && !raw) {
        const showerIdx = s.items.occasionally.findIndex(t => {
          const text = ((typeof t === 'object' && t !== null) ? (t.task || '') : String(t || '')).trim();
          return /^(duschen|take a shower|ducharse|prendre une douche|fare la doccia|ντους)$/i.test(text);
        });
        if (showerIdx !== -1) {
          s.items.occasionally.splice(showerIdx + 1, 0, 'Kochen');
        } else {
          s.items.occasionally.unshift('Kochen');
        }
      }
    }
    if (customDefaults && Array.isArray(customDefaults.daily)) {
      const beforeLen = customDefaults.daily.length;
      customDefaults.daily = customDefaults.daily.filter(t => !isFocusOrCookingInDaily(t));
      if (customDefaults.daily.length !== beforeLen) {
        saveCustomDefaults(customDefaults);
      }
    }
  }

  s._migrationV3TasksPlaced = true;

  // 12. Schutz vor mehrfach akkumulierten "Aufräumen"-Duplikaten (z.B. in occasionally)
  const deduplicateCleaningTasks = (itemsObj) => {
    if (!itemsObj || typeof itemsObj !== 'object') return;
    Object.keys(itemsObj).forEach(cat => {
      if (Array.isArray(itemsObj[cat])) {
        let cleanFound = false;
        itemsObj[cat] = itemsObj[cat].filter(item => {
          const text = ((typeof item === 'object' && item !== null) ? (item.task || '') : String(item || '')).trim();
          if (!text) return false;
          if (/(aufräum|aufraeum|aufraum|tidy|ordenar|ranger|riordinar|τακτοποί)/i.test(text)) {
            if (cleanFound) return false;
            cleanFound = true;
            return true;
          }
          return true;
        });
      }
    });
  };
  deduplicateCleaningTasks(s.items);
  if (s.workspaces) {
    Object.keys(s.workspaces).forEach(wKey => {
      if (s.workspaces[wKey] && s.workspaces[wKey].items) {
        deduplicateCleaningTasks(s.workspaces[wKey].items);
      }
    });
  }

  return s;
}

window.migrateState = migrateState;

function loadState() {
  let loaded = null;
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed) {
        loaded = migrateState(parsed, typeof currentLang !== 'undefined' ? currentLang : 'de');
      }
    }
  } catch (e) {
    console.warn('[State] loadState parse warning, returning migrated defaults:', e);
  }
  if (!loaded) {
    loaded = migrateState(null, typeof currentLang !== 'undefined' ? currentLang : 'de');
  }
  if (typeof NoodleEvents !== 'undefined' && NoodleEvents && typeof NoodleEvents.emit === 'function') {
    try {
      NoodleEvents.emit('state:loaded', { state: loaded });
    } catch (evErr) {}
  }
  return loaded;
}

function setWorkspace(mode) {
  if (mode !== 'private' && mode !== 'work' && mode !== 'study' && mode !== 'shared') return;
  
  if (mode === 'shared' && (!state.workspaces || !state.workspaces.shared)) {
    if (!state.workspaces) state.workspaces = {};
    const baseItems = (state.workspaces && state.workspaces.private && state.workspaces.private.items) || state.items || {};
    state.workspaces.shared = {
      items: JSON.parse(JSON.stringify(baseItems)),
      done: [],
      history: []
    };
  }

  if (typeof state !== "undefined" && state) state.activeWorkspace = mode;
  if (typeof window !== "undefined" && window.state) window.state.activeWorkspace = mode;
  if (typeof NoodleEvents !== 'undefined' && NoodleEvents && typeof NoodleEvents.emit === 'function') {
    try {
      NoodleEvents.emit('workspace:changed', { mode });
    } catch (evErr) {}
  }
  saveState();
  updateWorkspaceSwitchUI();
  if (typeof renderApp === 'function') renderApp();
  if (typeof populateHelperTaskSelect === 'function') populateHelperTaskSelect();
  if (typeof showToast === 'function') {
    if (mode === 'shared') {
      const roomName = (typeof CollabEngine !== 'undefined' && CollabEngine.getRoom) ? CollabEngine.getRoom() : 'team-space';
      showToast(`👥 Gemeinsames Team-Dashboard (#${roomName}) aktiv! Live synchronisiert ⚡`);
    } else if (mode === 'study') {
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
  const nextMode = (current === 'private') ? 'work' : ((current === 'work') ? 'study' : ((current === 'study') ? 'shared' : 'private'));
  setWorkspace(nextMode);
}
window.toggleWorkspace = toggleWorkspace;

function getCurrentWorkspaceItems() {
  const s = (typeof state !== 'undefined' && state) ? state : (typeof window !== 'undefined' && window.state ? window.state : null);
  if (!s) return {};
  if (s.activeWorkspace === 'study') {
    if (!s.studyItems) s.studyItems = typeof createDefaultStudyItems === 'function' ? createDefaultStudyItems(typeof currentLang !== 'undefined' ? currentLang : 'en') : {};
    return s.studyItems;
  }
  if (s.activeWorkspace === 'work') {
    if (!s.workItems) s.workItems = typeof createDefaultWorkItems === 'function' ? createDefaultWorkItems(typeof currentLang !== 'undefined' ? currentLang : 'en') : {};
    return s.workItems;
  }
  if (s.activeWorkspace === 'shared' && s.workspaces && s.workspaces.shared && s.workspaces.shared.items) {
    return s.workspaces.shared.items;
  }
  return s.items || {};
}

function getCurrentWorkspaceDone() {
  const s = (typeof state !== 'undefined' && state) ? state : (typeof window !== 'undefined' && window.state ? window.state : null);
  if (!s) return [];
  if (s.activeWorkspace === 'study') {
    if (!Array.isArray(s.studyDone)) s.studyDone = [];
    return s.studyDone;
  }
  if (s.activeWorkspace === 'work') {
    if (!Array.isArray(s.workDone)) s.workDone = [];
    return s.workDone;
  }
  if (s.activeWorkspace === 'shared' && s.workspaces && s.workspaces.shared && Array.isArray(s.workspaces.shared.done)) {
    return s.workspaces.shared.done;
  }
  if (!Array.isArray(s.done)) s.done = [];
  return s.done;
}

window.getCurrentWorkspaceItems = getCurrentWorkspaceItems;
window.getCurrentWorkspaceDone = getCurrentWorkspaceDone;
if (typeof globalThis !== 'undefined') {
  globalThis.getCurrentWorkspaceItems = getCurrentWorkspaceItems;
  globalThis.getCurrentWorkspaceDone = getCurrentWorkspaceDone;
}

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
  const colDropdown = document.getElementById('dropdown-manage-columns');
  if (colDropdown) colDropdown.classList.add('hidden');
  const el = document.getElementById('dropdown-header-workspace');
  if (el) {
    el.classList.remove('hidden');
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }
}
window.openHeaderWorkspaceDropdown = openHeaderWorkspaceDropdown;

function closeHeaderWorkspaceDropdown(force = false) {
  if (headerWsDropdownTimer) {
    clearTimeout(headerWsDropdownTimer);
    headerWsDropdownTimer = null;
  }
  const el = document.getElementById('dropdown-header-workspace');
  if (force) {
    if (el) el.classList.add('hidden');
    return;
  }
  headerWsDropdownTimer = setTimeout(() => {
    const elTarget = document.getElementById('dropdown-header-workspace');
    const btn = document.getElementById('header-workspace-wrapper');
    try {
      if (elTarget && elTarget.matches(':hover')) return;
      if (btn && btn.matches(':hover')) return;
    } catch (e) {}
    if (elTarget) elTarget.classList.add('hidden');
  }, 260);
}
window.closeHeaderWorkspaceDropdown = closeHeaderWorkspaceDropdown;

function toggleHeaderWorkspaceDropdown(event) {
  if (event) {
    event.stopPropagation();
    if (event.preventDefault) event.preventDefault();
  }
  const colDropdown = document.getElementById('dropdown-manage-columns');
  if (colDropdown) colDropdown.classList.add('hidden');
  const el = document.getElementById('dropdown-header-workspace');
  if (!el) return;
  if (el.classList.contains('hidden')) {
    openHeaderWorkspaceDropdown();
  } else {
    closeHeaderWorkspaceDropdown(true);
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
    if (currentWs === 'shared') {
      const roomName = (typeof CollabEngine !== 'undefined' && CollabEngine.getRoom) ? CollabEngine.getRoom() : 'team';
      headerIcon.textContent = '👥';
      headerLabel.textContent = `Team (#${roomName})`;
      headerBtn.className = 'h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-400/40 text-violet-200 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 shrink-0';
      headerBtn.title = `Team-Board (#${roomName})`;
    } else if (currentWs === 'study') {
      headerIcon.textContent = '🎓';
      headerLabel.textContent = typeof t === 'function' ? t('workspace_study') : 'Studium';
      headerBtn.className = 'h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-200 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 shrink-0';
      headerBtn.title = typeof t === 'function' ? t('workspace_study') : 'Studium';
    } else if (currentWs === 'work') {
      headerIcon.textContent = '💼';
      headerLabel.textContent = typeof t === 'function' ? t('workspace_work') : 'Arbeit';
      headerBtn.className = 'h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 shrink-0';
      headerBtn.title = typeof t === 'function' ? t('workspace_work') : 'Arbeit';
    } else {
      headerIcon.textContent = '🏠';
      headerLabel.textContent = typeof t === 'function' ? t('workspace_private') : 'Privat';
      headerBtn.className = 'h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 text-purple-200 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 shrink-0';
      headerBtn.title = typeof t === 'function' ? t('workspace_private') : 'Privat';
    }
  }

  // Active option highlight inside Header Dropdown (Dezent & aufgeräumt)
  const optPriv = document.getElementById('header-ws-opt-private');
  const optWork = document.getElementById('header-ws-opt-work');
  const optStudy = document.getElementById('header-ws-opt-study');
  const optShared = document.getElementById('header-ws-opt-shared');
  if (optPriv) optPriv.className = `w-full p-1.5 px-2 rounded-xl text-left flex items-center gap-2 transition cursor-pointer text-xs border ${currentWs === 'private' ? 'bg-purple-500/15 border-purple-400/35 text-purple-200 font-semibold' : 'border-transparent text-gray-300 hover:bg-white/5'}`;
  if (optWork) optWork.className = `w-full p-1.5 px-2 rounded-xl text-left flex items-center gap-2 transition cursor-pointer text-xs border ${currentWs === 'work' ? 'bg-cyan-500/15 border-cyan-400/35 text-cyan-200 font-semibold' : 'border-transparent text-gray-300 hover:bg-white/5'}`;
  if (optStudy) optStudy.className = `w-full p-1.5 px-2 rounded-xl text-left flex items-center gap-2 transition cursor-pointer text-xs border ${currentWs === 'study' ? 'bg-amber-500/15 border-amber-400/35 text-amber-200 font-semibold' : 'border-transparent text-gray-300 hover:bg-white/5'}`;
  if (optShared) optShared.className = `w-full p-1.5 px-2 rounded-xl text-left flex items-center justify-between transition cursor-pointer text-xs border ${currentWs === 'shared' ? 'bg-violet-500/20 border-violet-400/40 text-violet-200 font-semibold' : 'border-transparent text-gray-300 hover:bg-white/5'}`;

  // 2. SETTINGS / MOBILE TOGGLE FALLBACKS
  const toggleBtn = document.getElementById('btn-workspace-toggle');
  const iconEl = document.getElementById('ws-toggle-icon');
  const textEl = document.getElementById('ws-toggle-text');
  
  const mobileToggleBtn = document.getElementById('mobile-btn-workspace-toggle');
  const mobileIconEl = document.getElementById('mobile-ws-toggle-icon');
  const mobileTextEl = document.getElementById('mobile-ws-toggle-text');

  let currentIcon = '🏠';
  let currentLabel = typeof t === 'function' ? t('workspace_private') : 'Privat';
  if (currentWs === 'shared') {
    currentIcon = '👥';
    currentLabel = 'Team-Board';
  } else if (currentWs === 'work') {
    currentIcon = '💼';
    currentLabel = typeof t === 'function' ? t('workspace_work') : 'Arbeit';
  } else if (currentWs === 'study') {
    currentIcon = '🎓';
    currentLabel = typeof t === 'function' ? t('workspace_study') : 'Studium';
  }

  if (iconEl) iconEl.textContent = currentIcon;
  if (textEl) {
    textEl.textContent = currentLabel;
    textEl.className = currentWs === 'shared' ? 'truncate text-violet-300 font-bold' : (currentWs === 'work' ? 'truncate text-blue-300' : (currentWs === 'study' ? 'truncate text-emerald-300' : 'truncate text-purple-300'));
  }
  if (toggleBtn) {
    toggleBtn.title = currentLabel;
  }

  if (mobileIconEl) mobileIconEl.textContent = currentIcon;
  if (mobileTextEl) {
    mobileTextEl.textContent = currentLabel;
    mobileTextEl.className = currentWs === 'shared' ? 'text-xs font-bold text-violet-300 hidden sm:inline' : (currentWs === 'work' ? 'text-xs font-bold text-blue-300 hidden sm:inline' : (currentWs === 'study' ? 'text-xs font-bold text-emerald-300 hidden sm:inline' : 'text-xs font-bold text-purple-300 hidden sm:inline'));
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
if (typeof window !== 'undefined') {
  window.state = state;
  window.historyStack = historyStack;
  window.categoriesOrder = categoriesOrder;
  window.workCategoriesOrder = workCategoriesOrder;
  window.studyCategoriesOrder = studyCategoriesOrder;
}
if (typeof globalThis !== 'undefined') {
  globalThis.state = state;
  globalThis.historyStack = historyStack;
  globalThis.categoriesOrder = categoriesOrder;
  globalThis.workCategoriesOrder = workCategoriesOrder;
  globalThis.studyCategoriesOrder = studyCategoriesOrder;
}

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
  if (currentState) {
    currentState.updatedAt = new Date().toISOString();
  }
  let saveSuccess = false;
  let saveError = null;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(currentState));
    if (typeof IDB_VAULT !== 'undefined' && IDB_VAULT && typeof IDB_VAULT.set === 'function') {
      IDB_VAULT.set(STORE_KEY, currentState);
    }
    saveSuccess = true;
  } catch (e) {
    saveError = e;
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
      saveSuccess = true;
      saveError = null;
    } catch (err) {
      saveError = err;
      console.error('[State] Critical failure writing state to localStorage:', err);
      if (typeof IDB_VAULT !== 'undefined' && IDB_VAULT && typeof IDB_VAULT.set === 'function') {
        try { IDB_VAULT.set(STORE_KEY, currentState); } catch (idbErr) {}
      }
    }
  }

  if (!saveSuccess) {
    if (typeof NoodleEvents !== 'undefined' && NoodleEvents && typeof NoodleEvents.emit === 'function') {
      try {
        NoodleEvents.emit('state:save-failed', { error: saveError, state: currentState });
      } catch (evErr) {}
    }
    return false;
  }

  if (!skipP2PSync && typeof p2pSyncEngine !== 'undefined' && p2pSyncEngine.isConnected()) {
    p2pSyncEngine.broadcastStateUpdate();
  }
  if (!skipP2PSync && typeof cloudSyncEngine !== 'undefined' && typeof FlowAuth !== 'undefined' && FlowAuth.isLoggedIn()) {
    cloudSyncEngine.triggerAutoPush();
  }
  if (typeof NoodleEvents !== 'undefined' && NoodleEvents && typeof NoodleEvents.emit === 'function') {
    try {
      NoodleEvents.emit('state:saved', { state: currentState, skipP2PSync });
    } catch (evErr) {}
  }
  return true;
}

function persistHistory() {
  const activeStack = (typeof window !== 'undefined' && Array.isArray(window.historyStack)) ? window.historyStack : historyStack;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(activeStack));
  } catch (e) {
    if (Array.isArray(activeStack) && activeStack.length > 5) {
      const trimmed = activeStack.slice(-5);
      historyStack = trimmed;
      if (typeof window !== 'undefined') {
        window.historyStack.length = 0;
        window.historyStack.push(...trimmed);
      }
      if (typeof globalThis !== 'undefined' && globalThis.historyStack !== (typeof window !== 'undefined' ? window.historyStack : null)) {
        globalThis.historyStack = trimmed;
      }
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
      } catch (e2) {
        try { localStorage.removeItem(HISTORY_KEY); } catch (e3) {}
      }
    }
  }
}

function updateUndoUI() {
  if (typeof document === 'undefined') return;
  const undoBtn = document.getElementById('btn-board-undo');
  const triggerBtn = document.getElementById('btn-undo-history-trigger');
  const hasHistory = Array.isArray(historyStack) && historyStack.length > 0;

  if (undoBtn) {
    undoBtn.disabled = !hasHistory;
    if (hasHistory) {
      undoBtn.classList.remove('opacity-70', 'opacity-60', 'opacity-40', 'opacity-30', 'pointer-events-none', 'grayscale');
      undoBtn.classList.add('opacity-100');
      const badge = undoBtn.querySelector('#undo-count-badge');
      if (badge) {
        badge.textContent = historyStack.length;
        badge.classList.remove('hidden');
      }
    } else {
      undoBtn.classList.add('opacity-70', 'pointer-events-none');
      undoBtn.classList.remove('opacity-100', 'grayscale');
      const badge = undoBtn.querySelector('#undo-count-badge');
      if (badge) badge.classList.add('hidden');
    }
  }

  if (triggerBtn) {
    triggerBtn.disabled = !hasHistory;
    if (hasHistory) {
      triggerBtn.classList.remove('opacity-30', 'pointer-events-none');
      triggerBtn.classList.add('opacity-100');
    } else {
      triggerBtn.classList.add('opacity-30', 'pointer-events-none');
      triggerBtn.classList.remove('opacity-100');
    }
  }
}

function saveHistory(actionInfo = null) {
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof globalThis !== 'undefined' && globalThis.state ? globalThis.state : state);
  const stack = (typeof window !== 'undefined' && Array.isArray(window.historyStack)) ? window.historyStack : (typeof globalThis !== 'undefined' && Array.isArray(globalThis.historyStack) ? globalThis.historyStack : historyStack);
  if (currentState) {
    const activeCats = (typeof window !== 'undefined' && window.categoriesOrder) ? window.categoriesOrder : (typeof categoriesOrder !== 'undefined' ? categoriesOrder : null);
    const activeWorkCats = (typeof window !== 'undefined' && window.workCategoriesOrder) ? window.workCategoriesOrder : (typeof workCategoriesOrder !== 'undefined' ? workCategoriesOrder : null);
    const activeStudyCats = (typeof window !== 'undefined' && window.studyCategoriesOrder) ? window.studyCategoriesOrder : (typeof studyCategoriesOrder !== 'undefined' ? studyCategoriesOrder : null);

    // Formatierte Aktionsbeschreibung
    let label = '';
    if (typeof actionInfo === 'string' && actionInfo.trim()) {
      label = actionInfo.trim();
    } else if (actionInfo && typeof actionInfo === 'object') {
      label = actionInfo.label || actionInfo.action || actionInfo.name || '';
    }

    // Falls kein expliziter Text mitgegeben wurde, präzisen Standard anhand des vorherigen Zustands ermitteln
    if (!label) {
      const prevSnap = (stack && stack.length > 0) ? stack[stack.length - 1] : null;
      if (prevSnap && prevSnap.items && currentState.items) {
        // Zähle Aufgaben
        const prevCount = Object.values(prevSnap.items).reduce((acc, l) => acc + (Array.isArray(l) ? l.length : 0), 0) + (Array.isArray(prevSnap.done) ? prevSnap.done.length : 0);
        const curCount = Object.values(currentState.items).reduce((acc, l) => acc + (Array.isArray(l) ? l.length : 0), 0) + (Array.isArray(currentState.done) ? currentState.done.length : 0);
        if (curCount > prevCount) {
          label = 'Aufgabe hinzugefügt';
        } else if (curCount < prevCount) {
          label = 'Aufgabe entfernt oder abgeschlossen';
        } else {
          label = 'Aufgaben geändert / verschoben';
        }
      } else {
        label = 'Aufgaben geändert';
      }
    }

    // Fokussierter Snapshot: Speichert nur Aufgaben- und Listen-Änderungen
    const listSnapshot = {
      items: currentState.items ? JSON.parse(JSON.stringify(currentState.items)) : {},
      done: Array.isArray(currentState.done) ? JSON.parse(JSON.stringify(currentState.done)) : [],
      workItems: currentState.workItems ? JSON.parse(JSON.stringify(currentState.workItems)) : {},
      workDone: Array.isArray(currentState.workDone) ? JSON.parse(JSON.stringify(currentState.workDone)) : [],
      studyItems: currentState.studyItems ? JSON.parse(JSON.stringify(currentState.studyItems)) : {},
      studyDone: Array.isArray(currentState.studyDone) ? JSON.parse(JSON.stringify(currentState.studyDone)) : [],
      completedSteps: currentState.completedSteps ? JSON.parse(JSON.stringify(currentState.completedSteps)) : {},
      customSteps: currentState.customSteps ? JSON.parse(JSON.stringify(currentState.customSteps)) : {},
      activeWorkspace: currentState.activeWorkspace || 'private',
      _actionLabel: label,
      _timestamp: Date.now()
    };

    if (activeCats) {
      listSnapshot._savedCategoriesOrder = JSON.parse(JSON.stringify(activeCats));
    }
    if (activeWorkCats) {
      listSnapshot._savedWorkCategoriesOrder = JSON.parse(JSON.stringify(activeWorkCats));
    }
    if (activeStudyCats) {
      listSnapshot._savedStudyCategoriesOrder = JSON.parse(JSON.stringify(activeStudyCats));
    }

    stack.push(listSnapshot);
    if (stack.length > 15) stack.shift();
    historyStack = stack;
    if (typeof window !== 'undefined') window.historyStack = stack;
    if (typeof globalThis !== 'undefined') globalThis.historyStack = stack;
    persistHistory();
    updateUndoUI();
    if (typeof NoodleEvents !== 'undefined' && NoodleEvents && typeof NoodleEvents.emit === 'function') {
      try {
        NoodleEvents.emit('history:saved', { label, snapshot: listSnapshot });
      } catch (evErr) {}
    }
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
  if (!taskName || typeof taskName !== 'string') return taskName;
  const allLangs = ['de', 'en', 'es', 'fr', 'it', 'el'];

  // 1. Check DEFAULT_TASKS_BY_LANG
  const defTasks = (typeof window !== 'undefined' && window.DEFAULT_TASKS_BY_LANG) || (typeof DEFAULT_TASKS_BY_LANG !== 'undefined' ? DEFAULT_TASKS_BY_LANG : null);
  if (defTasks) {
    const cats = ['daily', 'weekly', 'occasionally'];
    for (const cat of cats) {
      for (const l of allLangs) {
        const list = defTasks[l]?.[cat];
        if (Array.isArray(list)) {
          const idx = list.indexOf(taskName);
          if (idx !== -1 && defTasks['de']?.[cat]?.[idx]) {
            return defTasks['de'][cat][idx];
          }
        }
      }
    }
  }

  // 2. Check DEFAULT_WORK_TASKS_BY_LANG
  const defWork = (typeof window !== 'undefined' && window.DEFAULT_WORK_TASKS_BY_LANG) || (typeof DEFAULT_WORK_TASKS_BY_LANG !== 'undefined' ? DEFAULT_WORK_TASKS_BY_LANG : null);
  if (defWork) {
    const workCats = ['work_focus', 'work_in_progress', 'work_waiting', 'work_backlog', 'termine', 'notes'];
    for (const cat of workCats) {
      for (const l of allLangs) {
        const list = defWork[l]?.[cat];
        if (Array.isArray(list)) {
          const idx = list.indexOf(taskName);
          if (idx !== -1 && defWork['de']?.[cat]?.[idx]) {
            return defWork['de'][cat][idx];
          }
        }
      }
    }
  }

  // 3. Check DEFAULT_STUDY_TASKS_BY_LANG
  const defStudy = (typeof window !== 'undefined' && window.DEFAULT_STUDY_TASKS_BY_LANG) || (typeof DEFAULT_STUDY_TASKS_BY_LANG !== 'undefined' ? DEFAULT_STUDY_TASKS_BY_LANG : null);
  if (defStudy) {
    const studyCats = ['study_focus', 'study_modules', 'study_submissions', 'study_deep', 'termine', 'notes'];
    for (const cat of studyCats) {
      for (const l of allLangs) {
        const list = defStudy[l]?.[cat];
        if (Array.isArray(list)) {
          const idx = list.indexOf(taskName);
          if (idx !== -1 && defStudy['de']?.[cat]?.[idx]) {
            return defStudy['de'][cat][idx];
          }
        }
      }
    }
  }

  // 4. Check ROUTINE_PRESETS
  const rPresets = (typeof window !== 'undefined' && window.ROUTINE_PRESETS) || (typeof ROUTINE_PRESETS !== 'undefined' ? ROUTINE_PRESETS : null);
  if (Array.isArray(rPresets)) {
    for (const preset of rPresets) {
      if (preset.tasks) {
        for (const cat in preset.tasks) {
          const catObj = preset.tasks[cat];
          if (typeof catObj === 'object') {
            for (const l of allLangs) {
              const list = catObj[l];
              if (Array.isArray(list)) {
                const idx = list.indexOf(taskName);
                if (idx !== -1 && catObj['de']?.[idx]) {
                  return catObj['de'][idx];
                }
              }
            }
          }
        }
      }
    }
  }

  return taskName;
}

function applyHistorySnapshot(popped) {
  if (!popped) return;
  // 1. Spalten-Reihenfolge der Listen wiederherstellen falls vorhanden
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

  // 2. Gezielte Wiederherstellung NUR der Listen & Aufgaben (Items, Done, Steps)
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof globalThis !== 'undefined' && globalThis.state ? globalThis.state : state);
  if (currentState) {
    const ws = currentState.activeWorkspace || 'private';
    const nowISO = new Date().toISOString();
    currentState._clearedAt = currentState._clearedAt || {};
    currentState.updatedAt = nowISO;

    const collectTexts = (itemsObj) => {
      const set = new Set();
      if (!itemsObj || typeof itemsObj !== 'object') return set;
      Object.values(itemsObj).forEach(list => {
        if (Array.isArray(list)) {
          list.forEach(it => {
            const txt = typeof it === 'object' && it ? (it.task || it.name || it.id || '') : String(it || '');
            if (txt) set.add(txt);
          });
        }
      });
      return set;
    };

    if (popped.items && currentState.items) {
      const poppedTexts = collectTexts(popped.items);
      Object.entries(currentState.items).forEach(([colId, list]) => {
        if (Array.isArray(list)) {
          list.forEach(it => {
            const txt = typeof it === 'object' && it ? (it.task || it.name || it.id || '') : String(it || '');
            if (txt && !poppedTexts.has(txt)) {
              trackItemDeletion(it, colId, ws);
            }
          });
        }
      });
    }

    if (popped.items && typeof popped.items === 'object') {
      Object.entries(popped.items).forEach(([colId, list]) => {
        if (Array.isArray(list)) {
          list.forEach(it => {
            clearItemTombstone(it, colId, ws);
            if (typeof it === 'object' && it !== null) {
              it.updatedAt = nowISO;
            }
          });
        }
      });
    }

    if (popped.items) currentState.items = JSON.parse(JSON.stringify(popped.items));
    if (popped.done) currentState.done = JSON.parse(JSON.stringify(popped.done));
    if (popped.workItems) currentState.workItems = JSON.parse(JSON.stringify(popped.workItems));
    if (popped.workDone) currentState.workDone = JSON.parse(JSON.stringify(popped.workDone));
    if (popped.studyItems) currentState.studyItems = JSON.parse(JSON.stringify(popped.studyItems));
    if (popped.studyDone) currentState.studyDone = JSON.parse(JSON.stringify(popped.studyDone));
    if (popped.completedSteps) currentState.completedSteps = JSON.parse(JSON.stringify(popped.completedSteps));
    if (popped.customSteps) currentState.customSteps = JSON.parse(JSON.stringify(popped.customSteps));
    
    state = currentState;
    if (typeof window !== 'undefined') window.state = state;
    if (typeof globalThis !== 'undefined') globalThis.state = state;
  }
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

  applyHistorySnapshot(popped);

  historyStack = stack;
  if (typeof window !== 'undefined') window.historyStack = stack;
  if (typeof globalThis !== 'undefined') globalThis.historyStack = stack;

  persistHistory();
  updateUndoUI();
  saveState();
  if (typeof NoodleEvents !== 'undefined' && NoodleEvents && typeof NoodleEvents.emit === 'function') {
    try {
      NoodleEvents.emit('history:undo', { restoredSnapshot: popped });
    } catch (evErr) {}
  }

  const undoneAction = popped._actionLabel ? ` (${popped._actionLabel})` : '';
  const undoMsg = (typeof tr === 'function')
    ? tr({
        de: `Rückgängig gemacht: ${popped._actionLabel || 'Letzter Schritt'} ↩️`,
        en: `Undone: ${popped._actionLabel || 'Last action'} ↩️`,
        fr: `Annulé : ${popped._actionLabel || 'Dernière action'} ↩️`,
        it: `Annullato: ${popped._actionLabel || 'Ultima azione'} ↩️`,
        es: `Deshecho: ${popped._actionLabel || 'Última acción'} ↩️`,
        el: `Αναιρέθηκε: ${popped._actionLabel || 'Τελευταία ενέργεια'} ↩️`
      })
    : `${t('toast_undo_applied')}${undoneAction}`;

  if (typeof showToast === 'function') {
    showToast(undoMsg, { duration: 3200 });
  }

  if (typeof renderApp === 'function') {
    renderApp();
  }
  if (typeof populateHelperTaskSelect === 'function') {
    populateHelperTaskSelect();
  }
}

function handleUndoToStep(targetIndex) {
  const stack = (typeof window !== 'undefined' && Array.isArray(window.historyStack)) ? window.historyStack : (typeof globalThis !== 'undefined' && Array.isArray(globalThis.historyStack) ? globalThis.historyStack : historyStack);
  if (!stack || stack.length === 0 || targetIndex < 0 || targetIndex >= stack.length) {
    if (typeof showToast === 'function') showToast(t('toast_no_undo'));
    return;
  }

  // Ziel-Snapshot holen
  const targetSnapshot = stack[targetIndex];
  const targetLabel = targetSnapshot._actionLabel || 'Ausgewählte Aktion';

  // Stack bis inklusive targetIndex kürzen
  stack.splice(targetIndex);

  applyHistorySnapshot(targetSnapshot);

  historyStack = stack;
  if (typeof window !== 'undefined') window.historyStack = stack;
  if (typeof globalThis !== 'undefined') globalThis.historyStack = stack;

  persistHistory();
  updateUndoUI();
  saveState();

  const msg = (typeof tr === 'function')
    ? tr({
        de: `Zurückgesetzt vor: "${targetLabel}" ↩️`,
        en: `Restored before: "${targetLabel}" ↩️`,
        fr: `Restauré avant : « ${targetLabel} » ↩️`,
        it: `Ripristinato prima di: "${targetLabel}" ↩️`,
        es: `Restaurado antes de: "${targetLabel}" ↩️`,
        el: `Επαναφορά πριν από: "${targetLabel}" ↩️`
      })
    : `Zurückgesetzt vor: "${targetLabel}" ↩️`;

  if (typeof showToast === 'function') {
    showToast(msg, { duration: 3500 });
  }

  if (typeof renderApp === 'function') renderApp();
  if (typeof populateHelperTaskSelect === 'function') populateHelperTaskSelect();
}

function openUndoHistoryModal() {
  const stack = (typeof window !== 'undefined' && Array.isArray(window.historyStack)) ? window.historyStack : (typeof globalThis !== 'undefined' && Array.isArray(globalThis.historyStack) ? globalThis.historyStack : historyStack);
  if (!stack || stack.length === 0) {
    showToast(t('toast_no_undo'));
    return;
  }

  const modal = document.getElementById('modal-undo-history');
  if (!modal) {
    handleUndo();
    return;
  }

  const listContainer = document.getElementById('undo-history-list');
  if (listContainer) {
    listContainer.innerHTML = '';
    // Letzte Aktion oben anzeigen
    for (let i = stack.length - 1; i >= 0; i--) {
      const snap = stack[i];
      const isLatest = (i === stack.length - 1);
      const label = snap._actionLabel || `Schritt #${i + 1}`;
      const timeStr = snap._timestamp ? new Date(snap._timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
      
      const itemBtn = document.createElement('button');
      itemBtn.type = 'button';
      itemBtn.className = `w-full p-2.5 sm:p-3 rounded-2xl border text-left transition flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.98] ${
        isLatest 
          ? 'bg-cyan-500/15 border-cyan-400/40 hover:bg-cyan-500/25 hover:border-cyan-300' 
          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
      }`;
      
      itemBtn.onclick = () => {
        closeUndoHistoryModal();
        handleUndoToStep(i);
      };

      // Detaillierte Symbol- und Farbwahl je nach Aktion
      let iconName = 'history';
      let iconColor = isLatest ? 'bg-cyan-400/20 text-cyan-300' : 'bg-white/10 text-gray-400';
      if (label.includes('erledigt') || label.includes('abgeschlossen')) {
        iconName = 'check-circle-2';
        iconColor = 'bg-emerald-500/20 text-emerald-300';
      } else if (label.includes('gelöscht') || label.includes('entfernt')) {
        iconName = 'trash-2';
        iconColor = 'bg-rose-500/20 text-rose-300';
      } else if (label.includes('hinzugefügt')) {
        iconName = 'plus-circle';
        iconColor = 'bg-lime-500/20 text-lime-300';
      } else if (label.includes('verschoben') || label.includes('Reihenfolge')) {
        iconName = 'move';
        iconColor = 'bg-blue-500/20 text-blue-300';
      } else if (label.includes('Farbe')) {
        iconName = 'palette';
        iconColor = 'bg-amber-500/20 text-amber-300';
      }

      itemBtn.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 rounded-xl ${iconColor} flex items-center justify-center shrink-0 border border-white/10">
            <i data-lucide="${iconName}" class="w-4 h-4"></i>
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold ${isLatest ? 'text-cyan-200' : 'text-gray-100'} group-hover:text-white truncate flex items-center gap-1.5">
              <span>${label}</span>
              ${isLatest ? '<span class="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 font-mono font-normal">Zuletzt</span>' : ''}
            </div>
            <div class="text-[10px] text-gray-400 mt-0.5">
              ${timeStr ? '<span class="font-mono text-gray-400 font-medium">' + timeStr + '</span> · ' : ''}Vor dieser Aktion wiederherstellen
            </div>
          </div>
        </div>
        <div class="shrink-0 flex items-center gap-1 text-[11px] font-bold ${isLatest ? 'text-cyan-300' : 'text-gray-400'} group-hover:text-cyan-200">
          <span>Rückgängig</span>
          <i data-lucide="corner-down-left" class="w-3.5 h-3.5"></i>
        </div>
      `;
      listContainer.appendChild(itemBtn);
    }
  }

  modal.classList.remove('hidden');
  if (typeof renderLucideIcons === 'function') renderLucideIcons(false, modal);
}

function closeUndoHistoryModal() {
  const modal = document.getElementById('modal-undo-history');
  if (modal) modal.classList.add('hidden');
}

if (typeof window !== 'undefined') {
  window.openUndoHistoryModal = openUndoHistoryModal;
  window.closeUndoHistoryModal = closeUndoHistoryModal;
  window.handleUndoToStep = handleUndoToStep;
  window.applyHistorySnapshot = applyHistorySnapshot;
}

async function handleReset() {
  const confirmMsg = tr({
    de: 'Möchtest du die Vorlage mit empfohlenen Routinen & Karten laden? (Bestehende Aufgaben werden ersetzt)',
    en: 'Do you want to load the template with recommended routines & cards? (Existing tasks will be replaced)',
    fr: 'Veux-tu charger le modèle avec les routines et cartes recommandées ?',
    it: 'Vuoi caricare il modello con le routine e schede consigliate?',
    es: '¿Quieres cargar la plantilla con las rutinas y tarjetas recomendadas?',
    el: 'Θέλεις να φορτώσεις το πρότυπο με τις προτεινόμενες ρουτίνες και κάρτες;'
  });
  
  const confirmFn = (typeof showConfirmDialog === 'function') 
    ? showConfirmDialog 
    : (typeof window !== 'undefined' && typeof window.showConfirmDialog === 'function' ? window.showConfirmDialog : null);
  const confirmed = typeof confirmFn === 'function' ? await confirmFn({
    title: typeof tr === 'function' ? tr({ de: 'Vorlage laden?', en: 'Load Template?' }) : 'Vorlage laden?',
    message: confirmMsg,
    confirmText: typeof tr === 'function' ? tr({ de: 'Vorlage laden', en: 'Load Template' }) : 'Vorlage laden',
    isDanger: false,
    icon: 'layout-template'
  }) : confirm(confirmMsg);

  if (confirmed) {
    if (typeof saveHistory === 'function') saveHistory();
    const ws = state && state.activeWorkspace ? state.activeWorkspace : 'private';
    const customDefaults = getCustomDefaults();
    const defTasksMap = (typeof window !== 'undefined' && window.DEFAULT_TASKS_BY_LANG)
      ? window.DEFAULT_TASKS_BY_LANG
      : ((typeof globalThis !== 'undefined' && globalThis.DEFAULT_TASKS_BY_LANG)
          ? globalThis.DEFAULT_TASKS_BY_LANG
          : (typeof DEFAULT_TASKS_BY_LANG !== 'undefined' ? DEFAULT_TASKS_BY_LANG : null));
    const activeL = (typeof currentLang !== 'undefined' ? currentLang : (typeof window !== 'undefined' ? window.currentLang : 'de')) || 'de';
    const localizedDefaults = (defTasksMap && (defTasksMap[activeL] || defTasksMap['de'] || defTasksMap['en']))
      || { daily: [], weekly: [], occasionally: [] };

    const hasCustomDaily = customDefaults && Array.isArray(customDefaults.daily) && customDefaults.daily.length > 0;
    const hasCustomWeekly = customDefaults && Array.isArray(customDefaults.weekly) && customDefaults.weekly.length > 0;
    const hasCustomOccasional = customDefaults && Array.isArray(customDefaults.occasionally) && customDefaults.occasionally.length > 0;

    const dailyTasks = hasCustomDaily ? [...customDefaults.daily] : [...(localizedDefaults.daily || [])];
    const weeklyTasks = hasCustomWeekly ? [...customDefaults.weekly] : [...(localizedDefaults.weekly || [])];
    const occasionallyTasks = hasCustomOccasional ? [...customDefaults.occasionally] : [...(localizedDefaults.occasionally || [])];
    const todoTasks = (customDefaults && Array.isArray(customDefaults.todo)) ? [...customDefaults.todo] : [];

    const nowISO = new Date().toISOString();
    state = {
      version: 3,
      lastDate: nowISO.split('T')[0],
      activeWorkspace: ws,
      _tombstones: {},
      _clearedAt: {},
      _backupRestoredAt: nowISO,
      updatedAt: nowISO,
      _migrationV3TasksPlaced: true,
      items: { daily: dailyTasks, weekly: weeklyTasks, occasionally: occasionallyTasks, todo: todoTasks, termine: [], notes: [] },
      done: [], archive: [], streak: 0, completedSteps: {}, customSteps: {},
      workItems: typeof createDefaultWorkItems === 'function' ? createDefaultWorkItems(activeL) : {},
      workDone: [],
      studyItems: typeof createDefaultStudyItems === 'function' ? createDefaultStudyItems(activeL) : {},
      studyDone: [],
      shoppingList: (state && state.shoppingList) || [],
      shoppingHistory: (state && state.shoppingHistory) || [],
      cooking: typeof createDefaultCookingState === 'function' ? createDefaultCookingState() : ((state && state.cooking) || {}),
      clarity: (state && state.clarity) || { streakDays: 0, lastCheckinDate: null, history: [], savedReasons: [] }
    };
    if (typeof window !== 'undefined') window.state = state;
    if (typeof globalThis !== 'undefined') globalThis.state = state;
    
    categoriesOrder = [
      ['weekly', 'home'],
      ['todo', 'list-todo'],
      ['daily', 'sun'],
      ['notes', 'file-text'],
      ['termine', 'calendar'],
      ['done', 'check-circle-2'],
      ['occasionally', 'clock']
    ];
    if (typeof window !== 'undefined') window.categoriesOrder = categoriesOrder;
    if (typeof globalThis !== 'undefined') globalThis.categoriesOrder = categoriesOrder;
    saveCategoriesOrder();
    saveState();
    if (typeof cloudSyncEngine !== 'undefined' && typeof cloudSyncEngine.triggerImmediatePush === 'function') {
      cloudSyncEngine.triggerImmediatePush();
    }
    
    const toastMsg = typeof tr === 'function' ? tr({
      de: 'Vorlage erfolgreich geladen ✨',
      en: 'Template loaded successfully ✨',
      fr: 'Modèle chargé avec succès ✨',
      it: 'Modello caricato con successo ✨',
      es: 'Plantilla cargada con éxito ✨',
      el: 'Το πρότυπο φορτώθηκε με επιτυχία ✨'
    }) : 'Vorlage erfolgreich geladen ✨';
    if (typeof showToast === 'function') showToast(toastMsg);
    
    if (typeof renderApp === 'function') renderApp();
    else if (typeof window !== 'undefined' && typeof window.renderApp === 'function') window.renderApp();

    if (typeof populateHelperTaskSelect === 'function') populateHelperTaskSelect();
    else if (typeof window !== 'undefined' && typeof window.populateHelperTaskSelect === 'function') window.populateHelperTaskSelect();

    if (typeof updateZenView === 'function') updateZenView();
    else if (typeof window !== 'undefined' && typeof window.updateZenView === 'function') window.updateZenView();
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
        de: 'Die Karten sind bereits leer! ℹ️',
        en: 'The cards are already empty! ℹ️',
        fr: 'Les cartes sont déjà vides ! ℹ️',
        it: 'Le schede sono già vuote! ℹ️',
        es: '¡Las tarjetas ya están vacías! ℹ️',
        el: 'Οι κάρτες είναι ήδη άδειες! ℹ️'
      }));
    }
    return;
  }

  const confirmMsg = tr({
    de: `Möchtest du wirklich alle ${totalTasks} Aufgaben aus allen Karten dieses Bereichs leeren?`,
    en: `Do you really want to clear all ${totalTasks} tasks from all cards in this workspace?`,
    fr: `Veux-tu vraiment vider toutes les ${totalTasks} tâches de toutes les cartes de cet espace ?`,
    it: `Vuoi davvero svuotare tutte le ${totalTasks} attività da tutte le schede di questo spazio?`,
    es: `¿Seguro que quieres vaciar todas las ${totalTasks} tareas de todas las tarjetas de este espacio?`,
    el: `Θέλεις πραγματικά να αδειάσεις όλες τις ${totalTasks} εργασίες από όλες τις κάρτες αυτού του χώρου;`
  });

  const confirmFn = (typeof showConfirmDialog === 'function') 
    ? showConfirmDialog 
    : (typeof window !== 'undefined' && typeof window.showConfirmDialog === 'function' ? window.showConfirmDialog : null);
  const confirmed = typeof confirmFn === 'function' ? await confirmFn({
    title: typeof tr === 'function' ? tr({ de: 'Karten leeren?', en: 'Clear all cards?' }) : 'Karten leeren?',
    message: confirmMsg,
    confirmText: typeof tr === 'function' ? tr({ de: 'Karten leeren', en: 'Clear cards' }) : 'Karten leeren',
    isDanger: true,
    icon: 'eraser'
  }) : confirm(confirmMsg);

  if (confirmed) {
    if (typeof saveHistory === 'function') saveHistory();
    if (typeof trackAllListsClear === 'function') {
      trackAllListsClear(ws, curItems, curDone);
    }
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
    state.updatedAt = new Date().toISOString();
    if (typeof window !== 'undefined') window.state = state;
    if (typeof globalThis !== 'undefined') globalThis.state = state;
    saveState();
    if (typeof cloudSyncEngine !== 'undefined' && typeof cloudSyncEngine.triggerImmediatePush === 'function') {
      cloudSyncEngine.triggerImmediatePush();
    }
    if (typeof renderApp === 'function') renderApp();
    else if (typeof window !== 'undefined' && typeof window.renderApp === 'function') window.renderApp();

    if (typeof populateHelperTaskSelect === 'function') populateHelperTaskSelect();
    else if (typeof window !== 'undefined' && typeof window.populateHelperTaskSelect === 'function') window.populateHelperTaskSelect();

    if (typeof updateZenView === 'function') updateZenView();
    else if (typeof window !== 'undefined' && typeof window.updateZenView === 'function') window.updateZenView();
    if (typeof showToast === 'function') {
      showToast(tr({
        de: `🧹 Alle Spalten geleert (${totalTasks} Einträge entfernt)`,
        en: `🧹 All columns cleared (${totalTasks} items removed)`,
        fr: `🧹 Toutes les colonnes vidées (${totalTasks} éléments supprimés)`,
        it: `🧹 Tutte le colonne svuotate (${totalTasks} elementi rimossi)`,
        es: `🧹 Todas las columnas vaciadas (${totalTasks} elementos eliminados)`,
        el: `🧹 Όλες οι στήλες άδειασαν (${totalTasks} στοιχεία αφαιρέθηκαν)`
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
        state._backupRestoredAt = new Date().toISOString();
        state.updatedAt = state._backupRestoredAt;
        saveState();
        if (typeof cloudSyncEngine !== 'undefined' && typeof cloudSyncEngine.triggerImmediatePush === 'function') {
          cloudSyncEngine.triggerImmediatePush();
        }
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
  const [noteItem] = state.items.notes.splice(noteIndex, 1);
  const noteText = typeof noteItem === 'object' ? noteItem.task : noteItem;
  const snippet = noteText ? `"${noteText.length > 20 ? noteText.substring(0, 18) + '...' : noteText}"` : 'Notiz';
  saveHistory(`Notiz in Aufgabe umgewandelt: ${snippet}`);
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

function checkOccasionalAufräumen(s) {
  if (!s || !s.items) return;
  if (!Array.isArray(s.items.occasionally)) s.items.occasionally = [];
  const isCleanTask = (t) => {
    const text = ((typeof t === 'object' && t !== null) ? (t.task || '') : String(t || '')).trim();
    return /(aufräum|aufraeum|aufraum|tidy|ordenar|ranger|riordinar|τακτοποί)/i.test(text);
  };

  // Zuerst bestehende Duplikate in occasionally säubern
  let cleanCount = 0;
  s.items.occasionally = s.items.occasionally.filter(item => {
    if (isCleanTask(item)) {
      cleanCount++;
      return cleanCount === 1; // Nur erstes Vorkommen behalten
    }
    return true;
  });

  const hasClean = cleanCount > 0;

  // Nicht re-injizieren, wenn der Nutzer Aufräumen gelöscht oder die Spalte geleert hat
  const hash = typeof computeStringHash === 'function' ? computeStringHash('Aufräumen') : 'aufraum';
  const isDeleted = s._tombstones && (s._tombstones['task_occasionally_h' + hash] || s._tombstones['hash_' + hash]);
  const isCleared = s._clearedAt && (s._clearedAt['private_occasionally'] || s._clearedAt['private__all']);
  if (isDeleted || isCleared) return;

  if (!hasClean) {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!s.lastOccasionalAufräumenDoneDate) {
      s.items.occasionally.push('Aufräumen');
    } else {
      const lastDate = new Date(s.lastOccasionalAufräumenDoneDate);
      const todayDate = new Date(todayStr);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 3) {
        s.items.occasionally.push('Aufräumen');
        s.lastOccasionalAufräumenDoneDate = null;
      }
    }
  }
}
window.checkOccasionalAufräumen = checkOccasionalAufräumen;

function reloadDailyTasks(isAuto = false) {
  const currentState = (typeof window !== 'undefined' && window.state) ? window.state : state;
  if (!currentState) return;
  if (!isAuto && typeof saveHistory === 'function') saveHistory();

  // 1. Tägliche Aufgaben jeden Tag von der Erledigt-Karte löschen, den Rest lassen
  if (Array.isArray(currentState.done)) {
    currentState.done = currentState.done.filter(item => {
      const orig = (typeof item === 'object' && item !== null) ? item.origin : null;
      return orig !== 'daily';
    });
  }
  if (Array.isArray(currentState.workDone)) {
    currentState.workDone = currentState.workDone.filter(item => {
      const orig = (typeof item === 'object' && item !== null) ? item.origin : null;
      return orig !== 'work_focus';
    });
  }
  if (Array.isArray(currentState.studyDone)) {
    currentState.studyDone = currentState.studyDone.filter(item => {
      const orig = (typeof item === 'object' && item !== null) ? item.origin : null;
      return orig !== 'study_focus';
    });
  }

  // 2. Tägliche Aufgaben neu laden
  const curL = (typeof window !== 'undefined' && window.currentLang)
    ? window.currentLang
    : ((currentState && currentState.settings && currentState.settings.language)
        ? currentState.settings.language
        : ((typeof globalThis !== 'undefined' && globalThis.currentLang)
            ? globalThis.currentLang
            : (typeof currentLang !== 'undefined' ? currentLang : 'de')));
  
  const customDefaults = getCustomDefaults();
  let dailyTasks = null;
  if (customDefaults && Array.isArray(customDefaults.daily)) {
    dailyTasks = customDefaults.daily;
  } else {
    const defTasksMap = (typeof window !== 'undefined' && window.DEFAULT_TASKS_BY_LANG)
      ? window.DEFAULT_TASKS_BY_LANG
      : ((typeof globalThis !== 'undefined' && globalThis.DEFAULT_TASKS_BY_LANG)
          ? globalThis.DEFAULT_TASKS_BY_LANG
          : (typeof DEFAULT_TASKS_BY_LANG !== 'undefined' ? DEFAULT_TASKS_BY_LANG : null));
    const localizedDefaults = (defTasksMap && defTasksMap[curL]) 
      ? defTasksMap[curL] 
      : ((defTasksMap && defTasksMap['de']) ? defTasksMap['de'] : { daily: [] });
    dailyTasks = localizedDefaults.daily || [];
  }

  if (!currentState.items) currentState.items = {};
  currentState.items.daily = [...dailyTasks];

  if (currentState.workItems) {
    const defWorkMap = (typeof window !== 'undefined' && window.DEFAULT_WORK_TASKS_BY_LANG)
      ? window.DEFAULT_WORK_TASKS_BY_LANG
      : ((typeof globalThis !== 'undefined' && globalThis.DEFAULT_WORK_TASKS_BY_LANG)
          ? globalThis.DEFAULT_WORK_TASKS_BY_LANG
          : (typeof DEFAULT_WORK_TASKS_BY_LANG !== 'undefined' ? DEFAULT_WORK_TASKS_BY_LANG : null));
    const workDefaults = (defWorkMap && defWorkMap[curL])
      ? defWorkMap[curL]
      : ((defWorkMap && defWorkMap['de']) ? defWorkMap['de'] : { work_focus: [] });
    if (workDefaults && workDefaults.work_focus) {
      currentState.workItems.work_focus = [...workDefaults.work_focus];
    }
  }

  // 3. Gelegentlich Aufräumen (jeden 3. Tag wenn gelöscht)
  checkOccasionalAufräumen(currentState);

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

  // Wöchentlicher Reset: Die verbliebenen Aufgaben aus der Erledigt-Karte leeren
  if (Array.isArray(currentState.done)) {
    currentState.done = [];
  }
  if (Array.isArray(currentState.workDone)) {
    currentState.workDone = [];
  }
  if (Array.isArray(currentState.studyDone)) {
    currentState.studyDone = [];
  }

  const curL = (typeof window !== 'undefined' && window.currentLang)
    ? window.currentLang
    : ((currentState && currentState.settings && currentState.settings.language)
        ? currentState.settings.language
        : ((typeof globalThis !== 'undefined' && globalThis.currentLang)
            ? globalThis.currentLang
            : (typeof currentLang !== 'undefined' ? currentLang : 'de')));
  
  const customDefaults = getCustomDefaults();
  let weeklyTasks = null;
  if (customDefaults && Array.isArray(customDefaults.weekly)) {
    weeklyTasks = customDefaults.weekly;
  } else {
    const defTasksMap = (typeof window !== 'undefined' && window.DEFAULT_TASKS_BY_LANG)
      ? window.DEFAULT_TASKS_BY_LANG
      : ((typeof globalThis !== 'undefined' && globalThis.DEFAULT_TASKS_BY_LANG)
          ? globalThis.DEFAULT_TASKS_BY_LANG
          : (typeof DEFAULT_TASKS_BY_LANG !== 'undefined' ? DEFAULT_TASKS_BY_LANG : null));
    const localizedDefaults = (defTasksMap && defTasksMap[curL]) 
      ? defTasksMap[curL] 
      : ((defTasksMap && defTasksMap['de']) ? defTasksMap['de'] : { weekly: [] });
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

  // 1. Täglicher Rollover für Heute (daily / work_focus) - Keine täglichen Auto-Downloads mehr
  if (currentState.lastDate && currentState.lastDate !== todayISO) {
    reloadDailyTasks(true);
    stateModified = true;
  } else {
    checkOccasionalAufräumen(currentState);
  }

  // 2. Wöchentlicher Rollover für Haushalt (weekly) & Wöchentlicher automatischer Bericht
  if (currentState.lastWeeklyResetWeek && currentState.lastWeeklyResetWeek !== currentWeekStr) {
    if (typeof generateReportContent === 'function' && typeof triggerAutomaticDownload === 'function') {
      try {
        const lastWeek = currentState.lastWeeklyResetWeek;
        const { reportText, filename } = generateReportContent('weekly', lastWeek);
        triggerAutomaticDownload(reportText, filename);
      } catch (e) {
        console.warn('[Rollover] Weekly auto-report warning:', e);
      }
    }
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
  window.trackItemDeletion = trackItemDeletion;
  window.clearItemTombstone = clearItemTombstone;
  window.trackCategoryClear = trackCategoryClear;
  window.trackAllListsClear = trackAllListsClear;
  window.saveState = saveState;
  window.loadState = loadState;
  window.saveHistory = saveHistory;
  window.loadHistory = loadHistory;
  window.persistHistory = persistHistory;
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
  window.handleReset = handleReset;
  window.handleClearAllLists = handleClearAllLists;
  window.saveCategoriesOrder = saveCategoriesOrder;
  window.t = t;
  window.tr = tr;
}
if (typeof globalThis !== 'undefined') {
  globalThis.handleReset = handleReset;
  globalThis.handleClearAllLists = handleClearAllLists;
  globalThis.saveCategoriesOrder = saveCategoriesOrder;
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
  globalThis.trackItemDeletion = trackItemDeletion;
  globalThis.clearItemTombstone = clearItemTombstone;
  globalThis.trackCategoryClear = trackCategoryClear;
  globalThis.trackAllListsClear = trackAllListsClear;
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

// ============================================================================
// ARCHITEKTUR-FASSADE: StateCore
// Bietet eine saubere, modulare Schnittstelle für State-Zugriff, Mutationen
// und Entkopplung über den NoodleEvents-Bus ohne globale Seiteneffekte.
// ============================================================================
const StateCore = (typeof window !== 'undefined' && window.StateCore)
  ? window.StateCore
  : ((typeof globalThis !== 'undefined' && globalThis.StateCore)
    ? globalThis.StateCore
    : {
        get() {
          return (typeof window !== 'undefined' && window.state) ? window.state : (typeof globalThis !== 'undefined' && globalThis.state ? globalThis.state : state);
        },
        getActiveWorkspace() {
          const s = this.get();
          return (s && s.activeWorkspace) ? s.activeWorkspace : 'private';
        },
        setWorkspace(mode) {
          return setWorkspace(mode);
        },
        save(skipP2PSync = false) {
          return saveState(skipP2PSync);
        },
        load() {
          return loadState();
        },
        saveHistory(actionInfo = null) {
          return saveHistory(actionInfo);
        },
        undo() {
          return handleUndo();
        },
        undoToStep(targetIndex) {
          return handleUndoToStep(targetIndex);
        },
        on(event, callback) {
          if (typeof NoodleEvents !== 'undefined' && NoodleEvents && typeof NoodleEvents.on === 'function') {
            return NoodleEvents.on(event, callback);
          }
          return () => {};
        },
        off(event, callback) {
          if (typeof NoodleEvents !== 'undefined' && NoodleEvents && typeof NoodleEvents.off === 'function') {
            return NoodleEvents.off(event, callback);
          }
        },
        emit(event, data) {
          if (typeof NoodleEvents !== 'undefined' && NoodleEvents && typeof NoodleEvents.emit === 'function') {
            NoodleEvents.emit(event, data);
          }
        }
      });

if (typeof window !== 'undefined') {
  window.StateCore = StateCore;

  // Multi-Tab Konsistenz: storage-Event-Synchronisation
  window.addEventListener('storage', (event) => {
    if (event.key === STORE_KEY && event.newValue) {
      try {
        const remoteState = JSON.parse(event.newValue);
        if (!remoteState || typeof remoteState !== 'object') return;
        const currentState = (typeof window !== 'undefined' && window.state) ? window.state : state;
        
        // Timestamp-Vergleich: Nur aktualisieren, wenn der Stand aus dem anderen Tab neuer ist
        const currentTs = currentState && currentState.updatedAt ? new Date(currentState.updatedAt).getTime() : 0;
        const incomingTs = remoteState.updatedAt ? new Date(remoteState.updatedAt).getTime() : 0;
        
        if (incomingTs > currentTs) {
          const migrated = migrateState(remoteState, typeof currentLang !== 'undefined' ? currentLang : 'de');
          if (typeof window !== 'undefined') window.state = migrated;
          state = migrated;
          if (typeof NoodleEvents !== 'undefined' && NoodleEvents.emit) {
            NoodleEvents.emit('state:loaded', { state: migrated, source: 'tab-sync' });
          }
          if (typeof renderApp === 'function') {
            renderApp();
          }
        }
      } catch (err) {
        console.warn('[State] Fehler bei Multi-Tab Storage-Synchronisation:', err);
      }
    }
  });
}
if (typeof globalThis !== 'undefined') {
  globalThis.StateCore = StateCore;
}


