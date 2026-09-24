function adjustPanelPosition(el, panelName) {
  if (!el || typeof window === 'undefined' || typeof document === 'undefined') return;

  const isMobile = (window.innerWidth || document.documentElement.clientWidth || 0) <= 768;
  const vh = window.innerHeight || document.documentElement.clientHeight || 800;
  const vw = window.innerWidth || document.documentElement.clientWidth || 1200;

  if (isMobile) {
    el.style.maxHeight = 'calc(100dvh - 110px - env(safe-area-inset-bottom, 0px))';
    el.style.overflowY = 'auto';
    return;
  }

  // Desktop (> 768px):
  const toolsPanel = document.getElementById('panel-header-tools');
  const isToolsSubpanel = el.classList.contains('dock-popover-panel') && el.closest('#panel-header-tools');

  if (isToolsSubpanel && toolsPanel) {
    // Initial placement at top of tools panel, with full screen headroom
    el.style.top = '0px';
    el.style.maxHeight = `calc(100vh - 32px)`;
    el.style.overflowY = 'auto';

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        if (!el || el.classList.contains('hidden')) return;
        const rect = el.getBoundingClientRect();

        // Check vertical bounds: shift upwards if extending below bottom margin
        if (rect.bottom > vh - 16) {
          const overflow = rect.bottom - (vh - 16);
          const toolsRect = toolsPanel.getBoundingClientRect();
          const maxShiftUp = Math.max(0, toolsRect.top - 12);
          const actualShift = Math.min(overflow, maxShiftUp);
          el.style.top = `-${actualShift}px`;
        } else {
          el.style.top = '0px';
        }

        // Re-measure after vertical shift to ensure height doesn't overflow viewport
        const postRect = el.getBoundingClientRect();
        const availableHeight = Math.max(260, vh - Math.max(12, postRect.top) - 16);
        el.style.maxHeight = `${availableHeight}px`;

        // Check horizontal bounds: ensure panel does not overflow right edge or clip left edge
        if (postRect.right > vw - 12) {
          const rightOverflow = postRect.right - (vw - 12);
          el.style.transform = `translateX(-${rightOverflow}px)`;
        } else if (postRect.left < 12) {
          const leftDeficit = 12 - postRect.left;
          el.style.transform = `translateX(${leftDeficit}px)`;
        } else {
          el.style.transform = '';
        }
      });
    }
  } else {
    // Header dropdowns (weather, calendar, pause, report, settings, timer-presets, feedback, etc.)
    el.style.maxHeight = `calc(100vh - 65px)`;
    el.style.overflowY = 'auto';
    
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        if (!el || el.classList.contains('hidden')) return;
        const rect = el.getBoundingClientRect();
        if (rect.bottom > vh - 16) {
          const availableHeight = Math.max(220, vh - Math.max(12, rect.top) - 16);
          el.style.maxHeight = `${availableHeight}px`;
        }
        if (rect.right > vw - 12) {
          const rightOverflow = rect.right - (vw - 12);
          el.style.transform = `translateX(-${rightOverflow}px)`;
        } else if (rect.left < 12) {
          const leftDeficit = 12 - rect.left;
          el.style.transform = `translateX(${leftDeficit}px)`;
        } else {
          el.style.transform = '';
        }
      });
    }
  }
}
if (typeof window !== 'undefined') {
  window.adjustPanelPosition = adjustPanelPosition;
  window.addEventListener('resize', () => {
    const openPanelName = window.currentlyOpenPanel || (typeof currentlyOpenPanel !== 'undefined' ? currentlyOpenPanel : null);
    if (openPanelName) {
      const openEl = document.getElementById(`panel-${openPanelName}`);
      if (openEl && !openEl.classList.contains('hidden')) {
        adjustPanelPosition(openEl, openPanelName);
      }
    }
  }, { passive: true });
}

function togglePanel(panelName) {
  if (typeof window !== 'undefined' && window.hoverPanelTimeout) {
    clearTimeout(window.hoverPanelTimeout);
    window.hoverPanelTimeout = null;
  }
  const el = document.getElementById(`panel-${panelName}`);
  if (!el) return;
  const isCurrentlyHidden = el.classList.contains('hidden');

  const TOOL_SUBPANELS = ['shopping', 'cooking', 'radio', 'news', 'audio', 'daily', 'impulse', 'inspiration', 'collab-chat'];
  const isSubpanelOfTools = TOOL_SUBPANELS.includes(panelName);

  // Andere Popover-Panels schließen
  ['header-tools', 'feedback', 'search', 'report', 'settings', 'settings-dropdown', 'soundscape', 'language', 'boost', 'music', 'theme', 'calendar-dropdown', 'inspiration', 'impulse', 'shopping', 'cooking', 'alarm', 'weather', 'news', 'radio', 'pause-dropdown', 'audio', 'daily', 'collab-chat', 'radio-news', 'timer-presets'].forEach(p => {
    if (isSubpanelOfTools && p === 'header-tools') return;
    if (p !== panelName) {
      const other = document.getElementById(`panel-${p}`);
      if (other) other.classList.add('hidden');
    }
  });

  const dockContainer = document.querySelector('.desktop-tools-sidebar, .mac-dock-container');

  if (isCurrentlyHidden) { 
    el.classList.remove('hidden'); 
    adjustPanelPosition(el, panelName);
    if (typeof window !== 'undefined') {
      window.currentlyOpenPanel = panelName;
      window.pinnedPanel = panelName;
    }
    if (typeof currentlyOpenPanel !== 'undefined') currentlyOpenPanel = panelName;
    if (typeof pinnedPanel !== 'undefined') pinnedPanel = panelName;

    if (dockContainer && ['audio', 'daily', 'alarm', 'radio-news', 'shopping', 'cooking', 'radio', 'news'].includes(panelName)) {
      dockContainer.classList.add('is-active');
    }

    if (panelName === 'report') updateReportPanel(); 
    if (panelName === 'shopping' && typeof renderShoppingList === 'function') renderShoppingList();
    if (panelName === 'cooking' && typeof renderCookingPanel === 'function') renderCookingPanel(true); 
    if (panelName === 'alarm' && typeof renderAlarmPanel === 'function') renderAlarmPanel();
    if (panelName === 'weather' && typeof fetchLocalWeather === 'function') fetchLocalWeather();
    if (panelName === 'news') {
      if (typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.initNewsPanel === 'function') {
        RadioNewsEngine.initNewsPanel();
      } else if (typeof renderNewsBriefing === 'function') {
        renderNewsBriefing();
      }
    }
    if (panelName === 'radio' && typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.initRadioPanel === 'function') {
      RadioNewsEngine.initRadioPanel();
    }
    if (panelName === 'radio-news' && typeof RadioNewsEngine !== 'undefined' && typeof RadioNewsEngine.initPanel === 'function') {
      RadioNewsEngine.initPanel();
    }
    if (panelName === 'impulse') {
      if (typeof suggestBoostActivity === 'function') suggestBoostActivity();
      if (typeof suggestInspirationQuote === 'function') suggestInspirationQuote();
    }
    if (panelName === 'daily') {
      if (typeof renderCookingPanel === 'function') renderCookingPanel(true);
      if (typeof renderShoppingList === 'function') renderShoppingList();
      if (typeof switchDailyTab === 'function') switchDailyTab('shopping');
    }
    if (panelName === 'audio') {
      const savedTab = (typeof window !== 'undefined' && window._lastActiveAudioTab) ? window._lastActiveAudioTab : 'ambient';
      if (typeof switchAudioTab === 'function') switchAudioTab(savedTab);
    }
    if (panelName === 'collab-chat' && typeof CollabEngine !== 'undefined') {
      if (typeof CollabEngine.renderChatMessages === 'function') CollabEngine.renderChatMessages();
      if (typeof CollabEngine.renderPresenceUI === 'function') CollabEngine.renderPresenceUI();
    }
    if (typeof renderLucideIcons === 'function') renderLucideIcons(false, el);
  } else {
    el.classList.add('hidden');
    if (typeof window !== 'undefined') {
      if (window.currentlyOpenPanel === panelName) window.currentlyOpenPanel = null;
      if (window.pinnedPanel === panelName) window.pinnedPanel = null;
    }
    if (typeof currentlyOpenPanel !== 'undefined' && currentlyOpenPanel === panelName) {
      currentlyOpenPanel = null;
    }
    if (typeof pinnedPanel !== 'undefined' && pinnedPanel === panelName) {
      pinnedPanel = null;
    }
    if (dockContainer) dockContainer.classList.remove('is-active');
  }
}

