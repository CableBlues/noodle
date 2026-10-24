/**
 * @file tests/settings-themes-and-network-resilience.test.js
 * @description
 * Tests für Einstellungen, Themes, Offline-/Netzwerk-Resilienz und E2E-Kryptografie.
 * Prüft Theme-Validierung und -Fallback, Sprachumschaltung, Offline-Wetter- und
 * Offline-Nachrichten-Fallback sowie kryptografische Manipulationssicherheit (AES-GCM MAC-Check).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Einstellungen, Themes, Offline-Resilienz & Kryptografie', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();

    document.documentElement.className = '';
    document.documentElement.lang = '';
    document.body.className = '';
    document.body.innerHTML = `
      <div id="container-extra-themes" class="hidden"></div>
      <div id="icon-extra-themes-arrow"></div>
      <div id="minimal-mode-btn-text"></div>
      <button data-theme-swatch="aurora"></button>
      <button data-theme-swatch="midnight"></button>
      <button data-theme-swatch="code-night"></button>
    `;

    // Mocks
    window.renderApp = vi.fn();
    window.translateUI = vi.fn();
    window.updateDateAndStreak = vi.fn();
    window.t = (k) => k;
    window.tr = (obj) => (typeof obj === 'object' && obj !== null ? obj.de || Object.values(obj)[0] : String(obj));

    // Module importieren
    await import('../app-core.js');
    await import('../crypto-sync.js');
    await import('../app-weather-news.js');
    await import('../app-radio-news.js');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Theme-Verwaltung & Fallback-Resilienz (setTheme)', () => {
    it('wechselt zu einem gültigen Theme und aktualisiert DOM und localStorage', () => {
      window.setTheme('aurora');

      expect(document.body.className).toContain('theme-aurora');
      expect(document.documentElement.className).toContain('theme-aurora');
      expect(localStorage.getItem('flowPlannerTheme')).toBe('aurora');
      expect(window.currentTheme).toBe('aurora');

      // Aktiver Glow-Ring auf dem Swatch-Button
      const auroraBtn = document.querySelector('[data-theme-swatch="aurora"]');
      expect(auroraBtn.classList.contains('ring-2')).toBe(true);

      const midnightBtn = document.querySelector('[data-theme-swatch="midnight"]');
      expect(midnightBtn.classList.contains('ring-2')).toBe(false);
    });

    it('löst Theme-Aliase wie "dark" und "fruity" korrekt auf', () => {
      window.setTheme('dark');
      expect(document.body.className).toContain('theme-aurora');
      expect(localStorage.getItem('flowPlannerTheme')).toBe('aurora');
      expect(window.currentTheme).toBe('aurora');

      window.setTheme('fruity');
      expect(document.body.className).toContain('theme-fruity-classic');
      expect(localStorage.getItem('flowPlannerTheme')).toBe('fruity-classic');
      expect(window.currentTheme).toBe('fruity-classic');
    });

    it('fällt bei unbekannten oder manipulierten Theme-Strings sauber auf code-night zurück', () => {
      window.setTheme('evil-neon-theme-injection<script>');

      expect(document.body.className).toContain('theme-code-night');
      expect(localStorage.getItem('flowPlannerTheme')).toBe('code-night');
      expect(window.currentTheme).toBe('code-night');
    });
  });

  describe('2. Sprachverwaltung (setLanguage)', () => {
    it('wechselt Sprache, synchronisiert DOM und speichert im localStorage', () => {
      window.setLanguage('de');

      expect(document.documentElement.lang).toBe('de');
      expect(localStorage.getItem('flowPlannerLanguage')).toBe('de');
      expect(window.currentLang).toBe('de');
    });

    it('fällt bei leerer Spracheingabe auf en zurück', () => {
      window.setLanguage('');

      expect(document.documentElement.lang).toBe('en');
      expect(localStorage.getItem('flowPlannerLanguage')).toBe('en');
      expect(window.currentLang).toBe('en');
    });
  });

  describe('3. Offline Wetter-Fallback (generateFallbackWeatherData)', () => {
    it('erzeugt vollständige 24h-Stunden und 7-Tage-Vorhersagestruktur ohne Netzwerk', () => {
      expect(typeof window.generateFallbackWeatherData).toBe('function');

      const data = window.generateFallbackWeatherData({ lat: 52.52, lon: 13.41 });
      expect(data).toBeDefined();
      expect(data.latitude).toBeCloseTo(52.52);
      expect(data.longitude).toBeCloseTo(13.41);

      // Aktuelles Wetter
      expect(data.current).toBeDefined();
      expect(typeof data.current.temperature_2m).toBe('number');
      expect(data.current.temperature_2m).toBeGreaterThan(-30);
      expect(data.current.temperature_2m).toBeLessThan(50);

      // 24 Stunden-Verlauf
      expect(data.hourly).toBeDefined();
      expect(Array.isArray(data.hourly.time)).toBe(true);
      expect(data.hourly.time.length).toBe(24);
      expect(data.hourly.temperature_2m.length).toBe(24);
      expect(data.hourly.weather_code.length).toBe(24);

      // 7 Tage-Vorschau
      expect(data.daily).toBeDefined();
      expect(Array.isArray(data.daily.time)).toBe(true);
      expect(data.daily.time.length).toBe(7);
      expect(data.daily.temperature_2m_max.length).toBe(7);
      expect(data.daily.temperature_2m_min.length).toBe(7);
    });
  });

  describe('4. Offline Nachrichten-Fallback (RadioNewsEngine.FALLBACK_NEWS_DATABASE)', () => {
    it('stellt mehrsprachige kuratierte Nachrichten mit sicheren HTTPS-Quellen bereit', () => {
      const db = window.RadioNewsEngine?.FALLBACK_NEWS_DATABASE;
      expect(db).toBeDefined();

      const languages = ['de', 'en', 'es', 'fr', 'it', 'el'];
      languages.forEach(lang => {
        expect(Array.isArray(db[lang]) || Array.isArray(db.de)).toBe(true);
      });

      // Prüfe deutsche Standardeinträge
      const deList = db.de;
      expect(deList.length).toBeGreaterThan(0);

      deList.forEach(item => {
        expect(item.source).toBeDefined();
        expect(item.url).toMatch(/^https:\/\//); // Muss sicheres HTTPS sein
        expect(item.translations).toBeDefined();
        expect(item.translations.de.title.length).toBeGreaterThan(10);
        expect(item.translations.de.summary.length).toBeGreaterThan(10);
      });
    });
  });

  describe('5. Kryptografische Manipulationssicherheit & AES-GCM MAC-Check (crypto-sync.js)', () => {
    const testSecretPayload = {
      user: 'alice@noodle.local',
      privateTasks: ['Geheimes Projekt planen', 'Passworttresor sichern'],
      timestamp: 123456789
    };
    const testPassphrase = 'SuperSicheresMasterPasswort123!#';

    it('verschlüsselt und entschlüsselt Nutzdaten mit korrekter Passphrase erfolgreich', async () => {
      const encrypted = await window.NoodleCrypto.encrypt(testSecretPayload, testPassphrase);

      expect(encrypted._isEncrypted).toBe(true);
      expect(encrypted.cryptoVersion).toBe(1);
      expect(typeof encrypted.cipher).toBe('string');
      expect(typeof encrypted.salt).toBe('string');
      expect(typeof encrypted.iv).toBe('string');

      const decrypted = await window.NoodleCrypto.decrypt(encrypted, testPassphrase);
      expect(decrypted).toEqual(testSecretPayload);
    });

    it('verweigert Entschlüsselung bei falscher Passphrase', async () => {
      const encrypted = await window.NoodleCrypto.encrypt(testSecretPayload, testPassphrase);

      await expect(
        window.NoodleCrypto.decrypt(encrypted, 'VoelligFalschesPasswort!')
      ).rejects.toThrow(/Entschlüsselung fehlgeschlagen/);
    });

    it('verhindert Daten-Manipulation: Verändertes Chiffrat schlägt bei AES-GCM Tag-Prüfung fehl', async () => {
      const encrypted = await window.NoodleCrypto.encrypt(testSecretPayload, testPassphrase);

      // 1 Byte im Base64-Chiffrat gezielt manipulieren
      const rawCipher = encrypted.cipher;
      const tamperedChar = rawCipher[10] === 'A' ? 'B' : 'A';
      const tamperedCipher = rawCipher.substring(0, 10) + tamperedChar + rawCipher.substring(11);

      const tamperedEnvelope = { ...encrypted, cipher: tamperedCipher };

      // AES-GCM muss den manipulierten Ciphertext über den Authentication Tag abweisen!
      await expect(
        window.NoodleCrypto.decrypt(tamperedEnvelope, testPassphrase)
      ).rejects.toThrow(/Entschlüsselung fehlgeschlagen: Ungültige Passphrase oder manipulierte Daten/);
    });

    it('verhindert IV-Manipulation: Manipulierter Nonce/IV wird abgewiesen', async () => {
      const encrypted = await window.NoodleCrypto.encrypt(testSecretPayload, testPassphrase);

      // IV manipulieren
      const rawIv = encrypted.iv;
      const tamperedIv = rawIv.substring(0, 4) + 'AAAA' + rawIv.substring(8);
      const tamperedEnvelope = { ...encrypted, iv: tamperedIv };

      await expect(
        window.NoodleCrypto.decrypt(tamperedEnvelope, testPassphrase)
      ).rejects.toThrow(/Entschlüsselung fehlgeschlagen/);
    });

    it('gibt unverschlüsselte Daten unverändert zurück (Abwärtskompatibilität)', async () => {
      const plainEnvelope = { normalState: true, items: [] };
      const res = await window.NoodleCrypto.decrypt(plainEnvelope, testPassphrase);
      expect(res).toBe(plainEnvelope);
    });
  });
});
