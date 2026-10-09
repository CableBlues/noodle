const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /<button[^>]*class="[^"]*tool-orb[^"]*"[^>]*>([\s\S]*?)<\/button>/g;
let m;
const list = [];
while ((m = regex.exec(html)) !== null) {
  const full = m[0];
  const title = (full.match(/title="([^"]+)"/) || [])[1] || '';
  const orbClass = (full.match(/tool-orb-([a-z0-9\-]+)/) || [])[0] || '';
  const label = (full.match(/<span[^>]*class="[^"]*tool-orb-label[^"]*"[^>]*>([^<]+)<\/span>/) || [])[1] || '';
  const colorMatch = full.match(/from-([a-z]+-[0-9]+)\/([0-9]+)\s+to-([a-z]+-[0-9]+)\/([0-9]+)/);
  const borderMatch = full.match(/border-([a-z]+-[0-9]+)/);
  const textMatch = full.match(/text-([a-z]+-[0-9]+)/);
  list.push({
    title,
    orbClass,
    label,
    from: colorMatch ? colorMatch[1] : '',
    to: colorMatch ? colorMatch[3] : '',
    border: borderMatch ? borderMatch[1] : '',
    textColor: textMatch ? textMatch[1] : ''
  });
}

fs.writeFileSync('scripts/all_tool_orbs.json', JSON.stringify(list, null, 2), 'utf8');
console.log(`Found ${list.length} tool orbs in index.html.`);
list.forEach((t, i) => console.log(`${i+1}. [${t.orbClass}] label: "${t.label}" title: "${t.title}" | from: ${t.from} to: ${t.to}`));
