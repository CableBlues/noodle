const fs = require('fs');

let content = fs.readFileSync('app-humor.js', 'utf8');

// Replace static strings inside renderHumorPanel
content = content.replace(
  '🛡️ Panic Reset [ESC]',
  '${tr({ de: "🛡️ Panic Reset [ESC]", en: "🛡️ Panic Reset [ESC]", fr: "🛡️ Reset Panique [Échap]", it: "🛡️ Reset Panico [ESC]", es: "🛡️ Reinicio Pánico [ESC]", el: "🛡️ Επαναφορά Πανικού [ESC]" })}'
);

content = content.replace(
  '<span>💥 Glitches</span>',
  '<span>${tr({ de: "💥 Glitches", en: "💥 Glitches", fr: "💥 Glitches", it: "💥 Glitch", es: "💥 Glitches", el: "💥 Glitches" })}</span>'
);

content = content.replace(
  '<span>⚡ Action & FX</span>',
  '<span>${tr({ de: "⚡ Action & FX", en: "⚡ Action & FX", fr: "⚡ Action & FX", it: "⚡ Azione & FX", es: "⚡ Acción y FX", el: "⚡ Δράση & FX" })}</span>'
);

content = content.replace(
  '<span>🔊 Sound & Witz</span>',
  '<span>${tr({ de: "🔊 Sound & Witz", en: "🔊 Sound & Jokes", fr: "🔊 Sons & Blagues", it: "🔊 Suoni & Scherzi", es: "🔊 Sonidos y Bromas", el: "🔊 Ήχος & Αστεία" })}</span>'
);

content = content.replace(
  '<span>🫧 Stress & Idle</span>',
  '<span>${tr({ de: "🫧 Stress & Idle", en: "🫧 Stress & Idle", fr: "🫧 Stress & Veille", it: "🫧 Stress & Inattività", es: "🫧 Estrés y Reposo", el: "🫧 Στρες & Αδράνεια" })}</span>'
);

content = content.replace(
  '<span class="flex items-center gap-1">💥 17 Radikale Glitches</span>',
  '<span class="flex items-center gap-1">${tr({ de: "💥 17 Radikale Glitches", en: "💥 17 Radical Glitches", fr: "💥 17 Glitches Radicaux", it: "💥 17 Glitch Radicali", es: "💥 17 Glitches Radicales", el: "💥 17 Ριζοσπαστικά Glitches" })}</span>'
);

content = content.replace(
  '100% Sicher • [ESC] heilt',
  '${tr({ de: "100% Sicher • [ESC] heilt", en: "100% Safe • [ESC] heals", fr: "100% Sûr • [Échap] guérit", it: "100% Sicuro • [ESC] ripristina", es: "100% Seguro • [ESC] restaura", el: "100% Ασφαλές • [ESC] επαναφέρει" })}'
);

content = content.replace(
  '<span>⚡ Live Action & Party FX</span>',
  '<span>${tr({ de: "⚡ Live Action & Party FX", en: "⚡ Live Action & Party FX", fr: "⚡ Action & Fête FX", it: "⚡ Azione Live & FX", es: "⚡ Acción en vivo y FX", el: "⚡ Δράση & Εφέ" })}</span>'
);

content = content.replace(
  '<span class="text-[9px] text-gray-400">Interaktiv</span>',
  '<span class="text-[9px] text-gray-400">${tr({ de: "Interaktiv", en: "Interactive", fr: "Interactif", it: "Interattivo", es: "Interactivo", el: "Διαδραστικό" })}</span>'
);

content = content.replace(
  '<span>🌌 Ambient Flow & Screensaver</span>',
  '<span>${tr({ de: "🌌 Ambient Flow & Screensaver", en: "🌌 Ambient Flow & Screensaver", fr: "🌌 Ambiance & Économiseur", it: "🌌 Flusso & Salvaschermo", es: "🌌 Flujo & Salvapantallas", el: "🌌 Χαλαρή ροή & Προφύλαξη" })}</span>'
);

content = content.replace(
  '<span class="text-[9px] text-gray-400">Ästhetik & Ruhe</span>',
  '<span class="text-[9px] text-gray-400">${tr({ de: "Ästhetik & Ruhe", en: "Aesthetics & Calm", fr: "Esthétique & Calme", it: "Estetica & Calma", es: "Estética y Calma", el: "Αισθητική & Ηρεμία" })}</span>'
);

content = content.replace(
  '<span>🔊 12 Soundboard FX (Web Audio)</span>',
  '<span>${tr({ de: "🔊 12 Soundboard FX", en: "🔊 12 Soundboard FX", fr: "🔊 12 Effets sonores", it: "🔊 12 Effetti sonori", es: "🔊 12 Efectos de sonido", el: "🔊 12 Ηχητικά εφέ" })}</span>'
);

content = content.replace(
  '<span class="text-[9px] text-gray-400">100% autark</span>',
  '<span class="text-[9px] text-gray-400">${tr({ de: "100% autark", en: "100% offline", fr: "100% autonome", it: "100% autonomo", es: "100% autónomo", el: "100% αυτόνομο" })}</span>'
);

