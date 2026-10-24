const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. Fix state.js setWorkspace
const statePath = path.join(rootDir, 'state.js');
let stateCode = fs.readFileSync(statePath, 'utf8');
const eol = stateCode.includes('\r\n') ? '\r\n' : '\n';

stateCode = stateCode.replace(
  '  state.activeWorkspace = mode;' + eol + '  saveState();',
  '  if (typeof state !== "undefined" && state) state.activeWorkspace = mode;' + eol +
  '  if (typeof window !== "undefined" && window.state) window.state.activeWorkspace = mode;' + eol +
  '  saveState();'
);
fs.writeFileSync(statePath, stateCode, 'utf8');
console.log('Fixed setWorkspace in state.js');

// 2. Fix app-tasks.js deleteTask guards & moveTaskDOM export
const tasksPath = path.join(rootDir, 'app-tasks.js');
let tasksCode = fs.readFileSync(tasksPath, 'utf8');
const tasksEol = tasksCode.includes('\r\n') ? '\r\n' : '\n';

tasksCode = tasksCode.replace(
  '  showToast(toastMsg, { undo: true, duration: 5000 });' + tasksEol +
  '  renderApp();' + tasksEol +
  '  updateZenView();' + tasksEol +
  '  populateHelperTaskSelect();',
  '  if (typeof showToast === "function") showToast(toastMsg, { undo: true, duration: 5000 });' + tasksEol +
  '  if (typeof renderApp === "function") renderApp();' + tasksEol +
  '  if (typeof updateZenView === "function") updateZenView();' + tasksEol +
  '  if (typeof populateHelperTaskSelect === "function") populateHelperTaskSelect();'
);

if (!tasksCode.includes('window.moveTaskDOM = moveTaskDOM;')) {
  tasksCode = tasksCode.replace(
    'function moveTaskDOM(srcCat, srcIdx, targetCat, insertIdx) {',
    'if (typeof window !== "undefined") window.moveTaskDOM = moveTaskDOM;' + tasksEol +
    'if (typeof globalThis !== "undefined") globalThis.moveTaskDOM = moveTaskDOM;' + tasksEol + tasksEol +
    'function moveTaskDOM(srcCat, srcIdx, targetCat, insertIdx) {'
  );
}
fs.writeFileSync(tasksPath, tasksCode, 'utf8');
console.log('Fixed app-tasks.js guards and moveTaskDOM export');
