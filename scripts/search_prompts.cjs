const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.js') || f.endsWith('.html'));

console.log('--- Review Prompts & Install Prompts ---');
let out = '';
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    if (/(daily.*review|review.*daily|checkdailyreview|promptinstall|beforeinstallprompt)/i.test(l) && !f.includes('bundle') && !f.includes('sw.js')) {
      out += `${f}:${i+1}: ${l.trim().substring(0, 120)}\n`;
    }
  });
});
fs.writeFileSync('scripts/prompts_found.txt', out, 'utf8');
console.log('Results written to scripts/prompts_found.txt');
