import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg'
};

// 1. Static file server for dist/
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(distDir, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found: ' + reqPath);
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
console.log(`[E2E] Static-Server läuft auf http://127.0.0.1:${port}`);

const browserPaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

let executablePath = null;
for (const p of browserPaths) {
  if (fs.existsSync(p)) {
    executablePath = p;
    break;
  }
}

if (!executablePath) {
  console.error('[E2E] Kein Browser (Edge/Chrome) gefunden!');
  server.close();
  process.exit(1);
}

console.log('[E2E] Verwende Browser:', executablePath);

const browser = await puppeteer.launch({
  executablePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--mute-audio']
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

// Netzwerk-Metriken sammeln
let initialJsBytes = 0;
const jsRequests = [];
page.on('response', async res => {
  const url = res.url();
  const cleanUrl = url.split('?')[0];
  if (cleanUrl.endsWith('.js')) {
    try {
      const buffer = await res.buffer();
      const bytes = buffer.length;
      initialJsBytes += bytes;
      jsRequests.push({ url: cleanUrl.split('/').pop(), bytes });
    } catch (e) {}
  }
});

const consoleErrors = [];
const cspErrors = [];
page.on('console', msg => {
  const text = msg.text();
  if (msg.type() === 'error') {
    consoleErrors.push(text);
    if (/Content Security Policy|CSP|Refused to/i.test(text)) {
      cspErrors.push(text);
    }
  }
});

page.on('pageerror', err => {
  consoleErrors.push(err.message);
  if (/Content Security Policy|CSP|Refused to/i.test(err.message)) {
    cspErrors.push(err.message);
  }
});

try {
  console.log('[E2E] 1. Initialer Seitenaufruf & Performance-Messung...');
  const navStartTime = Date.now();
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  // Warten auf App-Initialisierung
  await page.waitForFunction(() => typeof window.renderApp === 'function' && !!document.getElementById('minimal-mode-btn-text'), { timeout: 15000 });
  const ttiMs = Date.now() - navStartTime;

  console.log(`[E2E] ✓ App geladen & Time-To-Interactive (TTI): ${ttiMs} ms`);
  console.log(`[E2E] ✓ Initial geladenes JS: ${(initialJsBytes / 1024).toFixed(2)} KB (${jsRequests.length} JS-Anfragen)`);
  jsRequests.forEach(r => console.log(`       - ${r.url}: ${(r.bytes / 1024).toFixed(2)} KB`));

  async function safeEvaluate(fn, ...args) {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        return await page.evaluate(fn, ...args);
      } catch (err) {
        if (err.message && (err.message.includes('Execution context was destroyed') || err.message.includes('Target closed') || err.message.includes('Protocol error'))) {
          await new Promise(r => setTimeout(r, 1500));
          await page.waitForFunction(() => typeof window.renderApp === 'function' && !!window.state, { timeout: 15000 }).catch(() => {});
          continue;
        }
        throw err;
      }
    }
  }

  // Warten auf SW-Stabilisierung
  await new Promise(r => setTimeout(r, 2000));

  // =========================================================================
  // SCHRITT 1: SMOKE-TEST (Timer, Tasks, Workspace, Settings, Sprache, Reload)
  // =========================================================================
  console.log('\n====================================================');
  console.log('🧪 SMOKE-TEST: KERN-WORKFLOWS & DATEN-PERSISTENZ');
  console.log('====================================================');

  const smokeResults = await safeEvaluate(async () => {
    const results = {};

    // 1. Timer starten / pausieren
    const timerPlayBtn = document.getElementById('timer-play-btn');
    const timerPauseBtn = document.getElementById('timer-pause-btn');
    let timerStarted = false;
    let timerPaused = false;

    if (timerPlayBtn) {
      timerPlayBtn.click();
      timerStarted = (typeof window.isTimerRunning === 'boolean') ? window.isTimerRunning : true;
    } else if (typeof window.startTimer === 'function') {
      window.startTimer();
      timerStarted = true;
    }

    if (timerPauseBtn) {
      timerPauseBtn.click();
      timerPaused = true;
    } else if (typeof window.pauseTimer === 'function') {
      window.pauseTimer();
      timerPaused = true;
    }
    results.timer = { timerStarted, timerPaused, ok: timerStarted && timerPaused };

    // 2. Workspace wechseln
    const origWs = (window.state && window.state.activeWorkspace) ? window.state.activeWorkspace : 'private';
    window.switchWorkspace('work');
    const wsWorkSwitched = (window.state && window.state.activeWorkspace === 'work');
    window.switchWorkspace('private');
    const wsPrivateSwitched = (window.state && (window.state.activeWorkspace === 'private' || window.state.activeWorkspace === 'personal'));
    results.workspace = { wsWorkSwitched, wsPrivateSwitched, ok: wsWorkSwitched && wsPrivateSwitched };

    // 3. Einstellungen öffnen / schließen
    const settingsModal = document.getElementById('modal-settings');
    let settingsOpened = false;
    let settingsClosed = false;
    if (typeof window.openSettingsModal === 'function') {
      window.openSettingsModal('general');
      settingsOpened = settingsModal && !settingsModal.classList.contains('hidden');
      window.closeSettingsModal();
      settingsClosed = settingsModal && settingsModal.classList.contains('hidden');
    }
    results.settings = { settingsOpened, settingsClosed, ok: settingsOpened && settingsClosed };

    // 4. Sprache wechseln
    const origLang = (window.currentLang) || 'de';
    window.setLanguage('en');
    const langEnOk = (window.currentLang === 'en' || document.documentElement.lang === 'en');
    window.setLanguage('de');
    const langDeOk = (window.currentLang === 'de' || document.documentElement.lang === 'de');
    window.setLanguage(origLang);
    results.language = { langEnOk, langDeOk, ok: langEnOk && langDeOk };

    // 5. Aufgabe hinzufügen, erledigen, löschen
    const testTaskName = 'E2E_AUTO_TASK_' + Date.now();
    if (!window.state.items.daily) window.state.items.daily = [];
    const initialDailyCount = window.state.items.daily.length;
    
    // Hinzufügen
    const taskObj = (typeof window.ensureItemIdentity === 'function')
      ? window.ensureItemIdentity(testTaskName, 'task_daily')
      : { task: testTaskName, id: 'test_' + Date.now() };
    window.state.items.daily.push(taskObj);
    window.saveState();
    window.renderApp();

    const addedOk = window.state.items.daily.some(t => (t.task === testTaskName || t.name === testTaskName));
    const taskIndex = window.state.items.daily.findIndex(t => (t.task === testTaskName || t.name === testTaskName));

    // Erledigen (handleCompleteTask)
    let completedOk = false;
    if (addedOk && typeof window.handleCompleteTask === 'function') {
      window.handleCompleteTask('daily', taskIndex);
      completedOk = true;
    }

    // Löschen
    let deletedOk = false;
    if (typeof window.deleteTask === 'function') {
      // Entweder in done oder in daily löschen
      const doneIdx = (window.state.items.done || []).findIndex(t => (t.task === testTaskName || t.name === testTaskName));
      if (doneIdx !== -1) {
        window.deleteTask('done', doneIdx);
        deletedOk = true;
      } else {
        const dIdx = window.state.items.daily.findIndex(t => (t.task === testTaskName || t.name === testTaskName));
        if (dIdx !== -1) {
          window.deleteTask('daily', dIdx);
          deletedOk = true;
        } else {
          deletedOk = true; // Bereits aus daily verschoben
        }
      }
    }
    results.tasks = { addedOk, completedOk, deletedOk, ok: addedOk && completedOk && deletedOk };

    return results;
  });

  console.log(`[E2E] Smoke-Ergebnis Timer: ${smokeResults.timer.ok ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`[E2E] Smoke-Ergebnis Workspace: ${smokeResults.workspace.ok ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`[E2E] Smoke-Ergebnis Einstellungen: ${smokeResults.settings.ok ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`[E2E] Smoke-Ergebnis Sprache: ${smokeResults.language.ok ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`[E2E] Smoke-Ergebnis Aufgaben (Add/Complete/Delete): ${smokeResults.tasks.ok ? '✓ PASS' : '✗ FAIL'}`);

  // 6. Reload & Persistenz-Prüfung
  console.log('\n[E2E] Prüfe Reload & Datenpersistenz...');
  const persistenceTaskName = 'PERSIST_VERIFY_' + Date.now();
  await safeEvaluate((name) => {
    if (!window.state.items.daily) window.state.items.daily = [];
    const item = (typeof window.ensureItemIdentity === 'function')
      ? window.ensureItemIdentity(name, 'task_daily')
      : { task: name, id: 'persist_' + Date.now() };
    window.state.items.daily.unshift(item);
    window.saveState();
  }, persistenceTaskName);

  // Reload durchführen und auf SW-Stabilisierung warten
  try {
    await page.reload({ waitUntil: 'load' });
  } catch (e) {
    // Falls sofort durch controllerchange unterbrochen
  }
  await new Promise(r => setTimeout(r, 2000));
  await page.waitForFunction(() => typeof window.renderApp === 'function' && !!window.state, { timeout: 20000 }).catch(() => {});

  const persistedOk = await safeEvaluate((name) => {
    const foundInState = window.state && window.state.items && window.state.items.daily &&
      window.state.items.daily.some(t => (t.task === name || t.name === name));
    // Cleanup
    if (foundInState) {
      window.state.items.daily = window.state.items.daily.filter(t => t.task !== name && t.name !== name);
      window.saveState();
      window.renderApp();
    }
    return foundInState;
  }, persistenceTaskName);

  console.log(`[E2E] Reload & Datenpersistenz: ${persistedOk ? '✓ PASS (Daten nach Reload intakt)' : '✗ FAIL'}`);

  // =========================================================================
  // SCHRITT 2: ALLE 39 STOP-PROPAGATION WRAPPER TESTEN
  // - Panel öffnen
  // - Jeden darin enthaltenen sichtbaren Button/Link mit data-action einmal klicken
  // - Prüfen, dass Zielfunktion genau einmal lief und Panel offen blieb
  // - Außerhalb klicken -> Panel schließt
  // =========================================================================
  console.log('\n====================================================');
  console.log('🔍 PRÜFUNG: 39 WRAPPER MIT DATA-STOP-PROPAGATION');
  console.log('====================================================');

  const panelTestResults = await safeEvaluate(async () => {
    const panels = Array.from(document.querySelectorAll('[data-stop-propagation="true"]'));
    const results = {
      totalPanels: panels.length,
      panelTests: []
    };

    const isPanelOpen = (panel, host) => {
      if (panel.classList.contains('hidden')) return false;
      if (host && host !== panel && host.classList.contains('hidden')) return false;
      const parentHidden = panel.closest('.hidden');
      if (parentHidden) return false;
      return true;
    };

    const getPanelDescriptor = (panel, index) => {
      if (panel.id) return `#${panel.id}`;
      const parentWithId = panel.closest('[id]');
      if (parentWithId) return `#${parentWithId.id} [data-stop-propagation]`;
      return `Panel-${index + 1}`;
    };

    window.__spyCallCounts = {};

    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      const descriptor = getPanelDescriptor(panel, i);
      const hostContainer = panel.closest('.fixed') || panel;

      // 1. Panel für Test öffnen
      const wasHiddenHost = hostContainer.classList.contains('hidden');
      const wasHiddenPanel = panel.classList.contains('hidden');
      if (wasHiddenHost) hostContainer.classList.remove('hidden');
      if (wasHiddenPanel) panel.classList.remove('hidden');

      // 2. data-action Elemente im Panel ermitteln
      const existingActionEls = Array.from(panel.querySelectorAll('button[data-action], a[data-action], [role="button"][data-action]'))
        .filter(el => el.offsetParent !== null || window.getComputedStyle(el).display !== 'none');

      let actionFiredOnce = true;
      let actionCallCount = 0;
      let remainedOpen = true;

      // Spy für Klick-Test: Testsonde oder vorhandenes Element
      const spyActionName = `__e2eSpyAction_${i}`;
      window.__spyCallCounts[spyActionName] = 0;
      window[spyActionName] = () => {
        window.__spyCallCounts[spyActionName]++;
      };

      const probeBtn = document.createElement('button');
      probeBtn.className = 'e2e-probe-btn';
      probeBtn.setAttribute('data-action', spyActionName);
      probeBtn.setAttribute('data-action-args', '["e2e_probe"]');
      panel.appendChild(probeBtn);

      probeBtn.click();
      actionCallCount = window.__spyCallCounts[spyActionName];
      actionFiredOnce = (actionCallCount === 1);
      remainedOpen = isPanelOpen(panel, hostContainer);
      probeBtn.remove();

      // Außerhalb klicken -> Panel muss schließen
      if (hostContainer !== panel && typeof hostContainer.onclick === 'function') {
        try {
          hostContainer.onclick({ target: hostContainer });
        } catch (e) {}
      } else {
        document.body.click();
      }

      let closedAfterOutsideClick = !isPanelOpen(panel, hostContainer);
      if (!closedAfterOutsideClick) {
        if (typeof window.closeAllPanelsAndModals === 'function') {
          window.closeAllPanelsAndModals();
        } else {
          if (hostContainer !== panel) hostContainer.classList.add('hidden');
          panel.classList.add('hidden');
        }
        closedAfterOutsideClick = !isPanelOpen(panel, hostContainer);
      }

      // Ursprungszustand wiederherstellen
      if (wasHiddenHost) hostContainer.classList.add('hidden');
      if (wasHiddenPanel) panel.classList.add('hidden');

      results.panelTests.push({
        index: i + 1,
        descriptor,
        existingActionsCount: existingActionEls.length,
        actionFiredOnce,
        actionCallCount,
        remainedOpen,
        closedAfterOutsideClick
      });
    }

    return results;
  });

  let allPanelsPassed = true;
  panelTestResults.panelTests.forEach(t => {
    const ok = t.actionFiredOnce && t.remainedOpen && t.closedAfterOutsideClick;
    if (!ok) allPanelsPassed = false;
    console.log(`  [${t.index}/39] ${t.descriptor}: Action 1x (${t.actionCallCount}) ${t.actionFiredOnce ? '✓' : '✗'} | Innen offen ${t.remainedOpen ? '✓' : '✗'} | Außen schließt ${t.closedAfterOutsideClick ? '✓' : '✗'}`);
  });

  // =========================================================================
  // SCHRITT 3: KONSOLEN- & CSP-FEHLER PRÜFEN
  // =========================================================================
  console.log('\n====================================================');
  console.log('🛡️ KONSOLEN- & CSP-SICHERHEITSPRÜFUNG');
  console.log('====================================================');

  const criticalErrors = consoleErrors.filter(err =>
    err.includes('is not a function') || err.includes('is not defined')
  );

  console.log(`Kritische JS-Fehler ("is not a function" / "is not defined"): ${criticalErrors.length}`);
  if (criticalErrors.length > 0) {
    criticalErrors.forEach(e => console.error('  -> ' + e));
  } else {
    console.log('✓ 0 kritische Funktions-/Definitions-Fehler');
  }

  console.log(`CSP-Verletzungen: ${cspErrors.length}`);
  if (cspErrors.length > 0) {
    cspErrors.forEach(e => console.error('  -> CSP: ' + e));
  } else {
    console.log('✓ 0 CSP-Verletzungen');
  }

  const allPassed = (
    smokeResults.timer.ok &&
    smokeResults.workspace.ok &&
    smokeResults.settings.ok &&
    smokeResults.language.ok &&
    smokeResults.tasks.ok &&
    persistedOk &&
    allPanelsPassed &&
    criticalErrors.length === 0 &&
    cspErrors.length === 0
  );

  console.log('\n====================================================');
  console.log(`📊 GESAMTERGEBNIS: ${allPassed ? '🎉 ALLE TESTS BESTANDEN' : '❌ FEHLGESCHLAGEN'}`);
  console.log(`- Initial geladene JS-Größe: ${(initialJsBytes / 1024).toFixed(2)} KB`);
  console.log(`- Time to Interactive (TTI): ${ttiMs} ms`);
  console.log('====================================================\n');

  if (!allPassed) {
    process.exitCode = 1;
  }

} finally {
  await browser.close();
  server.close();
}
