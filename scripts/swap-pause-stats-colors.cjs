const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Pause button: replace purple colors with lime colors
// Old button:
const oldPauseBtn = `          <button type="button" onclick="event.stopPropagation(); togglePanel('pause-dropdown', event);" data-action="togglePanel" data-action-args='["pause-dropdown"]' class="h-[38px] px-2.5 sm:px-3 border border-purple-400/50 hover:border-purple-300 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 active:scale-95 text-purple-300 hover:text-purple-100 flex items-center gap-1.5 text-xs sm:text-[13px] font-bold cursor-pointer transition whitespace-nowrap shadow-[0_0_14px_rgba(168,85,247,0.25)] group/pause-btn" data-i18n-title="pause_panel_title">
            <!-- Animiertes Dampf-Tassen SVG Icon in Purple -->
            <svg class="w-4 h-4 text-purple-300 steam-cup-icon shrink-0 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v7a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z" />
              <line x1="6" x2="6" y1="1" y2="4" class="steam-line steam-line-1" stroke="currentColor" stroke-width="1.8" />
              <line x1="10" x2="10" y1="0.5" y2="4" class="steam-line steam-line-2" stroke="currentColor" stroke-width="1.8" />
              <line x1="14" x2="14" y1="1" y2="4" class="steam-line steam-line-3" stroke="currentColor" stroke-width="1.8" />
            </svg>
            <span class="inline-block text-purple-300 font-bold group-hover/pause-btn:text-purple-100" data-i18n="pause_btn">Pause</span>
          </button>`;

const newPauseBtn = `          <button type="button" onclick="event.stopPropagation(); togglePanel('pause-dropdown', event);" data-action="togglePanel" data-action-args='["pause-dropdown"]' class="h-[38px] px-2.5 sm:px-3 border border-lime-500/50 hover:border-lime-400 rounded-xl bg-lime-500/15 hover:bg-lime-500/25 active:scale-95 text-lime-300 hover:text-lime-100 flex items-center gap-1.5 text-xs sm:text-[13px] font-bold cursor-pointer transition whitespace-nowrap shadow-[0_0_14px_rgba(132,204,22,0.25)] group/pause-btn" data-i18n-title="pause_panel_title">
            <!-- Animiertes Dampf-Tassen SVG Icon in Lime -->
            <svg class="w-4 h-4 text-lime-300 steam-cup-icon shrink-0 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v7a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z" />
              <line x1="6" x2="6" y1="1" y2="4" class="steam-line steam-line-1" stroke="currentColor" stroke-width="1.8" />
              <line x1="10" x2="10" y1="0.5" y2="4" class="steam-line steam-line-2" stroke="currentColor" stroke-width="1.8" />
              <line x1="14" x2="14" y1="1" y2="4" class="steam-line steam-line-3" stroke="currentColor" stroke-width="1.8" />
            </svg>
            <span class="inline-block text-lime-300 font-bold group-hover/pause-btn:text-lime-100" data-i18n="pause_btn">Pause</span>
          </button>`;

// 2. Report button: replace lime colors with purple colors
const oldReportBtn = `            <button type="button" onclick="event.stopPropagation(); togglePanel('report', event);" data-action="togglePanel" data-action-args='["report"]' class="h-[38px] px-2.5 sm:px-3 border border-lime-500/50 hover:border-lime-400 rounded-xl bg-lime-500/15 hover:bg-lime-500/25 active:scale-95 text-lime-300 hover:text-lime-100 flex items-center gap-1.5 text-xs sm:text-[13px] font-bold cursor-pointer transition whitespace-nowrap shadow-[0_0_14px_rgba(132,204,22,0.25)] group/report-btn" data-i18n-title="report_title">
              <i data-lucide="bar-chart-3" class="w-4 h-4 text-lime-300"></i>
              <span class="inline-block text-lime-300 font-bold group-hover/report-btn:text-lime-100" id="btn-label-report" data-i18n="report">Stats</span>
            </button>`;

const newReportBtn = `            <button type="button" onclick="event.stopPropagation(); togglePanel('report', event);" data-action="togglePanel" data-action-args='["report"]' class="h-[38px] px-2.5 sm:px-3 border border-purple-400/50 hover:border-purple-300 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 active:scale-95 text-purple-300 hover:text-purple-100 flex items-center gap-1.5 text-xs sm:text-[13px] font-bold cursor-pointer transition whitespace-nowrap shadow-[0_0_14px_rgba(168,85,247,0.25)] group/report-btn" data-i18n-title="report_title">
              <i data-lucide="bar-chart-3" class="w-4 h-4 text-purple-300"></i>
              <span class="inline-block text-purple-300 font-bold group-hover/report-btn:text-purple-100" id="btn-label-report" data-i18n="report">Stats</span>
            </button>`;

const normHtml = html.replace(/\r\n/g, '\n');
const normOldPause = oldPauseBtn.replace(/\r\n/g, '\n');
const normNewPause = newPauseBtn.replace(/\r\n/g, '\n');
const normOldReport = oldReportBtn.replace(/\r\n/g, '\n');
const normNewReport = newReportBtn.replace(/\r\n/g, '\n');

if (!normHtml.includes(normOldPause)) {
  console.error('Pause button markup not found exactly');
  process.exit(1);
}
if (!normHtml.includes(normOldReport)) {
  console.error('Report button markup not found exactly');
  process.exit(1);
}

let updated = normHtml.replace(normOldPause, normNewPause);
updated = updated.replace(normOldReport, normNewReport);

fs.writeFileSync('index.html', updated, 'utf8');
console.log('Successfully swapped colors of Pause and Stats buttons!');
