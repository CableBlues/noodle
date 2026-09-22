// utils.js Teil 2/2: Praise-Animation, Mini-Kalender & Datum/Streak-Update
function triggerPraiseAnimation(idx) {
  switch (idx) {
    case 0: // 1. Konfetti-Explosion
      triggerConfetti();
      break;
    case 1: // 2. Intensiveres Bildschirmwackeln & Skalierungs-Pop
      document.body.classList.add('animate-screen-shake');
      document.body.style.transform = 'scale(1.025)';
      setTimeout(() => {
        document.body.classList.remove('animate-screen-shake');
        document.body.style.transform = 'none';
      }, 450);
      break;
    case 2: // 3. Randglühen-Flash (Full Overlay)
      const flash = document.createElement('div');
      flash.className = 'fixed inset-0 z-[190000] pointer-events-none animate-glow-flash';
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 1200);
      break;
    case 3: // 4. Floating Emoji Rain (Thumbs up / Popper)
      const emojis = ['👍', '🎉', '✔️', '🚀', '🔥', '💪', '🧠', '🎈', '🤩'];
      for (let i = 0; i < 16; i++) {
        const el = document.createElement('div');
        el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        el.className = 'fixed text-4xl z-[190000] pointer-events-none animate-float-item select-none';
        el.style.left = `${Math.random() * 90 + 5}vw`;
        el.style.animationDelay = `${Math.random() * 0.5}s`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3200);
      }
      break;
    case 4: // 5. Shimmering Dopamine Bubbles (Schillernde Blasen)
      for (let i = 0; i < 35; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'fixed rounded-full pointer-events-none z-[190000]';
        const size = Math.random() * 45 + 15;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.background = `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6) 0%, rgba(168, 85, 247, 0.15) 40%, rgba(56, 189, 248, 0.45) 80%, rgba(255, 255, 255, 0) 100%)`;
        bubble.style.boxShadow = 'inset 0 0 12px rgba(255, 255, 255, 0.65), 0 4px 15px rgba(56, 189, 248, 0.25)';
        bubble.style.left = `${Math.random() * 100}vw`;
        bubble.style.bottom = `-60px`;
        
        const duration = Math.random() * 2.5 + 2.0;
        bubble.style.transition = `transform ${duration}s cubic-bezier(0.1, 0.8, 0.3, 1), opacity ${duration}s ease-out`;
        document.body.appendChild(bubble);
        
        requestAnimationFrame(() => {
          bubble.style.transform = `translateY(-${window.innerHeight + 120}px) translateX(${(Math.random() - 0.5) * 200}px) scale(1.4)`;
          bubble.style.opacity = '0';
        });
        
        setTimeout(() => bubble.remove(), duration * 1000);
      }
      break;
    case 5: // 6. Säulen-Sprung (Column Jump-Bounce)
      document.querySelectorAll('article').forEach(el => {
        el.classList.add('animate-spring-bounce');
        setTimeout(() => el.classList.remove('animate-spring-bounce'), 600);
      });
      break;
    case 6: // 7. Regenbogen-Fluss (Rainbow Sweep)
      const sweep = document.createElement('div');
      sweep.className = 'fixed inset-0 z-[190000] pointer-events-none animate-rainbow-sweep';
      document.body.appendChild(sweep);
      setTimeout(() => sweep.remove(), 1400);
      break;
    case 7: // 8. Sternschnuppen-Staub (Meteor-Shower)
      for (let i = 0; i < 22; i++) {
        const spark = document.createElement('div');
        spark.className = 'fixed w-2 h-2 rounded-full z-[190000] pointer-events-none animate-dust';
        spark.style.backgroundColor = i % 2 === 0 ? '#10b981' : '#a855f7';
        spark.style.left = `${Math.random() * 100}vw`;
        spark.style.top = `0px`;
        spark.style.animationDelay = `${Math.random() * 0.4}s`;
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 1500);
      }
      break;
    case 8: // 9. Floating Text Pop (Schwebender Fokus-Ausruf)
      const pop = document.createElement('div');
      const words = tr({ de: ["KLASSE!", "FLOW!", "PRODUKTIV!", "FOKUS!", "STARK!"], en: ["GREAT!", "FLOW!", "DOPAMINE!", "FOCUS!", "BOOM!"], es: ["GENIAL!", "FLOW!", "PRODUCTIVO!", "ENFOQUE!", "FUERTE!"], el: ["ΤΕΛΕΙΑ!", "FLOW!", "ΠΑΡΑΓΩΓΙΚΟΣ!", "ΕΣΤΙΑΣΗ!", "ΔΥΝΑΤΑ!"], fr: ["GÉNIAL!", "FLOW!", "PRODUCTIF!", "FOCUS!", "FORT!"], it: ["FANTASTICO!", "FLOW!", "PRODUTTIVO!", "FOCUS!", "FORTE!"] });
      pop.innerText = words[Math.floor(Math.random() * words.length)];
      pop.className = 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl md:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 z-[190000] pointer-events-none scale-0 opacity-0 transition-all duration-700 select-none';
      pop.style.textShadow = '0 10px 30px rgba(139,92,246,0.3)';
      document.body.appendChild(pop);
      requestAnimationFrame(() => {
        pop.style.transform = 'translate(-50%, -85%) scale(1.2)';
        pop.style.opacity = '1';
      });
      setTimeout(() => {
        pop.style.opacity = '0';
        setTimeout(() => pop.remove(), 700);
      }, 1100);
      break;
    case 9: // 10. Diagonal Lens Flare Sweep (Laser-Blitz)
      const flare = document.createElement('div');
      flare.className = 'fixed inset-0 z-[190000] pointer-events-none bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-full transition-transform duration-700 ease-out';
      document.body.appendChild(flare);
      requestAnimationFrame(() => {
        flare.style.transform = 'translateX(200%)';
      });
      setTimeout(() => flare.remove(), 800);
      break;
  }
}

