// onboarding.js - Interaktive Erstnutzer-Tour & Onboarding für Noodle
// ============================================================================

let onboardingCurrentStep = 0;

const ONBOARDING_STEPS = [
  {
    title: {
      de: "Willkommen bei Noodle! 🍜✨",
      en: "Welcome to Noodle! 🍜✨"
    },
    subtitle: {
      de: "Dein übersichtlicher Begleiter für Fokus, Alltag & Klarheit",
      en: "Your calm companion for focus, daily tasks & clarity"
    },
    icon: "sparkles",
    color: "from-purple-500 to-pink-500",
    badge: "1 / 4",
    description: {
      de: "Noodle verbindet intelligentes Aufgabenmanagement mit beruhigenden Soundscapes, Fokus-Timern und alltagsnahen Tools — ohne Reizüberflutung.",
      en: "Noodle combines intelligent task management with calming soundscapes, focus timers, and mindful daily tools — distraction-free."
    }
  },
  {
    title: {
      de: "Dein modulares Board 📋",
      en: "Your Modular Board 📋"
    },
    subtitle: {
      de: "Aufgaben, Termine & Notizen mühelos ordnen",
      en: "Organize tasks, appointments & notes with ease"
    },
    icon: "layout-grid",
    color: "from-cyan-500 to-teal-500",
    badge: "2 / 4",
    description: {
      de: "Organisiere deine Aufgaben in Tages- und Wochenspalten. Du kannst Spalten per Drag & Drop verschieben, eigene Spalten anlegen und Aufgaben mit Prioritätsfarben oder Wiederholungen 🔁 versehen.",
      en: "Manage tasks across daily and weekly columns. Reorder via drag & drop, create custom columns, and add priority colors or recurrences 🔁."
    }
  },
  {
    title: {
      de: "Eigene Routinen & Standards ✨",
      en: "Custom Routines & Lifestyle Presets ✨"
    },
    subtitle: {
      de: "Passend für deinen Alltag: Minimalist, ADHS-Fokus oder Deep Work",
      en: "Tailored to your lifestyle: Minimalist, ADHD-friendly or Deep Work"
    },
    icon: "sliders",
    color: "from-amber-500 to-rose-500",
    badge: "3 / 4",
    actionButton: true,
    description: {
      de: "Wähle vorkonfigurierte Routine-Standards oder erstelle deine eigene Vorlage. Beim Neuladen des Tagesplans erscheinen genau deine gewählten Aufgaben!",
      en: "Pick a preconfigured lifestyle preset or create your custom default template. Your chosen tasks will load every day!"
    }
  },
  {
    title: {
      de: "100% Offline & Datenhoheit 🛡️",
      en: "100% Offline & Data Privacy 🛡️"
    },
    subtitle: {
      de: "Deine Daten gehören dir — jederzeit sicher",
      en: "Your data stays yours — always safe and resilient"
    },
    icon: "shield-check",
    color: "from-emerald-500 to-teal-500",
    badge: "4 / 4",
    description: {
      de: "Alle Daten bleiben lokal auf deinem Gerät gespeichert (mit automatischer IndexedDB-Sicherung). Nutze optional den Multi-Device Cloud-Sync, um nahtlos zwischen Handy und PC zu wechseln.",
      en: "All data stays local on your device with automatic IndexedDB resilience. Optionally enable multi-device sync to switch smoothly between mobile and desktop."
    }
  }
];

function renderOnboardingStep() {
  const modal = document.getElementById('onboarding-modal');
  if (!modal) return;

  const step = ONBOARDING_STEPS[onboardingCurrentStep];
  const lang = (typeof currentLang !== 'undefined' ? currentLang : 'de');
  const tStr = (obj) => obj[lang] || obj['de'] || obj['en'] || Object.values(obj)[0];

  const titleEl = modal.querySelector('#onboarding-title');
  const subEl = modal.querySelector('#onboarding-subtitle');
  const descEl = modal.querySelector('#onboarding-desc');
  const iconWrap = modal.querySelector('#onboarding-icon-wrap');
  const badgeEl = modal.querySelector('#onboarding-step-badge');
  const dotsEl = modal.querySelector('#onboarding-dots');
  const nextBtn = modal.querySelector('#onboarding-btn-next');
  const prevBtn = modal.querySelector('#onboarding-btn-prev');

  if (titleEl) titleEl.innerText = tStr(step.title);
  if (subEl) subEl.innerText = tStr(step.subtitle);
  if (descEl) descEl.innerText = tStr(step.description);
  if (badgeEl) badgeEl.innerText = step.badge;

  if (iconWrap) {
    iconWrap.className = `w-16 h-16 rounded-3xl bg-gradient-to-br ${step.color} p-0.5 shadow-xl flex items-center justify-center text-white mb-4`;
    iconWrap.innerHTML = `<div class="w-full h-full bg-[#111118]/80 rounded-[22px] flex items-center justify-center"><i data-lucide="${step.icon}" class="w-8 h-8 text-white"></i></div>`;
  }

  if (dotsEl) {
    dotsEl.innerHTML = ONBOARDING_STEPS.map((_, idx) => `
      <span class="h-2 rounded-full transition-all duration-300 ${idx === onboardingCurrentStep ? 'w-6 bg-gradient-to-r from-purple-500 to-pink-500' : 'w-2 bg-white/20'}"></span>
    `).join('');
  }

  const actionWrap = modal.querySelector('#onboarding-action-wrap');
  if (actionWrap) {
    if (step.actionButton) {
      actionWrap.classList.remove('hidden');
    } else {
      actionWrap.classList.add('hidden');
    }
  }

  if (prevBtn) {
    if (onboardingCurrentStep === 0) {
      prevBtn.classList.add('invisible');
    } else {
      prevBtn.classList.remove('invisible');
    }
  }

  if (nextBtn) {
    if (onboardingCurrentStep === ONBOARDING_STEPS.length - 1) {
      nextBtn.innerHTML = `<span>${lang === 'de' ? 'Loslegen 🚀' : 'Get Started 🚀'}</span>`;
    } else {
      nextBtn.innerHTML = `<span>${lang === 'de' ? 'Weiter →' : 'Next →'}</span>`;
    }
  }

  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    try { lucide.createIcons(); } catch(e) {}
  }
}

