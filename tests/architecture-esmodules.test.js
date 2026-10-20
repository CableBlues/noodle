/**
 * @file tests/architecture-esmodules.test.js
 * @description
 * Verhaltens- und Regressionstests für Phase 4: Architektur A (ES-Module & Altlasten-Bereinigung):
 * 1. Zentrale main.js als ES-Modul-Einstiegspunkt
 * 2. Lückenlose Modul-Pipeline
 * 3. Window-Kompatibilitätsschicht
 * 4. Saubere Umschaltung in dist/index.html auf app.bundle.js
 * 5. Vollständige Bereinigung verwaister Dateien
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 4: Architecture A - ES-Modules & Cleanup', () => {
  const rootDir = path.resolve(__dirname, '..');
  const distDir = path.join(rootDir, 'dist');

  it('main.js existiert und importiert alle Kern- und Fachmodule lückenlos', () => {
    const mainPath = path.join(rootDir, 'main.js');
    expect(fs.existsSync(mainPath)).toBe(true);

    const mainContent = fs.readFileSync(mainPath, 'utf8');

    const expectedModules = [
      'data-tasks.js',
      'data-translations.js',
      'config.js',
      'auth-engine.js',
      'storage.js',
      'state.js',
      'crypto-sync.js',
      'sync-engine.js',
      'collab-engine.js',
      'utils.js',
      'audio-core.js',
      'audio-player.js',
      'timer-1.js',
      'sport.js',
      'app-interaction-mode.js',
      'helper-ocr-scanner.js',
      'app-regulation.js',
      'app-health.js',
      'app-humor.js',
      'app-shopping.js',
      'app-cooking.js',
      'app-alarm.js',
      'app-tasks.js',
      'app-reports.js',
      'app-weather-news.js',
      'app-radio-news.js',
      'app-dice.js',
      'app-command-palette.js',
      'app-routine-presets.js',
      'app-feature-bridge.js',
      'app-multitasking-hub.js',
      'app-installation-hub.js',
      'onboarding.js',
      'monetization.js',
      'app-feedback.js',
      'app-tooltip.js',
      'app-social.js',
      'app-backup.js',
      'app-core.js'
    ];

    expectedModules.forEach(mod => {
      expect(mainContent, `Modul fehlt in main.js: ${mod}`).toContain(`'./${mod}'`);
    });
  });

  it('main.js definiert eine verlässliche Window-Kompatibilitätsschicht', () => {
    const mainPath = path.join(rootDir, 'main.js');
    const mainContent = fs.readFileSync(mainPath, 'utf8');

    expect(mainContent).toContain('initWindowCompatibilityLayer');
    expect(mainContent).toContain('w.state = state');
    expect(mainContent).toContain('w.saveState = saveState');
    expect(mainContent).toContain('w.renderApp = renderApp');
    expect(mainContent).toContain('w.cloudSyncEngine = cloudSyncEngine');
    expect(mainContent).toContain('w.CollabEngine = CollabEngine');
    expect(mainContent).toContain('w.togglePanel = togglePanel');
  });

  it('index.html bindet main.js als ES-Modul ein (<script type="module" src="main.js">)', () => {
    const htmlPath = path.join(rootDir, 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    expect(html).toContain('<script type="module" src="main.js"></script>');
    // Die 59 ungebündelten Skripte wurden durch das Modul abgelöst
    expect(html).not.toContain('<script src="data-tasks-steps-1.js"></script>');
    expect(html).not.toContain('<script src="app-core.js"></script>');
  });

  it('dist/index.html ersetzt das main.js-Modul durch app.bundle.js', () => {
    const distHtmlPath = path.join(distDir, 'index.html');
    expect(fs.existsSync(distHtmlPath)).toBe(true);

    const distHtml = fs.readFileSync(distHtmlPath, 'utf8');
    expect(distHtml).toContain('<script src="app.bundle.js"></script>');
    expect(distHtml).not.toContain('<script type="module" src="main.js"></script>');
  });

  it('Tote Dateien und Altlasten (projekt_code.txt, bundle.bat, apply-update.bat) wurden vollständig entfernt', () => {
    const legacyFiles = [
      'projekt_code.txt',
      'bundle.bat',
      'apply-update.bat'
    ];

    legacyFiles.forEach(file => {
      const filePath = path.join(rootDir, file);
      expect(fs.existsSync(filePath), `Altlast ${file} sollte nicht mehr existieren`).toBe(false);
    });
  });
});
