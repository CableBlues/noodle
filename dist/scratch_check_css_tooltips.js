import fs from 'fs';

const files = fs.readdirSync('.').filter(f => f.endsWith('.css'));

for (const f of files) {
    const c = fs.readFileSync(f, 'utf8');
    if (c.toLowerCase().includes('tooltip')) {
        console.log(`Tooltip in CSS file: ${f}`);
        c.split('\n').forEach((l, idx) => {
            if (l.toLowerCase().includes('tooltip')) {
                console.log(`  L${idx+1}: ${l}`);
            }
        });
    }
}
