import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Learning Hub & Spaced Repetition Flashcards Suite', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="modal-learning-hub" class="hidden">
        <div id="learning-hub-content"></div>
      </div>
      <div id="dash-learning-hub-content"></div>
    `;

    global.localStorage = {
      _data: {},
      getItem: vi.fn((k) => global.localStorage._data[k] || null),
      setItem: vi.fn((k, v) => { global.localStorage._data[k] = String(v); }),
      removeItem: vi.fn((k) => { delete global.localStorage._data[k]; }),
      clear: vi.fn(() => { global.localStorage._data = {}; })
    };

    global.escapeHtml = (s) => String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    global.t = (key) => key;
    global.renderLucideIcons = vi.fn();
    global.playProceduralSound = vi.fn();
    global.showToast = vi.fn();

    const code = fs.readFileSync(path.join(process.cwd(), 'helper-learning.js'), 'utf8');
    eval(code);
  });

  it('should initialize curated deep knowledge packs and open modal', () => {
    expect(window.CURATED_LEARNING_PACKS).toBeDefined();
    expect(window.CURATED_LEARNING_PACKS.adhd_neuro).toBeDefined();
    expect(window.CURATED_LEARNING_PACKS.stoicism_mental_models).toBeDefined();

    window.openLearningHubModal();
    const modal = document.getElementById('modal-learning-hub');
    expect(modal.classList.contains('hidden')).toBe(false);
  });

  it('should process active recall quiz answers and update score and XP', () => {
    window.selectLearningPack('adhd_neuro');
    const session = window.LearningHubEngine.getSession();
    expect(session.questions.length).toBeGreaterThanOrEqual(4);

    const firstQ = session.questions[0];
    const correctIdx = firstQ.correct;

    // Correct answer
    window.LearningHubEngine.handleSelectAnswer(correctIdx);
    expect(session.score).toBe(1);
    expect(session.xpEarned).toBe(15);
    expect(session.answers[firstQ.id].isCorrect).toBe(true);
  });

  it('should advance and calculate Leitner spaced repetition intervals (SM-2 / Leitner Boxes)', () => {
    const qId = 'adhd_1';
    
    // Rate Good (+1 Box)
    const entry1 = window.rateQuestionSR(qId, 'good');
    expect(entry1.box).toBeGreaterThanOrEqual(2);
    expect(entry1.nextReview).toBeGreaterThan(Date.now());

    // Rate Master (Box 5)
    const entry2 = window.rateQuestionSR(qId, 'master');
    expect(entry2.box).toBe(5);

    // Rate Again (Box 1)
    const entry3 = window.rateQuestionSR(qId, 'again');
    expect(entry3.box).toBe(1);
    expect(entry3.streak).toBe(0);
  });

  it('should switch between Quiz, 3D Flashcard, and Decks modes', () => {
    window.selectLearningPack('productivity_science');
    
    // Switch to Flashcard mode
    window.switchLearningMode('flashcard');
    const content = document.getElementById('learning-hub-content').innerHTML;
    expect(content).toContain('Vorderseite');

    // Flip flashcard
    window.flipFlashcard();
    const flippedContent = document.getElementById('learning-hub-content').innerHTML;
    expect(flippedContent).toContain('Rückseite');

    // Switch to Decks mode
    window.switchLearningMode('decks');
    const decksContent = document.getElementById('learning-hub-content').innerHTML;
    expect(decksContent).toContain('Leitner-Boxen Lernfortschritt');
  });

  it('should create custom flashcard decks and persist them in storage', () => {
    const customQuestions = [
      {
        id: 'c_1',
        question: 'Was ist das Pareto-Prinzip?',
        options: ['80/20 Regel', '50/50 Regel'],
        correct: 0,
        explanation: '80% der Ergebnisse werden durch 20% des Aufwands erzielt.',
        mnemonic: 'Fokussiere die kritischen 20%.'
      }
    ];

    const deckId = window.createCustomDeck('Business Heuristiken', 'Management & Fokus', customQuestions);
    expect(deckId).toBeDefined();

    const session = window.LearningHubEngine.getSession();
    expect(session.packId).toBe(deckId);
    expect(session.questions.length).toBe(1);
  });
});
