import fs from 'fs';

const idx = fs.readFileSync('index.html', 'utf8');
const origHeader = fs.readFileSync('scratch_header_orig.html', 'utf8');

const getChatPanel = (str) => {
    const start = str.indexOf('id="panel-collab-chat"');
    if (start === -1) return 'NOT FOUND';
    return str.substring(start - 20, start + 3000);
};

console.log('--- CURRENT CHAT ---');
console.log(getChatPanel(idx));

console.log('--- ORIG CHAT ---');
console.log(getChatPanel(origHeader));
