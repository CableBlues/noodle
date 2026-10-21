/**
 * @file onboarding.js
 * @module OnboardingTour
 * @description
 * Repräsentative, breite und interaktive Grand Tour für Noodle Studio.
 * Führt neue und erfahrene Nutzer durch die 5 Kern-Säulen des Systems:
 * 1. 3D-Board & Workspaces (Raum & Organisation)
 * 2. Flow-Engine & Fokus-Cockpit (Konzentration & Zeit)
 * 3. Ambient Audio & Klangarchitektur (Soundscapes & Radio)
 * 4. Das Alltags-Atelier (Kochen, Einkaufen, Pause & Körper)
 * 5. Freiheit & Souveränität (100% Local-First, P2P-Sync & Themes)
 */

let onboardingCurrentStep = 0;

const ONBOARDING_STATIONS = [
  {
    tabLabel: { de: "1. Board & Raum", en: "1. Board & Space" },
    badge: "1 / 5",
    icon: "layout-dashboard",
    color: "from-purple-500 via-indigo-500 to-violet-600",
    glowColor: "rgba(168, 85, 247, 0.25)",
    title: {
      de: "Dein persönlicher Lebens- & Arbeitsraum",
      en: "Your Personal Life & Flow Workspace"
    },
    subtitle: {
      de: "3D-Tiefenwirkung, Multi-Workspaces & tabellenbasierte Klarheit",
      en: "3D Depth, Multi-Workspaces & Effortless Card Clarity"
    },
    description: {
      de: "Kein Tab-Chaos und keine sterile Listenansicht mehr. Noodle Studio vereint deine Gedanken, Aufgaben und Vorhaben in einem architektonisch gestalteten Raum. Organisiere dich mühelos mit Tiefenstaffelung und wechsle blitzschnell zwischen Lebensbereichen.",
      en: "No more tab overload or sterile list dumps. Noodle Studio unifies your thoughts, tasks, and daily routines in a mindfully designed spatial workspace with depth and rapid context switching."
    },
    action: {
      label: { de: "Routine-Vorlagen laden 📋", en: "Load Routine Presets 📋" },
      icon: "layout-template",
      fn: "openRoutinePresetsModal"
    },
    features: [
      {
        icon: "columns",
        tag: { de: "3D-Kanban", en: "3D Kanban" },
        title: { de: "Tiefenstaffelung & Haptik", en: "Spatial Card Physics" },
        desc: { de: "Spalten mit echter räumlicher Tiefe, flüssigem Drag & Drop und individuellen Farbmarkierungen.", en: "Columns with tangible visual depth, fluid drag & drop, and customized color tags." },
        shortcut: "Drag & Drop"
      },
      {
        icon: "layers",
        tag: { de: "Workspaces", en: "Workspaces" },
        title: { de: "Privat, Arbeit & Fokus", en: "Private, Work & Focus" },
        desc: { de: "Trenne Berufliches von Privatem mit einem Klick in der Kopfzeile oben links.", en: "Separate private life and work projects cleanly with the workspace switcher at top-left." },
        shortcut: "Tasten 1 | 2"
      },
      {
        icon: "search",
        tag: { de: "Instant-Search", en: "Instant Search" },
        title: { de: "Command Palette [Strg+K]", en: "Command Palette [Ctrl+K]" },
        desc: { de: "Finde Aufgaben, wechsle Modi und steuere Werkzeuge ab dem ersten getippten Buchstaben.", en: "Locate tasks, trigger actions, and access tools instantly from the very first keypress." },
        shortcut: "Strg + K"
      },
      {
        icon: "table-properties",
        tag: { de: "Schnell-Aktionen", en: "Quick Actions" },
        title: { de: "Tabellen auf Knopfdruck", en: "Instant Board Setup" },
        desc: { de: "Leere dein Board, befülle es mit smarten Routinen oder passe Kartendetails im Handumdrehen an.", en: "Clear boards, populate curated routine templates, or tailor cards in seconds." },
        shortcut: "Tabellen-Menü"
      }
    ]
  },
  {
    tabLabel: { de: "2. Flow & Fokus", en: "2. Flow & Focus" },
    badge: "2 / 5",
    icon: "zap",
    color: "from-amber-500 via-orange-500 to-yellow-600",
    glowColor: "rgba(245, 158, 11, 0.25)",
    title: {
      de: "Prokrastination brechen: Sofort in den Flow",
      en: "Overcome Inertia: Instant Deep Flow"
    },
    subtitle: {
      de: "Geführte Mikroschritte, Instant-Start & der „Was nun?“-Pilot",
      en: "Guided Micro-Steps, Instant Start & The “What Now?” Assistant"
    },
    description: {
      de: "Gegen Entscheidungsmüdigkeit und das Gefühl des Überwältigtseins: Noodle bricht große Hürden in machbare Einzelschritte herunter, filtert automatisch nach den Aufgaben von heute und schirmt störende Reize im Zen-Modus komplett ab.",
      en: "Overcome decision fatigue and overwhelm. Noodle breaks mountains into doable micro-steps, filters automatically for today’s essentials, and shields distractions in Zen Mode."
    },
    action: {
      label: { de: "Fokus-Cockpit öffnen ⏱️", en: "Open Focus Cockpit ⏱️" },
      icon: "timer",
      fn: "openTimerCockpitFromTour"
    },
    features: [
      {
        icon: "play",
        tag: { de: "Instant-Start", en: "Instant Start" },
        title: { de: "⚡ Sofortiger Schritt-für-Schritt Start", en: "⚡ Guided Micro-Step Kickoff" },
        desc: { de: "Startet ohne Nachdenken deinen aktuellen Arbeitstag mit passendem Timer und Einzelschritten.", en: "Kicks off your session immediately with matched timers, checklists, and momentum." },
        shortcut: "Space / Klick"
      },
      {
        icon: "sparkles",
        tag: { de: "Klarheit", en: "Clarity" },
        title: { de: "„Was nun?“ Tages-Assistent", en: "“What Now?” Assistant" },
        desc: { de: "Schlägt dir ausschließlich Aufgaben und Termine vor, die heute wirklich relevant sind.", en: "Filters exclusively for tasks and deadlines that matter right now today." },
        shortcut: "Header Button"
      },
      {
        icon: "timer",
        tag: { de: "Intervall-Training", en: "Intervals" },
        title: { de: "Pomodoro, Sprint & Ultra", en: "Pomodoro, Sprint & Ultra" },
        desc: { de: "25-Minuten Pomodoro, 50-Minuten Flow-Sprints oder maßgeschneiderte Countdown-Zyklen.", en: "25m classic focus, 50m deep sprints, or tailored interval timers." },
        shortcut: "Taste T"
      },
      {
        icon: "maximize-2",
        tag: { de: "Tunnelblick", en: "Zero Noise" },
        title: { de: "Zen-Modus [Taste Z]", en: "Zen Mode [Key Z]" },
        desc: { de: "Blendet alle Menüleisten, Tabs und Ränder aus – pure, ungestörte Konzentration.", en: "Hides toolbars, sidebars, and distractions for 100% focused concentration." },
        shortcut: "Taste Z"
      }
    ]
  },
  {
    tabLabel: { de: "3. Klang & Audio", en: "3. Soundscapes" },
    badge: "3 / 5",
    icon: "headphones",
    color: "from-sky-500 via-cyan-500 to-teal-600",
    glowColor: "rgba(56, 189, 248, 0.25)",
    title: {
      de: "Klangarchitektur für Konzentration & Ruhe",
      en: "Acoustic Sanctuary for Focus & Calm"
    },
    subtitle: {
      de: "Natur-Soundscapes, binaurale Frequenzen & weltweites Radio",
      en: "Nature Soundscapes, Binaural Frequencies & Global Radio"
    },
    description: {
      de: "Akustischer Raum zur mentalen Einstimmung: Mische Regen, Kaminfeuer und Wellen zu deinem perfekten Soundteppich, aktiviere Alpha-Wellen für tiefes Arbeiten oder schalte auf knisterfreies weltweites Kultur- und Lo-Fi-Radio.",
      en: "Acoustic space for mental readiness: Blend rain, fireplace, and waves into your custom soundscape, tap into alpha binaural beats, or stream curated ad-free global Lo-Fi and culture radio."
    },
    action: {
      label: { de: "Audio-Studio testen 🎧", en: "Explore Audio Studio 🎧" },
      icon: "music",
      fn: "openAudioStudioFromTour"
    },
    features: [
      {
        icon: "sliders",
        tag: { de: "Multi-Mixer", en: "Sound Mixer" },
        title: { de: "Natur-Soundscapes", en: "Nature Ambience" },
        desc: { de: "Regen, Kaminfeuer, Wald, Wellen, Café und Wind stufenlos zu deiner Klangwelt mischen.", en: "Mix rain, crackling fire, forest, waves, cafe, and wind to your exact mood." },
        shortcut: "Sound Studio"
      },
      {
        icon: "activity",
        tag: { de: "Neuro-Fokus", en: "Neuro-Focus" },
        title: { de: "Binaurale Alpha- & Theta-Beats", en: "Binaural Alpha & Theta Beats" },
        desc: { de: "Wissenschaftlich erprobte Frequenzen zur Steigerung von Fokus, Lernen und Meditation.", en: "Scientifically grounded frequencies to stimulate deep work, learning, and calm." },
        shortcut: "Audio Studio"
      },
      {
        icon: "radio",
        tag: { de: "Live-Stream", en: "Live Streams" },
        title: { de: "Kuriertes Welt-Radio", en: "Curated Global Radio" },
        desc: { de: "Internationale Kultur-, Jazz- und Lo-Fi-Sender ohne störende Werbeunterbrechungen.", en: "Direct streaming of international culture, ambient, and Lo-Fi stations without ads." },
        shortcut: "Radio Panel"
      },
      {
        icon: "volume-2",
        tag: { de: "Souveränität", en: "Master Control" },
        title: { de: "Master-Mute & Fader", en: "Master Mute & Fader" },
        desc: { de: "Sofortige Lautstärkekontrolle in der Menüleiste; stummschalten ohne lautes Losdröhnen.", en: "Header quick slider; instant mute without surprise autoplay." },
        shortcut: "Lautsprecher Icon"
      }
    ]
  },
  {
    tabLabel: { de: "4. Alltag & Leben", en: "4. Everyday Life" },
    badge: "4 / 5",
    icon: "coffee",
    color: "from-emerald-500 via-teal-500 to-green-600",
    glowColor: "rgba(16, 185, 129, 0.25)",
    title: {
      de: "Arbeit ist nicht alles: Leben, Kochen & Achtsamkeit",
      en: "Life Beyond Work: Cooking, Habits & Mindful Pauses"
    },
    subtitle: {
      de: "Ernährung, Einkaufen, geführte Erholung und Feierabend",
      en: "Nutrition, Smart Groceries, Guided Reset & Rituals"
    },
    description: {
      de: "Ein nachhaltiger Arbeitstag braucht ausgewogene Ernährung, Bewegung und echte Erholung. Noodle verbindet Aufgabenmanagement mit einem Koch- und Vorratsstudio, smarter Einkaufsliste, physiologischen Atem-Pausen und einem bewussten Feierabend-Ritual.",
      en: "Sustainable productivity requires healthy nutrition, movement, and genuine recovery. Noodle pairs task flows with a smart cooking & pantry hub, aisle-sorted grocery shopping, breathing resets, and evening closure."
    },
    action: {
      label: { de: "Pause & Safe Space ansehen ☕", en: "Explore Pause & Safe Space ☕" },
      icon: "coffee",
      fn: "openPauseDropdownFromTour"
    },
    features: [
      {
        icon: "chef-hat",
        tag: { de: "Küche & Genuss", en: "Kitchen & Meal Prep" },
        title: { de: "Kochstudio & Vorrat [Taste K]", en: "Cooking Studio & Pantry [K]" },
        desc: { de: "Rezeptsammlung, automatischer Portionsrechner, Vorratsliste und parallele Koch-Timer.", en: "Curated recipes, auto portion scaler, pantry manager, and simultaneous timers." },
        shortcut: "Taste K"
      },
      {
        icon: "shopping-cart",
        tag: { de: "Einkaufen", en: "Groceries" },
        title: { de: "Einkaufsliste mit Markt-Modus", en: "Supermarket Fullscreen Mode" },
        desc: { de: "Nach Supermarkt-Gängen sortiert, optimiert für schnelles Abhaken auf dem Smartphone.", en: "Sorted by grocery aisles; streamlined for quick checking in the supermarket." },
        shortcut: "Taste E"
      },
      {
        icon: "wind",
        tag: { de: "Nervensystem", en: "Nervous System" },
        title: { de: "Geführte Atem-Pausen (4-7-8)", en: "Guided Breathing Resets" },
        desc: { de: "Box-Breathing (Navy SEALs), 4-7-8 Tiefenruhe, 20-20-20 Augenpause & Schreibtisch-Stretches.", en: "Navy SEAL box breathing, 4-7-8 deep calm, 20-20-20 eye relief, and desk stretches." },
        shortcut: "Pause Button"
      },
      {
        icon: "sun",
        tag: { de: "Abschluss", en: "Shutdown" },
        title: { de: "Feierabend-Ritual", en: "Mindful Evening Shutdown" },
        desc: { de: "Den Tag bewusst abschließen, Erfolge visualisieren und den Kopf frei für den Feierabend machen.", en: "Close your day intentionally, celebrate completed tasks, and disconnect guilt-free." },
        shortcut: "Tagesende"
      }
    ]
  },
  {
    tabLabel: { de: "5. Freiheit & Sync", en: "5. Privacy & Sync" },
    badge: "5 / 5",
    icon: "shield-check",
    color: "from-violet-500 via-purple-500 to-fuchsia-600",
    glowColor: "rgba(168, 85, 247, 0.25)",
    title: {
      de: "Deine Daten gehören dir – 100% lokal & privat",
      en: "Your Data Belongs to You — 100% Local & Private"
    },
    subtitle: {
      de: "Kein Zwangskonto, kein Tracking, P2P-Sync & native App",
      en: "Zero Tracking, No Mandatory Account, P2P Sync & Offline PWA"
    },
    description: {
      de: "Noodle arbeitet nach dem Local-First-Prinzip. Alle deine Aufgaben, Notizen, Rezepte und Routinen verbleiben auf deinem Gerät. Du kannst Noodle als native Desktop- oder Mobil-App installieren und deine Geräte ohne Drittanbieter-Server synchronisieren.",
      en: "Noodle operates on a Local-First philosophy. All your boards, checklists, and notes stay securely on your hardware. Install Noodle as a native app and sync devices without commercial surveillance."
    },
    action: {
      label: { de: "Noodle als App installieren 📲", en: "Install Noodle as App 📲" },
      icon: "download",
      fn: "triggerPwaInstallFromTour"
    },
    features: [
      {
        icon: "lock",
        tag: { de: "Privatsphäre", en: "Privacy" },
        title: { de: "100% Client-Side (DSGVO)", en: "100% Client-Side Privacy" },
        desc: { de: "Keine Registrierungspflicht, keine Werbetracker, kein Verkauf von Nutzerdaten.", en: "Zero tracking, no forced sign-ups, and no monetization of your personal data." },
        shortcut: "Local-First"
      },
      {
        icon: "repeat",
        tag: { de: "Sync", en: "Sync" },
        title: { de: "P2P- & Cloud-Synchronisation", en: "P2P & Encrypted Sync" },
        desc: { de: "Echtzeit-Synchronisation zwischen Laptop, Tablet und Smartphone via verschlüsseltem QR-Code.", en: "Real-time sync between desktop, tablet, and smartphone via encrypted QR codes." },
        shortcut: "Optionen"
      },
      {
        icon: "palette",
        tag: { de: "Ästhetik", en: "Themes" },
        title: { de: "10 kuratierte Farbwelten", en: "10 Handcrafted Themes" },
        desc: { de: "Botanical, Aurora, Obsidian, Latte, Cyberpunk, Fruity und mehr – angepasst an dein Auge.", en: "Botanical, Aurora, Obsidian, Latte, Cyberpunk, Fruity, and more to soothe your eyes." },
        shortcut: "Farbwähler"
      },
      {
        icon: "smartphone",
        tag: { de: "Offline", en: "Offline" },
        title: { de: "PWA / Standalone Installation", en: "PWA Standalone App" },
        desc: { de: "Installiere Noodle direkt im Browser als native App mit Desktop-Icon und 100% Offline-Betrieb.", en: "Install directly from browser with dock icon, full window mode, and offline caching." },
        shortcut: "Desktop & Mobil"
      }
    ]
  }
];

