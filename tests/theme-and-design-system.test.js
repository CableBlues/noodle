import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Design-System & Theme-Konsistenz (Schritt 2)', () => {
  const base1Path = path.resolve(__dirname, '../styles-base-1.css');
  const base2Path = path.resolve(__dirname, '../styles-base-2.css');
  const indexPath = path.resolve(__dirname, '../index.html');
  const appCorePath = path.resolve(__dirname, '../app-core.js');
  const mobilePath = path.resolve(__dirname, '../styles-mobile.css');

  const cssBase1 = fs.readFileSync(base1Path, 'utf8');
  const cssBase2 = fs.readFileSync(base2Path, 'utf8');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  const appCoreCode = fs.readFileSync(appCorePath, 'utf8');
  const cssMobile = fs.readFileSync(mobilePath, 'utf8');

  describe('1. Theme-Definitionen und CSS Custom Properties', () => {
    const ALL_23_THEMES = [
      'aurora', 'obsidian', 'lavender', 'botanical', 'sage', 'matrix',
      'latte', 'sand', 'sunset', 'honey', 'candlelight', 'peach',
      'sakura', 'ruby', 'cyberpunk', 'ocean', 'fjord', 'cobalt',
      'syntax', 'code-night', 'zen', 'fruity-classic', 'fruity-studio'
    ];

    it('sollte alle 23 Themes in styles-base-1.css definieren', () => {
      ALL_23_THEMES.forEach(theme => {
        const themeSelectorRegex = new RegExp(`body\\.theme-${theme}[\\s,{]`);
        expect(themeSelectorRegex.test(cssBase1), `Theme ${theme} muss definiert sein`).toBe(true);
      });
    });

    it('sollte für jedes Theme fundamentale CSS-Tokens bereitstellen', () => {
      const requiredTokens = ['--accent', '--bg-app', '--bg-card', '--bg-modal', '--text-main', '--border-main'];
      ALL_23_THEMES.forEach(theme => {
        // Find matching block
        const blockMatch = cssBase1.match(new RegExp(`body\\.theme-${theme}[^{]*\\{([^}]+)\\}`, 'g'));
        expect(blockMatch, `Block für ${theme} gefunden`).toBeTruthy();
        const combinedBlock = blockMatch.join(' ');
        requiredTokens.forEach(token => {
          expect(combinedBlock.includes(token), `Theme ${theme} muss Token ${token} definieren`).toBe(true);
        });
      });
    });

    it('sollte in :root alle Standard-Fallbacks vorhalten', () => {
      expect(cssBase1).toContain('--accent:');
      expect(cssBase1).toContain('--bg-app:');
      expect(cssBase1).toContain('--bg-header:');
      expect(cssBase1).toContain('--bg-card:');
      expect(cssBase1).toContain('--bg-modal:');
      expect(cssBase1).toContain('--text-main:');
      expect(cssBase1).toContain('--border-main:');
    });
  });

  describe('2. Oberflächen-Design-System (Surfaces)', () => {
    it('sollte modulare Oberflächenklassen in styles-base-2.css definieren', () => {
      expect(cssBase2).toContain('.theme-surface-modal');
      expect(cssBase2).toContain('.theme-surface-card');
      expect(cssBase2).toContain('.theme-surface-subcard');
      expect(cssBase2).toContain('.theme-surface-panel');
      expect(cssBase2).toContain('.theme-surface-header');
      expect(cssBase2).toContain('.theme-surface-input');
    });

    it('sollte Oberflächen-Klassen an CSS-Variablen binden', () => {
      expect(cssBase2).toContain('var(--bg-modal');
      expect(cssBase2).toContain('var(--bg-card');
      expect(cssBase2).toContain('var(--bg-panel');
      expect(cssBase2).toContain('var(--bg-header');
      expect(cssBase2).toContain('var(--text-main');
    });

    it('sollte alle Panels inklusive humor-lab und social in modal/popover-Regeln einschließen', () => {
      expect(cssBase1).toContain('#panel-humor-lab');
      expect(cssBase1).toContain('#panel-social');
      expect(cssBase1).toContain('.theme-surface-modal');
    });
  });

  describe('3. Standardisiertes Button-Design-System', () => {
    it('sollte die vier semantischen Button-Klassen und Basisklasse bereitstellen', () => {
      expect(cssBase2).toContain('.btn-primary');
      expect(cssBase2).toContain('.btn-secondary');
      expect(cssBase2).toContain('.btn-ghost');
      expect(cssBase2).toContain('.btn-danger');
      expect(cssBase2).toContain('.btn-noodle-base');
    });

    it('sollte den Primary-Button an --accent koppeln und dunklen Text für Barrierefreiheit nutzen', () => {
      const primaryIndex = cssBase2.indexOf('.btn-primary {');
      expect(primaryIndex).toBeGreaterThan(-1);
      const primaryBlock = cssBase2.slice(primaryIndex, primaryIndex + 350);
      expect(primaryBlock).toContain('var(--accent)');
      expect(primaryBlock).toContain('#0b1118'); // Kontrastreicher Text auf hellem Pastell/Neon
    });

    it('sollte Danger-Buttons mit gedämpftem Rot-Ton für destruktive Aktionen bereitstellen', () => {
      const dangerRuleMatch = cssBase2.match(/\.btn-danger\s*\{[^}]*background-color:[^}]+\}/);
      expect(dangerRuleMatch).toBeTruthy();
      expect(dangerRuleMatch[0]).toContain('239, 68, 68'); // Tailwind red-500 Basis
    });

    it('sollte Standardrundung rounded-xl (0.75rem) für Buttons verwenden', () => {
      expect(cssBase2).toContain('border-radius: 0.75rem;');
    });

    it('sollte Button-Größenmodifikatoren (btn-sm, btn-md, btn-lg) anbieten', () => {
      expect(cssBase2).toContain('.btn-sm');
      expect(cssBase2).toContain('.btn-md');
      expect(cssBase2).toContain('.btn-lg');
    });
  });

  describe('4. Beibehaltene Ausnahmen & Intentional Dark Surfaces', () => {
    it('sollte Medien-, Vinyl- und Visualizer-Oberflächen gezielt dunkel halten', () => {
      expect(cssBase2).toContain('.intentional-dark-surface');
      expect(cssBase2).toContain('.dj-vinyl-pro');
      expect(cssBase2).toContain('#audio-visualizer-canvas');
      expect(cssBase2).toContain('#spectrum-canvas');
    });
  });

  describe('5. Integration in index.html & Barrierefreiheit', () => {
    it('sollte theme-surface-modal auf zentralen Dialogen verwenden', () => {
      expect(indexHtml).toContain('theme-surface-modal relative w-full max-w-3xl rounded-3xl'); // modal-settings
      expect(indexHtml).toContain('theme-surface-modal relative w-full max-w-xl rounded-2xl'); // modal-command-palette
      expect(indexHtml).toContain('theme-surface-modal rounded-3xl max-w-2xl w-full'); // supermarket-modal
    });

    it('sollte die 5 in Schritt 3 ausgewählten Komponenten auf das Designsystem migriert haben', () => {
      // 1. modal-keyboard-shortcuts
      expect(indexHtml).toContain('theme-surface-modal relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col p-5');
      expect(indexHtml).toContain('theme-surface-subcard flex items-center justify-between p-2 rounded-xl');

      // 2. note-detail-modal
      expect(indexHtml).toContain('theme-surface-modal mobile-modal-card animate-spring-modal w-full max-w-lg p-6 rounded-3xl shadow-2xl backdrop-blur-xl relative transition-all duration-300');
      expect(indexHtml).toContain('theme-surface-input w-full p-3.5 rounded-xl text-xs text-amber-100 outline-none font-medium leading-relaxed resize-none shadow-inner');

      // 3. text-import-modal
      expect(indexHtml).toContain('theme-surface-modal mobile-modal-card animate-spring-modal w-full max-w-lg p-6 rounded-3xl shadow-2xl backdrop-blur-xl relative transition-all duration-300');
      expect(indexHtml).toContain('theme-surface-input w-full p-3 rounded-xl text-xs text-gray-200 outline-none font-medium leading-relaxed resize-none');

      // 4. modal-postpone-termin
      expect(indexHtml).toContain('theme-surface-modal mobile-modal-card animate-spring-modal w-full max-w-md p-5 sm:p-6 rounded-3xl shadow-2xl backdrop-blur-xl relative transition-all duration-300 space-y-4');

      // 5. helper-safespace-modal
      expect(indexHtml).toContain('theme-surface-modal rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative flex flex-col gap-4 max-h-[92vh] overflow-y-auto');
    });

    it('sollte die 5 in Schritt 4 ausgewählten Komponenten auf das Designsystem migriert haben', () => {
      // 1. modal-learning-hub
      expect(indexHtml).toContain('theme-surface-modal relative w-full max-w-4xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto');

      // 2. modal-report-dashboard
      expect(indexHtml).toContain('theme-surface-modal relative w-full max-w-4xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto custom-scrollbar');
      expect(indexHtml).toContain('btn-secondary px-3.5 py-2 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5');
      expect(indexHtml).toContain('btn-primary px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95');

      // 3. modal-regulation
      expect(indexHtml).toContain('theme-surface-modal rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative text-white flex flex-col gap-4 max-h-[92vh] overflow-y-auto');

      // 4. brainstorm-modal
      expect(indexHtml).toContain('theme-surface-modal rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative text-white flex flex-col gap-4 max-h-[92vh] overflow-hidden');
      expect(indexHtml).toContain('theme-surface-input text-xs font-bold text-teal-300 rounded-xl px-2 py-2 outline-none cursor-pointer');
      expect(indexHtml).toContain('theme-surface-input w-full py-1 px-2.5 rounded-xl text-xs text-white placeholder:text-gray-500 outline-none');

      // 5. privacy-legal-modal
      expect(indexHtml).toContain('theme-surface-modal w-full max-w-xl p-5 sm:p-6 rounded-3xl shadow-2xl backdrop-blur-2xl text-white flex flex-col gap-4 max-h-[88vh] overflow-y-auto');
    });

    it('sollte die 5 in Schritt 5 ausgewählten Komponenten auf das Designsystem migriert haben', () => {
      // 1. helper-pick-modal
      expect(indexHtml).toContain('theme-surface-modal mobile-modal-card animate-spring-modal rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative text-white flex flex-col gap-4 max-h-[92vh] overflow-hidden text-left');
      expect(indexHtml).toContain('id="helper-pick-refresh-header" data-action="pickRandomTask" class="btn-secondary');
      expect(indexHtml).toContain('id="helper-pick-next-btn" data-action="pickRandomTask" class="btn-secondary');

      // 2. helper-break-modal
      expect(indexHtml).toContain('theme-surface-modal mobile-modal-card animate-spring-modal w-full max-w-md p-6 rounded-2xl shadow-2xl backdrop-blur-xl text-white relative transition-all duration-300');
      expect(indexHtml).toContain('id="break-toggle-btn" data-action="toggleBreakTimer" class="btn-primary');

      // 3. helper-steps-modal
      expect(indexHtml).toContain('theme-surface-modal mobile-modal-card animate-spring-modal w-full max-w-xl sm:max-w-2xl max-h-[92vh] flex flex-col p-5 sm:p-6 rounded-3xl shadow-2xl backdrop-blur-2xl text-white relative transition-all duration-300');
      expect(indexHtml).toContain('id="helper-task-select" data-change="onHelperSelectTask" class="theme-surface-input');
      expect(indexHtml).toContain('id="helper-new-step-input" placeholder="Eigenen Teilschritt eingeben (Enter)..." data-keydown="submitOnEnter" data-keydown-args=\'["$event","addCustomStepToActiveTask"]\' class="theme-surface-input');

      // 4. modal-undo-history
      expect(indexHtml).toContain('theme-surface-modal rounded-3xl max-w-xl sm:max-w-2xl w-full p-4 sm:p-5 shadow-2xl relative text-white flex flex-col gap-3.5 max-h-[88vh] overflow-hidden');

      // 5. modal-template-builder
      expect(indexHtml).toContain('theme-surface-modal rounded-3xl max-w-xl w-full p-4 sm:p-5 shadow-2xl relative text-white flex flex-col gap-3.5 max-h-[88vh] overflow-hidden');
      expect(indexHtml).toContain('id="template-builder-custom-input" type="text" placeholder="Aufgabenname eingeben..." class="theme-surface-input');
    });

    it('sollte die 5 in Schritt 6 ausgewählten Komponenten auf das Designsystem migriert haben', () => {
      // 1. report-export-modal
      expect(indexHtml).toContain('theme-surface-modal mobile-modal-card animate-spring-modal w-full max-w-2xl p-6 rounded-2xl shadow-2xl backdrop-blur-xl text-white relative transition-all duration-300');
      expect(indexHtml).toContain('id="report-export-text-area" rows="12" readonly class="theme-surface-input w-full p-4 rounded-xl text-xs font-mono');
      expect(indexHtml).toContain('data-action="copyReportText" class="btn-primary px-4 py-2 font-bold text-xs shadow-sm');

      // 2. feierabend-celebration-modal
      expect(indexHtml).toContain('theme-surface-modal p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl relative flex flex-col items-center text-center space-y-4');
      expect(indexHtml).toContain('data-action="startFeierabendChillMode" class="btn-primary w-full py-2.5 px-4 font-bold text-xs');

      // 3. modal-app-install
      expect(indexHtml).toContain('theme-surface-modal mobile-modal-card animate-spring-modal w-full max-w-2xl p-4 sm:p-6 rounded-3xl shadow-2xl backdrop-blur-2xl text-white relative transition-all duration-300');
      expect(indexHtml).toContain('id="install-direct-pwa-btn" data-action="triggerDirectInstall" class="btn-primary');

      // 4. modal-mobile-quick-menu
      expect(indexHtml).toContain('theme-surface-modal w-full max-w-md p-5 rounded-t-3xl sm:rounded-3xl shadow-2xl backdrop-blur-xl text-white space-y-4 max-h-[85vh] overflow-y-auto');

      // 5. mobile-menu-drawer
      expect(indexHtml).toContain('theme-surface-modal mobile-modal-card w-full max-w-lg rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto');
    });

    it('sollte standardisierte Button-Klassen in realen UI-Modals nutzen', () => {
      expect(indexHtml).toContain('btn-ghost');
      expect(indexHtml).toContain('btn-primary');
      expect(indexHtml).toContain('btn-secondary');
      expect(indexHtml).toContain('btn-danger');
    });

    it('sollte sichtbare Tastatur-Fokuszustände (:focus-visible) in styles-base-2.css definieren', () => {
      expect(cssBase2).toContain('.btn-primary:focus-visible');
      expect(cssBase2).toContain('.btn-secondary:focus-visible');
      expect(cssBase2).toContain('.btn-ghost:focus-visible');
      expect(cssBase2).toContain('.btn-danger:focus-visible');
      expect(cssBase2).toContain('.theme-surface-input:focus-visible');
      expect(cssBase2).toContain('outline: 2px solid var(--accent');
      expect(cssBase2).toContain('outline-offset: 2px');
    });
  });

  describe('6. Integrität von app-core.js und Systemarchitektur', () => {
    it('sollte die Zeilenbegrenzung von app-core.js (< 2000 Zeilen) strikt einhalten', () => {
      const lines = appCoreCode.split('\n').length;
      expect(lines).toBeLessThan(2000);
    });

    it('sollte ALL_VALID_THEMES in app-core.js konsistent halten', () => {
      expect(appCoreCode).toContain('ALL_VALID_THEMES');
      expect(appCoreCode).toContain('setTheme');
    });
  });

  describe('7. UI/UX-Schritt 8: Desktop-Rand-Pfeil und Mobile-Bereinigung', () => {
    it('sollte den Rand-Pfeil #btn-dashboard-arrow-toggle reversibel im DOM deaktivieren', () => {
      expect(indexHtml).toContain('id="btn-dashboard-arrow-toggle"');
      expect(indexHtml).toMatch(/<div class="hidden[^"]*"\s+aria-hidden="true">\s*<button id="btn-dashboard-arrow-toggle"/);
    });

    it('sollte den primären Tools-Einstieg über #btn-header-tools gewährleisten', () => {
      expect(indexHtml).toContain('id="btn-header-tools"');
      expect(indexHtml).toContain('data-action="togglePanel" data-action-args=\'["header-tools"]\'');
    });

    it('sollte das verwaiste #mobile-tools-sheet entfernt haben, während #modal-mobile-quick-menu gesichert bleibt', () => {
      expect(indexHtml).not.toContain('id="mobile-tools-sheet"');
      expect(indexHtml).toContain('id="modal-mobile-quick-menu"');
    });

    it('sollte den Header-Kollisionsschutz für schmale Bildschirme (< 640px) definieren', () => {
      expect(cssMobile).toContain('@media (max-width: 640px)');
      expect(cssMobile).toContain('#btn-label-report');
      expect(cssMobile).toContain('display: none !important');
    });
  });
});

