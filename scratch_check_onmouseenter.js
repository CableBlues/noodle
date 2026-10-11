import fs from 'fs';

const idx = fs.readFileSync('index.html', 'utf8');

const matches = idx.match(/onmouseenter="[^"]+"/g) || [];
const uniqueMatches = [...new Set(matches)];

console.log('Unique onmouseenter handlers in index.html:');
uniqueMatches.forEach(m => console.log(' -', m));
