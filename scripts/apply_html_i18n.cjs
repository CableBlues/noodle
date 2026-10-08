const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const replacements = [
  // Shopping
  ['<span>Markt</span>', '<span data-i18n="shop_supermarket">Markt</span>'],
  ['<span>Meine Liste</span>', '<span data-i18n="shop_tab_list">Meine Liste</span>'],
  ['<span>Discounter Deals</span>', '<span data-i18n="shop_tab_deals">Discounter Deals</span>'],
  ['<span class="px-1.5 py-0.2 rounded-full bg-rose-500/25 text-rose-300 text-[9px] font-bold font-mono">Sale</span>', '<span data-i18n="shop_sale_badge" class="px-1.5 py-0.2 rounded-full bg-rose-500/25 text-rose-300 text-[9px] font-bold font-mono">Sale</span>'],
  ['placeholder="Artikel (z.B. 2x Hafermilch, Tomaten)..."', 'data-i18n-placeholder="shop_add_placeholder" placeholder="Artikel (z.B. 2x Hafermilch, Tomaten)..."'],

  // News
  ['<span>Vorlesen</span>', '<span data-i18n="news_read_aloud">Vorlesen</span>'],
  ['<span>🌐 1. Ausgabesprache</span>', '<span data-i18n="news_sec_lang">🌐 1. Ausgabesprache</span>'],
  ['<span class="text-[9px] text-gray-400 font-normal font-sans">(Auto-Übersetzung)</span>', '<span data-i18n="news_auto_translate" class="text-[9px] text-gray-400 font-normal font-sans">(Auto-Übersetzung)</span>'],
  ['<span id="news-lang-badge-status" class="text-[9px] text-purple-300/80 font-mono">App-Standard</span>', '<span id="news-lang-badge-status" data-i18n="news_app_standard" class="text-[9px] text-purple-300/80 font-mono">App-Standard</span>'],
  ['<span class="font-mono uppercase tracking-wider text-purple-300 font-bold">📍 2. Region & Herkunft</span>', '<span data-i18n="news_sec_region" class="font-mono uppercase tracking-wider text-purple-300 font-bold">📍 2. Region & Herkunft</span>'],
  ['<span class="text-[9px] text-gray-400">Weltweit oder lokaler Fokus</span>', '<span data-i18n="news_region_desc" class="text-[9px] text-gray-400">Weltweit oder lokaler Fokus</span>'],
  ['<div class="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold px-0.5">🔀 3. Feed-Modus</div>', '<div data-i18n="news_sec_feed" class="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold px-0.5">🔀 3. Feed-Modus</div>'],
  ['<div class="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold px-0.5">📰 4. Medien & Quellen</div>', '<div data-i18n="news_sec_media" class="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold px-0.5">📰 4. Medien & Quellen</div>'],
  ['<div class="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold px-0.5">📑 5. Thematik & Ressorts</div>', '<div data-i18n="news_sec_topics" class="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold px-0.5">📑 5. Thematik & Ressorts</div>'],
  ['<span class="text-gray-400">Sprach-Tempo:</span>', '<span data-i18n="news_speed_label" class="text-gray-400">Sprach-Tempo:</span>'],

  // Audio & DJ
  ['<span>Stop</span>', '<span data-i18n="stop">Stop</span>'],
  ['<span>Schnell-Stimmungen (1-Click)</span>', '<span data-i18n="audio_mood_quick">Schnell-Stimmungen (1-Click)</span>'],
  ['<span class="text-[9px] text-gray-500">Sofort startklar</span>', '<span data-i18n="audio_ready" class="text-[9px] text-gray-500">Sofort startklar</span>'],
  ['<span>Harmonien & Melodien</span>', '<span data-i18n="audio_harmonies">Harmonien & Melodien</span>'],
  ['<span>Natur & Atmosphäre</span>', '<span data-i18n="audio_nature">Natur & Atmosphäre</span>'],
  ['<span>Dynamische Genre-Rhythmen & Beats</span>', '<span data-i18n="audio_beats">Dynamische Genre-Rhythmen & Beats</span>'],
  ['<span>Eigene Tracks</span>', '<span data-i18n="audio_own_tracks">Eigene Tracks</span>'],
  ['<span>Datei laden</span>', '<span data-i18n="audio_load_file">Datei laden</span>'],
  ['placeholder="Online Audio/Video URL (mp3, mp4, webm, stream)..."', 'data-i18n-placeholder="audio_url_placeholder" placeholder="Online Audio/Video URL (mp3, mp4, webm, stream)..."'],
  ['<span>Abspielen</span>', '<span data-i18n="play">Abspielen</span>'],
  ['<span>Shuffle</span>', '<span data-i18n="dj_shuffle">Shuffle</span>'],
  ['<span>X-Fade</span>', '<span data-i18n="dj_xfade">X-Fade</span>'],

  // Collab Chat
  ['<span>Teilen</span>', '<span data-i18n="share">Teilen</span>'],
  ['<span>Team Space</span>', '<span data-i18n="collab_team_space">Team Space</span>'],
  ['<span>Messengers</span>', '<span data-i18n="collab_messengers">Messengers</span>'],
  ['<span>Direkt-Chat</span>', '<span data-i18n="collab_direct_chat">Direkt-Chat</span>'],
  ['<span>Team-Dashboard:</span>', '<span data-i18n="collab_team_dashboard">Team-Dashboard:</span>'],
  ['<span>👥 Team-Board</span>', '<span data-i18n="collab_team_board">👥 Team-Board</span>'],

  // Pause
  ['>🌬️ Atem</button>', '><span data-i18n="pause_tab_breath">🌬️ Atem</span></button>'],
  ['>⚓ Reset</button>', '><span data-i18n="pause_tab_sensory">⚓ Reset</span></button>'],
  ['>🧘 Körper</button>', '><span data-i18n="pause_tab_body">🧘 Körper</span></button>'],
  ['>🎧 Sound</button>', '><span data-i18n="pause_tab_sound">🎧 Sound</span></button>'],
  ['<div class="leading-none mb-0.5 font-bold text-white group-hover/pbtn:text-sky-200">4-4-4 Box-Atmung</div>', '<div data-i18n="pause_444_title" class="leading-none mb-0.5 font-bold text-white group-hover/pbtn:text-sky-200">4-4-4 Box-Atmung</div>'],
  ['<div class="text-[9px] text-gray-400 font-normal">Navy SEAL Fokus & Stressabbau in 60s</div>', '<div data-i18n="pause_444_desc" class="text-[9px] text-gray-400 font-normal">Navy SEAL Fokus & Stressabbau in 60s</div>'],
  ['<div class="leading-none mb-0.5 font-bold text-white group-hover/pbtn:text-purple-200">4-7-8 Tiefenruhe</div>', '<div data-i18n="pause_478_title" class="leading-none mb-0.5 font-bold text-white group-hover/pbtn:text-purple-200">4-7-8 Tiefenruhe</div>'],
  ['<div class="text-[9px] text-gray-400 font-normal">Senkt Herzfrequenz & Cortisol</div>', '<div data-i18n="pause_478_desc" class="text-[9px] text-gray-400 font-normal">Senkt Herzfrequenz & Cortisol</div>'],
  ['<div class="leading-none mb-0.5 font-bold text-white group-hover/pbtn:text-sky-200">Physiologischer Seufzer</div>', '<div data-i18n="pause_sigh_title" class="leading-none mb-0.5 font-bold text-white group-hover/pbtn:text-sky-200">Physiologischer Seufzer</div>'],
  ['<div class="text-[9px] text-gray-400 font-normal">Schnellster biologischer Nerven-Reset (30s)</div>', '<div data-i18n="pause_sigh_desc" class="text-[9px] text-gray-400 font-normal">Schnellster biologischer Nerven-Reset (30s)</div>'],
  ['<div class="leading-none mb-0.5 font-bold text-white group-hover/pbtn:text-sky-200">5-4-3-2-1 Erdungs-Anker</div>', '<div data-i18n="pause_54321_title" class="leading-none mb-0.5 font-bold text-white group-hover/pbtn:text-sky-200">5-4-3-2-1 Erdungs-Anker</div>'],
  ['<div class="text-[9px] text-gray-400 font-normal">Stoppt Grübeln & holt in die Realität</div>', '<div data-i18n="pause_54321_desc" class="text-[9px] text-gray-400 font-normal">Stoppt Grübeln & holt in die Realität</div>'],
  ['<div class="leading-none mb-0.5 font-bold text-white group-hover/pbtn:text-amber-200">20-20-20 Augen-Pause & Palming</div>', '<div data-i18n="pause_eyes_title" class="leading-none mb-0.5 font-bold text-white group-hover/pbtn:text-amber-200">20-20-20 Augen-Pause & Palming</div>'],
  ['<div class="text-[9px] text-gray-400 font-normal">20s Bildschirm-Erholung & warme Handflächen</div>', '<div data-i18n="pause_eyes_desc" class="text-[9px] text-gray-400 font-normal">20s Bildschirm-Erholung & warme Handflächen</div>'],
  ['<div class="leading-none mb-0.5 font-bold text-white group-hover/pbtn:text-rose-200">60s Dopamin-Detox (Stille)</div>', '<div data-i18n="pause_detox_title" class="leading-none mb-0.5 font-bold text-white group-hover/pbtn:text-rose-200">60s Dopamin-Detox (Stille)</div>'],
  ['<div class="text-[9px] text-gray-400 font-normal">Reizfreie Gedankenpause ohne Bildschirm</div>', '<div data-i18n="pause_detox_desc" class="text-[9px] text-gray-400 font-normal">Reizfreie Gedankenpause ohne Bildschirm</div>'],

  // Mobile Menu Drawer
  ['<span>Menü & Einstellungen</span>', '<span data-i18n="mobile_menu_title">Menü & Einstellungen</span>'],
  ['<span>Backup Export</span>', '<span data-i18n="mobile_backup_export_btn">Backup Export</span>'],
  ['<span>Wiederherstellen</span>', '<span data-i18n="mobile_restore_btn">Wiederherstellen</span>'],
  ['<span>Statistik / Bericht</span>', '<span data-i18n="mobile_stats_report">Statistik / Bericht</span>'],
  ['<span>Farbschemas</span>', '<span data-i18n="mobile_themes">Farbschemas</span>'],
  ['<span>Sprache</span>', '<span data-i18n="mobile_language">Sprache</span>'],
  ['<span>Pause & Erholung</span>', '<span data-i18n="mobile_pause_relax">Pause & Erholung</span>'],
  ['<span>Rückgängig</span>', '<span data-i18n="mobile_undo">Rückgängig</span>'],
  ['<span>Plan sichern</span>', '<span data-i18n="mobile_save_plan">Plan sichern</span>'],
  ['<span>Plan laden</span>', '<span data-i18n="mobile_load_plan">Plan laden</span>'],
  ['<span>Zurücksetzen</span>', '<span data-i18n="mobile_reset">Zurücksetzen</span>'],
  ['<span>Feedback</span>', '<span data-i18n="mobile_feedback">Feedback</span>'],
  ['<span>Optionen</span>', '<span data-i18n="mobile_options">Optionen</span>'],

  // Cleaning Guide
  ['<span class="font-bold">⚡ 15m Blitz</span>', '<span data-i18n="clean_tab_express" class="font-bold">⚡ 15m Blitz</span>'],
  ['<span class="font-bold">🧹 45m Standard</span>', '<span data-i18n="clean_tab_standard" class="font-bold">🧹 45m Standard</span>'],
  ['<span class="font-bold">✨ 90m Deep</span>', '<span data-i18n="clean_tab_deep" class="font-bold">✨ 90m Deep</span>'],
  ['<span>LoFi-Musik</span>', '<span data-i18n="clean_lofi_btn">LoFi-Musik</span>'],
  ['<span>In Board übernehmen</span>', '<span data-i18n="clean_transfer_board">In Board übernehmen</span>'],
  ['<span id="cleaning-progress-status" class="text-gray-400">Bereit für den Start!</span>', '<span id="cleaning-progress-status" data-i18n="clean_ready_status" class="text-gray-400">Bereit für den Start!</span>'],

  // Postpone Termin Modal
  ['<h3 class="font-display font-bold text-base text-white">Termin verschieben</h3>', '<h3 data-i18n="postpone_title" class="font-display font-bold text-base text-white">Termin verschieben</h3>'],
  ['<div class="text-[10px] text-gray-400 uppercase font-mono tracking-wider font-semibold">Schnellauswahl:</div>', '<div data-i18n="postpone_quick" class="text-[10px] text-gray-400 uppercase font-mono tracking-wider font-semibold">Schnellauswahl:</div>'],
  ['<span>+1 Tag (Morgen)</span>', '<span data-i18n="postpone_plus_1d">+1 Tag (Morgen)</span>'],
  ['<span>+2 Tage</span>', '<span data-i18n="postpone_plus_2d">+2 Tage</span>'],
  ['<span>+1 Woche</span>', '<span data-i18n="postpone_plus_1w">+1 Woche</span>'],
  ['<label class="block text-gray-400 text-[10px] uppercase font-mono tracking-wider font-semibold">Neues Datum:</label>', '<label data-i18n="postpone_new_date" class="block text-gray-400 text-[10px] uppercase font-mono tracking-wider font-semibold">Neues Datum:</label>'],
  ['<label class="block text-gray-400 text-[10px] uppercase font-mono tracking-wider font-semibold">Neue Uhrzeit:</label>', '<label data-i18n="postpone_new_time" class="block text-gray-400 text-[10px] uppercase font-mono tracking-wider font-semibold">Neue Uhrzeit:</label>'],
  ['<label class="block text-gray-400 text-[10px] uppercase font-mono tracking-wider font-semibold">Notiz / Grund (optional):</label>', '<label data-i18n="postpone_note" class="block text-gray-400 text-[10px] uppercase font-mono tracking-wider font-semibold">Notiz / Grund (optional):</label>'],

  // P2P Sync Modal
  ['<h3 class="font-display font-bold text-base text-white">Automatische Synchronisation ⚡</h3>', '<h3 data-i18n="sync_auto_title" class="font-display font-bold text-base text-white">Automatische Synchronisation ⚡</h3>'],
  ['<p class="text-[11px] text-gray-400 mt-0.5">Alle Geräte & Offline-fähig</p>', '<p data-i18n="sync_offline_guarantee" class="text-[11px] text-gray-400 mt-0.5">Alle Geräte & Offline-fähig</p>'],
  ['<label class="block text-[11px] text-gray-400 font-semibold">E-Mail-Adresse:</label>', '<label data-i18n="sync_email" class="block text-[11px] text-gray-400 font-semibold">E-Mail-Adresse:</label>'],
  ['<label class="block text-[11px] text-gray-400 font-semibold">Passwort / PIN:</label>', '<label data-i18n="sync_pin" class="block text-[11px] text-gray-400 font-semibold">Passwort / PIN:</label>'],
  ['<span>Anmelden / Registrieren</span>', '<span data-i18n="sync_login_btn">Anmelden / Registrieren</span>']
];

let count = 0;
for (const [target, repl] of replacements) {
  if (html.includes(target)) {
    html = html.split(target).join(repl);
    count++;
  }
}

fs.writeFileSync('index.html', html, 'utf8');
console.log(`Applied ${count} replacements to index.html`);
