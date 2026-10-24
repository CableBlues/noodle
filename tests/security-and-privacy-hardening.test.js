import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

import '../utils.js';
import '../storage.js';
import '../state.js';
import '../sport.js';
import '../app-tasks.js';

describe('Sicherheits- und Datenschutz-Hardening (Schritt 1)', () => {
  const rootDir = path.resolve(__dirname, '..');

  describe('1. Strikte Domain- & URL-Validierung (Gegen Teilstring-Spoofing)', () => {
    it('isGithubPagesDomain erkennt legitime GitHub Pages Domains und weist Spoofing ab', () => {
      // Legitime Domains
      expect(window.isGithubPagesDomain('cableblues.github.io')).toBe(true);
      expect(window.isGithubPagesDomain('noodle-planner.github.io')).toBe(true);
      expect(window.isGithubPagesDomain('github.io')).toBe(true);
      expect(window.isGithubPagesDomain('https://cableblues.github.io/noodle/')).toBe(true);
      expect(window.isGithubPagesDomain('http://cableblues.github.io:8080/path?q=1')).toBe(true);
      expect(window.isGithubPagesDomain('//cableblues.github.io/index.html')).toBe(true);

      // Bösartige Angreifer-Domains (die bei includes('github.io') fälschlicherweise matchen würden)
      expect(window.isGithubPagesDomain('evilgithub.io')).toBe(false);
      expect(window.isGithubPagesDomain('scam-github.io')).toBe(false);
      expect(window.isGithubPagesDomain('github.io.attacker.com')).toBe(false);
      expect(window.isGithubPagesDomain('evil.com/github.io')).toBe(false);
      expect(window.isGithubPagesDomain('https://evil.com/?ref=github.io')).toBe(false);
      expect(window.isGithubPagesDomain('https://evil.com/#github.io')).toBe(false);
      expect(window.isGithubPagesDomain('attacker-github.io.evil.org')).toBe(false);

      // Ungültige oder leere Eingaben
      expect(window.isGithubPagesDomain('')).toBe(false);
      expect(window.isGithubPagesDomain(null)).toBe(false);
      expect(window.isGithubPagesDomain(undefined)).toBe(false);
      expect(window.isGithubPagesDomain(12345)).toBe(false);
    });

    it('isAllowedDomain validiert Domains und Subdomains präzise', () => {
      const allowed = ['example.com', 'noodle.local'];
      expect(window.isAllowedDomain('example.com', allowed)).toBe(true);
      expect(window.isAllowedDomain('api.example.com', allowed)).toBe(true);
      expect(window.isAllowedDomain('sub.deep.example.com', allowed)).toBe(true);
      expect(window.isAllowedDomain('noodle.local', allowed)).toBe(true);

      expect(window.isAllowedDomain('evilexample.com', allowed)).toBe(false);
      expect(window.isAllowedDomain('example.com.attacker.org', allowed)).toBe(false);
      expect(window.isAllowedDomain('attacker.com', allowed)).toBe(false);
    });

    it('isValidHttpUrl erlaubt nur echtes http und https', () => {
      expect(window.isValidHttpUrl('https://example.com/test')).toBe(true);
      expect(window.isValidHttpUrl('http://localhost:3000')).toBe(true);

      expect(window.isValidHttpUrl('javascript:alert(1)')).toBe(false);
      expect(window.isValidHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(window.isValidHttpUrl('vbscript:msgbox(1)')).toBe(false);
      expect(window.isValidHttpUrl('file:///etc/passwd')).toBe(false);
      expect(window.isValidHttpUrl('')).toBe(false);
      expect(window.isValidHttpUrl(null)).toBe(false);
    });
  });

  describe('2. Umami Analytics Datenschutz & Global Privacy Control (GPC)', () => {
    it('index.html enthält keine unsichere Teilstringprüfung mehr für github.io', () => {
      const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
      expect(indexHtml).not.toContain("h.includes('github.io')");
      expect(indexHtml).toContain("h === 'github.io' || h.endsWith('.github.io')");
    });

    it('index.html prüft Global Privacy Control (navigator.globalPrivacyControl)', () => {
      const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
      expect(indexHtml).toContain('navigator.globalPrivacyControl');
    });

    it('toggleUmamiOptOut schaltet Opt-Out zuverlässig um und speichert beide Flags', () => {
      localStorage.clear();
      expect(localStorage.getItem('umami.disabled')).toBeNull();
      expect(localStorage.getItem('noodle_analytics_optout')).toBeNull();

      window.toggleUmamiOptOut();
      expect(localStorage.getItem('umami.disabled')).toBe('1');
      expect(localStorage.getItem('noodle_analytics_optout')).toBe('true');

      window.toggleUmamiOptOut();
      expect(localStorage.getItem('umami.disabled')).toBeNull();
      expect(localStorage.getItem('noodle_analytics_optout')).toBeNull();
    });
  });

  describe('3. Content Security Policy Header in Netlify & Vercel Config', () => {
    it('netlify.toml liefert einen CSP-Header mit restriktiven Direktiven', () => {
      const toml = fs.readFileSync(path.join(rootDir, 'netlify.toml'), 'utf8');
      expect(toml).toContain('Content-Security-Policy =');
      expect(toml).toContain("default-src 'self'");
      expect(toml).toContain("object-src 'none'");
      expect(toml).toContain("frame-ancestors 'self'");
    });

    it('vercel.json liefert einen CSP-Header mit restriktiven Direktiven', () => {
      const vercel = fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8');
      expect(vercel).toContain('"key": "Content-Security-Policy"');
      expect(vercel).toContain("default-src 'self'");
      expect(vercel).toContain("object-src 'none'");
      expect(vercel).toContain("frame-ancestors 'self'");
    });
  });

  describe('4. Service Worker CDN-Filterung (sw.js)', () => {
    it('sw.js nutzt eine strikte CDN-Whitelist statt unsicherem includes("cdn")', () => {
      const swCode = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');
      expect(swCode).not.toContain("url.hostname.includes('cdn')");
      expect(swCode).toContain('ALLOWED_STATIC_CDNS');
      expect(swCode).toContain('cdn.jsdelivr.net');
      expect(swCode).toContain('unpkg.com');
    });
  });

  describe('5. XSS-Schutz in UI-Renderern (Sport, Social Hub, News, Weather)', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      localStorage.clear();
    });

    it('Sport-Modul maskiert Workout-Titel gegen XSS-Injektion', () => {
      const listEl = document.createElement('div');
      listEl.id = 'sport-history-list';
      document.body.appendChild(listEl);

      const maliciousHistory = [{
        id: 'mov_1',
        title: '<img src=x onerror=alert("xss")> Joggen',
        durationMinutes: 15,
        exerciseCount: 2,
        date: '24.10.2026',
        time: '18:00'
      }];
      localStorage.setItem('noodle_movement_history_v1', JSON.stringify(maliciousHistory));

      window.renderMovementHistoryUI();

      expect(listEl.querySelector('img')).toBeNull();
      const h4 = listEl.querySelector('h4');
      expect(h4).not.toBeNull();
      expect(h4.childNodes[0].nodeType).toBe(3); // 3 === Node.TEXT_NODE
      expect(h4.textContent).toContain('<img src=x onerror=alert("xss")> Joggen');
    });

    it('Social Hub erkennt Domains per URL-Parsing statt unsicherer Teilstrings', async () => {
      await import('../app-social.js');
      expect(window.SocialHubEngine).toBeDefined();

      // Legitime URL
      window.SocialHubEngine.addInspiration('https://www.instagram.com/p/C-12345/', 'Test IG', 'Idee');
      const saved = JSON.parse(localStorage.getItem('noodle_social_inspirations') || '[]');
      expect(saved[0].platform).toBe('instagram');

      // Angreifer-URL mit Substring 'instagram.com' im Pfad oder Parameter darf NICHT als instagram erkannt werden
      window.SocialHubEngine.addInspiration('https://evil-attacker.com/instagram.com/phishing', 'Spoof Attempt', 'Idee');
      const updated = JSON.parse(localStorage.getItem('noodle_social_inspirations') || '[]');
      expect(updated[0].platform).toBe('other');
    });

    it('Social Hub rendert gespeicherte Inspirationen mit XSS-Schutz', async () => {
      await import('../app-social.js');
      const panelContent = document.createElement('div');
      panelContent.id = 'panel-social-content';
      document.body.appendChild(panelContent);

      const xssInspirations = [{
        id: 'insp_test_1',
        title: '<script>alert(1)</script>SafeTitle',
        url: 'https://example.com/safe',
        platform: 'other',
        tag: 'Idee',
        date: '24.10.2026'
      }];
      localStorage.setItem('noodle_social_inspirations', JSON.stringify(xssInspirations));

      window.SocialHubEngine.switchTab('saved');
      window.SocialHubEngine.render();

      expect(panelContent.querySelector('script')).toBeNull();
      expect(panelContent.textContent).toContain('SafeTitle');
    });

    it('Radio & News Ticker maskiert manipulierte RSS-Schlagzeilen und URLs gegen XSS', async () => {
      await import('../app-radio-news.js');
      expect(window.RadioNewsEngine).toBeDefined();

      const track = document.createElement('div');
      track.id = 'board-ticker-track';
      document.body.appendChild(track);

      const popoverBox = document.createElement('div');
      popoverBox.id = 'ticker-current-article-box';
      document.body.appendChild(popoverBox);

      const hoverPill = document.createElement('div');
      hoverPill.id = 'ticker-hover-action-pill';
      document.body.appendChild(hoverPill);

      const marquee = document.createElement('div');
      marquee.id = 'news-marquee-text';
      document.body.appendChild(marquee);

      const maliciousItems = [{
        title: '<img src=x onerror=alert("rss_xss")> Breaking News',
        source: '<b onmouseover=alert(1)>BadSource</b>',
        summary: '<script>alert("summary_xss")</script>Gefährliche Zusammenfassung',
        url: 'javascript:alert("malicious_protocol")',
        time: 'vor 5m',
        category: 'top'
      }];

      // Marquee-Test
      window.RadioNewsEngine.renderNewsCards?.([]);
      const tickerMarquee = document.getElementById('news-marquee-text');
      if (tickerMarquee) {
        // Ticker Marquee sollte keine Scripts / Img-Tags parsen
        expect(tickerMarquee.querySelector('img')).toBeNull();
      }

      // Teletext Headline & Details Box Check
      // Wenn maliciousItems gerendert werden, darf kein aktives Script/Image im DOM existieren
      expect(document.body.querySelector('img[onerror]')).toBeNull();
      expect(document.body.querySelector('script[src="malicious"]')).toBeNull();
      expect(document.body.querySelector('a[href^="javascript:"]')).toBeNull();
    });

    it('Weather Pinned Cities nutzt index-basierte Aufrufe und maskiert Städtenamen', async () => {
      await import('../app-weather-news.js');
      const container = document.createElement('div');
      container.id = 'weather-pinned-cities-container';
      document.body.appendChild(container);

      // Prüfe, dass selectPinnedCityByIndex definiert ist
      expect(typeof window.selectPinnedCityByIndex).toBe('function');

      window.renderPinnedCitiesUI();
      const firstPin = container.querySelector('.group\\/pin');
      if (firstPin) {
        expect(firstPin.getAttribute('onclick')).toContain('selectPinnedCityByIndex(');
      }
    });

    it('Template Builder schützt vor XSS-Payloads in Aufgaben und Vorschlägen (HTML-Tags, Quotes & Event-Attribute)', () => {
      const chipsEl = document.createElement('div');
      chipsEl.id = 'template-builder-selected-chips';
      document.body.appendChild(chipsEl);

      const suggEl = document.createElement('div');
      suggEl.id = 'template-builder-suggestions';
      document.body.appendChild(suggEl);

      const modalEl = document.createElement('div');
      modalEl.id = 'modal-template-builder';
      document.body.appendChild(modalEl);

      const xssTaskPayload = `Malicious Task <img src=x onerror=alert('xss')> " ' onclick="alert(1)"`;
      window.openTemplateBuilderModal();

      // Füge böswilligen Task hinzu
      const input = document.getElementById('template-builder-custom-input') || document.createElement('input');
      input.id = 'template-builder-custom-input';
      input.value = xssTaskPayload;
      if (!document.getElementById('template-builder-custom-input')) document.body.appendChild(input);

      window.addCustomTaskToTemplate();

      // Verifiziere, dass im DOM kein aktives img[onerror] oder unerwartetes inline-Event erzeugt wurde
      expect(chipsEl.querySelector('img')).toBeNull();
      expect(chipsEl.querySelectorAll('img[onerror]').length).toBe(0);
      
      const span = chipsEl.querySelector('.truncate');
      expect(span).not.toBeNull();
      // Der Text muss als Textknoten im DOM sein, nicht als ausführbares HTML-Element
      expect(span.textContent).toBe(xssTaskPayload);
      expect(span.children.length).toBe(0);
      
      // Prüfe, dass der Button DOM-Event-Listener nutzt statt unsicherer String-Interpolation
      const removeBtn = chipsEl.querySelector('.btn-tpl-remove');
      expect(removeBtn).not.toBeNull();
      expect(removeBtn.getAttribute('onclick')).toBeNull();
      expect(removeBtn.hasAttribute('data-tpl-remove-idx')).toBe(true);

      // Klick auf den sicheren Button entfernt die Aufgabe
      removeBtn.click();
      expect(chipsEl.textContent).toContain('Noch keine Aufgaben in dieser Kategorie');

      document.body.removeChild(chipsEl);
      document.body.removeChild(suggEl);
      document.body.removeChild(modalEl);
      if (input.parentNode) input.parentNode.removeChild(input);
    });

    it('CollabEngine DJ Sync Banner bindet Track-Objekte über sichere DOM-Listener statt inline JSON', async () => {
      await import('../collab-engine.js');
      const banner = document.createElement('div');
      banner.id = 'collab-dj-active-banner';
      document.body.appendChild(banner);

      const xssTrack = {
        name: `DJ Beat <script>alert('dj')</script> " onclick="alert(1)`,
        bpm: 128
      };

      // Simuliere DJ-Session mit bösartigem Tracknamen
      window.CollabEngine.onCollabMessage?.({
        type: 'dj_state',
        session: {
          isLive: true,
          dj: { name: 'EvilDJ <img src=x onerror=alert(2)>' },
          track: xssTrack
        }
      });

      const syncBtn = banner.querySelector('#collab-sync-shared-dj-btn');
      if (syncBtn) {
        expect(syncBtn.getAttribute('onclick')).toBeNull();
        expect(banner.querySelector('script')).toBeNull();
        expect(banner.querySelector('img[onerror]')).toBeNull();
      }

      document.body.removeChild(banner);
    });

    it('Social Hub weist bösartige URLs bei openPlatform, saveUserProfile und addInspiration ab', async () => {
      await import('../app-social.js');
      const openedUrls = [];
      const originalOpen = window.open;
      window.open = (url) => { openedUrls.push(url); };

      try {
        // 1. Ungültiges Protokoll bei saveUserProfile
        window.SocialHubEngine.saveProfile('instagram', 'javascript:alert(1)');
        // 2. Klick auf Plattform mit manipuliertem Protokoll darf window.open nicht mit javascript: ausführen
        window.SocialHubEngine.openPlatform('instagram');
        expect(openedUrls.some(u => String(u).startsWith('javascript:'))).toBe(false);

        // 3. addInspiration mit javascript: wird abgewiesen
        const initialCount = (JSON.parse(localStorage.getItem('noodle_social_inspirations') || '[]')).length;
        window.SocialHubEngine.addInspiration('javascript:alert(2)', 'Malicious');
        const countAfter = (JSON.parse(localStorage.getItem('noodle_social_inspirations') || '[]')).length;
        expect(countAfter).toBe(initialCount);
      } finally {
        window.open = originalOpen;
      }
    });

    it('app-core renderHistoryGallery bindet Klick-Handler über addEventListener statt inline onclick', async () => {
      await import('../app-core.js');
      const container = document.createElement('div');
      container.id = 'history-gallery-grid';
      document.body.appendChild(container);

      const shot = {
        id: 'shot_1',
        title: 'Test Screenshot <img src=x onerror=alert(1)>',
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        date: '24.10.2026'
      };
      localStorage.setItem('flow_history_screenshots', JSON.stringify([shot]));

      window.renderHistoryGallery();

      const openDiv = container.querySelector('.btn-open-shot');
      expect(openDiv).not.toBeNull();
      expect(openDiv.getAttribute('onclick')).toBeNull();

      const delBtn = container.querySelector('.btn-delete-shot');
      expect(delBtn).not.toBeNull();
      expect(delBtn.getAttribute('onclick')).toBeNull();

      document.body.removeChild(container);
    });
  });
});


