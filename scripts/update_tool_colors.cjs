const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Tool 1: Putz-Guide (Cyan / Sky)
// Old: from-teal-500/25 to-emerald-600/20 border border-teal-400/40 hover:border-teal-300 ... text-teal-300
html = html.replace(
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/25 to-emerald-600/20 border border-teal-400/40 hover:border-teal-300 flex items-center justify-center text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.15)] group-hover/orb:scale-105 transition-all duration-200">
                      <i data-lucide="sparkles" class="w-5 h-5 text-teal-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-teal-300 group-hover/orb:text-teal-200 transition-colors" data-i18n="clean_guide_title_short">Putz-Guide</span>`,
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/25 to-blue-600/20 border border-cyan-400/40 hover:border-cyan-300 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)] group-hover/orb:scale-105 transition-all duration-200">
                      <i data-lucide="sparkles" class="w-5 h-5 text-cyan-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-cyan-300 group-hover/orb:text-cyan-200 transition-colors" data-i18n="clean_guide_title_short">Putz-Guide</span>`
);

// 2. Tool 2: Einkauf (Lime - Farbe von Bewegung!)
// Old: from-emerald-500/25 to-teal-600/20 border border-emerald-400/40 hover:border-emerald-300 ... text-emerald-300
html = html.replace(
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-600/20 border border-emerald-400/40 hover:border-emerald-300 flex items-center justify-center text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)] group-hover/orb:scale-105 transition-all duration-200 relative">
                      <i data-lucide="shopping-cart" class="w-5 h-5 text-emerald-300"></i>
                      <span id="shop-badge-count" class="hidden px-1 py-0.2 rounded-full bg-emerald-500 text-white font-mono text-[8px] font-bold absolute -top-1 -right-1"></span>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-emerald-300 group-hover/orb:text-emerald-200 transition-colors" data-i18n="nav_shopping">Einkauf</span>`,
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-lime-500/25 to-emerald-600/20 border border-lime-400/40 hover:border-lime-300 flex items-center justify-center text-lime-300 shadow-[0_0_12px_rgba(132,204,22,0.15)] group-hover/orb:scale-105 transition-all duration-200 relative">
                      <i data-lucide="shopping-cart" class="w-5 h-5 text-lime-300"></i>
                      <span id="shop-badge-count" class="hidden px-1 py-0.2 rounded-full bg-lime-500 text-white font-mono text-[8px] font-bold absolute -top-1 -right-1"></span>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-lime-300 group-hover/orb:text-lime-200 transition-colors" data-i18n="nav_shopping">Einkauf</span>`
);

// 3. Tool 4: News (Fuchsia / Magenta)
html = html.replace(
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500/25 to-rose-600/20 border border-pink-400/40 hover:border-pink-300 flex items-center justify-center text-pink-300 shadow-[0_0_12px_rgba(244,63,94,0.15)] group-hover/orb:scale-105 transition-all duration-200">
                      <i data-lucide="newspaper" class="w-5 h-5 text-pink-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-pink-300 group-hover/orb:text-pink-200 transition-colors" data-i18n="tool_news">News</span>`,
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-fuchsia-500/25 to-rose-600/20 border border-fuchsia-400/40 hover:border-fuchsia-300 flex items-center justify-center text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.15)] group-hover/orb:scale-105 transition-all duration-200">
                      <i data-lucide="newspaper" class="w-5 h-5 text-fuchsia-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-fuchsia-300 group-hover/orb:text-fuchsia-200 transition-colors" data-i18n="tool_news">News</span>`
);

// 4. Tool 5: Sounds (Teal / Emerald)
html = html.replace(
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/25 to-purple-600/20 border border-cyan-400/40 hover:border-cyan-300 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)] group-hover/orb:scale-105 transition-all duration-200">
                      <i data-lucide="waves" class="w-5 h-5 text-cyan-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-cyan-300 group-hover/orb:text-cyan-200 transition-colors" data-i18n="tool_sounds">Sounds</span>`,
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/25 to-emerald-600/20 border border-teal-400/40 hover:border-teal-300 flex items-center justify-center text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.15)] group-hover/orb:scale-105 transition-all duration-200">
                      <i data-lucide="waves" class="w-5 h-5 text-teal-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-teal-300 group-hover/orb:text-teal-200 transition-colors" data-i18n="tool_sounds">Sounds</span>`
);

