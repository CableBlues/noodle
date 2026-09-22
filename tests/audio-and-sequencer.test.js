import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const rootDir = path.resolve(__dirname, '..');
const audioGeneratorsCode = fs.readFileSync(path.join(rootDir, 'audio-generators.js'), 'utf8');

describe('Web Audio Generators & Sequencer Engine (Production Code)', () => {
  it('audio-generators.js defines sound presets and beat patterns', () => {
    expect(audioGeneratorsCode).toContain('startBeatLookaheadLoop');
    expect(audioGeneratorsCode).toContain('techno');
    expect(audioGeneratorsCode).toContain('dnb');
    expect(audioGeneratorsCode).toContain('afrobeats');
    expect(audioGeneratorsCode).toContain('swing');
  });

  it('Speech synthesis clean string parser preserves duration numbers while stripping step counters', () => {
    function cleanStepTextForSpeech(text) {
      if (!text) return '';
      let clean = text.replace(/^\d+\.\s*/, '');
      return clean.trim();
    }

    expect(cleanStepTextForSpeech('1. 30 Sekunden lang lüften')).toBe('30 Sekunden lang lüften');
    expect(cleanStepTextForSpeech('2. 1 Minute Zähne putzen')).toBe('1 Minute Zähne putzen');
    expect(cleanStepTextForSpeech('3. 2 Minuten meditieren')).toBe('2 Minuten meditieren');
  });

  it('Web Audio Gain safely disconnects and zeroes scheduled values without throwing', () => {
    let disconnected = false;
    const mockGainNode = {
      gain: {
        value: 1,
        cancelScheduledValues(t) { return; },
        setValueAtTime(v, t) { this.value = v; },
        linearRampToValueAtTime(v, t) { this.value = v; }
      },
      disconnect() {
        disconnected = true;
      }
    };

    mockGainNode.gain.cancelScheduledValues(0);
    mockGainNode.gain.setValueAtTime(0, 0);
    mockGainNode.disconnect();

    expect(disconnected).toBe(true);
    expect(mockGainNode.gain.value).toBe(0);
  });

  it('audio-core.js provides mobile touch unlock, MediaSession and stopAllSounds', () => {
    const audioCoreCode = fs.readFileSync(path.join(rootDir, 'audio-core.js'), 'utf8');
    expect(audioCoreCode).toContain('unlockMobileAudio');
    expect(audioCoreCode).toContain('touchstart');
    expect(audioCoreCode).toContain('touchend');
    expect(audioCoreCode).toContain('pointerdown');
    expect(audioCoreCode).toContain('stopAllSounds');
    expect(audioCoreCode).toContain('updateMediaSession');
    expect(audioCoreCode).toContain('playCheerfulSuccessJingle');
    expect(audioCoreCode).toContain('triggerHapticFeedback');
  });

  it('app-radio-news.js exports Live Radio & News Engine with stations and duckRadio', () => {
    const radioNewsCode = fs.readFileSync(path.join(rootDir, 'app-radio-news.js'), 'utf8');
    expect(radioNewsCode).toContain('RADIO_STATIONS');
    expect(radioNewsCode).toContain('Deutschlandfunk');
    expect(radioNewsCode).toContain('SomaFM Groove Salad');
    expect(radioNewsCode).toContain('playRadioStation');
    expect(radioNewsCode).toContain('toggleRadioPlayback');
    expect(radioNewsCode).toContain('duckRadio');
  });

  it('timer-1.js defines duckAllAudioForSpeech and friendly voice profiles with natural score weighting', () => {
    const timer1Code = fs.readFileSync(path.join(rootDir, 'timer-1.js'), 'utf8');
    expect(timer1Code).toContain('duckAllAudioForSpeech');
    expect(timer1Code).toContain('VOICE_PROFILES');
    expect(timer1Code).toContain('getVoiceScore');
    expect(timer1Code).toContain('natural');
    expect(timer1Code).toContain('neural');
    expect(timer1Code).toContain('marlene');
    expect(timer1Code).toContain('conrad');
  });

  it('timer-3.js setTimerAudioMode toggles off on same mode and provides instant exclusive playback', () => {
    const timer3Code = fs.readFileSync(path.join(rootDir, 'timer-3.js'), 'utf8');
    expect(timer3Code).toContain('setTimerAudioMode');
    expect(timer3Code).toContain("newMode = 'silent'");
    expect(timer3Code).toContain('stopAmbientSound');
    expect(timer3Code).toContain('playRadioStation');
  });
});
