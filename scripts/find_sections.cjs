const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Find all panels, modals, popovers
const lines = html.split('\n');
const targets = [];

lines.forEach((line, idx) => {
  if (line.includes('id="panel-') || line.includes('id="modal-') || line.includes('id="popover-') || line.includes('id="helper-')) {
    const match = line.match(/id="([^"]+)"/);
    if (match) {
      targets.push({ lineNum: idx + 1, id: match[1] });
    }
  }
});

console.log('Found ' + targets.length + ' panels/modals/helpers:');
targets.forEach(t => console.log('Line ' + t.lineNum + ': ' + t.id));
