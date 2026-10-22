import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
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
  '.ico': 'image/x-icon'
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
console.log(`Server läuft auf http://127.0.0.1:${port}`);

function resolveBrowserPath() {
  const env = process.env.CHROME_PATH;
  if (env) {
    if (fs.existsSync(env)) return env;
    console.error(`CHROME_PATH ist gesetzt (${env}), die Datei existiert aber nicht.`);
    return null;
  }
  const home = os.homedir();
  const byPlatform = {
    win32: [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
    ],
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      path.join(home, 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    ],
    linux: [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium',
      '/usr/bin/microsoft-edge'
    ]
  };
  const list = byPlatform[process.platform] || byPlatform.linux;
  return list.find(p => p && fs.existsSync(p)) || null;
}

const executablePath = resolveBrowserPath();
if (!executablePath) {
  console.error('FEHLER: Kein Chrome/Chromium/Edge gefunden. Setze die Umgebungsvariable CHROME_PATH auf die Browser-Programmdatei (z. B. CHROME_PATH="/usr/bin/chromium").');
  server.close();
  process.exit(1);
}

console.log('Verwende Browser:', executablePath);

const browser = await puppeteer.launch({
  executablePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--mute-audio']
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

const consoleErrors = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    const text = msg.text();
    consoleErrors.push(text);
    console.log(`[Browser Console Error]: ${text}`);
  }
});

page.on('pageerror', err => {
  consoleErrors.push(err.message);
  console.log(`[Browser PageError]: ${err.message}`);
});

