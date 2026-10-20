import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Feedback Module & Email Dispatch Verification', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    const modal = document.getElementById('app-feedback-modal');
    if (modal) modal.remove();
  });

  it('öffnet standardmäßig direkt den Feedback-Eingabe-Tab statt der Tour', () => {
    // app-feedback.js laden
    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../app-feedback.js'), 'utf8');
    eval(scriptContent);

    // Aufruf ohne Argumente soll direkt in das Feedback-Formular führen
    window.openFeedbackModal();

    const modal = document.getElementById('app-feedback-modal');
    expect(modal).not.toBeNull();
    expect(modal.classList.contains('hidden')).toBe(false);

    // Textarea und Submit-Button müssen sichtbar sein
    const textarea = document.getElementById('feedback-modal-msg');
    expect(textarea).not.toBeNull();
    const submitBtn = document.getElementById('feedback-submit-btn');
    expect(submitBtn).not.toBeNull();
  });

  it('übermittelt das Feedback an jmonke@gmail.com', async () => {
    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../app-feedback.js'), 'utf8');
    eval(scriptContent);

    window.openFeedbackModal('idea');

    const textarea = document.getElementById('feedback-modal-msg');
    const contact = document.getElementById('feedback-modal-contact');
    textarea.value = 'Tolle App, bitte mehr Naturklänge ergänzen!';
    contact.value = 'nutzer@example.com';

    let requestedUrl = '';
    let requestPayload = null;

    globalThis.fetch = vi.fn().mockImplementation((url, options) => {
      requestedUrl = url;
      requestPayload = JSON.parse(options.body);
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
    });

    await window.submitAppFeedback();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(requestedUrl).toBe('https://formsubmit.co/ajax/jmonke@gmail.com');
    expect(requestPayload.Nachricht).toBe('Tolle App, bitte mehr Naturklänge ergänzen!');
    expect(requestPayload.Kontakt).toBe('nutzer@example.com');
    expect(requestPayload._subject).toContain('idea');
  });

  it('bietet bei Netzwerkfehlschlag einen verlässlichen E-Mail-Fallback zu jmonke@gmail.com', async () => {
    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../app-feedback.js'), 'utf8');
    eval(scriptContent);

    window.openFeedbackModal();

    const textarea = document.getElementById('feedback-modal-msg');
    textarea.value = 'Offline-Test Nachricht';

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    await window.submitAppFeedback();

    expect(windowOpenSpy).toHaveBeenCalled();
    const openedUrl = windowOpenSpy.mock.calls[0][0];
    expect(openedUrl).toContain('mailto:jmonke@gmail.com');
    expect(openedUrl).toContain(encodeURIComponent('Offline-Test Nachricht'));
  });
});
