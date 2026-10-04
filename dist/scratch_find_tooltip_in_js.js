import fs from 'fs';

const files = fs.readdirSync('.').filter(f => f.endsWith('.js'));

for (const f of files) {
    const c = fs.readFileSync(f, 'utf8');
    if (c.includes('noodle-custom-tooltip')) {
        console.log(`Found in JS: ${f}`);
    }
}
