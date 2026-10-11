import fs from 'fs';

const files = fs.readdirSync('.').filter(f => f.endsWith('.js') || f.endsWith('.html'));

for (const f of files) {
    const c = fs.readFileSync(f, 'utf8');
    if (c.includes('HumorEngine')) {
        console.log(`HumorEngine used in ${f}`);
    }
}