let reportTimeframe = 'today';
let dashboardTimeframe = 'week';

function setReportTimeframe(tf) {
  reportTimeframe = tf;
  ['today', 'week', 'month'].forEach(t => {
    const btn = document.getElementById(`report-tab-${t}`);
    if (btn) {
      if (t === tf) btn.className = 'px-2.5 py-1 rounded text-purple-300 bg-purple-500/25 cursor-pointer transition font-bold';
      else btn.className = 'px-2.5 py-1 rounded text-gray-400 hover:text-white cursor-pointer transition';
    }
  });
  updateReportPanel();
}

function calculateProductivePeakHours(doneItems = []) {
  if (!doneItems || doneItems.length === 0) {
    return {
      peakKey: 'morning',
      label: typeof t === 'function' ? t('morning_peak') : 'Morgens (06:00 - 12:00)',
      shortLabel: typeof currentLang !== 'undefined' && currentLang === 'de' ? 'Morgens' : 'Morning',
      timeRange: '06:00 - 12:00'
    };
  }

  const buckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  doneItems.forEach(item => {
    let hour = 10; // Default
    if (item.time && typeof item.time === 'string') {
      const match = item.time.match(/(\d{1,2}):/);
      if (match) hour = parseInt(match[1], 10);
    }
    if (hour >= 6 && hour < 12) buckets.morning++;
    else if (hour >= 12 && hour < 18) buckets.afternoon++;
    else if (hour >= 18 && hour < 24) buckets.evening++;
    else buckets.night++;
  });

  let maxKey = 'morning';
  let maxCount = -1;
  Object.keys(buckets).forEach(k => {
    if (buckets[k] > maxCount) {
      maxCount = buckets[k];
      maxKey = k;
    }
  });

  const labels = {
    morning: { short: 'Morgens', shortEn: 'Morning', range: '06:00 - 12:00' },
    afternoon: { short: 'Nachmittags', shortEn: 'Afternoon', range: '12:00 - 18:00' },
    evening: { short: 'Abends', shortEn: 'Evening', range: '18:00 - 24:00' },
    night: { short: 'Nachts', shortEn: 'Night', range: '00:00 - 06:00' }
  };

  const isDe = typeof currentLang === 'undefined' || currentLang === 'de';
  const info = labels[maxKey] || labels.morning;

  return {
    peakKey: maxKey,
    label: typeof t === 'function' ? (t(`${maxKey}_peak`) || info.range) : info.range,
    shortLabel: isDe ? info.short : info.shortEn,
    timeRange: info.range
  };
}

function calculateEstimatedFocusMinutes(doneItems = []) {
  if (!doneItems || doneItems.length === 0) return { totalMins: 0, text: '0m', sessions: 0 };
  const totalMins = doneItems.reduce((acc, item) => acc + (item.durationMinutes || 15), 0);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const text = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  return { totalMins, text, sessions: doneItems.length };
}

function calculateCategoryDistribution(doneItems = []) {
  if (!doneItems || doneItems.length === 0) return [];
  const counts = {};
  doneItems.forEach(item => {
    const origin = item.origin || 'todo';
    counts[origin] = (counts[origin] || 0) + 1;
  });

  const total = doneItems.length;
  const palette = {
    daily: { bg: 'bg-amber-400', text: 'text-amber-300' },
    weekly: { bg: 'bg-emerald-400', text: 'text-emerald-300' },
    todo: { bg: 'bg-purple-400', text: 'text-purple-300' },
    termine: { bg: 'bg-sky-400', text: 'text-sky-300' },
    occasionally: { bg: 'bg-rose-400', text: 'text-rose-300' }
  };

  return Object.keys(counts).map(catId => {
    const count = counts[catId];
    const pct = Math.round((count / total) * 100);
    const catLabel = typeof t === 'function' ? (t(catId) || catId) : catId;
    const style = palette[catId] || { bg: 'bg-indigo-400', text: 'text-indigo-300' };
    return { id: catId, label: catLabel, count, pct, bg: style.bg, text: style.text };
  }).sort((a, b) => b.count - a.count);
}

