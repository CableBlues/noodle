import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

describe('Timer Flow & Overdue Motivation Integration', () => {
  it('timer-1.js defines positive, encouraging TIME_UP_PHRASES without stop/quitting commands', () => {
    const fileContent = fs.readFileSync(path.resolve(rootDir, 'timer-1.js'), 'utf-8');
    
    expect(fileContent).not.toContain('"Die Zeit ist abgelaufen!"');
    expect(fileContent).not.toContain('"Time is up!"');
    expect(fileContent).toContain('Fokuszeit gemeistert!');
    expect(fileContent).toContain('Flow');
  });

  it('timer-1.js defines positive OVERDUE labels emphasizing flow extension', () => {
    const fileContent = fs.readFileSync(path.resolve(rootDir, 'timer-1.js'), 'utf-8');

    expect(fileContent).toContain('30 Sekunden im Flow.');
    expect(fileContent).toContain('Flow-Verlängerung');
    expect(fileContent).not.toContain('30 Sekunden über der Zeit.');
    expect(fileContent).not.toContain('Minuten überzogen');
  });

  it('timer-1.js contains task-aware overdue motivation phrases with {task}', () => {
    const fileContent = fs.readFileSync(path.resolve(rootDir, 'timer-1.js'), 'utf-8');

    expect(fileContent).toContain("Starker Flow bei '{task}'. Zieh es voll durch!");
    expect(fileContent).toContain("Klasse Leistung bei '{task}'. Wenn du magst, hast du dir eine Pause redlich verdient.");
  });

  it('timer-2.js ringing modal provides encouraging flow options and gentle break options', () => {
    const fileContent = fs.readFileSync(path.resolve(rootDir, 'timer-2.js'), 'utf-8');

    expect(fileContent).toContain('Fokuszeit gemeistert! ✨');
    expect(fileContent).toContain('Im Flow weiterarbeiten 🚀');
    expect(fileContent).toContain('Im Flow bleiben 🚀');
    expect(fileContent).toContain('Pause machen / Beenden ☕');
    expect(fileContent).not.toContain('bg-rose-500/15 border border-rose-500/30');
  });

  it('timer-3.js updates browser tab and status to Flow without overtime warnings', () => {
    const fileContent = fs.readFileSync(path.resolve(rootDir, 'timer-3.js'), 'utf-8');

    expect(fileContent).toContain('Flow-Verlängerung');
    expect(fileContent).toContain('🚀 Flow — Noodle Studio');
    expect(fileContent).not.toContain('⚠️ Overtime — Noodle Studio');
    expect(fileContent).not.toContain('⚠️ Überzeit');
  });

  it('timer-1.js defines broad, alternating VOICE_PROFILES for woman, man, and young child', () => {
    const fileContent = fs.readFileSync(path.resolve(rootDir, 'timer-1.js'), 'utf-8');

    // Personas check
    expect(fileContent).toContain("id: 'female_warm'");
    expect(fileContent).toContain("id: 'male_warm'");
    expect(fileContent).toContain("id: 'child_cheerful'");
    expect(fileContent).toContain("id: 'child_playful'");
    expect(fileContent).toContain("id: 'child_explorer'");
    expect(fileContent).toContain("id: 'child_gentle'");

    // Child pitch verification (> 1.35)
    expect(fileContent).toContain("pitch: 1.46");
    expect(fileContent).toContain("pitch: 1.58");

    // Sequence & preview helper exports
    expect(fileContent).toContain('speakVoiceSequence');
    expect(fileContent).toContain('previewVoiceCategory');
  });

  it('timer-3.js integrates voice preview buttons and tandem alternating voice announcements', () => {
    const fileContent = fs.readFileSync(path.resolve(rootDir, 'timer-3.js'), 'utf-8');

    // Cockpit UI previews
    expect(fileContent).toContain("previewVoiceCategory('female')");
    expect(fileContent).toContain("previewVoiceCategory('male')");
    expect(fileContent).toContain("previewVoiceCategory('child')");

    // Tandem sequence speech
    expect(fileContent).toContain('speakVoiceSequence(speechItems');
  });
});
