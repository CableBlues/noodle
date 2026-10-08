const fs = require('fs');

const incompleteList = JSON.parse(fs.readFileSync('scripts/incomplete_trs.json', 'utf8'));
const uniquePatterns = {};

incompleteList.forEach(item => {
  if (!uniquePatterns[item.full]) {
    uniquePatterns[item.full] = item;
  }
});

console.log('Unique incomplete patterns count:', Object.keys(uniquePatterns).length);
Object.keys(uniquePatterns).forEach((pat, i) => console.log(`${i+1}: ${pat}`));