function renderWeeklyChart(targetElementId = 'report-weekly-chart', totalElementId = 'report-total-week-tasks', isDashboard = false) {
  const chartEl = document.getElementById(targetElementId);
  const totalWeekTasksEl = document.getElementById(totalElementId);
  if (!chartEl) return;
  chartEl.innerHTML = '';
  
  const now = new Date();
  const last7Days = [];
  const weekdaysShort = {
    de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'], el: ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'],
    fr: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'], it: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
  };

  const lang = typeof currentLang !== 'undefined' ? currentLang : (typeof state !== 'undefined' && state?.settings?.language ? state.settings.language : 'de');
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(now.getDate() - i); const iso = d.toISOString().split('T')[0];
    last7Days.push({ date: iso, label: weekdaysShort[lang]?.[d.getDay()] || weekdaysShort['de']?.[d.getDay()] || weekdaysShort['en'][d.getDay()], count: 0 });
  }

  let totalWeekCount = 0;
  (state.done || []).forEach(item => {
    const found = last7Days.find(day => day.date === item.date);
    if (found) { found.count++; totalWeekCount++; }
  });

  if (totalWeekTasksEl) {
    totalWeekTasksEl.innerText = tr({
      de: `${totalWeekCount} Aufgaben`, en: `${totalWeekCount} Tasks`,
      es: `${totalWeekCount} Tareas`, el: `${totalWeekCount} Εργασίες`,
      fr: `${totalWeekCount} Tâches`, it: `${totalWeekCount} Attività`
    });
  }

  const maxCount = Math.max(...last7Days.map(d => d.count), 4);
  last7Days.forEach(day => {
    const pct = Math.max(8, (day.count / maxCount) * 100);
    const isToday = day.date === now.toISOString().split('T')[0];
    const barCol = isToday ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]' : 'bg-purple-500 hover:bg-purple-400';
    const barBg = isToday ? 'bg-amber-500/15 border-amber-400/30' : 'bg-white/[0.04] border-white/10';
    const barWrapper = document.createElement('div');
    barWrapper.className = `flex flex-col items-center justify-end gap-1 flex-1 ${isDashboard ? 'max-w-[54px]' : 'max-w-[40px]'}`;
    barWrapper.innerHTML = `
      <span class="text-[10px] font-bold font-mono leading-none mb-0.5 ${day.count > 0 ? (isToday ? 'text-amber-300' : 'text-white') : 'text-gray-500'}">${day.count}</span>
      <div class="${isDashboard ? 'w-7 h-20' : 'w-5 h-11'} ${barBg} border rounded-xl relative flex items-end overflow-hidden cursor-pointer transition-transform hover:scale-105" title="${day.date}: ${day.count} erledigt">
        <div class="w-full ${barCol} transition-all duration-500 rounded-t" style="height: ${pct}%"></div>
      </div>
      <span class="text-[10px] font-bold leading-none mt-1 ${isToday ? 'text-amber-300 font-extrabold' : 'text-gray-400'}">${day.label}</span>
    `;
    chartEl.appendChild(barWrapper);
  });
}

function updateReportPanel() {
  const contentArea = document.getElementById('report-content-area');
  if (contentArea && (!document.getElementById('report-today-count') || contentArea.children.length === 0)) {
    contentArea.innerHTML = `
      <!-- Bento Kacheln für Schnellübersicht -->
      <div class="grid grid-cols-3 gap-2">
        <div class="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
          <div class="text-[10px] text-gray-400 font-medium mb-0.5" data-i18n="completed_stat">Erledigt</div>
          <div id="report-today-count" class="text-lg font-black font-display text-emerald-400">0</div>
        </div>
        <div class="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
          <div class="text-[10px] text-gray-400 font-medium mb-0.5" data-i18n="focus_time">Fokus</div>
          <div id="report-focus-time" class="text-lg font-black font-display text-purple-300">0m</div>
        </div>
        <div class="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
          <div class="text-[10px] text-gray-400 font-medium mb-0.5" data-i18n="peak_hours">Peak</div>
          <div id="report-peak-hour" class="text-xs font-bold font-display text-amber-300 mt-1 truncate">Morgens</div>
        </div>
      </div>

      <!-- 7-Tage Aktivitäts-Chart -->
      <div class="p-3 bg-black/40 border border-white/10 rounded-xl space-y-2.5">
        <div class="flex items-center justify-between text-[11px] font-bold border-b border-white/5 pb-1.5">
          <span class="text-gray-300">Aktivität (7 Tage)</span>
          <span id="report-total-week-tasks" class="font-mono text-purple-300">0 Tasks</span>
        </div>
        <div id="report-weekly-chart" class="flex items-end justify-between min-h-[82px] pt-1.5 pb-0.5"></div>
      </div>

      <!-- Motivations-Insight -->
      <div class="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 leading-snug flex items-start gap-2">
        <span class="text-base leading-none">💡</span>
        <span id="report-insight-text">Lade Produktivitäts-Insights...</span>
      </div>
    `;
  }

  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  let filteredDone = state.done || [];
  if (reportTimeframe === 'today') {
    filteredDone = filteredDone.filter(item => item.date === todayISO);
  } else if (reportTimeframe === 'week') {
    filteredDone = filteredDone.filter(item => item.date && item.date >= sevenDaysAgo);
  } else if (reportTimeframe === 'month') {
    filteredDone = filteredDone.filter(item => item.date && item.date >= thirtyDaysAgo);
  }
  
  const count = filteredDone.length;
  const focus = calculateEstimatedFocusMinutes(filteredDone);
  const peak = calculateProductivePeakHours(filteredDone);

  const todayEl = document.getElementById('report-today-count');
  if (todayEl) todayEl.textContent = String(count);

  const focusEl = document.getElementById('report-focus-time');
  if (focusEl) focusEl.innerText = focus.text;

  const peakEl = document.getElementById('report-peak-hour');
  if (peakEl) peakEl.innerText = peak.shortLabel;

  renderWeeklyChart('report-weekly-chart', 'report-total-week-tasks', false);

  const insightEl = document.getElementById('report-insight-text');
  if (insightEl) {
    if (count === 0) {
      insightEl.innerText = tr({
        de: 'Noch keine Aufgaben abgeschlossen. Starte mit einem kleinen Quick-Win!',
        en: 'No tasks completed yet. Start with a quick win!'
      });
    } else if (count < 4) {
      insightEl.innerText = tr({
        de: `Guter Fortschritt! Schon ${count} Aufgaben gemeistert (${focus.text} Fokus). Weiter so!`,
        en: `Good progress! Already ${count} tasks completed (${focus.text} focus). Keep going!`
      });
    } else if (count < 8) {
      insightEl.innerText = tr({
        de: `Starke Leistung! ${count} Aufgaben erledigt. Dein Peak liegt bei ${peak.timeRange}!`,
        en: `Great performance! ${count} tasks done. Your peak is at ${peak.timeRange}!`
      });
    } else {
      insightEl.innerText = tr({
        de: `Hervorragend! ${count} Aufgaben & ${focus.text} Fokus – ein extrem produktiver Zeitraum! 🚀`,
        en: `Outstanding! ${count} tasks & ${focus.text} focus – an extremely productive period! 🚀`
      });
    }
  }

  renderLucideIcons();
}

