const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Use precise regex for each tool-orb button
// 1. Putz-guide -> Cyan
html = html.replace(
  /(<button[^>]*class="[^"]*tool-orb-clean[\s\S]*?<div\s+class="tool-orb-sphere[^"]*bg-gradient-to-br\s+)from-teal-500\/25\s+to-emerald-600\/20(\s+border\s+border-)teal-400\/40(\s+hover:border-)teal-300([\s\S]*?text-)teal-300([\s\S]*?text-)teal-300([\s\S]*?text-)teal-300([\s\S]*?text-)teal-200/,
  '$1from-cyan-500/25 to-blue-600/20$2cyan-400/40$3cyan-300$4cyan-300$5cyan-300$6cyan-300$7cyan-200'
);

// 2. Einkauf -> Lime (Farbe von Bewegung!)
html = html.replace(
  /(<button[^>]*class="[^"]*tool-orb-shopping[\s\S]*?<div\s+class="tool-orb-sphere[^"]*bg-gradient-to-br\s+)from-emerald-500\/25\s+to-teal-600\/20(\s+border\s+border-)emerald-400\/40(\s+hover:border-)emerald-300([\s\S]*?text-)emerald-300([\s\S]*?bg-)emerald-500([\s\S]*?text-)emerald-300([\s\S]*?text-)emerald-200/,
  '$1from-lime-500/25 to-emerald-600/20$2lime-400/40$3lime-300$4lime-300$5lime-500$6lime-300$7lime-200'
);

// 3. News -> Fuchsia / Magenta
html = html.replace(
  /(<button[^>]*class="[^"]*tool-orb-news[\s\S]*?<div\s+class="tool-orb-sphere[^"]*bg-gradient-to-br\s+)from-pink-500\/25\s+to-rose-600\/20(\s+border\s+border-)pink-400\/40(\s+hover:border-)pink-300([\s\S]*?text-)pink-300([\s\S]*?text-)pink-300([\s\S]*?text-)pink-300([\s\S]*?text-)pink-200/,
  '$1from-fuchsia-500/25 to-rose-600/20$2fuchsia-400/40$3fuchsia-300$4fuchsia-300$5fuchsia-300$6fuchsia-300$7fuchsia-200'
);

// 4. Sounds -> Teal
html = html.replace(
  /(<button[^>]*class="[^"]*tool-orb-sounds[\s\S]*?<div\s+class="tool-orb-sphere[^"]*bg-gradient-to-br\s+)from-cyan-500\/25\s+to-purple-600\/20(\s+border\s+border-)cyan-400\/40(\s+hover:border-)cyan-300([\s\S]*?text-)cyan-300([\s\S]*?text-)cyan-300([\s\S]*?text-)cyan-300([\s\S]*?text-)cyan-200/,
  '$1from-teal-500/25 to-emerald-600/20$2teal-400/40$3teal-300$4teal-300$5teal-300$6teal-300$7teal-200'
);

// 5. Radio -> Violet
html = html.replace(
  /(<button[^>]*class="[^"]*tool-orb-radio[\s\S]*?<div\s+class="tool-orb-sphere[^"]*bg-gradient-to-br\s+)from-rose-500\/25\s+to-red-600\/20(\s+border\s+border-)rose-400\/40(\s+hover:border-)rose-300([\s\S]*?text-)rose-300([\s\S]*?text-)rose-300([\s\S]*?text-)rose-300([\s\S]*?text-)rose-200/,
  '$1from-violet-500/25 to-purple-600/20$2violet-400/40$3violet-300$4violet-300$5violet-300$6violet-300$7violet-200'
);

// 6. Innere Ruhe -> Cyan
html = html.replace(
  /(<button[^>]*class="[^"]*tool-orb-calm[\s\S]*?<div\s+class="tool-orb-sphere[^"]*bg-gradient-to-br\s+)from-teal-500\/25\s+to-emerald-600\/20(\s+border\s+border-)teal-400\/40(\s+hover:border-)teal-300([\s\S]*?text-)teal-300([\s\S]*?text-)teal-300([\s\S]*?text-)teal-300([\s\S]*?text-)teal-200/,
  '$1from-cyan-500/25 to-blue-600/20$2cyan-400/40$3cyan-300$4cyan-300$5cyan-300$6cyan-300$7cyan-200'
);

// 7. Klarheit -> Purple
html = html.replace(
  /(<button[^>]*class="[^"]*tool-orb-clarity[\s\S]*?<div\s+class="tool-orb-sphere[^"]*bg-gradient-to-br\s+)from-indigo-500\/25\s+to-cyan-600\/20(\s+border\s+border-)indigo-400\/40(\s+hover:border-)indigo-300([\s\S]*?text-)indigo-300([\s\S]*?text-)indigo-300([\s\S]*?text-)indigo-300([\s\S]*?text-)indigo-200/,
  '$1from-purple-500/25 to-indigo-600/20$2purple-400/40$3purple-300$4purple-300$5purple-300$6purple-300$7purple-200'
);

// 8. Lernen -> Lime (Farbe von Bewegung!)
html = html.replace(
  /(<button[^>]*class="[^"]*tool-orb-learning[\s\S]*?<div\s+class="tool-orb-sphere[^"]*bg-gradient-to-br\s+)from-blue-500\/25\s+to-indigo-600\/20(\s+border\s+border-)blue-400\/40(\s+hover:border-)blue-300([\s\S]*?text-)blue-300([\s\S]*?text-)blue-300([\s\S]*?text-)blue-300([\s\S]*?text-)blue-200/,
  '$1from-lime-500/25 to-emerald-600/20$2lime-400/40$3lime-300$4lime-300$5lime-300$6lime-300$7lime-200'
);

// 9. Social -> Blue
html = html.replace(
  /(<button[^>]*class="[^"]*tool-orb-social[\s\S]*?<div\s+class="tool-orb-sphere[^"]*bg-gradient-to-br\s+)from-pink-500\/25\s+to-rose-600\/20(\s+border\s+border-)pink-400\/40(\s+hover:border-)pink-300([\s\S]*?text-)pink-300([\s\S]*?text-)pink-300([\s\S]*?text-)pink-300([\s\S]*?text-)pink-200/,
  '$1from-blue-500/25 to-sky-600/20$2blue-400/40$3blue-300$4blue-300$5blue-300$6blue-300$7blue-200'
);

// 10. Chat -> Amber
html = html.replace(
  /(<button[^>]*class="[^"]*tool-orb-chat[\s\S]*?<div\s+class="tool-orb-sphere[^"]*bg-gradient-to-br\s+)from-violet-500\/25\s+to-indigo-600\/20(\s+border\s+border-)violet-400\/40(\s+hover:border-)violet-300([\s\S]*?text-)violet-300([\s\S]*?text-)violet-300([\s\S]*?text-)violet-300([\s\S]*?text-)violet-200/,
  '$1from-amber-500/25 to-orange-600/20$2amber-400/40$3amber-300$4amber-300$5amber-300$6amber-300$7amber-200'
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Regex replacement finished.');
