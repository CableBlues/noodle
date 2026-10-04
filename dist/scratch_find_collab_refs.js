import fs from 'fs';

const c = fs.readFileSync('collab-engine.js', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
    if (l.includes('switchTab') || l.includes('whatsapp') || l.includes('WhatsApp') || l.includes('messenger') || l.includes('Messenger') || l.includes('signal') || l.includes('Signal')) {
        console.log(`L${i+1}: ${l}`);
    }
});
