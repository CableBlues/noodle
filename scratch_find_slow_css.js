import fs from 'fs';

const css = fs.readFileSync('styles-animations.css', 'utf8');
const lines = css.split('\n');
lines.forEach((l, i) => {
    if ((l.includes('transition:') || l.includes('transition-duration')) && (l.includes('0.3') || l.includes('0.4') || l.includes('0.5') || l.includes('0.25') || l.includes('0.28'))) {
        console.log(`L${i+1}: ${l.trim()}`);
    }
});