function openReportDashboard() {
  const modal = document.getElementById('modal-report-dashboard');
  if (!modal) return;
  modal.classList.remove('hidden');
  const panel = document.getElementById('panel-report');
  if (panel) panel.classList.add('hidden');
  setDashboardTimeframe('week');
  renderLucideIcons();
}

function closeReportDashboard() {
  const modal = document.getElementById('modal-report-dashboard');
  if (modal) modal.classList.add('hidden');
}


function switchDashboardMainTab(tab) {
  const statsSec = document.getElementById('dash-section-stats');
  const learnSec = document.getElementById('dash-section-learning');
  const tabStats = document.getElementById('dash-main-tab-stats');
  const tabLearn = document.getElementById('dash-main-tab-learning');
  const timeframeWrap = document.getElementById('dash-timeframe-selector-wrap');

  if (tab === 'learning') {
    if (statsSec) statsSec.classList.add('hidden');
    if (learnSec) learnSec.classList.remove('hidden');
    if (timeframeWrap) timeframeWrap.classList.add('hidden');
    if (tabStats) tabStats.className = 'px-3 py-1.5 rounded-xl text-gray-400 hover:text-white transition cursor-pointer flex items-center gap-1.5';
    if (tabLearn) tabLearn.className = 'px-3 py-1.5 rounded-xl text-amber-300 bg-amber-500/20 font-bold border border-amber-500/30 transition cursor-pointer flex items-center gap-1.5 shadow-sm';
    if (typeof renderLearningHub === 'function') renderLearningHub();
  } else {
    if (statsSec) statsSec.classList.remove('hidden');
    if (learnSec) learnSec.classList.add('hidden');
    if (timeframeWrap) timeframeWrap.classList.remove('hidden');
    if (tabStats) tabStats.className = 'px-3 py-1.5 rounded-xl text-purple-300 bg-purple-500/20 font-bold border border-purple-500/30 transition cursor-pointer flex items-center gap-1.5 shadow-sm';
    if (tabLearn) tabLearn.className = 'px-3 py-1.5 rounded-xl text-gray-400 hover:text-white transition cursor-pointer flex items-center gap-1.5';
    renderDashboardView();
  }
  if (typeof renderLucideIcons === 'function') renderLucideIcons();
}

function setDashboardTimeframe(tf) {
  dashboardTimeframe = tf;
  ['today', 'week', 'month'].forEach(t => {
    const btn = document.getElementById(`dash-tab-${t}`);
    if (btn) {
      if (t === tf) btn.className = 'px-3 py-1.5 rounded-lg text-purple-300 bg-purple-500/20 font-bold transition cursor-pointer';
      else btn.className = 'px-3 py-1.5 rounded-lg text-gray-400 hover:text-white transition cursor-pointer';
    }
  });
  renderDashboardView();
}

let currentDashboardFilter = '';
function filterDashboardHistory(query) {
  currentDashboardFilter = (query || '').toLowerCase().trim();
  renderDashboardHistoryList();
}

let activeDashboardDoneList = [];

function renderDashboardView() {
  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  let doneList = state.done || [];
  if (dashboardTimeframe === 'today') {
    doneList = doneList.filter(item => item.date === todayISO);
  } else if (dashboardTimeframe === 'week') {
    doneList = doneList.filter(item => item.date && item.date >= sevenDaysAgo);
  } else if (dashboardTimeframe === 'month') {
    doneList = doneList.filter(item => item.date && item.date >= thirtyDaysAgo);
  }

  activeDashboardDoneList = doneList;

  const count = doneList.length;
  const focus = calculateEstimatedFocusMinutes(doneList);
  const peak = calculateProductivePeakHours(doneList);
  const dist = calculateCategoryDistribution(doneList);

  // Kachel 1: Abgeschlossen
  const compEl = document.getElementById('dash-stat-completed');
  if (compEl) compEl.textContent = String(count);

  // Kachel 2: Fokus
  const focEl = document.getElementById('dash-stat-focus');
  if (focEl) focEl.innerText = focus.text;
  const sessEl = document.getElementById('dash-stat-sessions');
  if (sessEl) sessEl.innerText = `${focus.sessions} ${typeof tr === 'function' ? tr({ de: 'Sitzungen', en: 'Sessions' }) : 'Sitzungen'}`;

  // Kachel 3: Peak
  const pkEl = document.getElementById('dash-stat-peak');
  if (pkEl) pkEl.innerText = peak.shortLabel;
  const pkDetailEl = document.getElementById('dash-stat-peakhour-detail');
  if (pkDetailEl) pkDetailEl.innerText = peak.timeRange;

  // Kachel 4: Top Kategorie
  const topCat = dist.length > 0 ? dist[0].label : (typeof tr === 'function' ? tr({ de: 'Ausgeglichen', en: 'Balanced' }) : 'Ausgeglichen');
  const topCatEl = document.getElementById('dash-stat-topcat');
  if (topCatEl) topCatEl.innerText = `Top: ${topCat}`;

  // 7-Tage-Aktivität
  renderWeeklyChart('dash-weekly-chart', 'dash-chart-total', true);

  // Kategorie-Verteilung
  const catDistEl = document.getElementById('dash-category-distribution');
  if (catDistEl) {
    catDistEl.innerHTML = '';
    if (dist.length === 0) {
      catDistEl.innerHTML = `<div class="text-gray-500 italic py-4 text-center text-xs">Noch keine Daten im Zeitraum.</div>`;
    } else {
      dist.forEach(item => {
        const row = document.createElement('div');
        row.className = 'space-y-1';
        row.innerHTML = `
          <div class="flex justify-between items-center text-[11px]">
            <span class="text-gray-300 font-medium">${escapeHtml(item.label)}</span>
            <span class="${item.text} font-mono font-bold">${item.count} (${item.pct}%)</span>
          </div>
          <div class="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
            <div class="h-full ${item.bg} transition-all duration-500 rounded-full" style="width: ${item.pct}%"></div>
          </div>
        `;
        catDistEl.appendChild(row);
      });
    }
  }

  // Historien-Liste rendern
  renderDashboardHistoryList();
  renderLucideIcons();
}

