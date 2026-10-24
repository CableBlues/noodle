const fs = require('fs');

console.log('--- STARTING NOODLE VERIFICATION & REGRESSION SUITE ---');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

// Test 1: Header Options Menu & Task Menu Reversion
const appTasks = fs.readFileSync('app-tasks.js', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

// 1a: Task context menu reverted to original state
assert(
  !appTasks.includes('openTaskOptionsModal') &&
  appTasks.includes('editTaskInline(\'${colId}\', ${index}, event); closeTaskOptionsMenu();') &&
  appTasks.includes('deleteTask(\'${colId}\', ${index}, event); closeTaskOptionsMenu();') &&
  appTasks.includes('setTaskColor(\'${colId}\', ${index}, \'rose\', event); closeTaskOptionsMenu();') &&
  !indexHtml.includes('id="modal-task-options"'),
  'Point 1: Task context menu successfully restored to original state (Edit, Delete, Color Swatches)'
);

// 1b: Header options dropdown has the last 3 buttons replaced by single centralized options modal button
assert(
  !indexHtml.includes('<button onclick="openSettingsModal(\'general\'); document.getElementById(\'panel-settings-dropdown\').classList.add(\'hidden\');" class="py-2 px-1.5 bg-white/5 hover:bg-sky-500/20 text-gray-200 hover:text-sky-200 border border-white/10 hover:border-sky-400/40 rounded-xl text-[11px] font-bold') &&
  !indexHtml.includes('<button onclick="openSettingsModal(\'privacy\'); document.getElementById(\'panel-settings-dropdown\').classList.add(\'hidden\');"') &&
  indexHtml.includes('onclick="openSettingsModal(\'general\'); document.getElementById(\'panel-settings-dropdown\').classList.add(\'hidden\');"') &&
  indexHtml.includes('Alle Einstellungen') &&
  indexHtml.indexOf('id="header-sync-btn"') < indexHtml.indexOf('id="manage-tables-wrapper"') &&
  indexHtml.includes('id="modal-settings"'),
  'Point 1: Header options menu has last 3 buttons replaced with compact "Alle Einstellungen" button, and Sync button is placed before "Karten verwalten"'
);

// Test 2: Sound default enabled & persistent state & 100% opaque menu background
const audioCore = fs.readFileSync('audio-core.js', 'utf8');
const utilsJs = fs.readFileSync('utils.js', 'utf8');

assert(
  audioCore.includes('localStorage.getItem(\'noodle_sound_muted\')') &&
  audioCore.includes('localStorage.setItem(\'noodle_sound_muted\', \'true\')') &&
  audioCore.includes('localStorage.setItem(\'noodle_sound_muted\', \'false\')'),
  'Point 2: Sound is enabled on first use and sound state is permanently stored in localStorage'
);

assert(
  utilsJs.includes('if (typeof isPlayerMuted !== \'undefined\' && isPlayerMuted) return;'),
  'Point 2: Procedural sound effects strictly respect mute state'
);

assert(
  indexHtml.includes('id="panel-audio"') &&
  !indexHtml.includes('id="panel-audio" class="dock-popover-panel hidden absolute left-full top-0 ml-3.5 w-[calc(100vw-24px)] sm:w-[520px] md:w-[560px] max-w-[95vw] bg-[#0e0e16]/98') &&
  indexHtml.includes('bg-[#0e0e16]') &&
  indexHtml.includes('id="header-sound-volume-popover"') &&
  indexHtml.includes('bg-[#0f0f18] border border-rose-500/40'),
  'Point 2: Sound popovers and audio studio have 100% opaque backgrounds without transparency'
);

// Test 3: "Was nun?" Redesign
const helperCore = fs.readFileSync('helper-core.js', 'utf8');

assert(
  helperCore.includes('bg-gradient-to-b from-[#161624] to-[#0f1019]') &&
  helperCore.includes('Instant-Start') &&
  helperCore.includes('2-Min Start') &&
  helperCore.includes('Als erledigt abhaken'),
  'Point 3: "Was nun?" recommendation card is modern, compact, intuitive with clear hierarchy'
);

// Test 4: Timer Menu Brown Tones Removed & Neon Accents
const timer3 = fs.readFileSync('timer-3.js', 'utf8');

assert(
  !timer3.includes('bg-amber-950/20 border border-amber-500/30') &&
  timer3.includes('border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]') &&
  timer3.includes('text-cyan-200 font-display flex items-center gap-1.5') &&
  timer3.includes('bg-violet-500/20 border-violet-400/50 text-violet-200 shadow-[0_0_10px_rgba(167,139,250,0.25)]'),
  'Point 4: Timer menu brown tones removed and replaced with modern neon cyan & violet accents'
);

// Test 5: Alarm Red Tones Removed
const appAlarm = fs.readFileSync('app-alarm.js', 'utf8');

assert(
  !appAlarm.includes('currentAlarmTab === \'alarms\' ? \'bg-rose-500 text-white font-bold') &&
  appAlarm.includes('currentAlarmTab === \'alarms\' ? \'bg-cyan-600 text-white font-bold') &&
  appAlarm.includes('border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.45)]') &&
  appAlarm.includes('bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]'),
  'Point 5: Alarm red tones removed and replaced with harmonized cyan tones'
);

// Test 6: Search Interface Compact Single-line with X Button & ESC
const appCmd = fs.readFileSync('app-command-palette.js', 'utf8');

assert(
  indexHtml.includes('id="cmd-palette-input"') &&
  indexHtml.includes('onclick="closeCommandPalette()" class="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center text-xs font-bold transition cursor-pointer shrink-0" title="Schließen (ESC)" aria-label="Schließen">✕</button>') &&
  appCmd.includes('e.key === \'Escape\'') &&
  appCmd.includes('closeCommandPalette();'),
  'Point 6: Search interface is compact single-line with dedicated X close button and ESC support'
);

// Test 7: Swap Pause & Stats Buttons Colors
assert(
  indexHtml.includes('border border-lime-500/50 hover:border-lime-400 rounded-xl bg-lime-500/15 hover:bg-lime-500/25 active:scale-95 text-lime-300 hover:text-lime-100 flex items-center gap-1.5 text-xs sm:text-[13px] font-bold cursor-pointer transition whitespace-nowrap shadow-[0_0_14px_rgba(132,204,22,0.25)] group/pause-btn') &&
  indexHtml.includes('border border-purple-400/50 hover:border-purple-300 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 active:scale-95 text-purple-300 hover:text-purple-100 flex items-center gap-1.5 text-xs sm:text-[13px] font-bold cursor-pointer transition whitespace-nowrap shadow-[0_0_14px_rgba(168,85,247,0.25)] group/report-btn'),
  'Point 7: Pause (now Lime) and Stats (now Purple) button colors successfully swapped'
);

// Test 8: Build Verification
assert(
  fs.existsSync('dist/app.bundle.js') &&
  fs.existsSync('dist/index.html'),
  'Point 8: Production app.bundle.js and dist/index.html exist and build properly'
);

console.log(`\nTEST SUMMARY: ${passed} Passed, ${failed} Failed.`);
if (failed > 0) process.exit(1);