function getTourTranslation(obj) {
  const lang = (typeof currentLang !== 'undefined' ? currentLang : 'de');
  if (!obj) return '';
  return obj[lang] || obj['de'] || obj['en'] || Object.values(obj)[0] || '';
}

function renderOnboardingStep() {
  const modal = document.getElementById('onboarding-modal');
  if (!modal) return;

  const station = ONBOARDING_STATIONS[onboardingCurrentStep];
  const lang = (typeof currentLang !== 'undefined' ? currentLang : 'de');

  // 1. Station Tabs
  const tabsContainer = modal.querySelector('#onboarding-tabs-bar');
  if (tabsContainer) {
    tabsContainer.innerHTML = ONBOARDING_STATIONS.map((st, idx) => {
      const isActive = idx === onboardingCurrentStep;
      return `
        <button onclick="goToOnboardingStep(${idx})" class="px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
          isActive 
            ? 'bg-white/15 text-white border border-white/20 shadow-sm scale-102' 
            : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
        }">
          <span class="w-1.5 h-1.5 rounded-full ${isActive ? 'bg-purple-400 animate-pulse' : 'bg-zinc-600'}"></span>
          <span>${getTourTranslation(st.tabLabel)}</span>
        </button>
      `;
    }).join('');
  }

  // 2. Left Column Info
  const badgeEl = modal.querySelector('#onboarding-station-badge');
  if (badgeEl) badgeEl.innerText = station.badge;

  const iconWrap = modal.querySelector('#onboarding-hero-icon');
  if (iconWrap) {
    iconWrap.className = `w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${station.color} p-0.5 shadow-2xl flex items-center justify-center shrink-0`;
    iconWrap.innerHTML = `
      <div class="w-full h-full bg-[#0e0e17]/85 rounded-[14px] sm:rounded-[22px] flex items-center justify-center">
        <i data-lucide="${station.icon}" class="w-7 h-7 sm:w-8 sm:h-8 text-white"></i>
      </div>
    `;
  }

  const titleEl = modal.querySelector('#onboarding-title');
  if (titleEl) titleEl.innerText = getTourTranslation(station.title);

  const subEl = modal.querySelector('#onboarding-subtitle');
  if (subEl) subEl.innerText = getTourTranslation(station.subtitle);

  const descEl = modal.querySelector('#onboarding-desc');
  if (descEl) descEl.innerText = getTourTranslation(station.description);

  // 3. Action Button
  const actionBtn = modal.querySelector('#onboarding-action-trigger');
  if (actionBtn && station.action) {
    actionBtn.innerHTML = `
      <i data-lucide="${station.action.icon || 'play'}" class="w-4 h-4"></i>
      <span>${getTourTranslation(station.action.label)}</span>
    `;
    actionBtn.onclick = () => {
      executeTourAction(station.action.fn);
    };
  }

  // 4. Right Column: 4 Feature Mini-Cards
  const featuresGrid = modal.querySelector('#onboarding-features-grid');
  if (featuresGrid && station.features) {
    featuresGrid.innerHTML = station.features.map(feat => `
      <div class="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition flex flex-col justify-between gap-1.5 shadow-sm group">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
              <i data-lucide="${feat.icon}" class="w-4 h-4"></i>
            </div>
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300/80">${getTourTranslation(feat.tag)}</span>
          </div>
          ${feat.shortcut ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/5 text-zinc-400 border border-white/10">${feat.shortcut}</span>` : ''}
        </div>
        <div>
          <h4 class="text-xs font-bold text-white mb-0.5">${getTourTranslation(feat.title)}</h4>
          <p class="text-[11px] text-zinc-400 leading-snug">${getTourTranslation(feat.desc)}</p>
        </div>
      </div>
    `).join('');
  }

  // 5. Ambient Glow behind card
  const glow = modal.querySelector('#onboarding-ambient-glow');
  if (glow) {
    glow.style.background = station.glowColor || 'rgba(168, 85, 247, 0.2)';
  }

  // 6. Navigation Controls
  const prevBtn = modal.querySelector('#onboarding-btn-prev');
  if (prevBtn) {
    if (onboardingCurrentStep === 0) {
      prevBtn.classList.add('invisible');
    } else {
      prevBtn.classList.remove('invisible');
    }
  }

  const nextBtn = modal.querySelector('#onboarding-btn-next');
  if (nextBtn) {
    if (onboardingCurrentStep === ONBOARDING_STATIONS.length - 1) {
      nextBtn.innerHTML = `<span>${lang === 'de' ? 'Studio erkunden 🚀' : 'Explore Studio 🚀'}</span>`;
    } else {
      nextBtn.innerHTML = `<span>${lang === 'de' ? 'Nächste Station →' : 'Next Station →'}</span>`;
    }
  }

  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    try { lucide.createIcons(); } catch(e) {}
  }
}

function goToOnboardingStep(idx) {
  if (idx >= 0 && idx < ONBOARDING_STATIONS.length) {
    onboardingCurrentStep = idx;
    renderOnboardingStep();
    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
  }
}

function handleOnboardingNext() {
  if (onboardingCurrentStep < ONBOARDING_STATIONS.length - 1) {
    onboardingCurrentStep++;
    renderOnboardingStep();
    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
  } else {
    closeOnboardingTour();
    if (typeof triggerPraise === 'function') triggerPraise();
  }
}

function handleOnboardingPrev() {
  if (onboardingCurrentStep > 0) {
    onboardingCurrentStep--;
    renderOnboardingStep();
    if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
  }
}

function executeTourAction(fnName) {
  closeOnboardingTour();
  if (fnName === 'openRoutinePresetsModal') {
    if (typeof openRoutinePresetsModal === 'function') openRoutinePresetsModal();
    else if (typeof handleReset === 'function') handleReset();
  } else if (fnName === 'openTimerCockpitFromTour') {
    if (typeof togglePanel === 'function') togglePanel('timer-presets');
    else if (typeof toggleTimer === 'function') toggleTimer();
  } else if (fnName === 'openAudioStudioFromTour') {
    if (typeof openAudioStudioMode === 'function') openAudioStudioMode('ambient');
    else if (typeof togglePanel === 'function') togglePanel('audio');
  } else if (fnName === 'openPauseDropdownFromTour') {
    if (typeof togglePanel === 'function') togglePanel('pause-dropdown');
  } else if (fnName === 'triggerPwaInstallFromTour') {
    if (typeof triggerPwaInstall === 'function') triggerPwaInstall();
  }
}

function closeOnboardingTour() {
  const modal = document.getElementById('onboarding-modal');
  if (modal) modal.classList.add('hidden');
  try {
    if (typeof AppStorage !== 'undefined' && AppStorage.set) {
      AppStorage.set('has_seen_onboarding', true);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem('has_seen_onboarding', 'true');
    }
  } catch (e) {}
}

function startOnboardingTour() {
  onboardingCurrentStep = 0;
  let modal = document.getElementById('onboarding-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'onboarding-modal';
    modal.className = 'fixed inset-0 z-[160000] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in select-none';
    modal.onclick = (e) => {
      if (e.target === modal) closeOnboardingTour();
    };

    modal.innerHTML = `
      <div class="relative w-full max-w-4xl bg-[#0d0d15]/98 border border-white/15 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(168,85,247,0.18)] p-5 sm:p-7 md:p-8 flex flex-col gap-5 overflow-hidden text-left animate-spring-modal max-h-[92vh] overflow-y-auto" onclick="event.stopPropagation()">
        
        <!-- Ambient Glow Orb -->
        <div id="onboarding-ambient-glow" class="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-60"></div>
        <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-pink-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <!-- TOP BAR: Brand, Stage Tracker & Close -->
        <div class="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-sm shrink-0">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
            </div>
            <div>
              <span class="text-[11px] font-extrabold tracking-wider text-purple-300 font-display uppercase">NOODLE STUDIO</span>
              <span class="text-xs text-zinc-400 ml-1.5 hidden sm:inline">· Interactive Tour & Workspace Guide</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span id="onboarding-station-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-purple-300">1 / 5</span>
            <button onclick="closeOnboardingTour()" class="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition cursor-pointer" title="Tour schließen [Esc]">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- STATIONS TABS BAR (Klickbare Direktnavigation) -->
        <div id="onboarding-tabs-bar" class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-white/5 relative z-10">
          <!-- Dynamisch gerendert -->
        </div>

        <!-- MAIN STAGE: TWO COLUMN SHOWCASE (Desktop) / STACK (Mobile) -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-stretch relative z-10">
          
          <!-- LEFT COLUMN (5 Cols): Station Hero, Essence & Immediate Action -->
          <div class="md:col-span-5 p-5 rounded-2xl bg-white/[0.025] border border-white/10 flex flex-col justify-between gap-4 shadow-sm">
            <div class="space-y-3">
              <div id="onboarding-hero-icon"></div>
              <div>
                <h3 id="onboarding-title" class="text-base sm:text-lg font-black font-display text-white leading-snug"></h3>
                <p id="onboarding-subtitle" class="text-xs font-semibold text-purple-300/90 mt-1"></p>
              </div>
              <p id="onboarding-desc" class="text-xs text-zinc-300/90 leading-relaxed"></p>
            </div>

            <!-- Direct Station Action Trigger -->
            <button id="onboarding-action-trigger" class="w-full py-2.5 px-3.5 bg-gradient-to-r from-purple-600/30 via-pink-600/25 to-purple-600/30 hover:from-purple-600/45 hover:to-pink-600/40 text-purple-200 hover:text-white border border-purple-400/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95">
              <!-- Dynamisch befüllt -->
            </button>
          </div>

          <!-- RIGHT COLUMN (7 Cols): 4 Interactive Feature Mini-Cards -->
          <div class="md:col-span-7 flex flex-col justify-between gap-3">
            <div id="onboarding-features-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 flex-1">
              <!-- Dynamisch gerendert: 4 Feature Mini-Cards -->
            </div>
          </div>

        </div>

        <!-- BOTTOM CONTROLS: Back, Progress & Next -->
        <div class="flex items-center justify-between border-t border-white/10 pt-3 relative z-10">
          <button id="onboarding-btn-prev" onclick="handleOnboardingPrev()" class="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
            <span>Zurück</span>
          </button>

          <div class="flex items-center gap-1.5">
            <span class="text-[11px] text-zinc-500 font-mono hidden sm:inline">Pfeiltasten [← / →] zum Blättern</span>
          </div>

          <button id="onboarding-btn-next" onclick="handleOnboardingNext()" class="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-black shadow-lg hover:shadow-purple-500/25 active:scale-95 transition cursor-pointer flex items-center gap-1.5">
            <span>Weiter →</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>

      </div>
    `;
    document.body.appendChild(modal);

    // Tastatur-Navigation (Pfeiltasten + Escape)
    document.addEventListener('keydown', (e) => {
      const activeModal = document.getElementById('onboarding-modal');
      if (!activeModal || activeModal.classList.contains('hidden')) return;
      if (e.key === 'Escape') {
        closeOnboardingTour();
      } else if (e.key === 'ArrowRight') {
        handleOnboardingNext();
      } else if (e.key === 'ArrowLeft') {
        handleOnboardingPrev();
      }
    });
  }

  modal.classList.remove('hidden');
  renderOnboardingStep();
  if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
}

if (typeof window !== 'undefined') {
  window.startOnboardingTour = startOnboardingTour;
  window.closeOnboardingTour = closeOnboardingTour;
  window.handleOnboardingNext = handleOnboardingNext;
  window.handleOnboardingPrev = handleOnboardingPrev;
  window.goToOnboardingStep = goToOnboardingStep;
}
if (typeof globalThis !== 'undefined') {
  globalThis.startOnboardingTour = startOnboardingTour;
  globalThis.closeOnboardingTour = closeOnboardingTour;
  globalThis.goToOnboardingStep = goToOnboardingStep;
}
