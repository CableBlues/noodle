import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const rootDir = path.resolve(__dirname, '..');
const sportCode = fs.readFileSync(path.join(rootDir, 'sport.js'), 'utf8');
const audioCoreCode = fs.readFileSync(path.join(rootDir, 'audio-core.js'), 'utf8');
const brainstormCode = fs.readFileSync(path.join(rootDir, 'helper-brainstorm.js'), 'utf8');
const learningCode = fs.readFileSync(path.join(rootDir, 'helper-learning.js'), 'utf8');

describe('Option 1: Bewegung & Home-Workout Studio Enhancements', () => {
  it('contains new library exercises for Yoga, Screen Fatigue, Silent HIIT, and Mobility', () => {
    expect(sportCode).toContain('yoga_sun_salute_flow');
    expect(sportCode).toContain('yoga_warrior_balance');
    expect(sportCode).toContain('eye_focus_20_20');
    expect(sportCode).toContain('neck_acupressure_glide');
    expect(sportCode).toContain('hiit_silent_mountain_climber');
    expect(sportCode).toContain('hiit_speed_skater_glide');
    expect(sportCode).toContain('mobility_hip_90_90');
    expect(sportCode).toContain('mobility_open_book_thoracic');
  });

  it('defines new workout presets for Morning Yoga, Screen Fatigue, Silent HIIT, and Spine Freedom', () => {
    expect(sportCode).toContain('yoga_morning_flow_8');
    expect(sportCode).toContain('screen_fatigue_anti_headache_5');
    expect(sportCode).toContain('hiit_silent_fatburn_10');
    expect(sportCode).toContain('spine_hips_mobility_10');
  });

  it('exports movement history and procedural gong functions', () => {
    expect(sportCode).toContain('getMovementHistory');
    expect(sportCode).toContain('logCompletedMovementEntry');
    expect(sportCode).toContain('deleteMovementHistoryItem');
    expect(sportCode).toContain('clearAllMovementHistory');
    expect(sportCode).toContain('playSportProceduralGong');
    expect(sportCode).toContain('renderMovementHistoryUI');
  });
});

describe('Option 3: Audio & Focus Studio (Multi-Track Mixer & Binaural Beats)', () => {
  it('defines multi-track ambient layer state and volume controls', () => {
    expect(audioCoreCode).toContain('activeAmbientLayers');
    expect(audioCoreCode).toContain('toggleAmbientLayer');
    expect(audioCoreCode).toContain('setAmbientLayerVolume');
    expect(audioCoreCode).toContain('stopAllAmbientLayers');
    expect(audioCoreCode).toContain('SOUND_MIX_PRESETS');
    expect(audioCoreCode).toContain('applySoundMixPreset');
  });

  it('implements binaural focus frequencies (Alpha 10Hz, Theta 6Hz, Gamma 40Hz)', () => {
    expect(audioCoreCode).toContain('activeBinauralBeat');
    expect(audioCoreCode).toContain('toggleBinauralBeat');
    expect(audioCoreCode).toContain('playBinauralBeat');
    expect(audioCoreCode).toContain('stopBinauralBeat');
    expect(audioCoreCode).toContain('setBinauralVolume');
    expect(audioCoreCode).toContain('Alpha (10 Hz)');
    expect(audioCoreCode).toContain('Theta (6 Hz)');
    expect(audioCoreCode).toContain('Gamma (40 Hz)');
  });
});

describe('Option 4: Brainstorming Studio & Wissens-Labor', () => {
  it('supports Mindmap/Cluster view modes and structured Action Plan export in Brainstorming Studio', () => {
    expect(brainstormCode).toContain('brainstormViewMode');
    expect(brainstormCode).toContain('setBrainstormViewMode');
    expect(brainstormCode).toContain('copyBrainstormAsMindmap');
    expect(brainstormCode).toContain('exportBrainstormAsActionPlan');
  });

  it('contains Spaced Repetition (Leitner Box System) and new Curated Knowledge Packs', () => {
    expect(learningCode).toContain('SR_STORAGE_KEY');
    expect(learningCode).toContain('rateQuestionSR');
    expect(learningCode).toContain('productivity_science');
    expect(learningCode).toContain('sleep_recovery');
    expect(learningCode).toContain('Parkinson');
    expect(learningCode).toContain('Zeigarnik');
    expect(learningCode).toContain('Ultradian');
    expect(learningCode).toContain('Adenosin');
    expect(learningCode).toContain('NSDR');
  });
});
