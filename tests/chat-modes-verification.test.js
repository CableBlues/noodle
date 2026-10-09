import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Collab Chat Tool & 4-Mode Suite', () => {
  beforeEach(() => {
    const rawHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    const sanitizedHtml = rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '')
      .replace(/<link[^>]*>/gis, '');
    document.body.innerHTML = sanitizedHtml;

    // Load CollabEngine
    const collabCode = fs.readFileSync(path.join(__dirname, '../collab-engine.js'), 'utf8');
    window.eval(collabCode);

    // Load app-reports.js for togglePanel
    const reportsCode = fs.readFileSync(path.join(__dirname, '../app-reports.js'), 'utf8');
    window.eval(reportsCode);
  });

  it('DOM contains panel-collab-chat and all mode panes', () => {
    const panel = document.getElementById('panel-collab-chat');
    expect(panel).not.toBeNull();

    const teamPane = document.getElementById('collab-pane-team');
    const messengersPane = document.getElementById('collab-pane-messengers');
    const directPane = document.getElementById('collab-pane-direct');

    expect(teamPane).not.toBeNull();
    expect(messengersPane).not.toBeNull();
    expect(directPane).not.toBeNull();
  });

  it('togglePanel("collab-chat") opens the panel properly', () => {
    const panel = document.getElementById('panel-collab-chat');
    expect(panel.classList.contains('hidden')).toBe(true);

    window.togglePanel('collab-chat');
    expect(panel.classList.contains('hidden')).toBe(false);
  });

  it('switchTab toggles between team, messengers and direct correctly', () => {
    window.CollabEngine.switchTab('messengers');
    expect(document.getElementById('collab-pane-messengers').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('collab-pane-team').classList.contains('hidden')).toBe(true);

    window.CollabEngine.switchTab('direct');
    expect(document.getElementById('collab-pane-direct').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('collab-pane-messengers').classList.contains('hidden')).toBe(true);

    window.CollabEngine.switchTab('team');
    expect(document.getElementById('collab-pane-team').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('collab-pane-direct').classList.contains('hidden')).toBe(true);
  });

  it('CollabEngine supports team room and sharing', () => {
    expect(window.CollabEngine.getRoom()).toBe('team-space');
    window.CollabEngine.setRoom('focus-squad');
    expect(window.CollabEngine.getRoom()).toBe('focus-squad');
  });
});
