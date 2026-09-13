const TRANSLATIONS = Object.assign({},
  typeof TRANSLATIONS_PART1 !== 'undefined' ? TRANSLATIONS_PART1 : {},
  typeof TRANSLATIONS_PART2 !== 'undefined' ? TRANSLATIONS_PART2 : {}
);

if (typeof window !== 'undefined') window.TRANSLATIONS = TRANSLATIONS;
if (typeof globalThis !== 'undefined') globalThis.TRANSLATIONS = TRANSLATIONS;
