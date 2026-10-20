/**
 * @file tests/build-and-performance.test.js
 * @description
 * Verhaltens- und Regressionstests für Phase 3: Build & Performance:
 * 1. Vorkompiliertes Tailwind CSS statt Runtime-Evaluierung
 * 2. esbuild-Bundling & Minifizierung
 * 3. Lazy Loading von Übersetzungen und Sprachdaten
 * 4. Delta-Sync mit automatischem Full-Sync Fallback
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import '../storage.js';
import '../state.js';
import '../data-translations-1.js';
import '../data-translations-2.js';
import '../data-translations.js';
import '../sync-engine.js';

describe('Phase 3: Build & Performance Optimizations', () => {
  const rootDir = path.resolve(__dirname, '..');
  const distDir = path.join(rootDir, 'dist');

  describe('1. Vorkompiliertes Tailwind CSS', () => {
    it('styles-tailwind.css existiert im Root und dist/ und hat nicht-triviale Größe (> 100 KB)', () => {
      const rootCss = path.join(rootDir, 'styles-tailwind.css');
      expect(fs.existsSync(rootCss)).toBe(true);
      const statRoot = fs.statSync(rootCss);
      expect(statRoot.size).toBeGreaterThan(100 * 1024);

      const distCss = path.join(distDir, 'styles-tailwind.css');
      expect(fs.existsSync(distCss)).toBe(true);
      const statDist = fs.statSync(distCss);
      expect(statDist.size).toBeGreaterThan(100 * 1024);
    });

    it('index.html bindet styles-tailwind.css ein und lädt keine Runtime-Bibliothek vendor/tailwindcss.js', () => {
      const htmlPath = path.join(rootDir, 'index.html');
      const html = fs.readFileSync(htmlPath, 'utf8');

      expect(html).toContain('styles-tailwind.css');
      expect(html).not.toContain('<script src="vendor/tailwindcss.js"></script>');
      expect(html).not.toContain('tailwind.config = {');
    });
  });

  describe('2. esbuild Bundling & Minifizierung', () => {
    it('dist/app.bundle.js existiert und ist signifikant minifiziert (< 2.9 MB statt Baseline 3.24 MB)', () => {
      const bundlePath = path.join(distDir, 'app.bundle.js');
      expect(fs.existsSync(bundlePath)).toBe(true);

      const stat = fs.statSync(bundlePath);
      // Unter 2.9 MB belegt die minifizierte Produktions-Kompilierung
      expect(stat.size).toBeLessThan(2.9 * 1024 * 1024);
      expect(stat.size).toBeGreaterThan(1.5 * 1024 * 1024);
    });
  });

  describe('3. Lazy Loading von Sprachdaten (i18n)', () => {
    it('locales/ enthält valide JSON-Sprachpakete für de, en, fr, it, es, el mit > 500 Keys', () => {
      const localesDir = path.join(rootDir, 'locales');
      expect(fs.existsSync(localesDir)).toBe(true);

      const langs = ['de', 'en', 'fr', 'it', 'es', 'el'];
      langs.forEach(lang => {
        const filePath = path.join(localesDir, `${lang}.json`);
        expect(fs.existsSync(filePath), `Sprachdatei fehlt: ${lang}.json`).toBe(true);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        expect(Object.keys(data).length).toBeGreaterThan(500);
      });
    });

    it('loadLanguage() lädt Sprachpakete dynamisch nach und reichert TRANSLATIONS an', async () => {
      expect(typeof globalThis.loadLanguage).toBe('function');

      // Teste mit fr
      const frData = await globalThis.loadLanguage('fr');
      expect(frData).toBeDefined();
      expect(typeof frData).toBe('object');
      expect(globalThis.TRANSLATIONS['fr']).toBeDefined();
    });
  });

  describe('4. Delta-Sync mit automatischem Full-Sync-Fallback', () => {
    it('computeDelta() erkennt selektive Änderungen und gibt null zurück wenn unverändert', () => {
      const baseState = {
        updatedAt: '2026-10-20T00:00:00.000Z',
        items: {
          inbox: [{ id: '1', text: 'Task 1', created: 100 }]
        },
        done: [],
        _tombstones: {}
      };

      // Unverändert -> null (kein Datentransfer nötig)
      const noChangeDelta = cloudSyncEngine.computeDelta(baseState, baseState);
      expect(noChangeDelta).toBeNull();

      // Geändert -> Delta mit nur geänderten Kategorien
      const changedState = {
        updatedAt: '2026-10-20T00:01:00.000Z',
        items: {
          inbox: [
            { id: '1', text: 'Task 1', created: 100 },
            { id: '2', text: 'Task 2 (Neu)', created: 200 }
          ]
        },
        done: [],
        _tombstones: {}
      };

      const delta = cloudSyncEngine.computeDelta(changedState, baseState);
      expect(delta).not.toBeNull();
      expect(delta._isDelta).toBe(true);
      expect(delta.changes.items).toBeDefined();
      expect(delta.changes.items.inbox.length).toBe(2);
      expect(delta.changes.done).toBeUndefined(); // Done-Liste unverändert, nicht im Delta
    });

    it('applyDelta() wendet Delta selektiv auf den lokalen Zustand an', () => {
      const localState = {
        items: { inbox: [{ id: '1', text: 'Task 1' }] },
        done: [],
        _tombstones: {}
      };

      const delta = {
        _isDelta: true,
        updatedAt: '2026-10-20T01:00:00.000Z',
        changes: {
          items: {
            inbox: [{ id: '1', text: 'Task 1' }, { id: '2', text: 'Neuer Task' }]
          },
          done: [{ id: 'old_done', text: 'Erledigt' }]
        }
      };

      cloudSyncEngine.applyDelta(localState, delta);

      expect(localState.items.inbox.length).toBe(2);
      expect(localState.items.inbox[1].text).toBe('Neuer Task');
      expect(localState.done.length).toBe(1);
      expect(localState.updatedAt).toBe('2026-10-20T01:00:00.000Z');
    });

    it('pushDelta() fällt bei fehlendem Snapshot oder Fehler automatisch auf Full-Sync zurück', async () => {
      // Mock Supabase Client & FlowAuth
      const upsertSpy = vi.fn().mockResolvedValue({ error: null });
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          upsert: upsertSpy
        })
      };

      globalThis.FlowAuth = {
        isLoggedIn: () => true,
        getSyncToken: () => 'valid_token',
        getUser: () => ({ id: 'usr_test_123', isTokenOnly: false }),
        getSupabaseClient: () => mockSupabase
      };

      cloudSyncEngine.lastSyncedSnapshot = null; // Kein Snapshot vorliegend -> Erzwingt Full-Sync
      globalThis.state = {
        items: { inbox: [{ id: 'item_full_1', text: 'Full Item' }] },
        done: []
      };

      const result = await cloudSyncEngine.pushDelta();
      expect(result.success).toBe(true);
      expect(upsertSpy).toHaveBeenCalled();

      // Überprüfen, dass bei Full-Sync der volle Zustand übermittelt wurde (kein _isDelta)
      const lastPayload = upsertSpy.mock.calls[0][0].data;
      expect(lastPayload._isDelta).toBeUndefined();
      expect(lastPayload.items).toBeDefined();

      // Nach erfolgreichem Push ist lastSyncedSnapshot gesetzt
      expect(cloudSyncEngine.lastSyncedSnapshot).not.toBeNull();
    });
  });
});
