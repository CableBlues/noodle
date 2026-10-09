const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Find all tool buttons in panel-header-tools
const headerToolsMatch = html.match(/<div id="panel-header-tools"[\s\S]*?(?=<\/div>\s*<\/div>\s*<!--)/);

console.log('--- Scanning panel-header-tools ---');
const regex = /<button[^>]*class="[^"]*tool-orb[^"]*"[^>]*>([\s\S]*?)<\/button>/g;
let m;
const tools = [];
if (headerToolsMatch) {
  while ((m = regex.exec(headerToolsMatch[0])) !== null) {
    const btn = m[0];
    const titleMatch = btn.match(/title="([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : 'Unknown';
    const bgMatch = btn.match(/bg-gradient-to-br\s+from-([^\s]+)\s+to-([^\s]+)/);
    const textMatch = btn.match(/text-([a-z]+-[0-9]+)/);
    const borderMatch = btn.match(/border-([a-z]+-[0-9]+)/);
    const iconMatch = btn.match(/data-lucide="([^"]+)"/);
    tools.push({
      title,
      from: bgMatch ? bgMatch[1] : '',
      to: bgMatch ? bgMatch[2] : '',
      text: textMatch ? textMatch[1] : '',
      border: borderMatch ? borderMatch[1] : '',
      icon: iconMatch ? iconMatch[1] : ''
    });
  }
}

fs.writeFileSync('scripts/tools_in_header.json', JSON.stringify(tools, null, 2), 'utf8');
console.log(`Found ${tools.length} tools in header tools panel.`);