function renderDashboardHistoryList() {
  const listEl = document.getElementById('dash-history-list');
  const badgeEl = document.getElementById('dash-history-badge');
  if (!listEl) return;
  listEl.innerHTML = '';

  let filtered = activeDashboardDoneList;
  if (currentDashboardFilter) {
    filtered = filtered.filter(item => {
      const tStr = (item.task || item.name || '').toLowerCase();
      const catStr = (t(item.origin) || item.origin || '').toLowerCase();
      return tStr.includes(currentDashboardFilter) || catStr.includes(currentDashboardFilter);
    });
  }

  if (badgeEl) badgeEl.textContent = String(filtered.length);

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="text-gray-500 italic text-center py-6 text-xs">Keine passenden erledigten Aufgaben gefunden.</div>`;
    return;
  }

  filtered.slice().reverse().forEach(item => {
    const div = document.createElement('div');
    div.className = 'p-2.5 bg-white/[0.025] hover:bg-white/[0.06] border border-white/5 rounded-xl flex items-center justify-between transition gap-2';
    const catLabel = t(item.origin) || item.origin || 'Task';
    div.innerHTML = `
      <div class="flex items-center gap-2 overflow-hidden min-w-0">
        <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0"></i>
        <span class="text-[10px] px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 font-medium">${escapeHtml(catLabel)}</span>
        <span class="truncate font-semibold text-xs text-white">${escapeHtml(item.task || item.name || 'Task')}</span>
      </div>
      <span class="text-gray-400 font-mono text-[10px] shrink-0">${escapeHtml(item.time || item.date || '')}</span>
    `;
    listEl.appendChild(div);
  });
  renderLucideIcons();
}

function copyComprehensiveReportText() {
  const text = generateComprehensiveReportText();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (typeof showToast === 'function') {
        showToast(tr({
          de: 'Bericht in die Zwischenablage kopiert! 📋',
          en: 'Report copied to clipboard! 📋',
          fr: 'Rapport copié dans le presse-papiers ! 📋',
          it: 'Rapporto copiato negli appunti! 📋',
          es: '¡Informe copiado al portapapeles! 📋',
          el: 'Η αναφορά αντιγράφηκε στο πρόχειρο! 📋'
        }));
      }
    }).catch(e => console.warn('Clipboard copy error:', e));
  }
}

function generateComprehensiveReportText() {
  const now = new Date();
  const dateStr = now.toLocaleDateString(currentLang === 'de' ? 'de-DE' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const todayISO = now.toISOString().split('T')[0];
  const dayOfWeek = now.getDay();
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const mondayDate = new Date(now.getTime() - distanceToMonday * 24 * 60 * 60 * 1000);
  const mondayISO = mondayDate.toISOString().split('T')[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const doneAll = state.done || [];
  const doneToday = doneAll.filter(item => item.date === todayISO);
  const doneWeek = doneAll.filter(item => item.date && item.date >= sevenDaysAgo);
  const doneMonth = doneAll.filter(item => item.date && item.date >= thirtyDaysAgo);

  const weeklyItems = state.items.weekly || [];
  const weeklyDoneThisWeek = doneAll.filter(item => item.origin === 'weekly' && item.date >= mondayISO);

  let text = `========================================\n`;
  text += `📊 NOODLE STUDIO: STATISTIK- & FORTSCHRITTSBERICHT\n`;
  text += `Erstellt am: ${dateStr}\n`;
  text += `========================================\n\n`;

  text += `📅 1. HEUTE (${todayISO})\n`;
  text += `----------------------------------------\n`;
  text += `• Erledigte Aufgaben heute: ${doneToday.length}\n`;
  if (doneToday.length > 0) {
    doneToday.forEach(t => {
      text += `  ✓ [${t.origin ? t.origin.toUpperCase() : 'TASK'}] ${t.task} (${t.time || ''})\n`;
    });
  } else {
    text += `  (Noch keine Aufgaben heute abgeschlossen)\n`;
  }
  text += `\n`;

  text += `🏆 2. WOCHEN-ÜBERSICHT (Letzte 7 Tage)\n`;
  text += `----------------------------------------\n`;
  text += `• Gesamte Aufgaben in 7 Tagen: ${doneWeek.length}\n`;
  text += `• Davon Tagesaufgaben: ${doneWeek.filter(t => t.origin === 'daily').length}\n`;
  text += `• Davon Haushaltsaufgaben: ${doneWeek.filter(t => t.origin === 'weekly').length}\n`;
  text += `• Davon To-Dos / Sonstiges: ${doneWeek.filter(t => t.origin === 'todo' || t.origin === 'notes').length}\n\n`;

  text += `🧹 3. HAUSHALTSAUFGABEN (Status dieser Woche)\n`;
  text += `----------------------------------------\n`;
  text += `• Abgeschlossen diese Woche: ${weeklyDoneThisWeek.length} von ${weeklyDoneThisWeek.length + weeklyItems.length}\n`;
  if (weeklyDoneThisWeek.length > 0) {
    weeklyDoneThisWeek.forEach(t => text += `  ✓ Erledigt: ${t.task} (${t.date})\n`);
  }
  if (weeklyItems.length > 0) {
    weeklyItems.forEach(t => {
      const name = typeof t === 'object' ? t.task : t;
      text += `  ◻ Offen: ${name}\n`;
    });
  }
  text += `\n`;

  text += `📈 4. MONATS-ÜBERSICHT (Letzte 30 Tage)\n`;
  text += `----------------------------------------\n`;
  text += `• Gesamte Aufgaben in 30 Tagen: ${doneMonth.length}\n`;
  text += `• Durchschnitt pro Tag: ${(doneMonth.length / 30).toFixed(1)} Aufgaben\n\n`;

  text += `📌 5. AKTUELLE OFFENE AUFGABEN & NOTIZEN\n`;
  text += `----------------------------------------\n`;
  text += `• Offene Tagesaufgaben: ${(state.items.daily || []).length}\n`;
  text += `• Offene To-Dos: ${(state.items.todo || []).length}\n`;
  (state.items.todo || []).forEach(t => {
    const name = typeof t === 'object' ? t.task : t;
    text += `  ◻ ${name}\n`;
  });
  text += `• Gespeicherte Notizen: ${(state.items.notes || []).length}\n`;
  (state.items.notes || []).forEach((n, idx) => {
    const name = typeof n === 'object' ? n.task : n;
    text += `  📝 [${idx + 1}] ${name}\n`;
  });

  text += `\n========================================\n`;
  return text;
}

function openReportExportModal() {
  const modal = document.getElementById('report-export-modal');
  const textarea = document.getElementById('report-export-text-area');
  if (textarea) {
    textarea.value = generateComprehensiveReportText();
  }
  if (modal) modal.classList.remove('hidden');
  const panel = document.getElementById('panel-report');
  if (panel) panel.classList.add('hidden');
  renderLucideIcons();
}

function closeReportExportModal() {
  const modal = document.getElementById('report-export-modal');
  if (modal) modal.classList.add('hidden');
}

function copyReportText() {
  const text = generateComprehensiveReportText();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(tr({ de: '📋 Bericht in Zwischenablage kopiert!', en: '📋 Report copied to clipboard!' }));
    });
  } else {
    showToast(tr({ de: 'Bericht markiert – drücke Strg+C!', en: 'Report selected – press Ctrl+C!' }));
  }
}

function downloadReportFile() {
  const text = generateComprehensiveReportText();
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `Noodle-Bericht_${today}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(tr({ de: '💾 Bericht als Datei heruntergeladen!', en: '💾 Report file downloaded!' }));
}

