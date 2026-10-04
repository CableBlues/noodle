import fs from 'fs';

const files = fs.readdirSync('.').filter(f => f.endsWith('.js') && !f.startsWith('scratch_') && !f.startsWith('dist'));

for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes('showPanelHover') || content.includes('hidePanelHover') || f === 'app-tooltip.js') {
        console.log(`=== FILE: ${f} ===`);
        const lines = content.split('\n');
        lines.forEach((l, i) => {
            if (l.includes('showPanelHover') || l.includes('hidePanelHover') || l.includes('hoverTimeout') || l.includes('tooltip') || l.includes('tippy')) {
                console.log(`  L${i + 1}: ${l.trim().substring(0, 120)}`);
            }
        });
    }
}
