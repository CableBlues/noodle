const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const panels = [
  'panel-shopping',
  'panel-cooking',
  'panel-news',
  'panel-sounds',
  'panel-audio',
  'panel-radio',
  'panel-health',
  'panel-humor-lab',
  'panel-social',
  'panel-collab-chat'
];

panels.forEach(p => {
  const idx = html.indexOf(`id="${p}"`);
  if (idx !== -1) {
    const chunk = html.substring(idx, idx + 800);
    const iconMatch = chunk.match(/<i\s+data-lucide=["']([^"']+)["'][^>]*>/);
    const badgeMatch = chunk.match(/badge-tool-subtext[^>]*>([^<]+)</);
    console.log(`${p}: icon = ${iconMatch ? iconMatch[1] : 'NONE'}, badge = ${badgeMatch ? badgeMatch[1] : 'NONE'}`);
  } else {
    console.log(`${p}: NOT FOUND`);
  }
});
