import fs from 'fs';

const idx = fs.readFileSync('index.html', 'utf8');
const origHeader = fs.readFileSync('scratch_header_orig.html', 'utf8');

function findClosingDiv(html, startIdx) {
    let depth = 0;
    let pos = startIdx;
    while (pos < html.length) {
        const nextOpen = html.indexOf('<div', pos);
        const nextClose = html.indexOf('</div>', pos);
        if (nextClose === -1) break;
        if (nextOpen !== -1 && nextOpen < nextClose) {
            depth++;
            pos = nextOpen + 4;
        } else {
            depth--;
            pos = nextClose + 6;
            if (depth === 0) {
                return pos;
            }
        }
    }
    return -1;
}

const origPanelToolsStart = origHeader.indexOf('id="panel-header-tools"');
const origPanelToolsDiv = origHeader.lastIndexOf('<div', origPanelToolsStart);
const origPanelToolsEnd = findClosingDiv(origHeader, origPanelToolsDiv);

const idxPanelToolsStart = idx.indexOf('id="panel-header-tools"');
const idxPanelToolsDiv = idx.lastIndexOf('<div', idxPanelToolsStart);
const idxPanelToolsEnd = findClosingDiv(idx, idxPanelToolsDiv);

console.log('Orig panel tools div bounds:', origPanelToolsDiv, origPanelToolsEnd);
console.log('Idx panel tools div bounds:', idxPanelToolsDiv, idxPanelToolsEnd);

// Replace origHeader's panel-header-tools with idx's panel-header-tools (which has the new chat tool!)
const finalHeader = origHeader.substring(0, origPanelToolsDiv) + 
                    idx.substring(idxPanelToolsDiv, idxPanelToolsEnd) + 
                    origHeader.substring(origPanelToolsEnd);

// Now replace <header> in idx with finalHeader
const idxHeaderStart = idx.indexOf('<header');
const idxHeaderEnd = idx.indexOf('</header>') + '</header>'.length;

const finalHtml = idx.substring(0, idxHeaderStart) + finalHeader + idx.substring(idxHeaderEnd);

fs.writeFileSync('index.html', finalHtml, 'utf8');
console.log('SUCCESSFULLY REPLACED HEADER IN index.html!');
