import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Production code dependencies
import '../utils.js';
import '../app-backup.js';

describe('Phase 5 Architecture B: Event Delegation, CSP & Monolith-Aufteilung', () => {
  const rootDir = path.resolve(__dirname, '..');

  it('index.html beinhaltet eine strikte Content Security Policy (CSP)', () => {
    const htmlPath = path.join(rootDir, 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    expect(html).toContain('http-equiv="Content-Security-Policy"');
    expect(html).toContain("default-src 'self'");
    expect(html).toContain("object-src 'none'");
    expect(html).toContain("base-uri 'self'");
    expect(html).toContain('https://cloud.umami.is');
  });

  it('utils.js stellt dispatchAction bereit und delegates data-action Events', () => {
    expect(typeof window.dispatchAction).toBe('function');

    let triggered = false;
    window.testSampleAction = (arg) => {
      triggered = arg;
    };

    const res = window.dispatchAction('testSampleAction', ['hello_noodle']);
    expect(res).toBe(true);
    expect(triggered).toBe('hello_noodle');
  });

  it('Built-in Action Registry in dispatchAction steuert Kernfunktionen sauber an', () => {
    let panelToggled = null;
    window.togglePanel = (name) => {
      panelToggled = name;
    };

    const handled = window.dispatchAction('togglePanel', ['header-tools']);
    expect(handled).toBe(true);
    expect(panelToggled).toBe('header-tools');
  });

  it('DOM Click auf Element mit [data-action] ruft registrierte Aktion auf', () => {
    let shoppingTabOpened = null;
    window.switchShoppingTab = (tab) => {
      shoppingTabOpened = tab;
    };

    const btn = document.createElement('button');
    btn.setAttribute('data-action', 'switchShoppingTab');
    btn.setAttribute('data-action-args', '["deals"]');
    document.body.appendChild(btn);

    btn.click();
    expect(shoppingTabOpened).toBe('deals');

    btn.remove();
  });

  describe('Verhaltensgleiches Event-Bubbling & StopPropagation', () => {
    it('(a) Kind- und Eltern-Element mit data-action: beide feuern in aufsteigender Reihenfolge', () => {
      const calls = [];
      window.testParentAction = () => {
        calls.push('parent');
      };
      window.testChildAction = () => {
        calls.push('child');
      };

      const parentEl = document.createElement('div');
      parentEl.setAttribute('data-action', 'testParentAction');

      const childEl = document.createElement('button');
      childEl.setAttribute('data-action', 'testChildAction');

      parentEl.appendChild(childEl);
      document.body.appendChild(parentEl);

      childEl.click();

      expect(calls).toEqual(['child', 'parent']);

      parentEl.remove();
    });

    it('(b) Kind ruft stopPropagation auf: Eltern-Element darf nicht feuern', () => {
      const calls = [];
      window.testParentAction = () => {
        calls.push('parent');
      };
      window.testChildActionStop = (e) => {
        calls.push('child');
        if (e && e.stopPropagation) e.stopPropagation();
      };

      const parentEl = document.createElement('div');
      parentEl.setAttribute('data-action', 'testParentAction');

      const childEl = document.createElement('button');
      childEl.setAttribute('data-action', 'testChildActionStop');
      childEl.setAttribute('data-action-args', '["$event"]');

      parentEl.appendChild(childEl);
      document.body.appendChild(parentEl);

      childEl.click();

      expect(calls).toEqual(['child']);

      parentEl.remove();
    });

    it('(c) Klick innerhalb eines Panels mit data-stop-propagation="true" löst keinen document-Klick-Handler aus', () => {
      let documentHandlerRan = false;
      const docListener = () => {
        documentHandlerRan = true;
      };
      document.addEventListener('click', docListener);

      const panel = document.createElement('div');
      panel.setAttribute('data-action', 'stopPropagation');
      panel.setAttribute('data-stop-propagation', 'true');

      const innerBtn = document.createElement('button');
      innerBtn.textContent = 'Inner Button';
      panel.appendChild(innerBtn);
      document.body.appendChild(panel);

      if (typeof window.initStopPropagationWrappers === 'function') {
        window.initStopPropagationWrappers();
      }

      innerBtn.click();

      document.removeEventListener('click', docListener);
      panel.remove();

      expect(documentHandlerRan).toBe(false);
    });

    it('(d) Button mit data-action innerhalb eines stop-propagation-Wrappers führt Zielfunktion genau einmal aus', () => {
      let callCount = 0;
      window.testWrapperAction = () => {
        callCount++;
      };

      const panel = document.createElement('div');
      panel.setAttribute('data-stop-propagation', 'true');

      const actionBtn = document.createElement('button');
      actionBtn.setAttribute('data-action', 'testWrapperAction');
      actionBtn.textContent = 'Action Inside Wrapper';
      panel.appendChild(actionBtn);
      document.body.appendChild(panel);

      if (typeof window.initStopPropagationWrappers === 'function') {
        window.initStopPropagationWrappers();
      }

      actionBtn.click();

      expect(callCount).toBe(1);
      panel.remove();
    });

    it('(e) Inline-onclick Button innerhalb eines stop-propagation-Wrappers feuert genau einmal', () => {
      let onclickCount = 0;
      window.testInlineOnclick = () => {
        onclickCount++;
      };

      const panel = document.createElement('div');
      panel.setAttribute('data-stop-propagation', 'true');

      const inlineBtn = document.createElement('button');
      inlineBtn.onclick = () => window.testInlineOnclick();
      inlineBtn.textContent = 'Inline Onclick Inside Wrapper';
      panel.appendChild(inlineBtn);
      document.body.appendChild(panel);

      if (typeof window.initStopPropagationWrappers === 'function') {
        window.initStopPropagationWrappers();
      }

      inlineBtn.click();

      expect(onclickCount).toBe(1);
      panel.remove();
    });
  });

  it('Monolith-Aufteilung: app-core.js liegt unter 2000 Zeilen und app-backup.js ist modularisiert', () => {
    const appCorePath = path.join(rootDir, 'app-core.js');
    const appCoreLines = fs.readFileSync(appCorePath, 'utf8').split('\n').length;

    expect(appCoreLines).toBeLessThan(2000);

    const appBackupPath = path.join(rootDir, 'app-backup.js');
    expect(fs.existsSync(appBackupPath)).toBe(true);
    const backupContent = fs.readFileSync(appBackupPath, 'utf8');
    expect(backupContent).toContain('downloadFullBackup');
    expect(backupContent).toContain('handleRestoreBackupFile');
  });

  it('Pflicht-Absicherungstest: Jedes migrierte Element ruft via dispatchAction exakt dieselbe Funktion mit denselben Argumenten auf wie der ursprüngliche onclick-Ausdruck', () => {
    const baselinePath = path.join(rootDir, 'scripts', 'onclick-baseline.json');
    expect(fs.existsSync(baselinePath)).toBe(true);
    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    expect(baseline.length).toBeGreaterThan(0);

    const dummyEvent = { type: 'click', stopPropagation: vi.fn(), preventDefault: vi.fn() };
    const dummyElement = document.createElement('button');

    baseline.forEach((item) => {
      const { dataAction, dataActionArgs, calls, originalOnclick } = item;
      const expectedCalls = [];
      const actualDispatchCalls = [];

      // 1. Spies für Original onclick aufsetzen
      calls.forEach((c) => {
        const spyFn = (...args) => {
          expectedCalls.push({ actionName: c.actionName, args });
        };

        if (c.actionName.includes('.')) {
          const parts = c.actionName.split('.');
          let obj = window;
          for (let j = 0; j < parts.length - 1; j++) {
            if (!obj[parts[j]]) obj[parts[j]] = {};
            obj = obj[parts[j]];
          }
          obj[parts[parts.length - 1]] = spyFn;
        } else {
          window[c.actionName] = spyFn;
        }
      });

      // Original onclick ausführen
      const fnOriginal = new Function('event', 'window', 'with(window){ ' + originalOnclick + ' }');
      fnOriginal.call(dummyElement, dummyEvent, window);

      // 2. Spies für dispatchAction aufsetzen
      calls.forEach((c) => {
        const spyFn = function(...args) {
          actualDispatchCalls.push({ actionName: c.actionName, args, thisObj: this });
        };

        if (c.actionName.includes('.')) {
          const parts = c.actionName.split('.');
          let obj = window;
          for (let j = 0; j < parts.length - 1; j++) {
            if (!obj[parts[j]]) obj[parts[j]] = {};
            obj = obj[parts[j]];
          }
          obj[parts[parts.length - 1]] = spyFn;
        } else {
          window[c.actionName] = spyFn;
        }
      });

      // dispatchAction ausführen
      const parsedArgs = dataActionArgs ? JSON.parse(dataActionArgs) : [];
      window.dispatchAction(dataAction, parsedArgs, dummyEvent, dummyElement);

      // 3. Vergleichen: Exakt gleiche Funktion, gleiche Argumente, gleiche Reihenfolge
      expect(actualDispatchCalls.length).toBe(expectedCalls.length);
      for (let k = 0; k < expectedCalls.length; k++) {
        expect(actualDispatchCalls[k].actionName).toBe(expectedCalls[k].actionName);
        expect(actualDispatchCalls[k].args).toEqual(expectedCalls[k].args);
      }
    });
  });

  it('Pflicht-Absicherungstest: Jede in data-action genannte Funktion existiert in einer der JS-Dateien', () => {
    const htmlPath = path.join(rootDir, 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    const dataActionRegex = /data-action\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
    const actionNames = new Set();
    let m;
    while ((m = dataActionRegex.exec(html)) !== null) {
      const val = m[1] !== undefined ? m[1] : m[2];
      val.split(';').map(s => s.trim()).filter(Boolean).forEach(p => actionNames.add(p));
    }

    expect(actionNames.size).toBeGreaterThan(0);

    const jsFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.js') && !f.includes('.config.') && f !== 'sw.js');
    let combinedJs = '';
    for (const f of jsFiles) {
      combinedJs += '\n' + fs.readFileSync(path.join(rootDir, f), 'utf8');
    }

    const missingActions = [];
    for (const action of actionNames) {
      if (action === 'stopPropagation') continue; // In utils.js dispatchAction eingebaut
      let found = false;
      if (action.includes('.')) {
        const [obj, method] = action.split('.');
        if (combinedJs.includes(obj) && combinedJs.includes(method)) {
          found = true;
        }
      } else {
        const patterns = [
          new RegExp(`function\\s+${action}\\b`),
          new RegExp(`(?:window|globalThis)\\.${action}\\s*=`),
          new RegExp(`(?:const|let|var)\\s+${action}\\s*=`),
          new RegExp(`\\b${action}\\s*:`)
        ];
        if (patterns.some(p => p.test(combinedJs))) {
          found = true;
        }
      }
      if (!found) {
        missingActions.push(action);
      }
    }

    expect(missingActions).toEqual([]);
  });
});

