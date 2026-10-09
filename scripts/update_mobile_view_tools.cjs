const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Update Einkauf in mobile-view-tools to Lime (no teal repeat with Safe Space)
html = html.replace(
  `<!-- Einkauf -->
          <div onclick="openShoppingModal()" class="p-4 rounded-2xl bg-gradient-to-br from-teal-950/50 to-[#12121a] border border-teal-500/30 shadow-lg cursor-pointer active:scale-95 transition flex flex-col justify-between h-28">
            <div class="flex items-center justify-between">
              <span class="text-2xl">🛒</span>
              <span class="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold" data-i18n="mobile_tools_shop_badge">Loot</span>
            </div>`,
  `<!-- Einkauf -->
          <div onclick="openShoppingModal()" class="p-4 rounded-2xl bg-gradient-to-br from-lime-950/50 to-[#12121a] border border-lime-500/40 shadow-lg cursor-pointer active:scale-95 transition flex flex-col justify-between h-28">
            <div class="flex items-center justify-between">
              <span class="text-2xl">🛒</span>
              <span class="px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-300 text-[10px] font-bold" data-i18n="mobile_tools_shop_badge">Loot</span>
            </div>`
);

// Update Sport in mobile-view-tools to Lime (authentic Farbe von Bewegung!)
html = html.replace(
  `<!-- Sport -->
          <div onclick="openSportModal()" class="p-4 rounded-2xl bg-gradient-to-br from-orange-950/50 to-[#12121a] border border-orange-500/30 shadow-lg cursor-pointer active:scale-95 transition flex flex-col justify-between h-28">
            <div class="flex items-center justify-between">
              <span class="text-2xl">🏃</span>
              <span class="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-bold" data-i18n="mobile_tools_sport_badge">Aktiv</span>
            </div>`,
  `<!-- Sport -->
          <div onclick="openSportModal()" class="p-4 rounded-2xl bg-gradient-to-br from-lime-950/50 to-[#12121a] border border-lime-500/40 shadow-lg cursor-pointer active:scale-95 transition flex flex-col justify-between h-28">
            <div class="flex items-center justify-between">
              <span class="text-2xl">🏃</span>
              <span class="px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-300 text-[10px] font-bold" data-i18n="mobile_tools_sport_badge">Aktiv</span>
            </div>`
);

// Update Deep Learning in mobile-view-tools to Cyan (no amber repeat with Kochen)
html = html.replace(
  `<!-- Deep Learning & Quiz 🎓 -->
          <div onclick="openLearningHubModal()" class="p-4 rounded-2xl bg-gradient-to-br from-amber-950/50 to-[#12121a] border border-amber-500/40 shadow-lg cursor-pointer active:scale-95 transition flex flex-col justify-between h-28">
            <div class="flex items-center justify-between">
              <span class="text-2xl">🎓</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold" data-i18n="mobile_learning_badge">Quiz & XP</span>
            </div>
            <div>
              <h4 class="text-xs font-bold text-white leading-tight">Wissens-Labor</h4>
              <p class="text-[10px] text-amber-300 mt-0.5">Themen & Multiple-Choice</p>
            </div>`,
  `<!-- Deep Learning & Quiz 🎓 -->
          <div onclick="openLearningHubModal()" class="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/50 to-[#12121a] border border-cyan-500/40 shadow-lg cursor-pointer active:scale-95 transition flex flex-col justify-between h-28">
            <div class="flex items-center justify-between">
              <span class="text-2xl">🎓</span>
              <span class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold" data-i18n="mobile_learning_badge">Quiz & XP</span>
            </div>
            <div>
              <h4 class="text-xs font-bold text-white leading-tight">Wissens-Labor</h4>
              <p class="text-[10px] text-cyan-300 mt-0.5">Themen & Multiple-Choice</p>
            </div>`
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated mobile-view-tools colors.');
