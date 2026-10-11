import fs from 'fs';

const c = fs.readFileSync('app-tasks.js', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
    if (l.includes('closeTaskOptionsMenu')) {
        console.log(`L${i+1}: ${l}`);
    }
});
