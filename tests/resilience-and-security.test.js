import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../utils.js';
import '../storage.js';

describe('Advanced Security & Sanitization', () => {
  it('escapeHtml safely handles backticks and template string injection attempts', () => {
    const payload = 'Hello `${alert(1)}` World';
    const escaped = window.escapeHtml(payload);
    expect(escaped).toBe('Hello &#96;${alert(1)}&#96; World');
  });

  it('escapeHtml safely converts booleans and numbers to safe string representations', () => {
    expect(window.escapeHtml(true)).toBe('true');
    expect(window.escapeHtml(false)).toBe('false');
    expect(window.escapeHtml(42)).toBe('42');
  });

  it('sanitizeUrl correctly allows safe http, https, mailto and tel protocols', () => {
    expect(window.sanitizeUrl('https://example.com/path?q=1')).toBe('https://example.com/path?q=1');
    expect(window.sanitizeUrl('http://localhost:3000')).toBe('http://localhost:3000');
    expect(window.sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    expect(window.sanitizeUrl('tel:+49123456789')).toBe('tel:+49123456789');
    expect(window.sanitizeUrl('/local/path/file.html')).toBe('/local/path/file.html');
    expect(window.sanitizeUrl('#anchor')).toBe('#anchor');
  });

  it('sanitizeUrl blocks javascript: and dangerous execution schemes', () => {
    expect(window.sanitizeUrl('javascript:alert(1)')).toBe('#');
    expect(window.sanitizeUrl('JAVASCRIPT:alert(document.cookie)', '')).toBe('');
    expect(window.sanitizeUrl('  javascript:alert(1)  ', '#fallback')).toBe('#fallback');
    expect(window.sanitizeUrl('data:text/html,<script>alert(1)</script>', '')).toBe('');
    expect(window.sanitizeUrl('vbscript:msgbox(1)', '#default')).toBe('#default');
  });

  it('sanitizeUrl handles invalid URLs and non-string inputs safely', () => {
    expect(window.sanitizeUrl(null)).toBe('#');
    expect(window.sanitizeUrl(undefined, 'fallback')).toBe('fallback');
    expect(window.sanitizeUrl('', 'fallback')).toBe('fallback');
  });
});

describe('Storage Quota & Resilience', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('AppStorage safely handles corrupt data and missing keys', () => {
    expect(window.AppStorage.get('missing_key', { def: true })).toEqual({ def: true });
    localStorage.setItem('bad_json', '{not valid');
    expect(window.AppStorage.get('bad_json', 'safe')).toBe('safe');
  });

  it('AppStorage never deletes user history or backups on QuotaExceededError and returns false', () => {
    let callCount = 0;
    localStorage.setItem('flow_history', 'heavy history');
    localStorage.setItem('flow_backup_before_sync', 'old backup');

    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, val) => {
      callCount++;
      const err = new Error('QuotaExceededError');
      err.name = 'QuotaExceededError';
      err.code = 22;
      throw err;
    });

    const success = window.AppStorage.set('flow_critical_data', { ready: true });
    // Write must fail honestly without faking success
    expect(success).toBe(false);
    // User history and sync backups MUST NOT be deleted automatically!
    expect(localStorage.getItem('flow_history')).toBe('heavy history');
    expect(localStorage.getItem('flow_backup_before_sync')).toBe('old backup');

    spy.mockRestore();
  });

  it('AppStorage shows toast "Speicher voll – bitte Backup exportieren" exactly once on QuotaExceededError', () => {
    if (typeof window.__resetQuotaToastForTesting === 'function') {
      window.__resetQuotaToastForTesting();
    }
    const toastCalls = [];
    window.showToast = (msg) => {
      toastCalls.push(msg);
    };

    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const err = new Error('QuotaExceededError');
      err.name = 'QuotaExceededError';
      err.code = 22;
      throw err;
    });

    // Erster Schreibversuch -> schlägt fehl, zeigt Toast
    const res1 = window.AppStorage.set('key1', { test: 1 });
    expect(res1).toBe(false);
    expect(toastCalls).toEqual(['Speicher voll – bitte Backup exportieren']);

    // Zweiter Schreibversuch -> schlägt fehl, darf Toast NICHT noch einmal zeigen
    const res2 = window.AppStorage.set('key2', { test: 2 });
    expect(res2).toBe(false);
    expect(toastCalls).toHaveLength(1);

    // Dritter Schreibversuch über setString -> ebenfalls kein erneuter Toast
    const res3 = window.AppStorage.setString('key3', 'val3');
    expect(res3).toBe(false);
    expect(toastCalls).toHaveLength(1);

    spy.mockRestore();
  });

  it('IDB_VAULT functions safely when indexedDB is undefined or inaccessible', async () => {
    if (typeof window.IDB_VAULT !== 'undefined') {
      const getRes = await window.IDB_VAULT.get('any_key');
      expect(getRes).toBe(null);
    }
  });
});
