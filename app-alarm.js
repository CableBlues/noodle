// app-alarm.js: Wecker & Reminder (Zuverlässige minütliche Auslösung, laut & dauerhaft)
let alarmState = { alarms: [], reminders: [], settings: {} };

const DEFAULT_ALARM_SETTINGS = {
  sound: 'digital',       // 'digital' | 'bell' | 'radar' | 'retro'
  volume: 0.9,           // 0.2 bis 1.0 (laut und penetrant)
  vibrate: true,         // Smartphone Vibration aktiv
  remindersAsAlarm: true // Dringende Erinnerungen als Dauer-Wecker
};

function initAlarmReminder() {
  try {
    const defaultData = {
      alarms: [{ id: '1', time: '08:00', label: 'Fokus-Start', active: true }],
      reminders: [{ id: '101', text: 'Wasser trinken 💧', time: Date.now() + 600000, completed: false, isUrgent: true }],
      settings: DEFAULT_ALARM_SETTINGS
    };
    if (typeof AppStorage !== 'undefined') {
      alarmState = AppStorage.get('flow_alarms_reminders', defaultData);
    } else {
      const s = localStorage.getItem('flow_alarms_reminders');
      alarmState = s ? JSON.parse(s) : defaultData;
    }
    if (!alarmState.settings) {
      alarmState.settings = Object.assign({}, DEFAULT_ALARM_SETTINGS);
    } else {
      alarmState.settings = Object.assign({}, DEFAULT_ALARM_SETTINGS, alarmState.settings);
    }
  } catch(e) {
    console.warn('[Alarm] Fehler beim Laden der Alarme:', e);
  }
  updateAlarmBadge();
}

function saveAlarmState() {
  try {
    if (typeof AppStorage !== 'undefined') {
      AppStorage.set('flow_alarms_reminders', alarmState);
    } else {
      localStorage.setItem('flow_alarms_reminders', JSON.stringify(alarmState));
    }
    updateAlarmBadge();
  } catch(e) {
    console.warn('[Alarm] Fehler beim Speichern der Alarme:', e);
  }
}

function updateAlarmBadge() {
  const b = document.getElementById('alarm-active-badge');
  if (!b) return;
  const active = (alarmState.alarms || []).some(a => a.active) || (alarmState.reminders || []).some(r => !r.completed);
  b.classList.toggle('hidden', !active);
}

function requestAlarmNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(() => {
      renderAlarmPanel();
    });
  }
}
window.requestAlarmNotificationPermission = requestAlarmNotificationPermission;

function sendBrowserNotification(title, body, isAlarm = true) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body: body,
            icon: 'icon-192.png',
            badge: 'icon-192.png',
            vibrate: [500, 200, 500, 200, 800],
            requireInteraction: true,
            tag: isAlarm ? 'noodle-alarm-alert' : 'noodle-reminder-alert'
          });
        });
      } else {
        new Notification(title, {
          body: body,
          icon: 'icon-192.png',
          requireInteraction: true,
          tag: isAlarm ? 'noodle-alarm-alert' : 'noodle-reminder-alert'
        });
      }
    } catch (e) {
      console.warn('[Alarm] Notification dispatch warning:', e);
    }
  }
}

let currentAlarmTab = 'alarms'; // 'alarms' | 'timer'

function switchAlarmTab(tab) {
  currentAlarmTab = tab;
  renderAlarmPanel();
}
window.switchAlarmTab = switchAlarmTab;

function toggleAlarmDropdown(event) {
  if (event) event.stopPropagation();
  const calEl = document.getElementById('panel-calendar-dropdown');
  if (calEl) calEl.classList.add('hidden');
  const weatherEl = document.getElementById('panel-weather');
  if (weatherEl) weatherEl.classList.add('hidden');

  const panel = document.getElementById('panel-alarm');
  if (!panel) return;
  const isHidden = panel.classList.contains('hidden');
  if (isHidden) {
    panel.classList.remove('hidden');
    renderAlarmPanel();
    if (typeof adjustPanelPosition === 'function') adjustPanelPosition(panel, 'alarm');
    if (typeof window !== 'undefined') {
      window.currentlyOpenPanel = 'alarm';
      window.pinnedPanel = 'alarm';
    }
  } else {
    panel.classList.add('hidden');
    if (typeof window !== 'undefined') {
      if (window.currentlyOpenPanel === 'alarm') window.currentlyOpenPanel = null;
      if (window.pinnedPanel === 'alarm') window.pinnedPanel = null;
    }
  }
}
window.toggleAlarmDropdown = toggleAlarmDropdown;
if (typeof globalThis !== 'undefined') globalThis.toggleAlarmDropdown = toggleAlarmDropdown;

function openAlarmModal(tab = 'alarms') {
  currentAlarmTab = tab;
  if (typeof togglePanel === 'function') {
    togglePanel('alarm');
  }
  renderAlarmPanel();
}
window.openAlarmModal = openAlarmModal;

