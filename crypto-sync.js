/**
 * @file crypto-sync.js
 * @module CryptoSync
 * @description
 * Zero-Knowledge Ende-zu-Ende-Verschlüsselung (E2E) für Noodle Studio.
 * Verwendet standardisierte WebCrypto APIs:
 * - PBKDF2 (SHA-256, 100.000 Iterationen) zur sicheren Schlüsselableitung aus Passphrase + Salt.
 * - AES-GCM (256 Bit, 96-Bit IV) für authentifizierte, manipulationssichere Nutzdaten-Verschlüsselung.
 * - Völlig opt-in mit automatischer Migration und Versions-Kennzeichnung.
 */

const NoodleCrypto = {
  VERSION: 1,
  ITERATIONS: 600000,
  ALGO: 'AES-GCM',
  HASH: 'SHA-256',

  // Prüft, ob WebCrypto verfügbar ist
  isSupported() {
    return typeof crypto !== 'undefined' && crypto.subtle !== undefined;
  },

  // Generiert kryptografisch zufälligen Salt
  generateSalt(byteLength = 16) {
    const salt = new Uint8Array(byteLength);
    crypto.getRandomValues(salt);
    return salt;
  },

  // Generiert kryptografisch zufälligen IV für AES-GCM
  generateIv(byteLength = 12) {
    const iv = new Uint8Array(byteLength);
    crypto.getRandomValues(iv);
    return iv;
  },

  // Wandelt Uint8Array in Base64 um
  bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },

  // Wandelt Base64 in Uint8Array um
  base64ToBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  },

  // Leitet aus Passphrase + Salt einen 256-Bit AES-GCM CryptoKey via PBKDF2 ab
  async deriveKey(passphrase, saltBytes, iterations = this.ITERATIONS) {
    if (!this.isSupported()) {
      throw new Error('WebCrypto API wird von dieser Umgebung nicht unterstützt.');
    }
    if (!passphrase || typeof passphrase !== 'string' || passphrase.trim().length === 0) {
      throw new Error('Passphrase darf nicht leer sein.');
    }

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: iterations,
        hash: this.HASH
      },
      keyMaterial,
      {
        name: this.ALGO,
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  },

  // Verschlüsselt beliebiges JSON-fähiges Datenobjekt
  async encrypt(dataObj, passphrase) {
    if (!passphrase) {
      throw new Error('Keine Passphrase zur Verschlüsselung angegeben.');
    }
    const salt = this.generateSalt(16);
    const iv = this.generateIv(12);
    const iterations = this.ITERATIONS;
    const key = await this.deriveKey(passphrase, salt, iterations);

    const encoder = new TextEncoder();
    const plainBytes = encoder.encode(JSON.stringify(dataObj));

    const cipherBuffer = await crypto.subtle.encrypt(
      {
        name: this.ALGO,
        iv: iv
      },
      key,
      plainBytes
    );

    return {
      _isEncrypted: true,
      cryptoVersion: this.VERSION,
      iterations: iterations,
      cipher: this.bufferToBase64(cipherBuffer),
      salt: this.bufferToBase64(salt),
      iv: this.bufferToBase64(iv),
      timestamp: new Date().toISOString()
    };
  },

  // Entschlüsselt einen verschlüsselten Container
  async decrypt(encryptedEnvelope, passphrase) {
    if (!encryptedEnvelope || !encryptedEnvelope._isEncrypted) {
      // Wenn nicht verschlüsselt: unberührt zurückgeben (Abwärtskompatibilität)
      return encryptedEnvelope;
    }
    if (!passphrase) {
      throw new Error('Passphrase fehlt für die Entschlüsselung.');
    }

    const salt = this.base64ToBuffer(encryptedEnvelope.salt);
    const iv = this.base64ToBuffer(encryptedEnvelope.iv);
    const cipherBytes = this.base64ToBuffer(encryptedEnvelope.cipher);
    const iterations = (typeof encryptedEnvelope.iterations === 'number' && encryptedEnvelope.iterations > 0)
      ? encryptedEnvelope.iterations
      : 100000;

    const key = await this.deriveKey(passphrase, salt, iterations);

    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.ALGO,
          iv: iv
        },
        key,
        cipherBytes
      );

      const decoder = new TextDecoder();
      const jsonText = decoder.decode(decryptedBuffer);
      return JSON.parse(jsonText);
    } catch (e) {
      throw new Error('Entschlüsselung fehlgeschlagen: Ungültige Passphrase oder manipulierte Daten.');
    }
  },

  // Verwaltet Opt-in-Status im localStorage
  isE2EEnabled() {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('noodle_e2e_enabled') === 'true';
      }
    } catch (e) {}
    return false;
  },

  getSavedPassphrase() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        return sessionStorage.getItem('noodle_e2e_passphrase') || null;
      }
    } catch (e) {}
    return null;
  },

  setE2EEnabled(enabled, passphrase = null) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('noodle_e2e_enabled', enabled ? 'true' : 'false');
      }
      if (typeof sessionStorage !== 'undefined') {
        if (enabled && passphrase) {
          sessionStorage.setItem('noodle_e2e_passphrase', passphrase);
        } else {
          sessionStorage.removeItem('noodle_e2e_passphrase');
        }
      }
    } catch (e) {}
  }
};

if (typeof window !== 'undefined') {
  window.NoodleCrypto = NoodleCrypto;
}
if (typeof globalThis !== 'undefined') {
  globalThis.NoodleCrypto = NoodleCrypto;
}