let _lastRenderedCalDateKey = null;

function renderMiniCalendar(force = false) {
  const grid = document.getElementById('cal-days-grid');
  const title = document.getElementById('cal-month-title');
  if (!grid || !title) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
  const termineList = (state && state.items && state.items.termine) ? state.items.termine : [];
  const dateKey = `${year}-${month}-${todayDate}-${lang}-${termineList.length}`;

  if (!force && _lastRenderedCalDateKey === dateKey && grid.children.length > 0) {
    return;
  }
  _lastRenderedCalDateKey = dateKey;

  grid.innerHTML = '';

  const locales = { de: 'de-DE', en: 'en-US', el: 'el-GR', es: 'es-ES', fr: 'fr-FR', it: 'it-IT' };
  const monthName = new Intl.DateTimeFormat(locales[currentLang] || 'en-US', { month: 'long', year: 'numeric' }).format(now);
  title.innerText = monthName;

  const firstDayOfMonth = new Date(year, month, 1);
  let firstDayIndex = firstDayOfMonth.getDay();
  firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDayIndex; i++) {
    const empty = document.createElement('span');
    empty.className = 'text-transparent select-none pointer-events-none';
    empty.innerText = '';
    grid.appendChild(empty);
  }

  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  for (let day = 1; day <= daysInMonth; day++) {
    const daySpan = document.createElement('span');
    daySpan.innerText = day;
    
    const isToday = day === todayDate && month === todayMonth && year === todayYear;
    if (isToday) {
      daySpan.className = 'flex items-center justify-center h-5 w-5 bg-[var(--accent)] text-white font-bold rounded-lg shadow-[0_0_8px_rgba(139,92,246,0.5)] border border-[var(--accent-light)]/20 animate-pulse';
    } else {
      daySpan.className = 'flex items-center justify-center h-5 w-5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-all duration-150';
    }
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAppointments = (state.items && state.items.termine) 
      ? state.items.termine.filter(t => t.date === dateStr) 
      : [];
      
    if (dayAppointments.length > 0) {
      daySpan.className += ' border border-amber-400/40 relative shadow-[0_0_10px_rgba(245,158,11,0.15)]';
      
      const dot = document.createElement('span');
      dot.className = 'absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full shadow-[0_0_4px_rgba(245,158,11,0.8)] animate-pulse';
      daySpan.appendChild(dot);
    }

    // Tooltip-Beschriftung: Standardhinweis plus optionale Terminliste, falls vorhanden
    const tooltipAction = tr({ de: "Auf ein Datum klicken, um einen Termin einzutragen", en: "Click on a date to enter an appointment", es: "Haz clic en una fecha para añadir una cita", el: "Κάνε κλικ σε μια ημερομηνία για να καταχωρήσεις ραντεβού", fr: "Clique sur une date pour ajouter un rendez-vous", it: "Clicca su una data per inserire un appuntamento" });

    if (dayAppointments.length > 0) {
      const listStr = dayAppointments.map(t => {
        let loc = t.location ? ` (@ ${t.location})` : '';
        const allDayLabel = tr({ de: 'Ganztägig', en: 'All day', es: 'Todo el día', el: 'Ολοήμερο', fr: 'Toute la journée', it: 'Tutto il giorno' });
        return `${t.time || allDayLabel} · ${t.task}${loc}`;
      }).join('\n');
      daySpan.title = `${tooltipAction}\n\nTermine:\n${listStr}`;
    } else {
      daySpan.title = tooltipAction;
    }

    // Interaktiver Klick-Listener: Öffnet direkt das integrierte Formular
    daySpan.onclick = (e) => {
      e.stopPropagation();
      if (typeof toggleTerminForm === 'function') {
        toggleTerminForm(true, dateStr);
      }
    };
    
    grid.appendChild(daySpan);
  }
}

let calendarHoverTimeout = null;
let weatherHoverTimeout = null;

function toggleCalendarDropdown(event) {
  if (event) event.stopPropagation();
  const weatherEl = document.getElementById('panel-weather');
  if (weatherEl) weatherEl.classList.add('hidden');
  
  const calEl = document.getElementById('panel-calendar-dropdown');
  if (calEl) {
    const isHidden = calEl.classList.contains('hidden');
    if (isHidden) {
      calEl.classList.remove('hidden');
      renderMiniCalendar();
    } else {
      calEl.classList.add('hidden');
    }
  }
}
window.toggleCalendarDropdown = toggleCalendarDropdown;

function toggleWeatherDropdown(event) {
  if (event) event.stopPropagation();
  const calEl = document.getElementById('panel-calendar-dropdown');
  if (calEl) calEl.classList.add('hidden');
  
  const weatherEl = document.getElementById('panel-weather');
  if (weatherEl) {
    const isHidden = weatherEl.classList.contains('hidden');
    if (isHidden) {
      weatherEl.classList.remove('hidden');
      if (typeof updateWeatherDisplay === 'function') updateWeatherDisplay();
    } else {
      weatherEl.classList.add('hidden');
    }
  }
}
window.toggleWeatherDropdown = toggleWeatherDropdown;

