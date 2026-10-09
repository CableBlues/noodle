const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const lines = html.split('\n');
const toolsPanelLines = [];
let capture = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('id="panel-header-tools"')) capture = true;
  if (capture) {
    if (lines[i].includes('<!-- 1.') || lines[i].includes('<!-- 2.') || lines[i].includes('<!-- 3.') || lines[i].includes('<!-- 4.') || lines[i].includes('tool-orb') || lines[i].includes('grid-cols')) {
      toolsPanelLines.push(`L${i+1}: ${lines[i].trim()}`);
    }
    if (lines[i].includes('<!-- END TOOLS POPOVER') || (lines[i].includes('id="panel-weather"') && i > 1500)) {
      break;
    }
  }
}

fs.writeFileSync('scripts/tools_panel_structure.txt', toolsPanelLines.join('\n'), 'utf8');
console.log(`Captured ${toolsPanelLines.length} structure lines.`);
