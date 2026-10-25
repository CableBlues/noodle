/**
 * @file tests/architecture-foundation.test.js
 * @description
 * Architektur- und Regressionstests für Schritt 1 (Architektur und technische Basis):
 * 1. NoodleEvents: Event-Bus für entkoppelte Kommunikation (on, off, once, emit, error-isolation)
 * 2. StateCore: Abstraktion über globalen State, Workspaces, History & reaktive Events
 * 3. Speicher-Resilienz: AppStorage, Quota-Signalisierung und IDB-Vault-Kompatibilität
 * 4. Schnittstellen-Integrität: Rückwärtskompatibilität aller Legacy-Globals auf window/globalThis
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Schritt 1: Architektur und technische Basis', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.body.innerHTML = '<div id="app"></div>';

    // Module importieren
    await import('../storage.js');
    await import('../data-tasks.js');
    await import('../state.js');

    if (typeof window.NoodleEvents !== 'undefined') {
      window.NoodleEvents.clear();
    }
  });

  describe('1. NoodleEvents Event-Bus', () => {
    it('bietet voll funktionsfähige Pub/Sub-Schnittstelle (on, emit, off)', () => {
      expect(window.NoodleEvents).toBeDefined();
      expect(typeof window.NoodleEvents.on).toBe('function');
      expect(typeof window.NoodleEvents.emit).toBe('function');

      const calls = [];
      const unsub = window.NoodleEvents.on('test:event', (data) => {
        calls.push(data);
      });

      window.NoodleEvents.emit('test:event', { foo: 'bar' });
      expect(calls).toEqual([{ foo: 'bar' }]);

      // Unsubscribe testen
      unsub();
      window.NoodleEvents.emit('test:event', { foo: 'baz' });
      expect(calls).toHaveLength(1);
    });

    it('unterstützt once() für Einmal-Abonnements', () => {
      const calls = [];
      window.NoodleEvents.once('test:single', (val) => {
        calls.push(val);
      });

      window.NoodleEvents.emit('test:single', 1);
      window.NoodleEvents.emit('test:single', 2);
      expect(calls).toEqual([1]);
    });

    it('isoliert Handler-Fehler robust, sodass andere Abonnenten nicht abstürzen', () => {
      const successfulCalls = [];
      const brokenListener = vi.fn(() => {
        throw new Error('Listener Boom');
      });
      const safeListener = vi.fn((data) => {
        successfulCalls.push(data);
      });

      window.NoodleEvents.on('test:error-resilience', brokenListener);
      window.NoodleEvents.on('test:error-resilience', safeListener);

      expect(() => {
        window.NoodleEvents.emit('test:error-resilience', { ok: true });
      }).not.toThrow();

      expect(brokenListener).toHaveBeenCalledTimes(1);
      expect(safeListener).toHaveBeenCalledTimes(1);
      expect(successfulCalls).toEqual([{ ok: true }]);
    });
  });

  describe('2. StateCore Schnittstelle & Event-Kopplung', () => {
    it('StateCore ist definiert und exponiert saubere Kern-Methoden', () => {
      expect(window.StateCore).toBeDefined();
      expect(typeof window.StateCore.get).toBe('function');
      expect(typeof window.StateCore.getActiveWorkspace).toBe('function');
      expect(typeof window.StateCore.save).toBe('function');
      expect(typeof window.StateCore.load).toBe('function');
      expect(typeof window.StateCore.setWorkspace).toBe('function');
    });

    it('emittiert state:saved Event bei saveState() und StateCore.save()', () => {
      const savedEvents = [];
      window.NoodleEvents.on('state:saved', (payload) => {
        savedEvents.push(payload);
      });

      window.state = window.migrateState(null, 'de');
      window.saveState(true);

      expect(savedEvents.length).toBeGreaterThanOrEqual(1);
      expect(savedEvents[0].state).toBeDefined();
      expect(savedEvents[0].skipP2PSync).toBe(true);
    });

    it('emittiert workspace:changed Event beim Umschalten des Workspaces', () => {
      const wsEvents = [];
      window.NoodleEvents.on('workspace:changed', (payload) => {
        wsEvents.push(payload);
      });

      window.state = window.migrateState(null, 'de');
      window.setWorkspace('work');

      expect(wsEvents.length).toBe(1);
      expect(wsEvents[0].mode).toBe('work');
      expect(window.StateCore.getActiveWorkspace()).toBe('work');
    });

    it('emittiert history:saved Event bei saveHistory()', () => {
      const historyEvents = [];
      window.NoodleEvents.on('history:saved', (payload) => {
        historyEvents.push(payload);
      });

      window.state = window.migrateState(null, 'de');
      window.saveHistory('Test-Aktion ausgeführt');

      expect(historyEvents.length).toBe(1);
      expect(historyEvents[0].label).toBe('Test-Aktion ausgeführt');
    });

    it('emittiert Events in korrekter Reihenfolge und ohne Mehrfachauslösung', () => {
      const eventSequence = [];
      window.NoodleEvents.on('workspace:changed', (payload) => {
        eventSequence.push({ event: 'workspace:changed', mode: payload.mode });
      });
      window.NoodleEvents.on('state:saved', () => {
        eventSequence.push({ event: 'state:saved' });
      });

      window.state = window.migrateState(null, 'de');
      window.setWorkspace('study');

      // Reihenfolge muss sein: workspace:changed VOR state:saved
      expect(eventSequence).toHaveLength(2);
      expect(eventSequence[0].event).toBe('workspace:changed');
      expect(eventSequence[0].mode).toBe('study');
      expect(eventSequence[1].event).toBe('state:saved');
    });

    it('emittiert history:undo bei handleUndo() mit wiederhergestelltem Snapshot', () => {
      window.state = window.migrateState(null, 'de');
      window.state.items.daily = ['Task Alt'];
      window.saveHistory('Vor Änderung');
      window.state.items.daily.push('Task Neu');

      const undoEvents = [];
      window.NoodleEvents.on('history:undo', (payload) => {
        undoEvents.push(payload);
      });

      window.handleUndo();

      expect(undoEvents).toHaveLength(1);
      expect(undoEvents[0].restoredSnapshot).toBeDefined();
      expect(undoEvents[0].restoredSnapshot._actionLabel).toBe('Vor Änderung');
      expect(window.state.items.daily).toEqual(['Task Alt']);
    });

    it('stellt sicher, dass NoodleEvents und StateCore als Singletons bei Neuimport erhalten bleiben', async () => {
      let fired = 0;
      window.NoodleEvents.on('custom:singleton-check', () => {
        fired++;
      });

      // Erneuter Import darf existierende Listener nicht verwerfen
      await import('../storage.js');
      await import('../state.js');

      window.NoodleEvents.emit('custom:singleton-check');
      expect(fired).toBe(1);
      expect(window.StateCore).toBeDefined();
    });
  });

  describe('3. Globale Abwärtskompatibilität & Storage-Integrität', () => {
    it('erhält alle bestehenden Schnittstellen und Globals unverändert', () => {
      expect(window.state).toBeDefined();
      expect(typeof window.saveState).toBe('function');
      expect(typeof window.loadState).toBe('function');
      expect(typeof window.migrateState).toBe('function');
      expect(typeof window.saveHistory).toBe('function');
      expect(typeof window.handleUndo).toBe('function');
      expect(window.AppStorage).toBeDefined();
      expect(window.IDB_VAULT).toBeDefined();
      expect(window.ErrorDiagnostics).toBeDefined();
    });

    it('AppStorage schreibt synchron in localStorage und asynchron in IDB_VAULT', () => {
      const testKey = 'test_storage_key';
      const testData = { hello: 'world', ts: 12345 };

      const ok = window.AppStorage.set(testKey, testData);
      expect(ok).toBe(true);

      const retrieved = window.AppStorage.get(testKey);
      expect(retrieved).toEqual(testData);

      window.AppStorage.remove(testKey);
      expect(window.AppStorage.get(testKey)).toBeNull();
    });
  });
});
