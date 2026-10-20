/**
 * @file main.js
 * @description
 * Zentraler ES-Modul Einstiegspunkt für Noodle Studio.
 * Importiert alle Kernmodule, Hilfsfunktionen, Exekutiv-Assistenten und Fachbereiche
 * in deterministischer Reihenfolge und stellt eine temporäre Window-Kompatibilitätsschicht
 * für globale Zugriffe und Event-Handler bereit.
 */

// 1. Statische Daten & Schritte
import './data-tasks-steps-1.js';
import './data-tasks-steps-2.js';
import './data-tasks-steps-3.js';
import './data-tasks.js';
import './data-translations-1.js';
import './data-translations-2.js';
import './data-translations.js';
import './data-custom-translations.js';
import './data-extras.js';

// 2. Storage & State Core
import './config.js';
import './auth-engine.js';
import './storage.js';
import './state.js';
import './sync-engine.js';
import './collab-engine.js';

// 3. Utilities & Helpers
import './utils-data.js';
import './utils.js';
import './utils-2.js';

// 4. WebAudio DSP, Soundscapes & Player
import './audio-core.js';
import './audio-generators.js';
import './audio-scheduler-1.js';
import './audio-scheduler-2.js';
import './audio-scheduler-3.js';
import './audio-player.js';

// 5. Timer, Fokus & Sport
import './timer-1.js';
import './timer-2.js';
import './timer-3.js';
import './sport.js';

// 6. Executive Assistenten & Hubs
import './app-interaction-mode.js';
import './helper-core-data.js';
import './helper-core.js';
import './helper-core-2.js';
import './helper-clarity.js';
import './helper-brainstorm.js';
import './helper-ocr-scanner.js';
import './helper-cleaning.js';
import './helper-learning.js';
import './app-regulation.js';
import './app-health.js';
import './app-humor.js';

// 7. Domain Features & Fachmodule
import './app-shopping.js';
import './app-cooking.js';
import './app-alarm.js';
import './app-tasks.js';
import './app-reports.js';
import './app-weather-news.js';
import './app-radio-news.js';
import './app-dice.js';
import './app-command-palette.js';
import './app-routine-presets.js';
import './app-feature-bridge.js';
import './app-multitasking-hub.js';
import './app-installation-hub.js';
import './onboarding.js';
import './monetization.js';
import './app-feedback.js';
import './app-tooltip.js';
import './app-social.js';

// 8. Haupt-Orchestrierung & Initialisierung
import './app-core.js';

// ============================================================================
// TEMPORÄRE WINDOW-KOMPATIBILITÄTSSCHICHT
// Exponiert Kernvariablen und Funktionen auf window / globalThis für Inline-Handler,
// Modale und bestehende Test-Suites, während Module schrittweise refaktoriert werden.
// ============================================================================
(function initWindowCompatibilityLayer(w) {
  if (typeof w === 'undefined') return;

  // Kernzustand & Persistenz
  if (typeof state !== 'undefined') w.state = state;
  if (typeof saveState === 'function') w.saveState = saveState;
  if (typeof loadState === 'function') w.loadState = loadState;
  if (typeof renderApp === 'function') w.renderApp = renderApp;
  if (typeof AppStorage !== 'undefined') w.AppStorage = AppStorage;
  if (typeof FlowAuth !== 'undefined') w.FlowAuth = FlowAuth;
  if (typeof cloudSyncEngine !== 'undefined') w.cloudSyncEngine = cloudSyncEngine;
  if (typeof CollabEngine !== 'undefined') w.CollabEngine = CollabEngine;

  // I18N & Themes
  if (typeof TRANSLATIONS !== 'undefined') w.TRANSLATIONS = TRANSLATIONS;
  if (typeof loadLanguage === 'function') w.loadLanguage = loadLanguage;
  if (typeof setLanguage === 'function') w.setLanguage = setLanguage;
  if (typeof setTheme === 'function') w.setTheme = setTheme;
  if (typeof t === 'function') w.t = t;
  if (typeof tr === 'function') w.tr = tr;

  // Navigation, Panels & Modale
  if (typeof togglePanel === 'function') w.togglePanel = togglePanel;
  if (typeof openModal === 'function') w.openModal = openModal;
  if (typeof closeModal === 'function') w.closeModal = closeModal;
  if (typeof showToast === 'function') w.showToast = showToast;

  console.log('⚡ [Noodle] ES-Module Pipeline & Window-Kompatibilitätsschicht aktiv.');
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
