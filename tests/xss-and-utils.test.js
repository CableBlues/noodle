import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

import '../utils.js';
import '../storage.js';

describe('XSS Protection & String Utils (Production Code)', () => {
  it('escapeHtml safely masks special HTML characters and quotes', () => {
    expect(window.escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(window.escapeHtml('Tomaten & Äpfel')).toBe('Tomaten &amp; Äpfel');
    expect(window.escapeHtml(`Aufgabe ' und "`)).toBe('Aufgabe &#039; und &quot;');
  });

  it('escapeHtml handles null, undefined, and non-strings safely', () => {
    expect(window.escapeHtml(null)).toBe('');
    expect(window.escapeHtml(undefined)).toBe('');
    expect(window.escapeHtml(12345)).toBe('12345');
    expect(window.escapeHtml(0)).toBe('0');
  });

  it('neutralizes complex malicious breakout payloads', () => {
    const payload = '<img src="x" onerror="alert(1)">';
    const escaped = window.escapeHtml(payload);
    expect(escaped).not.toContain('<img');
    expect(escaped).not.toContain('>');
  });

  it('escapeAttr and sanitizeIdentifier properly sanitize attributes and IDs', () => {
    expect(window.escapeAttr(`" onfocus="alert(1)`)).toBe('&quot; onfocus=&quot;alert(1)');
    expect(window.sanitizeIdentifier('task-123_valid:id')).toBe('task-123_valid:id');
    expect(window.sanitizeIdentifier(`task' onclick="bad()"`)).toBe('task__onclick__bad___');
    expect(window.sanitizeIdentifier(null, 'prefix')).toContain('prefix_');
  });
});

describe('AppStorage Abstraction (Production Code)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sets and retrieves JSON objects and arrays', () => {
    const tasks = [{ text: 'Code schreiben', done: false }];
    const success = window.AppStorage.set('test_tasks', tasks);
    expect(success).toBe(true);

    const loaded = window.AppStorage.get('test_tasks');
    expect(Array.isArray(loaded)).toBe(true);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].text).toBe('Code schreiben');
  });

  it('returns default fallback on missing key or corrupt JSON', () => {
    expect(window.AppStorage.get('non_existent_key', 'fallbackVal')).toBe('fallbackVal');

    localStorage.setItem('corrupted_key', '{invalid JSON]');
    expect(window.AppStorage.get('corrupted_key', 'fallbackFallback')).toBe('fallbackFallback');
  });

  it('gets, sets and removes raw strings safely', () => {
    window.AppStorage.setString('str_key', 'hello_world');
    expect(window.AppStorage.getString('str_key')).toBe('hello_world');

    window.AppStorage.remove('str_key');
    expect(window.AppStorage.getString('str_key', 'defaultStr')).toBe('defaultStr');
  });

  it('ErrorDiagnostics logs errors and retrieves recent history', () => {
    expect(window.ErrorDiagnostics).toBeDefined();
    window.ErrorDiagnostics.capture('Test error captured', { detail: 123 });
    const logs = window.ErrorDiagnostics.getLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[logs.length - 1].message).toBe('Test error captured');
  });
});

describe('Haptic Feedback (Production Code)', () => {
  it('triggerHapticFeedback gracefully handles environments without navigator.vibrate', () => {
    expect(() => window.triggerHapticFeedback('light')).not.toThrow();
    expect(() => window.triggerHapticFeedback('success')).not.toThrow();
  });
});

describe('Command Palette (Production Code)', () => {
  it('CommandPalette is exposed globally with open, close and toggle APIs', async () => {
    await import('../app-command-palette.js');
    expect(window.CommandPalette).toBeDefined();
    expect(typeof window.CommandPalette.open).toBe('function');
    expect(typeof window.CommandPalette.close).toBe('function');
    expect(typeof window.CommandPalette.toggle).toBe('function');
  });
});

describe('Onboarding Module (Production Code)', () => {
  it('startOnboardingTour, handleOnboardingNext and closeOnboardingTour are exposed and callable', async () => {
    await import('../onboarding.js');
    expect(typeof window.startOnboardingTour).toBe('function');
    expect(typeof window.closeOnboardingTour).toBe('function');
    expect(typeof window.handleOnboardingNext).toBe('function');
    expect(typeof window.handleOnboardingPrev).toBe('function');

    expect(() => window.startOnboardingTour()).not.toThrow();
    expect(() => window.handleOnboardingNext()).not.toThrow();
    expect(() => window.closeOnboardingTour()).not.toThrow();
  });
});


