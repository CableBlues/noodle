const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Load customTranslations
const evalCode = fs.readFileSync('data-custom-translations.js', 'utf8').replace('if (typeof window.TRANSLATIONS === \'undefined\') { window.TRANSLATIONS = {}; }', 'const window = { TRANSLATIONS: {} };');
eval(evalCode);

// Extract all [data-i18n], [data-i18n-title], [data-i18n-placeholder] from index.html
const matchesI18n = (html.match(/data-i18n="([^"]+)"/g) || []).map(m => m.match(/data-i18n="([^"]+)"/)[1]);
const matchesTitle = (html.match(/data-i18n-title="([^"]+)"/g) || []).map(m => m.match(/data-i18n-title="([^"]+)"/)[1]);
const matchesPlaceholder = (html.match(/data-i18n-placeholder="([^"]+)"/g) || []).map(m => m.match(/data-i18n-placeholder="([^"]+)"/)[1]);

const allKeys = Array.from(new Set([...matchesI18n, ...matchesTitle, ...matchesPlaceholder]));
console.log('Total unique keys in HTML:', allKeys.length);

const missingInLangs = { en: [], de: [], fr: [], it: [], es: [], el: [] };

allKeys.forEach(k => {
  ['en', 'de', 'fr', 'it', 'es', 'el'].forEach(lang => {
    if (!customTranslations[lang] || !customTranslations[lang][k]) {
      missingInLangs[lang].push(k);
    }
  });
});

['en', 'de', 'fr', 'it', 'es', 'el'].forEach(lang => {
  console.log(`Missing in ${lang}: ${missingInLangs[lang].length}`);
  if (missingInLangs[lang].length > 0) {
    console.log(`  Samples:`, missingInLangs[lang].slice(0, 10));
  }
});
