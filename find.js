import fs from 'fs';
const files = fs.readdirSync('.').filter(f => f.endsWith('.js') || f.endsWith('.html'));
files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  if (c.includes('togglePanel')) {
    const lines = c.split('\n');
    lines.forEach((l, i) => {
      if (l.includes('togglePanel =') || l.includes('function togglePanel') || l.includes('adjustPanelPosition')) {
        console.log(`${f}:${i+1}: ${l.trim()}`);
      }
    });
  }
});
