import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Collab Chat Tool & 4-Mode Suite', () => {
  beforeEach(() => {
    const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    document.documentElement.innerHTML = html;

    // Load CollabEngine
    const collabCode = fs.readFileSync(path.join(__dirname, '../collab-engine.js'), 'utf8');
    window.eval(collabCode);

    // Load app-reports.js for togglePanel
    const reportsCode = fs.readFileSync(path.join(__dirname, '../app-reports.js'), 'utf8');
    window.eval(reportsCode);
  });

  it('DOM contains panel-collab-chat and all 4 mode panes', () => {
    const panel = document.getElementById('panel-collab-chat');
    expect(panel).not.toBeNull();

    const teamPane = document.getElementById('collab-pane-team');
    const ircPane = document.getElementById('collab-pane-irc');
    const aiPane = document.getElementById('collab-pane-ai');
    const webhooksPane = document.getElementById('collab-pane-webhooks');

    expect(teamPane).not.toBeNull();
    expect(ircPane).not.toBeNull();
    expect(aiPane).not.toBeNull();
    expect(webhooksPane).not.toBeNull();
  });

  it('togglePanel("collab-chat") opens the panel properly', () => {
    const panel = document.getElementById('panel-collab-chat');
    expect(panel.classList.contains('hidden')).toBe(true);

    window.togglePanel('collab-chat');
    expect(panel.classList.contains('hidden')).toBe(false);
  });

  it('switchChatMode toggles between team, irc, ai and webhooks correctly', () => {
    window.CollabEngine.switchChatMode('irc');
    expect(document.getElementById('collab-pane-irc').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('collab-pane-team').classList.contains('hidden')).toBe(true);

    window.CollabEngine.switchChatMode('ai');
    expect(document.getElementById('collab-pane-ai').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('collab-pane-irc').classList.contains('hidden')).toBe(true);

    window.CollabEngine.switchChatMode('webhooks');
    expect(document.getElementById('collab-pane-webhooks').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('collab-pane-ai').classList.contains('hidden')).toBe(true);

    window.CollabEngine.switchChatMode('team');
    expect(document.getElementById('collab-pane-team').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('collab-pane-webhooks').classList.contains('hidden')).toBe(true);
  });

  it('IRC sub-engine handles commands', () => {
    window.CollabEngine.sendIrcInput('/join #study');
    const ircContainer = document.getElementById('collab-irc-messages-container');
    expect(ircContainer.innerHTML).toContain('#study');
  });

  it('AI Body-Double sub-engine responds to prompt chips', () => {
    window.CollabEngine.triggerAiQuickChip('breakdown');
    const aiContainer = document.getElementById('collab-ai-messages-container');
    expect(aiContainer.innerHTML).toContain('Task zerlegen');
  });
});
