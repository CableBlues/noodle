import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Production code dependencies
import '../utils.js';
import '../storage.js';
import '../state.js';
import '../helper-brainstorm.js';
import '../app-core.js';
import '../collab-engine.js';

describe('Voice Input & Microphone Architecture Suite', () => {
  const rootDir = path.resolve(__dirname, '..');
  let mockSpeechRecognitionInstance;

  class MockSpeechRecognition {
    constructor() {
      this.continuous = false;
      this.interimResults = false;
      this.lang = 'de-DE';
      this.onstart = null;
      this.onresult = null;
      this.onerror = null;
      this.onend = null;
      this.start = vi.fn().mockImplementation(() => {
        if (this.onstart) this.onstart();
      });
      this.stop = vi.fn().mockImplementation(() => {
        if (this.onend) this.onend();
      });
      this.abort = vi.fn();
      mockSpeechRecognitionInstance = this;
    }
  }

  beforeEach(() => {
    document.body.innerHTML = '';
    window.SpeechRecognition = MockSpeechRecognition;
    window.webkitSpeechRecognition = MockSpeechRecognition;
    window.showToast = vi.fn();
    window.playProceduralSound = vi.fn();
    window.playSound = vi.fn();
    window.currentLang = 'de';

    // Mock mediaDevices
    navigator.mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn(), enabled: true }],
        getAudioTracks: () => [{ enabled: true }]
      })
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Brainstorming Hub Voice-to-Idea Integration', () => {
    it('initialisiert Spracherkennung mit kontinuierlichem Modus und deutscher Sprache', async () => {
      document.body.innerHTML = `
        <div id="brainstorm-modal">
          <div id="brainstorm-live-transcript" class="hidden"></div>
          <select id="brainstorm-tag-select"><option value="project" selected>Projekt</option></select>
          <button id="brainstorm-mic-btn"></button>
          <div id="brainstorm-ideas-list"></div>
        </div>
      `;

      await window.startBrainstormRecording();
      expect(mockSpeechRecognitionInstance).toBeDefined();
      expect(mockSpeechRecognitionInstance.continuous).toBe(true);
      expect(mockSpeechRecognitionInstance.interimResults).toBe(true);
      expect(mockSpeechRecognitionInstance.lang).toBe('de-DE');
      expect(mockSpeechRecognitionInstance.start).toHaveBeenCalled();

      const micBtn = document.getElementById('brainstorm-mic-btn');
      expect(micBtn.innerHTML).toContain('mic-off');
      expect(micBtn.classList.contains('animate-pulse')).toBe(true);
    });

    it('fügt bei finalem Transkript eine Idee mit ausgewähltem Tag hinzu und spielt Ton ab', async () => {
      document.body.innerHTML = `
        <div id="brainstorm-modal">
          <div id="brainstorm-live-transcript" class="hidden"></div>
          <select id="brainstorm-tag-select"><option value="goal" selected>Ziel</option></select>
          <button id="brainstorm-mic-btn"></button>
          <div id="brainstorm-ideas-list"></div>
        </div>
      `;

      window.addBrainstormIdea = vi.fn();
      await window.startBrainstormRecording();

      // Simuliere Transkript-Ergebnis
      const mockEvent = {
        resultIndex: 0,
        results: [
          Object.assign([{ transcript: 'Meilenstein Q4 fertigstellen' }], { isFinal: true })
        ]
      };
      mockSpeechRecognitionInstance.onresult(mockEvent);

      expect(window.addBrainstormIdea).toHaveBeenCalledWith('Meilenstein Q4 fertigstellen', 'goal');
      expect(window.playProceduralSound).toHaveBeenCalled();

      const livePill = document.getElementById('brainstorm-live-transcript');
      expect(livePill.innerText).toContain('als Idee erfasst');
    });

    it('bricht bei Sprechpause (no-speech) NICHT ab', async () => {
      document.body.innerHTML = `
        <div id="brainstorm-modal">
          <div id="brainstorm-live-transcript" class="hidden"></div>
          <button id="brainstorm-mic-btn"></button>
        </div>
      `;

      await window.startBrainstormRecording();
      mockSpeechRecognitionInstance.onerror({ error: 'no-speech' });

      // Button muss weiterhin aktiv bleiben
      const micBtn = document.getElementById('brainstorm-mic-btn');
      expect(micBtn.innerHTML).toContain('mic-off');
      expect(window.showToast).not.toHaveBeenCalled();
    });

    it('zeigt bei Berechtigungsverweigerung (not-allowed) einen verständlichen Toast an', async () => {
      document.body.innerHTML = `
        <div id="brainstorm-modal">
          <div id="brainstorm-live-transcript" class="hidden"></div>
          <button id="brainstorm-mic-btn"></button>
        </div>
      `;

      await window.startBrainstormRecording();
      mockSpeechRecognitionInstance.onerror({ error: 'not-allowed' });

      expect(window.showToast).toHaveBeenCalled();
      const toastMsg = window.showToast.mock.calls[0][0];
      expect(toastMsg).toContain('Mikrofon');
    });
  });

  describe('2. Mobile Quick Add Voice Input', () => {
    it('startet Spracherkennung und überträgt Spracheingabe in mobile-quick-add-input', async () => {
      document.body.innerHTML = `
        <div id="modal-mobile-quick-add">
          <textarea id="mobile-quick-add-input"></textarea>
          <button id="mobile-mic-voice-btn" class="bg-white/10 text-gray-300"></button>
        </div>
      `;

      await window.toggleMobileVoiceInput();
      expect(mockSpeechRecognitionInstance).toBeDefined();

      const micBtn = document.getElementById('mobile-mic-voice-btn');
      expect(micBtn.classList.contains('bg-rose-500')).toBe(true);

      // Simuliere Transkript
      const mockEvent = {
        results: [
          Object.assign([{ transcript: 'Einkauf erledigen' }], { isFinal: true })
        ]
      };
      mockSpeechRecognitionInstance.onresult(mockEvent);

      const textarea = document.getElementById('mobile-quick-add-input');
      expect(textarea.value).toBe('Einkauf erledigen');

      // Erneutes Tippen stoppt die Aufnahme
      await window.toggleMobileVoiceInput();
      expect(micBtn.classList.contains('bg-rose-500')).toBe(false);
    });
  });

  describe('3. Collab Live-Mikrofon & Voice Notes', () => {
    it('toggleMicrophone wechselt Zustand und aktualisiert collab-mic-toggle-btn visuellen Indikator', async () => {
      document.body.innerHTML = `
        <button id="collab-mic-toggle-btn" class="bg-white/5">
          <i data-lucide="mic-off"></i><span>Mic</span>
        </button>
      `;

      await CollabEngine.toggleMicrophone();

      const micBtn = document.getElementById('collab-mic-toggle-btn');
      expect(micBtn.innerHTML).toContain('data-lucide="mic"');
      expect(micBtn.innerHTML).toContain('Mic An');
      expect(micBtn.classList.contains('bg-emerald-500/25')).toBe(true);

      // Erneutes Drücken stummschalten
      await CollabEngine.toggleMicrophone();
      expect(micBtn.innerHTML).toContain('data-lucide="mic-off"');
    });

    it('startVoiceRecording blendet collab-chat-input-bar aus und collab-voice-record-bar ein', async () => {
      document.body.innerHTML = `
        <div id="collab-voice-record-bar" class="hidden">
          <span id="collab-voice-record-timer">00:00</span>
        </div>
        <div id="collab-chat-input-bar" class="flex"></div>
      `;

      // Mock MediaRecorder
      class MockMediaRecorder {
        constructor() {
          this.state = 'recording';
          this.start = vi.fn();
          this.stop = vi.fn().mockImplementation(() => {
            this.state = 'inactive';
            if (this.onstop) this.onstop();
          });
        }
        static isTypeSupported() { return true; }
      }
      global.MediaRecorder = MockMediaRecorder;

      await CollabEngine.startVoiceRecording();

      const recordBar = document.getElementById('collab-voice-record-bar');
      const standardBar = document.getElementById('collab-chat-input-bar');

      expect(recordBar.classList.contains('hidden')).toBe(false);
      expect(standardBar.classList.contains('hidden')).toBe(true);

      CollabEngine.stopVoiceRecording(false);
      expect(recordBar.classList.contains('hidden')).toBe(true);
      expect(standardBar.classList.contains('hidden')).toBe(false);
    });
  });

  describe('4. DOM & Template Integrität in index.html', () => {
    it('index.html enthält alle erforderlichen IDs und data-actions für Mikrofon und Spracheingabe', () => {
      const htmlPath = path.join(rootDir, 'index.html');
      const html = fs.readFileSync(htmlPath, 'utf8');

      expect(html).toContain('id="brainstorm-mic-btn"');
      expect(html).toContain('data-action="toggleBrainstormRecording"');
      expect(html).toContain('id="mobile-mic-voice-btn"');
      expect(html).toContain('data-action="toggleMobileVoiceInput"');
      expect(html).toContain('id="collab-mic-toggle-btn"');
      expect(html).toContain('data-action="CollabEngine.toggleMicrophone"');
      expect(html).toContain('data-action="CollabEngine.startVoiceRecording"');
      expect(html).toContain('id="collab-chat-input-bar"');
      expect(html).toContain('id="collab-voice-record-bar"');
    });
  });
});
