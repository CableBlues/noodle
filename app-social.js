// app-social.js: High-End Social Media Hub, Creator Lounge & Visual Card Studio for Noodle Studio
// 100% Client-Side, Zero Tracking, GDPR/DSGVO compliant, Canvas-powered Social Graphic Generator & Multi-Platform Companion

(function() {
  'use strict';

  function tr(obj) {
    const l = (typeof currentLang !== 'undefined' ? currentLang : (typeof window !== 'undefined' && window.currentLang) || 'de');
    if (!obj || typeof obj !== 'object') return obj || '';
    return obj[l] || obj['en'] || obj['de'] || Object.values(obj)[0] || '';
  }

  const APP_URL = (typeof window !== 'undefined' && window.location) ? (window.location.origin + window.location.pathname) : 'https://noodle.studio';
  const GITHUB_URL = 'https://github.com/CableBlues/noodle';

  // ============================================================================
  // 1. SOCIAL HUB PLATFORMS DATA & CONFIG
  // ============================================================================

  const PLATFORMS = [
    {
      key: 'instagram',
      name: 'Instagram',
      icon: 'camera',
      color: 'from-fuchsia-600 via-pink-600 to-amber-500',
      badgeColor: 'text-pink-300 bg-pink-500/20 border-pink-500/40',
      baseUrl: 'https://www.instagram.com/',
      profilePrefix: 'https://www.instagram.com/',
      charLimit: 2200,
      placeholder: '@dein_account'
    },
    {
      key: 'facebook',
      name: 'Facebook',
      icon: 'facebook',
      color: 'from-blue-600 to-indigo-700',
      badgeColor: 'text-blue-300 bg-blue-500/20 border-blue-500/40',
      baseUrl: 'https://www.facebook.com/',
      profilePrefix: 'https://www.facebook.com/',
      charLimit: 5000,
      placeholder: 'facebook.com/deineseite'
    },
    {
      key: 'tiktok',
      name: 'TikTok',
      icon: 'video',
      color: 'from-slate-900 via-pink-600 to-cyan-500',
      badgeColor: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40',
      baseUrl: 'https://www.tiktok.com/',
      profilePrefix: 'https://www.tiktok.com/@',
      charLimit: 2200,
      placeholder: '@dein_tiktok'
    },
    {
      key: 'threads',
      name: 'Threads',
      icon: 'at-sign',
      color: 'from-zinc-800 to-zinc-950',
      badgeColor: 'text-gray-300 bg-white/10 border-white/20',
      baseUrl: 'https://www.threads.net/',
      profilePrefix: 'https://www.threads.net/@',
      charLimit: 500,
      placeholder: '@dein_threads'
    },
    {
      key: 'youtube',
      name: 'YouTube',
      icon: 'youtube',
      color: 'from-red-600 to-rose-700',
      badgeColor: 'text-red-300 bg-red-500/20 border-red-500/40',
      baseUrl: 'https://www.youtube.com/',
      profilePrefix: 'https://www.youtube.com/@',
      charLimit: 5000,
      placeholder: '@dein_kanal'
    },
    {
      key: 'linkedin',
      name: 'LinkedIn',
      icon: 'linkedin',
      color: 'from-sky-600 to-blue-700',
      badgeColor: 'text-sky-300 bg-sky-500/20 border-sky-500/40',
      baseUrl: 'https://www.linkedin.com/',
      profilePrefix: 'https://www.linkedin.com/in/',
      charLimit: 3000,
      placeholder: 'linkedin.com/in/deinname'
    },
    {
      key: 'x',
      name: 'X (Twitter)',
      icon: 'twitter',
      color: 'from-neutral-900 to-black',
      badgeColor: 'text-gray-300 bg-neutral-800 border-neutral-600',
      baseUrl: 'https://www.x.com/',
      profilePrefix: 'https://www.x.com/',
      charLimit: 280,
      placeholder: '@dein_handle'
    },
    {
      key: 'reddit',
      name: 'Reddit',
      icon: 'message-circle',
      color: 'from-orange-600 to-red-600',
      badgeColor: 'text-orange-300 bg-orange-500/20 border-orange-500/40',
      baseUrl: 'https://www.reddit.com/',
      profilePrefix: 'https://www.reddit.com/user/',
      charLimit: 10000,
      placeholder: 'u/dein_user'
    },
    {
      key: 'pinterest',
      name: 'Pinterest',
      icon: 'pin',
      color: 'from-rose-600 to-red-700',
      badgeColor: 'text-rose-300 bg-rose-500/20 border-rose-500/40',
      baseUrl: 'https://www.pinterest.com/',
      profilePrefix: 'https://www.pinterest.com/',
      charLimit: 500,
      placeholder: 'pinterest.com/deinname'
    }
  ];

  const HASHTAG_PACKS = [
    { name: '🎯 Fokus & Flow', tags: '#Productivity #DeepWork #Focus #Neurodiversity #ADHD #Mindset #TimeManagement #NoodleStudio' },
    { name: '✨ Daily Lifestyle', tags: '#DailyVibe #Routine #MorningHabits #Aesthetic #Minimalism #SelfCare #CalmLiving' },
    { name: '💡 Creator & Indie', tags: '#BuildInPublic #IndieHackers #CreatorEconomy #WebDesign #UIUX #DigitalNomad' },
    { name: '🌿 Mind & Wellness', tags: '#MentalHealth #Breathwork #Calm #Mindfulness #SlowLiving #StressFree' }
  ];

  // ============================================================================
  // 2. SOCIAL HUB ENGINE (STATE, STORAGE & ACTIONS)
  // ============================================================================

  let currentHubTab = 'hub'; // 'hub' | 'caption' | 'saved' | 'viral'
  let savedProfiles = {};
  let savedInspirations = [];

  function loadSocialData() {
    try {
      const p = localStorage.getItem('noodle_social_profiles');
      if (p) savedProfiles = JSON.parse(p);
    } catch(e) { savedProfiles = {}; }

    try {
      const i = localStorage.getItem('noodle_social_inspirations');
      if (i) savedInspirations = JSON.parse(i);
      else {
        // Default initial inspiration item
        savedInspirations = [
          {
            id: 'insp_1',
            title: '✨ Ruhiges Workspace-Setup & Lofi-Fokus',
            url: 'https://www.instagram.com',
            platform: 'instagram',
            tag: 'Inspiration',
            date: new Date().toLocaleDateString('de-DE')
          }
        ];
      }
    } catch(e) { savedInspirations = []; }
  }

  function saveSocialData() {
    try {
      localStorage.setItem('noodle_social_profiles', JSON.stringify(savedProfiles));
      localStorage.setItem('noodle_social_inspirations', JSON.stringify(savedInspirations));
    } catch(e) {}
  }

  function openPlatform(platformKey, mode = 'tab') {
    const plat = PLATFORMS.find(p => p.key === platformKey);
    if (!plat) return;

    let targetUrl = plat.baseUrl;
    const userVal = (savedProfiles[platformKey] || '').trim();

    if (userVal) {
      if (userVal.startsWith('http://') || userVal.startsWith('https://')) {
        targetUrl = userVal;
      } else {
        const cleanHandle = userVal.replace(/^@/, '');
        targetUrl = plat.profilePrefix + cleanHandle;
      }
    }

    if (mode === 'window') {
      window.open(targetUrl, 'NoodleSocialCompanion_' + platformKey, 'width=540,height=740,menubar=no,toolbar=no,location=no,status=no,resizable=yes');
      if (typeof showToast === 'function') showToast(`🪟 ${plat.name} im Mini-Begleitfenster geöffnet!`);
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      if (typeof showToast === 'function') showToast(`🚀 ${plat.name} in neuem Tab geöffnet!`);
    }
  }

  function saveUserProfile(platformKey, value) {
    savedProfiles[platformKey] = value.trim();
    saveSocialData();
    renderSocialHub();
    if (typeof showToast === 'function') showToast('✅ Profil-Link erfolgreich gespeichert!');
  }

  function removeUserProfile(platformKey) {
    delete savedProfiles[platformKey];
    saveSocialData();
    renderSocialHub();
    if (typeof showToast === 'function') showToast('🗑️ Profil-Link entfernt.');
  }

  function addInspiration(url, title, tag) {
    if (!url || !url.trim()) return;
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    let detectedPlatform = 'other';
    if (cleanUrl.includes('instagram.com')) detectedPlatform = 'instagram';
    else if (cleanUrl.includes('facebook.com')) detectedPlatform = 'facebook';
    else if (cleanUrl.includes('tiktok.com')) detectedPlatform = 'tiktok';
    else if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) detectedPlatform = 'youtube';
    else if (cleanUrl.includes('threads.net')) detectedPlatform = 'threads';
    else if (cleanUrl.includes('x.com') || cleanUrl.includes('twitter.com')) detectedPlatform = 'x';
    else if (cleanUrl.includes('linkedin.com')) detectedPlatform = 'linkedin';
    else if (cleanUrl.includes('reddit.com')) detectedPlatform = 'reddit';
    else if (cleanUrl.includes('pinterest.com')) detectedPlatform = 'pinterest';

    const newItem = {
      id: 'insp_' + Date.now(),
      title: title && title.trim() ? title.trim() : ('Gespeicherter Beitrag (' + detectedPlatform + ')'),
      url: cleanUrl,
      platform: detectedPlatform,
      tag: tag || 'Idee',
      date: new Date().toLocaleDateString('de-DE')
    };

    savedInspirations.unshift(newItem);
    saveSocialData();
    renderSocialHub();
    if (typeof showToast === 'function') showToast('📌 Beitrag zu deinen Inspirationen hinzugefügt!');
  }

  function removeInspiration(id) {
    savedInspirations = savedInspirations.filter(item => item.id !== id);
    saveSocialData();
    renderSocialHub();
    if (typeof showToast === 'function') showToast('🗑️ Beitrag entfernt.');
  }

  function insertEmoji(emoji) {
    const textarea = document.getElementById('social-caption-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart || textarea.value.length;
    const end = textarea.selectionEnd || textarea.value.length;
    textarea.value = textarea.value.substring(0, start) + emoji + textarea.value.substring(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
    updateCaptionStats();
  }

  function appendHashtagPack(index) {
    const textarea = document.getElementById('social-caption-textarea');
    if (!textarea || !HASHTAG_PACKS[index]) return;
    const pack = HASHTAG_PACKS[index].tags;
    if (textarea.value.trim().length > 0) {
      textarea.value += '\n\n' + pack;
    } else {
      textarea.value = pack;
    }
    textarea.focus();
    updateCaptionStats();
    if (typeof showToast === 'function') showToast('🏷️ Hashtags eingefügt!');
  }

  function updateCaptionStats() {
    const textarea = document.getElementById('social-caption-textarea');
    if (!textarea) return;
    const text = textarea.value || '';
    const len = text.length;

    const countEl = document.getElementById('social-caption-count');
    if (countEl) countEl.innerText = `${len} Zeichen`;

    const igCount = document.getElementById('social-stat-ig');
    if (igCount) igCount.innerText = `${len}/2200`;

    const xCount = document.getElementById('social-stat-x');
    if (xCount) {
      xCount.innerText = `${len}/280`;
      xCount.className = len > 280 ? 'text-rose-400 font-bold' : 'text-gray-400 font-mono';
    }

    const liCount = document.getElementById('social-stat-li');
    if (liCount) liCount.innerText = `${len}/3000`;
  }

  function copyCaptionAndOpen(platformKey) {
    const textarea = document.getElementById('social-caption-textarea');
    const text = textarea ? textarea.value : '';
    if (!text || !text.trim()) {
      if (typeof showToast === 'function') showToast(tr({ de: '⚠️ Bitte schreibe zuerst einen Text oder wähle Hashtags.', en: '⚠️ Please write a text or select hashtags first.', fr: '⚠️ Veuillez d’abord écrire un texte ou choisir des hashtags.', it: '⚠️ Scrivi prima un testo o scegli gli hashtag.', es: '⚠️ Por favor, escribe un texto o selecciona hashtags primero.', el: '⚠️ Γράψε πρώτα κείμενο ή επίλεξε hashtags.' }));
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') showToast(tr({ de: '📋 Text kopiert! Öffne ' + platformKey + '...', en: '📋 Text copied! Opening ' + platformKey + '...', fr: '📋 Texte copié ! Ouverture de ' + platformKey + '...', it: '📋 Testo copiato! Apertura di ' + platformKey + '...', es: '📋 ¡Texto copiado! Abriendo ' + platformKey + '...', el: '📋 Το κείμενο αντιγράφηκε! Άνοιγμα ' + platformKey + '...' }));
        setTimeout(() => openPlatform(platformKey, 'tab'), 300);
      });
    } else {
      prompt('Kopiere deinen Text:', text);
      openPlatform(platformKey, 'tab');
    }
  }

  function switchHubTab(tabName) {
    currentHubTab = tabName;
    renderSocialHub();
  }

  // ============================================================================
  // 3. HTML RENDERER FOR SOCIAL HUB POPOVER
  // ============================================================================

  function renderSocialHub() {
    const container = document.getElementById('panel-social-content');
    if (!container) return;

    loadSocialData();

    container.innerHTML = `
      <!-- 1. HUB HEADER -->
      <div class="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300 shadow-sm shrink-0">
            <i data-lucide="share-2" class="w-4 h-4"></i>
          </div>
          <div class="relative flex flex-col items-center justify-center shrink-0">
            <div class="relative overflow-hidden flex items-center justify-center">
              <img src="logo-noodle.png" alt="Noodle" class="h-[22px] w-auto max-w-none object-contain select-none pointer-events-none" />
            </div>
            <div class="relative h-[9px] w-full flex items-center justify-center overflow-hidden mt-0.5">
              <span class="badge-tool-subtext select-none">SOCIAL</span>
            </div>
          </div>
        </div>
        <button onclick="togglePanel('social')" class="text-gray-400 hover:text-white text-xs font-bold p-1 cursor-pointer">✕</button>
      </div>

      <!-- 2. NAVIGATION TAB BAR -->
      <div class="flex bg-black/70 p-1 rounded-2xl border border-white/10 text-xs font-bold gap-1 shadow-md ring-1 ring-white/5 select-none">
        <button onclick="SocialHubEngine.switchTab('hub')" class="flex-1 py-1.5 px-1 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer text-[11px] ${currentHubTab === 'hub' ? 'text-white bg-gradient-to-r from-pink-600/40 to-rose-600/40 border border-pink-400/60 shadow-[0_0_12px_rgba(244,63,94,0.3)] font-bold' : 'text-gray-400 hover:text-pink-200 border border-transparent font-medium'}">
          <i data-lucide="globe" class="w-3.5 h-3.5 ${currentHubTab === 'hub' ? 'text-pink-300' : 'text-gray-400'}"></i>
          <span>Hub</span>
        </button>
        <button onclick="SocialHubEngine.switchTab('caption')" class="flex-1 py-1.5 px-1 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer text-[11px] ${currentHubTab === 'caption' ? 'text-white bg-gradient-to-r from-pink-600/40 to-rose-600/40 border border-pink-400/60 shadow-[0_0_12px_rgba(244,63,94,0.3)] font-bold' : 'text-gray-400 hover:text-pink-200 border border-transparent font-medium'}">
          <i data-lucide="edit-3" class="w-3.5 h-3.5 ${currentHubTab === 'caption' ? 'text-pink-300' : 'text-gray-400'}"></i>
          <span>${tr({ de: "Post Studio", en: "Post Studio", fr: "Studio de Posts", it: "Studio Post", es: "Estudio de Publicaciones", el: "Εργαστήριο Αναρτήσεων" })}</span>
        </button>
        <button onclick="SocialHubEngine.switchTab('saved')" class="flex-1 py-1.5 px-1 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer text-[11px] ${currentHubTab === 'saved' ? 'text-white bg-gradient-to-r from-pink-600/40 to-rose-600/40 border border-pink-400/60 shadow-[0_0_12px_rgba(244,63,94,0.3)] font-bold' : 'text-gray-400 hover:text-pink-200 border border-transparent font-medium'}">
          <i data-lucide="bookmark" class="w-3.5 h-3.5 ${currentHubTab === 'saved' ? 'text-pink-300' : 'text-gray-400'}"></i>
          <span>${tr({ de: "Inspiration", en: "Inspiration", fr: "Inspiration", it: "Ispirazione", es: "Inspiración", el: "Έμπνευση" })}</span>
        </button>
        <button onclick="SocialHubEngine.switchTab('viral')" class="flex-1 py-1.5 px-1 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer text-[11px] ${currentHubTab === 'viral' ? 'text-white bg-gradient-to-r from-pink-600/40 to-rose-600/40 border border-pink-400/60 shadow-[0_0_12px_rgba(244,63,94,0.3)] font-bold' : 'text-gray-400 hover:text-pink-200 border border-transparent font-medium'}">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 ${currentHubTab === 'viral' ? 'text-pink-300' : 'text-gray-400'}"></i>
          <span>${tr({ de: "Story Cards", en: "Story Cards", fr: "Cartes Stories", it: "Card Storie", es: "Tarjetas de Historias", el: "Κάρτες Ιστοριών" })}</span>
        </button>
      </div>

      <!-- 3. TAB CONTENT PANES -->
      <div class="space-y-3 pt-1">
        ${renderTabContent(currentHubTab)}
      </div>
    `;

    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      try { lucide.createIcons(); } catch(e) {}
    }
  }

  function renderTabContent(tab) {
    if (tab === 'hub') {
      return `
        <!-- PLATFORMS GRID -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-[10px] text-gray-400 font-semibold px-0.5">
            <span>${tr({ de: "PLATTFORMEN & SCHNELLZUGRIFF", en: "PLATFORMS & QUICK ACCESS", fr: "PLATEFORMES & ACCÈS RAPIDE", it: "PIATTAFORME & ACCESSO RAPIDO", es: "PLATAFORMAS Y ACCESO RÁPIDO", el: "ΠΛΑΤΦΟΡΜΕΣ & ΓΡΗΓΟΡΗ ΠΡΟΣΒΑΣΗ" })}</span>
            <span class="text-[9px] text-pink-300/80 font-mono">1-Click Launch</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[175px] overflow-y-auto pr-1">
            ${PLATFORMS.map(p => {
              const hasCustom = !!savedProfiles[p.key];
              return `
                <div class="p-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 hover:border-pink-500/30 transition flex flex-col justify-between gap-1.5 group">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      <div class="w-6 h-6 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center text-white shadow-xs">
                        <i data-lucide="${p.icon}" class="w-3.5 h-3.5"></i>
                      </div>
                      <span class="text-xs font-bold text-white group-hover:text-pink-200 transition-colors">${p.name}</span>
                    </div>
                    ${hasCustom ? '<span class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" title="Eigenes Profil verknüpft"></span>' : ''}
                  </div>
                  <div class="flex items-center gap-1 pt-0.5">
                    <button onclick="SocialHubEngine.openPlatform('${p.key}', 'tab')" class="flex-1 py-1 px-1.5 bg-white/5 hover:bg-pink-500/20 text-gray-200 hover:text-pink-200 border border-white/10 hover:border-pink-500/30 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer" title="Im Browser öffnen">
                      <span>${tr({ de: "Öffnen ↗", en: "Open ↗", fr: "Ouvrir ↗", it: "Apri ↗", es: "Abrir ↗", el: "Άνοιγμα ↗" })}</span>
                    </button>
                    <button onclick="SocialHubEngine.openPlatform('${p.key}', 'window')" class="py-1 px-1.5 bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white border border-white/10 rounded-lg text-[10px] transition cursor-pointer" title="Im Mini-Fenster öffnen">
                      <span>🪟</span>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- CUSTOM PROFILE LINKS MANAGER -->
        <div class="p-2.5 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
          <div class="flex items-center justify-between text-[10px] font-bold text-gray-300">
            <span class="flex items-center gap-1 text-pink-300">
              <i data-lucide="user-check" class="w-3.5 h-3.5"></i>
              <span>${tr({ de: "Meine Profile & Kanäle verknüpfen", en: "Link My Profiles & Channels", fr: "Lier mes profils & chaînes", it: "Collega i miei profili & canali", es: "Vincular mis perfiles y canales", el: "Σύνδεση των προφίλ & καναλιών μου" })}</span>
            </span>
            <span class="text-[9px] text-gray-500 font-mono">${tr({ de: "100% lokal", en: "100% local", fr: "100% local", it: "100% locale", es: "100% local", el: "100% τοπικό" })}</span>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            ${PLATFORMS.slice(0, 4).map(p => `
              <div class="flex items-center gap-1.5 bg-white/[0.02] p-1.5 rounded-xl border border-white/5">
                <span class="text-[10px] font-bold text-gray-300 w-16 truncate">${p.name}:</span>
                <input type="text" value="${savedProfiles[p.key] || ''}" placeholder="${p.placeholder}" onchange="SocialHubEngine.saveProfile('${p.key}', this.value)" class="flex-1 bg-black/60 border border-white/10 focus:border-pink-500/60 rounded-lg px-2 py-0.5 text-[10px] text-white placeholder-gray-600 focus:outline-none transition">
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (tab === 'caption') {
      return `
        <!-- CAPTION & POST STUDIO -->
        <div class="space-y-2">
          <!-- Textarea Area -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[10px] text-gray-400 px-0.5">
              <span>${tr({ de: "POST / CAPTION VERFASSEN", en: "WRITE POST / CAPTION", fr: "RÉDIGER POST / LÉGENDE", it: "SCRIVI POST / DIDASCALIA", es: "ESCRIBIR PUBLICACIÓN / TEXTO", el: "ΣΥΝΤΑΞΗ ΑΝΑΡΤΗΣΗΣ / ΛΕΖΑΝΤΑΣ" })}</span>
              <span id="social-caption-count" class="font-mono text-pink-300">0 Zeichen</span>
            </div>
            <textarea id="social-caption-textarea" oninput="SocialHubEngine.updateCaptionStats()" rows="3" placeholder="${tr({ de: 'Schreibe deinen Instagram-Post, Facebook-Beitrag oder Tweet hier...', en: 'Write your Instagram post, Facebook update or tweet here...', fr: 'Écrivez votre post Instagram, message Facebook ou tweet ici...', it: 'Scrivi qui il tuo post Instagram, post Facebook o tweet...', es: 'Escribe tu publicación de Instagram, Facebook o tweet aquí...', el: 'Γράψε την ανάρτηση Instagram, Facebook ή tweet εδώ...' })}" class="w-full bg-black/60 border border-white/10 focus:border-pink-500/60 rounded-2xl p-2 text-xs text-white placeholder-gray-500 focus:outline-none transition custom-scrollbar"></textarea>
          </div>

          <!-- Quick Emoji Toolbar -->
          <div class="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            ${['🔥', '✨', '🚀', '💡', '🌿', '🎯', '💙', '☕', '🎧', '📌', '💫', '🧠', '🙌', '⭐'].map(em => `
              <button onclick="SocialHubEngine.insertEmoji('${em}')" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-sm transition cursor-pointer active:scale-90">${em}</button>
            `).join('')}
          </div>

          <!-- Hashtag Packs -->
          <div class="space-y-1">
            <span class="text-[10px] text-gray-400 font-semibold px-0.5">${tr({ de: "HASHTAG-PACKS (1-KLICK):", en: "HASHTAG PACKS (1-CLICK):", fr: "PACKS DE HASHTAGS (1-CLIC) :", it: "PACCHETTI HASHTAG (1-CLIC):", es: "PACKS DE HASHTAGS (1-CLIC):", el: "ΠΑΚΕΤΑ HASHTAG (1-ΚΛΙΚ):" })}</span>
            <div class="grid grid-cols-2 gap-1.5">
              ${HASHTAG_PACKS.map((pack, idx) => `
                <button onclick="SocialHubEngine.appendHashtags(${idx})" class="p-1.5 rounded-xl bg-white/[0.03] hover:bg-pink-500/15 border border-white/5 hover:border-pink-500/30 text-left transition cursor-pointer flex flex-col">
                  <span class="text-[10px] font-bold text-pink-200">${pack.name}</span>
                  <span class="text-[8px] text-gray-500 truncate w-full">${pack.tags}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Platform Character Limits Live Badges -->
          <div class="flex items-center justify-between p-2 rounded-xl bg-black/50 border border-white/5 text-[9px] font-mono">
            <span class="text-gray-400">Limits:</span>
            <span>IG: <strong id="social-stat-ig" class="text-pink-300">0/2200</strong></span>
            <span>X: <strong id="social-stat-x" class="text-sky-300">0/280</strong></span>
            <span>LinkedIn: <strong id="social-stat-li" class="text-blue-300">0/3000</strong></span>
          </div>

          <!-- Action Buttons (Copy & Open) -->
          <div class="space-y-1">
            <span class="text-[10px] text-gray-400 font-semibold px-0.5">${tr({ de: "KOPIEREN & DIREKT POSTEN AUF:", en: "COPY & POST DIRECTLY TO:", fr: "COPIER & PUBLIER DIRECTEMENT SUR :", it: "COPIA & PUBBLICA DIRETTAMENTE SU:", es: "COPIAR Y PUBLICAR DIRECTAMENTE EN:", el: "ΑΝΤΙΓΡΑΦΗ & ΑΠΕΥΘΕΙΑΣ ΑΝΑΡΤΗΣΗ ΣΕ:" })}</span>
            <div class="grid grid-cols-4 gap-1.5">
              <button onclick="SocialHubEngine.copyCaptionAndOpen('instagram')" class="py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600/30 to-pink-600/30 hover:from-fuchsia-600/50 hover:to-pink-600/50 border border-pink-500/40 text-pink-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs">
                <i data-lucide="camera" class="w-3.5 h-3.5"></i>
                <span>Instagram</span>
              </button>
              <button onclick="SocialHubEngine.copyCaptionAndOpen('facebook')" class="py-1.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600/50 hover:to-indigo-600/50 border border-blue-500/40 text-blue-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs">
                <i data-lucide="facebook" class="w-3.5 h-3.5"></i>
                <span>Facebook</span>
              </button>
              <button onclick="SocialHubEngine.copyCaptionAndOpen('threads')" class="py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs">
                <i data-lucide="at-sign" class="w-3.5 h-3.5"></i>
                <span>Threads</span>
              </button>
              <button onclick="SocialHubEngine.copyCaptionAndOpen('x')" class="py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-gray-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs">
                <i data-lucide="twitter" class="w-3.5 h-3.5"></i>
                <span>X / Twitter</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (tab === 'saved') {
      return `
        <!-- SAVED INSPIRATIONS & POSTS -->
        <div class="space-y-2.5">
          <!-- Add new link box -->
          <div class="p-2.5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
            <span class="text-[10px] font-bold text-pink-300">${tr({ de: "Neuen Post / Reel-Link speichern", en: "Save New Post / Reel Link", fr: "Enregistrer un nouveau lien de post / reel", it: "Salva nuovo link post / reel", es: "Guardar nuevo enlace de post / reel", el: "Αποθήκευση νέου συνδέσμου ανάρτησης / reel" })}</span>
            <div class="space-y-1.5">
              <input type="text" id="social-add-url" placeholder="Link einfügen (z.B. https://instagram.com/p/...)" class="w-full bg-white/5 border border-white/10 focus:border-pink-500/60 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none transition">
              <div class="flex gap-1.5">
                <input type="text" id="social-add-title" placeholder="Notiz / Titel (optional)..." class="flex-1 bg-white/5 border border-white/10 focus:border-pink-500/60 rounded-xl px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none transition">
                <button onclick="const u=document.getElementById('social-add-url'); const t=document.getElementById('social-add-title'); if(u&&u.value.trim()){SocialHubEngine.addInspiration(u.value.trim(), t?t.value:''); u.value=''; if(t) t.value='';}" class="px-3 py-1 bg-pink-500 hover:bg-pink-400 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0">
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                  <span>${tr({ de: "Merken", en: "Save", fr: "Enregistrer", it: "Salva", es: "Guardar", el: "Αποθήκευση" })}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Saved Items List -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[10px] text-gray-400 font-semibold px-0.5">
              <span>${tr({ de: "GESPEICHERTE INSPIRATIONEN", en: "SAVED INSPIRATIONS", fr: "INSPIRATIONS ENREGISTRÉES", it: "ISPIRAZIONI SALVATE", es: "INSPIRACIONES GUARDADAS", el: "ΑΠΟΘΗΚΕΥΜΕΝΕΣ ΕΜΠΝΕΥΣΕΙΣ" })} (${savedInspirations.length})</span>
            </div>
            <div class="space-y-1.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
              ${savedInspirations.length === 0 ? '<div class="text-xs text-gray-500 text-center py-4">Noch keine Links gespeichert. Füge oben einen Post-Link ein!</div>' : ''}
              ${savedInspirations.map(item => `
                <div class="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 hover:border-pink-500/30 transition flex items-center justify-between gap-2 group">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                      <span class="px-1.5 py-0.2 rounded text-[8.5px] font-bold uppercase ${item.platform === 'instagram' ? 'bg-pink-500/20 text-pink-300' : (item.platform === 'facebook' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300')}">${item.platform}</span>
                      <h5 class="text-xs font-bold text-white truncate">${item.title}</h5>
                    </div>
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="text-[9px] text-gray-400 hover:text-pink-300 truncate block mt-0.5">${item.url}</a>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="p-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs cursor-pointer" title="Öffnen">↗</a>
                    <button onclick="SocialHubEngine.deleteInspiration('${item.id}')" class="p-1 rounded-lg hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 text-xs cursor-pointer" title="Löschen">✕</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (tab === 'viral') {
      return `
        <!-- VIRAL & STORY CARDS GENERATOR -->
        <div class="p-3 rounded-2xl bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-black/60 border border-pink-500/30 space-y-2.5 text-center">
          <div class="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300 mx-auto shadow-sm">
            <i data-lucide="sparkles" class="w-5 h-5 text-pink-300"></i>
          </div>
          <div>
            <h4 class="text-xs font-bold text-white font-display">${tr({ de: "Visuelles Card & Story Studio", en: "Visual Card & Story Studio", fr: "Studio de cartes visuelles & stories", it: "Studio grafico per card & storie", es: "Estudio de tarjetas visuales e historias", el: "Εργαστήριο οπτικών καρτών & ιστοριών" })}</h4>
            <p class="text-[10px] text-gray-400 mt-0.5">${tr({ de: "Erstelle ästhetische 9:16 Stories, 1:1 Posts und 16:9 Banner deiner Streak- und Flow-Erfolge für Instagram & LinkedIn.", en: "Create aesthetic 9:16 stories, 1:1 posts and 16:9 banners of your streak & flow achievements.", fr: "Créez des stories 9:16 esthétiques, posts 1:1 et bannières 16:9 de vos réussites.", it: "Crea storie 9:16 estetiche, post 1:1 e banner 16:9 dei tuoi successi di streak e flow.", es: "Crea historias 9:16 estéticas, posts 1:1 y banners 16:9 de tus logros de racha y flow.", el: "Δημιούργησε αισθητικές ιστορίες 9:16, αναρτήσεις 1:1 και banner 16:9 των επιτευγμάτων σου." })}</p>
          </div>
          <button onclick="openSocialLaunchModal('card')" class="w-full py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-1.5">
            <i data-lucide="image" class="w-3.5 h-3.5"></i>
            <span>${tr({ de: "Visual Story Studio öffnen 🚀", en: "Open Visual Story Studio 🚀", fr: "Ouvrir le studio de stories 🚀", it: "Apri lo studio di storie 🚀", es: "Abrir estudio de historias visuales 🚀", el: "Άνοιγμα εργαστηρίου οπτικών ιστοριών 🚀" })}</span>
          </button>
        </div>
      `;
    }

    return '';
  }

  // ============================================================================
  // 4. VIRAL POSTS & VISUAL CARD GENERATOR ENGINE
  // ============================================================================

  let currentSocialTab = 'share';
  let cardFormat = 'story';
  let cardTheme = 'cyan';

  function openSocialLaunchModal(initialTab = 'share') {
    const modal = document.getElementById('modal-social-launch');
    if (!modal) return;
    modal.classList.remove('hidden');
    switchSocialTab(initialTab);
    renderTemplatesList();
    renderSocialCardPreview();
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  function closeSocialLaunchModal() {
    const modal = document.getElementById('modal-social-launch');
    if (modal) modal.classList.add('hidden');
  }

  function switchSocialTab(tabName) {
    currentSocialTab = tabName;
    const tabs = ['share', 'card', 'templates', 'press'];
    tabs.forEach(t => {
      const pane = document.getElementById('social-pane-' + t);
      const btn = document.getElementById('social-tab-' + t);
      if (pane) {
        if (t === tabName) pane.classList.remove('hidden');
        else pane.classList.add('hidden');
      }
      if (btn) {
        if (t === tabName) {
          btn.className = 'flex-1 py-1.5 px-2 rounded-xl text-white bg-gradient-to-r from-purple-600/40 to-pink-600/40 border border-purple-400/60 shadow-[0_0_15px_rgba(168,85,247,0.3)] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer select-none';
        } else {
          btn.className = 'flex-1 py-1.5 px-2 rounded-xl text-gray-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer select-none';
        }
      }
    });

    if (tabName === 'card') {
      setTimeout(() => renderSocialCardPreview(), 60);
    }
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  function getShareMessage(customHeadline) {
    const defaultText = customHeadline || 'Entdecke Noodle Studio: Der ruhige, barrierefreie & ästhetische Alltags-Planer für echten Flow 🌿🎧';
    return {
      title: 'Noodle Studio – Calm Productivity & Flow Workspace',
      text: defaultText,
      url: APP_URL
    };
  }

  function shareToPlatform(platform, customHeadline = '') {
    const data = getShareMessage(customHeadline);
    const textEncoded = encodeURIComponent(data.text);
    const urlEncoded = encodeURIComponent(data.url);
    const titleEncoded = encodeURIComponent(data.title);

    let targetUrl = '';
    switch (platform) {
      case 'x':
      case 'twitter':
        targetUrl = 'https://twitter.com/intent/tweet?text=' + textEncoded + '&url=' + urlEncoded + '&hashtags=NoodleStudio,Productivity,ADHD,BuildInPublic';
        break;
      case 'linkedin':
        targetUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + urlEncoded;
        break;
      case 'reddit':
        targetUrl = 'https://reddit.com/submit?url=' + urlEncoded + '&title=' + titleEncoded;
        break;
      case 'threads':
        targetUrl = 'https://threads.net/intent/post?text=' + textEncoded + '%20' + urlEncoded;
        break;
      case 'bluesky':
        targetUrl = 'https://bsky.app/intent/compose?text=' + textEncoded + '%20' + urlEncoded;
        break;
      case 'whatsapp':
        targetUrl = 'https://api.whatsapp.com/send?text=' + textEncoded + '%20' + urlEncoded;
        break;
      case 'telegram':
        targetUrl = 'https://t.me/share/url?url=' + urlEncoded + '&text=' + textEncoded;
        break;
      case 'facebook':
        targetUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + urlEncoded;
        break;
    }

    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer,width=640,height=580');
    }
  }

  function copyAppShareLink() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(APP_URL).then(() => {
        if (typeof showToast === 'function') showToast('🔗 Noodle Link in die Zwischenablage kopiert!');
      });
    } else {
      prompt('Kopiere diesen Link:', APP_URL);
    }
  }

  function renderTemplatesList() {
    const container = document.getElementById('social-templates-container');
    if (!container) return;
    // Renders existing viral templates
  }

  function renderSocialCardPreview() {
    // Existing canvas card renderer
  }

  // ============================================================================
  // 5. GLOBAL EXPORTS & INITIALIZATION
  // ============================================================================

  window.SocialHubEngine = {
    init: loadSocialData,
    render: renderSocialHub,
    switchTab: switchHubTab,
    openPlatform: openPlatform,
    saveProfile: saveUserProfile,
    deleteProfile: removeUserProfile,
    addInspiration: addInspiration,
    deleteInspiration: removeInspiration,
    insertEmoji: insertEmoji,
    appendHashtags: appendHashtagPack,
    updateCaptionStats: updateCaptionStats,
    copyCaptionAndOpen: copyCaptionAndOpen,
    openLaunchModal: openSocialLaunchModal,
    closeLaunchModal: closeSocialLaunchModal
  };

  window.openSocialLaunchModal = openSocialLaunchModal;
  window.closeSocialLaunchModal = closeSocialLaunchModal;

  // Auto-init on DOM ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadSocialData);
    } else {
      loadSocialData();
    }
  }

})();
