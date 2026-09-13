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

const DEFAULT_WORK_TASKS_BY_LANG = {
  de: {
    work_focus: ['Wichtigste Tagesaufgabe (Must-Do)', 'E-Mails & Prioritäten sortieren (15 Min.)'],
    work_in_progress: ['Projekt-Konzept ausarbeiten', 'Kundenanfrage beantworten'],
    work_waiting: ['Feedback von Kollege/Chef zu Entwurf', 'Angebot Freigabe Kunde A'],
    work_backlog: ['Dokumentation aktualisieren', 'Monatsbericht vorbereiten', 'Recherchen Q4'],
    termine: [],
    notes: ['Wichtige Links & Notizen zum aktuellen Sprint...']
  },
  en: {
    work_focus: ['Key priority of the day (Must-Do)', 'Sort emails & daily priorities (15 min)'],
    work_in_progress: ['Draft project concept', 'Answer client inquiry'],
    work_waiting: ['Waiting on design feedback', 'Client invoice approval'],
    work_backlog: ['Update documentation', 'Prepare monthly report', 'Q4 Research'],
    termine: [],
    notes: ['Key links & scratchpad for current sprint...']
  },
  es: {
    work_focus: ['Prioridad clave del día (Must-Do)', 'Revisar correos y prioridades'],
    work_in_progress: ['Elaborar concepto del proyecto', 'Responder consulta de cliente'],
    work_waiting: ['Esperando comentarios de diseño', 'Aprobación de factura'],
    work_backlog: ['Actualizar documentación', 'Preparar informe mensual'],
    termine: [],
    notes: ['Notas clave y enlaces del sprint...']
  },
  fr: {
    work_focus: ['Priorité clé du jour (Must-Do)', 'Trier les e-mails et priorités'],
    work_in_progress: ['Rédiger le concept du projet', 'Répondre à la demande client'],
    work_waiting: ['En attente du retour client', 'Validation du devis'],
    work_backlog: ['Mettre à jour la documentation', 'Préparer le rapport mensuel'],
    termine: [],
    notes: ['Notes et liens importants...']
  },
  it: {
    work_focus: ['Priorità chiave del giorno (Must-Do)', 'Controllare email e priorità'],
    work_in_progress: ['Sviluppare concetto del progetto', 'Rispondere alla richiesta del cliente'],
    work_waiting: ['In attesa di feedback', 'Approvazione preventivo'],
    work_backlog: ['Aggiornare documentazione', 'Preparare report mensile'],
    termine: [],
    notes: ['Note e link importanti...']
  },
  el: {
    work_focus: ['Κύρια προτεραιότητα ημέρας (Must-Do)', 'Έλεγχος email & προτεραιοτήτων'],
    work_in_progress: ['Σύνταξη σχεδίου έργου', 'Απάντηση σε αίτημα πελάτη'],
    work_waiting: ['Αναμονή για σχόλια', 'Έγκριση προσφοράς'],
    work_backlog: ['Ενημέρωση τεκμηρίωσης', 'Προετοιμασία μηνιαίας αναφοράς'],
    termine: [],
    notes: ['Σημειώσεις & σύνδεσμοι...']
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
    termine: [],
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
    const isWork = (typeof state !== 'undefined' && state && state.activeWorkspace === 'work') || (typeof window !== 'undefined' && window.state && window.state.activeWorkspace === 'work');
    if (isWork) {
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
  s.activeWorkspace = (s.activeWorkspace === 'work') ? 'work' : 'private';
  if (!s.workItems || typeof s.workItems !== 'object') {
    s.workItems = typeof createDefaultWorkItems === 'function' ? createDefaultWorkItems(currentL) : {};
  }
  if (s.workItems && typeof s.workItems === 'object') {
    ['work_focus', 'work_in_progress', 'work_waiting', 'work_backlog', 'termine', 'notes'].forEach(k => {
      if (!Array.isArray(s.workItems[k])) s.workItems[k] = [];
    });
  }
  if (!Array.isArray(s.workDone)) s.workDone = [];


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
  if (mode !== 'private' && mode !== 'work') return;
  state.activeWorkspace = mode;
  saveState();
  updateWorkspaceSwitchUI();
  if (typeof renderApp === 'function') renderApp();
  if (typeof populateHelperTaskSelect === 'function') populateHelperTaskSelect();
  if (typeof showToast === 'function') {
    showToast(mode === 'work' ? tr({
      de: '💼 Arbeitsmodus aktiviert!',
      en: '💼 Work Mode activated!',
      es: '💼 ¡Modo Trabajo activado!',
      el: '💼 Ενεργοποιήθηκε ο Χώρος Εργασίας!',
      fr: '💼 Mode Travail activé !',
      it: '💼 Modalità Lavoro attivata!'
    }) : tr({
      de: '🏠 Privat-Modus aktiviert!',
      en: '🏠 Personal Mode activated!',
      es: '🏠 ¡Modo Personal activado!',
      el: '🏠 Ενεργοποιήθηκε ο Προσωπικός Χώρος!',
      fr: '🏠 Mode Personnel activé !',
      it: '🏠 Modalità Personale attivata!'
    }));
  }
}
window.setWorkspace = setWorkspace;

function toggleWorkspace() {
  const nextMode = (state && state.activeWorkspace === 'work') ? 'private' : 'work';
  setWorkspace(nextMode);
}
window.toggleWorkspace = toggleWorkspace;

function updateWorkspaceSwitchUI() {
  const currentWs = (state && state.activeWorkspace) ? state.activeWorkspace : 'private';
  const toggleBtn = document.getElementById('btn-workspace-toggle');
  const iconEl = document.getElementById('ws-toggle-icon');
  const textEl = document.getElementById('ws-toggle-text');
  
  const mobileToggleBtn = document.getElementById('mobile-btn-workspace-toggle');
  const mobileIconEl = document.getElementById('mobile-ws-toggle-icon');
  const mobileTextEl = document.getElementById('mobile-ws-toggle-text');

  // When activeWorkspace is 'work', the toggle button displays the TARGET switch to Private mode
  // When activeWorkspace is 'private', the toggle button displays the TARGET switch to Work mode
  const targetIsWork = (currentWs === 'private');
  const targetIcon = targetIsWork ? '💼' : '🏠';
  const targetText = targetIsWork ? t('workspace_work') : t('workspace_private');
  const targetTitle = targetIsWork
    ? tr({
        de: 'Zu Arbeitsmodus wechseln',
        en: 'Switch to Work Mode',
        es: 'Cambiar a Modo Trabajo',
        el: 'Εναλλαγή σε Χώρο Εργασίας',
        fr: 'Passer en Mode Travail',
        it: 'Passa a Modalità Lavoro'
      })
    : tr({
        de: 'Zu Privat-Modus wechseln',
        en: 'Switch to Personal Mode',
        es: 'Cambiar a Modo Personal',
        el: 'Εναλλαγή σε Προσωπικό Χώρο',
        fr: 'Passer en Mode Personnel',
        it: 'Passa a Modalità Personale'
      });

  const btnClass = targetIsWork
    ? 'p-2.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 hover:border-blue-500/60 rounded-xl text-blue-200 text-left text-xs font-bold flex items-center gap-2 transition cursor-pointer'
    : 'p-2.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 hover:border-purple-500/50 rounded-xl text-purple-200 text-left text-xs font-bold flex items-center gap-2 transition cursor-pointer';

  if (iconEl) iconEl.textContent = targetIcon;
  if (textEl) {
    textEl.textContent = targetText;
    textEl.className = targetIsWork ? 'truncate text-blue-300' : 'truncate text-purple-300';
  }
  if (toggleBtn) {
    toggleBtn.className = btnClass;
    toggleBtn.title = targetTitle;
  }

  if (mobileIconEl) mobileIconEl.textContent = targetIcon;
  if (mobileTextEl) {
    mobileTextEl.textContent = targetText;
    mobileTextEl.className = targetIsWork ? 'text-xs font-bold text-blue-300 hidden sm:inline' : 'text-xs font-bold text-purple-300 hidden sm:inline';
  }
  if (mobileToggleBtn) {
    mobileToggleBtn.className = targetIsWork
      ? 'h-9 px-2.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-200 rounded-xl flex items-center gap-1 text-xs font-bold transition cursor-pointer shadow-sm'
      : 'h-9 px-2.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 rounded-xl flex items-center gap-1 text-xs font-bold transition cursor-pointer shadow-sm';
    mobileToggleBtn.title = targetTitle;
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

    const snapshot = JSON.parse(JSON.stringify(currentState));
    if (activeCats) {
      snapshot._savedCategoriesOrder = JSON.parse(JSON.stringify(activeCats));
    }
    if (activeWorkCats) {
      snapshot._savedWorkCategoriesOrder = JSON.parse(JSON.stringify(activeWorkCats));
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
  window.categoriesOrder = categoriesOrder;
  window.workCategoriesOrder = workCategoriesOrder;
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
  globalThis.categoriesOrder = categoriesOrder;
  globalThis.workCategoriesOrder = workCategoriesOrder;
  globalThis.t = t;
  globalThis.tr = tr;
}


