import { describe, it, expect, beforeEach, vi } from 'vitest';

// 1. Data, Tasks & State Setup
import '../data-tasks.js';
import '../data-translations-1.js';
import '../data-translations-2.js';
import '../data-translations.js';
import '../config.js';
import '../auth-engine.js';
import '../storage.js';
import '../state.js';
import '../sync-engine.js';

function createMockSupabase() {
  const users = new Map(); // email -> { id, email, password }
  const tableData = new Map(); // user_id -> { user_id, data, updated_at }
  let currentSession = null;

  const auth = {
    async signInWithPassword({ email, password }) {
      const user = users.get(email);
      if (!user || user.password !== password) {
        return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
      }
      currentSession = { user, access_token: `token_${user.id}` };
      return { data: { user, session: currentSession }, error: null };
    },
    async signUp({ email, password }) {
      if (users.has(email)) {
        return { data: { user: null, session: null }, error: { message: 'User already registered' } };
      }
      const user = { id: `uid_${email.replace(/[^a-zA-Z0-9]/g, '_')}`, email, password };
      users.set(email, user);
      currentSession = { user, access_token: `token_${user.id}` };
      return { data: { user, session: currentSession }, error: null };
    },
    async signOut() {
      currentSession = null;
      return { error: null };
    },
    async resetPasswordForEmail(email, options = {}) {
      if (!email || !email.includes('@')) {
        return { data: null, error: { message: 'Invalid email' } };
      }
      return { data: { email, redirectTo: options.redirectTo }, error: null };
    },
    async getSession() {
      return { data: { session: currentSession }, error: null };
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  };

  const from = (table) => {
    if (table === 'flow_sync') {
      return {
        select(fields) {
          return {
            eq(col, val) {
              return {
                async maybeSingle() {
                  const row = tableData.get(val);
                  return { data: row || null, error: null };
                }
              };
            }
          };
        },
        async upsert(record, options = {}) {
          tableData.set(record.user_id, {
            user_id: record.user_id,
            data: record.data,
            updated_at: record.updated_at || new Date().toISOString()
          });
          return { data: record, error: null };
        }
      };
    }
    throw new Error(`Unknown table: ${table}`);
  };

  return {
    auth,
    from,
    _tableData: tableData,
    _users: users
  };
}

describe('Vollständige & Zuverlässige Synchronisation (Supabase-only & Offline)', () => {
  let mockSupabase;

  beforeEach(async () => {
    localStorage.clear();
    mockSupabase = createMockSupabase();
    FlowAuth._setSupabaseClientForTesting(mockSupabase);
    await FlowAuth.signOut();
    vi.restoreAllMocks();
  });

  describe('1. Authentifizierung & Gerätekopplung entfernt', () => {
    it('bestätigt dass die veralteten PHP-Pairing-Funktionen vollständig entfernt wurden', () => {
      expect(FlowAuth.createPairingCode).toBeUndefined();
      expect(FlowAuth.confirmPairingCode).toBeUndefined();
    });

    it('erlaubt Registrierung und Anmeldung mit E-Mail und Passwort über Supabase', async () => {
      // 1. Registrieren
      const regRes = await FlowAuth.signUpWithCredentials('max@mustermann.de', 'meinpasswort');
      expect(regRes.success).toBe(true);
      expect(FlowAuth.isLoggedIn()).toBe(true);
      expect(FlowAuth.getUser().email).toBe('max@mustermann.de');

      // 2. Abmelden
      await FlowAuth.signOut();
      expect(FlowAuth.isLoggedIn()).toBe(false);

      // 3. Wieder Anmelden
      const loginRes = await FlowAuth.signInWithCredentials('max@mustermann.de', 'meinpasswort');
      expect(loginRes.success).toBe(true);
      expect(FlowAuth.isLoggedIn()).toBe(true);
      expect(FlowAuth.getUser().email).toBe('max@mustermann.de');
    });

    it('erlaubt das Anfordern eines Links zum Zurücksetzen des Passworts über Supabase', async () => {
      const resetRes = await FlowAuth.requestPasswordReset('max@mustermann.de');
      expect(resetRes.success).toBe(true);
      expect(resetRes.message).toContain('E-Mail');

      const invalidRes = await FlowAuth.requestPasswordReset('keine-email');
      expect(invalidRes.success).toBe(false);
    });

    it('signOut setzt den Auth-Status vollständig zurück', async () => {
      await FlowAuth.signUpWithCredentials('user@test.de', 'geheim123');
      expect(FlowAuth.isLoggedIn()).toBe(true);

      await FlowAuth.signOut();
      expect(FlowAuth.isLoggedIn()).toBe(false);
      expect(FlowAuth.getSyncToken()).toBeNull();
    });
  });

  describe('2. Bidirektionale Synchronisation mit Supabase flow_sync', () => {
    it('Test A: Gerät A → Supabase → Gerät B (Neue Aufgabe auf A erstellen, danach Push, auf B Pull -> exakt vorhanden)', async () => {
      // 1. Gerät A registriert sich / meldet sich an und legt Aufgaben an
      await FlowAuth.signUpWithCredentials('team@flow.de', 'password123');
      window.state = {
        _tombstones: {},
        items: {
          daily: [
            { id: 't_daily_1', task: 'E-Mails beantworten', createdAt: '2026-09-04T10:00:00Z', updatedAt: '2026-09-04T10:00:00Z' },
            { id: 't_daily_2', task: 'Projektplan erstellen', createdAt: '2026-09-04T10:05:00Z', updatedAt: '2026-09-04T10:05:00Z' }
          ]
        },
        done: [{ id: 'd_1', task: 'Frühstücken', time: '08:00', createdAt: '2026-09-04T08:00:00Z', updatedAt: '2026-09-04T08:00:00Z' }],
        notes: [{ id: 'n1', text: 'Wichtige Notiz für heute', createdAt: '2026-09-04T10:00:00Z', updatedAt: '2026-09-04T10:00:00Z' }],
        termine: [{ id: 't1', title: 'Meeting 14 Uhr', date: '2026-09-04', createdAt: '2026-09-04T10:00:00Z', updatedAt: '2026-09-04T10:00:00Z' }],
        shoppingList: [{ id: 's1', name: 'Hafermilch', checked: false, createdAt: '2026-09-04T10:00:00Z', updatedAt: '2026-09-04T10:00:00Z' }],
        pantry: [{ id: 'p1', name: 'Reis', createdAt: '2026-09-04T10:00:00Z', updatedAt: '2026-09-04T10:00:00Z' }],
        brainstormIdeas: [{ id: 'b1', text: 'Neue App-Idee', tag: 'idea', createdAt: '2026-09-04T10:00:00Z', updatedAt: '2026-09-04T10:00:00Z' }],
        activeWorkspace: 'private'
      };

      const pushRes = await cloudSyncEngine.pushState();
      expect(pushRes.success).toBe(true);

      // 2. Gerät B startet mit leerem Zustand und zieht die Daten aus Supabase
      window.state = { _tombstones: {}, items: {}, done: [], notes: [], termine: [], shoppingList: [], brainstormIdeas: [], pantry: [] };
      const pullRes = await cloudSyncEngine.pullState();
      expect(pullRes.success).toBe(true);

      expect(window.state.items.daily.map(t => (typeof t === 'object' ? t.task : t))).toEqual(['E-Mails beantworten', 'Projektplan erstellen']);
      expect(window.state.done).toHaveLength(1);
      expect(window.state.notes[0].text).toBe('Wichtige Notiz für heute');
      expect(window.state.termine[0].title).toBe('Meeting 14 Uhr');
      expect(window.state.shoppingList[0].name).toBe('Hafermilch');
      expect(window.state.brainstormIdeas[0].text).toBe('Neue App-Idee');
    });

    it('Test B: Gerät B → Supabase → Gerät A (Auf B Aufgabe abhaken/ändern -> auf A sofort sichtbar)', async () => {
      await FlowAuth.signUpWithCredentials('team@flow.de', 'password123');

      // Gerät B hakt eine Aufgabe ab und fügt einen neuen Termin hinzu
      window.state = {
        _tombstones: {},
        items: { daily: [{ id: 't_daily_1', task: 'E-Mails beantworten', updatedAt: '2026-09-04T10:00:00Z' }] },
        done: [{ id: 'd_2', task: 'Projektplan erstellen', time: '11:30', updatedAt: '2026-09-04T11:30:00Z' }],
        termine: [{ id: 't2', title: 'Zahnarzt', date: '2026-09-10', updatedAt: '2026-09-04T11:30:00Z' }]
      };
      await cloudSyncEngine.pushState();

      // Gerät A synchronisiert
      window.state = {
        _tombstones: {},
        items: { daily: [{ id: 't_daily_1', task: 'E-Mails beantworten', updatedAt: '2026-09-04T10:00:00Z' }] },
        done: [],
        termine: []
      };
      await cloudSyncEngine.pullState();

      expect(window.state.done).toHaveLength(1);
      expect(window.state.done[0].task).toBe('Projektplan erstellen');
      expect(window.state.termine[0].title).toBe('Zahnarzt');
    });
  });

  describe('3. Änderungen & Löschungen mit Tombstones (Test C, Test D, Test G)', () => {
    it('Test C: Bearbeitung (A ändert Text von Aufgabe X -> B empfängt exakte Änderung)', () => {
      const localState = {
        _tombstones: {},
        items: {
          daily: [
            { id: 'task_100', task: 'Milch kaufen (alt)', createdAt: '2026-09-04T10:00:00Z', updatedAt: '2026-09-04T10:00:00Z' }
          ]
        }
      };

      const remoteData = {
        _tombstones: {},
        items: {
          daily: [
            { id: 'task_100', task: 'Hafermilch kaufen (neu)', createdAt: '2026-09-04T10:00:00Z', updatedAt: '2026-09-04T10:30:00Z' }
          ]
        }
      };

      const changed = cloudSyncEngine.mergeState(localState, remoteData);
      expect(changed).toBe(true);
      expect(localState.items.daily).toHaveLength(1);
      expect(localState.items.daily[0].task).toBe('Hafermilch kaufen (neu)');
      expect(localState.items.daily[0].id).toBe('task_100');
    });

    it('Test D: Löschen (A löscht Aufgabe Y -> auf B gelöscht und taucht NIE wieder auf dank Tombstone)', () => {
      const remoteData = {
        _tombstones: {
          'task_200': '2026-09-04T12:00:00Z'
        },
        items: {
          daily: [
            { id: 'task_201', task: 'Verbleibende Aufgabe', createdAt: '2026-09-04T10:00:00Z', updatedAt: '2026-09-04T10:00:00Z' }
          ]
        }
      };

      const localState = {
        _tombstones: {},
        items: {
          daily: [
            { id: 'task_200', task: 'Zu löschende Aufgabe', createdAt: '2026-09-04T09:00:00Z', updatedAt: '2026-09-04T09:00:00Z' },
            { id: 'task_201', task: 'Verbleibende Aufgabe', createdAt: '2026-09-04T10:00:00Z', updatedAt: '2026-09-04T10:00:00Z' }
          ]
        }
      };

      const changed = cloudSyncEngine.mergeState(localState, remoteData);
      expect(changed).toBe(true);
      expect(localState.items.daily).toHaveLength(1);
      expect(localState.items.daily[0].id).toBe('task_201');
      expect(localState._tombstones['task_200']).toBe('2026-09-04T12:00:00Z');

      // Erneuter Sync / Re-merge reanimiert die gelöschte Aufgabe nicht
      const secondMerge = cloudSyncEngine.mergeState(localState, remoteData);
      expect(localState.items.daily).toHaveLength(1);
      expect(localState.items.daily[0].id).toBe('task_201');
    });

    it('Test G: Gleichzeitige Bearbeitung (A ändert X um 14:15, B ändert X um 14:30 -> 14:30 gewinnt deterministisch via LWW)', () => {
      const localState = {
        _tombstones: {},
        items: {
          daily: [
            { id: 'task_shared', task: 'Version A (14:15)', createdAt: '2026-09-04T10:00:00Z', updatedAt: '2026-09-04T14:15:00Z' }
          ]
        }
      };

      const remoteData = {
        _tombstones: {},
        items: {
          daily: [
            { id: 'task_shared', task: 'Version B (14:30 - gewinnt)', createdAt: '2026-09-04T10:00:00Z', updatedAt: '2026-09-04T14:30:00Z' }
          ]
        }
      };

      const changed = cloudSyncEngine.mergeState(localState, remoteData);
      expect(changed).toBe(true);
      expect(localState.items.daily[0].task).toBe('Version B (14:30 - gewinnt)');
    });
  });

  describe('4. Gleichzeitige unabhängige Änderungen (Test F: Zero Data Loss)', () => {
    it('Test F: Gleichzeitige unabhängige Erstellung (A erstellt X, B erstellt Y -> beide behalten X und Y, Zero Data Loss)', () => {
      const localState = {
        _tombstones: {},
        items: { daily: [{ id: 'task_a1', task: 'Aufgabe von Gerät A', createdAt: '2026-09-04T14:00:00Z', updatedAt: '2026-09-04T14:00:00Z' }] },
        notes: [{ id: 'note_a1', text: 'Notiz A', createdAt: '2026-09-04T14:00:00Z', updatedAt: '2026-09-04T14:00:00Z' }],
        shoppingList: [{ id: 'shop_a1', name: 'Brot', createdAt: '2026-09-04T14:00:00Z', updatedAt: '2026-09-04T14:00:00Z' }]
      };

      const remoteData = {
        _tombstones: {},
        items: { daily: [{ id: 'task_b1', task: 'Aufgabe von Gerät B', createdAt: '2026-09-04T14:05:00Z', updatedAt: '2026-09-04T14:05:00Z' }] },
        notes: [{ id: 'note_b1', text: 'Notiz B', createdAt: '2026-09-04T14:05:00Z', updatedAt: '2026-09-04T14:05:00Z' }],
        shoppingList: [{ id: 'shop_b1', name: 'Kaffee', createdAt: '2026-09-04T14:05:00Z', updatedAt: '2026-09-04T14:05:00Z' }]
      };

      const changed = cloudSyncEngine.mergeState(localState, remoteData);
      expect(changed).toBe(true);

      // Beide Aufgaben sind da
      const dailyTasks = localState.items.daily.map(t => (typeof t === 'object' ? t.task : t));
      expect(dailyTasks).toContain('Aufgabe von Gerät A');
      expect(dailyTasks).toContain('Aufgabe von Gerät B');

      // Beide Notizen sind da
      const notes = localState.notes.map(n => n.text);
      expect(notes).toContain('Notiz A');
      expect(notes).toContain('Notiz B');

      // Beide Shopping-Items sind da
      const shopping = localState.shoppingList.map(s => s.name);
      expect(shopping).toContain('Brot');
      expect(shopping).toContain('Kaffee');
    });
  });

  describe('5. Offline-Queue & Auto-Retry (Test E & Test I)', () => {
    it('Test E: Offline-Queue (Offline auf A Aufgaben erstellen, online gehen -> automatisch synchronisiert)', async () => {
      await FlowAuth.signUpWithCredentials('offline.user@flow.de', 'securepass');

      // Offline schalten
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

      window.state = {
        _tombstones: {},
        items: { daily: [{ id: 't_off', task: 'Offline erstellte Aufgabe', createdAt: '2026-09-04T15:00:00Z', updatedAt: '2026-09-04T15:00:00Z' }] },
        done: []
      };

      cloudSyncEngine.triggerAutoPush();
      expect(cloudSyncEngine.isPendingSync()).toBe(true);

      const pushRes = await cloudSyncEngine.pushState();
      expect(pushRes.offline).toBe(true);
      expect(cloudSyncEngine.isPendingSync()).toBe(true);

      // Wieder online gehen
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
      const onlinePushRes = await cloudSyncEngine.pushState();
      expect(onlinePushRes.success).toBe(true);
      expect(cloudSyncEngine.isPendingSync()).toBe(false);
    });

    it('Test I: Netzwerkfehler & Backoff Retry (Supabase antwortet mit Fehler -> retryTimer und flow_pending_sync aktiv)', async () => {
      await FlowAuth.signUpWithCredentials('retry.user@flow.de', 'securepass');
      window.state = { _tombstones: {}, items: { daily: [{ id: 't_retry', task: 'Retry Task' }] } };

      // Mock Supabase to throw error
      const failingSupabase = {
        ...mockSupabase,
        from: () => ({
          upsert: async () => ({ error: new Error('Supabase network error') })
        })
      };
      FlowAuth._setSupabaseClientForTesting(failingSupabase);

      const failedRes = await cloudSyncEngine.pushState();
      expect(failedRes.success).toBe(false);
      expect(cloudSyncEngine.isPendingSync()).toBe(true);
      expect(cloudSyncEngine.retryCount).toBe(1);
      expect(cloudSyncEngine.retryTimer).not.toBeNull();
    });
  });

  describe('6. Persistenz & Lokaler Modus (Test H)', () => {
    it('Test H: App schließen während Sync / Re-Open (State bleibt persistent in LocalStorage und synct beim nächsten Start)', () => {
      const recentTombTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      window.state = {
        _tombstones: { 'old_tomb': recentTombTime },
        items: { daily: [{ id: 'reopen_task', task: 'Persistente Aufgabe vor Schließen' }] },
        done: []
      };

      // Speichern wie vor Schließen der App
      saveState();

      // Simulation App-Neustart: State wird aus LocalStorage geladen
      const loadedRaw = JSON.parse(localStorage.getItem('flowPlannerV3'));
      const restoredState = migrateState(loadedRaw, 'de');

      expect(restoredState.items.daily[0].task).toBe('Persistente Aufgabe vor Schließen');
      expect(restoredState._tombstones['old_tomb']).toBe(recentTombTime);
    });

    it('migriert ältere String-Aufgaben automatisch zu Objekten mit stabiler ID und Zeitstempel bei Serialisierung/Sync', () => {
      const oldRaw = {
        version: 3,
        items: {
          daily: ['Alte String Aufgabe 1', 'Alte String Aufgabe 2'],
          todo: ['Altes Todo']
        },
        done: [{ task: 'Erledigt' }]
      };

      const migrated = migrateState(oldRaw, 'de');
      expect(migrated.version).toBe(3);
      expect(migrated._tombstones).toBeDefined();

      // Serialisierung für den Sync normalisiert alle Einträge auf eindeutige IDs & Zeitstempel
      const serialized = cloudSyncEngine.serializeFullState(migrated);
      expect(serialized._tombstones).toBeDefined();
      expect(serialized.items.daily).toHaveLength(2);
      expect(serialized.items.todo).toHaveLength(1);
    });

    it('funktioniert 100% lokal ohne Fehler wenn nicht angemeldet', () => {
      expect(FlowAuth.isLoggedIn()).toBe(false);

      window.state = {
        _tombstones: {},
        items: { daily: [{ id: 'loc1', task: 'Lokaler Task 1' }] },
        done: []
      };

      expect(() => saveState()).not.toThrow();
      const stored = JSON.parse(localStorage.getItem('flowPlannerV3'));
      expect(stored.items.daily[0].task).toBe('Lokaler Task 1');
    });
  });
});

