const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scripts/unlocalized_summary.json', 'utf8'));

let out = '';
for (const [panel, items] of Object.entries(data)) {
  out += `\n=== ${panel} (${items.length} items) ===\n`;
  items.forEach(it => {
    out += `  L${it.lineNum}: ${it.text}\n`;
  });
}

fs.writeFileSync('scripts/panels_unlocalized.txt', out, 'utf8');
console.log('Wrote scripts/panels_unlocalized.txt');