function openWeatherHover() {
  if (weatherHoverTimeout) {
    clearTimeout(weatherHoverTimeout);
    weatherHoverTimeout = null;
  }
  if (calendarHoverTimeout) {
    clearTimeout(calendarHoverTimeout);
    calendarHoverTimeout = null;
  }
  const calEl = document.getElementById('panel-calendar-dropdown');
  if (calEl) calEl.classList.add('hidden');

  const el = document.getElementById('panel-weather');
  if (el) {
    el.classList.remove('hidden');
    if (typeof updateWeatherDisplay === 'function') updateWeatherDisplay();
  }
}
window.openWeatherHover = openWeatherHover;

function closeWeatherHover() {
  if (weatherHoverTimeout) clearTimeout(weatherHoverTimeout);
  weatherHoverTimeout = setTimeout(() => {
    const el = document.getElementById('panel-weather');
    const trigger = document.getElementById('date-weather-badge');
    const isOverEl = el && el.matches(':hover');
    const isOverTrigger = trigger && trigger.matches(':hover');
    if (el && !isOverEl && !isOverTrigger) {
      el.classList.add('hidden');
    }
  }, 180);
}
window.closeWeatherHover = closeWeatherHover;

function openCalendarHover() {
  if (calendarHoverTimeout) {
    clearTimeout(calendarHoverTimeout);
    calendarHoverTimeout = null;
  }
  if (weatherHoverTimeout) {
    clearTimeout(weatherHoverTimeout);
    weatherHoverTimeout = null;
  }
  const weatherEl = document.getElementById('panel-weather');
  if (weatherEl) weatherEl.classList.add('hidden');

  const el = document.getElementById('panel-calendar-dropdown');
  if (el) {
    el.classList.remove('hidden');
    renderMiniCalendar();
  }
}
window.openCalendarHover = openCalendarHover;

function closeCalendarHover() {
  if (calendarHoverTimeout) clearTimeout(calendarHoverTimeout);
  calendarHoverTimeout = setTimeout(() => {
    const el = document.getElementById('panel-calendar-dropdown');
    const trigger = document.getElementById('date-hover-wrapper');
    const isOverEl = el && el.matches(':hover');
    const isOverTrigger = trigger && trigger.matches(':hover');
    if (el && !isOverEl && !isOverTrigger) {
      el.classList.add('hidden');
    }
  }, 180);
}
window.closeCalendarHover = closeCalendarHover;

// Klick außerhalb schließt alle Header-Dropdowns & Popovers
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    // 1. Kalender
    const calEl = document.getElementById('panel-calendar-dropdown');
    const dateWrapper = document.getElementById('date-hover-wrapper');
    if (calEl && !calEl.classList.contains('hidden')) {
      if (!calEl.contains(e.target) && (!dateWrapper || !dateWrapper.contains(e.target))) {
        calEl.classList.add('hidden');
      }
    }
    // 2. Wetter
    const weatherEl = document.getElementById('panel-weather');
    const weatherBadge = document.getElementById('date-weather-badge');
    if (weatherEl && !weatherEl.classList.contains('hidden')) {
      if (!weatherEl.contains(e.target) && (!weatherBadge || !weatherBadge.contains(e.target))) {
        weatherEl.classList.add('hidden');
      }
    }
    // 3. Report / Statistik
    const reportEl = document.getElementById('panel-report');
    const reportBtn = document.querySelector('button[onclick*="togglePanel(\'report\')"]');
    if (reportEl && !reportEl.classList.contains('hidden')) {
      if (!reportEl.contains(e.target) && (!reportBtn || !reportBtn.contains(e.target))) {
        reportEl.classList.add('hidden');
      }
    }
    // 4. Pause
    const pauseEl = document.getElementById('panel-pause-dropdown');
    const pauseBtn = document.querySelector('button[onclick*="togglePanel(\'pause-dropdown\')"]');
    if (pauseEl && !pauseEl.classList.contains('hidden')) {
      if (!pauseEl.contains(e.target) && (!pauseBtn || !pauseBtn.contains(e.target))) {
        pauseEl.classList.add('hidden');
      }
    }
    // 5. Settings Dropdown
    const settingsEl = document.getElementById('panel-settings-dropdown');
    const settingsBtn = document.querySelector('button[onclick*="togglePanel(\'settings-dropdown\')"]');
    if (settingsEl && !settingsEl.classList.contains('hidden')) {
      if (!settingsEl.contains(e.target) && (!settingsBtn || !settingsBtn.contains(e.target))) {
        settingsEl.classList.add('hidden');
      }
    }
  });
}

function updateDateAndStreak() {
  const now = new Date();
  const locales = { de: 'de-DE', en: 'en-GB', el: 'el-GR', es: 'es-ES', fr: 'fr-FR', it: 'it-IT' };
  try {
    const weekday = new Intl.DateTimeFormat(locales[currentLang] || 'en-GB', { weekday: 'long' }).format(now);
    const dayMonth = new Intl.DateTimeFormat(locales[currentLang] || 'en-GB', { day: 'numeric', month: 'long' }).format(now);
    const displayEl = document.getElementById('date-display');
    if (displayEl) {
      displayEl.innerHTML = `<span class="text-zinc-400 font-medium text-xs md:text-sm tracking-normal">${weekday},</span> <span class="text-zinc-100 font-semibold text-xs md:text-sm tracking-normal">${dayMonth}</span>`;
    }
  } catch (e) {
    const displayEl = document.getElementById('date-display');
    if (displayEl) displayEl.innerText = now.toLocaleDateString();
  }

  // Ganz dezente Live-Uhrzeit (Null Speicher-Overhead)
  const timeEl = document.getElementById('time-display');
  if (timeEl) {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeEl.innerText = `${hours}:${minutes}`;
  }

  renderMiniCalendar();

  if (typeof initWeatherSystem === 'function' && typeof window !== 'undefined' && !window._weatherInitialized) {
    window._weatherInitialized = true;
    initWeatherSystem();
  }
}
window.updateDateAndStreak = updateDateAndStreak;