let alarmLiveTicker = null;
function startAlarmLiveTicker() {
  if (alarmLiveTicker) return;
  alarmLiveTicker = setInterval(() => {
    const timeEl = document.getElementById('alarm-panel-live-time');
    const dateEl = document.getElementById('alarm-panel-live-date');
    if (timeEl) {
      const now = new Date();
      timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (dateEl) {
      const now = new Date();
      const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
      const formatted = now.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      const palette = typeof getDayColorPalette === 'function' ? getDayColorPalette(now) : null;
      if (palette) {
        dateEl.innerHTML = `<span class="${palette.dayClass} font-semibold">${formatted}</span>`;
      } else {
        dateEl.textContent = formatted;
      }
    }
  }, 1000);
}

function renderAlarmPanel() {
  const panel = document.getElementById('panel-alarm');
  if (!panel) return;
  panel.style.width = "380px";
  panel.style.maxWidth = "95vw";
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'de';
  const dateFormatted = now.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const palette = typeof getDayColorPalette === 'function' ? getDayColorPalette(now) : null;
  const dateHtml = palette ? `<span class="${palette.dayClass} font-semibold">${dateFormatted}</span>` : dateFormatted;
  const nowStr = timeFormatted;

  startAlarmLiveTicker();

  const safeEscape = typeof escapeHtml === 'function' ? escapeHtml : (str) => String(str || '');
  const hasNotif = 'Notification' in window;
  const notifPerm = hasNotif ? Notification.permission : 'unsupported';

  const alarmCount = (alarmState.alarms || []).filter(a => a.active).length;

  const tabAlarmsText = typeof tr === 'function' ? tr({
    en: 'Alarms & Reminders',
    de: 'Wecker & Reminder',
    fr: 'Réveils & Rappels',
    it: 'Sveglie & Promemoria',
    es: 'Alarmas & Recordatorios',
    el: 'Ξυπνητήρια & Υπενθυμίσεις'
  }) : 'Wecker & Reminder';

  const tabTimerText = typeof tr === 'function' ? tr({
    en: 'Focus Timer',
    de: 'Fokus-Timer',
    fr: 'Minuteur',
    it: 'Timer Focus',
    es: 'Temporizador',
    el: 'Χρονόμετρο'
  }) : 'Fokus-Timer';

  // Timer-Status aus dem zentralen Timer-Modul ermitteln
  const tSecs = typeof timerSeconds !== 'undefined' ? timerSeconds : 25 * 60;
  const tRunning = typeof timerRunning !== 'undefined' ? timerRunning : false;
  const tMins = Math.floor(Math.max(0, tSecs) / 60);
  const tRemSecs = Math.max(0, tSecs) % 60;
  const timerFormatted = `${String(tMins).padStart(2, '0')}:${String(tRemSecs).padStart(2, '0')}`;
  const curTask = typeof activeTimerTask !== 'undefined' ? activeTimerTask : '';

  panel.innerHTML = `
    <!-- 1. KOPFZEILE: NOODLE ALARM BRANDING | UHRZEIT & CLOSE -->
    <div class="flex items-center justify-between pb-2 border-b border-white/10 select-none">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm shrink-0">
          <i data-lucide="bell" class="w-4 h-4"></i>
        </div>
        <div class="relative flex flex-col items-center justify-center shrink-0">
          <div class="relative overflow-hidden flex items-center justify-center">
            <img src="logo-noodle.png" alt="Noodle" class="h-[22px] w-auto max-w-none object-contain select-none pointer-events-none" />
          </div>
          <div class="relative h-[9px] w-full flex items-center justify-center overflow-hidden mt-0.5">
            <span class="badge-tool-subtext select-none">ALARM</span>
          </div>
        </div>
        <div id="alarm-panel-live-date" class="hidden">${dateHtml}</div>
      </div>
      <div class="flex items-center gap-2">
        <span id="alarm-panel-live-time" class="font-mono font-bold text-xs text-gray-200 select-none">${timeFormatted}</span>
        <button onclick="togglePanel('alarm')" aria-label="Wecker-Hub schließen" class="text-gray-400 hover:text-white text-xs font-bold p-1 px-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer">✕</button>
      </div>
    </div>

    <!-- 3 Separate, Funktionale Tabs -->
    <div class="grid grid-cols-3 gap-1 p-1 bg-black/60 border border-white/10 rounded-2xl text-xs font-bold mt-1">
      <button onclick="switchAlarmTab('alarms')" class="py-1.5 px-1.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${currentAlarmTab === 'alarms' ? 'bg-rose-500 text-white font-bold shadow-[0_0_12px_rgba(244,63,94,0.35)] shadow-md' : 'text-gray-400 hover:text-white'} text-[11px]">
        <i data-lucide="alarm-clock" class="w-3.5 h-3.5 ${currentAlarmTab === 'alarms' ? 'text-white' : 'text-rose-400'}"></i>
        <span>⏰ Wecker</span>
        ${alarmCount > 0 ? `<span class="px-1 py-0.2 rounded-full text-[8.5px] bg-white/20 font-mono">${alarmCount}</span>` : ''}
      </button>
      <button onclick="switchAlarmTab('reminders')" class="py-1.5 px-1.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${currentAlarmTab === 'reminders' ? 'bg-[#ff7a00] text-white font-bold shadow-[0_0_12px_rgba(255,122,0,0.35)] shadow-md' : 'text-gray-400 hover:text-white'} text-[11px]">
        <i data-lucide="bell" class="w-3.5 h-3.5 ${currentAlarmTab === 'reminders' ? 'text-white' : 'text-amber-400'}"></i>
        <span>🔔 Reminder</span>
        ${((alarmState.reminders || []).filter(r => !r.completed).length > 0) ? `<span class="px-1 py-0.2 rounded-full text-[8.5px] bg-white/20 font-mono">${(alarmState.reminders || []).filter(r => !r.completed).length}</span>` : ''}
      </button>
      <button onclick="switchAlarmTab('timer')" class="py-1.5 px-1.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${currentAlarmTab === 'timer' ? 'bg-[#c084fc] text-black font-black shadow-[0_0_15px_rgba(192,132,252,0.4)] text-white shadow-md' : 'text-gray-400 hover:text-white'} text-[11px]">
        <i data-lucide="timer" class="w-3.5 h-3.5 ${currentAlarmTab === 'timer' ? 'text-white' : 'text-purple-400'}"></i>
        <span>⏱️ Fokus</span>
        ${tRunning ? `<span class="px-1 py-0.2 rounded-full text-[8.5px] bg-emerald-400 text-black font-mono font-bold animate-pulse">ON</span>` : ''}
      </button>
    </div>

    <!-- TAB 1: WECKER & SIGNAL -->
    <div id="alarm-subpane-alarms" class="${currentAlarmTab === 'alarms' ? 'block' : 'hidden'} space-y-2 pt-1.5">
      <!-- Wecksignal, Lautstärke & Smartphone-Optionen -->
      <div class="p-2 bg-black/40 border border-white/10 rounded-2xl space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-[9.5px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
            <i data-lucide="volume-2" class="w-3 h-3"></i>
            <span>Signal & Sound</span>
          </span>
          <div class="flex items-center gap-1.5">
            ${notifPerm === 'granted' ? `
              <span class="text-emerald-400 font-mono text-[8.5px] font-bold">🔔 Erlaubt</span>
            ` : (hasNotif ? `
              <button onclick="requestAlarmNotificationPermission()" class="px-1.5 py-0.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded text-[8.5px] font-bold cursor-pointer transition">🔔 Push</button>
            ` : '')}
            <button onclick="testAlarmSound()" class="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-[9px] font-bold cursor-pointer transition flex items-center gap-1 shadow-sm" title="Signal jetzt probehören">
              <i data-lucide="play" class="w-2.5 h-2.5"></i>
              <span>Test</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <select id="alarm-setting-sound" onchange="handleUpdateAlarmSetting('sound', this.value)" class="w-full p-1 bg-[#12121c] border border-white/10 rounded-lg text-[11px] text-white outline-none cursor-pointer">
              <option value="digital" ${(alarmState.settings?.sound || 'digital') === 'digital' ? 'selected' : ''}>📟 Digital (Laut)</option>
              <option value="bell" ${alarmState.settings?.sound === 'bell' ? 'selected' : ''}>🔔 Glocken-Chime</option>
              <option value="radar" ${alarmState.settings?.sound === 'radar' ? 'selected' : ''}>📡 Radar-Sweep</option>
              <option value="retro" ${alarmState.settings?.sound === 'retro' ? 'selected' : ''}>⏰ Retro-Klingel</option>
            </select>
          </div>
          <div>
            <div class="flex justify-between items-center mb-0.5">
              <label class="text-[8.5px] text-gray-400 font-medium">Lautstärke</label>
              <span id="alarm-vol-label" class="text-[8.5px] font-mono font-bold text-rose-400">${Math.round((alarmState.settings?.volume ?? 0.9) * 100)}%</span>
            </div>
            <input type="range" id="alarm-setting-volume" min="0.2" max="1.0" step="0.05" value="${alarmState.settings?.volume ?? 0.9}" oninput="handleUpdateAlarmVolume(this.value)" class="w-full accent-rose-500 cursor-pointer h-1 bg-white/10 rounded-lg" />
          </div>
        </div>

        <div class="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] text-gray-300">
          <label class="flex items-center gap-1 cursor-pointer hover:text-white select-none" title="Handy vibriert synchron im Rhythmus des Alarms">
            <input type="checkbox" ${alarmState.settings?.vibrate !== false ? 'checked' : ''} onchange="handleUpdateAlarmSetting('vibrate', this.checked)" class="w-3 h-3 accent-rose-500 rounded cursor-pointer" />
            <span>📳 Vibration</span>
          </label>
          <label class="flex items-center gap-1 cursor-pointer hover:text-white select-none" title="Erinnerungen läuten ebenfalls als persistenter Dauerwecker">
            <input type="checkbox" ${alarmState.settings?.remindersAsAlarm !== false ? 'checked' : ''} onchange="handleUpdateAlarmSetting('remindersAsAlarm', this.checked)" class="w-3 h-3 accent-amber-500 rounded cursor-pointer" />
            <span>⚡ Dauer-Reminder</span>
          </label>
        </div>
      </div>

      <!-- Neuer Wecker anlegen -->
      <div class="flex gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5">
        <input type="time" id="new-alarm-time" value="09:00" class="p-1 bg-[#12121c] border border-white/10 rounded-lg text-xs text-white outline-none focus:border-rose-500 font-semibold cursor-pointer" />
        <input type="text" id="new-alarm-label" placeholder="Bezeichnung..." class="flex-1 p-1 px-2 bg-[#12121c] border border-white/10 rounded-lg text-xs text-white outline-none focus:border-rose-500 font-semibold placeholder:text-gray-500" />
        <button onclick="handleAddAlarm()" aria-label="Wecker hinzufügen" class="px-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center shadow-sm">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
        </button>
      </div>

      <!-- Wecker-Liste -->
      <div class="space-y-1 max-h-[140px] overflow-y-auto pr-1">
        ${(!alarmState.alarms || alarmState.alarms.length === 0) ? `
          <div class="text-center py-2 text-gray-500 text-[11px] font-medium italic">Noch keine Wecker aktiv</div>
        ` : (alarmState.alarms || []).map(a => `
          <div class="flex items-center justify-between p-1.5 px-2 bg-white/[0.02] border border-white/5 rounded-xl hover:border-rose-500/30 transition">
            <div class="flex items-center gap-2">
              <input type="checkbox" ${a.active ? 'checked' : ''} onchange="handleToggleAlarm('${a.id}')" class="w-3.5 h-3.5 accent-rose-500 cursor-pointer rounded" />
              <div>
                <div class="text-xs font-bold text-white font-mono leading-none">${safeEscape(a.time)}</div>
                <div class="text-[9.5px] text-gray-400 leading-none mt-0.5">${safeEscape(a.label || 'Wecker')}</div>
              </div>
            </div>
            <button onclick="handleDeleteAlarm('${a.id}')" aria-label="Wecker löschen" class="text-gray-500 hover:text-rose-400 p-0.5 transition cursor-pointer" title="Löschen">
              <i data-lucide="trash-2" class="w-3 h-3"></i>
            </button>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- TAB 2: REMINDER & COUNTDOWN -->
    <div id="alarm-subpane-reminders" class="${currentAlarmTab === 'reminders' ? 'block' : 'hidden'} space-y-2 pt-1.5">
      <div class="flex flex-col gap-1.5 bg-black/40 p-2 rounded-2xl border border-white/5">
        <div class="flex gap-1.5">
          <input type="text" id="new-reminder-text" placeholder="Erinnerung (z.B. Wasser trinken 💧)..." class="flex-1 p-1.5 px-2 bg-[#12121c] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#ff7a00] font-semibold placeholder:text-gray-500" />
          <select id="new-reminder-mins" class="p-1.5 bg-[#12121c] border border-white/10 rounded-xl text-xs text-[#ff7a00] font-bold outline-none cursor-pointer">
            <option value="5">in 5m</option>
            <option value="10" selected>in 10m</option>
            <option value="15">in 15m</option>
            <option value="20">in 20m</option>
            <option value="30">in 30m</option>
            <option value="45">in 45m</option>
            <option value="60">in 60m</option>
          </select>
          <button onclick="handleAddReminder()" aria-label="Erinnerung hinzufügen" class="px-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center shadow-sm">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          </button>
        </div>
        <div class="flex items-center justify-between px-1 text-[9px]">
          <label class="flex items-center gap-1.5 text-gray-400 hover:text-amber-300 cursor-pointer select-none">
            <input type="checkbox" id="new-reminder-urgent" ${alarmState.settings?.remindersAsAlarm !== false ? 'checked' : ''} class="w-3 h-3 accent-amber-500 rounded cursor-pointer" />
            <span>⚡ Als lauten Dauer-Wecker auslösen</span>
          </label>
        </div>
      </div>

      <div class="space-y-1 max-h-[160px] overflow-y-auto pr-1">
        ${(!alarmState.reminders || alarmState.reminders.length === 0) ? `
          <div class="text-center py-4 text-gray-500 text-[11px] italic">Keine schnellen Erinnerungen aktiv</div>
        ` : (alarmState.reminders || []).map(r => {
          const leftMin = Math.max(0, Math.round((r.time - Date.now()) / 60000));
          return `
            <div class="flex items-center justify-between p-1.5 px-2 bg-white/[0.02] border border-white/5 rounded-xl ${r.completed ? 'opacity-40 line-through' : ''}">
              <div class="flex items-center gap-2 min-w-0">
                <input type="checkbox" ${r.completed ? 'checked' : ''} onchange="handleToggleReminder('${r.id}')" class="w-3.5 h-3.5 accent-amber-500 cursor-pointer rounded" />
                <span class="text-xs font-semibold text-gray-200 truncate">${safeEscape(r.text)}</span>
                ${r.isUrgent !== false ? '<span class="text-[9px] text-amber-400 font-mono" title="Dauer-Alarm">⚡</span>' : ''}
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-[9px] font-mono text-[#ff7a00] font-bold">${r.completed ? 'Erledigt' : `${leftMin}m`}</span>
                <button onclick="handleDeleteReminder('${r.id}')" aria-label="Erinnerung löschen" class="text-gray-500 hover:text-rose-400 p-0.5 transition cursor-pointer" title="Löschen">
                  <i data-lucide="trash-2" class="w-3 h-3"></i>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- TAB 3: SMART FOKUS-TIMER (ANGENEHM & FUNKTIONELL) -->
    <div id="alarm-subpane-timer" class="${currentAlarmTab === 'timer' ? 'block' : 'hidden'} space-y-2.5 pt-1.5">
      
      <!-- Zentrales Großes Display mit animierter Fokus-Aura -->
      <div class="relative p-5 rounded-3xl bg-gradient-to-b from-purple-950/30 to-black/60 border border-purple-500/30 flex flex-col items-center justify-center text-center shadow-inner overflow-hidden">
        ${tRunning ? `<div class="absolute inset-0 bg-purple-500/10 animate-pulse pointer-events-none"></div>` : ''}
        
        <div class="text-[9px] font-mono uppercase tracking-widest text-purple-300 font-bold mb-1">
          ${tRunning ? '⚡ FOKUS AKTIV' : '⏸️ BEREIT FÜR DIE NÄCHSTE SESSION'}
        </div>
        
        <div id="alarm-timer-display" class="text-4xl sm:text-5xl font-mono font-black text-white tracking-widest my-1 drop-shadow-md">
          ${timerFormatted}
        </div>

        ${curTask ? `
          <div class="mt-2 px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-purple-200 text-[11px] font-semibold flex items-center gap-1.5 max-w-full truncate">
            <i data-lucide="target" class="w-3.5 h-3.5 text-purple-400 shrink-0"></i>
            <span class="truncate">${safeEscape(curTask)}</span>
          </div>
        ` : `
          <div class="text-[10px] text-gray-400 mt-1">Wähle eine Dauer & starte deinen Fokus</div>
        `}
      </div>

      <!-- Presets (Schnell-Auswahl mit direktem Sync) -->
      <div class="space-y-1">
        <div class="flex items-center justify-between text-[10px] font-mono text-gray-400 font-bold uppercase">
          <span>Dauer wählen</span>
          <span>Presets</span>
        </div>
        <div class="grid grid-cols-4 gap-1.5">
          <button onclick="if(typeof selectTimerPreset==='function'){selectTimerPreset(15);}else if(typeof setTimerPreset==='function'){setTimerPreset(15);} renderAlarmPanel();" class="py-2 rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/40 text-gray-200 text-xs font-mono font-bold transition cursor-pointer text-center">15m</button>
          <button onclick="if(typeof selectTimerPreset==='function'){selectTimerPreset(25);}else if(typeof setTimerPreset==='function'){setTimerPreset(25);} renderAlarmPanel();" class="py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold transition cursor-pointer text-center shadow-sm">25m 🍅</button>
          <button onclick="if(typeof selectTimerPreset==='function'){selectTimerPreset(45);}else if(typeof setTimerPreset==='function'){setTimerPreset(45);} renderAlarmPanel();" class="py-2 rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/40 text-gray-200 text-xs font-mono font-bold transition cursor-pointer text-center">45m</button>
          <button onclick="if(typeof selectTimerPreset==='function'){selectTimerPreset(60);}else if(typeof setTimerPreset==='function'){setTimerPreset(60);} renderAlarmPanel();" class="py-2 rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/40 text-gray-200 text-xs font-mono font-bold transition cursor-pointer text-center">60m</button>
        </div>
      </div>

      <!-- Steuerungs-Buttons (Start / Pause / Reset & Stopp) -->
      <div class="flex gap-2 pt-1">
        ${tRunning ? `
          <button onclick="if(typeof pauseTimer==='function') pauseTimer(); renderAlarmPanel();" class="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 text-xs shadow-md active:scale-95">
            <i data-lucide="pause" class="w-4 h-4"></i>
            <span>Pausieren</span>
          </button>
        ` : `
          <button onclick="if(typeof startTimer==='function') startTimer(); renderAlarmPanel();" class="flex-1 py-2.5 bg-[#c084fc] text-black font-black shadow-[0_0_15px_rgba(192,132,252,0.4)] hover:bg-purple-500 text-white font-bold rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 text-xs shadow-md active:scale-95">
            <i data-lucide="play" class="w-4 h-4"></i>
            <span>Timer starten</span>
          </button>
        `}
        <button onclick="if(typeof stopTimer==='function') stopTimer(); else if(typeof resetTimer==='function') resetTimer(); renderAlarmPanel();" class="px-4 py-2.5 bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-gray-300 hover:text-rose-300 font-bold rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 text-xs active:scale-95" title="Stoppen & Zurücksetzen">
          <i data-lucide="square" class="w-3.5 h-3.5"></i>
          <span>Stop</span>
        </button>
      </div>

    </div>
  `;
  renderLucideIcons();
  if (typeof window !== 'undefined' && window.NoodleInteractionMode && typeof window.NoodleInteractionMode.decoratePanel === 'function') {
    window.NoodleInteractionMode.decoratePanel(panel, 'alarm');
  }
}

function handleAddAlarm() {
  const time = document.getElementById('new-alarm-time')?.value;
  const label = document.getElementById('new-alarm-label')?.value || 'Wecker';
  if (!time) return;
  alarmState.alarms.push({ id: Date.now().toString(), time, label, active: true });
  saveAlarmState();
  renderAlarmPanel();
  if (typeof showToast === 'function') showToast(`Wecker für ${time} aktiviert ⏰`);
}

function handleToggleAlarm(id) {
  const a = alarmState.alarms.find(x => x.id === id);
  if (a) { a.active = !a.active; saveAlarmState(); renderAlarmPanel(); }
}

function handleDeleteAlarm(id) {
  if (id && typeof trackTombstone === 'function') {
    trackTombstone(id);
  }
  alarmState.alarms = alarmState.alarms.filter(x => x.id !== id);
  saveAlarmState();
  renderAlarmPanel();
}

function handleAddReminder() {
  const txt = document.getElementById('new-reminder-text');
  const sel = document.getElementById('new-reminder-mins');
  const urgentCb = document.getElementById('new-reminder-urgent');
  if (!txt || !txt.value.trim()) return;
  const mins = parseInt(sel.value) || 10;
  const isUrgent = urgentCb ? urgentCb.checked : (alarmState.settings?.remindersAsAlarm !== false);
  alarmState.reminders.push({
    id: Date.now().toString(),
    text: txt.value.trim(),
    time: Date.now() + mins * 60000,
    completed: false,
    isUrgent: isUrgent
  });
  saveAlarmState();
  renderAlarmPanel();
  if (typeof showToast === 'function') {
    showToast(`Erinnerung in ${mins} Min gesetzt! ${isUrgent ? '⚡ (Dauer-Wecker)' : '🔔'}`);
  }
  txt.value = '';
}

function handleToggleReminder(id) {
  const r = alarmState.reminders.find(x => x.id === id);
  if (r) { r.completed = !r.completed; saveAlarmState(); renderAlarmPanel(); }
}

function handleDeleteReminder(id) {
  if (id && typeof trackTombstone === 'function') {
    trackTombstone(id);
  }
  alarmState.reminders = alarmState.reminders.filter(x => x.id !== id);
  saveAlarmState();
  renderAlarmPanel();
}

// =========================================================================
// WEBAUDIO HOCHLEISTUNGS-SYNTHESIZER (LAUT, DURCHDRINGEND & VERLÄSSLICH)
// =========================================================================
let _alarmAudioCtx = null;
function getAlarmAudioContext() {
  if (typeof initAudioContext === 'function') {
    try { initAudioContext(); } catch(e){}
  }
  if (typeof audioCtx !== 'undefined' && audioCtx) {
    if (audioCtx.state === 'suspended') {
      try { audioCtx.resume(); } catch(e){}
    }
    return audioCtx;
  }
  if (!_alarmAudioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      _alarmAudioCtx = new AudioContextClass();
    }
  }
  if (_alarmAudioCtx && _alarmAudioCtx.state === 'suspended') {
    try { _alarmAudioCtx.resume(); } catch(e){}
  }
  return _alarmAudioCtx;
}

function playSynthesizedAlarmSound(soundType = 'digital', volumeLevel = 0.9, isEscalated = false) {
  try {
    const ctx = getAlarmAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const vol = Math.max(0.15, Math.min(1.0, parseFloat(volumeLevel) || 0.9));
    const dest = (typeof getMasterAudioDestination === 'function' ? getMasterAudioDestination() : null) || ctx.destination;

    const createTone = (freq, type, startTime, duration, gainVal) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Knackiger, durchdringender Attack für maximale Weckwirkung ohne Audio-Clipping
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(gainVal * vol, startTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.04);
    };

    switch (soundType) {
      case 'bell': {
        // Glocken-Fanfare / Harmonischer Resonanz-Chime
        const bellTones = [523.25, 659.25, 783.99, 1046.5];
        bellTones.forEach((freq, idx) => {
          createTone(freq, 'sine', now + idx * 0.07, 0.85, 0.45);
          createTone(freq * 2.01, 'triangle', now + idx * 0.07, 0.4, 0.25);
        });
        break;
      }
      case 'radar': {
        // Radar Sweep / Pulsierende Dringlichkeit
        const sweeps = isEscalated ? [0, 0.2, 0.4] : [0, 0.32];
        sweeps.forEach(delay => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(580, now + delay);
          osc.frequency.exponentialRampToValueAtTime(1450, now + delay + 0.16);
          gain.gain.setValueAtTime(0.001, now + delay);
          gain.gain.linearRampToValueAtTime(0.48 * vol, now + delay + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.18);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now + delay);
          osc.stop(now + delay + 0.2);
        });
        break;
      }
      case 'retro': {
        // Mechanische Doppelglocke (Vintage Wecker Klingel)
        const strikes = isEscalated ? 14 : 10;
        for (let i = 0; i < strikes; i++) {
          const f = i % 2 === 0 ? 820 : 920;
          createTone(f, 'square', now + i * 0.045, 0.055, 0.32);
        }
        break;
      }
      case 'digital':
      default: {
        // Klassischer lauter Digitalwecker (Durchdringender Doppel-Beep, 4-fach bei Eskalation)
        if (isEscalated) {
          [0, 0.11, 0.22, 0.33].forEach(delay => {
            createTone(1020, 'square', now + delay, 0.07, 0.48);
            createTone(2040, 'sine', now + delay, 0.07, 0.36);
          });
        } else {
          [0, 0.17].forEach(delay => {
            createTone(960, 'square', now + delay, 0.09, 0.48);
            createTone(1920, 'sine', now + delay, 0.09, 0.36);
          });
        }
        break;
      }
    }
  } catch (err) {
    console.warn('[Alarm Audio] Sound-Synthese Warnung:', err);
  }
}

