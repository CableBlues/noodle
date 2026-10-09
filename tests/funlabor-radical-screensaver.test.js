import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

describe('Funlabor Radical Screensaver & App-Breaking Effects', () => {
  it('app-humor.js implements the radical app-breaking chaos effects (without BSOD)', () => {
    const fileContent = fs.readFileSync(path.resolve(rootDir, 'app-humor.js'), 'utf-8');

    // Verify BSOD is removed
    expect(fileContent).not.toContain('function toggleBSOD');
    // Verify radical effects exist
    expect(fileContent).toContain('function toggleGravityCollapse');
    expect(fileContent).toContain('function toggleEarthquake');
    expect(fileContent).toContain('function toggleMeltingUI');
    expect(fileContent).toContain('function toggleHackerCorruption');
    expect(fileContent).toContain('function toggleFleeingUI');
    expect(fileContent).toContain('function toggleUpsideDown');
    expect(fileContent).toContain('function toggleCRTBreakdown');
  });

  it('idle screensaver defaults to 3 minutes (less frequent) with configurable intervals', () => {
    const fileContent = fs.readFileSync(path.resolve(rootDir, 'app-humor.js'), 'utf-8');

    // Default timeout must be 3 minutes (rare)
    expect(fileContent).toContain('return 3; // Standard: 3 Minuten');
    expect(fileContent).toContain('function getIdleTimeoutMinutes()');
    expect(fileContent).toContain('function setIdleTimeoutMinutes(');
    expect(fileContent).toContain('noodle_idle_timeout_min');
  });

  it('idle screensaver supports configurable mode selection (mixed, radical, ambient)', () => {
    const fileContent = fs.readFileSync(path.resolve(rootDir, 'app-humor.js'), 'utf-8');

    expect(fileContent).toContain('function getIdleMode()');
    expect(fileContent).toContain('function setIdleMode(');
    expect(fileContent).toContain("RADICAL_FX_POOL = [");
    expect(fileContent).toContain("AMBIENT_FX_POOL = [");
    expect(fileContent).toContain("mode === 'radical'");
    expect(fileContent).toContain("mode === 'ambient'");
    expect(fileContent).toContain("return 'mixed';");
    expect(fileContent).toContain("idleMode === 'mixed'");
  });

  it('SoundFX synthesizer includes buzz, thud, glitch, reboot and squeak', () => {
    const fileContent = fs.readFileSync(path.resolve(rootDir, 'app-humor.js'), 'utf-8');

    expect(fileContent).toContain('buzz: function()');
    expect(fileContent).toContain('thud: function()');
    expect(fileContent).toContain('glitch: function()');
    expect(fileContent).toContain('reboot: function()');
    expect(fileContent).toContain('squeak: function()');
  });

  it('HumorEngine exports all radical effects, timeout and mode controls', () => {
    const fileContent = fs.readFileSync(path.resolve(rootDir, 'app-humor.js'), 'utf-8');

    expect(fileContent).not.toContain('toggleBSOD,');
    expect(fileContent).toContain('toggleGravityCollapse,');
    expect(fileContent).toContain('toggleEarthquake,');
    expect(fileContent).toContain('toggleMeltingUI,');
    expect(fileContent).toContain('toggleHackerCorruption,');
    expect(fileContent).toContain('toggleFleeingUI,');
    expect(fileContent).toContain('toggleUpsideDown,');
    expect(fileContent).toContain('toggleCRTBreakdown,');
    expect(fileContent).toContain('getIdleTimeoutMinutes,');
    expect(fileContent).toContain('setIdleTimeoutMinutes,');
    expect(fileContent).toContain('getIdleMode,');
    expect(fileContent).toContain('setIdleMode,');
  });

  it('renderHumorPanel renders radical glitch buttons, interval pills and mode pills in UI', () => {
    const fileContent = fs.readFileSync(path.resolve(rootDir, 'app-humor.js'), 'utf-8');

    // Section title
    expect(fileContent).toMatch(/Radikale Glitches|Radical Glitches/);
    // Button hooks (BSOD removed)
    expect(fileContent).not.toContain('HumorEngine.toggleBSOD()');
    expect(fileContent).toContain('HumorEngine.toggleGravityCollapse()');
    expect(fileContent).toContain('HumorEngine.toggleEarthquake()');
    expect(fileContent).toContain('HumorEngine.toggleMeltingUI()');
    expect(fileContent).toContain('HumorEngine.toggleHackerCorruption()');
    expect(fileContent).toContain('HumorEngine.toggleFleeingUI()');
    expect(fileContent).toContain('HumorEngine.toggleUpsideDown()');
    expect(fileContent).toContain('HumorEngine.toggleCRTBreakdown()');
    // Interval pills
    expect(fileContent).toContain('HumorEngine.setIdleTimeoutMinutes(2)');
    expect(fileContent).toContain('HumorEngine.setIdleTimeoutMinutes(3)');
    expect(fileContent).toContain('HumorEngine.setIdleTimeoutMinutes(5)');
    expect(fileContent).toContain('HumorEngine.setIdleTimeoutMinutes(10)');
    // Mode pills
    expect(fileContent).toContain("HumorEngine.setIdleMode('mixed')");
    expect(fileContent).toContain("HumorEngine.setIdleMode('radical')");
    expect(fileContent).toContain("HumorEngine.setIdleMode('ambient')");
  });

  it('panicReset cleanly resets active effects, overlays, styles, and body classes', () => {
    const fileContent = fs.readFileSync(path.resolve(rootDir, 'app-humor.js'), 'utf-8');

    expect(fileContent).toContain('activeCleanups.pop()');
    expect(fileContent).not.toContain('humor-bsod-screen');
    expect(fileContent).toContain('humor-melting-svg');
    expect(fileContent).toContain('humor-crt-screen');
    expect(fileContent).toContain('chaos-earthquake');
    expect(fileContent).toContain('chaos-upside-down');
    expect(fileContent).toContain('humor-melting-active');
    expect(fileContent).toContain('humor-fleeing-target');
  });

  it('implements 10 additional crazy, humorous, app-breaking effects with UI buttons and SoundFX', () => {
    const fileContent = fs.readFileSync(path.resolve(rootDir, 'app-humor.js'), 'utf-8');

    // Function declarations
    expect(fileContent).toContain('function toggleGlassShatter');
    expect(fileContent).toContain('function toggleDvdBounce');
    expect(fileContent).toContain('function toggleVHSGlitch');
    expect(fileContent).toContain('function toggleNervousTwitch');
    expect(fileContent).toContain('function toggleAntiGravityFloat');
    expect(fileContent).toContain('function toggleBlackHoleSingularity');
    expect(fileContent).toContain('function toggleTornadoSpins');
    expect(fileContent).toContain('function toggleFakeRansomware');
    expect(fileContent).toContain('function togglePixelate');
    expect(fileContent).toContain('function toggleTimeWarp');

    // SoundFX additions
    expect(fileContent).toContain('explosion: function()');
    expect(fileContent).toContain('shatter: function()');
    expect(fileContent).toContain('dvdHit: function()');
    expect(fileContent).toContain('rewind: function()');

    // HumorEngine exports
    expect(fileContent).toContain('toggleGlassShatter,');
    expect(fileContent).toContain('toggleDvdBounce,');
    expect(fileContent).toContain('toggleVHSGlitch,');
    expect(fileContent).toContain('toggleNervousTwitch,');
    expect(fileContent).toContain('toggleAntiGravityFloat,');
    expect(fileContent).toContain('toggleBlackHoleSingularity,');
    expect(fileContent).toContain('toggleTornadoSpins,');
    expect(fileContent).toContain('toggleFakeRansomware,');
    expect(fileContent).toContain('togglePixelate,');
    expect(fileContent).toContain('toggleTimeWarp,');

    // UI Buttons in renderHumorPanel
    expect(fileContent).toContain('HumorEngine.toggleGlassShatter()');
    expect(fileContent).toContain('HumorEngine.toggleDvdBounce()');
    expect(fileContent).toContain('HumorEngine.toggleVHSGlitch()');
    expect(fileContent).toContain('HumorEngine.toggleNervousTwitch()');
    expect(fileContent).toContain('HumorEngine.toggleAntiGravityFloat()');
    expect(fileContent).toContain('HumorEngine.toggleBlackHoleSingularity()');
    expect(fileContent).toContain('HumorEngine.toggleTornadoSpins()');
    expect(fileContent).toContain('HumorEngine.toggleFakeRansomware()');
    expect(fileContent).toContain('HumorEngine.togglePixelate()');
    expect(fileContent).toContain('HumorEngine.toggleTimeWarp()');
  });
});
