import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../config.js';
import '../storage.js';
import '../data-tasks.js';
import '../state.js';
import '../collab-engine.js';
import '../app-weather-news.js';

describe('Phase 1: Collab-Sicherheit & Resilienz Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    window.state = window.migrateState(null, 'de');
    globalThis.state = window.state;
  });

  describe('1. Kryptografisch sichere Raumcodes', () => {
    it('generiert Raumcodes mit mindestens 10 Zeichen Länge und kryptografischer Entropie', () => {
      const room = CollabEngine.generateSecureRoomCode('team', 12);
      expect(room).toBeDefined();
      expect(room.startsWith('team-')).toBe(true);
      // Mindestens 10 Zeichen nach Präfix
      const codePart = room.replace('team-', '');
      expect(codePart.length).toBeGreaterThanOrEqual(10);
      expect(codePart).toMatch(/^[a-z0-9]+$/);

      // Verifiziert Einzigartigkeit (100 zufällige Codes ohne Kollision)
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(CollabEngine.generateSecureRoomCode('', 12));
      }
      expect(codes.size).toBe(100);
    });
  });

  describe('2. Schema-Validierung und Größen-/Rate-Limits', () => {
    it('akzeptiert valide Events und weist ungültige Types ab', () => {
      expect(CollabEngine.validateEventSchema({ type: 'chat_message', message: { text: 'Hallo' }, sender: { id: 'u1' } })).toBe(true);
      expect(CollabEngine.validateEventSchema({ type: 'board_sync', boardData: {}, sender: { id: 'u1' } })).toBe(true);

      // Ungültige Typen oder fehlende Pflichtfelder
      expect(CollabEngine.validateEventSchema(null)).toBe(false);
      expect(CollabEngine.validateEventSchema({ type: 'malicious_eval_type' })).toBe(false);
      expect(CollabEngine.validateEventSchema({ type: 'chat_message' })).toBe(false);
      expect(CollabEngine.validateEventSchema({ type: 'board_sync' })).toBe(false);
    });

    it('drosselt aggressive Anfragen per Rate-Limiting', () => {
      const sender = 'spammer_99';
      let limited = false;
      for (let i = 0; i < 35; i++) {
        if (CollabEngine.isRateLimited(sender)) {
          limited = true;
          break;
        }
      }
      expect(limited).toBe(true);
    });
  });

  describe('3. Board Sync Merging mit Undo-Punkt', () => {
    it('merged eingehende Board-Sync-Daten additiv statt das Board hart zu überschreiben und erzeugt Undo-Snapshot', () => {
      window.state.workspaces = {
        shared: {
          items: {
            daily: [{ id: 'task_local_1', task: 'Lokale Teamaufgabe' }]
          },
          done: [],
          history: []
        }
      };
      window.state.activeWorkspace = 'shared';
      window.historyStack = [];

      const syncPayload = {
        type: 'board_sync',
        sender: { id: 'remote_peer_1', name: 'Marlene' },
        boardData: {
          items: {
            daily: [{ id: 'task_remote_1', task: 'Entfernte Teamaufgabe' }]
          }
        }
      };

      CollabEngine.handleIncomingEvent(syncPayload);

      // Verifiziere Merging: Beide Aufgaben müssen erhalten bleiben
      const dailyTasks = window.state.workspaces.shared.items.daily.map(it => (typeof it === 'object' ? it.task : it));
      expect(dailyTasks).toContain('Lokale Teamaufgabe');
      expect(dailyTasks).toContain('Entfernte Teamaufgabe');

      // Verifiziere Undo-Punkt
      expect(window.historyStack.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('4. Beseitigung unsicherer Inline-Interpolationen', () => {
    it('rendert Wetter-Ergebnisbuttons sicher ohne anfälliges Inline-onclick', () => {
      let resultsContainer = document.getElementById('weather-city-results');
      if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'weather-city-results';
        document.body.appendChild(resultsContainer);
      }

      // Suche nach einer Stadt mit bösartigen Anführungszeichen und Script-Tags
      const maliciousCity = `<img src=x onerror=alert(1)>' OR '1'='1`;
      window.handleWeatherSearchInput(maliciousCity);

      // Verifiziere dass kein Inline-onclick mit ungefilterten Anführungszeichen erzeugt wird
      const html = resultsContainer.innerHTML;
      expect(html).not.toContain("alert(1)");
      expect(html).not.toContain("onerror=");
    });
  });

  describe('5. Realtime Channel Fallback bei CHANNEL_ERROR oder TIMED_OUT', () => {
    it('fällt automatisch auf private: false zurück und loggt Warnung, wenn subscribe fehlschlägt', async () => {
      const channelConfigs = [];
      let subscribeCallback = null;

      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn((cb) => {
          subscribeCallback = cb;
        }),
        track: vi.fn().mockResolvedValue({})
      };

      const mockSupa = {
        channel: vi.fn((name, opts) => {
          channelConfigs.push(opts?.config);
          return mockChannel;
        }),
        removeChannel: vi.fn()
      };

      globalThis.FlowAuth = {
        isLoggedIn: () => true,
        getUser: () => ({ id: 'usr_test_1', email: 'test@example.com' }),
        getSupabaseClient: () => mockSupa
      };

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      CollabEngine.init();

      expect(channelConfigs.length).toBe(1);
      expect(channelConfigs[0].private).toBe(true);

      // Simuliere CHANNEL_ERROR
      subscribeCallback('CHANNEL_ERROR');

      expect(channelConfigs.length).toBe(2);
      expect(channelConfigs[1].private).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Private Realtime-Channel Fehler'));

      warnSpy.mockRestore();
    });
  });
});

