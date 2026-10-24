const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const targetSectionRegex = /<!-- SECTION 3: DIREKTZUGRIFF AUF ALLE EINSTELLUNGEN[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

const oldSection = `<!-- SECTION 3: DIREKTZUGRIFF AUF ALLE EINSTELLUNGEN (Klar, minimalistisch) -->
              <div class="pt-1.5 border-t border-white/10 space-y-1.5">
                <!-- Direkte Gerätekopplung (Einfach & Klar) -->
                <button onclick="openP2PSyncModal(); document.getElementById('panel-settings-dropdown').classList.add('hidden');" class="w-full py-2 px-3 bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 hover:text-white border border-teal-500/40 rounded-xl text-xs font-bold transition flex items-center justify-between gap-2 cursor-pointer shadow-sm active:scale-95 group">
                  <div class="flex items-center gap-2">
                    <i data-lucide="smartphone" class="w-4 h-4 text-teal-300"></i>
                    <span>Geräte koppeln & Sync</span>
                  </div>
                  <span class="text-[10px] font-mono text-teal-300/80 bg-teal-500/20 px-1.5 py-0.5 rounded-md">QR / Cloud</span>
                </button>

                <!-- Einstellungen direkt nach Bereichen (Verlauf entfernt) -->
                <button onclick="openSettingsModal('general'); document.getElementById('panel-settings-dropdown').classList.add('hidden');" class="w-full py-2.5 px-3 bg-gradient-to-r from-sky-500/20 via-purple-500/20 to-emerald-500/20 hover:from-sky-500/30 hover:via-purple-500/30 hover:to-emerald-500/30 text-white border border-white/15 hover:border-white/25 rounded-xl text-xs font-bold transition flex items-center justify-between gap-2 cursor-pointer shadow-sm active:scale-95 group" title="Alle Einstellungen öffnen">
                  <div class="flex items-center gap-2">
                    <i data-lucide="sliders" class="w-4 h-4 text-purple-300"></i>
                    <span>Alle Einstellungen</span>
                  </div>
                  <span class="text-[10px] font-mono text-purple-300/90 bg-purple-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span>Öffnen ↗</span>
                  </span>
                </button>

                <div id="options-logout-container" class="hidden pt-1 border-t border-white/10">
                  <button type="button" onclick="handleLogout(); document.getElementById('panel-settings-dropdown').classList.add('hidden');" class="w-full py-2 px-3 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-100 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95">
                    <i data-lucide="log-out" class="w-3.5 h-3.5 text-rose-400"></i>
                    <span>Konto abmelden / trennen 🚪</span>
                  </button>
                </div>
              </div>`;

const newSection = `<!-- SECTION 3: DIREKTZUGRIFF (Kompakt & Schlank) -->
              <div class="pt-1.5 border-t border-white/10">
                <div class="grid grid-cols-2 gap-1.5 pt-0.5">
                  <!-- 1. Geräte koppeln & Sync -->
                  <button onclick="openP2PSyncModal(); document.getElementById('panel-settings-dropdown').classList.add('hidden');" class="py-1.5 px-2 bg-teal-500/15 hover:bg-teal-500/25 text-teal-200 hover:text-white border border-teal-500/30 hover:border-teal-400/50 rounded-xl text-[11px] font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95" title="Geräte koppeln & Cloud-Sync">
                    <i data-lucide="smartphone" class="w-3.5 h-3.5 text-teal-300 shrink-0"></i>
                    <span class="truncate">Geräte & Sync</span>
                  </button>

                  <!-- 2. Alle Einstellungen -->
                  <button onclick="openSettingsModal('general'); document.getElementById('panel-settings-dropdown').classList.add('hidden');" class="py-1.5 px-2 bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 hover:text-white border border-purple-500/30 hover:border-purple-400/50 rounded-xl text-[11px] font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95" title="Alle Einstellungen öffnen">
                    <i data-lucide="sliders" class="w-3.5 h-3.5 text-purple-300 shrink-0"></i>
                    <span class="truncate">Alle Einstellungen</span>
                  </button>
                </div>

                <div id="options-logout-container" class="hidden pt-1 border-t border-white/10 mt-1.5">
                  <button type="button" onclick="handleLogout(); document.getElementById('panel-settings-dropdown').classList.add('hidden');" class="w-full py-1.5 px-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-100 border border-rose-500/30 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
                    <i data-lucide="log-out" class="w-3.5 h-3.5 text-rose-400"></i>
                    <span>Konto abmelden 🚪</span>
                  </button>
                </div>
              </div>`;

const normalize = s => s.replace(/\r\n/g, '\n').trim();
const isCrlf = html.includes('\r\n');

let normHtml = html.replace(/\r\n/g, '\n');
if (normHtml.includes(normalize(oldSection))) {
  normHtml = normHtml.replace(normalize(oldSection), normalize(newSection));
  console.log('✓ Section 3 in options dropdown made compact!');
} else {
  console.error('Could not find oldSection in index.html!');
  process.exit(1);
}

if (isCrlf) {
  normHtml = normHtml.replace(/\n/g, '\r\n');
}
fs.writeFileSync('index.html', normHtml, 'utf8');
console.log('index.html saved successfully.');
