import fs from 'fs';

const files = fs.readdirSync('.').filter(f => f.endsWith('.js') && !f.startsWith('scratch_') && !f.startsWith('dist'));

const targetFns = [
    'showPanelHover',
    'hidePanelHover',
    'showSoundHoverSlider',
    'hideSoundHoverSlider',
    'openTaskOptionsMenu',
    'scheduleCloseTaskMenu',
    'cancelCloseTaskMenu',
    'openColumnOptionsMenu',
    'scheduleCloseColumnOptionsMenu',
    'cancelCloseColumnOptionsMenu',
    'openColumnsDropdown',
    'scheduleCloseColumnsDropdown',
    'cancelCloseColumnsDropdown'
];

for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    for (const fn of targetFns) {
        if (content.includes(`function ${fn}`) || content.includes(`${fn} =`) || content.includes(`${fn}(`)) {
            const lines = content.split('\n');
            lines.forEach((l, i) => {
                if (l.includes(`function ${fn}`) || l.includes(`window.${fn} =`) || l.includes(`const ${fn} =`)) {
                    console.log(`FOUND ${fn} in ${f}:${i + 1}`);
                    console.log(lines.slice(i, i + 25).join('\n'));
                    console.log('-----------------------------------');
                }
            });
        }
    }
}
