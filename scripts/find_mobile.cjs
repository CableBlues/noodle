const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

const mobileSections = [];
lines.forEach((l, idx) => {
  if (l.includes('id="mobile-') || l.includes('id="modal-mobile-') || l.includes('mobile-dock') || l.includes('mobile-nav') || l.includes('mobile-quick') || l.includes('mobile-tools') || l.includes('mobile-menu') || l.includes('mobile-bottom')) {
    mobileSections.push({ line: idx + 1, text: l.trim() });
  }
});
console.log('Mobile sections found:', mobileSections.length);
mobileSections.forEach(m => console.log('L' + m.line + ': ' + m.text));
