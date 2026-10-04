import fs from 'fs';
import path from 'path';

const files = fs.readdirSync('.').filter(f => f.endsWith('.js') || f.endsWith('.css') || f.endsWith('.html'));

const patterns = [
    'showPanelHover',
    'hidePanelHover',
    'hoverTimeout',
    'tippy',
    'tooltip',
    'mouseenter',
    'pointerenter',
    'setTimeout',
    'transition-delay',
    'delay-'
];

for (const f of files) {
    if (f.startsWith('scratch_') || f.startsWith('dist')) continue;
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
        for (const p of patterns) {
            if (line.includes(p)) {
                if (p === 'setTimeout' && !line.includes('hover') && !line.includes('panel') && !line.includes('popup') && !line.includes('tip') && !line.includes('menu')) continue;
                console.log(`[${f}:${idx + 1}] (${p}) ${line.trim().substring(0, 140)}`);
                break;
            }
        }
    });
}
