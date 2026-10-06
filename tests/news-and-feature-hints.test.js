import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('News System & Feature Hints Ticker Engine', () => {
  let code;

  beforeEach(() => {
    // Setup clean browser-like DOM with both frameless instruction bar and legacy wrapper
    document.body.innerHTML = `
      <div id="board-instruction-ticker-bar" class="hidden sm:flex items-center min-w-0 opacity-0 pointer-events-none">
        <div id="board-instruction-ticker-track">
          <span id="board-instruction-ticker-text"></span>
        </div>
      </div>
      <div id="board-feature-hint-wrapper" class="hidden opacity-0">
        <div id="board-feature-hint-pill">
          <span id="board-feature-hint-text"></span>
        </div>
      </div>
      <div id="board-news-ticker-bar">
        <div id="board-ticker-track"></div>
        <div id="ticker-hover-action-pill"></div>
      </div>
      <div id="ticker-settings-popover" class="hidden">
        <div id="ticker-current-article-box"></div>
        <div id="ticker-settings-language-grid"></div>
        <div id="ticker-settings-region-grid"></div>
        <div id="ticker-settings-mode-grid"></div>
        <div id="ticker-settings-category-grid"></div>
        <div id="ticker-settings-media-grid"></div>
        <span id="ticker-options-subtext"></span>
        <span id="ticker-lang-badge-status"></span>
      </div>
      <div id="panel-news" class="hidden">
        <div id="news-language-selector"></div>
        <div id="news-region-selector"></div>
        <div id="news-mode-selector"></div>
        <div id="news-category-selector"></div>
        <div id="news-media-selector"></div>
        <div id="news-marquee-text"></div>
        <div id="news-items-container"></div>
        <span id="news-count-badge"></span>
        <span id="news-lang-badge-status"></span>
      </div>
    `;

    // Load app-radio-news.js
    if (!code) {
      code = fs.readFileSync(path.join(process.cwd(), 'app-radio-news.js'), 'utf8');
    }
    // Execute module
    eval(code);
  });

  it('exports RadioNewsEngine and FeatureHintsEngine to window', () => {
    expect(window.RadioNewsEngine).toBeDefined();
    expect(window.FeatureHintsEngine).toBeDefined();
    expect(typeof window.RadioNewsEngine.selectLanguage).toBe('function');
    expect(typeof window.RadioNewsEngine.selectRegion).toBe('function');
    expect(typeof window.RadioNewsEngine.selectFeedMode).toBe('function');
    expect(typeof window.RadioNewsEngine.nextInstruction).toBe('function');
    expect(typeof window.RadioNewsEngine.executeInstructionAction).toBe('function');
    expect(typeof window.FeatureHintsEngine.nextTip).toBe('function');
  });

  it('supports independent Language and Region selection (e.g. Spanish with Greece)', () => {
    window.RadioNewsEngine.selectLanguage('es');
    window.RadioNewsEngine.selectRegion('gr');

    expect(window.RadioNewsEngine.getCurrentLanguage()).toBe('es');
    expect(window.RadioNewsEngine.getCurrentRegion()).toBe('gr');

    // Retrieve active news items
    const items = window.RadioNewsEngine.getFilteredNewsItems ? window.RadioNewsEngine.getFilteredNewsItems() : [];
    expect(items.length).toBeGreaterThan(0);

    // Look for Greek items translated into Spanish
    const greekLocalItem = items.find(it => it.regionId === 'gr');
    expect(greekLocalItem).toBeDefined();
    // Spanish translation check (should contain Spanish keywords like 'energía' or 'Grecia' or 'eléctrica')
    const hasSpanishText = /energía|Grecia|servicios|startups|tortugas|turismo|Acrópolis/i.test(greekLocalItem.title);
    expect(hasSpanishText).toBe(true);
    expect(greekLocalItem.isTranslated).toBe(true);
  });

  it('alternates between local and global news in hybrid feed mode', () => {
    window.RadioNewsEngine.selectRegion('gr');
    window.RadioNewsEngine.selectLanguage('de');
    window.RadioNewsEngine.selectFeedMode('hybrid');

    expect(window.RadioNewsEngine.getCurrentFeedMode()).toBe('hybrid');

    const items = window.RadioNewsEngine.getFilteredNewsItems ? window.RadioNewsEngine.getFilteredNewsItems() : [];
    expect(items.length).toBeGreaterThanOrEqual(2);

    const scopes = items.slice(0, 4).map(it => it.scope);
    // Should have both local and global represented
    expect(scopes).toContain('local');
    expect(scopes).toContain('global');
  });

  it('synchronizes all 5 selectors between News panel and Ticker settings popover', () => {
    window.RadioNewsEngine.selectLanguage('fr');
    window.RadioNewsEngine.selectRegion('it');
    window.RadioNewsEngine.selectFeedMode('local');
    window.RadioNewsEngine.selectCategory('tech');

    const toolLang = document.getElementById('news-language-selector');
    const tickerLang = document.getElementById('ticker-settings-language-grid');
    const toolReg = document.getElementById('news-region-selector');
    const tickerReg = document.getElementById('ticker-settings-region-grid');

    expect(toolLang.innerHTML).toContain('fr');
    expect(tickerLang.innerHTML).toContain('fr');
    expect(toolReg.innerHTML).toContain('it');
    expect(tickerReg.innerHTML).toContain('it');
  });

  it('displays frameless instruction ticker on the left and suppresses ticker on the right', () => {
    const instructionBar = document.getElementById('board-instruction-ticker-bar');
    const tickerBar = document.getElementById('board-news-ticker-bar');

    window.RadioNewsEngine.nextInstruction(true);

    const instructionText = document.getElementById('board-instruction-ticker-text');
    // Left instruction must be visible with descriptive functional text
    expect(instructionBar.classList.contains('opacity-100')).toBe(true);
    expect(instructionBar.classList.contains('pointer-events-auto')).toBe(true);
    expect(instructionText.textContent.length).toBeGreaterThan(10);
    // Instruction text should NOT have truncate or ellipsis, and must be static without marquee
    expect(instructionText.classList.contains('truncate')).toBe(false);
    expect(instructionText.classList.contains('instruction-marquee-active')).toBe(false);

    // Right news ticker must be suppressed during instruction display
    expect(tickerBar.classList.contains('opacity-0')).toBe(true);
    expect(tickerBar.classList.contains('pointer-events-none')).toBe(true);
  });

  it('renders representative action icons only when actionable, with clean typography and direct execution', () => {
    window.RadioNewsEngine.selectLanguage('de');
    
    // Test action execution mock
    window.openHelperModal = vi.fn();
    window.RadioNewsEngine.executeInstructionAction('dice');
    expect(window.openHelperModal).toHaveBeenCalledWith('pick');

    // Display instruction that has an action (e.g. dice)
    window.RadioNewsEngine.nextInstruction(true);
    const track = document.getElementById('board-instruction-ticker-track');
    
    // Check that text doesn't start with arbitrary decorative emojis
    const textEl = document.getElementById('board-instruction-ticker-text');
    expect(textEl.textContent.trim()).not.toMatch(/^[💡🪜✋⚙️🔒]/);
    expect(textEl.classList.contains('truncate')).toBe(false);

    // 1. Text should be clean and not have 'oder klicke gleich hier'
    expect(textEl.textContent.trim()).not.toMatch(/klicke gleich hier/i);
    expect(textEl.textContent.trim().endsWith('.')).toBe(true);

    // 2. Text must not contain inline keyboard shortcut bracket like [W] or [A] or 'klicke auf'
    expect(textEl.textContent).not.toMatch(/\[[A-Z0-9]\]/);
    expect(textEl.textContent.toLowerCase()).not.toContain('klicke auf');

    // 3. Tastaturkürzel sind komplett entfernt (keine Badge mehr)
    const shortcutBadge = track.querySelector('.instruction-shortcut-badge');
    expect(shortcutBadge).toBeNull();

    // 4. Action icon is rendered on the left BEFORE text, has glowing blinking effect, and is >= w-6 h-6
    const iconBtn = track.querySelector('.instruction-action-btn');
    expect(iconBtn).not.toBeNull();
    expect(iconBtn.classList.contains('w-6')).toBe(true);
    expect(iconBtn.classList.contains('h-6')).toBe(true);
    expect(iconBtn.classList.contains('instruction-action-btn-glow')).toBe(true);

    // 5. Verify DOM order: icon comes before text on the left
    const children = Array.from(track.children);
    const iconIndex = children.indexOf(iconBtn);
    const textIndex = children.indexOf(textEl);
    expect(iconIndex).toBeLessThan(textIndex);

    // Click on track executes action or advances
    window.RadioNewsEngine.handleInstructionClick({ stopPropagation: () => {} });
  });

  it('covers all application tools across instructions', () => {
    window.RadioNewsEngine.selectLanguage('de');
    const texts = [];
    for (let i = 0; i < 25; i++) {
      window.RadioNewsEngine.nextInstruction(true);
      texts.push(document.getElementById('board-instruction-ticker-text').textContent);
    }
    const combined = texts.join(' ');
    // Assert on tools mentioned in instructions: Dice, Alarm, Sound, Cooking, Shopping, Breathing, Brainstorm, Clean, Flashcards, Humor
    expect(combined).toMatch(/würfel|tools/i);
    expect(combined).toMatch(/Wecker|Timer/);
    expect(combined).toMatch(/Sound|Musik/);
    expect(combined).toMatch(/Kochen|Rezepte/);
    expect(combined).toMatch(/Einkaufen|Spar-Radar/);
    expect(combined).toMatch(/Pause|Atem/);
    expect(combined).toMatch(/Gehirn|Ideen/);
    expect(combined).toMatch(/Clean-Coach|Aufräum/);
    expect(combined).toMatch(/Wissens-Hub|Flashcards/);
  });

  it('renders news headlines in full without truncate or ellipsis', () => {
    const items = window.RadioNewsEngine.getFilteredNewsItems();
    expect(items.length).toBeGreaterThan(0);

    window.RadioNewsEngine.renderCurrentTeletextHeadline(items, false);

    const headlineText = document.getElementById('ticker-headline-text');
    expect(headlineText).not.toBeNull();
    expect(headlineText.classList.contains('truncate')).toBe(false);
    expect(headlineText.textContent.trim()).toBe(items[0].title.trim());
    expect(headlineText.textContent).not.toContain('...');
  });
});
