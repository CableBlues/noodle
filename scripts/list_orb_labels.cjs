const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const regex = /<span[^>]*class="[^"]*tool-orb-label[^"]*"[^>]*>([^<]+)<\/span>/g;
let m;
const labels = [];
while ((m = regex.exec(html)) !== null) {
  labels.push({ full: m[0], text: m[1].trim() });
}

console.log('Found orb labels count:', labels.length);
labels.forEach(l => console.log(l));
