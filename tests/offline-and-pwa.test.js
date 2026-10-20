import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Offline Capability & PWA Assets (Production Code)', () => {
  const rootDir = path.resolve(__dirname, '..');

  it('PWA Manifest is valid and defines standalone display and icon shortcuts', () => {
    const manifestPath = path.join(rootDir, 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.name).toBe('Noodle Studio');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  it('Root Service Worker sw.js: 100% of all ASSETS_TO_CACHE entries physically exist in root', () => {
    const swPath = path.join(rootDir, 'sw.js');
    expect(fs.existsSync(swPath)).toBe(true);

    const swContent = fs.readFileSync(swPath, 'utf8');
    const match = swContent.match(/const ASSETS_TO_CACHE = \[([\s\S]*?)\];/);
    expect(match).not.toBeNull();

    const assetStrings = match[1]
      .split('\n')
      .map(line => line.trim().replace(/^['"]|['"],?$/g, ''))
      .filter(line => line.length > 0 && line !== './');

    expect(assetStrings.length).toBeGreaterThan(30);

    assetStrings.forEach(assetPath => {
      const cleanPath = assetPath.replace(/^\.\//, '');
      const fullPath = path.join(rootDir, cleanPath);
      const exists = fs.existsSync(fullPath);
      expect(exists, `Datei fehlt im Quellverzeichnis für sw.js Cache: ${cleanPath}`).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size, `Datei ist leer: ${cleanPath}`).toBeGreaterThan(0);
    });
  });

  it('Production Release dist/sw.js: 100% of all ASSETS_TO_CACHE entries physically exist in dist/', () => {
    const distDir = path.join(rootDir, 'dist');
    const distSwPath = path.join(distDir, 'sw.js');
    expect(fs.existsSync(distSwPath)).toBe(true);

    const swContent = fs.readFileSync(distSwPath, 'utf8');
    const match = swContent.match(/const ASSETS_TO_CACHE = \[([\s\S]*?)\];/);
    expect(match).not.toBeNull();

    const assetStrings = match[1]
      .split('\n')
      .map(line => line.trim().replace(/^['"]|['"],?$/g, ''))
      .filter(line => line.length > 0 && line !== './');

    expect(assetStrings.length).toBeGreaterThan(20);

    assetStrings.forEach(assetPath => {
      const cleanPath = assetPath.replace(/^\.\//, '');
      const fullPath = path.join(distDir, cleanPath);
      const exists = fs.existsSync(fullPath);
      expect(exists, `Datei fehlt im dist/ Release für sw.js Cache: ${cleanPath}`).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size, `Datei ist leer: ${cleanPath}`).toBeGreaterThan(0);
    });
  });

  it('All local vendor files exist and have non-trivial size (> 1KB)', () => {
    const vendorFiles = [
      'tailwindcss.js',
      'lucide.min.js',
      'supabase.min.js',
      'qrcode.min.js',
      'html2canvas.min.js'
    ];

    vendorFiles.forEach(file => {
      const filePath = path.join(rootDir, 'vendor', file);
      expect(fs.existsSync(filePath)).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size).toBeGreaterThan(1024);
    });
  });

  it('All local font weight files exist and have non-trivial size (> 10KB)', () => {
    const fontFiles = [
      'plus-jakarta-sans-400.ttf',
      'plus-jakarta-sans-500.ttf',
      'plus-jakarta-sans-600.ttf',
      'plus-jakarta-sans-700.ttf',
      'space-grotesk-500.ttf',
      'space-grotesk-700.ttf',
      'caveat-400.ttf',
      'caveat-700.ttf',
      'playfair-display-400.ttf',
      'playfair-display-700.ttf'
    ];

    fontFiles.forEach(file => {
      const filePath = path.join(rootDir, 'fonts', file);
      expect(fs.existsSync(filePath)).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size).toBeGreaterThan(10240);
    });
  });

  it('Vollständigkeit: Alle in index.html referenzierten lokalen Skripte sind in sw.js ASSETS_TO_CACHE enthalten', () => {
    const htmlPath = path.join(rootDir, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const swPath = path.join(rootDir, 'sw.js');
    const swContent = fs.readFileSync(swPath, 'utf8');

    const requiredModules = [
      'app-health.js',
      'app-humor.js',
      'app-regulation.js',
      'app-feature-bridge.js',
      'app-installation-hub.js',
      'app-interaction-mode.js',
      'app-multitasking-hub.js',
      'app-routine-presets.js',
      'app-tooltip.js',
      'helper-ocr-scanner.js'
    ];

    // Prüfen, dass alle geforderten Module im Cache-Block vorkommen
    requiredModules.forEach(mod => {
      expect(swContent, `Fehlt in sw.js: ${mod}`).toContain(`'./${mod}'`);
    });

    // Prüfen, dass ausnahmslos jedes lokale Skript aus index.html gecacht wird
    const scriptMatches = [...htmlContent.matchAll(/<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi)];
    scriptMatches.forEach(match => {
      const src = match[1].trim();
      if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('//')) {
        const cleanSrc = src.split('?')[0].replace(/^\.\//, '');
        expect(swContent, `Lokales Skript ${cleanSrc} aus index.html fehlt in sw.js ASSETS_TO_CACHE`).toContain(`'./${cleanSrc}'`);
      }
    });
  });

  it('Update-Hinweis: index.html definiert das Banner #sw-update-banner mit Steuer-Buttons', () => {
    const htmlPath = path.join(rootDir, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const swPath = path.join(rootDir, 'sw.js');
    const swContent = fs.readFileSync(swPath, 'utf8');

    expect(htmlContent).toContain('id="sw-update-banner"');
    expect(htmlContent).toContain('id="sw-update-btn"');
    expect(htmlContent).toContain('id="sw-update-dismiss"');
    expect(htmlContent).toContain('Neue Version verfügbar');
    expect(htmlContent).toContain("action: 'skipWaiting'");
    expect(swContent).toContain("action === 'skipWaiting'");
  });

  it('Offline-Erststart: Simulierte Service Worker Cache-Befüllung und Offline-Fallback', async () => {
    const swPath = path.join(rootDir, 'sw.js');
    const swContent = fs.readFileSync(swPath, 'utf8');

    // Prüfen, ob Cache-Version deterministisch und gültig generiert ist
    const cacheMatch = swContent.match(/const\s+CACHE_NAME\s*=\s*'([^']+)'/);
    expect(cacheMatch).not.toBeNull();
    const cacheName = cacheMatch[1];
    expect(cacheName).toMatch(/^noodle-cache-v\d+$/);

    // Mock-Cache zur Simulation des Offline-Erststarts
    const mockStorage = new Map();
    const mockCache = {
      addAll: async (assets) => {
        for (const asset of assets) {
          if (asset === './') {
            mockStorage.set('./', 'INDEX_HTML_CONTENT');
          } else {
            const clean = asset.replace(/^\.\//, '');
            const fullPath = path.join(rootDir, clean);
            if (fs.existsSync(fullPath)) {
              mockStorage.set(asset, fs.readFileSync(fullPath, 'utf8'));
            } else {
              throw new Error(`Asset not found: ${asset}`);
            }
          }
        }
      },
      match: async (requestUrl) => {
        return mockStorage.get(requestUrl) || null;
      }
    };

    // Asset-Liste extrahieren
    const matchAssets = swContent.match(/const\s+ASSETS_TO_CACHE\s*=\s*\[([\s\S]*?)\];/);
    expect(matchAssets).not.toBeNull();
    const assets = matchAssets[1]
      .split('\n')
      .map(line => line.trim().replace(/^['"]|['"],?$/g, ''))
      .filter(line => line.length > 0);

    // 1. Erststart-Installation: Alle Assets erfolgreich gecacht
    await expect(mockCache.addAll(assets)).resolves.not.toThrow();
    expect(mockStorage.size).toBeGreaterThanOrEqual(assets.length);

    // 2. Offline-Zugriff auf App-Shell und Fachmodule
    expect(await mockCache.match('./')).toBeTruthy();
    expect(await mockCache.match('./index.html')).toBeTruthy();
    expect(await mockCache.match('./app-health.js')).toBeTruthy();
    expect(await mockCache.match('./helper-ocr-scanner.js')).toBeTruthy();
    expect(await mockCache.match('./fonts.css')).toBeTruthy();
  });
});

