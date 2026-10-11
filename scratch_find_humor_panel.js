import fs from 'fs';

const idx = fs.readFileSync('index.html', 'utf8');

const s = idx.indexOf('panel-humor-lab');
if (s !== -1) {
    console.log(idx.substring(s - 100, s + 600));
} else {
    console.log('panel-humor-lab not found');
}
