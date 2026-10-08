const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Find all elements with German words in visible text nodes or titles or placeholders
// Let's find all text nodes between tags > ... < that don't have data-i18n on their parent
const tagRegex = /<([a-zA-Z0-9\-]+)([^>]*)>([^<]+)<\/\1>/g;
let m;
const missingCandidates = [];
const germanWords = ['Aufgabe', 'Notiz', 'Termin', 'Alle', 'Löschen', 'Hinzufügen', 'Einkauf', 'Kochen', 'Gesundheit', 'Bewegung', 'Innere Ruhe', 'Klarheit', 'Wissen', 'Einstellungen', 'Spalten', 'Karten', 'Schließen', 'Abbrechen', 'Speichern', 'Bearbeiten', 'Fertig', 'Erledigt', 'Sprache', 'Design', 'Dunkel', 'Hell', 'Timer', 'Pause', 'Wetter', 'Suche', 'Filter'];

while ((m = tagRegex.exec(html)) !== null) {
  const tagName = m[1];
  const attrs = m[2];
  const text = m[3].trim();
  
  if (!text || text.length < 2 || text.startsWith('{') || text.startsWith('&') || /^[0-9:\-\+\.\s%]+$/.test(text)) continue;
  if (attrs.includes('data-i18n')) continue;
  
  // check if matches any German word
  for (const gw of germanWords) {
    if (text.includes(gw)) {
      missingCandidates.push({ tag: tagName, text, attrs: attrs.slice(0, 50) });
      break;
    }
  }
}

console.log('Total text elements with German without data-i18n:', missingCandidates.length);
missingCandidates.slice(0, 40).forEach(c => console.log(c.text, '-->', c.attrs));
