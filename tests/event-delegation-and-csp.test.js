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
});
