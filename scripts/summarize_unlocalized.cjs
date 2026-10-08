const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scripts/scan_results.json', 'utf8'));

const summary = {};
for (const [panel, items] of Object.entries(data)) {
  const lettersOnly = items.filter(it => /[a-zA-ZäöüÄÖÜß]/.test(it.text));
  if (lettersOnly.length > 0) {
    summary[panel] = lettersOnly;
  }
}

fs.writeFileSync('scripts/unlocalized_summary.json', JSON.stringify(summary, null, 2), 'utf8');
console.log('Panels requiring attention:', Object.keys(summary).length);
for (const p of Object.keys(summary)) {
  console.log(`- ${p}: ${summary[p].length} items`);
}
