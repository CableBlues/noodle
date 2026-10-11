/**
 * @file data-translations.js
 * @module DataTranslationsAggregator
 * @description
 * Führt die Sprachpakete `TRANSLATIONS_PART1` (`en`, `de`, `fr`) und
 * `TRANSLATIONS_PART2` (`it`, `es`, `el`) im globalen Objekt `TRANSLATIONS` zusammen.
 */

const TRANSLATIONS = Object.assign({},
  typeof TRANSLATIONS_PART1 !== 'undefined' ? TRANSLATIONS_PART1 : {},
  typeof TRANSLATIONS_PART2 !== 'undefined' ? TRANSLATIONS_PART2 : {}
);

if (typeof window !== 'undefined') window.TRANSLATIONS = TRANSLATIONS;
if (typeof globalThis !== 'undefined') globalThis.TRANSLATIONS = TRANSLATIONS;
