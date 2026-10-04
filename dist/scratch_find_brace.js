import fs from 'fs';

const code = fs.readFileSync('app-tasks.js', 'utf8');
const lines = code.split('\n');

let depth = 0;
const stack = [];

lines.forEach((line, i) => {
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '{') {
            depth++;
            stack.push({ line: i + 1, content: line.trim() });
        } else if (char === '}') {
            depth--;
            stack.pop();
        }
    }
});

console.log('Final depth:', depth);
if (depth > 0) {
    console.log('Unclosed braces opened at:');
    stack.forEach(s => console.log(`  L${s.line}: ${s.content.substring(0, 80)}`));
}
