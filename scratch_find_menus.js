import fs from 'fs';

const tasksJs = fs.readFileSync('app-tasks.js', 'utf8');

function findFn(name) {
    const s = tasksJs.indexOf(`function ${name}`);
    if (s === -1) return `${name} not found`;
    return tasksJs.substring(s, s + 900);
}

console.log('--- openTaskOptionsMenu ---');
console.log(findFn('openTaskOptionsMenu'));
console.log('--- scheduleCloseTaskMenu ---');
console.log(findFn('scheduleCloseTaskMenu'));
console.log('--- openColumnOptionsMenu ---');
console.log(findFn('openColumnOptionsMenu'));
console.log('--- scheduleCloseColumnOptionsMenu ---');
console.log(findFn('scheduleCloseColumnOptionsMenu'));