function testAlarmSound() {
  const soundType = document.getElementById('alarm-setting-sound')?.value || alarmState.settings?.sound || 'digital';
  const volumeLevel = parseFloat(document.getElementById('alarm-setting-volume')?.value) || alarmState.settings?.volume || 0.9;
  playSynthesizedAlarmSound(soundType, volumeLevel, false);
  if ('vibrate' in navigator && (alarmState.settings?.vibrate !== false)) {
    try { navigator.vibrate([250, 100, 250]); } catch(e){}
  }
  const soundLabels = {
    digital: '📟 Digital (Laut)',
    bell: '🔔 Glocken-Chime',
    radar: '📡 Radar-Sweep',
    retro: '⏰ Retro-Klingel'
  };
  if (typeof showToast === 'function') {
    showToast(`🔊 Signal-Test (${Math.round(volumeLevel * 100)}%): ${soundLabels[soundType] || soundType}`);
  }
}

function handleUpdateAlarmSetting(key, val) {
  if (!alarmState.settings) alarmState.settings = Object.assign({}, DEFAULT_ALARM_SETTINGS);
  alarmState.settings[key] = val;
  saveAlarmState();
}

function handleUpdateAlarmVolume(val) {
  const v = parseFloat(val) || 0.9;
  if (!alarmState.settings) alarmState.settings = Object.assign({}, DEFAULT_ALARM_SETTINGS);
  alarmState.settings.volume = v;
  const lbl = document.getElementById('alarm-vol-label');
  if (lbl) lbl.textContent = `${Math.round(v * 100)}%`;
  saveAlarmState();
}