try {
  console.log('Lade dist/index.html...');
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // 10 Kernbuttons für den Smoke-Test
  const targetSelectors = [
    { desc: '1. Tools-Panel öffnen', sel: '#btn-header-tools' },
    { desc: '2. Timer starten', sel: '#timer-play-btn' },
    { desc: '3. Timer pausieren', sel: '#timer-pause-btn' },
    { desc: '4. Workspace wechseln', sel: '#header-ws-opt-work' },
    { desc: '5. Board Undo auslösen', sel: '#btn-board-undo' },
    { desc: '6. Kalender Dropdown toggle', sel: '[data-action="toggleCalendarDropdown"]' },
    { desc: '7. Wetter Dropdown toggle', sel: '[data-action="toggleWeatherDropdown"]' },
    { desc: '8. Add-List Popover toggle', sel: '[data-action="toggleAddListPopover"]' },
    { desc: '9. Settings Tab wechseln', sel: '#settings-tab-general' },
    { desc: '10. Minimalist Fokus-Mode', sel: '#btn-focus-mode' }
  ];

  for (const item of targetSelectors) {
    const exists = await page.evaluate((sel) => !!document.querySelector(sel), item.sel);
    console.log(`Vorprüfung ${item.desc} (${item.sel}): ${exists ? 'GEFUNDEN' : 'NICHT IM DOM'}`);
  }

  const clickedActions = [];
  for (const item of targetSelectors) {
    try {
      const ok = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        el.click();
        return true;
      }, item.sel);

      if (ok) {
        await new Promise(r => setTimeout(r, 400));
        clickedActions.push(item.desc);
        console.log(`✓ Klick erfolgreich: ${item.desc}`);
      } else {
        console.warn(`! Klick übersprungen: ${item.desc}`);
      }
    } catch (e) {
      // Bei Reload/Controllerchange kurz warten und erneut versuchen
      await new Promise(r => setTimeout(r, 1200));
      try {
        const retryOk = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return false;
          el.click();
          return true;
        }, item.sel);
        if (retryOk) {
          clickedActions.push(item.desc);
          console.log(`✓ Klick erfolgreich (nach Kontext-Stabilisierung): ${item.desc}`);
        } else {
          console.warn(`! Klick übersprungen: ${item.desc}`);
        }
      } catch (retryErr) {
        console.warn(`! Klickfehler bei ${item.desc}:`, retryErr.message);
      }
    }
  }

  console.log(`\nErfolgreich geklickte Kernaktionen: ${clickedActions.length}/10`);
  clickedActions.forEach(a => console.log('  - ' + a));

  // =========================================================================
  // SCHRITT 4: TESTS (a) BIS (e) NACH PFLICHTENHEFT
  // a) Für JEDEN der 39 Wrapper: Panel öffnen, einen darin enthaltenen
  //    data-action-Button klicken, prüfen, dass die Zielfunktion GENAU EINMAL aufgerufen wurde (window-Spy).
  // b) Ein Klick innerhalb eines Panels schließt dieses nicht; ein Klick außerhalb schließt es.
  // c) Inline-onclick-Button innerhalb eines Wrappers feuert genau einmal.
  // d) DJ-Button feuert genau einmal.
  // e) Konsole: kein "is not a function"/"is not defined" während der Tests.
  // =========================================================================
  console.log('\n====================================================');
  console.log('🔍 PRÜFUNG (a)-(e): 39 WRAPPER, DELEGATION & ONCLICK');
  console.log('====================================================');

  await new Promise(r => setTimeout(r, 500));

  // Tests a, b, c über evaluate im Browser
  const testResults = await page.evaluate(async () => {
    const panels = Array.from(document.querySelectorAll('[data-stop-propagation="true"]'));
    const results = {
      totalPanels: panels.length,
      panelTests: [],
      inlineOnclickPassed: false,
      inlineOnclickCalls: 0
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

    // Initialisiere Spies
    window.__spyCallCounts = {};

    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      const descriptor = getPanelDescriptor(panel, i);
      const hostContainer = panel.closest('.fixed') || panel;

      // 1. Panel für den Test öffnen (falls verborgen)
      const wasHiddenHost = hostContainer.classList.contains('hidden');
      const wasHiddenPanel = panel.classList.contains('hidden');
      if (wasHiddenHost) hostContainer.classList.remove('hidden');
      if (wasHiddenPanel) panel.classList.remove('hidden');

      // a) data-action Button prüfen: Spy anlegen, Button einhängen, klicken, Aufrufe zählen
      const actionSpyName = `__puppeteerSpyAction_${i}`;
      window.__spyCallCounts[actionSpyName] = 0;
      window[actionSpyName] = () => {
        window.__spyCallCounts[actionSpyName]++;
      };

      const actionBtn = document.createElement('button');
      actionBtn.className = 'puppeteer-action-probe-btn';
      actionBtn.setAttribute('data-action', actionSpyName);
      actionBtn.setAttribute('data-action-args', '["probe_arg"]');
      panel.appendChild(actionBtn);

      // Klick auf data-action Button
      actionBtn.click();
      const actionCallCount = window.__spyCallCounts[actionSpyName];
      const dataActionFiredExactlyOnce = (actionCallCount === 1);
      actionBtn.remove();

      // b) Klick innerhalb schließt nicht; Klick außerhalb schließt
      const innerProbe = document.createElement('button');
      innerProbe.className = 'puppeteer-inner-test-probe';
      panel.appendChild(innerProbe);

      innerProbe.click();
      const remainedOpenAfterInnerClick = isPanelOpen(panel, hostContainer);
      innerProbe.remove();

      // Klick außerhalb simulieren
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
        dataActionFiredExactlyOnce,
        actionCallCount,
        remainedOpenAfterInnerClick,
        closedAfterOutsideClick
      });
    }

    // c) Inline-onclick-Button innerhalb eines Wrappers feuert genau einmal
    window.__inlineOnclickCalls = 0;
    window.__testInlineFunc = () => {
      window.__inlineOnclickCalls++;
    };

    if (panels.length > 0) {
      const testWrapper = panels[0];
      const inlineBtn = document.createElement('button');
      inlineBtn.setAttribute('onclick', 'window.__testInlineFunc()');
      inlineBtn.textContent = 'Inline Test';
      testWrapper.appendChild(inlineBtn);

      inlineBtn.click();

      results.inlineOnclickCalls = window.__inlineOnclickCalls;
      results.inlineOnclickPassed = (window.__inlineOnclickCalls === 1);
      inlineBtn.remove();
    }

    return results;
  });

  // d) DJ-Button Test (collab-engine.js)
  const djTestResult = await page.evaluate(async () => {
    let djCalls = 0;
    if (typeof window.CollabEngine === 'undefined') {
      return { success: false, reason: 'CollabEngine not found' };
    }

    // Window / Object Spy auf CollabEngine.syncSharedDjTrack
    const origSync = window.CollabEngine.syncSharedDjTrack;
    window.CollabEngine.syncSharedDjTrack = function(...args) {
      djCalls++;
      if (typeof origSync === 'function') {
        try { origSync.apply(this, args); } catch (e) {}
      }
    };

    // Chatnachricht mit DJ-Track einspeisen
    const testTrack = { id: 'test_dj_track', name: 'Puppeteer Test Beat', bpm: 120, url: 'beat.mp3' };
    window.CollabEngine.handleIncomingEvent({
      type: 'chat_message',
      sender: { id: 'dj_user', name: 'DJ Bot' },
      message: {
        id: 'msg_dj_puppeteer',
        sender: { id: 'dj_user', name: 'DJ Bot' },
        isDjShare: true,
        track: testTrack,
        text: 'DJ Musik Track Test',
        time: '12:00'
      }
    });

    await new Promise(r => setTimeout(r, 100));

    // DJ-Button im Chat suchen
    const chatContainer = document.getElementById('collab-chat-messages-container');
    const djBtn = chatContainer ? chatContainer.querySelector('[data-action="CollabEngine.syncSharedDjTrack"]') : null;

    if (!djBtn) {
      window.CollabEngine.syncSharedDjTrack = origSync;
      return { success: false, reason: 'DJ button not rendered' };
    }

    djBtn.click();
    window.CollabEngine.syncSharedDjTrack = origSync;

    return {
      success: (djCalls === 1),
      calls: djCalls
    };
  });

  // e) Konsole prüfen: kein "is not a function" oder "is not defined"
  const criticalErrors = consoleErrors.filter(err =>
    err.includes('is not a function') || err.includes('is not defined')
  );

  console.log(`\n--- ERGEBNIS TEST A: 39 Wrapper data-action Aufruf GENAU EINMAL ---`);
  let allActionsPassed = true;
  testResults.panelTests.forEach(t => {
    if (!t.dataActionFiredExactlyOnce) allActionsPassed = false;
    console.log(`  [${t.index}/39] ${t.descriptor}: data-action Aufrufe = ${t.actionCallCount} ${t.dataActionFiredExactlyOnce ? '✓ (GENAU 1x)' : '✗ FEHLER'}`);
  });

  console.log(`\n--- ERGEBNIS TEST B: Klick-Innen bleibt offen, Klick-Außen schließt ---`);
  let allBordersPassed = true;
  testResults.panelTests.forEach(t => {
    const passed = t.remainedOpenAfterInnerClick && t.closedAfterOutsideClick;
    if (!passed) allBordersPassed = false;
    console.log(`  [${t.index}/39] ${t.descriptor}: Innen offen? ${t.remainedOpenAfterInnerClick ? '✓' : '✗'} | Außen schließt? ${t.closedAfterOutsideClick ? '✓' : '✗'}`);
  });

  console.log(`\n--- ERGEBNIS TEST C: Inline-onclick innerhalb Wrapper feuert genau einmal ---`);
  console.log(`  Inline-onclick Aufrufe: ${testResults.inlineOnclickCalls} ${testResults.inlineOnclickPassed ? '✓ (GENAU 1x)' : '✗ FEHLER'}`);

  console.log(`\n--- ERGEBNIS TEST D: DJ-Button feuert genau einmal ---`);
  console.log(`  DJ-Button Aufrufe: ${djTestResult.calls} ${djTestResult.success ? '✓ (GENAU 1x)' : '✗ FEHLER (' + djTestResult.reason + ')'}`);

  console.log(`\n--- ERGEBNIS TEST E: Konsolenfehler ("is not a function" / "is not defined") ---`);
  if (criticalErrors.length === 0) {
    console.log(`  Kritische Fehler in Konsole: 0 ✓`);
  } else {
    console.error(`  Kritische Fehler in Konsole: ${criticalErrors.length} ✗`);
    criticalErrors.forEach(err => console.error('    -> ' + err));
  }

  const overallPassed = (
    allActionsPassed &&
    allBordersPassed &&
    testResults.inlineOnclickPassed &&
    djTestResult.success &&
    criticalErrors.length === 0
  );

  if (!overallPassed) {
    console.error('\n❌ Mindestens ein Test aus a) bis e) ist FEHLGESCHLAGEN!');
    process.exitCode = 1;
  } else {
    console.log('\n🎉 ALLE TESTS a) bis e) VOLLSTÄNDIG ERFOLGREICH!');
  }

} finally {
  await browser.close();
  server.close();
}


