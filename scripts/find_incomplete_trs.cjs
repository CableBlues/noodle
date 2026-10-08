const fs = require('fs');

const appTasks = fs.readFileSync('app-tasks.js', 'utf8');

// Match tr({ ... })
const regex = /tr\s*\(\s*\{([^}]+)\}\s*\)/g;
let match;
let count = 0;
const incompleteTrs = [];

while ((match = regex.exec(appTasks)) !== null) {
  count++;
  const body = match[1];
  const hasDe = body.includes('de:');
  const hasEn = body.includes('en:');
  const hasFr = body.includes('fr:');
  const hasIt = body.includes('it:');
  const hasEs = body.includes('es:');
  const hasEl = body.includes('el:');

  if (!hasEl || !hasFr || !hasIt || !hasEs) {
    incompleteTrs.push({
      full: match[0],
      index: match.index,
      missing: { fr: !hasFr, it: !hasIt, es: !hasEs, el: !hasEl },
      body: body.trim()
    });
  }
}

console.log(`Total tr() calls in app-tasks.js: ${count}`);
console.log(`Incomplete: ${incompleteTrs.length}`);
fs.writeFileSync('scripts/incomplete_trs.json', JSON.stringify(incompleteTrs, null, 2));
console.log('Saved to scripts/incomplete_trs.json');
