const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
const start = lines.findIndex(l => l.includes('id="panel-header-tools"'));
console.log('Tools panel starts at line', start);

for (let i = start; i < Math.min(start + 1200, lines.length); i++) {
  const l = lines[i];
  if (l && (l.includes('tool-orb-label') || l.includes('title=') || l.includes('data-i18n') || l.includes('tools_section'))) {
    console.log(i + ': ' + l.trim());
  }
}
