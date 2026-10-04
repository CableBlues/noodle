import fs from 'fs';

const files = fs.readdirSync('.').filter(f => f.endsWith('.js') && !f.startsWith('scratch_') && !f.startsWith('dist'));

for (const f of files) {
    const c = fs.readFileSync(f, 'utf8');
    if (c.includes('toggleGravity') || c.includes('toggleJello') || c.includes('DJMixer') || c.includes('SoundFX') || c.includes('chaos')) {
        console.log(`Found references in: ${f}`);
    }
}
