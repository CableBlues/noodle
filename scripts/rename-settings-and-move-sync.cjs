const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Rename the button in #panel-settings-dropdown
const oldBtnStr = '<span>Optionen & Einstellungen</span>';
const newBtnStr = '<span>Alle Einstellungen</span>';

if (!html.includes(oldBtnStr)) {
  console.error('Could not find oldBtnStr in index.html');
  process.exit(1);
}
html = html.replace(oldBtnStr, newBtnStr);
html = html.replace('title="Zentrales Optionsfenster öffnen"', 'title="Alle Einstellungen öffnen"');
console.log('✓ Renamed settings button to Alle Einstellungen');

// 2. Move #header-sync-btn before #manage-tables-wrapper
const syncBtnRegex = /<!-- SYNC BUTTON [^>]*-->\r?\n\s*<button id="header-sync-btn"[\s\S]*?<\/button>/;
const syncMatch = html.match(syncBtnRegex);
if (!syncMatch) {
  console.error('Could not find sync button');
  process.exit(1);
}
const syncBtnHtml = syncMatch[0].trim();

// Remove sync button from current position
html = html.replace(syncMatch[0], '');

// Insert sync button right before <div id="manage-tables-wrapper"
const targetPos = html.indexOf('<div id="manage-tables-wrapper"');
if (targetPos === -1) {
  console.error('Could not find manage-tables-wrapper');
  process.exit(1);
}

const isCrlf = html.includes('\r\n');
const nl = isCrlf ? '\r\n' : '\n';

html = html.substring(0, targetPos) + syncBtnHtml + nl + nl + '        ' + html.substring(targetPos);
console.log('✓ Moved header-sync-btn before manage-tables-wrapper');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html successfully updated!');