function printReport() {
  const text = generateComprehensiveReportText();
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Noodle Bericht</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; line-height: 1.6; color: #111; }
            pre { font-family: "Courier New", Courier, monospace; font-size: 13px; white-space: pre-wrap; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
            @media print { pre { border: none; padding: 0; background: none; } }
          </style>
        </head>
        <body>
          <pre>${text}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }
}

function submitFeedback() {
  const text = document.getElementById('feedback-text').value;
  if (text.trim()) {
    const mailtoUrl = `mailto:jmonke@gmail.com?subject=Noodle App Feedback&body=${encodeURIComponent(text)}`;
    window.location.href = mailtoUrl;
    showToast(tr({ de: 'E-Mail-Entwurf geöffnet! ❤️', en: 'Email draft opened! ❤️', es: '¡Borrador de email abierto! ❤️', el: 'Το προσχέδιο email άνοιξε! ❤️', fr: 'Brouillon d\'email ouvert ! ❤️', it: 'Bozza email aperta! ❤️' }));
    document.getElementById('feedback-text').value = ''; togglePanel('feedback');
  }
}

function renderZenSubtasks(taskText) {
  const container = document.getElementById('zen-task-steps-container');
  if (!container) return;
  if (!taskText) {
    container.classList.add('hidden');
    return;
  }
  const standardKey = typeof getGermanStandardKey === 'function' ? getGermanStandardKey(taskText) : taskText;
  const steps = (typeof TASK_STEPS_BY_TASK !== 'undefined' && TASK_STEPS_BY_TASK[standardKey]) || [];
  
  if (!steps || steps.length === 0) {
    container.classList.add('hidden');
    return;
  }
  
  container.classList.remove('hidden');
  const completedMap = state.completedSteps?.[taskText] || [];
  
  container.innerHTML = `
    <div class="text-[10px] text-purple-300 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
      <i data-lucide="list-checks" class="w-3.5 h-3.5 text-purple-400"></i>
      <span>Teilschritte / Checkliste:</span>
    </div>
  ` + steps.map((step, idx) => {
    const isChecked = completedMap.includes(idx);
    return `
      <label class="flex items-start gap-2 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-xs transition ${isChecked ? 'line-through text-gray-500 opacity-60' : 'text-gray-200'}">
        <input type="checkbox" onchange="toggleZenStepCheck('${taskText.replace(/'/g, "\\'")}', ${idx})" ${isChecked ? 'checked' : ''} class="w-3.5 h-3.5 mt-0.5 rounded bg-black/60 border-white/20 text-purple-500 accent-purple-500 cursor-pointer" />
        <span class="leading-tight font-medium">${step}</span>
      </label>
    `;
  }).join('');
  renderLucideIcons();
}

function toggleZenStepCheck(taskText, stepIdx) {
  if (!state.completedSteps) state.completedSteps = {};
  if (!state.completedSteps[taskText]) state.completedSteps[taskText] = [];
  const list = state.completedSteps[taskText];
  const pos = list.indexOf(stepIdx);
  if (pos === -1) list.push(stepIdx);
  else list.splice(pos, 1);
  saveState();
  renderZenSubtasks(taskText);
}