// Leichtgewichtiger Ticker für sekundengenaue / minutengenaue Uhrzeit ohne Speicheroverhead
if (typeof window !== 'undefined' && !window._timeTickerInterval) {
  window._timeTickerInterval = setInterval(updateDateAndStreak, 10000);
}
 

/**
 * Erzeugt schwebende Erfolgs-Bubbles an der Position des Events oder Elements.
 */
function spawnFloatingBubbles(e) {
  const x = e && e.clientX ? e.clientX : window.innerWidth / 2;
  const y = e && e.clientY ? e.clientY : window.innerHeight / 2;

  for (let i = 0; i < 8; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'floating-success-bubble';
    
    // Zufällige leichte Variation der Startposition
    const offsetX = (Math.random() - 0.5) * 40;
    const offsetY = (Math.random() - 0.5) * 40;
    
    bubble.style.left = `${x + offsetX}px`;
    bubble.style.top = `${y + offsetY}px`;
    
    // Zufällige Verzögerung und Größe
    const delay = Math.random() * 0.2;
    const size = Math.random() * 10 + 8;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.animationDelay = `${delay}s`;
    
    // Zufällige Farbe aus dem Brand-Spektrum
    const colors = ['#38bdf8', '#10b981', '#8b5cf6', '#f472b6'];
    bubble.style.background = `radial-gradient(circle at 30% 30%, #fff 0%, ${colors[Math.floor(Math.random() * colors.length)]} 70%)`;
    
    document.body.appendChild(bubble);
    
    // Nach Animation entfernen
    setTimeout(() => bubble.remove(), 1200);
  }
}

// ==========================================
// SAFE-SPACE (ATEMTAKT & ERDUNGS-ANKER)
// ==========================================

const ANCHOR_STEPS = {
  de: [
    { title: "5 DINGE SEHEN 👀", text: "Blicke dich um und benenne 5 Gegenstände, die du in deiner Umgebung siehst." },
    { title: "4 DINGE SPÜREN ✋", text: "Fühle 4 verschiedene Texturen (z.B. Kleidung, Tischplatte, Stuhllehne, Hände)." },
    { title: "3 DINGE HÖREN 👂", text: "Lausche aufmerksam: Welche 3 unterschiedlichen Geräusche kannst du wahrnehmen?" },
    { title: "2 DINGE RIECHEN 👃", text: "Atme tief durch die Nase: Nimm 2 verschiedene Gerüche wahr (Kaffee, Raumluft, Holz...)." },
    { title: "1 DING SCHMECKEN 👅", text: "Konzentriere dich auf den Geschmack in deinem Mund oder nimm einen Schluck Wasser." }
  ],
  en: [
    { title: "5 THINGS TO SEE 👀", text: "Look around and name 5 objects you can currently see in your room." },
    { title: "4 THINGS TO FEEL ✋", text: "Touch 4 different textures (e.g. your clothes, desk, chair, fingertips)." },
    { title: "3 THINGS TO HEAR 👂", text: "Listen carefully: What 3 distinct sounds can you hear around you?" },
    { title: "2 THINGS TO SMELL 👃", text: "Breathe in: Notice 2 different scents (coffee, air, fabric, wood...)." },
    { title: "1 THING TO TASTE 👅", text: "Focus on the taste inside your mouth or take a sip of water." }
  ],
  es: [
    { title: "5 COSAS QUE VER 👀", text: "Mira a tu alrededor y nombra 5 objetos que puedas ver." },
    { title: "4 COSAS QUE SENTIR ✋", text: "Toca 4 texturas diferentes (ej. tu ropa, la mesa, la silla)." },
    { title: "3 COSAS QUE ESCUCHAR 👂", text: "Escucha atentamente: ¿Qué 3 sonidos distintos puedes percibir?" },
    { title: "2 COSAS QUE OLER 👃", text: "Respira profundo: Percibe 2 olores diferentes." },
    { title: "1 COSA QUE SABOREAR 👅", text: "Concéntrate en el sabor en tu boca o toma un sorbo de agua." }
  ],
  el: [
    { title: "5 ΠΡΑΓΜΑΤΑ ΝΑ ΔΕΙΣ 👀", text: "Κοίταξε γύρω σου και ονόμασε 5 αντικείμενα που βλέπεις." },
    { title: "4 ΠΡΑΓΜΑΤΑ ΝΑ ΑΓΓΙΞΕΙΣ ✋", text: "Νιώσε 4 διαφορετικές υφές (π.χ. ρούχα, γραφείο, καρέκλα)." },
    { title: "3 ΠΡΑΓΜΑΤΑ ΝΑ ΑΚΟΥΣΕΙΣ 👂", text: "Άκουσε προσεκτικά: Ποιους 3 διαφορετικούς ήχους ακούς;" },
    { title: "2 ΠΡΑΓΜΑΤΑ ΝΑ ΜΥΡΙΣΕΙΣ 👃", text: "Πάρε βαθιά ανάσα: Ανίχνευσε 2 διαφορετικές μυρωδιές." },
    { title: "1 ΠΡΑΓΜΑ ΝΑ ΓΕΥΤΕΙΣ 👅", text: "Εστίασε στη γεύση στο στόμα σου ή πιες μια γουλιά νερό." }
  ],
  fr: [
    { title: "5 CHOSES À VOIR 👀", text: "Regarde autour de toi et nomme 5 objets que tu vois." },
    { title: "4 CHOSES À TOUCHER ✋", text: "Touche 4 textures différentes (vêtements, table, chaise...)." },
    { title: "3 CHOSES À ÉCOUTER 👂", text: "Écoute attentivement : Quels 3 sons distincts entends-tu ?" },
    { title: "2 CHOSES À SENTIR 👃", text: "Respire profondément : Repère 2 odeurs différentes." },
    { title: "1 CHOSE À GOÛTER 👅", text: "Concentre-toi sur le goût dans ta bouche ou bois une gorgée d'eau." }
  ],
  it: [
    { title: "5 COSE DA VEDERE 👀", text: "Guardati attorno e nomina 5 oggetti che vedi." },
    { title: "4 COSE DA TOCCARE ✋", text: "Tocca 4 texture diverse (es. vestiti, scrivania, sedia)." },
    { title: "3 COSE DA ASCOLTARE 👂", text: "Ascolta attentamente: Quali 3 suoni distinti percepisci?" },
    { title: "2 COSE DA ODORARE 👃", text: "Fai un respiro profondo: Riconosci 2 odori diversi." },
    { title: "1 COSA DA GUSTARE 👅", text: "Concentrati sul sapore nella tua bocca o bevi un sorso d'acqua." }
  ]
};

