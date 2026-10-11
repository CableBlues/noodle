import fs from 'fs';

const cssFiles = fs.readdirSync('.').filter(f => f.endsWith('.css'));

for (const f of cssFiles) {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    lines.forEach((l, i) => {
        if (l.includes('transition') || l.includes('tooltip') || l.includes('hover') || l.includes('delay') || l.includes('pointer-events')) {
            console.log(`[${f}:${i+1}] ${l.trim().substring(0, 120)}`);
        }
    });
}
