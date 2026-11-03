import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Was-Nun Entscheidungsassistent: Dauerschätzung, Verteilung & Buttons', () => {
  const helperCorePath = path.join(process.cwd(), 'helper-core.js');
  const indexHtmlPath = path.join(process.cwd(), 'index.html');
  const helperCoreCode = fs.readFileSync(helperCorePath, 'utf8');
  const indexHtmlCode = fs.readFileSync(indexHtmlPath, 'utf8');

  it('enthält die intelligente Dauerschätzung estimateTaskDuration', () => {
    expect(helperCoreCode).toContain('function estimateTaskDuration(');
  });

  it('entfernt den Vorschlags-Button aus dem Header und der unteren Footerleiste in index.html', () => {
    expect(indexHtmlCode).not.toContain('id="helper-pick-refresh-header"');
    expect(indexHtmlCode).not.toContain('<div class="flex items-center justify-between gap-2 pt-1 border-t border-white/5 text-[10px] text-gray-400">');
  });

  it('platziert "Anderer Vorschlag" und den einzigen edlen "Fokus starten" Button via btn-primary direkt am Vorschlag', () => {
    // 1. Der einzige Start-Button mit hochwertigem btn-primary Design
    expect(helperCoreCode).toContain('id="whatnow-start-btn" onclick="startWhatNowCurrentFocus()" class="btn-primary');
    expect(helperCoreCode).toContain('Fokus starten (${currentWhatNowSelectedMinutes} Min.)');
    
    // 2. Kein billig wirkender Gradient
    expect(helperCoreCode).not.toContain('from-amber-500 via-amber-400 to-orange-500');

    // 3. Kein separater 2-Min-Start Button unter dem Haupt-Start-Button im Vorschlagskasten
    expect(helperCoreCode).not.toContain('2-Min Start</span>');

    // 4. Anderer Vorschlag Button direkt am Vorschlagskasten
    expect(helperCoreCode).toContain('id="helper-pick-next-btn"');
    expect(helperCoreCode).toContain('<span>Anderer Vorschlag</span>');
  });

  it('bietet interaktive Zeitauswahl-Chips (5, 15, 25, 45, 60 Min) und setWhatNowDuration', () => {
    expect(helperCoreCode).toContain('function setWhatNowDuration(');
    expect(helperCoreCode).toContain('function startWhatNowCurrentFocus(');
    expect(helperCoreCode).toContain('id="whatnow-chip-${m}"');
    expect(helperCoreCode).toContain('[5, 15, 25, 45, 60]');
  });

  it('koppelt die Standardzeit beim Kategoriewechsel exakt an Quick-Win (5 Min), Fokus (25 Min) und Deep Work (45 Min)', () => {
    // Prüfe setWhatNowEnergyLevel Logik
    expect(helperCoreCode).toContain("if (level === 'low')");
    expect(helperCoreCode).toContain('currentWhatNowSelectedMinutes = 5;');
    expect(helperCoreCode).toContain("else if (level === 'high')");
    expect(helperCoreCode).toContain('currentWhatNowSelectedMinutes = 45;');
    expect(helperCoreCode).toContain('currentWhatNowSelectedMinutes = 25;');
  });

  it('unterscheidet Quick Win, Fokus und Deep Work präzise nach ihrer Dauer', () => {
    const fnMatch = helperCoreCode.match(/function estimateTaskDuration\([\s\S]*?\n\}/);
    expect(fnMatch).toBeTruthy();
    
    const isHouseworkTask = (t) => /geschirr|wäsche|saugen|putzen|müll/i.test(t);
    const estimate = new Function('rawItem', 'taskText', 'cat', 'totalSteps', 'isHouseworkTask', `
      ${fnMatch[0]}
      return estimateTaskDuration(rawItem, taskText, cat, totalSteps);
    `);

    // Explizite Zeitangaben im Text
    expect(estimate(null, '5 min lüften', 'daily', 0, isHouseworkTask)).toBe(5);
    expect(estimate(null, '15 Min. Spaziergang', 'daily', 0, isHouseworkTask)).toBe(15);
    expect(estimate(null, 'Fokus-Block 1 (90 Min. Deep Work)', 'todo', 0, isHouseworkTask)).toBe(90);
    expect(estimate(null, 'Klausur lernen (2 Stunden)', 'study_focus', 0, isHouseworkTask)).toBe(120);

    // Explizite Objekt-Attribute
    expect(estimate({ estimatedMinutes: 8 }, 'Schnellcheck', 'todo', 0, isHouseworkTask)).toBe(8);
    expect(estimate({ duration: '45 Min' }, 'Große Analyse', 'todo', 0, isHouseworkTask)).toBe(45);

    // Signalwörter Quick Win vs Deep Work
    expect(estimate(null, 'Kurz E-Mails checken', 'todo', 0, isHouseworkTask)).toBe(10);
    expect(estimate(null, 'Großes Projekt refactoren & Architektur planen', 'todo', 0, isHouseworkTask)).toBe(50);

    // Subtasks
    expect(estimate(null, 'Aufgabe mit vielen Teilschritten', 'todo', 6, isHouseworkTask)).toBe(50);
  });
});
