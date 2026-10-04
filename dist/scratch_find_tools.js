import fs from 'fs';

const idx = fs.readFileSync('index.html', 'utf8');
const origHeader = fs.readFileSync('scratch_header_orig.html', 'utf8');

function findPanelTools(html) {
    const s = html.indexOf('id="panel-header-tools"');
    const e = html.indexOf('<!-- Quick Links Popover Panel -->', s);
    return { s, e, preview: html.substring(s, s + 300) };
}

console.log('idx panel tools:', findPanelTools(idx));
console.log('orig panel tools:', findPanelTools(origHeader));
