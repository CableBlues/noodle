// app-alarm.js: Wecker & Reminder (Zuverlässige minütliche Auslösung)
let alarmState = { alarms: [], reminders: [] };

function initAlarmReminder() {
  try {
    const defaultData = {
      alarms: [{ id: '1', time: '08:00', label: 'Fokus-Start', active: true }],
      reminders: [{ id: '101', text: 'Wasser trinken 💧', time: Date.now() + 600000, completed: false }]
    };
    if (typeof AppStorage !== 'undefined') {
      alarmState = AppStorage.get('flow_alarms_reminders', defaultData);
    } else {
      const s = localStorage.getItem('flow_alarms_reminders');
      alarmState = s ? JSON.parse(s) : defaultData;
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

function sendBrowserNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body: body,
            icon: 'icon-192.png',
            badge: 'icon-192.png',
            vibrate: [200, 100, 200]
          });
        });
      } else {
        new Notification(title, { body: body, icon: 'icon-192.png' });
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

function openAlarmModal(tab = 'alarms') {
  currentAlarmTab = tab;
  if (typeof togglePanel === 'function') {
    togglePanel('alarm');
  }
  renderAlarmPanel();
}
window.openAlarmModal = openAlarmModal;

function renderAlarmPanel() {
  const panel = document.getElementById('panel-alarm');
  if (!panel) return;
  panel.style.width = "380px";
  panel.style.maxWidth = "95vw";
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
    <div class="flex items-center justify-between border-b border-white/10 pb-2.5">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
          <i data-lucide="${currentAlarmTab === 'alarms' ? 'alarm-clock' : 'timer'}" class="w-4 h-4 text-cyan-400"></i>
        </div>
        <div>
          <h4 class="font-bold text-xs font-display text-white">Wecker & Timer Hub</h4>
          <div class="text-[8px] text-gray-400 font-mono">Präzise Zeit- & Fokus-Steuerung</div>
        </div>
      </div>
      <button onclick="togglePanel('alarm')" aria-label="Wecker-Hub schließen" class="text-gray-400 hover:text-white text-xs font-bold p-1 cursor-pointer">✕</button>
    </div>

    <!-- 2 Separate, Funktionale Tabs -->
    <div class="grid grid-cols-2 gap-1.5 p-1 bg-black/60 border border-white/10 rounded-2xl text-xs font-bold mt-1">
      <button onclick="switchAlarmTab('alarms')" class="py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${currentAlarmTab === 'alarms' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}">
        <i data-lucide="alarm-clock" class="w-3.5 h-3.5 ${currentAlarmTab === 'alarms' ? 'text-white' : 'text-cyan-400'}"></i>
        <span>⏰ Wecker</span>
        ${alarmCount > 0 ? `<span class="px-1.5 py-0.2 rounded-full text-[9px] bg-white/20 font-mono">${alarmCount}</span>` : ''}
      </button>
      <button onclick="switchAlarmTab('timer')" class="py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${currentAlarmTab === 'timer' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}">
        <i data-lucide="timer" class="w-3.5 h-3.5 ${currentAlarmTab === 'timer' ? 'text-white' : 'text-purple-400'}"></i>
        <span>⏱️ Fokus-Timer</span>
        ${tRunning ? `<span class="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-400 text-black font-mono font-bold animate-pulse">LÄUFT</span>` : ''}
      </button>
    </div>

    <!-- TAB 1: WECKER & ERINNERUNGEN -->
    <div id="alarm-subpane-alarms" class="${currentAlarmTab === 'alarms' ? 'block' : 'hidden'} space-y-3 pt-2">
      <!-- Info & Benachrichtigungen -->
      <div class="p-2 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-[10px] text-cyan-200/90 flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-1 font-semibold">
            <i data-lucide="info" class="w-3 h-3 text-cyan-400 shrink-0"></i>
            <span>Akustische Wecksignale</span>
          </span>
          ${notifPerm === 'granted' ? `
            <span class="text-emerald-400 font-mono text-[9px] font-bold">🔔 Erlaubt</span>
          ` : (hasNotif ? `
            <button onclick="requestAlarmNotificationPermission()" class="px-2 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 rounded text-[9px] font-bold cursor-pointer transition">Benachrichtigung erlauben</button>
          ` : '')}
        </div>
      </div>

      <!-- Neuer Wecker anlegen -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-wider text-cyan-400">⏰ Neuer Wecker</span>
          <span class="text-[9px] text-gray-400 font-mono">Aktuell: <b class="text-white">${nowStr}</b></span>
        </div>
        <div class="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
          <input type="time" id="new-alarm-time" value="09:00" class="p-2 bg-[#12121c] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500 font-semibold cursor-pointer" />
          <input type="text" id="new-alarm-label" placeholder="Bezeichnung (z.B. Aufstehen, Meeting)..." class="flex-1 p-2 bg-[#12121c] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500 font-semibold placeholder:text-gray-500" />
          <button onclick="handleAddAlarm()" aria-label="Wecker hinzufügen" class="px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center shadow-sm">
            <i data-lucide="plus" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- Wecker-Liste -->
      <div class="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
        ${(!alarmState.alarms || alarmState.alarms.length === 0) ? `
          <div class="text-center py-4 text-gray-500 text-xs font-medium">Keine Wecker gestellt</div>
        ` : (alarmState.alarms || []).map(a => `
          <div class="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded-xl hover:border-cyan-500/30 transition">
            <div class="flex items-center gap-2.5">
              <input type="checkbox" ${a.active ? 'checked' : ''} onchange="handleToggleAlarm('${a.id}')" class="w-4 h-4 accent-cyan-500 cursor-pointer rounded" />
              <div>
                <div class="text-xs font-bold text-white font-mono leading-none mb-0.5">${safeEscape(a.time)}</div>
                <div class="text-[10px] text-gray-400 leading-none">${safeEscape(a.label || 'Wecker')}</div>
              </div>
            </div>
            <button onclick="handleDeleteAlarm('${a.id}')" aria-label="Wecker löschen" class="text-gray-500 hover:text-rose-400 p-1 transition cursor-pointer" title="Löschen">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        `).join('')}
      </div>

      <!-- Schnelle Reminder / Countdown-Erinnerung -->
      <div class="pt-2 border-t border-white/10 space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400">🔔 Schnelle Erinnerung</span>
          <span class="text-[9px] text-gray-400">Timer-Check-In</span>
        </div>
        <div class="flex gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5">
          <input type="text" id="new-reminder-text" placeholder="Erinnerung (z.B. Wasser trinken 💧)..." class="flex-1 p-1.5 bg-[#12121c] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-amber-500 font-semibold placeholder:text-gray-500" />
          <select id="new-reminder-mins" class="p-1.5 bg-[#12121c] border border-white/10 rounded-xl text-xs text-amber-300 font-bold outline-none cursor-pointer">
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

        <div class="space-y-1 max-h-[120px] overflow-y-auto pr-1">
          ${(!alarmState.reminders || alarmState.reminders.length === 0) ? `
            <div class="text-center py-2 text-gray-500 text-[10px]">Keine schnellen Erinnerungen aktiv</div>
          ` : (alarmState.reminders || []).map(r => {
            const leftMin = Math.max(0, Math.round((r.time - Date.now()) / 60000));
            return `
              <div class="flex items-center justify-between p-1.5 px-2 bg-white/[0.02] border border-white/5 rounded-lg ${r.completed ? 'opacity-40 line-through' : ''}">
                <div class="flex items-center gap-2 min-w-0">
                  <input type="checkbox" ${r.completed ? 'checked' : ''} onchange="handleToggleReminder('${r.id}')" class="w-3.5 h-3.5 accent-amber-500 cursor-pointer rounded" />
                  <span class="text-xs font-semibold text-gray-200 truncate">${safeEscape(r.text)}</span>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-[9px] font-mono text-amber-400 font-bold">${r.completed ? 'Erledigt' : `${leftMin}m`}</span>
                  <button onclick="handleDeleteReminder('${r.id}')" aria-label="Erinnerung löschen" class="text-gray-500 hover:text-rose-400 p-0.5 transition cursor-pointer" title="Löschen">
                    <i data-lucide="trash-2" class="w-3 h-3"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- TAB 2: SMART FOKUS-TIMER (ANGENEHM & FUNKTIONELL) -->
    <div id="alarm-subpane-timer" class="${currentAlarmTab === 'timer' ? 'block' : 'hidden'} space-y-3.5 pt-2">
      
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
          <button onclick="if(typeof startTimer==='function') startTimer(); renderAlarmPanel();" class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 text-xs shadow-md active:scale-95">
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
  if (!txt || !txt.value.trim()) return;
  const mins = parseInt(sel.value) || 10;
  alarmState.reminders.push({
    id: Date.now().toString(),
    text: txt.value.trim(),
    time: Date.now() + mins * 60000,
    completed: false
  });
  saveAlarmState();
  renderAlarmPanel();
  if (typeof showToast === 'function') showToast(`Erinnerung in ${mins} Min gesetzt! 🔔`);
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


let lastTriggeredMinuteKey = '';
function checkAlarmsLoop() {
  const now = new Date();
  const hm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const minuteKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${hm}`;
  
  if (minuteKey !== lastTriggeredMinuteKey) {
    (alarmState.alarms || []).forEach(a => {
      if (a.active && a.time === hm) {
        lastTriggeredMinuteKey = minuteKey;
        triggerAlarmModal(a.label, a.time);
        sendBrowserNotification(`⏰ Wecker: ${a.label || 'Wecker'} (${a.time})`, 'Dein Wecker ist jetzt fällig!');
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
      if (typeof showToast === 'function') showToast(`🔔 Erinnerung: "${safeEscape(r.text)}"`);
      if (typeof playProceduralSound === 'function') playProceduralSound(1);
      sendBrowserNotification('🔔 Noodle Reminder', r.text);
    }
  });
}

function triggerAlarmModal(title, time) {
  if (typeof playProceduralSound === 'function') {
    playProceduralSound(0);
    setTimeout(() => playProceduralSound(2), 500);
  }
  const existing = document.getElementById('alarm-modal');
  if (existing) existing.remove();

  const safeEscape = typeof escapeHtml === 'function' ? escapeHtml : (str) => String(str || '');

  const d = document.createElement('div');
  d.id = 'alarm-modal';
  d.className = 'fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4';
  d.innerHTML = `
    <div class="w-full max-w-sm bg-[#161622] border-2 border-cyan-500 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4">
      <div class="w-16 h-16 rounded-2xl bg-cyan-500/25 border border-cyan-500/40 flex items-center justify-center text-cyan-400 animate-bounce">
        <i data-lucide="alarm-clock" class="w-8 h-8"></i>
      </div>
      <div>
        <div class="text-[10px] uppercase font-bold tracking-widest text-cyan-400 mb-1">Wecker (${safeEscape(time)})</div>
        <h3 class="text-xl font-bold text-white">${safeEscape(title)}</h3>
      </div>
      <div class="flex gap-2 w-full mt-2">
        <button onclick="document.getElementById('alarm-modal').remove(); snoozeAlarm();" class="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-gray-200 font-bold text-xs rounded-xl cursor-pointer">Snooze 💤</button>
        <button onclick="document.getElementById('alarm-modal').remove();" class="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl cursor-pointer">Stoppen 🔕</button>
      </div>
    </div>
  `;
  document.body.appendChild(d);
  renderLucideIcons();
}

function snoozeAlarm() {
  alarmState.reminders.push({
    id: Date.now().toString(),
    text: 'Snooze Wecker ⏰',
    time: Date.now() + 5 * 60000,
    completed: false
  });
  saveAlarmState();
  renderAlarmPanel();
  if (typeof showToast === 'function') showToast('Wecker für 5 Minuten pausiert (Snooze) 💤');
}

let alarmLoopStarted = false;
function startAlarmLoopOnce() {
  if (alarmLoopStarted) return;
  alarmLoopStarted = true;
  initAlarmReminder();
  setInterval(checkAlarmsLoop, 5000);
}

document.addEventListener('DOMContentLoaded', startAlarmLoopOnce);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  startAlarmLoopOnce();
}

if (typeof window !== 'undefined') {
  window.alarmState = alarmState;
  window.initAlarmReminder = initAlarmReminder;
  window.saveAlarmState = saveAlarmState;
  window.renderAlarmPanel = renderAlarmPanel;
  window.checkAlarmsLoop = checkAlarmsLoop;
  window.triggerAlarmModal = triggerAlarmModal;
  window.snoozeAlarm = snoozeAlarm;
  window.switchAlarmTab = switchAlarmTab;
  window.openAlarmModal = openAlarmModal;
  window.requestAlarmNotificationPermission = requestAlarmNotificationPermission;
  window.handleAddAlarm = handleAddAlarm;
  window.handleToggleAlarm = handleToggleAlarm;
  window.handleDeleteAlarm = handleDeleteAlarm;
  window.handleAddReminder = handleAddReminder;
  window.handleToggleReminder = handleToggleReminder;
  window.handleDeleteReminder = handleDeleteReminder;
}
if (typeof globalThis !== 'undefined') {
  globalThis.alarmState = alarmState;
  globalThis.initAlarmReminder = initAlarmReminder;
  globalThis.saveAlarmState = saveAlarmState;
  globalThis.renderAlarmPanel = renderAlarmPanel;
  globalThis.checkAlarmsLoop = checkAlarmsLoop;
  globalThis.triggerAlarmModal = triggerAlarmModal;
  globalThis.snoozeAlarm = snoozeAlarm;
  globalThis.switchAlarmTab = switchAlarmTab;
  globalThis.openAlarmModal = openAlarmModal;
  globalThis.requestAlarmNotificationPermission = requestAlarmNotificationPermission;
  globalThis.handleAddAlarm = handleAddAlarm;
  globalThis.handleToggleAlarm = handleToggleAlarm;
  globalThis.handleDeleteAlarm = handleDeleteAlarm;
  globalThis.handleAddReminder = handleAddReminder;
  globalThis.handleToggleReminder = handleToggleReminder;
  globalThis.handleDeleteReminder = handleDeleteReminder;
}
