const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const replacements = [
  // Mobile Timer
  {
    target: '<span id="mobile-timer-status" class="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Bereit</span>',
    repl: '<span id="mobile-timer-status" class="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider" data-i18n="mobile_timer_ready">Bereit</span>'
  },
  {
    target: '<i data-lucide="play" class="w-4 h-4 fill-current"></i>\n              <span>Starten</span>',
    repl: '<i data-lucide="play" class="w-4 h-4 fill-current"></i>\n              <span data-i18n="mobile_timer_start">Starten</span>'
  },
  {
    target: '<i data-lucide="pause" class="w-4 h-4"></i>\n              <span>Pause</span>',
    repl: '<i data-lucide="pause" class="w-4 h-4"></i>\n              <span data-i18n="mobile_timer_pause">Pause</span>'
  },
  // Mobile Binaural Beats Subtitles
  {
    target: '<div class="text-[10px] text-purple-300 mt-0.5">Leichtes Lernen & Fokus</div>',
    repl: '<div class="text-[10px] text-purple-300 mt-0.5" data-i18n="mobile_alpha_sub">Leichtes Lernen & Fokus</div>'
  },
  {
    target: '<div class="text-[10px] text-cyan-300 mt-0.5">Tiefer Hyperfokus</div>',
    repl: '<div class="text-[10px] text-cyan-300 mt-0.5" data-i18n="mobile_theta_sub">Tiefer Hyperfokus</div>'
  },
  {
    target: '<div class="text-[10px] text-indigo-300 mt-0.5">Regeneration & Schlaf</div>',
    repl: '<div class="text-[10px] text-indigo-300 mt-0.5" data-i18n="mobile_delta_sub">Regeneration & Schlaf</div>'
  },
  {
    target: '<div class="text-[10px] text-amber-300 mt-0.5">Maximale Denkleistung</div>',
    repl: '<div class="text-[10px] text-amber-300 mt-0.5" data-i18n="mobile_gamma_sub">Maximale Denkleistung</div>'
  },
  // Mobile Soundscapes Labels
  {
    target: '<div class="text-[10px] font-bold text-gray-200 mt-0.5 truncate">Gitarre</div>',
    repl: '<div class="text-[10px] font-bold text-gray-200 mt-0.5 truncate" data-i18n="mobile_ambient_guitar">Gitarre</div>'
  },
  {
    target: '<div class="text-[10px] font-bold text-gray-200 mt-0.5 truncate">Kamin</div>',
    repl: '<div class="text-[10px] font-bold text-gray-200 mt-0.5 truncate" data-i18n="mobile_ambient_campfire">Kamin</div>'
  },
  {
    target: '<div class="text-[10px] font-bold text-gray-200 mt-0.5 truncate">Wald</div>',
    repl: '<div class="text-[10px] font-bold text-gray-200 mt-0.5 truncate" data-i18n="mobile_ambient_forest">Wald</div>'
  },
  {
    target: '<div class="text-[10px] font-bold text-gray-200 mt-0.5 truncate">Windspiel</div>',
    repl: '<div class="text-[10px] font-bold text-gray-200 mt-0.5 truncate" data-i18n="mobile_ambient_windchime">Windspiel</div>'
  },
  {
    target: '<div class="text-[10px] font-bold text-gray-200 mt-0.5 truncate">Klangschale</div>',
    repl: '<div class="text-[10px] font-bold text-gray-200 mt-0.5 truncate" data-i18n="mobile_ambient_bowl">Klangschale</div>'
  },
  {
    target: '<div class="text-[10px] font-bold text-gray-200 mt-0.5 truncate">Regen</div>',
    repl: '<div class="text-[10px] font-bold text-gray-200 mt-0.5 truncate" data-i18n="mobile_ambient_rain">Regen</div>'
  },
  // Mobile Tools Grid
  {
    target: '<span class="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-bold">Ideen</span>',
    repl: '<span class="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-bold" data-i18n="mobile_brainstorm_badge">Ideen</span>'
  },
  {
    target: '<h4 class="text-xs font-bold text-white leading-tight">Brainstorming</h4>\n              <p class="text-[10px] text-orange-300 mt-0.5">Voice & Board-Transfer</p>',
    repl: '<h4 class="text-xs font-bold text-white leading-tight" data-i18n="mobile_brainstorm_title">Brainstorming</h4>\n              <p class="text-[10px] text-orange-300 mt-0.5" data-i18n="mobile_brainstorm_sub">Voice & Board-Transfer</p>'
  },
  {
    target: '<span class="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">Klarheit</span>',
    repl: '<span class="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold" data-i18n="mobile_clarity_badge">Klarheit</span>'
  },
  {
    target: '<h4 class="text-xs font-bold text-white leading-tight">Impulskontrolle</h4>\n              <p class="text-[10px] text-indigo-300 mt-0.5">Reflexion & Fragen</p>',
    repl: '<h4 class="text-xs font-bold text-white leading-tight" data-i18n="mobile_clarity_title">Impulskontrolle</h4>\n              <p class="text-[10px] text-indigo-300 mt-0.5" data-i18n="mobile_clarity_sub">Reflexion & Fragen</p>'
  },
  {
    target: '<span class="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold">Zen</span>',
    repl: '<span class="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold" data-i18n="mobile_zen_badge">Zen</span>'
  },
  {
    target: '<h4 class="text-xs font-bold text-white leading-tight">Safe Space</h4>\n              <p class="text-[10px] text-teal-300 mt-0.5">Atemübung & Ruhe</p>',
    repl: '<h4 class="text-xs font-bold text-white leading-tight" data-i18n="mobile_safespace_title">Safe Space</h4>\n              <p class="text-[10px] text-teal-300 mt-0.5" data-i18n="mobile_safespace_sub">Atemübung & Ruhe</p>'
  },
  {
    target: '<span class="px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-300 text-[10px] font-bold">Vorrat</span>',
    repl: '<span class="px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-300 text-[10px] font-bold" data-i18n="mobile_pantry_badge">Vorrat</span>'
  },
  {
    target: '<h4 class="text-xs font-bold text-white leading-tight">Vorratskammer</h4>\n              <p class="text-[10px] text-lime-300 mt-0.5">Bestand & Ablauf</p>',
    repl: '<h4 class="text-xs font-bold text-white leading-tight" data-i18n="mobile_pantry_title">Vorratskammer</h4>\n              <p class="text-[10px] text-lime-300 mt-0.5" data-i18n="mobile_pantry_sub">Bestand & Ablauf</p>'
  },
  {
    target: '<span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">Quiz & XP</span>',
    repl: '<span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold" data-i18n="mobile_learning_badge">Quiz & XP</span>'
  },
  {
    target: '<h4 class="text-xs font-bold text-white leading-tight">Wissens-Labor</h4>\n              <p class="text-[10px] text-amber-300 mt-0.5">Themen & Multiple-Choice</p>',
    repl: '<h4 class="text-xs font-bold text-white leading-tight" data-i18n="mobile_learning_title">Wissens-Labor</h4>\n              <p class="text-[10px] text-amber-300 mt-0.5" data-i18n="mobile_learning_sub">Themen & Multiple-Choice</p>'
  },
  // Mobile Quick Menu (Chat & Social)
  {
    target: '<div class="font-bold text-white leading-tight">Team Chat</div>\n            <div class="text-[9px] text-violet-300">Live & Rooms</div>',
    repl: '<div class="font-bold text-white leading-tight" data-i18n="mobile_chat_title">Team Chat</div>\n            <div class="text-[9px] text-violet-300" data-i18n="mobile_chat_sub">Live & Rooms</div>'
  },
  {
    target: '<div class="font-bold text-white leading-tight">Social Hub</div>\n            <div class="text-[9px] text-pink-300">Insta, FB, TikTok & Co</div>',
    repl: '<div class="font-bold text-white leading-tight" data-i18n="mobile_social_title">Social Hub</div>\n            <div class="text-[9px] text-pink-300" data-i18n="mobile_social_sub">Insta, FB, TikTok & Co</div>'
  }
];

let replacedCount = 0;
replacements.forEach(r => {
  if (html.includes(r.target)) {
    html = html.replace(r.target, r.repl);
    replacedCount++;
  }
});

fs.writeFileSync('index.html', html, 'utf8');
console.log(`Applied ${replacedCount} of ${replacements.length} mobile localization replacements.`);
