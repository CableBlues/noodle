const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const lines = html.split('\n');
let currentPanel = null;
const results = {};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const idMatch = line.match(/id=["'](panel-[^"']+|modal-[^"']+|helper-[^"']+|mobile-[^"']+)["']/);
  if (idMatch) {
    currentPanel = idMatch[1];
  }
  
  if (currentPanel) {
    const tagMatch = line.match(/<(span|h[1-6]|p|button|label|summary)[^>]*>([^<]{2,80})<\/\1>/);
    if (tagMatch) {
      const full = tagMatch[0];
      const text = tagMatch[2].trim();
      if (!full.includes('data-i18n') && text && !/^\d+[\.\w%]*$/.test(text) && !/^[✕✓★●▲▼►◄\s\-_0-9:\/\|]+$/.test(text) && !/^&[a-z]+;$/i.test(text)) {
        if (!results[currentPanel]) results[currentPanel] = [];
        results[currentPanel].push({ lineNum: i + 1, text, full });
      }
    }
  }
}

fs.writeFileSync('scripts/scan_results.json', JSON.stringify(results, null, 2), 'utf8');
console.log('Done scanning, wrote scripts/scan_results.json');
