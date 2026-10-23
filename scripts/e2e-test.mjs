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

// ---------------------------------------------------------------------------
// Ergebnis-Protokoll: pro Test genau eine Zeile PASS / FAIL / ÜBERSPRUNGEN
// ---------------------------------------------------------------------------
const results = [];
function report(status, name, detail = '') {
  results.push({ status, name, detail });
  const icon = status === 'PASS' ? 'PASS         ' : status === 'FAIL' ? 'FAIL         ' : 'ÜBERSPRUNGEN ';
  console.log(`${icon} ${name}${detail ? '  -- ' + detail : ''}`);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clickWithin3s = async (handle) => {
  if (!handle) throw new Error('Element nicht gefunden');
  return handle.click({ timeout: 3000 });
};

// ---------------------------------------------------------------------------
// Zeitlimits: ganzer Lauf max. 5 Minuten, danach Abbruch mit Exit-Code 1
// ---------------------------------------------------------------------------
const RUN_START = Date.now();
const RUN_LIMIT_MS = 5 * 60 * 1000;
const REPORT_PATH = path.join(rootDir, 'scripts', 'e2e-report.txt');
function logReport(msg) {
  const ts = new Date().toISOString();
  fs.appendFileSync(REPORT_PATH, `[${ts}] ${msg}\n`);
}
logReport('E2E test started');
const RUN_DEADLINE = RUN_START + RUN_LIMIT_MS;
const panelProgress = { total: [], done: 0 };
let browser = null; // wird beim Start gesetzt
function abortRun(reason) {
  const open = panelProgress.total.slice(panelProgress.done);
  console.log(`\n[E2E] ABBRUCH: ${reason} nach ${((Date.now() - RUN_START) / 1000).toFixed(0)} s.`);
  if (open.length) console.log(`[E2E] Noch offene (ungeprüfte/laufende) Panels (${open.length}): ${open.join(', ')}`);
  else console.log('[E2E] Alle Panels waren bereits durchlaufen oder die Panel-Phase war noch nicht erreicht.');
  const c = results.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {});
  console.log(`[E2E] Zwischenstand: ${c.PASS || 0} PASS | ${c.FAIL || 0} FAIL | ${c['ÜBERSPRUNGEN'] || 0} ÜBERSPRUNGEN`);
  const kill = () => process.exit(1);
  try { Promise.race([browser ? browser.close() : Promise.resolve(), sleep(3000)]).then(kill, kill); } catch (e) { kill(); }
}
const watchdog = setTimeout(() => abortRun('Gesamtlimit von 5 Minuten erreicht'), RUN_LIMIT_MS);
watchdog.unref();

// ---------------------------------------------------------------------------
// a) Browserpfad plattformübergreifend: CHROME_PATH, sonst Standardpfade
// ---------------------------------------------------------------------------
function resolveBrowserPath() {
  const env = process.env.CHROME_PATH;
  if (env) {
    if (fs.existsSync(env)) return env;
    console.error(`[E2E] CHROME_PATH ist gesetzt (${env}), die Datei existiert aber nicht.`);
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
  console.error('[E2E] FEHLER: Kein Chrome/Chromium/Edge gefunden. Setze die Umgebungsvariable CHROME_PATH auf die Browser-Programmdatei (z. B. CHROME_PATH="/usr/bin/chromium").');
  process.exit(1);
}
console.log('[E2E] Verwende Browser:', executablePath);

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('[E2E] FEHLER: dist/index.html fehlt. Bitte zuerst "npm run build" ausführen.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Static-Server für dist/
// ---------------------------------------------------------------------------
const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ttf': 'font/ttf', '.mp3': 'audio/mpeg'
};
const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(distDir, reqPath);
  if (filePath.startsWith(distDir) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found: ' + reqPath);
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}/index.html`;
console.log(`[E2E] Static-Server läuft auf http://127.0.0.1:${port}`);

browser = await puppeteer.launch({
  executablePath,
  protocolTimeout: 120000,
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--mute-audio',
    '--disable-audio-output',
    '--autoplay-policy=no-user-gesture-required',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-features=AudioServiceOutOfProcess,CalculateNativeWinOcclusion'
  ]
});

// Neue Fenster/Tabs (window.open, target=_blank) sofort schließen
browser.on('targetcreated', async target => {
  try {
    if (target.type() === 'page' && target.opener()) {
      const pg = await target.page();
      if (pg) await pg.close();
    }
  } catch (e) { /* ignorieren */ }
});

// Sichtbarkeits-Helfer im Seitenkontext (nur Lesen, keine Zustandsänderung)
const IN_PAGE_HELPERS = `
  window.__e2eVisible = function (el) {
    if (!el || !el.isConnected) return false;
    if (el.getClientRects().length === 0) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
`;

const consoleErrors = [];
const cspErrors = [];
function attachDiagnostics(pg) {
  pg.setDefaultTimeout(4000);
  pg.setDefaultNavigationTimeout(15000);
  pg.evaluateOnNewDocument(IN_PAGE_HELPERS).catch(() => {});
  // Downloads ignorieren
  pg.createCDPSession().then(c => c.send('Page.setDownloadBehavior', { behavior: 'deny' })).catch(() => {});
  // Dialoge (alert/confirm/prompt) automatisch abweisen
  pg.on('dialog', d => d.dismiss().catch(() => {}));
  pg.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      consoleErrors.push(text);
      if (/Content Security Policy|CSP|Refused to/i.test(text)) cspErrors.push(text);
    }
  });
  pg.on('pageerror', err => {
    consoleErrors.push(err.message);
    if (/Content Security Policy|CSP|Refused to/i.test(err.message)) cspErrors.push(err.message);
  });
}

async function waitForApp(pg, timeout = 30000) {
  await pg.waitForFunction(() => typeof window.renderApp === 'function' && !!window.state && !!document.getElementById('minimal-mode-btn-text'), { timeout });
}

async function injectHelpers(pg) {
  await pg.evaluate(IN_PAGE_HELPERS);
}

let initialJsBytes = 0;
let ttiMs = 0;