// 5. Tool 8: Radio (Violet / Purple)
html = html.replace(
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500/25 to-red-600/20 border border-rose-400/40 hover:border-rose-300 flex items-center justify-center text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.15)] group-hover/orb:scale-105 transition-all duration-200">
                      <i data-lucide="radio" class="w-5 h-5 text-rose-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-rose-300 group-hover/orb:text-rose-200 transition-colors" data-i18n="tool_radio">Radio</span>`,
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500/25 to-purple-600/20 border border-violet-400/40 hover:border-violet-300 flex items-center justify-center text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.15)] group-hover/orb:scale-105 transition-all duration-200">
                      <i data-lucide="radio" class="w-5 h-5 text-violet-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-violet-300 group-hover/orb:text-violet-200 transition-colors" data-i18n="tool_radio">Radio</span>`
);

// 6. Tool 11: Innere Ruhe (Cyan / Ocean)
html = html.replace(
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/25 to-emerald-600/20 border border-teal-400/40 hover:border-teal-300 flex items-center justify-center text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.15)] group-hover/orb:scale-105 transition-all duration-200">
                      <i data-lucide="heart-pulse" class="w-5 h-5 text-teal-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-teal-300 group-hover/orb:text-teal-200 transition-colors" data-i18n="tool_calm">Innere Ruhe</span>`,
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/25 to-blue-600/20 border border-cyan-400/40 hover:border-cyan-300 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)] group-hover/orb:scale-105 transition-all duration-200">
                      <i data-lucide="heart-pulse" class="w-5 h-5 text-cyan-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-cyan-300 group-hover/orb:text-cyan-200 transition-colors" data-i18n="tool_calm">Innere Ruhe</span>`
);

// 7. Tool 12: Klarheit (Purple / Indigo)
html = html.replace(
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/25 to-cyan-600/20 border border-indigo-400/40 hover:border-indigo-300 flex items-center justify-center text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)] group-hover/orb:scale-105 transition-all duration-200">
                      <i data-lucide="anchor" class="w-5 h-5 text-indigo-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-indigo-300 group-hover/orb:text-indigo-200 transition-colors" data-i18n="tool_clarity">Klarheit</span>`,
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/25 to-indigo-600/20 border border-purple-400/40 hover:border-purple-300 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)] group-hover/orb:scale-105 transition-all duration-200">
                      <i data-lucide="anchor" class="w-5 h-5 text-purple-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-purple-300 group-hover/orb:text-purple-200 transition-colors" data-i18n="tool_clarity">Klarheit</span>`
);

// 8. Tool 13: Lernen (Lime - Farbe von Bewegung!)
html = html.replace(
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/25 to-indigo-600/20 border border-blue-400/40 hover:border-blue-300 flex items-center justify-center text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.15)] group-hover/orb:scale-105 transition-all duration-200">
                      <i data-lucide="graduation-cap" class="w-5 h-5 text-blue-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-blue-300 group-hover/orb:text-blue-200 transition-colors" data-i18n="tool_learning">Lernen</span>`,
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-lime-500/25 to-emerald-600/20 border border-lime-400/40 hover:border-lime-300 flex items-center justify-center text-lime-300 shadow-[0_0_12px_rgba(132,204,22,0.15)] group-hover/orb:scale-105 transition-all duration-200">
                      <i data-lucide="graduation-cap" class="w-5 h-5 text-lime-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-lime-300 group-hover/orb:text-lime-200 transition-colors" data-i18n="tool_learning">Lernen</span>`
);

