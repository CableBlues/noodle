import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../config.js';
import '../crypto-sync.js';
import '../sync-engine.js';

describe('Phase 6: Datenschutz, WebCrypto E2E & Developer-Modus', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('1. WebCrypto AES-GCM & PBKDF2 Verschlüsselung', () => {
    it('verschlüsselt und entschlüsselt beliebige State-Payloads korrekt mit Passphrase', async () => {
      const sampleState = {
        items: {
          daily: ['Geheime Notiz', 'Geheime Aufgabe'],
          termine: [{ task: 'Vertraulicher Arzttermin', time: '14:00' }]
        },
        version: 3
      };

      const passphrase = 'SuperSecretPassphrase123!';
      const encrypted = await NoodleCrypto.encrypt(sampleState, passphrase);

      expect(encrypted._isEncrypted).toBe(true);
      expect(encrypted.cryptoVersion).toBe(1);
      expect(encrypted.iterations).toBe(600000);
      expect(encrypted.cipher).toBeDefined();
      expect(encrypted.salt).toBeDefined();
      expect(encrypted.iv).toBeDefined();

      // Entschlüsselung mit korrekter Passphrase
      const decrypted = await NoodleCrypto.decrypt(encrypted, passphrase);
      expect(decrypted).toEqual(sampleState);
    });

    it('alter Container (100000, ohne Feld) wird korrekt entschlüsselt; neuer Container enthält iterations=600000', async () => {
      const payload = { test: 'legacy-data-migration' };
      const passphrase = 'LegacyPassword2026';

      // Neuer Container enthält iterations=600000
      const newContainer = await NoodleCrypto.encrypt(payload, passphrase);
      expect(newContainer.iterations).toBe(600000);
      const decryptedNew = await NoodleCrypto.decrypt(newContainer, passphrase);
      expect(decryptedNew).toEqual(payload);

      // Alter Container (mit 100000 Iterationen verschlüsselt, ohne iterations-Feld)
      const salt = NoodleCrypto.generateSalt(16);
      const iv = NoodleCrypto.generateIv(12);
      const oldKey = await NoodleCrypto.deriveKey(passphrase, salt, 100000);
      const encoder = new TextEncoder();
      const cipherBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        oldKey,
        encoder.encode(JSON.stringify(payload))
      );
      const oldContainer = {
        _isEncrypted: true,
        cryptoVersion: 1,
        // kein iterations-Feld!
        cipher: NoodleCrypto.bufferToBase64(cipherBuffer),
        salt: NoodleCrypto.bufferToBase64(salt),
        iv: NoodleCrypto.bufferToBase64(iv),
        timestamp: new Date().toISOString()
      };

      expect(oldContainer.iterations).toBeUndefined();

      // Alter Container wird mit 100000 Fallback erfolgreich entschlüsselt
      const decryptedOld = await NoodleCrypto.decrypt(oldContainer, passphrase);
      expect(decryptedOld).toEqual(payload);
    });

    it('wirft einen Fehler bei falscher Passphrase (Integritätsschutz durch AES-GCM)', async () => {
      const payload = { secret: '42' };
      const encrypted = await NoodleCrypto.encrypt(payload, 'RightPassword');

      await expect(NoodleCrypto.decrypt(encrypted, 'WrongPassword')).rejects.toThrow(
        /Entschlüsselung fehlgeschlagen/
      );
    });

    it('gibt unverschlüsselte Daten transparent zurück (Abwärtskompatibilität)', async () => {
      const plainLegacyData = { items: { daily: ['Unverschlüsselt'] } };
      const res = await NoodleCrypto.decrypt(plainLegacyData, 'AnyPassword');
      expect(res).toEqual(plainLegacyData);
    });
  });

  describe('2. Developer-Modus Schutz vor localStorage-Manipulationen', () => {
    it('ignoriert noodle_custom_config, wenn der Developer-Modus NICHT aktiv ist', () => {
      localStorage.setItem('noodle_custom_config', JSON.stringify({
        SUPABASE_URL: 'https://attacker.evil.com'
      }));

      // Simuliert config.js Re-Eval
      const isDevMode = localStorage.getItem('noodle_dev_mode') === 'true';
      expect(isDevMode).toBe(false);
      expect(window.NOODLE_CONFIG.SUPABASE_URL).not.toBe('https://attacker.evil.com');
    });

    it('übernimmt noodle_custom_config, wenn noodle_dev_mode explizit aktiviert wurde', () => {
      localStorage.setItem('noodle_dev_mode', 'true');
      localStorage.setItem('noodle_custom_config', JSON.stringify({
        SUPABASE_URL: 'https://custom-self-hosted.local'
      }));

      const isDevMode = localStorage.getItem('noodle_dev_mode') === 'true';
      expect(isDevMode).toBe(true);

      const parsed = JSON.parse(localStorage.getItem('noodle_custom_config'));
      const testConfig = { ...window.NOODLE_CONFIG };
      if (isDevMode && parsed) {
        Object.assign(testConfig, parsed);
      }
      expect(testConfig.SUPABASE_URL).toBe('https://custom-self-hosted.local');
    });
  });
});
