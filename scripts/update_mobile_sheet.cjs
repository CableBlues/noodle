const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Update Einkauf in mobile-tools-sheet to Lime
html = html.replace(
  `border border-emerald-500/20 rounded-2xl text-left hover:bg-emerald-500/10 active:scale-95 transition flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
            <i data-lucide="shopping-basket" class="w-4 h-4 text-emerald-300"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-emerald-300 leading-tight">Einkauf</div>
            <div class="text-[10px] text-emerald-300/70">Einkaufsliste & Deals</div>`,
  `border border-lime-500/30 rounded-2xl text-left hover:bg-lime-500/10 active:scale-95 transition flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-300 shrink-0">
            <i data-lucide="shopping-basket" class="w-4 h-4 text-lime-300"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-lime-300 leading-tight">Einkauf</div>
            <div class="text-[10px] text-lime-300/70">Einkaufsliste & Deals</div>`
);

// Update Schwung-Impuls in mobile-tools-sheet to Fuchsia (no yellow repeat)
html = html.replace(
  `border border-yellow-500/20 rounded-2xl text-left hover:bg-yellow-500/10 active:scale-95 transition flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-300 shrink-0">
            <i data-lucide="zap" class="w-4 h-4 text-yellow-300"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-yellow-300 leading-tight">Schwung-Impuls</div>
            <div class="text-[10px] text-yellow-300/70">30s Überwindung</div>`,
  `border border-fuchsia-500/30 rounded-2xl text-left hover:bg-fuchsia-500/10 active:scale-95 transition flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-300 shrink-0">
            <i data-lucide="zap" class="w-4 h-4 text-fuchsia-300"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-fuchsia-300 leading-tight">Schwung-Impuls</div>
            <div class="text-[10px] text-fuchsia-300/70">30s Überwindung</div>`
);

// Update Brainstorming in mobile-tools-sheet to Amber
html = html.replace(
  `border border-orange-500/20 rounded-2xl text-left hover:bg-orange-500/10 active:scale-95 transition flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-300 shrink-0">
            <i data-lucide="brain" class="w-4 h-4 text-orange-300"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-orange-300 leading-tight">Brainstorming</div>
            <div class="text-[10px] text-orange-300/70">Ideen & Board-Transfer</div>`,
  `border border-amber-500/30 rounded-2xl text-left hover:bg-amber-500/10 active:scale-95 transition flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
            <i data-lucide="brain" class="w-4 h-4 text-amber-300"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-amber-300 leading-tight">Brainstorming</div>
            <div class="text-[10px] text-amber-300/70">Ideen & Board-Transfer</div>`
);

// Update Wissens-Labor in mobile-tools-sheet to Lime
html = html.replace(
  `border border-amber-500/20 rounded-2xl text-left hover:bg-amber-500/10 active:scale-95 transition flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
            <i data-lucide="graduation-cap" class="w-4 h-4 text-amber-300"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-amber-300 leading-tight">Wissens-Labor</div>
            <div class="text-[10px] text-amber-300/70">Quiz & Deep Learning</div>`,
  `border border-lime-500/30 rounded-2xl text-left hover:bg-lime-500/10 active:scale-95 transition flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-300 shrink-0">
            <i data-lucide="graduation-cap" class="w-4 h-4 text-lime-300"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-lime-300 leading-tight">Wissens-Labor</div>
            <div class="text-[10px] text-lime-300/70">Quiz & Deep Learning</div>`
);

// Update Innere Ruhe in mobile-tools-sheet to Cyan
html = html.replace(
  `border border-teal-500/30 rounded-2xl text-left hover:bg-teal-500/10 active:scale-95 transition flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0 shadow-sm">
            <i data-lucide="heart-pulse" class="w-4 h-4 text-teal-300"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-teal-300 leading-tight">Innere Ruhe</div>
            <div class="text-[10px] text-teal-300/80">Akut-Reset & Erdung</div>`,
  `border border-cyan-500/30 rounded-2xl text-left hover:bg-cyan-500/10 active:scale-95 transition flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 shadow-sm">
            <i data-lucide="heart-pulse" class="w-4 h-4 text-cyan-300"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-cyan-300 leading-tight">Innere Ruhe</div>
            <div class="text-[10px] text-cyan-300/80">Akut-Reset & Erdung</div>`
);

// Update Klarheit in mobile-tools-sheet to Purple
html = html.replace(
  `border border-indigo-500/20 rounded-2xl text-left hover:bg-indigo-500/10 active:scale-95 transition flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
            <i data-lucide="anchor" class="w-4 h-4 text-indigo-300"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-indigo-300 leading-tight" data-i18n="dock_clarity">Klarheit</div>
            <div class="text-[10px] text-indigo-300/70" data-i18n="clarity_subtitle">Impulskontrolle & Reflexion</div>`,
  `border border-purple-500/30 rounded-2xl text-left hover:bg-purple-500/10 active:scale-95 transition flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
            <i data-lucide="anchor" class="w-4 h-4 text-purple-300"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-purple-300 leading-tight" data-i18n="dock_clarity">Klarheit</div>
            <div class="text-[10px] text-purple-300/70" data-i18n="clarity_subtitle">Impulskontrolle & Reflexion</div>`
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated mobile-tools-sheet colors.');
