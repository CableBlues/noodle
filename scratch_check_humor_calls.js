import fs from 'fs';

['app-reports.js', 'app-tasks.js'].forEach(f => {
    const c = fs.readFileSync(f, 'utf8');
    c.split('\n').forEach((l, i) => {
        if (l.includes('HumorEngine')) {
            console.log(`[${f}:${i+1}] ${l.trim()}`);
        }
    });
});