let safeSpaceBreathInterval = null;
let safeSpaceBreathTimeout = null;
let safeSpaceBreathStep = 0;
let currentBreathPattern = '444'; // '444', '478', 'sigh'
let safeSpaceNoiseActive = false;
let anchorStep = 1;
let eyeRestTimerInterval = null;
let eyeRestSeconds = 20;
let eyeRestRunning = false;
let dopamineDetoxInterval = null;
let dopamineDetoxSeconds = 60;

function openBreakModal(type, pattern) {
  if (type === 'stretch') {
    if (typeof openSportModal === 'function') {
      openSportModal();
      return;
    }
  }
  openSafeSpaceModal();
  if (pattern) {
    currentBreathPattern = pattern;
  }
  if (type === 'grounding') {
    switchSafeSpaceTab('anchor');
  } else if (type === 'eyes') {
    switchSafeSpaceTab('eyes');
  } else if (type === 'body') {
    switchSafeSpaceTab('body');
  } else if (type === 'sound') {
    switchSafeSpaceTab('sound');
  } else {
    switchSafeSpaceTab('breath');
  }
}
window.openBreakModal = openBreakModal;

function openSafeSpaceModal() {
  const modal = document.getElementById('helper-safespace-modal');
  if (modal) modal.classList.remove('hidden');
  switchSafeSpaceTab('breath');
}
window.openSafeSpaceModal = openSafeSpaceModal;

function closeSafeSpaceModal() {
  const modal = document.getElementById('helper-safespace-modal');
  if (modal) modal.classList.add('hidden');
  stopSafeSpaceBreathCycle();
  stopEyeRestTimer();
  if (dopamineDetoxInterval) {
    clearInterval(dopamineDetoxInterval);
    dopamineDetoxInterval = null;
  }
  if (safeSpaceNoiseActive) {
    toggleSafeSpaceNoise();
  }
}
window.closeSafeSpaceModal = closeSafeSpaceModal;

function switchPauseDropdownTab(tabName) {
  ['breath', 'sensory', 'body', 'sound'].forEach(t => {
    const pane = document.getElementById(`pause-dropdown-pane-${t}`);
    const tabBtn = document.getElementById(`pause-dropdown-tab-${t}`);
    if (pane) {
      if (t === tabName) pane.classList.remove('hidden');
      else pane.classList.add('hidden');
    }
    if (tabBtn) {
      if (t === tabName) {
        tabBtn.className = "py-1.5 px-2 rounded-xl bg-teal-500/20 text-teal-200 border border-teal-500/40 font-bold transition text-center cursor-pointer";
      } else {
        tabBtn.className = "py-1.5 px-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition text-center cursor-pointer";
      }
    }
  });
}
window.switchPauseDropdownTab = switchPauseDropdownTab;

function switchSafeSpaceTab(tab) {
  const tabs = ['breath', 'anchor', 'eyes', 'body', 'sound'];
  tabs.forEach(t => {
    const btn = document.getElementById(`safespace-tab-${t}`);
    const pane = document.getElementById(`safespace-pane-${t}`);
    if (pane) {
      if (t === tab) pane.classList.remove('hidden');
      else pane.classList.add('hidden');
    }
    if (btn) {
      if (t === tab) {
        btn.className = "py-2 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 text-teal-300 bg-teal-500/20 border border-teal-500/40 font-bold shadow-sm";
      } else {
        btn.className = "py-2 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 text-gray-400 hover:text-white hover:bg-white/5";
      }
    }
  });

  stopSafeSpaceBreathCycle();
  stopEyeRestTimer();

  if (tab === 'breath') {
    startSafeSpaceBreathCycle();
  } else if (tab === 'anchor') {
    resetAnchorSteps();
  } else if (tab === 'eyes') {
    resetEyeRestUI();
  }
}
window.switchSafeSpaceTab = switchSafeSpaceTab;

