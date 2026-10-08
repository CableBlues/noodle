const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

const germanRegex = /[äöüÄÖÜß]|(\b(und|oder|für|mit|von|auf|aus|bei|nach|über|unter|vor|zwischen|nicht|alle|neue|kein|keine|laden|speichern|abbrechen|löschen|schließen|hinzufügen|erstellen|auswählen|fertig|heute|woche|monat|zeit|tag|tage|jahr|jahre)\b)/i;

const suspicious = [];

lines.forEach((line, idx) => {
  // skip scripts, styles, comments
  if (line.includes('<script') || line.includes('<style') || line.includes('//') || line.includes('/*')) return;
  // Match text between > and <
  const textMatches = line.match(/>([^<]+)</g);
  if (textMatches) {
    textMatches.forEach(tm => {
      const text = tm.replace(/[><]/g, '').trim();
      if (text.length > 2 && germanRegex.test(text)) {
        // check if this line or tag has data-i18n
        if (!line.includes('data-i18n') && !line.includes('translate="no"')) {
          suspicious.push({ lineNum: idx + 1, text, line: line.trim() });
        }
      }
    });
  }
});

console.log('Found ' + suspicious.length + ' lines with German text without data-i18n:');
suspicious.slice(0, 35).forEach(s => console.log(`L${s.lineNum}: [${s.text}] -> ${s.line.substring(0, 80)}`));
fs.writeFileSync('scripts/suspicious_german_lines.json', JSON.stringify(suspicious, null, 2));
