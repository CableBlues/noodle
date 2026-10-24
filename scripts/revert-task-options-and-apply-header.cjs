const fs = require('fs');

console.log('--- REVERTING TASK OPTIONS MENU & UPDATING HEADER OPTIONS MENU ---');

// 1. REVERT app-tasks.js
let appTasks = fs.readFileSync('app-tasks.js', 'utf8');

// Replace single option button in openTaskOptionsMenu with original Edit, Delete and Color Palette
const currentTaskMenuOption = `    <!-- Zentrales Optionsfenster -->
    <button onclick="openTaskOptionsModal('\${colId}', \${index}); closeTaskOptionsMenu();" class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-gray-200 hover:text-white transition cursor-pointer text-left font-medium" title="Optionen öffnen">
      <i data-lucide="settings" class="w-3.5 h-3.5 text-purple-400"></i>
      <span>\${tr({ de: 'Optionen', en: 'Options', fr: 'Options', it: 'Opzioni', es: 'Opciones', el: 'Επιλογές' })}</span>
    </button>`;

const originalTaskMenuOptions = `    <!-- Standard-Aktionen -->
    <button onclick="editTaskInline('\${colId}', \${index}, event); closeTaskOptionsMenu();" class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-gray-200 hover:text-white transition cursor-pointer text-left font-medium">
      <i data-lucide="edit-3" class="w-3.5 h-3.5 text-purple-400"></i>
      <span>\${tr({ de: 'Bearbeiten', en: 'Edit', fr: 'Modifier', it: 'Modifica', es: 'Editar', el: 'Επεξεργασία' })}</span>
    </button>
    <button onclick="deleteTask('\${colId}', \${index}, event); closeTaskOptionsMenu();" class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-red-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer text-left font-medium">
      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
      <span>\${tr({ de: 'Löschen', en: 'Delete', fr: 'Supprimer', it: 'Elimina', es: 'Eliminar', el: 'Διαγραφή' })}</span>
    </button>

    <div class="h-[1px] bg-white/10 my-0.5"></div>

    <!-- Farbpalette (unten, extra klein & dezent) -->
    <div class="px-1.5 pt-0.5 pb-0.5">
      <span class="text-[8px] font-bold text-purple-300 uppercase tracking-wider block mb-1">\${tr({ de: 'Farbe 🎨', en: 'Color 🎨', fr: 'Couleur 🎨', it: 'Colore 🎨', es: 'Color 🎨', el: 'Χρώma 🎨' })}</span>
      <div class="flex items-center gap-1 justify-between">
        <button onclick="setTaskColor('\${colId}', \${index}, 'none', event); closeTaskOptionsMenu();" aria-label="\${tr({ de: 'Standard', en: 'Default', fr: 'Par défaut', it: 'Predefinito', es: 'Por defecto', el: 'Προεπιλογή' })}" class="w-3 h-3 rounded-full border border-gray-400 bg-transparent hover:scale-125 transition cursor-pointer \${taskColor === 'none' ? 'ring-1 ring-white' : ''}" title="\${tr({ de: 'Standard', en: 'Default', fr: 'Par défaut', it: 'Predefinito', es: 'Por defecto', el: 'Προεπιλογή' })}"></button>
        <button onclick="setTaskColor('\${colId}', \${index}, 'rose', event); closeTaskOptionsMenu();" aria-label="\${tr({ de: 'Rot', en: 'Red', fr: 'Rouge', it: 'Rosso', es: 'Rojo', el: 'Κόκκινο' })}" class="w-3 h-3 rounded-full bg-rose-500 hover:scale-125 transition cursor-pointer shadow-sm \${taskColor === 'rose' ? 'ring-1 ring-white' : ''}" title="\${tr({ de: 'Rot', en: 'Red', fr: 'Rouge', it: 'Rosso', es: 'Rojo', el: 'Κόκκινο' })}"></button>
        <button onclick="setTaskColor('\${colId}', \${index}, 'orange', event); closeTaskOptionsMenu();" aria-label="\${tr({ de: 'Orange', en: 'Orange', fr: 'Orange', it: 'Arancione', es: 'Naranja', el: 'Πορτοκαλί' })}" class="w-3 h-3 rounded-full bg-orange-500 hover:scale-125 transition cursor-pointer shadow-sm \${taskColor === 'orange' ? 'ring-1 ring-white' : ''}" title="\${tr({ de: 'Orange', en: 'Orange', fr: 'Orange', it: 'Arancione', es: 'Naranja', el: 'Πορτοκαλί' })}"></button>
        <button onclick="setTaskColor('\${colId}', \${index}, 'cyan', event); closeTaskOptionsMenu();" aria-label="Cyan" class="w-3 h-3 rounded-full bg-[#00f2ff] hover:scale-125 transition cursor-pointer shadow-sm \${taskColor === 'cyan' ? 'ring-1 ring-white' : ''}" title="Cyan"></button>
        <button onclick="setTaskColor('\${colId}', \${index}, 'emerald', event); closeTaskOptionsMenu();" aria-label="\${tr({ de: 'Grün', en: 'Green', fr: 'Vert', it: 'Verde', es: 'Verde', el: 'Πράσινο' })}" class="w-3 h-3 rounded-full bg-[#00ff66] hover:scale-125 transition cursor-pointer shadow-sm \${taskColor === 'emerald' ? 'ring-1 ring-white' : ''}" title="\${tr({ de: 'Grün', en: 'Green', fr: 'Vert', it: 'Verde', es: 'Verde', el: 'Πράσινο' })}"></button>
        <button onclick="setTaskColor('\${colId}', \${index}, 'sky', event); closeTaskOptionsMenu();" aria-label="\${tr({ de: 'Blau', en: 'Blue', fr: 'Bleu', it: 'Blu', es: 'Azul', el: 'Μπλε' })}" class="w-3 h-3 rounded-full bg-sky-500 hover:scale-125 transition cursor-pointer shadow-sm \${taskColor === 'sky' ? 'ring-1 ring-white' : ''}" title="\${tr({ de: 'Blau', en: 'Blue', fr: 'Bleu', it: 'Blu', es: 'Azul', el: 'Μπλε' })}"></button>
        <button onclick="setTaskColor('\${colId}', \${index}, 'purple', event); closeTaskOptionsMenu();" aria-label="\${tr({ de: 'Lila', en: 'Purple', fr: 'Violet', it: 'Viola', es: 'Morado', el: 'Μωβ' })}" class="w-3 h-3 rounded-full bg-purple-500 hover:scale-125 transition cursor-pointer shadow-sm \${taskColor === 'purple' ? 'ring-1 ring-white' : ''}" title="\${tr({ de: 'Lila', en: 'Purple', fr: 'Violet', it: 'Viola', es: 'Morado', el: 'Μωβ' })}"></button>
      </div>
    </div>`;