content = content.replace(
  'Nächster Witz 😂',
  '${tr({ de: "Nächster Witz 😂", en: "Next Joke 😂", fr: "Blague suivante 😂", it: "Prossima barzelletta 😂", es: "Siguiente chiste 😂", el: "Επόμενο αστείο 😂" })}'
);

content = content.replace(
  '<div class="text-[11px] font-bold text-purple-200">Screensaver bei Inaktivität</div>',
  '<div class="text-[11px] font-bold text-purple-200">${tr({ de: "Screensaver bei Inaktivität", en: "Screensaver on Inactivity", fr: "Économiseur en cas d’inactivité", it: "Salvaschermo su inattività", es: "Salvapantallas por inactividad", el: "Προφύλαξη οθόνης σε αδράνεια" })}</div>'
);

content = content.replace(
  '<div class="text-[8.5px] text-gray-400 font-mono">Endet lautlos bei Mausbewegung oder [ESC]</div>',
  '<div class="text-[8.5px] text-gray-400 font-mono">${tr({ de: "Endet lautlos bei Mausbewegung oder [ESC]", en: "Ends silently on mouse move or [ESC]", fr: "S’arrête au mouvement de la souris ou [Échap]", it: "Termina muovendo il mouse o con [ESC]", es: "Termina al mover el ratón o con [ESC]", el: "Τερματίζει με κίνηση ποντικιού ή [ESC]" })}</div>'
);

content = content.replace(
  '✨ Testen',
  '${tr({ de: "✨ Testen", en: "✨ Test", fr: "✨ Tester", it: "✨ Prova", es: "✨ Probar", el: "✨ Δοκιμή" })}'
);

content = content.replace(
  '<span class="text-gray-400 font-mono">Ruhezeit:</span>',
  '<span class="text-gray-400 font-mono">${tr({ de: "Ruhezeit:", en: "Idle Time:", fr: "Inactivité :", it: "Tempo attesa:", es: "Inactividad:", el: "Χρόνος ηρεμίας:" })}</span>'
);

content = content.replace(
  '<span class="text-gray-400 font-mono">Modus:</span>',
  '<span class="text-gray-400 font-mono">${tr({ de: "Modus:", en: "Mode:", fr: "Mode :", it: "Modalità:", es: "Modo:", el: "Λειτουργία:" })}</span>'
);

content = content.replace(
  '<span class="text-[9.5px] font-bold text-pink-300 uppercase tracking-wider font-mono">🫧 Luftpolsterfolie</span>',
  '<span class="text-[9.5px] font-bold text-pink-300 uppercase tracking-wider font-mono">${tr({ de: "🫧 Luftpolsterfolie", en: "🫧 Bubble Wrap", fr: "🫧 Papier bulle", it: "🫧 Pluriball", es: "🫧 Plástico de burbujas", el: "🫧 Φυσαλίδες περιτυλίγματος" })}</span>'
);

content = content.replace(
  '>Neu</button>',
  '>${tr({ de: "Neu", en: "Reset", fr: "Réinitialiser", it: "Nuovo", es: "Nuevo", el: "Νέο" })}</button>'
);

content = content.replace(
  '<span class="text-[9.5px] font-bold text-purple-300 uppercase tracking-wider font-mono">🎯 Impuls & Würfel</span>',
  '<span class="text-[9.5px] font-bold text-purple-300 uppercase tracking-wider font-mono">${tr({ de: "🎯 Impuls & Würfel", en: "🎯 Impulse & Dice", fr: "🎯 Impulsion & Dé", it: "🎯 Impulso & Dadi", es: "🎯 Impulso y Dados", el: "🎯 Παρόρμηση & Ζάρι" })}</span>'
);

content = content.replace(
  'Würfeln 🎲',
  '${tr({ de: "Würfeln 🎲", en: "Roll 🎲", fr: "Lancer 🎲", it: "Lancia 🎲", es: "Tirar 🎲", el: "Ζάρι 🎲" })}'
);

content = content.replace(
  'Klicke auf Würfeln für einen Impuls!',
  '${tr({ de: "Klicke auf Würfeln für einen Impuls!", en: "Click roll for a quick nudge!", fr: "Cliquez sur lancer pour une impulsion !", it: "Clicca per lanciare un impulso!", es: "¡Haz clic para obtener un impulso!", el: "Κάνε κλικ στο ζάρι για ώθηση!" })}'
);

// Joke display in panel
content = content.replace(
  '<div id="humor-joke-q" class="text-xs font-bold text-white truncate">${currentJoke.q}</div>',
  '<div id="humor-joke-q" class="text-xs font-bold text-white truncate">${typeof currentJoke.q === "object" ? tr(currentJoke.q) : currentJoke.q}</div>'
);
content = content.replace(
  '<div id="humor-joke-a" class="text-[11px] text-pink-300/90 truncate">${currentJoke.a}</div>',
  '<div id="humor-joke-a" class="text-[11px] text-pink-300/90 truncate">${typeof currentJoke.a === "object" ? tr(currentJoke.a) : currentJoke.a}</div>'
);

fs.writeFileSync('app-humor.js', content, 'utf8');
console.log('Successfully localized renderHumorPanel in app-humor.js');
