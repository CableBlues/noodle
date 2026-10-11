import fs from 'fs';

const files = fs.readdirSync('.').filter(f => f.endsWith('.js') && !f.startsWith('scratch_') && !f.startsWith('dist'));

for (const f of files) {
    const c = fs.readFileSync(f, 'utf8');
    if (c.includes('discounts.php') || c.includes('music/list.php') || c.includes('music/manifest.json')) {
        console.log(`Found fetch targets in: ${f}`);
        c.split('\n').forEach((l, i) => {
            if (l.includes('discounts.php') || l.includes('music/list.php') || l.includes('music/manifest.json')) {
                console.log(`  L${i+1}: ${l.trim()}`);
            }
        });
    }
}
