import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';

describe('Timer Real-World Execution Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="timer-trigger-container"></div>
      <span id="timer-display">02:00</span>
      <div id="timer-progress-bar" style="width: 100%"></div>
      <button id="timer-play-btn"></button>
      <button id="timer-pause-btn" class="hidden"></button>
      <button id="timer-stop-btn"></button>
      <button id="timer-mute-btn"></button>
      <span id="mobile-timer-display">02:00</span>
      <span id="zen-timer-display">25:00</span>
      <span id="zen-timer-status">Bereit</span>
      <button id="zen-play-btn"></button>
      <button id="zen-pause-btn" class="hidden"></button>
      <input type="hidden" id="timer-preset-select-real" value="2">
    `;

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

    // Load timer scripts into window context
    const t1 = fs.readFileSync('timer-1.js', 'utf8');
    const t2 = fs.readFileSync('timer-2.js', 'utf8');
    const t3 = fs.readFileSync('timer-3.js', 'utf8');
    new Function('window', 'document', 'globalThis', t1)(window, document, window);
    new Function('window', 'document', 'globalThis', t2)(window, document, window);
    new Function('window', 'document', 'globalThis', t3)(window, document, window);
  });

  it('initializes timer correctly to preset duration', () => {
    expect(window.timerSeconds).toBe(120);
    expect(window.timerInitialSeconds).toBe(120);
    expect(window.timerRunning).toBe(false);
    expect(document.getElementById('timer-display').innerText).toBe('02:00');
  });

  it('starts timer, ticks every second and updates UI displays', () => {
    vi.useFakeTimers();
    window.startTimer();
    expect(window.timerRunning).toBe(true);
    expect(window.timerTargetEndTime).toBeGreaterThan(Date.now());

    // Advance 1 second
    vi.advanceTimersByTime(1000);
    expect(document.getElementById('timer-display').innerText).toBe('01:59');

    // Advance 10 seconds
    vi.advanceTimersByTime(10000);
    expect(document.getElementById('timer-display').innerText).toBe('01:49');

    // Advance 60 seconds
    vi.advanceTimersByTime(60000);
    expect(document.getElementById('timer-display').innerText).toBe('00:49');

    vi.useRealTimers();
  });

  it('handles pause and resume without resetting target time', () => {
    vi.useFakeTimers();
    window.startTimer();
    vi.advanceTimersByTime(30000); // 30s elapsed -> 90s left
    expect(document.getElementById('timer-display').innerText).toBe('01:30');

    window.pauseTimer();
    expect(window.timerRunning).toBe(false);
    expect(window.timerSeconds).toBe(90);

    // Wait while paused
    vi.advanceTimersByTime(10000);
    expect(window.timerSeconds).toBe(90);
    expect(document.getElementById('timer-display').innerText).toBe('01:30');

    // Resume
    window.startTimer();
    expect(window.timerRunning).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(document.getElementById('timer-display').innerText).toBe('01:29');

    vi.useRealTimers();
  });

  it('handles zero crossing and enters overtime smoothly', () => {
    vi.useFakeTimers();
    window.startTimer();
    // Advance full 120 seconds
    vi.advanceTimersByTime(120000);
    expect(document.getElementById('timer-display').innerText).toBe('00:00');

    // 5 seconds overtime
    vi.advanceTimersByTime(5000);
    expect(document.getElementById('timer-display').innerText).toBe('-00:05');

    // 35 seconds overtime
    vi.advanceTimersByTime(30000);
    expect(document.getElementById('timer-display').innerText).toBe('-00:35');

    vi.useRealTimers();
  });

  it('changing preset updates display and reset initial time', () => {
    window.setTimerPreset(25);
    expect(window.timerSeconds).toBe(1500);
    expect(window.timerInitialSeconds).toBe(1500);
    expect(document.getElementById('timer-display').innerText).toBe('25:00');
    expect(document.getElementById('zen-timer-display').innerText).toBe('25:00');
  });
});
