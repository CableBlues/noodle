import fs from 'fs';

const files = fs.readdirSync('.').filter(f => f.endsWith('.css') || f.endsWith('.html'));

for (const f of files) {
    const c = fs.readFileSync(f, 'utf8');
    if (c.includes('noodle-custom-tooltip') || c.includes('noodle-global-tooltip')) {
        console.log(`Found in ${f}`);
        const lines = c.split('\n');
        lines.forEach((l, i) => {
            if (l.includes('noodle-custom-tooltip') || l.includes('noodle-global-tooltip')) {
                console.log(`  L${i+1}: ${l}`);
            }
        });
    }
}
