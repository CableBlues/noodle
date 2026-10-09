const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('panel-header-tools') || l.includes('mobile-tools-sheet') || l.includes('mobile-view-tools')) {
    console.log(`L${i+1}: ${l.trim()}`);
  }
});