function startOnboardingTour() {
  onboardingCurrentStep = 0;
  let modal = document.getElementById('onboarding-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'onboarding-modal';
    modal.className = 'fixed inset-0 z-[160000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none';
    modal.innerHTML = `
      <div class="mobile-modal-card animate-spring-modal w-full max-w-md bg-[#0f0f17]/98 border border-purple-500/30 rounded-3xl shadow-2xl p-6 sm:p-7 text-center relative overflow-hidden flex flex-col items-center">
        
        <!-- Background Ambient Glow -->
        <div class="absolute -top-20 -left-20 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -right-20 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Top Header: Badge & Skip Button -->
        <div class="w-full flex items-center justify-between mb-2">
          <span id="onboarding-step-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-purple-300">1 / 4</span>
          <button onclick="closeOnboardingTour()" class="text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer px-2 py-1 rounded-lg hover:bg-white/5">
            Überspringen
          </button>
        </div>

        <!-- Icon Container -->
        <div id="onboarding-icon-wrap" class="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 shadow-xl flex items-center justify-center text-white mb-4">
          <div class="w-full h-full bg-[#111118]/80 rounded-[22px] flex items-center justify-center">
            <i data-lucide="sparkles" class="w-8 h-8 text-white"></i>
          </div>
        </div>

        <!-- Text Area -->
        <h3 id="onboarding-title" class="text-lg font-black font-display text-white mb-1.5 leading-snug">Willkommen bei Noodle!</h3>
        <p id="onboarding-subtitle" class="text-xs font-semibold text-purple-300/90 mb-3.5"></p>
        <p id="onboarding-desc" class="text-xs text-gray-300/85 leading-relaxed mb-4 max-w-sm"></p>

        <!-- Optional Action Trigger for Presets -->
        <div id="onboarding-action-wrap" class="hidden mb-5 w-full max-w-xs">
          <button onclick="openRoutinePresetsModal(); closeOnboardingTour();" class="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-200 border border-amber-500/40 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95">
            <i data-lucide="sliders" class="w-3.5 h-3.5 text-amber-300"></i>
            <span>Routine-Presets & Standards wählen ✨</span>
          </button>
        </div>

        <!-- Progress Dots -->
        <div id="onboarding-dots" class="flex items-center gap-1.5 mb-6"></div>

        <!-- Action Controls -->
        <div class="w-full flex items-center gap-2.5">
          <button id="onboarding-btn-prev" onclick="handleOnboardingPrev()" class="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-2xl text-xs font-bold transition cursor-pointer invisible">
            ← Zurück
          </button>
          <button id="onboarding-btn-next" onclick="handleOnboardingNext()" class="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl text-xs font-black shadow-lg hover:shadow-purple-500/25 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5">
            <span>Weiter →</span>
          </button>
        </div>

      </div>
    `;
    document.body.appendChild(modal);
  }

  modal.classList.remove('hidden');
  renderOnboardingStep();
  if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
}

function handleOnboardingNext() {
  if (onboardingCurrentStep < ONBOARDING_STEPS.length - 1) {
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

// Onboarding wird auf Nutzer-Anforderung (Optionen-Menü oder Logo-Hover) gestartet
function checkFirstTimeOnboarding() {
  // Bewusst kein automatischer Popup beim Laden mehr
}

if (typeof window !== 'undefined') {
  window.startOnboardingTour = startOnboardingTour;
  window.closeOnboardingTour = closeOnboardingTour;
  window.handleOnboardingNext = handleOnboardingNext;
  window.handleOnboardingPrev = handleOnboardingPrev;
}
if (typeof globalThis !== 'undefined') {
  globalThis.startOnboardingTour = startOnboardingTour;
  globalThis.closeOnboardingTour = closeOnboardingTour;
}
