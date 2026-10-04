import fs from 'fs';

const idx = fs.readFileSync('index.html', 'utf8');
const origHeader = fs.readFileSync('scratch_header_orig.html', 'utf8');

// Extract updated panel-collab-chat from idx
const chatStartIdx = idx.indexOf('<div id="panel-collab-chat"');
if (chatStartIdx === -1) throw new Error("Could not find panel-collab-chat in idx");
// Find end of panel-collab-chat in idx
// Let's find where the chat panel ends before the next tool button or comment
const chatEndIdx = idx.indexOf('<!-- Quick Links Popover Panel -->', chatStartIdx);
if (chatEndIdx === -1) throw new Error("Could not find end of panel-collab-chat in idx");

const updatedChatMarkup = idx.substring(chatStartIdx, chatEndIdx);

// In origHeader, find the old panel-collab-chat
const origChatStart = origHeader.indexOf('<div id="panel-collab-chat"');
if (origChatStart === -1) throw new Error("Could not find panel-collab-chat in origHeader");
const origChatEnd = origHeader.indexOf('<!-- Quick Links Popover Panel -->', origChatStart);
if (origChatEnd === -1) throw new Error("Could not find end of panel-collab-chat in origHeader");

// Splice updated chat into origHeader
const finalHeader = origHeader.substring(0, origChatStart) + updatedChatMarkup + origHeader.substring(origChatEnd);

// Replace header in idx
const idxHeaderStart = idx.indexOf('<header');
const idxHeaderEnd = idx.indexOf('</header>') + '</header>'.length;

const finalHtml = idx.substring(0, idxHeaderStart) + finalHeader + idx.substring(idxHeaderEnd);

fs.writeFileSync('index.html', finalHtml, 'utf8');
console.log('Successfully updated index.html with restored header and modern chat panel!');
