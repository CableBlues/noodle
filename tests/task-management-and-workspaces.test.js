import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../utils.js';
import '../storage.js';
import '../state.js';
import '../app-tasks.js';

describe('Aufgaben- und Zeitverwaltung (Task & Workspace Engine)', () => {
  beforeEach(() => {
    localStorage.clear();
    window.state = window.migrateState(null, 'de');
    window.state.activeWorkspace = 'private';
    window.historyStack = [];
    window.openTaskAddColumns = {};
  });

  describe('1. parseTextIntoItems (Import- & Eingabe-Parser)', () => {
    it('parst normale zeilenbasierte Texte sauber und ignoriert Leerzeilen', () => {
      const raw = 'Aufgabe 1\n\nAufgabe 2\r\n   \nAufgabe 3';
      const parsed = window.parseTextIntoItems(raw);
      expect(parsed).toEqual(['Aufgabe 1', 'Aufgabe 2', 'Aufgabe 3']);
    });

    it('bereinigt Markdown-Checkboxes, Aufzählungszeichen und Nummerierungen', () => {
      const raw = `- [ ] Milch kaufen\n- [x] Wäsche waschen\n* Sport machen\n+ Wohnung saugen\n1. E-Mails beantworten\n2) Konzept schreiben\n# Wichtige Notiz`;
      const parsed = window.parseTextIntoItems(raw);
      expect(parsed).toEqual([
        'Milch kaufen',
        'Wäsche waschen',
        'Sport machen',
        'Wohnung saugen',
        'E-Mails beantworten',
        'Konzept schreiben',
        'Wichtige Notiz'
      ]);
    });

    it('parst JSON-Arrays und Aufgaben-Objekte verlässlich', () => {
      const jsonArr = JSON.stringify(['Task Alpha', 'Task Beta']);
      expect(window.parseTextIntoItems(jsonArr)).toEqual(['Task Alpha', 'Task Beta']);

      const jsonObj = JSON.stringify({
        tasks: [
          { task: 'Objekt-Aufgabe 1' },
          { title: 'Objekt-Aufgabe 2' },
          { name: 'Objekt-Aufgabe 3' }
        ]
      });
      expect(window.parseTextIntoItems(jsonObj)).toEqual([
        'Objekt-Aufgabe 1',
        'Objekt-Aufgabe 2',
        'Objekt-Aufgabe 3'
      ]);
    });

    it('fängt fehlerhafte und leere Eingaben ab', () => {
      expect(window.parseTextIntoItems('')).toEqual([]);
      expect(window.parseTextIntoItems('   \n  \r\n  ')).toEqual([]);
      expect(window.parseTextIntoItems(null)).toEqual([]);
      expect(window.parseTextIntoItems(undefined)).toEqual([]);
      // Defektes JSON fällt auf Zeilen-Parser zurück
      expect(window.parseTextIntoItems('[ { broken json')).toEqual(['[ { broken json']);
    });
  });

  describe('2. Workspace-Isolation (Personal vs. Work vs. Study)', () => {
    it('trennt Aufgaben strikt nach aktuellem Workspace', () => {
      // 1. Im Privat-Workspace eine Aufgabe anlegen
      window.setWorkspace('private');
      const privItems = window.getCurrentWorkspaceItems();
      expect(privItems).toBe(window.state.items);
      privItems.todo = [{ id: 'task_priv_1', task: 'Privater Einkauf' }];

      // 2. Zu Work wechseln
      window.setWorkspace('work');
      expect(window.state.activeWorkspace).toBe('work');
      const workItems = window.getCurrentWorkspaceItems();
      expect(workItems).not.toBe(privItems);
      expect(workItems).toBe(window.state.workItems);
      expect(workItems.todo || []).not.toContainEqual(expect.objectContaining({ task: 'Privater Einkauf' }));

      // Im Work-Workspace Aufgabe anlegen
      workItems.todo = [{ id: 'task_work_1', task: 'Quartalsbericht erstellen' }];

      // 3. Zu Study wechseln
      window.setWorkspace('study');
      expect(window.state.activeWorkspace).toBe('study');
      const studyItems = window.getCurrentWorkspaceItems();
      expect(studyItems).toBe(window.state.studyItems);
      expect(studyItems.todo || []).not.toContainEqual(expect.objectContaining({ task: 'Quartalsbericht erstellen' }));

      // 4. Zurück zu Privat -> private Daten intakt geblieben
      window.setWorkspace('private');
      const recheckPriv = window.getCurrentWorkspaceItems();
      expect(recheckPriv.todo[0].task).toBe('Privater Einkauf');
    });
  });

  describe('3. Aufgaben-Lebenszyklus: Erledigen, Löschen & Wiederherstellen', () => {
    it('handleCompleteTask verschiebt Aufgabe in done und legt Zeitstempel an', () => {
      window.setWorkspace('private');
      const items = window.getCurrentWorkspaceItems();
      items.daily = [
        { id: 'task_1', task: 'Hausaufgaben machen' },
        { id: 'task_2', task: 'Pflanzen gießen' }
      ];
      window.state.done = [];

      // Aufgabe 0 (Hausaufgaben machen) als erledigt markieren
      window.handleCompleteTask('daily', 0);

      // Muss aus daily entfernt sein
      expect(items.daily.length).toBe(1);
      expect(items.daily[0].task).toBe('Pflanzen gießen');

      // Muss in done vorhanden sein
      expect(window.state.done.length).toBe(1);
      const doneEntry = window.state.done[0];
      expect(doneEntry.task).toContain('Hausaufgaben machen');
      expect(doneEntry.origin).toBe('daily');
      expect(doneEntry.time).toBeDefined();
    });

    it('deleteTask entfernt die Aufgabe und speichert History-Eintrag für Undo', () => {
      window.setWorkspace('private');
      const items = window.getCurrentWorkspaceItems();
      items.todo = [{ id: 'del_me', task: 'Unnötige Aufgabe' }];
      window.historyStack = [];

      window.deleteTask('todo', 0);

      expect(items.todo.length).toBe(0);
      expect(window.historyStack.length).toBeGreaterThan(0);
      expect(window.historyStack[window.historyStack.length - 1]._actionLabel).toContain('Aufgabe gelöscht');
    });

    it('handleRestoreDoneTask stellt erledigte Aufgabe wieder in die Ursprungskategorie zurück', () => {
      window.setWorkspace('private');
      const items = window.getCurrentWorkspaceItems();
      items.weekly = [];
      window.state.done = [{
        id: 'done_123',
        task: 'Wöchentlicher Report',
        origin: 'weekly',
        date: '2026-10-24',
        time: '18:00'
      }];

      // Index 0 in umgekehrter Done-Reihenfolge wiederherstellen
      window.handleRestoreDoneTask(0);

      expect(window.state.done.length).toBe(0);
      expect(items.weekly.length).toBe(1);
      expect(items.weekly[0]).toBe('Wöchentlicher Report');
    });
  });

  describe('4. handleItemDrop (Verschieben zwischen Spalten)', () => {
    it('verschiebt Aufgaben nahtlos von einer Spalte in eine andere', () => {
      window.setWorkspace('private');
      const items = window.getCurrentWorkspaceItems();
      items.todo = [{ id: 'm1', task: 'Task One' }, { id: 'm2', task: 'Task Two' }];
      items.daily = [];

      const mockEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
        currentTarget: null,
        dataTransfer: {
          getData: () => JSON.stringify({ category: 'todo', index: 1 })
        }
      };

      // Verschiebe Index 1 (Task Two) von todo nach daily
      window.handleItemDrop(mockEvent, 'daily', 0);

      expect(items.todo.length).toBe(1);
      expect(items.todo[0].task).toBe('Task One');

      expect(items.daily.length).toBe(1);
      expect(items.daily[0].task).toBe('Task Two');
    });
  });

  describe('5. History & Snapshot-Limits (Schutz vor Speicherüberlauf)', () => {
    it('begrenzt die History-Snapshots auf maximal 15 Einträge', () => {
      for (let i = 0; i < 25; i++) {
        window.saveHistory(`Aktion ${i}`);
      }
      expect(window.historyStack.length).toBeLessThanOrEqual(15);
    });
  });

  describe('6. Workspace-Selektoren & Modal-Registry Überprüfung', () => {
    it('stellt getCurrentWorkspaceItems und getCurrentWorkspaceDone idempotent auf window & globalThis bereit', () => {
      expect(typeof window.getCurrentWorkspaceItems).toBe('function');
      expect(typeof window.getCurrentWorkspaceDone).toBe('function');
      expect(typeof globalThis.getCurrentWorkspaceItems).toBe('function');
      expect(typeof globalThis.getCurrentWorkspaceDone).toBe('function');

      // Testet alle Workspaces
      window.setWorkspace('study');
      expect(window.getCurrentWorkspaceItems()).toBe(window.state.studyItems);
      expect(window.getCurrentWorkspaceDone()).toBe(window.state.studyDone);

      window.setWorkspace('work');
      expect(window.getCurrentWorkspaceItems()).toBe(window.state.workItems);
      expect(window.getCurrentWorkspaceDone()).toBe(window.state.workDone);

      window.setWorkspace('private');
      expect(window.getCurrentWorkspaceItems()).toBe(window.state.items);
      expect(window.getCurrentWorkspaceDone()).toBe(window.state.done);
    });

    it('ModalManager schließt registrierte Modals per closeAll() und unterstützt register() / isOpen()', () => {
      expect(window.ModalManager).toBeDefined();
      expect(Array.isArray(window.ModalManager.modals)).toBe(true);
      expect(window.ModalManager.modals.length).toBeGreaterThanOrEqual(30);

      const testDiv = document.createElement('div');
      testDiv.id = 'supermarket-modal';
      testDiv.className = 'fixed inset-0 z-50'; // nicht hidden
      document.body.appendChild(testDiv);

      expect(window.ModalManager.isOpen('supermarket-modal')).toBe(true);

      window.ModalManager.closeAll();
      expect(window.ModalManager.isOpen('supermarket-modal')).toBe(false);
      expect(testDiv.classList.contains('hidden')).toBe(true);

      document.body.removeChild(testDiv);
    });

    it('Escape-Key betätigt schließt geöffnete Modals und Dialoge', () => {
      const modal = document.createElement('div');
      modal.id = 'sample-manager-modal';
      modal.className = 'fixed inset-0';
      document.body.appendChild(modal);

      const evt = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      document.dispatchEvent(evt);

      expect(modal.classList.contains('hidden')).toBe(true);
      document.body.removeChild(modal);
    });
  });
});


