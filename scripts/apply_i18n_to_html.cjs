const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const mapping = JSON.parse(fs.readFileSync('scripts/translation_mapping.json', 'utf8'));

let replacements = 0;

mapping.forEach(({ text, key }) => {
  // We want to replace patterns like:
  // >text<
  // > text <
  // with >text< and add data-i18n="key" to the tag if not present
  // Also handle tags with icon: <span ...>text</span> or <button ...>text</button> or <p ...>text</p> or <option ...>text</option>
  
  // 1. Simple exact text in span/p/button/div/h3/h4/option:
  // e.g. <span>text</span> -> <span data-i18n="key">text</span>
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Regexp targeting <tag attr...>text</tag> where tag doesn't have data-i18n
  const tagRegex = new RegExp(`(<(span|button|p|h[1-6]|option|div|a)([^>]*?))(>\\s*${escaped}\\s*<\\/\\2>)`, 'g');
  
  html = html.replace(tagRegex, (match, openingStart, tagName, existingAttrs, contentClosing) => {
    if (existingAttrs.includes('data-i18n')) {
      return match;
    }
    replacements++;
    return `${openingStart} data-i18n="${key}"${contentClosing}`;
  });
});

fs.writeFileSync('index.html', html, 'utf8');
console.log(`Applied ${replacements} data-i18n attributes to index.html`);