// =========================================================================
// DAUERHAFTE WECKSCHLEIFE & SMARTPHONE VIBRATION / WAKE LOCK
// =========================================================================
let activeAlarmRingInterval = null;
let alarmRingElapsedSec = 0;
let activeWakeLock = null;
let activeAlarmData = null;
let alarmModalClockInterval = null;
let activeAlarmKeyHandler = null;

function startContinuousAlarmRinging(title, time, isReminder = false, reminderId = null) {
  stopContinuousAlarmRinging(false);

  activeAlarmData = { title, time, isReminder, reminderId, startTime: Date.now() };
  alarmRingElapsedSec = 0;

  // 1. Screen Wake Lock auf Smartphones / mobilen Browsern anfordern
  if ('wakeLock' in navigator && !activeWakeLock) {
    try {
      navigator.wakeLock.request('screen').then(lock => {
        activeWakeLock = lock;
        lock.addEventListener('release', () => { activeWakeLock = null; });
      }).catch(err => {
        console.warn('[Alarm WakeLock] Nicht verfügbar:', err);
      });
    } catch (e) {}
  }

  // 2. Alarm-Tick: Sound + Vibration ununterbrochen im Takt
  const ringTick = () => {
    const isEscalated = alarmRingElapsedSec >= 15;
    const snd = alarmState.settings?.sound || 'digital';
    const vol = alarmState.settings?.volume ?? 0.9;
    playSynthesizedAlarmSound(snd, vol, isEscalated);

    if (alarmState.settings?.vibrate !== false && 'vibrate' in navigator) {
      try {
        if (isEscalated) {
          navigator.vibrate([300, 100, 300, 100, 300, 100, 500]);
        } else {
          navigator.vibrate([400, 150, 400, 150, 600]);
        }
      } catch (e) {}
    }

    alarmRingElapsedSec += 1.3;
    const durEl = document.getElementById('alarm-modal-elapsed');
    if (durEl) {
      durEl.textContent = `Klingelt seit ${Math.round(alarmRingElapsedSec)}s`;
      if (isEscalated) {
        durEl.className = 'text-xs text-rose-400 font-black animate-pulse font-mono';
      }
    }
  };

  ringTick();
  activeAlarmRingInterval = setInterval(ringTick, 1300);

  // 3. Vollbild-Modal öffnen
  triggerAlarmModal(title, time, isReminder, reminderId);
}

