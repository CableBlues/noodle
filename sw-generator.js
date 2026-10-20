/**
 * @file sw-generator.js
 * @description
 * Automatische Erkennung und Generierung der PWA-Offline-Cache-Listen (ASSETS_TO_CACHE)
 * und Cache-Versionen für Noodle Studio (`sw.js` und `dist/sw.js`).
 *
 * Liest `index.html`, sammelt alle verlinkten Scripts, Stylesheets, Icons und Fonts,
 * berechnet einen deterministischen Inhalts-Hash als Cache-Version und aktualisiert
 * die Service-Worker-Dateien.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Extrahiert alle lokalen Assets aus dem HTML-Inhalt.
 * @param {string} htmlContent
 * @param {object} options
 * @returns {string[]}
 */
export function extractAssetsFromHtml(htmlContent, options = {}) {
  const baseDir = options.baseDir || process.cwd();

  const assets = new Set([
    './',
    './index.html',
    './manifest.json',
    './favicon.png',
    './favicon.svg',
    './icon-192.png',
    './icon-192.svg',
    './icon-512.png',
    './icon-512.svg',
    './logo-noodle.png',
    './logo-banner.png'
  ]);

  // Scripts extrahieren: <script src="...">
  const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = scriptRegex.exec(htmlContent)) !== null) {
    const src = match[1].trim();
    // Externe CDNs und Tracking-URLs ignorieren
    if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('//')) {
      const cleanSrc = src.split('?')[0];
      assets.add('./' + cleanSrc.replace(/^\.\//, ''));
    }
  }

  // Falls main.js referenziert ist oder existiert (und HTML nicht bereits das app.bundle.js lädt), darin importierte Module aufnehmen
  const isBundle = /src=["'][^"']*app\.bundle\.js["']/.test(htmlContent);
  const mainJsPath = path.join(baseDir, 'main.js');
  if (!isBundle && fs.existsSync(mainJsPath)) {
    try {
      const mainContent = fs.readFileSync(mainJsPath, 'utf8');
      const importRegex = /import\s+['"](\.\/[^'"]+)['"]/g;
      let impMatch;
      while ((impMatch = importRegex.exec(mainContent)) !== null) {
        assets.add(impMatch[1]);
      }
    } catch (e) {}
  }

  // Stylesheets extrahieren: <link rel="stylesheet" href="...">
  const linkRegex = /<link\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    const href = match[1].trim();
    if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('//') && !href.endsWith('.json')) {
      const cleanHref = href.split('?')[0];
      assets.add('./' + cleanHref.replace(/^\.\//, ''));
    }
  }

  // Alle lokalen Schriften aus dem fonts-Verzeichnis aufnehmen
  const fontsDir = path.join(baseDir, 'fonts');
  if (fs.existsSync(fontsDir)) {
    const fontFiles = fs.readdirSync(fontsDir);
    fontFiles.forEach(file => {
      if (/\.(ttf|woff|woff2|otf|eot)$/i.test(file)) {
        assets.add(`./fonts/${file}`);
      }
    });
  }

  // Filtern: Nur Assets behalten, die physisch existieren (oder './' bzw. './index.html')
  const validAssets = Array.from(assets).filter(asset => {
    if (asset === './') return true;
    const clean = asset.replace(/^\.\//, '');
    const fullPath = path.join(baseDir, clean);
    return fs.existsSync(fullPath);
  });

  // Sortierung: Standard-PWA zuerst, dann Fonts, CSS, Vendor, Module
  validAssets.sort((a, b) => {
    if (a === './') return -1;
    if (b === './') return 1;
    if (a === './index.html') return -1;
    if (b === './index.html') return 1;
    return a.localeCompare(b);
  });

  return validAssets;
}

/**
 * Erzeugt einen deterministischen Versionsstring basierend auf dem Inhalts-Hash aller Assets.
 * @param {string[]} assetList
 * @param {string} baseDir
 * @returns {string}
 */
export function generateCacheVersion(assetList, baseDir = process.cwd()) {
  const hash = crypto.createHash('sha256');
  assetList.forEach(asset => {
    if (asset === './') return;
    const clean = asset.replace(/^\.\//, '');
    const filePath = path.join(baseDir, clean);
    if (fs.existsSync(filePath)) {
      hash.update(fs.readFileSync(filePath));
    }
  });
  const shortHash = hash.digest('hex').slice(0, 8);
  const numericVersion = parseInt(shortHash, 16) || Date.now();
  return `noodle-cache-v${numericVersion}`;
}

/**
 * Aktualisiert eine bestehende Service-Worker-Datei mit der neuen Liste und Version.
 * @param {string} targetSwPath
 * @param {string[]} assetList
 * @param {string} cacheVersion
 */
export function updateServiceWorkerFile(targetSwPath, assetList, cacheVersion) {
  if (!fs.existsSync(targetSwPath)) {
    throw new Error(`Service Worker Datei nicht gefunden: ${targetSwPath}`);
  }

  let content = fs.readFileSync(targetSwPath, 'utf8');

  // Cache-Version ersetzen
  content = content.replace(
    /const\s+CACHE_NAME\s*=\s*['"][^'"]+['"];/,
    `const CACHE_NAME = '${cacheVersion}';`
  );

  // ASSETS_TO_CACHE ersetzen
  const assetsFormatted = `const ASSETS_TO_CACHE = [\n  ${assetList.map(a => `'${a}'`).join(',\n  ')}\n];`;
  content = content.replace(
    /const\s+ASSETS_TO_CACHE\s*=\s*\[[\s\S]*?\];/m,
    assetsFormatted
  );

  fs.writeFileSync(targetSwPath, content, 'utf8');
}
