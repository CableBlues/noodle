const fs = require('fs');

// Load index.html
const html = fs.readFileSync('index.html', 'utf8');
const htmlKeys = new Set();
const matches = html.matchAll(/data-i18n=["']([^"']+)["']/g);
for (const m of matches) htmlKeys.add(m[1]);
const phMatches = html.matchAll(/data-i18n-placeholder=["']([^"']+)["']/g);
for (const m of phMatches) htmlKeys.add(m[1]);
const titleMatches = html.matchAll(/data-i18n-title=["']([^"']+)["']/g);
for (const m of titleMatches) htmlKeys.add(m[1]);

console.log('Total unique data-i18n / placeholder / title keys in index.html:', htmlKeys.size);

// Load all translation files
const window = {};
global.window = window;
global.globalThis = window;

// Read data-translations-1.js and data-translations-2.js if present
const files = ['data-translations-1.js', 'data-translations-2.js', 'data-translations.js', 'data-custom-translations.js'];
for (const f of files) {
  if (fs.existsSync(f)) {
    const code = fs.readFileSync(f, 'utf8');
    try {
      eval(code);
    } catch (e) {
      console.error('Error evaluating', f, e.message);
    }
  }
}

const T = window.TRANSLATIONS || {};
const langs = ['de', 'en', 'fr', 'it', 'es', 'el'];

console.log('\n--- Status of HTML keys across 6 languages ---');
langs.forEach(lang => {
  const dict = T[lang] || {};
  let missing = 0;
  const missingKeys = [];
  htmlKeys.forEach(k => {
    if (!dict[k]) {
      missing++;
      missingKeys.push(k);
    }
  });
  console.log(`Language [${lang}]: total keys in dict = ${Object.keys(dict).length}, missing HTML keys = ${missing}`);
  if (missing > 0 && missing <= 20) {
    console.log(`  Missing: ${missingKeys.join(', ')}`);
  } else if (missing > 20) {
    console.log(`  Sample missing (first 10): ${missingKeys.slice(0, 10).join(', ')}`);
  }
});