// Normalize line endings for replacement
const normalizeLineEndings = (str) => str.replace(/\r\n/g, '\n');
const isCrlf = appTasks.includes('\r\n');

let normAppTasks = normalizeLineEndings(appTasks);
if (normAppTasks.includes(normalizeLineEndings(currentTaskMenuOption))) {
  normAppTasks = normAppTasks.replace(
    normalizeLineEndings(currentTaskMenuOption),
    normalizeLineEndings(originalTaskMenuOptions)
  );
  console.log('✓ Task context menu restored to original 3 buttons & color palette.');
} else {
  console.error('Could not find currentTaskMenuOption in app-tasks.js!');
}

// Remove modal helper functions at the end of app-tasks.js
const modalFunctionsHeader = '// ============================================================================\n// ZENTRALES AUFGABEN-OPTIONSFENSTER (MODAL)\n// ============================================================================';
const modalFunctionsIdx = normAppTasks.indexOf(modalFunctionsHeader);
if (modalFunctionsIdx !== -1) {
  normAppTasks = normAppTasks.substring(0, modalFunctionsIdx).trimEnd() + '\n';
  console.log('✓ Removed openTaskOptionsModal functions from app-tasks.js.');
}

if (isCrlf) {
  normAppTasks = normAppTasks.replace(/\n/g, '\r\n');
}
fs.writeFileSync('app-tasks.js', normAppTasks, 'utf8');


// 2. UPDATE index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');
const isHtmlCrlf = indexHtml.includes('\r\n');
let normIndexHtml = normalizeLineEndings(indexHtml);

