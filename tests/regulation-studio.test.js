import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Achtsamkeit, Nervensystem & Atem-Coach Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    document.body.innerHTML = `
      <div id="modal-regulation" class="hidden">
        <div id="reg-pane-reset"></div>
        <div id="reg-pane-grounding"></div>
        <div id="reg-pane-somatic"></div>
        <div id="reg-pane-mind"></div>
        <div id="reg-pane-audio"></div>
        <div id="reg-pane-crisis"></div>

        <button id="reg-tab-btn-reset"></button>
        <button id="reg-tab-btn-grounding"></button>
        <button id="reg-tab-btn-somatic"></button>
        <button id="reg-tab-btn-mind"></button>
        <button id="reg-tab-btn-audio"></button>
        <button id="reg-tab-btn-crisis"></button>

        <div id="reg-sigh-circle"></div>
        <div id="reg-sigh-label"></div>
        <div id="reg-sigh-sub"></div>
        <div id="reg-sigh-timer"></div>
        <button id="reg-pacer-toggle-btn"></button>

        <button id="reg-bilateral-toggle-btn"></button>
        <div id="reg-bilateral-left"></div>
        <div id="reg-bilateral-right"></div>

        <div id="reg-ground-title"></div>
        <div id="reg-ground-text"></div>
        <div id="reg-ground-bar"></div>
        <div id="reg-ground-badge"></div>

        <button id="reg-shake-btn"></button>
        <div id="reg-shake-count"></div>
        <div id="reg-shake-status"></div>
        <div id="reg-shake-ring"></div>

        <button id="reg-audio-btn-432"><span class="audio-state-text"></span></button>
        <button id="reg-audio-btn-theta"><span class="audio-state-text"></span></button>
        <button id="reg-audio-btn-ocean"><span class="audio-state-text"></span></button>

        <div id="reg-sud-pre-display"></div>
        <div id="reg-sud-post-display"></div>
        ${Array.from({ length: 10 }, (_, i) => `<button id="reg-sud-btn-${i + 1}"></button>`).join('')}
      </div>
    `;

    global.currentLang = 'de';
    global.showToast = vi.fn();
    global.renderLucideIcons = vi.fn();
    global.playProceduralSound = vi.fn();

    const code = fs.readFileSync(path.join(process.cwd(), 'app-regulation.js'), 'utf8');
    eval(code);
  });

  afterEach(() => {
    window.RegulationStudio.closeModal();
    vi.useRealTimers();
  });

  it('should open regulation studio modal and switch tabs smoothly', () => {
    window.openRegulationModal('reset');
    const modal = document.getElementById('modal-regulation');
    expect(modal.classList.contains('hidden')).toBe(false);

    window.switchRegulationTab('grounding');
    const groundPane = document.getElementById('reg-pane-grounding');
    expect(groundPane.classList.contains('hidden')).toBe(false);
  });

  it('should manage multi-pattern breath coach configurations (Box, 4-7-8, Sigh, Coherence)', () => {
    const patterns = window.RegulationStudio.BREATH_PATTERNS;
    expect(patterns.sigh).toBeDefined();
    expect(patterns.box).toBeDefined();
    expect(patterns.relax478).toBeDefined();
    expect(patterns.coherence).toBeDefined();

    // Box breathing has 4 equal phases
    expect(patterns.box.phases.length).toBe(4);
    expect(patterns.box.phases[0].duration).toBe(4000);

    // Switch active pattern
    window.RegulationStudio.setPattern('box');
    window.RegulationStudio.togglePacer(); // Start

    const label = document.getElementById('reg-sigh-label');
    expect(label.innerText).toContain('Einatmen');

    // Fast-forward 4000ms
    vi.advanceTimersByTime(4000);
    expect(label.innerText).toContain('Halten');

    window.RegulationStudio.togglePacer(); // Stop
  });

  it('should advance through 5-4-3-2-1 Sensory Grounding steps', () => {
    window.switchRegulationTab('grounding');
    const titleEl = document.getElementById('reg-ground-title');
    expect(titleEl.innerText).toContain('SEHEN');

    window.RegulationStudio.nextGrounding();
    expect(titleEl.innerText).toContain('SPÜREN');

    window.RegulationStudio.nextGrounding();
    expect(titleEl.innerText).toContain('HÖREN');
  });

  it('should track pre and post distress on the SUD scale and show improvement', () => {
    // 1. Record baseline SUD (8/10)
    window.RegulationStudio.selectSUD(8);
    const preDisplay = document.getElementById('reg-sud-pre-display');
    expect(preDisplay.innerText).toContain('8/10');

    // 2. Record post SUD (3/10)
    window.RegulationStudio.selectSUD(3);
    const postDisplay = document.getElementById('reg-sud-post-display');
    expect(postDisplay.innerText).toContain('3/10');
    expect(global.showToast).toHaveBeenCalled();
  });
});
