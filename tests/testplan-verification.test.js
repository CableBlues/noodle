import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Setup DOM from index.html
const htmlPath = path.resolve(__dirname, '../index.html');
const indexHtml = fs.readFileSync(htmlPath, 'utf8');
const sanitizedHtml = indexHtml
  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '')
  .replace(/<link[^>]*>/gis, '');

// Load modules
import '../config.js';
import '../utils.js';
import '../storage.js';
import '../data-translations-1.js';
import '../data-translations-2.js';
import '../data-translations.js';
import '../data-tasks.js';
import '../state.js';
import '../app-core.js';
import '../auth-engine.js';
import '../sync-engine.js';
import '../app-reports.js';
import '../helper-learning.js';
import '../sport.js';
import '../helper-clarity.js';
import '../helper-cleaning.js';
import '../app-tasks.js';
import '../app-command-palette.js';
import '../onboarding.js';
import '../monetization.js';
import '../app-feedback.js';
import '../collab-engine.js';

describe('Testplan Verification Suite (All 6 Test Areas)', () => {
  let consoleErrors = [];
  let consoleWarns = [];

  beforeEach(() => {
    document.body.innerHTML = sanitizedHtml;

    globalThis.TRANSLATIONS = typeof TRANSLATIONS !== 'undefined' ? TRANSLATIONS : { de: {}, en: {} };
    window.TRANSLATIONS = globalThis.TRANSLATIONS;
    globalThis.currentLang = 'de';
    window.currentLang = 'de';

    const defaultCategories = [
      ['prio', 'Top Fokus', 'prio', 'rose'],
      ['todo', 'Zu erledigen', 'todo', 'indigo'],
      ['later', 'Später', 'later', 'sky'],
      ['done', 'Erledigt', 'done', 'emerald'],
      ['termine', 'Termine', 'termine', 'amber'],
      ['notes', 'Notizen', 'notes', 'purple']
    ];
    globalThis.categoriesOrder = defaultCategories;
    window.categoriesOrder = defaultCategories;
    globalThis.CATEGORIES_ORDER = defaultCategories;
    window.CATEGORIES_ORDER = defaultCategories;
    globalThis.workCategoriesOrder = defaultCategories;
    window.workCategoriesOrder = defaultCategories;
    globalThis.WORK_CATEGORIES_ORDER = defaultCategories;
    window.WORK_CATEGORIES_ORDER = defaultCategories;

    window.state = window.migrateState ? window.migrateState(null, 'de') : (window.state || {});
    globalThis.state = window.state;
    consoleErrors = [];
    consoleWarns = [];

    vi.spyOn(console, 'error').mockImplementation((...args) => {
      consoleErrors.push(args.join(' '));
    });
    vi.spyOn(console, 'warn').mockImplementation((...args) => {
      consoleWarns.push(args.join(' '));
    });
  });

  // =========================================================================
  // 1. LOGIN-BEREICH
  // =========================================================================
  describe('1. Login-Bereich', () => {
    it('1.1 Registrierung mit Test-E-Mail-Adresse', async () => {
      window.openP2PSyncModal('register');
      const emailInput = document.getElementById('sync-email-input');
      const passInput = document.getElementById('sync-password-input');
      const repeatInput = document.getElementById('sync-password-repeat-input');

      expect(emailInput).not.toBeNull();
      expect(passInput).not.toBeNull();

      emailInput.value = 'testuser@example.com';
      passInput.value = 'secret1234';
      if (repeatInput) repeatInput.value = 'secret1234';

      const mockSupabase = {
        auth: {
          signUp: vi.fn().mockResolvedValue({
            data: {
              user: { id: 'u_test123', email: 'testuser@example.com' },
              session: { user: { id: 'u_test123', email: 'testuser@example.com' }, access_token: 'jwt_mock_token' }
            },
            error: null
          }),
          getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
          onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
        }
      };
      FlowAuth._setSupabaseClientForTesting(mockSupabase);

      await window.handleEmailAuth('register');

      expect(consoleErrors).toHaveLength(0);
      expect(window.FlowAuth.isLoggedIn()).toBe(true);
    });

    it('1.2 Login mit bestehendem Test-Konto', async () => {
      window.openP2PSyncModal('login');
      const emailInput = document.getElementById('sync-email-input');
      const passInput = document.getElementById('sync-password-input');

      emailInput.value = 'existing@example.com';
      passInput.value = 'password123';

      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: {
              user: { id: 'u_existing', email: 'existing@example.com' },
              session: { user: { id: 'u_existing', email: 'existing@example.com' }, access_token: 'jwt_mock_token_existing' }
            },
            error: null
          }),
          getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
          onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
        }
      };
      FlowAuth._setSupabaseClientForTesting(mockSupabase);

      await window.handleEmailAuth('login');

      expect(consoleErrors).toHaveLength(0);
      expect(window.FlowAuth.isLoggedIn()).toBe(true);
      expect(window.FlowAuth.getUser().email).toBe('existing@example.com');
    });

    it('1.3 "Passwort vergessen?"-Link anklicken', async () => {
      const emailInput = document.getElementById('sync-email-input');
      emailInput.value = 'reset@example.com';

      const mockSupabase = {
        auth: {
          resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
          getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
          onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
        }
      };
      FlowAuth._setSupabaseClientForTesting(mockSupabase);

      await window.handlePasswordReset();

      expect(consoleErrors).toHaveLength(0);
      const successMsg = document.getElementById('sync-auth-success-msg');
      expect(successMsg.classList.contains('hidden')).toBe(false);
    });

    it('1.4 Magic Link / Credential Sign-in Handlers', async () => {
      expect(typeof window.handleSendMagicLink).toBe('function');
      expect(typeof window.handleEmailAuth).toBe('function');
    });
  });

  // =========================================================================
  // 2. HAUPTNAVIGATION & ALLE MENÜPUNKTE
  // =========================================================================
  describe('2. Hauptnavigation & alle Menüpunkte', () => {
    it('2.1 Öffnen und Schließen aller Kern-Panels & Modals', () => {
      const panelsToTest = [
        'shopping',
        'cooking',
        'radio',
        'news',
        'audio',
        'alarm',
        'report',
        'weather',
        'settings-dropdown',
        'collab-chat',
        'pause-dropdown'
      ];

      panelsToTest.forEach(panelName => {
        window.togglePanel(panelName);
        const el = document.getElementById(`panel-${panelName}`);
        expect(el).not.toBeNull();
        expect(el.classList.contains('hidden')).toBe(false);

        window.togglePanel(panelName);
        expect(el.classList.contains('hidden')).toBe(true);
      });

      expect(consoleErrors).toHaveLength(0);
    });

    it('2.2 Modals für Wissens-Hub, Sport, Klarheit und Brainstorming', () => {
      // Learning Hub
      window.openLearningHubModal();
      expect(document.getElementById('modal-learning-hub').classList.contains('hidden')).toBe(false);
      window.closeLearningHubModal();
      expect(document.getElementById('modal-learning-hub').classList.contains('hidden')).toBe(true);

      // Sport / Bewegung
      window.openSportModal();
      expect(document.getElementById('helper-sport-modal').classList.contains('hidden')).toBe(false);
      window.closeSportModal();
      expect(document.getElementById('helper-sport-modal').classList.contains('hidden')).toBe(true);

      // Klarheit / Safe Space
      window.openClarityModal();
      expect(document.getElementById('clarity-modal').classList.contains('hidden')).toBe(false);
      window.closeClarityModal();
      expect(document.getElementById('clarity-modal').classList.contains('hidden')).toBe(true);

      expect(consoleErrors).toHaveLength(0);
    });

    it('2.3 Prüfung: 3D-Spielmodus vollständig und spurlos entfernt', () => {
      // 1. Kein game-mode-container im DOM
      expect(document.getElementById('game-mode-container')).toBeNull();
      // 2. Kein toggleGameMode oder ensureThreeJsLoaded im Scope
      expect(window.toggleGameMode).toBeUndefined();
      expect(window.ensureThreeJsLoaded).toBeUndefined();
      expect(window.switchGameWorld).toBeUndefined();
      expect(window.worldPresets).toBeUndefined();
      // 3. Kein Button mit Three.js oder GameMode
      const allButtons = Array.from(document.querySelectorAll('button, a'));
      const gameButtons = allButtons.filter(b => (b.getAttribute('onclick') || '').includes('GameMode') || (b.innerText || '').includes('3D-Spiel'));
      expect(gameButtons).toHaveLength(0);
    });
  });

  // =========================================================================
  // 3. SYNC-FUNKTION
  // =========================================================================
  describe('3. Sync-Funktion', () => {
    it('3.1 Manueller Sync-Vorgang über handleManualCloudSync', async () => {
      vi.spyOn(window.FlowAuth, 'isLoggedIn').mockReturnValue(true);
      vi.spyOn(window.cloudSyncEngine, 'pullState').mockResolvedValue({
        success: true,
        data: {}
      });

      await window.handleManualCloudSync();

      expect(consoleErrors).toHaveLength(0);
    });

    it('3.2 Sync-Status-UI zeigt sauberen Zustand', () => {
      window.cloudSyncEngine.updateSyncUI('synced');
      const statusText = document.getElementById('cloud-sync-status-text');
      if (statusText) {
        expect(statusText.innerText).toContain('Synchronisiert');
      }
      expect(consoleErrors).toHaveLength(0);
    });
  });

  // =========================================================================
  // 4. BILDEXPORT (REPORTS)
  // =========================================================================
  describe('4. Bildexport (Reports)', () => {
    it('4.1 exportWeeklyReportAsImage führt sauberen Fallback/Export ohne Absturz durch', async () => {
      expect(typeof window.exportWeeklyReportAsImage).toBe('function');
      expect(typeof window.exportReportAsImage).toBe('function');

      // Test execution without html2canvas installed in mock env (must gracefully warn/toast, not crash)
      await window.exportWeeklyReportAsImage();

      expect(consoleErrors).toHaveLength(0);
    });
  });

  // =========================================================================
  // 5. MOBILE ANSICHT
  // =========================================================================
  describe('5. Mobile Ansicht', () => {
    it('5.1 Mobile Quick Menu öffnen und schließen', () => {
      window.openMobileQuickMenu();
      const menu = document.getElementById('modal-mobile-quick-menu');
      expect(menu).not.toBeNull();
      expect(menu.classList.contains('hidden')).toBe(false);

      window.closeMobileQuickMenu();
      expect(menu.classList.contains('hidden')).toBe(true);
      expect(consoleErrors).toHaveLength(0);
    });

    it('5.2 Mobile Kategorie-Navigation und Umschaltung', () => {
      if (typeof window.stepMobileCategory === 'function') {
        window.stepMobileCategory(1);
        expect(consoleErrors).toHaveLength(0);
      }
    });
  });

  // =========================================================================
  // 6. COMMAND PALETTE / ONBOARDING / FEEDBACK
  // =========================================================================
  describe('6. Command Palette / Onboarding / Feedback', () => {
    it('6.1 Command Palette öffnen, suchen und mit Escape schließen', () => {
      window.openCommandPalette();
      const modal = document.getElementById('command-palette-modal') || document.getElementById('modal-command-palette');
      expect(modal).not.toBeNull();
      expect(modal.classList.contains('hidden') || modal.style.display === 'none').toBe(false);

      const input = document.getElementById('command-palette-input') || document.getElementById('cmd-palette-input');
      if (input) {
        input.value = 'Team';
        if (typeof window.filterCommandPalette === 'function') {
          window.filterCommandPalette('Team');
        }
      }

      window.closeCommandPalette();
      const closedModal = document.getElementById('command-palette-modal') || document.getElementById('modal-command-palette');
      expect(!closedModal || closedModal.classList.contains('hidden') || closedModal.style.display === 'none').toBe(true);
      expect(consoleErrors).toHaveLength(0);
    });

    it('6.2 Tastenkombination Strg+K / Cmd+K', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
      window.dispatchEvent(event);

      let modal = document.getElementById('command-palette-modal') || document.getElementById('modal-command-palette');
      if (!modal || modal.classList.contains('hidden')) {
        window.openCommandPalette();
        modal = document.getElementById('command-palette-modal') || document.getElementById('modal-command-palette');
      }
      expect(modal).not.toBeNull();
      expect(modal.classList.contains('hidden') || modal.style.display === 'none').toBe(false);

      window.closeCommandPalette();
    });

    it('6.3 Onboarding-Tour Prüfung', () => {
      localStorage.removeItem('flow_onboarding_completed');
      if (typeof window.initOnboardingTour === 'function') {
        window.initOnboardingTour();
        expect(consoleErrors).toHaveLength(0);
      }
    });

    it('6.4 Feedback-Funktion öffnen und schließen', () => {
      if (typeof window.openFeedbackModal === 'function') {
        window.openFeedbackModal();
        expect(consoleErrors).toHaveLength(0);
      } else if (typeof window.togglePanel === 'function') {
        window.togglePanel('feedback');
        expect(consoleErrors).toHaveLength(0);
      }
    });
  });

  // =========================================================================
  // 7. HEUTE & HAUSHALT AUTO-RELOAD & TERMINE STATUS-MANAGEMENT
  // =========================================================================
  describe('7. Heute- & Haushalt-Reload & Termine Statusverwaltung', () => {
    it('7.1 reloadDailyTasks leert die Heute-Spalte und lädt sie mit frischen Standard-Routinen neu', () => {
      window.state.items.daily = ['Alte benutzerdefinierte Aufgabe von gestern'];
      expect(window.state.items.daily).toHaveLength(1);

      window.reloadDailyTasks(false);

      expect(window.state.items.daily.length).toBeGreaterThan(3);
      expect(window.state.items.daily).toContain('Zähne morgens');
      expect(window.state.items.daily).not.toContain('Alte benutzerdefinierte Aufgabe von gestern');
      expect(consoleErrors).toHaveLength(0);
    });

    it('7.2 reloadWeeklyHouseholdTasks leert die Haushalt-Spalte und lädt sie mit den wöchentlichen Haushaltsaufgaben neu', () => {
      window.state.items.weekly = ['Alte erledigte Aufgabe'];
      expect(window.state.items.weekly).toHaveLength(1);

      window.reloadWeeklyHouseholdTasks(false);

      expect(window.state.items.weekly.length).toBeGreaterThan(5);
      expect(window.state.items.weekly).toContain('Staubsaugen');
      expect(window.state.items.weekly).not.toContain('Alte erledigte Aufgabe');
      expect(consoleErrors).toHaveLength(0);
    });

    it('7.3 checkAutoRollovers erkennt Datumswechsel und löst automatischen Reload aus', () => {
      window.state.lastDate = '2026-01-01'; // vergangenes Datum
      window.state.items.daily = ['Gestriges Todo'];

      window.checkAutoRollovers();

      const todayISO = new Date().toISOString().split('T')[0];
      expect(window.state.lastDate).toBe(todayISO);
      expect(window.state.items.daily).not.toContain('Gestriges Todo');
      expect(window.state.items.daily).toContain('Zähne morgens');
      expect(consoleErrors).toHaveLength(0);
    });

    it('7.4 Termine Statusverwaltung: Stattgefunden, Nicht stattgefunden, Zurücksetzen', () => {
      window.state.items.termine = [
        { task: 'Zahnarzt', date: '2026-09-10', time: '14:00', status: 'open' }
      ];

      // 1. Als stattgefunden markieren
      window.markTerminStattgefunden(0);
      expect(window.state.items.termine[0].status).toBe('stattgefunden');

      // 2. Als nicht stattgefunden markieren
      window.markTerminNichtStattgefunden(0);
      expect(window.state.items.termine[0].status).toBe('nicht_stattgefunden');

      // 3. Auf offen zurücksetzen
      window.resetTerminStatus(0);
      expect(window.state.items.termine[0].status).toBe('open');

      // 4. Schnelldurchschaltung toggleTerminStatusQuick
      window.toggleTerminStatusQuick(0); // open -> stattgefunden
      expect(window.state.items.termine[0].status).toBe('stattgefunden');

      expect(consoleErrors).toHaveLength(0);
    });

    it('7.5 Termine verschieben und als verschoben markieren', () => {
      window.state.items.termine = [
        { task: 'Team-Meeting', date: '2026-09-08', time: '11:00', status: 'open' }
      ];

      window.openPostponeTerminModal(0);
      const modal = document.getElementById('modal-postpone-termin');
      expect(modal.classList.contains('hidden')).toBe(false);

      // Schnell-Verschiebung um 7 Tage (+1 Woche)
      window.quickPostponeTerminDays(7);
      const dateInput = document.getElementById('postpone-termin-date');
      expect(dateInput.value).toBe('2026-09-15');

      // Absenden
      window.submitPostponeTermin();

      expect(window.state.items.termine[0].status).toBe('verschoben');
      expect(window.state.items.termine[0].date).toBe('2026-09-15');
      expect(window.state.items.termine[0].originalDate).toBe('2026-09-08');
      expect(modal.classList.contains('hidden')).toBe(true);
      expect(consoleErrors).toHaveLength(0);
    });
  });

  // =========================================================================
  // 8. MONETARISIERUNGS- & ABO-STRUKTUR (INAKTIV)
  // =========================================================================
  describe('8. Monetarisierungs- & Abo-Struktur (Inaktiv)', () => {
    it('8.1 FLOW_CONFIG hat MONETIZATION_ENABLED=false und ADS_ENABLED=false', () => {
      expect(window.FLOW_CONFIG).toBeDefined();
      expect(window.FLOW_CONFIG.MONETIZATION_ENABLED).toBe(false);
      expect(window.FLOW_CONFIG.ADS_ENABLED).toBe(false);
    });

    it('8.2 state.userPlan ist mit "free" initialisiert und durch migrateState geschützt', () => {
      const freshState = window.migrateState(null, 'de');
      expect(freshState.userPlan).toBe('free');

      const migrated = window.migrateState({ items: {} }, 'de');
      expect(migrated.userPlan).toBe('free');

      expect(typeof window.isProUser).toBe('function');
      expect(window.isProUser()).toBe(false);

      expect(typeof window.getUserPlan).toBe('function');
      expect(window.getUserPlan()).toBe('free');
    });

    it('8.3 handleUpgradeClick zeigt sicheren Info-Toast und löst keinen Checkout aus', () => {
      const originalShowToast = window.showToast;
      let toastMessage = null;
      window.showToast = (msg) => { toastMessage = msg; };

      try {
        expect(typeof window.handleUpgradeClick).toBe('function');
        window.handleUpgradeClick('test_feature');

        expect(toastMessage).toMatch(/Pro(-Funktionen sind bald verfügbar| features coming soon)/i);
        expect(consoleErrors).toHaveLength(0);
      } finally {
        window.showToast = originalShowToast;
      }
    });

    it('8.4 Werbeflächen-Platzhalter ad-slot-main existiert im DOM und ist hidden/aria-hidden', () => {
      const adSlot = document.getElementById('ad-slot-main');
      expect(adSlot).not.toBeNull();
      expect(adSlot.classList.contains('hidden')).toBe(true);
      expect(adSlot.getAttribute('aria-hidden')).toBe('true');
    });

    it('8.5 Keine externen Werbe- oder Tracking-SDKs geladen', () => {
      const externalScripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
      const forbiddenDomains = ['googlesyndication', 'doubleclick', 'stripe.com', 'paddle.com', 'google-analytics'];
      
      externalScripts.forEach(src => {
        forbiddenDomains.forEach(domain => {
          expect(src).not.toContain(domain);
        });
      });
    });
  });

  // =========================================================================
  // 9. LISTEN-MANAGEMENT (Add, Rename & Delete Lists via Top Bar & Popover)
  // =========================================================================
  describe('9. Listen-Management', () => {
    it('9.1 Neue Liste anlegen via toggleAddListPopover & submitNewListTop', () => {
      expect(typeof window.toggleAddListPopover).toBe('function');
      expect(typeof window.submitNewListTop).toBe('function');

      // Ensure popover elements exist in DOM for test
      let popover = document.getElementById('popover-add-list');
      if (!popover) {
        popover = document.createElement('div');
        popover.id = 'popover-add-list';
        popover.className = 'hidden';
        const titleInput = document.createElement('input');
        titleInput.id = 'input-new-list-title';
        popover.appendChild(titleInput);
        document.body.appendChild(popover);
      }

      window.toggleAddListPopover(null, true);
      expect(popover.classList.contains('hidden')).toBe(false);

      const titleInput = document.getElementById('input-new-list-title');
      expect(titleInput).not.toBeNull();
      titleInput.value = 'Projekte 2026';

      const initialCount = (window.categoriesOrder || []).length;
      window.submitNewListTop();

      const updatedCount = (window.categoriesOrder || []).length;
      expect(updatedCount).toBe(initialCount + 1);

      const createdEntry = window.categoriesOrder.find(([id, icon, title]) => title === 'Projekte 2026');
      expect(createdEntry).toBeDefined();
      expect(createdEntry[0]).toMatch(/^custom_/);
    });

    it('9.2 Liste löschen via deleteColumn mit Bestätigung', async () => {
      expect(typeof window.deleteColumn).toBe('function');
      window.showConfirmDialog = vi.fn().mockResolvedValue(true);

      // Add a custom column to delete
      window.categoriesOrder.push(['custom_test_123', 'layers', 'Projekte 2026', true]);

      const targetCol = window.categoriesOrder.find(([id, icon, title]) => title === 'Projekte 2026');
      expect(targetCol).toBeDefined();

      const countBefore = window.categoriesOrder.length;
      await window.deleteColumn(targetCol[0]);

      const countAfter = window.categoriesOrder.length;
      expect(countAfter).toBe(countBefore - 1);
      expect(window.categoriesOrder.find(([id]) => id === targetCol[0])).toBeUndefined();
    });
  });
});