// 2a. Remove #modal-task-options
const modalTaskOptionsPattern = /<!-- =+ -->\s*<!-- MODAL: ZENTRALES OPTIONSFENSTER FÜR AUFGABEN\s*-->\s*<!-- =+ -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
// Let's find exact modal element:
const modalStartStr = '<div id="modal-task-options"';
const modalEndStr = '<!-- INNERE RUHE & SOMATISCHE REGULATION MODAL -->';
const modalStartIdx = normIndexHtml.indexOf(modalStartStr);
const modalEndIdx = normIndexHtml.indexOf(modalEndStr);

if (modalStartIdx !== -1 && modalEndIdx !== -1) {
  // Find preceding comment
  const commentStart = normIndexHtml.lastIndexOf('<!-- ====================================================================== -->', modalStartIdx);
  const cutFrom = commentStart !== -1 ? commentStart : modalStartIdx;
  normIndexHtml = normIndexHtml.substring(0, cutFrom) + normIndexHtml.substring(modalEndIdx);
  console.log('✓ Removed #modal-task-options from index.html.');
}

// 2b. In Header Options Menu (#panel-settings-dropdown), replace the last three buttons with the centralized options modal button
const currentHeaderThreeButtons = `<div class="grid grid-cols-3 gap-1.5 pt-1">
                  <button onclick="openSettingsModal('general'); document.getElementById('panel-settings-dropdown').classList.add('hidden');" class="py-2 px-1.5 bg-white/5 hover:bg-sky-500/20 text-gray-200 hover:text-sky-200 border border-white/10 hover:border-sky-400/40 rounded-xl text-[11px] font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 text-center" title="Allgemeine Einstellungen">
                    <i data-lucide="sliders" class="w-3.5 h-3.5 text-sky-400"></i>
                    <span>Allgemein</span>
                  </button>
                  <button onclick="openSettingsModal('privacy'); document.getElementById('panel-settings-dropdown').classList.add('hidden');" class="py-2 px-1.5 bg-white/5 hover:bg-emerald-500/20 text-gray-200 hover:text-emerald-200 border border-white/10 hover:border-emerald-400/40 rounded-xl text-[11px] font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 text-center" title="Datenschutz">
                    <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-400"></i>
                    <span>Datenschutz</span>
                  </button>
                  <button onclick="openSettingsModal('impressum'); document.getElementById('panel-settings-dropdown').classList.add('hidden');" class="py-2 px-1.5 bg-white/5 hover:bg-amber-500/20 text-gray-200 hover:text-amber-200 border border-white/10 hover:border-amber-400/40 rounded-xl text-[11px] font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 text-center" title="Info & Recht">
                    <i data-lucide="info" class="w-3.5 h-3.5 text-amber-400"></i>
                    <span>Info & Recht</span>
                  </button>
                </div>`;

const newHeaderCentralizedOptionButton = `<button onclick="openSettingsModal('general'); document.getElementById('panel-settings-dropdown').classList.add('hidden');" class="w-full py-2.5 px-3 bg-gradient-to-r from-sky-500/20 via-purple-500/20 to-emerald-500/20 hover:from-sky-500/30 hover:via-purple-500/30 hover:to-emerald-500/30 text-white border border-white/15 hover:border-white/25 rounded-xl text-xs font-bold transition flex items-center justify-between gap-2 cursor-pointer shadow-sm active:scale-95 group" title="Zentrales Optionsfenster öffnen">
                  <div class="flex items-center gap-2">
                    <i data-lucide="sliders" class="w-4 h-4 text-purple-300"></i>
                    <span>Optionen & Einstellungen</span>
                  </div>
                  <span class="text-[10px] font-mono text-purple-300/90 bg-purple-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span>Öffnen ↗</span>
                  </span>
                </button>`;

if (normIndexHtml.includes(normalizeLineEndings(currentHeaderThreeButtons))) {
  normIndexHtml = normIndexHtml.replace(
    normalizeLineEndings(currentHeaderThreeButtons),
    normalizeLineEndings(newHeaderCentralizedOptionButton)
  );
  console.log('✓ Header options dropdown: replaced last 3 buttons with centralized options modal button.');
} else {
  console.error('Could not find currentHeaderThreeButtons in index.html!');
}

if (isHtmlCrlf) {
  normIndexHtml = normIndexHtml.replace(/\n/g, '\r\n');
}
fs.writeFileSync('index.html', normIndexHtml, 'utf8');

console.log('--- REVERT & HEADER UPDATE COMPLETE ---');
