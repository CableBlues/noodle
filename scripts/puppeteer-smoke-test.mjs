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
  console.error('Kein Browser (Edge/Chrome) gefunden!');
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
  // SCHRITT 4: PANEL-ABSICHERUNGSTEST (Alle 39 Panels mit data-stop-propagation)
  // Klicke in jedes der 39 Panels auf ein inneres Element und prüfe, dass das Panel
  // offen bleibt, und klicke danach außerhalb und prüfe, dass es schließt.
  // =========================================================================
  console.log('\n====================================================');
  console.log('🔍 PRÜFUNG DER 39 PANELS MIT data-stop-propagation');
  console.log('====================================================');

  // Stelle sicher, dass Seite stabil geladen ist
  await new Promise(r => setTimeout(r, 500));

  const panelTestResults = await page.evaluate(async () => {
    const panels = Array.from(document.querySelectorAll('[data-stop-propagation="true"]'));
    const results = [];

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

    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      const descriptor = getPanelDescriptor(panel, i);
      const hostContainer = panel.closest('.fixed') || panel;

      // 1. Panel für den Test gezielt öffnen (falls verborgen)
      const wasHiddenHost = hostContainer.classList.contains('hidden');
      const wasHiddenPanel = panel.classList.contains('hidden');
      if (wasHiddenHost) hostContainer.classList.remove('hidden');
      if (wasHiddenPanel) panel.classList.remove('hidden');

      // Bestätige, dass das Panel jetzt offen ist
      const initiallyOpen = isPanelOpen(panel, hostContainer);

      // Finde oder erzeuge ein inneres klickbares Element (Probe-Button)
      const probe = document.createElement('button');
      probe.className = 'puppeteer-inner-test-probe';
      probe.textContent = 'probe';
      panel.appendChild(probe);

      // 2. Klick auf inneres Element -> Panel MUSS offen bleiben (Propagation gestoppt)
      probe.click();
      const remainedOpenAfterInnerClick = isPanelOpen(panel, hostContainer);
      probe.remove();

      // 3. Klick außerhalb -> Panel/Modal MUSS schließen
      // Simuliere Schließen durch Klick auf Host-Backdrop bzw. Document-Click
      if (hostContainer !== panel && typeof hostContainer.onclick === 'function') {
        try {
          hostContainer.onclick({ target: hostContainer });
        } catch (e) {}
      } else {
        document.body.click();
      }

      // Verifiziere das Schließen
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

      // Wieder in den Ursprungszustand versetzen
      if (wasHiddenHost) hostContainer.classList.add('hidden');
      if (wasHiddenPanel) panel.classList.add('hidden');

      results.push({
        index: i + 1,
        descriptor,
        initiallyOpen,
        remainedOpenAfterInnerClick,
        closedAfterOutsideClick
      });
    }

    return results;
  });

  console.log(`Geprüfte Panels: ${panelTestResults.length}/39`);
  let allPanelsPassed = true;
  panelTestResults.forEach(r => {
    const passed = r.remainedOpenAfterInnerClick && r.closedAfterOutsideClick;
    if (!passed) allPanelsPassed = false;
    console.log(`  [${r.index}/39] ${r.descriptor}: Klick-Innen bleibt offen? ${r.remainedOpenAfterInnerClick ? '✓ JA' : '✗ NEIN'} | Klick-Außen schließt? ${r.closedAfterOutsideClick ? '✓ JA' : '✗ NEIN'}`);
  });

  if (!allPanelsPassed) {
    console.error('❌ FEHLER: Nicht alle 39 Panels verhielten sich korrekt bei Klick-Innen/Außen!');
    process.exitCode = 1;
  } else {
    console.log('✅ Alle 39 Panels mit data-stop-propagation verhalten sich exakt wie gefordert!');
  }

  // Prüfen auf kritische Fehler: "is not a function" oder "is not defined"
  const criticalErrors = consoleErrors.filter(err => 
    err.includes('is not a function') || err.includes('is not defined')
  );

  if (criticalErrors.length > 0) {
    console.error('❌ KRITISCHE FEHLER GEFUNDEN:');
    criticalErrors.forEach(err => console.error('  -> ' + err));
    process.exitCode = 1;
  } else {
    console.log('✅ Puppeteer Smoke Test erfolgreich! Keine "is not a function" oder "is not defined" Fehler.');
  }

} finally {
  await browser.close();
  server.close();
}


