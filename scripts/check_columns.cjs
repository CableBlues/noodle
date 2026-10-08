const fs = require('fs');

global.window = {};
eval(fs.readFileSync('data-translations-1.js', 'utf8'));
eval(fs.readFileSync('data-translations-2.js', 'utf8'));
eval(fs.readFileSync('data-translations.js', 'utf8'));
eval(fs.readFileSync('data-custom-translations.js', 'utf8'));

const idList = [
  'daily', 'weekly', 'todo', 'occasionally', 
  'work_focus', 'work_in_progress', 'work_backlog', 'work_waiting', 
  'study_focus', 'study_modules', 'study_submissions', 'study_deep', 
  'done', 'termine', 'notes'
];

const langs = ['en', 'de', 'fr', 'it', 'es', 'el'];

for (const id of idList) {
  const row = { id };
  for (const l of langs) {
    row[l] = (window.TRANSLATIONS[l] && window.TRANSLATIONS[l][id]) || (customTranslations[l] && customTranslations[l][id]) || 'MISSING';
  }
  console.log(JSON.stringify(row));
}
