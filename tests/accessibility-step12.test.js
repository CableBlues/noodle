import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Production code dependencies
import '../utils.js';
import '../data-tasks.js';
import '../app-core.js';

describe('UI/UX Schritt 12 – Accessibility & Keyboard Fixes', () => {
  const rootDir = path.resolve(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const appTasksJs = fs.readFileSync(path.join(rootDir, 'app-tasks.js'), 'utf8');
  const stylesBase2Css = fs.readFileSync(path.join(rootDir, 'styles-base-2.css'), 'utf8');

  describe('1. Globaler Space-Key-Handler (app-core.js)', () => {
    let timerToggled = false;

    beforeEach(() => {
      timerToggled = false;
      window.toggleTimer = () => {
        timerToggled = true;
      };
      // Reset activeElement to body
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
    });

    it('Space auf document.body löst weiterhin global toggleTimer aus und ruft preventDefault() auf', () => {
      document.body.focus?.();
      const event = new KeyboardEvent('keydown', { key: ' ', code: 'Space', cancelable: true, bubbles: true });
      window.dispatchEvent(event);

      expect(timerToggled).toBe(true);
      expect(event.defaultPrevented).toBe(true);
    });

    it('Space auf einem fokussierten native <button> triggert NICHT toggleTimer und unterdrückt nicht das native Verhalten', () => {
      const btn = document.createElement('button');
      btn.id = 'test-btn';
      document.body.appendChild(btn);
      btn.focus();

      const event = new KeyboardEvent('keydown', { key: ' ', code: 'Space', cancelable: true, bubbles: true });
      btn.dispatchEvent(event);

      expect(timerToggled).toBe(false);
      expect(event.defaultPrevented).toBe(false);

      document.body.removeChild(btn);
    });

    it('Space auf einem Element mit role="button" triggert NICHT toggleTimer', () => {
      const divBtn = document.createElement('div');
      divBtn.setAttribute('role', 'button');
      divBtn.tabIndex = 0;
      document.body.appendChild(divBtn);
      divBtn.focus();

      const event = new KeyboardEvent('keydown', { key: ' ', code: 'Space', cancelable: true, bubbles: true });
      divBtn.dispatchEvent(event);

      expect(timerToggled).toBe(false);
      expect(event.defaultPrevented).toBe(false);

      document.body.removeChild(divBtn);
    });

    it('Space auf <summary>, <a href="...">, <input> und [role="checkbox"] bleibt für native Bedienung frei', () => {
      const elements = [
        document.createElement('summary'),
        Object.assign(document.createElement('a'), { href: '#test' }),
        document.createElement('input'),
        Object.assign(document.createElement('div'), { role: 'checkbox', tabIndex: 0 })
      ];

      elements.forEach((el) => {
        document.body.appendChild(el);
        el.focus();
        timerToggled = false;

        const event = new KeyboardEvent('keydown', { key: ' ', code: 'Space', cancelable: true, bubbles: true });
        el.dispatchEvent(event);

        expect(timerToggled).toBe(false);
        expect(event.defaultPrevented).toBe(false);

        document.body.removeChild(el);
      });
    });
  });

  describe('2. Task-Options-Buttons Tastatur-Fokuszustand (app-tasks.js & styles-base-2.css)', () => {
    it('app-tasks.js enthält focus-within und group-focus-within Klassen für Aktionsmenüs', () => {
      expect(appTasksJs).toContain('focus-within:opacity-100');
      expect(appTasksJs).toContain('group-focus-within:opacity-100');
      expect(appTasksJs).toContain('focus-within:pointer-events-auto');
      expect(appTasksJs).toContain('group-focus-within:pointer-events-auto');
    });

    it('styles-base-2.css stellt die CSS-Fallback-Regeln für focus-within bereit', () => {
      expect(stylesBase2Css).toContain('.focus-within\\:opacity-100:focus-within');
      expect(stylesBase2Css).toContain('.group:focus-within .group-focus-within\\:opacity-100');
      expect(stylesBase2Css).toContain('.focus-within\\:pointer-events-auto:focus-within');
      expect(stylesBase2Css).toContain('.group:focus-within .group-focus-within\\:pointer-events-auto');
    });
  });

  describe('3. Dialog-Semantik in den 5 Kern-Modals (index.html)', () => {
    it('#modal-keyboard-shortcuts besitzt role="dialog", aria-modal="true" und aria-labelledby auf eine echte Überschrift', () => {
      expect(indexHtml).toMatch(/id="modal-keyboard-shortcuts"[^>]*role="dialog"/);
      expect(indexHtml).toMatch(/id="modal-keyboard-shortcuts"[^>]*aria-modal="true"/);
      expect(indexHtml).toMatch(/id="modal-keyboard-shortcuts"[^>]*aria-labelledby="modal-shortcuts-title"/);
      expect(indexHtml).toMatch(/<h3[^>]*id="modal-shortcuts-title"[^>]*>/);
    });

    it('#modal-settings besitzt role="dialog", aria-modal="true" und aria-labelledby auf eine echte Überschrift', () => {
      expect(indexHtml).toMatch(/id="modal-settings"[^>]*role="dialog"/);
      expect(indexHtml).toMatch(/id="modal-settings"[^>]*aria-modal="true"/);
      expect(indexHtml).toMatch(/id="modal-settings"[^>]*aria-labelledby="modal-settings-title"/);
      expect(indexHtml).toMatch(/<h3[^>]*id="modal-settings-title"[^>]*>/);
    });

    it('#modal-report-dashboard besitzt role="dialog", aria-modal="true" und aria-labelledby auf eine echte Überschrift', () => {
      expect(indexHtml).toMatch(/id="modal-report-dashboard"[^>]*role="dialog"/);
      expect(indexHtml).toMatch(/id="modal-report-dashboard"[^>]*aria-modal="true"/);
      expect(indexHtml).toMatch(/id="modal-report-dashboard"[^>]*aria-labelledby="modal-report-dashboard-title"/);
      expect(indexHtml).toMatch(/<h3[^>]*id="modal-report-dashboard-title"[^>]*>/);
    });

    it('#modal-regulation besitzt role="dialog", aria-modal="true" und passendes aria-label', () => {
      expect(indexHtml).toMatch(/id="modal-regulation"[^>]*role="dialog"/);
      expect(indexHtml).toMatch(/id="modal-regulation"[^>]*aria-modal="true"/);
      expect(indexHtml).toMatch(/id="modal-regulation"[^>]*aria-label="Innere Ruhe &amp; Somatische Regulation"/);
    });

    it('#brainstorm-modal besitzt role="dialog", aria-modal="true" und passendes aria-label', () => {
      expect(indexHtml).toMatch(/id="brainstorm-modal"[^>]*role="dialog"/);
      expect(indexHtml).toMatch(/id="brainstorm-modal"[^>]*aria-modal="true"/);
      expect(indexHtml).toMatch(/id="brainstorm-modal"[^>]*aria-label="Smart Brainstorming Studio"/);
    });
  });
});
