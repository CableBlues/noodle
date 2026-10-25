import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Responsive Tablet & Mobile Architecture', () => {
  let indexHtml;
  let mobileCss;

  beforeEach(() => {
    indexHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    mobileCss = fs.readFileSync(path.resolve(__dirname, '../styles-mobile.css'), 'utf8');
  });

  it('1. Mobile tools grid contains complete tool parity with desktop dock', () => {
    expect(indexHtml).toContain('openBrainstormModal()');
    expect(indexHtml).toContain('openClarityModal()');
    expect(indexHtml).toContain('openSafeSpaceModal()');
    expect(indexHtml).toContain("togglePanel('shopping')");
    expect(indexHtml).toContain("togglePanel('cooking')");
    expect(indexHtml).toContain('openSportModal()');
    expect(indexHtml).toContain('openAlarmModal()');
    expect(indexHtml).toContain('openReportDashboard()');
    expect(indexHtml).toContain('openP2PSyncModal()');
    expect(indexHtml).toContain('openWhatNowModal()');
  });

  it('2. Styles-mobile.css defines dedicated smartphone and tablet breakpoints', () => {
    expect(mobileCss).toContain('@media (max-width: 768px)');
    expect(mobileCss).toContain('@media (min-width: 769px) and (max-width: 1024px)');
    expect(mobileCss).toContain('TABLET DESIGN SYSTEM');
  });

  it('3. Header Sound Volume popover supports touch/click toggle', () => {
    expect(indexHtml).toContain('toggleSoundVolumePopover(event)');
  });

  it('4. Brainstorming Modal is responsive with safe max-height and custom scrollbar', () => {
    expect(indexHtml).toContain('id="brainstorm-modal"');
    expect(indexHtml).toContain('max-h-[92vh]');
    expect(indexHtml).toContain('id="brainstorm-quick-input"');
    expect(indexHtml).toContain('id="brainstorm-mic-btn"');
  });

  it('5. Mobile bottom navigation bar contains 5 primary zones with safe-area insets', () => {
    expect(indexHtml).toContain('id="mobile-bottom-nav"');
    expect(indexHtml).toContain('switchMobileNavTab(\'planer\')');
    expect(indexHtml).toContain('switchMobileNavTab(\'focus\')');
    expect(indexHtml).toContain('switchMobileNavTab(\'audio\')');
    expect(indexHtml).toContain('switchMobileNavTab(\'tools\')');
    expect(mobileCss).toContain('env(safe-area-inset-bottom)');
  });

  it('6. Step 10: Task checkbox hit area enlarged to >= 40px via pseudo-element on touch viewports', () => {
    const appTasksJs = fs.readFileSync(path.resolve(__dirname, '../app-tasks.js'), 'utf8');
    // CSS-Regeln: Hitbox mindestens 40x40px (42px) über ::before ohne visuelle Verformung
    expect(mobileCss).toContain('.task-check-btn::before');
    expect(mobileCss).toMatch(/\.task-check-btn::before\s*\{[^}]*width:\s*42px/);
    expect(mobileCss).toMatch(/\.task-check-btn::before\s*\{[^}]*height:\s*42px/);
    expect(mobileCss).toMatch(/\.task-check-btn\s*\{[^}]*touch-action:\s*manipulation/);
    // Event-Isolation: touchstart, pointerdown, mousedown stoppen Propagation
    expect(appTasksJs).toContain('onpointerdown="event.stopPropagation()" onmousedown="event.stopPropagation()" ontouchstart="event.stopPropagation()"');
    expect(appTasksJs).toContain('checkBtn.ontouchstart = (e) => e.stopPropagation();');
  });

  it('7. Step 10: Header Timer controls enlarged for mobile touch viewports with clean spacing', () => {
    // Presets Button mindestens 28px
    expect(mobileCss).toMatch(/#btn-timer-presets\s*\{[^}]*min-width:\s*28px/);
    expect(mobileCss).toMatch(/#btn-timer-presets\s*\{[^}]*min-height:\s*28px/);
    // Play/Pause/Stop Buttons mindestens 30px mit 6px Padding
    expect(mobileCss).toMatch(/#timer-play-btn,\s*#timer-pause-btn,\s*#timer-stop-btn\s*\{[^}]*min-width:\s*30px/);
    expect(mobileCss).toMatch(/#timer-play-btn,\s*#timer-pause-btn,\s*#timer-stop-btn\s*\{[^}]*min-height:\s*30px/);
    expect(mobileCss).toMatch(/#timer-play-btn,\s*#timer-pause-btn,\s*#timer-stop-btn\s*\{[^}]*padding:\s*6px/);
    // Vergrößerter Abstand zwischen Start/Pause und Stop
    expect(mobileCss).toContain('gap: 5px !important');
  });

  it('8. Step 10: Planer toolbar undo and sync buttons enlarged to >= 36x36px with safe spacing', () => {
    expect(mobileCss).toMatch(/#header-sync-btn,\s*#btn-board-undo\s*\{[^}]*width:\s*36px/);
    expect(mobileCss).toMatch(/#header-sync-btn,\s*#btn-board-undo\s*\{[^}]*height:\s*36px/);
    expect(mobileCss).toMatch(/#header-sync-btn,\s*#btn-board-undo\s*\{[^}]*min-width:\s*36px/);
    expect(mobileCss).toMatch(/#header-sync-btn,\s*#btn-board-undo\s*\{[^}]*min-height:\s*36px/);
    // Sicherheitsabstand zu Ticker-Optionen
    expect(mobileCss).toMatch(/#btn-board-undo\s*\{[^}]*margin-left:\s*4px/);
  });
});
