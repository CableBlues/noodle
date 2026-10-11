import fs from 'fs';

const idx = fs.readFileSync('index.html', 'utf8');
const s = idx.indexOf('id="collab-tab-messengers"');
if (s !== -1) {
    console.log(idx.substring(s, s + 1500));
} else {
    console.log('collab-tab-messengers not found');
}
