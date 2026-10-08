const fs = require('fs');

global.window = {};
eval(fs.readFileSync('data-translations-1.js', 'utf8'));
eval(fs.readFileSync('data-translations-2.js', 'utf8'));
eval(fs.readFileSync('data-translations.js', 'utf8'));
eval(fs.readFileSync('data-custom-translations.js', 'utf8'));
const TRANSLATIONS = window.TRANSLATIONS;

const langs = ['en', 'de', 'fr', 'it', 'es', 'el'];

// 1. Inspect data-i18n in index.html
const html = fs.readFileSync('index.html', 'utf8');
const i18nRegex = /data-i18n="([^"]+)"/g;
const plRegex = /data-i18n-placeholder="([^"]+)"/g;
const titleRegex = /data-i18n-title="([^"]+)"/g;

const htmlKeys = new Set();
let m;
while ((m = i18nRegex.exec(html)) !== null) htmlKeys.add(m[1]);
while ((m = plRegex.exec(html)) !== null) htmlKeys.add(m[1]);
while ((m = titleRegex.exec(html)) !== null) htmlKeys.add(m[1]);

console.log('Total unique HTML i18n keys:', htmlKeys.size);

for (const l of langs) {
  const missing = [];
  for (const k of htmlKeys) {
    if (!TRANSLATIONS[l] || !TRANSLATIONS[l][k]) missing.push(k);
  }
  console.log(`Language [${l}] missing ${missing.length} keys from index.html:`, missing);
}
