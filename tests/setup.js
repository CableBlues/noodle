// tests/setup.js
import { beforeEach } from 'vitest';

// Setup browser globals mock if needed
const mockStorage = {};
const localStorageMock = {
  getItem: (k) => mockStorage[k] !== undefined ? mockStorage[k] : null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = localStorageMock;
}
if (typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis;
}
if (typeof window !== 'undefined') {
  if (!window.TextEncoder && typeof TextEncoder !== 'undefined') {
    window.TextEncoder = TextEncoder;
  }
  if (!window.TextDecoder && typeof TextDecoder !== 'undefined') {
    window.TextDecoder = TextDecoder;
  }
  if (!window.speechSynthesis) {
    window.speechSynthesis = {
      getVoices: () => [],
      speak: () => {},
      cancel: () => {},
      pause: () => {},
      resume: () => {},
      onvoiceschanged: null
    };
  }
}

