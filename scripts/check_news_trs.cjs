const fs = require('fs');

const newsFile = fs.readFileSync('app-weather-news.js', 'utf8');
const regex = /tr\s*\(\s*\{([^}]+)\}\s*\)/g;
let match;
const incompleteNews = [];

while ((match = regex.exec(newsFile)) !== null) {
  const body = match[1];
  if (!body.includes('el:') || !body.includes('fr:') || !body.includes('it:') || !body.includes('es:')) {
    incompleteNews.push(match[0]);
  }
}

console.log('Incomplete in app-weather-news.js (' + incompleteNews.length + '):');
incompleteNews.forEach((m, i) => console.log(`${i+1}: ${m}`));
