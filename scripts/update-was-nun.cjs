const fs = require('fs');

// 1. Update helper-core.js: Was nun card layout
let hc = fs.readFileSync('helper-core.js', 'utf8');
const sToken = 'box.className = "p-5 rounded-2xl bg-[#14141e] border border-white/10 shadow-xl space-y-4 text-left transition-all duration-300";';
const eToken = 'if (typeof lucide !== \'undefined\' && lucide.createIcons) lucide.createIcons();';

const sPos = hc.indexOf(sToken);
const ePos = hc.indexOf(eToken, sPos);

if (sPos !== -1 && ePos !== -1) {
  const newCard = `box.className = "p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#161624] to-[#0f1019] border border-orange-500/25 shadow-xl space-y-3.5 text-left transition-all duration-300";
  box.innerHTML = \`
    <!-- Oberes Meta-Band: Kategorie, Dauer & Prioritaet dezent & harmonisch -->
    <div class="flex items-center justify-between gap-2 text-xs">
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="px-2.5 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-200 font-semibold text-[10.5px] uppercase tracking-wider font-mono">
          \${escapeHtml(catLabel)}
        </span>
        <span class="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-[10.5px] font-mono flex items-center gap-1">
          <i data-lucide="clock" class="w-3 h-3 text-orange-400"></i> ~\${chosen.estMinutes} Min
        </span>
      </div>
      <span class="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-medium font-mono shrink-0">
        \${escapeHtml(chosen.reasonLabel.replace(/[💡📌🔥🪜]/g, '').trim())}
      </span>
    </div>

    <!-- Hauptfokus-Aufgabe mit klarer visueller Hierarchie -->
    <div class="space-y-2">
      <h2 class="text-lg sm:text-xl font-display font-extrabold text-white leading-snug tracking-tight break-words">
        \${escapeHtml(chosen.task)}
      </h2>
      <div class="flex items-start gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-gray-300 font-medium">
        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0"></i>
        <span class="leading-relaxed"><strong class="text-orange-200 font-bold">Erster Schritt:</strong> \${escapeHtml(firstStep)}</span>
      </div>
    </div>

    \${stepsListHtml}

    <!-- Kompakte, moderne Aktionsleiste -->
    <div class="space-y-2 pt-1">
      <button onclick="startInstantGuidedFlow('\${safeTask}', '\${chosen.cat}', \${chosen.estMinutes})" class="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.3)] transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-2">
        <i data-lucide="zap" class="w-4 h-4 fill-black"></i>
        <span>Instant-Start (Fokus-Timer)</span>
      </button>

      <div class="grid grid-cols-2 gap-2">
        <button onclick="start2MinKickstart('\${safeTask}', '\${chosen.cat}')" class="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95" title="2-Minuten-Timer starten">
          <i data-lucide="timer" class="w-3.5 h-3.5 text-orange-400"></i>
          <span>2-Min Start</span>
        </button>

        <button onclick="completeWhatNowTask('\${chosen.cat}', \${chosen.idx})" class="py-2 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95" title="Als erledigt markieren">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          <span>Als erledigt abhaken</span>
        </button>
      </div>
    </div>
  \`;
  `;
  hc = hc.slice(0, sPos) + newCard + hc.slice(ePos);
  fs.writeFileSync('helper-core.js', hc, 'utf8');
  console.log('helper-core.js updated successfully!');
} else {
  console.error('helper-core.js tokens not found', sPos, ePos);
}
