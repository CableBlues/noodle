/**
 * @file tests/backup-restore-and-reload-resilience.test.js
 * @description
 * Tests für Backup-, Restore- und Speicher-Resilienz (app-backup.js, storage.js, state.js).
 * Testet JSON-Export/Import, Wiederherstellung nach Absturz/Reload,
 * Quota-Fehlerbehandlung, Tombstone-Bereinigung und Daten-Migration aus Altbeständen.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Backup, Restore & Reload-Resilienz (app-backup.js, storage.js, state.js)', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.body.innerHTML = '<div id="app"></div>';

    // Globaler State
    window.state = {
      version: 3,
      items: {
        daily: [{ id: 'd1', task: 'Zähne putzen' }],
        weekly: [{ id: 'w1', task: 'Staubsaugen' }],
        occasionally: [],
        todo: [{ id: 't1', task: 'Steuererklärung machen' }],
        termine: [],
        notes: []
      },
      categoriesOrder: ['daily', 'weekly', 'occasionally', 'todo', 'termine', 'notes'],
      activeWorkspace: 'private',
      customTranslations: { de: {}, en: {} },
      _tombstones: {},
      settings: { language: 'de', theme: 'aurora' }
    };
    window.categoriesOrder = window.state.categoriesOrder;
    window.customTranslations = window.state.customTranslations;
    window.items = window.state.items;
    window.currentWorkspace = 'private';
    window.currentLang = 'de';

    // Globale Mocks
    window.showToast = vi.fn();
    window.renderApp = vi.fn();
    window.saveState = vi.fn(() => {
      localStorage.setItem('flow_state_v3', JSON.stringify(window.state));
    });
    window.showConfirmDialog = vi.fn().mockResolvedValue(true);
    window.confirm = vi.fn().mockReturnValue(true);

    // Module importieren
    await import('../storage.js');
    await import('../state.js');
    await import('../app-backup.js');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Vollständiges Backup generieren (downloadFullBackup)', () => {
    it('erzeugt valides JSON mit App-Identifikator und aktuellem Stand', () => {
      let createdBlob = null;
      let clickedDownload = false;
      let downloadFileName = '';

      // URL & Anchor Mocks
      const origCreateObjectURL = URL.createObjectURL;
      const origRevokeObjectURL = URL.revokeObjectURL;
      URL.createObjectURL = vi.fn((blob) => {
        createdBlob = blob;
        return 'blob:mock-url';
      });
      URL.revokeObjectURL = vi.fn();

      const origAppendChild = document.body.appendChild.bind(document.body);
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
        if (node.tagName === 'A' && node.download) {
          clickedDownload = true;
          downloadFileName = node.download;
          return node;
        }
        return origAppendChild(node);
      });

      window.downloadFullBackup();

      expect(createdBlob).not.toBeNull();
      expect(clickedDownload).toBe(true);
      expect(downloadFileName).toMatch(/^noodle-backup-\d{4}-\d{2}-\d{2}\.json$/);
      expect(window.showToast).toHaveBeenCalled();

      // Aufräumen
      URL.createObjectURL = origCreateObjectURL;
      URL.revokeObjectURL = origRevokeObjectURL;
    });
  });

  describe('2. Backup wiederherstellen (handleRestoreBackupFile)', () => {
    it('stellt gültige Backup-Daten wieder her und aktualisiert den State', async () => {
      const backupPayload = {
        app: 'Noodle',
        version: '2.5.0',
        exportedAt: new Date().toISOString(),
        items: {
          daily: [{ id: 'b1', task: 'Wiederhergestellte Aufgabe' }],
          weekly: [],
          occasionally: [],
          todo: [],
          termine: [],
          notes: []
        },
        categoriesOrder: ['daily', 'todo'],
        currentWorkspace: 'private',
        customTranslations: { de: { my_key: 'Mein Text' } },
        theme: 'midnight',
        currentLang: 'de'
      };

      const file = new File([JSON.stringify(backupPayload)], 'backup.json', { type: 'application/json' });
      const event = {
        target: {
          files: [file],
          value: 'fake-path'
        }
      };

      await window.handleRestoreBackupFile(event);

      // FileReader onload abwarten
      await new Promise(r => setTimeout(r, 50));

      expect(window.state).toBeDefined();
      expect(window.state.items.daily.some(t => t.task === 'Wiederhergestellte Aufgabe')).toBe(true);
      expect(window.state._backupRestoredAt).toBeDefined();
      expect(window.renderApp).toHaveBeenCalled();
      expect(window.saveState).toHaveBeenCalled();
      expect(window.showToast).toHaveBeenCalled();
    });

    it('lehnt defektes oder ungültiges JSON sauber ab ohne den bestehenden State zu zerstören', async () => {
      const corruptedFile = new File(['{kaputtes_json: nicht valide'], 'corrupted.json', { type: 'application/json' });
      const event = {
        target: {
          files: [corruptedFile],
          value: 'fake-path'
        }
      };

      const originalDailyCount = window.state.items.daily.length;

      await window.handleRestoreBackupFile(event);
      await new Promise(r => setTimeout(r, 50));

      // Bestehender State bleibt unverändert erhalten
      expect(window.state.items.daily.length).toBe(originalDailyCount);
      expect(window.showToast).toHaveBeenCalledWith(expect.stringContaining('Fehler beim Wiederherstellen'));
    });
  });

  describe('3. Reload-Resilienz und Daten-Migration (loadState & migrateState)', () => {
    it('stellt bei beschädigtem localStorage automatisch einen sauberen Standard-State her', () => {
      localStorage.setItem('flow_state_v3', '{ungueltiges_json: kein JSON}');

      const loaded = window.loadState();
      expect(loaded).toBeDefined();
      expect(loaded.version).toBe(3);
      expect(loaded.items).toBeDefined();
      expect(Array.isArray(loaded.items.daily)).toBe(true);
      expect(Array.isArray(loaded.items.todo)).toBe(true);
    });

    it('migriert Alt-Daten mit Notizen im reinen Textformat zu sauberen Arrays', () => {
      const legacyState = {
        version: 1,
        items: {
          daily: ['Aufgabe 1', 'Aufgabe 2'],
          notes: 'Notiz Zeile 1\nNotiz Zeile 2\nNotiz Zeile 3' // Früher als String gespeichert
        }
      };

      const migrated = window.migrateState(legacyState, 'de');
      expect(migrated.version).toBe(3);
      expect(Array.isArray(migrated.items.notes)).toBe(true);
      expect(migrated.items.notes.length).toBe(3);
      expect(migrated.items.notes[0]).toBe('Notiz Zeile 1');
    });

    it('löscht veraltete Tombstones (> 30 Tage) bei der Migration', () => {
      const now = Date.now();
      const oldTime = new Date(now - 35 * 24 * 60 * 60 * 1000).toISOString();
      const freshTime = new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString();

      const stateWithTombstones = {
        _tombstones: {
          old_tombstone: oldTime,
          fresh_tombstone: freshTime
        }
      };

      const migrated = window.migrateState(stateWithTombstones, 'de');
      expect(migrated._tombstones.old_tombstone).toBeUndefined();
      expect(migrated._tombstones.fresh_tombstone).toBe(freshTime);
    });
  });

  describe('4. Dual-Storage & Quota-Resilienz (AppStorage)', () => {
    it('gibt defaultValue zurück, wenn der Schlüssel nicht existiert oder defekt ist', () => {
      expect(window.AppStorage.get('non_existent_key', { fallback: true })).toEqual({ fallback: true });

      localStorage.setItem('broken_key', '{kaputt');
      expect(window.AppStorage.get('broken_key', 'ersatz')).toBe('ersatz');
    });

    it('schreibt und liest valide JSON-Objekte erfolgreich', () => {
      const testData = { user: 'Test', count: 42, active: true };
      const success = window.AppStorage.set('test_entity', testData);

      expect(success).toBe(true);
      const readBack = window.AppStorage.get('test_entity');
      expect(readBack).toEqual(testData);
    });

    it('fängt QuotaExceededError ab, meldet false und bringt die App nicht zum Absturz', () => {
      const quotaErr = new Error('The quota has been exceeded.');
      quotaErr.name = 'QuotaExceededError';
      quotaErr.code = 22;

      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw quotaErr;
      });

      if (window.__resetQuotaToastForTesting) window.__resetQuotaToastForTesting();

      const result = window.AppStorage.set('overflow_key', { huge: 'data' });
      expect(result).toBe(false);
      expect(window.showToast).toHaveBeenCalledWith(expect.stringContaining('Speicher voll'));

      setItemSpy.mockRestore();
    });

    it('speichert und liest Strings sicher mit getString und setString', () => {
      window.AppStorage.setString('simple_str', 'Hello Noodle');
      expect(window.AppStorage.getString('simple_str')).toBe('Hello Noodle');
      expect(window.AppStorage.getString('missing_str', 'default_val')).toBe('default_val');
    });
  });

  describe('5. Absturz-Wiederherstellungsbildschirm (showCrashRecoveryScreen)', () => {
    it('blendet Notfall-Overlay mit Neustart-Buttons ein', () => {
      window.showCrashRecoveryScreen('Test-Absturz');

      const overlay = document.getElementById('noodle-crash-recovery-overlay');
      expect(overlay).not.toBeNull();
      expect(overlay.textContent).toContain('Noodle sicher neu starten');
      expect(overlay.querySelectorAll('button').length).toBe(2);
    });
  });
});