function updateZenView() {
  const zenCatEl = document.getElementById('zen-task-cat'); const zenTextEl = document.getElementById('zen-task-text');
  if (!zenTextEl) return;
  
  let chosen = currentZenTaskInfo;
  if (!chosen || !chosen.task) {
    const dailyTasks = (state.items.daily || []).map(t => ({ cat: 'daily', task: typeof t === 'object' ? t.task : t }));
    const weeklyTasks = (state.items.weekly || []).map(t => ({ cat: 'weekly', task: typeof t === 'object' ? t.task : t }));
    const todoTasks = (state.items.todo || []).map(t => ({ cat: 'todo', task: typeof t === 'object' ? t.task : t }));
    const occasionallyTasks = (state.items.occasionally || []).map(t => ({ cat: 'occasionally', task: typeof t === 'object' ? t.task : t }));
    if (dailyTasks.length > 0) chosen = dailyTasks[0];
    else if (weeklyTasks.length > 0 || todoTasks.length > 0) chosen = weeklyTasks[0] || todoTasks[0];
    else if (occasionallyTasks.length > 0) chosen = occasionallyTasks[0];
    currentZenTaskInfo = chosen;
  }
  
  if (!chosen) {
    if (zenCatEl) zenCatEl.innerText = t('completed');
    const endMsg = tr({ de: '🎉 Alle Aufgaben erledigt! Entspanne dich und genieße deine freie Zeit.', en: '🎉 All tasks completed! Relax and enjoy your free time.', es: '🎉 ¡Todas las tareas completadas! ¡Disfruta de tu tiempo libre!', el: '🎉 Όλες οι εργασίες ολοκληρώθηκαν! Χαλαρώστε και απολαύστε τον ελεύθερο χρόνο σας.', fr: '🎉 Toutes les tâches terminées ! Détends-toi et profite de ton temps libre.', it: '🎉 Tutte le attività completate! Rilassati e goditi il tuo tempo libero.' });
    zenTextEl.innerHTML = `<span class="text-emerald-400">${endMsg}</span>`;
    renderZenSubtasks(null);
  } else {
    const catName = t(chosen.cat); if (zenCatEl) zenCatEl.innerText = `${t('next_rec')} · ${catName}`;
    zenTextEl.innerText = chosen.task;
    renderZenSubtasks(chosen.task);
  }
  updateTimerDisplay(); renderLucideIcons();
}

function updateZenViewNextTask() {
  const allTasks = [];
  ['daily', 'todo', 'weekly', 'occasionally', 'termine'].forEach(cat => {
    (state?.items?.[cat] || []).filter(Boolean).forEach(t => {
      const taskText = typeof t === 'object' ? t.task : t;
      if (!currentZenTaskInfo || currentZenTaskInfo.task !== taskText) {
        allTasks.push({ cat, task: taskText });
      }
    });
  });
  if (allTasks.length > 0) {
    currentZenTaskInfo = allTasks[Math.floor(Math.random() * allTasks.length)];
  } else {
    currentZenTaskInfo = null;
  }
  updateZenView();
  showToast(tr({ de: 'Nächste Fokus-Aufgabe geladen ⏭️', en: 'Next focus task loaded ⏭️', es: 'Siguiente tarea de enfoque cargada ⏭️', el: 'Φορτώθηκε η επόμενη εργασία εστίασης ⏭️', fr: 'Tâche de focus suivante chargée ⏭️', it: 'Prossima attività di focus caricata ⏭️' }));
}

function handleZenDistractionInput(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    submitZenDistraction();
  }
}

