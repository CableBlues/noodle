import fs from 'fs';

const files = fs.readdirSync('.').filter(f => f.endsWith('.js') && !f.startsWith('scratch_') && !f.startsWith('dist'));

for (const f of files) {
    const c = fs.readFileSync(f, 'utf8');
    if (c.includes('openHeaderWorkspaceDropdown') || c.includes('cancelCloseHeaderWorkspaceDropdown')) {
        console.log(`Found in ${f}:`);
        c.split('\n').forEach((l, i) => {
            if (l.includes('openHeaderWorkspaceDropdown') || l.includes('cancelCloseHeaderWorkspaceDropdown') || l.includes('scheduleCloseHeaderWorkspaceDropdown')) {
                console.log(`  L${i+1}: ${l}`);
            }
        });
    }
}