// 9. Tool 15: Social (Blue / Sky)
html = html.replace(
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500/25 to-rose-600/20 border border-pink-400/40 hover:border-pink-300 flex items-center justify-center text-pink-300 shadow-[0_0_12px_rgba(244,63,94,0.15)] group-hover/orb:scale-105 transition-all duration-200 relative">
                      <i data-lucide="share-2" class="w-5 h-5 text-pink-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-pink-300 group-hover/orb:text-pink-200 transition-colors" data-i18n="tool_social">Social</span>`,
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/25 to-sky-600/20 border border-blue-400/40 hover:border-blue-300 flex items-center justify-center text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.15)] group-hover/orb:scale-105 transition-all duration-200 relative">
                      <i data-lucide="share-2" class="w-5 h-5 text-blue-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-blue-300 group-hover/orb:text-blue-200 transition-colors" data-i18n="tool_social">Social</span>`
);

// 10. Tool 16: Chat (Amber / Gold)
html = html.replace(
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500/25 to-indigo-600/20 border border-violet-400/40 hover:border-violet-300 flex items-center justify-center text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.15)] group-hover/orb:scale-105 transition-all duration-200 relative">
                      <i data-lucide="message-square" class="w-5 h-5 text-violet-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-violet-300 group-hover/orb:text-violet-200 transition-colors" data-i18n="tool_chat">Chat</span>`,
  `<div class="tool-orb-sphere w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/25 to-orange-600/20 border border-amber-400/40 hover:border-amber-300 flex items-center justify-center text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)] group-hover/orb:scale-105 transition-all duration-200 relative">
                      <i data-lucide="message-square" class="w-5 h-5 text-amber-300"></i>
                    </div>
                    <span class="tool-orb-label text-[9.5px] font-bold text-amber-300 group-hover/orb:text-amber-200 transition-colors" data-i18n="tool_chat">Chat</span>`
);

// Mobile updates:
// In mobile-tools-sheet: Einkauf -> Lime, Wissens-Labor -> Lime
html = html.replace(
  `border border-emerald-500/20 rounded-2xl text-left hover:bg-emerald-500/10 active:scale-95 transition flex items-center gap-3">\n          <div class="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">\n            <i data-lucide="shopping-basket" class="w-4 h-4 text-emerald-300"></i>\n          </div>\n          <div>\n            <div class="text-xs font-bold text-emerald-300 leading-tight">Einkauf</div>\n            <div class="text-[10px] text-emerald-300/70">Einkaufsliste & Deals</div>`,
  `border border-lime-500/20 rounded-2xl text-left hover:bg-lime-500/10 active:scale-95 transition flex items-center gap-3">\n          <div class="w-9 h-9 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-300 shrink-0">\n            <i data-lucide="shopping-basket" class="w-4 h-4 text-lime-300"></i>\n          </div>\n          <div>\n            <div class="text-xs font-bold text-lime-300 leading-tight">Einkauf</div>\n            <div class="text-[10px] text-lime-300/70">Einkaufsliste & Deals</div>`
);

html = html.replace(
  `border border-amber-500/20 rounded-2xl text-left hover:bg-amber-500/10 active:scale-95 transition flex items-center gap-3">\n          <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">\n            <i data-lucide="graduation-cap" class="w-4 h-4 text-amber-300"></i>\n          </div>\n          <div>\n            <div class="text-xs font-bold text-amber-300 leading-tight">Wissens-Labor</div>\n            <div class="text-[10px] text-amber-300/70">Quiz & Deep Learning</div>`,
  `border border-lime-500/20 rounded-2xl text-left hover:bg-lime-500/10 active:scale-95 transition flex items-center gap-3">\n          <div class="w-9 h-9 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-300 shrink-0">\n            <i data-lucide="graduation-cap" class="w-4 h-4 text-lime-300"></i>\n          </div>\n          <div>\n            <div class="text-xs font-bold text-lime-300 leading-tight">Wissens-Labor</div>\n            <div class="text-[10px] text-lime-300/70">Quiz & Deep Learning</div>`
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated tool colors in index.html');
