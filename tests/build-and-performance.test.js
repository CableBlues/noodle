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

  describe('4. Build-Zuverlässigkeit & Artefakt-Validierung', () => {
    it('alle kritischen Build-Artefakte existieren in dist/ und haben nicht-triviale Größen', () => {
      const requiredArtifacts = [
        { path: path.join(distDir, 'index.html'), minSize: 1000 },
        { path: path.join(distDir, 'app.bundle.js'), minSize: 100 * 1024 },
        { path: path.join(distDir, 'sw.js'), minSize: 500 },
        { path: path.join(distDir, 'styles-tailwind.css'), minSize: 10 * 1024 },
        { path: path.join(distDir, 'manifest.json'), minSize: 100 }
      ];

      for (const artifact of requiredArtifacts) {
        expect(fs.existsSync(artifact.path), `Artefakt fehlt: ${artifact.path}`).toBe(true);
        const stat = fs.statSync(artifact.path);
        expect(stat.size).toBeGreaterThanOrEqual(artifact.minSize);
      }
    });

    it('dist/sw.js verweist auf gültige, im dist-Verzeichnis vorhandene Assets', () => {
      const swDistPath = path.join(distDir, 'sw.js');
      expect(fs.existsSync(swDistPath)).toBe(true);
      const swContent = fs.readFileSync(swDistPath, 'utf8');

      // Extrahiere gecachte Pfade
      const match = swContent.match(/const\s+ASSETS_TO_CACHE\s*=\s*\[([\s\S]*?)\];/);
      expect(match).not.toBeNull();
      const assets = match[1]
        .split('\n')
        .map(line => line.trim().replace(/^['"]|['"],?$/g, ''))
        .filter(Boolean);
      expect(assets.length).toBeGreaterThan(0);

      // Prüfe, dass Kern-Assets auf der Festplatte existieren
      const sampleAssets = assets.filter(a => !a.startsWith('http') && a !== './' && a !== '/');
      sampleAssets.slice(0, 10).forEach(asset => {
        const cleanAsset = asset.replace(/^\.\//, '');
        const targetPath = path.join(distDir, cleanAsset);
        expect(fs.existsSync(targetPath), `Asset aus sw.js fehlt im dist/: ${cleanAsset}`).toBe(true);
      });
    });
  });
});