function submitZenDistraction() {
  const input = document.getElementById('zen-distraction-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  
  saveHistory();
  if (!state.items.notes) state.items.notes = [];
  state.items.notes.push(val);
  saveState();
  renderApp();
  input.value = '';
  
  showToast(tr({
    de: `Gedanke geparkt & in Notizen gesichert! 📌`,
    en: `Thought parked & saved to Notes! 📌`,
    es: `¡Pensamiento aparcado y guardado en Notas! 📌`,
    el: `Η σκέψη αποθηκεύτηκε στις Σημειώσεις! 📌`,
    fr: `Pensée notée et sauvegardée ! 📌`,
    it: `Pensiero parcheggiato e salvato nelle Note! 📌`
  }));
}

function updateMissedTasksList() {
  const container = document.getElementById('report-missed-tasks-list'); if (!container) return; container.innerHTML = '';
  const missed = []; const todayISO = new Date().toISOString().split('T')[0];
  (state.items.daily || []).forEach(task => { missed.push({ task: typeof task === 'object' ? task.task : task, tag: tr({ de: 'Täglich', en: 'Daily', es: 'Diario', el: 'Καθημερινά', fr: 'Quotidien', it: 'Giornaliero' }) }); });
  (state.items.weekly || []).forEach(task => { missed.push({ task: typeof task === 'object' ? task.task : task, tag: tr({ de: 'Wöchentlich', en: 'Weekly', es: 'Semanal', el: 'Εβδομαδιαία', fr: 'Hebdomadaire', it: 'Settimanale' }) }); });
  (state.items.todo || []).forEach(task => { missed.push({ task: typeof task === 'object' ? task.task : task, tag: 'Todo' }); });
  (state.items.occasionally || []).forEach(task => { missed.push({ task: typeof task === 'object' ? task.task : task, tag: tr({ de: 'Gelegentliche', en: 'Occasionally', es: 'Ocasionales', el: 'Περιστασιακά', fr: 'Occasionnel', it: 'Occasionale' }) }); });
  (state.items.termine || []).forEach(task => { if (task.date === todayISO) { missed.push({ task: task.task, tag: tr({ de: 'Termin heute', en: 'Appointment', es: 'Cita hoy', el: 'Ραντεβού σήμερα', fr: 'RDV aujourd\'hui', it: 'Appuntamento oggi' }) }); } });
  if (missed.length === 0) { container.innerHTML = `<div class="text-emerald-400 italic text-[10px] py-1 text-center font-semibold">${tr({ de: '🎉 Alles erledigt! Großartige Leistung.', en: '🎉 All done! Great job.', es: '🎉 ¡Todo listo! Gran trabajo.', el: '🎉 Όλα έτοιμα! Εξαιρετική δουλειά.', fr: '🎉 Tout est fait ! Excellent travail.', it: '🎉 Tutto fatto! Ottimo lavoro.' })}</div>`; } 
  else {
    missed.forEach(item => {
      const div = document.createElement('div'); div.className = 'flex justify-between items-center gap-1.5 py-1 px-1.5 bg-black/30 rounded border border-white/5 hover:border-rose-500/10 transition';
      div.innerHTML = `<span class="truncate font-semibold text-gray-200 text-[10px]">${escapeHtml(item.task)}</span><span class="text-[8px] px-1 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 shrink-0 font-mono font-bold">${escapeHtml(item.tag)}</span>`;
      container.appendChild(div);
    });
  }
}

async function exportReportAsImage() {
  const target = document.getElementById('report-export-target');
  if (!target) return;
  
  if (typeof html2canvas === 'undefined') {
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'vendor/html2canvas.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    } catch (e) {
      console.warn('[Reports] Failed to load html2canvas:', e);
      if (typeof showToast === 'function') {
        showToast(tr({
          de: 'Bildexport aktuell nicht verfügbar.',
          en: 'Image export currently not available.'
        }));
      }
      return;
    }
  }

  html2canvas(target, {
    backgroundColor: '#111116',
    scale: 2, 
    useCORS: true
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = `noodle-statistik-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
    if (typeof showToast === 'function') showToast(tr({ de: "Statistik als Bild exportiert! 📸", en: "Statistics exported as image! 📸" }));
  }).catch(err => {
    console.error("Export-Fehler:", err);
    if (typeof showToast === 'function') showToast(tr({ de: "Export fehlgeschlagen.", en: "Export failed." }));
  });
}

function triggerAutomaticDownload(reportText, filename) {
  const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getYearAndWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function generateReportContent(timeframe = 'comprehensive', targetDate = '') {
  const reportText = typeof generateComprehensiveReportText === 'function' ? generateComprehensiveReportText() : '';
  const now = new Date();
  const dateStr = targetDate || now.toISOString().split('T')[0];
  const filename = `Noodle-Report-${timeframe}-${dateStr}.txt`;
  return { reportText, filename };
}
if (typeof window !== 'undefined') {
  window.generateReportContent = generateReportContent;
}
if (typeof globalThis !== 'undefined') {
  globalThis.generateReportContent = generateReportContent;
}

function checkAndGenerateAutomaticReports() {
  const now = new Date(); const todayISO = now.toISOString().split('T')[0]; const lang = currentLang || 'en';
  if (state.lastDate && state.lastDate !== todayISO) {
    const prevDate = state.lastDate; const { reportText, filename } = generateReportContent('daily', prevDate);
    triggerAutomaticDownload(reportText, filename); state.lastDate = todayISO; saveState();
  }
  const currentWeekStr = getYearAndWeek(now); const lastWeeklyReport = localStorage.getItem('flow_last_weekly_report_week');
  const isSundayEvening = now.getDay() === 0 && now.getHours() >= 18;
  const weeklyReportTriggeredThisWeek = localStorage.getItem('flow_weekly_report_triggered_' + currentWeekStr) === 'true';
  if ((lastWeeklyReport && lastWeeklyReport !== currentWeekStr) || (isSundayEvening && !weeklyReportTriggeredThisWeek)) {
    const weekToReport = (isSundayEvening && !weeklyReportTriggeredThisWeek) ? currentWeekStr : (lastWeeklyReport || currentWeekStr);
    const { reportText, filename } = generateReportContent('weekly', weekToReport); triggerAutomaticDownload(reportText, filename);
    localStorage.setItem('flow_last_weekly_report_week', currentWeekStr); localStorage.setItem('flow_weekly_report_triggered_' + currentWeekStr, 'true');
    showToast(tr({ de: `Automatischer Wochenbericht (${weekToReport}) heruntergeladen! 📊`, en: `Automatic weekly report (${weekToReport}) downloaded! 📊`, es: `Informe semanal automático (${weekToReport}) descargado! 📊`, el: `Αυτόματη εβδομαδιαία αναφορά (${weekToReport}) λήφθηκε! 📊`, fr: `Rapport hebdomadaire automatique (${weekToReport}) téléchargé ! 📊`, it: `Report settimanale automatico (${weekToReport}) scaricato! 📊` }));
  }
  const currentMonthStr = todayISO.substring(0, 7); const lastMonthlyReport = localStorage.getItem('flow_last_monthly_report_month');
  if (lastMonthlyReport && lastMonthlyReport !== currentMonthStr) {
    const { reportText, filename } = generateReportContent('monthly', lastMonthlyReport); triggerAutomaticDownload(reportText, filename);
    localStorage.setItem('flow_last_monthly_report_month', currentMonthStr);
    showToast(tr({ de: `Automatischer Monatsbericht (${lastMonthlyReport}) heruntergeladen! 📊`, en: `Automatic monthly report (${lastMonthlyReport}) downloaded! 📊`, es: `Informe mensual automático (${lastMonthlyReport}) descargado! 📊`, el: `Αυτόματη μηνιαία αναφορά (${lastMonthlyReport}) λήφθηκε! 📊`, fr: `Rapport mensuel automatique (${lastMonthlyReport}) téléchargé ! 📊`, it: `Report mensile automatico (${lastMonthlyReport}) scaricato! 📊` }));
  }
}

function triggerManualReportDownload(timeframe) {
  const { reportText, filename } = generateReportContent(timeframe); triggerAutomaticDownload(reportText, filename);
  showToast(tr({ de: `Bericht heruntergeladen! 📥`, en: `Report downloaded! 📥`, es: `¡Informe descargado! 📥`, el: `Η αναφορά λήφθηκε! 📥`, fr: `Rapport téléchargé ! 📥`, it: `Report scaricato! 📥` }));
}

let activeDanceTimeouts = []; let currentlyDancingButtons = [];

function startGlobalButtonDanceParty() {
  // Deaktiviert für maximale Performance und flüssige 60fps Reaktionszeit.
} 

if (typeof window !== 'undefined') {
  window.togglePanel = togglePanel;
  window.setReportTimeframe = setReportTimeframe;
  window.updateReportPanel = updateReportPanel;
  window.openReportDashboard = openReportDashboard;
  window.switchDashboardMainTab = switchDashboardMainTab;
  window.closeReportDashboard = closeReportDashboard;
  window.setDashboardTimeframe = setDashboardTimeframe;
  window.filterDashboardHistory = filterDashboardHistory;
  window.renderDashboardView = renderDashboardView;
  window.renderDashboardHistoryList = renderDashboardHistoryList;
  window.openReportExportModal = openReportExportModal;
  window.closeReportExportModal = closeReportExportModal;
  window.copyReportText = copyReportText;
  window.downloadReportFile = downloadReportFile;
  window.printReport = printReport;
  window.exportReportAsImage = exportReportAsImage;
  window.exportWeeklyReportAsImage = exportReportAsImage;
  window.copyComprehensiveReportText = copyComprehensiveReportText;
  window.calculateProductivePeakHours = calculateProductivePeakHours;
  window.calculateCategoryDistribution = calculateCategoryDistribution;
  window.calculateEstimatedFocusMinutes = calculateEstimatedFocusMinutes;
  window.triggerManualReportDownload = triggerManualReportDownload;
  window.generateComprehensiveReportText = generateComprehensiveReportText;
} 
