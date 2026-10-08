const fs = require('fs');

const lines = fs.readFileSync('data-custom-translations.js', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (/^\s*"[a-z]{2}":\s*\{/.test(l)) {
    console.log(l.trim(), 'line:', i + 1);
  }
});
