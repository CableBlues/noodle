const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const lines = html.split('\n');
let inside = false;
let depth = 0;
const tools = [];
let currentSection = '';

for (let i = 120; i < 2200; i++) {
  const line = lines[i];
  if (line.includes('id="panel-header-tools"')) {
    inside = true;
  }
  if (!inside) continue;
  
  const secMatch = line.match(/<!--\s*([0-9]+\.\s*[^>]+?)\s*-->/);
  if (secMatch) {
    currentSection = secMatch[1].trim();
  }

  const orbMatch = line.match(/class="[^"]*tool-orb\s+([^"\s]+)/);
  const titleMatch = line.match(/title="([^"]+)"/);
  const sphereMatch = line.match(/tool-orb-sphere[^"]*bg-gradient-to-br\s+from-([^\s]+)\s+to-([^\s]+)[^"]*border-([^\s]+)[^"]*text-([^\s"]+)/);
  const labelMatch = line.match(/tool-orb-label[^"]*text-([^\s"]+)[^>]*>([^<]+)</);

  if (orbMatch || titleMatch) {
    tools.push({
      line: i + 1,
      section: currentSection,
      orbClass: orbMatch ? orbMatch[1] : '',
      title: titleMatch ? titleMatch[1] : '',
      from: sphereMatch ? sphereMatch[1] : '',
      to: sphereMatch ? sphereMatch[2] : '',
      border: sphereMatch ? sphereMatch[3] : '',
      text: sphereMatch ? sphereMatch[4] : '',
      labelText: labelMatch ? labelMatch[2] : '',
      labelColor: labelMatch ? labelMatch[1] : ''
    });
  }

  if (line.includes('<!-- END TOOLS POPOVER') || line.includes('id="panel-news"')) {
    break;
  }
}

fs.writeFileSync('scripts/tools_detailed.json', JSON.stringify(tools, null, 2), 'utf8');
console.log(`Found ${tools.length} tool entries.`);
