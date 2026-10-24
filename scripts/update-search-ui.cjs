const fs = require('fs');

// 1. Update index.html modal-command-palette
let html = fs.readFileSync('index.html', 'utf8');

const oldPalette = `      <!-- Search Input Bar -->
      <div class="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-black/40">
        <i data-lucide="search" class="w-5 h-5 text-purple-400 shrink-0"></i>
        <input type="text" id="cmd-palette-input" data-input="filterCommandPalette" data-input-args='["$value"]' data-keydown="handleCommandPaletteKeyDown" data-keydown-args='["$event"]' placeholder="Befehl eingeben oder Aufgaben suchen... (Strg+K)" data-i18n-placeholder="cmd_search_placeholder" class="w-full bg-transparent border-0 outline-none text-white text-sm placeholder:text-gray-500 font-medium" />
        <span class="px-2 py-0.5 rounded-lg bg-white/10 text-[10px] font-mono text-gray-400 shrink-0">ESC</span>
      </div>

      <!-- Results & Action List -->
      <div id="cmd-palette-results" class="p-2 space-y-1 overflow-y-auto max-h-[55vh] text-xs">
        <!-- Dynamically rendered commands and tasks -->
      </div>

      <!-- Footer Info -->
      <div class="px-4 py-2 border-t border-white/5 bg-black/60 flex items-center justify-between text-[10px] text-gray-400 font-mono">
        <span class="flex items-center gap-2">
          <span>↑↓ Navigieren</span>
          <span data-i18n="cmd_run">↵ Ausführen</span>
        </span>
        <span data-action="openKeyboardShortcuts" class="hover:text-purple-300 transition cursor-pointer" data-i18n="cmd_shortcuts_help">Tastaturkürzel (?)</span>
        <span>Noodle Spotlight ⌘K</span>
      </div>`;

const newPalette = `      <!-- Kompakte, minimalistische Einzeilen-Suche mit Schließen-Button (X) -->
      <div class="flex items-center gap-2 px-3 py-2.5 bg-[#12121c] border-b border-white/10">
        <i data-lucide="search" class="w-4 h-4 text-cyan-400 shrink-0 ml-1"></i>
        <input type="text" id="cmd-palette-input" data-input="filterCommandPalette" data-input-args='["$value"]' data-keydown="handleCommandPaletteKeyDown" data-keydown-args='["$event"]' placeholder="Suchen oder Befehl ausführen... (Strg+K)" data-i18n-placeholder="cmd_search_placeholder" class="flex-1 bg-transparent border-0 outline-none text-white text-xs placeholder:text-gray-500 font-medium" autofocus />
        <button onclick="closeCommandPalette()" class="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center text-xs font-bold transition cursor-pointer shrink-0" title="Schließen (ESC)" aria-label="Schließen">✕</button>
      </div>

      <!-- Results & Action List -->
      <div id="cmd-palette-results" class="p-2 space-y-1 overflow-y-auto max-h-[55vh] text-xs">
        <!-- Dynamically rendered commands and tasks -->
      </div>`;

if (html.includes(oldPalette)) {
  html = html.replace(oldPalette, newPalette);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('index.html search palette successfully modernized!');
} else {
  console.log('Searching pattern via replace for index.html...');
  html = html.replace(/<!-- Search Input Bar -->[\s\S]*?<!-- Footer Info -->[\s\S]*?<\/div>/, newPalette);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('index.html replaced via regex!');
}

// 2. Update app-command-palette.js
let cp = fs.readFileSync('app-command-palette.js', 'utf8');
const oldCardHtml = `        <!-- Input Header -->
        <div class="flex items-center gap-3 p-4 border-b border-white/10">
          <i data-lucide="search" class="w-5 h-5 text-purple-400 shrink-0"></i>
          <input type="text" id="command-palette-input" placeholder="Befehl oder Aufgabe suchen (z.B. Timer, Theme, Notiz)..." class="w-full bg-transparent text-sm text-white placeholder:text-gray-500 outline-none font-semibold" autocomplete="off" />
          <kbd class="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 rounded-lg">ESC</kbd>
        </div>

        <!-- Results List -->
        <div id="command-palette-results" class="max-h-[360px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between p-2.5 px-4 bg-white/[0.02] border-t border-white/5 text-[11px] text-gray-400 font-mono">
          <div class="flex items-center gap-2">
            <span>↑↓ Navigieren</span>
            <span>↵ Ausführen</span>
          </div>
          <span class="text-purple-300/80 font-bold">Noodle Palette</span>
        </div>`;

const newCardHtml = `        <!-- Kompakte, minimalistische Einzeilen-Suche mit Schließen-Button (X) -->
        <div class="flex items-center gap-2 px-3 py-2.5 bg-[#12121c] border-b border-white/10">
          <i data-lucide="search" class="w-4 h-4 text-cyan-400 shrink-0 ml-1"></i>
          <input type="text" id="command-palette-input" placeholder="Suchen oder Befehl ausführen... (Strg+K)" class="flex-1 bg-transparent text-xs text-white placeholder:text-gray-500 outline-none font-medium" autocomplete="off" />
          <button type="button" onclick="closeCommandPalette()" class="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center text-xs font-bold transition cursor-pointer shrink-0" title="Schließen (ESC)" aria-label="Schließen">✕</button>
        </div>

        <!-- Results List -->
        <div id="command-palette-results" class="max-h-[360px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
        </div>`;

if (cp.includes(oldCardHtml)) {
  cp = cp.replace(oldCardHtml, newCardHtml);
  fs.writeFileSync('app-command-palette.js', cp, 'utf8');
  console.log('app-command-palette.js successfully modernized!');
} else {
  console.log('Regex replacing app-command-palette.js...');
  cp = cp.replace(/<!-- Input Header -->[\s\S]*?<!-- Footer -->[\s\S]*?<\/div>/, newCardHtml);
  fs.writeFileSync('app-command-palette.js', cp, 'utf8');
  console.log('app-command-palette.js replaced via regex!');
}