function setBreathPattern(pat) {
  currentBreathPattern = pat;
  ['444', '478', 'sigh'].forEach(p => {
    const btn = document.getElementById(`safespace-pat-${p}`);
    if (btn) {
      if (p === pat) {
        btn.className = "py-1 px-2.5 rounded-lg bg-teal-500/30 text-teal-200 border border-teal-400 font-bold text-xs transition cursor-pointer";
      } else {
        btn.className = "py-1 px-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-white border border-white/10 text-xs transition cursor-pointer";
      }
    }
  });
  startSafeSpaceBreathCycle();
}
window.setBreathPattern = setBreathPattern;

function startSafeSpaceBreathCycle() {
  stopSafeSpaceBreathCycle();
  const circle = document.getElementById('safespace-breath-circle');
  const text = document.getElementById('safespace-breath-text');
  const countEl = document.getElementById('safespace-breath-count');
  if (!circle || !text) return;

  if (currentBreathPattern === '478') {
    // 4-7-8 Breathing (4s Inhale, 7s Hold, 8s Exhale)
    const run478 = () => {
      text.innerText = tr({ de: "Einatmen (Nase)", en: "Inhale (Nose)", fr: "Inspirez (Nez)", it: "Inspira (Naso)", es: "Inhala (Nariz)", el: "Εισπνοή (Μύτη)" });
      if (countEl) countEl.innerText = "4s";
      circle.style.transform = "scale(1.4)";
      circle.style.borderColor = "rgba(20, 184, 166, 0.9)";
      circle.style.backgroundColor = "rgba(20, 184, 166, 0.18)";

      safeSpaceBreathTimeout = setTimeout(() => {
        text.innerText = tr({ de: "Anhalten (Sanft)", en: "Hold (Gently)", fr: "Bloquez (Doux)", it: "Trattieni (Dolce)", es: "Mantén (Suave)", el: "Κράτημα (Απαλά)" });
        if (countEl) countEl.innerText = "7s";
        circle.style.borderColor = "rgba(245, 158, 11, 0.8)";
        circle.style.backgroundColor = "rgba(245, 158, 11, 0.15)";

        safeSpaceBreathTimeout = setTimeout(() => {
          text.innerText = tr({ de: "Langsam Ausatmen (Mund)", en: "Slow Exhale (Mouth)", fr: "Expirez lentement (Bouche)", it: "Espira lentamente (Bocca)", es: "Exhala lento (Boca)", el: "Εκπνοή αργά (Στόμα)" });
          if (countEl) countEl.innerText = "8s";
          circle.style.transform = "scale(0.9)";
          circle.style.borderColor = "rgba(99, 102, 241, 0.7)";
          circle.style.backgroundColor = "rgba(99, 102, 241, 0.12)";

          safeSpaceBreathTimeout = setTimeout(run478, 8000);
        }, 7000);
      }, 4000);
    };
    run478();
  } else if (currentBreathPattern === 'sigh') {
    // Physiological Sigh (2s Inhale, 1s Top-up Inhale, 6s Slow Exhale)
    const runSigh = () => {
      text.innerText = tr({ de: "1. Tief Einatmen", en: "1. Deep Inhale", fr: "1. Inspirez", it: "1. Inspira a fondo", es: "1. Inhala profundo", el: "1. Βαθιά Εισπνοή" });
      if (countEl) countEl.innerText = "2s";
      circle.style.transform = "scale(1.25)";
      circle.style.borderColor = "rgba(20, 184, 166, 0.8)";

      safeSpaceBreathTimeout = setTimeout(() => {
        text.innerText = tr({ de: "2. Nochmal nachatmen!", en: "2. Top-up Inhale!", fr: "2. Complétez !", it: "2. Riempi ancora!", es: "2. ¡Inhala más!", el: "2. Συμπληρώστε!" });
        if (countEl) countEl.innerText = "1s";
        circle.style.transform = "scale(1.45)";
        circle.style.borderColor = "rgba(56, 189, 248, 0.9)";

        safeSpaceBreathTimeout = setTimeout(() => {
          text.innerText = tr({ de: "Langer beruhigender Seufzer...", en: "Long Calming Sigh...", fr: "Long soupir apaisant...", it: "Lungo sospiro calmante...", es: "Largo suspiro calmante...", el: "Μεγάλος αναστεναγμός..." });
          if (countEl) countEl.innerText = "6s";
          circle.style.transform = "scale(0.88)";
          circle.style.borderColor = "rgba(168, 85, 247, 0.8)";

          safeSpaceBreathTimeout = setTimeout(runSigh, 6000);
        }, 1200);
      }, 2000);
    };
    runSigh();
  } else {
    // 4-4-4 Box Breathing (Navy SEAL 4s Inhale, 4s Hold, 4s Exhale, 4s Hold)
    const run444 = () => {
      text.innerText = tr({ de: "Einatmen...", en: "Inhale...", fr: "Inspirez...", it: "Inspira...", es: "Inhala...", el: "Εισπνοή..." });
      if (countEl) countEl.innerText = "4s";
      circle.style.transform = "scale(1.35)";
      circle.style.borderColor = "rgba(20, 184, 166, 0.9)";
      circle.style.backgroundColor = "rgba(20, 184, 166, 0.15)";

      safeSpaceBreathTimeout = setTimeout(() => {
        text.innerText = tr({ de: "Anhalten...", en: "Hold...", fr: "Bloquez...", it: "Trattieni...", es: "Mantén...", el: "Κράτημα..." });
        if (countEl) countEl.innerText = "4s";
        circle.style.borderColor = "rgba(245, 158, 11, 0.8)";
        circle.style.backgroundColor = "rgba(245, 158, 11, 0.15)";

        safeSpaceBreathTimeout = setTimeout(() => {
          text.innerText = tr({ de: "Ausatmen...", en: "Exhale...", fr: "Expirez...", it: "Espira...", es: "Exhala...", el: "Εκπνοή..." });
          if (countEl) countEl.innerText = "4s";
          circle.style.transform = "scale(0.92)";
          circle.style.borderColor = "rgba(20, 184, 166, 0.5)";
          circle.style.backgroundColor = "rgba(20, 184, 166, 0.05)";

          safeSpaceBreathTimeout = setTimeout(() => {
            text.innerText = tr({ de: "Leer Anhalten...", en: "Hold Empty...", fr: "Poumons vides...", it: "Pausa a vuoto...", es: "Pausa vacío...", el: "Κενό κράτημα..." });
            if (countEl) countEl.innerText = "4s";
            circle.style.borderColor = "rgba(99, 102, 241, 0.7)";

            safeSpaceBreathTimeout = setTimeout(run444, 4000);
          }, 4000);
        }, 4000);
      }, 4000);
    };
    run444();
  }
}
window.startSafeSpaceBreathCycle = startSafeSpaceBreathCycle;