function stopContinuousAlarmRinging(removeModal = true) {
  if (activeAlarmRingInterval) {
    clearInterval(activeAlarmRingInterval);
    activeAlarmRingInterval = null;
  }
  if (alarmModalClockInterval) {
    clearInterval(alarmModalClockInterval);
    alarmModalClockInterval = null;
  }
  if ('vibrate' in navigator) {
    try { navigator.vibrate(0); } catch(e){}
  }
  if (activeWakeLock) {
    try { activeWakeLock.release(); } catch(e){}
    activeWakeLock = null;
  }
  if (activeAlarmKeyHandler) {
    document.removeEventListener('keydown', activeAlarmKeyHandler);
    activeAlarmKeyHandler = null;
  }
  if (removeModal) {
    const modal = document.getElementById('alarm-modal');
    if (modal) modal.remove();
    activeAlarmData = null;
    alarmRingElapsedSec = 0;
  }
}

function dismissActiveAlarm(reminderId = null) {
  stopContinuousAlarmRinging(true);
  if (reminderId) {
    const r = (alarmState.reminders || []).find(x => x.id === reminderId);
    if (r) {
      r.completed = true;
      saveAlarmState();
      renderAlarmPanel();
    }
  }
  if (typeof showToast === 'function') showToast('Alarm beendet 🔕');
}