try {
  // =========================================================================
  // TEIL 1: Hauptseite – Performance, Smoke (echte Klicks/Tasten), Ticker, i18n
  // =========================================================================
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  attachDiagnostics(page);

  const jsRequests = [];
  page.on('response', async res => {
    const cleanUrl = res.url().split('?')[0];
    if (cleanUrl.endsWith('.js')) {
      try {
        const bytes = (await res.buffer()).length;
        initialJsBytes += bytes;
        jsRequests.push({ url: cleanUrl.split('/').pop(), bytes });
      } catch (e) { /* ignorieren */ }
    }
  });

  console.log('\n[E2E] === Performance ===');
  const navStart = Date.now();
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitForApp(page, 60000);
  ttiMs = Date.now() - navStart;
  console.log(`[E2E] TTI: ${ttiMs} ms | Initiales JS: ${(initialJsBytes / 1024).toFixed(2)} KB (${jsRequests.length} Anfragen)`);
  jsRequests.forEach(r => console.log(`       - ${r.url}: ${(r.bytes / 1024).toFixed(2)} KB`));
  await sleep(1000);
  await page.evaluate(() => {
    try { if (typeof initAudioContext === 'function') initAudioContext(); } catch(e) {}
  });
  await injectHelpers(page);

  // Echte Klick-Helfer: markiert das n-te sichtbare Element und klickt per echter Maus
  async function realClickVisible(selector, { timeout = 4000, nth = 0 } = {}) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const found = await page.evaluate((sel, n) => {
        const isVis = typeof window.__e2eVisible === 'function' ? window.__e2eVisible : (e => e && e.isConnected && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none');
        const el = Array.from(document.querySelectorAll(sel)).filter(isVis)[n];
        if (!el) return false;
        document.querySelectorAll('[data-e2e-click]').forEach(x => x.removeAttribute('data-e2e-click'));
        el.setAttribute('data-e2e-click', '1');
        return true;
      }, selector, nth);
      if (found) {
        const h = await page.$('[data-e2e-click="1"]');
        if (h) {
          const chk = await checkClickable(page, h);
          if (!chk.ok) return false;
          await clickWithin3s(h);
          await page.evaluate(() => document.querySelectorAll('[data-e2e-click]').forEach(x => x.removeAttribute('data-e2e-click')));
          return true;
        }
      }
      await sleep(150);
    }
    return false;
  }
  async function pressKey(key) { await page.keyboard.press(key); await sleep(200); }

  // "Aufgabe hinzufügen" in #list-daily per echtem Klick, dann Eingabefeld + Enter
  async function addTaskViaUi(name) {
    const opened = await page.evaluate(() => {
      const isVis = typeof window.__e2eVisible === 'function' ? window.__e2eVisible : (e => e && e.isConnected && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none');
      const list = document.getElementById('list-daily');
      if (!list) return false;
      const scope = list.parentElement && list.parentElement.parentElement ? list.parentElement.parentElement : list;
      const cands = Array.from(scope.querySelectorAll('button, [role="button"], div, span'))
        .filter(el => isVis(el) && /hinzu|add|ajout|aggiung|añad|προσθ/i.test((el.innerText || '').trim()) && (el.innerText || '').trim().length < 40);
      const el = cands[cands.length - 1];
      if (!el) return false;
      document.querySelectorAll('[data-e2e-click]').forEach(x => x.removeAttribute('data-e2e-click'));
      el.setAttribute('data-e2e-click', '1');
      return true;
    });
    if (!opened) throw new Error('Kein "Aufgabe hinzufügen"-Element in #list-daily gefunden');
    await clickWithin3s(await page.$('[data-e2e-click="1"]'));
    await sleep(500);
    const hasInput = await page.evaluate(() => {
      const isVis = typeof window.__e2eVisible === 'function' ? window.__e2eVisible : (e => e && e.isConnected && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none');
      const scope = document.getElementById('list-daily').parentElement.parentElement;
      const inp = Array.from(scope.querySelectorAll('input[type="text"], input:not([type]), textarea')).find(isVis);
      if (!inp) return false;
      document.querySelectorAll('[data-e2e-input]').forEach(x => x.removeAttribute('data-e2e-input'));
      inp.setAttribute('data-e2e-input', '1');
      return true;
    });
    if (!hasInput) throw new Error('Kein sichtbares Eingabefeld nach Klick auf "Aufgabe hinzufügen"');
    await clickWithin3s(await page.$('[data-e2e-input="1"]'));
    await page.keyboard.type(name, { delay: 10 });
    await page.keyboard.press('Enter');
    await sleep(700);
  }
  // Button einer Zeile (anhand Titel-Regex) markieren
  async function markRowButton(name, titleRegexSource) {
    return page.evaluate((n, src) => {
      const isVis = typeof window.__e2eVisible === 'function' ? window.__e2eVisible : (e => e && e.isConnected && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none');
      const re = new RegExp(src, 'i');
      const list = document.getElementById('list-daily');
      for (const b of Array.from(list.querySelectorAll('button')).filter(isVis)) {
        let row = b.parentElement;
        for (let i = 0; i < 4 && row && row !== list; i++, row = row.parentElement) {
          if ((row.innerText || '').includes(n) && re.test(b.title || '')) {
            document.querySelectorAll('[data-e2e-click]').forEach(x => x.removeAttribute('data-e2e-click'));
            b.setAttribute('data-e2e-click', '1');
            return true;
          }
        }
      }
      return false;
    }, name, titleRegexSource);
  }

  console.log('\n[E2E] === Smoke-Test (nur echte Klicks/Tasten) ===');

  // --- Timer Start/Pause ---
  try {
    const readTimer = () => page.evaluate(() => (document.getElementById('timer-display') || {}).textContent || '');
    const t0 = await readTimer();
    const clickedPlay = await realClickVisible('#timer-play-btn');
    await sleep(2300);
    const t1 = await readTimer();
    report(clickedPlay && t1 !== t0 ? 'PASS' : 'FAIL', 'Smoke: Timer starten (Anzeige tickt)', `${t0.trim()} -> ${t1.trim()}`);
    const clickedPause = await realClickVisible('#timer-pause-btn');
    await sleep(300);
    const p0 = await readTimer();
    await sleep(2200);
    const p1 = await readTimer();
    report(clickedPause && p0 === p1 ? 'PASS' : 'FAIL', 'Smoke: Timer pausieren (Anzeige steht)', `${p0.trim()} -> ${p1.trim()}`);
    await realClickVisible('#timer-stop-btn', { timeout: 1500 });
  } catch (e) { report('FAIL', 'Smoke: Timer', e.message); }

  // --- Aufgabe: Eingabefeld + Enter, erledigen ---
  try {
    const taskName = 'E2E_REAL_' + Date.now();
    await addTaskViaUi(taskName);
    const added = await page.evaluate(n => document.getElementById('list-daily').innerText.includes(n), taskName);
    report(added ? 'PASS' : 'FAIL', 'Smoke: Aufgabe per Eingabefeld + Enter hinzufügen', taskName);
    if (added) {
      if (!(await markRowButton(taskName, 'erledigt|done|complete|fait|fatto|hecho|ολοκλ'))) {
        report('FAIL', 'Smoke: Aufgabe erledigen', 'Erledigt-Button der Zeile nicht gefunden');
      } else {
        await clickWithin3s(await page.$('[data-e2e-click="1"]'));
        await sleep(1200);
        const gone = await page.evaluate(n => !document.getElementById('list-daily').innerText.includes(n), taskName);
        report(gone ? 'PASS' : 'FAIL', 'Smoke: Aufgabe erledigen (verschwindet aus Tagesliste)');
      }
    } else {
      report('ÜBERSPRUNGEN', 'Smoke: Aufgabe erledigen', 'Hinzufügen fehlgeschlagen');
    }
  } catch (e) { report('FAIL', 'Smoke: Aufgabe hinzufügen/erledigen', e.message); }

  // --- Aufgabe löschen: neue Aufgabe, Zeilen-Optionen, Löschen ---
  try {
    const delName = 'E2E_DEL_' + Date.now();
    await addTaskViaUi(delName);
    if (!(await markRowButton(delName, 'optionen|options|opciones|opzioni|karten'))) throw new Error('Optionen-Button der Zeile nicht gefunden');
    await clickWithin3s(await page.$('[data-e2e-click="1"]'));
    await sleep(500);
    const delBtn = await page.evaluate(() => {
      const isVis = typeof window.__e2eVisible === 'function' ? window.__e2eVisible : (e => e && e.isConnected && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none');
      const el = Array.from(document.querySelectorAll('button, [role="button"], [data-action]'))
        .find(e => isVis(e) && /lösch|delete|supprim|elimin|cancella|διαγρ/i.test(((e.innerText || '') + ' ' + (e.title || '') + ' ' + (e.getAttribute('data-action') || '')).trim()));
      if (!el) return false;
      document.querySelectorAll('[data-e2e-click]').forEach(x => x.removeAttribute('data-e2e-click'));
      el.setAttribute('data-e2e-click', '1');
      return true;
    });
    if (!delBtn) throw new Error('Löschen-Eintrag im Zeilenmenü nicht gefunden');
    await clickWithin3s(await page.$('[data-e2e-click="1"]'));
    await sleep(900);
    const deleted = await page.evaluate(n => !document.body.innerText.includes(n), delName);
    report(deleted ? 'PASS' : 'FAIL', 'Smoke: Aufgabe löschen', delName);
  } catch (e) { report('FAIL', 'Smoke: Aufgabe löschen', e.message); }

  // --- Workspace-Umschalter ---
  try {
    const wsOf = () => page.evaluate(() => window.state.activeWorkspace);
    await realClickVisible('#btn-header-workspace');
    await sleep(300);
    await realClickVisible('#header-ws-opt-work');
    await sleep(700);
    const toWork = await wsOf();
    await realClickVisible('#btn-header-workspace');
    await sleep(300);
    await realClickVisible('#header-ws-opt-private');
    await sleep(700);
    const toPrivate = await wsOf();
    report(toWork === 'work' && (toPrivate === 'private' || toPrivate === 'personal') ? 'PASS' : 'FAIL', 'Smoke: Workspace-Umschalter', `work: ${toWork}, zurück: ${toPrivate}`);
  } catch (e) { report('FAIL', 'Smoke: Workspace-Umschalter', e.message); }

  // --- Einstellungen öffnen/schließen + Sprachwechsel ---
  try {
    const modalVisible = () => page.evaluate(() => {
      const isVis = typeof window.__e2eVisible === 'function' ? window.__e2eVisible : (e => e && e.isConnected && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none');
      const m = document.getElementById('modal-settings');
      return !!m && isVis(m);
    });
    let opened = await realClickVisible('[data-action="openSettingsModal"]', { timeout: 800 });
    if (!opened) {
      await realClickVisible('[data-action="togglePanel"][data-action-args*="settings-dropdown"]', { timeout: 3000 });
      await sleep(400);
      await realClickVisible('[data-action="openSettingsModal"]', { timeout: 2000 });
    }
    await sleep(600);
    report(await modalVisible() ? 'PASS' : 'FAIL', 'Smoke: Einstellungen öffnen');

    const langNow = () => page.evaluate(() => (window.currentLang || document.documentElement.lang || '').toString());
    const before = await langNow();
    const target = before === 'en' ? 'fr' : 'en';
    const okSwitch = await realClickVisible(`[data-action="setLanguage"][data-action-args='["${target}"]']`, { timeout: 3000 });
    await sleep(700);
    const after = await langNow();
    report(okSwitch && after === target ? 'PASS' : 'FAIL', 'Smoke: Sprachwechsel per Klick', `${before} -> ${after}`);
    await realClickVisible(`[data-action="setLanguage"][data-action-args='["${before || 'de'}"]']`, { timeout: 3000 });
    await sleep(500);

    await pressKey('Escape');
    await sleep(500);
    let closed = !(await modalVisible());
    if (closed) {
      report('PASS', 'Smoke: Einstellungen schließen (Escape)');
    } else {
      await realClickVisible('#modal-settings [data-action="closeSettingsModal"]', { timeout: 2000 });
      await sleep(500);
      closed = !(await modalVisible());
      report(closed ? 'PASS' : 'FAIL', 'Smoke: Einstellungen schließen', 'Escape schloss nicht; X-Button schloss: ' + closed);
    }
  } catch (e) { report('FAIL', 'Smoke: Einstellungen/Sprachwechsel', e.message); }

  // --- Reload behält Daten ---
  try {
    const persistName = 'E2E_PERSIST_' + Date.now();
    await addTaskViaUi(persistName);
    await sleep(1500); // Debounce des Speicherns abwarten
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForApp(page, 60000);
    await sleep(1500);
    await injectHelpers(page);
    const still = await page.evaluate(n => document.body.innerText.includes(n), persistName);
    report(still ? 'PASS' : 'FAIL', 'Smoke: Reload behält Daten', persistName);
  } catch (e) { report('FAIL', 'Smoke: Reload behält Daten', e.message); }

  // =========================================================================
  // Header-News-Ticker <= 10 s
  // =========================================================================
  console.log('\n[E2E] === News-Ticker ===');
  let tickerOk = false;
  try {
    await page.waitForFunction(() => {
      const el = document.getElementById('board-news-ticker-bar');
      return !!el && (el.innerText || el.textContent || '').trim().length > 0;
    }, { timeout: 10000 });
    tickerOk = true;
  } catch (e) { tickerOk = false; }
  const tickerSnippet = await page.evaluate(() => { const el = document.getElementById('board-news-ticker-bar'); return el ? (el.innerText || el.textContent || '').trim() : ''; });
  report(tickerOk ? 'PASS' : 'FAIL', 'News-Ticker zeigt innerhalb von 10 s Inhalt', `"${tickerSnippet.substring(0, 60)}"`);

  // =========================================================================
  // i18n: rohe Übersetzungsschlüssel in allen 6 Sprachen
  // =========================================================================
  console.log('\n[E2E] === i18n (6 Sprachen) ===');
  const targetAreas = [
    { name: 'Header', selector: 'header, #board-header' },
    { name: 'Dock', selector: '.mac-dock-container, #desktop-tools-sidebar, .desktop-tools-sidebar' },
    { name: 'Settings', selector: '#modal-settings' },
    { name: 'Sport', selector: '#helper-sport-modal' },
    { name: 'Entscheidungs-Assistent', selector: '#helper-pick-modal' },
    { name: 'Rezept-Studio', selector: '#panel-cooking' },
    { name: 'Einkauf', selector: '#panel-shopping' }
  ];
  const langs = ['de', 'en', 'fr', 'it', 'es', 'el'];
  for (const lang of langs) {
    const lr = await page.evaluate(async (l, areas) => {
      if (typeof window.setLanguage === 'function') window.setLanguage(l);
      await new Promise(r => setTimeout(r, 120));
      const keyPattern = /^[a-z]+(_[a-z0-9]+)+$/;
      let checked = 0;
      const bad = [];
      for (const area of areas) {
        const container = document.querySelector(area.selector);
        if (!container) continue;
        const wasHidden = container.classList.contains('hidden');
        if (wasHidden) container.classList.remove('hidden');
        for (const el of [container, ...container.querySelectorAll('*')]) {
          if (el.offsetWidth === 0 && el.offsetHeight === 0 && el.getClientRects().length === 0) continue;
          for (const tn of Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE)) {
            const raw = (tn.nodeValue || '').trim();
            if (raw) { checked++; if (keyPattern.test(raw)) bad.push({ area: area.name, text: raw }); }
          }
          for (const attr of ['placeholder', 'title']) {
            const v = el.getAttribute(attr);
            if (v && v.trim()) { checked++; if (keyPattern.test(v.trim())) bad.push({ area: area.name, text: v.trim(), attr }); }
          }
        }
        if (wasHidden) container.classList.add('hidden');
      }
      return { lang: l, checked, bad };
    }, lang, targetAreas);
    report(lr.bad.length === 0 ? 'PASS' : 'FAIL', `i18n [${lr.lang.toUpperCase()}]: ${lr.checked} Elemente geprüft, ${lr.bad.length} unübersetzte Schlüssel`,
      lr.bad.slice(0, 5).map(b => `${b.area}:"${b.text}"`).join(' | '));
  }
  await page.evaluate(() => { if (typeof window.setLanguage === 'function') window.setLanguage('de'); });

  await page.close();

  // =========================================================================
  // TEIL 2: Panel-Tests (frischer, isolierter Kontext), echte Mausklicks
  // =========================================================================
  console.log('\n[E2E] === Panel-Tests (echte Mausklicks) ===');

  /*
   * Mapping panelId -> Auslöser (Dokumentation).
   * Schlüssel = id des [data-stop-propagation]-Elements bzw. – bei Dialog-Karten ohne eigene id –
   * die id des nächsten Vorfahren mit id.
   *   actions:   data-action-Namen (auch in "a; b"-Ketten)
   *   args:      Teilstring, der in data-action-args vorkommen muss
   *   selectors: konkrete CSS-Selektoren
   *   keys:      Tastenkombination als letzter Fallback (nur wenn kein DOM-Auslöser existiert)
   */
  const PANEL_TRIGGERS = {
    'panel-header-tools':           { selectors: ['#btn-header-tools'], actions: ['togglePanel'], args: 'header-tools' },
    'panel-alarm':                  { selectors: ['#btn-header-alarm'], actions: ['toggleAlarmDropdown', 'openAlarmModal'] },
    'panel-timer-presets':          { selectors: ['#btn-timer-presets'], actions: ['toggleTimerPresets', 'toggleTimerPresetsDropdown'] },
    'panel-weather':                { selectors: ['#date-weather-badge'], actions: ['toggleWeatherDropdown'] },
    'panel-calendar-dropdown':      { selectors: ['#date-hover-wrapper'], actions: ['toggleCalendarDropdown'] },
    'panel-pause-dropdown':         { selectors: ['#header-btn-pause-container button'], actions: ['togglePanel'], args: 'pause-dropdown' },
    'panel-report':                 { selectors: ['#header-btn-report-container button'], actions: ['togglePanel'], args: 'report' },
    'panel-settings-dropdown':      { selectors: ['#header-btn-options-container button'], actions: ['togglePanel'], args: 'settings-dropdown' },
    'header-sound-volume-popover':  { selectors: ['#header-btn-sound-container', '#header-btn-sound-toggle'] },
    'dropdown-header-workspace':    { selectors: ['#btn-header-workspace'], actions: ['toggleHeaderWorkspaceDropdown'] },
    'dropdown-manage-tables':       { selectors: ['#btn-board-manage-tables'], actions: ['toggleManageTablesDropdown'] },
    'dropdown-manage-columns':      { selectors: ['#btn-board-columns'], actions: ['toggleColumnsDropdown'] },
    'ticker-settings-popover':      { selectors: ['#ticker-options-btn'], actions: ['RadioNewsEngine.toggleTickerSettingsDropdown'] },
    'popover-add-list':             { selectors: ['#btn-add-list-bottom'], actions: ['toggleAddListPopover'] },
    'modal-mobile-quick-menu':      { actions: ['openMobileQuickMenu'] },
    'helper-pick-card':             { actions: ['openHelperModal'], args: '"pick"' },
    'helper-sport-card':            { actions: ['openHelperModal'], args: '"sport"' },
    'helper-break-card':            { actions: ['openBreakModal'] },
    'modal-p2p-sync':               { actions: ['openP2PSyncModal'] },
    'modal-learning-hub':           { actions: ['openLearningHubModal'] },
    'modal-report-dashboard':       { actions: ['openReportDashboard'] },
    'modal-settings':               { actions: ['openSettingsModal'] },
    'modal-command-palette':        { actions: ['openCommandPalette'], keys: ['Control+k'] },
    'modal-keyboard-shortcuts':     { actions: ['openKeyboardShortcuts'], keys: ['?'] },
    'helper-steps-modal':           { actions: ['openHelperModal'], args: '"steps"' },
    'helper-cleaning-modal':        { actions: ['openHelperModal'], args: '"cleaning"' },
    'note-detail-modal':            { actions: ['openNoteDetailModal'] },
    'text-import-modal':            { actions: ['openTextImportModal'] },
    'modal-postpone-termin':        { actions: ['openPostponeTerminModal'] },
    'report-export-modal':          { actions: ['openReportExportModal'] },
    'clarity-modal':                { actions: ['openClarityModal'] },
    'modal-regulation':             { actions: ['openRegulationModal'] },
    'brainstorm-modal':             { selectors: ['#btn-header-brainstorm'], actions: ['openBrainstormModal'] },
    'sample-manager-modal':         { actions: ['openSampleManagerModal'] },
    'supermarket-modal':            { actions: ['openSupermarketModal'] },
    'feierabend-celebration-modal': { actions: ['openFeierabendModal'] },
    'modal-app-install':            { actions: ['openInstallModal'] },
    'privacy-legal-modal':          { actions: ['openPrivacyModal'] },
    'modal-undo-history':           { actions: ['openUndoHistoryModal'] },
    'modal-template-builder':       { actions: ['openTemplateBuilderModal'] }
  };
  // Menüs, die versteckte Auslöser enthalten können (werden nur per echtem Klick geöffnet)
  const PREREQUISITE_SELECTORS = [
    '#btn-header-tools',
    '[data-action="togglePanel"][data-action-args*="settings-dropdown"]',
    '#btn-header-workspace',
    '#btn-board-manage-tables',
    '#btn-dashboard-arrow-toggle'
  ];

  const RISKY = /(delete|remove|reset|clear|logout|log.?out|sign.?out|export|wipe|purge|erase|destroy|trash|löschen|lösch|zurücksetz|entfern|abmeld|exportier|supprim|elimin|cancella|διαγρ)/i;
  const NAV_OR_CLOSE = /^(close|dismiss|cancel|hide)|Modal$|Dropdown$|Popover$|^togglePanel$|^open[A-Z]|stopPropagation|preventDefault/;

  const ctx = await (browser.createBrowserContext ? browser.createBrowserContext() : browser.createIncognitoBrowserContext());
  const pp = await ctx.newPage();
  await pp.setViewport({ width: 1280, height: 800 });
  attachDiagnostics(pp);
  await pp.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitForApp(pp, 60000);
  await sleep(1000);
  await pp.evaluate(() => {
    try { if (typeof initAudioContext === 'function') initAudioContext(); } catch(e) {}
  });
  await injectHelpers(pp);

  async function reloadPanelPage() {
    await pp.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await waitForApp(pp, 25000);
    await sleep(500);
    await pp.evaluate(() => {
      try { if (typeof initAudioContext === 'function') initAudioContext(); } catch(e) {}
    });
    await injectHelpers(pp);
  }

  const panelInfos = await pp.evaluate(() => Array.from(document.querySelectorAll('[data-stop-propagation="true"]')).map((el, i) => {
    const host = el.id ? el : el.closest('[id]');
    return { index: i, key: host ? host.id : `panel-${i}` };
  }));
  console.log(`[E2E] ${panelInfos.length} Wrapper mit data-stop-propagation gefunden.`);

  const isOpen = idx => pp.evaluate(i => {
    const isVis = typeof window.__e2eVisible === 'function' ? window.__e2eVisible : (e => e && e.isConnected && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none');
    const el = document.querySelectorAll('[data-stop-propagation="true"]')[i];
    return !!el && isVis(el);
  }, idx);

  // Markiert sichtbare Kandidaten (data-e2e-cand = Laufnummer) und liefert deren Anzahl
  async function tagCandidates(spec) {
    return pp.evaluate(s => {
      const isVis = typeof window.__e2eVisible === 'function' ? window.__e2eVisible : (e => e && e.isConnected && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none');
      const out = [];
      const seen = new Set();
      const push = el => { if (el && !seen.has(el)) { seen.add(el); out.push(el); } };
      (s.selectors || []).forEach(sel => {
        try { document.querySelectorAll(sel).forEach(push); } catch(e) {}
      });
      if (s.actions && s.actions.length) {
        document.querySelectorAll('[data-action]').forEach(el => {
          const tokens = (el.getAttribute('data-action') || '').split(';').map(t => t.trim());
          if (!tokens.some(t => s.actions.includes(t))) return;
          if (s.args && !(el.getAttribute('data-action-args') || '').includes(s.args)) return;
          push(el);
        });
      }
      document.querySelectorAll('[data-e2e-cand]').forEach(x => x.removeAttribute('data-e2e-cand'));
      const vis = out.filter(isVis);
      vis.forEach((el, i) => el.setAttribute('data-e2e-cand', String(i)));
      return vis.length;
    }, spec);
  }

  async function resetUi() {
    await pp.keyboard.press('Escape').catch(() => {});
    await sleep(150);
    await pp.keyboard.press('Escape').catch(() => {});
    await sleep(250);
  }

  async function findEmptyPoint(panelIndex) {
    return pp.evaluate(idx => {
      const panelEl = document.querySelectorAll('[data-stop-propagation="true"]')[idx];
      const vw = window.innerWidth, vh = window.innerHeight;
      const isOverlay = e => e.classList && e.classList.contains('fixed') && e.classList.contains('inset-0');
      const interactive = el => {
        for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
          if (isOverlay(e)) return false;
          if (/^(A|BUTTON|INPUT|SELECT|TEXTAREA|LABEL|SUMMARY)$/.test(e.tagName)) return true;
          if (e.hasAttribute('data-action') && e.getAttribute('data-action') !== 'stopPropagation') return true;
          if (e.hasAttribute('onclick') || e.hasAttribute('tabindex') || e.hasAttribute('contenteditable')) return true;
        }
        return false;
      };
      const pts = [];
      for (let yi = 1; yi < 12; yi++) for (let xi = 1; xi < 16; xi++) pts.push([Math.round(vw * xi / 16), Math.round(vh * yi / 12)]);
      pts.unshift([6, vh - 6], [vw - 6, vh - 6], [6, Math.round(vh / 2)], [vw - 6, Math.round(vh / 2)]);
      for (const [x, y] of pts) {
        const el = document.elementFromPoint(x, y);
        if (!el) continue;
        if (panelEl && panelEl.contains(el)) continue;
        if (el.closest('[data-stop-propagation="true"]') && !isOverlay(el)) continue;
        if (interactive(el)) continue;
        return { x, y, tag: el.tagName + (el.id ? '#' + el.id : '') };
      }
      return null;
    }, panelIndex);
  }

  // ---- Zeitverhalten: Limits & Hilfsfunktionen ----
  const CLICK_LIMIT_MS = 3000;
  const PANEL_LIMIT_MS = 20000;
  let panelDeadline = Infinity;
  let pStats = { clicked: 0, skipped: 0, failed: 0 };
  const panelTimeUp = () => Date.now() > panelDeadline;
  const withTimeout = (promise, ms, label) => Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} > ${ms} ms`)), ms))
  ]);
  const skipBtn = (name, reason) => { report('ÜBERSPRUNGEN', name, reason); pStats.skipped++; };

  // Prüft vor jedem Klick: sichtbar, im Viewport, aktiv, pointer-events, nicht verdeckt
  async function checkClickable(pg, handle) {
    try {
      const box = await withTimeout(handle.boundingBox(), 2000, 'boundingBox');
      if (!box) return { ok: false, reason: 'boundingBox() = null (nicht sichtbar)' };
      return await withTimeout(handle.evaluate(el => {
        el.scrollIntoView({ block: 'center', inline: 'center' });
        const cs = getComputedStyle(el);
        if (el.disabled || el.getAttribute('aria-disabled') === 'true') return { ok: false, reason: 'deaktiviert' };
        if (cs.pointerEvents === 'none') return { ok: false, reason: 'pointer-events:none' };
        if (cs.visibility === 'hidden' || cs.display === 'none') return { ok: false, reason: 'unsichtbar' };
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return { ok: false, reason: 'Größe 0' };
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return { ok: false, reason: 'außerhalb des Viewports' };
        const top = document.elementFromPoint(x, y);
        if (!top) return { ok: false, reason: 'elementFromPoint = null' };
        if (top !== el && !el.contains(top) && !top.contains(el)) {
          return { ok: false, reason: `verdeckt von ${top.tagName}${top.id ? '#' + top.id : ''}` };
        }
        return { ok: true };
      }), 2000, 'Klickbarkeitsprüfung');
    } catch (e) {
      return { ok: false, reason: 'Prüfung fehlgeschlagen: ' + e.message.slice(0, 60) };
    }
  }
  // Geschützter Klick (max. 3 s); false bei nicht klickbar / Fehler
  async function guardedClick(pg, handle) {
    const c = await checkClickable(pg, handle);
    if (!c.ok) return false;
    try { await handle.click({ timeout: CLICK_LIMIT_MS }); return true; } catch (e) { return false; }
  }

  // Öffnet ein Panel ausschließlich per echtem Mausklick bzw. echter Taste
  async function openPanel(panelIndex, spec) {
    const attempt = async () => {
      const n = await tagCandidates(spec);
      for (let i = 0; i < n; i++) {
        if (panelTimeUp()) return null;
        const h = await pp.$(`[data-e2e-cand="${i}"]`);
        if (!h) continue;
        if (!(await guardedClick(pp, h))) continue;
        await sleep(350);
        if (await isOpen(panelIndex)) return `Klick auf Kandidat ${i + 1}/${n}`;
        await resetUi();
      }
      return null;
    };
    let via = await attempt();
    if (via) return { opened: true, via };
    for (const pre of PREREQUISITE_SELECTORS) {
      if (panelTimeUp()) break;
      if (!(await tagCandidates({ selectors: [pre] }))) continue;
      const hp = await pp.$('[data-e2e-cand="0"]');
      if (!hp) continue;
      if (!(await guardedClick(pp, hp))) continue;
      await sleep(350);
      if (await isOpen(panelIndex)) return { opened: true, via: `über ${pre}` };
      via = await attempt();
      if (via) return { opened: true, via: `${via} (nach ${pre})` };
      await resetUi();
    }
    for (const k of (spec.keys || [])) {
      if (panelTimeUp()) break;
      await resetUi();
      try { await pp.keyboard.press(k); } catch (e) { continue; }
      await sleep(350);
      if (await isOpen(panelIndex)) return { opened: true, via: `Taste ${k}` };
    }
    return { opened: false, via: '' };
  }

  // Fortschritt: eine Zeile pro Panel (wird beim Start des nächsten Panels bzw. am Ende ausgegeben)
  let currentPanel = null;
  const flushPanel = () => {
    if (!currentPanel) return;
    console.log(`Panel ${currentPanel.n}/${panelInfos.length} #${currentPanel.key}: ${pStats.clicked} Buttons geklickt, ${pStats.skipped} übersprungen`);
    currentPanel = null;
  };
  panelProgress.total = panelInfos.map(p => p.key);
  for (const info of panelInfos) {
    const { index, key } = info;
    if (Date.now() > RUN_DEADLINE) { break; }
    panelProgress.done = index;
    currentPanel = { n: index + 1, key };
    pStats = { clicked: 0, skipped: 0, failed: 0 };
    panelDeadline = Date.now() + PANEL_LIMIT_MS;
    const tag = `[${index + 1}/${panelInfos.length}] ${key}`;
    const spec = PANEL_TRIGGERS[key];
    if (!spec) {
      report('FAIL', `${tag}: Öffnen`, 'Kein Auslöser im Test-Mapping (PANEL_TRIGGERS) hinterlegt');
      continue;
    }
    let mobile = false;
    try {
      await resetUi();
      let opened = await openPanel(index, spec);
      if (!opened.opened) {
        // Mobile-only Auslöser: Viewport verkleinern und erneut versuchen
        await pp.setViewport({ width: 390, height: 844 });
        await sleep(500);
        await injectHelpers(pp);
        mobile = true;
        opened = await openPanel(index, spec);
      }
      if (!opened.opened) {
        if (mobile) { await pp.setViewport({ width: 1280, height: 800 }); await sleep(300); await injectHelpers(pp); mobile = false; }
        report('ÜBERSPRUNGEN', `${tag}: Öffnen`, 'Kein per echtem Klick/Taste erreichbarer Auslöser gefunden (Desktop + Mobil)');
        await resetUi();
        continue;
      }
      report('PASS', `${tag}: Öffnen`, opened.via + (mobile ? ' [Mobil-Viewport]' : ''));

      // ---- Buttons/Links im Panel ----
      const buttons = await pp.evaluate(idx => {
        const isVis = typeof window.__e2eVisible === 'function' ? window.__e2eVisible : (e => e && e.isConnected && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none');
        const panelEl = document.querySelectorAll('[data-stop-propagation="true"]')[idx];
        const sel = 'button[data-action], a[data-action], [role="button"][data-action], button[onclick], a[onclick], [role="button"][onclick]';
        const els = Array.from(panelEl.querySelectorAll(sel)).filter(isVis);
        document.querySelectorAll('[data-e2e-btn]').forEach(x => x.removeAttribute('data-e2e-btn'));
        return els.map((el, i) => {
          el.setAttribute('data-e2e-btn', String(i));
          return {
            i,
            action: el.getAttribute('data-action') || '',
            args: el.getAttribute('data-action-args') || '',
            inline: el.getAttribute('onclick') || '',
            label: ((el.innerText || '').trim() || el.title || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').slice(0, 40),
            title: el.title || '',
            disabled: !!el.disabled
          };
        });
      }, index);

      for (const b of buttons) {
        const name = `${tag}: Button "${b.label || b.action || b.inline.slice(0, 30)}" [${b.action || 'inline'}]`;
        const tokens = b.action.split(';').map(t => t.trim()).filter(Boolean);
        const hay = `${b.action} ${b.label} ${b.title} ${b.inline}`;
        if (panelTimeUp()) { report('FAIL', name, `Panel-Zeitlimit (${PANEL_LIMIT_MS / 1000} s) überschritten, restliche Buttons nicht geprüft`); pStats.failed++; break; }
        if (b.disabled) { skipBtn(name, 'deaktiviert'); continue; }
        if (RISKY.test(hay)) { skipBtn(name, 'riskante Aktion (Löschen/Reset/Logout/Export)'); continue; }
        if (tokens.some(t => NAV_OR_CLOSE.test(t))) { skipBtn(name, 'schließt/öffnet Panel oder Dialog (erwartetes Wechselverhalten)'); continue; }
        if (!b.action && b.inline) { skipBtn(name, 'Inline-Handler: kein Spy möglich'); continue; }

        // Panel wieder öffnen, falls eine vorherige Aktion es geschlossen hat
        let handleSel = `[data-e2e-btn="${b.i}"]`;
        if (!(await isOpen(index))) {
          await resetUi();
          const re = await openPanel(index, spec);
          if (!re.opened) { report('FAIL', name, 'Panel ließ sich nach vorheriger Aktion nicht erneut öffnen'); pStats.failed++; break; }
          const retag = await pp.evaluate((idx, wantAction, wantArgs) => {
            const isVis = typeof window.__e2eVisible === 'function' ? window.__e2eVisible : (e => e && e.isConnected && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none');
            const panelEl = document.querySelectorAll('[data-stop-propagation="true"]')[idx];
            const el = Array.from(panelEl.querySelectorAll('[data-action]'))
              .find(e => e.getAttribute('data-action') === wantAction && (e.getAttribute('data-action-args') || '') === wantArgs && isVis(e));
            document.querySelectorAll('[data-e2e-btn]').forEach(x => x.removeAttribute('data-e2e-btn'));
            if (!el) return false;
            el.setAttribute('data-e2e-btn', 'again');
            return true;
          }, index, b.action, b.args);
          if (!retag) { skipBtn(name, 'Element nach erneutem Öffnen nicht mehr vorhanden'); continue; }
          handleSel = '[data-e2e-btn="again"]';
        }
        const handle = await pp.$(handleSel);
        if (!handle) { skipBtn(name, 'Element nach Re-Render nicht mehr vorhanden'); continue; }

        // Klickbarkeit prüfen (sichtbar, im Viewport, aktiv, nicht verdeckt)
        const clickable = await checkClickable(pp, handle);
        if (!clickable.ok) { skipBtn(name, 'nicht klickbar: ' + clickable.reason); continue; }

        // Spy: Funktion wird durchgereicht, der Seiteneffekt bleibt echt
        const spyState = await pp.evaluate(actionName => {
          const parts = actionName.split(';')[0].trim().split('.');
          let parent = window, obj = window;
          for (const p of parts) { parent = obj; obj = obj ? obj[p] : undefined; }
          const fnName = parts[parts.length - 1];
          if (typeof obj !== 'function' || !parent) return 'none';
          const original = parent[fnName];
          window.__e2eSpy = { count: 0, restore: () => { parent[fnName] = original; } };
          parent[fnName] = function (...a) { window.__e2eSpy.count++; return original.apply(this, a); };
          return 'ok';
        }, b.action);

        let clickErr = null;
        try { await handle.click({ timeout: CLICK_LIMIT_MS }); } catch (e) { clickErr = e.message; }
        await sleep(250);
        const count = await pp.evaluate(() => {
          const s = window.__e2eSpy;
          if (!s) return null;
          const c = s.count; s.restore(); window.__e2eSpy = null; return c;
        });
        if (clickErr) { report('FAIL', name, 'Klick fehlgeschlagen: ' + clickErr.slice(0, 80)); pStats.failed++; continue; }
        const stillOpen = await isOpen(index);
        const onceOk = spyState === 'ok' ? count === 1 : true;
        const spyNote = spyState === 'ok' ? `Aktion ${count}x` : 'Aktion nicht auf window (kein Spy)';
        pStats.clicked++;
        if (onceOk && stillOpen) report('PASS', name, `${spyNote}, Panel bleibt offen`);
        else { report('FAIL', name, `${spyNote}${stillOpen ? '' : ', Panel schloss sich'}`); pStats.failed++; }
      }
      if (buttons.length === 0) report('ÜBERSPRUNGEN', `${tag}: Buttons`, 'keine sichtbaren Buttons mit data-action/onclick');

      // ---- Klick außerhalb: echter Mausklick auf leere Fläche, Panel MUSS schließen ----
      if (!(await isOpen(index))) { await resetUi(); await openPanel(index, spec); }
      const pt = await findEmptyPoint(index);
      if (!pt) {
        report('FAIL', `${tag}: Klick außerhalb`, 'Keine leere Fläche außerhalb des Panels gefunden');
        pStats.failed++;
      } else {
        try {
          await withTimeout(pp.mouse.click(pt.x, pt.y), CLICK_LIMIT_MS, 'Mausklick');
          await sleep(700);
          const closed = !(await isOpen(index));
          report(closed ? 'PASS' : 'FAIL', `${tag}: Klick außerhalb`, `Mausklick auf ${pt.tag} (${pt.x},${pt.y}) -> Panel ${closed ? 'geschlossen' : 'BLEIBT OFFEN'}`);
          if (!closed) pStats.failed++;
        } catch (e) {
          report('FAIL', `${tag}: Klick außerhalb`, 'Mausklick fehlgeschlagen: ' + e.message.slice(0, 80));
          pStats.failed++;
        }
      }
      if (mobile) { await pp.setViewport({ width: 1280, height: 800 }); await sleep(400); await injectHelpers(pp); mobile = false; }
      await resetUi();
      if (await isOpen(index)) await reloadPanelPage();
    } catch (e) {
      report('FAIL', `${tag}: Testlauf`, e.message.slice(0, 120));
      pStats.failed++;
      try { await pp.setViewport({ width: 1280, height: 800 }); await reloadPanelPage(); } catch (e2) { /* ignorieren */ }
    } finally {
      flushPanel();
    }
  }
  if (Date.now() > RUN_DEADLINE) abortRun('Gesamtlimit 5 min überschritten');
  await pp.close();
  await ctx.close();

  // =========================================================================
  // JS-/CSP-Fehler
  // =========================================================================
  console.log('\n[E2E] === Konsole & CSP ===');
  const jsErrors = consoleErrors.filter(err => !/Failed to load resource|net::ERR_|404|favicon|status of 404|blocked by CORS policy|fetch at/i.test(err));
  report(jsErrors.length === 0 ? 'PASS' : 'FAIL', 'JS-Fehler (außer fehlenden Assets)', `${jsErrors.length}`);
  jsErrors.slice(0, 15).forEach(e => console.error('   -> ' + e.slice(0, 200)));
  report(cspErrors.length === 0 ? 'PASS' : 'FAIL', 'CSP-Verletzungen', `${cspErrors.length}`);
  cspErrors.slice(0, 10).forEach(e => console.error('   -> CSP: ' + e.slice(0, 200)));

} finally {
  await browser.close();
  server.close();
}

// ---------------------------------------------------------------------------
// Zusammenfassung / Exit-Code
// ---------------------------------------------------------------------------
const count = s => results.filter(r => r.status === s).length;
const fails = results.filter(r => r.status === 'FAIL');
console.log('\n====================================================');
console.log(`GESAMT: ${count('PASS')} PASS | ${fails.length} FAIL | ${count('ÜBERSPRUNGEN')} ÜBERSPRUNGEN`);
console.log(`- Gesamtdauer: ${((Date.now() - RUN_START) / 1000).toFixed(1)} s`);
console.log(`- Initial geladene JS-Größe: ${(initialJsBytes / 1024).toFixed(2)} KB`);
console.log(`- Time to Interactive (TTI): ${ttiMs} ms`);
if (fails.length) {
  console.log('\nFEHLER (nicht behoben, nur gemeldet):');
  fails.forEach(f => console.log(` - ${f.name}${f.detail ? ' -- ' + f.detail : ''}`));
}
console.log('====================================================\n');
process.exit(fails.length > 0 ? 1 : 0);
