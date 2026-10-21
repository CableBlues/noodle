/**
 * @file data-translations.js
 * @module DataTranslationsAggregator
 * @description
 * Führt die Sprachpakete `TRANSLATIONS_PART1` (`en`, `de`, `fr`) und
 * `TRANSLATIONS_PART2` (`it`, `es`, `el`) im globalen Objekt `TRANSLATIONS` zusammen
 * und stellt eine asynchrone Lazy-Loading-Schnittstelle `loadLanguage(lang)` bereit.
 */

const TRANSLATIONS = Object.assign({},
  typeof TRANSLATIONS_PART1 !== 'undefined' ? TRANSLATIONS_PART1 : {},
  typeof TRANSLATIONS_PART2 !== 'undefined' ? TRANSLATIONS_PART2 : {}
);

/**
 * Lazy Loading für Sprachpakete aus `locales/<lang>.json`
 * @param {string} lang
 * @returns {Promise<object>}
 */
async function loadLanguage(lang) {
  if (!lang) return TRANSLATIONS['de'] || TRANSLATIONS['en'];
  // Wenn bereits vollständig im Speicher: sofort zurückgeben
  if (TRANSLATIONS[lang] && Object.keys(TRANSLATIONS[lang]).length > 20) {
    return TRANSLATIONS[lang];
  }

  try {
    if (typeof fetch === 'function') {
      const response = await fetch(`./locales/${lang}.json`);
      if (response.ok) {
        const data = await response.json();
        TRANSLATIONS[lang] = Object.assign(TRANSLATIONS[lang] || {}, data);
        return TRANSLATIONS[lang];
      }
    }
  } catch (err) {
    console.warn(`[I18N] Konnte Sprachpaket für '${lang}' nicht lazy laden:`, err);
  }

  return TRANSLATIONS[lang] || TRANSLATIONS['en'] || TRANSLATIONS['de'];
}

if (typeof window !== 'undefined') {
  window.TRANSLATIONS = TRANSLATIONS;
  window.loadLanguage = loadLanguage;
}
if (typeof globalThis !== 'undefined') {
  globalThis.TRANSLATIONS = TRANSLATIONS;
  globalThis.loadLanguage = loadLanguage;
}
