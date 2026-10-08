const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const replacements = [
  // Pick
  ['<span>Fokus-Vorschlag</span>', '<span data-i18n="pick_tab_suggestion">Fokus-Vorschlag</span>'],
  ['<span>A vs. B Entscheider</span>', '<span data-i18n="pick_tab_dilemma">A vs. B Entscheider</span>'],
  ['<span>Kopf leeren</span>', '<span data-i18n="pick_tab_braindump">Kopf leeren</span>'],
  ['<span>🔋 Quick Win</span>', '<span data-i18n="pick_energy_low">🔋 Quick Win</span>'],
  ['<span>⚡ Fokus</span>', '<span data-i18n="pick_energy_med">⚡ Fokus</span>'],
  ['<span>🔥 Deep Work</span>', '<span data-i18n="pick_energy_high">🔥 Deep Work</span>'],
  ['<span>🎲 Random</span>', '<span data-i18n="pick_energy_random">🎲 Random</span>'],
  ['<span>Anderer Vorschlag</span>', '<span data-i18n="pick_next_btn">Anderer Vorschlag</span>'],
  ['<span class="hidden sm:inline text-[9px] text-gray-500 font-mono">[Space] = Starten</span>', '<span class="hidden sm:inline text-[9px] text-gray-500 font-mono" data-i18n="pick_space_hint">[Space] = Starten</span>'],
  ['<span>Münze werfen & entscheiden</span>', '<span data-i18n="pick_coin_flip">Münze werfen & entscheiden</span>'],
  ['<span>Direkt im Fokus starten 🧘</span>', '<span data-i18n="pick_start_focus">Direkt im Fokus starten 🧘</span>'],

  // Sport
  ['<span class="truncate">Programme</span>', '<span class="truncate" data-i18n="sport_tab_presets">Programme</span>'],
  ['<span class="truncate">Baukasten</span>', '<span class="truncate" data-i18n="sport_tab_builder">Baukasten</span>'],
  ['<span class="truncate">Lexikon</span>', '<span class="truncate" data-i18n="sport_tab_library">Lexikon</span>'],
  ['<span class="truncate">1-3 Löffel</span>', '<span class="truncate" data-i18n="sport_tab_spoons">1-3 Löffel</span>'],
  ['<span>Wähle ein vorgefertigtes Workout:</span>', '<span data-i18n="sport_choose_workout">Wähle ein vorgefertigtes Workout:</span>'],
  ['<span class="text-lime-300/80 font-mono text-[10px]">Keine Geräte nötig</span>', '<span class="text-lime-300/80 font-mono text-[10px]" data-i18n="sport_no_equipment">Keine Geräte nötig</span>'],
  ['<label class="text-[10px] text-gray-400 font-bold block mb-1">⏱️ Dauer / Umfang</label>', '<label class="text-[10px] text-gray-400 font-bold block mb-1" data-i18n="sport_duration_scope">⏱️ Dauer / Umfang</label>'],
  ['<label class="text-[10px] text-gray-400 font-bold block mb-1">🎯 Fokus-Zone</label>', '<label class="text-[10px] text-gray-400 font-bold block mb-1" data-i18n="sport_focus_zone">🎯 Fokus-Zone</label>'],
  ['<label class="text-[10px] text-gray-400 font-bold block mb-1">🪑 Verfügbares Equipment</label>', '<label class="text-[10px] text-gray-400 font-bold block mb-1" data-i18n="sport_available_equip">🪑 Verfügbares Equipment</label>'],
  ['<label class="text-[10px] text-gray-400 font-bold block mb-1">⚡ Intervall-Taktung (Übung/Pause)</label>', '<label class="text-[10px] text-gray-400 font-bold block mb-1" data-i18n="sport_interval_timing">⚡ Intervall-Taktung (Übung/Pause)</label>'],
  ['<span>🛋️ 100% Nachbarschafts-Freundlich</span>', '<span data-i18n="sport_quiet_apartment">🛋️ 100% Nachbarschafts-Freundlich</span>'],
  ['<span class="text-[9px] px-1.5 py-0.2 rounded-md bg-lime-500/20 text-lime-300 font-mono font-bold">Flüsterleise</span>', '<span class="text-[9px] px-1.5 py-0.2 rounded-md bg-lime-500/20 text-lime-300 font-mono font-bold" data-i18n="sport_whisper_quiet">Flüsterleise</span>'],
  ['Kein Springen, kein Trittschall, geräuschlos auf Teppich oder Parkett.', '<span data-i18n="sport_quiet_desc">Kein Springen, kein Trittschall, geräuschlos auf Teppich oder Parkett.</span>'],
  ['<span>Individuelles Workout Starten 🚀</span>', '<span data-i18n="sport_start_custom">Individuelles Workout Starten 🚀</span>'],
  ['Dein aktuelles Energie-Level', '<span data-i18n="sport_current_energy">Dein aktuelles Energie-Level</span>'],
  ['Übung absolviert & belohnen', '<span data-i18n="sport_exercise_reward">Übung absolviert & belohnen</span>'],

  // Safe Space
  ['<span class="truncate">Atem</span>', '<span class="truncate" data-i18n="safespace_tab_breath">Atem</span>'],
  ['<span class="truncate">Erdung</span>', '<span class="truncate" data-i18n="safespace_tab_anchor">Erdung</span>'],
  ['<span class="truncate">Augen</span>', '<span class="truncate" data-i18n="safespace_tab_eyes">Augen</span>'],
  ['<span class="truncate">Körper</span>', '<span class="truncate" data-i18n="safespace_tab_body">Körper</span>'],
  ['<span class="truncate">Sound</span>', '<span class="truncate" data-i18n="safespace_tab_sound">Sound</span>'],
  ['<span id="safespace-breath-text" class="text-xs font-bold text-teal-200 font-display px-3">Einatmen...</span>', '<span id="safespace-breath-text" class="text-xs font-bold text-teal-200 font-display px-3" data-i18n="safespace_breath_in">Einatmen...</span>'],
  ['<span>Bach-Sound ein</span>', '<span data-i18n="safespace_creek_sound">Bach-Sound ein</span>'],
  ['<span>20-20-20 Regel & Hand-Palming</span>', '<span data-i18n="safespace_eyes_rule">20-20-20 Regel & Hand-Palming</span>'],
  ['<span class="text-[9px] text-amber-300/80 font-semibold uppercase">Augen ruhen</span>', '<span class="text-[9px] text-amber-300/80 font-semibold uppercase" data-i18n="safespace_eyes_rest">Augen ruhen</span>'],
  ['<span>20s Augen-Timer starten</span>', '<span data-i18n="safespace_eyes_start">20s Augen-Timer starten</span>'],
  ['<span>1️⃣ Nacken-Dehnung</span>', '<span data-i18n="safespace_stretch_neck">1️⃣ Nacken-Dehnung</span>'],
  ['<span>2️⃣ Schulterkreisen & Brustöffner</span>', '<span data-i18n="safespace_stretch_shoulders">2️⃣ Schulterkreisen & Brustöffner</span>'],
  ['<span>3️⃣ Handgelenke & Finger lockern</span>', '<span data-i18n="safespace_stretch_wrists">3️⃣ Handgelenke & Finger lockern</span>'],
  ['<span>90s Welle reiten 🌊</span>', '<span data-i18n="safespace_wave_90s">90s Welle reiten 🌊</span>'],
  ['<span>Sichern 💾</span>', '<span data-i18n="safespace_save_anchor">Sichern 💾</span>'],

  // Calm
  ['Physiologischer Seufzer (Stanford Neuroscience)', '<span data-i18n="calm_sigh_title">Physiologischer Seufzer (Stanford Neuroscience)</span>'],
  ['Die schnellste biologische Methode zur Senkung von Herzfrequenz und CO₂-Druck', '<span data-i18n="calm_sigh_desc">Die schnellste biologische Methode zur Senkung von Herzfrequenz und CO₂-Druck</span>'],
  ['<span>Geführten Atem-Pacer starten</span>', '<span data-i18n="calm_start_pacer">Geführten Atem-Pacer starten</span>'],
  ['Bilaterale Stimulation / Schmetterlings-Umarmung', '<span data-i18n="calm_bilateral_title">Bilaterale Stimulation / Schmetterlings-Umarmung</span>'],
  ['<span>LINKS</span>', '<span data-i18n="calm_left">LINKS</span>'],
  ['<span>RECHTS</span>', '<span data-i18n="calm_right">RECHTS</span>'],
  ['<span>Rhythmus starten</span>', '<span data-i18n="calm_start_rhythm">Rhythmus starten</span>'],
  ['Neurogenes Ausschütteln (60s Shake-Out)', '<span data-i18n="calm_shake_title">Neurogenes Ausschütteln (60s Shake-Out)</span>'],
  ['Biologisches Entladen von Adrenalin aus Muskulatur und Faszien', '<span data-i18n="calm_shake_desc">Biologisches Entladen von Adrenalin aus Muskulatur und Faszien</span>'],
  ['<span>60s Timer starten</span>', '<span data-i18n="calm_start_shake">60s Timer starten</span>'],
  ['Spannungsthermometer (SUD 1–10)', '<span data-i18n="calm_sud_title">Spannungsthermometer (SUD 1–10)</span>'],
  ['Validierende Notfall-Leitsätze:', '<span data-i18n="calm_emergency_phrases">Validierende Notfall-Leitsätze:</span>'],
  ['Kostenfreie, vertrauliche und professionelle Ansprechpartner rund um die Uhr:', '<span data-i18n="calm_helpline_title">Kostenfreie, vertrauliche und professionelle Ansprechpartner rund um die Uhr:</span>'],

  // Audio / DJ
  ['<span>Sounds</span>', '<span data-i18n="audio_sounds_tab">Sounds</span>'],
  ['<span>Musik & Medien</span>', '<span data-i18n="audio_media_tab">Musik & Medien</span>'],
  ['<span>Noodle DJ</span>', '<span data-i18n="audio_dj_tab">Noodle DJ</span>'],

  // Reports
  ['<span>Statistiken</span>', '<span data-i18n="report_stats_tab">Statistiken</span>'],
  ['<span>Wissens-Labor</span>', '<span data-i18n="report_learn_tab">Wissens-Labor</span>'],
  ['<span>Balance-Index</span>', '<span data-i18n="report_balance_index">Balance-Index</span>'],
  ['<span>Aktivitäts-Trend</span>', '<span data-i18n="report_activity_trend">Aktivitäts-Trend</span>'],
  ['<span>Kategorie-Verteilung</span>', '<span data-i18n="report_cat_distribution">Kategorie-Verteilung</span>'],
  ['<span>Erledigte Aufgaben</span>', '<span data-i18n="report_completed_tasks">Erledigte Aufgaben</span>']
];

let count = 0;
for (const [target, replacement] of replacements) {
  if (html.includes(target)) {
    html = html.split(target).join(replacement);
    count++;
  }
}

fs.writeFileSync('index.html', html, 'utf8');
console.log(`Successfully replaced ${count} target elements with data-i18n in index.html`);
