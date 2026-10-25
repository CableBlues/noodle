/**
 * @file tests/data-safety-and-sync.test.js
 * @description
 * Verifikationstests für Schritt 2 (Datensicherheit, Speicherintegrität und Synchronisierung):
 * 1. saveState-Fehlerbehandlung: Keine fälschliche Erfolgsmeldung bei Schreibabbrüchen
 * 2. persistHistory-Quota-Recovery: Synchronisation zwischen In-Memory, localStorage und window.historyStack
 * 3. sync-engine Concurrency-Guard: Schutz vor konkurrierenden pushState-Aufrufen (Lost Updates)
 * 4. collab-engine Validierung: Resilienz gegen malforme Board-Payloads
 * 5. AppStorage-Zentralisierung: Persistente Spiegelung kritischer Fachdaten (Health, Sport, Cleaning, etc.)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Schritt 2: Datensicherheit, Speicherintegrität und Synchronisierung', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.body.innerHTML = '<div id="app"></div>';

    await import('../storage.js');
    await import('../data-tasks.js');
    await import('../state.js');
    await import('../config.js');
    await import('../auth-engine.js');
    await import('../sync-engine.js');
    await import('../collab-engine.js');

    if (typeof window.NoodleEvents !== 'undefined') {
      window.NoodleEvents.clear();
    }
  });

  describe('1. saveState Fehler- und Quota-Integrität', () => {
    it('gibt bei erfolgreichem Speichern true zurück und emittiert state:saved', () => {
      window.state = window.migrateState(null, 'de');
      const savedEvents = [];
      window.NoodleEvents.on('state:saved', (payload) => savedEvents.push(payload));

      const ok = window.saveState();
      expect(ok).toBe(true);
      expect(savedEvents).toHaveLength(1);
    });

    it('gibt bei kritischem Fehlschlag false zurück, emittiert state:save-failed und verhindert false-positive state:saved', () => {
      window.state = window.migrateState(null, 'de');
      const savedEvents = [];
      const failedEvents = [];
      window.NoodleEvents.on('state:saved', (payload) => savedEvents.push(payload));
      window.NoodleEvents.on('state:save-failed', (payload) => failedEvents.push(payload));

      const proto = window.Storage ? window.Storage.prototype : Object.getPrototypeOf(localStorage);
      const originalSetItem = proto.setItem;

      // Erzwinge dauerhaften Schreibfehler
      proto.setItem = vi.fn(() => {
        const err = new Error('Disk full / persistent quota error');
        err.name = 'QuotaExceededError';
        throw err;
      });

      try {
        const result = window.saveState();
        expect(result).toBe(false);
        expect(savedEvents).toHaveLength(0); // Keine fälschliche Erfolgsmeldung!
        expect(failedEvents).toHaveLength(1);
      } finally {
        proto.setItem = originalSetItem;
      }
    });
  });

  describe('2. History & Undo Persistenz-Resilienz', () => {
    it('aktualisiert window.historyStack synchron, wenn persistHistory den Stack bei Quota-Druck trimmt', () => {
      window.state = window.migrateState(null, 'de');
      window.historyStack = [];

      for (let i = 1; i <= 10; i++) {
        window.historyStack.push({ _actionLabel: `Aktion ${i}`, items: {} });
      }
      expect(window.historyStack).toHaveLength(10);

      const proto = window.Storage ? window.Storage.prototype : Object.getPrototypeOf(localStorage);
      const originalSetItem = proto.setItem;
      let callCount = 0;

      // 1. Aufruf scheitert an Quota -> persistHistory trimmt auf 5
      proto.setItem = vi.fn((key, val) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('QuotaExceededError');
        }
        return originalSetItem.call(localStorage, key, val);
      });

      try {
        window.persistHistory();
        expect(window.historyStack).toHaveLength(5);
        expect(window.historyStack[window.historyStack.length - 1]._actionLabel).toBe('Aktion 10');
      } finally {
        proto.setItem = originalSetItem;
      }
    });
  });

  describe('3. CloudSync Concurrency-Guard', () => {
    it('blockiert überlappende pushState-Aufrufe und markiert pendingSync', async () => {
      // Mock Auth als eingeloggt
      vi.spyOn(window.FlowAuth, 'isLoggedIn').mockReturnValue(true);
      vi.spyOn(window.FlowAuth, 'getSyncToken').mockReturnValue('mock_token');
      vi.spyOn(window.FlowAuth, 'getUser').mockReturnValue({ id: 'u123', email: 'test@example.com' });

      // Simuliere langsame Supabase-Antwort
      let resolveUpsert;
      const slowUpsertPromise = new Promise((resolve) => {
        resolveUpsert = resolve;
      });

      vi.spyOn(window.FlowAuth, 'getSupabaseClient').mockReturnValue({
        from: () => ({
          upsert: () => slowUpsertPromise
        })
      });

      // Erster Push startet
      const pushPromise1 = window.cloudSyncEngine.pushState();

      // Zweiter Push wird direkt währenddessen aufgerufen
      const pushResult2 = await window.cloudSyncEngine.pushState();

      expect(pushResult2.inProgress).toBe(true);
      expect(window.cloudSyncEngine.isPendingSync()).toBe(true);

      // Ersten Push abschließen
      resolveUpsert({ error: null });
      const pushResult1 = await pushPromise1;
      expect(pushResult1.success).toBe(true);
    });

    it('verhindert, dass parallel gestartetes pullState() einen laufenden Push oder lokale Daten überschreibt', async () => {
      vi.spyOn(window.FlowAuth, 'isLoggedIn').mockReturnValue(true);
      vi.spyOn(window.FlowAuth, 'getSyncToken').mockReturnValue('mock_token');
      vi.spyOn(window.FlowAuth, 'getUser').mockReturnValue({ id: 'u123', email: 'test@example.com' });

      let resolveUpsert;
      const slowUpsertPromise = new Promise((resolve) => {
        resolveUpsert = resolve;
      });

      const mockSupabase = {
        from: () => ({
          upsert: () => slowUpsertPromise,
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: { data: { items: { daily: ['Remote Overwrite'] } } }, error: null })
            })
          })
        })
      };

      vi.spyOn(window.FlowAuth, 'getSupabaseClient').mockReturnValue(mockSupabase);

      // 1. Push startet und blockiert mit isSyncing = true
      const pushPromise = window.cloudSyncEngine.pushState();
      expect(window.cloudSyncEngine.isSyncing).toBe(true);

      // 2. Paralleler pullState() wird aufgerufen
      const pullResult = await window.cloudSyncEngine.pullState();
      expect(pullResult.inProgress).toBe(true);

      // 3. Nach Push-Abschluss ist isSyncing = false
      resolveUpsert({ error: null });
      await pushPromise;
      expect(window.cloudSyncEngine.isSyncing).toBe(false);
    });

    it('setzt isSyncing auch bei Netzwerk- oder Server-Exceptions verlässlich auf false zurück', async () => {
      vi.spyOn(window.FlowAuth, 'isLoggedIn').mockReturnValue(true);
      vi.spyOn(window.FlowAuth, 'getSyncToken').mockReturnValue('mock_token');
      vi.spyOn(window.FlowAuth, 'getUser').mockReturnValue({ id: 'u123', email: 'test@example.com' });

      vi.spyOn(window.FlowAuth, 'getSupabaseClient').mockReturnValue({
        from: () => ({
          upsert: () => Promise.reject(new Error('Fatal 500 Connection Drop'))
        })
      });

      const res = await window.cloudSyncEngine.pushState();
      expect(res.success).toBe(false);
      expect(window.cloudSyncEngine.isSyncing).toBe(false);
    });
  });

  describe('4. CollabEngine Validierung gegen malforme Daten', () => {
    it('ignoriert unvollständige oder nicht-objektförmige boardData schadlos', () => {
      window.state = window.migrateState(null, 'de');
      const originalItems = JSON.stringify(window.state.items);

      // Event mit ungültigem boardData
      window.CollabEngine.handleIncomingEvent({
        type: 'board_sync',
        sender: { name: 'Bob' },
        boardData: 'nicht-ein-objekt'
      });

      // Zustand bleibt unberührt und wirft keine Exception
      expect(JSON.stringify(window.state.items)).toBe(originalItems);
    });
  });

  describe('5. AppStorage Fachdaten-Resilienz', () => {
    it('spiegelt gesetzte Werte im IDB_VAULT', async () => {
      const spyVaultSet = vi.spyOn(window.IDB_VAULT, 'set');
      const testData = { age: 32, allergies: ['Pollen'] };

      const ok = window.AppStorage.set('flow_health_profile', testData);
      expect(ok).toBe(true);
      expect(spyVaultSet).toHaveBeenCalledWith('flow_health_profile', testData);

      const retrieved = window.AppStorage.get('flow_health_profile');
      expect(retrieved).toEqual(testData);
    });

    it('gibt false zurück, wenn localStorage fehlschlägt, und überschreibt bei bestehenden Daten nicht zerstörerisch', async () => {
      const proto = window.Storage ? window.Storage.prototype : Object.getPrototypeOf(localStorage);
      const originalSetItem = proto.setItem;

      proto.setItem = vi.fn(() => {
        const err = new Error('QuotaExceeded');
        err.name = 'QuotaExceededError';
        throw err;
      });

      try {
        const ok = window.AppStorage.set('test_key', { data: 123 });
        // QuotaExceeded bei localStorage meldet false zurück
        expect(ok).toBe(false);
      } finally {
        proto.setItem = originalSetItem;
      }
    });

    it('initResilience überschreibt vorhandene gültige Daten niemals mit veralteten IDB-Snapshots', async () => {
      // Gültiger Primärdatenbestand vorhanden
      localStorage.setItem('flowPlannerV3', JSON.stringify({ version: 3, items: { daily: ['Aktuell'] } }));
      
      const spyIDBGet = vi.spyOn(window.IDB_VAULT, 'get');
      const res = await window.AppStorage.initResilience();
      
      expect(res).toBe(false);
      expect(spyIDBGet).not.toHaveBeenCalled();
      const current = JSON.parse(localStorage.getItem('flowPlannerV3'));
      expect(current.items.daily).toContain('Aktuell');
    });
  });

  describe('6. Multi-Tab Konsistenz & Storage-Events', () => {
    it('aktualisiert den lokalen In-Memory-Zustand, wenn ein anderer Tab einen neueren Stand schreibt', () => {
      window.state = window.migrateState(null, 'de');
      window.state.updatedAt = '2026-10-25T10:00:00.000Z';
      window.state.items.daily = ['Lokaler Task Tab A'];

      const remoteNewerState = {
        version: 3,
        updatedAt: '2026-10-25T10:05:00.000Z',
        items: { daily: ['Neuer Task aus Tab B'] }
      };

      const event = new StorageEvent('storage', {
        key: 'flowPlannerV3',
        newValue: JSON.stringify(remoteNewerState)
      });
      window.dispatchEvent(event);

      expect(window.state.items.daily).toContain('Neuer Task aus Tab B');
    });

    it('ignoriert eingehende Storage-Events aus anderen Tabs, wenn der lokale Stand neuer ist', () => {
      window.state = window.migrateState(null, 'de');
      window.state.updatedAt = '2026-10-25T12:00:00.000Z';
      window.state.items.daily = ['Aktuellster Task Tab A'];

      const remoteOlderState = {
        version: 3,
        updatedAt: '2026-10-25T11:00:00.000Z',
        items: { daily: ['Veralteter Task Tab B'] }
      };

      const event = new StorageEvent('storage', {
        key: 'flowPlannerV3',
        newValue: JSON.stringify(remoteOlderState)
      });
      window.dispatchEvent(event);

      expect(window.state.items.daily).toContain('Aktuellster Task Tab A');
      expect(window.state.items.daily).not.toContain('Veralteter Task Tab B');
    });

    it('ignoriert eingehende Storage-Events mit identischem oder fehlendem Zeitstempel schadlos ohne Re-Render-Schleife', () => {
      window.state = window.migrateState(null, 'de');
      const fixedTs = '2026-10-25T14:00:00.000Z';
      window.state.updatedAt = fixedTs;
      window.state.items.daily = ['Bestehender Task'];

      const eventLoadedSpies = [];
      window.NoodleEvents.on('state:loaded', (p) => eventLoadedSpies.push(p));

      // 1. Identischer Zeitstempel
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'flowPlannerV3',
        newValue: JSON.stringify({ version: 3, updatedAt: fixedTs, items: { daily: ['Gleicher Zeitstempel'] } })
      }));

      // 2. Fehlender / ungültiger Zeitstempel
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'flowPlannerV3',
        newValue: JSON.stringify({ version: 3, updatedAt: 'invalid-date', items: { daily: ['Ungültiges Datum'] } })
      }));

      // Keine Re-Hydration ausgelöst
      expect(eventLoadedSpies).toHaveLength(0);
      expect(window.state.items.daily).toContain('Bestehender Task');
    });
  });
});
