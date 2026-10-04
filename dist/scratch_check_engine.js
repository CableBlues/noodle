import fs from 'fs';

const collabJs = fs.readFileSync('collab-engine.js', 'utf8');
console.log('collab-engine.js length:', collabJs.length);
console.log('Includes openWhatsApp:', collabJs.includes('openWhatsApp') || collabJs.includes('launchMessenger'));
const methods = collabJs.match(/[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{/g);
console.log('Some methods:', methods?.slice(0, 20));
