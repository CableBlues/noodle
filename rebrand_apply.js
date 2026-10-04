import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

// 1. Update app-tasks.js
const tasksPath = path.join(rootDir, 'app-tasks.js');
let tasksCode = fs.readFileSync(tasksPath, 'utf8');

const oldTaskMapRegex = /const TASK_COLOR_MAP = \{[\s\S]*?\n\};\r?\n/;
const newTaskMap = `const TASK_COLOR_MAP = {
  rose:    { border: 'border-l-[#f38ba8]', bg: 'bg-[#f38ba8]/10', text: 'text-[#f38ba8]' }, 
  orange:  { border: 'border-l-[#fab387]', bg: 'bg-[#fab387]/10', text: 'text-[#fab387]' }, 
  amber:   { border: 'border-l-[#f9e2af]', bg: 'bg-[#f9e2af]/10', text: 'text-[#f9e2af]' }, 
  emerald: { border: 'border-l-[#a6e3a1]', bg: 'bg-[#a6e3a1]/10', text: 'text-[#a6e3a1]' }, 
  sky:     { border: 'border-l-[#89b4fa]', bg: 'bg-[#89b4fa]/10', text: 'text-[#89b4fa]' }, 
  purple:  { border: 'border-l-[#cba6f7]', bg: 'bg-[#cba6f7]/10', text: 'text-[#cba6f7]' }, 
  none:    { border: 'border-l-gray-600',  bg: 'bg-white/5',      text: 'text-gray-300' }
};
`;

tasksCode = tasksCode.replace(oldTaskMapRegex, newTaskMap);

tasksCode = tasksCode.replace(
  /\$\{colorStyle\.border\}\s+\$\{colorStyle\.bg\}\s+\$\{colorStyle\.shadow\}/g,
  '${colorStyle.border} ${colorStyle.bg}${colorStyle.shadow ? " " + colorStyle.shadow : ""}'
);
tasksCode = tasksCode.replace(
  /colorStyle\.iconColor/g,
  '(colorStyle.iconColor || colorStyle.text)'
);

fs.writeFileSync(tasksPath, tasksCode, 'utf8');
console.log('✓ app-tasks.js updated');

// 2. Update index.html
const indexPath = path.join(rootDir, 'index.html');
let htmlCode = fs.readFileSync(indexPath, 'utf8');

const oldGridRegex = /<div class="grid grid-cols-8 gap-1 p-1 bg-black\/40 border border-white\/10 rounded-xl shadow-inner items-center justify-items-center">[\s\S]*?<\/div>/;
const newGrid = `<div class="grid grid-cols-4 gap-3 p-2 bg-black/40 border border-white/10 rounded-xl">
  <button onclick="setTheme('code-night')" class="h-8 w-8 rounded-full bg-[#bb9af7] border-2 border-white/20 hover:scale-110 transition-all shadow-[0_0_10px_#bb9af7]"></button>
  <button onclick="setTheme('matrix')" class="h-8 w-8 rounded-full bg-[#00ff41] border-2 border-white/20 hover:scale-110 transition-all shadow-[0_0_10px_#00ff41]"></button>
  <button onclick="setTheme('ruby')" class="h-8 w-8 rounded-full bg-[#ff003c] border-2 border-white/20 hover:scale-110 transition-all shadow-[0_0_10px_#ff003c]"></button>
  <button onclick="setTheme('cobalt')" class="h-8 w-8 rounded-full bg-[#00f2ff] border-2 border-white/20 hover:scale-110 transition-all shadow-[0_0_10px_#00f2ff]"></button>
</div>`;

htmlCode = htmlCode.replace(oldGridRegex, newGrid);

// Ensure Tailwind font config includes Space Grotesk
htmlCode = htmlCode.replace(
  /sans:\s*\[['"]"Plus Jakarta Sans"['"]\s*,\s*['"]sans-serif['"]\]/,
  'sans: [\'"Space Grotesk"\', \'"Plus Jakarta Sans"\', \'sans-serif\']'
);

fs.writeFileSync(indexPath, htmlCode, 'utf8');
console.log('✓ index.html updated');

// 3. Update app-command-palette.js to reflect the 4 themes
const cmdPath = path.join(rootDir, 'app-command-palette.js');
let cmdCode = fs.readFileSync(cmdPath, 'utf8');
const oldCmdThemesRegex = /\{\s*id:\s*'cmd-theme-botanical'[\s\S]*?action:\s*\(\)\s*=>\s*\{\s*if\s*\(typeof setTheme === 'function'\)\s*setTheme\('honey'\);\s*\}\s*\},/;
const newCmdThemes = `{
      id: 'cmd-theme-code-night',
      title: tr({ de: 'Theme: Code Night (Tokyo Night & Neon Violett)', en: 'Theme: Code Night (Tokyo Night & Violet)' }),
      category: tr({ de: 'Design', en: 'Design' }),
      icon: 'palette',
      color: 'text-[#bb9af7]',
      action: () => { if (typeof setTheme === 'function') setTheme('code-night'); }
    },
    {
      id: 'cmd-theme-matrix',
      title: tr({ de: 'Theme: Matrix Protocol (Classic Hacker Green)', en: 'Theme: Matrix Protocol (Hacker Green)' }),
      category: tr({ de: 'Design', en: 'Design' }),
      icon: 'palette',
      color: 'text-[#00ff41]',
      action: () => { if (typeof setTheme === 'function') setTheme('matrix'); }
    },
    {
      id: 'cmd-theme-ruby',
      title: tr({ de: 'Theme: Cyber Ruby (Red/Graphite)', en: 'Theme: Cyber Ruby (Red/Graphite)' }),
      category: tr({ de: 'Design', en: 'Design' }),
      icon: 'palette',
      color: 'text-[#ff003c]',
      action: () => { if (typeof setTheme === 'function') setTheme('ruby'); }
    },
    {
      id: 'cmd-theme-cobalt',
      title: tr({ de: 'Theme: Cobalt Drive (Deep Space Blue)', en: 'Theme: Cobalt Drive (Deep Space Blue)' }),
      category: tr({ de: 'Design', en: 'Design' }),
      icon: 'palette',
      color: 'text-[#00f2ff]',
      action: () => { if (typeof setTheme === 'function') setTheme('cobalt'); }
    },`;

cmdCode = cmdCode.replace(oldCmdThemesRegex, newCmdThemes);
fs.writeFileSync(cmdPath, cmdCode, 'utf8');
console.log('✓ app-command-palette.js updated');
