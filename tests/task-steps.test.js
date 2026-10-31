import { describe, it, expect, beforeEach } from 'vitest';
import '../data-tasks-steps-1.js';
import '../data-tasks-steps-2.js';
import '../data-tasks-steps-3.js';
import '../data-tasks.js';
import '../data-translations-1.js';
import '../data-translations-2.js';
import '../data-translations.js';
import '../utils.js';
import '../storage.js';
import '../state.js';
import '../helper-core.js';
import '../helper-core-2.js';
import '../app-tasks.js';

describe('Task Steps Modal & Subtasks Loading', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="helper-steps-modal" class="hidden">
        <select id="helper-task-select"></select>
        <div id="helper-steps-result"></div>
        <input id="helper-new-step-input" />
      </div>
    `;
    window.state = window.migrateState(null, 'de');
    window.state.activeWorkspace = 'private';
  });

  it('loads steps for a standard task from daily category', () => {
    window.openTaskStepsModal('daily', 0);
    const modal = document.getElementById('helper-steps-modal');
    expect(modal.classList.contains('hidden')).toBe(false);

    const resultBox = document.getElementById('helper-steps-result');
    const stepItems = resultBox.querySelectorAll('.step-text');
    expect(stepItems.length).toBeGreaterThan(0);
    expect(document.getElementById('helper-task-select').value).toBe(window.state.items.daily[0]);
  });

  it('loads steps for custom/new tasks using fallback templates', () => {
    window.state.items.daily.push('Meine Spezialaufgabe');
    const idx = window.state.items.daily.length - 1;
    window.openTaskStepsModal('daily', idx);

    const resultBox = document.getElementById('helper-steps-result');
    const stepItems = resultBox.querySelectorAll('.step-text');
    expect(stepItems.length).toBeGreaterThan(0);
  });

  it('loads steps for tasks when item is an object with { task: "..." }', () => {
    window.state.items.daily.push({ task: 'Wäsche machen', color: 'rose' });
    const idx = window.state.items.daily.length - 1;
    window.openTaskStepsModal('daily', idx);

    const resultBox = document.getElementById('helper-steps-result');
    const stepItems = resultBox.querySelectorAll('.step-text');
    expect(stepItems.length).toBeGreaterThan(0);
  });

  it('loads steps when in work workspace', () => {
    window.state.activeWorkspace = 'work';
    window.state.workItems = {
      work_focus: ['Wichtiges Projekt fertigstellen']
    };
    window.openTaskStepsModal('work_focus', 0);

    const modal = document.getElementById('helper-steps-modal');
    expect(modal.classList.contains('hidden')).toBe(false);

    const resultBox = document.getElementById('helper-steps-result');
    const stepItems = resultBox.querySelectorAll('.step-text');
    expect(stepItems.length).toBeGreaterThan(0);
  });

  it('allows adding and checking off custom steps via exported handlers', () => {
    window.openTaskStepsModal('daily', 0);
    const currentTask = window.state.items.daily[0];

    // Add custom step
    const input = document.getElementById('helper-new-step-input');
    input.value = 'Eigener Zwischenschritt';
    window.addCustomStepToActiveTask();

    const resultBox = document.getElementById('helper-steps-result');
    const steps = resultBox.querySelectorAll('.step-text');
    const lastStepText = steps[steps.length - 1].textContent;
    expect(lastStepText).toContain('Eigener Zwischenschritt');

    // Toggle check on step 0
    window.toggleCustomStepCheck(currentTask, 0);
    expect(window.state.completedSteps[currentTask]).toContain(0);

    // Delete step
    const prevCount = window.state.customSteps[currentTask].length;
    window.deleteCustomStep(currentTask, prevCount - 1);
    expect(window.state.customSteps[currentTask].length).toBe(prevCount - 1);
  });

  it('reliably switches and loads steps for consecutive tasks', () => {
    // Open first task
    window.openTaskStepsModal('daily', 0);
    const firstTask = window.state.items.daily[0];
    expect(document.getElementById('helper-task-select').value).toBe(firstTask);
    const stepsBox1 = document.getElementById('helper-steps-result');
    expect(stepsBox1.querySelectorAll('.step-text').length).toBeGreaterThan(0);

    // Close modal
    window.closeHelperModal();
    expect(document.getElementById('helper-steps-modal').classList.contains('hidden')).toBe(true);

    // Open second task from weekly or different index
    window.openTaskStepsModal('weekly', 0);
    const secondTask = window.state.items.weekly[0];
    expect(document.getElementById('helper-steps-modal').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('helper-task-select').value).toBe(secondTask);
    const stepsBox2 = document.getElementById('helper-steps-result');
    expect(stepsBox2.querySelectorAll('.step-text').length).toBeGreaterThan(0);
    expect(window.currentActiveTaskRef.task).toBe(secondTask);
  });

  it('handles clicking Steps through task options menu for multiple consecutive tasks', () => {
    // Test clicking through 5 tasks sequentially via toggleTaskOptionsMenu
    for (let idx = 0; idx < 5; idx++) {
      window.toggleTaskOptionsMenu('daily', idx);
      const menu = document.getElementById('task-context-dropdown');
      expect(menu).not.toBeNull();
      expect(menu.classList.contains('hidden')).toBe(false);

      const stepsBtn = menu.querySelector('button');
      expect(stepsBtn).not.toBeNull();
      stepsBtn.click();

      // Check modal is open and has steps
      const modal = document.getElementById('helper-steps-modal');
      expect(modal.classList.contains('hidden')).toBe(false);

      const expectedTask = window.state.items.daily[idx];
      const expectedTaskName = typeof expectedTask === 'object' ? expectedTask.task : expectedTask;
      expect(document.getElementById('helper-task-select').value).toBe(expectedTaskName);

      const resBox = document.getElementById('helper-steps-result');
      expect(resBox.querySelectorAll('.step-text').length).toBeGreaterThan(0);

      // Close modal
      window.closeHelperModal();
      expect(modal.classList.contains('hidden')).toBe(true);
    }
  });
});

