import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

import '../config.js';
import '../utils.js';
import '../data-translations-1.js';
import '../data-translations-2.js';
import '../data-translations.js';
import '../storage.js';
import '../data-tasks.js';
import '../state.js';
import '../app-tasks.js';
import '../helper-brainstorm.js';
import '../helper-ocr-scanner.js';

describe('Handwriting OCR & Note Scanner Module', () => {
  beforeEach(() => {
    const sanitizedHtml = indexHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '')
      .replace(/<link[^>]*>/gis, '');
    document.body.innerHTML = sanitizedHtml;
    window.state = window.migrateState(null, 'de');
    globalThis.state = window.state;
    globalThis.TRANSLATIONS = typeof TRANSLATIONS !== 'undefined' ? TRANSLATIONS : { de: {}, en: {} };
  });

  it('postProcessOcrText cleans noise and formats text lines correctly', () => {
    expect(typeof window.postProcessOcrText).toBe('function');
    const raw = '   \n  • Erstes Brainstorming Idea  \n  ---  \n  \n  Zweiter Punkt  \n  ____  \n';
    const cleaned = window.postProcessOcrText(raw);
    expect(cleaned).toBe('• Erstes Brainstorming Idea\nZweiter Punkt');
  });

  it('openNoteScannerModal creates modal DOM and updates context for brainstorm', () => {
    window.openNoteScannerModal('brainstorm');
    const modal = document.getElementById('note-scanner-modal');
    expect(modal).toBeTruthy();
    expect(modal.classList.contains('hidden')).toBe(false);

    const badge = document.getElementById('scanner-context-badge');
    expect(badge).toBeTruthy();
    expect(badge.innerText).toBe('BRAINSTORMING');

    const brainstormTagSelect = document.getElementById('scanner-brainstorm-tag');
    expect(brainstormTagSelect).toBeTruthy();

    window.closeNoteScannerModal();
    expect(modal.classList.contains('hidden')).toBe(true);
  });

  it('openNoteScannerModal creates modal DOM and updates context for notes column', () => {
    window.openNoteScannerModal('notes');
    const modal = document.getElementById('note-scanner-modal');
    expect(modal).toBeTruthy();
    expect(modal.classList.contains('hidden')).toBe(false);

    const badge = document.getElementById('scanner-context-badge');
    expect(badge).toBeTruthy();
    expect(badge.innerText).toBe('NOTIZENKARTE');

    window.closeNoteScannerModal();
  });

  it('importScannedTextToBrainstorm adds brainstorm idea with selected tag', () => {
    window.openNoteScannerModal('brainstorm');
    const resultTextarea = document.getElementById('scanner-ocr-result-text');
    const tagSelect = document.getElementById('scanner-brainstorm-tag');
    expect(resultTextarea).toBeTruthy();
    expect(tagSelect).toBeTruthy();

    resultTextarea.value = 'Neues Feature Konzept';
    tagSelect.value = 'project';

    window.importScannedTextToBrainstorm();

    const ideas = window.getBrainstormIdeas();
    expect(ideas.length).toBeGreaterThan(0);
    const lastIdea = ideas[0];
    expect(lastIdea.text).toBe('Neues Feature Konzept');
    expect(lastIdea.tag).toBe('project');
  });

  it('importScannedTextToNotes saves text to notes column', () => {
    window.openNoteScannerModal('notes');
    const resultTextarea = document.getElementById('scanner-ocr-result-text');
    expect(resultTextarea).toBeTruthy();

    resultTextarea.value = 'Einkaufszettel handschriftlich: Äpfel, Brot, Milch';

    window.importScannedTextToNotes('notes');

    const curItems = window.getCurrentWorkspaceItems();
    expect(curItems.notes).toContain('Einkaufszettel handschriftlich: Äpfel, Brot, Milch');
  });

  it('importScannedTextToNotes parses and creates tasks when target is todo', () => {
    window.openNoteScannerModal('notes');
    const resultTextarea = document.getElementById('scanner-ocr-result-text');
    expect(resultTextarea).toBeTruthy();

    resultTextarea.value = '1. Erste OCR Aufgabe\n2. Zweite OCR Aufgabe\n• Dritte Aufgabe';

    window.importScannedTextToNotes('todo');

    const curItems = window.getCurrentWorkspaceItems();
    expect(curItems.todo).toContain('Erste OCR Aufgabe');
    expect(curItems.todo).toContain('Zweite OCR Aufgabe');
    expect(curItems.todo).toContain('Dritte Aufgabe');
  });

  it('importScannedTextToNotes appends text to open note-detail-modal textarea', () => {
    const detailTextarea = document.getElementById('note-detail-textarea');
    expect(detailTextarea).toBeTruthy();
    detailTextarea.value = 'Bestehender Text';

    window.openNoteScannerModal('note-detail');
    const resultTextarea = document.getElementById('scanner-ocr-result-text');
    expect(resultTextarea).toBeTruthy();
    resultTextarea.value = 'Handschriftliche Ergänzung';

    window.importScannedTextToNotes();

    expect(detailTextarea.value).toContain('Bestehender Text\n\nHandschriftliche Ergänzung');
  });
});
