const fs = require('fs');

let alarm = fs.readFileSync('app-alarm.js', 'utf8');

// Replace rose tab styling with cyan/teal harmonized styling
alarm = alarm.replace(
  "currentAlarmTab === 'alarms' ? 'bg-rose-500 text-white font-bold shadow-[0_0_12px_rgba(244,63,94,0.35)] shadow-md' : 'text-gray-400 hover:text-white'} text-[11px]",
  "currentAlarmTab === 'alarms' ? 'bg-cyan-600 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)] shadow-md' : 'text-gray-400 hover:text-white'} text-[11px]"
);

alarm = alarm.replace(
  "currentAlarmTab === 'alarms' ? 'text-white' : 'text-rose-400'",
  "currentAlarmTab === 'alarms' ? 'text-white' : 'text-cyan-400'"
);

// Preset 07:30
alarm = alarm.replace(
  "bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-200",
  "bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200"
);

// Signal & Sound header
alarm = alarm.replace(
  "text-[9.5px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1",
  "text-[9.5px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1"
);

// Push button
alarm = alarm.replace(
  "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30",
  "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
);

// Test button
alarm = alarm.replace(
  "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-[9px] font-bold cursor-pointer transition flex items-center gap-1 shadow-sm",
  "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-[9px] font-bold cursor-pointer transition flex items-center gap-1 shadow-sm"
);

// Volume label & slider & checkbox
alarm = alarm.replace(
  'text-[8.5px] font-mono font-bold text-rose-400',
  'text-[8.5px] font-mono font-bold text-cyan-300'
);
alarm = alarm.replace(
  'class="w-full accent-rose-500 cursor-pointer h-1 bg-white/10 rounded-lg"',
  'class="w-full accent-cyan-400 cursor-pointer h-1 bg-white/10 rounded-lg"'
);
alarm = alarm.replace(
  'class="w-3 h-3 accent-rose-500 rounded cursor-pointer"',
  'class="w-3 h-3 accent-cyan-400 rounded cursor-pointer"'
);

// New alarm inputs & button
alarm = alarm.replace(
  'focus:border-rose-500 font-semibold cursor-pointer',
  'focus:border-cyan-400 font-semibold cursor-pointer'
);
alarm = alarm.replace(
  'focus:border-rose-500 font-semibold placeholder:text-gray-500',
  'focus:border-cyan-400 font-semibold placeholder:text-gray-500'
);
alarm = alarm.replace(
  'class="px-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center shadow-sm"',
  'class="px-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center shadow-sm"'
);

// List items
alarm = alarm.replace(
  'hover:border-rose-500/30 transition',
  'hover:border-cyan-500/30 transition'
);
alarm = alarm.replace(
  'class="w-3.5 h-3.5 accent-rose-500 cursor-pointer rounded"',
  'class="w-3.5 h-3.5 accent-cyan-400 cursor-pointer rounded"'
);
alarm = alarm.replace(
  'text-gray-500 hover:text-rose-400 p-0.5 transition cursor-pointer',
  'text-gray-500 hover:text-cyan-300 p-0.5 transition cursor-pointer'
);

// Active modal popup styling
alarm = alarm.replace(
  "const accentBorder = isRem ? 'border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.45)]' : 'border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.45)]';",
  "const accentBorder = isRem ? 'border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.45)]' : 'border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.45)]';"
);
alarm = alarm.replace(
  "const accentBadge = isRem ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40';",
  "const accentBadge = isRem ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';"
);
alarm = alarm.replace(
  "${isRem ? 'bg-amber-500/20' : 'bg-rose-500/20'} animate-ping pointer-events-none",
  "${isRem ? 'bg-amber-500/20' : 'bg-cyan-500/20'} animate-ping pointer-events-none"
);
alarm = alarm.replace(
  "<i data-lucide=\"${accentIcon}\" class=\"w-8 h-8 ${isRem ? 'text-amber-400' : 'text-rose-400'} animate-bounce\"></i>",
  "<i data-lucide=\"${accentIcon}\" class=\"w-8 h-8 ${isRem ? 'text-amber-400' : 'text-cyan-400'} animate-bounce\"></i>"
);
alarm = alarm.replace(
  "${isRem ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)]'}",
  "${isRem ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]'}"
);

fs.writeFileSync('app-alarm.js', alarm, 'utf8');
console.log('app-alarm.js successfully updated without red tones!');
