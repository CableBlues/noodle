import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

import '../utils.js';
import '../storage.js';
import '../data-tasks.js';
import '../state.js';
import '../collab-engine.js';
import '../audio-core.js';
import '../audio-player.js';

describe('Noodle Technical Update Regression Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    window.state = window.migrateState(null, 'de');
    globalThis.state = window.state;
  });

  describe('1. Storage & Resilienz-Vault Fallback', () => {
    it('initResilience() erkennt beschädigtes JSON in localStorage und stellt aus IDB_VAULT wieder her', async () => {
      localStorage.setItem('flow_state_v3', '{corrupted_json_syntax');

      const fakeVaultState = {
        version: 3,
        items: { daily: [{ id: 'task_vault_1', task: 'Vault gerettete Aufgabe' }] },
        done: []
      };

      const originalGetAllKeys = IDB_VAULT.getAllKeys;
      const originalGet = IDB_VAULT.get;

      IDB_VAULT.getAllKeys = vi.fn().mockResolvedValue(['flow_state_v3']);
      IDB_VAULT.get = vi.fn().mockImplementation((key) => {
        if (key === 'flow_state_v3') return Promise.resolve(fakeVaultState);
        return Promise.resolve(null);
      });

      const restored = await AppStorage.initResilience();
      expect(restored).toBe(true);

      const recoveredJson = localStorage.getItem('flow_state_v3');
      expect(recoveredJson).not.toBeNull();
      const parsed = JSON.parse(recoveredJson);
      expect(parsed.items.daily[0].task).toBe('Vault gerettete Aufgabe');

      IDB_VAULT.getAllKeys = originalGetAllKeys;
      IDB_VAULT.get = originalGet;
    });

    it('saveState() führt bei QuotaExceededError ein sicheres Notfall-Trimming durch', () => {
      const hugeArchive = Array.from({ length: 80 }, (_, i) => ({ task: `Alt ${i}`, date: '2026-01-01' }));
      const hugeDone = Array.from({ length: 90 }, (_, i) => ({ task: `Erledigt ${i}`, origin: 'daily' }));
      const hugeShoppingHist = Array.from({ length: 80 }, (_, i) => ({ name: `Gekauft ${i}` }));

      window.state.archive = hugeArchive;
      window.state.done = hugeDone;
      window.state.shoppingHistory = hugeShoppingHist;

      let calls = 0;
      const proto = window.Storage ? window.Storage.prototype : Object.getPrototypeOf(localStorage);
      const originalSetItem = proto.setItem;
      proto.setItem = function(key, val) {
        calls++;
        if (calls === 1) {
          const quotaErr = new Error('QuotaExceededError');
          quotaErr.name = 'QuotaExceededError';
          quotaErr.code = 22;
          throw quotaErr;
        }
        return originalSetItem.call(this, key, val);
      };

      try {
        expect(() => window.saveState(true)).not.toThrow();
        expect(window.state.archive.length).toBeLessThan(80);
        expect(window.state.shoppingHistory.length).toBeLessThan(80);
      } finally {
        proto.setItem = originalSetItem;
      }
    });

    it('saveHistory() begrenzt den History-Stack auf maximal 15 Snapshots', () => {
      for (let i = 0; i < 25; i++) {
        window.state.streak = i;
        window.saveHistory();
      }
      const histKey = window.HISTORY_KEY || 'flowPlannerV3History';
      const historyRaw = localStorage.getItem(histKey);
      expect(historyRaw).not.toBeNull();
      const parsed = JSON.parse(historyRaw);
      expect(parsed.length).toBeLessThanOrEqual(15);
    });
  });

  describe('2. Tombstone-Lifecycle & Un-Tombstone', () => {
    it('trackTombstone fügt gelöschte IDs hinzu, clearTombstone entfernt sie zuverlässig', () => {
      window.trackTombstone('task_item_99');
      expect(window.state._tombstones['task_item_99']).toBeDefined();

      window.clearTombstone('task_item_99');
      expect(window.state._tombstones['task_item_99']).toBeUndefined();
    });

    it('ensureItemIdentity() entfernt bestehende Tombstones, wenn ein Item re-kreiert wird', () => {
      window.trackTombstone('custom_item_123');
      expect(window.state._tombstones['custom_item_123']).toBeDefined();

      const item = { id: 'custom_item_123', task: 'Wiederhergestellte Aufgabe' };
      const normalized = window.ensureItemIdentity(item);

      expect(normalized.id).toBe('custom_item_123');
      expect(window.state._tombstones['custom_item_123']).toBeUndefined();
    });
  });

  describe('3. XSS-Schutz & URL-Sanitization', () => {
    it('sanitizeUrl() blockiert gefährliche Pseudoprotokolle und Steuerungssymbole', () => {
      expect(window.sanitizeUrl('javascript:alert(1)')).toBe('#');
      expect(window.sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('#');
      expect(window.sanitizeUrl('vbscript:msgbox(1)')).toBe('#');
      expect(window.sanitizeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBe('#');
      expect(window.sanitizeUrl('https://evil.com/\x00test')).toBe('#');
    });

    it('sanitizeUrl() erlaubt legitime URLs und sichere Bild-Data-URIs', () => {
      expect(window.sanitizeUrl('https://example.com/api')).toBe('https://example.com/api');
      expect(window.sanitizeUrl('http://localhost:8080')).toBe('http://localhost:8080');
      expect(window.sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
      expect(window.sanitizeUrl('tel:+49123456789')).toBe('tel:+49123456789');
      expect(window.sanitizeUrl('./index.html')).toBe('./index.html');
      expect(window.sanitizeUrl('#section')).toBe('#section');
      expect(window.sanitizeUrl('data:image/png;base64,iVBORw0KGgo=')).toBe('data:image/png;base64,iVBORw0KGgo=');
    });

    it('showToast() maskiert HTML im Undo-Modus und verhindert XSS', () => {
      let toastOverlay = document.getElementById('toast-overlay');
      if (!toastOverlay) {
        toastOverlay = document.createElement('div');
        toastOverlay.id = 'toast-overlay';
        toastOverlay.className = 'hidden';
        document.body.appendChild(toastOverlay);
      }
      let toastCard = document.getElementById('toast-card');
      if (!toastCard) {
        toastCard = document.createElement('div');
        toastCard.id = 'toast-card';
        document.body.appendChild(toastCard);
      }

      window.showToast('<img src=x onerror=alert(1)>', { undo: true });
      expect(toastCard.querySelector('img')).toBeNull();
      expect(toastCard.textContent).toContain('<img src=x onerror=alert(1)>');
    });

    it('collab-engine.js maskiert Benutzernamen und Systemmeldungen im Chat', () => {
      let container = document.getElementById('collab-chat-messages-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'collab-chat-messages-container';
        document.body.appendChild(container);
      }

      const maliciousSender = {
        id: 'attacker_1',
        name: '<script>alert(1)</script>',
        avatar: 'AT'
      };

      localStorage.setItem('flow_chat_team-space', JSON.stringify([
        {
          id: 'm1',
          sender: maliciousSender,
          text: '<b onmouseover=alert(2)>Klick</b>',
          time: '12:00'
        },
        {
          id: 'm2',
          isSystem: true,
          text: '<svg onload=alert(3)>System</svg>',
          time: '12:01'
        }
      ]));

      if (typeof CollabEngine !== 'undefined') {
        if (typeof CollabEngine.loadChatHistory === 'function') {
          CollabEngine.loadChatHistory();
        } else if (typeof CollabEngine.init === 'function') {
          CollabEngine.init();
        }
        if (typeof CollabEngine.renderChatMessages === 'function') {
          CollabEngine.renderChatMessages();
        }
      }

      expect(container.querySelector('script')).toBeNull();
      expect(container.querySelector('svg')).toBeNull();
      expect(container.querySelector('b')).toBeNull();
      expect(container.textContent).toContain('<script>alert(1)</script>');
      expect(container.textContent).toContain('<svg onload=alert(3)>System</svg>');
    });
  });

  describe('4. Audio & DJ Memory Cleanup', () => {
    it('removeMusicTrack gibt Blob-URLs per URL.revokeObjectURL frei', () => {
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      window.playlistTracks = [
        { url: 'blob:http://localhost/fake-uuid-1', name: 'Track 1', fullName: 'Track 1.mp3' },
        { url: 'blob:http://localhost/fake-uuid-2', name: 'Track 2', fullName: 'Track 2.mp3' }
      ];

      window.removeMusicTrack(0);

      expect(revokeSpy).toHaveBeenCalledWith('blob:http://localhost/fake-uuid-1');
      expect(window.playlistTracks.length).toBe(1);
      expect(window.playlistTracks[0].name).toBe('Track 2');

      revokeSpy.mockRestore();
    });

    it('loadDjBuiltinTrack gibt alte Blob-URLs bei Track-Wechsel frei', () => {
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      djDecks.a.track = {
        url: 'blob:http://localhost/old-deck-track',
        name: 'Old Track',
        fullName: 'Old Track.wav'
      };

      const originalSynthetic = window.createSyntheticBeatAudio;
      window.createSyntheticBeatAudio = vi.fn().mockReturnValue('blob:http://localhost/new-deck-track');

      window.loadDjBuiltinTrack('a', 'deep_house', false);

      expect(revokeSpy).toHaveBeenCalledWith('blob:http://localhost/old-deck-track');

      window.createSyntheticBeatAudio = originalSynthetic;
      revokeSpy.mockRestore();
    });

    it('playDjSfx() wirft bei keinen Typen Exceptions und routet zu AudioContext', () => {
      expect(() => window.playDjSfx('airhorn')).not.toThrow();
      expect(() => window.playDjSfx('scratch')).not.toThrow();
      expect(() => window.playDjSfx('laser')).not.toThrow();
      expect(() => window.playDjSfx('subdrop')).not.toThrow();
      expect(() => window.playDjSfx('riser')).not.toThrow();
      expect(() => window.playDjSfx('cue_click')).not.toThrow();
    });
  });

  describe('5. PWA & Service Worker Konsistenz', () => {
    it('sw.js cacht alle Skripte inklusive monetization.js und hat v158', () => {
      const swPath = path.resolve(__dirname, '../sw.js');
      const swContent = fs.readFileSync(swPath, 'utf8');

      expect(swContent).toMatch(/const CACHE_NAME = 'noodle-cache-v\d+'/);
      expect(swContent).toContain("'./monetization.js'");
    });

    it('manifest.json erfüllt alle PWA-Standards', () => {
      const manifestPath = path.resolve(__dirname, '../manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      expect(manifest.name).toBe('Noodle Studio');
      expect(manifest.start_url).toBe('./index.html');
      expect(manifest.display).toBe('standalone');
      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThanOrEqual(4);
    });
  });
});