function snoozeAlarm(minutes = 5) {
  const currentTitle = activeAlarmData?.title || 'Snooze Wecker ⏰';
  stopContinuousAlarmRinging(true);
  alarmState.reminders.push({
    id: Date.now().toString(),
    text: `💤 ${currentTitle}`,
    time: Date.now() + minutes * 60000,
    completed: false,
    isUrgent: true
  });
  saveAlarmState();
  renderAlarmPanel();
  if (typeof showToast === 'function') showToast(`Wecker für ${minutes} Minuten pausiert (Snooze) 💤`);
}

// =========================================================================
// HAUPT-PRÜFSCHLEIFE (WECKER & ERINNERUNGEN)
// =========================================================================
let lastTriggeredMinuteKey = '';
function checkAlarmsLoop() {
  const now = new Date();
  const hm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const minuteKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${hm}`;
  
  if (minuteKey !== lastTriggeredMinuteKey) {
    (alarmState.alarms || []).forEach(a => {
      if (a.active && a.time === hm) {
        lastTriggeredMinuteKey = minuteKey;
        startContinuousAlarmRinging(a.label || 'Wecker', a.time, false, null);
        sendBrowserNotification(`⏰ Wecker: ${a.label || 'Wecker'} (${a.time})`, 'Dein Wecker klingelt jetzt!', true);
      }
    });
  }

  const nowMs = Date.now();
  (alarmState.reminders || []).forEach(r => {
    if (!r.completed && r.time <= nowMs) {
      r.completed = true;
      saveAlarmState();
      renderAlarmPanel();
      const safeEscape = typeof escapeHtml === 'function' ? escapeHtml : (str) => String(str || '');
      sendBrowserNotification(`🔔 Erinnerung: ${r.text}`, 'Deine Erinnerung ist jetzt fällig!', true);

      const shouldAlarm = r.isUrgent !== undefined ? r.isUrgent : (alarmState.settings?.remindersAsAlarm !== false);
      if (shouldAlarm) {
        startContinuousAlarmRinging(r.text, 'Erinnerung', true, r.id);
      } else {
        if (typeof showToast === 'function') showToast(`🔔 Erinnerung: "${safeEscape(r.text)}"`);
        if (typeof playProceduralSound === 'function') playProceduralSound(1);
      }
    }
  });
}

// =========================================================================
// OPTISCH PULSIERENDER VOLLBILD-ALARM MIT TASTEN-SHORTCUTS
// =========================================================================
function triggerAlarmModal(title, time, isReminder = false, reminderId = null) {
  const existing = document.getElementById('alarm-modal');
  if (existing) existing.remove();

  const safeEscape = typeof escapeHtml === 'function' ? escapeHtml : (str) => String(str || '');
  const isRem = Boolean(isReminder);

  const d = document.createElement('div');
  d.id = 'alarm-modal';
  d.className = 'fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none';

  const accentBorder = isRem ? 'border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.45)]' : 'border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.45)]';
  const accentBadge = isRem ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  const accentIcon = isRem ? 'bell-ring' : 'alarm-clock';
  const badgeText = isRem ? '🔔 DRINGENDE ERINNERUNG' : `⏰ WECKER (${safeEscape(time)})`;

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  d.innerHTML = `
    <div class="relative w-full max-w-sm bg-[#13131f] border-2 ${accentBorder} rounded-3xl p-6 flex flex-col items-center text-center gap-4">
      
      <!-- Pulsierender Wecker-Ring -->
      <div class="relative flex items-center justify-center mt-1">
        <div class="absolute w-20 h-20 rounded-full ${isRem ? 'bg-amber-500/20' : 'bg-rose-500/20'} animate-ping pointer-events-none"></div>
        <div class="w-16 h-16 rounded-2xl ${accentBadge} border flex items-center justify-center text-white relative shadow-xl">
          <i data-lucide="${accentIcon}" class="w-8 h-8 ${isRem ? 'text-amber-400' : 'text-rose-400'} animate-bounce"></i>
        </div>
      </div>

      <!-- Live Digital-Uhr -->
      <div>
        <div id="alarm-modal-live-time" class="text-3xl font-mono font-black text-white tracking-widest drop-shadow-md">
          ${timeFormatted}
        </div>
        <div class="text-[10px] font-bold tracking-widest uppercase mt-1 px-3 py-0.5 rounded-full border inline-block ${accentBadge}">
          ${badgeText}
        </div>
      </div>

      <!-- Wecker-Titel -->
      <div class="space-y-1 w-full px-1">
        <h3 class="text-xl font-bold text-white break-words">${safeEscape(title || (isRem ? 'Erinnerung' : 'Weckzeit erreicht'))}</h3>
        <div id="alarm-modal-elapsed" class="text-xs text-gray-400 font-mono">Signal ist aktiv</div>
      </div>

      <!-- Große taktile Touch & Klick-Buttons -->
      <div class="flex flex-col gap-2 w-full mt-2">
        <button id="alarm-btn-stop" onclick="dismissActiveAlarm(${isRem ? `'${reminderId || ''}'` : 'null'})" class="w-full py-3 px-4 ${isRem ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)]'} active:scale-95 font-black text-sm rounded-2xl cursor-pointer transition flex items-center justify-center gap-2">
          <i data-lucide="bell-off" class="w-4 h-4"></i>
          <span>Stoppen 🔕</span>
        </button>
        <button id="alarm-btn-snooze" onclick="snoozeAlarm()" class="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 active:scale-95 text-gray-200 font-bold text-xs rounded-2xl cursor-pointer transition border border-white/10 flex items-center justify-center gap-2">
          <span>Snooze (5 Min) 💤</span>
        </button>
      </div>

      <!-- Tastatur-Shortcuts auf PC -->
      <div class="text-[10px] text-gray-500 font-mono hidden sm:block">
        Tasten: <kbd class="px-1 py-0.5 bg-black/50 border border-white/10 rounded text-gray-300">ESC</kbd> oder <kbd class="px-1 py-0.5 bg-black/50 border border-white/10 rounded text-gray-300">Space</kbd> zum Stoppen • <kbd class="px-1 py-0.5 bg-black/50 border border-white/10 rounded text-gray-300">S</kbd> für Snooze
      </div>

    </div>
  `;

  document.body.appendChild(d);
  if (typeof renderLucideIcons === 'function') renderLucideIcons();

  // Live-Uhr im Modal sekundengenau aktualisieren
  alarmModalClockInterval = setInterval(() => {
    const clockEl = document.getElementById('alarm-modal-live-time');
    if (clockEl) {
      const n = new Date();
      clockEl.textContent = n.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }, 1000);

  // Tastatur-Handler
  activeAlarmKeyHandler = (e) => {
    if (e.key === 'Escape' || e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      dismissActiveAlarm(isRem ? reminderId : null);
    } else if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      snoozeAlarm();
    }
  };
  document.addEventListener('keydown', activeAlarmKeyHandler);
}

let alarmLoopStarted = false;
function startAlarmLoopOnce() {
  if (alarmLoopStarted) return;
  alarmLoopStarted = true;
  initAlarmReminder();
  setInterval(checkAlarmsLoop, 5000);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', startAlarmLoopOnce);
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    startAlarmLoopOnce();
  }
}

if (typeof window !== 'undefined') {
  window.alarmState = alarmState;
  window.DEFAULT_ALARM_SETTINGS = DEFAULT_ALARM_SETTINGS;
  window.initAlarmReminder = initAlarmReminder;
  window.saveAlarmState = saveAlarmState;
  window.renderAlarmPanel = renderAlarmPanel;
  window.checkAlarmsLoop = checkAlarmsLoop;
  window.triggerAlarmModal = triggerAlarmModal;
  window.snoozeAlarm = snoozeAlarm;
  window.dismissActiveAlarm = dismissActiveAlarm;
  window.switchAlarmTab = switchAlarmTab;
  window.openAlarmModal = openAlarmModal;
  window.requestAlarmNotificationPermission = requestAlarmNotificationPermission;
  window.handleAddAlarm = handleAddAlarm;
  window.handleToggleAlarm = handleToggleAlarm;
  window.handleDeleteAlarm = handleDeleteAlarm;
  window.handleAddReminder = handleAddReminder;
  window.handleToggleReminder = handleToggleReminder;
  window.handleDeleteReminder = handleDeleteReminder;
  window.startContinuousAlarmRinging = startContinuousAlarmRinging;
  window.stopContinuousAlarmRinging = stopContinuousAlarmRinging;
  window.testAlarmSound = testAlarmSound;
  window.handleUpdateAlarmSetting = handleUpdateAlarmSetting;
  window.handleUpdateAlarmVolume = handleUpdateAlarmVolume;
}
if (typeof globalThis !== 'undefined') {
  globalThis.alarmState = alarmState;
  globalThis.DEFAULT_ALARM_SETTINGS = DEFAULT_ALARM_SETTINGS;
  globalThis.initAlarmReminder = initAlarmReminder;
  globalThis.saveAlarmState = saveAlarmState;
  globalThis.renderAlarmPanel = renderAlarmPanel;
  globalThis.checkAlarmsLoop = checkAlarmsLoop;
  globalThis.triggerAlarmModal = triggerAlarmModal;
  globalThis.snoozeAlarm = snoozeAlarm;
  globalThis.dismissActiveAlarm = dismissActiveAlarm;
  globalThis.switchAlarmTab = switchAlarmTab;
  globalThis.openAlarmModal = openAlarmModal;
  globalThis.requestAlarmNotificationPermission = requestAlarmNotificationPermission;
  globalThis.handleAddAlarm = handleAddAlarm;
  globalThis.handleToggleAlarm = handleToggleAlarm;
  globalThis.handleDeleteAlarm = handleDeleteAlarm;
  globalThis.handleAddReminder = handleAddReminder;
  globalThis.handleToggleReminder = handleToggleReminder;
  globalThis.handleDeleteReminder = handleDeleteReminder;
  globalThis.startContinuousAlarmRinging = startContinuousAlarmRinging;
  globalThis.stopContinuousAlarmRinging = stopContinuousAlarmRinging;
  globalThis.testAlarmSound = testAlarmSound;
  globalThis.handleUpdateAlarmSetting = handleUpdateAlarmSetting;
  globalThis.handleUpdateAlarmVolume = handleUpdateAlarmVolume;
}