function stopSafeSpaceBreathCycle() {
  if (safeSpaceBreathTimeout) {
    clearTimeout(safeSpaceBreathTimeout);
    safeSpaceBreathTimeout = null;
  }
}
window.stopSafeSpaceBreathCycle = stopSafeSpaceBreathCycle;

function resetEyeRestUI() {
  eyeRestSeconds = 20;
  eyeRestRunning = false;
  const timeEl = document.getElementById('safespace-eyes-time');
  const btn = document.getElementById('safespace-eyes-btn');
  if (timeEl) timeEl.innerText = '20s';
  if (btn) btn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i> <span>20s Augen-Timer starten</span>`;
  if (typeof renderLucideIcons === 'function') renderLucideIcons();
}
window.resetEyeRestUI = resetEyeRestUI;

function toggleEyeRestTimer() {
  if (eyeRestRunning) {
    stopEyeRestTimer();
  } else {
    startEyeRestTimer();
  }
}
window.toggleEyeRestTimer = toggleEyeRestTimer;

function startEyeRestTimer() {
  stopEyeRestTimer();
  eyeRestRunning = true;
  eyeRestSeconds = 20;
  const timeEl = document.getElementById('safespace-eyes-time');
  const btn = document.getElementById('safespace-eyes-btn');
  if (btn) btn.innerHTML = `<i data-lucide="pause" class="w-4 h-4"></i> <span>Timer pausieren</span>`;
  if (typeof renderLucideIcons === 'function') renderLucideIcons();

  eyeRestTimerInterval = setInterval(() => {
    eyeRestSeconds--;
    if (timeEl) timeEl.innerText = `${eyeRestSeconds}s`;
    if (eyeRestSeconds <= 0) {
      stopEyeRestTimer();
      if (typeof playProceduralSound === 'function') playProceduralSound(2);
      showToast(tr({
        de: "👀 Augen entspannt! Wunderbar erholt.",
        en: "👀 Eyes relaxed! Wonderful recharge.",
        fr: "👀 Yeux reposés ! Recharge réussie.",
        it: "👀 Occhi rilassati! Ottima ricarica.",
        es: "👀 ¡Ojos descansados! Recarga completada.",
        el: "👀 Τα μάτια ξεκουράστηκαν! Υπέροχη ανανέωση."
      }));
      resetEyeRestUI();
    }
  }, 1000);
}
window.startEyeRestTimer = startEyeRestTimer;

function stopEyeRestTimer() {
  if (eyeRestTimerInterval) {
    clearInterval(eyeRestTimerInterval);
    eyeRestTimerInterval = null;
  }
  eyeRestRunning = false;
}
window.stopEyeRestTimer = stopEyeRestTimer;

function startDopamineDetoxTimer(sec = 60) {
  openSafeSpaceModal();
  switchSafeSpaceTab('anchor');
  showToast(tr({
    de: "⏳ 60s Reizstille gestartet. Schließe die Augen und lass die Gedanken ziehen.",
    en: "⏳ 60s Sensory silence started. Close your eyes and let your mind wander.",
    fr: "⏳ 60s de calme sensoriel démarrées.",
    it: "⏳ 60s di silenzio sensoriale avviati.",
    es: "⏳ 60s de silencio sensorial iniciados.",
    el: "⏳ 60 δευτ. αισθητηριακής ηρεμίας ξεκίνησαν."
  }));
}
window.startDopamineDetoxTimer = startDopamineDetoxTimer;

function quickPlaySoundscape(type) {
  if (typeof playAmbientSound === 'function') {
    playAmbientSound(type, true);
    showToast(tr({
      de: `🎧 Soundscape "${type}" aktiviert`,
      en: `🎧 Soundscape "${type}" active`,
      fr: `🎧 Ambiance "${type}" activée`,
      it: `🎧 Soundscape "${type}" attivo`,
      es: `🎧 Sonido "${type}" activado`,
      el: `🎧 Ήχος "${type}" ενεργοποιήθηκε`
    }));
  }
}
window.quickPlaySoundscape = quickPlaySoundscape;

function toggleSafeSpaceNoise() {
  safeSpaceNoiseActive = !safeSpaceNoiseActive;
  const btn = document.getElementById('safespace-noise-btn');
  if (!btn) return;
  if (safeSpaceNoiseActive) {
    btn.innerText = currentLang === 'de' ? "Bach-Sound aus" : "Stop Stream Sound";
    btn.className = "px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-xs font-bold rounded-lg transition";
    if (typeof playAmbientSound === 'function') {
      playAmbientSound('stream', true);
    }
  } else {
    btn.innerText = currentLang === 'de' ? "Bach-Sound ein" : "Start Stream Sound";
    btn.className = "px-3.5 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-300 text-xs font-bold rounded-lg transition";
    if (typeof stopAmbientSound === 'function') {
      stopAmbientSound(true);
    }
  }
}
window.toggleSafeSpaceNoise = toggleSafeSpaceNoise;

function resetAnchorSteps() {
  anchorStep = 1;
  updateAnchorStepUI();
}

function nextAnchorStep() {
  anchorStep++;
  if (anchorStep > 5) {
    showToast(currentLang === 'de' ? "Erdung erfolgreich abgeschlossen! 🧘‍♂️" : "Grounding completed successfully! 🧘‍♂️");
    closeSafeSpaceModal();
  } else {
    updateAnchorStepUI();
    if (typeof playProceduralSound === 'function') {
      playProceduralSound(3);
    }
  }
}

function updateAnchorStepUI() {
  const titleEl = document.getElementById('anchor-step-title');
  const textEl = document.getElementById('anchor-step-instruction');
  const progressEl = document.getElementById('anchor-progress-bar');
  if (!titleEl || !textEl || !progressEl) return;
  const steps = ANCHOR_STEPS[currentLang] || ANCHOR_STEPS.de;
  const stepData = steps[anchorStep - 1] || steps[0];
  titleEl.innerText = stepData.title;
  textEl.innerText = stepData.text;
  progressEl.style.width = `${anchorStep * 20}%`;
}

// ===== HEADER LAYOUT CUSTOMIZER =====
function setHeaderLayout(mode) {
  const validModes = ['smart_hubs', 'minimal', 'classic'];
  if (!validModes.includes(mode)) mode = 'smart_hubs';
  
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('noodle_header_layout', mode);
  }

  // 1. Center Flank Buttons (Was nun? is preserved; Fokus is integrated)
  const whatnowBtn = document.getElementById('btn-whatnow-dance');
  const focusBtn = document.getElementById('btn-focus-mode');
  if (whatnowBtn) whatnowBtn.classList.remove('hidden');
  if (focusBtn) focusBtn.classList.add('hidden');

  // 2. Wellbeing & Options (Optionen MUSS in jedem Modus sichtbar sein!)
  const wellbeingCapsule = document.getElementById('header-capsule-wellbeing');
  const reportContainer = document.getElementById('header-btn-report-container');
  const optionsContainer = document.getElementById('header-btn-options-container');

  if (wellbeingCapsule) wellbeingCapsule.classList.remove('hidden');
  if (optionsContainer) optionsContainer.classList.remove('hidden');

  if (reportContainer) {
    if (mode === 'minimal') reportContainer.classList.add('hidden');
    else reportContainer.classList.remove('hidden');
  }

  // 3. Update UI Buttons in Settings Dropdown
  const modes = ['smart_hubs', 'minimal', 'classic'];
  modes.forEach(m => {
    const btn = document.getElementById(`btn-layout-${m}`);
    if (btn) {
      if (m === mode) {
        btn.className = 'py-1 px-1.5 rounded-xl transition text-center bg-purple-500/20 text-purple-200 border border-purple-500/40 cursor-pointer font-bold shadow-sm';
      } else {
        btn.className = 'py-1 px-1.5 rounded-xl transition text-center text-gray-400 hover:text-white cursor-pointer';
      }
    }
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
}
window.setHeaderLayout = setHeaderLayout;

function initHeaderLayout() {
  if (typeof localStorage === 'undefined') return;
  const saved = localStorage.getItem('noodle_header_layout') || 'classic';
  setHeaderLayout(saved);
}
window.initHeaderLayout = initHeaderLayout;

function toggleAllThemesDropdown() {
  const extPanel = document.getElementById('panel-themes-extended');
  const icon = document.getElementById('theme-expand-icon');
  const label = document.getElementById('theme-expand-label');
  if (!extPanel) return;
  const isHidden = extPanel.classList.contains('hidden');
  if (isHidden) {
    extPanel.classList.remove('hidden');
    extPanel.classList.add('grid');
    if (icon) icon.classList.add('rotate-180');
    if (label) label.textContent = (typeof tr === 'function') ? tr({ de: 'Weniger', en: 'Less', fr: 'Moins', it: 'Meno', es: 'Menos', el: 'Λιγότερα' }) : 'Weniger';
  } else {
    extPanel.classList.add('hidden');
    extPanel.classList.remove('grid');
    if (icon) icon.classList.remove('rotate-180');
    if (label) label.textContent = (typeof tr === 'function') ? tr({ de: 'Alle (16)', en: 'All (16)', fr: 'Tous (16)', it: 'Tutti (16)', es: 'Todos (16)', el: 'Όλα (16)' }) : 'Alle (16)';
  }
  if (typeof renderLucideIcons === 'function') renderLucideIcons();
  else if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') lucide.createIcons();
}
window.toggleAllThemesDropdown = toggleAllThemesDropdown;

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderLayout);
  } else {
    initHeaderLayout();
  }
}

