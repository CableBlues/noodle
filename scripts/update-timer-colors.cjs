const fs = require('fs');

// 1. Update timer-3.js: replace brown / amber classes with modern palette and subtle neon accents (cyan, neon blue, violet)
let t3 = fs.readFileSync('timer-3.js', 'utf8');

// Section 5: Fokus-Ziel & Stoppuhr
t3 = t3.replace(
  'p-2 rounded-2xl bg-amber-950/20 border border-amber-500/30 shadow-inner flex flex-col gap-1.5',
  'p-2.5 rounded-2xl bg-gradient-to-br from-indigo-950/30 via-[#0e101a] to-cyan-950/20 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex flex-col gap-1.5'
);

t3 = t3.replace(
  '<span class="text-[10.5px] font-bold text-amber-300 font-display flex items-center gap-1.5">\n          <i data-lucide="target" class="w-3.5 h-3.5 text-amber-400"></i>',
  '<span class="text-[10.5px] font-bold text-cyan-200 font-display flex items-center gap-1.5">\n          <i data-lucide="target" class="w-3.5 h-3.5 text-cyan-400"></i>'
);

// Linked task badge and container
t3 = t3.replace(
  'bg-amber-500/20 text-amber-300 font-mono font-bold">Verknüpft</span>',
  'bg-cyan-500/20 text-cyan-300 font-mono font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]">Verknüpft</span>'
);

t3 = t3.replace(
  'p-1.5 bg-amber-500/15 border border-amber-500/35 rounded-xl text-[11px] text-amber-100 min-w-0 shadow-inner',
  'p-2 bg-cyan-950/30 border border-cyan-500/35 rounded-xl text-[11px] text-cyan-100 min-w-0 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
);

t3 = t3.replace(
  'hover:border-amber-400/40 rounded-xl text-[10.5px] text-gray-200',
  'hover:border-cyan-400/50 focus:border-cyan-400 rounded-xl text-[10.5px] text-gray-200'
);

t3 = t3.replace(
  'class="bg-[#161522] text-amber-300 font-bold"',
  'class="bg-[#161522] text-cyan-300 font-bold"'
);

// Motivation button in voice section
t3 = t3.replace(
  'bg-amber-500/20 border-amber-400/50 text-amber-200 shadow-xs\' : \'bg-black/40 border-white/10 text-gray-300 hover:text-white hover:bg-amber-950/20',
  'bg-violet-500/20 border-violet-400/50 text-violet-200 shadow-[0_0_10px_rgba(167,139,250,0.25)]\' : \'bg-black/40 border-white/10 text-gray-300 hover:text-white hover:bg-violet-950/20'
);

t3 = t3.replace(
  'bg-amber-500/30 text-amber-200\' : \'bg-white/10 text-gray-400',
  'bg-violet-500/30 text-violet-200\' : \'bg-white/10 text-gray-400'
);

fs.writeFileSync('timer-3.js', t3, 'utf8');
console.log('timer-3.js updated!');

// 2. Update app-tasks.js: timer submenu neon styling
let at = fs.readFileSync('app-tasks.js', 'utf8');
at = at.replace(
  'text-amber-300 hover:text-amber-200 transition cursor-pointer text-left font-medium" title="Fokus-Timer für diese Aufgabe starten">\n      <i data-lucide="timer" class="w-3.5 h-3.5 text-amber-400"></i>',
  'text-cyan-300 hover:text-cyan-200 transition cursor-pointer text-left font-medium" title="Fokus-Timer für diese Aufgabe starten">\n      <i data-lucide="timer" class="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]"></i>'
);

at = at.replace(
  '<div class="timer-submenu hidden absolute right-0 mt-1 w-[120px] bg-[#141422]/95 border border-white/20 rounded-lg shadow-lg z-10">\n      <button onclick="startTaskTimerByIndex(\'${colId}\', ${index}, event, 5); closeTaskOptionsMenu();" class="block w-full text-left px-2 py-1 text-sm text-amber-200 hover:bg-white/10">5 min</button>\n      <button onclick="startTaskTimerByIndex(\'${colId}\', ${index}, event, 10); closeTaskOptionsMenu();" class="block w-full text-left px-2 py-1 text-sm text-amber-200 hover:bg-white/10">10 min</button>\n      <button onclick="startTaskTimerByIndex(\'${colId}\', ${index}, event, 15); closeTaskOptionsMenu();" class="block w-full text-left px-2 py-1 text-sm text-amber-200 hover:bg-white/10">15 min</button>\n    </div>',
  '<div class="timer-submenu hidden absolute right-0 mt-1 w-[120px] bg-[#10101c] border border-cyan-500/30 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_12px_rgba(6,182,212,0.2)] z-10 p-1">\n      <button onclick="startTaskTimerByIndex(\'${colId}\', ${index}, event, 5); closeTaskOptionsMenu();" class="block w-full text-left px-2.5 py-1 text-xs rounded-lg text-cyan-200 hover:bg-cyan-500/20 hover:text-white transition cursor-pointer">5 min</button>\n      <button onclick="startTaskTimerByIndex(\'${colId}\', ${index}, event, 10); closeTaskOptionsMenu();" class="block w-full text-left px-2.5 py-1 text-xs rounded-lg text-cyan-200 hover:bg-cyan-500/20 hover:text-white transition cursor-pointer">10 min</button>\n      <button onclick="startTaskTimerByIndex(\'${colId}\', ${index}, event, 15); closeTaskOptionsMenu();" class="block w-full text-left px-2.5 py-1 text-xs rounded-lg text-cyan-200 hover:bg-cyan-500/20 hover:text-white transition cursor-pointer">15 min</button>\n    </div>'
);

fs.writeFileSync('app-tasks.js', at, 'utf8');
console.log('app-tasks.js updated!');
